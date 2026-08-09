/**
 * Compliance Guard — PostToolUse hook for Claude Code.
 *
 * Two jobs, in this order:
 *
 *   1. MEASURE THE PROTECTED PATHS. Take a second fingerprint of every path on
 *      `guard.protectedPaths` and compare it with the one `guard.ts` recorded
 *      before the tool ran. Anything that changed is written back to what the
 *      before-fingerprint holds, the guard is halted, and the model is told
 *      which file and why. This is the guard's actual enforcement of those
 *      paths, and it replaced a classifier that tried to predict, from a shell
 *      command's text, which files the command would write. See
 *      lib/protected-snapshot.ts.
 *   2. CHURN AND PING-BACK. Record write-tool file mutations in the churn
 *      heatmap and the cross-file ping-back state, emitting warning/critical
 *      events at the configured thresholds. Unchanged.
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
 * That distinction is load-bearing rather than trivia. The binding decision
 * makes the EXPLAINING refusal a constraint, because an agent that meets an
 * unexplained failure works around it, and that failure mode is the reason the
 * rule file exists. A revert the model never hears about would satisfy the
 * mechanism and violate the constraint.
 *
 * Protocol: reads JSON from stdin, writes {} to stdout, or a
 * `hookSpecificOutput.additionalContext` envelope when something was restored.
 */

import { resolve, relative, isAbsolute } from "node:path";
import { loadChurn, saveChurn, recordChange, analyzeChurn } from "./lib/churn.js";
import {
  loadCrossFile,
  saveCrossFile,
  recordEdit,
  analyzeCrossFile,
} from "./lib/cross-file.js";
import { loadConfig, projectDeclaredProtectedPaths } from "./lib/config.js";
import type { GuardConfig } from "./lib/config.js";
import { matchesAny } from "./lib/paths.js";
import { isFusionPluginCwd } from "./lib/self-detect.js";
import { emitEvent } from "./lib/events.js";
import {
  loadEscalation,
  raiseHalt,
  saveEscalation,
  clearHaltCommand,
} from "./lib/escalation.js";
import {
  ABSENT,
  consumeSnapshot,
  diffSnapshots,
  measurementRoot,
  restore,
  takeSnapshot,
} from "./lib/protected-snapshot.js";
import type { ProtectedChange } from "./lib/protected-snapshot.js";
import { preserveObserved } from "./lib/reverted-copy.js";
import { projectRelative } from "./lib/project-relative.js";
import { foldCase } from "./lib/paths.js";
import {
  isObservedRulePath,
  rulesWriteDetail,
  rulesWriteExemptionActive,
} from "./lib/rules-write-exemption.js";

/**
 * The four tools whose payload NAMES the path they write.
 *
 * Two readers, and the second is the reason this is a module-level constant
 * rather than a local list: `trackChurn` uses it to decide what counts as a file
 * mutation, and `narrowingTarget` uses it to decide whether the tool payload can
 * be trusted to name the target at all. Two copies of this list could disagree,
 * and the disagreement would be a silent change in what the guard reverts.
 */
const WRITE_TOOLS = ["Write", "Edit", "MultiEdit", "NotebookEdit"];

/**
 * Workbench dashboard/state files that the orchestrator continuously
 * rewrites by design. Tracking them as churn or ping-back produces
 * pure noise — exclude from both metrics.
 *
 * ## This list is not a protection statement
 *
 * The `.guard-state/**` entry below is confirmed deliberately, not carried
 * along. `fusion-workbench/.guard-state/**` appeared twice in this codebase and
 * the two occurrences answered different questions; only one of them was
 * retired.
 *
 *   - In `hooks/config.json` it meant "an agent may not write here". That entry
 *     is GONE (step 1 of this Circle). It had to go: the measurement writes its
 *     own snapshot, its own events and its own escalation counter into that
 *     directory, so a protected `.guard-state/` would have made every single
 *     tool call report the guard's own bookkeeping as a violation.
 *   - HERE it means "changes here are not evidence about the agent's editing
 *     behaviour". That is still true, and more true than before: `guard.ts` now
 *     writes a fresh snapshot file into `.guard-state/` on every guarded call.
 *     Counting those would drown the churn heatmap in the guard's own traffic.
 *
 * Deleting this entry because the other one went would break the churn metric
 * for a reason that has nothing to do with churn.
 */
