Step 13 cannot read covered in a clone of C, because the commit that lands the last review is never covered by it
---
FJ05 step 13 runs `bin/fusion-review-coverage --since cd1b5522 --head C` in a scratch clone of C and requires `verdict=covered`. No single C satisfies both halves: the review covering the last commits is committed after them, and the commit carrying it is covered by no review.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Severity:** medium (step 13's acceptance cannot pass as written; "Nothing is retried into a pass" then stops the run)
**Found by:** review `261009-1624-reviewer-coverage-pass-over-4e1e1b47-to-052932e2.md`

**Evidence.**
- Plan `261009-1021-plan-fj05-release-acceptance-of-13-0-0-with-the-claim-takeover.md`, step 13 (lines 393-413): "C is the head after step 12 and G-C. The analyst works in a scratch clone of C, never in the live tree"; it runs "`bin/fusion-review-coverage --since cd1b5522 --head C`"; acceptance "Coverage reads `verdict=covered`".
- `hooks/lib/review-coverage.ts` lines 414-428 and 587: review files are read from the working tree's filesystem (`readdirSync`, `readFileSync`), not from `--head`'s tree. Every commit in `since..head` counts, workbench-only ones included: at `052932e2` the tool lists `95fecad4` and `073ae793`, both workbench-only, as `uncovered`.
- So, for this coverage pass (range `4e1e1b47..052932e2`), whose file lands in a later commit R:
  - C = `052932e2`: a clone of C lacks this review file, so the three commits read `uncovered`.
  - C = R: the clone holds the file, but `--head R` adds R itself, which no review's range reaches, so `uncovered=1`.
  - Only a clone of R run with `--head 052932e2` reads `covered`. That is what the dispatch of this pass names, but it is neither "a clone of C" nor "`--head C`" for one C.
- "C is the head after step 12 and G-C" named `073ae793` when written; step 10's `052932e2` and this review's commit have landed since. Step 20 then pushes C to `main` and tags it, so which commit C is decides what ships.

**Fix direction.** Fix C by name in a step note before step 13 runs, and split the two uses: C is the last reviewed commit (`052932e2`, or a later one with its own pass); the clone is taken at the commit that lands the covering review; `--head` is C. State in the same note that the review-landing commit is workbench-only and is the one commit outside coverage, or have step 20 tag the review-landing commit and say why its single uncovered workbench commit is accepted.

**Acceptance.** The plan names C as a hash and the clone's commit as a hash; step 13's coverage command, run as the note states, prints `verdict=covered`; step 20's `<C>` is the same hash as step 13's.

Resolved: 2026-10-09, the plan carries a step note before step 13 that names C as `052932e2`, the coverage command and clone, and the axibra precondition of step 20.
