# Reconciliation — 260818-2230

**Status:** Complete
**Agent:** reconciler
**Domain:** code
**Session:** `shared/history/260818-2124-orchestrator-session.md`
**Range verified:** `53b6862..8fa3286` (2 commits)
**Active Circle:** none — every store resolved into `shared/`
**Verdict:** review-needed (Artifact↔Grounding flagged)

---

## What this pass did

It re-derived every measurement the session's two commits assert, rather than reading them forward
out of the records. Fifteen distinct claims were checked against the tree, the git history, the
installed plugin copy and the test suite. Twelve hold exactly. Three do not, and two defects were
filed for them.

Nothing was fixed. No code, no data, no shipped file was touched.

## Inventory

| Store | Files | State |
|---|---|---|
| `shared/planning` | 4 | all closed (`_c_`, `**Status:** Complete`); no open plan in any Circle store either |
| `shared/issues` | 197 | 87 open, 110 closed; 153 open across shared and Circle stores together, 39 of them filed by `coderev` or `ontorev` |
| `shared/decisions` | 52 | 3 open, 22 answered, 24 implemented, 2 deferred, 1 superseded |
| `shared/reviews` | 30 | none covering this session's range |
| `shared/analyses` | 17 | untouched this session |
| `shared/history` | 281 | plus this file |

Decision stores across the whole live workbench hold 95 records at `8fa3286`, 94 at the pre-session
`53b6862`.

## Verified against ground truth

Each of these was re-derived by this reconciler, not carried forward.

**The measurement in `shared/decisions/260818-2212_o_*.md`.** A script that reads the marker out of
each filename and the first `**Status:**` line out of each body, over every live decision store and
no archived one, at `53b6862`:

- 94 records: 51 in `shared/decisions/`, 43 across `circles/*/decisions/`. Exact match.
- 40 headers not holding the template word the marker calls for, split 20 shared and 20 Circle.
  Exact match.
- 44 under a whole-field comparison, which is the figure `shared/history/260818-2050-curator-run.md`
  carries at its line 226. Exact match, and the four extra are the annotated headers the record
  names.
- The breakdown reproduces row for row: 14 `_i_`/answered, 13 `_i_`/open, 8 `_a_`/open, 3
  `_d_`/open, 1 `_s_`/open, 1 outlier.

**`260815-2312` is in the set.**
`shared/decisions/260815-2312_i_should-the-circle-records-status-field-exist-at-all-now-that-both-transitions-maintain-it.md:5`
reads `**Status:** answered` under an `_i_` marker. Confirmed by direct read.

**Two shipped surfaces define the decision-record vocabulary.**
`grep -rl '\*\*Status:\*\*'` over `agents/`, `skills/`, `rules/`, `templates/` and
`hooks/lib/__tests__/` at `53b6862` returns 14 files, but only two carry the decision vocabulary:
`rules/fusion-workbench-conventions.md:499` (`open | answered | implemented | deferred |
superseded`, the template line) and `rules/decision-record-examples.md:20` (the worked example's
head). Every other hit is a different artifact kind with a different vocabulary — `Draft` /
`Approved` for plans, `Complete` for history entries and analyses, the queue form in
`agents/taskplanner.md:150`.

**No gate compares the two.** All 37 test files under `hooks/lib/__tests__/` were listed and the
three plausible candidates opened. `marker-format-lint.test.ts` asserts marker *format* in
`agents/*.md` and `skills/*/SKILL.md` and never opens the workbench.
`record-counts-measurement.test.ts` counts records and never reads a `**Status:**` line.
`reference-resolution-lint.test.ts` mentions the field once, in a comment about a deleted paragraph.

**The reported typo does not exist, and never did.**

- `grep -n -- '--only' skills/cleanup/SKILL.md` returns five lines, all legitimate flag usages; the
  Step 8 `awk` reads `{ print $NF "\t" $0 }`.
- `diff -q` between the work tree copy and `~/.fusion/skills/cleanup/SKILL.md` reports identical.
- `git log -S'print $NF "\t" --only' -- skills/cleanup/SKILL.md` returns nothing.
- `git log -1 -- skills/cleanup/SKILL.md` is `381f6d8`, dated 260816-0040 — two days before the
  record was filed at 260818-2104.
- `find ~/.claude ~/.fusion -name SKILL.md -path '*cleanup*'` returns one path, the installed copy.
  `~/.claude/plugins/marketplaces/` holds only `claude-plugins-official`; no `tenzoki-plugins`
  clone exists.

Closing `260818-2104` as not reproducible is correct.

