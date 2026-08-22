# How does fusion support several people working on one project at once?

---
**Domain:** code
**Filed by:** orchestrator, at the Rebalance gate of session 260822-1009, on the user's choice to revise the Grounding
**Cross-references:**
`shared/decisions/260719-2141_*_concurrency-worktree-slots-vs-single-active-circle.md` (the record this
supersedes, and the answer that stood for a month);
`shared/planning/260822-1136_*_spec-fusion-becomes-a-multi-user-tool.md` (the specification that answers
this, approved by the user at a gate on 260822);
`shared/history/260822-1009-orchestrator-session.md` (the eight gate answers the specification rests on);
`shared/issues/260822-1556_*_the-spec-names-five-circles-and-the-workbench-holds-none-of-them-so-c0-closed-with-nothing-to-transition.md`
(the reason the Circle sequence this answer prescribes is not yet in the portfolio)

---

## Question

The superseded record asked how a user running several stories in parallel could run fusion at all,
given that fusion was single-active-Circle with no concurrency lock. It was answered in the negative:
fusion does not support concurrency, parallelism is out of scope, and a multi-story user keeps their
own mechanism outside fusion's guarantees.

The user has since asked for the opposite. The question is therefore not whether fusion supports
several people, but **in what arrangement, with what guarantee, with what identity, and with what
visibility** — four questions the old record's three options ran together, and which have now been
answered separately.

The question is filed and answered in the same act because the answer already exists on disk and was
given by the user at a gate before this record was written. Filing it open would have claimed an
uncertainty that no longer obtains.

## Options

The old record's three options are restated here, because superseding a record does not delete what it
was choosing between, and because option 2 is what was chosen.

1. **Worktree slots stay the user's own mechanism; fusion owns no cross-slot concurrency.** Rests on an
   unverified assumption, that N checkouts produce N isolated workbench states.
2. **fusion grows real multi-active support.** Judged in the old record as large, invasive, and
   "almost certainly a separate Circle of its own".
3. **Accept the limit and say so.** The answer that stood.

## Constraints

- **The superseded record's binding sentence survives its supersession**: nothing in fusion may assume
  two orchestrators can run safely against one workbench. The chosen arrangement satisfies it rather
  than overturning it, because two orchestrators never run against one workbench — they run against
  two.
- The old record's option 1 rested on a fact nobody has ever verified. The chosen arrangement rests on
  the same fact, so verifying it is a step of the work rather than an assumption carried into it.
- No currently ignored workbench file becomes tracked, and no session reads another session's live
  state.
- The multi-checkout arrangement requires the project to track its workbench. fusion ships no rule
  about that and does not acquire one.

## Recommendation

None needed. The answer below is the user's, given across eight gate answers in three shaping rounds.

---
Answered: shared/planning/260822-1136_*_spec-fusion-becomes-a-multi-user-tool.md — **option 2, in the
narrow form that specification defines**, approved by the user at a gate on 260822 and resting on eight
answers recorded in `shared/history/260822-1009-orchestrator-session.md`.

fusion supports several people on one project **through several checkouts, with git as the transport**.
Parallelism comes from several sessions and from nowhere else: one session still holds at most one
active Circle. Every record says which person wrote it; the session identifier appears only in the
event log the hooks write, and no capability walks from a record back to a session. One person can see,
after a pull, that somebody else has been working and on which Circle, and nothing more — not their
queue, not their running task, not their dashboard.

**The requirement this began with was retired rather than fulfilled**, and that is part of the answer.
The user's opening request was that the currently ignored workbench state move into the repository.
Presence-only visibility across separate checkouts needs presence to travel and needs neither
`agentstate.yaml` nor `orchestrator-live.md` nor the work queue to travel at all, so the ignored files
stay ignored and `portfolio.md` joins them. What travels is the record layer, which already travels,
plus one line per session in `orchestrator-events.jsonl`, which is already tracked and already
append-only. The whole design is one file wide at its only multi-writer point.

**What is not yet established.** That N checkouts produce N isolated workbench states has still never
been measured, and the arrangement rests on it. The specification makes that measurement the first
step of its second Circle and states that a negative result stops the sequence. Until it is run, this
answer is chosen but not proven.

Implemented:
Deferred:
Superseded by:
Retired:
