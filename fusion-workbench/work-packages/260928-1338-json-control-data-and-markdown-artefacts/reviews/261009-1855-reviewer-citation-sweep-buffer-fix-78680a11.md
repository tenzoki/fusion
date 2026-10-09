# Review: the citation-sweep buffer fix `78680a11`, release candidate for 13.0.0

**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Reviewed-range:** `052932e2..78680a11`
**Not-opened:** none

What the Not-opened line covers: the shipped files in the range. All five files `78680a11` changes were opened, plus its issue record `261009-1735-citation-sweep-reads-a-git-output-over-1-mb-as-an-untracked-workbench-and-refuses-to-write.md`. The dispatch scoped out the three other commits in the range, `47cf5289`, `f38ad6d0` and `b712d8a7`. Each changes only `fusion-workbench/` (28 workbench paths, none of them shipped), and none of them was reviewed here. This follows the convention the coverage pass `261009-1624-reviewer-coverage-pass-over-4e1e1b47-to-052932e2.md` used. Listing their paths here would put store-prefixed citations into a workbench record, which the citation lint reports.

**Review domain:** code
**Work-item:** 260928-1338-json-control-data-and-markdown-artefacts

## Summary

Verdict: **revise**. `78680a11` fixes the defect it names, and the fix is correct. The old build refuses a 1.16 MB listing as `workbench-untracked` and the new one writes it. `hooks/dist` matches the source byte for byte. The golden moved by the 20 test lines alone. No finding is a regression from this commit. Two of the three findings are in the mechanism this commit touches, and none is Critical or High. Whether any of them blocks 13.0.0 is the user's call.

## Totals

| Critical | High | Medium | Low |
|---|---|---|---|
| 0 | 0 | 2 | 1 |

## What was verified

- **The defect and its fix, reproduced.** I built a scratch repo the same way as the new test (1 400 files, `git ls-files` 1 162 172 bytes) and ran `--write --yes` against `git archive` extracts of both commits. `052932e2`: `refused (workbench-untracked)`, exit 4. `78680a11`: `files=1 rewrites=1 … mode=write`, exit 0. The new test therefore fails on the old build. The test asserts its own precondition (`toBeGreaterThan(1 << 20)`), so a later shrink of the fixture cannot turn it into a silent pass.
- **Every caller honours `failed`.** The `git` wrapper has three callers: `refusal` (`hooks/citation-sweep.ts:612-613`), `isTracked` (`:552-553`) and `porcelainPaths` (`:573-574`). Each returns a refusal when `failed !== null`. `failed` covers a spawn error (its `code`, e.g. ENOBUFS or ENOENT) and a null status (`killed by <signal>`). Node sets `error` on a maxBuffer overrun, so that path is covered too. No path reads a call that did not complete as an answer. A call that completes with git's fatal 128 is another matter: see F1.
- **`isTracked` reading status alone.** `git ls-files --error-unmatch` exits 0 on a match, 1 on no match (checked) and 128 on a fatal error. With `-- <path>`, stdout carries nothing the guard needs, so discarding it is correct. Workbench root: unchanged semantics. A `<path>` equal to the toplevel: `rel === ""` becomes `.`, which is tracked when anything is (checked: exit 0; a scratch run with the repo root as `<path>` wrote and exited 0). A path outside the toplevel: `path-outside-repo` refuses it before `isTracked` is reached (`:635-637`). One gap: 128 is read as "untracked" (F1).
- **Exit 4 for `git-failed`.** This is consistent with the header (`hooks/citation-sweep.ts:426-429`), which now names it under guard (a). `main` returns 4 for every `refusal` string (`:911-915`), so the new refusal needs no new exit code. `/fusion:migrate` Step 6 does not read the write's exit at all (F2).
- **`hooks/dist`.** `tsc -p hooks --outDir <scratch>` reproduces `hooks/dist/citation-sweep.js` and `.d.ts` identically to `78680a11`'s blobs. `npx tsc --noEmit` is clean. `citation-sweep.test.ts` and `committed-dist.test.ts`: 30 of 30 pass. `surface-growth-bound.test.ts`: 12 of 12.
- **The golden.** `surface-growth.golden` changes only `citation-sweep.test.ts 689 → 709` and `total 24850 → 24870`. `wc -l` of the test file at the two commits gives 689 and 709. No baseline file is in the commit, so nothing but the size record moved.
- **Test robustness.** Cleanup sits in `finally`. Runtime is about 1.3 s against `CASE_TIMEOUT = 30_000`. The fixture's absolute paths reach about 890 bytes under macOS's `/private/var/folders/…/T`, which is under the 1 024-byte `PATH_MAX`, and the 200-character segments are under `NAME_MAX` 255. A `TMPDIR` about 130 characters longer would make `mkdirSync` throw `ENAMETOOLONG`. The test would then fail loudly, never pass falsely. Noted, not filed.

