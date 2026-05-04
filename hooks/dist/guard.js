/**
 * Compliance Guard — PreToolUse hook for Claude Code.
 *
 * Intercepts Write/Edit/MultiEdit tool calls and checks them against:
 *   1. Halt state — if active, block ALL writes
 *   2. Protected paths — unconditionally blocked
 *   3. Decision-governed categories — escalated based on sensitivity
 *
 * Ported from fusion/reactor/pkg/guard/decision_guard.go.
 *
 * Protocol: reads JSON from stdin, writes JSON to stdout.
 *   Allow: {}
 *   Block: {"decision":"block","reason":"..."}
 */
import { resolve, relative, isAbsolute } from "node:path";
import { matchesAny } from "./lib/paths.js";
import { isFusionPluginCwd } from "./lib/self-detect.js";
import { loadConfig, findRelevantDecisions, sensitivityLevel } from "./lib/config.js";
import { loadEscalation, saveEscalation, isHalted, recordBlock, resetBlockCounter, } from "./lib/escalation.js";
import { emitEvent } from "./lib/events.js";
/**
 * Normalize a file path to be relative to the project root (CWD).
 *
 * Claude Code sends absolute paths in tool_input.file_path, but the
 * guard config uses relative glob patterns (e.g. ".claude/agents/**").
 * This function strips the CWD prefix so patterns match correctly.
 */
function normalizeToRelative(filePath) {
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
function extractFilePath(toolInput) {
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
function shouldEscalate(sensitivity) {
    // Only block on high sensitivity. Low and medium emit advisory events
    // (logged by the tracker) but allow the write through.
    return sensitivity === "high";
}
function allow() {
    process.stdout.write("{}\n");
}
function block(reason) {
    process.stdout.write(JSON.stringify({ decision: "block", reason }) + "\n");
}
async function main() {
    // Read hook input from stdin
    const chunks = [];
    for await (const chunk of process.stdin) {
        chunks.push(chunk);
    }
    const raw = Buffer.concat(chunks).toString("utf-8").trim();
    if (!raw) {
        allow();
        return;
    }
    let input;
    try {
        input = JSON.parse(raw);
    }
    catch {
        allow(); // Unparseable input — fail open
        return;
    }
    // Only guard write operations
    const writeTools = ["Write", "Edit", "MultiEdit", "NotebookEdit"];
    if (!writeTools.includes(input.tool_name)) {
        allow();
        return;
    }
    const config = loadConfig();
    // Guard disabled
    if (!config.guard.enabled) {
        allow();
        return;
    }
    // Self-detect: if cwd is the fusion plugin's own repo, stand down.
    // The guard's protected paths (agents/**, rules/**, plugin.json, etc.)
    // are the very files a fusion developer needs to edit.
    if (isFusionPluginCwd()) {
        emitEvent("guard_allow", input.tool_name, extractFilePath(input.tool_input) ?? undefined, "Self-detect: cwd is fusion plugin repo — guard standing down");
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
        const reason = "[HALTED] All write operations blocked. " +
            "The guard has been halted after repeated violations. " +
            `Run: node ${pluginRoot}/hooks/dist/clear-halt.js to reset.`;
        emitEvent("guard_halt", input.tool_name, filePath, "Halt active — blocked");
        block(reason);
        return;
    }
    // CHECK 2: Protected paths — unconditional block
    if (matchesAny(filePath, config.guard.protectedPaths)) {
        const reason = `Protected path: ${filePath} cannot be modified directly. This path is under compliance guard protection.`;
        const halted = recordBlock(escalation, config.escalation.blocksBeforeHalt, "protected_path", reason, input.tool_name, filePath);
        saveEscalation(escalation);
        emitEvent(halted ? "guard_halt" : "guard_block", input.tool_name, filePath, "Protected path");
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
            const reason = `Modification to ${filePath} affects area governed by ${relevant.length} decision(s):\n` +
                `${decisionList}\n\n` +
                `Sensitivity: ${highestSensitivity}. Review the decision(s) above before proceeding.`;
            const halted = recordBlock(escalation, config.escalation.blocksBeforeHalt, "decision_governed", reason, input.tool_name, filePath);
            saveEscalation(escalation);
            emitEvent(halted ? "guard_halt" : "guard_block", input.tool_name, filePath, `Decision: ${relevant.map((d) => d.id).join(", ")}`);
            block(reason);
            return;
        }
        // Low/medium sensitivity: emit advisory event but allow the write
        if (highestSensitivity !== "none") {
            emitEvent("guard_advisory", input.tool_name, filePath, `Advisory (${highestSensitivity}): ${relevant.map((d) => d.id).join(", ")}`);
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
