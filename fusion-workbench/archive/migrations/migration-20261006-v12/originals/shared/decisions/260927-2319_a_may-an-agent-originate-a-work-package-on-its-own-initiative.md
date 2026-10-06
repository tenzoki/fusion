# May an agent originate a work package on its own initiative?

---
**Domain:** code
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260920-2157_*_may-the-orchestrator-file-a-work-item-when-the-user-instructs-it.md, 260927-2304-fusion-dual-host-design-review.md, 260922-1059_*_is-a-record-in-issues-a-candidate-or-an-admitted-work-item.md, 260812-0254_*_does-fusion-need-a-backlog-store-and-a-maintainer-that-anticipates-circles.md

---

## Question

`rules/fusion-workbench-conventions.md` `## Work packages` states that no agent originates a work package on its own initiative: the user files, by hand, through `/fusion:wp`, or by instructing the orchestrator, and what an agent finds is an issue or a decision record. The dual-host design package in Prior (`docs/design/fusion-dual-host-boundary.md`, `fusion-dual-host-implementation-plan.md`, both 2026-09-27) gives a `work-package-manager` profile the job of selecting and forming work packages across a campaign and feeds package admission from a `candidates/` store. The review of that package (`260927-2304-fusion-dual-host-design-review.md` `## Recommendation` item 2) named the bound as broken and asked for a ruling before FH00. The ruling decides whether the bound stands, and with it what `260920-2157_*_may-the-orchestrator-file-a-work-item-when-the-user-instructs-it.md` narrowed the bound to.

## Options

1. **Agents originate work packages.** The bound goes. An agent that forms a package writes it with its own name in `**Filed by:**`, so provenance still says who, and the user's routes (by hand, `/fusion:wp`, the orchestrator on instruction) stay beside it. The four surfaces that state the bound are rewritten: `rules/fusion-workbench-conventions.md` `## Work packages`, `agents/orchestrator.md`, `README-agents.md` `## Invariants`, `docs/working-model.md`.
   - Pros: the dual-host design's campaign model needs it; a defect found in bulk becomes work without a chat round-trip; the user's role moves from filing to approving what runs.
   - Cons: a store that agents fill grows without a human's word per entry; approval of what runs has to be enforced elsewhere (`**Mode:**`, the orchestrator's approval rules) rather than at filing.
2. **The bound stands as narrowed on 2026-09-20.** The dual-host package routes admission through the user, and `work-package-manager` proposes rather than files.
   - Pros: no rule text moves; every package still exists because the user said so.
   - Cons: contradicts what the user wants the campaign model to do; the design package would be sent back on a bound the user does not hold.

## Constraints

- `**Filed by:**` keeps naming the party that wrote the record, agent or user, so a reader can tell the two apart (`rules/fusion-workbench-conventions.md` `### Who filed it`).
- `rules/*.md`, `agents/*.md` and `docs/` are bounded or documented surfaces; the rewording lands where the growth bound allows, or under the ruling in the sibling record filed the same minute on the growth bound.
- Whether a `candidates/` store is the admission route, or the `issues/` marker stays the classification (`260922-1059_*_is-a-record-in-issues-a-candidate-or-an-admitted-work-item.md`), is not decided here.

## Recommendation

Option 1, which is what the user ruled.

---
Answered: this record `## Options` option 1 — agents may originate work packages; the bound "no agent originates a work package on its own initiative" is withdrawn, and the record that narrowed it is superseded; ruled by user, Kai Stalmann <ks@qantr.com>.
