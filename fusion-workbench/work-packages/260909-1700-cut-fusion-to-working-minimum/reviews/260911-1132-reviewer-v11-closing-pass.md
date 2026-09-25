v11.0.0 closing review — the first pass over the release range

**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Reviewed-range:** `1e84c17d..1d6103c4`
**Not-opened:** `.gitignore`,`agents/analyst.md` `agents/coder.md`,`agents/consultant.md` `agents/curator.md`,`agents/editor.md` `agents/ontocoder.md`,`agents/planner.md` `agents/reconciler.md`,`agents/shaper.md` `bin/fusion-cadence-anchor`,`bin/fusion-checkout-name` `bin/fusion-commit-lock`,`bin/fusion-events` `bin/fusion-forum`,`bin/fusion-identity` `bin/fusion-plan-size`,`bin/fusion-review-coverage` `bin/fusion-session-domain`,`bin/fusion-session-mark` `bin/fusion-source-root`,`bin/monitor` `docs/philosophy.md`,`docs/upgrading-to-v10-2.md` `docs/upgrading-to-v10-23.md`,`docs/upgrading-to-v10-25.md` `docs/upgrading-to-v10-26.md`,`docs/upgrading-to-v10-3.md` `docs/upgrading-to-v10-4.md`,`docs/upgrading-to-v10-6.md` `hooks/citation-sweep.ts`,`hooks/dist/citation-sweep.d.ts` `hooks/dist/citation-sweep.js`,`hooks/dist/events-query.d.ts` `hooks/dist/events-query.js`,`hooks/dist/guard.d.ts` `hooks/dist/guard.js`,`hooks/dist/lib/citation-corpus.d.ts` `hooks/dist/lib/citation-corpus.js`,`hooks/dist/lib/citation-scan.js` `hooks/dist/lib/config.d.ts`,`hooks/dist/lib/config.js` `hooks/dist/lib/dispatch-bytes.d.ts`,`hooks/dist/lib/dispatch-bytes.js` `hooks/dist/lib/domain-cascade.d.ts`,`hooks/dist/lib/domain-cascade.js` `hooks/dist/lib/events-query.d.ts`,`hooks/dist/lib/events-query.js` `hooks/dist/lib/fail-open.d.ts`,`hooks/dist/lib/fail-open.js` `hooks/dist/lib/orchestrator-events.d.ts`,`hooks/dist/lib/orchestrator-events.js` `hooks/dist/lib/plan-size.d.ts`,`hooks/dist/lib/plan-size.js` `hooks/dist/lib/review-coverage.d.ts`,`hooks/dist/lib/review-coverage.js` `hooks/dist/lib/staging-drift.js`,`hooks/dist/plan-size.d.ts` `hooks/dist/plan-size.js`,`hooks/dist/review-coverage.d.ts` `hooks/dist/review-coverage.js`,`hooks/dist/session-id.d.ts` `hooks/dist/session-id.js`,`hooks/dist/session-start.d.ts` `hooks/dist/session-start.js`,`hooks/dist/subagent-stop.d.ts` `hooks/dist/subagent-stop.js`,`hooks/dist/tracker.js` `hooks/events-query.ts`,`hooks/guard.ts` `hooks/lib/__tests__/citation-form.test.ts`,`hooks/lib/__tests__/citation-grammar-boundaries.test.ts` `hooks/lib/__tests__/commit-message-path.test.ts`,`hooks/lib/__tests__/committed-dist.test.ts` `hooks/lib/__tests__/config.test.ts`,`hooks/lib/__tests__/context-manifest.test.ts` `hooks/lib/__tests__/deliverable-language-lint.test.ts`,`hooks/lib/__tests__/derivable-enumerations-lint.test.ts` `hooks/lib/__tests__/dispatch-bytes.test.ts`,`hooks/lib/__tests__/domain-cascade-order-lint.test.ts` `hooks/lib/__tests__/domain-cascade.test.ts`,`hooks/lib/__tests__/executor-verification-report-lint.test.ts` `hooks/lib/__tests__/fenced-code-exemption.test.ts`,`hooks/lib/__tests__/fixtures/dispatch-path.baseline` `hooks/lib/__tests__/fixtures/rules-emission.golden`,`hooks/lib/__tests__/fixtures/surface-growth.golden` `hooks/lib/__tests__/fusion-checkout-name.test.ts`,`hooks/lib/__tests__/fusion-citation-check.test.ts` `hooks/lib/__tests__/fusion-claimed-item.test.ts`,`hooks/lib/__tests__/fusion-commit-lock.test.ts` `hooks/lib/__tests__/fusion-count-sources.test.ts`,`hooks/lib/__tests__/fusion-events.test.ts` `hooks/lib/__tests__/fusion-forum.test.ts`,`hooks/lib/__tests__/fusion-identity.test.ts` `hooks/lib/__tests__/fusion-paths.test.ts`,`hooks/lib/__tests__/fusion-prose-metric.test.ts` `hooks/lib/__tests__/fusion-session-domain.test.ts`,`hooks/lib/__tests__/glob-nomatch-lint.test.ts` `hooks/lib/__tests__/guard-bash-integration.test.ts`,`hooks/lib/__tests__/guard-project-config-integration.test.ts` `hooks/lib/__tests__/guard-state-shape.test.ts`,`hooks/lib/__tests__/helpers/growth-bound.ts` `hooks/lib/__tests__/helpers/guard-harness.ts`,`hooks/lib/__tests__/hook-fail-open.test.ts` `hooks/lib/__tests__/hooks-wiring.test.ts`,`hooks/lib/__tests__/legacy-halt-clearing.test.ts` `hooks/lib/__tests__/marker-format-lint.test.ts`,`hooks/lib/__tests__/monitor-warnings-panel.test.ts` `hooks/lib/__tests__/path-literal-lint.test.ts`,`hooks/lib/__tests__/plan-size.test.ts` `hooks/lib/__tests__/plan-stopping-section-lint.test.ts`,`hooks/lib/__tests__/provenance-header-lint.test.ts` `hooks/lib/__tests__/reference-resolution-lint.test.ts`,`hooks/lib/__tests__/review-coverage-mandate.test.ts` `hooks/lib/__tests__/review-coverage.test.ts`,`hooks/lib/__tests__/rules-emission-golden.test.ts` `hooks/lib/__tests__/rules-voice-profile.test.ts`,`hooks/lib/__tests__/sentence-identifier-containment.test.ts` `hooks/lib/__tests__/session-start-event.test.ts`,`hooks/lib/__tests__/session-start-subdirectory.test.ts` `hooks/lib/__tests__/staging-drift.test.ts`,`hooks/lib/__tests__/surface-growth-bound.test.ts` `hooks/lib/__tests__/workbench-citation-lint.test.ts`,`hooks/lib/citation-corpus.ts` `hooks/lib/citation-scan.ts`,`hooks/lib/config.ts` `hooks/lib/domain-cascade.ts`,`hooks/lib/events-query.ts` `hooks/lib/fail-open.ts`,`hooks/lib/plan-size.ts` `hooks/lib/staging-drift.ts`,`hooks/plan-size.ts` `hooks/session-id.ts`,`hooks/session-start.ts` `hooks/subagent-stop.ts`,`hooks/tracker.ts` `README-hooks.md`,`rules/commit-lock.md` `rules/context-lean-claude-md.md`,`rules/context-manifest.md` `rules/decision-record-examples.md`,`rules/orchestrator-rebalance.md` `rules/rule-file-provenance.md`,`rules/user-facing-output.md` `rules/workbench-path-resolution.md`,`rules/workbench-tracking.md` `skills/archive/SKILL.md`,`skills/cadence/SKILL.md` `skills/check/SKILL.md`,`skills/cleanup/SKILL.md` `skills/curate/SKILL.md`,`skills/log-activity/SKILL.md` `skills/post/SKILL.md`,`skills/reconcile/SKILL.md`
**Review domain:** code
**Work-item:** 260909-1700-cut-fusion-to-working-minimum

