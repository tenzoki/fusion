# How often does the review pass run?

---
**Domain:** code
**Filed by:** claude-code (conditioning-load work; the cadence question raised by the 260827 audit), Kai Stalmann <ks@qantr.com>
**Cross-references:** `agents/orchestrator.md` Step 3c and Phase 4 (the two sites the answer reshapes) · `bin/fusion-review-coverage` (the tiling that makes the cadence safe) · `shared/decisions/260815-2109_*_may-a-circle-close-over-an-uncovered-review-range-and-who-decides.md` (coverage stays advisory) · `hooks/tracker.ts` (the review-landing measurement, unchanged)

---

## Question

The incremental review dispatched `coderev`/`ontorev` at every Turn's end — 65 coderev dispatches in this repository's event log, the second-largest dispatch source after the coder itself, each carrying the reviewer's full conditioning. The audit asked whether the cadence is worth it when `bin/fusion-review-coverage` already tiles the declared review ranges against the commit range and names every hole, commit by commit, whenever a review lands or a release is prepared.

## Answer (260827, user: "ein rev / circle sollte reichen")

**One review pass per Circle, at its closure.** Phase 4 dispatches the reviewers on the closure paths (`_c_`/`_b_`), scoped by what the coverage read names: every uncovered commit of the Circle plus the carried `**Not-opened:**` list — which is what keeps a multi-session Circle fully tiled without any per-Turn dispatch. The Turn's end keeps the cheap coverage *read* (it informs the dashboard and the closure scope), the review-landing measurement in `hooks/tracker.ts` is untouched, and the release checklist's coverage read remains the second net.

**What this trades, named:** review findings no longer feed the next Turn's queue inside the same Circle — they land as issues at closure, for the follow-on Circle or the closure gate; and a long Circle accumulates more unreviewed commits before its one pass. Both accepted for the dispatch saving; coverage stays visible per Turn and stays advisory per `260815-2109` (a Circle may still close over a named gap).

A session that ends without closing its Circle runs no review — the Circle's one pass comes when the Circle closes, whichever session that is.
