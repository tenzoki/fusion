# A deep change to fusion fails loudly instead of silently

---
**Domain:** code
**Filed by:** shaper (anticipated-circle mode)
**Active spec/plan:** circles/260819-1645-four-constraints-on-deep-change/planning/260819-2016_*_four-constraints-on-deep-change.md
**Active session history:** circles/260819-1645-four-constraints-on-deep-change/history/260819-2006-orchestrator-session.md

---

## Directive

See `**Active spec/plan:**` above. The cited spec or plan states the Directive in force.

## Grounding snapshot

**Each of the four constraints is already recorded, and three of the four have been re-measured
more than once without moving.** What this Circle adds is the work, not the finding. All figures
below were measured at HEAD `b91c01c` during shaping.

**Constraint 1, the compiled artifact.** Decision
`shared/decisions/260816-0719_*_should-anything-assert-that-the-committed-hooks-dist-is-the-compilation-of-the-committed-source.md`
was answered by the user as option 2 and stands unrealised through two reconciliation passes.
`hooks/scripts/run-tests.mjs` compiles into a staging tree by design, so a green suite says
nothing about the committed artifact and never will. Two facts bind the shape of the answer.
`install.sh` defaults to `heads/main`, so every commit is installable, which is what eliminated
a release-step check (decision `shared/decisions/260816-1707_*_which-install-path-is-the-authoritative-one-for-end-users.md`).
And `hooks/package.json` declares `typescript: ^5.6.0`, a caret range, beside a committed
`hooks/package-lock.json`. Whether the lockfile satisfies the pinned-toolchain condition the
user's answer attached, or whether the range must become exact, is unsettled and is the
planner's to decide.

**Constraint 2, the two untested write tools.** Issue
`circles/260816-1741-guard-becomes-observation-only/issues/260816-2320_*_the-write-trace-is-now-the-guards-only-product-and-two-of-its-four-tools-reach-no-integration-case.md`
carries three reconciliation passes and the gap is unchanged. Verified during shaping:
`grep -rn 'NotebookEdit\|MultiEdit\|notebook_path' hooks/lib/__tests__/` returns one hit,
`hooks-wiring.test.ts:70`, which asserts the `hooks.json` matcher list rather than calling
through the hook. The record names the cheapest closure and it is still available:
`runWrite` in `hooks/lib/__tests__/helpers/guard-harness.ts` already takes a tool name, so four
cases in the existing describe in `guard-bash-integration.test.ts` cover all four tools and the
`notebook_path` branch with them.

**Constraint 3, the whole-tree git command.** Issue
`shared/issues/260819-0001_*_an-executor-reached-for-git-stash-while-two-were-dispatched-in-parallel.md`
records the measured case. It is the second of its class, not the first:
`shared/issues/260810-1820_*_an-executor-verified-a-gate-by-mutating-a-file-another-executor-held-in-the-live-tree.md`
records an executor mutating a file in the live tree while two others held it. The user placed
the prohibition in the orchestrator's dispatch obligations rather than in the executor prompts,
at every executor dispatch rather than only at a parallel one. There is text to build on:
`agents/orchestrator.md:983` already forbids `git checkout .` and `git reset --hard` for the
orchestrator's own revert, so this is an extension of an existing sentence rather than a new
mechanism. The user accepts the stated residual, that an executor cannot tell from its own
prompt whether it runs alone, so the sentence also binds a solitary executor where the command
would have been harmless.

**Constraint 4, the unresolved citations.** Issue
`shared/issues/260819-1511_*_the-archive-citation-filter-reads-shipped-text-and-never-the-workbench-so-archiving-dangles-citations-invisibly.md`
states the mechanism. `scanRecordCitations` was extracted into
`hooks/lib/__tests__/helpers/citation-scan.ts` for a second caller, and `grep -rn
scanRecordCitations` returns the lint alone. **The archive filter is narrower than that record
says.** `skills/archive/SKILL.md` checks `CLAUDE.md` and nothing else (its step 3 and its step
4); the wider shipped-text filter naming `bin/`, `rules/`, `agents/`, `skills/`, `hooks/`,
`docs/`, `README*.md` and `install.sh` was a session-local widening recorded in
`archive/260817-1907-safe-cleanup-scoped/MANIFEST.md`, and no shipped text carries it. Both
versions read shipped text only, so the direction of the gap is unaffected.