(The range is `v10.26.0..1d6103c4` as dispatched; the left endpoint is written resolved because
`rules/review-contract.md` forbids a tag there and `bin/fusion-review-coverage` tiles hashes.)

## Summary

The removal itself is clean where it is executable. The suite is green (53 files, 915 tests), the
manifest validates, no compiled artifact of a removed mechanism survives in `hooks/dist/`, and the
new substrate — `bin/fusion-claimed-item`, the resolver's second argument, its exit 3 — is
coherent, well-guarded and correctly refuses rather than guesses. **Every finding below is in the
text layer, and one of them is executable through a skill body.** The dominant class the dispatch
predicted is confirmed: what the release deleted is still described as live, and in one case a
detector was narrowed past the shape it exists to detect.

## Totals

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 3 |
| Medium | 1 |
| Low | 1 |

Five records filed; three open records extended with `Also seen:` rather than re-filed.

## Findings by theme

### A. A detector narrowed past its own subject — the v11 migration does not run

**High.** `260911-1126_*_neither-setup-nor-migrate-detects-a-live-circle-record-so-the-v11-conversion-never-runs.md`

`skills/migrate/SKILL.md` Step 2 puts *"If `FOUND=0`: stop here"* between its first survey block
and the block that finds a live `_a_`/`_t_` record, and puts the instruction that repairs the count
(*"set `FOUND=1` yourself whenever `LIVE` or `CONFLICTS` is above zero"*) after the second block.
Reproduced on a scratch workbench in exactly the shape v11 converts: the first block prints
`FOUND=0` and the line *"(nothing — already in the current format)"*, the second block finds
`LIVE=1`.

