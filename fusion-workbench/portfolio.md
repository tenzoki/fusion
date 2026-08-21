# Portfolio

**Generated:** 260821-1536 (by playmaker session 260821-1536-playmaker-direct-dispatch)
**Domain bias:** code
**git HEAD at run:** `e764637`, working tree clean

**This run holds no user confirmation.** The dispatch prompt carried a domain line and nothing
else: no `**Confirmed operations:**` block, and no channel to the user. Neither of the two channels
in `agents/playmaker.md` `## Two mandates, by dispatch path` was open, so the mandate is the narrow
one. This run ranked, appended one activation proposal, regenerated this file, and was free to
rename backlog markers. It performed no split, merge, close or deferral, and proposes none. Every
figure below was measured against disk on this run.

**What changed since the previous refresh** (`260821-0426`, HEAD `ff8d15e`): a Circle was shaped.
The board was empty of anticipated work at the last refresh and now carries one candidate, with its
scoping questions already answered.

## Active (_t_)

(none)

`.active-circle` is absent and no Circle record carries the active marker. That is the normal
post-closure state, not a fault.

## Anticipated (_a_) — ranked

**Recommended next: `260821-1042-reply-bounded-whole-question-answered` — no dependencies, four
scoping decisions already answered, and a Grounding that measures rather than asserts.**

    /fusion:next 260821-1042-reply-bounded-whole-question-answered

**Ranked (1).** It is the only anticipated Circle on disk, so the recommendation carries no
comparison behind it. What follows is a readiness reading.

1. **`260821-1042-reply-bounded-whole-question-answered`**. Directive: *the whole reply is bounded,
   and it answers the question that was asked.*

   The Directive binds two rule gaps in `rules/user-facing-output.md` that its Grounding names
   precisely. `## Length` caps each surface separately and then sends the overflow to a trailing
   Details block, so a reply can meet every cap and still run to any length; nothing anywhere states
   that the reply answers the question that was put. Both halves come from
   `shared/issues/260812-0253_*_agents-answer-a-question-the-user-did-not-ask-and-the-length-caps-do-not-hold.md`,
   which this Circle closes whole.

   **Every readiness signal this run measures is clean.** `## Dependencies` names no Circle, so no
   dependency flag applies. The Circle's own decisions directory holds four records at answered and
   none at open: `what-may-the-circles-own-new-clauses-cost`, `which-surfaces-may-this-circle-change`,
   `is-claude-mds-register-repair-inside-this-circle` and
   `may-an-agent-read-the-session-transcripts-as-a-source-of-evidence`, all filed `260821-1108`. The
   four questions that would otherwise be asked in the first Turn were put and settled before the
   Circle starts, which is the condition the code-domain heuristic looks for.

   **Its evidence is reproducible and it says where it came from.** The specimen source is outside
   the workbench, in the Claude Code transcripts, and the Grounding gives the read: 2 231 user-facing
   replies across 69 transcripts, 398 of them over the 12-line cap, and it labels that 17.8 per cent
   a floor rather than an estimate because the denominator counts one-line narration too. It also
   corrects a claim in the record that prompted it, naming
   `shared/history/260820-2103-orchestrator-session.md` as *not* carrying the evidence it was cited
   for. A Grounding that retracts one of its own citations before the Circle runs is a better
   starting position than one that does not.

   **The qualification is about the surfaces, not the Circle, and it is the reason to read
   `## Warnings` before activating.** Three of the four growth budgets moved down since the
   Grounding's table was measured at `472134c`, and this Circle's stated method writes into all four.
   The Grounding's own account of the trap is the sharpest argument for taking it now: the Circle
   that preceded it spent 1 939 bytes of new style clauses to return 470 bytes of repair, a ratio of
   4.1, which is a Circle about concision growing the corpus it was sent to shrink.

   **Three decisions it cites still read as open**, all in the closed style-rules Circle. See
   `## Warnings`.

## Backlog — ranked

**Recommended to shape: `shared/backlog/260814-1733_*_bounded-executor-dispatches.md` — still the
only live idea that can be shaped today without a user act coming first.**

    /fusion:direct shared/backlog/260814-1733_*_bounded-executor-dispatches.md

**Live and ranked (2).** Ranking recomputed on this run under the code-domain bias, which prefers an
idea whose cited evidence is already on disk over one that must wait on an unresolved record. Every
path in both entries was expanded and resolved against the store on this run.

1. **`shared/backlog/260814-1733_*_bounded-executor-dispatches.md`** (recommended, `_p_`). Bound how
   long an executor runs before it returns to the orchestrator. Its evidence is on disk and already
   sized: `shared/analyses/260812-0303-simplify-speed-and-why-rules-do-not-hold.md` adopts the
   bounded-dispatch half of the user's filed proposal on cost grounds, at roughly a fourfold saving
   in re-sent tokens, and refutes the re-injection half by finding that the rules did not decay over
   a long dispatch but were never in force to begin with. Shaping it means putting a Directive
   narrower than the filed wording to the user and getting agreement on the narrowing, which is the
   conversation `/fusion:direct` exists to hold.

   **The Circle shaped since the previous refresh sharpens this entry rather than absorbing it.**
   `260821-1042-reply-bounded-whole-question-answered` bounds what an agent *says*; this entry bounds
   how long an agent *runs*. The Circle's own `## Dependencies` draws that line itself, naming
   `shared/issues/260812-0253_*_rules-lose-their-effect-during-a-long-dispatch.md` as adjacent and
   deliberately not taken. The half this entry carries was left on the table by name, which is the
   clearest signal the store has produced for it.

   *Nothing is proposed for this entry.* It states one idea, can be promoted whole, and already
   carries the marker this run's ranking gives it.

2. **`shared/backlog/260814-1733_*_attach-the-rule-to-the-act.md`** (open, `_o_`). A rule lands with
   an executable check or it does not land. Second **on shapeability, not on merit**, and the gap is
   unchanged across seven consecutive refreshes: on the evidence this is the best-supported idea in
   the store, and it still cannot be shaped today.

   *The obstruction, re-verified on disk this run.* The decision this entry depends on,
   `shared/decisions/260810-0710_*_should-a-rule-be-allowed-to-land-without-the-check-that-enforces-it.md`,
   carries the deferred marker. Its deferral names three records as the condition for reviving it,
   two are settled, and
   `shared/issues/260810-0510_*_two-of-the-queue-ground-lints-negative-controls-re-implement-the-logic-instead-of-calling-it.md`
   is still open. Reviving a deferred decision is the user's own act, so the entry stays open.

   *The entry's thesis gained a seventh instance this run, and it is the one recommended for
   activation.* `260821-1042-reply-bounded-whole-question-answered` is bound by
   `shared/decisions/260816-0740_*_does-the-prose-register-get-a-measurable-gate-and-which-surface-does-it-measure.md`
   to build no prose gate until a registered measurement runs, and its own Grounding says it does not
   run that measurement either. So the Circle will write rules about how an agent replies, and no
   check will read them. That is exactly this entry's claim, and it is about to be reproduced by the
   work at the top of the board rather than argued from an old example. The two are not in conflict:
   the constraint on the Circle was chosen by the user for good reasons, and the entry is the case
   for closing the gap afterwards.

   *Nothing is proposed for this entry either.* No split applies, since it states one idea. A merge
   with the entry above would consolidate two distinct Directives and lose one. The idea is live, so
   a close is wrong. Deferring it would cost the user two later acts, reviving the decision and then
   reviving the entry by hand, where leaving it open costs one.

**Proposed and not performed (0).** This run proposes no split, merge, close or deferral, for the
reasons given per entry rather than left to be inferred.

**Performed this run: nothing.** Both live entries already carry the markers this run's ranking gives
them, so the autonomous rename between open and recommended had nothing to do.

**The store also holds one closed entry**, `shared/backlog/260811-0826_*_observations.md`, the user's
hand-written dump of about a dozen ideas, split on 260814-1733 into three and retired. Two of the
three are the live entries above; the third became Circle
`260815-0007-remove-eight-mechanisms-and-cap-growth` and closed. Its trailing line still cites that
third entry at a live path, and the entry was archived on 260817. Repairing a closed entry's body is
not one of this agent's operations.

## Recently closed (_c_ / _b_)

Last five, newest first.

1. **`260820-2051-style-rules-arrive-and-get-measured`**, `_b_`, Bounded Closure, 260821. The
   always-on corpus reached its stated em-dash ceiling at 0.6 per 1000 prose words against a ceiling
   of 1.0, and the fact-first requirement in `rules/user-facing-output.md` got a failure condition.
   Bounded because the register work its Directive reached for is not a repunctuation problem.
2. **`260819-1645-four-constraints-on-deep-change`**, `_c_`, closed coherent, 260820. Five
   constraints delivered, each verified against the tree rather than against its own account.
3. **`260816-1741-guard-becomes-observation-only`**, `_b_`, Bounded Closure, 260817. The compliance
   guard reaches no verdict on any path; the decision-governed check, the halt and the
   consecutive-block counter are gone.
4. **`260815-0007-remove-eight-mechanisms-and-cap-growth`**, `_c_`, closed coherent, 260815, after a
   Rebalance gate at which the user revised the Grounding. Eight mechanisms left the shipped plugin,
   plus `conceptrev` as a ninth. 36 commits.
5. **`260813-0858-playmaker-maintains-backlog-store`**, `_c_`, closed coherent, 260813, on a revised
   Artifact after a `review-needed` verdict. It is the Circle that gave this agent its backlog
   mandate.

## Archived (_s_ / _d_)

One record, and it is the store's only non-closed terminal Circle.

- **`260804-1205-shell-reachability-model`**, `_s_`, superseded 260807 by
  `circles/260807-0923-guard-misst-statt-orakelt/`. Not closed because its Directive was reached, and
  not bounded because it was unreachable: the user changed the mechanism, from predicting which file
  a shell command writes to measuring what it wrote.

This section lists live Circle records carrying `_s_` or `_d_`. It has nothing to do with the
`archive/` store, whose contents never appear in this file.

## Warnings

**Pointer state: clean.** `.active-circle` is absent and no Circle record carries `_t_`. None of
`STALE-POINTER`, `POINTER-MISMATCH`, `MISSING-POINTER` or `MULTIPLE-ACTIVE` applies.

**Dependency cycles: none, on a graph with one node and no edges.** The one anticipated Circle's
`## Dependencies` section names no Circle. The check ran and found nothing to examine. No
`## Dependency warning` was appended to any record.

**Bounded-Closure propagation: one mechanical match, deliberately not flagged, and the reason is
here rather than left silent.** `260821-1042-reply-bounded-whole-question-answered` cites
`260820-2051-style-rules-arrive-and-get-measured` seven times in its Grounding snapshot, and that
child carries `_b_`. The mechanical test in `agents/playmaker.md` Step 5 matches. The write is
authorised for a parent whose Grounding cites a Circle that *just* transitioned, and here the order
runs the other way: the child closed at 0416 on 260821, the previous playmaker run handled that
transition at 0426 and found no parent, and this parent was filed at 1042 with the closure already
read. Its Grounding quotes the child's final measurement and states what the closure left standing.
A stale-Grounding flag would say the opposite of what the record shows. No `## Parent grounding
stale` section was written and no `parent-grounding-stale` event was emitted. The other bounded
Circle, `260816-1741-guard-becomes-observation-only`, is cited by no anticipated or active Circle.

**Two of the four growth budgets are effectively spent, and this bears directly on the Circle
recommended above.** Measured on this run at `e764637`, summing the current files the way each test
does, against the baseline maps in `hooks/lib/__tests__/rules-emission-golden.test.ts` and
`hooks/lib/__tests__/surface-growth-bound.test.ts`:

| Surface | Unit | Now | Ceiling | Head-room left | Since `472134c` |
|---|---|---|---|---|---|
| `skills/*/SKILL.md` | bytes | 240 409 | 240 439 | **30** | unchanged |
| Hook test suite | lines | 20 354 | 20 375 | **21** | down 11 |
| `agents/*.md` | bytes | 416 205 | 417 843 | **1 638** | unchanged |
| Always-on rule set | bytes | 95 066 | 98 573 | **3 507** | down 59 |

The four are independent by construction, so a cut in one buys nothing in another. The eleven lines
came from the attribution comment added in `shared/history/260821-1505-attribution-comment-for-the-paths-re-approval.md`;
the 59 bytes came from the curator's applied edits logged in
`shared/history/260821-1244-curator-run.md`. Nothing is red today. A red bound is cleared by a cut and
never by editing a baseline, which is authored once in
`hooks/lib/__tests__/helpers/growth-bound.ts`.

**Four open defects write into surfaces with no room, and the position has not moved in eleven
hours.** `260821-0148` and `260821-0302` both repair `skills/setup/SKILL.md`, which has 30 bytes;
`260821-0143` names the same file; `260821-0144` states in its own title that the hook-test surface
had 43 of 2 500 lines left when it was filed, and the figure is 21 today rather than the 32 the
previous refresh reported. Nobody has taken the cut, so those four are filed and unfixable. The gap
underneath them is filed as
`circles/260820-2051-style-rules-arrive-and-get-measured/decisions/260821-0414_*_does-a-corpus-repair-circle-carry-a-budget-for-what-its-own-new-clauses-may-spend.md`,
which is open: nothing bounds a Circle's own growth.

**Three decision records exist twice, and the second copy of each carries a glob metacharacter in
its filename. Unchanged since the previous refresh, and now filed.** Committed in `30d6f0a`, whose
message reports three answered decisions being realised. The realisation landed; the marker move
that should have recorded it did not. Instead of renaming each record from answered to implemented,
the run created a second file per record holding only the `Implemented:` footer, named with a literal
asterisk where the marker letter belongs. The three names, fenced because the spelling is the datum
rather than a pointer:

```
circles/260801-1244-curator/decisions/260814-1915_i_*.md
circles/260815-0007-remove-eight-mechanisms-and-cap-growth/decisions/260815-1845_i_*.md
circles/260815-0007-remove-eight-mechanisms-and-cap-growth/decisions/260815-2056_i_*.md
```

All three still sit beside their `_a_` originals, verified on this run. The defect is filed as
`shared/issues/260821-0430_*_three-decision-records-were-split-in-two-by-an-unexpanded-wildcard-and-their-implemented-notes-are-detached.md`
and is open; its own closing section says the repair moves three decision markers, which is
Grounding, and is the user's to approve.

**Three decisions the recommended Circle cites still read as open, and its own records answer two of
them.** All three sit in the closed style-rules Circle:
`circles/260820-2051-style-rules-arrive-and-get-measured/decisions/260820-2314_*_does-this-circle-take-the-structural-half-of-the-verbosity-record.md`,
`circles/260820-2051-style-rules-arrive-and-get-measured/decisions/260820-2314_*_is-claude-md-inside-the-corpus-this-circle-repairs.md`, and
`circles/260820-2051-style-rules-arrive-and-get-measured/decisions/260821-0414_*_does-a-corpus-repair-circle-carry-a-budget-for-what-its-own-new-clauses-may-spend.md`.
The anticipated Circle's `circles/260821-1042-reply-bounded-whole-question-answered/decisions/260821-1108_*_what-may-the-circles-own-new-clauses-cost.md` answers the
third by name, and its `circles/260821-1042-reply-bounded-whole-question-answered/decisions/260821-1108_*_is-claude-mds-register-repair-inside-this-circle.md` answers
the second. Its Grounding states that the user overturned the first and dates the reversal to
260821. None of the three records was transitioned, so a later reader meets three open questions that
are settled elsewhere. Moving a decision marker is not this agent's act.

**The recommended Circle's record carries no `## Closure note` heading.** The template in
`rules/circle-records.md` `## Circle record template` gives the record five body sections; this one
has `## Directive`, `## Grounding snapshot`, `## Dependencies` and `## Turn log`, plus the
`## Activation proposal` this run appended. The section is filled at closure, and its absence means
the closure has nowhere to land without the closing agent adding the heading first. Same shape as
`circles/260801-1244-curator/issues/260814-2017_*_the-newest-decision-record-carries-no-answered-implemented-footer-block-so-its-next-transition-has-nowhere-to-land.md`,
which is open.

**Nothing in the backlog was read as defect-shaped or decision-shaped this run.** Both live entries
state ideas, and neither belongs in the issue store or the decision store.

**This file cannot meet the em-dash ceiling, because four of its em-dashes are forms the template
mandates.** Measured on this run with `bin/fusion-prose-metric`: 4 prose em-dashes over 2 236 prose
words, a rate of 1.8 per 1000 against a ceiling of 1.0, so the helper reports `over`. All four are
literal: the two section headings `## Anticipated (_a_) — ranked` and `## Backlog — ranked`, and the
two action lines `Recommended next: <circle-dir> — <rationale>` and
`Recommended to shape: <entry path> — <rationale>`. The headings come from the portfolio template in
`rules/circle-records.md`; the action lines are spelled that way in `agents/playmaker.md` and are
what `/fusion:next` parses. This run cut the file from 11 to 4 by rewriting every em-dash that was
its own choice, and the four that remain cannot be rewritten without changing a form another surface
reads. The helper reports and gates nothing, so nothing is blocked. Recorded because a file that
structurally cannot pass a measurement the corpus is held to is a conflict between two shipped
surfaces rather than a lapse in this run's prose.
