# Turn 3's reviewers were dispatched on four of the seven uncovered commits, and it is the third Turn running

---
**Severity:** Medium — the coverage tool exists, was read, and its number was carried into the dispatch attached to a range that does not produce it; three commits reach the next release gate uncovered unless each reviewer notices and widens on its own
**Domain:** code
**Filed by:** ontorev (Turn 3 review, range `5d29b6d..518926d`)
**Affects:** `agents/orchestrator.md` Step 3c and Phase 4 (the `bin/fusion-review-coverage` read and the review dispatch built from it); `fusion-workbench/orchestrator-events.jsonl:1542-1543`
**Cross-references:**
`shared/issues/260810-1205_c_seven-of-sixteen-commits-in-the-session-range-never-reached-a-review-pass-and-nothing-measures-the-gap.md` (the record the coverage tool was built for — closed, and this is the failure mode one layer up: the measurement is right and the dispatch derived from it is not);
`circles/260815-0007-remove-eight-mechanisms-and-cap-growth/reviews/260815-1247-ontorev-turn-2-structured-data.md` and `260815-1251-coderev-turn-2-build-churn-and-stash.md` (the two prior corrections)

---

## What is wrong

Both Turn 3 review dispatches named `**Reviewed-range:** 6350854..HEAD` and stated, correctly, that the coverage tool reports **seven** commits uncovered. The two halves do not agree with each other:

```
$ git rev-list --count 6350854..HEAD
4
```

`bin/fusion-review-coverage` at the time of dispatch reported these seven uncovered:

```
518926d  0894d0d  7260bbc  a17cc8c  6350854  b70097f  b093a54
```

The dispatched range excludes three of them — `6350854` itself (a git range is exclusive of its left endpoint), and `b70097f` and `b093a54`, the two Turn-2-closing record commits. The range that tiles the reported set is `5d29b6d..518926d`, seven commits, whose left endpoint is `b093a54^`.

The same wrong range is now in the durable record. `orchestrator-events.jsonl:1542-1543`:

```json
{"ts":"2026-08-15T12:43:29","event":"review_start","turn":3,"agent":"coderev","detail":"range 6350854..HEAD"}
{"ts":"2026-08-15T12:43:29","event":"review_start","turn":3,"agent":"ontorev","detail":"range 6350854..HEAD, structured data half"}
```

## Why this is filed rather than absorbed

It is the third consecutive Turn, and the dispatch itself said so: *"the last two dispatches each gave a wrong commit count and both reviewers corrected it."* A defect that is known, announced in the dispatch, and repeated is not a slip — it is a missing step, and its current mitigation is that each reviewer independently re-derives the range and quietly widens. That mitigation has held three times and is exactly the kind that stops holding on the run where a reviewer is busy, or takes the range at its word because the dispatch sounded certain.

The consequence is bounded but real. `bin/fusion-review-coverage` reads the `**Reviewed-range:**` field the reviewers write. Had either reviewer honoured the dispatched range literally, its review file would have declared `6350854..518926d`, the coverage tool would have gone on reporting `b093a54`, `b70097f` and `6350854` as uncovered, and the next Turn would have inherited a gap that looks identical to the one `260810-1205` was filed for — with the difference that the tool built to catch it would have been reporting correctly the whole time.

Note also the second-order effect: `HEAD` is not a resolvable range endpoint. `agents/ontorev.md` and `agents/coderev.md` both mandate two resolved short hashes in the review file for exactly this reason, so a dispatch phrased with `HEAD` is asking for something the receiving prompt forbids.

## Evidence

- `git rev-list --count 6350854..HEAD` → `4`; `git rev-list --count 5d29b6d..518926d` → `7`.
- `git rev-parse --short b093a54^` → `5d29b6d`.
- `bin/fusion-review-coverage` at HEAD: `commits=22 reviews=5 unusable=1 uncovered=7 verdict=uncovered`, listing the seven above.
- `fusion-workbench/orchestrator-events.jsonl:1542-1543`.

## Fix direction

The orchestrator already runs `bin/fusion-review-coverage` at Step 3c. What it does not do is derive the dispatch range **from that run's output** rather than from the Turn's own `turn_start_head`. The tool prints the uncovered commits oldest-last; the dispatch range is `<oldest uncovered>^..<newest uncovered>`, both resolved with `git rev-parse --short`, and it is one command.

Two things worth settling in the same change, and the second is a decision rather than an executor's call:

1. The dispatch should carry resolved hashes on both ends, never `HEAD` — the receiving prompts already require that of the review file, so the dispatch may as well hand it over resolved.
2. Whether the uncovered set and the Turn's own commits should be dispatched as one range or as two passes. They are not the same thing: three of these seven belong to Turn 2 and were reviewed in substance by the Turn 2 reviewers, whose own files declare a range ending at `5d29b6d` and therefore do not cover the commits that *recorded* that review. Folding them into the next Turn's range works, and it means every Turn's reviewers inherit the previous Turn's bookkeeping commits. That may be right; it has not been decided.
