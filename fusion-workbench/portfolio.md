# Portfolio

**Generated:** 260814-1733 (by playmaker session 260814-1733-playmaker-user-fusion-next-confirmed)
**Domain bias:** code
**git HEAD at run:** `0b14d03`

**This run relayed one confirmed operation and re-derived nothing.** It was dispatched by
`/fusion:next` carrying a user confirmation for the split proposed by the run at 260814-1716. That
run's stamp was checked against this file before anything was written and matched, so the sections
below other than `## Backlog — ranked` are carried across from it unchanged: they were current when
it measured them and nothing this dispatch did touches a Circle. No Circle record was written, no
ranking was recomputed, and no cycle or Grounding-staleness scan ran.
## Active (_t_)

**`260801-1244-curator`** — the curator agent reconciles a project's three normative surfaces
(decision records, project-owned rule files and `CLAUDE.md`) against what actually happened, and the
always-on rule text every agent loads gains a hard growth bound so the drift it cleans up cannot
silently return.

- Active session history: `shared/history/260813-2345-orchestrator-session.md`
- Active spec and plan: `circles/260801-1244-curator/planning/260814-0738_*_spec-curator.md`,
  `circles/260801-1244-curator/planning/260814-0845_*_plan-curator.md` (both closed; every step done)
- Turn position: Turn 4 of a budget of 5, with 9 of 9 planned tasks done and none errored or skipped
- Open records inside the Circle: 13 defect records and 1 decision record

`.active-circle` names this directory, the directory exists, and its record carries the active
marker. Exactly one record carries it across the whole store. The pointer and the markers agree, so
no pointer warning is raised.

**What activation settled.** The three earlier playmaker runs that ranked this Circle first and each
declined to propose it were discharged by the re-sharpening of 2026-08-14, and the run at 260814-0823
proposed activation on that basis. The user confirmed it, and the Circle has since run four Turns.
The build half of the Directive is met and the proof half has now run: the curator surveyed this
repository, proposed 28 corrections, and the user approved all 28 at the gate. The remaining question
belongs to the reconciler and the Rebalance gate rather than to the portfolio.

## Anticipated (_a_) — ranked

**Recommended next: (none).** The portfolio holds no anticipated Circle. The one it held was
activated this morning and is the entry above.

This is a normal state and not a fault, but it has a consequence worth naming: when the active
Circle closes, `/fusion:next` will have nothing to offer. The surface that refills the portfolio is
the backlog below, and the entry there cannot be promoted whole. Splitting it is therefore the one
piece of portfolio work that is available before the next closure, and it is the recommendation of
the section that follows.

## Backlog — ranked

**Recommended to shape: `shared/backlog/260814-1733_*_radical-simplification.md` — the one live idea
whose evidence is already on disk, so it can be shaped today without new analysis.**

    /fusion:direct shared/backlog/260814-1733_*_radical-simplification.md

The dump that stood here is gone as a unit. It was split this run, so every entry below now carries
one idea and can be promoted whole. That was the single thing blocking the backlog from feeding the
portfolio, and it is cleared.

**Live and ranked (3).** Ranking is carried from the run at 260814-1716; this dispatch performed the
confirmed split and recomputed nothing.

1. **`shared/backlog/260814-1733_*_radical-simplification.md`** — can fusion be radically simplified,
   and along which axis. First, because two analyses answer it with measurements rather than opinion:
   `shared/analyses/260812-0022-where-the-complexity-comes-from-and-what-would-have-to-go.md` carries
   a costed removal list, and
   `shared/analyses/260812-0303-simplify-speed-and-why-rules-do-not-hold.md` names a single first
   move worth up to 28 percent of session time and 43 130 tokens per orchestrator Setup.
2. **`shared/backlog/260814-1733_*_bounded-executor-dispatches.md`** — bound how long an executor runs
   before returning to the orchestrator. Second, because the measurement adopts one half of the
   user's proposed fix and refutes the other, so shaping it starts with a conversation about
   narrowing the Directive rather than with a blocker.
