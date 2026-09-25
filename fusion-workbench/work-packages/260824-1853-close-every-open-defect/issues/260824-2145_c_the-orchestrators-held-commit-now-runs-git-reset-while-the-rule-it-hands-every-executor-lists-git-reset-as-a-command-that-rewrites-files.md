The orchestrator's held commit now runs `git reset` while the rule it hands every executor lists `git reset` among the commands that "rewrite files outside the named scope"
---
`011cc92` closed `260824-2056_*_the-new-index-comparison-unstages-a-siblings-paths-outside-the-commit-lock...` by making the held command `git reset -q && git add … && git commit` (`agents/orchestrator.md:621-623`), which is a correct fix: a mixed reset writes the index and no working-tree file, and every index write is now inside the lock. But `:574`, the rule the orchestrator writes into every executor dispatch, reads: "**No whole-tree git command.** `git stash`, `git checkout .`, `git reset`, `git clean`, `git restore .` rewrite files outside the named scope, including a sibling executor's in-flight edits". That sentence is false for bare `git reset` (it is true for `--hard`), and the orchestrator now depends on its being false two hundred lines later. A reader who checks step 5 against the executor rule finds the orchestrator running a command it calls file-rewriting.
---
**Filed by:** coderev (person half absent: the installed plugin at `$FUSION_PLUGIN_ROOT` carries no `bin/fusion-identity`, so attribution was dropped rather than composed)

Scope: `agents/orchestrator.md:574` against `:621-623`. Range `01964e4..13aaa85`.

Fix direction: at `:574` write `git reset --hard` (or "`git reset` with `--hard` or a pathspec-free `--mixed` on a shared index") and say the plain form is the orchestrator's alone, inside the lock; or keep the ban as written and state at step 5 why the orchestrator is exempt. Prose only.

Severity: Low.

---
Resolved: fixed — the executor rule bans `git reset --hard` and says the plain form in step 5 writes the index only and is the orchestrator's alone, inside the lock; `agents/orchestrator.md:574`
