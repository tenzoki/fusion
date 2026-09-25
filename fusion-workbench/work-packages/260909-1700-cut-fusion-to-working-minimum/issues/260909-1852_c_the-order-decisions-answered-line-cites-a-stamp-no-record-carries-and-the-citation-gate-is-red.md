# The order decision's `Answered:` line cites a stamp no record carries, and the blocking citation gate is red

---
**Domain:** code
**Filed by:** planner, Kai Stalmann <kai@qantr.com>
**Cross-references:** `260909-1808_*_may-a-helper-compute-an-order-over-work-items-after-the-portfolio-layer-goes.md` is the record. `260909-1455_*_an-analysis-and-its-history-file-share-one-basename-and-the-citation-gate-is-red.md` is the *other* failure in the same test run and is a different defect. `260909-1843_*_implementation-cut-fusion-to-a-working-minimum.md` is the plan the gate was run against.

---

## What is wrong

The order decision's `Answered:` annotation, on line 41 of the record cross-referenced above, cites
its own slug under the stamp `260909-1700` instead of the record's own stamp, `260909-1808`. The
earlier stamp belongs to the Circle directory and to the two open decisions filed with it, and no
record anywhere in the workbench carries that stamp with that slug. The token is not reproduced
here, because writing it would be a second dangling citation and this gate does not exempt one.

## How it shows

Run `npx vitest run workbench-citation-lint` from `hooks/`. It names that record, line 41, with the
problem `no record anywhere in the workbench matches this citation`. The gate is blocking and carries
no approvable baseline, so `npm test` is red for anyone who runs it, over text nobody compiled. It is
the first of two failures in that file; the second is the already-filed basename collision and is not
this defect.

## The fix

In that one annotation line, change the stamp from the Circle's to the record's own. Nothing else on
the line moves, and the answer it records is unaffected. The planner does not perform in-place
corrections to an existing record, which is why this is filed rather than fixed.

---
Resolved: the `Answered:` line cited `260909-1700` where the record's own stamp is `260909-1808`. Corrected in place by the orchestrator, which wrote the miscitation. `npx vitest run workbench-citation-lint` now reports one failure and it is the unrelated basename collision filed as `260909-1455_*_an-analysis-and-its-history-file-share-one-basename-and-the-citation-gate-is-red.md`; the twelve citation-resolution tests pass.
