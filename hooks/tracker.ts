/**
 * Compliance Guard — PostToolUse hook for Claude Code.
 *
 * Four jobs, in this order:
 *
 *   0. SESSION-STATE DRIFT. Compare `agentstate.yaml`, the active Circle's Turn
 *      log and this session's history file with the two records that cannot
 *      silently freeze — git, and `orchestrator-events.jsonl`. A surface that
 *      has stopped being written is named back to the model. It runs first and
 *      ahead of the plugin-repo stand-down, because unlike the other two it is
 *      anchored at the workbench root and is needed in fusion's own repository
 *      most of all. It writes nothing but its own throttle record. See
 *      lib/state-drift.ts and `measureStateDriftForModel` below.
 *
 *   0b. REVIEW COVERAGE, on one narrow trigger: a review file landing under a
 *      `reviews/` store. It tiles the review files' declared ranges against the
 *      session's commit range and names, commit by commit, what no reviewer has
 *      opened — plus the files the last pass declared it did not open, which are
 *      the next dispatch's scope. It is deliberately NOT on the every-tool-call
 *      path job 0 sits on: an uncovered range mid-Turn is the normal state, and
 *      a check that fires on its commonest path is one its reader learns to
 *      ignore. See lib/review-coverage.ts and `measureReviewCoverageForModel`.
 *
 *   0c. STAGING DRIFT, on one measured trigger: HEAD is not where it was on the
 *      previous tool call. It reads `git status --porcelain` over the workbench
 *      and names the authored records — and any commit-message-shaped file that
 *      landed inside the workbench where no artifact store owns it — that the
 *      commit just made did not carry. Like 0b
 *      it is not on the every-tool-call path: an unstaged record mid-Turn is the
 *      normal state, and the moment a missed record becomes a missed record is
 *      the commit. The trigger is READ FROM THE REPOSITORY, never from the
 *      command's text — deciding from a shell string whether it will move HEAD
 *      is the question the deleted branch policy answered wrong 24 times. See
 *      lib/staging-drift.ts and `measureStagingDriftForModel`.
 *
 *   2. CHURN. Record write-tool file mutations in the churn heatmap, emitting
 *      warning/critical events at the configured per-session thresholds.
 *
 * A job 1 sat between 0c and 2 until 2026-08-12: a second fingerprint of every path
 * on `guard.protectedPaths`, compared against the one `guard.ts` took before the
 * tool ran, with anything that changed written back and the guard halted. It was
 * the enforcing half of the protected-path mechanism, and the whole mechanism
 * was removed — see `guard.ts`'s header for the measurement that decided it.
 * Nothing replaced it: a protected path is not watched, not restored and not
 * reported, by this hook or any other.
 *
 * ## What a PostToolUse hook can and cannot do
 *
 * It cannot BLOCK: the tool has already run, and no response undoes that. That
 * much of this header was always true and still is.
 *
 * It CAN return explanatory text to the model, which this header used to deny.
 * `hookSpecificOutput.additionalContext` is documented as being inserted next to
 * the tool result so the conversation continues and Claude can act on it, and it
 * was measured doing exactly that against Claude Code 2.1.224: the string comes
 * back to the model in a system-reminder reading `PostToolUse:Bash hook
 * additional context: <text>`.
 *
 * That distinction is load-bearing rather than trivia. It was established for
 * the removed job 1, where a revert the model never heard about would have
 * satisfied the mechanism and violated the constraint that an agent must never
 * meet an unexplained failure. The three measurements that remain say nothing
 * ELSE tells the model — a frozen `agentstate.yaml`, an unreviewed commit range,
 * a record the commit did not carry — so the channel is the whole of their
 * effect rather than an explanation attached to one.
 *
 * ## The reply is written before anything records it
 *
 * The reply goes out first and everything after it is a report: the event rows
 * and the churn heatmap. Each goes through `answer` or `bestEffort` from
 * lib/fail-open.ts, so none of them can discard the sentence on its way out. The
 * churn half used to run ahead of the reply and did exactly that; that module's
 * header carries the class and the measurements.
 *
 * Protocol: reads JSON from stdin, writes {} to stdout, or a
 * `hookSpecificOutput.additionalContext` envelope when a measurement has
 * something to say.
 */

