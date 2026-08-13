# Portfolio

**Generated:** 260813-2334 (by playmaker session 260813-2334-playmaker-direct-dispatch)
**Domain bias:** code

## Active (_t_)

(none). No Circle record carries the active marker, and the pointer file `.active-circle` is
absent. The two agree, so this is the ordinary state after a closure rather than a fault.

The Circle that ran until this evening,
`circles/260813-0910-documentation-matches-shipped-plugin/`, carries the Bounded Closure marker
and now carries its `## Closure note` as well. It appears under `## Recently closed` below.

Activation runs through `/fusion:next`.

## Anticipated (_a_) — ranked

Recommended next: 260801-1244-curator — the only anticipated Circle left, and it needs a shaper
pass before it can be activated.

### 1. `260801-1244-curator`

> "The curator reconciles the three normative surfaces, and proves it on fusion's own conventions
> file."

**Dependencies:** all three closed coherent.
**Open decisions cited in the Grounding:** none.
**Circle directory:** record only, no artifact subdirectories.

This Circle ranks first because it is the only candidate. First place here carries no comparison
and should not be read as one.

On the raw code heuristic the Circle scores clean. Its three dependencies all closed coherent,
`260801-1244-rule-provenance-header` on 260802, `260801-1244-guard-rules-write` on 260805, and
transitively `260801-1244-guard-bash-inspection` on 260801, and the Grounding snapshot cites no
unresolved decision record. The heuristic reads what a record says, and it cannot read whether the
record still holds. This one does not. Two load-bearing measurements in the Grounding are
falsified: it states that `rules/fusion-workbench-conventions.md` holds 54 401 bytes across 32
second-level headings, where the file holds 51 920 bytes across 24, measured this run at HEAD
`431805b`. The whole scoping argument is sized against those two numbers. This is the seventh
consecutive run reporting the same falsification.

The reasoning in the record still stands. The sanctioned repair is a shaper pass in
portfolio-activation mode before activation, producing a Directive without capability C9, a fresh
validation case, and a Grounding measured this week. Whether the orchestrator may reach that shaper
mode from inside a session is the open record
`shared/decisions/260813-0027_*_should-the-orchestrator-be-able-to-dispatch-the-shapers-portfolio-activation-mode.md`;
the user can run the shaper directly regardless.

**One thing the shaper should put to the user**, carried forward from run 260813-0007 and still
unanswered. The compaction and partition this Circle performs are one-off acts. The partition that
cut the conventions file from 51 416 to 34 671 bytes on 260805 has been fully undone, and the file
is back to 51 920. If nothing bounds the rate of regrowth, a successful run buys about a week. The
project's own `shared/analyses/260812-0022-where-the-complexity-comes-from-and-what-would-have-to-go.md`
reaches the same conclusion on the largest removal this project ever performed.

**No `## Activation proposal` section was appended to this record on this run.** The record already
carries three, the newest written 26 minutes ago at run 260813-2326, and nothing in this Circle's
inputs moved between the two runs. A fourth section restating the third would add noise to a record
a shaper has to read whole.

## Backlog — ranked

Recommended to split first: `shared/backlog/260811-0826_*_observations.md`. It holds 13 ideas, and
the top one is `bounded-dispatches-and-re-injected-context`.

No `/fusion:direct` line is written for this entry. That command promotes an entry whole, which
would make one Circle of all 13 ideas and retire the lot.

**The split could not be performed on this run, for the same reason as at the previous four runs.**
The working tree grants the playmaker a write key to the backlog store, and `bin/fusion-paths
playmaker` emitted `OUT_BACKLOG` at this run's own Setup. The agent prompt behind this run came
from the installed plugin copy, which predates that change and forbids every backlog write. The run
followed the prompt it was given. See `installed-copy-predates-the-backlog-mandate` under
`## Warnings`. The remedy is one command and a session restart, not another Circle.

1. `shared/backlog/260811-0826_*_observations.md` (`_o_`). "Raw observations, hand-written by the
   user: about a dozen distinct ideas in one dump, awaiting consolidation by the playmaker." The
   only entry in the store, unchanged since 260811 and byte-identical to the copy the previous run
   read. Of its 13 distinct ideas, 7 are already carried by a filed record, 3 duplicate another
   idea inside the same entry, and 3 are live and shapeable. Proposed split, live ideas first:

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
     `shared/decisions/260812-0254_*_should-a-cited-artifact-path-be-absolute-so-an-editor-can-open-it.md`,
     which still carries the open marker.
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
| `260813-0910-documentation-matches-shipped-plugin` | `_b_` | Bounded Closure on 260813 after five Turns and sixteen commits. Nine of ten plan steps landed, and the documentation surfaces agree with the plugin at v8.1.0 over the survey's bounded list. The Bounded-Closure Artifact is step 10, the `docs/plane-setup.md` verification the Directive promises, which was never begun. The note records why the user closed bounded over a reconciler verdict that said the Directive was reachable: the Turn budget was spent at 5 of 5 and the remaining work is a fresh unit rather than a correction to this one. |
| `260813-0858-playmaker-maintains-backlog-store` | `_c_` | Closed coherent 260813 after four Turns. The playmaker holds a write key to the backlog store, and the recommended-for-promotion marker has exactly one named writer. The end-to-end acceptance run is the one thing not demonstrated. |
| `260807-0923-guard-misst-statt-orakelt` | `_c_` | Closed coherent 260807-1650. The static classifier is gone. The guard measures what changed instead of predicting what will change. |
| `260805-2005-textschicht-gegen-code-nachziehen` | `_c_` | Closed coherent 260806-1105. The plugin's text layer says what the code does again, held there by two new lints. |
| `260801-1244-guard-rules-write` | `_c_` | Closed coherent 260805-2359. A project can permit rule-file writes deliberately, per session, and never silently. |

**This is the store's first Bounded Closure.** Every previous Circle closed coherent or was
superseded, so a reader who knows the earlier portfolios will not have met a `_b_` row before.

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

**Two warnings the previous run carried are discharged, and one of them was wrong when it was
written.** The list below is shorter than the 260813-2326 list by three entries. What changed:

- `bounded-closure-carries-no-closure-note` is **fixed**. The record
  `circles/260813-0910-documentation-matches-shipped-plugin/_*_circle.md` now carries a
  `## Closure note` between `## Turn log` and the two activation-proposal sections, verified by
  reading its heading list rather than by a match count. The note names the Bounded-Closure
  Artifact the `_b_` marker requires, states what the Directive reached, and lists what is left
  standing. The earlier edit had matched nothing silently; the note itself records that failure as
  one of the two things this Circle learned.
- `bounded-closure-taken-against-the-reconcilers-recommendation` is **discharged rather than
  fixed**. The condition it described still holds: the Phase-3 verdict in
  `circles/260813-0910-documentation-matches-shipped-plugin/history/260813-2258-reconciliation.md`
  is `review-needed` with the recommendation *revise Artifact*, and the record carries `_b_`
  regardless. The warning existed because the divergence was unrecorded. It is now recorded in the
  closure note, in the reader's own terms, so nothing about it is left for a later reader to
  reconstruct.
- `claude-md-always-on-figure-is-stale` was **already false when the previous run reported it**,
  and it is withdrawn here rather than carried. `CLAUDE.md:65` does not state a present always-on
  floor. It states a stamped past measurement of 98 443 bytes on 260812, says in as many words that
  the present floor is deliberately not written down because it drifts, and tells the reader how to
  measure it. The correction landed in commit `c0e4219`, which the closure note names. The previous
  portfolio reported the pre-`c0e4219` wording as current, which is the same reading-versus-counting
  failure the bounded Circle's own method constraint was written against.

**`plane-setup-verification-outlives-its-circle`.** The Directive's unmet clause is on disk as
`circles/260813-0910-documentation-matches-shipped-plugin/issues/260813-2305_*_the-directive-promises-plane-setup-verification-and-step-10-was-deferred-with-no-record.md`,
and the closure note now names it as the Bounded-Closure Artifact. What remains is that the record
sits inside a terminal Circle, so nothing schedules it. All 466 lines of `docs/plane-setup.md` are
still unverified against `bin/fusion-plane`.

**`ten-open-defects-and-two-open-decisions-outlive-their-terminal-circle`.** The bounded Circle's
own stores hold 10 issue records carrying `_o_` and 2 carrying no other marker in `decisions/`,
counted off the disk this run. The 10 include the step-10 record named immediately above, so the
two warnings describe overlapping sets rather than adding up. Sixteen further issues in that Circle
are already closed. The two open decisions are the planner's `**Domain:**` parameter, which three
shipped surfaces promise and the prompt never parses, and how fusion's documentation should treat a
hand-measured number that decays. A terminal Circle is terminal, so these reach a successor Circle
by citation or they reach the task queue. They do not reach either by sitting there. The playmaker
files and closes no records.

**`the-bounded-circles-own-acceptance-record-is-still-open`.** New this run.
`shared/issues/260813-0825_*_the-v8-1-0-documentation-step-reached-three-files-and-the-feature-reached-seven-surfaces.md`
is the defect record the bounded Circle's Grounding names as holding its acceptance conditions. It
still carries the open marker while the Circle it governs has closed. Nine of ten steps landed, so
most of what the record asks for is met, and the one clause that is not has its own record. Whether
this one closes, closes partially, or is rewritten against the successor Circle is a judgement the
playmaker does not make. It sits in `shared/`, outside the terminal Circle, so unlike the ten above
it is still reachable by an ordinary reconciler pass.

