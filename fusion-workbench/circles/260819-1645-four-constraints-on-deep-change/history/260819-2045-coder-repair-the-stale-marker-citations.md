# coder — repair the stale-marker citations (plan step 5)

**Status:** Complete
**Date:** 2026-08-19
**Agent:** coder
**Task:** Step 5 of `circles/260819-1645-four-constraints-on-deep-change/planning/260819-2016_*_four-constraints-on-deep-change.md` — rewrite the marker position of every `stale-marker` citation in the repair corpus to the wildcard `_*_`.
**HEAD at start:** `b6869aa`

## Corpus

Driven from `hooks/lib/__tests__/helpers/citation-scan.ts`, never from a written file list. The
wider corpus reading, so the repair satisfies either answer to the open corpus question: Circle
records (all states), `portfolio.md`, decisions carrying `_o_` **or** `_a_`, issues carrying `_o_`,
excluding `archive/`. That selected **190 files** and 1 761 citation tokens.

The plan measured 189 files and 242 dangling tokens at 260819-2016. The corpus has since gained one
decision record and the stale-marker class has gained two hits, with nobody touching a citation —
the drift the plan and decision `circles/260819-1645-four-constraints-on-deep-change/decisions/260819-1645_*_what-defines-the-citation-gates-corpus-and-what-happens-when-a-marker-move-changes-it.md`
both predict.

## Before and after

| | Before | After |
|---|---|---|
| `stale-marker` | 100 | 19 (all deliberate) |
| `resolved` (partitioned) | 787 | 868 |
| `dangling` (partitioned) | 244 | 163 |
| `wrong-store` | 49 | 49 (step 6) |
| `dangling` proper | 203 | 203 (step 7) |

**81 citations repaired across 45 records.** Every edit is a marker-position rewrite on one line —
`git diff --numstat` shows equal insertions and deletions for all 45 files, so nothing but the
marker letter moved. No citation was rewritten to the record's current marker.

## The 19 left literal, and why

`rules/circle-records.md` `### Citation form in the portfolio` distinguishes a **pointer** to a
file, where the letter ages and must be starred, from a **statement about a marker**, where the
letter is the content and starring it deletes the statement. Nineteen hits are the second kind and
were left, each named here:

- `circles/260801-1244-curator/issues/260814-1419_*_nine-open-marker-citations-were-left-literal-on-lines-where-their-siblings-were-starred.md` (3, lines 19, 25, 26) — the right-hand column of that record's table is a verbatim quotation of the nine citations left literal elsewhere; it is the evidence the record exists to carry. The left-hand column of the same table names the *record edited by the pass* and is a pointer, so those three were starred. The two columns are deliberately spelled differently, and the table header says which is which.
- `circles/260815-0007-remove-eight-mechanisms-and-cap-growth/issues/260815-1247_*_the-implemented-decision-records-two-cross-references-were-broken-by-the-commit-that-transitioned-it.md` (2, line 65) — "still cites … Both targets are `_c_` at HEAD. Two literal markers, two dangling citations."
- `circles/260815-0007-remove-eight-mechanisms-and-cap-growth/issues/260815-1913_*_closing-the-plan-dangles-thirty-four-workbench-citations-that-spell-its-open-marker.md` (3) — line 12 states the rename ("renamed … to `_c_`"); lines 17 and 77 sit inside fenced blocks and are the literal operand of the reproduction `grep`. Starring any of the three breaks what the line is for. The two ordinary pointers in the same record (lines 8 and 47) were starred.
- `shared/issues/260812-1720_*_the-reference-resolution-lint-does-not-scan-the-workbench-where-citations-are-densest.md` (3, lines 25, 26, 72) — the bullet counts occurrences of stale exact markers, and line 72 says outright that the marker moved after the line was written.
- `shared/issues/260816-0119_*_the-lints-newly-widened-surface-still-stops-at-hooks-lib-tests-where-real-citations-have-gone-stale.md` (3, lines 28, 30, 53) — each quotes a stale citation that lives in a test file, together with the marker the target has now reached.
- `shared/issues/260816-0105_*_a-sub-agents-staged-rename-is-absorbed-by-the-orchestrators-next-commit-and-the-staging-list-cannot-prevent-it.md` (2, lines 17, 18) — each line is a rename written as `_o_ → _c_`.
- `shared/issues/260811-2105_*_circle-records-carry-the-same-silent-citation-form-and-a-third-of-their-citations-are-stale.md` (2, line 102) — names two pointer fields whose spelled-out marker is the defect being reported.
- `shared/issues/260818-0715_*_the-orchestrator-prompt-names-a-fusion-record-inside-the-instruction-for-what-to-report-to-the-user.md` (1, line 75) — quotes this record's own dead cross-reference and the marker it moved to.

