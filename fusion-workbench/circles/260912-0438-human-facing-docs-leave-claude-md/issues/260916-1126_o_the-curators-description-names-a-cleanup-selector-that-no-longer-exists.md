The curator's description names `/fusion:cleanup --only claude-md`, a command form that no longer exists
---
`agents/curator.md`'s frontmatter `description` ends "or via `/fusion:cleanup --only claude-md`". `/fusion:cleanup` is commit and push under the commit lock and nothing else since 260910, and the `--only`/`--skip` selector vocabulary went with the pipeline; `skills/cleanup/SKILL.md` carries no `--only` token. The live command for this work is `/fusion:curate`.

The description is the text a dispatcher reads when choosing an agent, so it names an invocation nobody can perform.

**No gate sees it.** The enumeration lint's phantom check reads `/fusion:<name>` tokens only; `/fusion:cleanup` resolves to a real skill directory, and the `--only claude-md` suffix is not parsed by anything.

**Acceptance test:** `agents/curator.md`'s description names `/fusion:curate`, and `grep -c 'only claude-md' agents/curator.md` returns 0.
---
**Filed by:** planner, Kai Stalmann <ks@qantr.com>
Found while planning `260916-1126_*_implementation-human-facing-docs-leave-claude-md.md`; step 2 of that plan edits this file and carries the fix.
