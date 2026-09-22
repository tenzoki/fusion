The 11.11.0 help paragraph says the release "changes helper output only" while it changes a gate under `**Mode:** autonomous`, a cleanup split and two skill bodies' behaviour
---
`skills/help/SKILL.md:96`: "**Coming from an 11.10.0 install:** 11.11.0 changes helper output only and asks nothing of the user." The paragraph then lists six helper changes. The range `451bb312..bf515cad` also ships, none of them helper output:

- `57e2b7eb`: under `**Mode:** autonomous` the *Task involves `ontocoder`* gate is answered `proceed` instead of filed and skipped, a curator ledger is applied whole (`**Approved:** all`), and the held item's pause is confirmed by the instruction to claim another (`agents/orchestrator.md:383`, `:610`, `## Work items`). This is the one behaviour change a consuming project's user meets at a gate.
- `2bb9088a`: `/fusion:cleanup` now carries this checkout's `shared/checkouts/<id>.md` in a split (`skills/cleanup/SKILL.md:53`), where 11.10.0 called it live state no split names.
- `5f544591`: `/fusion:post` writes a draft file at the workbench root and moves it into the store (`skills/post/SKILL.md:52`, `:74`).
- `cfb70cc5`: `/fusion:news` never advances the read mark while an entry failed to render (`skills/news/SKILL.md:89`, `:95`).

The paragraph is the release's own description surface (`README-agents.md` `## Releasing`, the surfaces a release keeps coherent), and the sentence a user reads first about it is false. The paragraph the rotation dropped (11.8.0/11.9.0) was the one that told a user "ontology, structural change, destruction and ambiguity still file an open decision and skip", so the help topic now says nothing about the field's gate set at all.

Acceptance: `skills/help/SKILL.md` `### 4. Update`, the 11.11.0 paragraph, no longer reads "helper output only", names the gate change of `57e2b7eb` in one sentence and the three skill-body changes in one; `grep -c 'changes helper output only' skills/help/SKILL.md` prints `0`; `cd hooks && npm test` exits 0 (`skills/` head-room is 72 bytes at `bf515cad`, so the edit is net-neutral or names its cut).
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
Executor: `coder`. Found in the closing review `260922-1208-reviewer-closing-pass-over-the-51-issue-package-451bb312-to-bf515cad.md`; recommended before the tag of 11.11.0.
