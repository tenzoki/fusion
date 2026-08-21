# coderev: review gate R1 — the repunctuation and the repaired Step 0e

**Reviewed-range:** `7832553..c226949`
**Not-opened:** none

**Date:** 2026-08-21
**Agent:** coderev
**Circle:** `circles/260820-2051-style-rules-arrive-and-get-measured`
**Dispatched by:** user, as review gate R1, which the plan places before the Circle's reconciliation
**Coverage before this pass:** `bin/fusion-review-coverage --since d66763b` reported
`commits=3 reviews=0 uncovered=3 verdict=uncovered`. The range stated above starts one commit
earlier, at `7832553`, so that it tiles exactly against the Turn 1 review's `7135a19..7832553` and
leaves no gap at `d66763b`, which that review's own range excluded.

## Summary

**The repunctuation did not reproduce the earlier pass's two substantive defects, and it did
reproduce its third.** No replacement sentence opens with a bare demonstrative or pronoun, in any of
the four files; that criterion passes cleanly and the checking behind it is sound. Mark strength
holds at 152 of the 155 replacements. What did recur is the evidence-record class: `b393a45`'s
history record states three commas where five were made and claims a property for them that fails at
one site, which is the same defect as the still-open `260821-0149` from Turn 1 and its ancestor
`260816-1330`. Separately, the two commits applied two different standards to heading renames in the
same Turn, and two workbench citations are dead as a result. Step 0e's repair is real: both High
findings are genuinely closed and the reasoning for its fallback shape holds under test. It carries
the guard forward into one of its three blocks and leaves the step's own reporting contract without
the outcome that guard emits.

## Totals

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 0 |
| Medium | 3 |
| Low-Medium | 1 |
| Low | 2 |

Six issue files were filed in this Circle's issue store, `260821-0257` through `260821-0302`.

## The question this gate exists to answer

The plan's R1 section names three things the acceptance criteria cannot check mechanically: a
replacement that weakens the clause it replaced, a replacement sentence opening with a bare
demonstrative, and a mark removed from a region that was an exhibit rather than prose. All three were
checked independently rather than received.

**Vague pronoun openers: passes, across all four files, with nothing to file.** Fifteen sentence
splits were made in the range (four in `b393a45`, eleven in `c226949`). Their openers are `Read`,
`And` ×9, `The rule`, `Never`, `The answer`, `The underscore`, `No second file`, `If interrupted`.
None is a demonstrative or a pronoun. This was verified by a separator-level diff rather than by
reading the record: the token streams before and after are identical in every file, so every
replacement is a pure mark substitution and the split sites are enumerable exactly.

**The extra check both records offer for this criterion cannot fail, and is worth naming as such.**
Each record states that the sites which took a *colon* were also checked for the same figure, and
`c226949` states that at each of eight such sites "the em-dash was already followed by that same word
in every case". That is true, and it follows necessarily from the token-stream identity the same
record proves two sections later: if no token moved, the word after a replaced mark is by
construction the word that was after the em-dash. It holds at all 155 sites, not at eight. The check
is sound; presenting a consequence of the invariant as an independent measurement slightly overstates
what was established.

**Mark strength: 152 of 155 hold. Three cost something, at different sizes.** The four commas in
`rules/fusion-workbench-conventions.md` are exactly as the record describes them, all four
non-clause-boundary, and I confirmed each against the pre-edit file. The five in
`rules/critical-stance.md` are not as its record describes them (issue `260821-0257`), and one of the
five, at `:47`, puts a comma where an independent clause follows. Four newly stacked colons
(`260821-0300`) and one lost table parallelism (`260821-0301`) are the rest.

**A mark removed from an exhibit: one site (`260821-0259`).** `rules/critical-stance.md:12` is a
quoted specimen of AI flattery and its em-dash is part of the register on display. It was
repunctuated while the German specimen five lines below kept its mark. The file's permit is 1 and it
is spent, so this was a forced choice between two identical objects, made without saying so.

## Findings by theme

### A. The word-invariance evidence — sound, and stronger than the record claims

**Reproduced independently and exactly.** A token stream over `[^\W_]+` with case preserved returns,
per file: `rules/agent-setup.md` 562/562 with one changed position (`read` → `Read`);
`rules/decision-record-examples.md` 670/670 with none; `rules/critical-stance.md` 1 619/1 619 with
three; `rules/fusion-workbench-conventions.md` 9 047/9 047 with eleven. Every differing position is
case-only, every one upward. No word was added, removed or substituted anywhere in the range.

**Is a multiset comparison sufficient for the hyphen?** Not in principle. A multiset is
position-blind: two hyphenated forms could swap places and the multiset would not move, while the
token stream would not move either, because both edits fall inside the same blind spot. That case is
contrived and could not arise from a mark substitution, but the stronger check costs nothing, so I
ran it. **The hyphen-joined *sequence*, in document order, is identical on both sides** of both
repunctuating commits: 251 occurrences over 136 forms in the conventions file, 28 over 25 in
`critical-stance.md`. The conclusion the record reaches is correct and the evidence for it is
available in a form that is not merely sufficient by luck.

**A second blind spot nobody named, and it is larger than the hyphen.** The tokenisation treats every
non-alphanumeric character as a separator, so it is blind to **all markup**, not just the hyphen. A
removed pair of asterisks, a dropped backtick, a stripped `_` from a marker (`_o_` → `o`), a deleted
`#` from a heading — none of these moves a single token. In a file whose entire subject is
underscore-delimited marker vocabulary and backticked path literals, that is the failure mode that
would matter, and neither record measures it. The earlier pass did: the review of `6049d3e` recorded
a full character inventory (`*` 246, backtick 124, `"` 88, `_` 41, `#` 38, `>` 35, `|` 18, hyphen
184, all byte-stable), and that instrument was not carried forward here.

**I ran it, and it passes on all four files.** For each of `*`, backtick, `"`, `_`, `#`, `>`, `|`,
`<`, `-`, `─`, `→`, `[`, `]`, `(`… the counts are unchanged across every commit in the range, with
one exception per file that is the intended one: only `—`, `:`, `,`, `.`, `(` and `)` move, and `(`
and `)` move by equal amounts. So the pass is clean on the axis nobody checked. The instrument is
what is missing, not the property.

### B. The commas, and the record that describes them — `260821-0257` (Medium)

`b393a45`'s record: "Three commas were used, all in `rules/critical-stance.md`, and every one sits on
an `X, not Y` correlative appositive … No comma was used anywhere a clause boundary was at stake."

Five were used. `:5`, `:29` and `:51` are the described construction. `:38` (`…what you are
**guessing**, and label the last two`) coordinates two imperative clauses and carries no `not`.
`:47` is the section heading `## 4. A case split is disjoint and complete, or the question is cut
wrong`, where `the question is cut wrong` is an independent clause, so the sentence the record's
last quoted clause denies is exactly what happened there.

The character inventory confirms the count without reference to either record: `,` moves 97 → 103 in
that file, six of which are accounted for as five replacements plus one comma arriving with a
closing parenthesis.

**The sibling commit got this right.** `c226949` names its four commas individually with their line
numbers and the construction each sits on, and all four check out. The difference between the two
records is not care in general — both are careful — it is that one enumerated and one summarised.

### C. Six headings renamed with no census — `260821-0258` (Medium)

`c226949` kept four em-dashes because 61 citations depend on the heading spellings that carry them,
and probed each one to find which were gate-protected. `b393a45`, twenty-five minutes earlier,
renamed six headings across two always-on rule files and its record does not mention headings at all.

Two workbench citations now resolve to nothing, both to `## 4. A case split is disjoint and complete
— or the question is cut wrong`: one in the backticked `` `## …` `` citation form at
`circles/260807-0923-guard-misst-statt-orakelt/planning/260807-0931_c_plan-guard-misst-statt-orakelt.md:288`,
one in prose at that Circle's `history/260807-0955-coder-s8-mece-prinzip.md:11`.

**Why nothing went red, stated as mechanism.** `reference-resolution-lint.test.ts:143-190` builds its
corpus from the shipped tree only; `fusion-workbench/` is on none of its roots. The sibling gate,
`workbench-citation-lint.test.ts`, does read the workbench but resolves paths, not heading anchors.
So a heading citation originating in a workbench record is unprotected by construction — which is
the general exposure `260821-0250` already files, and this is the instance of it firing.

### D. The six kept marks — the probe confirmed, by reading rather than by breaking

`c226949`'s claim is that of the four kept headings only the first is defended by a gate. I did not
break the headings (the working tree is not mine to edit); I established the same result from the
code, which is stronger because it says *why*.

- `## Issues vs Decisions — when to use which` is cited **in full** at `agents/curator.md:159`, a
  file inside the gate's corpus. `scanHeadingAnchors` at `reference-resolution-lint.test.ts:848`
  resolves by `h === headingText || h.startsWith(headingText)`, so a change to the em-dash breaks the
  prefix and the citation fails. **Protected. Confirmed.**
- `## State Markers — issues and planning`, `## State Markers — decisions` and
  `## Issue and Decision Filing — MANDATORY` are cited only from workbench records and from two hook
  **test** comments. `surface()` reads `hooks/lib/*.ts` and `hooks/*.ts` non-recursively, so
  `hooks/lib/__tests__/` is out of scope entirely, and those two files carry `recordsOnly: true` in
  any case, which excludes anchors. **Unprotected. Confirmed, and the reason is structural rather
  than incidental.**

