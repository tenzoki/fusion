# Analysis: FJ05 step 13 repeated, the release candidate C' = `78680a11` verified in an isolated clone

**Date:** 2026-10-09 18:33
**Type:** Feasibility (release-candidate verification, plan step 13, repeated for a new candidate)
**Status:** Complete
**Requested by:** orchestrator, for work package `260928-1338-json-control-data-and-markdown-artefacts`
**Cross-references:** `261009-1021-plan-fj05-release-acceptance-of-13-0-0-with-the-claim-takeover.md` (step 13, step note "before step 13"), `261009-1626-fj05-release-candidate-verification-at-052932e2.md` (the run this one repeats), `261009-1735-citation-sweep-reads-a-git-output-over-1-mb-as-an-untracked-workbench-and-refuses-to-write.md` (closed `fixed` by `78680a11`), `261009-1636-in-a-fresh-clone-the-coverage-reads-carried-from-a-review-picked-by-checkout-order-not-the-newest.md`

## Question

Does C' = `78680a11` pass step 13's acceptance list in a clone nobody has worked in, checked the same way as C = `052932e2`? And how does each result differ from the `052932e2` report? Coverage is read and reported, but by dispatch it is not a blocker: the fix commit is expected to be unreviewed.

## Scope

| Tree | HEAD | Commit date | Branch | Tracking |
|---|---|---|---|---|
| Live tree (read only, no whole-tree command run) | `78680a11b454e91c33e2a727f9c8d02d956b408b` | 2026-10-09 17:46:27 +02:00 | `fj-json-workbench` | level with `origin/fj-json-workbench` (0 ahead, 0 behind). `git ls-remote` on GitHub gives `refs/heads/fj-json-workbench` = `78680a11`. The only modified file is `fusion-workbench/orchestrator-events.jsonl`, as at session start |
| Scratch clone `clone-C` | `78680a11b454e91c33e2a727f9c8d02d956b408b`, detached | 2026-10-09 17:46:27 +02:00 | none | `origin` re-pointed to `git@github.com:tenzoki/fusion.git` for the ancestry check only |
| Prior (read only) | `34a2710e22749e0dacf90a10f339b30de8067552` | 2026-10-09 16:13:47 +02:00 | `main` | Both pin files byte-equal to `34a2710` (`git diff 34a2710 -- <both>` empty). Unchanged since the `052932e2` run |

The clone was made with `git clone --no-hardlinks` from the live repository into the session scratchpad. C' is the live head, so one clone holds both the release candidate and every review over it. The earlier run needed a second clone (`clone-cov`) for that, and this run does not.

**Deviations from the literal step text.** They are the same as in the `052932e2` run:
- `hooks/package-lock.json` is gitignored. It was copied from the live tree before `npm install`. Its sha256 is `e7efb262…fbe961b1` on both sides, the same value as in the earlier run (log `01`).
- The codec's dependencies were installed with `npm ci` from its tracked lockfile (log `03a`).
- One extra read-only run, `CODEC_REQUIRE_GOLDENS=1 npx vitest run src/__tests__/prior-mapping.test.ts --reporter=verbose`, counts the goldens-required assertions by name (log `03b`).
- One more read-only run was added: a control coverage read with `--head 052932e2`, plus the non-workbench paths of each commit after `052932e2` (log `07b`).

Every listed command ran once. Nothing was retried.

**Versions** (log `00-versions.log`): node v25.7.0, npm 11.10.1, git 2.53.0, Claude Code 2.1.295, macOS 26.6.2 (25G83), arm64. These are the same as in the earlier run.

## Findings

### Acceptance, item by item

