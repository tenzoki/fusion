# Review: the FJ03d side branch range, before its maintenance window

**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Reviewed-range:** `84047ad7..cd1b5522`
**Not-opened:** `hooks/dist/citation-check.d.ts`, `hooks/dist/citation-check.js`, `hooks/dist/citation-sweep.d.ts`, `hooks/dist/citation-sweep.js`, `hooks/dist/lib/citation-corpus.d.ts`, `hooks/dist/lib/citation-corpus.js`, `hooks/dist/lib/citation-scan.d.ts`, `hooks/dist/lib/citation-scan.js`, `hooks/dist/lib/plan-size.d.ts`, `hooks/dist/lib/plan-size.js`, `hooks/dist/lib/record-index.d.ts`, `hooks/dist/lib/record-index.js`, `hooks/dist/lib/record-write.d.ts`, `hooks/dist/lib/record-write.js`, `hooks/dist/lib/staging-drift.d.ts`, `hooks/dist/lib/staging-drift.js`, `hooks/dist/lib/stores.d.ts`, `hooks/dist/lib/stores.js`, `hooks/dist/plan-size.d.ts`, `hooks/dist/plan-size.js`, `hooks/dist/review-coverage.d.ts`, `hooks/dist/review-coverage.js`
**Review domain:** code
**Work-item:** 260928-1338-json-control-data-and-markdown-artefacts
**Plan:** 261004-2212_*_plan-fj03d-rules-prompts-and-live-predicates-switched-with-this-workbench-in-one-window.md (its `## Where this work stops`, the review precondition of the window)

**Where the range lives.** The two hashes are a range of branch `fj03d`, read in the git worktree beside this checkout. That branch is not yet an ancestor of the checkout this file is written in (`fj-json-workbench`). Eleven commits, 89 files. The worktree was read only: `git show`, `git diff`, plain reads at the head, and one `git archive cd1b5522` of `bin`, `hooks/dist`, `codec/dist`, `codec/contract`, `codec/schemas`, `.claude-plugin`, `skills`, `rules` and `agents` into a scratch directory outside both trees, where every command named below ran. `git status --short` in the worktree printed nothing afterwards, and its head is still `cd1b5522`.

## Summary

The code half of the range does what it says. Liveness comes from the record index in one predicate, the three checkers and three skills refuse a legacy workbench by name, the sweep takes it as a rewriter only, and the migration's kept originals are out of both walks; each of those has a case that would fail without it. Nothing found blocks on correctness of `hooks/`. Three findings of medium weight should be fixed or ruled before the window: `create` drops a plan's step anchors silently in two situations, the one payload the orchestrator needs to finish a package has no documented shape, and the texts name the party of a transition three ways. Six low findings are text drift, one silent exit from the blocking lints, and one header that argues against its own predicate.

## Totals

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 0 |
| Medium | 3 |
| Low | 6 |

Nine findings, nine issue files, all stamped 261005-1350 in this package's issue store.

## What was run, and what was not

- **Run, in the scratch copy:** `bin/fusion-write` (`initialize`, `create` of a package, two plans and two issues, `claim`, `transition` with and without payloads), `bin/fusion-record` (`list`, `show`), `bin/fusion-citation-check`, `bin/fusion-plan-size`, `bin/fusion-citation-sweep --dry-run`, `bin/fusion-work-order`, `bin/fusion-paths`, the last five once more with `workbench.json` moved away, and the record-selection block of `skills/archive/SKILL.md` verbatim under `bash` and `zsh`.
- **Not run:** either test suite. The dispatch gave the suite state at `cd1b5522` (hooks 1 130 of 1 135, codec 1 682 passed and 13 skipped) and I did not re-take it. Whether `hooks/dist/` is the compilation of `hooks/` is `committed-dist.test.ts`'s answer, which I did not run; the 22 compiled files are in `**Not-opened:**` for that reason. Spot check only: the compiled `citation-corpus.js` carries no import, `record-write.js` imports `./legacy-import.js`, and the removed names `JSON_LIVE_STATE` and `LIVE_MARKERS` occur in no compiled file.
- **Codec bytes:** `shasum -a 256` of `codec/dist/fusion-record.js` at `cd1b5522` is `c76bbce9cc86634f5e9c227e8496511dc71eb845768704f43e68200ab841e52e`, and `git diff --stat 84047ad7..cd1b5522 -- codec/dist` is empty.

## Findings by theme

### A. The write client

**A1. `create --kind plan` files a plan with step anchors missing and reports nothing. Medium.**
`hooks/lib/record-write.ts`, `creation`: the ids come from `scanPlan` of `hooks/lib/legacy-import.ts`, and `ids.filter((id) => ids.indexOf(id) === ids.lastIndexOf(id))` drops every number that occurs twice. `scanPlan` also takes a numbered line with a bracket tag as a step outside `## Implementation Steps` (`step[3] !== undefined || inSteps`). Two runs: steps numbered 1, 2 under one sub-heading and 1, 3 under another gave anchors 2 and 3; steps 1, 2 plus `1. [HIGH] ...` under `## Risks & Mitigations` gave anchor 2 alone. Both printed `result=landed`, exit 0, empty stderr. A later `--steps` on id 1 is refused `unknown-step-id`, and no operation adds an anchor. The one test of the feature has neither situation. Scope: every plan filed after the window.
Issue: `261005-1350_*_create-files-a-plan-with-step-anchors-missing-and-reports-nothing-when-a-number-recurs-or-a-tagged-line-sits-outside-the-steps-section.md`.

