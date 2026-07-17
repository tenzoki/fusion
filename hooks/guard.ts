/**
 * Compliance Guard — PreToolUse hook for Claude Code.
 *
 * Intercepts Write/Edit/MultiEdit tool calls and checks them against:
 *   1. Halt state — if active, block ALL writes
 *   2. Protected paths — unconditionally blocked
 *   3. Decision-governed categories — escalated based on sensitivity
 *
 * Also intercepts Bash tool calls and DENIES branch/worktree-moving git
 * operations (git is reachable only via Bash, so this is a complete
 * choke-point against autonomous branch drift). See lib/git-branch-guard.ts.
 *
 * Ported from fusion/reactor/pkg/guard/decision_guard.go.
 *
 * Protocol: reads JSON from stdin, writes JSON to stdout.
 *   Allow: {}
 *   Block: {"decision":"block","reason":"..."}
 */

import { resolve, relative, isAbsolute } from "node:path";
import { existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { matchesAny } from "./lib/paths.js";
import { isFusionPluginCwd } from "./lib/self-detect.js";
import { loadConfig, findRelevantDecisions, sensitivityLevel } from "./lib/config.js";
import type { Sensitivity } from "./lib/config.js";
import {
  loadEscalation,
  saveEscalation,
  isHalted,
  recordBlock,
  resetBlockCounter,
} from "./lib/escalation.js";
import { emitEvent } from "./lib/events.js";
import {
  classifyGitCommand,
  overridesFromEnv,
  overrideEnvFor,
} from "./lib/git-branch-guard.js";
import type { CheckoutResolver } from "./lib/git-branch-guard.js";

/**
 * Real filesystem + git-ref resolver for the ambiguous bare-`git checkout
 * <target>` form. Resolves paths and refs in the effective cwd (process cwd
 * plus any `-C <dir>` global options, applied in order — the same directory
 * git itself would use). Fails safe: any error → treat as "not a path / not a
 * ref", which fails the ALLOW conditions and lets the classifier deny.
 */
function effectiveCwd(cwdHints: string[]): string {
  let dir = process.cwd();
  for (const hint of cwdHints) dir = resolve(dir, hint);
  return dir;
}

const checkoutResolver: CheckoutResolver = {
  pathExists(target: string, cwdHints: string[]): boolean {
    try {
      return existsSync(resolve(effectiveCwd(cwdHints), target));
    } catch {
      return false;
    }
  },
  isRef(target: string, cwdHints: string[]): boolean {
    try {
      // Exit 0 (+ prints the resolved object) iff target is a valid ref/object.
      // stdio ignored; execFileSync throws on any non-zero exit → not a ref.
      execFileSync(
        "git",
        ["-C", effectiveCwd(cwdHints), "rev-parse", "--verify", "--quiet", target],
        { stdio: "ignore" },
      );
      return true;
    } catch {
      return false;
    }
  },
};

/** Hook input from Claude Code (PreToolUse). */
interface HookInput {
  session_id: string;
  hook_event_name: string;
  tool_name: string;
  tool_input: Record<string, unknown>;
}

/**
 * Normalize a file path to be relative to the project root (CWD).
 *
 * Claude Code sends absolute paths in tool_input.file_path, but the
 * guard config uses relative glob patterns (e.g. ".claude/agents/**").
 * This function strips the CWD prefix so patterns match correctly.
 */
function normalizeToRelative(filePath: string): string {
  if (!isAbsolute(filePath)) {
    return filePath;
  }
  const cwd = process.cwd();
  const resolved = resolve(filePath);
  // Only relativize if the path is under CWD
  if (resolved.startsWith(cwd + "/") || resolved === cwd) {
    return relative(cwd, resolved);
  }
  // Path is outside project root — return as-is (won't match any relative pattern)
  return filePath;
}

/** Extract the file path from tool input, if present. */
function extractFilePath(toolInput: Record<string, unknown>): string | null {
  // Write and Edit use "file_path"
  if (typeof toolInput.file_path === "string") {
    return toolInput.file_path;
  }
  // NotebookEdit uses "notebook_path"
  if (typeof toolInput.notebook_path === "string") {
    return toolInput.notebook_path;
  }
  // Bash has "command" — no file path to guard
  return null;
}

/** Determine if a change category should escalate at a given sensitivity. */
function shouldEscalate(sensitivity: Sensitivity): boolean {
  // Only block on high sensitivity. Low and medium emit advisory events
  // (logged by the tracker) but allow the write through.
  return sensitivity === "high";
}

function allow(): void {
  process.stdout.write("{}\n");
}

function block(reason: string): void {
  process.stdout.write(JSON.stringify({ decision: "block", reason }) + "\n");
}

/**
 * Guard a Bash tool call against the git branch-switch policy.
 *
 * Classifies the command (segmenting on ; && || | and inspecting subshells)
 * and DENIES any branch/worktree-moving git operation unless the matching
 * env override is set. Follows the same block/escalation/event pattern as the
 * write-tool checks. When an override allows a normally-denied command, the
 * call is allowed AND an override-used note is recorded for visibility.
 */
function guardBashCommand(
  input: HookInput,
  config: ReturnType<typeof loadConfig>,
): void {
  const command =
    typeof input.tool_input.command === "string"
      ? input.tool_input.command
      : "";

  const overrides = overridesFromEnv(process.env);
  const verdict = classifyGitCommand(command, overrides, checkoutResolver);

  // Override path: a normally-denied command was allowed by an env flag.
  if (verdict.overrideUsed && verdict.overrideKind) {
    const envVar = overrideEnvFor(verdict.overrideKind);
    const detail =
      `Override ${envVar} allowed normally-denied git op: ${verdict.overrideSegment ?? command}`;
    // Record the override in guard-state for visibility (same state surface
    // the block path writes to — recentEvents in escalation.json + events.jsonl).
    const escalation = loadEscalation();
    escalation.recentEvents.push({
      level: "clear",
      trigger: "git_branch_switch_override",
      message: detail,
      timestamp: new Date().toISOString(),
      toolName: "Bash",
    });
    saveEscalation(escalation);
    emitEvent("guard_advisory", "Bash", undefined, detail);
    allow();
    return;
  }

  // Deny path: a branch/worktree-moving git op with no override.
  if (verdict.deny) {
    const escalation = loadEscalation();
    const halted = recordBlock(
      escalation,
      config.escalation.blocksBeforeHalt,
      "git_branch_switch",
      verdict.reason ?? "",
      "Bash",
      verdict.offendingSegment,
    );
    saveEscalation(escalation);
    emitEvent(
      halted ? "guard_halt" : "guard_block",
      "Bash",
      undefined,
      `Git branch-switch denied: ${verdict.offendingSegment ?? command}`,
    );
    block(verdict.reason ?? "fusion policy: agents never switch git branches autonomously.");
    return;
  }

  // Allow path: not a branch/worktree-moving git op. The Bash path is NOT a
  // write-guard concern, so it participates in NONE of the write-guard
  // bookkeeping. An innocuous Bash call (ls, git status, an allowed
  // `git checkout HEAD -- <files>`) must have zero side-effect on guard state:
  //   - It MUST NOT reset the consecutive-block counter. Agents run Bash
  //     constantly between write attempts; resetting here would let any
  //     interleaved Bash zero the counter and defeat the write/branch halt
  //     escalation (see issue 260707-0750).
  //   - It MUST NOT emit a guard_allow event. One append per Bash call floods
  //     events.jsonl and buries the guard_block/guard_halt/guard_advisory
  //     entries the monitor exists to surface (see issue 260707-0751).
  // Only genuine forward progress on the guarded write surface (the write-tool
  // allow path below) resets the counter and emits guard_allow.
  allow();
}

async function main(): Promise<void> {
  // Read hook input from stdin
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk as Buffer);
  }
  const raw = Buffer.concat(chunks).toString("utf-8").trim();

  if (!raw) {
    allow();
    return;
  }

  let input: HookInput;
  try {
    input = JSON.parse(raw) as HookInput;
  } catch {
    allow(); // Unparseable input — fail open
    return;
  }

  // Tools this guard inspects: write operations + Bash (for the git
  // branch-switch policy). Everything else is allowed unconditionally.
  const writeTools = ["Write", "Edit", "MultiEdit", "NotebookEdit"];
  const isWriteTool = writeTools.includes(input.tool_name);
  const isBash = input.tool_name === "Bash";
  if (!isWriteTool && !isBash) {
    allow();
    return;
  }

  const config = loadConfig();

  // Guard disabled
  if (!config.guard.enabled) {
    allow();
    return;
  }

  // Bash branch: git branch-switch policy (deterministic choke-point).
  // Runs unconditionally when the guard is enabled — INCLUDING in the fusion
  // plugin's own repo. This hook only ever gated the AGENT's Bash tool calls;
  // a human developer switches branches in their own terminal, which the hook
  // never sees. Standing the branch policy down for the plugin repo therefore
  // removed agent protection for zero human benefit (the branch-switch hole).
  // The override env vars (FUSION_ALLOW_BRANCH_SWITCH / FUSION_ALLOW_WORKTREE)
  // remain the deliberate escape hatch for a fusion developer who genuinely
  // wants an agent to switch branches here.
  if (isBash) {
    guardBashCommand(input, config);
    return;
  }

  // Self-detect: if cwd is the fusion plugin's own repo, stand the WRITE guard
  // down. The protected paths (agents/**, rules/**, plugin.json, etc.) are the
  // very files a fusion developer needs to edit. Only write tools reach here —
  // the branch-switch policy above already ran and is intentionally NOT disabled.
  if (isFusionPluginCwd()) {
    emitEvent(
      "guard_allow",
      input.tool_name,
      extractFilePath(input.tool_input) ?? undefined,
      "Self-detect: cwd is fusion plugin repo — write guard standing down",
    );
    allow();
    return;
  }

  const rawFilePath = extractFilePath(input.tool_input);
  if (!rawFilePath) {
    allow(); // No file path to guard
    return;
  }

  // Normalize absolute paths to relative (so glob patterns in config match)
  const filePath = normalizeToRelative(rawFilePath);

  const escalation = loadEscalation();

  // CHECK 1: Halt mode — block everything
  if (isHalted(escalation)) {
    const pluginRoot = process.env.CLAUDE_PLUGIN_ROOT ?? "<plugin-dir>";
    const reason =
      "[HALTED] All write operations blocked. " +
      "The guard has been halted after repeated violations. " +
      `Run: node ${pluginRoot}/hooks/dist/clear-halt.js to reset.`;
    emitEvent("guard_halt", input.tool_name, filePath, "Halt active — blocked");
    block(reason);
    return;
  }

  // CHECK 2: Protected paths — unconditional block
  if (matchesAny(filePath, config.guard.protectedPaths)) {
    const reason = `Protected path: ${filePath} cannot be modified directly. This path is under compliance guard protection.`;

    const halted = recordBlock(
      escalation,
      config.escalation.blocksBeforeHalt,
      "protected_path",
      reason,
      input.tool_name,
      filePath,
    );
    saveEscalation(escalation);

    emitEvent(
      halted ? "guard_halt" : "guard_block",
      input.tool_name,
      filePath,
      "Protected path",
    );
    block(reason);
    return;
  }

  // CHECK 3: Decision-governed categories
  const relevant = findRelevantDecisions(filePath, config);

  if (relevant.length > 0) {
    // Find highest sensitivity among matched categories
    let highestSensitivity = config.guard.defaultSensitivity;
    for (const d of relevant) {
      const catSens = config.guard.categorySensitivity[d.category];
      if (catSens && sensitivityLevel(catSens) > sensitivityLevel(highestSensitivity)) {
        highestSensitivity = catSens;
      }
    }

    if (shouldEscalate(highestSensitivity)) {
      const decisionList = relevant
        .map((d) => `  [${d.id}] ${d.category}: ${d.statement}`)
        .join("\n");

      const reason =
        `Modification to ${filePath} affects area governed by ${relevant.length} decision(s):\n` +
        `${decisionList}\n\n` +
        `Sensitivity: ${highestSensitivity}. Review the decision(s) above before proceeding.`;

      const halted = recordBlock(
        escalation,
        config.escalation.blocksBeforeHalt,
        "decision_governed",
        reason,
        input.tool_name,
        filePath,
      );
      saveEscalation(escalation);

      emitEvent(
        halted ? "guard_halt" : "guard_block",
        input.tool_name,
        filePath,
        `Decision: ${relevant.map((d) => d.id).join(", ")}`,
      );
      block(reason);
      return;
    }

    // Low/medium sensitivity: emit advisory event but allow the write
    if (highestSensitivity !== "none") {
      emitEvent(
        "guard_advisory",
        input.tool_name,
        filePath,
        `Advisory (${highestSensitivity}): ${relevant.map((d) => d.id).join(", ")}`,
      );
    }
  }

  // ALLOW — no rule matched, reset consecutive blocks
  resetBlockCounter(escalation);
  saveEscalation(escalation);
  emitEvent("guard_allow", input.tool_name, filePath);
  allow();
}

main().catch((err) => {
  // Fail open on unexpected errors — don't block the agent
  emitEvent("guard_error", undefined, undefined, `Guard error (fail-open): ${err}`);
  process.stderr.write(`[guard] Error: ${err}\n`);
  allow();
});
