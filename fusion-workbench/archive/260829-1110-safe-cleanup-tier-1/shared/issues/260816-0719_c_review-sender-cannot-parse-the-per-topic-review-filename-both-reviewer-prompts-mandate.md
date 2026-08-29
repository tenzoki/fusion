`reviewSender` cannot parse the per-topic review filename both reviewer prompts mandate
---
`736e276` added a filename-based sender filter to the review-coverage scan and to the tracker trigger.
Its regex reads a four-digit `HHMM` stamp. Both reviewer prompts mandate a **two-digit** counter for the
per-topic session files a review pass writes first, so every one of those files parses as senderless.
---
**Severity:** Medium — a per-topic review file reaches the report as an unclassifiable row ("the filename
carries no `<sender>` segment") and, through `hooks/tracker.ts`, fires the whole measurement over a file
the scan will then refuse to measure. That is the same trigger-wider-than-scan shape as `260811-1145_*_conceptrev-review-files-are-scanned-and-trigger-the-coverage-report-though-no-mandate-covers-them.md`,
and the permanent-noise shape `hooks/lib/review-coverage.ts`'s own header says it refuses.
**Domain:** code
**Filed by:** coderev, session `260816-0713-coderev-turn-5-6-range-3a0408a-f77633f.md`, reviewing range `3a0408a..f77633f`
**Owner:** coder
**Affects:** `hooks/lib/review-coverage.ts` (`reviewSender`), `hooks/tracker.ts`, `agents/coderev.md:112`,
`agents/ontorev.md:102`, `rules/fusion-workbench-conventions.md:288`

## Measured, not inferred

Run against the compiled module at HEAD:

```
260816-0145-coderev-turn-2.md                             sender: "coderev"    measured: true
260816-01-coderev-topic.md                                sender: null         measured: true
260326-01-ontorev-horizon-review.md                       sender: null         measured: true
260807-2035-conceptrev-plan-two-language-declarations.md  sender: "conceptrev" measured: false
```

The third line is `agents/ontorev.md:102`'s **own worked example**, verbatim. The fourth is a live
file in `shared/reviews/`; it replaced a synthetic name on 2026-08-19 and the row is unchanged,
because `reviewSender` and `isMeasuredReview` read the filename and nothing else.

## The two rules that disagree

- `hooks/lib/review-coverage.ts`: `/^\d{6}-\d{4}-([a-z][a-z0-9]*)(?:-|\.md$)/`
- `rules/fusion-workbench-conventions.md:288`: `YYMMDD-HHMM-<sender>-<topic>.md` — the parser matches this
- `agents/coderev.md:112`: "Save result directly to `$OUT_REVIEW/YYMMDD-NN-coderev-<short-description>.md`
  (e.g. `260406-01-coderev-prompt-template-variable-mismatch.md`)", `NN` = 01, 02, 03…
- `agents/ontorev.md:102`: the same, with `ontorev`

`hooks/lib/__tests__/review-coverage-mandate.test.ts` pins `REVIEW_SENDERS` against the two prompt
*names*, and nothing pins the regex against the filename shape those same two prompts mandate. That is
the identical omission the added test's own comment describes for the sender set: "already fixed the
mandate at two prompts and nothing carried that fact into the scan".

## Fix, and the decision under it

Cheapest: accept both stamps — `/^\d{6}-(?:\d{4}|\d{2})-([a-z][a-z0-9]*)(?:-|\.md$)/`. But the per-topic
files are working notes the prompts say to **delete** at consolidation, so the real question is whether
the population is "review files" or "review files that carry a range mandate". A second answer is to make
the two filename patterns one — three surfaces state it and one is a `\d{4}` regex.

## Related

- `shared/issues/260811-1145_*` — the population defect this filter was written for

---
**Reconciliation 260817-1836** (reconciler, domain `code`). Re-verified reproducible at HEAD `2552586`: `hooks/lib/review-coverage.ts:193` still requires a four-digit stamp, while `agents/coderev.md:112` and `agents/ontorev.md:102` both mandate a two-digit counter for per-topic files, which parse to a null sender. Marker stays open. Log: `260817-1836-reconciliation.md`.

---
Resolved: fixed — the per-topic working file takes the one review pattern YYMMDD-HHMM-<sender>-<topic>.md that the parser reads, and the rule says a two-digit counter parses as no sender; the two reviewer prompts already cite the contract; rules/review-contract.md:58