**A2. No shipped text gives the shape of `--outcome`. Medium.**
`agents/orchestrator.md` `## Work packages`: "`transition --to done --outcome` class `completed`". The schema requires `class`, `reason` and `evidence`. `grep -rn -- "--outcome" agents rules skills docs README*.md` names three lines and no value. `--outcome '{"class":"completed"}'` exits 6 with about 7 KB of schema clauses. The other payloads have a worked form in text their sender loads. Two smaller gaps of the same kind are in the issue: `--implementation-ref` for the two implementers, `set-mode --source` for the orchestrator.
Issue: `261005-1350_*_no-shipped-text-gives-the-shape-of-the-outcome-payload-so-finish-and-drop-are-refused-as-the-orchestrator-prompt-spells-them.md`.

### B. Who sends which transition

**B1. Three passages name the party differently, and a decision reaches a terminal state before its verification is read. Medium.**
`rules/fusion-workbench-conventions.md` `### When to update`: "the reviewing agent transitions it"; no prompt gives a reviewer a transition. `### Issue files` and the orchestrator's "Mark the source complete" bullet read as one actor appending `Resolved:` and transitioning, where `agents/code-implementer.md` splits the two; `agents/data-implementer.md` has no such sentence. For `implemented` both implementer prompts, the planner and Example 1 of `rules/decision-record-examples.md` have the executor send it, the orchestrator's `## Scope` leaves it out, and the plan's step-6 note says the dispatcher sends it. `implemented` has no edge back to `answered`.
Issue: `261005-1350_*_the-rewritten-texts-name-the-party-of-a-transition-three-ways-and-an-implementer-moves-a-decision-to-a-terminal-state-before-its-verification-is-read.md`. Its third item needs the user's ruling.

### C. What a refused workbench is told

**C1. `unsupported` is sent to `/fusion:migrate`. Low.**
`rules/agent-setup.md` `## What fusion-paths emits`. An `unsupported` manifest is a workbench newer than the client; the migration has no branch for it.
Issue: `261005-1350_*_the-setup-rule-sends-an-unsupported-workbench-to-the-migration-which-has-no-branch-for-it.md`.

**C2. The legacy sentence has three spellings, two without the command. Low.**
`legacyLine` in `hooks/lib/record-index.ts` ends "run /fusion:migrate"; `hooks/scope.ts` and `hooks/order.ts` end "migrated to JSON". `docs/upgrading-to-v13.md` `## What a legacy workbench meets` says `bin/fusion-work-order` points at the command. Run: it does not, and neither does `bin/fusion-paths`.
Issue: `261005-1350_*_the-legacy-refusal-is-spelled-in-three-places-and-two-of-them-do-not-name-the-migration-the-upgrade-document-says-they-point-at.md`.

### D. The corpus predicate

**D1. An unreadable control file takes its narrative out of both blocking lints and the checker's verdict, silently. Low.**
`hooks/lib/citation-corpus.ts`: `index.byNarrative.get(rel)?.live === true`; an unreadable row is in `index.unreadable` and in no map. `bin/fusion-plan-size` counts and names such files; the two lints and `bin/fusion-citation-check` do not read the list.
Issue: `261005-1350_*_a-control-file-that-does-not-read-takes-its-narrative-out-of-both-blocking-lints-and-the-citation-checkers-verdict-with-nothing-said.md`.

**D2. The header's criterion and the predicate disagree on open discussions. Low.**
The header keeps "A KIND THAT A MECHANISM REWRITES IS OUT" and then says an open discussion is in, and that "the reader follows the contract, not this comment". Step 8 carries that from the reporter into a lint that fails the suite. No case places a discussion record.
Issue: `261005-1350_*_the-corpus-header-states-a-criterion-its-predicate-no-longer-follows-an-open-discussion-is-now-inside-the-blocking-citation-lint.md`. It asks for a ruling on the direction.

### E. Text that describes what is gone

