# Code review — four constraints on deep change

**Reviewed-range:** `b91c01c..bbfc912`
**Sender:** coderev
**Reviewed:** 2026-08-20
**Circle:** `260819-1645-four-constraints-on-deep-change`
**Suite at HEAD:** `cd hooks && npm test` — exit 0, 39 test files, 701 tests. Run once, in full, by this pass.
**Carried from a previous review:** none. `bin/fusion-review-coverage` reported `carried=(not recorded)` before this pass and `uncovered=10`.
**What "not opened" means below:** the 101 files named are workbench records edited by the mechanical citation repairs of plan steps 5 to 9b. They were verified as a class rather than individually — `scanCitationTokens` was run over the whole workbench (1 627 files, 15 167 tokens) and `scanRecordCitations` over the live corpus, and the semantically loaded subset (the twenty-four statement rewrites) was sampled at three files. No file among them was opened one by one.
**Not-opened:** `260716-1847-workbench-umbau`, `260718-1924-v5x-overhaul`, `260801-1244-curator`, `260814-0813_*_the-circle-records-title-and-dependencies-still-describe-the-conventions-file-as-the-validation-case.md`, `260814-0828_*_the-grounding-and-the-spec-still-call-the-growth-bound-decision-open-after-it-was-answered.md`, `260814-1450_*_the-turn-3-bookkeeping-says-no-review-ran-in-the-commit-that-landed-the-review.md`, `260814-2017_*_the-newest-decision-record-carries-no-answered-implemented-footer-block-so-its-next-transition-has-nowhere-to-land.md`, `260814-2022_*_initiated-by-carries-quoted-user-dialogue-and-no-surface-bounds-it-to-one-line.md`, `260814-2153_*_the-commit-that-closes-the-last-reviews-own-high-finding-is-the-one-commit-no-review-opens.md`, `260801-1244-guard-rules-write`, `260805-2323_*_die-emissionsmessung-auf-der-unite-cocreator-maschine-steht-noch-aus.md`, `260801-1244-rule-provenance-header`, `260804-1205-shell-reachability-model`, `260805-2005-textschicht-gegen-code-nachziehen`, `260807-0923-guard-misst-statt-orakelt`, `260807-0952_*_ontocoder-kann-keinen-entscheidungssatz-ablegen.md`, `260813-0858-playmaker-maintains-backlog-store`, `260815-0007-remove-eight-mechanisms-and-cap-growth`, `260815-2056_*_what-marks-an-answered-decision-whose-answer-can-no-longer-be-realised.md`, `260815-0803_*_the-plans-step-3-file-list-says-fourteen-fixture-files-and-the-tree-held-fifteen.md`, `260815-0804_*_the-circle-records-dependencies-section-announces-five-bound-artifacts-and-lists-six.md`, `260815-1247_*_the-churn-leaves-were-removed-without-a-retirement-entry-and-the-retirement-table-could-not-have-held-one.md`, `260815-1247_*_the-implemented-decision-records-two-cross-references-were-broken-by-the-commit-that-transitioned-it.md`, `260815-1455_*_plan-step-9s-mechanical-acceptance-grep-fails-at-head-on-a-step-marked-done.md`, `260815-1631_*_one-of-the-four-derivation-rows-points-at-a-hand-maintained-field-in-the-same-file.md`, `260815-1631_*_the-installer-copy-list-names-a-license-file-the-tree-has-never-shipped.md`, `260815-1633_*_eight-shipped-surfaces-still-present-the-three-demoted-skill-names-as-user-commands.md`, `260815-1913_*_closing-the-plan-dangles-thirty-four-workbench-citations-that-spell-its-open-marker.md`, `260816-1741-guard-becomes-observation-only`, `260816-2319_*_the-answer-site-case-in-hook-fail-open-cannot-fail-on-the-violation-its-describe-block-names.md`, `260816-2320_*_the-write-trace-is-now-the-guards-only-product-and-two-of-its-four-tools-reach-no-integration-case.md`, `260819-1645-shaper-four-constraints-on-deep-change.md`, `260819-2016-planner-four-constraints-on-deep-change.md`, `260819-2038-coder-four-write-tools-through-the-hook.md`, `260819-2042-coder-pin-the-compiler-and-assert-the-committed-artifact.md`, `260819-2044-coder-deletion-annotation-form.md`, `260819-2045-coder-repair-the-stale-marker-citations.md`, `260819-2213-coder-repair-the-wrong-store-citations.md`, `260819-2250-coder-resolve-the-citations-that-resolve-to-nothing.md`, `260819-2315-coder-repair-the-stamp-name-citations-that-name-nothing.md`, `260820-0530-coder-repair-what-the-circle-record-grammar-made-visible.md`, `260820-0727-coder-the-twenty-four-statement-citations-are-rewritten-as-addresses.md`, `portfolio.md`, `260719-2141_*_concurrency-worktree-slots-vs-single-active-circle.md`, `260806-1152_*_stash-manifest-dirname-and-pointer-content-duplicate.md`, `260807-0158_*_how-is-a-unique-record-filename-obtained.md`, `260810-1544_*_should-prompt-called-bin-helpers-get-one-guarded-call-convention-and-does-the-work-tree-preference-extend-to-them.md`, `260810-1635_*_where-does-the-obligation-sit-to-update-the-artefact-that-explains-a-behaviour-when-the-behaviour-changes.md`, `260810-2032_*_should-the-drift-checks-four-sentences-be-pinned-to-an-approved-baseline-instead-of-screened-by-a-blacklist.md`, `260810-2145_*_should-a-repeated-skill-body-snippet-become-a-bin-helper-now-that-one-fact-lives-in-four-executable-copies.md`, `260811-1522_*_should-the-readme-hooks-lib-table-pin-its-prose-to-the-modules-it-describes.md`, `260812-0254_*_should-a-cited-artifact-path-be-absolute-so-an-editor-can-open-it.md`, `260813-0826_*_should-fusion-help-become-a-self-knowledge-skill-that-answers-from-the-live-installation.md`, `260815-2109_*_may-a-circle-close-over-an-uncovered-review-range-and-who-decides.md`, `260816-0740_*_does-the-prose-register-get-a-measurable-gate-and-which-surface-does-it-measure.md`, `260816-1707_*_which-install-path-is-the-authoritative-one-for-end-users.md`, `260819-1732-playmaker-direct-dispatch.md`, `260801-1020_*_plane-mirror-circle-closed-with-empty-turn-log.md`, `260801-1410_*_unattributed-edit-to-ontocoder-prompt-during-session.md`, `260803-1837_*_no-route-turns-existing-pre-circle-work-into-a-circle.md`, `260804-1702_*_the-diagram-self-check-tests-shape-and-never-tests-agreement-with-the-prose.md`, `260807-2154_*_corrected-sibling-wording-never-reaches-an-existing-consumer.md`, `260807-2154_*_the-writing-profile-carries-no-handle-for-the-reference-that-now-points-at-it.md`, `260808-0030_*_line-number-citations-into-rule-files-go-stale-and-no-gate-reads-them.md`, `260808-0030_*_the-coderev-pass-filed-four-issues-and-left-no-review-file.md`, `260810-0819_*_head-carries-six-records-twice-and-the-class-fix-was-deferred-to-a-decision-never-filed.md`, `260810-0820_*_the-turn-1-review-totals-table-says-fourteen-findings-and-the-body-carries-seventeen.md`, `260810-1618_*_a-release-was-tagged-and-pushed-while-its-own-review-pass-was-still-running.md`, `260810-1820_*_an-executor-verified-a-gate-by-mutating-a-file-another-executor-held-in-the-live-tree.md`, `260810-2027_*_the-monitors-browser-gap-line-has-no-executable-gate.md`, `260810-2110_*_the-domain-capture-one-liner-is-now-copied-into-a-fourth-skill-body-and-the-copying-is-the-stated-justification.md`, `260811-1301_*_the-orchestrators-routing-table-omits-cargo-toml-from-the-build-manifests.md`, `260811-1547_*_the-orchestrator-prompt-cites-a-fusion-monitor-reset-skill-that-does-not-exist.md`, `260811-1613_*_four-prompts-now-defer-to-a-routing-table-that-still-carries-the-gap-260811-1301-names.md`, `260811-1734_*_reduce-the-surface-so-a-claim-cannot-go-stale-in-several-places-at-once.md`, `260811-2105_*_circle-records-carry-the-same-silent-citation-form-and-a-third-of-their-citations-are-stale.md`, `260811-2147_*_nothing-pins-the-gitignore-bin-exception-list-against-the-contents-of-bin-and-the-failure-is-a-helper-missing-from-the-tarball.md`, `260811-2245_*_no-test-pins-that-the-project-language-cases-are-cited-by-content-so-the-next-ordinal-ships-unnoticed.md`, `260812-0253_*_agents-answer-a-question-the-user-did-not-ask-and-the-length-caps-do-not-hold.md`, `260812-1720_*_the-migration-premise-in-the-circle-placement-decision-does-not-match-the-workbench.md`, `260812-1720_*_the-reference-resolution-lint-does-not-scan-the-workbench-where-citations-are-densest.md`, `260812-2136_*_the-citation-grammar-reads-one-ellipsis-and-one-marker-syntax-and-the-workbench-uses-two-of-each.md`, `260813-0913_*_a-dependency-between-two-circles-can-only-be-recorded-on-one-side-because-nobody-may-write-the-other.md`, `260814-1419_*_the-shipped-chat-voice-profiles-changed-and-the-workbench-copies-agents-actually-load-did-not.md`, `260814-2118_*_the-hooks-suite-fails-differently-on-repeated-full-runs-and-does-so-on-clean-head.md`, `260816-0025_*_the-archive-skills-never-archive-list-omits-the-migration-backup-store-while-naming-its-twin.md`, `260816-0119_*_the-lints-newly-widened-surface-still-stops-at-hooks-lib-tests-where-real-citations-have-gone-stale.md`, `260816-0719_*_review-sender-cannot-parse-the-per-topic-review-filename-both-reviewer-prompts-mandate.md`, `260816-0740_*_the-always-on-rule-corpus-runs-at-sixteen-times-the-em-dash-ceiling-it-states.md`, `260816-1049_*_the-split-calls-portfolio-md-not-machine-refreshed-and-the-playmaker-regenerates-it-in-full.md`, `260816-1330_*_the-foreclosure-clause-does-not-say-whether-it-costs-a-line-per-option-and-the-cap-two-sections-below-forbids-relaxing.md`, `260816-1330_*_the-repunctuations-evidence-paragraph-carries-a-token-count-nobody-can-reproduce-and-an-inverted-capitalisation-claim.md`, `260816-1345_*_the-register-defects-corpus-table-is-labelled-always-on-and-is-not-the-always-on-set.md`, `260817-1217_*_the-monitors-dismiss-keys-are-html-escaped-as-text-so-a-quote-in-a-warning-truncates-the-attribute.md`, `260818-0715_*_the-orchestrator-prompt-names-a-fusion-record-inside-the-instruction-for-what-to-report-to-the-user.md`, `260818-2210_*_a-defect-record-cites-a-verification-run-that-no-copy-of-the-code-it-names-can-produce.md`, `260819-0001_*_an-executor-reached-for-git-stash-while-two-were-dispatched-in-parallel.md`, `260819-0823_*_the-installed-base-premise-behind-leaving-the-migration-gap-open-is-contradicted-by-install-shs-default-ref.md`, `260819-0836_*_the-status-field-closure-answers-one-of-the-defects-two-halves-and-the-templates-footer-stub-stands.md`, `260819-1511_*_the-archive-citation-filter-reads-shipped-text-and-never-the-workbench-so-archiving-dangles-citations-invisibly.md`, `260819-2227_*_a-plan-step-can-state-a-narrow-reading-that-does-not-exist-as-a-half-measure-and-nothing-asks.md`

## Summary

The four constraints are closed and the fifth is realised. Each of the five is verified here against
the tree rather than against its own account: the dist gate compiles HEAD in a temp tree and matches
36 files byte for byte, all four write tools reach the hook and each asserts the trace row's `tool`,
the whole-tree git prohibition sits at the dispatch point at a measured 395 bytes, the citation gate
is armed over a written marker predicate and reports zero violations, and the deletion-annotation
form is in `rules/circle-records.md` with a resolving `Implemented:` citation on the decision that
waited for it since 5 August. Nothing in the delivered code is wrong.

Thirteen findings, none of them a release blocker and none of them in the mechanisms themselves. Six
are about the workbench's own tracking state, which stopped being written part-way through the
range: two decisions this Circle realised are still answered, three issues it fixed are still open,
the plan is still `Draft` under the open marker, and the dashboard, event log and `agentstate.yaml`
froze at the planning step while eight further commits landed. The rest are single-file accuracy
defects — a guard the artifact case does not carry, three stated measurements that do not
reproduce, one corpus exclusion narrower than the project's own precedent, and two documentation
gaps.

**Totals:** Critical 0 · High 0 · Medium 7 · Low 6.

## The seven judgements the dispatch asked for

Each is answered against the tree, with the command or the file:line that settled it.