**The repair scope was measured rather than estimated.** Running
`hooks/lib/__tests__/helpers/citation-scan.ts` over exactly the surfaces the user chose (the
eleven Circle records, `portfolio.md`, the 23 open decisions in the shared and Circle stores,
and the 152 open issues in both) gives 1711 citation tokens: 747 resolved, **245 dangling**, 677
undecidable, 42 exempt. The dangling class breaks down as 98 stale markers, 51 wrong store, and
96 that resolve to nothing. The draft's figure of eighteen is the count of one earlier hand pass
over Circle records alone, and the same tool reports 81 dangling in those eleven records; the
user's estimate of about 250 is the accurate one, and it is the number the repair has to plan
for.

**The 677 undecidable tokens are not repairable and belong outside any gate.** A bare timestamp
citation carries no store, no kind and no slug, so nothing on disk says which artifact of that
minute is meant. `citation-scan.ts` places such a token in `undecidable` whatever it resolves
to, deliberately, and the question is held separately in
`shared/issues/260819-1511_*_a-bare-stamp-citation-is-ambiguous-when-two-records-share-it-and-one-turn-log-resolves-to-the-wrong-record.md`.
A gate that tried to judge them would be approximating an undecidable question, which
`rules/critical-stance.md` §4 forbids.

**Constraint 4 has a second half, and it is a text change rather than a test.** Decision
`circles/260801-1244-guard-rules-write/decisions/260805-1548_*_wie-soll-ein-circle-verschwinden-duerfen-den-jemand-absichtlich-loescht.md`
was answered by the user on 2026-08-05: a deliberately deleted Circle vanishes entirely, and the
obligation sits on the surviving references, which are annotated with the fact and the date. The
reconciliation of 2026-08-19 measured that operative half as unwritten: `rules/circle-records.md`
says nothing about deletion, no skill supports it, and no agent prompt carries the obligation, so
it is reachable by nobody about to delete a Circle. The user's fourth answer brings that
realisation into this Circle and gives archiving the same treatment.

**The two answers together impose an order.** The repair of the 245 dangling citations comes
first and the blocking test second, because a gate armed against today's tree is red on the
commit that arms it. The user chose the blocking form knowing that.

**The growth bounds constrain where text may be added, and one budget is nearly spent.** Measured
during shaping: `agents/*.md` has grown 14 691 bytes against 18 000 of head-room, leaving roughly
3 300; `skills/*/SKILL.md` has grown 10 284 against 20 000; the hook test surface has spent
roughly 620 lines of 2 500. Constraint 3 writes into `agents/orchestrator.md`, which sits on the
tightest of the three budgets, and constraint 4's deletion obligation writes into
`skills/archive/SKILL.md` and `rules/circle-records.md`. The rule for a red bound is a cut and
never a baseline edit, authored in `hooks/lib/__tests__/helpers/growth-bound.ts`.

**One decision is open and blocks the test half of constraint 4.** What defines the gate's corpus,
and what happens when an ordinary marker move puts a new record into it, is unanswered. The
question and its options are filed at
`circles/260819-1645-four-constraints-on-deep-change/decisions/260819-1645_*_what-defines-the-citation-gates-corpus-and-what-happens-when-a-marker-move-changes-it.md`.
The same coupling is already a live defect for the existing lint
(`shared/issues/260816-0725_*_the-citation-gates-new-exact-count-pin-is-coupled-to-workbench-contents-so-the-archive-step-can-turn-it-red.md`),
so this Circle would otherwise reproduce a known failure in a second place.

## Dependencies

No Circle blocks this one: all eleven existing Circles carry a terminal marker and none is
active. Three terminal Circles hold records this Circle reaches into, cited rather than copied
per the Origin Rule:

- `circles/260816-1741-guard-becomes-observation-only` (bounded) holds constraint 2's record, and
  is the Circle that made the write trace the guard's only product.
- `circles/260801-1244-guard-rules-write` (closed) holds the Circle-deletion decision that
  constraint 4's second half realises.
- `circles/260805-2005-textschicht-gegen-code-nachziehen` (closed) is where the
  reference-resolution lint and its citation grammar were built.

## Turn log

## Activation proposal

