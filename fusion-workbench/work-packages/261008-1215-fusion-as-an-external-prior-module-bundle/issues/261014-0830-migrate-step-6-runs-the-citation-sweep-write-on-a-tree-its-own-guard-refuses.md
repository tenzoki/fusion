/fusion:migrate Step 6 runs the citation sweep's write on a tree its own guard refuses
---
Step 6 of `skills/migrate/SKILL.md` runs `"$SWEEP" --write --yes --kinds "$K"` straight after Step 4's renames, and says the sweep's output "stays unstaged beside the staged renames". The sweep's write guard refuses with exit 4 (`dirty-tree`) when any uncommitted change names a corpus file. The staged renames name the moved record files. In `MODE=plain` it refuses with exit 4 (`not-a-git-work-tree`). Step 6 handles exits 3 and 6 and never exit 4, and nothing in the flow stops for the commit before Step 6. A `FOUND=0` re-run after the user commits jumps to Step 7, so Step 6 is never offered again.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Cross-references:** `261014-0830-reviewer-closing-pass-over-the-prior-module-bundle-package.md`

Evidence:

- `skills/migrate/SKILL.md` `## Step 6 — Sweep the citations`: the write command, and "which stays unstaged beside the staged renames".
- `skills/migrate/SKILL.md` `## Step 2` (the `FOUND=0` bullet): "Ask nothing and go to Step 7".
- `hooks/citation-sweep.ts:921-927`: `if (opts.write) { const why = refusal(root, extra, files); ... return 4; }`; `:616-646`, `refusal()`: `not-a-git-work-tree`, `workbench-untracked`, `dirty-tree` ("uncommitted changes name … files this run reads").

The guard was confirmed by reading. The staged-rename case was not executed: inference, from the porcelain-based `dirtyCorpusPaths` over the renamed record files. The delegated pass's read of `porcelainPaths` agrees.

Fix direction: end the rename half at Step 5 with "commit the renames, then run `/fusion:migrate` again"; offer Step 6 on a re-run whose renames are committed, `FOUND=0` included; name exit 4 with its stderr line; skip the write offer in `MODE=plain`.

Acceptance: on a fixture v11 workbench in git, the documented sequence reaches a successful `--write` with no exit 4. On a plain workbench, Step 6 says why no write is offered.

## Note, 2026-10-14

Prior, relayed by the user: this must be fixed before the next affected migration run. The failure sequence is so far derived from the code; a reproduction and a regression test are still missing and belong to the fix.