import { resolve, sep } from "node:path";
import {
  TRACKER_NOISE_FILES,
  analyzeChurn,
  churnKey,
  loadChurn,
  recordChange,
  saveChurn,
} from "./lib/churn.js";
import { loadConfig } from "./lib/config.js";
import { matchesAny } from "./lib/paths.js";
import { isFusionPluginRoot } from "./lib/self-detect.js";
import { emitEvent } from "./lib/events.js";
import { answer, bestEffort, failOpen } from "./lib/fail-open.js";
import { findWorkbenchRoot } from "./lib/workbench-root.js";
import { foldCase } from "./lib/paths.js";
import {
  driftSentence,
  lastReported,
  measureStateDrift,
  recordReported,
} from "./lib/state-drift.js";
import {
  coverageSentence,
  lastReportedCoverage,
  measureReviewCoverage,
  recordReportedCoverage,
} from "./lib/review-coverage.js";
import {
  headMoved,
  measureStagingDrift,
  readStagingState,
  stagingSentence,
  writeStagingState,
} from "./lib/staging-drift.js";

/**
 * The four tools whose payload NAMES the path they write.
 *
 * ONE reader now: `trackChurn`, which uses it to decide what counts as a file
 * mutation. It was module-level because a second reader in the removed job 1
 * (`narrowingTarget`) had to agree with it about which payloads name their
 * target, and a disagreement between two copies would have been a silent change
 * in what the guard reverted. It stays module-level because it is a fact about
 * Claude Code's tool surface rather than about churn.
 */
const WRITE_TOOLS = ["Write", "Edit", "MultiEdit", "NotebookEdit"];

/** Hook input from Claude Code (PostToolUse). */
interface HookInput {
  session_id: string;
  hook_event_name: string;
  tool_name: string;
  tool_input: Record<string, unknown>;
  tool_response?: string;
}

/** Extract file path(s) from tool input. */
function extractFilePath(toolInput: Record<string, unknown>): string | null {
  // Write and Edit use "file_path"
  if (typeof toolInput.file_path === "string") {
    return toolInput.file_path;
  }
  // NotebookEdit uses "notebook_path"
  if (typeof toolInput.notebook_path === "string") {
    return toolInput.notebook_path;
  }
  // Bash has "command" — no file path to track directly
  return null;
}

/**
 * Reply to Claude Code, optionally carrying a sentence back to the model.
 *
 * With no context this is the bare `{}` this hook has always emitted. With one,
 * it is the documented `hookSpecificOutput.additionalContext` envelope, which
 * lands next to the tool result as a system-reminder — see the file header for
 * the measurement that established it does.
 */
function respond(additionalContext?: string): void {
  const body =
    additionalContext === undefined
      ? {}
      : {
          hookSpecificOutput: {
            hookEventName: "PostToolUse",
            additionalContext,
          },
        };
  process.stdout.write(JSON.stringify(body) + "\n");
}

/* ------------------------------------------------------------------ *
 * Churn
 * ------------------------------------------------------------------ */

/**
 * The heatmap half of this hook, unchanged in substance.
 *
 * Split out of `main` so a measurement can run for EVERY guarded tool call
 * while this part keeps its own early returns. Before the split, every `return`
 * here was also the hook's reply; now the reply is written once, in `main`, and
 * carries whatever the measurements had to say.
 *
 * It runs AFTER that reply, as a guarded report. This is an advisory heatmap:
 * its `loadConfig`, its `emitEvent` calls and its `saveChurn` can each throw,
 * and none of them may cost a sentence the model needs.
 */
