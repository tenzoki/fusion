# Code review: the measurement report reproduces, and the after-run it defines does not

**Date:** 2026-08-22 01:16
**Agent:** coderev
**Reviewed-range:** `084c626..dbf259a`
**Not-opened:** `fusion-workbench/circles/260821-1042-reply-bounded-whole-question-answered/history/260822-0028-ontocoder-c06-renamed-and-paid-for-by-its-own-restatement.md`, `fusion-workbench/circles/260821-1042-reply-bounded-whole-question-answered/history/260822-0105-ontocoder-c05-and-c04-pointers-respelled-bare-and-anchors-dropped.md`, `fusion-workbench/circles/260821-1042-reply-bounded-whole-question-answered/issues/260821-2202_c_two-entry-names-no-longer-cover-their-instructions-and-ai04s-only-example-is-not-a-triad.md`, `fusion-workbench/circles/260821-1042-reply-bounded-whole-question-answered/issues/260821-2204_c_the-c05-cut-traded-self-contained-text-for-citations-on-a-surface-no-gate-reads.md`, `stilwerk/chat-voice-de.yaml`, `stilwerk/chat-voice-en.yaml`, `fusion-workbench/stilwerk/chat-voice-de.yaml`, `fusion-workbench/stilwerk/chat-voice-en.yaml`

The eight unopened files are the profile task and its two closed records, held by a parallel
ontorev and excluded by this review's dispatch. Every other file in the range was opened whole.

## Summary

Every numeric claim I checked in the measurement report reproduced, including the statistics that
are easiest to fudge and hardest to check: the intra-cluster correlation, the design effect, and
all five rows of the power table. The report separates verified from inferred from speculated
correctly, and its constraints were obeyed against the diff rather than only against its own word.
What it does not deliver is the property it was commissioned for. One step of the after-measurement
cannot be executed as written, and the unit the count of twenty is expressed in is not the unit two
of the report's own comparisons use.

## Totals

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 1 |
| Medium | 2 |
| Low | 3 |

## Reproduction: what I re-ran and what came back

Every command below was taken from the report and run at HEAD `dbf259a`.

| Figure | Report | Re-run | |
|---|---|---|---|
| Reading A reproduction | `blocks=2236 over12=400 share=17.9% multiline=856 share_multiline=46.7%` | identical | ok |
| Records per session | `sessions=52 records=854 mean=16.42 median=11 p25=3 p75=24 max=78 zero=5` | identical | ok |
| Enumeration density | `blocks=2236 listblocks=233 per_block=0.104 items=809`, `with_a_list=190 (8.5%) multiline=856 multiline_with_a_list=190 (22.2%) per_multiline=0.272 items_per_list=3.47` | identical | ok |
| Em-dash rate | `2029 202832 10.0 202 over` | identical | ok |
| Naive grep contrast | 2 062 raw, 22 en-dashes | identical | ok |
| Blocks carrying an em-dash | 942, 42.1 % | identical | ok |
| Fence balance | `blocks=2236 fence_lines=154 blocks_with_odd_fence_count=0` | identical | ok |
| Briefing's grep, literal | 49 of 72 for `user-facing-output`, 48 for `chat-voice` | identical | ok |
| Corrected grep | 19 primed, 53 unprimed of 72 | identical | ok |
| Narrowed surface, `user-facing-output` | 5 | identical | ok |
| Section 5 unprimed arm | 1 166 blocks, 183 over cap, 15.7 %, 428 multi-line, 42.8 %, mean 5.3, 738 one-line, 0 two-line | identical | ok |
| Unprimed em-dash | `813 93724 8.7` | identical | ok |
| Unprimed lists | 145 blocks, 0.339 per multi-line, 50 of 145 at exactly three | identical | ok |
| Contributing transcripts | 68 of 72 overall, 52 of 53 unprimed | identical | ok |
| Installed vs work-tree `bin/` | 12 helpers vs 13, both manifests `10.4.0`, `fac97f4` not an ancestor of `v10.4.0`, 48 commits at `084c626` | identical | ok |
| Section 6 boundary | `1daf063` is the last commit touching either surface at `084c626` | identical | ok |

**Three figures I derived rather than re-ran, because the report states them without a command.**
All three check out.

- **Standard deviation 17.6.** The report embeds the whole 52-value series. It sums to 854 across
  52 entries, mean 16.423, sample standard deviation 17.567. The series is self-consistent with
  the headline and reconstructs the figure without the event log, which is what it was embedded
  for.
- **Design effect 1.56.** Computing the one-way ANOVA estimator over the 31 unprimed transcripts
  with at least one multi-line block gives `k=31 N=428 Y=183 m0=13.269 ICC=0.0460 DEFF=1.564
  Neff=273.6`. The report's 0.046, 13.3, 1.56 and "about 274" are all exact. The 13.3 is the
  design-effect-adjusted cluster size, not the arithmetic mean of 13.8, which is the right
  quantity for this estimator and is not explained in the report.