### 1. The dist gate's decidability — sound, with one asymmetry

**The three assertions do run in the stated order** and each is a separate `it` with its own message
(`hooks/lib/__tests__/committed-dist.test.ts:177`, `:209`, `:217`). **The compile does not.** It
happens in `beforeAll`, which vitest runs before the first case, so the file's own line 42 ("Only
then do the second and third cases compile HEAD and compare") describes the reporting order, not the
work order.

**A `typescript` bump reddens the toolchain case rather than the artifact case in one of the two bump
shapes and not the other.** Declared-but-not-installed reddens case 1 alone, as claimed.
Installed-and-declared reddens case 1 and, once the emit differs, case 3 as well — and case 3 carries
guards on `gitFailure` and `compileFailure` but none on the toolchain agreement, so it prints "the
committed hooks/dist is not the compilation of the committed source" with a `FIX` that says to
rebuild and commit. Acting on it commits a `dist` built by the unpinned compiler. Filed as the
first Medium below.

**The claim that the test writes nothing under `hooks/dist` or the build staging tree holds, and was
checked rather than read.** Running the file alone with `npx vitest run` left `git status --porcelain`
empty (`hooks/dist` is tracked, so a byte would have shown) and left `hooks/node_modules` intact at
41 entries — the last worth checking because the test symlinks the live `node_modules` into its temp
tree and then `rmSync`s that tree recursively. Node unlinks the symlink rather than following it.
`tsc` is invoked with `--outDir` into the temp tree and the config carries no `incremental` or
`tsBuildInfoFile`, so nothing under `hooks/` is written at all.