3. **`shared/backlog/260814-1733_*_attach-the-rule-to-the-act.md`** — a rule lands with an executable
   check or it does not land. Third despite being the remedy the analyses rate highest, because
   `shared/decisions/260810-0710_*_should-a-rule-be-allowed-to-land-without-the-check-that-enforces-it.md`
   is deferred and reviving it is the user's act.

**No ranking rename was written.** Moving an entry to the recommended marker is autonomous on an
ordinary run, but a confirmed-operations dispatch performs the operations it was handed and no
others. The top entry keeps the open marker until the next ordinary run.

**Performed this run:**

    split shared/backlog/260811-0826_*_observations.md into: radical-simplification — Can fusion be
      radically simplified, and along which axis; bounded-executor-dispatches — Bound how long an
      executor runs before returning to the orchestrator; attach-the-rule-to-the-act — A rule lands
      with an executable check or it does not land

The original stays where it is and now carries the closed marker, with one appended line naming the
three entries it became and recording that its remaining ideas were already carried by filed records,
were duplicates of these three, or were not ideas. Nothing else in the store was created, renamed,
merged, closed, or deferred, and nothing was proposed.

## Recently closed (_c_ / _b_)

| Circle | Marker | Closure in one line |
|---|---|---|
| `260813-0910-documentation-matches-shipped-plugin` | `_b_` | Bounded Closure on 260813 after five Turns; nine of ten plan steps landed, and the unreached step 10, verifying `docs/plane-setup.md` against `bin/fusion-plane`, is the Bounded-Closure Artifact. |
| `260813-0858-playmaker-maintains-backlog-store` | `_c_` | Closed coherent on 260813 after four Turns; the reconciler's review-needed verdict was taken as a revise recommendation and its five findings closed in Turn 4. |
| `260807-0923-guard-misst-statt-orakelt` | `_c_` | Closed coherent on 260807; the static shell classifier was deleted outright and replaced by a measurement. |
| `260805-2005-textschicht-gegen-code-nachziehen` | `_c_` | Closed coherent on 260806; four code fixes, the citation-form decision, and two new lints landed green. |
| `260801-1244-guard-rules-write` | `_c_` | Closed coherent on 260805; the reconciler's review-needed flag was resolved through a Revise-Artifact Turn. |

Nothing closed since the previous run, so this list is unchanged.

## Archived (_s_ / _d_)

| Circle | Marker | Why |
|---|---|---|
| `260804-1205-shell-reachability-model` | `_s_` | Superseded on 260807 by `260807-0923-guard-misst-statt-orakelt`. Neither reached nor unreachable: the user changed the mechanism, so the Directive stopped being the right one. |

No Circle record carries the deferred marker.

## Warnings

### Cleared this run

**`installed-copy-predates-the-backlog-mandate`** is resolved, after six consecutive runs. The
installed copy at `/Users/k1/.fusion` now reads 8.2.0, its `agents/playmaker.md` is byte-identical to
the work tree at 39 155 bytes with four occurrences of the backlog write key, and `agents/curator.md`
is present in the installed roster. The Turn-3 record of the active session names the update as the
act that unblocked the curator proof run; it discharged this warning at the same time.

**`curator-grounding-and-spec-lag-the-answered-decision`** is half cleared and downgraded. The spec's
`## User Decisions Pending` now carries a ticked box and an appended note recording the user's choice
of the one-time re-baseline. The remaining half is standing below, and it no longer blocks anything:
the planner it would have stopped has already run, and its plan is closed.

### New this run

