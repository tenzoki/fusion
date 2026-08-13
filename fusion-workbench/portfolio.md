# Portfolio

**Generated:** 260813-0007 (by playmaker session 260813-0007-playmaker-direct-dispatch)
**Domain bias:** code

## Active (_t_)

(none). No Circle record carries the active marker and the pointer file `.active-circle` is
absent. That is the ordinary state between two units of work, not a fault. The most recent
closure was `260807-0923-guard-misst-statt-orakelt` on 260807, shipped as v6.0.0 and v6.0.1;
six days of work have landed since then without a Circle, most recently the v8.1.0 release on
260812. Activation runs through `/fusion:next`.

## Anticipated (_a_) — ranked

Recommended next: 260801-1244-curator — the only anticipated Circle, every dependency closed,
and the one precondition the last run named has since been cleared. It still needs the shaper
before it can be activated, because its Grounding rests on measurements that have now moved
twice.

1. **260801-1244-curator** — "The curator reconciles the three normative surfaces, and proves it
   on fusion's own conventions file."

   The rank is uncontested and says little, because this is the only anticipated Circle in the
   portfolio. On the code heuristic the Circle stands clean: its Grounding snapshot cites no open
   decision record, and all three dependencies are closed coherent. The hard one,
   `260801-1244-rule-provenance-header`, closed on 260802; the soft one,
   `260801-1244-guard-rules-write`, closed on 260805; the transitive one,
   `260801-1244-guard-bash-inspection`, closed on 260801.

   **What changed since the last run.** The previous portfolio, generated on 260807, asked for one
   thing before re-sharpening: an answer to the open decision about how far the project language
   `de` reaches into the English rule corpus. That record now carries the implemented marker at
   `shared/decisions/260807-1515_*_wie-weit-reicht-die-projektsprache-in-den-regelkorpus.md`, so
   the ordering constraint is gone and the shaper can start.

   **What has not changed is that the Grounding cannot be activated as written.** Two of its
   claims were already falsified on 260807, and both are worse now. The Grounding says
   `rules/fusion-workbench-conventions.md` holds 54 401 bytes across 32 second-level headings.
   Measured against the working tree at commit `1c2d555` on 260813, the file holds 49 992 bytes
   across 24 headings. The Grounding also says the shards the closing work would produce do not
   yet exist; four of them sit in the rule directory today (`circle-records.md`,
   `workbench-path-resolution.md`, `rule-file-provenance.md`, `workbench-stash-and-lock.md`).
   The Circle's closing work, capability C9, was carried out by hand by an executor, which the
   closure note of `260805-2005-textschicht-gegen-code-nachziehen` records, so the Circle has lost
   both its first real job and the proof that the capability works.

   **A new measurement makes the case sharper rather than weaker.** The partition that cut the
   conventions file from 51 416 to 34 671 bytes on 260805 has been undone. The file regained
   14 324 bytes over the following six days and now stands 4 KB below where it started. That
   growth is measured across the twelve commits touching the file since 260805, not inferred.
   It is the same shape the project's own analysis
   `shared/analyses/260812-0022-where-the-complexity-comes-from-and-what-would-have-to-go.md`
   found for the shell-classifier deletion, where removal bought four days before the source
   exceeded its pre-deletion peak. A curator that reconciles and repartitions once, with nothing
   holding the result, buys about a week.

   **What survives and what the shaper has to do.** Capabilities C1 through C3, C6 and C7 remain
   a coherent remainder, and the need for them is documented rather than asserted. What the
   Circle needs before activation is a Directive without the closing work C9, a fresh validation
   case to replace it, a Grounding resting on a measurement taken this week instead of on
   260801, and an answer to whether a one-off reconciliation is worth doing at all when the
   regrowth rate is now measured. Playmaker only names this; the re-sharpening is shaper work and
   the activation is yours.

   Dependencies: three, all closed coherent. Open decisions cited in the Grounding: none.

## Backlog — ranked

Recommended to split first: `shared/backlog/260811-0826_*_observations.md` — 13 ideas, top one is
`bounded-dispatches-and-re-injected-context`.

