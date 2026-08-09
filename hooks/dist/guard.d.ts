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
 * It also RECEIVES Bash tool calls, and inspects them for nothing at all. Two
 * policies used to read the command text here, and both asked the same
 * undecidable question of the same input:
 *   - a classifier that predicted whether a command was about to write a
 *     protected path. Retired 2026-08-07; what a shell does to a protected path
 *     is now answered after the fact, by the fingerprint pair at the top of this
 *     comment — measured rather than predicted.
 *   - a branch policy that predicted whether a command was about to move HEAD.
 *     Deleted 2026-08-09 by the same reasoning, and on its own record: five
 *     patches in one afternoon, each closing a measured entrance and revealing
 *     the next, 24 consecutive false blocks against the agents' own verification
 *     commands, and no recorded true positive in its whole history.
 * A Bash call therefore reaches the before-fingerprint and then allows,
 * participating in NO write-guard bookkeeping (no counter reset, no
 * guard_allow event).
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