const TRACKER_NOISE_FILES = [
  "fusion-workbench/orchestrator-live.md",
  "fusion-workbench/orchestrator-events.jsonl",
  "fusion-workbench/agentstate.yaml",
  "fusion-workbench/.guard-state/**",
];

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
 * The measurement
 * ------------------------------------------------------------------ */

/** Where the observed content was kept, or why it could not be. */
interface Preserved {
  /** Project-relative name of the copy; null when there was none to make. */
  path: string | null;
  /** The I/O failure that stopped it. Null when nothing went wrong. */
  error: string | null;
}

/** What happened to one protected path that changed during this tool call. */
interface MeasuredOutcome {
  change: ProtectedChange;
  /**
   * `restored` — put back to the before-fingerprint.
   * `restore-failed` — the write back was refused or failed; still on disk.
   * `left-in-place` — deliberately not written back; see `narrowingTarget`.
   */
  verdict: "restored" | "restore-failed" | "left-in-place";
  /** Why the restore failed, when `verdict` is `restore-failed`. Empty otherwise. */
  reason: string;
  /** The observed content, kept before anything was written back. */
  preserved: Preserved;
  /** The payload path that spared this one, when `verdict` is `left-in-place`. */
  sparedBy: string;
}

/**
 * Put one path back to what it held before this tool call.
 *
 * ## Why git is not involved any more
 *
 * This used to be `git checkout HEAD -- <path>`, and `HEAD` is not the state the
 * measurement measured. The gap between the two produced five branches — in git
 * and clean, in git with the human's work already staged, untracked, created by
 * this very call, no repository at all — of which one discarded human work and
 * three could not restore anything. The fingerprint now carries the content, so
 * there is one branch: write back what was there. See
 * `lib/protected-snapshot.ts` `restore`, which owns it.
 *
 * ## A failure is reported, never swallowed
 *
 * The worst outcome available here is a guard that reports a violation as
 * handled while the modified file stays modified. `restore` throws on any I/O
 * failure — a path that is now a directory, a read-only filesystem — and this is
 * the one place that turns the exception into a sentence the model gets. It is
 * not a fail-open catch: nothing continues as though the restore had worked.
 */
function restorePath(root: string, change: ProtectedChange): string | null {
  try {
    restore(root, change);
    return null;
  } catch (err) {
    return err instanceof Error ? err.message : String(err);
  }
}

/**
 * Keep what the path was observed to hold, before anything is written back.
 *
 * The failure is CARRIED rather than thrown, because a copy that could not be
 * made must not stop the revert: the guard's job is still to put the path back,
 * and a preservation failure is one more thing to say in the sentence, not a
 * reason to leave a protected path rewritten. `describe` says which of the three
 * happened — kept, nothing to keep, or keeping failed — so no outcome claims a
 * recoverable revert it cannot back up.
 */
function preserve(root: string, rel: string, observed: string): Preserved {
  try {
    return { path: preserveObserved(root, rel, observed), error: null };
  } catch (err) {
    return { path: null, error: err instanceof Error ? err.message : String(err) };
  }
}

/**
 * The one path this tool call is known to have written — or null when there is
 * no such knowledge and every changed protected path has to be written back.
 *
 * ## What is decidable here, and what is not
 *
 * The hook cannot tell who changed a protected path: its inputs are two
 * fingerprints, a tool name and a tool payload, and none of them separates the
 * agent's write from the user's editor, a watcher or a second session
 * (`260809-1107`). One narrower question IS decidable. For the four write tools
 * the payload names the file the tool writes, and a write tool has no second
 * write — so a protected path that changed while being something OTHER than the
 * payload's path was moved by something that is not this tool call.
 *
 * The user decided at the plan gate on 2026-08-09 that this evidence travels
 * into the revert and not only into the message
 * (`shared/decisions/260809-1527_*_should-the-revert-narrow-to-the-payload-path-for-the-four-write-tools.md`,
 * option 2). What is not written back is still preserved, still named in the
 * sentence, still recorded as a `guard_block`, and still halts.
 *
 * ## `Bash` is answered with null, and that is the whole of the bound
 *
 * The narrowing rests on the payload naming the target. A `Bash` payload names
 * nothing of the kind — the command's text is exactly the input v6.0.0 stopped
 * reading, because which files a command writes is not decidable from it. So
 * `Bash` keeps the full revert of every changed protected path, and extending
 * this function to it would bring back the undecidable question by the back
 * door. Obligation 4 of that decision record puts a test on this sentence.
 *
 * Null is also the answer when a write tool arrives with no usable path in its
 * payload. That direction is deliberate: an unreadable payload is the absence of
 * evidence, and the absence of evidence must not spare a path from being written
 * back.
 *
 * ## Two coordinate spaces, and the payload is in the wrong one
 *
 * A payload path is absolute or relative to `process.cwd()`; a protected path is
 * relative to the measurement root, which may be an ancestor of it. `resolve`
 * lifts the payload into an absolute path in the session's space and
 * `projectRelative` puts it into the root's — the same normalisation the
 * PreToolUse write-tool check uses, so the two halves of one tool call read one
 * path the same way. A payload landing outside the root comes back absolute,
 * matches no protected path, and therefore spares nothing that was measured.
 */
function narrowingTarget(input: HookInput, root: string): string | null {
  if (!WRITE_TOOLS.includes(input.tool_name)) return null;
  const raw = extractFilePath(input.tool_input);
  if (raw === null) return null;
  return projectRelative(resolve(process.cwd(), raw), root);
}

/**
 * One human sentence per outcome, for the model and for the event log.
 *
 * ## What this sentence stopped claiming
 *
 * It used to read "was modified and has been restored to its content from before
 * this tool call", and the second half is still exactly right: the restore target
 * IS the content from before the call. What the surrounding message asserted, and
 * no longer does, is that the AGENT made the change — see `measureProtectedPaths`,
 * which now says in as many words that the guard measures a window and not an
 * author. The wording here is unchanged in that respect on purpose: it describes
 * what was measured and what was done about it, which is all the hook knows.
 *
 * What is added is the copy. A revert that names where the observed content was
 * kept is recoverable; one that does not is destruction, and the difference has
 * to reach the reader of the sentence and of `events.jsonl` alike.
 */
function describe(outcome: MeasuredOutcome, toolName: string): string {
  const { change, verdict, reason, preserved, sparedBy } = outcome;
  const what =
    change.kind === "created"
      ? "was created"
      : change.kind === "deleted"
        ? "was deleted"
        : "was modified";
  // For a path that did not exist before, "put back" is a deletion. Saying
  // "restored" there would describe the file as recovered when it is gone.
  const undone =
    change.kind === "created"
      ? "has been removed again — it did not exist before this tool call"
      : "has been restored to its content from before this tool call";
  // Three states, and the empty one is the deleted-path case: there were no
  // observed bytes to keep, and the revert brought the content back rather than
  // destroying any.
  const kept =
    preserved.path !== null
      ? ` The content it carried is preserved at ${preserved.path}.`
      : preserved.error !== null
        ? ` Its content could NOT be preserved: ${preserved.error}.`
        : "";

  if (verdict === "left-in-place") {
    return (
      `${change.path} ${what}, and this ${toolName} call names ${sparedBy} — a different path — ` +
      `so the change was NOT written back and is still on disk.${kept}`
    );
  }
  return verdict === "restored"
    ? `${change.path} ${what} and ${undone}.${kept}`
    : `${change.path} ${what} and could NOT be restored: ${reason}. The change is still on disk.${kept}`;
}

/**
 * Split the measured changes into the ones `FUSION_ALLOW_RULES_WRITE` covers and
 * the ones it does not.
 *
 * The flag is the one narrow permission in the protected-path policy, and it has
 * to reach the measurement or it stops meaning anything: after the classifier
 * goes, a rule file edited during a curation session is caught HERE, and
 * reverting it would take the flag back with no message saying so.
 *
 * Two arguments to the exemption and both are load-bearing. It is asked only
 * when the user actually set the flag, and the project's DECLARED entries —
 * never the effective list, which inherits the plugin's `rules/**` — decide
 * whether the project took the grant back for itself. See `isObservedRulePath`
 * for which gates apply to a measured path and why the others do not.
 */
function splitOffExempted(
  changes: ProtectedChange[],
  config: GuardConfig,
): { exempted: string[]; violations: ProtectedChange[] } {
  if (!rulesWriteExemptionActive(process.env)) {
    return { exempted: [], violations: changes };
  }
  const declared = projectDeclaredProtectedPaths(config);
  const exempted: string[] = [];
  const violations: ProtectedChange[] = [];
  for (const change of changes) {
    if (isObservedRulePath(change.path, declared)) exempted.push(change.path);
    else violations.push(change);
  }
  return { exempted, violations };
}

