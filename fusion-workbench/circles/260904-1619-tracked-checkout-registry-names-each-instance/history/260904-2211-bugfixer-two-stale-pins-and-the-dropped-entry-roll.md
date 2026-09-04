# Bugfix: two stale pinned-inventory gates, and the two dropped pin entries rolled back in

**Date:** 2026-09-04 22:11
**Status:** Complete
**Trigger:** Orchestrator dispatch — two stale gates after steps 4 to 8, plus the open defect `260904-2044_*_two-pin-re-approval-entries-were-dropped-instead-of-rolled-into-the-log-the-header-prescribes.md`
**Filed by:** bugfixer, Kai Stalmann <ks@qantr.com>, checkout 5e8248d7

## Error

Two pinned inventories had gone stale against the working tree, and one earlier repair on the pin's
trailing comment had dropped two attribution entries instead of rolling them.

1. `hooks/lib/__tests__/reference-resolution-lint.test.ts` pinned `paths` 1567 / `anchors` 217 /
   `stampBare` 13; the gate measured 1571 / 218 / 13.
2. `hooks/lib/__tests__/fixtures/surface-growth.golden` was stale for three files and both affected
   surface totals.
3. Defect `260904-2044_*_*`: the pin's header prescribes a roll of older entries into a dated
   `shared/analyses/` log, and two 2026-08-29 entries were deleted instead.

## Root cause

Nothing was defective in code. Both pins are deliberate committed inventories that a legitimate
edit is expected to move, and steps 4 to 8 moved them without re-approving either. The third item
is a process defect the record already names as the dispatcher's own instruction, not an execution
fault.

## Fix

### 1 — the reference-resolution pin, re-approved on a measurement of my own

Method: single-file revert against HEAD, the pin's own documented method — each changed file
replaced with its HEAD content in place, the gate run, the file restored from a byte copy. Six files
were candidates. Measured shares, all mine rather than repeated from the dispatch:

| File reverted to HEAD | gate reads | share |
|---|---|---|
| `bin/fusion-checkout-name` | 1569 / 217 / 13 | paths +2, anchors +1 |
| `skills/setup/SKILL.md` | 1570 / 218 / 13 | paths +1 |
| `skills/next/SKILL.md` | 1570 / 218 / 13 | paths +1 |
| `bin/monitor` | 1571 / 218 / 13 | none |
| `hooks/hooks.json` | 1571 / 218 / 13 | none |
| `hooks/lib/__tests__/hooks-wiring.test.ts` | 1571 / 218 / 13 | none |

The shares are disjoint and sum exactly: +4 paths, +1 anchor, 0 stampBare against 1567 / 217 / 13,
so no residue is owed to any other file. The tokens: `bin/fusion-identity` and
`rules/circle-records.md` `### The claim field` newly cited in the helper's header, the second a
rooted heading registering as one path and one anchor at once; one new
`$FUSION_PLUGIN_ROOT/bin/fusion-checkout-name` call site in each of the two skill bodies.
`skills/next/SKILL.md` moves paths and not anchors because its two rewritten citations survive the
rewrite in place, a token out for the same token in.

**My split differs from the dispatch's in attribution, not in total.** The dispatch reported step 5
as paths +2 and step 6 as paths +2 / anchors +1, each step counted as its skill body plus its edit
to the helper header. A per-file revert cannot split one file across two steps, so the helper's +2
and +1 land on `bin/fusion-checkout-name` alone. Both readings sum to the same +4 / +1 / 0.

Steps 7 and 8 contributing nothing was re-verified by revert-in-place, not assumed.

`BASELINE` re-approved to `{ paths: 1571, anchors: 218, stampBare: 13 }` with a full attribution
entry, chained in front of the previous one on the same line.

### 2 — the surface-growth golden, regenerated

Regenerated through `UPDATE_SURFACE_GOLDEN=1`, which rewrites the fixture and then fails on purpose
so the flag cannot be left on in a green run. The file's own header states that regenerating moves
no baseline and therefore never clears a bound, and no baseline was touched. Diff: the three files
the dispatch named, plus `reference-resolution-lint.test.ts` 996 to 999 for my own edit above, plus
the two surface totals. `skills/` stands at 240 428 against its 240 439 budget; hook-tests at 20 162
against 20 375. Every bound passes.

### 3 — the two dropped entries, rolled

Recovered verbatim from `git:d5a27230` into
`260904-2202-reference-resolution-pin-re-approval-log-the-two-dropped-2026-08-29-entries.md` in the
shared analyses store, in the form the two earlier rolls use. The recovery was checked by diff
against each entry's standalone form (`git:a60d1fea` for the citation-sweep entry, `git:3276b1e1`
for the grammar entry): the first is byte-identical, the second differs only in the opening word
`Re-approved`, which the chaining dropped. The record reproduces the entry as `d5a27230` holds it
and states that difference rather than folding it in silently.

The new log carries no entry ordinals, and says why: the chain below `const BASELINE` runs through
three comment lines that are not in chronological order with each other, uses two connector
spellings, and has at least one unexplained gap in its `paths` transitions. A position asserted
without auditing that chain would be the bare cardinality `rules/critical-stance.md` forbids.

The pin's header block now names the new file beside the other two and closes on "Roll, never
drop." The trailing comment's own sentence, which stated the entries had been dropped and were
reachable only from git, was corrected to record the recovery.

| File | Change |
|------|--------|
| `hooks/lib/__tests__/reference-resolution-lint.test.ts:452-483` | third roll named in the header; `BASELINE` re-approved to 1571 / 218 / 13 with its attribution entry; the drop confession corrected |
| `hooks/lib/__tests__/fixtures/surface-growth.golden` | regenerated; four file sizes and two totals |
| `shared/analyses/` (new) | `260904-2202-reference-resolution-pin-re-approval-log-the-two-dropped-2026-08-29-entries.md` |
| `shared/issues/260904-2044_*_*` | `Resolved:` appended, marker `_o_` renamed `_c_` |

## Verification

Command: `cd hooks && npm test`. Exit code **1**, on one suite only.

- 47 of 48 suites pass, 822 of 823 tests.
- `citation-sweep.test.ts` fails, and it is the pre-existing defect filed against this session's
  start commit — out of scope, unchanged by this work, and expected to stay red.
- `monitor-warnings-panel.test.ts` passed; the intermittent bind race did not occur.
- The two gates this task was about are green: `reference-resolution-lint.test.ts` 38/38,
  `surface-growth-bound.test.ts` 12/12.

One correction made during verification, worth recording because it was mine: the first draft of
the `Resolved:` line cited the new log with its `shared/analyses/` store prefix, which
`bin/fusion-citation-sweep` counts as a rewrite. Confirmed by reverting that one record to its HEAD
content and re-running the sweep, then rewritten in the storeless form. The sweep no longer names
that record.

- [x] Original error resolved — both pins re-approved from measurement
- [x] Full test suite passes but for the known out-of-scope failure
- [x] No regressions introduced

## Unrelated issues found

Not filed, because the dispatch bounded this task to three items. Reported to the orchestrator
instead: the `paths` chain in the pin's trailing comment jumps from an entry ending at 1336 to one
opening at 1517, with no entry in the file or in either earlier roll covering the gap. That is a
pre-existing hole in the attribution log, older than the drop this task repaired.
