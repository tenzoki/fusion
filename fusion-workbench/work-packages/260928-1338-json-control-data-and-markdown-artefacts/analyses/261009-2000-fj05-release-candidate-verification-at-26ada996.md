# Analysis: FJ05 step 13 repeated, the release candidate C'' = `26ada996` verified in an isolated clone

**Date:** 2026-10-09 20:00
**Type:** Feasibility (release-candidate verification, plan step 13, repeated for a new candidate)
**Status:** Complete
**Requested by:** orchestrator, for work package `260928-1338-json-control-data-and-markdown-artefacts`
**Cross-references:** `261009-1021-plan-fj05-release-acceptance-of-13-0-0-with-the-claim-takeover.md` (step 13), `261009-1833-fj05-release-candidate-verification-at-78680a11.md` (the run this one repeats), `261009-1855-reviewer-citation-sweep-buffer-fix-78680a11.md` (findings F1 and F3, fixed by `26ada996`), `261009-1958-reviewer-git-exit-sets-26ada996.md` (the parallel review, not in the clone), `261009-1636-in-a-fresh-clone-the-coverage-reads-carried-from-a-review-picked-by-checkout-order-not-the-newest.md`

## Question

Does C'' = `26ada996` pass step 13's acceptance list in a clone nobody has worked in, checked the same way as C' = `78680a11`? How does each result differ from the `78680a11` report? Coverage is read and reported. By dispatch it is not a blocker, because the review of `26ada996` runs in parallel.

## Scope

| Tree | HEAD | Commit date | Branch | Tracking |
|---|---|---|---|---|
| Live tree (read only, no whole-tree command run) | `26ada996b301d9d9cb626f146e419896c0f7bfc7` | 2026-10-09 19:11:02 +02:00 | `fj-json-workbench` | level with `origin/fj-json-workbench` (0 ahead, 0 behind). `git ls-remote` on GitHub gives `refs/heads/fj-json-workbench` = `26ada996` |
| Scratch clone `clone-C2` | `26ada996b301d9d9cb626f146e419896c0f7bfc7`, detached | 2026-10-09 19:11:02 +02:00 | none | `origin` re-pointed to `git@github.com:tenzoki/fusion.git` for the ancestry check only |
| Prior (read only) | `34a2710e22749e0dacf90a10f339b30de8067552` | 2026-10-09 16:13:47 +02:00 | `main` | Both pin files byte-equal to `34a2710` (`git diff 34a2710 -- <both>` empty). Unchanged since the two earlier runs |

The clone was made at 19:53 with `git clone --no-hardlinks` from the live repository into the session scratchpad. C'' is the live head, so one clone holds the candidate and every committed review, as in the `78680a11` run.

**Deviations from the literal step text.** They are the same as in the `78680a11` run:
- `hooks/package-lock.json` is gitignored. It was copied from the live tree before `npm install`. Its sha256 is `e7efb262…fbe961b1` on both sides, the same value as before (log `01`).
- The codec's dependencies were installed with `npm ci` from its tracked lockfile (log `03a`).
- One extra read-only run, the verbose `prior-mapping.test.ts` run with `CODEC_REQUIRE_GOLDENS=1`, counts the goldens-required assertions by name (log `03b`).
- One control coverage read, now with `--head 78680a11`, plus the non-workbench paths of each commit after `78680a11` (log `07b`).

Every listed command ran once. Nothing was retried. `pin-check.mjs` and `room.mjs` are byte-identical copies of the previous run's scripts.

**Versions** (log `00-versions.log`): node v25.7.0, npm 11.10.1, git 2.53.0, Claude Code 2.1.295, macOS 26.6.2 (25G83), arm64. All the same as before.

## Findings

### Acceptance, item by item

