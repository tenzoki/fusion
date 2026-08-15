# `parseNotOpened` misreads a prose value as a file list, or as a declared `none`

---
**Severity:** Low
**Domain:** code
**Filed by:** coderev, review of `7785330..cac41ef` (Turn 1)
**Affects:** `hooks/lib/review-coverage.ts:263-275`
**Cross-references:** commit `afd7c2e`; issue `260810-1205`

---

## The defect

`parseNotOpened` has three branches and the last one accepts anything:

```ts
if (/^none\b/i.test(value.trim())) return { files: [], recorded: true };
const ticked = backticked(value);
if (ticked.length > 0) return { files: ticked, recorded: true };
const words = value.split(",").map(s => s.trim()).filter(s => s !== "");
return { files: words, recorded: words.length > 0 };
```

Two readings go wrong, in opposite directions:

1. **`**Not-opened:** none of the prompt files`** matches `/^none\b/i` and is read as *nothing was
   excluded*. The reviewer stated an exclusion; the parser records the opposite.
2. **`**Not-opened:** nothing left unopened`** reaches the fallback and becomes
   `["nothing left unopened"]`. That string is then handed to the orchestrator by
   `coverageSentence` as the next dispatch's scope: *"The last review declared it did not open
   nothing left unopened."*

Case 2 is the louder failure and the safer one. Case 1 is the quiet one, and it is the shape the
issue was filed about: a declared exclusion that reads downstream as an absent exclusion.

## Why the fallback exists, and what it is worth

The comment says the fallback takes the comma-separated words "rather than dropping the reviewer's
statement". That instinct is right — a statement that cannot be parsed must not vanish. But the
fallback does not preserve the statement *as a statement*; it promotes it to a file list, and a file
list is acted on.

## Fix direction

The parse is decidable if the mandate is taken literally: the prompts show backticked paths or the
bare word `none`. Everything else is unrecognised.

- Tighten branch 1 to `/^none$/i` on the trimmed value, or `/^none\b/i` only when nothing follows but
  punctuation. `none — everything was opened` should still pass; `none of the prompt files` should
  not.
- Replace the word-splitting fallback with a fourth field on `ReviewRow`: `notOpenedRaw`, recorded
  and rendered verbatim, with `files: []` and `recorded: true`. The reviewer's sentence then reaches
  the reader without being mistaken for a scope.

Both reviewer prompts already show only the two mandated spellings, so nothing legitimate is lost.

---
Resolved: both fix directions taken. `parseNotOpened` (`hooks/lib/review-coverage.ts`) returns a
`NotOpened` with a third field `raw`, and its branches are now disjoint: an absent line and an
empty value record nothing; `/^none$/i` or `none` followed by punctuation is a declared `none`, so
`none — everything was opened` still passes and `none of the prompt files` no longer does;
backticked tokens are the file list; anything else is carried verbatim in `raw` with `files: []`.
The comma-splitting fallback is gone, so no filename that was never written can be produced.

`ReviewRow` gained `notOpenedRaw`, `renderReview` prints it as `(unparsed) <value>`, and the
`carried` source deliberately skips a row with a raw value: `carried=` is a scope the next
dispatch is told to open, and prose is not one. The statement still reaches the reader, on that
review's own row, as a statement.

Pinned by three unit cases in `review-coverage-mandate.test.ts` (the `none`-prefix exclusion, the
`none`-with-gloss control, and the uninterpretable value) and one end-to-end case in
`review-coverage.test.ts` asserting `(unparsed) nothing left unopened` in the report and
`carried=(not recorded)`. All fail against the pre-fix tree.
