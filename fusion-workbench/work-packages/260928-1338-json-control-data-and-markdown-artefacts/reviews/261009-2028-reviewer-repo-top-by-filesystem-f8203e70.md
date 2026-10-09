# Review: the filesystem decides whether a repository exists, `f8203e70`, release candidate for 13.0.0

**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Reviewed-range:** `26ada996..f8203e70`
**Not-opened:** `fusion-workbench/orchestrator-events.jsonl`

**Review domain:** code
**Work-item:** 260928-1338-json-control-data-and-markdown-artefacts

What the Not-opened line covers. The dispatch scoped the review to `f8203e70`. The two commits before it, `f55803df` and `101c2360`, change only `fusion-workbench/`. Of their files I opened the previous review, its evidence record and both issue narratives with their `Resolved:` notes, as input. I did not open the step-13 analysis `261009-2000-fj05-release-candidate-verification-at-26ada996.md`, its log directory, or the two issues' control files; they are workbench content the dispatch scoped out, named here in words as the previous review did, because a store-prefixed path on the Not-opened line is a citation the lint refuses. All five shipped files of `f8203e70` were opened in full. The staged-renames issue `261009-1855-migrate-step-6-writes-the-sweep-beside-staged-renames-which-guard-a-refuses-as-dirty-tree.md` is deferred past 13.0.0 by the dispatch and is not re-reported.

## Summary

Verdict: **revise**, with no release blocker. `f8203e70` closes F-A and F-B of `261009-1958-reviewer-git-exit-sets-26ada996.md` as their acceptance texts ask. Every case I ran agrees with the `Resolved:` notes on both builds. Three Low defects remain. One is new in this commit: a broken branch ref now reads as "no commit yet" and writes `untracked` provenance where `26ada996` stopped. One is the walk's disagreement with git's own discovery in rare setups. One is two contract lines that still say "plugin and Node only". Whether 13.0.0 ships with them open is the user's call. I would ship.

## Totals

| Critical | High | Medium | Low |
|---|---|---|---|
| 0 | 0 | 0 | 3 |

## What was verified

- **dist matches source.** `npx tsc -p hooks/tsconfig.json --outDir <scratch>` reproduces `hooks/dist/migrate.js` and `migrate.d.ts` byte for byte (`cmp`). The work tree's `hooks/` is clean at `f8203e70`.
- **Tests pass at `f8203e70`.** `migrate.test.ts`, `committed-dist.test.ts` and `surface-growth-bound.test.ts`: 25 of 25. The new case took 5.2 s against `2 * CASE_TIMEOUT`.
- **The new case fails on `26ada996`.** Run against a `git archive` extract of `26ada996` with the new test file and the work tree's `node_modules`. It fails on its first expectation, the killed git. Each later expectation was checked on its own with a survey harness on both builds:

| Case | `26ada996` | `f8203e70` |
|---|---|---|
| `git` killed by SIGKILL on `ls-files` | exit 3, `TypeError` (previous review) | exit 3, `git ls-files … killed by SIGKILL` |
| dubious ownership (`GIT_TEST_ASSUME_DIFFERENT_OWNER=1`) | exit 0, `unknown	no-repository` | exit 3, `exit 128: …` git's line |
| `.git` present, no git on `PATH` | exit 3, `ENOENT` | exit 3, `ENOENT` |
| no `.git`, no git on `PATH` | exit 3, `ENOENT` | exit 0, `unknown	no-repository` |
| `git init`, no commit | exit 3, `git log` 128 | exit 0, `unknown	untracked` |

- **Robustness of the new case.** Locale: the regexes match `exit 128: ` and `killed by SIGKILL` and no message text. This machine's git speaks German and the case passes. Environment: every `survey` runs with `PATH`, `HOME` (a scratch directory) and the case's own variables, so no user `safe.directory`, `GIT_CONFIG_GLOBAL` or `GIT_DIR` leaks in, and `GIT_CONFIG_NOSYSTEM=1` shuts out a system-wide `safe.directory=*`. `PATH: nogit` holds only a `node` symlink, enough because the case calls `hooks/dist/migrate.js` directly, not the bash wrapper. Cleanup: `nogit` and `killer` live under the project root, under `base`, which `afterAll` removes. Apple git 2.54.0 (`/usr/bin/git`) honours `GIT_TEST_ASSUME_DIFFERENT_OWNER` too (exit 128). *Inference, not run:* a git older than 2.35.2 has no ownership check, so the dubious-ownership expectation would fail there. fusion documents no minimum git version.
- **The golden is a size record only.** `migrate.test.ts 245 → 264` and `total 24909 → 24928`, both +19, the test diff's line count. `wc -l` gives 264. No other line moved.
- **The two-overload helper** (`hooks/migrate.ts:145-152`). Without `no`, the return type is `string` and every outcome but exit 0 throws, so the four `!` are gone and no caller can read null. With `no`, null needs `r.error === undefined && r.status === no`; `no` is a number and a signal's status is null, so a signal or a spawn error always throws. A timeout and a full buffer set `r.error`. The only caller passing `no` is `:179` with 1. `spawnSync` appears once in the file (`:148`). No path reads a signal or a spawn error as an answer.
- **The walk against git, the cases that agree.** A worktree's `.git` file, a submodule's `.git` file, the workbench at the toplevel (prefix `""` → `.`) and one level below it all derive `git-first-add`. The workbench reached through macOS `/tmp` derives the same: `main` takes `realpathSync(given)` (`:615`) before the walk, and git walks the physical cwd too. The walk only decides whether to ask git, and the toplevel always comes from git, so `gitLists` and `firstAdds` ask the repository git chose. A `$HOME/.git` dotfiles repository is a real repository to git and to the walk alike, so the workbench reads untracked there, as it did on every earlier build.

## Findings by theme

### The unborn-branch test answers for a broken ref too

**G-1, Low, new in `f8203e70`.** `git rev-parse --verify -q HEAD` exits 1 both after `git init` and when the current branch's ref holds junk (`hooks/migrate.ts:179`). Reproduced: junk in `.git/refs/heads/<branch>` of a committed repository. `f8203e70` exits 0 with `unknown	untracked	4`. `26ada996` exits 3 on `git log`'s 128. A fault became a wrong answer that `run` writes into each control file: the class F3 and F-A were about. A broken ref is rare, so the severity is Low. Fix direction (*inference*): on exit 1, ask whether any commit object exists (`git cat-file --batch-all-objects --batch-check=%(objecttype)`). None means `untracked` is true. One means a fault. Measured: the broken-ref repository lists a commit, the `git init` one lists only blobs. Filed: `261009-2028-migrate-reads-a-broken-branch-ref-as-a-repository-with-no-commit-and-derives-untracked-for-every-file.md`.

Not filed: an orphan branch (`git checkout --orphan`) in a repository with history also reads as `untracked`. On the current branch nothing has a first add, so that answer is defensible. The fix direction above would turn it into a fault, which is the safe side.

### The walk and git's discovery differ in rare setups

**G-2, Low.** `repoTop` counts any entry named `.git` (`hooks/migrate.ts:156-159`). Run on both builds:

| Case | `26ada996` | `f8203e70` |
|---|---|---|
| empty `.git` directory in the parent | exit 0, `no-repository` | exit 3, git's "not a git repository" |
| `GIT_CEILING_DIRECTORIES` at the repository root | exit 0, `no-repository` | exit 3, same |
| stale worktree `.git` file | exit 0, `no-repository` | exit 3, `… /nonexistent/wt` |
| `GIT_DIR` + `GIT_WORK_TREE`, no `.git` on the chain | exit 0, `git-first-add` | exit 0, `no-repository` |

The stale gitlink is a broken repository, and stopping is right. In the first two rows git itself says "no repository", and the user must remove a `.git` or unset a variable to migrate. The last row loses provenance git could give. The closed issue asked for `GIT_DIR` and `GIT_CEILING_DIRECTORIES` to be checked before this cut; the `Resolved:` note names neither. All four are rare. A header sentence naming them as unsupported is an acceptable fix. Filed: `261009-2028-migrate-repotop-counts-a-git-entry-git-does-not-use-and-misses-a-git-dir-git-does-use.md`.

### The documented contract and the skill do not describe the git requirement

**G-3, Low.** `hooks/migrate.ts:14` ("needs the plugin and Node and nothing else") and `bin/fusion-migrate:20` ("Plugin and Node only") contradict the header's own `## The git pass` (`:26-33`), which stops on missing git inside a `.git`. Exit 3 in the wrapper's table (`bin/fusion-migrate:75`) names an incomplete install or an internal fault, not a missing or refusing git.

The dispatch asked whether the skill's divergence hurts a user. `skills/migrate/SKILL.md` Steps 2 and 4 (`:54`, `:130`) test `git rev-parse --is-inside-work-tree`. With git missing or the ownership check refusing, that reads `MODE=plain` and tells the user the workbench is "not under version control". The rename pass runs with `mv`, and Step 7 then stops on exit 3 with `failed: ENOENT` or git's ownership line. That is not a lockout: once git works, `/fusion:migrate` finds `FOUND=0` and goes straight to Step 7, and Step 7's "show the stderr line and stop" passes the reason through. The harm is a false statement before the renames and a terse stop after them. The `.git`-without-git row already stopped this way on `26ada996`; `f8203e70` adds the dubious-ownership row. Filed: `261009-2028-migrate-says-plugin-and-node-only-but-needs-git-inside-a-repository.md`.

## Cross-cutting observations

- **Each cut moved the misread to a rarer input, without removing it.** `78680a11` read ENOENT and 128 as "no repository". `26ada996` kept 128. `f8203e70` moves the question to the filesystem, and the leftover misread is a broken ref (G-1) at the one place where it still uses an exit status as a "no". Inside `firstAdds` the question is "has any file a first add", and the commit-object test decides it without an exit-code reading.
- **The skill and the entry ask "is this a repository" by two different methods.** The skill asks git (`is-inside-work-tree`), the entry asks the filesystem. They agree whenever git works. They disagree exactly on the machines G-3 describes. A shared answer is not needed for 13.0.0. If the skill's Step 2 ever names the git requirement, it should use the entry's test.
- **Three git-call conventions in `hooks/`** (`citation-sweep.ts`, `migrate.ts`, `lib/git.ts`), as the previous review noted. Unchanged by this commit, not filed.

## Recommended sequencing

1. None of G-1 to G-3 blocks 13.0.0. G-1 changes a stop into wrong provenance, but only over a corrupt ref. It is the one I would fix first, in a point release.
2. G-2 and G-3 are cleanup. G-3 is a wording change. G-2 can close as a header sentence.

Not checked: git versions other than 2.53.0 (Homebrew) and 2.54.0 (Apple, ownership check only). Linux and Windows. The Xcode `/usr/bin/git` shim without Command Line Tools (*inference*: under a `.git` it is now a fault naming its `xcrun` line; without a `.git` it is never run).
