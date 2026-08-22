# coder — C0 step 9: the four bounded surfaces, measured before and after

**Status:** Complete
**Dispatched by:** orchestrator
**Circle:** none active (shared store)
**Source:** `shared/planning/260822-1154_o_plan-c0-cut-only-circle-buys-head-room-on-four-bounded-surfaces.md`, step 9
**Range measured:** `370bfc5..77b9a02` (the session's start commit to HEAD)

This step changes no shipped file. It produces the figures the orchestrator's closure note will
cite, and reads the plan's seven stopping clauses back against measurement.

## How each surface was measured

Each surface was summed the way its own test sums it, and the "before" figure was taken from the
git tree at `370bfc5` rather than copied out of the plan. Two scratch scripts under the session
scratchpad did the summation, one for the three `surface-growth-bound.test.ts` surfaces and one for
the always-on rule core; both were deleted after the run and neither wrote inside the repository or
the workbench.

The three byte-and-line surfaces were read with the same collectors their bound uses: a
non-recursive `readdirSync` of `agents/` filtered to `.md`, a one-level walk of `skills/*/` for
`SKILL.md`, and a recursive walk of `hooks/lib/__tests__` filtered to `.ts` with newline counting.
The floor is that surface's baseline map summed over the files actually present; a file with no
baseline entry contributes nothing to the floor, which is why the five ungoverned test files (now
six, with `fusion-prose-metric.test.ts`) count in full as growth.

The always-on rule core was read as `rules-emission-golden.test.ts` reads it: run
`bin/fusion-rules <agent>` for all fifteen agents from an empty temporary working directory with
`FUSION_PLUGIN_ROOT` pointed at the tree under test, keep only paths under that tree's `rules/`,
and intersect the fifteen sets. The intersection is the core. The `370bfc5` side was produced by
extracting that commit's `rules/`, `bin/` and `agents/` into a scratch directory with
`git archive` and running the same measurement against it.

## The four surfaces

| Surface | Head-room at `370bfc5` | Head-room at HEAD | Target | Met |
|---|---|---|---|---|
| Always-on rule core | 3 509 bytes | 3 509 bytes | none set | n/a |
| `agents/*.md` | 1 638 bytes | 16 601 bytes | 12 000 | yes, by 4 601 |
| `skills/*/SKILL.md` | 30 bytes | 4 661 bytes | 3 000 | yes, by 1 661 |
| Hook test suite | 12 lines | 302 lines | 300 | yes, by 2 |

### Always-on rule core: 3 509 bytes before, 3 509 bytes after

Nothing was cut and nothing was added. The core is five files at both ends of the range:
`agent-setup.md` 3 455, `critical-stance.md` 9 858, `decision-record-examples.md` 4 495,
`fusion-workbench-conventions.md` 57 114, `user-facing-output.md` 20 142. Total 95 064 against a
floor of 86 573 and a budget of 98 573.

`rules/review-contract.md` arrived during this Circle and is **not** in the core. That was verified
rather than assumed: the intersection measurement at HEAD returns five files, and the same run
reports that `review-contract.md` is emitted to `coderev` and `ontorev` alone. `bin/fusion-rules`
guards it behind an `IS_REVIEWER_AGENT` branch, so its `emit_if_exists` call is indented and
conditional. It carries no `RULE_BASELINE` entry either, so it counts in full against the reviewer
role's report rather than against the hard bound.

Command, both sides (the second argument is the tree under test):

```
node <scratch>/core.mjs /Users/k1/Projects/productive/fusion
git archive 370bfc5 rules bin agents | tar -x -C <scratch>/at370 && node <scratch>/core.mjs <scratch>/at370
```

### `agents/*.md`: 1 638 bytes before, 16 601 bytes after

Cut 14 963 bytes, all in `181dd8a`. Total 416 205 to 401 242 against an unchanged floor of 399 843
and budget of 417 843. Fifteen files at both ends.

Two prompts carry most of it: `coderev.md` gave back 5 240 bytes and `ontorev.md` 4 264, both to
`rules/review-contract.md`, which is now the single authoring home of the review file's mandated
header fields. The remaining 5 459 bytes are five claims that stood in all fifteen prompts and now
stand once each: the per-prompt reductions run 496, 496, 496, 496, 496, 496, 637, 321, 305, 305,
305, 305, 305 across the other thirteen files.

Command (before and after):

```
node <scratch>/measure.mjs 370bfc5
node <scratch>/measure.mjs
```

### `skills/*/SKILL.md`: 30 bytes before, 4 661 bytes after

Net 4 631 bytes removed. Total 240 409 to 235 778 against an unchanged floor of 220 439 and budget
of 240 439. Twelve files at both ends. The path was not monotonic, and the intermediate figures
matter for the fifth stopping clause:

| Commit | What it was | Skills total | Head-room |
|---|---|---|---|
| `370bfc5` | session start | 240 409 | 30 |
| `c2ad89c` | step 4, the cut | 236 069 | 4 370 |
| `620e737` | review-finding repair | 236 119 | 4 320 |
| `6781814` | steps 5 and 6, defects 1 and 2 | 236 423 | 4 016 |
| `77b9a02` | second round of review repairs | 235 778 | 4 661 |

The step-4 cut removed 4 340 bytes across eight bodies (`next` 1 083, `setup` 1 042, `help` 468,
`cleanup` 455, `curate` 330, `direct` 330, `cadence` 316, `memo` 316). Step 6 came in negative on
`help` as the plan predicted, at 68 bytes, and step 5 added 372 to `setup`.

### Hook test suite: 12 lines before, 302 lines after

Net 290 lines removed. Total 20 363 to 20 073 against an unchanged floor of 17 875 and budget of
20 375. Forty-four files before, forty-five after.

| Commit | What it was | Suite lines | Head-room |
|---|---|---|---|
| `370bfc5` | session start | 20 363 | 12 |
| `5afb910` | step 2, the cut | 19 862 | 513 |
| `181dd8a` | agents cut, pin re-approval | 19 903 | 472 |
| `c2ad89c` | skills cut, pin re-approval | 19 911 | 464 |
| `7c9e3f1` | step 7, the prose-metric test | 20 073 | 302 |

The cut itself was 501 lines, most of it the `BASELINE` pin's re-approval log moving out of
`reference-resolution-lint.test.ts` into `shared/analyses/260822-1318-reference-resolution-pin-re-approval-log-entries-1-to-25.md`
(427 lines out of that one file), with 29 lines coming back into `helpers/citation-scan.ts` as the
shared walk that nine files had been reimplementing.

The 302 lines clears the 300-line target by two lines. That is a real margin and a thin one; the
next test file of any size on this surface will need a cut in front of it.

## The four baseline maps are unchanged

This is the Circle's central promise, so it is shown by diff rather than asserted. Each map was
extracted from `370bfc5` and from the working tree by the same `awk` slice and compared:

| Map | File | Result |
|---|---|---|
| `AGENT_BASELINE` | `hooks/lib/__tests__/surface-growth-bound.test.ts` | identical, 17 lines / 413 bytes |
| `SKILL_BASELINE` | `hooks/lib/__tests__/surface-growth-bound.test.ts` | identical, 14 lines / 389 bytes |
| `TEST_LINE_BASELINE` | `hooks/lib/__tests__/surface-growth-bound.test.ts` | identical, 41 lines / 1 554 bytes |
| `RULE_BASELINE` | `hooks/lib/__tests__/rules-emission-golden.test.ts` | identical, 17 lines / 1 042 bytes |

```
git show 370bfc5:<file> | awk '<slice>' > a; awk '<slice>' < <file> > b; diff -q a b
```

`diff -q` reported no difference for all four. The room was bought by cutting.

## The seven stopping clauses, read back

**1. Each of the four defects is closed, and `cd hooks && npm test` exits 0 at the commit that
closes each. Yes.** The four records carry the `_c_` marker, verified by filename. The four closing
commits each reported exit 0 in their step history: `4a58be1` (defect 4, history
`shared/history/260822-1215-coder-close-the-growth-bound-record-on-a-verified-disposition.md`),
`7c9e3f1` (defect 3, `shared/history/260822-1425-coder-plan-c0-step-7-prose-metric-test.md`),
and `6781814` for defects 1 and 2
(`shared/history/260822-1450-coder-c0-steps-5-and-6-two-defects-on-the-skills-surface.md`). The
per-commit exits are read from those reports, not re-run here: re-running them would need a
checkout of each commit, which this step is not permitted to take. Exit 0 at HEAD is verified by
this step's own run.

**2. `agents/*.md` at least 12 000 bytes, `skills/*/SKILL.md` at least 3 000, the hook tests at
least 300 lines. Yes, all three.** 16 601, 4 661 and 302, measured above.

**3. No baseline map moved. Yes.** All four byte-identical by diff, shown above.

**4. Every cut carries a named authoring home or a stated reason the text is not load-bearing.
Tripped once, caught by review, repaired.** This is not an unbroken yes. The step-4 cut in
`c2ad89c` moved a claim in `skills/cleanup/SKILL.md` and `skills/help/SKILL.md` to a header that did
not hold it, which is exactly the failure this clause exists to catch. The review caught it and
filed
`shared/issues/260822-1421_*_two-skill-bodies-lost-the-x-guard-rationale-to-a-header-that-does-not-carry-it.md`.
`620e737` repaired it by putting the rationale into the helper header the two pointers were already
claiming carried it, and `77b9a02` repaired a further four claims the same session had written that
turned out to be false. Both records are closed. The clause holds at HEAD; it did not hold
continuously through the Circle.

**5. Nothing was added to any bounded surface beyond the four defect fixes. No.** There is a filed
record saying this clause has no true answer,
`shared/issues/260822-1506_*_two-of-the-c0-plans-stopping-clauses-cannot-both-be-answered-yes-for-a-repair-the-first-one-demands.md`,
and the measurement agrees with it and finds one more instance than it names.

Additions to a bounded surface that are not one of the four defect fixes:

- `skills/*/SKILL.md`, `620e737`: **+50 bytes**, two pointer widenings of 25 bytes each in
  `skills/cleanup/SKILL.md` and `skills/help/SKILL.md`. This is the repair clause 4 demanded, and it
  is the instance the filed record names.
- `skills/*/SKILL.md`, `77b9a02`: **+156 bytes** on `skills/help/SKILL.md`, inside a commit that was
  net 645 bytes negative on the surface. Also a review-finding repair.
- Hook test suite, `181dd8a`: **+41 lines**, and `c2ad89c`: **+8 lines**. These are the `BASELINE`
  pin re-approval attributions and the reviewer-role entries that the `agents/` and `skills/` cuts
  required in the same commit. The plan anticipated this cost and ordered step 2 first to pay for
  it, but the clause's enumeration admits only the four defect fixes, so these are additions the
  clause does not have a slot for either.

The honest answer is therefore "no", by 206 bytes on `skills/*/SKILL.md` and 49 lines on the hook
test suite, none of it a feature and all of it required by another clause or another step. Two
figures worth stating alongside it, so the answer is not over-read: every one of the four surfaces
is net negative across the range, and none is near its bound. The clause is not reworded here and
the plan's stopping section is not edited; the record above proposes a fix (widen the enumeration by
one category) and it is the user's to take at the closure gate.

**6. The closure note states, per surface, what was cut and what the head-room measured before and
after, including the rule core. Not yet, and not this step's to satisfy.** The figures are above.
The note is the orchestrator's at Phase 4.

**7. The Circle also stops validly without meeting the three head-room clauses if the Gate A ledger
did not clear a target. Not the path taken.** The ledger did report a shortfall:
`shared/analyses/260822-1226-cut-ledger-for-three-bounded-surfaces.md` opens by saying the hook test
suite yields about 83 lines against a target of 500 from restatement and superseded rows alone, and
that the only route to the target was a decision rather than a cut. The user answered that decision
at Gate A in favour of moving the re-approval log
(`shared/decisions/260822-1229_*_where-does-the-reference-resolution-pins-re-approval-attribution-log-live.md`,
option 2, now `_i_`), the Circle proceeded, and all three head-room clauses are met. The clause is
inapplicable rather than false.

## The four defects, by record path

All four carry the closed marker.

| Defect | Record |
|---|---|
| 1. Step 0e's unguarded blocks and unreported outcome | `circles/260820-2051-style-rules-arrive-and-get-measured/issues/260821-0302_*_step-0es-repair-guards-one-of-its-three-blocks-and-its-done-report-omits-the-outcome-that-guard-emits.md` |
| 2. The v10.5 note missing from `/fusion:help` | `shared/issues/260822-0946_*_the-v10-5-release-note-reaches-the-readme-and-not-fusion-help-because-the-skills-bound-has-30-bytes.md` |
| 3. No test for `bin/fusion-prose-metric` | `circles/260820-2051-style-rules-arrive-and-get-measured/issues/260821-0144_*_the-authoritative-prose-metric-has-no-test-and-the-hook-test-surface-has-43-of-2500-lines-left.md` |
| 4. The growth-bound record whose stopping criterion could not be met | `circles/260821-1042-reply-bounded-whole-question-answered/issues/260821-2204_*_a-growth-bound-lost-half-its-head-room-against-a-stated-stopping-criterion-and-the-finding-lives-only-in-a-history-log.md` |

