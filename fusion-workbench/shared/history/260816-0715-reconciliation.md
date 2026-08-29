# Reconciliation — session 260815-2147-orchestrator-session.md, at HEAD `f77633f`, closing at `787010f`

**Date:** 2026-08-16 07:15
**Domain:** code
**Range verified:** `d33cd22..f77633f`, 27 commits. Two further commits landed while this pass ran (`71e97f4`, `787010f`) and are accounted for below.
**Session under reconciliation:** `260815-2147-orchestrator-session.md`
**Status:** Complete

## What was checked

Every one of the 56 defect records this session renamed to closed was re-verified against the tree
at HEAD, by three independent passes that read the record, ignored its own closure annotation, and
re-derived the verdict with `grep`, `sed`, `git show` and, where the fix was executable, by running
it. Two test files were executed rather than read. The full hook suite was run: **40 files, 764
tests, exit 0**, which confirms the session's own green claim at HEAD.

Also checked: all 16 open decision records and all 13 answered ones, both non-terminal plan files,
the two review files this session produced, the review-coverage tiling over the session range, the
workbench staging drift, and the session's own bookkeeping surfaces.

## Counts at HEAD, across every store

**Read the timestamp on this table.** A second session was writing into `shared/issues/` while this
pass ran — a `coderev` reviewing `3a0408a..f77633f`, the seven commits the tiling below reports as
uncovered. It filed nine records between 07:14:00 and 07:15:48. The figures below are the store as it
stood at **07:17:50**, and that review had not yet written its review file, so more may follow. A
count of a live store is a snapshot, and this one is stated with its moment rather than as a standing
fact.

These are machine-derived from the filenames, not carried forward from any earlier figure. The
session's first triage pass got a count wrong by fourteen, so each number below is stated with the
command that produced it.

| | Shared store | Circle stores | Total |
|---|---:|---:|---:|
| Defect records — open (`_o_`) | 82 | 67 | **149** |
| Defect records — in progress (`_p_`) | 1 | 0 | **1** |
| Defect records — open or in progress | 83 | 67 | **150** |
| Defect records — closed (`_c_`) | 240 | 271 | 511 |
| Decision records — open (`_o_`) | 11 | 5 | **16** |
| Decision records — answered (`_a_`) | 11 | 2 | **13** |
| Decision records — active Grounding (`_o_` + `_a_`) | 22 | 7 | **29** |
| Decision records — implemented / deferred / superseded | 25 / 3 / 1 | 39 / 1 / 0 | 64 / 4 / 1 |

Derived with a single pass over both stores:

```
find fusion-workbench/shared/issues fusion-workbench/circles/*/issues -maxdepth 1 -name '*.md' -type f \
  | xargs -n1 basename | sed -nE 's/^[0-9]{6}-[0-9]{4}_([a-z])_.*\.md$/\1/p' | sort | uniq -c
```

Every filename in both stores matches the pattern, so nothing falls outside the histogram — checked
by inverting the match, which returns the empty set.

**The 150 splits into two populations and they should not be reported as one.** Nine of the open
records — `260816-0717_*_the-resume-paragraph-still-names-the-old-phase-2-step-numbers-and-now-points-at-the-emission-it-forbids.md` through `260816-0725_*_the-citation-gates-new-exact-count-pin-is-coupled-to-workbench-contents-so-the-archive-step-can-turn-it-red.md` — were filed after this pass began, by the concurrent
review of the range this session left unreviewed. Excluding them, the store stood at **141** open or
in progress when this pass measured its verification set, which is the figure that describes what
*this session* left behind.

**Against the session's opening snapshot.** It opened on 175 defect records open or in progress and
11 open decisions. It ends on **141** by its own work, **150** including the concurrent review's
nine, and **16** open decisions. The defect movement attributable to the session is −34 over 56
closures and 22 new records; the decision figure is +5, of which three were filed by the session and
two by this pass.

Backlog: 2 live entries (1 open, 1 recommended), unchanged. Circles: 15 records, all terminal — 13
closed-coherent, 1 bounded, 1 superseded. No active Circle, so every `OUT_*` resolves into `shared/`.

