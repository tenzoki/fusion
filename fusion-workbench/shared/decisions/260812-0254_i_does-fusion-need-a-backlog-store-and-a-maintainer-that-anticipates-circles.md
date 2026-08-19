# Does fusion need a backlog store and a maintainer that anticipates Circles?

---
**Domain:** code
**Status:** open
**Filed by:** orchestrator (on the user's request)
**Cross-references:** the Circle-placement decision filed alongside this one; `agents/playmaker.md` and `$PORTFOLIO`, which rank Circles that already exist; `agents/taskplanner.md` and `tasklist.md`, named as removal candidate 4 in `shared/analyses/260812-0022-...md`

---

## Question

The user asks for a backlog or ideation store in `shared/`, and a **backlog maintainer** that
consolidates it and anticipates Circles from it. The Circle would come into existence there, before
the shaper runs, so that shaper and planner work a rough idea inside an existing Circle.

Today there is a gap exactly where he is pointing. `portfolio.md` and the playmaker rank Circles
that already exist. `tasklist.md` and the taskplanner enumerate work that already has a record. An
idea that is neither — a thought, a direction, something a session noticed and nobody filed — has
no home at all, so it becomes either a decision record (wrong kind: nothing is being decided), a
defect record (wrong kind: nothing is broken), or a line in a memo nobody reads back.

## Options

1. **`shared/backlog/` plus a `backlog-maintainer` agent** that consolidates entries, merges
   duplicates, and proposes anticipated Circles. A seventeenth agent.
   - Cons: the same analysis that motivated this session recommends bounding the addition rate, and
     a new agent with its own prompt, rules audience and defect population is precisely what it
     warned about.
2. **`shared/backlog/` as a store, with the playmaker doing the consolidation.** The playmaker
   already reads everything, ranks, and proposes activation; extending it from "which Circle next"
   to "which idea becomes a Circle" is the same job one step earlier.
   - Pros: no new agent, and it removes the playmaker's current oddity of having nothing to do when
     no anticipated Circle exists.
3. **Use anticipated Circles as the backlog**, with no new store: an idea is filed directly as an
   `_a_` Circle with a one-line Directive and no Grounding, which is what `_a_` already means.
   - Pros: nothing new at all; `/fusion:direct` already writes exactly this.
   - Cons: an idea that never becomes work leaves a Circle directory behind, and the portfolio fills
     with things that were never intended to be worked.
4. **Retire `taskplanner` and the persisted queue into this**, since option 4 of the removal list
   proposes removing them anyway and the backlog is the thing they were reached for in place of.

## Constraints

- Whatever is chosen must not add a seventeenth agent unless it can be shown that no existing one
  fits. The addition rate is the constraint this whole line of work is about.
- The store must be writable with no Circle active, which puts it in `shared/` by the Origin Rule
  without further argument.

## Recommendation

Option 3 for the store, option 2 for the maintenance, and treat option 4 as the thing this
replaces. That combination adds one directory and one paragraph to an existing agent, and it is the
only combination that answers the user's request without adding an agent. Decide it together with
the placement question filed alongside — they are one design.

---

## Answer, 260812-1620, by the user

**Option 2: `shared/backlog/` as a store, with the playmaker consolidating.** No seventeenth agent.
The playmaker already reads everything, ranks and proposes activation; extending it from "which
Circle next" to "which idea becomes a Circle" is the same job one step earlier, and it removes its
present oddity of having nothing to do when no anticipated Circle exists.

Option 3 — anticipated Circles as the backlog with no store at all — was not taken. It was the
cheaper answer and the record recommended it, but it loads the portfolio with things nobody
intends to work. A backlog entry and an anticipated Circle are different claims: one says "worth
considering", the other says "this is a unit of work whose Directive is provisional". Keeping them
apart is what the user chose to pay a directory for.

Option 4 is not decided here. Whether `taskplanner` and the persisted queue retire into this store
stays open; the backlog is a home for ideas, not for a work queue, and folding the two together
would answer a removal question by the back door.

This decision is answered together with `260812-0254_*_where-do-a-circles-spec-and-plan-belong-…`;
they are one design and neither is implementable alone.

---
Answered: this record `## Answer, 260812-1620` — a `shared/backlog/` store, maintained by the
playmaker, with no new agent.

Implemented: `dec40bb` + `3c6ec4e` (the store and its resolver keys, v8.1.0) and `b995049` (the maintainer half). Both clauses of the answer are now on disk: `shared/backlog/` exists as a shared-only store defined in `rules/fusion-workbench-conventions.md` `## Backlog entries`, and the playmaker maintains it under a stated mandate with `OUT_BACKLOG` emitted to it — no seventeenth agent was created, which was the load-bearing half of "with no new agent". Verified by the reconciler at 260813-1545 by running `bin/fusion-paths playmaker` and reading `agents/playmaker.md`; the agent roster is still sixteen.