/**
 * Compare the protected paths against the fingerprint `guard.ts` took before
 * this tool ran; restore, halt and explain whatever moved.
 *
 * Returns the sentence to hand back to the model, or null when nothing changed
 * and there is nothing to say.
 *
 * ## No before-picture means no measurement
 *
 * A missing snapshot yields null rather than a comparison against `HEAD` or
 * against an empty snapshot. Both of those alternatives would revert changes
 * this tool call did not make — a rule file open in the human's editor is the
 * concrete case — and destroying human work is a far worse failure than missing
 * one violation.
 *
 * Four ways there is none, and "nothing was measured" is the right answer to all
 * four: the guard was disabled, the project has no workbench, this is the
 * plugin's own repository, or `guard.ts` could not write one on this call. The
 * last is the case `260809-1108` measured, and it used to be answered with the
 * PREVIOUS call's picture instead of with silence.
 *
 * ## The picture is CONSUMED, not merely read
 *
 * `consumeSnapshot` unlinks the file as it reads it, so the same before-picture
 * can never serve two measurements. Without that, a PostToolUse with no
 * PreToolUse in front of it measured the tree against a call that had already
 * ended, and reverted whatever had happened since — including work the guard had
 * already seen and accepted.
 *
 * There is no age check to go with it, deliberately. A tool call may legitimately
 * run for minutes, so a "too old" bound would silently skip the measurement for
 * exactly the long calls that change the most; the argument is in
 * `lib/protected-snapshot.ts`'s header.
 *
 * ## The root comes from `measurementRoot()`, and it is checked BEFORE the load
 *
 * The after-snapshot has to be taken in the same coordinate space as the before
 * one, so both halves read the root from the same function rather than each
 * asking `process.cwd()` — see its header for why that is the workbench root.
 *
 * The null check sits ahead of `loadSnapshot()` on purpose. A null root means a
 * stand-down (no workbench, or the plugin's own repository), and a snapshot file
 * left over from an earlier session would otherwise be compared against a
 * project this hook must not touch.
 *
 * ## Known residual: parallel tool calls
 *
 * `guard.ts` writes one snapshot file and `tracker.ts` consumes it. Two tool
 * calls running concurrently interleave those writes, so the picture a call
 * reads may be the one another call wrote. Claude Code offers no per-call
 * correlation key in the hook payload, so this is stated rather than solved.
 *
 * Single use narrows it in one respect and only one: the same picture can no
 * longer serve two measurements, so the second of two interleaved calls finds
 * nothing and measures nothing rather than comparing against a before-state that
 * was never its own. The exposure that remains is under-reporting, which was
 * already the shape of this residual. A change that IS seen is always a real
 * change to a protected path, so the revert is never wrong about the FILE when
 * it fires — only, per `260809-1107`, about who moved it.
 *
 * ## The observed content is kept before anything is written back
 *
 * The guard cannot tell the agent's write from a human editor's save inside the
 * window, so it can and does revert work nobody asked it to revert. That stays
 * true. What changed is that the bytes it wrote over are no longer gone:
 * `lib/reverted-copy.ts` keeps them under `.guard-state/reverted/`, and the name
 * of that copy goes into the sentence the model reads and into the `guard_block`
 * event. A revert that is recoverable is a different failure from one that is
 * not.
 *
 * The bytes come from the after-snapshot this function already took. Reading the
 * file again would be a second answer to a question the comparison has already
 * answered, and the two are free to disagree — the same reason `ProtectedChange`
 * carries `before` instead of looking it up a second time.
 *
 * ## What is written back narrows for the four write tools, and only for them
 *
 * See `narrowingTarget` for the decidable question and for why `Bash` is
 * excluded from it. Here is what follows: a path the narrowing spares is still
 * preserved, still described, still emitted as its own `guard_block`, and still
 * raises the halt. The only thing that changes is whether the bytes on disk are
 * overwritten — never whether the change is reported.
 */
