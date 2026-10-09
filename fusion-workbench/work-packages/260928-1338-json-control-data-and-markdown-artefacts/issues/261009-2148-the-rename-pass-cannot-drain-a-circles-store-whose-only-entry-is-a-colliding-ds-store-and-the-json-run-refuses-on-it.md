The rename pass cannot drain a `circles/` whose only remaining entry is a colliding `.DS_Store`, and the JSON run then refuses on that name
---
On a real v12.2.1 workbench (FJ05 step 15, foreign workbench 1), `circles/` held two containers already present under `work-packages/` (with only empty subdirectories) and an untracked Finder `.DS_Store`; `work-packages/.DS_Store` also existed. `/fusion:migrate` Step 4, run verbatim from the installed 13.0.0 copy at `f2cc68f0`, moved the seven empty subdirectories and reported `collisions=1` for `.DS_Store`, so `rmdir` left `circles/` standing ("is not empty and stays"). The re-survey prints `FOUND=1 COLLISIONS=1` again on every run: the pass cannot converge. Step 7's `bin/fusion-migrate run` then exits 5, "the v11 store names stand (circles); rename them first with /fusion:migrate's rename pass", which routes back to the pass that cannot finish. The only way out is deleting `circles/.DS_Store` by hand, which neither the skill nor the helper names.
---
**Filed by:** analyst, Kai Stalmann <ks@qantr.com>

Evidence: `261009-2148-fj05-re-migration-of-one-real-workbench-at-f2cc68f0.md` `### The v12 rename`, and its log `01-rename-pass.log`. The `.DS_Store` is untracked (the survey's `UNTRACKED=1`), so no commit and no diff carries it; it is OS metadata, not a record, and `move_one`'s never-overwrite rule is right for records.

Why it matters: every macOS user who opened `circles/` in Finder carries such a file. The user's own trial migration of the same project reached the JSON run, so the hand delete is what a user does without being told.

Acceptance:
- On a fixture whose `circles/` holds only an untracked `.DS_Store` and `work-packages/.DS_Store` exists, Step 4 followed by Step 2's survey prints `FOUND=0`, or Step 2 names the file and the one command that removes it.
- `bin/fusion-migrate run` on that fixture either proceeds or its exit-5 message names the file and the way out, not only the rename pass.
- No tracked file and no record is ever deleted or overwritten by the fix.
