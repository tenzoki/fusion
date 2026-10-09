# Analysis: FJ05 step 13, the release candidate C = `052932e2` verified in an isolated clone

**Date:** 2026-10-09 16:26
**Type:** Feasibility (release-candidate verification, plan step 13)
**Status:** Complete
**Requested by:** orchestrator, for work package `260928-1338-json-control-data-and-markdown-artefacts`
**Cross-references:** `261009-1021-plan-fj05-release-acceptance-of-13-0-0-with-the-claim-takeover.md` (step 13 and its step note "before step 13"), `261009-1624-reviewer-coverage-pass-over-4e1e1b47-to-052932e2.md`, `261009-1624-step-13-cannot-read-covered-in-a-clone-of-c-because-the-commit-that-lands-the-last-review-is-never-covered-by-it.md`, `261009-1636-in-a-fresh-clone-the-coverage-reads-carried-from-a-review-picked-by-checkout-order-not-the-newest.md`

## Question

Does C = `052932e2` pass step 13's acceptance list in a clone nobody has worked in? That covers green suites, the qualified bundle digest, a clean tree after the build, `verdict=covered`, `origin/main` as an ancestor, and no negative room on any growth bound. A further question comes from the dispatch: do Prior's two pin files still match C except for `codec/fixtures/prior/REQUESTS.md`?

## Scope

| Tree | HEAD | Commit date | Branch | Tracking |
|---|---|---|---|---|
| Live tree (read only, no whole-tree command run) | `47cf5289389a4195f8bc20d20f9597c6c05da7a0` | 2026-10-09 16:26:04 +02:00 | `fj-json-workbench` | 24 ahead, 0 behind `origin/fj-json-workbench` (`d398ced1`). The only file modified at session start was `fusion-workbench/orchestrator-events.jsonl` |
| Scratch clone `clone-C` | `052932e24684a51cc9b413952163ed0ffad28a86`, detached | 2026-10-09 16:20:54 +02:00 | none | `origin` re-pointed to `git@github.com:tenzoki/fusion.git` for the ancestry check only |
| Scratch clone `clone-cov` | `47cf5289389a4195f8bc20d20f9597c6c05da7a0`, detached | 2026-10-09 16:26:04 +02:00 | none | n/a |
| Prior (read only) | `34a2710e22749e0dacf90a10f339b30de8067552` | 2026-10-09 16:13:47 +02:00 | `main` | Both pin files byte-equal to `34a2710` (`git diff 34a2710 -- <both>` empty). Other files in the working tree are modified, and none of them was read |

Both clones were made with `git clone --no-hardlinks` from the live repository into the session scratchpad. The only commit between C and the live head is `47cf5289`, and it touches only `fusion-workbench/` (`git diff --stat 052932e2 HEAD -- . ':!fusion-workbench'` is empty).

**Deviations from the literal step text, stated rather than hidden:**
- `hooks/package-lock.json` is gitignored and absent from a clone. It was copied from the live tree before `npm install` (sha256 `e7efb262…fbe961b1` on both sides, log `01`).
- The codec's dependencies were installed with `npm ci` from its tracked lockfile, because the step lists no install for `codec/` and a clone has no `node_modules` (log `03a`).
- One additional read-only run, `CODEC_REQUIRE_GOLDENS=1 npx vitest run src/__tests__/prior-mapping.test.ts --reporter=verbose`, counts the goldens-required assertions by name (log `03b`). It is a count, not a retry. Every listed command ran once.

**Versions** (log `00-versions.log`): node v25.7.0, npm 11.10.1, git 2.53.0, Claude Code 2.1.295, macOS 26.6.2 (25G83), arm64.

## Findings

### Acceptance, item by item

