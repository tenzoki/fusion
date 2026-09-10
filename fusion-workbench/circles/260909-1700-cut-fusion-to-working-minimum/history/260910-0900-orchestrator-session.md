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
