/**
 * Compliance Guard — PostToolUse hook for Claude Code.
 *
 * Three jobs, in this order:
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
 *   1. MEASURE THE PROTECTED PATHS. Take a second fingerprint of every path on
 *      `guard.protectedPaths` and compare it with the one `guard.ts` recorded
 *      before the tool ran. Anything that changed is written back to what the
 *      before-fingerprint holds, the guard is halted, and the model is told
 *      which file and why. This is the guard's actual enforcement of those
 *      paths, and it replaced a classifier that tried to predict, from a shell
 *      command's text, which files the command would write. See
 *      lib/protected-snapshot.ts.
 *   2. CHURN. Record write-tool file mutations in the churn heatmap, emitting
 *      warning/critical events at the configured per-session thresholds.
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
 * ## The reply is written before anything records it
 *
 * The enforcement — the restore — has to happen first; it is what the sentence
 * is about. Everything after that is a report: the `guard_block` rows, the halt
 * record, the churn heatmap. Each goes through `answer` or `bestEffort` from
 * lib/fail-open.ts, so none of them can discard the sentence on its way out. The
 * churn half used to run ahead of the reply and did exactly that; that module's
 * header carries the class and the measurements.
 *
 * Protocol: reads JSON from stdin, writes {} to stdout, or a
 * `hookSpecificOutput.additionalContext` envelope when something was restored.
 */
