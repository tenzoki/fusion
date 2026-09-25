# Reconciliation — the style-rules Circle, before it closes

**Date:** 2026-08-21
**Agent:** reconciler
**Domain:** code
**Range:** `7135a19..247abfe`, 24 commits
**Tree:** clean. `npm test` green, 40 files, 718 tests.
**Circle:** `260820-2051-style-rules-arrive-and-get-measured` (`_t_`, the only active one)

Every claim below was re-run against the tree. Three executor number faults were already caught
inside this session by later passes, so nothing was accepted on report. A fourth is recorded here,
and one figure supplied by the Turn 1 review is corrected.

## Counts

| | |
|---|---|
| Plans reviewed / updated | 1 / 1 (marked Complete, `_o_` → `_c_`) |
| Specs reviewed / updated | 1 / 0 (stays `_o_`, see below) |
| Issues reviewed | 20 in the Circle, 96 in `shared/`, 2 in another Circle's store |
| Issues closed | 3 |
| Issues annotated and left open | 9 in `shared/` and other Circles, plus 18 re-verified in this Circle |
| Decisions reviewed | 10 in the Circle, 52 in `shared/` |
| Decisions transitioned | 0 (correct: all 10 open ones are the user's) |
| Reviews annotated | 2 |
| New records filed | 2 defects, 1 decision |
| **Discrepancies found** | **11** |

## The eleven discrepancies

1. **The plan header never left `Draft`**, against seventeen `[DONE]` step markings. Set to
   `Complete` in this pass.
2. **Step 6 was never marked `[DONE]`**, so the brief's "all 18 steps" was 17. The ontocoder left it
   unmarked at `403b91a` and was right to: criterion 1 asks all four profiles to carry the phrase
   "the long-form writing profile", and the fourth file was in no step's file list. `ca83e79` met it
   twenty-eight minutes later and nothing went back to the plan. Marked in this pass, with the
   evidence.
3. **Step 16's `Closes:` over-reaches on one of its two records.** The record asks for the progress
   note on `260816-0740_*_…em-dash-ceiling…md` to be corrected. The correction was
   written onto the reporting record instead, whose own closing paragraph says so. The
   unreproducible `2733` and the inverted capitalisation clause still read verbatim at
   `260816-0740_*_…:82`. Record stays `_o_`.
4. **Step 18's criterion 2 is false as written.** "No baseline was edited anywhere in the Circle" —
   `hooks/lib/__tests__/reference-resolution-lint.test.ts` `BASELINE` moved 1 223 → 1 247 → 1 254 →
   1 255 across three commits, each with a written attribution naming the token that moved it. Under
   the reading the criterion means, no **growth-bound** baseline moved: the diff of the three
   baseline-declaring files over the range is empty, and the two `.golden` files that changed are
   per-file inventories, which
   `260815-2322_*_can-a-commit-stand-green-on-its-own-when-the-golden-is-a-per-file-inventory-of-a-multi-file-turn.md`
   settles. Substance holds; wording over-claims.
5. **`## Where this Circle stops` clause 5 is not met.** The clause requires
   `260816-0740_*_…` to gain "the protocol's path". `grep -c '260820-2354'` on that
   record returns 0. Every citation of the measurement protocol is inside the Circle, three of the
   four in history or review files. The protocol names the decision record; the decision record does
   not name the protocol, and the missing direction is the one a later session needs. Filed as
   `260821-0413_*_the-decision-record-the-measurement-reports-on-does-not-cite-the-protocol-that-defines-it.md`.
6. **`## Where this Circle stops` clause 6 is not met.** Eighteen of the Circle's twenty issues are
   `_o_`. Two of the fifteen review findings are closed, both High; thirteen are neither closed nor
   deferred. Fourteen of the eighteen were re-verified reproducible at HEAD in this pass.
7. **The final-measurement note means two different sets by "always-on".** Section 4 reports +2 138
   over five rule files; section 5 calls a six-file corpus "always-on total, as `bin/fusion-rules
   coder` emits it". What a `coder` dispatch gained is **+2 265**. This is the fault class the
   Circle was opened on, recurring in its own closing artifact. Filed as
   `260821-0413_*_the-final-measurement-note-means-two-different-sets-by-always-on-and-its-headline-delta-is-the-smaller-one.md`.
8. **The Turn 1 review's head-room figure is stale by seven lines.** `260821-0144_*_the-authoritative-prose-metric-has-no-test-and-the-hook-test-surface-has-43-of-2500-lines-left.md` records 43 lines
   of hook-test head-room; it is **32** at HEAD, because `acef2ad` spent seven more on a second
   baseline re-approval comment. Corrected on the review file; the finding is unaffected.
9. **The Circle record's head field `**Active spec/plan:**` still reads `(none yet)`.** A spec and a
   plan both exist. Not repaired here: the Circle record is not a reconciler write target.
10. **The Circle record's `## Turn log` section is empty.** Both Turns are written up in
    `260820-2103-orchestrator-session.md` and neither reached the record. Not
    repaired here, same reason.
11. **The Circle record's `## Dependencies` calls `260819-1645-four-constraints-on-deep-change`
    active.** It closed at `5faed26`, before this session's first commit, so the claim was already
    stale when the shaper wrote it. Consequence: none. The Circle was and is the only `_t_` one,
    which is what makes the measurement's post-repair window empty, and that half of the reasoning
    is sound.

## What the 18 steps actually deliver

Fifteen steps hold in full on re-measurement. Two hold only under a reading their own text does not
state (steps 12 and 18, discrepancies 4 and the filed table-cell conflict `260821-0242`). One,
step 16, holds at the acceptance level and over-claims in its `Closes:` line. The per-step evidence
is in the plan's `## Reconciliation Log`.

The corpus repair is real and complete for the set the helper derives. Measured with
`bin/fusion-prose-metric`, every one of the six emitted files is at or under its own per-file permit:
`agent-setup.md` 0/488 permit 0, `fusion-workbench-conventions.md` 6/7 738 permit 7,
`decision-record-examples.md` 0/332 permit 0, `user-facing-output.md` 1/2 577 permit 2,
`critical-stance.md` 1/1 529 permit 1, `chat-voice-de.yaml` 0/628 permit 0. Total 8 over 13 292 prose
words, 0.6 per 1000. The four source profiles are 0, 0, 0 and 1/1 014 permit 1. Against the
260817-1836 reconciliation's 338 em-dashes over 23 542 words, this is the whole distance.

The distribution mechanism is real and was exercised on a real workbench rather than a scratch one:
`diff -r stilwerk fusion-workbench/stilwerk` exits 0 with no output, and `shasum -a 256 -c
.asset-provenance` inside the workbench reports `OK` on all four lines.

## Records closed

- `260816-1330_*_the-foreclosure-clause-does-not-say-whether-it-costs-a-line-per-option-…md`
  — both halves of its own *What would settle both* landed (`rules/user-facing-output.md:104` and
  `:112`), the arithmetic is written out at `:105` and reconciles against `## Length`, and its *What
  must not be done instead* holds: the 8-line gate cap at `:109` and the no-relaxing sentence at
  `:118` are untouched. Closed with the caveat that the numbers rest on an unconfirmed decision, and
  that a reversal returns as a `Revised by:` line rather than as a reopening.
- `260816-1345_*_the-register-defects-corpus-table-is-labelled-always-on-…md` — the
  derivation landed on all four live carriers in `b8b8f42`, appended beneath each mislabelled claim
  rather than replacing it.
- `circles/260820-2051-…/260820-2249_*_the-always-on-corpus-is-said-to-have-grown-…md` — both
  live carriers corrected, and nothing was made true by emitting the file, which the record forbids.

Each rename obliged a citation repair. Six literal `_o_` citations in four in-corpus records were
moved to the wildcard form and `workbench-citation-lint` re-run green. Eleven further literal
citations sit in history and analysis files, which are outside the gate's corpus and are records of
what was true when written; they were left, per the precedent `acef2ad` set in this Circle.

## Records that could not close, and why the executors were right

Three executors declined a `Closes:` this session. All three judgements are upheld on independent
evidence, and a fourth decline is added here.

- **`260814-1332_*_the-voice-profile-fallback-…md`** (plan step 4).
  The mechanism works: measured in a scratch project, a `de` project with only `-en` variants gets
  the `-en` path on stdout and `fusion-rules: voice profile chat-voice: requested variant de is
  absent, resolved to en` on stderr, and an `en` project gets the same stdout with an empty stderr.
  But `rules/fusion-workbench-conventions.md` `## Project language` still says the helper "emits only
  the resolved path", which `1c1178d` made false, and `1a36fe4` had already removed the history-line
  obligation the record's title is about. Closing would assert a reachable obligation where none
  stands.
- **`260807-2154_*_the-writing-profile-carries-no-handle-…md`** (plan step 6, item 2).
  Item 2 is done. Item 1, the `scope:` key, is a schema change to a file every consuming project
  copies, deferred by a decision the user has not seen. **New:** the cross-language residual the
  260821-0100-ontocoder-writing-profiles-carry-the-handle.md note left open is now closed too, by `ca83e79`, which the note could not have seen.
- **`260814-1419_*_the-shipped-chat-voice-profiles-changed-…md`** (plan step 3). The
  headline defect no longer reproduces. What holds the marker is the bookkeeping gap at the end of
  the file, a different defect sharing one record. A reconciler does not split a record; if the user
  wants the distribution half closed, this one splits.
- **Added here: `260816-1330_*_the-repunctuations-evidence-paragraph-…md`** (plan step
  16). Discrepancy 3. The plan named the wrong file; the executor followed the file list, checked,
  and said what was left.

Also annotated and left `_o_`, each re-verified against the tree:
`260816-0740_*_…em-dash-ceiling…md` (the emitted set is clean, `CLAUDE.md` at 14.2 per
1000 is 94 per cent of what remains and was excluded by an unconfirmed decision);
`260816-1330_*_the-override-record-…md` (the annotation supersedes the premise instead
of correcting the fact); the two earlier repunctuation defect records
(`…three-vague-pronoun-openers…` at `rules/user-facing-output.md:19`, `:61`, `:90`, and
`…a-mark-weaker-than-the-clause…` at `:122` and `:131`, all four still standing, all line numbers
drifted again); and `260812-0253_*_agents-answer-a-question-…md`, which is **not**
moved to `_d_` because the deferral was decided in the user's absence.

## Decisions: none transitioned, and that is the finding

All **10** open decision records in scope are `_o_`, verified by reading the markers off the
filenames: eight stamped `260820-2314` (orchestrator) and two stamped `260820-2324` (planner). None
was transitioned by any executor and none by this pass. They record answers given while the user was
away and are the user's to confirm or overturn.

**One count in the dispatch brief does not reconcile.** The brief says thirteen decision records are
open, ten of them filed during this run. `find circles shared -path '*/decisions/*_o_*.md'` returns
**10**, all filed this run. `shared/decisions/` holds **zero** open records: 18 `_a_`, 31 `_i_`, 2
`_d_`, 1 `_s_`. The three extra are not on disk anywhere outside `archive/`.

## Misfiled — should be a decision

Two of this Circle's open issues are decisions in an issue file. Neither is moved: relocating a
record between stores changes its marker vocabulary and is the user's `mv`.

- **`260821-0144_*_the-authoritative-prose-metric-has-no-test-…md`** — self-declares it: "a
  sequencing item rather than a defect. Nothing is broken." Its content is two questions it refuses
  to answer, whether the metric gets a test and whether a re-approval comment belongs on the same
  budget as test code. There is no fix to hand an executor.
- **`260821-0242_*_step-12s-two-acceptance-criteria-cannot-both-hold-…md`** — its content is a
  wording choice for a plan criterion the executor already shipped under, with two options and
  "either wording, chosen deliberately". No file is wrong.

To relocate: `mv` each from `circles/260820-2051-…/issues/` to `circles/260820-2051-…/decisions/` and
change the marker from the issues vocabulary to the decisions one, per
`rules/fusion-workbench-conventions.md`.

## Two things the dispatch asked me to be sceptical about

**The corpus grew by 2 138 bytes net while being repaired, and that is a cost the Circle did not
name.** The repunctuation returned 470 bytes across four files; the Circle's own new clauses spent
2 608 (step 3 +669 on the conventions file, step 13 +1 091 and step 14 +848 on
`rules/user-facing-output.md`). Both my measurement and an independent one reproduce +2 138 exactly.

The growth is *licensed*: Directive outcome 3 asks for a test the rule did not state, and a stated
test costs bytes. It is not *bounded*. The Directive names four outcomes and no cost; the eight
stopping clauses name no byte figure; the only place the trade appears before the fact is a
`## Risks & Mitigations` row that predicts the 470-byte return correctly, names a fallback cut, and
budgets the spend at nothing. The fallback never fired because head-room absorbed the spend, so
nothing forced the question. Verdict: **coherent with the Directive, and a cost the Circle should
have named in its stopping section.** Filed as a decision rather than a defect, because the answer
is a change to how a Circle is bounded and not a fix:
`260821-0414_*_does-a-corpus-repair-circle-carry-a-budget-for-what-its-own-new-clauses-may-spend.md`.

**The two near-exhausted budgets are real and one of them is now blocking.** Re-measured
independently: `skills/` 240 409 against 240 439, **30 bytes**; hook tests 20 343 against 20 375,
**32 lines**; `agents/` 1 638 bytes; always-on 3 566 bytes. Two of this Circle's own open issues,
`260821-0302_*_step-0es-repair-guards-one-of-its-three-blocks-and-its-done-report-omits-the-outcome-that-guard-emits.md` and part 1 of `260821-0148_*_step-0e-stamps-a-replace-that-may-have-failed-and-a-declined-offer-becomes-a-permanent-conflict.md`, both write into `skills/setup/SKILL.md`. Either turns
`npm test` red on arrival, and `hooks/lib/__tests__/helpers/growth-bound.ts` permits no baseline edit
as the way out. So the Circle closes having filed defects that cannot be fixed until somebody takes
a cut. That is worth the orchestrator's attention at Phase 4, not the next executor's surprise.

**The executors were wrong about their own numbers three times and the pattern did not stop.** The
fourth instance is discrepancy 7, in the closing artifact. The fifth is discrepancy 8, a head-room
figure in a review that a later commit invalidated. Neither is a large error and both were caught by
a later reader, which is the property that matters: this session's habit of re-measuring rather than
relaying is what makes the record trustworthy, and it is doing more work than any gate in the tree.

## Review coverage

`bin/fusion-review-coverage --since 7135a19` reports `commits=24 reviews=2 unusable=0 uncovered=7
verdict=uncovered`. The two reviews tile exactly (`7135a19..7832553` and `7832553..c226949`, both
`Not-opened: none`). The seven uncovered are everything after `c226949`: `921a75a`, `80d1599`,
`86edaac`, `b8b8f42`, `abdf1ad`, `acef2ad`, `247abfe`. Four touch shipped text —
`rules/user-facing-output.md` twice, `agents/curator.md`, a golden fixture and a lint baseline. Steps
13, 14 and 17 landed unreviewed.

This is not a release gate and the reconciler does not make it one
(`260815-2322_*_…`, and `260815-2109_*_may-a-circle-close-over-an-uncovered-review-range-and-who-decides.md`
is the record that owns the question). It is stated because the previous session's closing commit,
`7135a19`, is titled "the session record, with the seven unreviewed commits named", and this session
ends at seven again.

## The plan and the spec

**The plan closes.** All eighteen steps `[DONE]`, `**Status:** Complete`, renamed
`260820-2324_*_plan-style-rules-arrive-and-get-measured.md`. Its `## Where this Circle stops` clauses
5 and 6 and its release precondition are unmet, and those are Circle-closure criteria that the plan
hosts rather than plan-completion criteria; they are why the Circle takes `_b_` and not `_c_`.

**The spec stays `_o_`.** Its capability C10 is delivered in half by design, and the Bounded Closure
that would license closing it over an undelivered capability is a user gate that has not run. It
closes when that gate does.

## For the orchestrator at Phase 4

- The Circle record's `**Active spec/plan:**` field, its empty `## Turn log`, and its stale
  Dependencies claim (discrepancies 9, 10, 11) are the orchestrator's to repair before the marker
  moves.
- The closure note has to name what plan clause 8 requires: the deferred measurement, the unrepaired
  `CLAUDE.md`, and the unrepaired conditional rule files. Add to that list the thirteen open review
  findings and the two blocked-by-head-room defects.
