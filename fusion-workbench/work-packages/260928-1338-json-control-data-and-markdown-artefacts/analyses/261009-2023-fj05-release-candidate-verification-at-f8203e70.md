# Analysis: FJ05 step 13 repeated, the release candidate C''' = `f8203e70` verified in an isolated clone

**Date:** 2026-10-09 20:23
**Type:** Feasibility (release-candidate verification, plan step 13, repeated for a new candidate)
**Status:** Complete
**Requested by:** orchestrator, for work package `260928-1338-json-control-data-and-markdown-artefacts`
**Cross-references:** `261009-1021-plan-fj05-release-acceptance-of-13-0-0-with-the-claim-takeover.md` (step 13), `261009-2000-fj05-release-candidate-verification-at-26ada996.md` (the run this one repeats), `261009-1958-reviewer-git-exit-sets-26ada996.md` (findings F-A and F-B, fixed by `f8203e70`), issues `261009-1958-migrate-reads-git-exit-128-as-no-repository-and-stops-on-a-machine-without-git.md` and `261009-1958-migrate-git-helper-reads-a-git-killed-by-a-signal-as-absent-and-crashes-on-null.md`, `261009-1636-in-a-fresh-clone-the-coverage-reads-carried-from-a-review-picked-by-checkout-order-not-the-newest.md`

## Question

Does C''' = `f8203e70` pass step 13's acceptance list in a clone nobody has worked in, checked the same way as C'' = `26ada996`? How does each result differ from the `26ada996` report? Coverage is read and reported. By dispatch it is not a blocker, because the review of `f8203e70` runs in parallel.

## Scope

| Tree | HEAD | Commit date | Branch | Tracking |
|---|---|---|---|---|
| Live tree (read only, no whole-tree command run) | `f8203e7007335b1bb4ee540098e6797242d2a321` | 2026-10-09 20:09:58 +02:00 | `fj-json-workbench` | level with `origin/fj-json-workbench` (0 ahead, 0 behind). `git ls-remote` on GitHub gives `refs/heads/fj-json-workbench` = `f8203e70` |
| Scratch clone `clone-C3` | `f8203e7007335b1bb4ee540098e6797242d2a321`, detached | 2026-10-09 20:09:58 +02:00 | none | `origin` re-pointed to `git@github.com:tenzoki/fusion.git` for the ancestry check only |
| Prior (read only) | `34a2710e22749e0dacf90a10f339b30de8067552` | 2026-10-09 16:13:47 +02:00 | `main` | Both pin files byte-equal to `34a2710` (`git diff 34a2710 -- <both>` empty). Unchanged since the three earlier runs |

The clone was made at 20:23 with `git clone --no-hardlinks` from the live repository into the session scratchpad. C''' is the live head, so one clone holds the candidate and every committed review, as in the `26ada996` run.

**Deviations from the literal step text.** The same as in the `26ada996` run:
- `hooks/package-lock.json` is gitignored. It was copied from the live tree before `npm install`. Its sha256 is `e7efb262…fbe961b1` on both sides, the same value as before (log `01`).
- The codec's dependencies were installed with `npm ci` from its tracked lockfile (log `03a`).
- One extra read-only run, the verbose `prior-mapping.test.ts` run with `CODEC_REQUIRE_GOLDENS=1`, counts the goldens-required assertions by name (log `03b`).
- One control coverage read, now with `--head 26ada996`, plus the non-workbench paths of each commit after `26ada996` (log `07b`).

Every check ran once against the candidate. Nothing was retried. Two log files were written twice because of my own logging mistakes, not because a check was repeated:
- Log `04`: my first write hashed empty input for the three committed-blob lines. zsh read `$c:codec/…` as a history modifier. The working-file digest was the same in both writes.
- Log `05`: an appended `stat` ran from the wrong directory. It was read-only and touched nothing. The `git status --porcelain` result was empty both times.

Each log carries a note saying so. `pin-check.mjs` and `room.mjs` are byte-identical copies of the previous run's scripts (`cmp` silent).

**Versions** (log `00-versions.log`): node v25.7.0, npm 11.10.1, git 2.53.0, Claude Code 2.1.295, macOS 26.6.2 (25G83), arm64. All the same as before.

## Findings

### Acceptance, item by item