## Closure verification — 55 of 56 hold, 1 partial

**No closure was found to be false.** The three re-fixed by the second review (`260816-0130_*_the-dual-stack-docstrings-second-reason-cites-a-test-pin-the-same-commit-changed.md`,
`260816-0131_*_the-monitors-second-port-query-matches-any-command-line-naming-the-script-not-only-a-prior-monitor.md`, `260816-0134_*_the-breakers-two-counters-still-differ-by-whether-the-user-counts-and-the-fix-claimed-they-do-not.md`) are confirmed landed at `94683c9`. The 18-record moot batch at
`4f7508d` is confirmed moot in every case: each deleted subject was checked absent from `git
ls-files`, and the deleting commit named.

One is **partial**, and its own closure says so. `260810-0504_*_the-tracked-workbench-section-re-enumerates-a-closed-list-and-leaves-one-surface-unclassified.md` was filed as a three-part defect;
parts 1 and 2 are on disk at `rules/fusion-workbench-conventions.md:74` and `:76`, and part 3 — the
tracked-workbench subsection is emitted to every agent while no executor applies it — stands. The
closure disclosed it and reasoned it correctly: the home it named, `rules/workbench-stash-and-lock.md`,
no longer exists. The residual was disclosed but untracked, which is the fault. It is now filed as a
decision (see below) and the marker was left at `_c_`, because nothing an executor could do exists —
this is a "decide and record" item, not a "go fix it" one.

## Markers corrected

Two records were fixed at HEAD and left open. Both were fixed by `f77633f`, the session's last
commit, whose own message says the record work was a reconciler call.

| Record | Was | Now | Evidence |
|---|---|---|---|
| `260816-0132_*_the-next-skills-status-note-is-decided-from-a-file-wide-grep-not-from-the-writes-result.md` | `_o_` | `_c_` | `f77633f` replaced the `sed` + verification `grep` at `skills/next/SKILL.md:218-227` with one `awk` pass. All three defects and the `:225` sentence discharged, each re-checked at HEAD |
| `260816-0139_*_two-demoted-name-instances-remain-in-README-agents-and-the-open-record-tracking-them-lists-none.md` | `_o_` | `_c_` | Part 1 by `f77633f` (`README-agents.md:71,72`); part 2 discharged by this pass's rewrite of the residual table on `260815-1633_o_*` |

**One marker was checked and left alone.** `shared/issues/260816-0136_p_*` is correctly in progress:
part 1 landed at `rules/fusion-workbench-conventions.md:74` and part 2 did not — `.gitignore:67`
still reads `tasklist.md` and still omits `.fusion-setup`, while `git ls-files` confirms the file is
tracked, so the behaviour is right and the comment is wrong.

**No decision marker moved.** Three were candidates and each was checked and left:
`260810-2032_*_should-the-drift-checks-four-sentences-be-pinned-to-an-approved-baseline-instead-of-screened-by-a-blacklist.md` (its realisation target was deleted; the residual is already filed as
`260815-2056_o_`), `260811-1522_a_` (the README-hooks table is still hand-written; nothing generates
it), and the three decisions this session filed, all of which are genuinely unanswered.

## The record that was routed here — `260815-1633_*_eight-shipped-surfaces…`

Its residual table listed two sites and both were discharged during the session, so the record was
open with an empty table. The table is rewritten around what actually stands at HEAD, and the marker
stays `_o_`.

Discharged: `skills/setup/SKILL.md:60` (`c0e179a`), `skills/cleanup/SKILL.md:243` (`381f6d8`), and
`README-agents.md:71,72` (`f77633f`) which the table never carried. The whole shipped-**prose**
surface is clean.

What stands is five hits from three sources, a class the record never opened:
`hooks/lib/events.ts:70` with its two compiled mirrors, `hooks/lib/__tests__/monitor-warnings-panel.test.ts:508`,
and `.gitignore:69`. All three paraphrase `rules/fusion-workbench-conventions.md:81`, which the
curator's pass at `e8052e7` rewrote to "the archive step of `/fusion:cleanup`". The record stays open
because its thesis is undischarged, and it now states the question a taker has to answer first:
whether a code comment is in scope for a *presentational* collapse. If the answer is no, the record
closes on that ground rather than on a sweep.

