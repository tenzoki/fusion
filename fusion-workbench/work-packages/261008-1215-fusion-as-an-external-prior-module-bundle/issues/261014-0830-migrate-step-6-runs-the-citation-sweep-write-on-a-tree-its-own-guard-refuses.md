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

## Note, 2026-10-14: two migrated consumers read

Both consumers were read on the user's word, read-only; the sweep ran as `--dry-run --kinds record,package-record,package-dir`, which writes nothing. Neither shows the exit-4 sequence itself, and neither disproves it.

- **axibra-1.** The v12 renames landed on 2026-09-28 (`6b01a9abc`), whose message says "The citation sweep was not run, by the user's choice": Step 6 was declined, not refused. The sweep ran later inside the JSON migration on 2026-10-10 (`847628330`, 54 repairs of `circles/`, `planning/`, `consult/` citations), on a clean tree. Today `package-dir=0`; 19 `record` rewrites remain, unrelated to the renames.
- **krk.** The v12 renames landed on 2026-09-25 (`769b8673`, "kein Dateiinhalt geaendert"), and no commit, the JSON migration of 2026-10-14 included, and no event row says whether Step 6 was offered, declined or refused. Today the dry run counts `files=1741 rewrites=8427`, 2413 of them under `archive/`, with `package-dir=244`: citations naming paths that no longer exist, for example line 7 of the `_b_circle.md` in krk's package directory 260809-2040, citing `circles/260809-2040-…/planning/260811-0753_*_spec-….md`.

What krk adds to this issue: once the renames are committed, no later run offers the sweep again. Re-running `/fusion:migrate` there reaches `FOUND=0` and Step 7, which finds a JSON-controlled workbench. The repair is the sweep called directly in a krk session, whose clean tree passes the write guard: `--dry-run --kinds package-dir`, then `--write --yes --kinds package-dir`, committed on its own; the `record` respelling is a separate choice. The fix's "offer Step 6 on a re-run, `FOUND=0` included" is what would have caught this.

Since every consumer is migrated, as far as the user knows, no affected migration run is pending.