Six further defects were opened and closed inside the range, all of them review findings:
`shared/issues/260822-1421_*_two-skill-bodies-lost-the-x-guard-rationale-to-a-header-that-does-not-carry-it.md`,
`shared/issues/260822-1422_*_the-doc-comment-for-shippedprompts-is-stranded-above-agentnames.md`,
`shared/issues/260822-1506_*_setups-exit-code-sentence-ends-in-a-colon-introducing-a-list-that-was-cut.md`,
`shared/issues/260822-1506_*_the-declined-second-order-cut-is-declined-on-a-reason-the-same-commit-made-false.md`,
`shared/issues/260822-1506_*_the-help-caps-standing-line-makes-three-claims-about-docs-and-none-of-the-three-resolves.md`,
`shared/issues/260822-1506_*_the-help-caps-standing-line-names-one-silent-action-and-the-v9-note-holds-a-second.md`.

## Records this Circle opened and left open

Named rather than counted, so the closure note can point at them.

**Open defects (`_o_`), twelve:**

- `shared/issues/260822-1028_*_the-gitignore-kept-list-names-three-tracked-records-and-the-rule-it-cites-names-four.md`
- `shared/issues/260822-1136_*_two-definitions-of-the-turn-count-disagree-and-the-resume-snippet-counts-every-session-in-the-log.md`
- `shared/issues/260822-1154_*_an-open-defect-cites-a-test-file-deleted-eleven-days-ago-and-half-of-it-is-unfixable.md`
- `shared/issues/260822-1226_*_the-executor-report-contract-cites-bugfixer-as-its-author-and-bugfixer-defines-a-different-shape.md`
- `shared/issues/260822-1227_*_plan-step-4-names-a-duplication-record-whose-own-fix-direction-forbids-the-cut-the-step-asks-for.md`
- `shared/issues/260822-1228_*_plan-step-8-asks-for-a-closure-that-was-already-made-and-the-record-already-carries-the-note.md`
- `shared/issues/260822-1503_*_claude-mds-docs-row-says-fusion-help-points-at-every-upgrade-note-and-the-cap-made-that-false.md`
- `shared/issues/260822-1506_*_the-prose-metric-counts-a-bare-em-dash-as-a-prose-word-and-only-the-test-says-so.md`
- `shared/issues/260822-1506_*_the-prose-metric-test-pins-every-header-rule-except-the-two-the-header-calls-limits.md`
- `shared/issues/260822-1506_*_the-v9-upgrade-notes-preamble-calls-six-checks-optional-and-check-2-describes-a-silent-behaviour-change.md`
- `shared/issues/260822-1506_*_two-of-the-c0-plans-stopping-clauses-cannot-both-be-answered-yes-for-a-repair-the-first-one-demands.md`
- `shared/issues/260822-1510_*_five-of-fifteen-not-opened-entries-name-records-that-do-not-exist-and-no-gate-reads-that-field.md`

