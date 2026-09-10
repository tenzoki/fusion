# Orchestrator Session — 260910-0900

**Directive:** Continue the in-flight implementation plan `260909-1843_*_implementation-cut-fusion-to-a-working-minimum.md` from step C0 onward (session 3 of the plan's four).
**Mode:** plan
**Status:** In progress
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>

## Setup snapshot

Taken at Setup, 260910-0900, against HEAD `91179f35`.

| Reading | Value |
|---|---|
| Workbench domain | `code` (155 source files, 10 data files, counted by `git ls-files`) |
| Turn budget | 12 (declared in `fusion.json`) |
| Dispatch bound | 20 minutes (fusion's own default; this project declares none) |
| Open defects | 34 (5 in this Circle's store, 29 shared) |
| Open decisions | 14 (2 in this Circle's store, 12 shared) |
| Open plans | 4 (this Circle's plan at `_p_`, three shared at `_o_`) |
| Circle records | 1 anticipated, 1 active, 3 bounded, 20 closed, 1 superseded |
| Interrupted session | none: no `agentstate.yaml` was present |
| Upstream | level with `origin/main`, against a view 24 hours old |
| Presence | 0 other people; 1 further checkout of this person (`1d05b0e4`, alias `russet-marsh`), last seen 2026-09-07 |

The Circle-count hint was printed to the user, naming one anticipated and one active
Circle and pointing at `/fusion:next`.

Setup found nothing to repair. The setup marker already carried the shipped version
`10.26.0`, the four stylometric profiles matched the shipped copies byte for byte, the
project's permission file already set `bypassPermissions`, a union merge driver already
applied to the event log, the `.gitignore` already agreed with the four-class partition,
and no `bin/` helper present in the work tree was missing from the installed plugin. No
legacy guard-state leftovers were found.

## Directive, in full

The plan is `260909-1843_*_implementation-cut-fusion-to-a-working-minimum.md`, marked
`In Progress (session 2 of 4 complete)`. Steps A1 through B4 are `[DONE]`. This session
resumes at C0, the verification step that stands in front of every deletion the C-block
performs.

## Per-Turn Log

(appended per Turn)

## Rulings at the gate before C2

Both decisions filed on 260909-2305 were put to the user in plain terms — what each
mechanism costs and what it gives — rather than as the measurement-criterion question the
records ask. The user ruled on the mechanisms, and the criterion follows from the ruling.

**The per-Turn Coherence check does not survive.** The user's words: the check goes, and
reconciliation can be run by hand instead. That settles
`260909-2305_*_which-quantity-does-the-head-list-protect-a-gates-evaluation-rate-or-its-rate-of-returning-to-the-user.md`
for option 2, the **rate of returning to the user**. Under that quantity the check is
protected by no denominator: 8 `review-needed` verdicts against 169 Turns is 4.7 %, and 8
of the 32 rows whose verdict is readable is 25 %. Its 92.6 % evaluation rate protected it
only under the reading the user rejected, which counted it as useful for running rather
than for asking.

**The Rebalance gate survives, provisionally.** The user's words: it stays for now. That
settles `260909-2305_*_does-a-gate-protected-in-one-consuming-project-bind-fusions-own-cut.md`
for option 1, **any one project protects**: the gate clears half in one of the three
measured logs (krk, 50.9 %) and falls below in the other two (fusion 35.1 %,
unite-co-creator 31.7 %), and that single clearance is enough. The word "for now" is the
user's and is recorded as written: the ruling is not marked provisional in the record's
marker, which has no state for it, but a later Circle re-opening the question would be
acting on this sentence rather than against it.

**What the pair implies for the shape of the tool**, stated here because no step of the
plan states it and C2's brief contradicts it. The Rebalance gate's two automatic triggers
are the per-Turn Coherence check, which this ruling removes, and the reconciler's Coherence
verdict at the end of a run, which step C4 turns into a command the user invokes by name.
So the surviving gate is reached from a hand-run reconciliation and from nowhere else.
That is consistent with the first ruling rather than a casualty of it: the user asked for
reconciliation by hand, and this is what reaching the menu looks like once it is.

Two consequences for the plan, both carried into the C2 dispatch. Step C1 has already
deleted `rules/orchestrator-rebalance.md`, which holds the gate's per-option mechanics; it
is restored from `91179f35`. And C2's brief, which says "no coherence gate, no Rebalance",
is amended to remove the first and keep the second.

## Ruling on the dispatch bound

Put to the user after C2 landed, on the finding the executor surfaced and the record
`260910-1033_*_deleting-the-turn-budget-helper-leaves-the-dispatch-bound-with-no-reader.md`
had already filed: deleting `bin/fusion-turn-budget` in C1 removed the only program that
resolved `orchestrator.dispatchMinutes`, so from the next session no dispatch would carry a
stopping time.

**The user retired it, taking the second of the record's two acceptance branches:** the
setting goes the way `orchestrator.maxTurns` went, and dispatches run to their natural end.
The evidence in front of the ruling was this session's own: both bounded dispatches so far,
C1 and C2, ran roughly half an hour past the twenty minutes they were given, and the second
of them said so in its report rather than handing back a half-finished tree. A bound that
the work routinely overruns, and that no mechanism enforces, was buying the session nothing
it could not get by asking.

What follows is one task, queued as C1b: retire `orchestrator.dispatchMinutes` as a leaf
beside `maxTurns` in the leaf-scoped retirement list C1 built; retire the `**Stop by:**`
dispatch parameter and the bounded return that hands unfinished work back, both authored in
`rules/bounded-dispatch.md`; stop `bin/fusion-rules` emitting that file to the seven bound
agents; and bring `dispatch-bound-lint.test.ts` to the same answer. The orchestrator stops
computing a stopping time and stops passing the line, which this session begins doing
immediately rather than at the next one, since that half is behaviour rather than text.

## Ruling on the container

Put to the user after session 3 closed, when they asked whether Circles were gone and said
that would be a loss. The answer they were given separated three things step C9 removed —
the container that bundled a unit of work's artifacts, the portfolio layer that ranked and
recommended, and the richer state vocabulary — and offered each back on its own.

**The user chose the container.** Their reason, in their own words: the Circles were
introduced for a good reason, and without the bundling it is impossible to keep an
overview. That is a claim about what the tool is for rather than about what it costs, and
it is recorded here in those terms because the byte measurements that drove the whole cut
cannot see it. Every figure this Circle produced counts what a surface costs to carry; none
of them counts what a reader loses when the thing they are looking for is spread across six
stores by stamp.

The portfolio layer and the state vocabulary were not chosen and stay removed. The
work item's own shape stays exactly as C9 wrote it: no filename marker, state as a head
field, one file per item. Those two properties were bought with the container's removal and
are kept without paying for them again.

Filed as `260910-2133_*_does-a-unit-of-work-keep-its-own-container-for-the-artifacts-it-produces.md`,
answered in the same act. The record notes what the ruling obliges: the Origin Rule comes
back, because a placement decision exists again; the resolver needs a per-work branch; and
`skills/migrate/SKILL.md` has to be rewritten before D1 runs, since the body as written
flattens twenty-six containers into the shared stores. D1 is not reversible by a forward
commit, which is why the question was asked before it rather than after.

## Ruling on the container store's name

Put to the user while step S2 ran, on the question the planner filed rather than settled:
the container is back but the directory those containers sit in is still called
`circles/`, and nothing else in the restored design carries that word.

The question was put after correcting a sloppier statement of my own. I had told the user
the concept was gone, which overstates it: what came back is the container, and what stayed
removed is the six-state lifecycle on the record, the ranking layer and the closure verdict.
A work item with a directory is the bundling without the ceremony around it, so the word
survives in exactly one place, the path.

**The user ruled option 1: the store keeps the name, and the naming debt is named rather
than paid.** The costs that decided it are the planner's measurement, not an estimate: a
rename moves 1414 tracked files in this repository alone, stops the `circles/<dir>` citation
form matching the pattern that classifies it with no rewrite available for the tokens that
already exist, carries the literal into four `bin/` helpers and the monitor, and is one-way
in the same sense the flattening was — irreversible once records cite the new path. All of
that inside a work item whose measured subject is cutting cost, and none of it required by
the container ruling, which asked for the container and not for a rename.

The one real objection stands and is answered where a reader meets it: a reader who finds
`circles/` asks whether the ranking layer is back, and one clause in the layout tree says it
is not. Step S1 already wrote that clause and cited the open record; this ruling is what the
citation now resolves to.

Deferring was offered as a third option and declined in favour of settling it. The record
stays available to a later cleanup that wants option 2 with a quiet tree, which is what its
own recommendation asks for.

## Ruling on the growth bounds

Put to the user after step S2 left 44 bytes of head-room on the tightest dispatch path and
41 lines on the hook-test surface, with seven of the plan's eleven steps still to run.

**The user ruled that the budgets are raised as far as needed for now, and a reduction is
attempted afterwards.** That reverses the standing rule for the duration of this work: the
instrument's own text says a red bound is answered by a cut and never by moving a baseline,
and that a baseline moves at exactly two written-down moments, neither of which is this.

The residual was stated before the ruling rather than after it, and it is not small. The
instrument stops measuring during precisely the work it exists to measure, and this
project's own history carries one instance of that shape: the 2026-08-27 cut lasted thirteen
days because its baseline was armed at the cut. "We will reduce later" is the sentence that
history says does not get honoured on its own.

So the ruling is executed with an instrument attached rather than as a promise. The
pre-raise fixtures are preserved in the commit that records the ruling. Every raise names
itself in its own step's commit message, with the figure before and after, so the total is
recoverable by reading the range rather than by trusting a memory. And the reduction is read
on 2026-10-10, the date step C6's deferred measurement already carries, so one reading
answers both questions.

Filed as `260910-2256_*_may-the-growth-bounds-be-raised-for-the-duration-of-the-container-restoration.md`,
answered in the same act.