### 2. The fenced-code exemption's departure — verified, and the two cases are real

The tracker implements CommonMark 0.31.2 §4.5 for what it claims and departs on the unclosed fence,
discarding `pending` at the end of the walk rather than committing it
(`hooks/lib/__tests__/helpers/citation-scan.ts:228-265`). Fourteen cases in
`fenced-code-exemption.test.ts` pin it, including the three that assert the departure.

**The two cases the session says it found are the two it names, and they are cases in the test file
rather than instances in the corpus** — the history log is precise about this and the dispatch's
phrasing slightly is not. Reverting the discard to CommonMark's "commit to end of document" reddens
three tests, and two of them are about *closing*: `~~~` followed by ` ``` ` (wrong marker
character) and ` ``` ` followed by ` ``` and more ` (marker with trailing text). Both feed the
tracker a fence that opens and never closes, and under the spec reading each silently exempts the
rest of the input. That is the switch-off failure arriving through two doors nobody set out to
guard, and the finding is sound: the tests exist, they assert the strict behaviour today, and the
revert's effect on them follows from the two lines of code involved.

The three omissions are stated at the branch and each is the safe direction — container blocks and
tab indentation leave content **judged**, and four-space indentation was measured (181 tokens across
both corpora, every inspected sample a list continuation) before being excluded rather than after.

### 3. The two widenings — the one-sweep bound holds on the side it is claimed for

**`unsweep` strips exactly one `archive/<stamp>-<slug>/` prefix**, the pattern is anchored at `^`, and
`anchoredUnder` calls it once (`citation-scan.ts:367-374`). A record two sweeps deep would not
resolve for a single-sweep citation. That is the bound the doc comment defends and it holds.

**The bound is on the index side only, and the doc says so.** The citation side has no anchor at all
— `REC_RE` begins matching at the store segment, so `archive/A/archive/B/shared/issues/…` produces
the same token as `shared/issues/…` and resolves. Verified by probe. The comment at
`citation-scan.ts:329-347` states this cost in the form the user chose (shape 1) rather than leaving
it to be found, which is the right disclosure.

**The marker position behaves for a Circle record exactly as it does elsewhere.** Probed at HEAD:
`260716-1847-workbench-umbau` resolves, `…/_*_circle.md` resolves through the
wildcard, `…/_t_circle.md` returns `stale-marker` naming the record that exists and the wildcard fix.
`anchoredAt` is an equality rather than a prefix, with the reason written at the branch — a
`startsWith` would have accepted every record in every store inside the Circle and every sibling
Circle whose name begins with this one's.

### 4. The new gate's failure message — all three legs present, and actionable alone

`workbench-citation-lint.test.ts:122-140` carries the pointer remedy (correct it; the per-finding
`fix` line says how), the statement remedy (name the file and the line, or fence the verbatim form),
and the refusal (adding a file to `RECORD_EXAMPLE_FILES` is not the answer, with the reason — it
exempts the file's later citations too, and the records likeliest to trip this gate are the records
about stale citations). A reader meeting it needs no decision record: the message names the symbol,
the two remedies and why the third is wrong, and each finding beneath it carries file, line, token,
problem and fix.

Demonstrated failing three ways in a detached worktree, per the step's own log, and the transcripts
are reproduced there rather than asserted.

### 5. The twenty-four statement rewrites — no finding came out vaguer

Sampled at three of the ten records, chosen for the three shapes the issue names.

- The nine-row transcript table keeps its left column as ordinary markdown and moves the nine
  citations into a fenced block, numbered `(1)`–`(9)` against the rows. Every spelling survives
  verbatim and the record still says which citation is defective in which file.
- The activation-renamed cross-reference now reads "cites this Circle's own record at the address
  named under **Affects:** below, by the `_a_circle.md` name it carried before activation" — and the
  `Affects:` field names the citing record with a `:7` line number, while the verbatim line survives
  in the record's own blockquoted `## The line` section.