import { resolve, sep } from "node:path";
import { analyzeChurn, churnKey, loadChurn, recordChange, saveChurn, } from "./lib/churn.js";
import { loadConfig, projectDeclaredProtectedPaths } from "./lib/config.js";
import { matchesAny } from "./lib/paths.js";
import { isFusionPluginCwd } from "./lib/self-detect.js";
import { emitEvent } from "./lib/events.js";
import { answer, bestEffort, failOpen } from "./lib/fail-open.js";
import { loadEscalation, raiseHalt, saveEscalation, clearHaltCommand, } from "./lib/escalation.js";
import { ABSENT, consumeSnapshot, diffSnapshots, measurementRoot, restore, takeSnapshot, } from "./lib/protected-snapshot.js";
import { preserveObserved } from "./lib/reverted-copy.js";
import { projectRelative } from "./lib/project-relative.js";
import { findWorkbenchRoot } from "./lib/workbench-root.js";
import { foldCase } from "./lib/paths.js";
import { isObservedRulePath, rulesWriteDetail, rulesWriteExemptionActive, } from "./lib/rules-write-exemption.js";
import { driftSentence, lastReported, measureStateDrift, recordReported, } from "./lib/state-drift.js";
import { coverageSentence, lastReportedCoverage, measureReviewCoverage, recordReportedCoverage, } from "./lib/review-coverage.js";
import { headMoved, measureStagingDrift, readStagingState, stagingSentence, writeStagingState, } from "./lib/staging-drift.js";
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
function restorePath(root, change) {
    try {
        restore(root, change);
        return null;
    }
    catch (err) {
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
function preserve(root, rel, observed) {
    try {
        return { path: preserveObserved(root, rel, observed), error: null };
    }
    catch (err) {
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
function narrowingTarget(input, root) {
    if (!WRITE_TOOLS.includes(input.tool_name))
        return null;
    const raw = extractFilePath(input.tool_input);
    if (raw === null)
        return null;
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
function describe(outcome, toolName) {
    const { change, verdict, reason, preserved, sparedBy } = outcome;
    const what = change.kind === "created"
        ? "was created"
        : change.kind === "deleted"
            ? "was deleted"
            : "was modified";
    // For a path that did not exist before, "put back" is a deletion. Saying
    // "restored" there would describe the file as recovered when it is gone.
    const undone = change.kind === "created"
        ? "has been removed again — it did not exist before this tool call"
        : "has been restored to its content from before this tool call";
    // Three states, and the empty one is the deleted-path case: there were no
    // observed bytes to keep, and the revert brought the content back rather than
    // destroying any.
    const kept = preserved.path !== null
        ? ` The content it carried is preserved at ${preserved.path}.`
        : preserved.error !== null
            ? ` Its content could NOT be preserved: ${preserved.error}.`
            : "";
    if (verdict === "left-in-place") {
        return (`${change.path} ${what}, and this ${toolName} call names ${sparedBy} — a different path — ` +
            `so the change was NOT written back and is still on disk.${kept}`);
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
function splitOffExempted(changes, config) {
    if (!rulesWriteExemptionActive(process.env)) {
        return { exempted: [], violations: changes };
    }
    const declared = projectDeclaredProtectedPaths(config);
    const exempted = [];
    const violations = [];
    for (const change of changes) {
        if (isObservedRulePath(change.path, declared))
            exempted.push(change.path);
        else
            violations.push(change);
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
function measureProtectedPaths(input) {
    const toolName = input.tool_name;
    const config = loadConfig();
    if (!config.guard.enabled)
        return null;
    const root = measurementRoot();
    if (root === null)
        return null;
    const before = consumeSnapshot();
    if (!before)
        return null;
    // Held in a name rather than passed straight through, because it is the one
    // record of what each protected path was OBSERVED to hold during this call.
    // Anything downstream that needs that value reads it from here; going back to
    // the file would be a second answer to one question, free to disagree with the
    // one the comparison used — the same reason `ProtectedChange` carries `before`
    // instead of looking it up again.
    const after = takeSnapshot(root, config.guard.protectedPaths);
    const changes = diffSnapshots(before, after);
    if (changes.length === 0)
        return null;
    const { exempted, violations } = splitOffExempted(changes, config);
    // The same note the write-tool path records when the flag lets a write
    // through, from the same function, so `events.jsonl` reads identically
    // whichever route the write took. No escalation entry is pushed here: for a
    // write-tool call `guard.ts` already recorded this grant on the PreToolUse
    // side of the very same call, and a second entry would count one permission
    // twice.
    if (exempted.length > 0) {
        // Best effort, and this one stands AHEAD of the restore: a throw here used
        // to skip the enforcement entirely, leaving a protected path rewritten with
        // no revert, no halt and nothing said — a worse outcome than the lost
        // sentence the same class produces further down.
        bestEffort("tracker", () => emitEvent("guard_advisory", toolName, exempted.length === 1 ? exempted[0] : undefined, rulesWriteDetail(exempted)));
    }
    // Every changed path was one the flag covers: nothing to restore, nothing to
    // halt, and the advisory above is the whole record.
    if (violations.length === 0)
        return null;
    const spared = narrowingTarget(input, root);
    const outcomes = violations.map((change) => {
        // Kept first, and from the after-snapshot rather than from the file: this is
        // the last moment the observed content still exists anywhere.
        const preserved = preserve(root, change.path, after.paths[change.path] ?? ABSENT);
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
        bestEffort("tracker", () => emitEvent("guard_block", toolName, outcome.change.path, describe(outcome, toolName)));
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
    raiseHalt(escalation, "protected_path_measured", `Protected path changed during a ${toolName} call — ${summary}`, toolName, outcomes.length === 1 ? outcomes[0].change.path : undefined);
    // The one best-effort step whose RESULT is read, and the one report that
    // legitimately runs before the reply. `260809-2045` asked whether this write
    // should be best effort at all: yes — an unwritable state directory must cost
    // the halt record and not the sentence, because the sentence is what stops an
    // agent working around a change it cannot explain (see this file's header).
    // But the sentence would then claim a halt that was never written, so the
    // failure is carried into the wording rather than swallowed under it.
    const haltError = bestEffort("tracker", () => saveEscalation(escalation));
    bestEffort("tracker", () => emitEvent("guard_halt", toolName, undefined, `Halt raised by the protected-path measurement (${outcomes.length} path(s) changed)`));
    // The `cd` is not decoration: the halt was just recorded under `root`, and the
    // clearing script locates it by walking up from its own working directory. Run
    // from anywhere else it reports "not halted" and clears nothing — see
    // `clearHaltCommand` in lib/escalation.ts.
    //
    // With no halt on disk there is nothing for that script to clear, so the
    // second branch names the state directory as the thing to fix instead. What
    // the agent must DO is identical either way, which is why the two branches
    // differ only in the two clauses that would otherwise be false.
    const halt = haltError === null
        ? "The guard is now HALTED, so all write tools are blocked. "
        : `The halt could NOT be recorded (${haltError}), so write tools are NOT ` +
            "blocked and the guard's own state directory is unwritable. Treat this " +
            "as a stop regardless, and tell the user their guard state is broken. ";
    const resume = haltError === null
        ? "To resume afterwards, run this from the project directory — the halt is " +
            "recorded there and the script finds it by walking up from its working " +
            `directory: ${clearHaltCommand()}`
        : "There is no halt to clear.";
    return ("fusion guard: a protected path changed during this tool call. " +
        summary +
        " What the guard measures is the window around the call, not who wrote in " +
        "it: your own tool call, the user saving in their editor, a file watcher " +
        "and a second session are indistinguishable here, so this may not have " +
        "been you. " +
        halt +
        "Do not try to reapply the change or route around this. " +
        "These paths are a human decision: tell the user what you were trying to do " +
        "and why, and let them make the change or adjust guard.protectedPaths in the " +
        "project's fusion-guard.json. " +
        resume);
}
/* ------------------------------------------------------------------ *
 * Churn
 * ------------------------------------------------------------------ */
/**
 * The heatmap half of this hook, unchanged in substance.
 *
 * Split out of `main` so the measurement above can run for EVERY guarded tool
 * call while this part keeps its own early returns. Before the split, every
 * `return` here was also the hook's reply; now the reply is written once, in
 * `main`, and carries whatever the measurement had to say.
 *
 * It runs AFTER that reply, as a guarded report. This is an advisory heatmap:
 * its `loadConfig`, its `emitEvent` calls and its `saveChurn` can each throw,
 * and none of them may cost the sentence explaining a reverted protected path.
 */
function trackChurn(input) {
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
    // The key is anchored to the WORKBENCH ROOT, not to the session's working
    // directory. It used to be cwd-relative when the path fell inside cwd and raw
    // absolute otherwise, so one file collected one counter per directory a
    // session was ever started in — and the workbench-relative spelling that
    // produced never matched `TRACKER_NOISE_FILES` either, which is how
    // `tasklist.md` and `agentstate.yaml` came to be tracked as churn. `churnKey`
    // runs the same two steps as `narrowingTarget` above, so the heatmap and the
    // protected-path measurement read one path the same way (issue `260809-2023`,
    // decision `260810-0920`).
    const filePath = churnKey(rawFilePath, process.cwd(), findWorkbenchRoot());
    if (filePath === null) {
        // No workbench, or a path outside the root — a scratchpad, another clone.
        // Recorded as an observation, counted under no key: there is no spelling
        // for it under this anchor, and inventing one is what the anchor ended.
        emitEvent("tracker_record", input.tool_name, rawFilePath, "File change recorded (outside the workbench root, not tracked)");
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
            emitEvent("churn_critical", input.tool_name, filePath, `${warning.message}: ${warning.files.join(", ")}`);
        }
        else if (warning.level === "warning") {
            emitEvent("churn_warning", input.tool_name, filePath, `${warning.message}: ${warning.files.join(", ")}`);
        }
    }
    // Record the individual change event
    emitEvent("tracker_record", input.tool_name, filePath, "File change recorded");
    // Save updated churn state
    saveChurn(churn);
}
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
 *    developer's own edits are not counted as churn and not reverted as
 *    protected-path changes. Neither applies here: fusion's own repository is a
 *    fusion consumer with a live workbench, and every one of the six measured
 *    instances happened in it. Standing this down there would switch it off in
 *    the only project where it is known to be needed.
 * 3. **It reports once per divergence, not once per tool call.** The throttle
 *    compares the drift signature with the last one reported; a divergence that
 *    grows speaks again, one that merely persists stays quiet.
 */
function measureStateDriftForModel() {
    const root = findWorkbenchRoot();
    if (root === null)
        return null;
    const report = measureStateDrift(root);
    const seen = lastReported(root);
    if (report.signature === seen)
        return null;
    // Cleared as readily as it is set: when the orchestrator brings the surfaces
    // current the signature becomes "", the record is emptied, and a later drift
    // is reported afresh rather than being mistaken for the one already told.
    bestEffort("tracker", () => recordReported(root, report.signature));
    if (report.drifted.length === 0)
        return null;
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
function measureReviewCoverageForModel(input) {
    if (!WRITE_TOOLS.includes(input.tool_name))
        return null;
    const written = extractFilePath(input.tool_input);
    if (written === null)
        return null;
    const root = findWorkbenchRoot();
    if (root === null)
        return null;
    // Case-folded on the same helper the protected-path measurement uses, so a
    // case-insensitive file system does not decide whether this fires.
    const abs = foldCase(resolve(process.cwd(), written));
    const store = foldCase(resolve(root, "fusion-workbench"));
    if (!abs.startsWith(store + sep))
        return null;
    if (!abs.endsWith(".md"))
        return null;
    if (!abs.includes(sep + "reviews" + sep))
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
    // The session-state drift measurement, ahead of the stand-down below and
    // anchored at the workbench root rather than at cwd. Its own header says why
    // it is not stood down in fusion's own repository: that repository is a
    // fusion consumer, and all six measured instances of the freeze happened
    // there. `bestEffort` because a bookkeeping report may never cost the
    // protected-path sentence that follows it.
    let drift = null;
    bestEffort("tracker", () => {
        drift = measureStateDriftForModel();
    });
    // Review coverage, on the narrow trigger of a review file landing. Same
    // anchoring and the same reason for not standing down in fusion's own
    // repository; see `measureReviewCoverageForModel` for why its trigger is a
    // single act rather than every tool call.
    let coverage = null;
    bestEffort("tracker", () => {
        coverage = measureReviewCoverageForModel(input);
    });
    // Staging drift, on the measured trigger of HEAD having moved. Same anchoring
    // and the same reason for not standing down in fusion's own repository; see
    // `measureStagingDriftForModel` for why the trigger is read out of the
    // repository rather than out of the command that moved it.
    let staging = null;
    bestEffort("tracker", () => {
        staging = measureStagingDriftForModel();
    });
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
        const sentences = [drift, coverage, staging];
        const standDown = sentences.filter((t) => t !== null).join(" ");
        respond(standDown === "" ? undefined : standDown);
        return;
    }
    // The measurement runs on EVERY guarded tool call — Bash included, and before
    // the churn heatmap, which only ever looks at the write tools. A protected
    // path can change by any route, which is the whole point of measuring rather
    // than predicting.
    const measured = measureProtectedPaths(input);
    // The reply first, the heatmap after it. `measureProtectedPaths` has by now
    // restored the protected path and raised the halt; the only thing left to
    // deliver is the sentence naming the file and how a human clears it, and that
    // sentence used to be held until an advisory metric had finished. Measured
    // with `churn.json` replaced by a non-empty directory: `{}` on stdout, the
    // file reverted, `haltActive: true`, and the agent told nothing
    // (`260809-2045`). The tracker's header calls the explaining refusal a
    // constraint, and a revert the model never hears about violates it.
    // The protected-path sentence goes first when both have something to say: one
    // reports a file that was written back and a halt the user has to clear, the
    // other reports a number that is stale. Joined rather than chosen between,
    // because dropping either would be a silence.
    const parts = [measured, drift, coverage, staging];
    const context = parts.filter((s) => s !== null).join(" ");
    answer("tracker", () => respond(context === "" ? undefined : context), () => trackChurn(input));
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
