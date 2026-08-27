/**
 * Compliance Guard — PostToolUse hook for Claude Code.
 *
 * Two jobs, each on its own narrow trigger, and NEITHER of them on the
 * every-tool-call path:
 *
 *   0a. REVIEW COVERAGE, on one narrow trigger: a review file landing under a
 *      `reviews/` store. It tiles the review files' declared ranges against the
 *      session's commit range and names, commit by commit, what no reviewer has
 *      opened — plus the files the last pass declared it did not open, which are
 *      the next dispatch's scope. An uncovered range mid-Turn is the normal
 *      state, and a check that fires on its commonest path is one its reader
 *      learns to ignore. See lib/review-coverage.ts and
 *      `measureReviewCoverageForModel`.
 *
 *   0b. STAGING DRIFT, on one measured trigger: HEAD is not where it was on the
 *      previous tool call. It reads `git status --porcelain` over the workbench
 *      and names the authored records — and any commit-message-shaped file that
 *      landed inside the workbench where no artifact store owns it — that the
 *      commit just made did not carry. Same reason for the narrow trigger: an
 *      unstaged record mid-Turn is the normal state, and the moment a missed
 *      record becomes a missed record is the commit. The trigger is READ FROM
 *      THE REPOSITORY, never from the command's text — deciding from a shell
 *      string whether it will move HEAD is the question the deleted branch
 *      policy answered wrong 24 times. See lib/staging-drift.ts and
 *      `measureStagingDriftForModel`.
 *
 * Three jobs left before them and none was replaced. A job 0 ran on EVERY
 * guarded tool call until 2026-08-15: session-state drift, comparing
 * `agentstate.yaml`, the active Circle's Turn log and the session history file
 * with git and `orchestrator-events.jsonl`. Its subject was the hand-maintained
 * session counters, and it went with them — every firing it ever produced in
 * either measured project was `progress.commits` disagreeing with a number the
 * check derived from `git rev-list` in order to compare against it, so removing
 * the hand-written copy removed the measurement's subject. **Nothing is on the
 * every-tool-call path now.** An ordinary write at an unremarkable path reaches
 * no measurement here at all, and what stops being noticed is stated in that
 * removal's history entry rather than left to be discovered: a dangling
 * `session.history_file`, a history file whose Directive disagrees with the
 * state file's, and a Circle record whose Turn log has frozen. A job 1 sat
 * between the measurements and job 2 until 2026-08-12: a second fingerprint of
 * every path on `guard.protectedPaths`, compared against the one `guard.ts`
 * took before the tool ran, with anything that changed written back and the
 * guard halted — see `guard.ts`'s header for the measurement that decided it. A
 * job 2 sat after them until 2026-08-15: the churn heatmap, which recorded every
 * write-tool file mutation under `.guard-state/churn.json` and emitted
 * `churn_warning` / `churn_critical` at configured per-session thresholds. It
 * warned and never blocked, nothing downstream acted on a warning, and it went
 * with its ranking helper and its configuration leaves. A protected path is not
 * watched, restored or reported, and a thrashed file is not counted, by this
 * hook or any other.
 *
 * The plugin-repo stand-down that used to sit in `main` went with churn. Its
 * whole subject was churn — a fusion developer's own edits are not churn signal
 * — and the measurements above were deliberately placed AHEAD of it because
 * each is anchored at the workbench root and each was measured in this very
 * repository. With churn gone there is nothing here to stand down. Nothing
 * stands down in `guard.ts` either: its own stand-down went on 2026-08-16 with
 * the last verdict it had to suppress, so no hook fusion ships treats its own
 * repository as a special case. `hooks/lib/self-detect.ts` survives without a
 * caller, carrying the rule that decides which directory a future stand-down
 * would have to ask.
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
 * The reply goes out first and the event rows after it. Each measurement runs
 * through `bestEffort` from lib/fail-open.ts, so none of them can discard the
 * sentence on its way out. The churn half used to run ahead of the reply and did
 * exactly that; lib/fail-open.ts's header carries the class and the
 * measurements, and the ordering rule outlives the half that was measured on.
 *
 * Protocol: reads JSON from stdin, writes {} to stdout, or a
 * `hookSpecificOutput.additionalContext` envelope when a measurement has
 * something to say.
 */
