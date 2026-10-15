Migrate Step 7 still tells the agent to run two subcommands without the helper path
---
The fold-in made every Step 7 command spell `"$FUSION_PLUGIN_ROOT/bin/fusion-migrate"`. Two instructions to run something still name only the subcommand. In a fresh shell, a literal reading runs a command that does not exist.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Cross-references:** `261015-2223-reviewer-closing-pass-over-the-migrate-step-7-package.md`, `261015-1310-migrate-step-7-and-step-1-carry-shell-variables-across-separate-bash-calls.md`

**Evidence.** Both are in `skills/migrate/SKILL.md` `## Step 7 — Repair, then migrate to JSON control`:

- In the paragraph after the repair question: "After each applied repair run `repair --list` again".
- In `**Interrupted.**`: "the way out (`rollback` again or `rollback --end-fence`)".

The plan's step 2 says "Every command the skill runs spells `"$FUSION_PLUGIN_ROOT/bin/fusion-migrate"`". Case (h) in `hooks/lib/__tests__/store-name-migration.test.ts` checks only that `"$M"` is gone, so it cannot see these two. Probably an agent infers the prefix. This is low severity.

**Acceptance.** Both instructions spell the full helper path, or say "the same helper" so they are clearly not commands to type as written.
