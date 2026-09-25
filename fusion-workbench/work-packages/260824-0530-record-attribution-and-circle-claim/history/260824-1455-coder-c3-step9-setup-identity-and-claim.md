# coder — C3 step 9: `/fusion:setup` mints the identifier and reports a claim it does not hold

**Status:** Complete (edits landed; verification red on two out-of-scope baselines)
**Agent:** coder
**Circle:** 260824-0530-record-attribution-and-circle-claim
**Plan:** `260824-0613_*_c3-attribution-on-records-and-a-claim-on-the-circle.md`, step 9

## What was written

One file changed, `skills/setup/SKILL.md`, in the two edits step 9 prescribes.

**Edit 1 — the identity read.** Step 0i gains a guarded `bin/fusion-identity` call ahead of its
detection block, `[ -x ]`-guarded in the form every other helper call site in the body uses. The
paragraph above it states that the first read mints `fusion-workbench/.checkout-id`, delegates the
six exit codes to the helper's own header and the caller's obligations to
`rules/fusion-workbench-conventions.md` `### Who filed it`, and instructs the Done report to carry
both values, or a non-zero exit's reason unchanged. The step's title now names both of its subjects.
The step number was left at `0i` deliberately: renumbering it to `0j` would have reached three
comments in `hooks/lib/__tests__/reference-resolution-lint.test.ts` and the Done-report line, none
of which this dispatch may touch.

**Edit 2 — the claim read.** The `One path and no pointer-present` branch now reads the record's
`**Claim:**` as well. Where the value opens with `Claimed ` and names an identity other than the one
just read, the holder and the claim time are named before the offer, and the offer becomes an
override that writes the field's `Overridden ` sentence, its composition delegated to
`agents/orchestrator.md` `## Circle head fields`. `Unclaimed`, or an absent field, behaves as before.
The two literal openings are cited to `rules/circle-records.md` `### The claim field`.

## Budget

`skills/setup/SKILL.md`: 44 324 bytes before, 45 221 after. **+897 bytes**, inside the 900-byte
budget the plan sets as an acceptance criterion. The `skills/*/SKILL.md` surface stands at 236 213
against the plan's ceiling of 240 237.

## Verification

`cd hooks && npm test` — exit non-zero. 2 failed files, 40 passed; 2 failed tests, 730 passed.

Both failures are baselines this dispatch may not edit, and both are caused by this edit alone:
restoring the file to its `HEAD` content and re-running the two tests passes 49 of 49.

1. `reference-resolution-lint.test.ts` — `BASELINE` moved from `{paths: 1310, anchors: 183}` to
   `{paths: 1316, anchors: 186}`. The three anchors are this edit's three section citations; the six
   paths are its file citations. The test's own message states that re-approval is the expected
   response and belongs in the same commit as the edit.
2. `surface-growth-bound.test.ts` — the checked-in `fixtures/surface-growth.golden` still carries
   `setup/SKILL.md 44324` and `total 235316`. Plan step 11 regenerates that golden with
   `UPDATE_SURFACE_GOLDEN=1`; regenerating moves no baseline.

Nothing else in the suite moved.
