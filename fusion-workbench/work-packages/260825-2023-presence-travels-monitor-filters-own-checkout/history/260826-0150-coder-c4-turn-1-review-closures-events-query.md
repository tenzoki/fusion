# C4 Turn 1 review closures — the event-log reader says what it measured over

**Status:** Complete
**Agent:** coder
**Filed by:** coder, Kai Stalmann <ks@qantr.com>
**Checkout:** 5e8248d7
**Review:** `260826-0141-coderev-c4-the-event-log-reader-and-the-writer-on-every-line.md`
**Records closed:** seven, in this Circle's issue store — `260826-0131_*_turns-returns-exit-0-and-a-whole-file-count-when-the-checkout-is-unresolved-and-stdout-says-nothing.md` (High), `0132`, `0133`, `0134`, `0135`, `0137`, `0138`, each cited in full below

## Scope, and what was left alone

Three files and their compiled halves: `hooks/lib/events-query.ts`, `hooks/events-query.ts`, `bin/fusion-events`, plus the four rebuilt artifacts under `hooks/dist/`. Nothing else. Three sibling tasks were editing `skills/setup/SKILL.md`, `bin/monitor` and `rules/workbench-tracking.md` concurrently, and `agents/orchestrator.md` belongs to a later wave.

No test file was added. The dispatch put that out of scope and named the reason: the hook-test surface has zero lines of head-room, the user has answered how that is paid for, and plan step 10 holds the answer.

## The cross-cutting repair, done once

Five of the review's ten findings are one shape — the program is more careful than its documentation — and one sentence in its cross-cutting section names the mechanism underneath: `bin/fusion-identity`'s exit vocabulary was read three different ways inside this one range.

It is now translated in exactly one named place. `resolveIdentity` in `hooks/events-query.ts` maps that helper's codes onto `{ exit, identityOwed, note }` from a single table, and every branch consults it. The per-call `switch` in `identityNote` is gone; no branch tests a code of its own.

The load-bearing field is `identityOwed`, and its rule is stated where it is defined rather than at each reader: it is `false` **only** where the helper said so, its 4 and its 5, the two codes that mean this is not a git work tree. Every other code is `true`, **including the codes that could not tell** — 127, an unrecognised number, none passed at all. *Nothing is owed* is the stronger of the two claims, so a reader that could not establish it reports a half as unread instead. That asymmetry is what the old code got backwards in the opposite direction, folding the helper's 4 in with its 3 and 5 and printing two sentences that contradicted each other.

The reason for the single point is written at the function and again in the `bin/fusion-events` header: `bin/fusion-identity`'s own header devotes a section to why 1 and 4 must stay distinguishable, and a switch repeated per branch is precisely how they stop being.

## The seven, and the judgement each needed

**`260826-0131_*_turns-returns-exit-0-and-a-whole-file-count-when-the-checkout-is-unresolved-and-stdout-says-nothing.md` (High) — `turns` widened its scope silently.** `turns` now prints `scope=checkout` or `scope=all-checkouts` on stdout, in the shape the helper already uses, on the exit-4 branch as well as on success. Two decisions inside it. The exit stays **0**, per the dispatch and now per the header: the count was taken, over a scope the key names, and a sixth exit code would change what every existing caller does in order to say what a key says without changing anything. And the key is printed **last**, so the two lines a caller was written against are byte-identical to before — which is the concrete reading of "a caller that ignores the new key must not silently change behaviour".

**`260826-0132_*_the-turns-exit-4-has-two-causes-and-the-authoritative-header-names-one.md` — the exit-4 row named one of two causes.** Header only, no code change; the record's own reading, that the header rather than the program is short, holds. One residual is named in the closure and not fixed: the plan's `## API Changes` table carries the same omission, and `planning/` was outside this task's scope.

**`260826-0133_*_a-turn-start-line-with-no-readable-timestamp-is-dropped-from-the-count-and-reported-nowhere.md` — an unstamped `turn_start` vanished.** `countTurns` returns `unstamped` on its ok branch; `noteUnstamped` names it on stderr, separately from `noteMalformed`. Kept on stderr rather than promoted to stdout, which is the record's own fix direction: neither count is a figure taken from the log, each says how far the log fell short of letting one be taken, and splitting the two across streams would have bought a reader nothing the header does not now give.

**`260826-0134_*_other-checkouts-counts-two-different-sets-depending-on-the-exit-code-and-its-comment-describes-one.md` — one key, two denotations.** The `otherCheckouts` comment now says what is counted and names `otherPeople === null` as when the wider reading applies; the header's exit-4 row carries the same clause. No code change.

**`260826-0135_*_a-tree-that-owes-no-git-identity-is-read-as-one-whose-identity-could-not-be-read.md` — a tree that owes nothing read as one that could not be read.** The wording follows the distinction now, and the note is no longer printed beside the sentence that already names the cause, so the two contradicting lines are one coherent line. **The exit stays 4** and the header says why: what a caller does is identical in both states, and exit 0 would promise an `other_people` this run did not take. Plan step 6's collision resolves the way step 6 already resolves it — a non-git project's counts are zero and the surface prints nothing.

**`260826-0137_*_the-party-sort-is-not-total-and-the-comment-beside-it-claims-it-is.md` — a sort that was not total.** The tie-break falls through to `person` after `checkout`, which is the pair the map is keyed on. The comment was rewritten to name the key rather than to claim the property.

**`260826-0138_*_the-party-line-is-unescaped-tab-separated-and-a-tab-or-newline-in-a-person-value-breaks-it.md` — an unescaped tab-separated record.** Every field is flattened through `flattenField` before the join. Two deliberate widenings of the record's fix direction, both argued in the closure: all five fields rather than `person` alone, because they arrive by the same route and carry the same bytes; and the whole C0 range plus DEL rather than TAB, CR and LF by name, because that costs nothing and needs no argument about the other thirty.

## Verification

`cd hooks && npm run build && npm test` — **exit 1**. One test file failed, `reference-resolution-lint.test.ts`, and it is not a defect in the change: the gate reports `{ paths: 1411, anchors: 195 }` against a committed `BASELINE` of `{ paths: 1409, anchors: 195 }`. Every reference resolves; only the count moved off its pin.

**The delta was attributed by measurement, not by inference.** With `bin/fusion-events` reverted to `HEAD` and every other file in the working tree left exactly as it stood — the three siblings' uncommitted edits included — the gate passed, 37 of 37. So **the whole of +2 is this task's** and the rest of the tree is already consistent with 1409. The two paths are `bin/fusion-identity` and `hooks/events-query.ts`, both added to the header where the single-translation-point rule is stated.

Re-approving the baseline means editing `hooks/lib/__tests__/reference-resolution-lint.test.ts`, which the dispatch put out of scope in its file list and gave a reason for. It is left for whoever holds the commit, and the number to write is `{ paths: 1411, anchors: 195 }` **if nothing else in the wave moves it first** — three sibling tasks were still writing to the tree while this was measured. The sibling task at `260826-0148-coder-p9-readers-repair-authored-once.md` reached the same call independently, one baseline value ago.

`surface-growth-bound.test.ts` passed. `bin/` and `hooks/lib/*.ts` fall outside all four bounds and this task added no test line, so no budget was spent.

**Measured from the work tree against the real log**, which is the check that the fix is not merely asserted:

```
$ ./bin/fusion-events turns
turns=2
history_file=circles/260825-2023-presence-travels-monitor-filters-own-checkout/history/260825-2123-orchestrator-session.md
scope=checkout
EXIT=0

$ ./bin/fusion-events presence
window_days=7
scope=pulled
other_people=0
other_checkouts=0
EXIT=0
```

`turns=2` rather than the `turns=1` the review measured is this session's own second Turn, not a regression: the count is scoped to the same `history_file` and the log gained a `turn_start` since.

The four degraded paths were exercised against the compiled entry point with the identity supplied by environment variable, and the four library fixes against fixture strings — the measurements are quoted in the seven closures rather than repeated here.

## Files changed

- `/Users/k1/Projects/productive/fusion/hooks/lib/events-query.ts`
- `/Users/k1/Projects/productive/fusion/hooks/events-query.ts`
- `/Users/k1/Projects/productive/fusion/bin/fusion-events`
- `/Users/k1/Projects/productive/fusion/hooks/dist/events-query.js`
- `/Users/k1/Projects/productive/fusion/hooks/dist/events-query.d.ts`
- `/Users/k1/Projects/productive/fusion/hooks/dist/lib/events-query.js`
- `/Users/k1/Projects/productive/fusion/hooks/dist/lib/events-query.d.ts`