**`release-8-2-0-is-published-in-one-place-and-not-the-other`.** The version bump landed and the
release did not finish. `.claude-plugin/plugin.json` reads 8.2.0 and is committed; the installed copy
reads 8.2.0. The marketplace entry at
`/Users/k1/Projects/productive/F03-CLAUDE-plugin-marketplace/claude-plugins/.claude-plugin/marketplace.json`
still reads 8.1.0, and no `v8.2.0` git tag exists, so the newest tag remains `v8.1.0`. Against the
release process in `CLAUDE.md`, steps 1 and 6 are done and steps 3, 4 and 5 are outstanding. The
practical consequence is bounded but real: a user installing over HTTPS gets 8.2.0 from `main`, a
user installing through the marketplace gets 8.1.0, and the documented `FUSION_REF=tags/v8.2.0` pin
resolves against nothing.

**`the-active-circle-has-one-turn-of-budget-and-thirteen-open-defect-records`.** `agentstate.yaml`
puts the session at Turn 4 of a budget of 5, with all 9 planned tasks done. The Circle's own issue
store holds 13 open defect records against 11 closed, ten of them filed today by the Turn-3 review
and the reconciliation pass that followed it. This is not a fault to fix in the portfolio; it is the
shape of the decision waiting at the next gate, and it is stated here because that is where the
choice between a further Turn and a closure gets made.

**`the-turn-3-coherence-verdict-recommends-revising-the-grounding-and-nothing-has`.** The reconciler
recorded `review-needed` for Turn 3, flagged two of the three edges, and recommended revising the
Grounding. Its Grounding-to-Directive flag names
`shared/decisions/260813-0027_*_should-the-orchestrator-be-able-to-dispatch-the-shapers-portfolio-activation-mode.md`,
which was open while this very session executed the path it asks about. Turn 4 has since realised
that decision across the shaper and orchestrator prompts, so the flag's underlying condition may be
discharged; the Grounding snapshot itself has not been revised, and the verdict stands as recorded.

**`the-task-queue-reads-stale`.** Reported by the active session's own history rather than measured
here, because the portfolio does not read the work queue: its head records no Circle while
`260801-1244-curator` is active. The session works from the queue held in `agentstate.yaml`, so
nothing consumed the stale file, but anything that reads it as current would be wrong.

### Standing, each verified against disk this run

Stated once, with the record that carries the detail.

- **`curator-record-title-contradicts-its-directive`.** The record's title and its `## Dependencies`
  section still name the conventions file as the validation case the Directive retired, and the title
  is what this file renders and what `/fusion:next` reads aloud. Filed as
  `circles/260801-1244-curator/issues/260814-0813_*_the-circle-records-title-and-dependencies-still-describe-the-conventions-file-as-the-validation-case.md`,
  open.
- **`curator-grounding-still-calls-the-growth-bound-question-open`.** The Grounding snapshot of
  `circles/260801-1244-curator/_*_circle.md` still reads "One question is open and is the user's to
  answer before the planner plans the growth bound", and cites the record by a path spelling the open
  marker. The record carries the implemented marker. Filed as
  `circles/260801-1244-curator/issues/260814-0828_*_the-grounding-and-the-spec-still-call-the-growth-bound-decision-open-after-it-was-answered.md`,
  open. No longer blocking, per the clearance note above.
- **`chat-voice-caps-tightened-in-the-shipped-copy-only`.** Commit `ae21c87` tightened the shipped
  chat-voice profiles; the workbench copies that `bin/fusion-rules` actually emits still carry the
  looser line caps. Measured this run: `fusion-workbench/stilwerk/chat-voice-de.yaml` at 7 353 bytes
  against 7 358 in both `stilwerk/` and the installed copy, and `chat-voice-en.yaml` at 6 801 against
  6 800. The two long-form profiles match on all three surfaces. Until the workbench copies are
  refreshed, the tightened caps govern no agent in this project.