function trackChurn(input: HookInput): void {
  // Only write tools produce churn, and only they are recorded.
  //
  // A `Bash` call used to emit `{"event":"tracker_record","tool":"Bash",
  // "detail":"Bash command observed"}` here — no file, no command, no result.
  // It said that a Bash call happened, which every other line in the log
  // already implies, and nothing read it: the monitor drops `tracker_record`
  // before the warnings panel, and no hook, helper or prompt has ever consumed
  // one. It was 22 % of an 11 142-line log at the time it was measured, and the
  // log has no rotation, so the cheapest thing that could be done about the
  // growth was to stop writing the part that carried nothing (issue
  // `260805-1859`).
  //
  // Filling it with content instead was the other half of that choice and was
  // not taken: the content available here is the command text, and the guard
  // stopped reading command text in v6.0.0 on purpose. Copying every shell
  // command into an append-only log would be a new surface, not a fix for this
  // one. What remains unsettled is the log's upper bound, which discards
  // evidence whichever way it is set — filed as decision `260811-1534`.
  if (!WRITE_TOOLS.includes(input.tool_name)) {
    return;
  }

  const rawFilePath = extractFilePath(input.tool_input);
  if (!rawFilePath) {
    return;
  }

  // The key is anchored to the WORKBENCH ROOT, not to the session's working
  // directory. It used to be cwd-relative when the path fell inside cwd and raw
  // absolute otherwise, so one file collected one counter per directory a
  // session was ever started in — and the workbench-relative spelling that
  // produced never matched `TRACKER_NOISE_FILES` either, which is how
  // `tasklist.md` and `agentstate.yaml` came to be tracked as churn. The two
  // steps `churnKey` runs were shared with `narrowingTarget` in the removed
  // protected-path measurement, so the heatmap and the measurement read one path
  // the same way; the heatmap is now the only reader of that spelling (issue
  // `260809-2023`, decision `260810-0920`).
  const filePath = churnKey(rawFilePath, process.cwd(), findWorkbenchRoot());
  if (filePath === null) {
    // No workbench, or a path outside the root — a scratchpad, another clone.
    // Recorded as an observation, counted under no key: there is no spelling
    // for it under this anchor, and inventing one is what the anchor ended.
    emitEvent(
      "tracker_record",
      input.tool_name,
      rawFilePath,
      "File change recorded (outside the workbench root, not tracked)",
    );
    return;
  }

  // Skip workbench dashboard/state files — designed to be continuously rewritten.
  if (matchesAny(filePath, TRACKER_NOISE_FILES)) {
    emitEvent("tracker_record", input.tool_name, filePath, "File change recorded (noise file, not tracked)");
    return;
  }

  // Load config for thresholds — the same two-source resolution the guard hook
  // does, so a project's `fusion-guard.json` sets ITS churn thresholds and not
  // just the plugin's.
  //
  // `config.diagnostics` is deliberately ignored here. This is PostToolUse, and
  // every tool call that reaches this line (a write tool, past the plugin-repo
  // stand-down above) was inspected by the PreToolUse guard on the same call
  // with the same two sources — so it already emitted one advisory per
  // diagnostic. Emitting again would report one broken configuration file
  // twice per tool call.
  const config = loadConfig();

  // Record the change in churn state
  const churn = loadChurn();
  recordChange(churn, filePath);

  // Analyze churn against thresholds
  const warnings = analyzeChurn(churn, config.churn);

  // Emit events for warnings
  for (const warning of warnings) {
    if (warning.level === "critical") {
      emitEvent(
        "churn_critical",
        input.tool_name,
        filePath,
        `${warning.message}: ${warning.files.join(", ")}`,
      );
    } else if (warning.level === "warning") {
      emitEvent(
        "churn_warning",
        input.tool_name,
        filePath,
        `${warning.message}: ${warning.files.join(", ")}`,
      );
    }
  }

  // Record the individual change event
  emitEvent("tracker_record", input.tool_name, filePath, "File change recorded");

  // Save updated churn state
  saveChurn(churn);
}

/* ------------------------------------------------------------------ *
 * The measurement family — read this before adding a fourth
 * ------------------------------------------------------------------ */