**The session's scope constraint held exactly.**
`git diff --name-only 53b6862..HEAD -- '*/decisions/*'` returns one path, the newly created record.
No pre-existing decision record was touched, which is what the user's Directive required and what
`shared/issues/260811-2146_o_*.md` instructs in terms.

**The tree is green.** `npm test` in `hooks/` at `8fa3286`: 36 files, 672 tests, all passing.
`surface-growth-bound.test.ts` and `reference-resolution-lint.test.ts` were additionally run alone.

**`bin/fusion-staging-drift`** reports `verdict=clean`, 3 rows, all `in-flight`.

## Drift found

**1. The correction note carries a false universal.** Filed as
`shared/issues/260818-2227_o_the-correction-note-that-closed-a-fabricated-measurement-carries-a-false-universal-of-its-own.md`
(Medium). The `Resolved:` block of `260818-2104_c_*.md` and the message of commit `b3de0ba` both
state that `--only` occurs in this repository at exactly one position. It occurs 112 times across 35
tracked files, 37 of them across 14 files outside the workbench, five in `skills/cleanup/SKILL.md`
itself where it is the skill's own documented flag. The claim the measurement supports is the
narrower one about the broken `awk` form — and even that stood at two positions inside the record
when the sentence was written, because the note's own pickaxe bullet at line 68 quotes it again.
This is the class `260818-2210` was filed to name, committed inside the remedy for it.

**2. The decision record miscounts its own measurement in three places.** Filed as
`shared/issues/260818-2228_o_the-status-field-decision-record-miscounts-its-own-measurement-in-three-places.md`
(Low). The central measurement is exact; three counts *about* it are not. The 40 includes
`circles/260718-1924-v5x-overhaul/decisions/260718-2150_i_reviewers-history-log-step.md`, whose head
reads `**Status:** _i_ (implemented — …)` and therefore agrees with its marker, so under the
record's own exclusion rule the count of *disagreeing* headers is 39 with 5 correct-but-non-template
rather than 4. "The trend across four measurements" is followed by five, all five of which trace to
real prior records (`260812-1232` title, and its lines 73, 87, 90). "Thirteen files that mention a
field of that name" is 14 in the grep scope the record itself states. Separately, the head-room
figure in option 2 (1907 of 2500) is quoted from the coderev note of 2026-08-16 and its baseline has
since moved: at `8fa3286` the hook-test surface is 18 403 lines against a 17 875 baseline, so the
head-room is 1 972.

**3. One citation went stale with the marker rename.** Not filed — it is an instance of the open
question `shared/decisions/260816-0119_a_can-anything-carry-the-rename-to-citation-obligation-when-a-record-marker-moves.md`,
not a new class. `shared/history/260818-2110_coder_regenerate-rules-emission-golden.md:77` cites
`shared/issues/260818-2104_o_…`, a path that stopped existing when this session renamed the marker
to `_c_`. It is a history file, so the citation records the path as it stood at the time; no gate
reads it and `reference-resolution-lint.test.ts` passes.

## Review coverage

`bin/fusion-review-coverage --since 53b6862` returns `verdict=uncovered`: 2 commits, 0 reviews, 2
uncovered. Neither commit touches a shipped file — both are workbench records — so no `coderev` pass
was dispatched. This reconciler read both records in full, which is not the same thing as a review
and is recorded here so the gap is visible rather than assumed closed.

## Tracking files updated

| File | Change |
|---|---|
| `shared/issues/260812-1232_o_*.md` | Reconciliation note appended, re-derived figures, marker stays `_o_` |
| `shared/issues/260818-2210_o_*.md` | Reconciliation note appended, every claim verified, marker stays `_o_` |
| `shared/issues/260818-2104_c_*.md` | Reconciliation note appended, closure confirmed, one sentence contested, marker stays `_c_` |
| `shared/decisions/260818-2212_o_*.md` | Reconciliation note appended pointing at the miscount defect; marker and `**Status:**` deliberately untouched |
| `shared/issues/260818-2227_o_*.md` | New defect |
| `shared/issues/260818-2228_o_*.md` | New defect |

No marker was moved in either direction this pass. No plan changed state — all four are closed and
carry `**Status:** Complete`. The two decision records open before this session
(`260816-1707_o_*`, `260817-1613_o_*`) were checked for an answer in `shared/analyses/`,
`shared/planning/` and the decision store and none was found; both stay `_o_` with their footer
fields unfilled.

## Misfiled — should be a decision

None found this pass.

## Coherence

The three-edge verdict for this session is written to
`shared/history/260818-2124-orchestrator-session.md` `## Coherence`, which is where the orchestrator
reads it. Aggregate: **review-needed**, Artifact↔Grounding flagged, recommendation *revise Artifact*.
