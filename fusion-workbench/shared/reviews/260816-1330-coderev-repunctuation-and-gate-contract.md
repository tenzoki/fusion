# Code review: the repunctuation of the always-on style rule, the gate contract, and the records commit

**Sender:** coderev
**Reviewed-range:** `b18a8cf..6049d3e`
**Not-opened:** none
**Date:** 2026-08-16
**Dispatched scope:** `4921026`, `52b8665`, `6049d3e`. The prior pass covered `433e206..b18a8cf` with `not-opened=none`, so `carried=none` and no inherited scope was added. Confirmed with `bin/fusion-review-coverage --since b18a8cf`, which reported `carried=none` and three uncovered commits.

## Summary

The central claim of `6049d3e`, that it repunctuated `rules/user-facing-output.md` without rewriting it, **holds**, and holds under a stronger test than the one the commit offered. The two exclusion calls are sound, though the stated reason for one of the six retained em-dashes is wrong while the call itself is right. Five findings, all Low or Medium, none blocking: three concern the marks the pass chose, one concerns a new normative clause that is ambiguous about a line count six lines above a binding line cap, and one concerns the accuracy of the evidence the pass recorded about itself. The fixture regenerations are clean and `RULE_BASELINE` is untouched in both. The full hook suite passes, 764 tests across 40 files.

## Totals

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 0 |
| Medium | 2 |
| Low | 3 |
| Verified, no defect | 4 |

Five defect files were written and two `Also seen:` lines were appended to existing open records. They are listed at the end.

## 1. The repunctuation claim, verified

**Verdict: the claim holds.** No word was added, removed, substituted or reordered.

The commit's own method was a normalised token-stream comparison. I did not reuse it. I ran seven independent tokenisations of `git show 52b8665:rules/user-facing-output.md` against `git show 6049d3e:rules/user-facing-output.md`, each with a different treatment of hyphens, apostrophes and internal punctuation, and every one returned an identical **stream**, not merely an identical count. A stream comparison rules out reordering, which a bag comparison would not.

```
strip all non-alphanumeric        2701 / 2701   identical
whitespace split, strip edges     2513 / 2513   identical
\w+                               2693 / 2693   identical
[a-z0-9]+                         2710 / 2710   identical
word + apostrophe                 2692 / 2692   identical
strip punct, keep word chars      2693 / 2693   identical
keep internal ' and -             2599 / 2599   identical
```

A second, independent check closes the gap a token comparison leaves. Normalisation hides markup, so I compared the raw character inventories. Every markup character is unchanged: `*` 246, backtick 124, `"` 88, `_` 41, `#` 38, `>` 35, `|` 18, `─` 14, `<` 9, `→` 9, and **hyphen 184 on both sides**, which rules out a compound word being split or joined. Only the sanctioned marks move:

```
—  38 → 6      .  178 → 188     :  55 → 64
(  56 → 62     )  56 → 62       ,  210 → 215     ;  7 → 8
```

The case-sensitive comparison returns ten tokens gaining a capital and none losing one, matching the ten sentence splits. The periods move by exactly ten. The arithmetic of "32 dashes removed in 29 replacements" is consistent: three of the replacements dissolved a paired parenthetical, taking two dashes each.

**On logical force, clause by clause.** Twenty-seven of the twenty-nine replacements preserve it. A comma or a colon that replaces an appositive dash preserves the appositive; a sentence split that replaces a consequential dash loses the explicit subordination, but the juxtaposition recovers it and `rules/user-facing-output.md:130` names "two sentences" as one of the four permitted replacements, so the file itself accepts that cost. Two do not preserve it, and they are filed:

- **`rules/user-facing-output.md:112`** moved the closed set of effort units from an appositive to a parenthesis, inside the clause that says "The phrasing is locked". A parenthesis reads as removable and an appositive reads as definitional, and this is the only place the three units are written down. A colon preserves the force and is on the permitted list. This is the single site in the change where a clause's binding strength moved.
- **`rules/user-facing-output.md:121`** replaced the boundary between the exemplar and its commentary with a comma, in a line that now carries four commas. The reader can no longer see where `Bundle A: 6 steps` ends. Parentheses would be clean.

**A third mark-choice finding, of a different kind.** Three of the ten new sentences open with a bare demonstrative or pronoun: `:22` "Those belong…", `:57` "It *is* the shorter form", `:83` "That forces the reader…". `rules/user-facing-output.md:18` lists "vague pronoun openers" in the blacklist four lines above the first of them, and `fusion-workbench/stilwerk/chat-voice-de.yaml:104-112` (AI05) bans the figure. The pass's own premise, that the file conditions the register it is read in, applies to this figure exactly as it applies to the em-dash, so the pass moved one blacklisted figure into another rather than out of the file. A colon at `:22` and `:83` and a comma at `:57` remove the dash without creating the opener. Ranked honestly: `:83` is the clear case, `:22` the same shape, `:57` the weakest because its antecedent is adjacent.

## 2. The exclusions

**Six em-dashes remain, at `:21`, `:33`, `:130` twice, `:141` and `:182`.** That matches the commit's account exactly and matches the progress note on the open record.

**The two mentions at `:130` are correct beyond argument.** They are the code spans in "Scan for `` `—` `` used as a parenthetical break" and "One `` `—` `` per ~1000 words is the ceiling". Removing them removes the clause's subject.

**Three of the four exhibits are correct.** `:33` (the German Before block), `:141` (the canonical anti-example) and `:182` (Example 2's Before block) are each the "Before" half of a Before/After pair whose caption names the em-dash as the fault on display. Repunctuating any of them leaves the After differing from the Before in nothing.

**The fourth exhibit is the right call for the wrong reason.** `:21` is the quoted sycophancy specimen inside "Answer, don't validate": *"Genau richtig — dein Sprachgefühl stimmt"*. The commit's stated ground, that repunctuating it "leaves the After differing from the Before in nothing", does not apply: the specimen has no After, and the fault it exhibits is sycophancy, not punctuation. The dash should nonetheless stay, on a stronger ground the commit does not give. The string is a verbatim quotation of `fusion-workbench/stilwerk/chat-voice-de.yaml` AI11's example list, where the same phrase appears with the same dash. Repunctuating the quotation desynchronises the rule from the profile it quotes. I would leave it and correct the reasoning if the record is ever revised.

**The three "After" occurrences were rightly put in scope.** I checked the claim they rest on. Example 1's Before block at `:155` carries no em-dash at all and its caption claims "cryptic, jargon-heavy, no clear user action", so no contrast rested on the dashes at `:160` and `:167`. The Effort estimates Before at `:119` likewise carries none. And the two occurrences of "Session complete…" at `:61` and `:160` were changed **consistently**, which matters more than either change alone: an exemplar quoted twice that differs between its two appearances is worse than either form. I would not restore any of the three.

One accounting nit. The commit says "three occurrences in After blocks". Four lines in an After role changed: `:61`, `:121`, `:160`, `:167`. `:61` is an inline exemplar in `## Information architecture` point 1 rather than an After block, so the count depends on whether it or `:121` is being excluded. Nothing turns on it.

## 3. The two new bullets in `52b8665`

They joined `## Questions and gates` at `:87` and `:95`. Read against the section, they fit: the section required three properties of a query and nothing about consequence, and the first bullet's claim that a response moment is either a question or an explicit nothing is the shape `## Information architecture` point 1 already implies for status reports.

**They contradict nothing in the file directly. One of them is ambiguous about something the file caps six lines later, and the ambiguity decides whether there is a contradiction.**

`:95` reads "Carry it in the `AskUserQuestion` option `description` field, or on the option's own line when the gate is plain chat text." Either the foreclosure is appended to the option's existing line, costing nothing, or it takes a line of its own per option. `:101` caps a gate prompt at "≤ 8 lines including the question and the option list" and `:107` says "Do not relax the cap", with no escape, because the option list cannot be moved to Details. Under the second reading a four-option chat gate needs nine lines. The user was told the cost is "roughly one line per option" (`shared/history/260816-1251-curator-run.md:332`), so the approval was given against the second reading, and the text does not say it.

**A related hole on the branch the clause prefers.** `## Length:103` caps the option **label** at four lines and says nothing about `description`. The clause's preferred branch therefore writes mandatory content into the one field no cap governs.

**On the disputed cap itself, the disclosure to the user names the wrong number as in force.** The run file says the dispute is between `rules/user-facing-output.md:99` at 8 lines and "the always-on chat profile, which says 6". `bin/fusion-rules` emits `./fusion-workbench/stilwerk/chat-voice-de.yaml`, whose C04 at `:41` reads 8 and 12. The 6 lives in `stilwerk/chat-voice-de.yaml:41`, the shipped copy that nothing emits, which is the separate open defect `260814-1419_o_the-shipped-chat-voice-profiles-changed-…`. So the two always-on surfaces agree at 8. The user's conclusion is unaffected, since the arithmetic fails at 8 too; the ledger entry for an override taken outside the evidence rules is not.

**On the override itself, the record is honest and I have no criticism of it.** Section 9 of the run file states that neither entry carries an evidence tier, that none was assigned retroactively, what the user saw before approving, and, in its closing line, that the curator did not observe the gate and is relaying what the apply dispatch reported. That last qualification is what makes the one inaccuracy above correctable rather than contested. The curator's three substantive departures from the record's proposed wording are also right: cutting the "menu without prices" aphorism, declining to assert what an external schema documents, and adding the anti-restatement sentence.

**One observation, not a defect.** The curator's own verified correction is that `## Information architecture` point 1 already binds gate prompts, so the first new bullet restates an existing binding for salience at 348 bytes on every dispatch of every agent. The user approved it knowing that. Worth remembering when the universal-core head-room is next counted.

## 4. The fixture regenerations

**Both are clean.** Classifying every changed line in each diff:

```
52b8665:  15 × user-facing-output.md   15 × total   (each ±)
6049d3e:  15 × user-facing-output.md   15 × total   (each ±)
```

Fifteen stanzas, which is every role in the golden, and no other file's entry moved in either. The values chain correctly: 16 788 → 17 546 → 17 455, and 17 455 is `wc -c rules/user-facing-output.md` at HEAD.

**`RULE_BASELINE` is untouched in both.** `git diff 52b8665^ 6049d3e -- hooks/lib/` reports one file changed, the golden. `RULE_BASELINE` lives in `hooks/lib/__tests__/rules-emission-golden.test.ts:460` and its `user-facing-output.md` entry still reads 16 784, the 2026-08-14 arming value. Neither commit moved a baseline, which is the rule in `hooks/lib/__tests__/helpers/growth-bound.ts`.

**The head-room claim checks out.** `52b8665` says 8 112 bytes of 12 000. Universal core at that commit sums to 90 461 against a baseline of 86 573, leaving 8 112. At HEAD it is 8 203, since the repunctuation gave 91 bytes back.

**The split into two commits was right.** Two independent defect fixes did not share a commit, and the second regeneration is the whole cost.

**Full suite green:** 764 tests, 40 files, all passing.

## 5. The records commit, `4921026`

The nine records land correctly. Two checks are worth recording.

**The corpus figures in the progress note are exact.** Re-measured at HEAD with the record's own command over its own seven files: 22 871 words, 340 em-dashes, 14.8 per 1000, against the table's 22 763 and 372 at 16.3. The record's decision to stay `_o_` is right, and its warning that a null result from the falsification measurement must not be read as falsifying finding 10 is the most valuable sentence in it.

**The decision record's header disagrees with its own filename.** `shared/decisions/260816-0740_a_does-the-prose-register-get-a-measurable-gate-and-which-surface-does-it-measure.md` carries the `_a_` marker and `**Status:** open` at `:5`. The template at `rules/fusion-workbench-conventions.md:491` mandates the field and `## State Markers — decisions` mandates the marker. This is not a new fault: re-measured across the whole workbench, **39 of 100 decision records disagree** (13 `_i_`/answered, 12 `_i_`/open, 9 `_a_`/open, 4 `_d_`/open, 1 `_s_`/open), and `4921026` made it 40. Three records carry a hand-correction inside the field itself, which is evidence the drift recurs and hand-correction does not hold it. No test file mentions `Status`; `marker-format-lint.test.ts` scopes to `agents/` and `skills/` and never reads the workbench. Appended to the existing open record rather than filed fresh.

## Cross-cutting observations

**The register defect and the citation-staleness defect are the same defect seen twice.** `52b8665` shifted every line below `:87` by two, and three citations went stale in one session, two of them inside one file. `shared/history/260816-1251-curator-run.md:288` records the curator noticing that an analysis cited the gate cap as `:101` when "it is at `:99` at this HEAD", and the commit that same run produced moved it back to `:101`. A correction made obsolete by its own change is the cleanest demonstration `260808-0030_o_` will ever get.

**Three of the five findings are about a record's account of itself, not about the code.** The token count nobody can reproduce, the inverted capitalisation claim, the wrong cap named as in force. Each is small; together they are the pattern `rules/critical-stance.md` §3 names, an unchecked claim carried in the position a checked one would occupy. Every one of them appears in a durable record rather than only in a commit message, which is where it costs something, because a commit message is read once and an open issue is read as a starting state.

**The pass's own honesty is the reason all of this was checkable.** `6049d3e` named its exclusions individually, named the judgement call it wanted checked, and said which record stays open and why. That is what made a real verification cheap rather than a re-derivation of the whole change, and it is why the verdict on the central claim is a verified yes rather than a shrug.

## Recommended sequencing

Nothing here blocks a release.

1. **Before the next repunctuation pass over another corpus file:** the three pronoun openers and the two weak marks, since both are lessons about mark selection that the next pass will otherwise repeat across six more files.
2. **Before the foreclosure clause is relied on at a real gate:** the line-count ambiguity. An agent writing a four-option chat gate today cannot tell whether it is over the cap.
3. **Whenever the records are next reconciled:** the evidence-paragraph corrections, the in-force cap in the run file, and the `Status` header on the new `_a_` record.
4. **Not now:** the 39-record `Status` drift needs a decision about mechanism before anyone writes a gate. A hard gate would fail on records nobody is going to edit, which is the shape `shared/decisions/260816-0740_a_*.md` option 2 already argues against for the output store. Head-room on the hook-test surface is 1907 lines of 2500 if a gate is chosen.

## Details

**Defects filed** (all in `fusion-workbench/shared/issues/`):

- `260816-1330_o_the-repunctuation-replaced-three-em-dashes-with-three-vague-pronoun-openers-the-same-blacklist-bans.md` — Low-Medium, `coder`
- `260816-1330_o_the-foreclosure-clause-does-not-say-whether-it-costs-a-line-per-option-and-the-cap-two-sections-below-forbids-relaxing.md` — Medium, `curator`
- `260816-1330_o_the-repunctuations-evidence-paragraph-carries-a-token-count-nobody-can-reproduce-and-an-inverted-capitalisation-claim.md` — Low, `coder`
- `260816-1330_o_the-override-record-names-the-shipped-chat-profiles-cap-and-the-copy-every-agent-loads-says-otherwise.md` — Low, `curator` or `reconciler`
- `260816-1330_o_two-of-the-twenty-nine-replacements-chose-a-mark-weaker-than-the-clause-it-replaced.md` — Low, `coder`

**Appended to existing open records** rather than refiled, per the duplicate check:

- `260812-1232_o_thirty-four-of-seventy-four-decision-records-carry-a-status-header-that-contradicts-their-filename-marker.md`
- `260808-0030_o_line-number-citations-into-rule-files-go-stale-and-no-gate-reads-them.md`

**Commands run:** seven-way tokenisation and character-inventory comparison of the two file versions in Python; `git show`/`git diff` over the three commits; `npm test` in `hooks/` (764 passed); `bin/fusion-review-coverage --since b18a8cf`; a marker-versus-`Status` sweep over all 100 non-archived decision records.

**Not verified, and named as such.** I did not observe the user gate and take the curator's section 9 account of it as reported, on that section's own qualification. I did not check whether any consuming project's rendered gate prompts actually exceed the cap; the arithmetic above is arithmetic, not a measurement of real output.