There is no `/fusion:direct` line under that recommendation on purpose. The command promotes an
entry whole, so running it here would make one Circle of thirteen unrelated ideas and retire the
lot. File the pieces you want first, then shape one of them.

The entry is already largely consumed, and that is the most useful thing to know about it. Seven
of its thirteen ideas were triaged into records on 260812, six as defect records dated
`260812-0253` and one as a decision record dated `260812-0254`. Two of its three closing questions
were answered by analyses on the same night. Do not re-shape those; they are listed under
Warnings so the double handling is visible.

**Proposed split of `shared/backlog/260811-0826_*_observations.md`** (13 ideas; the three live ones
are ranked, the rest are marked with where they already live):

1. `bounded-dispatches-and-re-injected-context` — agents must not run long operations without
   returning to the orchestrator, and the working context must be re-sent with each request. Live
   and shapeable today. It rests entirely on records already on disk: the defect record
   `shared/issues/260812-0253_*_rules-lose-their-effect-during-a-long-dispatch.md` names four
   competing remedies, and the analysis
   `shared/analyses/260812-0303-simplify-speed-and-why-rules-do-not-hold.md` measures that
   handoff between dispatches costs nothing and that shorter dispatches would cut cost roughly
   fourfold. Nothing needs fresh analysis before this can be sized.
2. `rules-as-mechanisms-not-instructions` — a discipline written into `CLAUDE.md` or an agent
   prompt is not enforced by being written, and the corpus should carry gates where it currently
   carries prose. Live and shapeable today. The user's own example is in the entry: a reviewer
   filed four defect records immediately after the discipline was bound and not one carried the
   required field. The same analysis measures the general case, counting 248 task-completion
   events against 177 task-start events in the event log, so a third of tasks are announced
   finished having never been announced started, from two instructions in the same prompt file.
3. `radical-simplification-of-fusion` — whether fusion has become a token- and time-consuming
   system that mostly serves itself, and how far it would have to be cut. Live, but portfolio-sized
   rather than Circle-sized. Two analyses already answer parts of it, listing eight removals with
   no measured capability lost plus three larger targets they did not name. What is missing is a
   cut into units of work, which is shaper work on a narrowed question rather than on this idea as
   stated.
4. `self-repair-crowds-out-project-work` — near-duplicate of idea 3, stated from the other side.
   The fullest statement of the pair is the three closing questions at the end of the entry, not
   this line.
5. `unverified-claims-relayed-upward` — near-duplicate of the filed defect record
   `shared/issues/260812-0253_*_the-orchestrators-instructions-to-sub-agents-are-often-wrong.md`,
   which already carries two corroborating instances from this repository. The fullest statement
   is the closing paragraph of the entry's first example.
6. `setup-latency` — already filed as
   `shared/issues/260812-0253_*_setup-takes-far-too-long-and-nothing-measures-it.md`.
7. `agent-verbosity` — already filed as
   `shared/issues/260812-0253_*_agents-answer-a-question-the-user-did-not-ask-and-the-length-caps-do-not-hold.md`.
8. `rule-decay-mid-session` — already filed as
   `shared/issues/260812-0253_*_rules-lose-their-effect-during-a-long-dispatch.md`.
9. `eta-not-computed` — already filed as
   `shared/issues/260812-0253_*_the-monitors-eta-is-not-computed-and-the-user-has-never-seen-one.md`.
10. `monitor-localhost-unreachable` — already filed as
    `shared/issues/260812-0253_*_the-monitor-is-no-longer-reachable-on-localhost.md`.
11. `orchestrator-dispatch-precision` — already filed as
    `shared/issues/260812-0253_*_the-orchestrators-instructions-to-sub-agents-are-often-wrong.md`.
12. `absolute-paths-for-cited-artifacts` — already filed as the decision record
    `shared/decisions/260812-0254_*_should-a-cited-artifact-path-be-absolute-so-an-editor-can-open-it.md`.
13. `overall-operation-latency` — defect-shaped and only partly filed. It appears as a witness
    line inside the setup-latency record rather than as a record of its own. See Warnings.

Two fragments in the entry are not ideas and are not counted above: a bare path to the curator
Circle record, and a three-line note of the top of the churn ranking. Five further blocks are
transcripts supplied as evidence for ideas 2, 5, 7 and 11.

