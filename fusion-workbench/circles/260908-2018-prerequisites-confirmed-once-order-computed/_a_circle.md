# Prerequisites are confirmed once, and every ordering figure is computed from them

---
**Domain:** code
**Filed by:** shaper (anticipated-circle mode), Kai Stalmann <ks@qantr.com>
**Claim:** Unclaimed
**Active spec/plan:** (none yet)
**Active session history:** (none yet)

---

## Directive

fusion holds the prerequisite relation between its units of work as a confirmed assertion and
computes every ordering figure from it, storing none of them. A model reads the relation out of the
prose that already carries it and proposes each edge with its evidence tier and its reason; the user
confirms; the confirmed edge is written into the dependent record by the agent, not by hand. A
helper under `bin/` then reports depth, transitive blocking count, topological order, readiness and
cycles on demand, and the recommendation of what to work on next reads those figures instead of
weighing three prose signals with no stated arithmetic. What is asserted persists. What is derived
is recomputed on every read and never written to disk.

## Grounding snapshot

Measured in this work tree at commit `de94102f` on 2026-09-08, and in the consulting project's
workbench at the same time. Every figure below was read; none is carried over from `CLAUDE.md`
unverified.

**What fusion has and what it lacks.** A grep over `agents/`, `rules/`, `skills/`, `bin/`, `hooks/`
and the three READMEs returns one occurrence of `topolog`, at `agents/taskplanner.md:116`, and it is
a prose instruction to a model rather than code. `transitive`, `slack`, `milestone` and `Gantt`
return zero occurrences each. The word `level` occurs 146 times and never as graph depth. So fusion
carries a state machine over work, a relatedness graph of citations, and an ordering that lives for
one session, and it carries no durable ordering over durable work.

**The one ordering that exists is deliberately thrown away.** `agents/taskplanner.md:116` sorts a
DAG topologically and `agents/taskplanner.md:12` states why the result is not a file: a queue is
derived, true only of the minute it was built, and this project measured the cost of persisting one
twice. That doctrine is correct about the order. It also discards the *reading* that produced the
order, so the same corpus is re-read by a model every session and the result never improves. The
Circle keeps the doctrine and separates the two: the reading is an assertion and is confirmed once,
the order is a derivation and is never stored. One correction to the consultation report that
prompted this Circle: the queue does have one durable copy, in `agentstate.yaml`'s `work_queue`
(`agents/taskplanner.md:10`), scoped to the session that built it.

**The dependency relation exists on disk and is not machine-readable.**
`rules/circle-records.md` `## Circle record template` specifies `## Dependencies` as a list of other
Circle directory names, and no live record is that. Opened all 23 records under `circles/`: 23
different shapes, at least five spellings of the empty case (`(none)`, `**(none)**`,
`(none among Circles).`, `No other Circle.`, `Keine.`), and at least five relation types carried in
one section with nothing to tell them apart. The types are a blocking edge, a reverse edge
(`Depended on by`, in `260801-1244-guard-rules-write` and `260801-1244-rule-provenance-header`), a
lineage citation, a binding-artifact citation, and once a conflict over the same byte budget
(`260820-2051-style-rules-arrive-and-get-measured`, which explicitly disclaims being an ordering
edge). Three records cite `260822-1921-measure-what-two-checkouts-share`, a directory that was
archived and no longer resolves. `260801-1244-curator` invents a hard-versus-soft edge vocabulary
and a transitive statement by hand, for that one record, and neither is specified anywhere.
`260813-0858-playmaker-maintains-backlog-store` names a required Circle by description because it
had no identifier to name, and says so in the section.

**The graph over live work is one node and no edges, today.** `agents/playmaker.md:138` builds its
cycle graph over `_a_` and `_t_` records only. There are zero `_a_` records, one `_t_` record
(`260906-2258-bounded-executor-dispatches`), and its `## Dependencies` reads `(none)`. The
mechanism therefore has nothing to compute against live work at the moment it is built, which is why
the acceptance test is retrospective.

**The ranker this Circle feeds states no arithmetic.** `agents/playmaker.md:125-134` computes an
unresolved-decision count, a dependencies-closed flag, a stale-Grounding count and one
domain-specific signal, then asserts a ranked list. No weighting and no tie-break rule is given. The
dependencies-closed flag reads exactly one hop (`agents/playmaker.md:130`).

**The plan step's dependency field is not parseable either.** `agents/planner.md:125` specifies
`- Dependencies: <which earlier step(s) this depends on, or "none">`, an English clause with no step
identifier scheme, no delimiter, and an empty-case literal that disagrees with the two other
surfaces that spell one. Nothing consumes it.

**Two halves of the mechanism already exist and are reusable.**
`hooks/lib/citation-scan.ts` `createScanner(workbenchRoot)` resolves a prose reference to a file on
disk, and is already the one grammar five readers share. `hooks/lib/citation-corpus.ts`
`isLiveRecord()` enumerates Circle records and live issues and decisions by marker and knows the
frozen stores. A dependency extractor is a further reader of the first, not a second parser.
`hooks/lib/domain-cascade.ts` is the precedent for machine-executing a rule authored in a Markdown
prompt rather than holding a second copy of it, with a test that fails on a second statement.
`bin/` holds 21 helpers of one shape: read, compute, print `KEY=value` on stdout, report and never
gate, guarded at every call site with `[ -x ]`.

**The budget is the binding constraint, and it is nearly spent.** Measured at `de94102f` against the
baseline maps in `hooks/lib/__tests__/surface-growth-bound.test.ts`: `agents/*.md` has **698 bytes**
of head-room, `skills/*/SKILL.md` has **902 bytes**, and the hook test suite has **1 695 lines**.
The four budgets are independent and shrinking one buys nothing in another
(`hooks/lib/__tests__/helpers/growth-bound.ts`). The way out of a red bound is a cut, and a Circle
that wants room has already been refused one:
`260822-1102_*_what-happens-when-a-planned-circles-required-work-exceeds-the-remaining-head-room.md`
was answered option 1, a cut-only Circle runs first. So this Circle's design is forced toward
`bin/` and `hooks/lib/`, which no bound measures, and toward a conditionally emitted rule file,
which is off the always-on floor. Whether 698 bytes holds the change to `agents/playmaker.md` is an
open question of this Circle and is filed as one.

**The source that prompted this.** `foreign:unite-co-creator:260907-2358-a-planning-layer-for-fusion-positions-edges-and-computed-order.md`,
a consultation in another project. Its own recommendation R3 was to keep such a mechanism
project-local and not to change a shared convention on the evidence of a single workbook. The user
overrode that on 2026-09-08 by asking for the mechanism in the plugin, and separately instructed
that the workbook's own shape is not to be projected onto fusion: it was a quick answer to an urgent
need. What survives from that report is its measurements and two of its design lessons, not its data
model. The lessons are that a planning source dangerous to regenerate gets bypassed and the
generated artefact silently becomes the master, and that assertion, measurement and derivation are
three different kinds of statement that must not share a field.

## Dependencies

(none)

Binding artifacts, cited rather than copied per the Origin Rule:

- `260822-1102_*_what-happens-when-a-planned-circles-required-work-exceeds-the-remaining-head-room.md`
  fixes what a Circle does when a bounded surface has no room left. Answered option 1, and its
  answer binds this Circle if `agents/playmaker.md` cannot be changed inside 698 bytes.
- `rules/circle-records.md` `## Circle record template` owns the `## Dependencies` specification
  this Circle changes the reading of, and its terminal-states statement forbids writing into a
  terminal record.
- `rules/fusion-workbench-conventions.md` `## Filename Patterns` owns the citation form an edge is
  written in, and `## Backlog entries` owns the second node kind.
