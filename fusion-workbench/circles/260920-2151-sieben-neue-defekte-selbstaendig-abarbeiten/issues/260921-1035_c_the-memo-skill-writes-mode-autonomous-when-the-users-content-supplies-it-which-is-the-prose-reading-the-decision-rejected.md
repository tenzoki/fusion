The memo skill writes `**Mode:** autonomous` "when the user's own content supplies" it, which is the prose reading the decision rejected
---
`skills/memo/SKILL.md` `### Work item` (line 127 at `8ef78ffc`): "`**Domain:**` and `**Mode:** autonomous` are optional and belong there only when the user's own content supplies them." For `**Domain:**` that test means the user named `code` or `data`. For `**Mode:**` the memo's argument is the directive paragraph itself, so a paragraph saying "selbständig ausführen" or "ohne Rückfrage" satisfies "supplies", and the skill writes the field from the directive's prose. `rules/fusion-workbench-conventions.md` `## Backlog entries — work items` forbids exactly that ("never from the directive's prose"), and `260921-0842_*_how-does-a-work-item-tell-the-orchestrator-to-work-it-without-asking.md` rejected option 2 because "the trigger is a reading, not a fact, and two readers gave two answers to the same store". The rule and the skill sit on different dispatch paths; the skill body is what runs at filing.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260921-0842_*_how-does-a-work-item-tell-the-orchestrator-to-work-it-without-asking.md, 260921-1035-reviewer-mode-autonomous-field-against-its-decision.md

Severity: Medium. Scope: `skills/memo/SKILL.md` only.

Acceptance: the sentence states the test for `**Mode:**` separately from `**Domain:**`: written when the user names the mode (the word `autonomous`, or asks for the field by name), and never from what the paragraph asks for in other words, citing the conventions paragraph. `cd hooks && npm test` green; the surface-growth golden re-approved if the byte count moves.

---
Resolved: no change to `skills/memo/SKILL.md`. The user ruled in chat on 260921 that `/fusion:memo` may set `**Mode:** autonomous` from the user's own text: the memo body takes the user's words at filing, so a field it writes from them stands on the user's word, which is the ownership sentence's condition; what the decision `260921-0842_*_how-does-a-work-item-tell-the-orchestrator-to-work-it-without-asking.md` rejects is a session reading autonomy out of a directive's prose after filing, not the user supplying the field when filing. Ruled by user, Kai Stalmann <ks@qantr.com>; closed by the orchestrator in the commit that carries this line.