One consequence is stated rather than hidden: in the last record the dead cross-reference itself
(line 62) **was** starred, because it is an ordinary pointer. The self-observation at line 75 that
"one citation in this record's own `Cross-references:` no longer resolves" is therefore now a
historical note about a citation that resolves again. Repairing the pointer and preserving the
observation seemed better than leaving a dead pointer to keep a sentence current.

## Verification

`npx tsx <driver>` over the same corpus, where the driver assembles the corpus file list and calls
`scanCitationTokens` from `hooks/lib/__tests__/helpers/citation-scan.ts` — exit 0, `stale-marker=19`,
and the 19 are exactly the ones listed above.

The full suite was deliberately **not** run: four sibling coders were editing `hooks/` and
`agents/` concurrently, so a full run would have reported their in-flight edits. No golden fixture
was regenerated and no shared pinned constant was written.

One observation that is **not** mine to fix. `hooks/lib/__tests__/reference-resolution-lint.test.ts`
fails its `BASELINE` pin at `paths` 1 179 (pinned 1 168) and `records` 104 (pinned 102). That lint's
`surface()` scans `rules/`, `agents/`, `docs/`, `templates/`, `skills/`, the READMEs, `CLAUDE.md`,
`bin/` and `hooks/lib/*.ts` and never the workbench, and this task touched only workbench records —
so the drift is step 4's addition to `rules/circle-records.md`, whose own acceptance criterion asks
for the baseline to be re-approved in the same commit.

## Files changed

45 records, edit count per file:

```
3  circles/260801-1244-curator/_c_circle.md
1  circles/260801-1244-curator/issues/260814-0828_*_the-grounding-and-the-spec-still-call-the-growth-bound-decision-open-after-it-was-answered.md
3  circles/260801-1244-curator/issues/260814-1419_*_nine-open-marker-citations-were-left-literal-on-lines-where-their-siblings-were-starred.md
1  circles/260801-1244-curator/issues/260814-2017_*_the-newest-decision-record-carries-no-answered-implemented-footer-block-so-its-next-transition-has-nowhere-to-land.md
3  circles/260801-1244-guard-rules-write/_c_circle.md
1  circles/260801-1244-guard-rules-write/issues/260805-2323_*_die-emissionsmessung-auf-der-unite-cocreator-maschine-steht-noch-aus.md
3  circles/260801-1244-rule-provenance-header/_c_circle.md
13 circles/260804-1205-shell-reachability-model/_s_circle.md
1  circles/260805-2005-textschicht-gegen-code-nachziehen/_c_circle.md
2  circles/260807-0923-guard-misst-statt-orakelt/_c_circle.md
1  circles/260807-0923-guard-misst-statt-orakelt/issues/260807-0952_*_ontocoder-kann-keinen-entscheidungssatz-ablegen.md
4  circles/260813-0858-playmaker-maintains-backlog-store/_c_circle.md
1  circles/260815-0007-remove-eight-mechanisms-and-cap-growth/_c_circle.md
1  circles/260815-0007-remove-eight-mechanisms-and-cap-growth/decisions/260815-2056_*_what-marks-an-answered-decision-whose-answer-can-no-longer-be-realised.md
2  circles/260815-0007-remove-eight-mechanisms-and-cap-growth/issues/260815-0803_*_the-plans-step-3-file-list-says-fourteen-fixture-files-and-the-tree-held-fifteen.md
1  circles/260815-0007-remove-eight-mechanisms-and-cap-growth/issues/260815-0804_*_a-decision-records-cross-reference-points-at-an-a-circle-md-that-activation-renamed.md
2  circles/260815-0007-remove-eight-mechanisms-and-cap-growth/issues/260815-0804_*_the-circle-records-dependencies-section-announces-five-bound-artifacts-and-lists-six.md
1  circles/260815-0007-remove-eight-mechanisms-and-cap-growth/issues/260815-1247_*_the-churn-leaves-were-removed-without-a-retirement-entry-and-the-retirement-table-could-not-have-held-one.md
1  circles/260815-0007-remove-eight-mechanisms-and-cap-growth/issues/260815-1247_*_the-implemented-decision-records-two-cross-references-were-broken-by-the-commit-that-transitioned-it.md
1  circles/260815-0007-remove-eight-mechanisms-and-cap-growth/issues/260815-1455_*_plan-step-9s-mechanical-acceptance-grep-fails-at-head-on-a-step-marked-done.md
1  circles/260815-0007-remove-eight-mechanisms-and-cap-growth/issues/260815-1631_*_one-of-the-four-derivation-rows-points-at-a-hand-maintained-field-in-the-same-file.md
1  circles/260815-0007-remove-eight-mechanisms-and-cap-growth/issues/260815-1631_*_the-installer-copy-list-names-a-license-file-the-tree-has-never-shipped.md
2  circles/260815-0007-remove-eight-mechanisms-and-cap-growth/issues/260815-1913_*_closing-the-plan-dangles-thirty-four-workbench-citations-that-spell-its-open-marker.md
1  circles/260816-1741-guard-becomes-observation-only/issues/260816-2319_*_the-answer-site-case-in-hook-fail-open-cannot-fail-on-the-violation-its-describe-block-names.md
1  circles/260816-1741-guard-becomes-observation-only/issues/260816-2320_*_the-write-trace-is-now-the-guards-only-product-and-two-of-its-four-tools-reach-no-integration-case.md
2  circles/260819-1645-four-constraints-on-deep-change/_t_circle.md
2  shared/decisions/260806-1152_*_stash-manifest-dirname-and-pointer-content-duplicate.md
1  shared/decisions/260810-1635_*_where-does-the-obligation-sit-to-update-the-artefact-that-explains-a-behaviour-when-the-behaviour-changes.md
2  shared/decisions/260810-2032_*_should-the-drift-checks-four-sentences-be-pinned-to-an-approved-baseline-instead-of-screened-by-a-blacklist.md
1  shared/issues/260804-1702_*_the-diagram-self-check-tests-shape-and-never-tests-agreement-with-the-prose.md
3  shared/issues/260808-0030_*_line-number-citations-into-rule-files-go-stale-and-no-gate-reads-them.md
1  shared/issues/260808-0030_*_the-coderev-pass-filed-four-issues-and-left-no-review-file.md
2  shared/issues/260810-1618_*_a-release-was-tagged-and-pushed-while-its-own-review-pass-was-still-running.md
2  shared/issues/260810-2027_*_the-monitors-browser-gap-line-has-no-executable-gate.md
1  shared/issues/260811-1547_*_the-orchestrator-prompt-cites-a-fusion-monitor-reset-skill-that-does-not-exist.md
2  shared/issues/260812-1720_*_the-migration-premise-in-the-circle-placement-decision-does-not-match-the-workbench.md
2  shared/issues/260814-2118_*_the-hooks-suite-fails-differently-on-repeated-full-runs-and-does-so-on-clean-head.md
1  shared/issues/260816-0025_*_the-archive-skills-never-archive-list-omits-the-migration-backup-store-while-naming-its-twin.md
1  shared/issues/260816-0740_*_the-always-on-rule-corpus-runs-at-sixteen-times-the-em-dash-ceiling-it-states.md
1  shared/issues/260816-1049_*_the-split-calls-portfolio-md-not-machine-refreshed-and-the-playmaker-regenerates-it-in-full.md
1  shared/issues/260817-1217_*_the-monitors-dismiss-keys-are-html-escaped-as-text-so-a-quote-in-a-warning-truncates-the-attribute.md
1  shared/issues/260818-0715_*_the-orchestrator-prompt-names-a-fusion-record-inside-the-instruction-for-what-to-report-to-the-user.md
1  shared/issues/260818-2210_*_a-defect-record-cites-a-verification-run-that-no-copy-of-the-code-it-names-can-produce.md
1  shared/issues/260819-0823_*_the-installed-base-premise-behind-leaving-the-migration-gap-open-is-contradicted-by-install-shs-default-ref.md
1  shared/issues/260819-0836_*_the-status-field-closure-answers-one-of-the-defects-two-halves-and-the-templates-footer-stub-stands.md
```

Nothing was committed and no record's marker was transitioned.