| # | Acceptance item (step 13) | Result | Evidence (log) |
|---|---|---|---|
| 1 | The hooks suite is green | **pass**. `npm install && npm test` exit 0: 67 files passed, 1 skipped; 1152 tests passed, 14 skipped. The skipped file is `agent-dispatch-observation.test.ts`, which runs only under `FUSION_AGENT_RUN=1` (step 16's observation suite) | `02-hooks-npm-install-and-test.log` |
| 2 | The codec suite: all passed, 0 skipped | **pass**. `CODEC_REQUIRE_GOLDENS=1 npm test` exit 0: 22 files, 1810 tests passed, none skipped. The verbose count shows 13 of 13 `is a Go-emitted golden (CODEC_REQUIRE_GOLDENS=1)` assertions passed | `03-codec-test-goldens-required.log`, `03b-…verbose….log` |
| 3 | The digest equals the one Prior qualified in step 10 | **pass**. `shasum -a 256 codec/dist/fusion-record.js` after both suites gives `fb1703619c94bd2ed6ef8b753e70dd38e36dcb26da0775fb4e19274ed11bb66f`, 699 011 bytes. That equals the committed blob at C and the digest in `codec/fixtures/prior/REQUESTS.md` `### Prior's answer to 63 and 64 at 34a2710` | `04-shasum-bundle.log` |
| 4 | The clone is clean after the suites | **pass**. `git status --porcelain` printed nothing. Only the ignored `codec/node_modules/`, `hooks/node_modules/` and `hooks/package-lock.json` exist. The committed bundle and `hooks/dist` therefore rebuild byte for byte | `05-git-status-porcelain-after-suites.log` |
| 5 | Coverage reads `verdict=covered` | **pass**. `commits=79 reviews=121 unusable=25 uncovered=0 verdict=covered`, run in `clone-cov` at `47cf5289` | `07-review-coverage.log` |
| 6a | `origin/main` is an ancestor of C | **pass**. After `git fetch origin main` from GitHub, `origin/main` = `48f0c9ff` (fusion 12.2.3), and `git merge-base --is-ancestor origin/main 052932e2` exits 0 | `08-merge-base-is-ancestor.log` |
| 6b | Every room figure is at or above 0 | **pass**. See the table below. The smallest figure is the `reviewer` dispatch path, at 531 bytes | `09-growth-bound-room.log` |
| 7 | Any failure is a finding with an issue path | No acceptance item failed. One observation is filed as a low issue (below) | — |

### The coverage line

```
anchor=workbench-root since=cd1b5522 head=052932e2 commits=79 reviews=121 unusable=25 uncovered=0 verdict=covered
carried=hooks/dist/order.js
carried-from=261002-0926-reviewer-closing-pass-over-the-markdown-and-json-formats.md
```

The `carried=` line is an effect of the clone, not a coverage gap. The helper picks the "newest" review by file mtime. A fresh clone stamps every file within milliseconds, in checkout order, so the helper chose a review from another package dated 261002. The real newest review, `261009-1624-reviewer-coverage-pass-over-4e1e1b47-to-052932e2.md`, declares `not-opened=none` and would carry nothing. `verdict=` depends only on `uncovered`, so item 5 is unaffected. Filed as `261009-1636-in-a-fresh-clone-the-coverage-reads-carried-from-a-review-picked-by-checkout-order-not-the-newest.md`.

The four reviews that tile the range are G-A (`cd1b5522..031645d2`, covers 63), G-B (`031645d2..4e1e1b47`, covers 12), G-C (`95fecad4..a563ff6a`, covers 1) and the coverage pass (`4e1e1b47..052932e2`, covers 4).

### Growth-bound room at C

The figures were measured by `room.mjs` (kept in the logs directory). It reads each baseline map and head-room constant from `hooks/lib/__tests__/surface-growth-bound.test.ts`, the dispatch-path rows from `hooks/lib/__tests__/fixtures/dispatch-path.baseline`, and `DISPATCH_HEAD_ROOM` from `hooks/lib/__tests__/rules-emission-golden.test.ts`. It does the same arithmetic as `helpers/growth-bound.ts` `growth()`. Room = budget − total.

| Bound | Unit | Total | Floor | Head-room | Budget | **Room** |
|---|---|---|---|---|---|---|
| `agents/*.md` | bytes | 323 031 | 310 567 | 18 000 | 328 567 | **5 536** |
| `skills/*/SKILL.md` | bytes | 222 505 | 188 768 | 39 260 | 228 028 | **5 523** |
| hook test suite | lines | 24 850 | 24 037 | 4 835 | 28 872 | **4 022** |
| dispatch path, tightest (`reviewer`) | bytes | 113 778 | 114 309 | 0 | 114 309 | **531** |

The other ten dispatch paths have more room: analyst 750, implementation-planner 833, requirements-designer 855, document-editor 957, data-implementer 1 055, state-auditor 1 094, code-implementer 1 153, consultant 1 435, policy-curator 1 647, orchestrator 3 642. The green `surface-growth-bound.test.ts` and `rules-emission-golden.test.ts` in log `02` agree with these signs.

### Prior's pin files against C

Every entry of both pin files was hashed against `git show 052932e2:<prefix><path>` with `pin-check.mjs` (kept in the logs directory). The prefix is `codec/` for `fusion-codec`, because that pin's paths are relative to the codec directory, and nothing for `fusion-fj01`.

| Pin file (`Prior:` at `34a2710`) | Pinned commit | Entries | Equal | Differ |
|---|---|---|---|---|
| `tests/testdata/fusion-codec/UPSTREAM.json` | `dd4bf3d4` | 413 | 412 | 1: `fixtures/prior/REQUESTS.md` |
| `tests/testdata/fusion-fj01/UPSTREAM.json` (`bundle_digest` `sha256:fb170361…`) | `dd4bf3d4` | 715 | 714 | 1: `codec/fixtures/prior/REQUESTS.md` |

Both differences are the same file: pinned `44cad87d…`, at C `a577780c…`. That is the expected append-only fixture text, as `### Prior's answer to 63 and 64 at 34a2710` predicts. `codec/dist/fusion-record.js` is equal to the pin. **No other entry differs, so there is no finding and no stop** (log `06`).

## Implications

- C = `052932e2` meets every item of step 13. Step 14 (push and reinstall `~/.fp` from C) has no blocker from this step.
- The bundle that ships is the bundle Prior qualified, byte for byte. The only pinned file that moved is fixture prose.
- The reviewer dispatch path has 531 bytes of room. That is the closest margin before release. Any byte added to `CLAUDE.md` or to an always-on rule is charged to all eleven paths.
- The live tree's local `main` is `4dc1ea13`, behind `origin/main` `48f0c9ff`. Step 20 sets `main` to C, and C descends from `48f0c9ff`, so this has no effect. It is noted so that nobody reads the local `main` as the release line.
- `npm install` in `hooks/` reports 9 audit advisories (3 moderate, 4 high, 2 critical) against the copied lockfile (log `02`, head). They are devDependencies of the test toolchain, nothing in them ships in `hooks/dist`, and step 13 does not judge them. They were not analysed further.

## Recommendations

- Orchestrator: mark step 13 done and continue with step 14 on the user's approval.
- Code-implementer, later and not release-blocking: the low issue on the coverage helper's recency order. It should order by the basename stamp, or by commit time from `git log`, rather than by mtime.

## Filed Issues

- `261009-1636-in-a-fresh-clone-the-coverage-reads-carried-from-a-review-picked-by-checkout-order-not-the-newest.md`: `carried=` draws on a review picked by checkout mtime in a fresh clone. Low.

## Sources

- Plan `261009-1021-plan-fj05-release-acceptance-of-13-0-0-with-the-claim-takeover.md` `## Implementation Steps` step 13, and the step notes at its end
- `codec/fixtures/prior/REQUESTS.md` `### Prior's answer to 63 and 64 at 34a2710` (at C)
- `hooks/lib/review-coverage.ts` (report builder, mtime sort); `bin/fusion-review-coverage` header
- `hooks/lib/__tests__/surface-growth-bound.test.ts`, `hooks/lib/__tests__/rules-emission-golden.test.ts` `dispatch-path byte bound`, `hooks/lib/__tests__/helpers/growth-bound.ts`
- `README-hooks.md` `### Growth bounds on the shipped text`
- `Prior: tests/testdata/fusion-codec/UPSTREAM.json`, `Prior: tests/testdata/fusion-fj01/UPSTREAM.json` at `34a2710`
- Logs: `261009-1626-fj05-release-candidate-verification-at-052932e2-logs/`, files `00`–`09`, plus `pin-check.mjs` and `room.mjs`

## Open Questions

- None for step 13.
