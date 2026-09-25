# coder — step 10, the mint stops being silent and exit 1's reason is restated

**Status:** Complete
**Date:** 2026-09-05
**Filed by:** coder (Kai Stalmann <ks@qantr.com>, checkout 5e8248d7)
**Plan:** `260904-1651_*_the-checkout-registry-names-each-instance-and-joins-one-persons-identities.md`, step 10

## What was done

Two independent halves, in three files and 44 added lines against the step's
budget of under 45.

## The mint half, unconditional

`bin/fusion-identity` gained a `did_mint` flag, set on the one branch where this
process's noclobber write succeeds, and an `announce_mint` function called after
the read-back has confirmed what the file holds. Two stderr lines:

- that an identifier was minted because `.checkout-id` did not exist, naming it;
- where the workbench already carries other checkout identifiers, how many and
  where: distinct `"checkout":"…"` values in `orchestrator-events.jsonl` other
  than the new one, and `*.md` filenames under `shared/checkouts/` other than the
  new one. The line names the two causes it cannot tell apart, a first identity
  in a workbench others have written to and a re-mint after `git clean -xdf`
  swept the ignored file, and it chooses between them nowhere.

The second line is suppressed where both counts are zero. Both counts are over
tracked files, which is the property that makes them readable after the sweep.

**No detector was built**, because the plan's `**Decidability:**` line says the
question is not decidable from what a swept tree holds. The two reported facts
are decided; the inference is the human's.

**Nothing else moved.** Exit codes, stdout, the halt condition, the mint-once
property and the never-overwrite property are untouched. A lost race and an
unwritable workbench are neither this process's mint nor announced as one — that
was the `elif ! (...)` branch, inverted so the success side can set the flag.

`## Minting` in the header gained the reason, citing the issue.

## The halt half, per step 9's answer

Option 1, so **no behaviour moves**. What changed is the stated reason, in two
places. The header's exit-1 entry drops the second of its two clauses, the one
saying a record filed from such a tree would name nobody, which the registry
makes false; the first clause stands alone, that a tree which intends to commit
and cannot is misconfigured, so its records reach no other checkout.
`rules/fusion-workbench-conventions.md` `### Who filed it` gained one paragraph
carrying the same reading plus the sentence that a registry does not weaken it,
because the halt protects the join from a record's author to the surrounding
commits' author, not the record's text.

Step 11 owns the "One precondition, and no code checks it" sentence in that same
section; it was not touched.

## The by-hand acceptance, run rather than reasoned about

Scratch workbench at `/private/tmp/.../scratchpad/mintcheck`, git-initialised
with an identity, three event lines carrying two distinct checkout values, one
registry entry. Delete `.checkout-id`, run the helper: both stderr lines appear
(`2 in orchestrator-events.jsonl`, `1 under shared/checkouts/`), stdout is
`PERSON=` plus `CHECKOUT=` and the exit code is 0. A second call is silent. With
the registry entry removed the second count reads `0` and the line still fires
on the log alone.

## Tests, +21 lines

`hooks/lib/__tests__/fusion-identity.test.ts`, two cases.

- *The mint speaks.* Seeded event log, first call asserts the whole of stdout,
  exit 0, `minted <hex>` on stderr and both counts by their rendered text; the
  second call's stderr is asserted **empty**, so the line reports an act and not
  a state.
- *Exit 1 fires in exactly the cases it fires in at HEAD.* The six-configuration
  table driven in one loop, each asserting the code HEAD gives it: 0, 1, 1, 3, 4,
  5. This is the step's constraint that nothing here may make a caller halt where
  it does not halt today.

## Budgets, measured

- Always-on rule core: `fusion-workbench-conventions.md` 51 897 → 52 320 bytes,
  +423. The bound assertion `holds the always-on rule set — what every agent
  loads — inside its budget` passes.
- Hook-test surface: `fusion-identity.test.ts` 200 → 220 lines, +20. `holds
  hook-tests inside its own head-room of 2500 lines` passes.

No baseline was edited.

## What was left stale, and named

Two **golden** assertions, both moved by this diff and neither a bound:

- `rules-emission-golden.test.ts` `matches the checked-in golden, agent by agent`
  — the always-on total 71 519 → 71 942.
- `surface-growth-bound.test.ts` `matches the checked-in golden, surface by
  surface` — hook-tests total 20 162 → 20 182. It is independently stale from
  earlier steps of this Circle.

Regenerating a golden is a separate dispatch, per this task's instruction and
each file's own header, and it does not move a baseline.

## Verification

`cd hooks && npm test` — exit 1. Three suites red:

- `rules-emission-golden.test.ts` — the stale golden above, caused by this diff.
  The budget assertion in the same file passes.
- `surface-growth-bound.test.ts` — the stale golden above, caused by this diff
  and by earlier steps. All three head-room assertions pass.
- `citation-sweep.test.ts` — red at HEAD before this session, filed as
  `260904-1839_*_citation-sweep-test-is-red-at-head-and-was-already-red-before-this-session-started.md`.
  Not mine; the dispatch names it as expected.

822 of 825 tests pass. `fusion-identity.test.ts` is green, 12 of 12.
`monitor-warnings-panel.test.ts` did not fail in either run.
