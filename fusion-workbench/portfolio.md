# Portfolio

**Generated:** 260813-1756 (by playmaker session 260813-1756-playmaker-direct-dispatch)
**Domain bias:** code

## Active (_t_)

(none). No Circle record carries the active marker, and the pointer file `.active-circle` is
absent. The two agree, so this is the ordinary state between two units of work, not a fault.

Activation runs through `/fusion:next`.

## Anticipated (_a_) — ranked

Recommended next: 260813-0910-documentation-matches-shipped-plugin. Nothing blocks it, and the
deferred 8.2.0 release is waiting on it.

### 1. `260813-0910-documentation-matches-shipped-plugin`

> "fusion's user-facing documentation agrees with the plugin at v8.1.0."

**Dependencies:** one, `260813-0858-playmaker-maintains-backlog-store`, closed coherent.
**Open decisions cited in the Grounding:** none.
**Circle directory:** record plus all six artifact subdirectories present.

This Circle ranks first because both halves of the code heuristic come out clean and because a
release is queued behind it. Its only dependency closed coherent on 260813, so the four passages
its Directive named as waiting are no longer waiting: `README-agents.md:40`, `CLAUDE.md:51`,
`docs/working-model.md` sections 1 and 5, and `skills/help/SKILL.md` topic 2. The whole Directive
is workable in one pass.

The heuristic's second test also passes. The Grounding snapshot cites no unresolved decision. The
one record it names as cited rather than waited on,
`shared/decisions/260813-0826_*_should-fusion-help-become-a-self-knowledge-skill-that-answers-from-the-live-installation.md`,
carries the answered marker. The Circle's working list is bounded and already on disk:
`shared/analyses/260813-0828-documentation-staleness-survey.md`, 15 findings across four work
groups, each row citing both sides of the claim.

The argument outside the heuristic is the stronger one. Step 9 of
`circles/260813-0858-playmaker-maintains-backlog-store/planning/260813-1306_*_the-playmaker-maintains-the-backlog-store.md`,
the version bump to 8.2.0, was deferred at that Circle's release gate so that one release carries
both Circles. The playmaker backlog capability is therefore committed at HEAD `267a65c` and
unreleased. Every installed copy of fusion still predates it, including the copy executing this
run. This Circle is what unblocks shipping both.

**Two inputs to its Grounding have moved since it was written**, both measured against the working
tree at HEAD `267a65c` on this run rather than carried forward:

| Grounding statement | State at this run |
|---|---|
| `shared/issues/260813-0828_*_three-tests-fail-at-head-in-two-files-and-no-open-record-names-them.md` is live, and the Circle must not be blocked on it | The record carries the closed marker. The out-of-scope ruling still holds; the sentence describes a condition that no longer exists. |
| `CLAUDE.md` is in scope over the survey's list | `CLAUDE.md:64`'s always-on rule figure is also stale and is not on the survey's list. See `claude-md-always-on-figure-is-stale` under `## Warnings`. |

### 2. `260801-1244-curator`

> "The curator reconciles the three normative surfaces, and proves it on fusion's own conventions
> file."

**Dependencies:** all three closed coherent.
**Open decisions cited in the Grounding:** none.
**Circle directory:** record only, no artifact subdirectories.

On the raw code heuristic this Circle scores as well as the one above. It ranks second anyway, and
the reason is stated here rather than hidden in a score. The heuristic reads what a record says. It
cannot read whether the record still holds, and this one does not.

Two load-bearing measurements in the Grounding are falsified. It states that
`rules/fusion-workbench-conventions.md` holds 54 401 bytes across 32 second-level headings. The
file holds 51 920 bytes across 24 second-level headings, measured this run. The whole scoping
argument is sized against those two numbers. This is the fifth consecutive playmaker run reporting
the same falsification.

The reasoning in the record still stands. The sanctioned repair is a shaper pass in
portfolio-activation mode before activation, which would produce a Directive without capability C9,
a fresh validation case, and a Grounding measured this week. Reaching the shaper from inside an
orchestrator session is itself the subject of the open decision
`shared/decisions/260813-0027_*_should-the-orchestrator-be-able-to-dispatch-the-shapers-portfolio-activation-mode.md`.

## Backlog — ranked

Recommended to split first: `shared/backlog/260811-0826_*_observations.md`. It holds 13 ideas, and
the top one is `bounded-dispatches-and-re-injected-context`.

No `/fusion:direct` line is written for this entry. That command promotes an entry whole, which
would make one Circle of all 13 ideas and retire the lot.

**The split could not be performed on this run, for the same reason as at the previous two runs.**
The working tree grants the playmaker a write key to the backlog store, and `bin/fusion-paths
playmaker` emitted `OUT_BACKLOG` on this run's own Setup. The agent prompt behind this run came
from the installed plugin copy, which predates that change and forbids every backlog write. The run
followed the prompt it was given. See `installed-copy-predates-the-backlog-mandate` under
`## Warnings`. The remedy is one command and a session restart, not another Circle.

