Run `"$FUSION_PLUGIN_ROOT/bin/fusion-workbench-root"`. **If it exits non-zero, halt** and tell the user: *"No fusion workbench found above $(pwd). Run `/fusion:setup` at the project root first."* There is no workbench-less mode; a git-only log written into whatever directory the user happened to stand in is what this halt gives up.

Otherwise `cd` to the printed path, so every later step anchors at the project root, and resolve the stores:

```bash
"$FUSION_PLUGIN_ROOT/bin/fusion-paths" cadence
```

Read `WORKBENCH` (absolute), `OUT_MEMO` (where the digest goes) and `SCAN_HISTORY` (which directory holds session histories). `fusion-paths` reads a consumer's key set out of its own prompt and a skill is its own consumer (`rules/fusion-workbench-conventions.md` `## Path Resolution`), so naming the three keys here is what makes the resolver emit them. On a non-zero exit read the code (full table at that heading → Exit codes): **exit 1** — no workbench above `pwd`, halt as above; **exit 4** — a bug in `fusion-paths` rather than in the user's workbench, so report it and send them nowhere in it to repair anything.
