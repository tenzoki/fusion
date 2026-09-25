# Shaper run 260820-2051 — anticipated Circle `260820-2051-style-rules-arrive-and-get-measured`

**Date:** 2026-08-20
**Agent:** shaper, anticipated-circle mode, run top-level by the user
**Git HEAD at shaping:** `7135a19`
**Product:** `260820-2051-style-rules-arrive-and-get-measured` plus the six
artifact subdirectories. No spec was written, which is what this mode does: the Circle record is
the artifact.

## The draft

The user supplied a written problem set rather than a one-line draft, and rather than a backlog
entry, so no backlog marker was renamed and no `Promoted:` line was appended. The draft covered
three separable conditions and ended with a question about how to handle the fourth:

1. `260816-0740_*_does-the-prose-register-get-a-measurable-gate-and-which-surface-does-it-measure.md`
   is answered as option 4 and stands at the answered marker because the second half of that
   option, the falsification measurement, never ran.
2. The stylometric profile every agent loads in this repository is the workbench copy, and it has
   diverged from the shipped one since `ae21c87`.
3. The reported output defect is a first-sentence defect rather than a punctuation defect. The
   rule that requires the factual opening already exists and nothing checks it.
4. Where the profile should live, and how an improvement reaches an existing project. The draft
   set out four options and recommended the first.

## What was verified rather than accepted

Every load-bearing claim in the draft was checked against disk before it entered the Grounding.

- The four stations and the hard-coded read path in `emit_voice_profile` reproduce as described.
- The divergence reproduces: `chat-voice-de.yaml` 7 358 bytes shipped against 7 353 in the
  workbench, `chat-voice-en.yaml` 6 800 against 6 801, both long-form profiles byte-identical.
- The commit split reproduces: the workbench copy last moved in `b6bca62` (2026-08-07), the
  source in `ae21c87` (2026-08-14).
- **The draft's correction to the open issue is confirmed.** All four files under
  `~/.fusion/stilwerk/` are byte-identical with the work tree today, so the obstacle
  `260814-1419_*_the-shipped-chat-voice-profiles-changed-and-the-workbench-copies-agents-actually-load-did-not.md`
  names has gone and a copy from `$FUSION_PLUGIN_ROOT` now resolves the divergence.

Three figures were measured that the draft did not carry, and each changed the shape of the
Circle.

- **The corpus at HEAD.** `rules/user-facing-output.md` sits at 2.1 em-dashes per 1000 words
  after `6049d3e`, still above its own ceiling of 1. The other four always-on rule files run
  between 15.8 and 28.8.
- **The always-on set is six files, not the seven the analysis tabulates.** `CLAUDE.md` is not
  emitted by `bin/fusion-rules`, and `design-diagrams.md` and `circle-records.md` are conditional
  emissions. That mislabelling is already filed as
  `260816-1345_*_the-register-defects-corpus-table-is-labelled-always-on-and-is-not-the-always-on-set.md`,
  and it decides what surface the measurement covers, so it was pulled into scope.
- **The always-on growth bound has roughly 5 700 bytes of head-room**, at 92 869 bytes against a
  baseline of 86 573 and a budget of 12 000.

Four further open issues were found in the same text the Circle will rewrite, all products of the
first repunctuation pass, and all were put in scope.

## Clarifications, two rounds, eight decisions

Round 1, on scope:

1. All three parts are in the Circle: repair the distribution path, revise the register, run the
   measurement.
2. The register revision covers the whole always-on corpus plus the four profiles. The user chose
   this over the narrow scope after the weak-dose warning in the answered decision was put in
   front of them.
3. The location question is fixed as the draft's option 1 rather than filed as an open decision
   record. The project copy stays, Setup compares and offers a refresh, and a checksum is written
   at copy time so Setup can tell a local adaptation from a stale copy.
4. The line-cap conflict resolves in favour of `rules/user-facing-output.md` at 8 and 12. The
   profiles stop restating the numbers.

Round 2, on depth:

5. A null measurement does not build a gate inside this Circle. The number goes onto the answered
   decision record and the gate question re-opens with a result.
6. `rules/user-facing-output.md` gains a checkable test for the opening sentence, on the pattern
   of recommendation 3's correctio test, rather than a further prohibition.
7. All four defects from the first repunctuation pass are repaired here.
8. The refresh path covers every asset `/fusion:setup` copies into the workbench, not `stilwerk/`
   alone.

## Two things left for the planner

The executor mix is noted in the Grounding and not decided: YAML profiles are `ontocoder`,
`bin/fusion-rules` and `skills/setup/SKILL.md` are `coder`, normative prose splits between
`curator` and `coder`, and the measurement is `analyst`. Which executors a step gets is the
planner's `**Executors:**` decision.

The ordering constraint is stated and its mechanism is not: profiles are revised in `stilwerk/`
or the work does not survive a release, and the project copy is refreshed or the revision has no
effect here. That two-write requirement is the defect the refresh path removes, so the planner
should sequence the mechanism early enough that the second write becomes its output.

## Not done

No spec, no plan, no dispatch. The Circle carries the anticipated marker and is not active.
Activation is the user's separate step through `/fusion:next`, which performs the record rename
and writes `.active-circle`. The active Circle
`260819-1645-four-constraints-on-deep-change` was not touched.

## Voice profiles

Both were emitted and read: `./fusion-workbench/stilwerk/chat-voice-de.yaml` for chat and
`./fusion-workbench/stilwerk/default-voice-en.yaml` for this file and the Circle record. The
chat profile is the diverged copy this Circle exists to repair, which is worth recording: the
short-form output of this run was governed by 8 and 12 rather than the shipped 6 and 8. The
Circle record was written at zero em-dashes across 1 790 words.
