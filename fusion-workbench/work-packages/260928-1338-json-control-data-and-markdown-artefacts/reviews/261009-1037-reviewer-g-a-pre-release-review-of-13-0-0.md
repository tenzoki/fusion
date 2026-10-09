# Review G-A: the pre-release review of fusion 13.0.0, `cd1b5522..031645d2`

**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Reviewed-range:** `cd1b5522..031645d2`
**Not-opened:** none
**Review domain:** code
**Work-item:** 260928-1338-json-control-data-and-markdown-artefacts
**Plan:** 261009-1021-plan-fj05-release-acceptance-of-13-0-0-with-the-claim-takeover.md (gate G-A, ahead of step 4)

**What the range is.** 63 commits by `bin/fusion-review-coverage --since cd1b5522 --head 031645d2`. 19 of them change files outside `fusion-workbench/`: the ten FJ03d review fixes `e29fb624`..`85ea803b` (on `fj03d`, brought in by the merge `6f37d798`, whose tree outside the workbench equals `85ea803b`'s, so the merge resolved nothing by hand), `99eef20d`, `e7695d9c`, the defect plan's `69ee56f8`, `f2e8ea4b`, `89471d97`, `495aca7d`, `308f7a66`, `ee3a3c19`, and `f37b6194`. Outside the workbench the range changes 55 files (+1 612 −313). Every one of the 55 was opened in its commit's diff; the workbench-only commits were read by subject and file list, the plan and the analysis package's narrative in full. The uncommitted edits of the two agents working in parallel are not part of the range and were not read.

**The carried not-opened list is discharged.** The 22 compiled files the last review left unopened, and every other file under `hooks/dist/`, are the build output of their sources at `031645d2`: in a scratch clone at that commit, `npm install` then `npm run build` left `git status --porcelain` empty, and a fresh `tsc -p tsconfig.json --outDir <elsewhere>` compared with `diff -rq` against `hooks/dist/` found no difference. The `codec/dist/` bundle is not in the range (`git diff --stat cd1b5522 031645d2 -- codec/dist` is empty) and hashes `c76bbce9cc86634f5e9c227e8496511dc71eb845768704f43e68200ab841e52e`, the qualified digest.

## Summary

The code in the range does what its commit messages say. The plan-step reader, the `--evidence` binding on a finish, the legacy refusal through `legacyLine`, the unreadable-control reporting, the discussion exclusion and the migration subtree in staging drift each have a case that fails without them, and the compiled tree matches the sources. Two medium findings block the release under the plan: the closing coverage read anchors a migrated package at the migration commit and falls back to the session anchor when its lookup comes back empty; and `/fusion:cadence` compares UTC event dates with local dates, which also makes one install case depend on the hour. The hooks suite was red at `031645d2` on five store-prefixed citations in a workbench narrative; `cc30475e`, after the range, respelled them, so no issue is filed for it. Three low findings are a header/code mismatch, an unchecked `--evidence` on a drop and an unassigned transition on the reconcile route.

## Totals

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 0 |
| Medium | 3 (one already fixed after the range) |
| Low | 3 |

Six findings, five issue files, all stamped 261009-1037 in this package's issue store; C1 has none, being fixed.

## What was run

- **Scratch clone** of this repository at `031645d2`, entered by absolute `cd` and `pwd`. Nothing ran in the live tree except read-only `git` and the `bin/fusion-review-coverage` / `bin/fusion-record list` reads.
- `cd hooks && npm install && npm run build`, then `git status --porcelain`: empty. Fresh `tsc` to a separate directory, `diff -rq` against `hooks/dist/`: empty.
- `cd hooks && npm test`: 1 145 passed, **1 failed**, 12 skipped (the opt-in observation file). The failure is C1.
- `cd codec && npm install && CODEC_REQUIRE_GOLDENS=1 npm test`: 1 700 passed, 0 skipped, 21 files.
- `git status --porcelain` after both suites: empty, so the committed `hooks/dist/` and bundle are reproducible.
- **Not run:** the opt-in observation suite (`FUSION_AGENT_RUN=1`); it costs model runs and is plan step 16's.

## Findings by theme

### A. The closure of a work package

**A1. The closing coverage read anchors a migrated package at the migration commit, and an empty `--since` falls back to the session anchor in silence. Medium.**
`agents/orchestrator.md` `## Closing a work package` step 2, from `ee3a3c19`: `--since` is "the commit that filed the item (`git log --diff-filter=A --format=%h -- <container>/package.json`)". For this very package that command prints `95720e4c`, the migration commit of 2026-10-06; the narrative was filed at `d84b8dfd` on 2026-09-28. Every package a v12 project migrates with lands there, so pre-migration work misses the closing review, the gap `ee3a3c19` was written to close. With a workbench-relative path the command prints nothing, and `bin/fusion-review-coverage --since ""` reports `since=d398ced1…`, this checkout's session anchor, exit 0: `hooks/lib/review-coverage.ts` `measureReviewCoverage` reads an empty `since` as absent. Scope: the orchestrator prompt and the coverage helper; every migrated workbench.
Issue: `261009-1037-the-closing-coverage-read-anchors-a-migrated-package-at-the-migration-commit-and-an-empty-since-falls-back-to-the-session-anchor.md`.

**A2. `transition --evidence` is accepted on a drop, where the codec checks no binding. Low.**
`hooks/lib/record-write.ts` `fieldsOf` (from `89471d97`) binds on any `--outcome` transition; `codec/src/cli/ops.ts` runs `bindEvidence` over outcome bindings only into `done` (`EVIDENCE_CHECKED_ON`). A drop can therefore store a binding whose brief or plan has moved. No condition reads it and no prompt sends it.
Issue: `261009-1037-transition-evidence-is-accepted-on-a-drop-where-the-codec-checks-no-binding.md`.

Checked and sound in this theme: `--evidence` composes the same `evidence_ref` as `attach-evidence` (`evidenceBinding`, pinned by the first `transition --evidence` case); the codec's `bindEvidence` ties a binding to the finishing package through `brief_revision` and `plan_revision`; the finish-then-note order in step 4 and the state-auditor's "an `evidence` row of a `done` package is history" agree with `dependencySatisfied`, which reads verdict and revision only; the Drop row's plan closure is observed by case (f).

### B. The activity log

**B1. `/fusion:cadence` dates and bounds `record_change` rows by their UTC day against local dates. Medium.**
`skills/cadence/SKILL.md` step 3b (from `f37b6194`) compares `substr(ts, 1, 10)` with `$SINCE`, and the bullet beside it dates each row "by its `ts`". `utcStamp` writes UTC with no suffix (a row of this session reads `"ts":"2026-10-09T08:28:00"` for a write at 10:28 CEST); `$SINCE`, `today` and the log's days are local, and the find beside it reads `-newermt "$SINCE"` as local midnight. Inference, not observed: a change between local midnight and 02:00 CEST is dated a day early, and dropped when `$SINCE` is that day. The install case for this block asserts `c.ts.slice(0, 10)` equal to the local `today`, so the codec suite is red when run in that window, and step 13 runs it.
Issue: `261009-1037-cadence-dates-and-bounds-record-change-rows-by-their-utc-day-against-local-dates.md`.

### C. The release gate's own state

**C1. The hooks suite is red at `031645d2`. Medium, fixed after the range.**
`hooks/lib/__tests__/citation-sweep.test.ts` "--dry-run over this repository's workbench reports rewrites=0" fails with `files=1 rewrites=5`: the closure note of package `261009-0641-analysis-v13-completeness-prior-integration-host-parity`, added at `e4755c58`, cites three analyses as `analyses/<basename>` and two issues as `issues/<basename>` (its lines 9 and 13). Commit `cc30475e` landed while this pass ran and respelled the five; `bin/fusion-citation-sweep --dry-run` in the live tree now prints `files=0 rewrites=0`. No issue filed. `cc30475e` and `f2b545d6` are outside `**Reviewed-range:**` and belong to G-B; the suite was not re-run at them.

### D. The write client's plan reader and the reconcile route

**D1. `planSteps` admits a level-two step heading in its header, which its code reads as the end of the steps section. Low.**
`hooks/lib/record-write.ts` `planSteps` (from `e29fb624`): the comment says "`##`-to-`####` heading", but `/^## /` is tested first and a `## 2.` line closes the section, losing that step and every later one with no word. The test covers `### 2.` only.
Issue: `261009-1037-plan-steps-admits-a-level-two-step-heading-in-its-header-which-its-code-reads-as-the-end-of-the-steps-section.md`.

**D2. `/fusion:reconcile` hands an implemented decision to an orchestrator its route does not have. Low.**
`skills/reconcile/SKILL.md` `## Report` item 2 (from `85ea803b`) says "the orchestrator sends that transition, this body none"; the skill dispatches only `fusion:state-auditor`. On that route the decision stays `answered` and is reported again on every pass.
Issue: `261009-1037-reconcile-hands-an-implemented-decision-to-an-orchestrator-its-own-route-does-not-have.md`.

### Read and found sound

- `e29fb624`: `planSteps` fences, section scoping and the repeated-number refusal; the FJ05 plan's control file carries anchors 1 to 23.
- `26f311c9`: the `--outcome` and `--source` shapes in the conventions match `skills/wp/SKILL.md` and `codec/schemas/package.schema.json`, and the test reads the `--outcome` example out of the rule file.
- `88170d7e`, `85ea803b`, `bc97f476`, `07985fdb`, `eb5573fd`: the executor-appends / dispatcher-sends split is stated once in `### Decision files` and followed by the two implementer prompts, the planner, the state-auditor and `rules/decision-record-examples.md`; the unsupported-workbench branch no longer points at `/fusion:migrate`.
- `c3ccb43a`: `hooks/scope.ts` and `hooks/order.ts` print `legacyLine`; `bin/fusion-work-order`'s exit 4 for a legacy workbench matches its header.
- `a759bb08`, `541893ed`: `unreadControls` is shared by both lints; `citation-check.ts` prints `unreadable=` after `uuid-unresolved=` and keeps it out of `verdict=` as its header says; `inCitationCorpus` is `isLiveRecord` less the discussion kind.
- `99eef20d`: `MIGRATIONS_PREFIX` runs before the store test; `rules/workbench-tracking.md` names `workbench.json` (R3) and `.json-state/` (L), which `skills/check/SKILL.md` now relies on.
- `69ee56f8`: `ReuseServer.server_bind` skips `getfqdn`; nothing in `bin/monitor` reads `server_name`.
- `e7695d9c`: the hand-over's codec-diff claim holds (`git diff --stat 84047ad7 e7695d9c -- codec/` outside `codec/fixtures/prior` is `install.test.ts` and `README.md` only).
- `f2e8ea4b`, `495aca7d`, `308f7a66`: the install and observation cases lift blocks by heading from the installed tree and judge on disk.

## Cross-cutting observations

- **Two of the three medium findings sit on a date or a commit used as an anchor.** A1 takes "when was this filed" from a file the migration rewrote; B1 takes "which day" from a UTC stamp compared with local days. Both are answerable from inputs already on disk, so the fix is the input chosen, not a heuristic.
- **Silent defaults at helper boundaries recur.** A1's `--since ""` is read as "no value" and falls back without a word, the same shape the earlier ruling against silent empty keys targets (`rules/fusion-workbench-conventions.md` `### Where the call belongs`).
- **Known, documented, not filed:** the cadence scan block needs BSD `ls -T`, so its install case is red on GNU userlands; `skills/cadence/SKILL.md` states that limit, and the release gate runs on macOS.

## Recommended sequencing

1. Step 4: B1 (skill and its install case) and A1 (prompt sentence and helper refusal), each with the acceptance its issue states. C1 needs only the green suite at C, which step 13 takes.
2. Low, carried to step 18's list unless fixed alongside: A2, D1, D2.
3. G-B then covers these fixes with step 3's, step 8's and step 11's commits.
