# Shaper session — fusion becomes a multi-user tool (round 3)

**Date:** 2026-08-22
**Status:** Complete
**Agent:** shaper, user-direct mode, dispatched by the orchestrator at Phase 0b.1
**Circle:** none active. All output is in `shared/`.

## What this round was given

Round 3 of one shaping task. The dispatch carried the raw request, all eight answers from rounds 1 and 2, the user's correction of a finding from round 2, two conditions attached to the attribution answer, and the changed sequencing that follows from the head-room decision having been answered.

The backlog entry the request cited does not exist and was verified absent twice before this round. The request text and the eight answers are the whole input.

## What was produced

- **Spec:** `shared/planning/260822-1136_*_spec-fusion-becomes-a-multi-user-tool.md`. Five Circles, a state partition over every entry of the workbench layout tree, the supersession step, the isolation-verification step, and a `**Decidability:**` line in the head.
- **Two open decision records**, both blocking a named point in the spec:
  - `shared/decisions/260822-1136_*_how-does-the-tracked-event-log-behave-when-two-checkouts-both-appended-to-it.md`, which blocks the close of Circle 2.
  - `shared/decisions/260822-1136_*_which-identity-does-an-attributed-record-carry-when-the-transport-is-git.md`, which is answered at Circle 3's planning gate.
- **One defect:** `shared/issues/260822-1136_*_two-definitions-of-the-turn-count-disagree-and-the-resume-snippet-counts-every-session-in-the-log.md`.

## The measurements this round took at HEAD

Head-room on the four bounded surfaces, summed from each surface's baseline map against the tree:

| Surface | Floor | Now | Remaining |
|---|---|---|---|
| Always-on rule core | 86 573 bytes | 95 064 | 3 509 bytes |
| `agents/*.md` | 399 843 bytes | 416 205 | 1 638 bytes |
| `skills/*/SKILL.md` | 220 439 bytes | 240 409 | 30 bytes |
| Hook test suite | 17 875 lines | 20 363 | 12 lines |

The dispatch named three surfaces. There are four, and the fourth matters here because the record templates that attribution changes live in `rules/fusion-workbench-conventions.md`, which is always-on. Its 3 509 bytes are enough for the template change, so the binding constraints are the two the user already knew about.

## The four defects the cut-only Circle is tested against

The answered head-room decision names "the four defects already open against `skills/setup/SKILL.md` and the hook tests" and does not enumerate them. The spec enumerates them, choosing the four whose own text names the bound as the reason they are unfixed. Two are on the skills surface and two on the hook tests. The record itself was not edited, because it is answered.

## What the round changed in the design

**The sequence gained a Circle at the front and a Circle in second place.** The cut-only Circle stays separate rather than being absorbed, because a Circle holding both a reduction and a feature cannot report honestly on the trade between them. The isolation verification became its own Circle, because it can refute the whole arrangement and it should do so while refuting is cheap.

**The state partition reduces the multi-writer problem to one file.** Ranging the four-class split over every entry of the layout tree leaves exactly one member in the class "travels, one file, appended by many", which is `orchestrator-events.jsonl`. `portfolio.md` leaves that neighbourhood by answer 6, and the guard's own log travels only as an archived copy. That is what made the rebuild small enough to specify.

**A hole the answers left open was closed by the Circle record.** `.active-circle` stays local and does not travel, so nothing stops two people activating one Circle. The only thing that can carry a claim between checkouts is a tracked record, and the Circle record is one. The spec therefore puts a claim field on it and states the honest limit: the collision is detected by git refusing the second push, not prevented.

**The user's two conditions are carried as stated.** The identifier goes in the body and never in a filename, which this spec extends to the person and which means no filename pattern changes anywhere. The record-to-session join is declared not load-bearing, with the reason: the record carries the person, the session appears only in the event log, and no capability walks from one to the other.

## The Decidability line, after the user's correction

The round-2 finding that a session identifier is not derivable was wrong and was corrected by the user and verified by the orchestrator. The restated question is whether a record can be attributed to the person and to the session from inputs fusion already holds. The person is decidable now, from `$USER`. The session is decidable for the hooks and not for the agent, and whether an agent could obtain it rests on a measurement nobody has taken. The spec depends on none of that, and Circle 4 states the measurement as its own first step.

## Foreclosed, and stated as such

Two sessions in one checkout are out of scope, and stay out of scope, because answer 5 forecloses the shared live state that would make them safe. Parallelism comes from several checkouts and from nowhere else.