**One correction to the record, folded into `260821-0258` rather than filed alone.** It says of
`## Issue and Decision Filing — MANDATORY` that "no shipped file names it". `agents/planner.md:65`
cites `` `## Issue and Decision Filing` ``, a prefix of it. Because the matcher is a prefix match the
conclusion survives — that citation would resolve whatever the suffix became — but the sentence as
written is false, and it sits in the record's own evidence table.

**The finding about which gates are asleep is worth more than the finding that produced it, and the
project already knows that**: it is filed as `260821-0250` with acceptance criteria that ask for the
load-bearing set to be derived rather than listed. Nothing here weakens it.

### E. The repaired Step 0e — `260821-0302` (Medium / Low)

Read as a reader who pastes the three blocks.

**Both High findings are genuinely closed.** `$FUSION_SRC` appears nowhere in Step 0e; each of the
three blocks resolves the root itself. `absent` is gone, replaced by `case5-missing-local` and
`case6-missing-shipped`, both inside the enumeration at `skills/setup/SKILL.md:210-211` and both
routed into the Done report at `:240` by name. **The two new cases are reported.** The precedence
paragraph was extended to cover them and states the branch order for the case where both hold.

**The pre-assigned fallback holds under the case it was designed for, and I traced it.** With
`bin/fusion-source-root` present but exiting non-zero, `[ -x … ]` is true, so the command
substitution runs and yields the empty string, `SRC` is overwritten with it, and `:188` skips the
step. A present-but-failing helper therefore cannot leave `SRC` silently pointing at
`$FUSION_PLUGIN_ROOT` and compare against the wrong copy. The reason given for the shape is the
behaviour the shape produces.

**Part 1 — the skip is missing from the reporting contract.** `:188` emits `source-root-unresolved`,
an eighth token the "seven cases" at `:203` does not contain. Unlike `absent`, it is covered in prose
at `:181`, so this is not a recurrence of `260821-0141`. What is missing is the other end: `:240`,
the sentence that tells an agent what to put in the Done report, names four outcome classes and not
this one, and the obligation to report it sits 59 lines earlier inside a paragraph about root
resolution. This is the one outcome where every other outcome is unknown, so the step's whole result
goes unreported.

**Part 2 — one of three blocks checks the root it resolves.** `:181` states the property at step
scope; only the classification block implements it. The stamp block at `:227-233` resolves `SRC` and
does not test it, and with `SRC` empty it appends a line whose checksum field is empty, which the
next run reads back as a non-checksum and classifies `case4-conflict` — permanently, since Setup is
the only reader and writer of `.asset-provenance`. Reachability is low: an agent following the prose
skips the step. It is nonetheless the same guard asymmetry the Turn 1 finding was about, in a file
that states at `:26` that each block is pasted into its own shell and cannot see the previous one's
decision. **The executor saw this failure mode** — the session record names the empty checksum as
"worse than failing" — and closed half of it, by giving the block its own resolution but not its own
test.

**Still open and unchanged at HEAD:** the unguarded `cp` at `:223` and the stamp-hashes-the-source
pairing that `260821-0148` part 1 names. Not refiled.

### F. Two smaller marks — `260821-0300` (Low), `260821-0301` (Low)

Four replacements stack a second colon inside one sentence (`rules/fusion-workbench-conventions.md:84`
and `:343`, `rules/critical-stance.md:34`, `rules/agent-setup.md:40`), which is the exact condition
`c226949`'s record gives as its reason for using a full stop at eleven other sites. These were found
by taking the set difference of multi-colon sentence units before and after; they are the only newly
created ones in the range.

The decision-marker table at `:316-320` now reads `Marker: gloss` in four rows and
`Marker. Sentence` in the fifth. The record names that row and defends the stacking argument behind
it, correctly, and does not name the parallelism it cost. A fix exists that satisfies both: move the
colon out to the marker position and the internal colon down to a full stop, one capital, no word.

## Cross-cutting observations

**1. The discipline was invented mid-Turn and not back-applied.** `b393a45` (02:17) enumerates its
splits and summarises its commas; `c226949` (02:42) enumerates everything, names every kept mark,
runs a citation census, probes the gates, and files the contradiction in its own acceptance criteria.
The second is a materially better piece of work than the first, on the same task, twenty-five minutes
apart. Both of this pass's Medium findings are in the first commit, and both are things the second
commit's method would have caught. Nothing in the Turn's process makes a discovered discipline
retroactive.