`.gitignore:69` sits four lines from `.gitignore:67`, which is part 2 of `260816-0136_p_*`. One pass
over that comment block discharges both. This is recorded on both records.

## New records filed

Three defects and two decisions. Each was checked against the open stores by name before writing;
none duplicates an existing record.

**Defects — `shared/issues/`:**

1. `260816-0709_*_the-review-coverage-fix-ships-only-as-typescript-because-no-commit-since-f45f76a-carries-hooks-dist.md`
   — the one finding of this pass that reaches a user. See below.
2. `260816-0715_*_setups-domain-detection-bullet-names-two-retired-inputs-and-two-of-the-three-agents-that-take-the-parameter.md`
   — `skills/setup/SKILL.md:301` names `decisions_count` and `analyses_count` as the heuristic's
   inputs; both are in `RETIRED_COUNT_NAMES` at `hooks/lib/domain-cascade.ts:117-122` and no branch
   reads them. The same line names two of the three agents that take `**Domain:**`. Behaviour is
   unaffected: the line delegates to `agents/orchestrator.md` Setup Step 5, which reads
   `bin/fusion-count-sources` first, so this is a wrong description and not the `260805-1830` defect
   returning.
3. `260816-0716_*_the-circles-bullet-in-claude-md-ends-a-sentence-with-two-full-stops-after-the-plane-removal-edit.md`
   — one character, at `CLAUDE.md:72`, left by `e8052e7`. Recorded rather than fixed because
   `CLAUDE.md` has exactly one write path and it is gated.

**Decisions — `shared/decisions/`:**

4. `260816-0711_*_where-does-the-tracked-workbench-split-live-now-that-the-home-it-was-meant-to-move-to-is-gone.md`
   — part 3 of `260810-0504_*_the-tracked-workbench-section-re-enumerates-a-closed-list-and-leaves-one-surface-unclassified.md`, which was disclosed in a closure and tracked nowhere.
5. `260816-0711_*_is-count-pinning-the-convention-for-every-gate-that-reports-what-it-examined.md`
   — the closure of `260810-2149_*_a-coverage-floor-cannot-see-coverage-leave-and-the-approved-baseline-pin-is-the-general-answer.md` deferred this to "its own decision" and no decision was written.
   Three gates now answer the same question three ways. This record is that filing, not a new
   question.

**The two filings share one shape and it is worth naming.** Both are questions a closure explicitly
deferred to a record that was never created. `260811-1755_*_stale-marker-citations-recur-and-the-lint-does-not-read-the-hook-entrypoints-where-one-was-hiding.md` did it correctly in the same session — its
deferred item 2 became `260816-0119` — so the practice exists and was applied unevenly. A closure
that defers is only complete when the successor exists.

## The finding that reaches a user

`736e276` rewrote `hooks/lib/review-coverage.ts` and `hooks/tracker.ts`, and no commit in the session
carries the compiled output. `hooks/dist` was last committed at `f45f76a`, before this session began.

```
$ git show HEAD:hooks/dist/lib/review-coverage.js | grep -c REVIEW_SENDERS      → 0
$ git show HEAD:hooks/lib/review-coverage.ts     | grep -c REVIEW_SENDERS      → 3
$ git show HEAD:hooks/dist/tracker.js            | grep -c isMeasuredReview    → 0
$ git status --porcelain -- hooks/dist
 M hooks/dist/lib/review-coverage.d.ts
 M hooks/dist/lib/review-coverage.js
 M hooks/dist/tracker.js
```

Exactly two non-test sources changed since `hooks/dist` was last committed, and exactly their three
artifacts are dirty, so the set is closed. `CLAUDE.md` states the invariant: *"Compiled hooks must be
committed."* The installer copies committed bytes, and `bin/fusion-review-coverage` and
`bin/fusion-staging-drift` are wrappers over `hooks/dist`. At HEAD the fix is closed in this
repository's working tree and absent from every consuming project.

