fusion-migrate's header says an empty `.git` entry stops the run with exit 3, but an empty `.git` directory inside another repository does not
---
`hooks/migrate.ts` `## The git pass`, added in `f2cc68f0`, states that "an empty or non-git `.git` entry ... stop[s] the run with exit 3". That holds for a `.git` *file* that is no gitfile, and for an empty or non-repository `.git` *directory* with no repository above it. It is false for such a directory inside an enclosing repository: git walks past it and answers with the enclosing toplevel, `repoTop` returns that, and the run proceeds. The behaviour is git's own answer and is not the defect. The sentence is.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Review domain:** code
**Severity:** Low
**Cross-references:** `261009-2223-reviewer-docs-only-release-candidate-5f7398c9.md`, `261009-2028-migrate-repotop-counts-a-git-entry-git-does-not-use-and-misses-a-git-dir-git-does-use.md`

**Evidence.** The sentence stands identically in `hooks/migrate.ts` header `## The git pass`, `hooks/dist/migrate.js` and `hooks/dist/migrate.d.ts` at `5f7398c9`. `repoTop` stops its walk at the first `.git` name and then asks `git rev-parse --show-toplevel`; a 0 exit is taken as the answer (`hooks/migrate.ts` `repoTop`, `git`).

Measured with git 2.53.0, `git -C <proj>/fusion-workbench rev-parse --show-toplevel`, which is exactly the call `repoTop` makes:

| Setup | git's answer | Run |
|---|---|---|
| empty `.git` directory in `<proj>`, `<proj>` inside a committed repository `outer/` | exit 0, `outer/` | proceeds over `outer/` |
| empty `.git` file in `<proj>`, inside `outer/` | exit 128, invalid gitfile format | exit 3 |
| `.git` file reading `hello`, inside `outer/` | exit 128, invalid gitfile format | exit 3 |
| empty `.git` directory in `<proj>`, no repository above | exit 128, not a git repository | exit 3 |

The issue this sentence resolved measured only the last row's setup ("workbench in a project that is not a repository"), so the generalisation was never measured.

**Acceptance.** The sentence in all three files names the case it covers: a `.git` file that is not a gitfile, and a `.git` directory that is not a repository when no repository encloses it. Inside an enclosing repository such a directory is passed over as git passes it. `hooks/dist/` rebuilt and `npm test` in `hooks/` exit 0.

---
Resolved: `hooks/migrate.ts` header `## The git pass` now names the exit-3 cases as a `.git` file that is not a gitfile, a `.git` directory that is not a repository when no repository encloses it, and a `.git` hidden by `GIT_CEILING_DIRECTORIES`, and adds that inside an enclosing repository such a directory is passed over as git passes it and the run proceeds over the enclosing repository. Re-measured with git 2.53.0 and the `repoTop` call before writing: an empty `.git` directory, and one holding only a junk `HEAD`, answer exit 0 with the enclosing toplevel inside a repository and exit 128 outside one; an empty `.git` file and one reading `hello` answer exit 128 in both. Comments only; `hooks/dist/migrate.js` and `hooks/dist/migrate.d.ts` rebuilt with `npm run build`. `npm test` in `hooks/` exit 0.
