# Reconciliation — 260816-1345

**Scope:** session `260816-0804-orchestrator-session.md`, range `433e206..dd560ab`, five commits.
**Domain:** code. **Circle:** none active; every store resolved to `shared/`.
**Status:** Complete.

## Verdict

Every marker this session moved is correct at HEAD, and every marker it deliberately left is
correct at HEAD. Nothing was re-marked. Two tracking-file fields disagreed with disk and were
corrected, both on the one decision record; one new defect was filed; seven records and one review
file gained reconciliation evidence.

The pass ran against disk rather than against the session's account of itself: every claim below was
re-derived with its own command or grep before being called verified.

## What was checked, and what it says

### The three moved markers

| Record | Claim | At HEAD |
|---|---|---|
| `shared/issues/260816-0136_*` `_p_`→`_c_` | both fix-direction parts plus the `Also seen:` clause are on disk | **holds.** `.gitignore:67` reads `orchestrator-events.jsonl, portfolio.md, .fusion-setup.`; `.gitignore:69-70` reads "the archive step of `/fusion:cleanup`"; `rules/fusion-workbench-conventions.md:74` carries the conditional form. `git check-ignore` exits 1 and `git ls-files --error-unmatch` returns all three named files, so the comment describes the behaviour |
| `shared/issues/260816-0740_*_the-gate-contract-*` `_o_`→`_c_` | two bullets in `## Questions and gates` | **holds.** `rules/user-facing-output.md:89` and `:96`. The record's own note cites them as `:87` and `:95` |
| `shared/decisions/260816-0740_*` `_o_`→`_a_`, not `_i_` | option 4's content is a measurement that has not run | **holds.** No measurement artifact exists anywhere in the workbench, and `_a_` is the correct marker for an answer not yet realised |

### The two deliberately-left markers

**`shared/issues/260816-0740_o_the-always-on-rule-corpus-*` stays open, and that is right.** The
corpus was re-measured with the record's own command, not read from its note. The seven tabled files
run 22 871 words and 340 em-dashes for 14.8 per 1000, against 23 permitted at the stated ceiling of
1. Six of the seven keep their rates exactly; only `rules/fusion-workbench-conventions.md` moved, by
eight words from `b18a8cf`, and its rate is unchanged at 15.7. One file of seven was repaired.
Closing would claim a corpus fix nobody performed.

**`circles/260815-0007-*/issues/260815-1633_o_*` stays open with its `.gitignore` discharge line, and
that is right.** A full `grep -rn -E '/fusion:(archive|log-activity|curate)'` over the tree, excluding
`.git/`, `node_modules/` and `fusion-workbench/`, returns eight hits: four deliberately-correct
listings in `CLAUDE.md:21` and `README-agents.md:239,240,246`, and four residual code comments in
`hooks/lib/events.ts:70` with its two compiled mirrors and
`hooks/lib/__tests__/monitor-warnings-panel.test.ts:508`. The `.gitignore` hit is gone. Three sources
still write the old form.

### The nine records carried into history in `4921026`

Ten artifact files entered git in that commit, not nine: the analyst's five (one analysis, one
decision, one history entry, two defect records) and Turn 1's five (four defect records and the
review file), plus the orchestrator's own session file. The session's count of nine appears to omit
the review file.

**No content was lost.** `git diff 4921026 HEAD -- fusion-workbench/shared/` shows only additions and
one rename; every one of the ten ends mid-argument nowhere and carries its closing section. The
decision record's `Answered:` note cites `260816-0804-orchestrator-session.md`, which
exists and records the option-4 choice at line 88. The citation was real and is now precise.

### The repunctuation, third pass

Asked for as a third pass over `rules/user-facing-output.md` because the surface is the most-read text
in the project and no test here reads prose. Run without reading the second reviewer's evidence block
first.

**Nothing was found.** The file at HEAD is correct.

- Token identity holds under two normalisations, one splitting on every non-alphanumeric character
  (2700 tokens) and one keeping hyphens and apostrophes inside words (2565 tokens). Both compare
  equal before and after. No word was added, removed or substituted.
- The markup inventory is byte-stable: `*` 246, backtick 124, `"` 88, `_` 41, `#` 38, `>` 35, `|` 18,
  `─` 14, `<` 9, `→` 9, hyphen 184, unchanged on both sides. Only sanctioned marks move, plus one
  semicolon: `—` 38 to 6, `.` +10, `:` +9, `(` +6, `)` +6, `,` +5, `;` +1.
- The six remaining em-dashes are the four exhibits at `:21`, `:33`, `:141`, `:182` and the two
  code-span mentions at `:130`, exactly as claimed. Rate 14.17 to 2.24.
- `cd hooks && npm test` at HEAD: exit 0, 40 files, 764 tests.

The two inaccuracies in the commit message reproduce exactly as the second reviewer filed them:
2733 is not returned by any of nine counts, and ten capitals are gained with none lost, the changed
`see` gaining rather than losing one. Both were already recorded; this pass confirms rather than adds.

## Findings

### 1. The corpus table is labelled "always-on" and is not the always-on set (new defect)