**Recommended for activation — playmaker run 260819-1732 (trigger: `direct-dispatch`, domain bias
`code`, git HEAD `b91c01c`).** Proposed activation timestamp: **260819-1732**.

This is the only Circle in the portfolio that is not terminal, and the store has stood empty of
candidates since `260816-1741-guard-becomes-observation-only` reached Bounded Closure on 2026-08-17.
Both halves of the code-domain heuristic were measured against disk on this run rather than read off
the record.

**Dependencies: nothing blocks this Circle.** The `## Dependencies` section names no blocking Circle
and cites three terminal Circles as lineage, each of which resolves to an existing directory:
`circles/260816-1741-guard-becomes-observation-only` (bounded), `circles/260801-1244-guard-rules-write`
(closed-coherent) and `circles/260805-2005-textschicht-gegen-code-nachziehen` (closed-coherent). One
of the three carries the bounded marker rather than closed-coherent, which the strict reading of the
dependencies-closed heuristic would flag. It is not raised as a flag here, because the citation is
reach under the Origin Rule rather than a precondition, and the bounded Circle's one unreached
Directive clause is unrelated to anything this Circle consumes from it.

**Unresolved decisions cited in the Grounding snapshot: one, and the record declares it itself.**
Every decision the Grounding cites was resolved against the store on this run.
`shared/decisions/260816-0719_*_should-anything-assert-that-the-committed-hooks-dist-is-the-compilation-of-the-committed-source.md`,
`shared/decisions/260816-1707_*_which-install-path-is-the-authoritative-one-for-end-users.md` and
`circles/260801-1244-guard-rules-write/decisions/260805-1548_*_wie-soll-ein-circle-verschwinden-duerfen-den-jemand-absichtlich-loescht.md`
all carry the answered marker. An answered-and-unrealised decision is the input this Circle consumes,
not a block on it. The one open record is
`circles/260819-1645-four-constraints-on-deep-change/decisions/260819-1645_*_what-defines-the-citation-gates-corpus-and-what-happens-when-a-marker-move-changes-it.md`,
which the Grounding names under `### One decision is open` as the block on the test half of
constraint 4.

**What that open decision does and does not block, because it decides how the Circle is planned.**
Three of the four constraints do not touch it. The compiled-artifact assertion, the two untested write
tools and the whole-tree git prohibition are each fully specified in the Grounding and each names the
files it would change. Constraint 4 splits: the repair of the 245 dangling citations is unblocked and,
by the Grounding's own sequencing, comes first in any case, since a gate armed against today's tree is
red on the commit that arms it. Only the blocking test needs the corpus question answered. Activating
now therefore buys a plan for three and a half constraints and puts the open question in front of the
user at the moment it becomes load-bearing, rather than holding the whole Circle behind it.

**Every citation in this record resolves on disk, which is unusual enough to be worth stating.** All
21 workbench-record paths cited in the Directive, Grounding and Dependencies were expanded and
resolved on this run; none dangles. The reconciliation of 260819-1400 found 18 dangling citations
across the eleven older Circle records, six of them created by the archive sweep, so this record is
the twelfth and the first clean one. That is direct evidence for constraint 4's premise and it is also
why the Grounding's measured figures can be relied on as written.

**The Grounding was measured at this exact commit.** It states HEAD `b91c01c` as its measurement
point, which is HEAD on this run, so no figure in it has had time to decay. Its open-issue count of
152 was re-counted here and matches: 95 open in `shared/issues/` and 57 across the Circle stores.

**Activation renames this record from the anticipated marker to the active one and writes
`.active-circle`. Neither is this agent's write.** The user commits it through `/fusion:next`, or the
orchestrator does at its own activation step.

## Parent grounding stale

**Bounded-Closure propagation flag — playmaker run 260819-1732.**

This Circle's `## Grounding snapshot` cites the Circle
`circles/260816-1741-guard-becomes-observation-only`, whose record carries the Bounded-Closure marker
(`_b_`). A bounded Circle delivered less than its Directive asked, so any Grounding that reasons from
it is flagged for a reading before the Circle runs. The citing line, under **Constraint 2**:

> Issue
> `circles/260816-1741-guard-becomes-observation-only/issues/260816-2320_*_the-write-trace-is-now-the-guards-only-product-and-two-of-its-four-tools-reach-no-integration-case.md`
> carries three reconciliation passes and the gap is unchanged.