- The two absorbed renames gained full paths in wildcard form plus the explicit `_o_ → _c_` statement,
  where the record previously carried two truncated filenames. That one came out **more** precise.

The commit message's framing is right: the evidence moved one hop, it did not leave. Nothing sampled
lost the identity of the defective citation or the statement of what is wrong with it.

### 6. Four re-approvals and three refusals — all three refusals check out

**The three refusals are correct, each verified against the tree rather than against the log.**

| step | claim | how it was checked |
|---|---|---|
| the archive-sweep widening | `BASELINE` did not move | no class-(c) token on the 81-file shipped surface resolves into `archive/`; the six that do are `stamp-bare` and were already `ambiguous`, and that class never reached `findRecord`'s anchored branches |
| the Circle-record grammar | `BASELINE` did not move | exactly one `circle-record` token exists on the shipped surface, `skills/migrate/SKILL.md:96`, and it is exempt as a record-example file; the same span produced no token at all before the pattern existed |
| the fenced-code exemption | `BASELINE` did not move | exactly two tokens sit inside fences on the shipped surface — `rules/circle-records.md:103` (`stamp-bare`) and `rules/fusion-workbench-conventions.md:28` (`stamp-name`) — and neither was a gate kind on that day |

**The re-approvals that were written attribute per file, and the arithmetic reproduces.** The
2026-08-20 note's `+3` records are the three `stamp-name` tokens it names, and all three resolve in
my own scan (`docs/upgrading-to-v10.md:41`, `docs/upgrading-to-v9.md:31`,
`skills/cadence/SKILL.md:136`). Its "eight further are exempt — seven announced illustrations and one
inside a fence" reproduces exactly: eleven `stamp-name` tokens on the surface, 3 + 7 + 1. The
convention line's `+1 / +1 / +2` is attributed to the one paragraph and its two record citations.
The note says in its own words that the two causes summing exactly is not a general rule, which is
the honest form.

Within this range `BASELINE` moved twice, at `ad7ffed` and at `bbfc912`. The "four" in the dispatch
and in the new gate's own comment does not match the file, which carries fourteen re-approval notes;
that is filed below as a Low.

### 7. The two out-of-scope repairs — both right, one worth naming precisely