`rules/design-diagrams.md` sits in the table and is a **conditional** emission:
`bin/fusion-rules:412-414` guards it with `if [ "$IS_DIAGRAM_AGENT" -eq 1 ]`, so it reaches five
agents. At 25.1 per 1000 it is the second-worst offender and it raises a total it is not part of.
Absent from the table is `fusion-workbench/stilwerk/chat-voice-de.yaml`, which
`bin/fusion-rules:396` emits unconditionally to every agent. The corpus every dispatch actually
carries is **22 959 words, 326 em-dashes, 14.1 per 1000**, not 22 871 / 340 / 14.8.

The direction of the register finding is unaffected; the denominator a later pass compares against
is not, and there is a later pass by construction. Filed as
`260816-1345_*_the-register-defects-corpus-table-is-labelled-always-on-and-is-not-the-always-on-set.md`.

### 2. Fourteen line citations into one file, nine of them wrong

The Turn 2 review cites `rules/user-facing-output.md` fourteen times at a HEAD where the file is
byte-identical to the one it reviewed. Nine are off by one to three lines: the two inserted bullets
(`:87`/`:95` for `:89`/`:96`), the three pronoun-opener sites (`:22`/`:57`/`:83` for `:19`/`:56`/`:85`),
the `see` sites (`:14` for `:12`), the option-label cap (`:103` for `:102`), and "four lines above"
for one line above. Five hold. This is the class
`260808-0030_*_line-number-citations-into-rule-files-go-stale-and-no-gate-reads-them.md`
already tracks, and the instance was appended there rather than filed again. Corrections were written
onto the two records where a fixer would act on the number.

### 3. Decision-record header drift, one instance created and corrected

`shared/decisions/260816-0740_a_*.md:5` read `**Status:** open` under an `_a_` filename marker. The
Turn 2 review named it the 40th instance of
`260812-1232_*_thirty-four-of-seventy-four-decision-records-carry-a-status-header-that-contradicts-their-filename-marker.md`.
Corrected here, since it is this session's own. An independent audit across all decision stores puts
the standing population at **39 of 100 records** after that correction, one fewer than before it:
13 read `answered` under an `_i_` marker, 12 read `open` under `_i_`, 8 read `open` under `_a_`, 4
read `open` under `_d_`, 1 reads `open` under `_s_`, and 1 carries the marker glyph itself where the
word belongs (`260718-2150_*_reviewers-history-log-step.md:5`
reads `**Status:** _i_`). Of those, 17 are in `shared/` and the rest sit in Circles outside this
session's scan scope. None was swept: they are the subject of that open record, and whether a gate
should read the pair is a decision, not a reconciliation.

### 4. The session history file is incomplete

`260816-0804-orchestrator-session.md` still carries `**Directive:** (not yet stated)`,
`**Mode:** (unresolved)` and `**Status:** In progress`, and its `## Turns` section stops at Turn 1.
Turn 2 landed three commits (`52b8665`, `6049d3e`, `dd560ab`) that the file does not describe. Not
corrected: the reconciler appends `## Coherence` to that file and owns nothing else in it.

### 5. Review coverage

`bin/fusion-review-coverage --since 433e206` reports `verdict=uncovered`, one commit: `dd560ab`,
which is the review commit itself. Two reviews tile `433e206..b18a8cf` and `b18a8cf..6049d3e` with
`not-opened=none` on both. This is the ordinary trailing state, not a gap in the work.

## Tracking files touched

| File | What changed |
|---|---|
| `shared/decisions/260816-0740_a_does-the-prose-register-*.md` | `**Status:** open` → `answered`; `Answered:` citation gained its line number (`:88`); one cross-reference re-pointed from the gate-contract record's `_o_` name to its `_c_` name |
| `shared/issues/260816-0740_o_the-always-on-rule-corpus-*.md` | reconciliation note: corpus re-measurement, why `_o_` is right, the set finding |
| `shared/issues/260816-0136_c_the-tracked-workbench-splits-*.md` | reconciliation note confirming all three halves |
| `shared/issues/260816-1330_o_the-repunctuations-evidence-paragraph-*.md` | third-pass confirmation of all four points |
| `shared/issues/260816-1330_o_the-repunctuation-replaced-three-em-dashes-*.md` | corrected line numbers |
| `shared/issues/260816-1330_o_the-foreclosure-clause-*.md` | corrected line numbers |
| `shared/issues/260808-0030_o_line-number-citations-*.md` | appended instance: nine miscitations in one review pass |
| `260816-1330-coderev-repunctuation-and-gate-contract.md` | reconciler annotation confirming the five findings |
| `circles/260815-0007-*/issues/260815-1633_o_*.md` | reconciliation note confirming the discharge and the three standing sources |
| `shared/issues/260816-1345_o_the-register-defects-corpus-table-*.md` | **new** |
| `260816-0804-orchestrator-session.md` | `## Coherence` appended (reconciler-owned section only) |

No code, data, or shipped prose was modified.

## Coherence verdict

`review-needed`. Recommendation: revise Artifact. The full three-edge statement is in
`260816-0804-orchestrator-session.md` `## Coherence`.
