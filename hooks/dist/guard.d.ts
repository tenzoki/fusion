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
export {};
