# Closing review: the migrate Step 6 package (13.1.2)

**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Reviewed-range:** `313134ed..5289407a`
**Not-opened:** `fusion-workbench/orchestrator-events.jsonl`, the work package `260928-1338-json-control-data-and-markdown-artefacts` (its whole directory except two of its issues, named under Opened outside the range below), `fusion-workbench/work-packages/261008-1215-fusion-as-an-external-prior-module-bundle/analyses/`, `261009-1024-fusion-is-the-one-source-of-role-texts-and-workflow-rules-for-both-hosts.md`, `261010-1235-how-is-the-host-neutral-role-text-the-source-of-both-the-claude-agents-and-the-prior-profiles.md`, `261010-1235-in-which-language-is-the-prior-module-executable-built-and-how-does-it-consume-priors-module-api.md`, `fusion-workbench/work-packages/261008-1215-fusion-as-an-external-prior-module-bundle/discussions/`, `261008-1215-fusion-as-an-external-prior-module-bundle.md`, `codec/fixtures/`, `codec/dist/fusion-record.js`, `hooks/dist/`, `codec/src/__tests__/`, `hooks/lib/__tests__/` (except four files, named under Opened outside the range below), `codec/contract/prior-mapping.json`, `codec/schemas/common.schema.json`, `codec/schemas/protocol.schema.json`, `adapters/prior/fusionmodule/conformance/explorer_test.go`, `adapters/prior/fusionmodule/conformance/host_test.go`, `adapters/prior/fusionmodule/internal/explorer/explorer_test.go`, `adapters/prior/fusionmodule/internal/fixture/fixture.go`, `adapters/prior/fusionmodule/internal/fixture/sha.go`, `adapters/prior/fusionmodule/internal/hostsvc/hostsvc_test.go`, `adapters/prior/fusionmodule/internal/repair/repair_test.go`, `adapters/prior/fusionmodule/internal/steps/role_test.go`, `adapters/prior/fusionmodule/internal/steps/strictjson_test.go`, `adapters/prior/fusionmodule/cmd/fusion-module/main_test.go`, `adapters/prior/testdata/`, `catalog/package-lock.json`, `catalog/tsconfig.json`, `catalog/vitest.config.mjs`, `catalog/schemas/catalog.schema.json`, `catalog/schemas/profile.schema.json`, `catalog/schemas/explorer-envelope.v1.json`, `catalog/schemas/explorer-request.v1.json`, `catalog/schemas/explorer-result.v1.json`, `catalog/profiles/*/parts/*-neutral.md`, `catalog/profiles/*/parts/*-claude.md`, `catalog/profiles/explorer/parts/`
**Review domain:** code
**Cross-references:** `261014-0830-reviewer-closing-pass-over-the-prior-module-bundle-package.md` (the `**Not-opened:**` list carried from there; every entry except `hooks/lib/__tests__/` is carried unopened, since none of them is touched by this range), `261015-0633-plan-migrate-step-6-offers-a-sweep-it-can-write.md`, `261015-0633-does-a-migrate-run-on-a-v12-format-workbench-offer-the-citation-sweep-when-its-census-counts-store-prefixed-citations.md`

## Opened outside the range

From the carried list, narrowed: in package 260928-1338 the issues `261009-1855-migrate-step-6-writes-the-sweep-beside-staged-renames-which-guard-a-refuses-as-dirty-tree.md` and `261009-1833-migrate-names-a-four-commit-split-but-gives-no-path-lists-so-staging-it-needs-a-generated-list.md`; under `hooks/lib/__tests__/` the files `store-name-migration.test.ts`, `reference-resolution-lint.test.ts` (its diff), `fixtures/surface-growth.golden` and the header of `helpers/json-workbench.ts`. Also read for context: `hooks/citation-sweep.ts` `## Exit codes`, `bin/fusion-migrate` header, `hooks/migrate.ts` `status()` and `surveyOut()`.

## Summary

The fix holds for what it set out to do. The reproduction, the routing (Step 2 `FOUND=0` to Step 6, git-mode run ending at Step 5) and the Step 6 block work end to end, and the focus tests are green. The defects sit downstream: the fix now routes every re-run into Step 7, and Step 7 misreads a JSON-controlled workbench that has no local migration session. After a yes, Step 7 also runs over uncommitted sweep edits, and it still relies on a shell variable across calls.

Verdict: **revise**. The release is tagged; the High finding affects the route the 13.1.2 help text recommends.

## Totals

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 1 |
| Medium | 2 |
| Low | 2 |

## What was verified