1. `shared/backlog/260811-0826_*_observations.md` (`_o_`). "Raw observations, hand-written by the
   user: about a dozen distinct ideas in one dump, awaiting consolidation by the playmaker." The
   only entry in the store, unchanged since 260811. Of its 13 distinct ideas, 7 are already carried
   by a filed record, 3 duplicate another idea inside the same entry, and 3 are live and shapeable.
   Proposed split, live ideas first:

   - `bounded-dispatches-and-re-injected-context`. Agents must not run long operations without
     returning to fusion, and the working context must be re-sent with every request. Ranked top
     because it rests entirely on records already on disk and could be shaped today.
     `shared/issues/260812-0253_*_rules-lose-their-effect-during-a-long-dispatch.md` names the
     competing remedies, and
     `shared/analyses/260812-0303-simplify-speed-and-why-rules-do-not-hold.md` measures that the
     handoff between dispatches costs nothing while shorter dispatches would cut cost roughly
     fourfold.
   - `radical-simplification-of-fusion`. Whether fusion has become a token-consuming and
     time-consuming system that mostly maintains itself, and what would have to go. Rests on
     `shared/analyses/260812-0022-where-the-complexity-comes-from-and-what-would-have-to-go.md`.
     Ranked second because the analysis is on disk but the idea is a question rather than a
     direction, so shaping it means choosing a cut first.
   - `operations-take-unbearably-long`. Every operation, not only Setup. Ranked third because it
     needs measurement before it could be sized, and because it is defect-shaped. See
     `backlog-idea-only-partly-filed` under `## Warnings`.
   - The 7 ideas already carried by a filed record, listed so a split does not re-file them: Setup
     duration, agent verbosity, rules losing effect mid-session, the missing estimated time of
     arrival, the monitor unreachable on localhost, and the orchestrator's wrong instructions to
     sub-agents, all six dated `260812-0253` in `shared/issues/`, plus absolute artifact paths at
     `shared/decisions/260812-0254_*_should-a-cited-artifact-path-be-absolute-so-an-editor-can-open-it.md`.
   - The 3 duplicate groups, named rather than merged. The bounded-dispatch remedy is stated twice,
     fullest in the entry's `>>>` line. The self-repair complaint and the radical-simplification
     question are one idea, fullest in the entry's three closing questions. The observation that
     unverified claims get relayed upward duplicates
     `shared/issues/260812-0253_*_the-orchestrators-instructions-to-sub-agents-are-often-wrong.md`.
   - Two fragments that are not ideas and are excluded from the count of 13: a bare file path, and
     a note of the three most-changed files from the churn ranking. Five quoted agent transcripts
     are evidence for the verbosity and unverified-claims ideas, not ideas of their own.

Nothing was written into the backlog store on this run. No entry was created, renamed, split,
merged, closed, or deferred.

## Recently closed (_c_ / _b_)

| Circle | Marker | Closure |
|---|---|---|
| `260813-0858-playmaker-maintains-backlog-store` | `_c_` | Closed coherent 260813 after four Turns. The playmaker holds a write key to the backlog store, and the recommended-for-promotion marker has exactly one named writer. The end-to-end acceptance run is the one thing not demonstrated. |
| `260807-0923-guard-misst-statt-orakelt` | `_c_` | Closed coherent 260807-1650. The static classifier is gone. The guard measures what changed instead of predicting what will change. |
| `260805-2005-textschicht-gegen-code-nachziehen` | `_c_` | Closed coherent 260806-1105. The plugin's text layer says what the code does again, held there by two new lints. |
| `260801-1244-guard-rules-write` | `_c_` | Closed coherent 260805-2359. A project can permit rule-file writes deliberately, per session, and never silently. |
| `260801-1244-rule-provenance-header` | `_c_` | Closed coherent 260802. Every rule file states which record motivated it, and a test enforces it. |

No Circle carries the Bounded Closure marker, in this window or anywhere in the store.

**Worth knowing when reading the two guard closures.** Both delivered mechanisms that have since
been removed, on 260809 and 260812, each on its own measurement. The closures were correct. What
they built was later deleted deliberately. A reader who meets those rows without this note will
read them as stale.

## Archived (_s_ / _d_)

| Circle | Marker | Note |
|---|---|---|
| `260804-1205-shell-reachability-model` | `_s_` | Superseded 260807-0923 by `circles/260807-0923-guard-misst-statt-orakelt/`. Neither closed nor bounded: the user changed the mechanism, so the Directive stopped being the right one to reach. |

No Circle carries the deferred marker.

## Warnings

**`installed-copy-predates-the-backlog-mandate`.** The plugin copy this session executes is older
than the working tree, and the gap covers exactly the capability that closed on 260813. Verified
this run rather than inferred: `/Users/k1/.fusion/agents/playmaker.md` is 27 597 bytes and carries
the older write-narrow scope, while `agents/playmaker.md` in the working tree is 39 155 bytes and
carries the backlog mandate. Both `.claude-plugin/plugin.json` files read 8.1.0, so the version
number does not show the difference. The split is visible inside this run's own Setup:
`bin/fusion-paths playmaker` emitted `OUT_BACKLOG` because the helpers prefer the working tree in
this repository, while the prompt behind the run came from the installed copy and forbids every
backlog write. The remedy is documented in `CLAUDE.md` under `## Release process`, in the paragraph
beginning "And between releases": run `fusion --update` and restart the session. This is not a
defect in any Circle. It is the known cost of the deferred release.

