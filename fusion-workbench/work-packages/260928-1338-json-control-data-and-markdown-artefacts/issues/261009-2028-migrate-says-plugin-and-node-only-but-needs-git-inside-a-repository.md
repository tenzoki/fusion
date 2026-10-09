fusion-migrate says "plugin and Node only", but needs a working git inside a repository
---
Since `f8203e70` (and for a `.git` beside a missing git, since `26ada996`), a workbench inside a repository stops with exit 3 when git is missing or refuses the repository. Two shipped contract lines still say no other runtime is needed. The exit table names exit 3 only as an incomplete install or an internal fault, and `/fusion:migrate` names no git prerequisite before Step 7.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Review domain:** code
**Severity:** Low
**Cross-references:** `261009-2028-reviewer-repo-top-by-filesystem-f8203e70.md`

**Evidence.**

- `hooks/migrate.ts:14`: "It needs the plugin and Node and nothing else." The same header, `## The git pass` (`:26-33`): inside a `.git`, "missing git, a refused repository such as dubious ownership … stops the run as a fault".
- `bin/fusion-migrate:20`: "Plugin and Node only: no other runtime, service or variable is read."
- `bin/fusion-migrate:75`: exit 3 is "install incomplete (this entry or the codec bundle missing) or an internal fault". A missing git and a `safe.directory` refusal are neither.
- `skills/migrate/SKILL.md` Steps 2 and 4 (`:54`, `:130`) read the same machine as `MODE=plain` and tell the user the workbench is "not under version control". The rename pass then runs with `mv`. Step 7 stops on exit 3 with `git rev-parse --show-toplevel over <wb> failed: ENOENT`, or with git's dubious-ownership line.

What the user meets: the run is recoverable, not a lockout. After git is installed or the directory is trusted, `/fusion:migrate` again finds `FOUND=0` and goes to Step 7. But the skill first said "not under version control" about a repository, and the stop arrives after the renames, with a bare `ENOENT`.

**Fix direction.** Reword the two contract lines: plugin and Node, plus git when the workbench lies inside a repository. Name that case under exit 3 in the wrapper's table. Optionally, have Step 2's survey say "git missing or refusing this repository" when a `.git` stands above the workbench and `git rev-parse` fails, so the user learns it before the renames.

**Acceptance.** `hooks/migrate.ts:14`, `bin/fusion-migrate:20` and the exit-3 row agree with `## The git pass`. If Step 2 changes, a repository without a working git is named there.