function measureProtectedPaths(input: HookInput): string | null {
  const toolName = input.tool_name;
  const config = loadConfig();
  if (!config.guard.enabled) return null;

  const root = measurementRoot();
  if (root === null) return null;

  const before = consumeSnapshot();
  if (!before) return null;

  // Held in a name rather than passed straight through, because it is the one
  // record of what each protected path was OBSERVED to hold during this call.
  // Anything downstream that needs that value reads it from here; going back to
  // the file would be a second answer to one question, free to disagree with the
  // one the comparison used — the same reason `ProtectedChange` carries `before`
  // instead of looking it up again.
  const after = takeSnapshot(root, config.guard.protectedPaths);
  const changes = diffSnapshots(before, after);
  if (changes.length === 0) return null;

  const { exempted, violations } = splitOffExempted(changes, config);

  // The same note the write-tool path records when the flag lets a write
  // through, from the same function, so `events.jsonl` reads identically
  // whichever route the write took. No escalation entry is pushed here: for a
  // write-tool call `guard.ts` already recorded this grant on the PreToolUse
  // side of the very same call, and a second entry would count one permission
  // twice.
  if (exempted.length > 0) {
    emitEvent(
      "guard_advisory",
      toolName,
      exempted.length === 1 ? exempted[0] : undefined,
      rulesWriteDetail(exempted),
    );
  }

  // Every changed path was one the flag covers: nothing to restore, nothing to
  // halt, and the advisory above is the whole record.
  if (violations.length === 0) return null;

  const spared = narrowingTarget(input, root);

  const outcomes: MeasuredOutcome[] = violations.map((change) => {
    // Kept first, and from the after-snapshot rather than from the file: this is
    // the last moment the observed content still exists anywhere.
    const preserved = preserve(
      root,
      change.path,
      after.paths[change.path] ?? ABSENT,
    );

    // Folded, because the protected patterns are matched folded — an unfolded
    // comparison would spare `RULES/x.md` from a payload naming `rules/x.md` on
    // a case-insensitive volume, where the two are one file.
    if (spared !== null && foldCase(change.path) !== foldCase(spared)) {
      return {
        change,
        verdict: "left-in-place",
        reason: "",
        preserved,
        sparedBy: spared,
      };
    }

    const reason = restorePath(root, change);
    return {
      change,
      verdict: reason === null ? "restored" : "restore-failed",
      reason: reason ?? "",
      preserved,
      sparedBy: "",
    };
  });

  // One `guard_block` per changed path, carrying the file and the cause, so a
  // reader of `events.jsonl` can see WHICH files moved rather than only that
  // something did. A path the narrowing spared gets one too — obligation 2 of
  // the decision record: what is not reverted is never passed over in silence.
  for (const outcome of outcomes) {
    emitEvent(
      "guard_block",
      toolName,
      outcome.change.path,
      describe(outcome, toolName),
    );
  }

  // The halt is raised outright, not counted toward the three-block threshold.
  // A protected path was actually written; there is no "two more of these" to
  // wait for. See `raiseHalt` in lib/escalation.ts.
  //
  // It is raised for a spared path exactly as for a reverted one — obligation 3
  // of the decision record. The narrowing decides what is written back, never
  // whether a measured change is a change.
  const summary = outcomes.map((o) => describe(o, toolName)).join(" ");
  const escalation = loadEscalation();
  raiseHalt(
    escalation,
    "protected_path_measured",
    `Protected path changed during a ${toolName} call — ${summary}`,
    toolName,
    outcomes.length === 1 ? outcomes[0].change.path : undefined,
  );
  saveEscalation(escalation);
  emitEvent(
    "guard_halt",
    toolName,
    undefined,
    `Halt raised by the protected-path measurement (${outcomes.length} path(s) changed)`,
  );

  // The `cd` is not decoration: the halt was just recorded under `root`, and the
  // clearing script locates it by walking up from its own working directory. Run
  // from anywhere else it reports "not halted" and clears nothing — see
  // `clearHaltCommand` in lib/escalation.ts.
  return (
    "fusion guard: a protected path changed during this tool call. " +
    summary +
    " What the guard measures is the window around the call, not who wrote in " +
    "it: your own tool call, the user saving in their editor, a file watcher " +
    "and a second session are indistinguishable here, so this may not have " +
    "been you. " +
    "The guard is now HALTED, so all write tools are blocked. " +
    "Do not try to reapply the change or route around this. " +
    "These paths are a human decision: tell the user what you were trying to do " +
    "and why, and let them make the change or adjust guard.protectedPaths in the " +
    "project's fusion-guard.json. " +
    "To resume afterwards, run this from the project directory — the halt is " +
    "recorded there and the script finds it by walking up from its working " +
    `directory: ${clearHaltCommand()}`
  );
}