/**
 * THE TRIGGER IS WHAT DECIDES WHETHER A NEW MEASUREMENT IS A SIBLING.
 *
 * Three measurements hang below this line, and each argued in its own review
 * that it was a SIBLING of the others rather than an extension of one. That
 * argument was accepted, and the reason is one property and not a matter of
 * taste: **the three fire on three different conditions.** Decision
 * `fusion-workbench/shared/decisions/260811-1146_*_does-the-measurement-family-get-a-shared-chassis-before-the-fourth-module.md`
 * records it as the criterion, so it is written here rather than remembered.
 *
 * The three, in the order they appear below:
 *
 *   - `measureStateDriftForModel` — **every guarded tool call.** A stale
 *     `agentstate.yaml` is a fault at every moment after the commit that
 *     outdated it, so measuring always reports a fault only when there is one.
 *   - `measureReviewCoverageForModel` — **a review file lands** under a
 *     `reviews/` store. An uncovered commit range mid-Turn is the normal and
 *     correct state; the review landing is the moment the gap becomes both
 *     answerable and a fault to ignore.
 *   - `measureStagingDriftForModel` — **HEAD has moved** since the previous
 *     tool call. An unstaged record mid-Turn is the normal state; the commit is
 *     the moment a missed record becomes a missed record.
 *
 * ## What "a distinct trigger" has to mean, concretely
 *
 * A proposed measurement is a sibling when all three of these hold. They are
 * questions with checkable answers, not a feeling about subject matter:
 *
 *   1. **There is a moment at which its answer changes from "not yet" to
 *      "wrong".** Name that moment. If the answer is "it is wrong from the
 *      commit that broke it onward", the trigger is every call. If it is "it is
 *      only wrong once X has happened", X is the trigger.
 *   2. **On the commonest path, firing at that moment reports NOTHING.** This
 *      is the disqualifying test, and it is the one issue `260810-0710` was
 *      paid for: a check that speaks on its commonest path is one its reader
 *      learns to read past, which destroys the other measurements' credibility
 *      along with its own. If the proposed trigger would fire during ordinary
 *      correct work, it is the wrong trigger — not a reason to soften the
 *      sentence.
 *   3. **The condition is READ, never predicted.** Ask the repository, the file
 *      system or the hook input for a fact. Do not decide from a `Bash`
 *      command's text what it is about to do: that is the classifier the write
 *      guard shed in v6.0.0 and the branch policy that was deleted on 260809
 *      after 24 consecutive false blocks. `headMoved` is the worked example —
 *      it asks `git rev-parse HEAD` rather than reading the command that moved
 *      it, which is correct across `git commit`, an alias, a script, a rebase
 *      and a reset alike.
 *
 * A proposal that fails (1) has no moment and belongs inside an existing
 * measurement's report. One that fails (2) has a trigger that is too wide, not
 * a message that is too loud. One that fails (3) is not a measurement at all.
 *
 * Two triggers that come out identical are NOT siblings: same moment, same
 * throttle, same sentence — that is one measurement with two rows, and it goes
 * into the existing module's report rather than beside it.
 *
 * ## The trip-wire, and it is deliberately here
 *
 * **When a fourth measurement is proposed, the chassis is built first.** The
 * same decision takes option 2 for the third — the throttle store onto
 * `lib/guard-state-file.ts`, the git wrapper into `lib/git.ts`, both of which
 * already had an owner — and leaves the rest as three copies: the three
 * `measure…ForModel` bodies below, the three CLI mains under `hooks/`, and the
 * three `bin/` wrappers. Three copies is where this codebase drew the line the
 * last time (`lib/guard-state-file.ts`'s own header), and drawing it in the
 * same place twice is a decision rather than a coincidence. A fourth copy of
 * the boilerplate is the signal that the chassis is now cheaper than the
 * copies, and `bin/monitor` not rendering two of the three emitted events is
 * what the omission looks like when it is not.
 *
 * What a chassis must NOT do, when it is built: flatten the three trigger
 * arguments into a flag. The reasoning in each measurement's doc comment below,
 * and in `lib/review-coverage.ts` and `lib/staging-drift.ts`, is the most
 * load-bearing text in the family — it is why each is not on the every-call
 * path. A registry that reduced it to `fires: "on-commit"` would lose exactly
 * the part worth keeping.
 */

/* ------------------------------------------------------------------ *
 * Session-state drift
 * ------------------------------------------------------------------ */

/**
 * Measure the session's bookkeeping surfaces against the two records that
 * cannot silently freeze, and hand the model a sentence when one has drifted.
 *
 * ## Why this lives in a hook at all
 *
 * Issue `260801-2038` measured the freeze six times and its own reconciliation
 * measured why the first fix did not take: the check was written into
 * `agents/orchestrator.md`, an agent prompt is loaded at session start, and so
 * the session that installed it was never the session that could run it. That
 * is construction rather than task pressure, and no firmer sentence closes it.
 * A PostToolUse hook is invoked by Claude Code from `hooks/hooks.json`, per tool
 * call, reading `hooks/dist/tracker.js` off disk each time — it needs no
 * cooperation from the session and is not something a session can decline.
 *
 * ## Why here rather than as its own end-of-Turn step
 *
 * A commit is what moves `git rev-list --count` past what `agentstate.yaml`
 * claims, and a commit is a `Bash` tool call, so this fires on the very call
 * that produced the divergence. That is the issue's own candidate 1 — the
 * bookkeeping obligation riding an obligation the session already holds —
 * mechanised rather than prescribed.
 *
 * ## Three properties worth stating plainly
 *
 * 1. **It writes nothing but its own throttle record.** Candidate 3 of the
 *    issue, letting something other than the orchestrator repair the surfaces,
 *    is rejected there and stays rejected: a second writer racing the
 *    orchestrator's own overwrite is worse than a stale number. So this makes a
 *    skipped write impossible not to notice; it cannot make the write happen.
 * 2. **It runs BEFORE the plugin-repo stand-down in `main`, and is anchored at
 *    the workbench root rather than at cwd.** The stand-down exists so a fusion
 *    developer's own edits are not counted as churn — and, until the
 *    protected-path measurement was removed, not written back either. Neither
 *    applies here: fusion's own repository is a
 *    fusion consumer with a live workbench, and every one of the six measured
 *    instances happened in it. Standing this down there would switch it off in
 *    the only project where it is known to be needed.
 * 3. **It reports once per divergence, not once per tool call.** The throttle
 *    compares the drift signature with the last one reported; a divergence that
 *    grows speaks again, one that merely persists stays quiet.
 */
