# Planner — repair of three citation-grammar defects

**Filed by:** planner, Kai Stalmann <ks@qantr.com>
**Status:** Complete
**Executors offered:** coder, ontocoder, analyst
**Circle:** none active; everything resolved to `shared/`

## What was produced

- `260831-2144_*_repair-three-citation-grammar-defects.md` — the plan, four steps, all `coder`.
- `260831-2142_*_which-property-separates-a-head-field-identifier-from-a-head-field-citation.md` — the head-field property, three candidates, recommendation with the refuting measurement.
- `260831-2143_*_does-a-project-declare-its-own-identifier-head-fields.md` — the recurrence the recommendation leaves open.

## Measurements taken at `637f9dbf`

Every figure in the plan is one of these, and none was carried over from the filed records.

```
./bin/fusion-citation-check      dangling=313 resolved=17312 judged=17997 tokens=22626 files=2416
./bin/fusion-citation-sweep      files=0 rewrites=0 residual=2840
cd hooks && npm test             47 files, 818 tests, green
hook-test surface                20 170 lines, floor 17 875, head-room 2 500 -> 205 remaining
```

Predicted after the repair: `dangling=299` (step 1 removes 11, step 2 removes 3, step 3 removes 0 here). The pinned triple in `reference-resolution-lint.test.ts` is predicted unmoved by all three steps.

## Three corrections to the filed records

1. The tail defect's record says its 11 rows are all inside `archive/`. Measured, 5 are; the other 6 are under `circles/…/history`, `circles/…/analyses`, a `_c_` issue, an `_i_` decision and `shared/history` twice. The count is right, the placement claim is not.
2. No row of either the tail or the sweep defect sits in the blocking gate's corpus, so in this tree both repairs move the checker and not the gate.
3. The head-field candidate derived from the record template — a head-field token that neither ends in `.md` nor carries a marker slot is not a citation — is **refuted**. A Circle is cited by bare directory name and a head field holds one in 249 lines outside `archive/` here, across eight labels, six of them `**Provenance:**` in `rules/*.md` inside a blocking gate.

## Verification

The three filed records are themselves in the blocking gate's corpus, and the first draft reddened it over its own probe tokens. Rewritten as fenced blocks, which is the remedy that gate's failure message names. After the fix: suite green (47/47, 818 tests), `dangling=313` and `rewrites=0` both unmoved, so the filing cost the corpus nothing.

## Not done

No code was written and no executor was dispatched. Step 3 is blocked on the user's answer to `260831-2142_*_…`.