`rules/context-manifest.md:110` named a Circle `260718-1924-ontology-refactor` that has never
existed, spelled with the real stamp of `260718-1924-v5x-overhaul`. Replacing the digits with
`YYMMDD-HHMM` removes the token entirely and fixes a false claim to a human reader as well. Right,
and a correctness fix rather than a gate fix.

`skills/log-activity/SKILL.md:86` gained an `e.g.` before a fabricated example filename. **That token
is now `exempt`, reason `announced-illustration` — verified by probe, not inferred.** So "nothing was
quietly exempted" is true in the sense the commit message means it (no code changed, no file was
allowlisted) and the token is nonetheless unjudged rather than resolving. The distinction is stated
plainly in both the step's history log and the `BASELINE` re-approval note, so nothing is hidden, and
the classification is honest — the filename genuinely is an illustration and the exemption exists for
that. No defect filed; recorded here because the commit message alone would not tell you.

## Findings

Thirteen records, one per finding, all in `$OUT_ISSUE` — this Circle's own store, since every one
arose from its Directive.

### Theme A — the compiled-artifact gate

| # | Severity | Finding | Record topic |
|---|---|---|---|
| 1 | Medium | The artifact case carries no toolchain guard, so a mismatch reddens it too and its `FIX` prescribes committing a `dist` built by the unpinned compiler. The file also says the compile happens in the cases when it happens in `beforeAll`. | `the-artifact-case-of-the-dist-gate-carries-no-toolchain-guard-…` |
| 2 | Low | The plan calls `hooks/package-lock.json` one of "the two places that matter" for the pin. It is gitignored (`.gitignore:7`) and `git ls-files` does not know it. The test header states the correct reading; the plan was never corrected. | `the-plan-names-a-gitignored-lockfile-as-one-of-the-two-places-…` |
| 3 | Low | The `@types/node` residual states that a grep over `hooks/dist` finds no `node:` reference. `git grep -c 'node:' b91c01c -- hooks/dist` returns 17 hits across 10 files. The conclusion survives; the measurement does not. | `the-plans-node-types-residual-states-a-grep-result-that-does-not-reproduce` |

### Theme B — the citation gate and its parser

| # | Severity | Finding | Record topic |
|---|---|---|---|
| 4 | Medium | The corpus excludes `archive/` alone, and two of its four predicates are unanchored, so a frozen copy tree — `.migration-v2-backup/`, `stashes/` — would enter a blocking gate whose findings cannot be honestly repaired. `skills/log-activity/SKILL.md:89` names four such directories for the same reason. | `the-citation-gates-corpus-excludes-only-archive-…` |
| 5 | Low | The gate's design comment says the sibling pin "has been re-approved four times". The sibling file carries fourteen such notes. | `the-new-gate-says-the-sibling-pin-was-re-approved-four-times-…` |
| 6 | Low | The token-for-token case restates `GATE_KINDS` as a deliberate literal, and nothing compares the two. It was already stale for two steps — three kinds where the helper had four — and passed because the shipped surface carries one `circle-record` token and it is exempt. | `the-token-for-token-case-restates-gate-kinds-as-a-literal-…` |

### Theme C — the workbench's own tracking state

This is where the range is weakest, and it is the theme the Circle's own subject makes conspicuous.

