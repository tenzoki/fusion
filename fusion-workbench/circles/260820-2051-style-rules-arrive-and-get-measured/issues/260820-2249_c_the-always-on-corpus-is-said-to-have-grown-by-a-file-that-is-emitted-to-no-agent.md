The always-on corpus is said to have grown by a file that is emitted to no agent, and the claim is inverted

---
Two live records state that `rules/workbench-tracking.md` was added to the set of rule files every
agent loads, and use that statement to argue the pending register measurement has got weaker. The
file is emitted to no agent, and the commit that created it made the always-on set smaller.

---
**Found by:** shaper, in-Circle clarification run for
`circles/260820-2051-style-rules-arrive-and-get-measured`, 2026-08-20.
**Owner:** `coder` for the two record edits. No shipped file is wrong.
**Severity:** Low-Medium. Nothing is broken today. The cost is that the denominator the pending
measurement will be judged against is stated in the wrong direction, on the one record whose whole
remaining content is that measurement.
**Filed in the active Circle** per the Origin Rule: the Circle's Directive is what caused this to be
read, and one of the two carriers is the Circle's own Grounding snapshot.
**Cross-references:**
`shared/decisions/260816-0740_a_does-the-prose-register-get-a-measurable-gate-and-which-surface-does-it-measure.md`
(its 260819-1400 reconciliation carries the claim);
`shared/issues/260816-1345_*_the-register-defects-corpus-table-is-labelled-always-on-and-is-not-the-always-on-set.md`
(the same fault in the same measurement, one file earlier).

## What the two records say

The reconciliation dated 260819-1400 on the decision record states, under *the dose warning*, that
"the always-on corpus has **grown**", because "`rules/workbench-tracking.md` was added in `b200902`
and `bin/fusion-rules` emits it", and concludes that "the repaired fraction is smaller today than
when the caution was written".

`circles/260820-2051-style-rules-arrive-and-get-measured/_t_circle.md` `## Grounding snapshot`
repeats it: "`rules/workbench-tracking.md` has been added to the emitted set since".

## What is true

**Verified at HEAD `a5b73da`, 2026-08-20:**

```
$ grep -c 'workbench-tracking' bin/fusion-rules
0
$ bin/fusion-rules coder
.../rules/agent-setup.md
.../rules/fusion-workbench-conventions.md
.../rules/decision-record-examples.md
.../rules/user-facing-output.md
.../rules/critical-stance.md
./fusion-workbench/stilwerk/chat-voice-de.yaml
$ grep -c 'workbench-tracking' hooks/lib/__tests__/fixtures/rules-emission.golden
0
```

`bin/fusion-rules` contains no reference to the file at all, so it is emitted to no agent and appears
in no golden fixture. `CLAUDE.md` says the same in its own layout table: the rule is "emitted to **no
agent**", its two consumers being a human writing a `.gitignore` and the archive step of
`/fusion:cleanup`.

**The direction is inverted, not merely the membership.** `b200902` is titled *a tracked workbench
gets its own rule file, and a plan's stopping condition gets a reader*, and its own commit message
states the effect on the corpus: the subsection that said which workbench root entries a project
should commit "moved out of the conventions file verbatim", and "the always-on set falls 98 874 to
95 458 bytes on every dispatch, which is what the move was for". A partition that moves text out of an
emitted file and into an unemitted one shrinks the emitted set. The record reads that shrink as growth.

## Why this is worth a record rather than a footnote

The decision record's only remaining content is a measurement that has not run, and the answer it
carries turns on whether the repaired fraction of the corpus is large enough for the result to mean
anything. A statement that the corpus grew, when it shrank, moves that judgement in the wrong
direction on the one record where it is load-bearing.

It is also the second instance of one fault. `260816-1345` found the same measurement's file set
stated wrong in both directions, and its fix direction already says what to do: state the set as the
derivation, which is the unindented `emit_if_exists` lines of `bin/fusion-rules` plus the
unconditional `emit_voice_profile` call, rather than as a list that goes stale on the next emission
change. A hand-written list produced this claim too.

## Fix direction

Correct both live carriers. The decision record's reconciliation is a dated appended note, so the
correction is a further appended note rather than a rewrite of it. The Circle's Grounding snapshot is
live text of an active Circle and the shaper may replace it in portfolio-activation mode; here it is
the `coder` edit the Circle's own spec calls for under capability C6.

State the corpus as its derivation in both, per `260816-1345`.

## What must not be done instead

Emitting `rules/workbench-tracking.md` to make the claim true. Decision
`shared/decisions/260816-1707_i_to-whom-is-the-new-workbench-tracking-rule-emitted-when-its-consumers-are-a-human-and-a-skill.md`
settled that it is emitted to nobody, and the emission is what the file's whole cost argument rests on.

---
Resolved: both live carriers this record names now carry a dated correction, appended beneath the
inverted claim rather than replacing it, which is what the fix direction asked for. Commit
`b8b8f42`, plan step 15.

- `shared/decisions/260816-0740_*_does-the-prose-register-get-a-measurable-gate-and-which-surface-does-it-measure.md:148`
  states the 260819-1400 growth clause as inverted, with the evidence:
  `grep -c workbench-tracking bin/fusion-rules` returns 0, and `b200902` moved text out of the
  emitted set, its own commit message recording the always-on set falling 98 874 to 95 458 bytes per
  dispatch.
- `circles/260820-2051-style-rules-arrive-and-get-measured/_t_circle.md:158` states the same for the
  Grounding snapshot's copy of the clause.

Both also carry the correction this record's own "Why this is worth a record" paragraph implies: the
dose caution survives the reversal and rests on a different fact, that `CLAUDE.md` is always-on
prose no helper emits, at 14.2 prose em-dashes per 1000 and 94 per cent of what is left in the
corpus.

Re-verified at HEAD `247abfe`: `grep -c workbench-tracking bin/fusion-rules` returns 0, and
`bin/fusion-rules coder` emits the same six paths it did at filing time. Nothing was made true by
emitting the file, which is what this record's "What must not be done instead" forbids.

Closed by reconciler 260821-0410; log `fusion-workbench/circles/260820-2051-style-rules-arrive-and-get-measured/history/260821-0416-reconciliation.md`.