| # | Acceptance item (step 13) | Result | Evidence (log) |
|---|---|---|---|
| 1 | The hooks suite is green | **pass**. `npm install && npm test` exit 0. 67 files passed, 1 skipped (`agent-dispatch-observation.test.ts`). 1155 tests passed, 14 skipped (1169). Both new tests passed: `citation-sweep --write … > refuses a damaged index and a missing HEAD tree as git-failed, exit 4, and leaves an uncommitted edit as it was` (1816 ms) and `bin/fusion-migrate … > lists every path of an ignored listing over 1 MB instead of dropping the listing` (1744 ms) | `02-hooks-npm-install-and-test.log` |
| 2 | The codec suite: all passed, 0 skipped | **pass**. `CODEC_REQUIRE_GOLDENS=1 npm test` exit 0. 22 files, 1810 tests passed, none skipped. 13 of 13 `is a Go-emitted golden (CODEC_REQUIRE_GOLDENS=1)` assertions passed | `03-…`, `03b-…` |
| 3 | The digest equals the one Prior qualified in step 10 | **pass**. `fb1703619c94bd2ed6ef8b753e70dd38e36dcb26da0775fb4e19274ed11bb66f`, 699 011 bytes. It equals the committed blob at C'', C' and C. The build printed `dist/fusion-record.js: unchanged` | `04-shasum-bundle.log` |
| 4 | The clone is clean after the suites | **pass**. `git status --porcelain` printed nothing. Only `codec/node_modules/`, `hooks/node_modules/` and `hooks/package-lock.json` are ignored. The hooks test run recompiles into `hooks/dist`, so the changed `hooks/dist/citation-sweep.*` and `hooks/dist/migrate.*` rebuild byte for byte from their sources | `05-git-status-porcelain-after-suites.log` |
| 5 | Coverage reads `verdict=covered` | **not met, reported, not a blocker (by dispatch)**. `commits=87 reviews=122 unusable=25 uncovered=4 verdict=uncovered`. The control read `--head 78680a11` in the same clone gives `uncovered=0 verdict=covered` | `07-review-coverage.log`, `07b-…` |
| 6a | `origin/main` is an ancestor of C'' | **pass**. `origin/main` = `48f0c9ff` (fusion 12.2.3) after `git fetch origin main` from GitHub. `git merge-base --is-ancestor origin/main 26ada996` exit 0 | `08-merge-base-is-ancestor.log` |
| 6b | Every room figure is at or above 0 | **pass**. See the table below. The smallest figure is still the `reviewer` dispatch path at 531 bytes | `09-growth-bound-room.log` |
| 7 | Any failure is a finding with an issue path | The one unmet item is item 5. The dispatch expected it and ruled it out as a blocker. No issue filed | — |

### The coverage line, and what no committed review opened

```
anchor=workbench-root since=cd1b5522 head=26ada996 commits=87 reviews=122 unusable=25 uncovered=4 verdict=uncovered
  uncovered 26ada996 fix(citation-sweep,migrate): a failing git call is a refusal, never an answer
  uncovered 5511c509 docs(workbench): review of 78680a11, the fix holds and three older defects filed
  uncovered 035f7c1d docs(workbench): FJ05 step 13 repeated, release candidate 78680a11 verified
  uncovered e6a5dfc5 docs(workbench): FJ05 step 15 note, the axibra trial migration and one finding
carried=hooks/dist/order.js
carried-from=…/261002-0926-reviewer-closing-pass-over-the-markdown-and-json-formats.md
```

| Commit | Paths outside `fusion-workbench/` | Release-relevant |
|---|---|---|
| `e6a5dfc5` | none | no (workbench only) |
| `035f7c1d` | none | no (workbench only) |
| `5511c509` | none | no (workbench only) |
| `26ada996` | `hooks/citation-sweep.ts`, `hooks/migrate.ts`, `hooks/dist/citation-sweep.{d.ts,js}`, `hooks/dist/migrate.{d.ts,js}`, `hooks/lib/__tests__/citation-sweep.test.ts`, `hooks/lib/__tests__/migrate.test.ts`, `hooks/lib/__tests__/fixtures/surface-growth.golden` | **yes. No committed review opens it** |

