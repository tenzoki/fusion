# Shaper — Directive correction at the Rebalance gate, 260802-1734

**Agent:** shaper (in-Circle clarification mode)
**Circle:** `circles/260801-1244-rule-provenance-header` (`_t_`)
**Status:** Complete
**Trigger:** user choice at the Rebalance gate, following the reconciler's `revise Directive` recommendation
**Scope:** text corrections to `_t_circle.md` only. No spec, plan, code, issue, or decision touched. No Circle other than this one read for write purposes.

## Why this pass ran

The reconciler's Coherence verdict at 260802-1413 was `review-needed` on the Artifact-to-Directive edge,
and the flag was on the Directive's wording rather than on the work. Eight commits landed in
`e8988d9..b568ad9`, all eight acceptance criteria were verified against the tree, and the suite is green
at 780 tests. The user chose a bounded text correction over a re-shape.

## What changed in `_t_circle.md`

Four edits, in three places.

### 1. The count in the Directive

"All nine of the plugin's rule files carry a header" became "All ten". The record's own
`## Grounding snapshot` had corrected the count at activation and stated outright that the Directive
still misstated it, so the record shipped a knowing internal contradiction through three Turns.

### 2. The payoff clause in the Directive

Before:

> What the header buys is a mechanical check that a rule outlived its reason: a rule whose motivating
> decision record carries the superseded marker becomes a retirement candidate any reader can spot,
> which is what makes the curator's grounding-in-history requirement true by construction rather than
> dependent on its diligence.

After:

> What the header buys is a mechanical check that a rule outlived its reason: a rule whose motivating
> decision record carries the superseded marker becomes a retirement candidate any reader can spot. The
> check is available forward only. It covers rule files written from the convention onward, whose
> authors have a decision record to cite, and none of the ten backfilled here: four of those cite a
> Circle directory and six cite the introducing commit, and neither form carries a state marker. No
> backfilled citation can be upgraded to the decision-record form later, because neither cited Circle
> holds a record that motivated any of those files. The curator's grounding-in-history requirement is
> therefore true by construction for the corpus as it grows, and for the ten files the curator reads
> today it still depends on the curator's own diligence.

The mechanism's claim is unchanged, because the mechanism was delivered in full: the convention is
documented, ten files carry a header, the gate refuses a rule file without one. What the rewrite adds is
the scope of the payoff, which the spec had already established and the Directive had not absorbed.
The spec states it at `planning/260802-1103_c_spec-rule-provenance-header.md:165` and again at `:212`,
where the limitation is called permanent for this corpus rather than a day-one gap that later closes.

This edit is the one that matters beyond bookkeeping. `circles/260801-1244-curator` depends on this
Circle hard and reads this Directive as its premise; the reconciler's phrasing was that the record
"hands the curator Circle a premise stronger than what was built".

### 3. Two count references in the Grounding snapshot

The sentence flagging the Directive's stale count now records that the correction happened rather than
that a discrepancy stands. One further word in the snapshot's closing paragraph moved from "all nine
backfills" to "all ten", since leaving it would have reproduced one paragraph down the contradiction
the snapshot itself opens by correcting.

### 4. The empty `## Turn log`

Three bullets added, one per Turn, in the format of the Circle record template in
`rules/fusion-workbench-conventions.md` `## Circle record template`: commits, Coherence verdict, session
history path, and a short sentence naming what the Turn did. All three Turns ran in session 260802-0848
and all three returned an `ok` verdict. The reconciler had recorded the empty section as state rather
than filing it as an issue, because the session was still open at the time of that pass.

## What was deliberately not touched

- **`**Status:** anticipated`** on line 5, which disagrees with the `_t_` marker on the filename. This is
  the originating instance of the skill defect filed at
  `shared/issues/260802-0920_o_next-skill-activates-a-circle-without-updating-its-status-field.md`. The
  reconciler left it uncorrected so the defect survives to be fixed at its source, and the user is
  keeping that.
- **`## Closure note`.** The user owns it, and it belongs to the terminal-marker transition.
- **The spec, the plan, and every commit.** Nothing about the work needed redoing.

## One observation, reported to the user rather than acted on

Line 8 still reads `**Active session history:** (none yet)` after three Turns against
`history/260802-0848-orchestrator-session.md`. That field is the orchestrator's at Phase 4, it sits
outside the two sections this pass was asked to correct, and it is the same class of transition-time
field-update miss as the `**Status:**` defect already filed. Left as found.
