`fusion-identity`'s new no-git branch is untested, and two surfaces still define exit 1 as the unset-identity case alone
---
Commit `1ea8fed` (step 7) split `bin/fusion-identity`'s person half on `command -v git`: git absent from PATH now prints its own two lines and exits 1 (`bin/fusion-identity:150-155`), where before it fell into the not-a-work-tree branch and exit 4. The header's exit-1 row was extended to say so (`:29-35`). Two things did not move with it.

1. `hooks/lib/__tests__/fusion-identity.test.ts` still covers exit 1 only for unset `user.name` / `user.email` (`:122`); the no-git branch is verified by the coder's PATH-shim probe recorded in the step-7 history file and by nothing that runs again. The test file already builds a PATH (`pathWith()`), so a case with an empty-of-git PATH is cheap.
2. `rules/fusion-workbench-conventions.md` `### Who filed it` (`:496`) defines exit 1 as "a git work tree whose `user.name` or `user.email` is unset" and says "the condition is evaluated in the helper and stated here once"; `CLAUDE.md`'s `bin/fusion-identity` row says the same ("Exit 1 is the only code that means stop: inside a git work tree with `user.name` or `user.email` unset"). Both are now narrower than the helper. The instruction to the caller (halt, file nothing) is unchanged, so no agent does the wrong thing; but the rule claims to be the single statement of the condition and no longer is.
---
**Filed by:** coderev (person half absent: the installed plugin at `$FUSION_PLUGIN_ROOT` carries no `bin/fusion-identity`, so attribution was dropped rather than composed)

`rules/` is being edited by a concurrent coder at the time of filing; this record names the drift and does not touch the file.

Fix direction: one test case for the no-git PATH asserting exit 1, empty stdout and the "git is not on PATH" line; one clause in `### Who filed it` and in the `CLAUDE.md` row: "or a `git` that cannot be run at all".

Severity: Medium (an untested exit that halts every filing agent).
