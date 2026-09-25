# May the orchestrator file a work item when the user instructs it?

---
**Domain:** code
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260812-0254_*_does-fusion-need-a-backlog-store-and-a-maintainer-that-anticipates-circles.md, 260920-2151-sieben-neue-defekte-selbstaendig-abarbeiten.md

---

## Question

`rules/fusion-workbench-conventions.md` `## Backlog entries — work items` states one surviving bound on the store: no agent originates a work item; the user files, by hand or through `/fusion:memo`. `agents/orchestrator.md` `## Scope` repeats it as "You never file one, and you never author an item's Directive prose", and `## Work items` notes that none of the maintenance operations adds a job to the store, which is what keeps the bound intact. On 2026-09-20 the user asked the orchestrator in chat to file a work item naming seven defects, and the orchestrator reached it through `/fusion:memo`'s idea route, which is the user's surface. The user then ruled that the orchestrator may file a work item on instruction at any time. The bound has to say what it now protects: the agent's initiative, not the act of writing the file.

## Options

1. **The orchestrator files a work item at the user's word, carrying the user's words as the Directive.** The bound narrows from "no agent originates a work item" to "no agent originates a work item on its own initiative": what an agent finds is still an issue or a decision record, and an item exists only because the user said so, but the write may be the orchestrator's, in the same shape `/fusion:memo` produces.
   - Pros: the user's instruction in chat is already the filing act; routing it through a skill body adds a step and nothing else. The item's provenance stays `**Filed by:** user`.
   - Cons: the Directive prose is typed by the orchestrator from the user's words, so a paraphrase can enter where a verbatim memo capture would not; the rule text must say the words are the user's.
2. **Keep the bound as it stands; the orchestrator invokes `/fusion:memo` for the user.** No rule text moves; the orchestrator runs the skill body when asked.
   - Pros: no surface changes.
   - Cons: the bound's sentence "you never file one" is then false in practice, and a reader of the prompt learns the rule from a sentence the sessions do not follow.

## Constraints

- An item is still never filed on an agent's finding: a defect is an issue, a choice point a decision record.
- The Directive carries the user's words; the orchestrator adds no scope of its own.
- `rules/*.md` and `agents/*.md` are bounded surfaces; the rewording lands inside their head-room or is paid for in the same file.

## Recommendation

Option 1, which is what the user ruled.

---
Answered: this record `## Options` option 1 — the orchestrator may file a work item whenever the user instructs it, with the user's words as the Directive and `**Filed by:** user`; what an agent finds on its own stays an issue or a decision record; ruled by user, Kai Stalmann <ks@qantr.com>.

---
Implemented: `rules/fusion-workbench-conventions.md` `## Backlog entries — work items` — the narrowed bound stands there and in `agents/orchestrator.md` `## Scope` and `## Work items`, `README-agents.md` `## Invariants` and `docs/working-model.md`, landed in the commit that carries this line.