function measureStateDriftForModel(): string | null {
  const root = findWorkbenchRoot();
  if (root === null) return null;

  const report = measureStateDrift(root);
  const seen = lastReported(root);

  if (report.signature === seen) return null;

  // Cleared as readily as it is set: when the orchestrator brings the surfaces
  // current the signature becomes "", the record is emptied, and a later drift
  // is reported afresh rather than being mistaken for the one already told.
  bestEffort("tracker", () => recordReported(root, report.signature));

  if (report.drifted.length === 0) return null;

  const detail = report.drifted
    .map((r) => `${r.surface}: surface=${r.says} record=${r.record}`)
    .join("; ");
  bestEffort("tracker", () => emitEvent("state_drift", undefined, undefined, detail));

  return driftSentence(report);
}

/**
 * Review coverage, measured when a review file lands — issue `260810-1205`.
 *
 * ## The trigger is the whole design
 *
 * This runs on ONE condition: a write tool just wrote a `.md` file under a
 * `reviews/` store inside the workbench. It is not on the every-tool-call path
 * the state-drift measurement sits on, and the asymmetry is deliberate rather
 * than an omission.
 *
 * A stale `agentstate.yaml` is a fault at every moment after the commit that
 * outdated it, so measuring it on every call reports a fault only when there is
 * one. An uncovered commit range mid-Turn is the **normal and correct** state —
 * review runs at Step 3c, after the Turn's tasks have landed — so the same
 * cadence here would report a fault on the commonest path, and a check that
 * cries wolf on its commonest path teaches its reader to ignore it. That is
 * issue `260810-0710` arriving one level up.
 *
 * A review file landing is the moment the answer is actionable and the moment
 * it is a fault to ignore: the range is now as tiled as this pass is going to
 * make it, and the next dispatch's scope is being decided. Which is the point —
 * the defect was not that the previous pass's declared exclusions were unknown,
 * it was that they sat in a file nobody reopened. Reporting them here makes the
 * carried list an obligation that arrives rather than a footnote.
 *
 * Like `measureStateDriftForModel`, it writes nothing but its own throttle
 * record, it reports once per gap rather than once per file, and it is anchored
 * at the workbench root — so it is NOT stood down in fusion's own repository,
 * which is where issue `260810-1205` was measured.
 */
function measureReviewCoverageForModel(input: HookInput): string | null {
  if (!WRITE_TOOLS.includes(input.tool_name)) return null;

  const written = extractFilePath(input.tool_input);
  if (written === null) return null;

  const root = findWorkbenchRoot();
  if (root === null) return null;

  // Case-folded, so a case-insensitive file system does not decide whether this
  // fires. `foldCase` was shared with the protected-path measurement's match and
  // is now read here and by the churn noise filter.
  const abs = foldCase(resolve(process.cwd(), written));
  const store = foldCase(resolve(root, "fusion-workbench"));
  if (!abs.startsWith(store + sep)) return null;
  if (!abs.endsWith(".md")) return null;
  if (!abs.includes(sep + "reviews" + sep)) return null;

  const report = measureReviewCoverage(root);
  if (report.why !== "") return null; // no session window to measure against

  const seen = lastReportedCoverage(root);
  if (report.signature === seen) return null;

  bestEffort("tracker", () => recordReportedCoverage(root, report.signature));

  const sentence = coverageSentence(report);
  if (sentence === "") return null;

  const detail =
    `uncovered=${report.uncovered.map((c) => c.short).join(",") || "none"}; ` +
    `carried=${report.carried.join(",") || "none"}`;
  bestEffort("tracker", () => emitEvent("review_coverage", input.tool_name, written, detail));

  return sentence;
}

