# coder — step 11, the unchecked precondition says which half the registry repaired

**Status:** Complete
**Date:** 2026-09-05
**Filed by:** coder (Kai Stalmann <ks@qantr.com>, checkout 5e8248d7)
**Plan:** `260904-1651_*_the-checkout-registry-names-each-instance-and-joins-one-persons-identities.md`, step 11

## What was done

One paragraph replaced in `rules/fusion-workbench-conventions.md`, in the
`### Who filed it` section, and nothing else in the tree. Step 10's paragraph
above it stands untouched.

What stood there claimed one precondition and named one consequence of its
failure. After step 4 the consequence is no longer the whole story: a registry
entry states one git identity and the person who claims it, so
`bin/fusion-events presence` joins two of a person's identities and counts them
once. The precondition no longer binds that reading. It still binds
`/fusion:next`, whose claim comparison reads the identity as written rather
than through the registry.

The replacement says both halves, says the second one is deliberate rather than
unfinished — a comparison routed through a pulled file would answer differently
across a fetch, the reason already argued in `rules/circle-records.md`
`### The claim field` and in this Circle's step 6 — and closes with what a
person does about the residual: register the checkout, and take the Circle back
through the override the refusal already offers.

The sentence was replaced, not appended to. That was the step's acceptance
criterion and the reason for it holds: a paragraph that states a precondition
and qualifies it three sentences later reads worse than the one it replaced.

## Measurements

- `rules/fusion-workbench-conventions.md`: 52 320 → 52 629 bytes against the
  working tree before this step, +309. Against `HEAD` the file is +732, the
  other 423 being step 10's.
- The always-on rule core (`agent-setup.md`, `fusion-workbench-conventions.md`,
  `critical-stance.md`, the three files every dispatch loads): 66 657 → 66 966
  bytes. Floor from `RULE_BASELINE` is 65 498, head-room 12 000, so the budget
  is 77 498 and **10 532 bytes are free** after this step. The hard-bound
  assertion in `rules-emission-golden.test.ts` passes.
- Em-dash rate is unmoved: 15 in the file at `HEAD` and 15 now, the paragraph
  carrying none. The file reads `over` its ceiling in both states, which is a
  condition inherited rather than caused here.

No baseline was edited.

## Verification

`cd hooks && npm test` — exit 1. 821 of 825 tests pass; four suites red.

- `citation-sweep.test.ts` — red at `HEAD` before this session, filed as
  `260904-1839_*_citation-sweep-test-is-red-at-head-and-was-already-red-before-this-session-started.md`.
  Not mine.
- `rules-emission-golden.test.ts` — the stale golden, moved further by this
  diff (`fusion-workbench-conventions.md` 51 897 → 52 629 across steps 3 to 11).
  The budget assertion in the same file passes. Regeneration is a separate
  dispatch.
- `surface-growth-bound.test.ts` — the stale `hook-tests` golden, from earlier
  steps and not from this diff, which touched no `.ts` file. All head-room
  assertions pass.
- `reference-resolution-lint.test.ts` — **caused by this diff**, and it is a
  pinned count rather than a dangling reference: `paths` 1571 → 1572, because
  the new paragraph names `bin/fusion-events`, which resolves. The remedy is
  one number in that file's `BASELINE`, which the gate's own failure text calls
  the expected response. I did not apply it: the dispatch bounded this task to
  one file and one sentence, and left baseline and golden bookkeeping to a
  separate dispatch. The alternative within scope was to drop the `bin/`
  prefix so the token stops matching the gate's grammar, which is dodging a
  gate rather than answering it.

`monitor-warnings-panel.test.ts` was green in all three runs.
