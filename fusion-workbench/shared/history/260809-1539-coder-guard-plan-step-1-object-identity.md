# Session: Step 1 of the five-guard-defects plan — object identity in the protected-path measurement

**Date:** 2026-08-09 15:39
**Agent:** coder
**Status:** Complete

## What was asked

Implement Step 1 of `260809-1229_*_plan-five-severe-guard-defects.md`: make the fingerprint describe the protected path itself rather than whatever it resolves to, and make the restore refuse to write through a symbolic link at any component. Closes `260809-1104_*_a-symlink-in-place-of-a-protected-file-writes-through-it-and-removes-the-path-from-the-watched-set.md` (Critical) and `260809-1231_*_the-restore-writes-through-a-symlinked-parent-directory-which-the-final-component-check-does-not-cover.md`, the parent-directory door found while planning.

Constraints carried by the dispatch beyond the plan: never open behaviour (prefer a loud failure to a silent pass), verify only through `hooks/lib/__tests__/helpers/guard-harness.ts`, never run `git checkout -b foo --` by hand, leave `hooks/lib/git-branch-guard.ts` and `hooks/lib/command-word.ts` to a parallel `coder`, do not commit, and show a test red before the fix.

## What was done

**One question asked in three places.** The defect is not "symlinks exist"; it is that `statSync` / `readFileSync` / `writeFileSync` all resolve a link, so the mechanism answered a question about the link's *target* — an object the project never protected. The three code sites are three askings of the same question.

1. **`fingerprint` uses `lstatSync`.** The fingerprint domain is now three disjoint values: `ABSENT`, a new `LINK_PREFIX` value (`"symlink:" + readlink`), and base64 content. Disjoint by the argument `ABSENT` already rested on — both sentinels carry a `:`, base64 draws on `[A-Za-z0-9+/=]`. A regular file that becomes a link therefore reads as `modified` out of the existing single string comparison in `diffSnapshots`; no branch was added there.

2. **`enumerateProtected` no longer drops symbolic-link files.** It still skips symbolic-link *directories* — the cycle argument is unchanged and restated in the header. A new `linksToDirectory` helper does the one `stat` that separates the cases, because a `readdir` dirent comes from `lstat` and answers `isDirectory()` false for every link. A dangling link counts as a file and stays watched; dropping it would hand back the same disappearance through a link that happens to be broken.

3. **`restore` is total over the three-value domain and follows nothing.** A `symlink:` fingerprint is put back with `symlinkSync`, because the invariant is "put the path back to what it was" and flattening a legitimately symlinked rule file into a copy would be the loss this guard exists to prevent. The final component is `lstat`ed and unlinked if it is a link, and the write opens with `O_NOFOLLOW` (`constants.O_NOFOLLOW ?? 0`, so Windows degrades to today's behaviour) so a link planted in the gap fails with `ELOOP` rather than landing on a stranger's file. The parent chain is compared as `realpathSync(dirname(abs))` against `resolve(realpathSync(root), dirname(rel))`; a divergence **refuses** the restore through the exception path `restorePath` already catches and `describe` already turns into "the change is still on disk".

**Two deliberate deviations from the plan's letter, both narrowings.**

- The parent-chain check guards the **delete** branch as well as the write branch, which the plan only asked for on the write. Unlinking a stranger's file through a symlinked parent is the same primitive pointed the other way, and refusing is strictly safer: nothing leaves the watched set, nothing goes unreported.
- The parent comparison **folds case**, for the reason `matchesAnyFolded` does. On a case-insensitive volume `realpath` reports the on-disk spelling while the lexical side carries the spelling the pattern was written in, and an unfolded comparison would refuse an ordinary restore over one letter. Two paths differing only in case name the same directory on such a volume, so the fold gives nothing away.

**Header text rewritten to match the code:** the module header's non-existence section (now covering the link value and naming both issues), `enumerateProtected`'s symlink section, and the `fingerprint` and `restore` docs. The old `## Symlinks are not followed, and that is a stated residual` section described the enumeration accurately and was silent on the restore, which is the direction that writes.

## Verification

Every case runs through `guard-harness.ts` — a throwaway project root outside this repository, both hooks spawned as real subprocesses, the effect placed between them. The guard's write half stands down here by design, so an assertion written in this tree would pass without the mechanism running.

**Red before, green after.** Six new cases in `protected-snapshot-integration.test.ts`. With `hooks/lib/protected-snapshot.ts` swapped back to its `451a07e` content and the new cases left in place: **5 failed, 23 passed**. The sixth ("still does not descend into a symlinked DIRECTORY inside a protected tree") is a pinning case for behaviour that must not change, and is green on both sides by design.

**Anti-vacuity, both mutations from the plan's table measured rather than argued.**

| Mutation | New cases | Existing cases |
|---|---|---|
| `fingerprint` back to `statSync` (the whole `451a07e` module) | 5 of 6 fail | all pass |
| the two `assertPathResolvesInPlace` calls removed | exactly 1 fails (the parent case) | all 27 others pass |

Each case asserts the **victim** file or directory is unchanged. At `451a07e` every victim carries the protected file's bytes after the call, so none can pass by accident.

**Full suite:** `npm test` in `hooks/` — 33 test files, 1053 tests, 0 failures. The baseline was 33 files / 1030 tests; 6 of the 23 additional tests are mine and the other 17 belong to the parallel `coder` working in `git-branch-guard.ts` (Steps 2 and 3), whose edits were in the tree during the run. No existing test was edited; the test file gained two helpers (`isLink`, `linkOver`) and two imports.

## Files changed

- `hooks/lib/protected-snapshot.ts`
- `hooks/lib/__tests__/protected-snapshot-integration.test.ts`
- `hooks/dist/lib/protected-snapshot.js` and `.d.ts` (rebuilt by `npm test`; `dist` is committed by convention)

## Open at the end of the session

- **Step 0 was not performed and remains outstanding.** The work tree is at plugin version `6.1.0`, the installed copy under `~/.fusion` at `6.0.1`. It does not affect this step's verification — the harness spawns the work-tree build — but a live session observing guard behaviour is running the older hooks, pinned for the whole session. Running `fusion --update` mid-session cannot fix that session, and the update pulls from the GitHub tarball rather than this work tree, so it was left to the user rather than taken unilaterally.
- **The plan's Step 1 named `fusion-guard.json` for the literal-entry case; the test uses `settings.json` instead.** Both are wildcard-free entries watched through `literalPaths`, so the property under test is the same. Replacing the configuration file itself with a link also changes what the PostToolUse loader reads, which would put two mechanisms in one case. Stated in the test comment.
- **`rules/protected-path-discipline.md` still carries the claim `260809-1104_*_a-symlink-in-place-of-a-protected-file-writes-through-it-and-removes-the-path-from-the-watched-set.md`'s last acceptance criterion is about.** That is Step 6's, by the plan's own scheduling, and both issues stay `_o_` until it lands. Nothing was renamed.
- **Open Question 2 of the plan is now answerable in one direction only.** A project that symlinks a rule directory to a shared location will see every restore under it refuse, loudly. No such layout is visible from this tree; the refusal was chosen over the write because the write cannot be taken back.
