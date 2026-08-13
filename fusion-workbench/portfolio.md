# Portfolio

**Generated:** 260813-0926 (by playmaker session 260813-0926-playmaker-direct-dispatch)
**Domain bias:** code

## Active (_t_)

(none). No Circle record carries the active marker, and the pointer file `.active-circle` is
absent. Those two agree, so this is the ordinary state between two units of work rather than a
fault.

The most recent closure was `260807-0923-guard-misst-statt-orakelt` on 260807. Six days of work
have landed since without a Circle, most recently the v8.1.0 release on 260812 (`1c2d555`). Two
new anticipated Circles were created on 260813 in session
`shared/history/260813-0806-orchestrator-session.md`, which is why this section reads differently
from the previous run's. Activation runs through `/fusion:next`.

## Anticipated (_a_) — ranked

Recommended next: 260813-0858-playmaker-maintains-backlog-store — it waits on no other Circle,
its Grounding was written today against records that are on disk, and it is the Circle that
unblocks the backlog work every recent run has recommended and none has been able to do.

### 1. `260813-0858-playmaker-maintains-backlog-store`

> "The playmaker maintains the backlog store it is charged with."

**Dependencies:** none inbound. Blocks `260813-0910-documentation-matches-shipped-plugin`.
**Open decisions cited in the Grounding:** one, and it shapes the plan rather than barring
activation.

This Circle ranks first because it is the only one of the three that can be activated as written.
The domain heuristic asks two things of an anticipated Circle: that its Grounding cite few
unresolved decisions, and that everything it depends on be closed. This Circle's `## Dependencies`
section names no Circle it waits on at all, so the second test is satisfied outright. The relation
it does record runs the other way: it blocks the documentation Circle below it, whose own record
cites this directory by name and states that four passages wait on it. Both records agree on the
direction, so the ordering is settled and this Circle is the head of it. Its Grounding snapshot was
written on 260813 against two records that are current — the defect record
`shared/issues/260813-0825_*_the-playmaker-is-charged-with-backlog-upkeep-and-holds-no-write-key-to-the-store.md`,
which carries the surfaces list with line citations, and the decision
`shared/decisions/260812-2043_*_who-writes-the-recommended-marker-on-a-backlog-entry.md`, which the
user answered in this week's orchestrator session. Four scoping questions were settled with the
user in one round and written into the Grounding rather than left for the planner. The directory
holds all six artifact subdirectories. The one open decision it cites,
`circles/260813-0858-playmaker-maintains-backlog-store/decisions/260813-0858_*_does-a-non-interactive-playmaker-run-perform-the-confirm-gated-backlog-operations.md`,
asks whether a run dispatched by the orchestrator performs the operations that need a user
confirmation. Its own text says it must be settled before the plan, because it decides whether a
proposal-return path gets built. That is work for the first Turn, not a reason to wait.

There is a second, measured argument, and it comes from this run's own backlog pass. The shared
backlog holds one entry carrying thirteen distinct ideas. Three consecutive playmaker runs have
recommended splitting it, and none has split it, because no agent holds a write key to the store.
This Circle is the one that hands over that key. The backlog job is blocked on this Circle and on
nothing else.

### 2. `260813-0910-documentation-matches-shipped-plugin`

> "fusion's user-facing documentation agrees with the plugin at v8.1.0."

**Dependencies:** `260813-0858-playmaker-maintains-backlog-store` — interleaved, a partial block on
four named passages only.
**Open decisions cited:** none. The record it cites as "cited, not waited on" has since been
answered.

Second because its dependency is anticipated rather than closed, which is the flag the domain
heuristic raises, and because the block is genuine even though it is partial. Everything outside
the four passages that describe the playmaker's backlog role can proceed in parallel, so this
Circle is a candidate for running alongside the first rather than strictly after it. Its Grounding
rests on a bounded list already on disk: `shared/analyses/260813-0828-documentation-staleness-survey.md`,
fifteen findings across four work groups with line citations on both sides of each claim.

### 3. `260801-1244-curator`

> "The curator reconciles the three normative surfaces, and proves it on fusion's own conventions
> file."

**Dependencies:** all three closed coherent.
**Open decisions cited in the Grounding:** none.

On the raw domain heuristic this Circle scores best of the three: zero unresolved decisions cited,
every dependency closed. It ranks last anyway, and the reason is a judgement this run is making
explicitly rather than hiding inside the score. The heuristic reads the record; it cannot read
whether the record still holds. This one no longer does. Its Grounding states that
`rules/fusion-workbench-conventions.md` holds 54 401 bytes across 32 second-level headings.
Measured today against the working tree, the file holds 49 992 bytes across 24 second-level
headings. Those two claims have now been falsified at three consecutive playmaker runs, and they
are load-bearing: the whole scoping argument is sized against them. The Circle directory also holds
only its record, with none of the six artifact subdirectories the other two have.

The Circle is not stale in its reasoning, which still stands. It is stale in its numbers, and the
sanctioned repair is a shaper pass in portfolio-activation mode before activation. That path is
itself the subject of an open decision,
`shared/decisions/260813-0027_*_should-the-orchestrator-be-able-to-dispatch-the-shapers-portfolio-activation-mode.md`,
which records that a user reading this briefing inside an orchestrator session cannot reach the
shaper from there.

## Backlog — ranked

Recommended to split first: `shared/backlog/260811-0826_*_observations.md` — 13 ideas, top one is
`bounded-dispatches-and-re-injected-context`

No `/fusion:direct` line is written for this entry. That command promotes an entry whole, which
would make one Circle of all thirteen ideas and retire the lot.

**And the split cannot be performed today.** No agent holds a write key to the backlog store. The
user answered that this should change and gave the write to the playmaker
(`shared/decisions/260812-2043_*_who-writes-the-recommended-marker-on-a-backlog-entry.md`), and the
Circle that realises it is the top-ranked one above. Until that Circle lands, this recommendation
is something the user acts on by hand or defers.

1. `shared/backlog/260811-0826_*_observations.md` (`_o_`) — "Raw observations, hand-written by the
   user: about a dozen distinct ideas in one dump, awaiting consolidation by the playmaker." The
   only entry in the store. Thirteen distinct ideas, of which seven are already carried by a filed
   record, three are duplicates of another idea in the same entry, and three are live and
   shapeable. Proposed split, live ideas first:

   - `bounded-dispatches-and-re-injected-context` — agents must not run long operations without
     returning to fusion, and the working context must be re-sent with every request. Ranked top
     because it rests entirely on records already on disk and could be shaped today: the defect
     record `shared/issues/260812-0253_*_rules-lose-their-effect-during-a-long-dispatch.md` names
     the competing remedies, and
     `shared/analyses/260812-0303-simplify-speed-and-why-rules-do-not-hold.md` measures that the
     handoff between dispatches costs nothing while shorter dispatches would cut cost roughly
     fourfold.
   - `radical-simplification-of-fusion` — whether fusion has become a token- and time-consuming
     system that mostly maintains itself, and what would have to go. Rests on
     `shared/analyses/260812-0022-where-the-complexity-comes-from-and-what-would-have-to-go.md`.
     Ranked second because the analysis is on disk but the idea is a question rather than a
     direction, so shaping it means choosing a cut first.
   - `operations-take-unbearably-long` — every operation, not only Setup. Ranked third because it
     needs measurement before it could be sized, and because it is defect-shaped (see
     `## Warnings`).
   - Seven ideas already carried by a filed record, listed so the split does not re-file them:
     Setup duration, agent verbosity, rules losing effect mid-session, the missing estimated time
     of arrival, the monitor unreachable on localhost, the orchestrator's wrong instructions to
     sub-agents (all six dated `260812-0253` in `shared/issues/`), and absolute artifact paths
     (`shared/decisions/260812-0254_*_should-a-cited-artifact-path-be-absolute-so-an-editor-can-open-it.md`).
   - Three duplicate groups, named rather than merged: the bounded-dispatch remedy is stated twice,
     fullest in the entry's `>>>` line; the self-repair complaint and the radical-simplification
     question are one idea, fullest in the entry's three closing questions; the observation that
     unverified claims get relayed upward duplicates
     `shared/issues/260812-0253_*_the-orchestrators-instructions-to-sub-agents-are-often-wrong.md`.
   - Two fragments that are not ideas and are excluded from the count: a bare file path, and a note
     of the three most-changed files from the churn ranking. Five quoted agent transcripts are
     evidence for the verbosity and unverified-claims ideas, not ideas of their own.

## Recently closed (_c_ / _b_)

| Circle | Marker | Closure |
|---|---|---|
| `260807-0923-guard-misst-statt-orakelt` | `_c_` | Closed coherent 260807-1650. The static classifier is gone; the guard measures what changed instead of predicting what will change. |
| `260805-2005-textschicht-gegen-code-nachziehen` | `_c_` | Closed coherent 260806-1105. The plugin's text layer says what the code does again, held there by two new lints. |
| `260801-1244-guard-rules-write` | `_c_` | Closed coherent 260805-2359. A project can permit rule-file writes deliberately, per session, and never silently. |
| `260801-1244-rule-provenance-header` | `_c_` | Closed coherent 260802. Every rule file states which record motivated it, and a test enforces it. |
| `260801-1244-guard-bash-inspection` | `_c_` | Closed coherent 260801. The guard checked file-mutating shell commands against the protected paths. |

No Circle carries the Bounded Closure marker, in this window or anywhere in the store.

**Worth knowing when reading the two guard closures.** Both delivered mechanisms that have since
been removed on their own measurement, on 260809 and 260812. The closures were correct; what they
built was later deleted deliberately. A reader who meets those rows without this note will read
them as stale.

## Archived (_s_ / _d_)

| Circle | Marker | Note |
|---|---|---|
| `260804-1205-shell-reachability-model` | `_s_` | Superseded 260807-0923 by `circles/260807-0923-guard-misst-statt-orakelt/`. Not closed and not bounded: the user changed the mechanism, so the Directive stopped being the right one to reach. |

No Circle carries the deferred marker.

## Warnings

**`curator-grounding-measurements-falsified`** — Two load-bearing measurements in
`circles/260801-1244-curator/_*_circle.md` no longer hold. The Grounding states that
`rules/fusion-workbench-conventions.md` holds 54 401 bytes across 32 second-level headings; the
file holds 49 992 bytes across 24 second-level headings, measured against the working tree this
run. This is the third consecutive run reporting it. The scoping argument is sized against these
numbers, so a shaper pass in portfolio-activation mode is required before activation.

**`curator-circle-missing-artifact-subdirectories`** — `circles/260801-1244-curator/` holds only
its record. The six artifact subdirectories (`planning/`, `issues/`, `decisions/`, `history/`,
`reviews/`, `analyses/`) are absent. Both Circles created on 260813 have all six, so this is a
gap in the older Circle rather than a convention that changed.

**`one-sided-dependency-between-the-two-new-circles`** — The Dependencies section of
`circles/260813-0858-playmaker-maintains-backlog-store/_*_circle.md` asks for the documentation
Circle's directory name to be filled in "by the orchestrator once it exists". That Circle now
exists at `circles/260813-0910-documentation-matches-shipped-plugin/`, and the name is still
absent, so the relation is visible from one record and invisible from the other. Already filed as
`shared/issues/260813-0913_*_a-dependency-between-two-circles-can-only-be-recorded-on-one-side-because-nobody-may-write-the-other.md`,
which establishes that no party may currently perform the write. The playmaker cannot either:
`## Dependencies` is not among the three sections it may append. Reported, not fixed.

**`three-tests-fail-at-head`** — Three tests fail at `1c2d555` across
`hooks/lib/__tests__/circle-stash-git-exclusion.test.ts` and
`hooks/lib/__tests__/fusion-plane.test.ts`, reproducing across runs. Filed as
`shared/issues/260813-0828_*_three-tests-fail-at-head-in-two-files-and-no-open-record-names-them.md`.
Surfaced here because a red baseline makes the acceptance evidence of whichever Circle activates
next harder to read, whichever one that is.

**`claude-md-always-on-figure-is-stale`** — `CLAUDE.md:64` states that each agent receives 88 023
bytes of always-on rules, of which 80 670 bytes are shipped rule text. Measured today against the
emission for this agent: 91 891 bytes total. The claim was true when written on 260812 and was
overtaken within a day. `CLAUDE.md` is in scope for
`260813-0910-documentation-matches-shipped-plugin`, so this needs no separate filing, but the
survey that Circle works from does not name this particular figure.

**`backlog-idea-only-partly-filed`** — The observation that every operation takes unbearably long,
not only Setup, exists on disk only as a witness line inside a record scoped to Setup
(`shared/issues/260812-0253_*_setup-takes-far-too-long-and-nothing-measures-it.md`). It is
defect-shaped rather than idea-shaped, so it does not belong in the backlog split above, and it is
not covered by any open record as stated. The playmaker files no issues; this is here for the user
to decide.

**`backlog-store-has-no-writer-today`** — The user answered that the playmaker maintains the
backlog store, including splitting a multi-idea entry
(`shared/decisions/260812-2043_*_who-writes-the-recommended-marker-on-a-backlog-entry.md`,
answered in `shared/history/260813-0806-orchestrator-session.md`). The answer is not implemented:
`agents/playmaker.md` still forbids the write and `bin/fusion-paths` withholds the key by
derivation from that prompt. Nothing was written to the backlog on this run. The realising Circle
is the top-ranked one.

**Dependency cycles: none.** The graph over the three anticipated Circles has one edge,
`260813-0910-documentation-matches-shipped-plugin` → `260813-0858-playmaker-maintains-backlog-store`.
The curator's three edges all point at closed Circles and so leave the non-terminal graph. No
`## Dependency warning` section was appended to any record.

```
documentation-matches-shipped-plugin ──> playmaker-maintains-backlog-store
curator ──> (three closed Circles, outside this graph)
```

**Parent-grounding-stale events: none.** No Circle record carries the Bounded Closure marker, so
the propagation scan had no starting point. The curator's falsified measurements are drift inside
an anticipated Circle and are reported above as an ordinary warning, not as this event.