/* ------------------------------------------------------------------ *
 * Churn and cross-file ping-back
 * ------------------------------------------------------------------ */

/**
 * The heatmap half of this hook, unchanged in substance.
 *
 * Split out of `main` so the measurement above can run for EVERY guarded tool
 * call while this part keeps its own early returns. Before the split, every
 * `return` here was also the hook's reply; now the reply is written once, at the
 * end of `main`, and carries whatever the measurement had to say.
 */
function trackChurn(input: HookInput): void {
  // Only track write operations for churn
  if (!WRITE_TOOLS.includes(input.tool_name)) {
    // For Bash, we just emit a tracker_record event and return
    if (input.tool_name === "Bash") {
      emitEvent("tracker_record", "Bash", undefined, "Bash command observed");
    }
    return;
  }

  const rawFilePath = extractFilePath(input.tool_input);
  if (!rawFilePath) {
    return;
  }

  // Normalize absolute paths to relative for consistent churn tracking
  const filePath = isAbsolute(rawFilePath)
    ? (() => {
        const cwd = process.cwd();
        const resolved = resolve(rawFilePath);
        return resolved.startsWith(cwd + "/") ? relative(cwd, resolved) : rawFilePath;
      })()
    : rawFilePath;

  // Skip workbench dashboard/state files — designed to be continuously rewritten.
  if (matchesAny(filePath, TRACKER_NOISE_FILES)) {
    emitEvent("tracker_record", input.tool_name, filePath, "File change recorded (noise file, not tracked)");
    return;
  }

  // Load config for thresholds — the same two-source resolution the guard hook
  // does, so a project's `fusion-guard.json` sets ITS churn and cross-file
  // thresholds and not just the plugin's.
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

  // Record cross-file ping-back state and analyze for circular edits.
  // Distinct from per-file churn: catches A,B,A,B-style rotation that
  // doesn't cross any single file's churn threshold.
  const crossFile = loadCrossFile();
  recordEdit(crossFile, filePath);
  saveCrossFile(crossFile);

  const crossFileWarnings = analyzeCrossFile(crossFile, config.crossFile);
  for (const w of crossFileWarnings) {
    if (w.level === "critical") {
      emitEvent(
        "cross_file_critical",
        input.tool_name,
        filePath,
        `${w.message}: ${w.files.join(", ")}`,
      );
    } else if (w.level === "warning") {
      emitEvent(
        "cross_file_warning",
        input.tool_name,
        filePath,
        `${w.message}: ${w.files.join(", ")}`,
      );
    }
  }

  // Record the individual change event
  emitEvent("tracker_record", input.tool_name, filePath, "File change recorded");

  // Save updated churn state
  saveChurn(churn);
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

  // Self-detect: cwd is fusion's own repo, so CHURN stands down — plugin
  // development edits are not meaningful churn signal.
  //
  // This gate is no longer what stands the MEASUREMENT down, and the two are
  // separated on purpose. Churn is keyed on paths relativized against
  // `process.cwd()`, so cwd is the directory it must ask about. The measurement
  // is anchored at the workbench root, so it has to ask about THAT directory,
  // and it does — `measurementRoot()` folds its own plugin-repo stand-down in.
  // While one gate served both, a session started in a subdirectory of this
  // repository passed it (no `.claude-plugin/plugin.json` in `fusion-workbench/`)
  // and the measurement would have reverted a fusion developer's own edits to
  // `rules/` and `agents/` once its root moved up.
  if (isFusionPluginCwd()) {
    respond();
    return;
  }

  // The measurement runs on EVERY guarded tool call — Bash included, and before
  // the churn heatmap, which only ever looks at the write tools. A protected
  // path can change by any route, which is the whole point of measuring rather
  // than predicting.
  const measured = measureProtectedPaths(input);

  trackChurn(input);

  respond(measured ?? undefined);
}

main().catch((err) => {
  // Fail open — PostToolUse must not interfere with the agent
  emitEvent("guard_error", undefined, undefined, `Tracker error (fail-open): ${err}`);
  process.stderr.write(`[tracker] Error: ${err}\n`);
  respond();
});
