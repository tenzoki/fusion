Two of grant's named settings.md:88 branches have no test
---
`bin/fusion-tmp:156-162` codes the "repository rooted at $HOME" and "file not owned by the user" exceptions. The plan's Risks row "Grants in the wrong file" promises "each with a test"; `hooks/lib/__tests__/fusion-tmp.test.ts` covers outside-git (line 174) and the worktree (line 159) only.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Cross-references:** 261027-2252-plan-intermediate-files-in-project-tmp.md

Acceptance: `fusion-tmp.test.ts` gains a case with the git top equal to the scratch HOME (settings at `<root>/.claude/`), and, where the runner can create one, a main-checkout settings file not owned by the user (or the case is skipped with a stated reason).