| # | Acceptance item (step 13) | Result | Evidence (log) |
|---|---|---|---|
| 1 | The hooks suite is green | **pass**. `npm install && npm test` exit 0. 67 files passed, 1 skipped (`agent-dispatch-observation.test.ts`). 1156 tests passed, 14 skipped (1170). `migrate.test.ts` ran 9 tests, all passed. The new test `bin/fusion-migrate refuses without Node, and before anything else > needs no git without a .git, states git missing, refusing or killed inside one, and reads a repository with no commit as untracked` **passed in the clone** (4372 ms). Two of its cases run with `PATH` holding only a `node` symlink | `02-hooks-npm-install-and-test.log` line 487 |
| 2 | The codec suite: all passed, 0 skipped | **pass**. `CODEC_REQUIRE_GOLDENS=1 npm test` exit 0. 22 files, 1810 tests passed, none skipped. 13 of 13 `is a Go-emitted golden (CODEC_REQUIRE_GOLDENS=1)` assertions passed | `03-…`, `03b-…` |
| 3 | The digest equals the one Prior qualified in step 10 | **pass**. `fb1703619c94bd2ed6ef8b753e70dd38e36dcb26da0775fb4e19274ed11bb66f`, 699 011 bytes. It equals the committed blob at C''', C'' and C'. The build printed `dist/fusion-record.js: unchanged` | `04-shasum-bundle.log` |
| 4 | The clone is clean after the suites | **pass**. `git status --porcelain` printed nothing, both after the suites and after the room measurement. Only `codec/node_modules/`, `hooks/node_modules/` and `hooks/package-lock.json` are ignored. The hooks run compiles all of `hooks/` into staging and replaces a `dist` file only where its bytes differ (`hooks/scripts/build.mjs:177`). `hooks/dist/migrate.{js,d.ts}` kept their checkout mtime, so the compiled output equalled the committed bytes | `05-git-status-porcelain-after-suites.log` |
| 5 | Coverage reads `verdict=covered` | **not met, reported, not a blocker (by dispatch)**. `commits=90 reviews=123 unusable=25 uncovered=3 verdict=uncovered`. The control read `--head 26ada996` in the same clone gives `uncovered=0 verdict=covered` | `07-review-coverage.log`, `07b-…` |
| 6a | `origin/main` is an ancestor of C''' | **pass**. `origin/main` = `48f0c9ff` (fusion 12.2.3) after `git fetch origin main` from GitHub. `git merge-base --is-ancestor origin/main f8203e70` exit 0 | `08-merge-base-is-ancestor.log` |
| 6b | Every room figure is at or above 0 | **pass**. See the table below. The smallest figure is still the `reviewer` dispatch path at 531 bytes | `09-growth-bound-room.log` |
| 7 | Any failure is a finding with an issue path | The one unmet item is item 5. The dispatch expected it and ruled it out as a blocker. No issue filed | — |

### The coverage line, and what no committed review opened

```
anchor=workbench-root since=cd1b5522 head=f8203e70 commits=90 reviews=123 unusable=25 uncovered=3 verdict=uncovered
  uncovered f8203e70 fix(migrate): the filesystem decides whether a repository exists, not git's exit code
  uncovered 101c2360 docs(workbench): FJ05 step 13 repeated at 26ada996, every check but coverage passes
  uncovered f55803df docs(workbench): review of 26ada996, sweep fix holds, migrate regresses without git
carried=hooks/dist/order.js
carried-from=…/261002-0926-reviewer-closing-pass-over-the-markdown-and-json-formats.md
```

| Commit | Paths outside `fusion-workbench/` | Release-relevant |
|---|---|---|
| `f55803df` | none | no (workbench only) |
| `101c2360` | none | no (workbench only) |
| `f8203e70` | `hooks/migrate.ts`, `hooks/dist/migrate.{d.ts,js}`, `hooks/lib/__tests__/migrate.test.ts`, `hooks/lib/__tests__/fixtures/surface-growth.golden` | **yes. No committed review opens it** |

The gap from the `26ada996` run is closed. Review `261009-1958-reviewer-git-exit-sets-26ada996.md` (range `78680a11..26ada996`, `covers=4`) is now committed (`f55803df`) and covers `26ada996` and the three workbench commits before it. The control read at `--head 26ada996` confirms it: `uncovered=0`. That review's `not-opened=fusion-workbench/orchestrator-events.jsonl` does not stop the coverage.

