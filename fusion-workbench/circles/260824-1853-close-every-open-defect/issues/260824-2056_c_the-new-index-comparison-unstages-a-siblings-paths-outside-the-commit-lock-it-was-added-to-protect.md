The new index comparison unstages a sibling's paths outside the commit lock it was added to protect
---
`agents/orchestrator.md:621` (commit `d5c34cd`, step 12) adds, before the held `git add … && git commit`: run `git diff --cached --name-only`, and for any staged path the task's list does not name, `git restore --staged -- <absolute-path>`. Both commands run **before** `bin/fusion-commit-lock with` is entered on the next line, so the read of the index and the write to it are unserialised against another session's `with` on the same project, which is the one hazard `rules/commit-lock.md` exists for. The window is small and the consequence bounded (a sibling's just-staged path is unstaged and re-staged by them later), but the instruction is placed outside the mechanism whose whole point is that index writes happen inside it. The `Resolved:` note on the record this closed (`…the-orchestrators-next-commit-absorbed-them.md`) treats the comparison as settling the absorb case; it settles it for a lone session.
---
**Filed by:** coderev (person half absent: the installed plugin at `$FUSION_PLUGIN_ROOT` carries no `bin/fusion-identity`, so attribution was dropped rather than composed)

Fix direction: move the comparison and the `git restore --staged` calls inside the `bash -c '…'` the lock wraps, so index read, unstage, add and commit are one held sequence; or state in the same step that the comparison runs unheld and why that is accepted.

Severity: Low.
---
Resolved: fixed — the held command now begins with `git reset -q`, so the unstage, the add and the commit are one held sequence and the pre-lock `git diff --cached --name-only` only names a sibling's paths to the user; `agents/orchestrator.md` Phase 2 Step 3b step 5 (`git reset -q && git add … && git commit`)