| # | Severity | Finding | Record topic |
|---|---|---|---|
| 7 | Medium | Both decisions this Circle produced are realised in code at `bbfc912` and both still carry the answered marker with no `Implemented:` line. The same range transitioned the two decisions it *consumed*, so the omission is these two records rather than a practice. | `two-decisions-this-circle-realised-in-code-are-still-answered-…` |
| 8 | Medium | Three of the Circle's five defect records were answered and fixed inside the range and still carry the open marker with no `Resolved:` footer. The same range closed two inherited records at the moment their fix landed. | `three-issues-resolved-inside-this-range-still-carry-the-open-marker-…` |
| 9 | Medium | The plan reads `**Status:** Draft` under the open marker with nine of ten steps `[DONE]`. It is the only plan in the workbench whose Status still reads what the planner wrote. Step 5's `[DONE]` also sits after its title where the other eight sit before it. | `the-plan-is-still-status-draft-under-the-open-marker-…` |
| 10 | Medium | The Circle record's `**Active spec/plan:**` field spells the plan's exact marker. A Circle record is inside the gate this Circle armed, so closing the plan turns `npm test` red on a line nobody touched. First live instance of the coupling the new gate creates. | `the-circle-records-active-spec-plan-field-spells-an-exact-marker-…` |
| 11 | Medium | `orchestrator-live.md` was last written in the session's first minute and reports `Commits: 0` and `[PLANNING]`; the event log's last entry is the first commit; `agentstate.yaml` says step 6 is running. Ten commits and nine steps landed. Two further surfaces (the Turn log and the session history's `## Turns`) are not yet due and are named as such. | `the-session-bookkeeping-froze-at-the-planning-step-…` |

### Theme D — documentation and budget reporting

| # | Severity | Finding | Record topic |
|---|---|---|---|
| 12 | Low | Neither new gate is named in `README-hooks.md`, `README.md`, `CLAUDE.md` or `docs/`. `### Rebuilding after TS changes` states the dist-matches-source obligation without the test that now enforces it, and the troubleshooting table has no row for a gate that reddens for somebody who touched nothing. | `neither-new-blocking-gate-is-named-on-any-shipped-surface` |
| 13 | Low | The step that put +987 bytes into the always-on rule core reported the bound as green without the remaining figure, while reporting the hook-test surface's exactly. The figure is 6 206 of 12 000. The plan's "writing there costs no budget" was true of step 4's file and false of step 9's. | `the-step-that-spent-the-always-on-rule-budget-reported-green-…` |

## Plan steps, gates and budgets — the routine checks

**Every step marked done is done.** Verified individually: step 1 (`committed-dist.test.ts` exists,
`hooks/package.json` carries the exact `5.9.3`, three cases green in 3.8 s), step 2 (four cases, each
asserting `tool` and `file`; `NotebookEdit` goes through `runGuard` with a `notebook_path` payload),
step 3 (one bullet at Step 3a item 4, one clause at Step 3b item 2b, line 983 untouched as the plan
required, 395 bytes measured against the 600 allowed), step 4 (`rules/circle-records.md:67`, the
decision at `_i_` with a resolving citation and its `**Status:** open` head field preserved as
instructed), steps 5 to 9b (the live corpus reports zero violations in the armed gate), step 9 (the
gate exists and is green), step 10 struck by the answered corpus decision.

**The growth bounds are honestly reported.** All three figures reproduce at HEAD: `agents/` 2 914
bytes left (the consolidation log's figure), `skills/` 9 711 after the +5 (reported as 9 716 before
it, and the +5 named), hook-tests 768 lines (the step-9 figure, exact). The one figure no log states
is the always-on core's, which finding 13 covers.

**Both `Implemented:` citations added in this range resolve.** `rules/circle-records.md:67` is the
`### Deletion is outside the vocabulary` heading; `hooks/lib/__tests__/committed-dist.test.ts` exists
and is green. Both `Resolved:` footers added in this range sit on records that were correctly renamed
to the closed marker.

**The Circle record's head fields are current in substance and one of them is fragile in form.** Both
name files that exist; the `**Active spec/plan:**` marker is finding 10. The `## Turn log` is empty
and the session history's `## Turns` reads `(none yet)` — both are written at the Turn boundary,
which this range has not reached, so neither is overdue. They are named in finding 11 beside the
three surfaces that are.

## Cross-cutting observations

**The range's own subject caught up with it, and this is the finding worth carrying forward.** Six
of the thirteen findings are stale tracking state in a Circle whose Directive was that a deep change
should not go wrong unobserved. The Circle built a gate that reads citations in live records; the
records it left behind are answered decisions marked as unanswered, fixed defects marked as open, and
an executed plan marked as a draft. Nothing the gate reads is wrong. Everything the gate does not
read has drifted — and the drift is in exactly the fields the reconciler and the resume path consume.

**Every mechanism that used to notice this has been removed on its own measurement, and the removals
were right.** `agents/orchestrator.md:238` records that the Turn-log drift check went on 2026-08-15
with the counters it read; `agents/orchestrator.md:1063` records the same for `agentstate.yaml`'s
tallies. This review is the observation those mechanisms no longer make. That is a statement about
where the obligation now sits, not an argument for re-arming them — re-arming is a decision nobody
has filed and this review does not pre-empt it.

**Three of the thirteen are stated measurements that do not reproduce** (findings 3, 5, 13 —
a grep count, a re-approval count, an absent figure). All three sit in prose beside work whose
numeric discipline is otherwise exemplary: the per-file `BASELINE` attributions, the head-room
arithmetic and the corpus tables all reproduce to the token. The pattern is that a figure quoted
about a *neighbouring* file drifts while a figure measured about *this* file does not.

**The new gate creates a coupling nobody has met before, and finding 10 is its first instance.** A
Circle record is inside the corpus in every state, and a Circle record's head field points at a plan
whose marker moves. Closing a plan is now a two-file act. Nothing is wrong with the gate; what is
missing is anybody having noticed that closing this Circle is now blocked on a one-character edit.

## Recommended sequencing

**Nothing here blocks a release.** The suite is green, the gates work, and the shipped surfaces are
correct.

1. **Before the plan or the Circle transitions** — finding 10, then 9. One character in the head
   field, then the plan's Status and marker. In that order, or the two must land in one commit.
2. **Before the Turn closes** — findings 7, 8 and 11. The two decisions to `_i_`, the three issues to
   `_c_`, and the three per-task surfaces brought up to the settled tree.
3. **Whenever the mechanisms are next touched** — findings 1 and 4, the two that change behaviour.
   Finding 1 is one field on `prepared` and two lines; finding 4 is a three-name extension of one
   constant.
4. **Cleanup, in any order** — findings 2, 3, 5, 6, 12 and 13. Six text repairs and one exported
   constant.

---

## Reconciliation annotation — 260820-0830-reconciliation.md

Added by the reconciler (domain `code`, HEAD `04db0b0`). Findings are not rewritten; this block
records which of them were re-checked against the tree and what the re-check returned.

**Confirmed still reproducing, marker unchanged (8):** findings 1, 2, 3, 4, 5, 6, 12, 13. Each
carries the evidence in its own record's `Reconciliation 260820-0830-reconciliation.md` block.

**Confirmed resolved (5):** findings 7, 8, 9, 10, 11. All five records are `_c_` and the fixes are on
disk — four decisions at `_i_` with resolving `Implemented:` citations, five defects at `_c_` with
`Resolved:` footers, the plan at `_c_` reading `**Status:** Complete`, and the Circle record's
`**Active spec/plan:**` field starred.

**One correction to a re-check, not to a finding.** Finding 3 states that `git grep -c 'node:'
b91c01c -- hooks/dist` returns 17 hits across 10 files. Re-run here it returns **18 across 11**. The
finding stands — the plan's claim of zero is wrong either way — but the number in this table does not
reproduce, which puts it in the same class as the three measurements the finding itself is about.

**Two findings were closed short of their own fix direction, one of them materially.** Finding 9's
record asked for three things and its closure did two; the third (step 5's inline marker position)
was done by this pass. Finding 11's record asked for the three per-task surfaces to be brought
current; commit and review events were backfilled, no `task_start` or `task_done` event was ever
written for this session, and `agentstate.yaml`'s `current_task.source_file` re-dangled at the plan
transition one commit later. Filed as
`260820-0906_*_the-three-per-task-surfaces-disagree-with-each-other-and-one-field-re-dangled-at-the-plan-transition.md`.

**On finding 4, which the dispatch asked to be judged for closure.** It reproduces and it is latent:
neither `stashes/` nor `.migration-v2-backup/` exists in this workbench, so no frozen copy tree is
being scanned today. The opposite direction of the same constant is not covered by it and was filed
separately —
`260820-0906_*_the-citation-gates-corpus-has-no-planning-clause-so-an-open-plan-is-a-live-surface-outside-the-gate.md`.

**Coverage.** `bin/fusion-review-coverage` reports `verdict=uncovered`, `uncovered=1` over
`b91c01c..HEAD`: this review's range ends at `bbfc912` and `04db0b0` is not opened by any review.
That commit touches `fusion-workbench/` only. Under the standing answer to
`260815-2109_*_may-a-circle-close-over-an-uncovered-review-range-and-who-decides.md`
coverage is advisory and the gap is named in the closure note; under the same record's second
answered option, which is recorded and unrealised, a commit touching no shipped file would not be
counted uncovered at all.
