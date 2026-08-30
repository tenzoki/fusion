# The sweep's guard (a) does not check that an extra path argument is tracked

---
Guard (a) establishes that a damaged rewrite has one revert back by testing the work tree, not the
files it is about to write. A `<path>` argument naming a gitignored file is written with no way
back, and the guard reports nothing.
---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>

## The defect

`refusal()` in `hooks/citation-sweep.ts` checks three things: the workbench sits in a git work tree,
the workbench is tracked, and no pending change touches a file this run will read. For an extra
`<path>` argument it checks one thing only, that the path is inside the same work tree
(`path-outside-repo`). Being inside a work tree and being tracked by it are different properties,
and only the second gives the revert the guard's own header promises.

## Evidence

Measured 2026-08-31 on a real run. `bin/fusion-citation-sweep --write --yes` was pointed at 89 code
files in a consuming project; 79 were tracked and 10 sat under a gitignored build-output directory,
`codebase/go/dist-mac/`. All 89 were rewritten. The 10 carry no diff, appear in no `git status`, and
have no committed version to return to.

The consequence was harmless there, because build output is regenerated. It is harmless by luck
rather than by construction: the same run against a gitignored source directory, a vendored tree or
a working scratch file would be unrecoverable, and the census the user reads before saying `--yes`
does not distinguish the two.

## Acceptance

Either an extra path that is not tracked refuses the run the way an untracked workbench does, or the
census names such paths as unrecoverable before `--yes` is asked for. The second is the smaller
change and keeps the case usable for somebody who genuinely wants to rewrite an untracked file.

Two things not to do. Do not widen the check to "everything under the work tree must be tracked":
the workbench itself may legitimately be untracked in a project that chose not to track it, and that
choice is the project's (`rules/workbench-tracking.md`). And do not fold this into guard (a)'s
dirty-tree question, which was just narrowed to the corpus for a different reason
(`260830-1843_*_how-does-the-commit-lock-stop-leaving-the-tree-it-just-committed-dirty.md`); this is
about tracking, not about pending changes.
