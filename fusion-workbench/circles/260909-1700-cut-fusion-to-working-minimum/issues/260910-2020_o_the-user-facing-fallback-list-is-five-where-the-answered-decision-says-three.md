The user-facing fallback list is five where the answered decision says three
---
Step C7 added `--audience=user` to `bin/fusion-rules` and kept the agent-name case as the fallback. The answered decision and the C7 commit message both state that fallback as three roles — orchestrator, editor, curator. The list on the tree is five: `orchestrator|consultant|shaper|editor|curator`. Nothing is broken; two records describe the code wrongly.
---
**Filed by:** reconciler, Kai Stalmann <ks@qantr.com>
**Cross-references:** `260909-1843_*_what-are-the-conditional-rule-emissions-keyed-on-once-they-are-not-keyed-on-the-agent-name.md` (the decision, now `_i_`); `260909-1843_*_implementation-cut-fusion-to-a-working-minimum.md` step C7; `abf569b8`; `2a785ba2`

**Evidence, read at `07961552`.** `grep -n 'IS_USER_FACING_AGENT=1' bin/fusion-rules` returns
`orchestrator|consultant|shaper|editor|curator`. The same read at `7dde04a6`, the commit before C7,
returns `orchestrator|consultant|playmaker|shaper|editor|curator`, and at `abf569b8`, C7's own
commit, the identical six. C7 did not touch the list at all; C8 (`2a785ba2`) shortened it by one
when it deleted `playmaker`.

Against that, the decision record's `## Recommendation` says the agent-name case "becomes the
fallback for the roles that are user-facing unconditionally (orchestrator, editor, curator), so no
path loses the rule by default and only a *merged* path gains the ability to run without it", its
`Implemented:` line repeats the three, and `abf569b8`'s message says "orchestrator, editor and
curator are user-facing by nature and receive it with no parameter".

**What is and is not wrong.** The emission is a superset of what was ruled, so no dispatch loses the
rule and no measured budget moved: `consultant` and `shaper` were receiving `user-facing-output.md`
before C7 and still do. The cost is a reader. Anyone deciding whether a `consultant` dispatch needs
`**Audience:** user` will read the record or the commit, find three names, and conclude the
parameter is required where it is not. The same reader is the one C7 was written for.

**Which of the two is right is not decided here.** Either the list narrows to the ruled three, which
makes `consultant` and `shaper` depend on the parameter and is a behaviour change on two live paths,
or the record and the commit are annotated to say five and why the two extra names stayed. The first
is a change with a measurable effect and belongs to a step; the second is a text repair.

**Acceptance.** `grep -n 'IS_USER_FACING_AGENT=1' bin/fusion-rules` and the decision record's
`Implemented:` line name the same set, whichever set that is, and the reason any name beyond the
ruled three is on the list is written where the list is.

---

Partial (260910, coder, the stale-text pass): **half done, and the record stays open.**

**Which of the two is the error: the records.** The evidence this record already assembled
settles it without a new measurement — the list carried six at `7dde04a6`, six at `abf569b8`
(C7's own commit, which never touched it) and five after C8 deleted `playmaker`, so the
three-name reading was never what the code did. Narrowing to three is not a text repair: it
would put `consultant` and `shaper` behind a `--audience=user` line nobody passes on their
live paths. `consultant` is user-initiated only and answers the user in chat with no
orchestrator between them; `shaper` runs user-direct and its clarification rounds are relayed
to the user verbatim. Both are user-facing by nature, which is exactly the criterion the block
is keyed on, and both would lose the style contract on every dispatch that does not remember
to ask for it.

**Done:** the reason any name beyond the ruled three is on the list is now written where the
list is — the comment above the `case` in `bin/fusion-rules` names all five, says the records
under-counted, and says why narrowing would be a behaviour change.

**Not done, and why:** the acceptance also requires the decision record's `Implemented:` line
to name the same set. That record is
`260909-1843_*_what-are-the-conditional-rule-emissions-keyed-on-once-they-are-not-keyed-on-the-agent-name.md`,
and this pass was dispatched with a standing constraint against editing any workbench record
except the four it was closing. Annotating it is one edit — the `Implemented:` line and the
`## Recommendation` paragraph both say "orchestrator, editor and curator" and both want a
clause saying five, and why — and it belongs to whoever holds that permission.
