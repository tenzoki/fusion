# The playmaker maintains the backlog store it is charged with

---
**Domain:** code
**Status:** closed
**Filed by:** shaper (anticipated-circle mode)
**Active spec/plan:** 260813-1306_*_the-playmaker-maintains-the-backlog-store.md
**Active session history:** 260813-0806-orchestrator-session.md

---

## Directive

The playmaker maintains the shared backlog store rather than only describing it. A run
renames an entry's marker on its own judgement, and, once the user has confirmed inside
that same run, splits a multi-idea entry into one entry per idea, merges duplicates into a
single consolidated entry, and closes an entry that is no longer live. A split leaves the
original in place with its marker moved to closed and an appended line naming the entries
it became. The path resolver emits a backlog write key for the playmaker, because the
agent's own prompt now names the write, and the five surfaces that state the old no-write
boundary agree with the new one instead of contradicting it. Filing stays outside the
agent: no agent originates a backlog entry, playmaker included, and the
recommended-for-promotion marker (`_p_` in an entry's filename) ends this Circle with
exactly one named writer.

## Grounding snapshot

**Where this came from.** The decision record
`260812-2043_*_who-writes-the-recommended-marker-on-a-backlog-entry.md`
asked who writes the recommended-for-promotion marker, offered four options, and
recommended declining the one that hands the write to the playmaker. The user answered it
by choosing exactly that option and widening it to full maintenance. The record's own
recommendation was overruled rather than met, which the record now states in its answered
line. The defect that follows from the answer is filed as
`archive/260817-1907-safe-cleanup-scoped/260813-0825_*_the-playmaker-is-charged-with-backlog-upkeep-and-holds-no-write-key-to-the-store.md`.

**The surfaces that move together** are enumerated in that issue record under
`## Surfaces the fix has to reach`, with line citations into `agents/playmaker.md`,
`rules/fusion-workbench-conventions.md`, `CLAUDE.md` and the key-set tests. They are cited
here rather than restated, so that one list stays authoritative. The mechanical point
worth carrying forward is that the key set is *derived* by grepping the agent's own prompt
(`rules/workbench-path-resolution.md`), so the prompt has to name the write before the
resolver will emit the key. Prompt and key cannot be changed independently.

**The standing bound this Circle works against.**
`rules/fusion-workbench-conventions.md` `## Backlog entries` states two bounds, and only
one of them is in scope here. The backlog is not the work queue, and that stays untouched.
The other bound says no agent files a backlog entry, and the Directive above keeps it.

**Four questions were settled with the user in one round.**

1. *How much autonomy does a run have?* Mixed. Marker renames are autonomous within a run.
   Splitting, merging and closing happen only after the user confirms in that same run.
2. *What happens to an entry that gets split?* The original stays. Its marker moves to
   closed and a line is appended naming the entries it became. The form follows the
   shaper's existing `Promoted:` precedent for an entry that became a Circle.
3. *What does a merge produce?* One consolidated entry, written by the playmaker, rather
   than both bodies stacked into one file. The user chose this over the two options that
   kept the playmaker out of authorship.
4. *Does an undo mechanism belong in scope?* No. This repository has tracked its workbench
   since `e8988d9`, so git is the undo, and no before-state is written to the history log.

**The sharpest open edge this Circle carries.** Answer 3 brushes against the standing rule
that no agent originates a backlog entry. A merge that produces new prose is authorship,
and the rule was written to keep authorship with the user. The two are reconcilable, since
consolidating two entries that already exist is not the same act as introducing an idea
nobody filed, but nothing on disk states where that line falls. The plan has to state it
precisely and in the same words the conventions file uses, or the next reader will read
the merge as a violation of a rule the same document asserts. This is recorded, not
re-opened: the user has answered which behaviour he wants, and what remains is saying
exactly what it is.

**Accepted residual.** A consuming project that does not track its workbench in git has no
undo for a playmaker maintenance run at all. That is accepted rather than solved, and the
plan should not spend steps on it.

**Deferred question.** The playmaker is dispatched two ways: interactively through
`/fusion:next`, and non-interactively by the orchestrator at Phase 4 after a Circle closes
(`agents/playmaker.md`, `## Who dispatches playmaker`). Answer 1 gates splitting, merging
and closing on a confirmation inside the same run, and the Phase 4 dispatch has no
confirmation channel. Whether such a run performs those operations at all is filed as
`260813-0858_*_does-a-non-interactive-playmaker-run-perform-the-confirm-gated-backlog-operations.md`.

**The store as it stands.** `shared/backlog/` holds one entry,
`260811-0826_*_observations.md`, a hand-written dump of about a dozen distinct ideas. It is
the exact input the split behaviour exists for, and it makes a usable acceptance case: a
run against it should propose a split, obtain confirmation, and leave one entry per idea
plus the closed original.

## Dependencies

- **Blocks a documentation Circle created in the same session.** That Circle rewrites the
  playmaker's backlog role in `README-agents.md`, `CLAUDE.md` and `docs/working-model.md`.
  All three describe the behaviour this Circle changes, so documenting them first would
  document a behaviour that is about to be replaced. This Circle lands first. The
  documentation Circle's directory name is to be added here by the orchestrator once it
  exists; the ordering is stated as a named relationship so that it is visible from
  whichever of the two records a reader opens first.
- Binding records, cited rather than copied per the Origin Rule:
  `archive/260817-1907-safe-cleanup-scoped/260813-0825_*_the-playmaker-is-charged-with-backlog-upkeep-and-holds-no-write-key-to-the-store.md`
  and
  `260812-2043_*_who-writes-the-recommended-marker-on-a-backlog-entry.md`.

## Turn log

- Turn 1 (session 260813-0806-orchestrator-session.md): commits 799fded..7342fdd; Coherence verdict not taken — this Turn ran against a shared defect record, not against this Circle's Directive; session history: 260813-0806-orchestrator-session.md

  The user activated this Circle and then chose, at the same gate, to repair the red test
  baseline before any of its Directive was started. So Turn 1 belongs to this Circle by clock
  and not by subject: three tests were failing at `1c2d555`, two bugfixers resolved them, and
  `bin/fusion-plane` turned out to carry a product defect that had broken the Plane bridge for
  every operator whose interactive shell writes a greeting to stdout. The suite is green at
  1010 of 1010. Nothing in this Circle's `## Directive` was touched, and its Grounding is
  unchanged. A review of the repair filed five follow-on records, none of them blocking.

- Turn 2 (session 260813-0806-orchestrator-session.md): commits 7342fdd..d6dd193; Coherence verdict not taken — this Turn ran against shared review findings, not against this Circle's Directive; session history: 260813-0806-orchestrator-session.md

  Still not this Circle's Directive. The review of Turn 1's commit found that the fix, while
  sound, leaves three silent-failure modes on the same function: an unquoted temp path parsed
  by a second shell, an unguarded `mktemp` whose failure lands on the success branch because
  `set -e` is suspended at all twelve call sites, and an HTTP status code still read from the
  channel the whole repair was about. The user chose to close those before the Circle's own
  work begins. Two of the three were closed outright, the third re-scoped to what a
  change confined to one function could not reach. The suite went from 1010 to 1014 tests
  across the same 48 files, and the four new cases were each verified to fail against the
  previous commit's binary. This Circle's Directive is still untouched and its Grounding
  unchanged; Turn 3 is where its own work begins.

- Turn 3 (session 260813-0806-orchestrator-session.md): commits 3c51bc1..2a029eb; Coherence verdict review-needed (reconciler, recommendation: revise Artifact); session history: 260813-0806-orchestrator-session.md

  Opens by settling the decision the shaper marked as planning-blocking, on whether a
  non-interactive Phase 4 run performs the confirm-gated operations. It has to be answered
  before the plan rather than inside it, because it decides whether a proposal-return path
  is built at all, and that is a shape rather than a detail.

- Turn 4 (session 260813-0806-orchestrator-session.md): commits 2a029eb..HEAD; closing the seams the review found before the Circle closes; session history: 260813-0806-orchestrator-session.md

  The Turn-3 review filed eleven findings against this Circle's own delivery, one of them High:
  the confirmation relay offers a "choose which" option with no continuation, against a store
  whose only entry carries thirteen ideas partitioned three ways. The reconciler independently
  found the sixth surface still asserting the old no-write boundary, which is why its
  Artifact-to-Directive edge reads partially rather than reached. The user chose to close the
  seams rather than close the Circle over them.

## Activation proposal (playmaker run 260813-0926-playmaker-direct-dispatch.md)

**Proposed for activation.** Run identifier `260813-0926-playmaker-direct-dispatch`;
proposed activation timestamp `260813-0926-playmaker-direct-dispatch.md`.

**Rationale.** This Circle ranks first of three anticipated Circles under the `code` domain
bias, and it is the only one of the three that is activatable as written today.

Its `## Dependencies` section names no Circle it waits on. The relation it does record runs
outward: it blocks the documentation Circle
`archive/260817-1907-safe-cleanup-scoped/260813-0910-documentation-matches-shipped-plugin`, whose own
record cites this directory and states that four passages wait on it. Both records agree on
the direction, so the ordering is unambiguous and this Circle is the head of it.

Its Grounding snapshot was written today against records that are on disk and current: the
defect record
`archive/260817-1907-safe-cleanup-scoped/260813-0825_*_the-playmaker-is-charged-with-backlog-upkeep-and-holds-no-write-key-to-the-store.md`
carries the surfaces list with line citations, and the decision
`260812-2043_*_who-writes-the-recommended-marker-on-a-backlog-entry.md` was
answered by the user in session `260813-0806-orchestrator-session.md`. Four
scoping questions were settled with the user in one round and are recorded in the Grounding
rather than left for the planner to rediscover. The Circle directory holds all six artifact
subdirectories.

One open decision is cited, and it is a plan-shaping question rather than a bar to activation:
`260813-0858_*_does-a-non-interactive-playmaker-run-perform-the-confirm-gated-backlog-operations.md`.
Its own text says it has to be settled before the plan, because it decides whether a
proposal-return path gets built at all. Answering it is the first thing the activated Circle
should do.

**One measured argument the ranking rests on, from this run's own backlog pass.** The shared
backlog holds one entry, `260811-0826_*_observations.md`, carrying thirteen
distinct ideas. It has been recommended for splitting by three consecutive playmaker runs and
has not been split, because no agent holds a write key to the store. This Circle is the one
that hands over that key. The backlog job is blocked on exactly this Circle and on nothing
else.

**Nothing was renamed.** The marker on this record is unchanged and `.active-circle` was not
written. Activation runs through `/fusion:next`, or through the orchestrator after the user
confirms.

## Closure note

**Closed coherent on 260813**, after four Turns in session
`260813-0806-orchestrator-session.md`. The reconciler's Phase-3 verdict was
`review-needed` with the recommendation *revise Artifact*; the user took that recommendation, the
five findings behind it were closed in Turn 4, and the Circle closes on the revised Artifact rather
than over the verdict.

**The Directive is met.** `bin/fusion-paths playmaker` emits `OUT_BACKLOG`. The resolver was never
touched: the key was already in its ORDER list and already valued, and the agent lacked it for one
reason only, that its prompt never wrote the token. All surfaces that stated the old no-write
boundary now state the new one — ten in the prompt, plus the sixth surface in
`skills/next/SKILL.md` that the review and the reconciler both caught, which is what moved the
Artifact-to-Directive edge from *partially* to met. The recommended-for-promotion marker has
exactly one named writer.

**Two things this Circle did not do, and neither is a defect in it.**

The end-to-end acceptance run never happened. The plan specified a `/fusion:next` run against
`260811-0826_*_observations.md` — propose a split, obtain confirmation, leave one
entry per idea plus the closed original. It could not be dispatched from inside a Turn loop, the
plan terminated it after step 9, and step 9 was deferred. So the capability is proven by tests, by
the resolver, by two lints and by a review that opened every changed file, and it has never been
exercised whole. That is the largest gap between what was built and what was demonstrated, and the
first real run is where it gets closed.

Step 9, the version bump to `8.2.0`, is deferred by the user's release decision: one release
carries this Circle and
`archive/260817-1907-safe-cleanup-scoped/260813-0910-documentation-matches-shipped-plugin` together,
because that Circle rewrites four passages describing the behaviour this one replaced. Two of those
four now contradict shipped behaviour outright, recorded under `## Update 260813-1500` in
`shared/issues/260813-0825_*`. The bump has no carrier outside the plan being closed here, which is
filed as `260813-1545_*_the-deferred-version-bump-has-no-carrier-outside-the-plan-that-is-being-closed.md`.

**Turns 1 and 2 did not serve this Directive** and their log entries say so. They repaired a red
test baseline the user chose to clear first, and found a real product defect: `bin/fusion-plane`
read HTTP response bodies off an interactive shell's stdout, so the Plane bridge was dead for any
operator whose shell prints a greeting. That is this session's most consequential fix and it has
nothing to do with the backlog.

**Seven records stay open in this Circle's issue store**, none of them blocking: the split line
form cannot express a partial split, the relay reads its operation lines out of report prose, the
Phase 4 mandate is stated a third time where the lint holds two, the explicit form of
`/fusion:next` skips the relay, the prompt says "originates" where the conventions lead now says
"files", the deferred bump has no carrier, and a manual command `bin/fusion-plane` prints carries
the shell-noise shape that was fixed everywhere else.

**Cost, measured rather than estimated.** Always-on rule text grew 1,928 bytes for all sixteen
agents and 730 more for three. The budget report fires for every role and was not silenced;
`RULE_BASELINE` was not moved, because this is growth. The shaper's emitted total now sits within
1,252 bytes of `RELEASE_CAP`, which no assertion reads today.
