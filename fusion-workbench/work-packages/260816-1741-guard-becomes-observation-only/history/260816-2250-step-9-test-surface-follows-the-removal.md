# Step 9 — the test surface follows the removal

**Agent:** coder
**Date:** 2026-08-16
**Circle:** 260816-1741-guard-becomes-observation-only
**Plan:** `260816-1915_*_the-compliance-guard-becomes-observation-only.md`, step 9
**Status:** Complete

## What was asked

Bring the hook test surface into line with a guard that decides nothing, working
from step 9 plus the four records that amend it: `260816-2021`
(`guard-bash-integration.test.ts` is in no step's list), `260816-2122_*_step-9s-harness-reduction-deletes-four-fixtures-guard-bash-integration-still-imports.md` (the
harness reduction deletes fixtures that file imports), `260816-2108`'s second
finding (`paths.test.ts` loses its subject) and `260816-1917` (the Grounding names
a test whose subject survives). Read together, in one pass — which was the right
instruction, because they describe one tangle and not four faults.

## Measurement before

`cd hooks && npm test` — exit 1, **14 files / 116 cases red**. Eleven files were
this step's; three were not (`derivable-enumerations-lint` 1, and
`reference-resolution-lint` 2, both step 11's; `surface-growth-bound` 2, step
10's).

## What was done

**Four files deleted**, each whose whole subject is the counter, the halt or the
script that cleared it: `escalation.test.ts` (its module is gone),
`clear-halt-concurrent-halt.test.ts` (its entry point is gone),
`guard-escalation-shape.test.ts`, `guard-halt-event.test.ts`.

**Eight files edited.**

| File | 
|---|
| `helpers/guard-harness.ts` — header rewritten; governed-deny fixtures deleted; the seeded configuration filename moved to the loader's own constant; the legacy-state seeder kept and re-framed; `guardStateWritten` restored |
| `config.test.ts` — rewritten around the one live leaf, 1522 → 795 lines |
| `guard-project-config-integration.test.ts` — two groups kept, two dropped, the retired-**file** group added, 530 → 423 |
| `guard-bash-integration.test.ts` — re-pointed, 389 → 346 |
| `legacy-halt-clearing.test.ts` — re-pointed onto the migration step 1 performs, 262 → 213 |
| `hook-fail-open.test.ts` — the two deny-dependent integration cases re-pointed onto the two surviving orderings |
| `paths.test.ts` — reduced to `foldCase`, 132 → 51 |
| `turn-budget-lint.test.ts` — the two `ENOENT` cases repaired |

`guard-state-shape.test.ts` was **not** touched. The Circle's Grounding lists it
among the tests whose subject is being removed and the Grounding is wrong: the
state-load coercion seam in `lib/guard-state-file.ts` survives with two callers,
and the file's rows have seeded `review-coverage.json` since 2026-08-15. It was
green before and is green now.

## The three things worth knowing afterwards

**1. The harness was seeding a retired filename, and the fix is structural.**
`governedFiles` wrote the literal `fusion-guard.json` into every throwaway
project. `fab8a4b` made that a *retired file*, so every project in the suite
emitted an extra `guard_advisory` per guarded call and one previously-green case
went red for a reason no case was about. A rename would have fixed today's
symptom. Instead the harness imports `PROJECT_CONFIG_FILENAME` from
`lib/config.ts`, `projectConfig` stopped being exported, and `configFiles(value)`
is the only way in — so a case can no longer choose the name at all. One case
asserts the two names differ, which is the check on the fix rather than the fix.

**2. Two harness exports were kept against step 9's text, and the reason is the
same step's other instruction.** `readEscalation`, `EscalationSnapshot` and the
`escalation` seed option were listed to go. The re-pointed
`legacy-halt-clearing.test.ts` cannot assert that a project seeded with
`haltActive: true` is unblocked and left byte-identical without them. They stay
with one consumer, under a section header stating that the file they write is
legacy and that deleting the seeder would delete the evidence the removal was
survivable — which is a different thing from deleting the mechanism.

**3. Two cases were re-pointed onto two orderings, not one.** `hook-fail-open`'s
guard-side deny cases had to land somewhere, and the naive landing — an allow
with an unwritable state directory — is already asserted at the top of that file.
The two surviving in-`main` sites are the two `lib/fail-open.ts` distinguishes:
`answer` (the write trace, verdict first) and `bestEffort` (the configuration
diagnostic, which cannot be moved after the verdict). The second case would have
been **vacuous** as first written — the fail-open tail produces the same allow and
the same exit 0 — so it asserts *two* `[guard] Error:` markers, which is what
separates a contained failure from one that propagated to `main().catch`.

## Verification

`cd hooks && npm test` — **exit 1**, 3 files / 5 cases red, and every one of them
another step's:

| File | Cases | Owner |
|---|---|---|
| `derivable-enumerations-lint.test.ts` | 1 | step 11 — the `hooks/lib` table in `README-hooks.md` |
| `reference-resolution-lint.test.ts` | 2 | step 11 — 26 citations of files steps 3 to 7b deleted, plus the pinned counts |
| `surface-growth-bound.test.ts` | 2 | step 10 |

**No fourth file is red**, and none of the three went green. The citation lint's
26 dangling references were checked one by one: not one of them names a file this
step deleted, and every one names something removed in steps 3 to 7b.
`surface-growth-bound`'s first case grew from one orphaned baseline entry
(`project-relative.test.ts`, left by step 5) to five, which is this step's four
deletions arriving in step 10's subject exactly as the plan sequences them.

`cd hooks && npm run build` — exit 0.

## What this step could not reach

`bin/fusion-turn-budget:41` and `docs/upgrading-to-v9.md:100` each cite the
deleted `hooks/config.json`, and **neither file is in step 11's Files list**. Two
of the 26 dangling citations therefore have no owner in this plan. Named here
rather than fixed, because both are outside this step's scope and the dispatch
named `bin/fusion-turn-budget` as not to be touched.

The Testing Strategy still names `guard-bash-integration.test.ts` among the files
that "must stay green throughout", which issue `260816-2021` asked to be
corrected in the same pass. That is plan prose rather than a step, and it was left
for whoever next edits it.

## Records

- `260816-2021` → `_c_`, with the departures this step made from its proposed fix.
- `260816-2122_*_step-9s-harness-reduction-deletes-four-fixtures-guard-bash-integration-still-imports.md` → `_c_`, with the third finding it did not carry (the seeded retired filename) and one correction to its consumer list.
- `260816-1917` → left `_o_`. Its test-file half is discharged; correcting the Grounding means editing `_t_circle.md`, which no remaining step owns.

Nothing was committed.