## Findings by theme

### A git call that answered with a failure is still read as an answer

**F1, Medium.** `isTracked` returns `r.status === 0` (`hooks/citation-sweep.ts:553`), so exit 128 reads as untracked. `porcelainPaths` checks only `failed` (`:574`), so a `git status` that exits 128 with empty stdout reads as a clean tree. Reproduced on the `78680a11` build:

- A corrupt `.git/index` gives `refused (workbench-untracked)`. The guard still refuses, but for the wrong reason. This is the misreading the closed issue was about, reached by another route.
- A deleted HEAD tree object plus an uncommitted edit to a corpus file: `git status` exits 128 and `git ls-files` exits 0. The sweep exits 0 and rewrote the edited file in place. Guard (a)'s dirty-tree check passed without having asked anything.

Both need a damaged repository. The commit message claims "A call that gives no answer is refused as git-failed … and is never read as untracked", and that holds only for spawn failures. The new `git-failed` branch is not tested at all. Fix direction: 0 tracked, 1 untracked, anything else `git-failed` with stderr's first line; refuse a non-zero `git status` the same way; add two tests. Filed: `261009-1855-citation-sweep-reads-a-git-call-that-exits-non-zero-as-an-answer-and-writes-over-an-uncommitted-edit.md`.

**F3, Low.** The sibling in `hooks/migrate.ts:140` `gitLists`: no `maxBuffer`, and a null or non-zero status reads as "not a repository" (`:141`, `:144`). An untracked or ignored listing over 1 MB therefore prints `reported=git not a repository` and drops every `untracked-record` and `ignored-record` finding. The commit message names `hooks/migrate.ts` as the precedent for `maxBuffer: 1 << 30`. Four of its five git spawns carry it. This one does not. Verified by reading, not run. Filed: `261009-1855-migrate-gitlists-has-no-maxbuffer-so-a-listing-over-1-mb-reads-as-not-a-repository.md`.

### The migrate skill and the sweep's guard disagree about staged renames

**F2, Medium.** `skills/migrate/SKILL.md:156` runs `--write --yes` with the renames "staged" and the writes "unstaged beside" them. Guard (a) counts a staged rename of a corpus file as an uncommitted change (`hooks/citation-sweep.ts:571-608`). Reproduced: one staged `git mv` of a record gives `refused (dirty-tree)`, exit 4. The trials succeeded because the renames had been committed first, which Step 5 advises and Step 6's sentence contradicts. Step 6 gives the dry run's exits 3 and 6 and no reading of the write's exit, so a `dirty-tree` or the new `git-failed` refusal reaches the running agent with no instruction. This predates `78680a11`. It falls under this pass's third focus point. Filed: `261009-1855-migrate-step-6-writes-the-sweep-beside-staged-renames-which-guard-a-refuses-as-dirty-tree.md`. Choosing between committing first and exempting `R100` renames is the user's call.

## Cross-cutting observations

- One pattern runs through all three findings: **a git status is read as a domain answer without first asking whether git answered.** `78680a11` closed the spawn half (`failed`). The exit-code half is still open in `citation-sweep.ts` (F1) and in `migrate.ts` `gitLists` (F3). `hooks/lib/git.ts:96-120` documents a deliberate opposite choice for its family: every decline is `null`, and each caller "claims nothing". That family only reports, though, and the sweep's guard gates a write.
- The sweep's refusal names (`no-git`, `not-a-git-work-tree`, `workbench-untracked`, `dirty-tree`, `path-outside-repo`, `path-untracked`, now `git-failed`) are documented only in the sweep's own header. The one consumer that runs `--write`, `/fusion:migrate` Step 6, reads none of them (F2).
- `refusal`'s first call reads `rev-parse --show-toplevel` exit 128 as `not-a-git-work-tree` (`:614-615`). That is also what git returns under `safe.directory` "dubious ownership". It is pre-existing, the guard still refuses, and only the reason is wrong. I did not file it separately: F1's fix direction (128 means `git-failed` with stderr) can carry it if the implementer extends it to that call.

## Recommended sequencing

1. F1 before the release if the user wants guard (a) to hold its promise on a damaged repository. It is small (two predicates, two tests) and lies in the file this release candidate already changes.
2. F2 before the real axibra migration (plan step 20's precondition), because Step 6 as written refuses in git mode. At minimum, the skill text should say to commit the renames first.
3. F3 is cleanup, with no effect on a write.

Not checked: Windows path limits (the plugin targets macOS and Linux); a `git status` output larger than V8's string limit (536 870 888 characters under Node 25.7.0), which `maxBuffer: 1 << 30` admits and which would surface as the internal-error exit 3, not as a misreading.
