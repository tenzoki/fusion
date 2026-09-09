# What are the conditional rule emissions keyed on, once they are not keyed on the agent name?

---
**Domain:** code
**Filed by:** planner, Kai Stalmann <kai@qantr.com>
**Cross-references:** `260909-1615_*_spec-cut-fusion-to-a-working-minimum.md` `### C7: Eight agent roles` makes this the enabling change of the roster cut and `### C8` supplies the byte arithmetic. `README-agents.md` `## Dispatch parameters` is the roster this answer extends. `260909-1843_*_implementation-cut-fusion-to-a-working-minimum.md` step C7 realises it.

---

## Question

`bin/fusion-rules` selects its seven conditional emissions with seven `case` statements on the
agent name (`IS_PROSE_AGENT`, `IS_DIAGRAM_AGENT`, `IS_CIRCLE_AGENT`, `IS_REVIEWER_AGENT`,
`IS_BOUND_AGENT`, `IS_DECISION_TRANSITION_AGENT`, `IS_USER_FACING_AGENT`). A merged role therefore
inherits the union of every conditional its inputs satisfied. Measured in C8's table, that puts
three of C7's four merges outside their budget before a byte of prompt text is written, and the
single largest contributor is `user-facing-output.md` at 10 884 bytes, inherited because one input
of each merge was user-facing.

## Options

1. **Key on the dispatch, through a parameter the agent already parses.** The agent passes what its
   dispatch prompt told it into its own `fusion-rules` call.
   - Pros: the mechanism exists — seven agents already parse `**<Keyword>:**` lines off a dispatch
     prompt, and the roster is authored in one place. No new concept.
   - Cons: the model performs the pass-through, so it can be omitted. Omission is a missing style
     rule, not a corrupt one.
2. **Key on the topic argument `fusion-rules` already takes.**
   - Pros: no new argument.
   - Cons: C6 removes the topic's only automatic source, and overloading a content selector with an
     audience question is two meanings on one parameter.
3. **Split the file so the merged path inherits only the half it needs.**
   - Pros: no keying change at all.
   - Cons: it is a cut disguised as a mechanism, it must be redone for each of the seven
     conditionals, and it does not answer the question C7 asks.

## Constraints

- The change must reach at least `user-facing-output.md`, or three of the four merges stop (spec C7
  acceptance criterion).
- `review-contract.md` must keep reaching the role that reviews; with `reviewer` surviving as a
  named role that stays an agent-name emission and needs nothing here.
- Whatever is added is measured by C8's bound on every path it touches.

## Recommendation

Option 1, applied to `IS_USER_FACING_AGENT` alone in this cut. `bin/fusion-rules` gains an optional
third argument `--audience=user`; the agent passes it when its dispatch prompt carries
`**Audience:** user` or when it was invoked top-level by the user, and omits it otherwise. The
agent-name `case` becomes the fallback for the roles that are user-facing unconditionally
(orchestrator, editor, curator), so no path loses the rule by default and only a *merged* path
gains the ability to run without it.

The other six conditionals are deliberately left keyed on the name: `bounded-dispatch.md` and
`decision-record-examples.md` lose recipients with C7 but no surviving merge is pushed over budget
by either, and changing seven keys to fix one measured overage is the additive thicket
`rules/critical-stance.md` §2 names. The scope of this answer is the measurement, not the pattern.

---
Answered: 260909-1843_*_what-are-the-conditional-rule-emissions-keyed-on-once-they-are-not-keyed-on-the-agent-name.md `## Question` — option 1, scoped to `user-facing-output.md`: an optional `--audience=user` argument to `bin/fusion-rules`, sourced from an `**Audience:**` dispatch parameter, with the existing agent-name case kept as the fallback for the three unconditionally user-facing roles. Ruled by planner under the spec's `## Open for Planner`; unrealised until step C7 of `260909-1843_*_implementation-cut-fusion-to-a-working-minimum.md` commits.
