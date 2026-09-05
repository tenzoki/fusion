# The third re-baselining event, and the fence correction

**Status:** Complete
**Filed by:** coder, Kai Stalmann <ks@qantr.com>
**Domain:** code

---

## What was dispatched

Realise the answer to `260905-1810_*_does-a-growth-bound-re-baseline-after-a-merge-of-two-lines-that-were-each-inside-it.md`
(option 2): a merge of two lines that were each inside a growth bound is a third event at which a
baseline moves. Write the event into the rule's authoring home, state it briefly in the shipped
docs, move the two baselines the merge put over, and correct the always-on rule's claim that the
citation gate exempts a fence. Suite green at the end, no commit.

## What changed

**The rule.** `hooks/lib/__tests__/helpers/growth-bound.ts` `## Re-baselining: the three events at
which a baseline moves` — the heading and the section both. Event 3 says what the event is (a merge
of two lines each inside the bound at its own head), what it must name (the merge commit and both
parent figures), why it exists (the bound measures addition per line, and a merge adds two measured
lines' growth to one baseline at once), and what it must not be used for. Three things it does not
reach, each written down: a merge whose parents were not each inside, which is a cut as before; the
merge commit's own conflict resolution and every edit on top of it, which are measured *from* the
new baseline, so the figure copied in is the merged tree's and not the re-baselining commit's; and
the third event that was already refused, a Circle wanting room for work it is about to do
(`260822-1102_*_what-happens-when-a-planned-circles-required-work-exceeds-the-remaining-head-room.md`,
option 1). The closing paragraph now says a merge names its commit and both parent figures, beside
what a cleanup and an arming name.

**The docs.** `README-hooks.md` `### Growth bounds on the shipped text` goes from two moments to
three in one sentence, with the reason and the parents-inside condition, and still points at the
helper as the authoring home rather than restating it.

**The two baselines.** `SKILL_BASELINE` and `TEST_LINE_BASELINE` in
`hooks/lib/__tests__/surface-growth-bound.test.ts`, moved to the merged tree's per-file figures
with a `## The merge re-baseline, 2026-09-05` entry above them in the form the helper prescribes.
`AGENT_BASELINE` does not move and its doc comment says why.

**The stale citations the rename produced.** `rules-emission-golden.test.ts` cited the old heading
three times and asserted it once, in the hard bound's failure message; all four moved, and the note
there records that the third event has not reached that surface. The failure text in
`surface-growth-bound.test.ts` moved for the same reason.

**The fence.** `rules/fusion-workbench-conventions.md` `## Marker globs`, closing paragraph. It told
every agent that a fenced code block is exempt from the citation gate, full stop. It now says which
verdicts the fence covers (the ones a lookup decides: exists, resolves to more than one, has moved
marker) and which it does not (`store-prefixed`, read off the token's shape before anything is
looked up, `git:ff52dd4a`), that the fence still keeps the sweep off an exhibit, and that a store
that has to be named is named in words.

## The measurement the re-baseline rests on

All four figures per surface re-measured off `git` rather than quoted from the issue, and the floors
re-summed at each commit rather than assumed constant.

| surface | base `cda72f71` | this line `18bb1f93` | the other `7f9f2f4d` | merged `420b022b` | budget |
|---|---|---|---|---|---|
| `skills/*/SKILL.md`, bytes | 239 833 | 240 410 | 240 037 | 240 614 | 240 439 |
| `hooks/lib/__tests__/**.ts`, lines | 19 876 | 20 374 | 20 266 | 20 766 | 20 375 |

The floors stand unmoved at all four commits — 220 439 bytes and 17 875 lines, no baselined file
added or deleted on either line — so both parents were inside on both surfaces, which is the
condition event 3 turns on: 29 bytes and 402 of head-room left on `skills/`, 1 line and 109 on the
hook tests. On `skills/` the merged delta is exactly the two side deltas (+577 and +204 = +781). On
the hook tests it is +890 against +498 and +390; the two extra lines are the merge's own conflict
resolution in `reference-resolution-lint.test.ts`, whose pin log went 996 -> 1 001 on this line,
996 -> 997 on the other and 996 -> 1 004 merged.

The other two bounded surfaces were inside on the merged tree and do not move: `agents/*.md` at
411 882 bytes against a budget of 417 843, and the always-on rule core, which passes its own bound
in `rules-emission-golden.test.ts`.

## What this change spends, measured from the new mark

The baselines take the **merged** figure, not the tree this change leaves, so every line this change
adds is measured like any other addition. The hook-test surface now reads 20 882 lines against a
budget of 23 266, and the always-on rule core 87 784 bytes against 98 573 after the fence
correction's +465. Both goldens were regenerated and their diffs read: `surface-growth.golden` moves
only the three files edited here, `rules-emission.golden` only the conventions file's size in every
role block.

## Per-file byte delta

| file | bytes | lines |
|---|---|---|
| `hooks/lib/__tests__/helpers/growth-bound.ts` | 6 134 -> 8 561 (+2 427) | 123 -> 158 (+35) |
| `hooks/lib/__tests__/surface-growth-bound.test.ts` | 29 337 -> 33 907 (+4 570) | 608 -> 685 (+77) |
| `hooks/lib/__tests__/rules-emission-golden.test.ts` | 61 875 -> 62 154 (+279) | 1 150 -> 1 154 (+4) |
| `rules/fusion-workbench-conventions.md` | 57 146 -> 57 611 (+465) | 532, unchanged |
| `README-hooks.md` | 64 719 -> 65 149 (+430) | 472, unchanged |
| `hooks/lib/__tests__/fixtures/surface-growth.golden` | 3 174, unchanged | 102, unchanged |
| `hooks/lib/__tests__/fixtures/rules-emission.golden` | 3 156, unchanged | 127, unchanged |

## What was deliberately not done

No cut, because the answer was that none is owed here. No baseline moved for a surface inside its
bound. No test added: the hook-test surface is the one being re-baselined, and the only assertions
touched were the two that name the renamed heading. The decision record stays at `_a_`; its
`Implemented:` line needs the commit hash this task was told not to produce.

## Verification

`cd hooks && npm test` — exit 0, 864 of 864 passing, 50 files. It was exit 1 at the start of this
task with 862 of 864, the two failures being the `skills` and `hook-tests` bounds.