## Recently closed (_c_ / _b_)

| Circle | Marker | Closure |
|---|---|---|
| `260807-0923-guard-misst-statt-orakelt` | `_c_` | Closed coherent 260807-1650. The static shell classifier was removed outright; the guard measured protected files after each tool call instead of predicting writes. Shipped as v6.0.0 and v6.0.1. |
| `260805-2005-textschicht-gegen-code-nachziehen` | `_c_` | Closed coherent 260806-1105. Four code fixes, the citation-form decision, two new lints landed green, and activation ownership settled once. |
| `260801-1244-guard-rules-write` | `_c_` | Closed coherent 260805-2359. All twelve acceptance criteria verified with per-criterion test citations after a Rebalance in Turn 3. |
| `260801-1244-rule-provenance-header` | `_c_` | Closed coherent 260802. Three Turns, eight commits, all eight acceptance criteria checked against the tree rather than against completion markers. |
| `260801-1244-guard-bash-inspection` | `_c_` | Closed coherent 260801. The prerequisite Circle of the four-Circle body of work; sixteen commits where eight steps were planned. |

Five older closed Circles are not listed: `260719-1536-plane-mirror-integration`,
`260719-1536-brest-unite-co-creator-conversion`, `260718-1924-v5x-overhaul`,
`260717-1638-marker-format-ohne-glob-metazeichen` and `260716-1847-workbench-umbau`.

## Archived (_s_ / _d_)

- `260804-1205-shell-reachability-model` — superseded (`_s_`) on 260807-0923 by
  `260807-0923-guard-misst-statt-orakelt`. Neither reached nor abandoned: the user changed the
  mechanism, from predicting which file a shell command writes to measuring what changed.

No deferred Circles.

## Warnings

- `curator-circle-missing-artifact-subdirectories`: `circles/260801-1244-curator/` holds only its
  record. The six artifact subdirectories the Circle record template requires (`planning/`,
  `issues/`, `decisions/`, `history/`, `reviews/`, `analyses/`) do not exist, so the first agent
  dispatched into this Circle has to invent them. Defect-shaped; not filed, because playmaker does
  not write to the issue store.
- `curator-grounding-measurements-falsified`: five of the measured claims in the Grounding snapshot
  of `circles/260801-1244-curator/_*_circle.md` no longer hold, three of them for the second time.
  This is measurement drift in an anticipated Circle, not the Bounded-Closure propagation case;
  no Circle carries the bounded marker, so no parent Grounding was flagged stale by this run.
- `claude-md-always-on-figure-is-four-kilobytes-stale`: `CLAUDE.md` states the always-on rule floor
  fell to 88 023 bytes per dispatch on 260812, of which 80 670 bytes are shipped rule text.
  Measured at commit `1c2d555`, the five always-on rule files total 84 538 bytes and the floor is
  91 891 bytes. The claim was true when written and was overtaken within a day by growth in
  `rules/fusion-workbench-conventions.md`. Defect-shaped, and it is an instance of the class the
  curator Circle exists to catch.
- `backlog-idea-13-only-partly-filed`: the user's observation that every operation takes
  unbearably long appears only as a witness line inside
  `shared/issues/260812-0253_*_setup-takes-far-too-long-and-nothing-measures-it.md`, which scopes
  itself to Setup. The broader claim has no record of its own. Defect-shaped; your call whether it
  needs one.
- `backlog-marker-has-no-writer`: the open decision record
  `shared/decisions/260812-2043_*_who-writes-the-recommended-marker-on-a-backlog-entry.md` asks who
  writes the recommended marker on a backlog entry. Nothing does today, and this run wrote none.
  The recommendation above therefore lives in this file only, and this file is overwritten on every
  playmaker run. Decision-shaped and already filed; it is named here because it directly limits
  what the section above can carry.

No dependency cycles were detected. The dependency graph over non-terminal Circles has one node,
`260801-1244-curator`, and all three of its edges point at closed Circles. No pointer warnings:
`.active-circle` is absent and no Circle record carries the active marker, which is the normal
opt-in state.
