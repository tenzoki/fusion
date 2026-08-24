# Coder — the final state is measured

**Status:** Complete
**Agent:** coder
**Circle:** `circles/260820-2051-style-rules-arrive-and-get-measured`
**Task:** plan step 18 of `circles/260820-2051-style-rules-arrive-and-get-measured/planning/260820-2324_*_plan-style-rules-arrive-and-get-measured.md`
**Working tree at HEAD:** `acef2ad` (the orchestrator commits)
**Shipped files changed:** none. This step measures and reports.

Every number below was taken at `acef2ad` by the command written beside it. Nothing here is
carried over from a commit message, a plan projection or an earlier note. Where a figure
disagrees with one already written down, the disagreement is stated rather than smoothed.

## 1. The repaired corpus, per file

Command, run from the repository root:

    bin/fusion-rules coder | xargs bin/fusion-prose-metric

Output, with the plugin-root prefix stripped for width:

| File | Prose em-dash | Prose words | Rate /1000 | Permitted | Verdict |
|---|---|---|---|---|---|
| `rules/agent-setup.md` | 0 | 488 | 0.0 | 0 | ok |
| `rules/fusion-workbench-conventions.md` | 6 | 7738 | 0.8 | 7 | ok |
| `rules/decision-record-examples.md` | 0 | 332 | 0.0 | 0 | ok |
| `rules/user-facing-output.md` | 1 | 2577 | 0.4 | 2 | ok |
| `rules/critical-stance.md` | 1 | 1529 | 0.7 | 1 | ok |
| `fusion-workbench/stilwerk/chat-voice-de.yaml` | 0 | 628 | 0.0 | 0 | ok |
| **total (6 files)** | **8** | **13 292** | **0.6** | 13 | **ok** |

Exit 0. Every one of the six sits at or under the ceiling of one prose em-dash per 1000 prose
words, which is acceptance criterion 1 of this step for the emitted half.

The four source profiles, measured separately:

    bin/fusion-prose-metric fusion-workbench/stilwerk/chat-voice-de.yaml \
      fusion-workbench/stilwerk/chat-voice-en.yaml \
      fusion-workbench/stilwerk/default-voice-de.yaml \
      fusion-workbench/stilwerk/default-voice-en.yaml

| File | Prose em-dash | Prose words | Rate /1000 | Permitted | Verdict |
|---|---|---|---|---|---|
| `chat-voice-de.yaml` | 0 | 628 | 0.0 | 0 | ok |
| `chat-voice-en.yaml` | 0 | 684 | 0.0 | 0 | ok |
| `default-voice-de.yaml` | 0 | 976 | 0.0 | 0 | ok |
| `default-voice-en.yaml` | 1 | 1014 | 1.0 | 1 | ok |
| **total (4 files)** | **1** | **3302** | **0.3** | 3 | **ok** |

Exit 0, and all four at or under the ceiling. `default-voice-en.yaml` sits exactly at 1.0 with
one permitted mark, so it passes on the boundary rather than below it. Stated because a later
edit that adds a single word to that file does not change its verdict, and one that adds a
second em-dash does.

`chat-voice-de.yaml` appears in both tables. It is one file measured twice, once as the profile
`bin/fusion-rules` emits and once as a source profile, so the union of the two sets is nine
files and not ten.

## 2. `npm test`

    cd hooks && npm test

Exit 0. 40 test files, 718 tests, all passing. Duration 64.51 s.

Run twice, once before this note was written and once after it and after the plan step was
marked done, so the reported result is the state a reader will find rather than the state
before the last two files moved. Both exited 0 at 40 files and 718 tests; the quoted duration
is the later run's.

## 3. The four growth bounds, with head-room as a number

The four are independent budgets, so none of these figures can be spent by another surface.
Each was computed against the baseline map declared in the test file that bounds it, read at
`acef2ad`, and not quoted from anywhere.

| Surface | Unit | Now | Floor | Head-room | Budget | Spent | **Remaining** |
|---|---|---|---|---|---|---|---|
| Always-on rule set | bytes | 95 007 | 86 573 | 12 000 | 98 573 | 8 434 | **3 566** |
| `agents/*.md` | bytes | 416 205 | 399 843 | 18 000 | 417 843 | 16 362 | **1 638** |
| `skills/*/SKILL.md` | bytes | 240 409 | 220 439 | 20 000 | 240 439 | 19 970 | **30** |
| Hook test suite | lines | 20 343 | 17 875 | 2 500 | 20 375 | 2 468 | **32** |

