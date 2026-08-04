/**
 * Compliance Guard — PostToolUse hook for Claude Code.
 *
 * Observes all tool completions (Write/Edit/MultiEdit/Bash) and records
 * file mutations in the churn heatmap. When churn reaches critical
 * thresholds, emits warning/critical events.
 *
 * PostToolUse hooks are observation-only — they cannot block tool calls.
 * Always writes {} to stdout (no-op response).
 *
 * Protocol: reads JSON from stdin, writes {} to stdout.
 */

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

/**
 * Workbench dashboard/state files that the orchestrator continuously
 * rewrites by design. Tracking them as churn or ping-back produces
 * pure noise — exclude from both metrics.
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

function respond(): void {
  process.stdout.write("{}\n");
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

  // Self-detect: skip churn tracking when cwd is fusion's own repo.
  // Plugin development edits are not meaningful churn signal.
  if (isFusionPluginCwd()) {
    respond();
    return;
  }

  // Only track write operations for churn
  const writeTools = ["Write", "Edit", "MultiEdit", "NotebookEdit"];
  if (!writeTools.includes(input.tool_name)) {
    // For Bash, we just emit a tracker_record event and return
    if (input.tool_name === "Bash") {
      emitEvent("tracker_record", "Bash", undefined, "Bash command observed");
    }
    respond();
    return;
  }

  const rawFilePath = extractFilePath(input.tool_input);
  if (!rawFilePath) {
    respond();
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
    respond();
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

  respond();
}

main().catch((err) => {
  // Fail open — PostToolUse must not interfere with the agent
  emitEvent("guard_error", undefined, undefined, `Tracker error (fail-open): ${err}`);
  process.stderr.write(`[tracker] Error: ${err}\n`);
  respond();
});
