# Does a non-interactive playmaker run perform the confirm-gated backlog operations?

---
**Domain:** code
**Status:** open
**Filed by:** shaper (anticipated-circle mode)
**Cross-references:** `circles/260813-0858-playmaker-maintains-backlog-store/_a_circle.md`; `shared/issues/260813-0825_*_the-playmaker-is-charged-with-backlog-upkeep-and-holds-no-write-key-to-the-store.md`; `shared/decisions/260812-2043_*_who-writes-the-recommended-marker-on-a-backlog-entry.md`; `agents/playmaker.md` `## Who dispatches playmaker`

---

## Question

The Circle's Directive gates splitting, merging and closing a backlog entry on a user
confirmation obtained inside the same run, while leaving marker renames autonomous. The
playmaker has two dispatch paths and only one of them can carry a confirmation. Under
`/fusion:next` the user is present and the skill is interactive. At Phase 4 the
orchestrator dispatches the playmaker as a sub-agent after a Circle closes, and a
sub-agent has no direct question channel to the user. So a Phase 4 run meets an entry that
should be split, and nothing in the Directive says what it does about it. The question has
to be settled before the plan, because it decides whether the playmaker needs a
proposal-return path at all, and a proposal-return path is a shape the plan would have to
build rather than a detail it could fill in.

## Options

1. **Confirm-gated operations happen only on the interactive path.** A Phase 4 run ranks,
   regenerates the portfolio, and renames markers, and it leaves splits, merges and
   closures for the next interactive run.
   - Pros: nothing new is built. The gate means what it says, and the existing portfolio
     section is already where a proposed split is recorded.
   - Cons: maintenance then depends on the user running `/fusion:next`, and the run that
     is best placed to notice a stale entry is the one that cannot act on it.
2. **A Phase 4 run returns its proposals to the orchestrator, which proxies them to the
   user.** The same shape the shaper uses when dispatched as a sub-agent.
   - Pros: the confirmation reaches the user on both paths, so the behaviour is one
     behaviour rather than two.
   - Cons: it puts a backlog question in front of the user at the moment a Circle closes,
     which is not what that gate is for, and it adds a return protocol to an agent whose
     value is that it is advisory and cheap.
3. **Marker renames are the whole of the Phase 4 mandate, stated explicitly.** Same
   behaviour as option 1, but written into the prompt as a deliberate split of the mandate
   by dispatch path rather than as a consequence of the missing channel.
   - Pros: a reader of the prompt learns the rule instead of inferring it from a tool
     absence, which is the failure the parent issue record was filed about.
   - Cons: two mandates for one agent is a thing to keep true in four places, and the
     surfaces list in the parent issue record grows.

## Constraints

- The confirmation gate itself is settled and is not reopened by this record. The user
  answered it: marker renames autonomous, the other three operations confirmed in the same
  run.
- Whatever is chosen is stated in `agents/playmaker.md` in the same words its dispatch
  description uses, per the acceptance criteria of the parent issue record.
- The playmaker never dispatches another agent and never invokes a skill. Any option that
  needs those is out of bounds.

## Recommendation

Options 1 and 3 differ only in whether the rule is written down, and it should be written
down, so option 3 is option 1 done properly. Option 2 should be weighed against how often a
Phase 4 run would actually find backlog work worth interrupting a closure for. If the
answer is rarely, the proposal-return path is machinery built for a case that does not
arrive.

---
Answered:
Implemented:
Deferred:
Superseded by:
