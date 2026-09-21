The memo skill writes `**Mode:** autonomous` "when the user's own content supplies" it, which is the prose reading the decision rejected
---
`skills/memo/SKILL.md` `### Work item` (line 127 at `8ef78ffc`): "`**Domain:**` and `**Mode:** autonomous` are optional and belong there only when the user's own content supplies them." For `**Domain:**` that test means the user named `code` or `data`. For `**Mode:**` the memo's argument is the directive paragraph itself, so a paragraph saying "selbständig ausführen" or "ohne Rückfrage" satisfies "supplies", and the skill writes the field from the directive's prose. `rules/fusion-workbench-conventions.md` `## Backlog entries — work items` forbids exactly that ("never from the directive's prose"), and `260921-0842_*_how-does-a-work-item-tell-the-orchestrator-to-work-it-without-asking.md` rejected option 2 because "the trigger is a reading, not a fact, and two readers gave two answers to the same store". The rule and the skill sit on different dispatch paths; the skill body is what runs at filing.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260921-0842_*_how-does-a-work-item-tell-the-orchestrator-to-work-it-without-asking.md, 260921-1035-reviewer-mode-autonomous-field-against-its-decision.md

Severity: Medium. Scope: `skills/memo/SKILL.md` only.

Acceptance: the sentence states the test for `**Mode:**` separately from `**Domain:**`: written when the user names the mode (the word `autonomous`, or asks for the field by name), and never from what the paragraph asks for in other words, citing the conventions paragraph. `cd hooks && npm test` green; the surface-growth golden re-approved if the byte count moves.