Read as percentages of each budget: the always-on set has spent 70.3 per cent of its head-room,
`agents/` 90.9 per cent, `skills/` 99.85 per cent and the hook tests 98.7 per cent.

**Two of the four are effectively exhausted.** `skills/` has 30 bytes left and the hook tests
have 32 lines. Thirty bytes is one short sentence; a single added clause in any skill body turns
that bound red, and the way out is a cut, never a baseline edit.

**All four of those figures were spent down by this Circle, and `skills/` most of all.** The
start values are the `total` lines of `hooks/lib/__tests__/fixtures/surface-growth.golden` at
`c4a68e0` for three surfaces, and the five always-on rule files summed at `c4a68e0` for the
fourth.

| Surface | At `c4a68e0` | At `acef2ad` | Spent here | Head-room at start | Head-room now |
|---|---|---|---|---|---|
| Always-on rule set | 92 869 | 95 007 | +2 138 | 5 704 | 3 566 |
| `agents/*.md` | 415 584 | 416 205 | +621 | 2 259 | 1 638 |
| `skills/*/SKILL.md` | 231 892 | 240 409 | **+8 517** | 8 547 | **30** |
| Hook test suite | 20 259 | 20 343 | +84 | 116 | 32 |

The whole of the `skills/` spend is one file. `skills/setup/SKILL.md` went 38 253 to 46 770,
which is the entire +8 517, and it is the only skill body the Circle touched: step 3's Step 0e
asset comparison and the later fix that made those blocks resolve their own source root. The
`skills/` bound entered this Circle with 8 547 bytes and leaves it with 30, so the surface went
from comfortable to one clause from red inside one Circle, on a single file.

The other three spends are attributable in one line each. `agents/` is step 17's
`Long-form prose vs short-form` block in `agents/curator.md`, +621 bytes and the only agent
prompt touched. The hook tests are two files: the five count-pin re-approval notes in
`reference-resolution-lint.test.ts` at +51 lines, and step 4's test in
`rules-voice-profile.test.ts` at +33, giving +84. The always-on set is section 4 below.

Two of the start figures confirm numbers the plan wrote down before the work: its risk table
gave the always-on head-room as 5 704, and its testing strategy gave the hook-test surface as
116 lines. Both reproduce exactly.

How each figure was derived, so a later reader can reproduce it rather than trust it:

- **Always-on rule set.** The bound in `hooks/lib/__tests__/rules-emission-golden.test.ts`
  measures the universal core, meaning the plugin `rules/` files every agent loads. That is the
  five files, and the voice profiles are out of scope for it because they vary per consuming
  project. Floor is `RULE_BASELINE` summed over those five: 3 513 + 52 027 + 4 291 + 16 784 +
  9 958 = 86 573. `GROWTH_BUDGET` is 12 000. The present total was taken two ways and agreed:
  `stat -f%z` over the five files gives 95 007, and the `[coder]` block of
  `hooks/lib/__tests__/fixtures/rules-emission.golden` gives 95 007, that golden being held
  equal to live measurement by the green suite.
- **The other three.** The baseline maps were parsed out of
  `hooks/lib/__tests__/surface-growth-bound.test.ts` and the file sets rebuilt with the same
  readers the test uses, including its own line count, which counts `\n` bytes. All three totals
  reproduce the checked-in `hooks/lib/__tests__/fixtures/surface-growth.golden` exactly:
  416 205, 240 409 and 20 343.

One property of the hook-test floor worth recording. Five files in that surface carry no
baseline entry at all, so their whole current size reads as growth: `committed-dist.test.ts`,
`fenced-code-exemption.test.ts`, `plan-stopping-section-lint.test.ts`,
`sentence-identifier-containment.test.ts` and `workbench-citation-lint.test.ts`. That is the
helper's intended arithmetic and not a defect, and it is why 2 468 of the 2 500 lines are spent
while this Circle added 84.

## 4. The always-on byte delta this Circle produced

Net across the Circle's whole commit range, `c4a68e0..acef2ad`, over the five always-on rule
files, taken with `git cat-file -s` per file per commit:

| File | At `c4a68e0` | At `acef2ad` | Delta |
|---|---|---|---|
| `rules/agent-setup.md` | 3 499 | 3 455 | −44 |
| `rules/fusion-workbench-conventions.md` | 56 702 | 57 055 | +353 |
| `rules/decision-record-examples.md` | 4 522 | 4 495 | −27 |
| `rules/user-facing-output.md` | 18 205 | 20 144 | **+1 939** |
| `rules/critical-stance.md` | 9 941 | 9 858 | −83 |
| **total** | **92 869** | **95 007** | **+2 138** |

**The net figure hides movements that pull in opposite directions, so each is given on its own.**
Every row below is the difference between one commit and its parent, over the same five files.

| What | Commits | Bytes |
|---|---|---|
| Step 3's layout row in the conventions file | `b22525d` → `dc78da2` | **+669** |
| The repunctuation, three files then the conventions file | `3464575` → `b393a45` → `c226949` | **−470** |
| Step 13, the fact-first condition | `921a75a` → `80d1599` | **+1 091** |
| Step 14, the foreclosure clauses | `80d1599` → `86edaac` | **+848** |

−470 + 1 939 + 669 = +2 138, which closes against the net figure above.

The repunctuation returned **470 bytes**: 154 from the three-file pass (`agent-setup.md` −44,
`decision-record-examples.md` −27, `critical-stance.md` −83) and 316 from the conventions file.
The plan's risk table projected "roughly 470 bytes" for exactly this, and the projection was
right to the byte.

Steps 13 and 14 together spent **1 939 bytes**, all of it in `rules/user-facing-output.md`.
That is 4.1 times what the repunctuation returned. Against the always-on head-room this Circle
inherited, the two steps consumed 16.2 per cent of the 12 000-byte budget between them.

Step 3's row is neither repair nor rule-clause spend, and it is listed separately for that
reason. It is the `.asset-provenance` entry the setup mechanism required, and it landed before
the repair, which is why the corpus briefly rose to 172 em-dashes over 13 105 words at
`dc78da2`: the new paragraph carried one em-dash of its own, and the step 12 repair removed it
again along with the rest.

## 5. The corpus word count, and the dilution separated from the repair

The measurement protocol at
`circles/260820-2051-style-rules-arrive-and-get-measured/analyses/260820-2354-prose-register-measurement-protocol.md`
records in its untreated condition 3 that steps 13 and 14 lower the corpus rate by dilution
rather than by repair, and that section 9's word count is what makes the two separable
afterwards. This is that number.

The corpus was measured at four commits by extracting each file version with `git show` into a
scratch directory and running `bin/fusion-prose-metric` over the six.

| Commit | What it is | Em-dash | Prose words | Rate /1000 |
|---|---|---|---|---|
| `c4a68e0` | the Circle's parent | 171 | 13 018 | 13.1357 |
| `fac97f4` | the protocol's own baseline | 171 | 13 018 | 13.1357 |
| `dc78da2` | after step 3's layout row | 172 | 13 105 | 13.1248 |
| `921a75a` | after every repair, before steps 13 and 14 | 8 | 12 963 | 0.6171 |
| `acef2ad` | HEAD | 8 | 13 292 | 0.6019 |

`c4a68e0` and `fac97f4` agree, which confirms that the protocol's pre-repair table and the
Circle's starting state are the same corpus and not two.

**Dilution accounts for 0.122 per cent of the fall.** The rate fell 13.1357 → 0.6019, a total of
12.5338 per 1000. Of that, 12.5185 happened at the repair and 0.0153 at steps 13 and 14. The
repair did not dilute at all: it *shrank* the corpus by 55 prose words, 13 018 to 12 963, so the
denominator moved against the fall rather than with it. Steps 13 and 14 then added 329 prose
words carrying no em-dash, which is the whole of the dilution the protocol asked to have
isolated. Net word movement across the Circle is +274.

The protocol's concern was that a corpus rate falling partly by dilution is a smaller treatment
than the same fall by repair. Measured, the concern does not bind here: 99.88 per cent of the
fall is repair.

Section 9's shape, completed at this boundary:

| | Em-dash | Prose words | Rate /1000 |
|---|---|---|---|
| always-on total, as `bin/fusion-rules coder` emits it | 8 | 13 292 | 0.6 |
| `CLAUDE.md` | 126 | 8 892 | 14.2 |
| **always-on prose a `coder` actually holds** | **134** | **22 184** | **6.0** |
| the `analyst` emitted set, eight files | 29 | 15 077 | 1.9 |

`CLAUDE.md` reads 126 em-dashes over 8 892 words at `acef2ad`. It carried 125 over 8 577 at the
Circle's parent `c4a68e0` and 125 over 8 803 at the protocol's baseline `fac97f4`, so across the
Circle it gained one em-dash and 315 prose words, from record-keeping edits rather than from any
repair. It is now 94.0 per cent of the em-dashes a `coder` holds at dispatch, against 42.2 per
cent at the protocol's pre-repair baseline. **The unrepaired file barely moved; what changed is
that it is now almost the whole of the remaining fault.**

The `analyst` set is 29 over 15 077. Twenty of those 29 marks are `rules/design-diagrams.md`
alone, unrepaired at 25.9 per 1000, which the protocol names as untreated condition 2.

**This is not yet the post-repair boundary in the protocol's sense.** Section 4 of the protocol
opens that window at the commit carrying the Circle's `_t_` to `_b_` transition, which has not
been made. The figures above are the corpus at `acef2ad`, and they are the post-repair corpus
provided no later step in this Circle edits corpus prose. Step 18 changes no shipped file, so
the only way they move before closure is a step nobody has planned.

## 6. The check: no baseline was edited

    git diff --stat c4a68e0 HEAD -- hooks/lib/__tests__/

Four files moved, 188 insertions and 104 deletions:

| File | Insertions / deletions | What it is |
|---|---|---|
| `fixtures/rules-emission.golden` | 90 / 90 | generated golden |
| `fixtures/surface-growth.golden` | 7 / 7 | generated golden |
| `reference-resolution-lint.test.ts` | 52 / 1 | count pin plus its attribution notes |
| `rules-voice-profile.test.ts` | 39 / 6 | new test coverage for step 4 |

**No growth baseline moved, and the evidence is stronger than a reading of the diff.** The three
files that declare a growth baseline are `hooks/lib/__tests__/rules-emission-golden.test.ts`
(`RULE_BASELINE`, `GROWTH_BUDGET`), `hooks/lib/__tests__/surface-growth-bound.test.ts`
(`AGENT_BASELINE`, `SKILL_BASELINE`, `TEST_LINE_BASELINE`, and the three head-room constants)
and `hooks/lib/__tests__/helpers/growth-bound.ts`, which holds the arithmetic. None of the three
appears in the diff at all, so their baselines are byte-identical across the whole range. That
is why the head-room figures in section 3 are measured against the armed numbers and not against
numbers this Circle chose for itself.

The distinction the acceptance criterion turns on, stated plainly:

- **A growth baseline** is what a bound measures growth *from*. It moves at exactly two written
  moments, after a cleanup or at a one-time arming, per
  `## Re-baselining: the two events at which a baseline moves` in
  `hooks/lib/__tests__/helpers/growth-bound.ts`. Editing one to clear a red bound is the move
  that section exists to refuse. **None moved here.**
- **A count pin** is what a lint gate resolved last time it was approved. Its own failure
  message names re-approval as the expected response to a legitimate change, and the file
  requires an attribution note beside it. Moving one is routine. **One count pin moved here, and
  it moved five times.**
- **A golden** records what files weigh or emit today. Regenerating one records growth and
  absolves none of it, which both golden headers state in the file. **Two moved here.**

Each of the four is accounted for.

`fixtures/rules-emission.golden` was regenerated by `dc78da2`, `b393a45`, `c226949` and
`86edaac`, the four commits that changed a byte in an always-on rule file. Its 90 changed lines
are the same five per-file sizes restated across the fifteen agent blocks plus their totals.

`fixtures/surface-growth.golden` was regenerated by `fac97f4`, `dc78da2`, `1c1178d`, `3464575`
and `acef2ad`, each of which moved an agent prompt, a skill body or a test file's line count.