**2. Two defect classes are separating cleanly, and it says where to spend effort.** The
*text* defects are gone: no pronoun openers, mark strength holding at 152 of 155, no word moved on any
of three independent invariance checks. The *record* defects are not: `260816-1330` (a count nobody
can reproduce), `260821-0149` (a count that does not reconcile with its own table), and now
`260821-0257` (a count that does not reconcile with the file). Three passes, three arithmetic slips
in the evidence paragraph, zero in the prose. Whatever mechanism this project builds next for the
repunctuation programme should count the replacements rather than ask the executor to.

**3. The evidence instrument regressed between passes and nobody noticed, because the property
held.** The `6049d3e` review established word-invariance with a token stream *and* a full character
inventory. These two passes carry the token stream and a hyphen check, which is a narrower
instrument, and the record argues the hyphen is the blind spot when markup is the larger one. The
inventory would have taken one command. It passes, so nothing was lost this time; the check that
would notice a lost backtick in a file of path literals is simply not in the method any more.

**4. Every finding in this pass sits one level above the change itself.** Same shape as Turn 1's
observation 4. The four files at HEAD are correct, measure `ok` per file and in total, and the
suite's only red is the one my own issue files created by citing this review before it existed. What
is wrong is the account of what was done, the scope of what was checked, and the reporting contract
at the far end of a step whose classification is now sound.

**5. The `skills/` budget blocks the Step 0e fix, and that is a sequencing fact rather than a
preference.** `skills/` measures 240 409 against a budget of 240 439: **30 bytes**. Both halves of
`260821-0302` add text to `skills/setup/SKILL.md` and would redden the growth bound. The way out is
authored once, in `hooks/lib/__tests__/helpers/growth-bound.ts`, and it is a cut. This should be
decided before an executor discovers it with a red suite.

## Recommended sequencing

**Before this Circle closes.** `260821-0257` and `260821-0258`, both Medium, both corrections to the
record and to text this Circle wrote. `260821-0257`'s `:47` half needs a judgement rather than a
substitution: the mark that preserves the disjunction is a semicolon, which is not on the four-mark
list at `rules/user-facing-output.md:130`.

**With steps 13 and 14.** `260821-0259`. The clean fix is structural, not another mark choice: move
the `Before:` / `After:` specimens into block quotes, which `bin/fusion-prose-metric` excludes and
which `rules/user-facing-output.md` already uses for its own anti-examples. Both specimens then keep
the em-dash that makes them specimens and the file's permit goes unspent. That is the same surface
steps 13 and 14 open anyway.

**Behind a `skills/` cut.** `260821-0302`, both parts. 30 bytes of head-room is not enough for either.

**Cleanup, unsequenced.** `260821-0300`, `260821-0301`.

## References

- Range reviewed: `7832553..c226949`, 4 commits. `bin/fusion-review-coverage --since d66763b`
  reported `uncovered=3 verdict=uncovered` before this pass; the range above extends one commit back
  so that it tiles with the Turn 1 review's `7135a19..7832553` and leaves `d66763b` covered.
- Issues filed: `260821-0257`, `0258`, `0259`, `0300`, `0301`, `0302`, all under this Circle's issue
  store. `260821-0302` carries two parts.
- Measurements taken: `bin/fusion-prose-metric` over the six files `bin/fusion-rules coder` emits,
  returning `8 / 12 963 / 0.6` against a permit of 12 with every file `ok`; separator-level diffs of
  all four repunctuated files against their pre-edit versions; hyphen-sequence and character-inventory
  comparisons on the same pairs; the `skills/` growth arithmetic from
  `hooks/lib/__tests__/surface-growth-bound.test.ts:286-299` and `:354`.
- Pre-existing open records this pass judged against:
  `shared/issues/260816-1330_*_the-repunctuation-replaced-three-em-dashes-with-three-vague-pronoun-openers-the-same-blacklist-bans.md`,
  `shared/issues/260816-1330_*_two-of-the-twenty-nine-replacements-chose-a-mark-weaker-than-the-clause-it-replaced.md`,
  `shared/issues/260816-1330_*_the-repunctuations-evidence-paragraph-carries-a-token-count-nobody-can-reproduce-and-an-inverted-capitalisation-claim.md`,
  and this Circle's `260821-0147`, `260821-0148`, `260821-0149`, `260821-0250`.
- Deliberately out of scope: `rules/user-facing-output.md`, which steps 13 and 14 repunctuate. It
  measures 1 in 2 248 words against a permit of 2, and that mark is inside its own anti-example.
- Workbench records read as context and not reviewed: the Circle record, the spec, the plan, the ten
  decisions, the two analyses, and the three history files of this Turn.
