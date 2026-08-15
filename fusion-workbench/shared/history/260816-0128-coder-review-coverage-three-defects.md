# Review coverage — three defects in the mandate, the scan and the parser

**Status:** Complete
**Agent:** coder
**Dispatched:** orchestrator, one pass over three records
**Sources:** `shared/issues/260811-1147_c_*`, `260811-1145_c_*`, `260811-1148_c_*`

---

## What was wrong, and what each fix is

The three records are one subsystem: `bin/fusion-review-coverage` tiles the `**Reviewed-range:**`
fields review files declare against a session's commit range. Each defect sits in how those fields
are specified or read.

**1. The mandate pointed at a field nobody defines.** Both reviewer prompts placed the two mandated
lines "beside `**Sender:**`", and no prompt defines such a field, so a reviewer following the
sentence had to invent either the field or the position. Fix direction 2 from the record — the
smaller one — was taken: the prompts now say the fields go in the header block, anywhere above the
first `##` heading, and `headerField` in `hooks/lib/review-coverage.ts` returns null at that
heading instead of scanning to end of file. Parser and mandate now state one rule. That also closes
the exposure the record named as a side effect: a review whose *subject* is the mandate quotes
`**Reviewed-range:**` in its prose, and the quote used to win.

**2. A retired sender's files were measured.** `conceptrev` wrote into the same reviews stores,
carried no commit range and correctly never claimed one, so every such file was scanned, found
rangeless and reported `UNUSABLE` — permanently, which normalises the word the module's own header
argues must stay rare. One landing at the plan gate also fired the whole measurement at Phase 0b,
before any Turn had run.

`hooks/lib/review-coverage.ts` now exports `REVIEW_SENDERS`, `reviewSender(name)` and
`isMeasuredReview(name)`. `reviewFiles()` filters on the last of those and
`measureReviewCoverageForModel` in `hooks/tracker.ts` calls the same function on the written path's
basename, so scan and trigger read one set rather than two literals. The split is disjoint and
complete over every name a reviews store can hold:

```
name in a reviews store
├─ sender segment recognised        → measured        (a mandate covers it)
├─ sender segment parses, unknown   → excluded        (no mandate can ever cover it)
└─ no sender segment at all         → KEPT and named  (nothing says either way)
```

The third branch is the one the record insisted on: silently dropping a file the mechanism cannot
classify is the opposite defect, so it is listed with the reason and contributes no coverage.

**3. `parseNotOpened` misread prose.** `none of the prompt files` matched `/^none\b/i` and was
recorded as *nothing excluded* — a declared exclusion reaching the reader as an absent one. And
anything else fell through to a comma-split, so `nothing left unopened` became the file list
`["nothing left unopened"]`, which `coverageSentence` handed the orchestrator as the next
dispatch's scope.

The `none` branch now takes the bare word or `none` followed by punctuation, so
`none — everything was opened` still passes and `none of the prompt files` does not. The
comma-splitting fallback is replaced by a `raw` field carried verbatim, with `files: []`.
`ReviewRow` gained `notOpenedRaw`, `renderReview` prints it as `(unparsed) <value>`, and the
`carried` source deliberately skips a row that has one: `carried=` is a scope the next dispatch is
told to open, and a sentence is not a scope. The reviewer's statement is not lost — it appears on
that review's own row, as a statement.

## Verification

`cd hooks && npm test` — exit 1, one failing assertion:
`surface-growth-bound.test.ts > matches the checked-in golden, surface by surface`. That golden is
a per-file inventory of the bounded surfaces and goes stale on any edit to one; the dispatch named
it as expected and told me not to regenerate it. Its diff shows my two prompt edits (+61 bytes
each) alongside concurrent tasks' changes to `agents/orchestrator.md`, `curator.md`, `playmaker.md`
and `shaper.md`. Every other assertion passes: 763 passed, 1 failed, 40 files.

The growth **bounds** themselves pass. `agents/` reads 405 066 bytes against a budget of 417 843;
the hook-test line bound passes with roughly 2 100 lines of head-room left.

Each defect is pinned by a test that fails against the pre-fix tree. Verified rather than asserted:
HEAD's `hooks/lib/review-coverage.ts`, `hooks/tracker.ts`, `agents/coderev.md` and
`agents/ontorev.md` were restored in place, the new cases were run, and the fixed sources were put
back. Seven cases in `review-coverage-mandate.test.ts` and four in `review-coverage.test.ts` failed
in that state and pass now.

## Deltas, against the dispatch's stated head-room

| Surface | Change | Note |
|---|---|---|
| `agents/coderev.md` | +61 bytes | 13 257 → 13 318 |
| `agents/ontorev.md` | +61 bytes | 11 234 → 11 295 |
| `agents/` total | **+122 bytes** | of about 17 300 head-room |
| `review-coverage.test.ts` | +127 lines | 677 → 804 |
| `review-coverage-mandate.test.ts` | +58 lines | 278 → 336 |
| hook tests total | **+185 lines** | of about 2 300 head-room |

**The test delta is 185 lines against the records' estimate of roughly 25, and that is worth stating
plainly rather than burying.** The estimate assumed the smallest possible pin. What was written is
larger for a reason that was a choice: each defect is pinned twice, once as a unit case on the
exported parser and once end-to-end through the real CLI against a throwaway git repository, and
the second half is what would have caught defect 1, whose unit-level symptom is invisible. Each
end-to-end case costs about 30 lines — a repository, a state file, a review file, the assertions
and the failure message this suite gives every case. One trimming pass took 10 lines of prose back
out of the failure messages where the code comment above already said it. If a later cleanup wants
the number down, the four end-to-end cases are the material, and dropping them trades the
integration coverage back for the estimate.

## Files changed

- `agents/coderev.md`, `agents/ontorev.md` — the placement rule
- `hooks/lib/review-coverage.ts` — `headerField`, `REVIEW_SENDERS` / `reviewSender` /
  `isMeasuredReview`, `reviewFiles`, `parseNotOpened`, `ReviewRow.notOpenedRaw`, `renderReview`,
  the `carried` source selection
- `hooks/tracker.ts` — the trigger reads the shared population test
- `hooks/lib/__tests__/review-coverage.test.ts`,
  `hooks/lib/__tests__/review-coverage-mandate.test.ts` — the pins
- The three issue records, closed with `Resolved:` notes and renamed `_o_` → `_c_`

`hooks/dist/` was rebuilt by `npm test`, which is how that directory is maintained.

## What I did not do

I did not touch `hooks/review-coverage.ts`, the CLI main, which the dispatch placed out of scope.
That constrained one design choice and it is worth recording: the CLI renders `carried=` as `none`
whenever a source review exists with an empty file list, so letting an uninterpretable value become
the carried source would have printed `carried=none` — a false claim of the exact kind being fixed.
Skipping such rows in the source selection keeps that line truthful from inside the library. The
cost is that `carried=(not recorded)` now covers two cases, "no review carried the field" and "no
review carried it in a form this can read", and the review's own row disambiguates them one line
above. A future pass with the CLI in scope could give the report a `carried-raw=` line instead.
