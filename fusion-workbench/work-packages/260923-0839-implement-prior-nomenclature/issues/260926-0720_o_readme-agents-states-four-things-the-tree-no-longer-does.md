README-agents.md states four things the tree no longer does
---
Four sentences in `README-agents.md` describe behaviour that has since moved. The file is outside the policy-curator's remit, so the fix is `code-implementer` work. Found by the curator survey `260926-0720-curator-run.md`.
---
**Filed by:** policy-curator, Kai Stalmann <ks@qantr.com>

**Defects and evidence:**

1. `README-agents.md` `## Invariants`, the **Single orchestrator per project** bullet, says `/fusion:setup` Step 0c checks the active-session marker and warns. Setup has no Step 0c. The warning is the `concurrency` selector of `/fusion:check` (`skills/check/SKILL.md` `## concurrency`), which setup runs only when it is due, and that section itself says a session inside the 30-day window at an unchanged version never reaches it. Moved at `71c0c873` (2026-09-10).
2. The same section, the **An agent may dispatch another agent** bullet, names `/fusion:memo` as a route by which the user files a work package. Filing moved to `/fusion:wp` at `092e9c8b`; `skills/memo/SKILL.md` frontmatter says so, and `rules/fusion-workbench-conventions.md` `## Work packages` names `/fusion:wp`.
3. The `/fusion:check` row of the skills table says "Each ran check is stamped into `.fusion-setup`". Stamps go to `fusion-workbench/.check-stamps` (`skills/check/SKILL.md` `## Stamp what you ran`), moved at `421d0f89`.
4. `## The agents`, the **Writes** column, lists `history/` for `implementation-planner`, `code-implementer`, `data-implementer`, `state-auditor`, `consultant`, `analyst` and `document-editor`. `rules/fusion-workbench-conventions.md` `## Session history` closes that store to writes, and `grep -rn OUT_HISTORY agents skills` returns nothing.

**Acceptance test:** each of the four sentences states what the cited source states; `grep -n 'Step 0c\|stamped into .fusion-setup' README-agents.md` returns nothing.
