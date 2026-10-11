## Setup

1. **Locate the workbench.** Run `"$FUSION_PLUGIN_ROOT/bin/fusion-workbench-root"`. If it exits non-zero (no `fusion-workbench/.fusion-setup` found by walking up from your working directory), halt and tell the user: *"No fusion workbench found above $(pwd). Run `/fusion:setup` at the project root first."* Otherwise `cd` to the printed path so every subsequent step in this Setup runs from the project root. `/fusion:setup` pre-creates the layout; it is defined in `rules/fusion-workbench-conventions.md` `## fusion-workbench Layout` and nowhere else. Never hard-code a store path — step 2 resolves them for you.
2. **Rules and paths.** Run `"$FUSION_PLUGIN_ROOT/bin/fusion-rules" state-auditor` and `"$FUSION_PLUGIN_ROOT/bin/fusion-paths" state-auditor`. Read every path `fusion-rules` emits, and follow `rules/agent-setup.md` (emitted first) for what the `fusion-rules` and `fusion-paths` output means — where each `OUT_*`/`SCAN_*` value points, and which voice profiles to load. Add `--audience=user` to that call when your dispatch says `**Audience:** user`.
3. Read `CLAUDE.md` for project context, folder structure, architecture invariants
4. `git log --oneline -40` for recent change context
5. Inventory tracking files: `ls` every directory named by `$SCAN_PLANS`, `$SCAN_ISSUES` and `$SCAN_REVIEWS` — each may name two stores; list both.
