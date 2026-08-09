/**
 * Compliance Guard — PreToolUse hook for Claude Code.
 *
 * Before anything else, on ALL five guarded tools, it records a fingerprint of
 * every protected path (lib/protected-snapshot.ts). `tracker.ts` takes a second
 * one after the tool ran and restores whatever changed. That pair is the guard's
 * actual protection of those paths; the checks below are the explaining refusal
 * that keeps an agent from meeting a bare failure. See the call site in `main`
 * for why the BEFORE half is a condition of admissibility rather than a nicety.
 *
 * Intercepts Write/Edit/MultiEdit tool calls and checks them against:
 *   1. Halt state — if active, block ALL writes
 *   2. Protected paths — blocked, with one exemption: FUSION_ALLOW_RULES_WRITE
 *      lets a write to a project rule path through, recorded as an advisory.
 *      See lib/rules-write-exemption.ts. The match is TEXTUAL and
 *      CASE-INSENSITIVE — unconditionally, on every platform, so the boundary
 *      does not differ by filesystem. See lib/paths.ts `matchesAnyFolded`.
 *   3. Decision-governed categories — escalated based on sensitivity
 *
 * Also intercepts Bash tool calls, for ONE policy:
 *   a. Branch policy — DENIES branch/worktree-moving git operations. git is
 *      reachable only via Bash, so every attempt an agent can make passes
 *      through here; that makes this a choke-point on the tool CALL, not a
 *      proof of impossibility. The classifier reads the command text, so a
 *      command that hides the verb from its own text (`eval '…'`,
 *      `bash -c '…'`, a `case` arm, a script the agent invokes) is not seen.
 *      See lib/git-branch-guard.ts. Runs everywhere, including in the fusion
 *      plugin's own repo.
 * There used to be a second one: a classifier that read a shell command and
 * predicted whether it was about to write a protected path. It is gone, and
 * nothing replaces it on THIS side of the tool call. What a shell does to a
 * protected path is now answered after the fact, by the fingerprint pair at the
 * top of this comment — measured rather than predicted, because "will this
 * command write?" is not decidable from the command text. Decided by the user
 * on 2026-08-07: detect afterwards instead of predicting.
 * The branch policy does not touch the Bash allow path's zero-side-effect
 * property (no counter reset, no guard_allow event) — see guardBashCommand.
 *
 * Ported from fusion/reactor/pkg/guard/decision_guard.go.
 *
 * Protocol: reads JSON from stdin, writes JSON to stdout.
 *   Allow: {}
 *   Block: {"decision":"block","reason":"..."}
 *
 * ## Every verdict is written before it is recorded
 *
 * There is no bare `block(...)` or `allow()` after a state write anywhere below.
 * Each site goes through `answer` from lib/fail-open.ts — the verdict first,
 * then the escalation counter and the event rows as guarded reports — and the
 * few reports that cannot be moved after the verdict go through `bestEffort`.
 * Four denies used to be discarded by a throw in their own bookkeeping and
 * replaced with the fail-open ALLOW; that module's header carries the class, the
 * measurements and the records.
 */
export {};
