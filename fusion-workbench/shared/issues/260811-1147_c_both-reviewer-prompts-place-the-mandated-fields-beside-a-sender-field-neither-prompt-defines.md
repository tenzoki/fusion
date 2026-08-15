# Both reviewer prompts place the mandated fields "beside `**Sender:**`", a header field neither prompt defines

---
**Severity:** Low
**Domain:** code
**Filed by:** coderev, review of `7785330..cac41ef` (Turn 1)
**Affects:** `agents/coderev.md:73`, `agents/ontorev.md:66`
**Cross-references:** commit `afd7c2e`; issue `260810-1205`

---

## The defect

Both prompts open the new mandate with the same sentence:

> **Every review file you write carries these two lines in its header block, beside `**Sender:**`.**

`grep -n "Sender" agents/coderev.md agents/ontorev.md agents/conceptrev.md` returns exactly those two
lines and nothing else. No prompt defines a `**Sender:**` header field, no review file in
`shared/reviews/` carries one, and `rules/fusion-workbench-conventions.md` puts the sender in the
**filename** (`YYMMDD-HHMM-<sender>-<topic>.md`) and says only that "the document header repeats
it" — without naming a field.

So the placement instruction anchors on nothing. A reviewer following it has to invent either the
field or the position.

## Why it is worth fixing rather than tolerating

The mandate's whole argument is that an unmandated format produced four spellings across ten files.
Leaving the *placement* unanchored reproduces that in miniature: the parser (`headerField`,
`review-coverage.ts:209-215`) takes the first line in the whole file that starts with the field name,
so placement does not currently break it — but the first line of prose that starts with
`**Reviewed-range:**` wins, and a review *about* the mandate is exactly such a file.

## Fix direction

Either:

- state the field and put it in the mandate, so the header block is fully specified —
  `**Sender:** coderev` beside the two new lines; or
- drop "beside `**Sender:**`" and say "in the header block, before the first `##` heading", and have
  `headerField` stop at the first heading rather than scanning the whole file.

The second is the smaller change and closes the parser's exposure at the same time.

---
Resolved: fix direction 2, the smaller change, taken in both halves. `agents/coderev.md:73` and
`agents/ontorev.md:66` now read "in the header block — anywhere above the first `##` heading,
which is where the reader stops looking", so the placement resolves against the file's own
structure rather than against `**Sender:**`, which no prompt defines. `headerField`
(`hooks/lib/review-coverage.ts`) returns null at the first line starting `##`, so the parser
implements the same rule and the prose exposure the record named is closed with it: a review
*about* the mandate no longer has its quoted `**Reviewed-range:**` line read as its own.
Pinned two ways — `review-coverage-mandate.test.ts` `mandateGaps` requires the placement to be
stated and rejects the `beside **Sender:**` anchor, and `review-coverage.test.ts` writes a review
whose body quotes the field and asserts the file is reported UNUSABLE with its commit uncovered.
Both fail against the pre-fix tree (verified by restoring HEAD's sources and re-running).
