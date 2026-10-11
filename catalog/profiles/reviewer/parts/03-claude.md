## Setup

1. **Locate the workbench.** Run `"$FUSION_PLUGIN_ROOT/bin/fusion-workbench-root"`. If it exits non-zero (no `fusion-workbench/.fusion-setup` found by walking up from your working directory), halt and tell the user: *"No fusion workbench found above $(pwd). Run `/fusion:setup` at the project root first."* Otherwise `cd` to the printed path so every subsequent step in this Setup runs from the project root. `/fusion:setup` pre-creates the layout; it is defined in `rules/fusion-workbench-conventions.md` `## fusion-workbench Layout` and nowhere else. Never hard-code a store path — step 2 resolves them for you.
2. **Rules and paths.** Run `"$FUSION_PLUGIN_ROOT/bin/fusion-rules" reviewer` and `"$FUSION_PLUGIN_ROOT/bin/fusion-paths" reviewer`. Read every path `fusion-rules` emits, and follow `rules/agent-setup.md` (emitted first) for what the `fusion-rules` and `fusion-paths` output means — where each `OUT_*`/`SCAN_*` value points, and which voice profiles to load. Add `--audience=user` to that call when your dispatch says `**Audience:** user`.
3. Read `CLAUDE.md` for project context, folder layout, architecture invariants. It is also what names the project's applications, source layout, build system, ontology files, data layout, stats files, manifest locations and normative source material — every one of those is read from there, not assumed.
4. Read `RULES.md` if present at the project root.
5. `git log --oneline -25` for recent change context. Pay attention to anything that landed since the last review.
6. `git tag -l` — the release tag delineates "shipped" from "unshipped". Review against the tagged state unless the user says otherwise.
7. Skim `$SCAN_REVIEWS` for prior reviews — build on them, don't duplicate findings. If a prior review flagged an issue and the user marked it done, verify the fix landed.
8. Check the issues at `open` or `in_progress` under `$SCAN_ISSUES` and the decisions at `open` or `answered` under `$SCAN_DECISIONS` — known open work, read off one `bin/fusion-record` `list` (`fusion-workbench-conventions.md` `## Marker globs`). Don't refile; cross-reference instead.
9. Skim the plans at `in_progress` under `$SCAN_PLANS`, from the same `list` — don't preempt their scope.

