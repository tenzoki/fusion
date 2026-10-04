Four migrate texts at 13.0.0 describe a rename-only pass, a required repair or an open window
---
At 13.0.0 `/fusion:migrate` runs the store rename and then, in Step 7, the JSON migration, which rewrites live narratives and needs no repair. Four shipped texts still say otherwise.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Cross-references:** 261001-1804_*_plan-fj04-the-migration-of-a-legacy-workbench-proven-on-copies.md, 261004-1807-reviewer-fj04-closing-pass-over-the-legacy-migration.md

**Evidence** (at `9232314a`).
1. `skills/migrate/SKILL.md` frontmatter `description`: "Directory renames only; no record is rewritten … repairs the records one finding at a time and migrates". Since step 12d the repairs are optional, and Step 7 rewrites live narratives.
2. `README.md:28` (edited in `900d1f5c`): "`/fusion:migrate` … moves directories only and rewrites no record".
3. `README-agents.md:249`, the `/fusion:migrate` row: "Directory renames only, no record rewritten". It does not name the JSON phase.
4. `skills/migrate/SKILL.md` Step 2's guard prints `WINDOW=open` for any major of 12 or more, and its lead-in says "The window opens and closes at a major". Since 13.0.0 every other text says the window closed (`docs/upgrading-to-v12.md`, `README.md:28`, `skills/setup/SKILL.md`). The token means "the installed copy reads the v12 names". `codec/src/__tests__/install.test.ts` asserts `WINDOW=open` at 13.0.0.

**Acceptance.** Each of the four states what 13.0.0 does: the rename, then the JSON migration on a yes, repairs optional. The guard's key no longer reads as the v12 window, with `install.test.ts` and the skills golden following. No other text changes.