/**
 * Staging drift, measured when HEAD moves — issue `260811-0114`.
 *
 * ## The trigger is read, not predicted, and that is the whole of it
 *
 * This fires on one condition: `git rev-parse HEAD` differs from what the
 * previous tool call recorded. Two alternatives were available and both are
 * mistakes this codebase has already paid for.
 *
 * Firing on **every tool call** — where the state-drift measurement sits —
 * would report the commonest correct state as a fault. A coder writes an issue
 * file and Step 3b stages it minutes later; in between, the record is unstaged
 * and nothing is wrong. `measureReviewCoverageForModel` above declines the
 * every-call path for the same reason, and issue `260810-0710` is where that
 * reasoning was first paid for.
 *
 * Reading the **`Bash` command's text** for `git commit` would be the
 * classifier again. Deciding from a shell string what a command will do to the
 * repository is the undecidable question the write-path classifier answered
 * until v6.0.0 and the git branch policy answered until it was deleted on
 * 260809 after 24 consecutive false blocks against the agents' own verification
 * commands. Nothing about a command is read here; the repository is asked
 * instead, which is correct across `git commit`, an alias, a script, a rebase
 * and a reset alike.
 *
 * ## Why the commit is the right moment
 *
 * The staging list has just been assembled and used. Whatever authored record
 * is still sitting in the working tree is one no list named — which is exactly
 * the defect: the 17:23 queue rebuild ran forty-three minutes before the range's
 * first commit, so no task had a reason to name it, and it stayed there for
 * eighteen commits. Reporting at this moment makes the omission arrive attached
 * to the act that should have carried it.
 *
 * ## The same three properties as its two siblings
 *
 * It writes nothing but its own throttle record; it reports once per miss
 * rather than once per commit, and a miss that grows speaks again; and it is
 * anchored at the workbench root rather than at cwd, so it is NOT stood down in
 * fusion's own repository — which is where issue `260811-0114` was measured.
 */
function measureStagingDriftForModel(): string | null {
  const root = findWorkbenchRoot();
  if (root === null) return null;

  // One read of the throttle record for the whole call: it holds both the HEAD
  // the previous call saw and the signature last reported, and this runs on
  // every guarded tool call.
  const state = readStagingState(root);
  const { moved, head } = headMoved(root, state.head);

  if (!moved) {
    // Arm the next call's comparison. `headMoved` states why the first sighting
    // of a HEAD is recorded rather than reported.
    if (head !== "" && state.head !== head) {
      bestEffort("tracker", () => writeStagingState(root, { ...state, head }));
    }
    return null;
  }

  const report = measureStagingDrift(root);
  if (report.why !== "") {
    // No git to ask, so nothing is known about staging. Record the head anyway
    // so the trigger does not re-fire on the same commit.
    bestEffort("tracker", () => writeStagingState(root, { head, reported: "" }));
    return null;
  }

  const seen = state.reported;
  bestEffort("tracker", () => writeStagingState(root, { head, reported: report.signature }));

  if (report.signature === "" || report.signature === seen) return null;

  const sentence = stagingSentence(report);
  if (sentence === "") return null;

  const detail = report.faults.map((r) => `${r.code.trim() || "M"} ${r.path}`).join("; ");
  bestEffort("tracker", () => emitEvent("staging_drift", undefined, undefined, detail));

  return sentence;
}