**Open decisions (`_o_`), four:**

- `shared/decisions/260822-1136_*_how-does-the-tracked-event-log-behave-when-two-checkouts-both-appended-to-it.md`
- `shared/decisions/260822-1136_*_which-identity-does-an-attributed-record-carry-when-the-transport-is-git.md`
- `shared/decisions/260822-1154_*_does-a-cut-only-circle-re-baseline-the-surfaces-it-cuts.md`
- `shared/decisions/260822-1154_*_does-the-hook-test-line-budget-cover-comment-prose.md`

**Answered but not implemented (`_a_`), two:**

- `shared/decisions/260822-1102_*_what-happens-when-a-planned-circles-required-work-exceeds-the-remaining-head-room.md`
- `shared/decisions/260822-1330_*_where-does-the-reviewer-contract-live-when-the-agents-surface-has-to-give-back-bytes.md`

**Answered and implemented (`_i_`), one:**
`shared/decisions/260822-1229_*_where-does-the-reference-resolution-pins-re-approval-attribution-log-live.md`.

**Live planning records, two**, both still `_o_` and the orchestrator's to transition:
`shared/planning/260822-1136_*_spec-fusion-becomes-a-multi-user-tool.md` and
`shared/planning/260822-1154_*_plan-c0-cut-only-circle-buys-head-room-on-four-bounded-surfaces.md`.

## One observation for the orchestrator

`shared/decisions/260822-1330_*_where-does-the-reviewer-contract-live-when-the-agents-surface-has-to-give-back-bytes.md`
carries the answered marker and an unfilled `Implemented:` stub, but its answer (option 1, move the
contract to `rules/`) was realised in `181dd8a`. The marker looks one transition behind. This step
did not rename it: the record belongs to step 3's work, and step 9 changes no file but its own log.

## Verification

`cd hooks && npm test` — exit 0. 41 test files, 724 tests.

Here that proves one thing only: this history file broke no citation gate. It is not evidence for
any figure above. `hooks/lib/__tests__/workbench-citation-lint.test.ts` recomputes its corpus from
the tree on every run, so a bad path in this log would redden the suite; the head-room numbers were
produced by the scratch measurements described at the top and by `git diff`, neither of which the
suite runs.

## Housekeeping

Two scratch scripts and one extracted tree under the session scratchpad
(`measure.mjs`, `core.mjs`, `at370/`) were deleted after the measurement. Nothing was written inside
the repository or the workbench except this file.