**Three mechanisms could have caught it and each is out of scope by construction.**
`bin/fusion-staging-drift` ranges over `fusion-workbench/` only and reported `verdict=clean`, which
is correct for what it measures and is what the session read. `npm test` does not build. No test
compares a committed `dist/` artifact against its source. The gap predates this session; this session
is the one that made it bite.

## Review coverage — the session range is not fully covered

```
$ ./bin/fusion-review-coverage --since d33cd22
commits=27  reviews=2  unusable=0  uncovered=7  verdict=uncovered
```

Two reviews tile `d33cd22..f4f01b0` (4 commits) and `f4f01b0..3a0408a` (16). The seven commits after
`3a0408a` — `b00a7a4`, `736e276`, `68d6838`, `4fa0586`, `94683c9`, `d83c1b4`, `f77633f` — have no
review. Among them is `736e276`, whose compiled output is the finding above, and `94683c9`, which
re-fixed three closures the second review found had not landed.

This is not a new defect. `260815-2109_*_may-a-circle-close-over-an-uncovered-review-range-and-who-decides.md`
is open on exactly this question and `README-hooks.md:173` states that the program reports and is not
a gate. The state is recorded here so the session report does not claim coverage it does not have.

**It is being remedied as this pass writes.** A `coderev` session stamped `260816-0713-coderev-turn-5-6-range-3a0408a-f77633f.md` is reviewing
`3a0408a..f77633f` right now and had filed nine records by 07:15:48 (`260816-0717_*_the-resume-paragraph-still-names-the-old-phase-2-step-numbers-and-now-points-at-the-emission-it-forbids.md` … `260816-0725_*_the-citation-gates-new-exact-count-pin-is-coupled-to-workbench-contents-so-the-archive-step-can-turn-it-red.md`),
none of them yet reflected in a review file. The tiling above will change once that file lands. The
uncovered figure is therefore true of the moment this pass measured it and not of the day.

## Session bookkeeping — four surfaces stale

The session ran six Turns. Its own machine-written and hand-written state stopped tracking after
Turn 3.

| Surface | What it says | What is true |
|---|---|---|
| `260815-2147-orchestrator-session.md` | last heading covers Turns 2 and 3; `**Status:** In progress` | six Turns, 27 commits |
| `orchestrator-live.md` | `Turn: 2/12 \| Tasks: 5/37 \| Commits: 5` | Turn 6, 27 commits |
| `agentstate.yaml` `current_task.summary` | "queue built, Turn 1 not yet started" | five `work_queue` rows marked `queued` whose tasks landed: `T12`, `T13` (`c0e179a`), `T15` (`3a0408a`), `T16`, `T17` (`8c1bd74`) |
| `orchestrator-events.jsonl` | 4 `turn_start`, 3 `turn_end` since this session's `session_start` | six Turns ran |

All four are the orchestrator's to write; the reconciler may write none of them. Recorded as
`Also seen:` on `260814-2017_*_three-of-the-five-turns-have-no-per-turn-section…`,
which is the existing record for this class, rather than as a new file.

**Part 2 of that record is now moot on its own terms and the defect is not.** It asked for a
counting rule in `hooks/lib/state-drift.ts`; that module and `bin/fusion-state-drift` were removed on
2026-08-15, so the masking it describes has been replaced by no measurement at all.

## Plans

No planning file changed in the session range, and both non-terminal plans are correct as they stand.

- `260813-1820_*_documentation-matches-shipped-plugin.md`
  — `_p_`, `**Status:** Partially Complete`, in a Circle whose record is `_b_` (bounded closure).
  Consistent: a bounded Circle closes with work outstanding, and the plan records what was outstanding.
- `260801-1122_*_spec-normative-consolidation.md` — `_o_`, and correctly so. Whether
  it closes is the subject of open decision
  `260814-2017_*_does-a-parent-spec-close-when-its-last-circle-does-if-three-of-its-capabilities-were-retired-rather-than-delivered.md`.

## Reviews annotated

