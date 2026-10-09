The upgrade limits call a measured aggregate unmeasured, and omit observation case (j)
---
`docs/upgrading-to-v13.md` `## Documented limits` misstates two facts about the takeover's evidence. The section's own opening says each bullet "closes on what shows it".
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Severity:** low
**Found by:** review G-B, `261009-1448-reviewer-g-b-closing-review-of-the-13-0-0-takeover-revision.md`

**Evidence.**
1. **The old-client bullet** (lines 171-180 at `4e1e1b47`) says: "Other operations were not measured: an aggregate operation of an old client may fail when it reaches such a package". But an unscoped `validate`, which is an aggregate, *was* measured. `codec/src/__tests__/round-trip-cli-takeover.test.ts`, the "version boundary" case (lines 653-657), asserts that it answers `ok`, `valid: false`, with findings naming exactly the four transferred packages. `codec/fixtures/prior/REQUESTS.md` `### The version boundary, measured` reports the same. The bullet omits the one aggregate result that exists, and calls the class unmeasured.
2. **The unobserved-behaviours bullet** ("Seven agent behaviours …", lines 205-240) lists case (i) of `hooks/lib/__tests__/agent-dispatch-observation.test.ts` as "written after that run and not yet run". It does not list case (j). Case (j) is the run Prior's answer to 62, part 9, asked for: a valid source and no word under `autonomous`, so no takeover is sent. It was written in the same commit `0a0d6148` and was not run either (`REQUESTS.md` `### The Claude route, as built`: "Both run at FJ05 step 16; they were not run for this section"). So the count is eight, not seven. The alternative is to state both cases as one item.

**Fix direction.** Bullet 1: name the measured unscoped `validate` (answers, invalid, its findings naming the transferred packages), and say that the other aggregate operations (`list`, `reconcile`, `inspect`) were not measured. Bullet 2: add case (j), or fold (i) and (j) into one item, and make the count match.

**Acceptance.** Both sentences match the test file. The cardinality is derived or enumerated (`rules/critical-stance.md` §5). `surface-growth-bound.test.ts` and `reference-resolution-lint.test.ts` are green.