- `260819-1645_*_what-defines-the-citation-gates-corpus-and-what-happens-when-a-marker-move-changes-it.md`
  settled the comparable question for the citation gate, and its answer is the precedent this
  Circle's dangling-edge decision was taken against.
- `260812-0254_*_does-fusion-need-a-backlog-store-and-a-maintainer-that-anticipates-circles.md`
  established the backlog store that supplies the finer node kind.

## Turn log

## Activation proposal

**Proposed activation:** 260908-2313. **Run:** playmaker session
`260908-2313-playmaker-direct-dispatch.md`.

Rank 1 of 1 among anticipated Circles, and this checkout holds no active Circle. Nothing blocks
it on the dependency side: this record's `## Dependencies` reads `(none)` above the binding
artifacts, so the cycle graph over anticipated and active records carries no edge into or out of
it, and no dependency waits on a Circle that has not closed. Its `## Grounding snapshot` cites no
decision record carrying the open marker, and it was written four commits before HEAD, so its
measurements are fresh. Two things weigh against activating it unchanged. Seven of the eight
records the snapshot cites carry a terminal marker or resolve only under `archive/`; most of that
is by construction, since the snapshot's subject is the shape of a section across a corpus that is
almost entirely terminal, but one clause of it went stale after it was written. The snapshot states
"There are zero `_a_` records, one `_t_` record (`260906-2258-bounded-executor-dispatches`)", and
that Circle's record carries `_c_` as of 2026-09-08, so the live graph the mechanism is to be built
against is now one anticipated record and none active. And four decision records carrying the open
marker sit in this Circle's own decision store, filed with it by the shaper; one of them,
`260908-2018_*_what-pays-for-the-playmaker-change-when-the-agent-surface-holds-698-bytes.md`, asks
what pays for the change this Circle makes to `agents/playmaker.md`, and this record's own
`## Grounding snapshot` states that the answer to
`260822-1102_*_what-happens-when-a-planned-circles-required-work-exceeds-the-remaining-head-room.md`
"binds this Circle if `agents/playmaker.md` cannot be changed inside 698 bytes". A re-sharpen
through the shaper's portfolio-activation mode before the marker moves would fold the closed Circle
into the snapshot and settle that question at the gate rather than at the implementation step.

## Activation proposal

**Proposed activation:** 260909-0756. **Run:** playmaker session
`260909-0756-playmaker-direct-dispatch.md`.

Rank 1 of 1 among anticipated Circles, unchanged, and this checkout still holds no active Circle.
This block exists to correct one figure the 260908-2313 proposal above states. That block reads
"it was written four commits before HEAD, so its measurements are fresh". The branch has since been
rebased onto a concurrent session's work, and the commit this record's `## Grounding snapshot`
names, `de94102f`, is no longer reachable from HEAD: `git merge-base --is-ancestor de94102f HEAD`
exits non-zero and `git branch -a --contains de94102f` names no branch. From the merge base
`25bee305` the two sides stand 14 and 39 commits apart. So the distance from the snapshot to HEAD
is not a number that can be taken at all, and the 39 that `git rev-list --count de94102f..HEAD`
prints is a divergence count rather than that distance. A commit carrying the identical subject
line, `79d4f84f`, is an ancestor of HEAD and stands 9 commits behind it; **inference:** that is the
rebased continuation of the same work, matched by subject line rather than by identity, and its
tree is not equal to `de94102f`'s.

Nothing else in the ranking moved. The `## Dependencies` section above still names no Circle, so
the cycle graph over anticipated and active records carries no edge into or out of this one; seven
of the eight records the snapshot cites still carry a terminal marker or resolve only under the
archive store; and the four decision records carrying the open marker in this Circle's own decision
store are unchanged, including
`260908-2018_*_what-pays-for-the-playmaker-change-when-the-agent-surface-holds-698-bytes.md`. The
recommendation is therefore the one the previous block made and this run does not restate: a
re-sharpen through the shaper's portfolio-activation mode before the marker moves, which would now
also re-anchor the snapshot to a commit that resolves.
