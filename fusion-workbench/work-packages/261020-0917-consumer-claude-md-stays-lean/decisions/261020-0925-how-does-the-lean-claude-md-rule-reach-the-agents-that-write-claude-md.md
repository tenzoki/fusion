# How does the lean-`CLAUDE.md` rule reach the agents that write a project's `CLAUDE.md`: the whole convention file, a short section in the always-on conventions, or a new conditional rule file?

---
**Domain:** code
**Filed by:** implementation-planner, Kai Stalmann <ks@qantr.com>
**Cross-references:** 261020-0916-lean-claude-md-rule-reaches-no-agent-that-writes-claude-md.md, 261020-0835-why-a-consumers-claude-md-grows-unchecked.md, 260916-1006_*_how-does-a-consuming-project-bring-its-claude-md-to-the-lean-convention-when-the-curator-asks-a-different-question.md, 261020-0917-consumer-claude-md-stays-lean.md

---

## Question

`rules/context-lean-claude-md.md` says what a project's `CLAUDE.md` may hold. `bin/fusion-rules` emits it to no agent. So the planner, the implementers, the document-editor and the reviewer write and judge `CLAUDE.md` without it, and in krk that let plan steps add about 87 KB. The rule has to reach those agents through `bin/fusion-rules`, which is what the issue's acceptance line asks for. Each way of doing that costs bytes on the dispatch-path bound, and that bound has zero head-room. The choice binds every later edit to the always-on rule set, so it is recorded here rather than settled inside one plan.

Measured at HEAD `4f17492a` from this repository's root, by the same summation `hooks/lib/__tests__/rules-emission-golden.test.ts` performs. The figure is slack under each row of `hooks/lib/__tests__/fixtures/dispatch-path.baseline`: analyst 738, code-implementer 1 141, consultant 1 512, policy-curator 1 724, document-editor 1 100, data-implementer 1 043, orchestrator 3 719, implementation-planner 821, state-auditor 1 082, reviewer 519, requirements-designer 932.

## Options

1. **Emit `rules/context-lean-claude-md.md` whole** to implementation-planner, code-implementer, data-implementer, document-editor and reviewer.
   - Pros: the full criterion, worked examples included, reaches the agents. No restated text.
   - Cons: the file is 17 060 bytes. Each of those paths would go about 16 KB over its row, against slack between 519 and 1 141. It cannot land without a cut of at least 16 KB on each path, or a ruling that raises a bound which has no event for growth (the fixture header, `THE GAP IN THE RULE`). It also changes five role keys, which means new `ROLES` entries in the golden test and a regenerated golden.
2. **A short section in `rules/fusion-workbench-conventions.md`** (the always-on core every agent loads). It says what `CLAUDE.md` holds, where topic-bound content goes instead (the module header, a project rule file loaded through the manifest, the decision record), that a plan step writing `CLAUDE.md` names why its content binds every session, and it cites the full test in `rules/context-lean-claude-md.md`. The draft measures 644 bytes. It is paid for in the same shared component by deleting `## Rule-file provenance` (704 bytes). That section is a second pointer to `rules/rule-file-provenance.md`, which the authoring-home table at the head of the same file already names, with the same trigger ("read when writing a rule file"). Net −60 bytes on all eleven paths.
   - Pros: one rule, in the file every agent already loads, so it reaches every current and future writer. No role key changes. It fits under the zero-head-room bound with no ruling.
   - Cons: a third statement of the convention's core (beside `context-lean-claude-md.md` and the curator's criterion pointer), kept short so that it cites rather than restates. The deleted section's sentence "Read it before you create or edit any file under `rules/`" survives only as the table row.
3. **A new short rule file** (for example `rules/claude-md-placement.md`, about 750 bytes with its provenance header), emitted conditionally to the five writing agents.
   - Pros: charges only the agents that write the file.
   - Cons: about 750 bytes against the reviewer path's 519 bytes of slack, so a cut is still needed on that path. Five role keys change, so the golden test needs new `ROLES` entries and the golden is regenerated. A new agent that writes `CLAUDE.md` does not receive the rule until someone adds it to the list. That is the omission the issue records.

## Constraints

- The dispatch-path bound stays at zero head-room. A shared component's addition is offset once in a shared component, or once per path (`hooks/lib/__tests__/rules-emission-golden.test.ts`, `dispatchBoundMessage`).
- The issue's acceptance line asks that the rule appears in `bin/fusion-rules` output for the writing agents. Text in their prompts alone does not meet it.
- The rule names no target size and decides no topic: the topic question is a reader's judgement (`260916-1126_*_may-the-drift-check-report-weight-when-it-cannot-decide-topic.md`).

## Recommendation

Option 2. It is the only option that lands under the bound without a ruling. It reaches every agent, including the ones the issue did not list (analyst, requirements-designer and the orchestrator also propose `CLAUDE.md` text). It also keeps the full criterion where it is authored, with the short section only pointing at it.