**`backlog-acceptance-run-still-not-performed`.** The closure note of
`circles/260813-0858-playmaker-maintains-backlog-store/_*_circle.md` names the gap plainly. The
end-to-end run was planned as the successor to step 9, step 9 was deferred, and the run went with
it. Three playmaker runs have now had the opportunity and none could take it, for the reason
immediately above. The gap stands, with a named cause rather than an open question.

**`write-key-defect-record-open-after-its-circle-closed`.**
`shared/issues/260813-0825_*_the-playmaker-is-charged-with-backlog-upkeep-and-holds-no-write-key-to-the-store.md`
still carries the open marker. Its four acceptance conditions read as met against the working tree
at HEAD `267a65c`: the resolver emits the key, the prompt states the four operations in the words
its description uses, the filing prohibition survives, and
`rules/fusion-workbench-conventions.md` `## Backlog entries` names the marker's single writer.
Whether the record is held open deliberately until the release is not stated in it. The playmaker
files and closes no issues. This one is for the user or the reconciler.

**`curator-grounding-measurements-falsified`.** Two load-bearing measurements in
`circles/260801-1244-curator/_*_circle.md` no longer hold. The Grounding states that
`rules/fusion-workbench-conventions.md` holds 54 401 bytes across 32 second-level headings. The
file holds 51 920 bytes across 24 second-level headings, measured this run. This is the fifth
consecutive run reporting it. A shaper pass in portfolio-activation mode is required before
activation.

**`curator-circle-missing-artifact-subdirectories`.** `circles/260801-1244-curator/` holds only its
record. The six artifact subdirectories (`planning/`, `issues/`, `decisions/`, `history/`,
`reviews/`, `analyses/`) are absent, so the first agent dispatched there has to invent them. Both
Circles created on 260813 carry all six, so this is a gap in the older Circle rather than a
convention that changed.

**`one-sided-dependency-is-now-frozen`.** The `## Dependencies` section of
`circles/260813-0858-playmaker-maintains-backlog-store/_*_circle.md` still asks for the
documentation Circle's directory name to be filled in once it exists. That Circle exists, the name
was never added, and the record has since closed. A closed Circle is terminal, so the citation will
not be completed on that side. The relation survives only from
`circles/260813-0910-documentation-matches-shipped-plugin/`, which names it correctly. Filed as
`shared/issues/260813-0913_*_a-dependency-between-two-circles-can-only-be-recorded-on-one-side-because-nobody-may-write-the-other.md`,
whose scope needs widening to cover the terminal case. Reported, not fixed.

**`claude-md-always-on-figure-is-stale`.** `CLAUDE.md:64` states that each agent receives 88 023
bytes of always-on rules, of which 80 670 bytes are shipped rule text. Measured this run over the
five always-on files named in `bin/fusion-rules` plus this project's chat voice profile: 93 819
bytes total. The claim was true when written on 260812 and was overtaken within a day. `CLAUDE.md`
is in scope for `260813-0910-documentation-matches-shipped-plugin`, but the survey that Circle
works from does not name this figure, so it needs adding to that Circle's list rather than filing
separately.

**`fusion-direct-cannot-run-the-flow-it-documents`.**
`shared/issues/260813-1334_*_fusion-direct-documents-a-shaper-clarification-flow-that-a-dispatched-sub-agent-cannot-run.md`
records that `/fusion:direct` promises a shaper clarification dialogue that a dispatched sub-agent
cannot hold, because a dispatched shaper has no way to put a question to the user. Surfaced here
because the backlog recommendation above ends at `/fusion:direct` once the entry is split, so the
path from a backlog idea to a Circle runs through this defect.

**`backlog-idea-only-partly-filed`.** The observation that every operation takes unbearably long,
not only Setup, exists on disk only as a witness line inside a record scoped to Setup
(`shared/issues/260812-0253_*_setup-takes-far-too-long-and-nothing-measures-it.md`). It is
defect-shaped rather than idea-shaped, so it does not belong in the backlog split above, and no
open record covers it as stated. The playmaker files no issues. This one is for the user to decide.

**Dependency cycles: none.** The graph over the two anticipated Circles has no edges at all. Every
dependency either Circle names points at a closed Circle, which leaves the non-terminal graph. No
`## Dependency warning` section was appended to any record.

```
documentation-matches-shipped-plugin ──> (playmaker-maintains-backlog-store, now closed)
curator                              ──> (three closed Circles)
                                         both outside the non-terminal graph
```

**Parent-grounding-stale events: none.** No Circle record carries the Bounded Closure marker, so
the propagation scan had no starting point. The curator's falsified measurements are drift inside
an anticipated Circle and are reported above as an ordinary warning, not as this event.