**The only code commit no committed review opens is `f8203e70`.** The other two are workbench-only.

No review of `f8203e70` exists in the live tree's reviews store of this item when this was written (a directory listing, not a git command). The review that would close the gap has not landed yet. In the `26ada996` run it had already appeared, uncommitted.

The `carried=` line is the same fresh-clone mtime effect described in `261009-1636-…`. It is unchanged and does not affect `verdict=`.

### Growth-bound room at C'''

| Bound | Unit | Total | Floor | Head-room | Budget | **Room** | Change from C'' |
|---|---|---|---|---|---|---|---|
| `agents/*.md` | bytes | 323 031 | 310 567 | 18 000 | 328 567 | **5 536** | none |
| `skills/*/SKILL.md` | bytes | 222 505 | 188 768 | 39 260 | 228 028 | **5 523** | none |
| hook test suite | lines | 24 928 | 24 037 | 4 835 | 28 872 | **3 944** | total +19, room −19 |
| dispatch path, tightest (`reviewer`) | bytes | 113 778 | 114 309 | 0 | 114 309 | **531** | none |

The other ten dispatch paths are byte-identical to the C'' run: analyst 750, implementation-planner 833, requirements-designer 855, document-editor 957, data-implementer 1 055, state-auditor 1 094, code-implementer 1 153, consultant 1 435, policy-curator 1 647, orchestrator 3 642.

The +19 lines are the one new test in `migrate.test.ts` (`git show --numstat`: 19 added, 0 removed). The golden moves `migrate.test.ts 245 → 264` and `total 24909 → 24928`. No baseline file changed between `26ada996` and `f8203e70`: `surface-growth-bound.test.ts`, `rules-emission-golden.test.ts`, `dispatch-path.baseline`, `agents/`, `skills/`, `rules/`, `CLAUDE.md` and `codec/` all have an empty diff. That matches the commit message: "The surface-growth golden is regenerated for the 19 added lines; no baseline moved."

### Prior's pin files against C'''

| Pin file (`Prior:` at `34a2710`) | Pinned commit | Entries | Equal | Differ |
|---|---|---|---|---|
| `tests/testdata/fusion-codec/UPSTREAM.json` | `dd4bf3d4` | 413 | 412 | 1: `fixtures/prior/REQUESTS.md` |
| `tests/testdata/fusion-fj01/UPSTREAM.json` (`bundle_digest` `sha256:fb170361…`) | `dd4bf3d4` | 715 | 714 | 1: `codec/fixtures/prior/REQUESTS.md` |

Both differences are the same file and the same hashes as at C, C' and C'': pinned `44cad87d…`, at C''' `a577780c…`. No path in `codec/` changed between `26ada996` and `f8203e70` (0 paths, log `06`). Prior's working tree has unrelated uncommitted edits to `.gitattributes` and `.gitignore`. They are not the pin files, and the pin files' sha256 values are logged.

### Differences from the `26ada996` report