- **The power table.** All five rows reproduce on a two-proportion normal approximation at 5 per
  cent two-sided and 80 per cent power, with the before arm at 274 effective blocks and the after
  arm inflated by 1.56: 5 points unreachable, 10 points 902 blocks, 15 points 159, 20 points 65,
  25 points 32. Dividing by 8.2 multi-line blocks per unprimed transcript gives 110, 19, 8 and 4.
  **"Ten points would need about 110 sessions" follows from the design effect exactly**, and so
  does the twenty.

**The unprimed frequency table checks out against its own summary.** It sums to 1 166, its entries
above 12 sum to 183, and its p75, p90, p95, p99 and maximum are 9, 16, 21, 28 and 58, which is what
the section 5 table states.

## Findings by theme

### The after-measurement is not mechanically runnable

**1. The records-per-session arm names a join that does not exist.** High. Filed as
`260822-0116_*_the-after-runs-records-per-session-arm-names-a-join-between-transcripts-and-session-stamps-that-does-not-exist.md`.
Section 6 says the after-window filing figure is computed "with the `unprimed.list` sessions used
to say which of those sessions may be counted". `unprimed.list` holds transcript UUID paths;
section 1's table is keyed by `yymmdd-HHMM` stamps derived from `session_start` events, and those
events carry two fields, `ts` and `event`, and no identifier of any kind. A later session has to
invent a time-proximity join with a tolerance and a tie-break the report never fixes. The
flowchart draws the same link as a dotted edge. This is the defect class the dispatch named: a
step that requires a judgement the report did not make.

**2. The word "session" names two units and section 7 compares across them.** Medium. Filed as
`260822-0116_*_the-report-uses-session-for-two-different-units-and-section-7-compares-counts-across-them.md`.
Section 1's session is a `session_start` event, 52 in window. Sections 5 and 7 and recommendation 1
use transcript files, 68 contributing and 52 unprimed. The ratio is about 1.3 to 1. Section 7's
"With the before arm at 52 sessions [...] a rise of ten needs about 45 further sessions. At twenty,
report the direction" puts one of each in a single sentence. The bullet's conclusion survives the
error, which is why this is Medium.

**3. The contamination command reads a scratch directory it never clears.** Low. Filed as
`260822-0116_*_the-contamination-command-reads-a-scratch-directory-it-never-clears.md`. The loop
writes one file per transcript present now; the `grep` globs everything in `$T/conv`. A pruned
transcript, which the report itself warns is possible, leaves a `.txt` that keeps voting and can
put a nonexistent path into `unprimed.list`. Published figures are unaffected: I reproduced them
into a clean directory.

### Records: one fold lost a fact, and one closure note says it did not

**4. The version-gap fold dropped the `bin/fusion-rules` half.** Medium. Filed as
`260822-0116_*_the-fold-of-the-version-gap-records-dropped-the-fusion-rules-half-and-the-closure-note-says-nothing-was-lost.md`.
This answers the dispatch's question about `260822-0026_c_`: **something was lost.** The closed
record names 22 unreleased lines of `bin/fusion-rules` and calls them "the second half and the more
consequential one, because `fusion-rules` runs at every agent's Setup in every project". The
surviving record `260822-0035` never names the helper. The gap is functional: the installed copy
lacks the stderr voice-profile fallback notice added in `1c1178d`, verified by `diff`. The fact now
survives only in the message of commit `c53a903`. The closure note's "Nothing from it is lost" is
false, and it is the only sentence in the fold that is.

Everything else in the fold is sound. The surviving record is genuinely the better one: it checks
each of the four facts separately, clears the installer by name, and states the sharper
consequence. Two smaller points in the closed record are dropped correctly rather than lost, one
because it was loose (`rules/user-facing-output.md` states a rate, not this program as its
measure) and one because it was a negative (no call site to guard).

A second inaccuracy in the same surviving record is folded into that issue: its list of mentions
outside `bin/` is offered as exhaustive at two entries and there are three, the third being
`.gitignore:41`.

### The in-place correction to another agent's log

**5. The correction left two figures for one quantity in adjacent clauses.** Low. Filed as
`260822-0116_*_the-head-room-correction-left-two-figures-for-one-quantity-in-adjacent-clauses.md`.

**The correction itself is right and I checked every part of it.** The label
`hooks/lib/__tests__/**.ts` is what the bound calls itself at
`hooks/lib/__tests__/surface-growth-bound.test.ts:388`. The recursive count is 20 360, the golden's
last line agrees, and the glob count really has moved to 18 310. The budget is 20 375 from
`TEST_LINE_BASELINE` 17 875 plus `TEST_LINE_HEAD_ROOM` 2 500, leaving 15. The edit touched two
lines and nothing else in that file.

**I do not agree that the neighbouring "11 lines of head-room" stands as a record of its moment,
and the reason is one the coder did not consider.** The principle is right in general. It does not
reach this case, because the correction changed the *referent* of the figure beside it. Before the
edit the two clauses named two different file sets, so no arithmetic relation was implied. After
it, both name the same bound, one at 11 and one implying 15, one sentence apart, with nothing in
the log saying that the 11 was computed against a surface of 20 364. The log's own remedy, that a
reader "has the arithmetic in front of them", is not available, because the 20 364 appears only in
the closed issue record. The issue that commissioned the fix also treats the pair as moving
together: it names "20 364 and 11 lines of head-room" as the figures to write in. The fix is one
clause, and it preserves exactly what the coder was protecting: "the 11 lines of head-room, the
figure that stood when this step ran at a surface of 20 364".