The gap from the `78680a11` run is closed. Review `261009-1855-…` (range `052932e2..78680a11`, `covers=4`, `not-opened=none`) now covers `78680a11` and the three workbench commits before it. The control read at `--head 78680a11` confirms it: `uncovered=0`.

**The only code commit no committed review opens is `26ada996`.** The other three are workbench-only.

The parallel review `261009-1958-reviewer-git-exit-sets-26ada996.md` (header `Reviewed-range: 78680a11..26ada996`) appeared in the live tree at 19:58, after the clone was made. It is uncommitted, so it is not in `clone-C2` and not in this reading. Its declared range would reach all four commits. Whether it brings `verdict=covered` can only be read once it is committed. This report does not read it in the live tree, because that would be a whole-tree command.

The `carried=` line is the same fresh-clone mtime effect described in `261009-1636-…`. It is unchanged and does not affect `verdict=`.

### Growth-bound room at C''

| Bound | Unit | Total | Floor | Head-room | Budget | **Room** | Change from C' |
|---|---|---|---|---|---|---|---|
| `agents/*.md` | bytes | 323 031 | 310 567 | 18 000 | 328 567 | **5 536** | none |
| `skills/*/SKILL.md` | bytes | 222 505 | 188 768 | 39 260 | 228 028 | **5 523** | none |
| hook test suite | lines | 24 909 | 24 037 | 4 835 | 28 872 | **3 963** | total +39, room −39 |
| dispatch path, tightest (`reviewer`) | bytes | 113 778 | 114 309 | 0 | 114 309 | **531** | none |

The other ten dispatch paths are byte-identical to the C' run: analyst 750, implementation-planner 833, requirements-designer 855, document-editor 957, data-implementer 1 055, state-auditor 1 094, code-implementer 1 153, consultant 1 435, policy-curator 1 647, orchestrator 3 642.

The +39 lines are the two tests: `citation-sweep.test.ts` +25, `migrate.test.ts` +15 −1 (`git show --numstat`). No baseline file changed between `78680a11` and `26ada996` (`surface-growth-bound.test.ts`, `dispatch-path.baseline`, `agents/`, `skills/`, `rules/`, `CLAUDE.md` all have an empty diff). That matches the commit message: "The surface-growth golden is regenerated for the added test lines; no baseline moved."

### Prior's pin files against C''

| Pin file (`Prior:` at `34a2710`) | Pinned commit | Entries | Equal | Differ |
|---|---|---|---|---|
| `tests/testdata/fusion-codec/UPSTREAM.json` | `dd4bf3d4` | 413 | 412 | 1: `fixtures/prior/REQUESTS.md` |
| `tests/testdata/fusion-fj01/UPSTREAM.json` (`bundle_digest` `sha256:fb170361…`) | `dd4bf3d4` | 715 | 714 | 1: `codec/fixtures/prior/REQUESTS.md` |

Both differences are the same file and the same hashes as at C and C': pinned `44cad87d…`, at C'' `a577780c…`. No path in `codec/` changed between `78680a11` and `26ada996` (0 paths, log `06`).

### Differences from the `78680a11` report

