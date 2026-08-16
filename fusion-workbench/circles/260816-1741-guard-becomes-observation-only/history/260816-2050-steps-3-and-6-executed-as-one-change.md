# Steps 3 and 6 — the escalation module and `clear-halt.ts` go, as one change

**Date:** 2026-08-16
**Agent:** coder
**Status:** Complete
**Plan:** `circles/260816-1741-guard-becomes-observation-only/planning/260816-1915_p_the-compliance-guard-becomes-observation-only.md`, steps 3 and 6
**Defect that merged them:** `circles/260816-1741-guard-becomes-observation-only/issues/260816-2032_c_step-3-deletes-a-module-step-6s-file-still-imports.md` (option 1)
**Predecessor commit:** `2f624ca` (step 2)

## Why the two steps were merged

The plan gives step 6 `Dependencies: steps 1 and 3`, and that order cannot be executed.
`hooks/clear-halt.ts` imports four values and one type from `hooks/lib/escalation.js`
(`clear-halt.ts:81-82`), and `hooks/tsconfig.json` includes `*.ts` at the hooks root, so
deleting the module while the entry point exists fails the compile with TS2307. A failed
compile never reaches `syncIntoDist()` in `hooks/scripts/build.mjs`, which is where the
orphan prune lives, so step 3 alone would have left `dist/lib/escalation.js` and its `.d.ts`
in the shipped tree — the precise outcome the prune exists to prevent.

The escalation decision record's sequencing constraint is satisfied either way: it requires
only that step 6 not land before step 1, and step 1 landed as `05d848b`.

## What landed

Three changes, on top of the `hooks/lib/events.ts` edit a previous run had already made
and left uncommitted (`guard_block` and `guard_halt` out of `GuardEventType`, the union's
existing comment extended rather than duplicated, `dist/lib/events.d.ts` rebuilt).

1. **`hooks/clear-halt.ts` deleted.** The manual halt-reset entry point. Its only remaining
   role was to clear a flag nothing at this version reads; the remedy for a legacy halt is
   `/fusion:setup`'s deletion offer, which landed in step 1.
2. **`halt_cleared` removed from `GuardEventType`** in `hooks/lib/events.ts`. This step
   removed its last emitter. The union comment was not given a fourth paragraph: the
   existing `guard_block` / `guard_halt` paragraph was rewritten to carry all three
   2026-08-16 removals as one argument, stating that a halt no code can raise needs no
   clearing verb. The `bin/monitor` paragraph, which said "all three of them", now names
   `state_drift`, `guard_block` and `guard_halt` explicitly, because with `halt_cleared`
   joining the retired set the bare count had become ambiguous — and `bin/monitor` styles
   those three and not `halt_cleared` (`bin/monitor:591-592`, `:612`).
3. **`hooks/lib/escalation.ts` deleted.** The escalation state module. Its only non-test
   importer was `clear-halt.ts`, deleted above; the only other importer in the repository
   is `hooks/lib/__tests__/escalation.test.ts`, which step 9 deletes.

`bin/monitor` was not touched. No test file was touched.

## Verification

`cd hooks && npm run build` — exit 0.

The four compiled outputs are pruned, confirmed by listing `hooks/dist/` and `hooks/dist/lib/`
before and after:

| Path | Before | After |
|---|---|---|
| `hooks/dist/clear-halt.js` | present | gone |
| `hooks/dist/clear-halt.d.ts` | present | gone |
| `hooks/dist/lib/escalation.js` | present | gone |
| `hooks/dist/lib/escalation.d.ts` | present | gone |

`dist/lib/events.d.ts` emits the six-member union with `halt_cleared` absent. No `import`
of `lib/escalation.js` remains anywhere under `hooks/dist/`; the three remaining textual
hits there are prose in doc comments.

## Test delta

Baseline entering the task, measured at the same working tree before the change:
**7 files / 31 cases red**. After: **11 files / 44 cases red**. Four files added, none
removed, and no previously-red file improved.

| File | Before | After | Why |
|---|---|---|---|
| `escalation.test.ts` | green | fails to collect (0 tests) | imports the deleted `../escalation.js`. Step 9 deletes it. |
| `clear-halt-concurrent-halt.test.ts` | green | 8 failed | spawns `dist/clear-halt.js` and shims `dist/lib/escalation.js`, both gone. Step 9 deletes it. |
| `derivable-enumerations-lint.test.ts` | green | 1 failed | the `hooks/lib` file table in `README-hooks.md` still lists `escalation.ts`. Step 11. |
| `reference-resolution-lint.test.ts` | green | 2 failed | five dangling citations of `lib/escalation.ts` and `hooks/dist/clear-halt.js` in `README-hooks.md` (`:178`, `:242`, `:296`, `:412`) and `README.md` (`:113`), plus the pinned reference-count baseline moving from 1122 to 1117 paths and 94 to 93 records. Step 11, and the baseline is re-approved with that step. |
| `legacy-halt-clearing.test.ts` | 4 failed | 6 failed | already red on the two `protected_path` halts; the remaining two cases spawn `dist/clear-halt.js`. Step 9 re-points it. |

The other six baseline-red files are unchanged, case for case:
`guard-bash-integration` (5), `guard-escalation-shape` (11), `guard-halt-event` (2),
`guard-project-config-integration` (6), `hook-fail-open` (2), `surface-growth-bound` (1).

Nothing red falls outside the three classes the dispatch named as expected — the two test
files whose subjects vanished, and enumeration or citation lints over the shipped docs.
`reference-resolution-lint` is the second gate of that documentation class rather than a
fourth class: every one of its findings is a `README` citation of a file this change deleted.

## Records updated

- Plan steps 3 and 6 set to `[DONE]`; step 6 carries a line recording the merge, its reason
  and the defect record it cites.
- The defect record closed: `Resolved:` note appended, marker renamed `_o_` → `_c_`.

Nothing was committed.
