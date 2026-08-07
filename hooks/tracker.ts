/**
 * Compliance Guard — PostToolUse hook for Claude Code.
 *
 * Two jobs, in this order:
 *
 *   1. MEASURE THE PROTECTED PATHS. Take a second fingerprint of every path on
 *      `guard.protectedPaths` and compare it with the one `guard.ts` recorded
 *      before the tool ran. Anything that changed is restored from git, the
 *      guard is halted, and the model is told which file and why. This is the
 *      guard's actual enforcement of those paths, and it replaced a classifier
 *      that tried to predict, from a shell command's text, which files the
 *      command would write. See lib/protected-snapshot.ts.
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

import { spawnSync } from "node:child_process";
import { resolve, relative, isAbsolute } from "node:path";
import { loadChurn, saveChurn, recordChange, analyzeChurn } from "./lib/churn.js";
import {
  loadCrossFile,
  saveCrossFile,
  recordEdit,
  analyzeCrossFile,
} from "./lib/cross-file.js";
import { loadConfig } from "./lib/config.js";
import { matchesAny } from "./lib/paths.js";
import { isFusionPluginCwd } from "./lib/self-detect.js";
import { emitEvent } from "./lib/events.js";
import { loadEscalation, raiseHalt, saveEscalation } from "./lib/escalation.js";
import { diffSnapshots, loadSnapshot, takeSnapshot } from "./lib/protected-snapshot.js";
import type { ProtectedChange } from "./lib/protected-snapshot.js";

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

/** What happened to one protected path that changed during this tool call. */
interface RevertOutcome {
  change: ProtectedChange;
  /** True when git put the file back the way it was committed. */
  restored: boolean;
  /** Why not, when `restored` is false. Empty otherwise. */
  reason: string;
}

/**
 * Put one path back from `HEAD`.
 *
 * ## Attempting is the test
 *
 * There is no separate "does git know this path?" query, on purpose. A
 * predicate followed by an action is two answers to one question that can
 * disagree — the file can be untracked in the predicate's reading and tracked
 * in git's, or the repository can be absent, or `HEAD` can be unborn in a fresh
 * repository. `git checkout HEAD -- <path>` already asks exactly the right
 * question and answers it with an exit status, so that status IS the branch.
 *
 * ## A path git does not know is never rolled back
 *
 * It reports and halts instead, naming the missing versioning as the cause. That
 * covers three situations with one rule: the file is untracked, the file was
 * newly CREATED by this tool call (which is the same thing — `HEAD` has no
 * content to restore), or the project is not a git repository at all. In each,
 * `git checkout` writes nothing and exits non-zero.
 *
 * A silent failure here would be the worst outcome available: the guard would
 * report a violation as handled while the modified file stayed modified. So the
 * status is read, the stderr is kept, and both reach the model.
 *
 * ## The one case where reverting to HEAD is coarser than the snapshot
 *
 * The measurement knows the file's state BEFORE the tool call; git knows its
 * state at HEAD. Those differ when a human had staged or working-tree changes to
 * a protected file that the agent then overwrote — restoring HEAD discards the
 * human's version along with the agent's. Restoring the before-content exactly
 * would need the snapshot to carry content rather than digests. The revert
 * mechanism is fixed by this Circle's plan, so the gap is filed rather than
 * fixed here:
 * `circles/260807-0923-guard-misst-statt-orakelt/issues/260807-1026_o_rueckrollen-auf-head-kann-menschliche-vorarbeit-verwerfen.md`.
 *
 * `spawnSync`, not `execFileSync`: a non-zero exit is an expected branch of this
 * function, not an exception to be caught and re-derived.
 */
function revertFromHead(root: string, rel: string): string | null {
  const run = spawnSync("git", ["checkout", "HEAD", "--", rel], {
    cwd: root,
    encoding: "utf-8",
  });
  if (run.error) return `git could not be run (${String(run.error)})`;
  if (run.status !== 0) {
    const stderr = (run.stderr ?? "").trim().split("\n")[0] ?? "";
    return `not known to git at HEAD${stderr === "" ? "" : ` (${stderr})`}`;
  }
  return null;
}

/** One human sentence per outcome, for the model and for the event log. */
function describe(outcome: RevertOutcome): string {
  const { change, restored, reason } = outcome;
  const what =
    change.kind === "created"
      ? "was created"
      : change.kind === "deleted"
        ? "was deleted"
        : "was modified";
  return restored
    ? `${change.path} ${what} and has been restored from git.`
    : `${change.path} ${what} and could NOT be restored: ${reason}. The change is still on disk.`;
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
function measureProtectedPaths(toolName: string): string | null {
  const config = loadConfig();
  if (!config.guard.enabled) return null;

  const before = loadSnapshot();
  if (!before) return null;

  const root = process.cwd();
  const changes = diffSnapshots(
    before,
    takeSnapshot(root, config.guard.protectedPaths),
  );
  if (changes.length === 0) return null;

  // STEP 3 OF THIS CIRCLE'S PLAN WIRES THE RULES-WRITE EXEMPTION IN HERE.
  // Until it lands, a write that `FUSION_ALLOW_RULES_WRITE` legitimately let
  // through on the write-tool path is measured and reverted by this function.
  // That is a real regression for the duration of one plan step, and it is
  // written down rather than left to be discovered: the exemption needs its own
  // narrower entry point for an OBSERVED path (gate 1 and gate 1b only), which
  // is exactly what step 3 adds.

  const outcomes: RevertOutcome[] = changes.map((change) => {
    const reason = revertFromHead(root, change.path);
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

  const pluginRoot = process.env.CLAUDE_PLUGIN_ROOT ?? "<plugin-dir>";
  return (
    "fusion guard: a protected path changed during this tool call. " +
    summary +
    " The guard is now HALTED, so all write tools are blocked. " +
    "Do not try to reapply the change or route around this. " +
    "These paths are a human decision: tell the user what you were trying to do " +
    "and why, and let them make the change or adjust guard.protectedPaths in the " +
    "project's fusion-guard.json. " +
    `To resume afterwards: node ${pluginRoot}/hooks/dist/clear-halt.js`
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

  // Self-detect: cwd is fusion's own repo. Both halves stand down together.
  //
  // The MEASUREMENT stands down for the same reason the write tools do: the
  // protected paths are `agents/**`, `rules/**`, `skills/**` and the plugin
  // manifest, which in this one repository are the work rather than the thing
  // being protected. Left active it would revert a fusion developer's own edits
  // on the next tool call, which is worse than useless — it destroys work.
  // `guard.ts` writes no snapshot here either, so there would be nothing to
  // compare against in any case; this is the explicit half of that pair.
  //
  // CHURN stands down because plugin development edits are not meaningful churn
  // signal. That reason is older and unrelated, and both are stated so a later
  // editor does not lift one gate believing it lifts the other's reason too.
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
