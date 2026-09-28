# Step 16 — the three companion edits to the curator's pass

**Status:** Complete
**Agent:** coder
**Circle:** `260816-1741-guard-becomes-observation-only`
**Date:** 2026-08-17

---

## What this was

Three pieces that had to land in the same commit as the curator's already-applied
pass over `CLAUDE.md` and `rules/fusion-workbench-conventions.md` (run log
`260817-0845-curator-run.md`,
18 ledger entries, all approved at the user gate). Neither of the curator's two
files was touched here.

## 1. The pair-half in `hooks/session-start.ts`

The `## Why the message is English` section argued that fusion's operator strings
are English by pointing at the guard's deny reasons and the halt notice. Step 2 of
this Circle left the guard reaching no verdict, and `9c79202` deleted the halt with
its clearing script, so both examples named nothing in the tree. The count "the
other fifteen" measured a set that has shrunk three times since.

The curator fixed the authoring home in the same wording (ledger entries L17 and
L18). This edit brings the hook into agreement with it:

- the two dead examples give way to the guard's configuration advisories and the
  tracker's review-coverage and staging-drift notices, both verified live
  (`hooks/lib/config.ts:326,394`, `hooks/tracker.ts:333,415`),
- "the other fifteen" becomes "the rest",
- a closing sentence says the count is deliberately not restated, matching what the
  conventions file now says at the same place.

The argument is unchanged, as the defect record required: a hook fires before any
agent has read `CLAUDE.md`, so localising one operator string while the others stay
English is the inconsistency rather than the fix.

`hooks/dist/session-start.js` and `hooks/dist/session-start.d.ts` were rebuilt with
`npm run build`. The build keeps comments, so the compiled copies carry this text
verbatim, and they are committed and shipped. Nothing else in `dist/` moved.

Defect record `260816-2115_*_the-why-the-message-is-english-argument-names-two-removed-mechanisms-as-its-examples.md`
closed with a `Resolved:` note, marker `_o_` → `_c_`.

## 2. The citation lint's pinned count

`hooks/lib/__tests__/reference-resolution-lint.test.ts` `BASELINE` re-approved,
`paths` 1112 → 1120. `anchors` and `records` did not move. The test's own failure
message names re-approval as the expected response and forbids widening the
assertion into a floor; the pin stays an equality.

The received number was **attributed rather than accepted**. Each edited file was
reverted to `HEAD` in turn and the gate rerun, and the scanner was copied to a
throwaway sibling test that logged every token it resolved, so the two token sets
could be diffed:

| Reverted | `paths` | Attributed |
|---|---|---|
| nothing (working tree) | 1120 | — |
| `CLAUDE.md` | 1113 | +7 |
| `rules/fusion-workbench-conventions.md` | 1119 | +1 |
| `hooks/session-start.ts` | 1120 | 0 |

Nine citations enter and one leaves. Entering: `bin/fusion-plugin-cwd`,
`bin/fusion-source-root`, `docs/upgrading-to-v10.md`, `hooks/guard.ts` twice,
`hooks/lib/config.ts`, `install.sh` and `templates/fusion.json` in `CLAUDE.md`, and
`hooks/lib/guard-state-file.ts` in the conventions file (ledger entry L16).
Leaving: a second `hooks/lib/self-detect.ts` in `CLAUDE.md`. Net +8.

Two things worth recording because they were measured and not assumed. Ledger
entries L17 and L18 add and remove no citation at all — the rules-side +1 is L16's
alone. And this step's own `hooks/session-start.ts` edit moves the count by zero:
it replaces prose, not paths, and the gate returned 1120 with the pre-edit file in
place. The note beside `BASELINE` states all of this.

## 3. The rules golden

`hooks/lib/__tests__/fixtures/rules-emission.golden` regenerated with
`UPDATE_RULES_GOLDEN=1`, then verified green on a plain rerun. Every changed line is
`fusion-workbench-conventions.md 55184 → 55835` or a per-agent total moved by
exactly +651; nothing else in the fixture moved.

The growth **baseline** in that file was not touched and did not need to be. The
always-on set stood at 90 370 bytes against a `RULE_BASELINE` of 86 573, so 3 797 of
the 12 000 head-room was used; +651 takes it to 4 448. Regenerating a golden records
what the tree measures and never clears a bound — the growth assertion in the same
file was among the passing tests both before and after.

## Verification

`cd hooks && npm test` — exit 1. 651 of 653 tests pass; one red file,
`lib/__tests__/surface-growth-bound.test.ts`, with two cases:

- `carries no baseline entry for a file that is gone` — five hook-test baseline
  entries whose files went in `1d1d3a3`,
- `matches the checked-in golden, surface by surface` — the `agents` surface, where
  `orchestrator.md` measures 144 634 against a golden of 144 832 after step 11.

Both are step 10's to clear and both predate this step. Neither is new and neither
was touched here. The 14 lines this step added to a hook test did not produce a
third failure: the hook-tests line bound in that same file passed.

`reference-resolution-lint.test.ts` (34 tests) and `rules-emission-golden.test.ts`
(15 tests) are both green.

## Files changed

- `hooks/session-start.ts`
- `hooks/dist/session-start.js`, `hooks/dist/session-start.d.ts` (rebuilt)
- `hooks/lib/__tests__/reference-resolution-lint.test.ts`
- `hooks/lib/__tests__/fixtures/rules-emission.golden` (regenerated)
- `260816-2115_*_the-why-the-message-is-english-argument-names-two-removed-mechanisms-as-its-examples.md`
  (closed, renamed from `_o_`)

Nothing was staged and nothing was committed.