`skills/setup/SKILL.md` `### Superseded-format check` does not catch it either: its three probes
are a root type folder, a flat markered `circles/*.md`, and a bracket-form `[x]-` filename. A
container holding `_t_circle.md` matches none — that marker is already the underscore form probe 3
converts *to*. So nothing routes the user to the migration, and the migration reports nothing to do.

Downstream: `bin/fusion-claimed-item:206-209` resolves an item only through
`circles/<dir>/<dir>.md`, so an unconverted container never matches, the helper exits 0 with no
output, and `bin/fusion-paths` puts every `OUT_*` in `shared/` for the life of the project.

This repository is not the case — all 24 legacy containers here hold terminal records, for which
`FOUND=0` is right. The failure needs a workbench that was mid-work at the upgrade.

### B. The release has no user-facing existence

**High.** `260911-1127_*_v11-is-at-version-in-the-manifest-and-named-on-none-of-the-three-upgrade-surfaces.md`

`.claude-plugin/plugin.json` reads `11.0.0`. `docs/` stops at `upgrading-to-v10-26.md`,
`README.md:28` opens its upgrade block with *"Upgrading from v10.25?"*, and
`skills/help/SKILL.md` `### 4. Update` carries v10.26, v10.25 and v10.24.
`CLAUDE.md` `## Release process` step 0 makes the help advance a pre-tag obligation in its own
words; it has not run.

It compounds finding A. Every v10 note states that nothing is rewritten and nothing is to be
migrated. A user who reads the newest note present concludes exactly that, and nothing corrects it.

### C. The work item's documented location is two releases behind its resolver

**High.** `260911-1128_*_four-user-facing-documents-place-a-work-item-in-shared-backlog-as-a-flat-file.md`

