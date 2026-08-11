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
