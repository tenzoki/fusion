fusion-migrate's repository walk counts a `.git` git does not use, and misses a `GIT_DIR` git does use
---
`repoTop` in `hooks/migrate.ts` decides "a repository exists" from any `.git` name on the ancestor chain. Git's own discovery differs in both directions. A `.git` git rejects (an empty directory, one above `GIT_CEILING_DIRECTORIES`) now stops the migration with exit 3, where `26ada996` migrated in plain mode. A repository named by `GIT_DIR` with no `.git` on the chain reads as "no repository", where `26ada996` derived persons from git.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Review domain:** code
**Severity:** Low
**Cross-references:** `261009-2028-reviewer-repo-top-by-filesystem-f8203e70.md`, `261009-1958-migrate-reads-git-exit-128-as-no-repository-and-stops-on-a-machine-without-git.md`

**Evidence.** `hooks/migrate.ts:156-159` at `f8203e70`:

```ts
function repoTop(wb: string): string | null {
  for (let d = wb; !existsSync(join(d, ".git")); d = dirname(d)) if (dirname(d) === d) return null;
  return git(wb, ["rev-parse", "--show-toplevel"]).trim();
}
```

`existsSync` answers for any entry named `.git`. Run with git 2.53.0 on both builds (`node hooks/dist/migrate.js survey <wb>`, workbench in a project that is not a repository):

| Case | `26ada996` | `f8203e70` |
|---|---|---|
| empty `.git` directory in the parent | exit 0, `unknown	no-repository` | exit 3, `exit 128: … not a git repository` |
| committed repository, `GIT_CEILING_DIRECTORIES` set to its root | exit 0, `unknown	no-repository` | exit 3, same 128 line |
| `.git` file naming a missing `gitdir:` (stale worktree) | exit 0, `unknown	no-repository` | exit 3, `exit 128: … /nonexistent/wt` |
| repository moved out, `GIT_DIR` and `GIT_WORK_TREE` set | exit 0, `git-first-add * 4` | exit 0, `unknown	no-repository` |

The stale gitlink is a broken repository, and a fault is right there. The first two are not: git itself answers "no repository", and the user has to delete a `.git` or unset a variable before 13.0.0 lets the workbench in. The `GIT_DIR` row reverses a correct answer. All four setups are rare. The issue `261009-1958-migrate-reads-git-exit-128-as-no-repository-and-stops-on-a-machine-without-git.md` asked for `GIT_DIR` and `GIT_CEILING_DIRECTORIES` to be checked before taking this cut, and its `Resolved:` note names neither.

Agrees with git, checked: a worktree's and a submodule's `.git` file, the workbench at the toplevel and below it, and a path through the macOS `/tmp` symlink (`wb` is `realpathSync`'d at `hooks/migrate.ts:615`, and git walks the physical path too).

**Fix direction (inference).** Keep the filesystem's answer, but ask it the question git asks. Count a `.git` directory only when it holds `HEAD`, and a `.git` file only when it starts `gitdir:`. Stop the walk at an entry of `GIT_CEILING_DIRECTORIES`. With `GIT_DIR` set, ask git. Or state these setups in the header's `## The git pass` as out of scope. That is the cheaper answer and an acceptable one at this frequency.

**Acceptance.** Either a case in `hooks/lib/__tests__/migrate.test.ts` per row above with the `26ada996` outcome restored for the first, second and fourth rows, or a sentence in the header naming them as unsupported. The user picks which.

---
Resolved: by the header sentence the acceptance allows, at the user's ruling (documentation only, no code change). `hooks/migrate.ts` header `## The git pass` now names the setups where git answers otherwise as unsupported: an empty or non-git `.git` entry and a `.git` hidden by `GIT_CEILING_DIRECTORIES` stop the run with exit 3, and a repository named by `GIT_DIR` and `GIT_WORK_TREE` with no `.git` above the workbench is migrated as if there were no repository. `hooks/dist/migrate.{js,d.ts}` rebuilt; `npm test` in `hooks/` exit 0.