`bin/fusion-paths:387` values both backlog keys as `circles`, and the conventions define an item
as a directory holding a record of its own name. `skills/memo/SKILL.md:108` writes exactly that.
But `docs/working-model.md:11`, `:163`, `docs/fusion-intro.md:85`, `:107`, `README.md:163`,
`:165`, `README-agents.md:34` and `:226` all place an item at
`fusion-workbench/shared/backlog/<stamp>-<slug>.md` — wrong store and wrong shape, in the two
documents a new user is pointed at first. `fusion-workbench/shared/backlog/` now has no resolver
key at all and still holds two entries nothing reads.

### D. One enumeration states a file as live and as removed, in one bullet

**Medium.** `260911-1129_*_one-bullet-in-readme-agents-lists-circle-records-md-as-a-live-emission-and-as-removed.md`

`README-agents.md:176` lists `circle-records.md` among the conditional emissions and, 500
characters later in the same bullet, says it went with the Circle container. The file does not
exist; the eight conditional emissions in `bin/fusion-rules` are at `:579`, `:593`, `:603`,
`:612`, `:620`, `:646`, `:658`, `:668`.

### E. A cardinality under-counts by one, invisibly to the lint that guards the bullet

**Low.** `260911-1130_*_claude-mds-skill-bullet-says-three-directories-have-left-and-next-is-the-fourth.md`

`CLAUDE.md:21` says *"Three directories have left"* and names three; `skills/next/` left in this
same release and is named nowhere. Both directions of the lint the bullet describes are keyed on
`/fusion:<name>` tokens, and `next`'s token left with the directory, so neither direction has
anything to check.

### F. Extensions to open records, not new findings

- `260910-2146_*_five-deleted-agents-are-still-named-as-live-in-twelve-shipped-files.md` — its
  measurement stops at `rules/` and `agents/`. The same grep over `skills/`, `hooks/lib/`,
  `hooks/*.ts`, `docs/`, `README.md`, `README-agents.md` and `CLAUDE.md` returns 49 across 22
  further files. Two of them are the record's own first kind — a rule addressing an audience that no
  longer exists: `rules/review-contract.md`'s opening paragraph, and
  `rules/fusion-workbench-conventions.md` `## Filename Patterns`, which still defines a review
  file's `<sender>` as *"`coderev` or `ontorev`"* while `bin/fusion-rules:284` emits the contract
  to `reviewer` alone and `hooks/lib/review-coverage.ts:193` already recognises the new segment.
- `260906-0335_*_nine-of-twelve-line-number-citations-in-shipped-text-name-the-wrong-line-and-no-gate-resolves-one.md`
  — `README-agents.md` was outside the measured surface and carries six more, including
  `agents/orchestrator.md:1321` in a file of 613 lines.
- `260910-2020_*_the-two-existing-backlog-entries-keep-the-retired-marker-form-that-d1-migrates-into.md`
  — the store moved again after it was filed, so the two entries are now unread rather than merely
  mis-shaped.

## Cross-cutting observations

**One class, three surfaces, and only one of them has a gate.** Findings A through E are all the
same shape: a statement about a mechanism outliving the mechanism. The executable half of this
release is defended — `path-literal-lint`, `workbench-citation-lint`, `reference-resolution-lint`,
the growth bounds, `committed-dist` — and the suite is green under all of them. What none of them
reads is whether a *sentence* is still true. Finding D sits inside an enumeration that also contains
its own correction, and no gate can see the contradiction because both halves resolve. Finding E is
invisible for the precise reason its lint is well-built. This is the same hole `CLAUDE.md`'s
`templates/` and `docs/` rows already record twice, arriving a third time.

**The narrowing in finding A is worth separating from the rest.** It is not stale text: both
detectors were deliberately narrowed in this range (`44839e8f`, `2f8d1082`) and each narrowing is
individually well-argued in its own body. What neither body checked is that between them the union
no longer covers the case. Two correct local decisions, one uncovered shape — the disjoint-and-
complete reading of `rules/critical-stance.md` §4, failing across a boundary rather than inside a
single split.

