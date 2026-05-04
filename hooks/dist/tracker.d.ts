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
export {};