**This flag is raised mechanically and, on reading, appears benign.** The check fires on the citation
alone. The substantive question is whether the Grounding assumes the bounded Directive was delivered
in full, and this one assumes the opposite: it cites an issue that is still open **inside** the
bounded Circle's own store and proposes to close it. That is the correct way to reach into a bounded
Circle. The bounded Circle's one deliberately unreached clause is
`circles/260816-1741-guard-becomes-observation-only/issues/260817-1505_*_the-curator-and-its-skill-still-say-a-projects-guard-configuration-can-deny-a-write.md`,
which this Circle neither cites nor depends on.

**Nothing is triggered by this flag.** No Rebalance is convened and no Grounding is revised. The user
reads it and decides whether the Grounding needs a line before activation. Per
`rules/circle-records.md`, propagation is semi-automatic by design: a note and an event, never an
automatic transition.

## Turn log

- Turn 1 (session 260819-2006): commits `b6869aa`..`8e7cae7`; fourteen executor tasks over the plan's nine live steps plus five that the work opened; Coherence verdict `coherent`; session history: `circles/260819-1645-four-constraints-on-deep-change/history/260819-2006-orchestrator-session.md`
- Turn 2 (session 260819-2006): commits `ac01c90`; four executor tasks closing twelve of the Circle's own fourteen open records; session history as above

## Closure note

**Closed coherent (`_c_`), 2026-08-20.** Reconciler verdict `coherent`, no Rebalance recommended
(`circles/260819-1645-four-constraints-on-deep-change/history/260820-0830-reconciliation.md`).

**What the Directive asked and what it got.** Five constraints, all delivered and each verified
against the tree rather than against its own account. The committed `hooks/dist` is asserted to be
the compilation of the committed source against an exactly pinned compiler, extracting HEAD into a
temp tree so nothing shared is written during a run. All four write tools reach an integration case,
each asserting the trace row's tool and not only its file. The orchestrator states the whole-tree git
prohibition at every executor dispatch, with no enforcement claimed — whether a command was run is
answerable only from its text, the undecidable question this repository deleted a classifier over.
The workbench's own citations are repaired and held by a blocking gate over a corpus written as a
marker predicate, with no baseline and no approvable number. And deliberate deletion has the
annotation form its decision had been waiting for since 5 August.

**Five gates were demonstrated failing rather than only passing**, and each demonstration changed
what was known: the artifact comparison reddened while the toolchain case stayed green; removing the
notebook branch reddened exactly one assertion at the expected line; an unclosed fence exposed two
further doors nobody would have guarded; a broken marker named its file, line, token and remedy; and
a frozen copy tree entered a gate it should never have entered.

**What the Circle did not reach, stated rather than omitted.**

The Directive says the live surfaces carry no dangling citation *and* that a blocking test holds them
there. The first half is measured. The second is met on the surfaces the corpus names, which now
include live plans and exclude three frozen stores, and it is **partial as a general claim**: a record
leaves the corpus at its terminal transition carrying whatever citations it holds. That cost was named
in the corpus decision before it was chosen and was paid inside this Circle twice — once on the
deletion form's own worked subject, once on a decision record whose three dead citations left the
measured set when step 4 transitioned it.

**Its own Phase-4 gate had nothing to read on it.** `## Where this Circle stops` was made mandatory in
the planner two days before this Circle's plan was written, and the plan does not carry it. The plan is
deliberately not retrofitted: writing stopping conditions after the work is a fiction. The gate that
prevents the next occurrence was built here (`260820-0917`), and its own live corpus is empty today, so
it is a trap set rather than a measurement taken.

**Two records stay open, neither for want of effort.** `260819-2250` names a cross-reference to a defect
record that was never filed; both dead pointers are neutralised and no citation in this workbench names
it any more, but what its author meant is not recoverable and no target was invented. `260820-0906` on
the deletion form needs a convention nobody has chosen — two tokens on it name files in another
repository, which the record says in prose and no parser can see.

**Twelve of the Circle's fourteen own findings were closed inside it**, after a review observed that six
of thirteen findings were the Circle's own stale tracking. That observation, in a Circle whose Directive
was that a deep change should not go wrong unobserved, is the sharpest thing this Circle produced.
