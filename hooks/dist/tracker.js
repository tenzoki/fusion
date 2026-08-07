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
import { loadCrossFile, saveCrossFile, recordEdit, analyzeCrossFile, } from "./lib/cross-file.js";
import { loadConfig, projectDeclaredProtectedPaths } from "./lib/config.js";
import { matchesAny } from "./lib/paths.js";
import { isFusionPluginCwd } from "./lib/self-detect.js";
import { emitEvent } from "./lib/events.js";
import { loadEscalation, raiseHalt, saveEscalation, clearHaltCommand, } from "./lib/escalation.js";
import { diffSnapshots, loadSnapshot, measurementRoot, restore, takeSnapshot, } from "./lib/protected-snapshot.js";
import { isObservedRulePath, rulesWriteDetail, rulesWriteExemptionActive, } from "./lib/rules-write-exemption.js";
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
/** One human sentence per outcome, for the model and for the event log. */
function describe(outcome) {
    const { change, restored, reason } = outcome;
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
    return restored
        ? `${change.path} ${what} and ${undone}.`
        : `${change.path} ${what} and could NOT be restored: ${reason}. The change is still on disk.`;
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
 * one violation. The snapshot is missing only when the guard was disabled, when
 * the project has no workbench, or in the plugin's own repository, and in all
 * three the answer "nothing was measured" is correct.
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
 * `guard.ts` writes one snapshot file and `tracker.ts` reads it. Two tool calls
 * running concurrently interleave those writes, so a change can be attributed to
 * the wrong call or, if the second snapshot is taken after the first tool
 * already wrote, missed. Claude Code offers no per-call correlation key in the
 * hook payload, so this is stated rather than solved. A change that IS seen is
 * always a real change to a protected path, so the revert is never wrong when it
 * fires; the exposure is under-reporting.
 */
function measureProtectedPaths(toolName) {
    const config = loadConfig();
    if (!config.guard.enabled)
        return null;
    const root = measurementRoot();
    if (root === null)
        return null;
    const before = loadSnapshot();
    if (!before)
        return null;
    const changes = diffSnapshots(before, takeSnapshot(root, config.guard.protectedPaths));
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
        emitEvent("guard_advisory", toolName, exempted.length === 1 ? exempted[0] : undefined, rulesWriteDetail(exempted));
    }
    // Every changed path was one the flag covers: nothing to restore, nothing to
    // halt, and the advisory above is the whole record.
    if (violations.length === 0)
        return null;
    const outcomes = violations.map((change) => {
        const reason = restorePath(root, change);
        return { change, restored: reason === null, reason: reason ?? "" };
    });
    // One `guard_block` per changed path, carrying the file and the cause, so a
    // reader of `events.jsonl` can see WHICH files moved rather than only that
    // something did.
    for (const outcome of outcomes) {
        emitEvent("guard_block", toolName, outcome.change.path, describe(outcome));
    }
    // The halt is raised outright, not counted toward the three-block threshold.
    // A protected path was actually written; there is no "two more of these" to
    // wait for. See `raiseHalt` in lib/escalation.ts.
    const summary = outcomes.map(describe).join(" ");
    const escalation = loadEscalation();
    raiseHalt(escalation, "protected_path_measured", `Protected path changed during a ${toolName} call — ${summary}`, toolName, outcomes.length === 1 ? outcomes[0].change.path : undefined);
    saveEscalation(escalation);
    emitEvent("guard_halt", toolName, undefined, `Halt raised by the protected-path measurement (${outcomes.length} path(s) changed)`);
    // The `cd` is not decoration: the halt was just recorded under `root`, and the
    // clearing script locates it by walking up from its own working directory. Run
    // from anywhere else it reports "not halted" and clears nothing — see
    // `clearHaltCommand` in lib/escalation.ts.
    return ("fusion guard: a protected path changed during this tool call. " +
        summary +
        " The guard is now HALTED, so all write tools are blocked. " +
        "Do not try to reapply the change or route around this. " +
        "These paths are a human decision: tell the user what you were trying to do " +
        "and why, and let them make the change or adjust guard.protectedPaths in the " +
        "project's fusion-guard.json. " +
        "To resume afterwards, run this from the project directory — the halt is " +
        "recorded there and the script finds it by walking up from its working " +
        `directory: ${clearHaltCommand()}`);
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
function trackChurn(input) {
    // Only track write operations for churn
    const writeTools = ["Write", "Edit", "MultiEdit", "NotebookEdit"];
    if (!writeTools.includes(input.tool_name)) {
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
            emitEvent("churn_critical", input.tool_name, filePath, `${warning.message}: ${warning.files.join(", ")}`);
        }
        else if (warning.level === "warning") {
            emitEvent("churn_warning", input.tool_name, filePath, `${warning.message}: ${warning.files.join(", ")}`);
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
            emitEvent("cross_file_critical", input.tool_name, filePath, `${w.message}: ${w.files.join(", ")}`);
        }
        else if (w.level === "warning") {
            emitEvent("cross_file_warning", input.tool_name, filePath, `${w.message}: ${w.files.join(", ")}`);
        }
    }
    // Record the individual change event
    emitEvent("tracker_record", input.tool_name, filePath, "File change recorded");
    // Save updated churn state
    saveChurn(churn);
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
    const measured = measureProtectedPaths(input.tool_name);
    trackChurn(input);
    respond(measured ?? undefined);
}
main().catch((err) => {
    // Fail open — PostToolUse must not interfere with the agent
    emitEvent("guard_error", undefined, undefined, `Tracker error (fail-open): ${err}`);
    process.stderr.write(`[tracker] Error: ${err}\n`);
    respond();
});