**E1. Two `README-hooks.md` roster rows. Low.**
`lib/record-index.ts` ("for the caller's own legacy reader") and `lib/plan-size.ts` ("a deliberate second copy" of the lint's corpus). Two older statements in the same tables are listed in the issue.
Issue: `261005-1350_*_two-roster-rows-in-readme-hooks-describe-the-legacy-reader-and-the-second-corpus-copy-that-step-8-removed.md`.

**E2. Marker prose and one dead symbol the pattern search cannot see. Low.**
`agents/policy-curator.md` (four passages against its own converted closing table), `agents/state-auditor.md` (the frontmatter description), `skills/reconcile/SKILL.md`, `rules/agent-setup.md`, an unused identity read in `skills/discuss/SKILL.md`, a sentence in `skills/check/SKILL.md` naming the removed constant `JSON_LIVE_STATE`, and the heading `## On a JSON-controlled workbench` over the only mode in two skills. None instructs a rename.
Issue: `261005-1350_*_prose-in-three-prompts-two-skills-and-one-rule-still-speaks-of-markers-and-of-a-second-mode-where-the-range-left-one.md`.

## What was checked and holds

- **Liveness on the index.** `isLiveRecord(rel, index)` is the one predicate; `hooks/citation-check.ts`, `workbench-citation-lint.test.ts` and, through `measurePlanSizes`, `plan-stopping-section-lint.test.ts` call it or the same `live` flag. The predicate case places records whose name marker says the opposite of their state, read through the codec, and would fail on a marker reader.
- **Legacy refusal in the three checkers.** `fusion-citation-check.test.ts`, `plan-size.test.ts`: exit 4, empty stdout, the stderr sentence matched. Seen in the scratch run as well.
- **Legacy refusal in the three skills.** `codec/src/__tests__/install.test.ts` runs each shipped gate block on a legacy workbench, compares the tree before and after, and matches the refusal sentence in the section's prose; dropping the sentence turns it red. The stop itself is prose, which the test's own comment says.
- **The sweep on legacy.** `citation-sweep.test.ts` runs the 261004-2059 case on both formats and asserts `format=legacy` with no `bound=` line. `/fusion:migrate` reaches Step 6 only when a store rename was due (`FOUND=0` goes to Step 7), so a re-run after an interrupted JSON migration does not sweep.
- **The originals exclusion.** One predicate, `isMigrationOriginal`, applied in `workbenchIndex()` and `workbenchMarkdownFiles()`. Every reader of the workbench's Markdown in `hooks/` goes through one of the two; `scanCorpus` still walks with `markdownFilesUnder`, and only the test helper calls it. Cases in the lint, the checker test and the sweep test each place an original and would fail without the filter. `hooks/lib/record-archive.ts` reads remaining records' narratives through the index, so an original holds no archive unit.
- **`JSON_LIVE_STATE` merged.** In code no reference to the name is left. Two texts still carry it: `codec/fixtures/prior/REQUESTS.md` (a dated account, twice) and `skills/check/SKILL.md`, which says the two surfaces are classed by that list "until the rule names them" (E2, item 7). `staging-drift.test.ts` holds every entry of the merged lists to `rules/workbench-tracking.md`, and a new case asks `git check-ignore` on a codec-written workbench.
- **Subcommands and flags.** Every `bin/fusion-write` subcommand and flag named in `agents/`, `rules/`, `skills/`, `docs/` and the three READMEs exists in that script's header. `reconcile` is named as a `bin/fusion-record` operation, which it is. The edges the conventions state for all five kinds equal `codec/contract/transitions.json`.
- **Skill blocks.** The archive selection block prints the closed shared issue and the done package's container under both shells. Its `"status":"[a-z]*"` pattern does not match `in_progress`, which is a live state the block never selects.

## Cross-cutting observations

- **The live writer now depends on the legacy reader.** `hooks/lib/record-write.ts` imports `scanPlan` from `hooks/lib/legacy-import.ts`. A1 is the visible cost: a rule made for imported plans (a bracket mark anywhere is a step) decides the anchors of new ones. The fix for A1 is the natural point to give `create` its own reading.
- **Abbreviated calls.** Most prompts cite `transition` or `create` without `--record`, `--reason`, `--narrative-file` or `--origin` and point at the conventions for the full form. A missing required flag is a usage error with a clear line, so this fails loudly. A2 is the one place where the full form exists nowhere.
- **Asked of the user in two findings:** B1 item 3 and D2. Both are cheap to rule and each changes text on the dispatch path.

## Recommended sequencing

1. Before the window: A1 (code and a test), A2 (text), B1 (text; item 3 after the ruling). These change what every session does from its first plan and its first closure.
2. Before or with the release: C1, C2, D1, D2.
3. Cleanup: E1, E2.

Already open and not refiled: 261005-1018 (six consumers without a test of their shipped text), 261005-0626 (no prompt sends `attach-evidence`), 260928-1520 (the monitor case), the checker's conflict rows against the lint (a documented limit), and the migrate skill's missing flag for the backup location.

## Read in part

Read as a diff with long lines cut at 1 100 to 1 800 characters, so the tail of some table rows and paragraphs was not seen: `README-agents.md`, `README-hooks.md`, `agents/orchestrator.md`, `agents/policy-curator.md` (added lines only), `docs/working-model.md` and `docs/fusion-intro.md` (added lines only), `codec/README.md` (added lines only). `hooks/lib/__tests__/fusion-citation-check.test.ts` was read for its first 90 changed lines and its legacy case, `hooks/lib/__tests__/fixtures/rules-emission.golden` for its first five blocks. `rules/fusion-workbench-conventions.md` was read at the head from `## Work packages` to `## Decision Record Template` in full, and above that in the sections the findings cite.