Both review files were annotated with the disposition of every record they filed. Findings were not
rewritten.

- `260815-2330-coderev-turn-1-bound-breaker-monitor.md` — all five records closed; its
  carry-forward instruction for `4f7508d` was honoured by the next review.
- `260816-0145-coderev-turn-2-range-f4f01b0-3a0408a.md` — six of eleven closed
  (two by this pass), one in progress, four open. Its closing instruction to hand `260815-1633_o_*`
  to the reconciler rather than the coder was followed.

## Nothing was misfiled

No record in either store is a decision wearing a defect's marker. The three decisions this session
filed are correctly in `shared/decisions/` with the `_o_/_a_/_i_/_d_/_s_` vocabulary, and the two
this pass filed are as well. This is the first reconciliation of this project in some time with an
empty "Misfiled" section.

## Coherence

The three-edge verdict was computed and appended to
`260815-2147-orchestrator-session.md` `## Coherence`. Verdict: **review-needed**, on
the Artifact↔Grounding edge, with `revise Artifact` as the recommendation. The two other edges are
clean. The full evidence is in that section.


## What changed while this pass was running

Two sessions were writing this workbench between 07:14 and 07:19, and the state this pass verified is
not the state at the end of it. The differences are recorded rather than smoothed over.

**A `coderev` reviewing `3a0408a..f77633f`** — the seven commits this pass reported as uncovered —
filed nine defect records and then its review file, `260816-0713-coderev-turn-5-6-range-3a0408a-f77633f.md`.
It found the compiled-hooks gap independently and **cited `260816-0709_*_the-review-coverage-fix-ships-only-as-typescript-because-no-commit-since-f45f76a-carries-hooks-dist.md` rather than refiling it**
(`:48`), which is the duplicate-check convention working. The review-coverage tiling is now three
reviews over the range.

**The compiled-hooks defect was fixed and is closed.** `71e97f4` committed the three artifacts;
verified at HEAD, `git show HEAD:hooks/dist/lib/review-coverage.js | grep -c REVIEW_SENDERS` returns
`3` and `git show HEAD:hooks/dist/tracker.js | grep -c isMeasuredReview` returns `2`, against `0` and
`0` before, with `git status --porcelain -- hooks/dist` empty. The record was closed and its
fix-direction item 2 filed as its own decision,
`260816-0719_*_should-anything-assert-that-the-committed-hooks-dist-is-the-compilation-of-the-committed-source.md`,
rather than left inside the closure — the same fault this pass filed two other decisions for.

**A correction to this pass's own reasoning.** The record as filed said *"`npm test` does not
build."* That is false: `hooks/scripts/run-tests.mjs:2` opens with *"compile, then run vitest against
a build no other run can touch"*. I inferred it from observing that a suite run left the three files
dirty exactly as they had been, without opening the script. The narrower statement holds and is what
the record now carries: the build stages, and nothing asserts that the *committed* `hooks/dist`
matches the *committed* source. The correction is written on the record itself.

**Final measurement, 07:20:13, at HEAD `787010f`:**

| | Shared store | Circle stores | Total |
|---|---:|---:|---:|
| Defect records — open (`_o_`) | 81 | 67 | **148** |
| Defect records — in progress (`_p_`) | 1 | 0 | **1** |
| Defect records — open or in progress | 82 | 67 | **149** |
| Decision records — open (`_o_`) | 12 | 5 | **17** |
| Decision records — answered (`_a_`) | 11 | 2 | **13** |
| Decision records — active Grounding | 23 | 7 | **30** |

```
$ ./bin/fusion-review-coverage --since d33cd22
commits=29  reviews=3  unusable=0  uncovered=2  verdict=uncovered
```

The two uncovered commits are `71e97f4` and `787010f`, both of which postdate every review in the
range. The seven-commit gap this pass reported is closed.

**How to read the two count tables in this file.** The earlier one is the state this pass *verified*
— it is the denominator for "55 of 56 closures hold" and for everything said about what the session
left behind. This one is the state at the moment the pass finished. Neither is wrong; they answer
different questions, and a single number would have answered neither.