**`release-8-2-0-is-now-blocked-on-a-judgement-rather-than-on-work`.** The version bump to 8.2.0 was
deferred at the backlog Circle's Turn-3 release gate on the ground that one release carries both
Circles. The second Circle has now closed bounded rather than coherent, with one Directive clause
unmet. Both `.claude-plugin/plugin.json` files still read 8.1.0, verified this run, so the playmaker
backlog capability remains committed at HEAD `431805b` and unreleased. Whether a bounded closure is
enough to ship on is the user's call, and it is the decision standing between the working tree and
every installed copy.

**`installed-copy-predates-the-backlog-mandate`.** The plugin copy this session executes is older
than the working tree, and the gap covers exactly the capability that closed on 260813. Verified
this run rather than inferred: `/Users/k1/.fusion/agents/playmaker.md` is 27 597 bytes and contains
no occurrence of `OUT_BACKLOG`, while `agents/playmaker.md` in the working tree is 39 155 bytes and
contains four. Both `.claude-plugin/plugin.json` files read 8.1.0, so the version number does not
show the difference. The split is visible inside this run's own Setup: `bin/fusion-paths playmaker`
emitted `OUT_BACKLOG` because the helpers prefer the working tree in this repository, while the
prompt behind the run came from the installed copy and forbids every backlog write. The remedy is
documented in `CLAUDE.md` under `## Release process`, in the paragraph beginning "And between
releases": run `fusion --update` and restart the session. This is not a defect in any Circle. It is
the known cost of the deferred release.

**`backlog-acceptance-run-still-not-performed`.** The closure note of
`circles/260813-0858-playmaker-maintains-backlog-store/_*_circle.md` names the gap plainly. The
end-to-end run was planned as the successor to step 9, step 9 was deferred, and the run went with
it. Five playmaker runs have now had the opportunity and none could take it, for the reason
immediately above. The gap stands, with a named cause rather than an open question.

**`write-key-defect-record-open-after-its-circle-closed`.**
`shared/issues/260813-0825_*_the-playmaker-is-charged-with-backlog-upkeep-and-holds-no-write-key-to-the-store.md`
still carries the open marker. Its four acceptance conditions read as met against the working tree
at HEAD `431805b`: the resolver emits the key, the prompt states the four operations in the words
its description uses, the filing prohibition survives, and `rules/fusion-workbench-conventions.md`
`## Backlog entries` names the marker's single writer. Whether the record is held open deliberately
until the release is not stated in it. The playmaker files and closes no issues. This one is for
the user or the reconciler.

**`curator-grounding-measurements-falsified`.** Two load-bearing measurements in
`circles/260801-1244-curator/_*_circle.md` no longer hold. The Grounding states that
`rules/fusion-workbench-conventions.md` holds 54 401 bytes across 32 second-level headings. The
file holds 51 920 bytes across 24, measured this run. This is the seventh consecutive run reporting
it. A shaper pass in portfolio-activation mode is required before activation.

**`curator-circle-missing-artifact-subdirectories`.** `circles/260801-1244-curator/` holds only its
record. The six artifact subdirectories (`planning/`, `issues/`, `decisions/`, `history/`,
`reviews/`, `analyses/`) are absent, so the first agent dispatched there has to invent them. Both
Circles created on 260813 carry all six, so this is a gap in the older Circle rather than a
convention that changed.

**`one-sided-dependency-is-now-frozen-on-both-sides`.** The `## Dependencies` section of
`circles/260813-0858-playmaker-maintains-backlog-store/_*_circle.md` still asks for the
documentation Circle's directory name to be filled in once it exists. That Circle existed, the name
was never added, and both Circles are now terminal. The relation survives only from
`circles/260813-0910-documentation-matches-shipped-plugin/`, which names it correctly, and that
record is terminal too. Filed as
`shared/issues/260813-0913_*_a-dependency-between-two-circles-can-only-be-recorded-on-one-side-because-nobody-may-write-the-other.md`,
whose scope needs widening to cover the terminal case. Reported, not fixed.

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

**Dependency cycles: none.** One Circle is non-terminal, `260801-1244-curator`, and every
dependency it names points at a Circle that is already closed. The non-terminal graph therefore has
one node and no edges, and a cycle is not constructible in it. No `## Dependency warning` section
was appended to any record.

```
curator ──> (three closed Circles, all outside the non-terminal graph)
```

**Parent-grounding-stale events: none.** The propagation scan ran against the one Circle carrying
`_b_`, `260813-0910-documentation-matches-shipped-plugin`, and found no parent. The one
non-terminal Circle, `260801-1244-curator`, cites neither that Circle's directory name nor the
Artifact its closure note names, verified by reading the record rather than by a count. The only
Circle that did cite it, `260813-0858-playmaker-maintains-backlog-store`, is itself terminal and
therefore outside the scan. No `## Parent grounding stale` section was appended to any record.