**What was verified and is sound.** `npm test` green at `1d6103c4` (53 files, 915 tests, 40.7 s);
`claude plugin validate .` passes with the one standing `CLAUDE.md` warning;
`hooks/dist/turn-budget.js` and `hooks/dist/lib/state-file.js` are deleted, so the carried finding
that a compiled artifact of the Turn budget might still ship does not hold;
`bin/fusion-claimed-item` and `bin/fusion-paths` refuse ambiguity rather than resolving it, and
their exit-3 contract is stated identically in both headers and in `CLAUDE.md`;
`bin/fusion-review-coverage` does print `carried=` and `carried-from=`, at the tail, matching what
`agents/orchestrator.md` `## Review coverage` tells a session to read.

## Recommended sequencing

1. **Before the tag:** A and B. A is the release's own migration path failing silently on the
   ordinary case; B is the document that would otherwise have to name it. Neither is a code change
   of any size.
2. **Before the tag, or in the v11 note as a known gap:** C. The two documents a new user reads
   first describe a layout the resolver does not produce.
3. **After the tag:** D, E, and the three extensions. All are text repairs with no runtime reach.

**Does anything stop the tag?** A does, on the project's own terms: `docs/upgrading-to-v10-3.md`
and `-v10-4.md` each open by telling the reader nothing in their project is rewritten, and v11 is
the first release since v9 where that is false. Shipping it with the migration not running and no
note saying so hands a mid-work consuming project a workbench that silently files everything outside
its container. Review coverage is advisory here and is not the reason; this is.

---

## Reconciliation annotation, 260911-1418 (reconciler, checkout 5e8248d7), at HEAD `9ceb5cc7`

Findings only. No finding text above is edited.

| finding | record | state | evidence |
|---|---|---|---|
| A | `260911-1126_*_neither-setup-nor-migrate-detects-a-live-circle-record-so-the-v11-conversion-never-runs.md` | closed, and the owed regression landed | `c08230fa` for the fix, `9ceb5cc7` for `hooks/lib/__tests__/live-circle-record-detection.test.ts` at 77 lines, five assertions over two scratch trees; suite green |
| B | `260911-1127_*_v11-is-at-version-in-the-manifest-and-named-on-none-of-the-three-upgrade-surfaces.md` | closed | `docs/upgrading-to-v11.md` exists; `README.md:28` carries the v11 paragraph; `skills/help/SKILL.md` `### 4. Update` carries v11, v10.26 and v10.25 at `:96`, `:98`, `:100`; the `FUSION_REF=tags/v11.0.0` example stands in `README.md:26` and `install.sh:27` |
| C | `260911-1128_*_four-user-facing-documents-place-a-work-item-in-shared-backlog-as-a-flat-file.md` | closed | the acceptance grep for `shared/backlog` over `docs/`, `README.md` and `README-agents.md` returns nothing at HEAD; `docs/working-model.md:11` and `docs/fusion-intro.md:85` now name the container and say directory |
| D | `260911-1129_*_one-bullet-in-readme-agents-lists-circle-records-md-as-a-live-emission-and-as-removed.md` | closed | `grep -c 'circle-records' README-agents.md` returns 1 |
| E | `260911-1130_*_claude-mds-skill-bullet-says-three-directories-have-left-and-next-is-the-fourth.md` | closed | the `CLAUDE.md` skill bullet names four departed directories with `next` among them and states no cardinality |

**The tag question this review closes on is answered.** A is fixed and `c08230fa` is an ancestor of the `v11.0.0` tag, so the tagged tree does not carry the silent migration failure. What the tag does not carry is the nine commits after it, this review's own C, D and E repairs included.

**One finding of this range is still open and is not one of A to E:** `260911-1339_*_staging-drift-still-classifies-a-pointer-a-rule-says-nothing-creates-and-names-a-turn-boundary-trigger-it-does-not-have.md`, plus three records filed by this reconciliation and listed on it.
