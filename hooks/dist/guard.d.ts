/**
 * Compliance Guard — PreToolUse hook for Claude Code.
 *
 * Intercepts Write/Edit/MultiEdit tool calls and checks them against:
 *   1. Halt state — if active, block ALL writes
 *   2. Protected paths — unconditionally blocked
 *   3. Decision-governed categories — escalated based on sensitivity
 *
 * Also intercepts Bash tool calls, for two independent policies:
 *   a. Branch policy — DENIES branch/worktree-moving git operations (git is
 *      reachable only via Bash, so this is a complete choke-point against
 *      autonomous branch drift). See lib/git-branch-guard.ts. Runs everywhere,
 *      including in the fusion plugin's own repo.
 *   b. Protected-path policy — DENIES file-mutating shell commands (mv, rm,
 *      cp, sed -i, redirection, …) whose written operands land on
 *      guard.protectedPaths, the same list check 2 above applies to the write
 *      tools. See lib/bash-mutation-guard.ts. This IS a write-guard concern
 *      and therefore stands down in the plugin's own repo, exactly as the
 *      write tools do.
 * The policies are INDEPENDENT in both directions: an env override that lifts
 * policy (a) for a git operation is not consent to policy (b), so a command
 * pairing an overridden branch switch with a protected-path write still denies
 * on the write. See guardBashCommand for the evaluation order.
 * Neither policy touches the Bash allow path's zero-side-effect property (no
 * counter reset, no guard_allow event) — see guardBashCommand.
 *
 * Ported from fusion/reactor/pkg/guard/decision_guard.go.
 *
 * Protocol: reads JSON from stdin, writes JSON to stdout.
 *   Allow: {}
 *   Block: {"decision":"block","reason":"..."}
 */
export {};
