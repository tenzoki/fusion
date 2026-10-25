The first line is the workbench's format. `"state":"json-control"` goes on, with the three blocks of `## On a JSON-controlled workbench` at Steps 3, 4 and 7. `"state":"legacy"` stops here, before anything moves: tell the user the workbench is legacy (no `workbench.json`: its control data is Markdown), which this version reads only once it has been migrated: run `/fusion:migrate`. Any other line, or none, stops it too: quote it.

**Read that file in full before Step 2**, the way an agent reads every path `fusion-rules` emits: its record-versus-live-state split is what decides which workbench entries this workflow must preserve rather than discard. If the block prints `UNRESOLVED` or the file as not read, say so and continue — the tier tables below still apply, but the classification behind them is then unread and is not written from memory (`bin/fusion-source-root`'s header, exit 2).

Hold the emitted `KEY=value` values for the rest of the workflow. `$WORKBENCH` is absolute; everything else is workbench-relative. On a non-zero exit from `fusion-paths`, read the code — it says whose fault it is (full table in `rules/fusion-workbench-conventions.md` `## Path Resolution` → Exit codes):

- **Exit 1** — no workbench above `pwd`. Halt: there is nothing to archive. Tell the user to run `/fusion:setup` at the project root.
- **Exit 4** — an internal error in `fusion-paths`. The user's workbench is fine; do **not** send them anywhere in it to repair something. Report it as a fusion bug and stop.

**A `SCAN_*` value may name several directories, so run every tier glob once per path in it** — `for p in $(printf %s "$SCAN_PLANS"); do … "$WORKBENCH/$p" …; done`, never once against the whole value as if it were a directory name, and never as a bare `$SCAN_PLANS`, which zsh does not word-split. Why it may is `rules/fusion-workbench-conventions.md` `## Path Resolution` → invariant 2. `$SCAN_FORUM` is always single.