| # | Acceptance item (step 13) | Result | Evidence (log) |
|---|---|---|---|
| 1 | The hooks suite is green | **pass**. `npm install && npm test` exit 0. 67 files passed, 1 skipped. 1153 tests passed, 14 skipped (1167). The skipped file is `agent-dispatch-observation.test.ts`, as before. The new test `citation-sweep --write: … > writes into a tracked workbench whose git ls-files listing exceeds 1 MB` passed (1467 ms) | `02-hooks-npm-install-and-test.log` |
| 2 | The codec suite: all passed, 0 skipped | **pass**. `CODEC_REQUIRE_GOLDENS=1 npm test` exit 0. 22 files, 1810 tests passed, none skipped. 13 of 13 `is a Go-emitted golden (CODEC_REQUIRE_GOLDENS=1)` assertions passed | `03-codec-test-goldens-required.log`, `03b-…verbose….log` |
| 3 | The digest equals the one Prior qualified in step 10 | **pass**. `fb1703619c94bd2ed6ef8b753e70dd38e36dcb26da0775fb4e19274ed11bb66f`, 699 011 bytes. It equals the committed blob at C' and at C. The build printed `dist/fusion-record.js: unchanged` | `04-shasum-bundle.log` |
| 4 | The clone is clean after the suites | **pass**. `git status --porcelain` printed nothing. Only `codec/node_modules/`, `hooks/node_modules/` and `hooks/package-lock.json` are ignored. The hooks `npm test` compiles and syncs into `hooks/dist` (`hooks/scripts/run-tests.mjs`). So the changed `hooks/dist/citation-sweep.{js,d.ts}` rebuild byte for byte from `hooks/citation-sweep.ts` | `05-git-status-porcelain-after-suites.log` |
| 5 | Coverage reads `verdict=covered` | **not met, reported, not a blocker (by dispatch)**. `commits=83 reviews=121 unusable=25 uncovered=4 verdict=uncovered`. The four commits are listed below. The control read `--head 052932e2` in the same clone still gives `uncovered=0 verdict=covered` | `07-review-coverage.log`, `07b-…` |
| 6a | `origin/main` is an ancestor of C' | **pass**. `origin/main` = `48f0c9ff` (fusion 12.2.3) after `git fetch origin main` from GitHub. `git merge-base --is-ancestor origin/main 78680a11` exit 0 | `08-merge-base-is-ancestor.log` |
| 6b | Every room figure is at or above 0 | **pass**. See the table below. The smallest figure is still the `reviewer` dispatch path at 531 bytes | `09-growth-bound-room.log` |
| 7 | Any failure is a finding with an issue path | The one unmet item is item 5. The dispatch expected it and ruled it out as a blocker. No issue was filed, see `## Open Questions` | — |

### The coverage line, and what no review opened

```
anchor=workbench-root since=cd1b5522 head=78680a11 commits=83 reviews=121 unusable=25 uncovered=4 verdict=uncovered
  uncovered 78680a11 fix(citation-sweep): a git listing over 1 MB no longer reads as an untracked workbench
  uncovered b712d8a7 docs(workbench): FJ05 step 14 done, branch pushed and ~/.fp installed from 052932e2
  uncovered f38ad6d0 docs(workbench): FJ05 step 13, release candidate 052932e2 verified
  uncovered 47cf5289 docs(workbench): coverage pass up to the release candidate; C named
carried=hooks/dist/order.js
carried-from=…/261002-0926-reviewer-closing-pass-over-the-markdown-and-json-formats.md
```

| Commit | Paths outside `fusion-workbench/` | Release-relevant |
|---|---|---|
| `47cf5289` | none | no (workbench only) |
| `f38ad6d0` | none | no (workbench only) |
| `b712d8a7` | none | no (workbench only) |
| `78680a11` | `hooks/citation-sweep.ts`, `hooks/dist/citation-sweep.{d.ts,js}`, `hooks/lib/__tests__/citation-sweep.test.ts`, `hooks/lib/__tests__/fixtures/surface-growth.golden` | **yes. No review has opened it** |

This matches the expectation. **The only code commit after `052932e2` that no review opened is `78680a11`.** The other three change only `fusion-workbench/`. The four reviews that tile `cd1b5522..052932e2` are unchanged (G-A 63, G-B 12, G-C 1, coverage pass 4). No review in the stores declares a range that reaches past `052932e2`.

The `carried=` line comes from the same fresh-clone mtime effect described in `261009-1636-…`. It is unchanged and does not affect `verdict=`.

### Growth-bound room at C'

Measured by the unchanged `room.mjs` (copied into the logs directory).

| Bound | Unit | Total | Floor | Head-room | Budget | **Room** | Change from C |
|---|---|---|---|---|---|---|---|
| `agents/*.md` | bytes | 323 031 | 310 567 | 18 000 | 328 567 | **5 536** | none |
| `skills/*/SKILL.md` | bytes | 222 505 | 188 768 | 39 260 | 228 028 | **5 523** | none |
| hook test suite | lines | 24 870 | 24 037 | 4 835 | 28 872 | **4 002** | total +20, room −20 |
| dispatch path, tightest (`reviewer`) | bytes | 113 778 | 114 309 | 0 | 114 309 | **531** | none |

The other ten dispatch paths are byte-identical to the C run: analyst 750, implementation-planner 833, requirements-designer 855, document-editor 957, data-implementer 1 055, state-auditor 1 094, code-implementer 1 153, consultant 1 435, policy-curator 1 647, orchestrator 3 642. The +20 lines are the new test. That matches the commit message, which says "regenerated for the 20 added test lines; no baseline moved".

### Prior's pin files against C'

`pin-check.mjs` was run unchanged, with `78680a11` as the commit.

| Pin file (`Prior:` at `34a2710`) | Pinned commit | Entries | Equal | Differ |
|---|---|---|---|---|
| `tests/testdata/fusion-codec/UPSTREAM.json` | `dd4bf3d4` | 413 | 412 | 1: `fixtures/prior/REQUESTS.md` |
| `tests/testdata/fusion-fj01/UPSTREAM.json` (`bundle_digest` `sha256:fb170361…`) | `dd4bf3d4` | 715 | 714 | 1: `codec/fixtures/prior/REQUESTS.md` |