| Item | At C' = `78680a11` | At C'' = `26ada996` | Cause |
|---|---|---|---|
| Hooks tests passed / total | 1153 / 1167 | **1155 / 1169** | two new tests, one in citation-sweep, one in migrate |
| Hooks test files | 67 passed, 1 skipped | same | both tests went into existing files |
| Rebuilt `hooks/dist` files | `citation-sweep.*` | **`citation-sweep.*` and `migrate.*`** | `26ada996` also changes `hooks/migrate.ts` |
| Codec tests | 1810 passed, 0 skipped | same | `26ada996` does not touch `codec/` |
| Goldens-required assertions | 13 of 13 | same | — |
| Bundle digest | `fb170361…`, 699 011 B | same | — |
| Clean tree after suites | clean | clean | — |
| Coverage | `commits=83 reviews=121 uncovered=4` | **`commits=87 reviews=122 uncovered=4`** | the 4 uncovered are now `26ada996` and three workbench-only commits. `78680a11` is covered by `261009-1855-…` |
| Control coverage read | `--head 052932e2`: covered | **`--head 78680a11`: covered** | the previous candidate is now fully reviewed |
| Parallel review | none | **`261009-1958-…` exists, uncommitted, not in the clone** | the review of `26ada996` is still landing |
| `origin/main` ancestor | yes, `48f0c9ff` | yes, `48f0c9ff` | — |
| Hook-test surface | 24 870 lines, room 4 002 | **24 909 lines, room 3 963** | +39 test lines |
| Other room figures | as listed | identical | — |
| Prior pin check | 412/413, 714/715, only `REQUESTS.md` | identical | — |
| Lockfile sha256, tool versions | `e7efb262…`; node 25.7.0 etc. | identical | — |
| `npm` audit (hooks / codec) | 9 / 7 advisories | 9 / 7 advisories | — |
| Clone name | `clone-C` | `clone-C2` | a new clone; the scratchpad already held the earlier one |

## Implications

- C'' = `26ada996` meets every step-13 item except coverage. In code, it differs from C' by one commit. That commit touches only the citation sweep, the migrate helper and their tests.
- The shipped bundle is unchanged and is still the one Prior qualified. Prior's pins need nothing new for C''.
- Step 14 for C'' is stated by the dispatch as done (`~/.fp` reinstalled, 0 differences against `git archive 26ada996`). This report does not re-check `~/.fp`.
- If step 20 needs `verdict=covered` literally, the parallel review `261009-1958-…` must be committed first. Then the coverage read at `--head 26ada996` should be repeated.

## Recommendations

- Orchestrator: record step 13 as repeated for C'' with the coverage gap stated. Once `261009-1958-…` is committed, re-run `bin/fusion-review-coverage --since cd1b5522 --head 26ada996` in a clone to confirm `verdict=covered`.
- The low issue `261009-1636-…` (mtime-picked `carried-from`) is unchanged and not release-blocking.

## Filed Issues

- None. The coverage gap was expected by the dispatch, and the review that closes it already exists.

## Sources

- Plan `261009-1021-plan-fj05-release-acceptance-of-13-0-0-with-the-claim-takeover.md` step 13
- `261009-1833-fj05-release-candidate-verification-at-78680a11.md` and its logs directory (template)
- Commit `26ada996` (message, `--numstat`, diff paths)
- Reviews `261009-1855-reviewer-citation-sweep-buffer-fix-78680a11.md` (as read by the coverage tool in the clone) and `261009-1958-reviewer-git-exit-sets-26ada996.md` (header only, live tree)
- `Prior: tests/testdata/fusion-codec/UPSTREAM.json`, `Prior: tests/testdata/fusion-fj01/UPSTREAM.json` at `34a2710`
- Logs: `261009-2000-fj05-release-candidate-verification-at-26ada996-logs/`, files `00`–`09` and `07b`, plus `pin-check.mjs` and `room.mjs`

## Open Questions

- [ ] Does step 20 need `verdict=covered` at C''? If it does, commit `261009-1958-…` and repeat the coverage read before step 20.

**Verification:** in clone `clone-C2` at `26ada996`: `cd hooks && npm install && npm test` exit 0 (1155 passed, 14 skipped); `cd codec && npm ci` exit 0; `cd codec && CODEC_REQUIRE_GOLDENS=1 npm test` exit 0 (1810 passed, 0 skipped); `CODEC_REQUIRE_GOLDENS=1 npx vitest run src/__tests__/prior-mapping.test.ts --reporter=verbose` exit 0 (13/13 goldens); `git status --porcelain` exit 0, empty; `bin/fusion-review-coverage --since cd1b5522 --head 26ada996` exit 0 (`verdict=uncovered`, 4); control `--head 78680a11` exit 0 (`verdict=covered`); `git fetch origin main` exit 0; `git merge-base --is-ancestor origin/main 26ada996` exit 0; `node room.mjs` exit 0; `node pin-check.mjs` ×2 exit 0.