| Item | At C'' = `26ada996` | At C''' = `f8203e70` | Cause |
|---|---|---|---|
| Hooks tests passed / total | 1155 / 1169 | **1156 / 1170** | one new test in `migrate.test.ts` |
| `migrate.test.ts` tests | 8 | **9** | the five-case git/no-git test |
| Hooks test files | 67 passed, 1 skipped | same | the test went into an existing file |
| New test with a node-only `PATH` | — | **passed** (4372 ms) | new in `f8203e70` |
| Changed `hooks/dist` files rebuilt identically | `citation-sweep.*` and `migrate.*` | **`migrate.*`** | `f8203e70` changes only `hooks/migrate.ts` in source |
| Codec tests | 1810 passed, 0 skipped | same | `f8203e70` does not touch `codec/` |
| Goldens-required assertions | 13 of 13 | same | — |
| Bundle digest | `fb170361…`, 699 011 B | same | — |
| Clean tree after suites | clean | clean | — |
| Coverage | `commits=87 reviews=122 uncovered=4` | **`commits=90 reviews=123 uncovered=3`** | the 3 uncovered are `f8203e70` and two workbench-only commits. `26ada996` is covered by `261009-1958-…` |
| Control coverage read | `--head 78680a11`: covered | **`--head 26ada996`: covered** | the previous candidate is now fully reviewed |
| Parallel review | `261009-1958-…` existed, uncommitted | **none present yet** | the review of `f8203e70` has not landed |
| `origin/main` ancestor | yes, `48f0c9ff` | yes, `48f0c9ff` | — |
| Hook-test surface | 24 909 lines, room 3 963 | **24 928 lines, room 3 944** | +19 test lines |
| Other room figures | as listed | identical | — |
| Prior pin check | 412/413, 714/715, only `REQUESTS.md` | identical | — |
| Lockfile sha256, tool versions | `e7efb262…`; node 25.7.0 etc. | identical | — |
| `npm` audit (hooks / codec) | 9 / 7 advisories | 9 / 7 advisories | — |
| Clone name | `clone-C2` | `clone-C3` | a new clone. The scratchpad already held the earlier ones |
| Logs written twice | none | **`04`, `05`** | my logging mistakes. Each check ran once, and each log notes this |

## Implications

- C''' = `f8203e70` meets every step-13 item except coverage. In code it differs from C'' by one commit. That commit touches only the migrate helper, its compiled output, its test and the growth golden.
- The fix for review findings F-A and F-B is exercised in the clone. The new test covers five cases, including two with no git on `PATH`, and passed. A green clone run backs the commit's claim that it no longer needs git when there is no `.git`.
- The shipped bundle is unchanged and is still the one Prior qualified. Prior's pins need nothing new for C'''.
- Step 14 for C''' is stated by the dispatch as done (`~/.fp` reinstalled from `origin/fj-json-workbench`, 0 differences). This report does not re-check `~/.fp`.
- If step 20 needs `verdict=covered` literally, the review of `f8203e70` must be committed first. Then the coverage read at `--head f8203e70` should be repeated.

## Recommendations

- Orchestrator: record step 13 as repeated for C''' with the coverage gap stated. Once the review of `f8203e70` is committed, re-run `bin/fusion-review-coverage --since cd1b5522 --head f8203e70` in a clone to confirm `verdict=covered`.
- The low issue `261009-1636-…` (mtime-picked `carried-from`) is unchanged and not release-blocking.

## Filed Issues

- None. The dispatch expected the coverage gap, and the review that closes it is in progress.

## Sources

- Plan `261009-1021-plan-fj05-release-acceptance-of-13-0-0-with-the-claim-takeover.md` step 13
- `261009-2000-fj05-release-candidate-verification-at-26ada996.md` and its logs directory (template)
- Commit `f8203e70` (message, `--numstat`, diff of `migrate.test.ts` and `surface-growth.golden`)
- Review `261009-1958-reviewer-git-exit-sets-26ada996.md`, as the coverage tool reads it in the clone
- `hooks/scripts/run-tests.mjs`, `hooks/scripts/build.mjs:177` in the clone
- `Prior: tests/testdata/fusion-codec/UPSTREAM.json`, `Prior: tests/testdata/fusion-fj01/UPSTREAM.json` at `34a2710`
- Logs: `261009-2023-fj05-release-candidate-verification-at-f8203e70-logs/`, files `00`–`09` and `03a`, `03b`, `07b`, plus `pin-check.mjs` and `room.mjs`

## Open Questions

- [ ] Does step 20 need `verdict=covered` at C'''? If it does, commit the review of `f8203e70` and repeat the coverage read before step 20.

**Verification:** in clone `clone-C3` at `f8203e70`: `cd hooks && npm install && npm test` exit 0 (1156 passed, 14 skipped; the new node-only-PATH migrate test passed); `cd codec && npm ci` exit 0; `cd codec && CODEC_REQUIRE_GOLDENS=1 npm test` exit 0 (1810 passed, 0 skipped); `CODEC_REQUIRE_GOLDENS=1 npx vitest run src/__tests__/prior-mapping.test.ts --reporter=verbose` exit 0 (13/13 goldens); `git status --porcelain` exit 0, empty; `bin/fusion-review-coverage --since cd1b5522 --head f8203e70` exit 0 (`verdict=uncovered`, 3); control `--head 26ada996` exit 0 (`verdict=covered`); `git fetch origin main` exit 0; `git merge-base --is-ancestor origin/main f8203e70` exit 0; `node room.mjs` exit 0; `node pin-check.mjs` ×2 exit 0.
