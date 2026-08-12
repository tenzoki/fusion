/**
 * Compliance Guard — PreToolUse hook for Claude Code.
 *
 * Intercepts Write/Edit/MultiEdit/NotebookEdit tool calls and checks them
 * against TWO things:
 *   1. Halt state — if active, block ALL writes until a human clears it
 *   2. Decision-governed categories — escalated based on sensitivity
 *
 * There used to be a third, between them: a protected-path deny reading
 * `guard.protectedPaths`, softened by one exemption (`FUSION_ALLOW_RULES_WRITE`)
 * and backed by a fingerprint of every protected path taken here and compared
 * again in `tracker.ts`. The whole half was removed on 2026-08-12. It is named
 * here because its absence is the thing a reader of an older tree, an older
 * README or an existing `events.jsonl` will come looking for: in roughly 450
 * records across this project and its largest consumer there was no instance of
 * the failure it existed to prevent, and it stood down in fusion's own tree —
 * the only tree whose patterns name what they say they name — from the first
 * public release. What it cost was 53 records in one consumer that exist only
 * because agents may not write files that project owns.
 *
 * A halt raised by that mechanism in a consuming project still blocks at CHECK 1
 * and still clears through `clear-halt.js`; that migration path is pinned by
 * `lib/__tests__/legacy-halt-clearing.test.ts`.
 *
 * It also RECEIVES Bash tool calls, and inspects them for nothing at all. Two
 * policies used to read the command text here, and both asked the same
 * undecidable question of the same input:
 *   - a classifier that predicted whether a command was about to write a
 *     protected path. Retired 2026-08-07 in favour of the measurement that has
 *     since been removed with it.
 *   - a branch policy that predicted whether a command was about to move HEAD.
 *     Deleted 2026-08-09 by the same reasoning, and on its own record: five
 *     patches in one afternoon, each closing a measured entrance and revealing
 *     the next, 24 consecutive false blocks against the agents' own verification
 *     commands, and no recorded true positive in its whole history.
 * A Bash call therefore allows immediately, participating in NO write-guard
 * bookkeeping (no counter reset, no guard_allow event). It now allows without
 * touching guard state at all; while the measurement existed it first wrote a
 * fingerprint file.
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
