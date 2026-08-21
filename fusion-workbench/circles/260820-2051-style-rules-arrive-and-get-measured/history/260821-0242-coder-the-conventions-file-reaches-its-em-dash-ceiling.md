# `rules/fusion-workbench-conventions.md` reaches its em-dash ceiling

**Agent:** coder
**Date:** 2026-08-21 02:42
**Circle:** `circles/260820-2051-style-rules-arrive-and-get-measured`
**Plan:** `circles/260820-2051-style-rules-arrive-and-get-measured/planning/260820-2324_*_plan-style-rules-arrive-and-get-measured.md`, step 12
**Status:** Complete

## What was done

One file, one pass, one commit's worth of edits. 109 of the file's 115 prose em-dashes were replaced with the four marks `rules/user-facing-output.md` prescribes: a comma, a colon, parentheses, or two sentences. Six were kept, and each is named below with the reason it earned the allowance. No word was added, removed or substituted. Marks inside fenced blocks, inline code spans and block-quote lines were not touched.

| | Before | After | Permit | Bytes |
|---|---|---|---|---|
| `rules/fusion-workbench-conventions.md` | 115 in 7 840 words | 6 in 7 738 | 7 | 57 371 to 57 055 |

`bin/fusion-prose-metric` is the authority for every count above. The ceiling is read per file, per `circles/260820-2051-style-rules-arrive-and-get-measured/decisions/260820-2314_*_is-the-em-dash-ceiling-read-per-file-or-across-the-always-on-corpus.md`.

## What each mark became

| Replacement | Count | Where it was used |
|---|---|---|
| Colon | 61 | Definitional glosses, label-and-gloss pairs, and strong breaks where the second clause explains the first. The default. |
| Opening parenthesis | 20 | 13 paired dashes wrapping a removable aside, plus 7 single dashes whose aside runs to a clause or sentence end. |
| Closing parenthesis | 13 | The partner of each paired dash. Four are followed by a comma, where the sentence continues with `not`, `even`, `but` or `and`. |
| Full stop (two sentences) | 11 | Where a colon would have been the second colon in one clause, or where the dash carried `— and` and a comma would have flattened the emphasis. |
| Comma | 4 | Only where no independent clause follows. |

**The four commas, stated in full, because the comma is the mark the second open record is about.** `:276` sits inside parentheses on the appositive `(decisions vocabulary, richer set)`. `:447` is the `X, not Y` correlative `after completing each plan step, not just at session end`. `:448` and `:449` each join two adverbial phrases in apposition (`after resolving an issue, before moving to the next task`) with no verb between them. In none of the four does a clause boundary sit at the mark, so no dash carrying a strong break became a comma.

## The two failure modes the first repunctuation pass introduced

Both open records were read before starting, and each replacement was checked against both rather than against a rule about replacements.

### Vague pronoun openers

`shared/issues/260816-1330_*_the-repunctuation-replaced-three-em-dashes-with-three-vague-pronoun-openers-the-same-blacklist-bans.md` asks that no replacement sentence open with a bare demonstrative or pronoun standing for a whole preceding clause.

Eleven sentence splits were made. Their openers are `And` (five times), `Never`, `The answer`, `The underscore`, `No second file`, `If interrupted`, and `And then`. None is a demonstrative or a pronoun.

The reviewer's correction to that record was respected: a pronoun opener is **not** created only by splitting a sentence, so every one of the other 98 sites was checked for the same figure as well. Eight of them are followed by `they`, `this`, `it` or `that` (`:17`, `:72`, `:88`, `:125`, `:181`, `:250`, `:286`, `:403`). All eight are colons, so in each the reader is still inside the sentence with the antecedent in front of the mark, and none opens a sentence. More decisively, the word was verified against the pre-edit file at each of the eight: **the em-dash was already followed by that same word in every case**, so the replacement created none of them.

### A mark weaker than the clause it replaced

`shared/issues/260816-1330_*_two-of-the-twenty-nine-replacements-chose-a-mark-weaker-than-the-clause-it-replaced.md` asks that a dash carrying a strong break become a colon or a full stop and never a comma, and that parentheses be used only where the bracketed text is genuinely removable.

The four commas are accounted for above and none carries a clause boundary. For the parentheses, the removability test was applied to each: in every one of the 20, the sentence stands complete and grammatical with the bracketed text deleted. The record's own `:112` case, a *definitional* appositive that must not read as illustration, was met with a colon rather than parentheses wherever the appositive ends a clause. `:239` is the worked instance: `all mean the same thing — not declared — and then` became `all mean the same thing: not declared. And then`, so the definition keeps its force and the coordinated clause becomes its own sentence, instead of the parentheses that would have made the definition look optional.

## The six marks left standing

Four are section headings, and their spelling is an address other files hold.