Both differences are the same file and the same hashes as at C: pinned `44cad87d…`, at C' `a577780c…`. No path in `codec/` moved between C and C' (log `06`).

### Differences from the `052932e2` report

| Item | At C = `052932e2` | At C' = `78680a11` | Cause |
|---|---|---|---|
| Hooks tests passed / total | 1152 / 1166 | **1153 / 1167** | the one new citation-sweep test |
| Hooks test files | 67 passed, 1 skipped | same | the test went into an existing file |
| Codec tests | 1810 passed, 0 skipped | same | `78680a11` does not touch `codec/` |
| Goldens-required assertions | 13 of 13 | same | — |
| Bundle digest | `fb170361…`, 699 011 B | same | — |
| Clean tree after suites | clean | clean | — |
| Coverage | `commits=79 uncovered=0 verdict=covered` | **`commits=83 uncovered=4 verdict=uncovered`** | `78680a11` is unreviewed; the other three are workbench-only |
| Coverage clone | separate `clone-cov` at `47cf5289` | the same clone as the suites | C' is the live head and holds every review |
| `origin/main` ancestor | yes, `48f0c9ff` | yes, `48f0c9ff` | — |
| Hook-test surface | 24 850 lines, room 4 022 | **24 870 lines, room 4 002** | +20 test lines |
| Other room figures | as listed | identical | — |
| Prior pin check | 412/413, 714/715, only `REQUESTS.md` | identical | — |
| Lockfile sha256, tool versions | `e7efb262…`; node 25.7.0 etc. | identical | — |
| `npm install` audit (hooks / codec) | 9 / 7 advisories | 9 / 7 advisories | — |

## Implications

- C' = `78680a11` meets every step-13 item except coverage. In code, it differs from C by one unreviewed commit, which touches only the citation sweep and its test.
- The shipped bundle is unchanged and is still the one Prior qualified. Prior's pins need nothing new for C'.
- Step 14 was already repeated for C', before this verification. The dispatch states this. This report does not re-check `~/.fp`.
- If step 20 requires `verdict=covered` literally, a reviewer pass over `052932e2..78680a11` is still needed. That pass covers one code commit of 5 files.

## Recommendations

- Orchestrator: record step 13 as repeated for C' with the coverage gap stated. Then decide whether a short reviewer pass over `052932e2..78680a11` should run before step 20. Route it to the reviewer if so.
- The low issue `261009-1636-…` (mtime-picked `carried-from`) is unchanged and not release-blocking.

## Filed Issues

- None. The coverage gap was expected by the dispatch and is reported here rather than filed. See `## Open Questions`.

## Sources

- Plan `261009-1021-plan-fj05-release-acceptance-of-13-0-0-with-the-claim-takeover.md` `## Implementation Steps` step 13, and the step notes
- `261009-1626-fj05-release-candidate-verification-at-052932e2.md` and its logs directory
- Commit `78680a11` (message and diff); `hooks/scripts/run-tests.mjs` (compile and sync into `hooks/dist`)
- `bin/fusion-review-coverage` header
- `hooks/lib/__tests__/surface-growth-bound.test.ts`, `hooks/lib/__tests__/rules-emission-golden.test.ts`, `hooks/lib/__tests__/fixtures/dispatch-path.baseline`
- `Prior: tests/testdata/fusion-codec/UPSTREAM.json`, `Prior: tests/testdata/fusion-fj01/UPSTREAM.json` at `34a2710`
- Logs: `261009-1833-fj05-release-candidate-verification-at-78680a11-logs/`, files `00`–`09` and `07b`, plus `pin-check.mjs` and `room.mjs`

## Open Questions

- [ ] Does step 20 need `verdict=covered` at C'? If it does, a reviewer pass over `052932e2..78680a11` must land first. If the orchestrator wants the gap tracked, the issue should be filed at that point.

**Verification:** in clone `clone-C` at `78680a11`: `cd hooks && npm install && npm test` exit 0 (1153 passed, 14 skipped); `cd codec && npm ci` exit 0; `cd codec && CODEC_REQUIRE_GOLDENS=1 npm test` exit 0 (1810 passed, 0 skipped); `CODEC_REQUIRE_GOLDENS=1 npx vitest run src/__tests__/prior-mapping.test.ts --reporter=verbose` exit 0; `git status --porcelain` exit 0, empty; `bin/fusion-review-coverage --since cd1b5522 --head 78680a11` exit 0 (`verdict=uncovered`, 4); `git merge-base --is-ancestor origin/main 78680a11` exit 0; `node room.mjs` exit 0; `node pin-check.mjs` ×2 exit 0.