- `cd hooks && npx vitest run lib/__tests__/store-name-migration.test.ts lib/__tests__/surface-growth-bound.test.ts lib/__tests__/reference-resolution-lint.test.ts lib/__tests__/path-literal-lint.test.ts`: 4 files, 104 tests passed (261015-1309). The full suite was not run; its known red (`workbench-citation-lint.test.ts`, package 260928-1338) is not this range's.
- Growth: `skills/migrate/SKILL.md` 26 924 to 27 468 bytes (+544, inside the plan's 800 cap). `help/SKILL.md` 15 798 to 15 438. No baseline or head-room constant in `surface-growth-bound.test.ts` was edited in the range (`git diff --stat` names only the golden).
- The two `reference-resolution-lint` re-approvals: the 13.1.2 help paragraph carries no citation, and the dropped 12.2.2 paragraph cited `$FUSION_SRC/agents/orchestrator.md` `## Setup` and `$FUSION_SRC/skills/archive/SKILL.md` `## Process` (−2 paths, −2 anchors). In Step 6 the two `$FUSION_PLUGIN_ROOT/bin/fusion-citation-sweep` spellings come in and the `bin/fusion-citation-sweep` prose mention goes out (+1 net path). Net 2051 → 2049 paths, 373 → 371 anchors: consistent with the diff.
- The Step 6 exit set: `hooks/citation-sweep.ts` `## Exit codes` lists 0 to 6. Without `--yes` exit 0 cannot occur; the block's bullets cover 1, 2, 3, 4, 5 and 6, plus `SWEEP=absent`. Disjoint and complete.
- Self-containment of Step 6: the block sets `SWEEP` and `K` itself, and the yes-branch and `bare-record` commands spell the full path. Pinned by `the yes-branch write is self-contained…` under `FRESH_ENV`.
- Version surfaces: `.claude-plugin/plugin.json`, `install.sh` header, `README.md` pin example all read 13.1.2; tag `v13.1.2` points at `5289407a`.
- The source issue carries its `Resolved:` line (`f67fd3f0`), in anchor form, no commit hash.

## Findings by theme

### Step 7 is now reached on every re-run, and it was not checked for that

**H1 (High). Step 7 reads a JSON-controlled workbench with no local migration session as unmigrated.** Step 7 tests only `done=true` from `fusion-migrate status`. The session sits under `$HOME/.fusion-migrate/<hash>`, so any other checkout, machine or a JSON-native workbench prints `run=none`. The skill then surveys and lists `manifest-present workbench.json` and `control-file-exists` per package as blocking and unrepairable, and tells the user to fix them by hand. I ran it: `codec/fixtures/workbench/` in a committed scratch repo, empty `HOME`, gave `state=json-control`, `run=none`, then `blocking=3` with `unrepairable=` on each. `skills/migrate/SKILL.md` `## Step 7`, `**Survey.**` and `**Repairs**`; `hooks/migrate.ts` `status()`. This predates the range: `FOUND=0` went to Step 7 before as well. But 13.1.2 tells JSON-controlled consumers to re-run `/fusion:migrate` (`skills/help/SKILL.md` `### 4. Update`; decision option 1, krk). The source issue's krk note also assumes Step 7 "finds a JSON-controlled workbench". Fix: stop on `state=json-control`. Issue: `261015-1310-migrate-step-7-reads-a-json-controlled-workbench-with-no-local-session-as-unmigrated-and-tells-the-user-to-fix-its-manifest-by-hand.md`.

**M1 (Medium). After a yes in Step 6, Step 7 runs before the sweep's rewrites are committed.** The yes-branch says the record content "is committed as its own commit", then "Then go to Step 7". The Guardrails forbid the skill a commit, and `fusion-migrate run` has no dirty check. Before the fix this sequence was unreachable in git mode, since the write was always refused. `261009-1833-…` already shows the consequence once: citation-repair files separated by hand from the migration's. inference: where both touch one narrative, the split cannot be recovered. Issue: `261015-1310-migrate-step-6-yes-branch-flows-into-step-7-before-the-sweep-rewrites-are-committed.md`.

**M2 (Medium). Step 7 (`"$M"`) and Step 1 (`cd "$ROOT"`) carry shell variables across separate Bash calls.** `42d8f1bc` fixed this class for Step 6 and left Step 7 untouched: "Set `M=…`" once, then seven `"$M" …` commands. `grep -n 'Set \`' skills/*/SKILL.md` finds only this instance. Issue: `261015-1310-migrate-step-7-and-step-1-carry-shell-variables-across-separate-bash-calls.md`.

### Routing prose and test strength

**L1 (Low). Step 5 leaves the git-mode `moved=0` case unnamed and carries two next-step orders, and line 18 overstates.** Step 5's stop applies to a git run "that moved anything", plain goes to Step 6, and git with nothing moved falls through. The first list says push, others pull and `/fusion:setup`; the second says commit and re-run. `README.md` puts the push after the re-run. Line 18 says a v12 workbench "asks only about citations", but Step 7 still asks to migrate. Issue: `261015-1310-migrate-step-5-routing-prose-leaves-a-gap-and-two-next-step-orders.md`.

**L2 (Low). Two regression cases pin less than their names say.** The JSON case never asserts `format=json-control`, and the routing case does not bind the stop to `MODE=git`. Neither passes vacuously today. Both would stay green if the property they name were removed. The other cases pin what they claim: exit, stdout, stderr refusal reason and byte-identity on refusal, and a census above zero after the commit. Issue: `261015-1310-store-name-migration-test-pins-less-than-two-case-names-claim.md`.

## Cross-cutting observations

- **The fix moved the run's centre of gravity to Step 7 without opening Step 7.** H1, M1 and M2 all live there. Option 1 turned "re-run `/fusion:migrate`" into routine advice for migrated workbenches. Step 7 was written for a single run on a Markdown workbench on the machine that migrates it.
- **A duplicate of the fixed defect is still open.** `261009-1855-migrate-step-6-writes-the-sweep-beside-staged-renames-which-guard-a-refuses-as-dirty-tree.md` (package 260928-1338) describes the same refusal. Its acceptance option (a), "Step 6 requires the rename commit before the write … and says what to do on a non-zero exit", is met by `## Step 5` and `## Step 6` as of `c2fa5fac`. It is a state matter, not a defect, so I filed no issue. The orchestrator can close it, citing this fix.
- **Package bookkeeping is open.** The plan record stands `in_progress` with all six steps `done`, and the package is `claimed` with `evidence: []`. That is the closure step, which is the orchestrator's.

## Recommended sequencing

1. H1 before anyone acts on the 13.1.2 advice to re-run `/fusion:migrate` on a JSON-controlled workbench. A 13.1.3 that fixes Step 7's stop condition is small.
2. M1 and M2 in the same edit of `## Step 7`, since both change that step's prose.
3. L1 and L2 as cleanup, L2 alongside the test cases H1 and M1 add.