async function main(): Promise<void> {
  // Read hook input from stdin
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk as Buffer);
  }
  const raw = Buffer.concat(chunks).toString("utf-8").trim();

  if (!raw) {
    respond();
    return;
  }

  let input: HookInput;
  try {
    input = JSON.parse(raw) as HookInput;
  } catch {
    respond();
    return;
  }

  // The session-state drift measurement, ahead of the stand-down below and
  // anchored at the workbench root rather than at cwd. Its own header says why
  // it is not stood down in fusion's own repository: that repository is a
  // fusion consumer, and all six measured instances of the freeze happened
  // there. `bestEffort` because one bookkeeping report may never cost the
  // others, or the churn heatmap that follows them.
  let drift: string | null = null;
  bestEffort("tracker", () => {
    drift = measureStateDriftForModel();
  });

  // Review coverage, on the narrow trigger of a review file landing. Same
  // anchoring and the same reason for not standing down in fusion's own
  // repository; see `measureReviewCoverageForModel` for why its trigger is a
  // single act rather than every tool call.
  let coverage: string | null = null;
  bestEffort("tracker", () => {
    coverage = measureReviewCoverageForModel(input);
  });

  // Staging drift, on the measured trigger of HEAD having moved. Same anchoring
  // and the same reason for not standing down in fusion's own repository; see
  // `measureStagingDriftForModel` for why the trigger is read out of the
  // repository rather than out of the command that moved it.
  let staging: string | null = null;
  bestEffort("tracker", () => {
    staging = measureStagingDriftForModel();
  });

  // Self-detect: the workbench root is fusion's own repository, so CHURN stands
  // down — plugin development edits are not meaningful churn signal.
  //
  // ## The question is asked of the ROOT, not of cwd
  //
  // This gate governs CHURN, and nothing else. It had a sibling — the
  // protected-path measurement folded its own plugin-repo stand-down into
  // `measurementRoot()` and asked it of this same workbench root — and that
  // sibling was removed with the measurement on 2026-08-12. The remaining
  // stand-down in `guard.ts` asks a DIFFERENT directory (cwd, via
  // `isFusionPluginCwd()`), which is the divergence CLAUDE.md documents.
  //
  // It used to ask `process.cwd()`, on the stated ground that churn keys were
  // relativized against cwd. `25c5454` moved that anchor to the workbench root
  // in this same file — `churnKey(rawFilePath, process.cwd(), findWorkbenchRoot())`
  // — which left the gate resting on a premise the line above it contradicted
  // (issue `260810-1632`). The behavioural half is the defect that anchor move
  // was closing, arriving one gate later: `isFusionPluginCwd()` does no upward
  // walk, so in this repository a session started at the root recorded no churn
  // at all while a session started in `fusion-workbench/` — CLAUDE.md calls it
  // the ordinary case — recorded churn AND ran the on-disk key migration over
  // `churn.json`. What gets counted must not depend on which directory the
  // session happened to start in (issue `260805-1839`).
  //
  // ## A null root is not a stand-down
  //
  // Without a workbench there is nothing here to stand down: `churnKey` returns
  // null and `emitEvent` writes nowhere. Folding the two causes into one null —
  // the shape the removed `measurementRoot()` took, where both meant "do not
  // measure" — would answer "fusion's own repository" for any directory that
  // never ran `/fusion:setup`.
  //
  // ## The three reports above run ahead of this deliberately
  //
  // Their placement is load-bearing in EVERY session in this repository now, not
  // only in root-started ones: this gate no longer misses the subdirectory case,
  // so a report moved below it would fall silent exactly where each was measured.
  const workbenchRoot = findWorkbenchRoot();
  if (workbenchRoot !== null && isFusionPluginRoot(workbenchRoot)) {
    const sentences: (string | null)[] = [drift, coverage, staging];
    const standDown = sentences.filter((t): t is string => t !== null).join(" ");
    respond(standDown === "" ? undefined : standDown);
    return;
  }

  // The reply first, the heatmap after it. The reply is the only thing this
  // hook says to the model, and it used to be held until an advisory metric had
  // finished. Measured with `churn.json` replaced by a non-empty directory: `{}`
  // on stdout and the agent told nothing (`260809-2045`). What was silenced then
  // was the protected-path sentence, and that sentence is gone with the
  // measurement — the three below are what is left to lose, and losing one is
  // the same defect. Joined rather than chosen between, for the same reason.
  const parts: (string | null)[] = [drift, coverage, staging];
  const context = parts.filter((s): s is string => s !== null).join(" ");

  answer(
    "tracker",
    () => respond(context === "" ? undefined : context),
    () => trackChurn(input),
  );
}

main().catch((err) => {
  // Fail open — PostToolUse must not interfere with the agent.
  //
  // `respond` goes first and the reporting after it, for the reason `guard.ts`
  // ends with and `lib/fail-open.ts` states in full: `emitEvent` writes under
  // `.guard-state/`, so the error class most likely to bring the tracker here is
  // the one that used to throw a second time inside this handler and leave
  // stdout empty.
  failOpen("tracker", err, () => respond(), () =>
    emitEvent("guard_error", undefined, undefined, `Tracker error (fail-open): ${err}`),
  );
});