`reference-resolution-lint.test.ts` carries `BASELINE = { paths, anchors, records }`. **Five**
re-approvals landed in the Circle, counted as `+// Re-approved` lines in the range diff, and the
chain of pinned values reads:

    c4a68e0  { paths: 1223, anchors: 160, records: 112 }   the Circle's parent
    fac97f4  { paths: 1235, anchors: 160, records: 113 }   step 1, the metric program
    dc78da2  { paths: 1244, anchors: 161, records: 115 }   step 3, Setup Step 0e
    1c1178d  { paths: 1247, anchors: 162, records: 115 }   step 4, the stderr notice
    3464575  { paths: 1254, anchors: 162, records: 115 }   Step 0e resolves its own root
    acef2ad  { paths: 1255, anchors: 162, records: 115 }   step 17, the curator block

Each of the five carries a note above the constant naming what moved the count, by how much, and
how the movement was attributed, and **all five state an attribution method**: removing,
restoring, reverting or deleting the one file or block responsible, re-running the gate, and
confirming it green at the old number. This constant is not a growth baseline, and the file's own
`BASELINE_MESSAGE` names re-approval as the expected response to a legitimate change.

`rules-voice-profile.test.ts` gained 39 lines and lost 6 at `1c1178d`, which is step 4's test
for the stderr fallback notice. The plan budgeted fewer than 40 lines for that step. It landed
at 39 added, or 33 net.

**Nothing outside `hooks/lib/__tests__/` needed checking for this criterion**, because no growth
baseline is declared anywhere else. `git status --short` over `hooks/`, `rules/`, `agents/`,
`skills/`, `bin/` and `CLAUDE.md` reports nothing uncommitted, so the measured tree and
`acef2ad` are the same tree.

## 7. What a later Circle should read this note for

The Circle ends in Bounded Closure and the measurement its fourth Directive outcome named cannot
run here: the post-repair window has no members while this Circle is the only live one. What
this note fixes for the reader who runs it later:

1. **The corpus reached the ceiling.** Nine distinct files, every one at or under one prose
   em-dash per 1000 prose words, with `default-voice-en.yaml` exactly on the boundary at 1.0 and
   the other eight below it.
2. **The dose is 12.5185 of the 12.5338-point fall by repair and 0.0153 by dilution.** The
   protocol asked for these to be separable and they are now separated.
3. **`CLAUDE.md` is now 94.0 per cent of the em-dashes a `coder` holds.** Repairing the emitted
   rules moved the unrepaired file from 42.2 per cent of the fault to almost all of it. Whether
   that is treated is untreated condition 1's question and it is still open.
4. **Two growth bounds have almost nothing left**, 30 bytes on `skills/` and 32 lines on the
   hook tests, and this Circle is what spent them down. `skills/` entered at 8 547 bytes of
   head-room and leaves at 30, the whole +8 517 being `skills/setup/SKILL.md`. A later Circle
   that plans a skill-body edit or a new test file should budget the cut in the same plan, not
   discover the red suite at the end of it.

## Files changed

- `fusion-workbench/circles/260820-2051-style-rules-arrive-and-get-measured/history/260821-0350-coder-the-final-state-is-measured.md` (this note)
- `fusion-workbench/circles/260820-2051-style-rules-arrive-and-get-measured/planning/260820-2324_o_plan-style-rules-arrive-and-get-measured.md` (step 18 marked `[DONE]`)

No shipped file was changed by this step.

## Verification

`cd hooks && npm test` exits 0. 40 test files, 718 tests, all passing.

---
**Correction appended 260824** (ontocoder, plan step 5 of `circles/260824-1853-close-every-open-defect/planning/260824-1905_*_plan-close-every-open-defect.md`). Section 4's `+2 138` is the delta over the five plugin rule files,
which is the set the growth bound in `rules-emission-golden.test.ts` reads. The set `bin/fusion-rules
coder` emits is six, the five plus `fusion-workbench/stilwerk/chat-voice-de.yaml`, and it gained
`+2 265` over the same range (100 222 to 102 487 bytes); the 127-byte difference is the workbench
chat profile. Section 5's "always-on total" is the six-file set. Both figures are right for their own
set and neither section said the sets differ. Filed as
`circles/260820-2051-style-rules-arrive-and-get-measured/issues/260821-0413_*_the-final-measurement-note-means-two-different-sets-by-always-on-and-its-headline-delta-is-the-smaller-one.md`.