**6. The commit message of `e202016` attributes 18 310 to a log that said 18 314.** Low. Filed as
`260822-0116_*_commit-e202016s-message-attributes-to-a-log-a-figure-the-log-never-carried.md`. The
commit's own diff carries the refutation. The history log and the `Resolved:` note both keep the
two figures apart correctly; only the permanent, searchable copy merges them.

## The four checks the dispatch asked for, answered

**Does each figure license the claim made from it?** Yes, with one qualification.

- The records-per-session reasoning is **sound, and its stated justification is weaker than the
  work behind it**. "The spread nearly equals the mean" is not by itself a sensitivity criterion,
  since a coefficient of variation is scale-relative and says nothing until an effect size is
  named. But the report does the real calculation and cites it: with 52 before-sessions and a
  standard deviation of 17.6, a rise of five is unreachable at any after-size and a rise of ten
  needs about 45 more. Both check out to the digit. The conclusion is licensed; the one-line gloss
  in section 1 is the weakest sentence supporting it.
- The design-effect arithmetic behind twenty is exact, and so is the 110 that follows from it.
- The unit those two counts are expressed in is not the same, which is finding 2.

**Is the after-measurement runnable by someone who has not read the derivation?** No, on one arm.
Findings 1 and 2. The transcript arm is runnable: the three named changes to the baseline pipeline
are precise, the `xargs -0` note is a real hazard correctly anticipated, and the instruction to
re-verify the boundary before running was already needed within two hours of being written, since
`dce8894` and `dbf259a` both moved it.

**Does it separate verified from inferred?** Yes, and section 9 is the strongest part of the
report. It marks the setup-skill attribution as inference and says explicitly that no exhaustive
attribution of all 49 was performed. It marks the transfer of the design effect to the after-window
as inference with an unknown error direction. It marks the cleaner-unprimed-subset explanation as
speculation. It states that no causal link to the rule text is established at all. I found no claim
presented as checked that was not checked, which is the pattern `rules/critical-stance.md` §3 calls
the most damaging, and it is absent here.

One small imprecision, not filed: the report attributes the `user-facing-output` matches to "the
Step 0d prose" of the setup skill, and that token also appears in the skill's `OLD=1` branch and in
its Step 0g message. The inference is unaffected and is marked as inference.

**Did it obey its constraints?** Yes, verified against the diff. `git show --name-only 4c7aae6`
returns five files, all under `fusion-workbench/`. No gate, no test, nothing added to `bin/`, no
rule and no profile. The only files outside the workbench in the whole range are the two
`stilwerk/` profiles, which belong to a different task. The citation gate is green with the new
records in the corpus, which I re-ran.

## The two records the report filed

**Both are defects rather than observations, and both are in the right store.**

- The contamination record states a wrong command in a document written to be executed, names the
  mechanism, gives the corrected test, and offers two routes with a recommendation. Filed in the
  Circle, correctly: the briefing is this Circle's own artifact.
- The version record states a condition under which no session can tell what its installation can
  do, with four separately checked facts and three routes. Filed in `shared/`, correctly: the
  version gap was found beside this Circle's work and not caused by its Directive. The reasoning
  is stated in the record and again in the analyst's history log.

## Cross-cutting observations

**The report's discipline is asymmetric between its measurements and its instructions.** Every
figure carries the command that produced it, and every one reproduces. Every *instruction* for the
after-run is prose, and the two defects in this review that are not trivia are both in that prose.
The report treats a command as something to be pinned and an instruction as something to be
described. Findings 1 and 3 are both instances, and the fix for both is to write the instruction
the way the figures were written.

**Two agents reached one defect nine minutes apart and the fold cost a fact.** That is a cheap
outcome and the practice is right. The lesson is narrower than "avoid duplicates": a closure note
that asserts completeness needs the same evidence standard as the record it closes. "Nothing from
it is lost" is a checkable claim, and it was not checked.

**A figure's referent moves when a neighbouring figure is corrected.** Finding 5 is the second time
in this Circle that a correction to one number in a log has had to be reasoned about with respect
to its neighbours, and the first time the reasoning came out wrong. An in-place correction to
another agent's log should read the paragraph, not the clause.

## Recommended sequencing

**Before the after-run is dispatched**, which is the only real deadline here:

1. Finding 1, then finding 2. Both are edits to section 6 and section 7 of the report and they are
   the same edit session. Without them the after-run either stops or improvises.
2. Finding 3, one line in the section 4 command.

**Before this Circle closes:**

3. Finding 4, one paragraph added to `260822-0035` and a corrected list.
4. Finding 5, one clause in the step 5 log.

**Cleanup, no deadline:**

5. Finding 6, a note in the session history. The commit is pushed and is not worth rewriting.

Nothing here is a release blocker. The version-gap defect the report filed is the closest thing to
one in the range, and it is already tracked in `shared/`.