- **`backlog-acceptance-run-still-not-performed`, for a new reason.** The end-to-end acceptance run
  for the backlog capability was the successor to a deferred step and went with it. Eight playmaker
  runs have had the opportunity. The obstacle up to today was the stale install, and that is gone.
  What blocks it now is narrower and is the mechanism working as designed: performing a split needs a
  confirmation naming that operation, and a confirmation reaches a run through exactly two channels,
  neither of which this dispatch had. Running the split through `/fusion:next`, which relays a
  confirmed operation into a second dispatch, would exercise the capability and discharge the
  acceptance run in the same act.
  **Amended by this run, on direct knowledge rather than re-measurement:** that is what just
  happened. The relay ran end to end — proposal, user confirmation, second dispatch, stamp check
  against this file, one split written. The warning is discharged and should be gone from the next
  ordinary run's portfolio.
- **`plane-setup-verification-outlives-its-circle`.** The unmet Directive clause of the bounded
  Circle sits inside that terminal Circle as
  `circles/260813-0910-documentation-matches-shipped-plugin/issues/260813-2305_*_the-directive-promises-plane-setup-verification-and-step-10-was-deferred-with-no-record.md`,
  so nothing schedules it.
- **`ten-open-defects-and-two-open-decisions-outlive-their-terminal-circle`.** Recounted off disk this
  run and unchanged: the bounded Circle's stores hold 10 open issue records and 2 open decision
  records against 16 closed issues. A terminal Circle is terminal, so these reach a successor by
  citation or they reach the task queue, and they reach neither by sitting there.
- **`the-bounded-circles-own-acceptance-record-is-still-open`.**
  `shared/issues/260813-0825_*_the-v8-1-0-documentation-step-reached-three-files-and-the-feature-reached-seven-surfaces.md`
  holds that Circle's acceptance conditions and is still open, but sits in `shared/`, so an ordinary
  reconciler pass can still reach it.
- **`write-key-defect-record-is-open-and-now-demonstrably-satisfied`.**
  `shared/issues/260813-0825_*_the-playmaker-is-charged-with-backlog-upkeep-and-holds-no-write-key-to-the-store.md`
  is still open. Its four acceptance conditions read as met against the work tree, and as of today
  they read as met against the installed copy as well, which is what the record was really waiting
  for. It is closable.
- **`one-sided-dependency-is-now-frozen-on-both-sides`.** Filed as
  `shared/issues/260813-0913_*_a-dependency-between-two-circles-can-only-be-recorded-on-one-side-because-nobody-may-write-the-other.md`,
  whose scope needs widening to cover the case where both Circles have gone terminal.
- **`fusion-direct-cannot-run-the-flow-it-documents`.**
  `shared/issues/260813-1334_*_fusion-direct-documents-a-shaper-clarification-flow-that-a-dispatched-sub-agent-cannot-run.md`.
  Surfaced here because the backlog path from an idea to a Circle runs through `/fusion:direct`, and
  the recommendation in `## Backlog — ranked` above ends at that command.
- **`backlog-idea-only-partly-filed`.** The observation that every operation is unbearably slow, not
  only Setup, exists on disk solely as a witness line inside a record scoped to Setup
  (`shared/issues/260812-0253_*_setup-takes-far-too-long-and-nothing-measures-it.md`). It is
  defect-shaped rather than idea-shaped, so it does not belong in the proposed split, and no open
  record covers it as stated. The playmaker files no issues; this one is yours to decide.

### Graph checks

**Dependency cycles: none.** The non-terminal graph holds one node, `260801-1244-curator`, and no
edges: all three dependencies it names point at Circles that closed coherent
(`260801-1244-rule-provenance-header` on 260802, `260801-1244-guard-rules-write` on 260805, and
transitively `260801-1244-guard-bash-inspection` on 260801). A cycle is not constructible in a
single-node edgeless graph. No `## Dependency warning` section was appended to any record.

**Parent-grounding-stale events: none.** The scan ran against the one Circle carrying the bounded
marker, `260813-0910-documentation-matches-shipped-plugin`, and against the Artifact its Closure note
names, the unperformed verification of `docs/plane-setup.md`. The one non-terminal Circle mentions
that directory once, inside a playmaker activation-proposal section, and not in its
`## Grounding snapshot`, so it is not a parent under the propagation rule. No
`## Parent grounding stale` section was appended.