import { basename, resolve, sep } from "node:path";
import { emitEvent, setEventSession } from "./lib/events.js";
import { bestEffort, failOpen } from "./lib/fail-open.js";
import { dispatchWasBackgrounded, emitDispatchEvent, heartbeatSessionMarker, isDispatchTool, recordDispatchLaunch, } from "./lib/orchestrator-events.js";
import { findWorkbenchRoot } from "./lib/workbench-root.js";
import { foldCase } from "./lib/paths.js";
import { coverageSentence, isMeasuredReview, lastReportedCoverage, measureReviewCoverage, recordReportedCoverage, } from "./lib/review-coverage.js";
import { headMoved, measureStagingDrift, readStagingState, stagingSentence, writeStagingState, } from "./lib/staging-drift.js";
/**
 * The four tools whose payload NAMES the path they write.
 *
 * ONE reader now: `measureReviewCoverageForModel`, which uses it to decide
 * whether this call could have written a review file. It was module-level
 * because two removed readers had to agree with it about which payloads name
 * their target — job 1's `narrowingTarget` and job 2's `trackChurn` — and a
 * disagreement between copies would have been a silent change in what the guard
 * did. It stays module-level because it is a fact about Claude Code's tool
 * surface rather than about any one measurement.
 */
const WRITE_TOOLS = ["Write", "Edit", "MultiEdit", "NotebookEdit"];
/** Extract file path(s) from tool input. */
function extractFilePath(toolInput) {
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
function respond(additionalContext) {
    const body = additionalContext === undefined
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
 * The measurement family — read this before adding a fourth
 * ------------------------------------------------------------------ */
/**
 * THE TRIGGER IS WHAT DECIDES WHETHER A NEW MEASUREMENT IS A SIBLING.
 *
 * Two measurements hang below this line, and each argued in its own review
 * that it was a SIBLING of the other rather than an extension of it. That
 * argument was accepted, and the reason is one property and not a matter of
 * taste: **they fire on different conditions.** Decision
 * `fusion-workbench/shared/decisions/260811-1146_*_does-the-measurement-family-get-a-shared-chassis-before-the-fourth-module.md`
 * records it as the criterion, so it is written here rather than remembered.
 *
 * A third hung here until 2026-08-15 and its trigger was **every guarded tool
 * call**: session-state drift, on the argument that a stale `agentstate.yaml`
 * is a fault at every moment after the commit that outdated it. It was removed
 * with the hand-maintained counters that were its subject, and the every-call
 * slot is now EMPTY rather than free — a proposal that wants it has to make the
 * argument below from scratch, not inherit a vacancy.
 *
 * The two, in the order they appear below:
 *
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
 * already had an owner — and leaves the rest as per-measurement copies: the
 * `measure…ForModel` bodies below, the CLI mains under `hooks/`, and the
 * wrappers under `bin/`. There were three sets when that decision was taken and
 * there are two now, the session-state drift measurement having been removed on
 * 2026-08-15 with the counters that were its subject. Three copies is where
 * this codebase drew the line the last time (`lib/guard-state-file.ts`'s own
 * header), and drawing it in the same place twice was a decision rather than a
 * coincidence. **The trip-wire counts UP, so the removal moved it further off
 * rather than resetting it:** a fourth copy of the boilerplate is the signal
 * that the chassis is now cheaper than the copies, and `bin/monitor` not
 * rendering the emitted events is what the omission looks like when it is not.
 *
 * What a chassis must NOT do, when it is built: flatten the three trigger
 * arguments into a flag. The reasoning in each measurement's doc comment below,
 * and in `lib/review-coverage.ts` and `lib/staging-drift.ts`, is the most
 * load-bearing text in the family — it is why each is not on the every-call
 * path. A registry that reduced it to `fires: "on-commit"` would lose exactly
 * the part worth keeping.
 */
/**
 * Review coverage, measured when a review file lands — issue `260810-1205`.
 *
 * ## The trigger is the whole design
 *
 * This runs on ONE condition: a write tool just wrote a `.md` file under a
 * `reviews/` store inside the workbench. It is not on the every-tool-call path,
 * and that is deliberate rather than an omission.
 *
 * An uncovered commit range mid-Turn is the **normal and correct** state —
 * review runs at Step 3c, after the Turn's tasks have landed — so an every-call
 * cadence here would report a fault on the commonest path, and a check that
 * cries wolf on its commonest path teaches its reader to ignore it. That is
 * issue `260810-0710` arriving one level up. The measurement that DID hold the
 * every-call slot, until 2026-08-15, held it on the opposite reading of the
 * same criterion: a stale `agentstate.yaml` was a fault at every moment after
 * the commit that outdated it, so measuring on every call reported a fault only
 * when there was one.
 *
 * A review file landing is the moment the answer is actionable and the moment
 * it is a fault to ignore: the range is now as tiled as this pass is going to
 * make it, and the next dispatch's scope is being decided. Which is the point —
 * the defect was not that the previous pass's declared exclusions were unknown,
 * it was that they sat in a file nobody reopened. Reporting them here makes the
 * carried list an obligation that arrives rather than a footnote.
 *
 * Like its sibling below, it writes nothing but its own throttle record, it
 * reports once per gap rather than once per file, and it is anchored at the
 * workbench root — so it is NOT stood down in fusion's own repository, which is
 * where issue `260810-1205` was measured.
 */
function measureReviewCoverageForModel(input) {
    if (!WRITE_TOOLS.includes(input.tool_name))
        return null;
    const written = extractFilePath(input.tool_input);
    if (written === null)
        return null;
    const root = findWorkbenchRoot();
    if (root === null)
        return null;
    // Case-folded, so a case-insensitive file system does not decide whether this
    // fires. `foldCase` was shared with the protected-path measurement's match and
    // with the churn heatmap's noise filter, and is the last reader of it here.
    const abs = foldCase(resolve(process.cwd(), written));
    const store = foldCase(resolve(root, "fusion-workbench"));
    if (!abs.startsWith(store + sep))
        return null;
    if (!abs.endsWith(".md"))
        return null;
    if (!abs.includes(sep + "reviews" + sep))
        return null;
    // The same population the scan reads, through the same function — a trigger
    // wider than the scan fires the whole measurement over a file the scan will
    // not measure, which is what a `conceptrev` verdict landing at the plan gate
    // did (issue `260811-1145`). `basename` of the ORIGINAL path, not the folded
    // one: the sender segment is lower-case by the filename convention, and
    // folding is only ever applied to the directory test above it.
    if (!isMeasuredReview(basename(written)))
        return null;
    const report = measureReviewCoverage(root);
    if (report.why !== "")
        return null; // no session window to measure against
    const seen = lastReportedCoverage(root);
    if (report.signature === seen)
        return null;
    bestEffort("tracker", () => recordReportedCoverage(root, report.signature));
    const sentence = coverageSentence(report);
    if (sentence === "")
        return null;
    const detail = `uncovered=${report.uncovered.map((c) => c.short).join(",") || "none"}; ` +
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
 * Firing on **every tool call** — where the removed state-drift measurement
 * sat — would report the commonest correct state as a fault. A coder writes an issue
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
function measureStagingDriftForModel() {
    const root = findWorkbenchRoot();
    if (root === null)
        return null;
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
    if (report.signature === "" || report.signature === seen)
        return null;
    const sentence = stagingSentence(report);
    if (sentence === "")
        return null;
    const detail = report.faults.map((r) => `${r.code.trim() || "M"} ${r.path}`).join("; ");
    bestEffort("tracker", () => emitEvent("staging_drift", undefined, undefined, detail));
    return sentence;
}
async function main() {
    // Read hook input from stdin
    const chunks = [];
    for await (const chunk of process.stdin) {
        chunks.push(chunk);
    }
    const raw = Buffer.concat(chunks).toString("utf-8").trim();
    if (!raw) {
        respond();
        return;
    }
    let input;
    try {
        input = JSON.parse(raw);
    }
    catch {
        respond();
        return;
    }
    // Same seam as `guard.ts`, set at the same point and for the same reason: the
    // two measurements below each emit a row, and so does the top-level handler,
    // which has no `input` in scope. See `lib/events.ts`.
    setEventSession(input.session_id);
    // The dispatch trace's second half: a machine-written `task_done` row per
    // completed sub-agent dispatch, while an orchestrator session is in flight.
    // Not a measurement and not a sibling of the family below — it reports
    // nothing to the model, it records; the trigger question in the family
    // header does not apply to a row with no sentence. `guard.ts` writes the
    // `task_start` half; `lib/orchestrator-events.ts` carries schema and gate.
    // A BACKGROUNDED dispatch returns at launch (`tool_response.status:
    // "async_launched"`, measured — see the lib's header block on the two
    // emitters), so its row would record the launch and not the finish: that
    // case parks an agentId->tool_use_id mapping instead, which the
    // SubagentStop hook resolves at the real completion.
    // The two measurements still run after it: a sub-agent may have committed
    // during its run, which is exactly the HEAD-moved trigger staging drift
    // reads.
    if (isDispatchTool(input.tool_name)) {
        if (dispatchWasBackgrounded(input)) {
            bestEffort("tracker", () => recordDispatchLaunch(input));
        }
        else {
            bestEffort("tracker", () => emitDispatchEvent("task_done", input));
        }
    }
    // The session-marker heartbeat, on every call and self-rate-limited — see
    // `lib/orchestrator-events.ts` for the gate and the residual. Not a
    // measurement either: it says nothing and records only an mtime.
    bestEffort("tracker", () => {
        const root = findWorkbenchRoot();
        if (root !== null)
            heartbeatSessionMarker(root);
    });
    // Review coverage, on the narrow trigger of a review file landing. Anchored
    // at the workbench root rather than at cwd, and not stood down in fusion's
    // own repository: that repository is a fusion consumer, and issue
    // `260810-1205` was measured there. `bestEffort` because one bookkeeping
    // report may never cost the other.
    let coverage = null;
    bestEffort("tracker", () => {
        coverage = measureReviewCoverageForModel(input);
    });
    // Staging drift, on the measured trigger of HEAD having moved. Same anchoring
    // and the same reason for reporting in fusion's own repository; see
    // `measureStagingDriftForModel` for why the trigger is read out of the
    // repository rather than out of the command that moved it.
    let staging = null;
    bestEffort("tracker", () => {
        staging = measureStagingDriftForModel();
    });
    // Nothing stands down here. A plugin-repo gate used to sit at this line and
    // govern CHURN and nothing else — the workbench root is fusion's own
    // repository, so a fusion developer's own edits were not counted as churn —
    // and it went with the heatmap on 2026-08-15, as its protected-path sibling
    // had gone on 2026-08-12. What is left is two measurements that were each
    // deliberately placed ahead of that gate, because each is anchored at the
    // workbench root and each was measured in this very repository. A third stood
    // beside them on the same footing until the session counters that were its
    // subject were removed on 2026-08-15. Nothing stands down in `guard.ts`
    // either: that stand-down went on 2026-08-16 with the last verdict it had to
    // suppress, so the divergence CLAUDE.md documented between the two hooks has
    // no remaining side. Both hooks now behave in fusion's own repository exactly
    // as they do in a consuming project, which is what makes a measurement taken
    // here representative of one taken anywhere.
    //
    // The reply is the only thing this hook says to the model, and it used to be
    // held until an advisory metric had finished: measured with `churn.json`
    // replaced by a non-empty directory, `{}` reached stdout and the agent was
    // told nothing (`260809-2045`). Both things that could swallow it are gone,
    // and the rule they established is not — nothing may run between these
    // measurements and `respond`. Joined rather than chosen between, for the same
    // reason.
    const parts = [coverage, staging];
    const context = parts.filter((s) => s !== null).join(" ");
    respond(context === "" ? undefined : context);
}
main().catch((err) => {
    // Fail open — PostToolUse must not interfere with the agent.
    //
    // `respond` goes first and the reporting after it, for the reason `guard.ts`
    // ends with and `lib/fail-open.ts` states in full: `emitEvent` writes under
    // `.guard-state/`, so the error class most likely to bring the tracker here is
    // the one that used to throw a second time inside this handler and leave
    // stdout empty.
    failOpen("tracker", err, () => respond(), () => emitEvent("guard_error", undefined, undefined, `Tracker error (fail-open): ${err}`));
});
