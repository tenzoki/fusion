The reach ruling's sweep corrected five statements and left three standing, one of them in the orchestrator's own role line

---
`e422bf99` deleted the orchestrator's `tools:` allowlist and replaced the four prose dispatch bans with one positive always-on rule. Its message names five statements corrected as newly false. Three more are false at HEAD and were not touched.

---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>

**The three.**

`agents/orchestrator.md:22` — "You are the only agent that dispatches other agents." This is the orchestrator's own Role paragraph, in the file the commit edited. The same session loads `rules/fusion-workbench-conventions.md` `## Dispatching another agent`, which says an agent may dispatch another, so the orchestrator holds both statements at once on every dispatch.

`README-agents.md:45` — "**Dispatch is the orchestrator's monopoly.** Only `orchestrator` invokes other agents via the `Agent` tool. The constraint is **prose-enforced** in each non-orchestrator agent's prompt — sub-agents that identify work for another agent **recommend** the dispatch in their output (issue file, plan step, consultation report) but never call `Agent` directly." False three ways: the monopoly is dropped; the constraint was prose in four prompts of ten and `e422bf99` deleted all four, so it is now prose in none; and the same file states the opposite at line 264 ("**An agent may dispatch another operative agent.**") and at line 85. The parenthetical about the v2.8.1 `disallowedTools` rollback is still true and is the only part of the paragraph that is.

`docs/philosophy.md:27` — "The **orchestrator** is the only agent that dispatches others." This is the doc `/fusion:help` points at (`CLAUDE.md`, the `docs/` row), so it is the first long-form statement a user reads.

**Scope.** One agent prompt (charged to every orchestrator dispatch), one README, one shipped doc. All three are shipped text; none is a workbench record.

**Acceptance test.** `grep -rniE "only .?orchestrator.? (invokes|dispatches)|only agent that dispatches|dispatch is the orchestrator" CLAUDE.md README*.md agents rules docs skills` returns nothing outside `docs/upgrading-to-*`, and `README-agents.md:45` no longer claims a prose enforcement that no prompt carries. `cd hooks && npx vitest run lib/__tests__/reference-resolution-lint.test.ts lib/__tests__/surface-growth-bound.test.ts` stays green, the reference census re-approved if the edit moves a token.