| Line | Mark | Why it was kept |
|---|---|---|
| 170 | `## Issues vs Decisions — when to use which` | `agents/curator.md:159` cites it in the adjacent `` `file.md` `## Heading` `` form. Verified by experiment, not assumed: changing it turns `reference-resolution-lint.test.ts` red on that exact citation. |
| 290 | `## State Markers — issues and planning` | 15 files spell it this way, 17 occurrences: two hook-test comments and 13 live workbench records. |
| 310 | `## State Markers — decisions` | 20 live workbench records, 26 occurrences. The heaviest-cited of the four, and no shipped file names it. |
| 453 | `## Issue and Decision Filing — MANDATORY` | 11 live workbench records, 15 occurrences. No shipped file names it. |
| 284 | `\| Portfolio \| \`$PORTFOLIO\` \| fixed \| — \|` | The em-dash is a data cell, the not-applicable glyph in the State-marker column, standing where the other rows read `yes` or `no`. It is not prose punctuation, and replacing it would change the table's data rather than its marks. |
| 450 | `- When a review confirms a plan step, issue, or decision is done — the reviewing agent marks it.` | All four prescribed marks fail here. A comma would put a clause boundary on a comma in a line that already carries three, which is what the second open record forbids. A colon between a fronted `when` clause and its main clause is ungrammatical. A split leaves the `when` clause a fragment. Parentheses change the meaning. |

**One thing about the four headings has to be stated plainly rather than implied.** Only the first is protected by a gate. The other three were probed the same way, one at a time, and every test stayed green when they were changed. Their 58 occurrences across 46 files live in workbench records and in two hook-test comments, and no program resolves any of them. They were kept because 58 pointers would have gone quietly dead, which is exactly the citation drift `shared/issues/260808-0030_*_line-number-citations-into-rule-files-go-stale-and-no-gate-reads-them.md` tracks, not because anything would have caught it.

That is six of the seven the file's word count permits. The seventh was not spent: no remaining mark had a reason of this kind, and a mark kept for tidiness would be a mark kept for no reason.

## The contradiction in the step's own acceptance

Step 12 asks for the metric at or under seven **and** for the tables to be unchanged. 21 of the 115 marks are inside table cells, the word count is fixed because no word may change, so the permit stays 7 and freezing the tables puts the floor at 21. The two cannot both hold. The step was implemented under the structural reading of "unchanged" (same rows, same order, same cells, same data; mark-only edits inside a cell in scope), which is the only reading that satisfies both halves and the one the step's own "114 replacements" implies. Filed as `circles/260820-2051-style-rules-arrive-and-get-measured/issues/260821-0242_*_step-12s-two-acceptance-criteria-cannot-both-hold-because-21-of-the-115-em-dashes-are-in-table-cells.md`, with the three reasons that reading is the intended one.

## Evidence

**Token stream.** A token is a maximal run of Unicode letters or digits; every other character separates; case is preserved, so a sentence split shows as a changed token. 9 047 tokens before and 9 047 after, with eleven differing positions:

```
pos 1798  and   -> And     ... rule is origin not durability And that choice is load bearing
pos 2993  and   -> And     ... are this resolver s own And 3 collides fusion rules also
pos 4493  never -> Never   ... M LLMs have no clock Never guess or estimate the time
pos 4715  and   -> And     ... artifact language case by silence And it fell there wrongly The
pos 4859  and   -> And     ... that hides until someone forgets And what it produces is a
pos 5073  and   -> And     ... the same thing not declared And then Language governs both surfaces
pos 6684  the   -> The     ... does not move i Implemented The answer has been realised code
pos 7356  the   -> The     ... md is correct as written The underscore is not a metacharacter
pos 8106  and   -> And     ... filter or count changes behaviour And the filename still reads as
pos 8429  no    -> No      ... HHMM by agent one clause No second file no marker moves
pos 8958  if    -> If      ... final step of the session If interrupted before this completion state
```

All eleven are upward, and all eleven are the capital a sentence split takes. No word was added, removed or substituted.

**The hyphen blind spot, measured rather than argued.** The tokenisation splits at a hyphen, so a change inside a hyphenated word could in principle hide between two unchanged tokens. That was checked directly instead of reasoned about: the multiset of hyphen-joined words is identical on both sides, 251 occurrences over 136 distinct forms, with nothing present on only one side. No replacement touched a hyphenated word.

**Tables.** 58 rows before and 58 after, at the same line numbers, with the same per-row cell counts. Their tokens are 932 on both sides with one differing position, the `the` to `The` inside the `_i_` row at `:318`, where the cell already carried a colon and a second one in the same clause would have stacked. 19 rows changed, every one mark-only. The two marker-glob forms at `:349-350` are byte-identical.

**Growth bound.** `hooks/lib/__tests__/fixtures/rules-emission.golden` was regenerated with the documented command, and the only lines that moved are this file's size and the per-agent totals, each by 316 bytes. The always-on head-room went from 5 189 to **5 505** bytes: the core-only emission measures 93 068 against a budget of 98 573. This pass returned bytes rather than spending them.

**Suite.** `cd hooks && npm test` exits 0, 40 files and 718 tests.
