# Analysis: defect survey, group 3 of 3

**Date:** 2026-09-18 11:09
**Type:** Gap
**Status:** Complete
**Requested by:** orchestrator (work item `260918-1048-defekte-selbstaendig-abarbeiten-mit-zweitmeinung.md`)

## Question

Which of the 36 open defect records in group 3 qualify for an autonomous fix package under the work item's four exclusions (structured data, consent, not fixable here, not verifiable), and for the ones that qualify: which files, which acceptance test, how much effort, whether the growth bounds bite, and whether more than one serious fix option exists.

## Scope

The 36 records listed in the dispatcher's `g3.txt`, all under the shared issue store, each read in full. For every record the code, prompt, skill body, rule file or doc it names was opened at HEAD and the defect's presence re-checked there; where the record's subject has since been removed or repaired, the evidence is cited in the table.

Tree read: `/Users/k1/Projects/productive/fusion`, HEAD `f14506554f6a7bdbf3f1b1b5500e217b1cd04b90` (2026-09-18 11:03:15 +0200), branch `main`, `git status -sb`: `## main...origin/main [voraus 1]`, one modified file (`fusion-workbench/orchestrator-events.jsonl`). Every present-tense claim below is dated by this. `cd hooks && npm test` was not run (a baseline run is in progress, per the dispatch).

Verdict vocabulary: `IN`; `OUT-1` structured data; `OUT-2` consent or ambiguous mandate; `OUT-3` not a defect an agent can fix in this repository; `OUT-4` not verifiable; `RESOLVED-AT-HEAD` the tree already carries the fix, what remains is the record's marker.

## Findings

| # | Record | Verdict | Why |
|---|---|---|---|
| 1 | `260908-0032_*_two-hook-tests-are-load-sensitive-and-fail-only-in-the-parallel-full-run.md` | OUT-4 | The acceptance is six full-suite runs under two load conditions and the cause is unlocated (the deadline raise `ea17e354` of 2026-09-06 predates the filing and did not settle it), so no single check shows it fixed and the mandate names no file. |
| 2 | `260908-0104_*_a-doc-comment-cites-two-re-baselining-events-while-the-helper-defines-three.md` | IN | Still present: `hooks/lib/__tests__/rules-emission-golden.test.ts:235`, `:490`, `:693-694` say "two events" while `helpers/growth-bound.ts:18` and the same file's `:1162-1163` say three; a word swap in comments and one message string closes it. |
| 3 | `260908-0845_*_two-roles-are-over-the-reporting-budget-on-circle-records-after-the-merge.md` | RESOLVED-AT-HEAD | Both the file and one of the two roles are gone: `ls rules/circle-records.md` returns no such file and `agents/` holds no `playmaker.md`, so the budget has nothing to bind. |
| 4 | `260908-0851_*_three-surfaces-enumerate-the-configuration-leaves-and-no-plan-step-names-any-of-them.md` | RESOLVED-AT-HEAD | All three surfaces now name the one live leaf and the two retired ones: `skills/help/SKILL.md:112`, `docs/working-model.md:142`, `docs/fusion-intro.md:77` ("genau ein aktives Setting: `citations.extraPaths`"), and `hooks/lib/config.ts:22` states `extraPaths` is the only setting. |
| 5 | `260908-0920_*_v10-24-1-is-tagged-and-was-never-entered-in-the-marketplace.md` | OUT-3 | The fix is a marketplace entry or a release-process ruling on partial tags, both release acts outside this tree. |
| 6 | `260908-1324_*_a-work-tree-behind-the-install-hides-skills-the-install-has-and-nothing-warns.md` | IN | The exit-2 message at `bin/fusion-paths:212` and `:233` still names neither the work-tree preference (`:197-199`) nor `git pull`, and extending that message is code-only with a statable check. |
| 7 | `260909-1345_*_the-size-analysis-understates-the-always-on-peak-and-the-august-cut.md` | OUT-3 | It corrects figures inside a shared analysis record, a state of the workbench and not of the tree. |
| 8 | `260909-1347_*_the-eightfold-bookkeeping-rise-excludes-337-legacy-stamped-records-from-the-two-anchor-months.md` | OUT-3 | Same subject: a figure in the same analysis record, nothing in the tree to edit. |
| 9 | `260909-1348_*_recommendation-7-names-an-archive-confirmation-the-cleanup-pipeline-does-not-put.md` | OUT-3 | A recommendation in the same analysis record misdescribes the pipeline; the pipeline itself is as decided. |
| 10 | `260909-1349_*_finding-17s-setup-pointer-claims-name-the-wrong-agents.md` | OUT-3 | A finding in the same analysis record names the wrong agents, and three of the agents it counts no longer exist; nothing in the tree is wrong. |
| 11 | `260909-1454_*_a-dispatch-outside-a-recorded-session-writes-no-event-row-and-nothing-reports-it.md` | RESOLVED-AT-HEAD | The `agentstate.yaml` existence gate went on 2026-09-10: `hooks/lib/orchestrator-events.ts:42-57` admits rows on workbench root plus session id alone, `bin/fusion-commit-lock:292-293` and `bin/fusion-review-coverage:11-12` say the same, and `agents/orchestrator.md:52` forbids writing the file, so the condition the record measures can no longer arise. |
| 12 | `260909-1631_*_the-cut-spec-removes-agentstate-yaml-whose-existence-gates-every-machine-written-event-row.md` | RESOLVED-AT-HEAD | Answered in the revised spec (`260909-1615_*_spec-cut-fusion-to-a-working-minimum.md`, header line 6) and implemented: `260909-1843_*_which-sentinel-replaces-the-state-files-existence-as-the-gate-on-machine-written-rows.md` carries `_i_`, and the closed plan (`260909-1843_*_implementation-cut-fusion-to-a-working-minimum.md`, its unticked line under the closing checklist) says the three records transition when C1, C7 and A2 commit; only the marker move is outstanding. |
| 13 | `260909-1632_*_the-cut-specs-analyst-row-forbids-the-project-writes-its-own-claude-md-gate-requires.md` | RESOLVED-AT-HEAD | The closed plan's C8 step stopped the curator and reconciler merges on their byte budgets and its C3 step keeps "the write authority the gate gates"; `agents/` still holds `curator.md` and `reconciler.md`, so the contradiction has no live subject and the record owes only its marker move. |
| 14 | `260909-1633_*_the-zero-sum-bounds-baseline-is-armed-at-the-moment-that-absolves-the-cut-it-must-measure.md` | RESOLVED-AT-HEAD | The plan's A2 step armed the bound at the fifteen pre-cut totals ("a baseline armed at the cut absolves the cut"), and `hooks/lib/__tests__/dispatch-bytes.test.ts` with `fixtures/dispatch-path.baseline` exist at HEAD; only the marker move is outstanding. |
| 15 | `260909-2215_*_four-truncated-lines-make-a-streaming-jq-read-of-the-event-log-stop-at-forty-percent.md` | IN | Two shipped surfaces still recommend a streaming read (`README-agents.md:170` "or `jq` for queries", `README-hooks.md:453`, `:459` `| jq .`) and neither states the per-line convention `hooks/lib/events-query.ts:121` implements; a docs edit closes it. |
| 16 | `260910-1033_*_the-citation-sweep-gate-is-red-at-head-again-and-the-drift-came-from-this-circles-own-sessions.md` | RESOLVED-AT-HEAD | Clause one was repaired at `e6a0dc67` and the gate measured green at `07961552`; clause two asks the record to state plainly whether anything catches this before a push, and its own reconciliation note of 260910-2020 states plainly that nothing does, so the acceptance is met and only the marker is outstanding. |
| 17 | `260910-2144_*_presence-cannot-name-what-another-checkout-is-working-on-because-no-event-row-carries-it-any-more.md` | IN | `hooks/lib/events-query.ts:174-179` still reads the work off `history_file` and returns `unknown`, while every `task_start` row already carries `work_item` (`hooks/lib/orchestrator-events.ts:514`), so the helper can resolve it from the rows it has; the record's requested decision is about the solution, not about consent. |
| 18 | `260911-0752_*_a-citation-wrapped-across-a-line-break-is-checked-by-neither-class-and-fails-silently.md` | IN | `reference-resolution-lint.test.ts` still scans anchors per line (`:149`, `:385`, `ANCHOR_RE` at `:369` applied to one `text` at `:400`), so a wrapped citation stays invisible; the fix is confined to that test file plus a count-pin re-approval. |
| 19 | `260911-0752_*_the-user-facing-style-rule-bans-a-noun-in-one-line-and-requires-it-in-another.md` | IN | `rules/user-facing-output.md:45` still bans "Circle" and `:60` still requires "Circle name" in every question; replacing the latter with the work item's title is one line in a rule file. |
| 20 | `260911-1339_*_staging-drift-still-classifies-a-pointer-a-rule-says-nothing-creates-and-names-a-turn-boundary-trigger-it-does-not-have.md` | IN | Every site stands: the dead `.active-circle` row at `hooks/lib/staging-drift.ts:214`, the Turn/Phase 1/Step 3e/`turn_end` prose at `:113`, `:130-131`, `:700`, `hooks/staging-drift.ts:11-12`, `:28`, `hooks/lib/review-coverage.ts:134`; removing a row that can never match and correcting comments is the stated defect, not a rebuild. |
| 21 | `260911-1421_*_a-work-items-own-record-classifies-as-unclassified-so-staging-drift-claims-nothing-about-the-unit-of-work.md` | IN | `classify()` still has only the `_circle.md` branch at `hooks/lib/staging-drift.ts:461` and `STORES` still lists `backlog` at `:247`; adding the item-record branch with a pinned test is decidable from the record's own four-path measurement. |
| 22 | `260911-1423_*_the-dead-step-3b-address-survives-in-seven-places-outside-the-file-its-repair-covered.md` | IN | `/usr/bin/grep -rn 'Step 3b' hooks agents skills rules` at HEAD returns the same seven sites (`hooks/tracker.ts:395`, `commit-message-path.test.ts:136`, `:155`, `:160`, `:189`, `:222`, `staging-drift.test.ts:8`) plus `hooks/dist/tracker.js`; the repair is label text. |
| 23 | `260911-1511_*_coderev-is-a-substring-of-codereview-so-a-sweep-without-word-boundaries-counts-two-retired-folder-names-as-agents.md` | OUT-2 | The acceptance is "the convention is written where a future sweep will meet it" and "any later pass ... states its pattern", naming no file and binding a future process, so the scope cannot be determined from the record plus the code. |
| 24 | `260913-1108_*_the-gate-determination-is-delegated-to-an-analyst-that-holds-no-more-of-the-gate-list-than-the-caller.md` | OUT-2 | Either branch of its acceptance rebuilds the nested-dispatch mechanic the user ruled on in `260913-0909_*_may-the-orchestrator-reach-every-tool-and-may-an-agent-dispatch-another.md`, or adds always-on bytes at zero head-room; that is a design the user consents to, not a construction. |
| 25 | `260913-1108_*_the-orchestrator-prompt-still-calls-the-askuserquestion-grant-an-open-question-and-calls-it-yours.md` | IN | `agents/orchestrator.md:34` still presents the `tools:` grant question as open while `:170` and `:604` say the grant is gone; the sentence shrinks to one open question, and the `_d_` record's leaving can be recorded rather than ruled. |
| 26 | `260913-1108_*_the-positive-dispatch-rule-turns-on-an-undefined-word-and-leaves-both-exclusions-bound-to-the-orchestrator-alone.md` | OUT-2 | "operative agent" is still undefined at `rules/fusion-workbench-conventions.md:238`, `README-agents.md:45`, `:300`, and deciding whether a `coder` may reach the consultant or start an orchestrator extends the scope of a user ruling on an always-on file at zero head-room; that is policy, not construction. |
| 27 | `260915-2142_*_the-active-spec-plan-write-rule-keys-on-the-claimed-item-while-the-item-parameter-sends-a-plan-elsewhere.md` | IN | `agents/orchestrator.md:217` still keys the field write on the claimed item while `:147` sends `**Item:**` dispatches into an unclaimed one; the acceptance names two prompt-text resolutions, both decidable. |
| 28 | `260915-2143_*_the-active-spec-plan-field-is-append-only-and-nothing-says-what-a-second-plan-does-to-it.md` | IN | `agents/orchestrator.md:217` still appends "beside any value already there" and `:438` disambiguates only the spec-plus-plan pair; a replace-or-mark rule is a construction inside the prompt and the conventions' field paragraph. |
| 29 | `260915-2144_*_a-compressed-sentence-in-migrate-now-says-the-conventions-admit-the-shape-they-forbid.md` | IN | `skills/migrate/SKILL.md:183` still reads "which the conventions admit and no consumer handles"; one clause fixes it inside a few bytes. |
| 30 | `260915-2145_*_the-v11-upgrade-note-is-maintained-as-live-in-one-commit-of-this-range-and-frozen-in-the-other.md` | IN | `docs/upgrading-to-v11.md:25` still lists four status values against five at HEAD; taking one position for the doc and saying so in it is a docs edit with a grep-able check. |
| 31 | `260916-0830_*_a-guardrail-citation-is-truncated-so-no-gate-reads-it-and-no-reader-resolves-it.md` | IN | `skills/archive/SKILL.md:252` still carries the ellipsis token, the full basename resolves to exactly one file, a decision record in the shared store carrying `_i_`, and `:106` in the same body already spells it in full. |
| 32 | `260916-0831_*_the-memo-body-does-not-carry-the-empty-checkout-clause-the-conventions-now-bind-it-by.md` | IN | `skills/memo/SKILL.md:37` reads `CHECKOUT=` off the helper and names no halt when the line is absent; one clause at that site closes it. |
| 33 | `260916-1943_*_guard-state-shape-fails-three-cases-under-suite-load-and-passes-in-isolation.md` | OUT-4 | Observed once in four runs, cause labelled inference, acceptance is a deliberate reproduction under load that the dispatch forbids running beside the baseline; no single check shows it fixed. |
| 34 | `260916-2144_*_the-holder-naming-section-documents-a-command-a-consumer-and-a-field-shape-that-are-all-gone.md` | IN | `bin/fusion-checkout-name:228-232` still names `/fusion:next` (not in `ls -1 skills/`), the `held by <person> on <alias>` render and the `<person>, checkout <id>` shape; the header is documentation and the bound in its title survives a rewrite. |
| 35 | `260916-2145_*_a-gates-remediation-text-names-two-commands-that-do-not-exist-and-no-gate-resolves-a-command-token.md` | IN | `hooks/lib/__tests__/domain-cascade.test.ts:519-520` still names `/fusion:next` and `/fusion:direct`; the text half is a word edit, the second half (a slash-command resolution class) is a new gate whose exemption form the same commit must decide. |
| 36 | `260918-0834_*_the-lock-reads-any-head-movement-as-a-landed-commit-so-a-reset-inside-the-held-region-writes-a-row.md` | IN | `bin/fusion-commit-lock:360` still decides on `[ "$head" = "$before" ]` alone; the acceptance names a wrapped `git reset --hard` with no row and the two sibling cases that must keep passing, all statable as cases in `fusion-commit-lock.test.ts`. |

Counts: IN 19, OUT-2 3, OUT-3 5, OUT-4 2, RESOLVED-AT-HEAD 7, OUT-1 0.

## Candidates

Ranked by confidence that an autonomous fix succeeds, highest first.

### 1. `260915-2144_*_a-compressed-sentence-in-migrate-now-says-the-conventions-admit-the-shape-they-forbid.md`
- **Files:** `skills/migrate/SKILL.md:183`.
- **Acceptance test:** `/usr/bin/grep -n "which the conventions admit" skills/migrate/SKILL.md` returns nothing and the bullet reads that the conventions do not admit the shape; `surface-growth-bound.test.ts` green.
- **Effort:** small.
- **Growth risk:** yes (skills surface; the record measured 320 B of margin at `55be2491`, so the rewrite should be byte-neutral, e.g. "a shape the conventions refuse and no consumer handles").
- **Options:** one clear option.

### 2. `260908-0104_*_a-doc-comment-cites-two-re-baselining-events-while-the-helper-defines-three.md`
- **Files:** `hooks/lib/__tests__/rules-emission-golden.test.ts:235`, `:490`, `:693-694`.
- **Acceptance test:** `/usr/bin/grep -n "two events" hooks/lib/__tests__/rules-emission-golden.test.ts` returns nothing; `/usr/bin/grep -c "three events" hooks/lib/__tests__/rules-emission-golden.test.ts hooks/lib/__tests__/helpers/growth-bound.ts` agrees across the two files.
- **Effort:** small.
- **Growth risk:** yes in name only (test file; a word swap adds no line, and the hook-test bound counts lines).
- **Options:** one clear option.

### 3. `260911-1423_*_the-dead-step-3b-address-survives-in-seven-places-outside-the-file-its-repair-covered.md`
- **Files:** `hooks/tracker.ts:395`, `hooks/lib/__tests__/commit-message-path.test.ts:136`, `:155`, `:160`, `:189`, `:222`, `hooks/lib/__tests__/staging-drift.test.ts:8`, `hooks/dist/tracker.js` (rebuilt).
- **Acceptance test:** `/usr/bin/grep -rn 'Step 3b' hooks agents skills rules` returns nothing; `committed-dist.test.ts` green.
- **Effort:** medium (four files plus a dist rebuild, every edit a label).
- **Growth risk:** yes in name only (two test files; replacing `Step 3b` with `Step 4 — commit` keeps line counts).
- **Options:** one clear option.

### 4. `260913-1108_*_the-orchestrator-prompt-still-calls-the-askuserquestion-grant-an-open-question-and-calls-it-yours.md`
- **Files:** `agents/orchestrator.md:34`; the `_d_` record `260824-2013_*_does-the-orchestrators-tools-grant-of-askuserquestion-go-now-that-the-orchestrator-may-not-call-it.md` is left where it stands and the leaving is written into this issue's `Resolved:` line.
- **Acceptance test:** `/usr/bin/grep -n "tools:" agents/orchestrator.md` returns only `:170` and `:604`; line 34 names one open question.
- **Effort:** small.
- **Growth risk:** no in effect (agents surface, but the edit removes text).
- **Options:** one clear option.

### 5. `260916-2144_*_the-holder-naming-section-documents-a-command-a-consumer-and-a-field-shape-that-are-all-gone.md`
- **Files:** `bin/fusion-checkout-name:225-235` (header section).
- **Acceptance test:** every `/fusion:<name>` token in `bin/fusion-checkout-name` names a directory under `skills/` (`/usr/bin/grep -o '/fusion:[a-z-]*' bin/fusion-checkout-name | sort -u` against `ls -1 skills/`); the claim shape quoted matches `**Claim:** <8 hex> — <person>, YYMMDD-HHMM`; the sentence "the name never enters a comparison" survives; `fusion-checkout-name.test.ts` and `reference-resolution-lint.test.ts` green.
- **Effort:** medium (one file, but a section rewritten rather than a word swapped).
- **Growth risk:** no.
- **Options:** one clear option (state the consumer narrative as retired, keep the bound).

### 6. `260911-0752_*_the-user-facing-style-rule-bans-a-noun-in-one-line-and-requires-it-in-another.md`
- **Files:** `rules/user-facing-output.md:60`.
- **Acceptance test:** `/usr/bin/grep -n "Circle" rules/user-facing-output.md` returns only the ban at `:45`; line 60 names the work item's title or the user's own words for the job.
- **Effort:** small.
- **Growth risk:** yes (rule file; byte-neutral if "Circle name" becomes "the work's title").
- **Options:** one clear option (the ban is categorical and the requirement's purpose, a self-contained question, is met by the item's title).

### 7. `260916-0831_*_the-memo-body-does-not-carry-the-empty-checkout-clause-the-conventions-now-bind-it-by.md`
- **Files:** `skills/memo/SKILL.md:37`.
- **Acceptance test:** the body names the case "no `CHECKOUT=` line" at the filename site and answers it with halt-and-report, matching `skills/cadence/SKILL.md` step 1 and `rules/fusion-workbench-conventions.md` `## Filename Patterns`; `surface-growth-bound.test.ts` green.
- **Effort:** small.
- **Growth risk:** yes (skills surface at a few hundred bytes of margin; one clause of roughly 60 bytes, so a compensating cut in the same body may be needed).
- **Options:** one clear option.

### 8. `260916-0830_*_a-guardrail-citation-is-truncated-so-no-gate-reads-it-and-no-reader-resolves-it.md`
- **Files:** `skills/archive/SKILL.md:252`.
- **Acceptance test:** `find fusion-workbench -name '260811-1534_*'` resolves to one file and `/usr/bin/grep -c "260811-1534_\*_does-the-guard-event-log-get-an-upper-bound-and-what-happens-to-the-evidence-in-it.md" skills/archive/SKILL.md` returns 2; `bin/fusion-citation-sweep --dry-run` reports `rewrites=0`; `surface-growth-bound.test.ts` green.
- **Effort:** small.
- **Growth risk:** yes (skills surface; roughly 55 bytes added, which the record itself flagged; same funding question as candidate 7).
- **Options:** one clear option.

### 9. `260911-1421_*_a-work-items-own-record-classifies-as-unclassified-so-staging-drift-claims-nothing-about-the-unit-of-work.md`
- **Files:** `hooks/lib/staging-drift.ts:237-250` (`STORES`), `:455-465` (`classify()`), `hooks/lib/__tests__/staging-drift.test.ts`, `hooks/dist/` (rebuilt).
- **Acceptance test:** the compiled `classify()` returns `klass: "record"` with a `why` naming a work item's record for `circles/<dir>/<dir>.md`, the test pins both shapes (basename equal to the container, and not), `committed-dist.test.ts` green; the `backlog` entry in `STORES` is removed in the same commit or a record filed saying why it stays.
- **Effort:** medium.
- **Growth risk:** yes (new test cases add lines to `hooks/lib/__tests__/`).
- **Options:** one clear option for the branch; the `backlog` entry is a second small decision the fix must state.

### 10. `260911-1339_*_staging-drift-still-classifies-a-pointer-a-rule-says-nothing-creates-and-names-a-turn-boundary-trigger-it-does-not-have.md`
- **Files:** `hooks/lib/staging-drift.ts:92`, `:113`, `:130-131`, `:183`, `:214`, `:230`, `:422`, `:461-462`, `:700`; `hooks/staging-drift.ts:11-12`, `:23`, `:28`; `hooks/lib/review-coverage.ts:134`; `hooks/dist/` (rebuilt); `staging-drift.test.ts` if a case names `.active-circle`.
- **Acceptance test:** `/usr/bin/grep -n 'Circle\|Turn\|Phase 1\|Step 3e\|turn_end\|active-circle' hooks/lib/staging-drift.ts hooks/staging-drift.ts hooks/lib/review-coverage.ts` returns only sentences true at HEAD; the `.active-circle` row is gone; `committed-dist.test.ts` green.
- **Effort:** medium.
- **Growth risk:** no (no bounded surface), unless a test case changes.
- **Options:** one clear option (the rule at `rules/workbench-tracking.md` is the authority the record cites, so the row goes, not the rule). Do it in the same commit as candidate 9: same file, same dist rebuild.

### 11. `260909-2215_*_four-truncated-lines-make-a-streaming-jq-read-of-the-event-log-stop-at-forty-percent.md`
- **Files:** `README-agents.md:170`, `README-hooks.md:453`, `:459`.
- **Acceptance test:** `/usr/bin/grep -rn "jq" README*.md docs agents skills rules bin` shows no streaming `jq '<filter>' <file>` over the event log without the per-line form (`jq -R 'fromjson? // empty'`), and the convention is stated once at the place the README names the log.
- **Effort:** small.
- **Growth risk:** no (docs only).
- **Options:** one clear option.

### 12. `260915-2142_*_the-active-spec-plan-write-rule-keys-on-the-claimed-item-while-the-item-parameter-sends-a-plan-elsewhere.md`
- **Files:** `agents/orchestrator.md:217` (`### Shaping and planning`).
- **Acceptance test:** the paragraph names the item the field is written onto as the `**Item:**` value where the dispatch carried one and the claimed item otherwise, or states that the `**Item:**` path writes no field and what closure does then; `agents` surface bound green.
- **Effort:** small.
- **Growth risk:** yes (agents surface; roughly one clause).
- **Options:** two or more serious options (write onto the `**Item:**` record, or declare that path field-less); the first matches the field's purpose and the `**Item:**` record is already a known path.

### 13. `260915-2143_*_the-active-spec-plan-field-is-append-only-and-nothing-says-what-a-second-plan-does-to-it.md`
- **Files:** `agents/orchestrator.md:217`, `:438`; `rules/fusion-workbench-conventions.md` `## Backlog entries — work items` (the field paragraph, currently line 230).
- **Acceptance test:** the write rule says what a superseding plan does to the value it supersedes, and the closure step's disambiguation covers more than one plan basename or the grammar caps the field at one plan; both surface bounds green.
- **Effort:** medium (a prompt and an always-on rule file, at zero head-room on the rule side).
- **Growth risk:** yes (agents and rules; the rules edit must be byte-neutral or funded by a cut).
- **Options:** two or more serious options (replace on re-plan, or keep with a qualifying clause); replace is the simpler grammar and matches "the artifact the work runs on". Pair with candidate 12: same paragraph.

### 14. `260915-2145_*_the-v11-upgrade-note-is-maintained-as-live-in-one-commit-of-this-range-and-frozen-in-the-other.md`
- **Files:** `docs/upgrading-to-v11.md:25` and one sentence near its head stating which position the note takes.
- **Acceptance test:** `/usr/bin/grep -n "open\`, \`claimed\`" docs/upgrading-to-v11.md` shows five values (or the note states it is frozen at `v11.0.0` and the `950a606e` passages are re-framed); the file says which position it takes where a reader meets it.
- **Effort:** small.
- **Growth risk:** no (docs).
- **Options:** two or more serious options (track current v11.x, or freeze at `v11.0.0`); tracking is the cheaper edit and the one `950a606e` already took.

### 15. `260918-0834_*_the-lock-reads-any-head-movement-as-a-landed-commit-so-a-reset-inside-the-held-region-writes-a-row.md`
- **Files:** `bin/fusion-commit-lock:355-365` (`emit_commit_event`), `hooks/lib/__tests__/fusion-commit-lock.test.ts`.
- **Acceptance test:** a new case wraps `git reset --hard <other-ref>` in `fusion-commit-lock with` and asserts no `commit` row; the sibling cases for a two-commit region and a merged region keep passing.
- **Effort:** medium.
- **Growth risk:** yes (new test case in `hooks/lib/__tests__/`).
- **Options:** two or more serious options (reflog entry kind `commit` vs `reset`, or committer date of HEAD against the region's start); the record asks for the mechanism to be chosen rather than the predicate patched, so this one earns a decision record and the consultant's read.

### 16. `260910-2144_*_presence-cannot-name-what-another-checkout-is-working-on-because-no-event-row-carries-it-any-more.md`
- **Files:** `hooks/lib/events-query.ts:170-179`, `:330`; its test; `hooks/dist/` (rebuilt); possibly `bin/fusion-events` header.
- **Acceptance test:** `bin/fusion-events presence` names the work item for a party whose newest `task_start` row in the window carries `work_item`, and prints a stated reason instead of `unknown` where none does; `committed-dist.test.ts` green.
- **Effort:** medium.
- **Growth risk:** yes (test file).
- **Options:** two or more serious options (resolve from `task_start.work_item`, or have the helper state it cannot); the first uses a field the hooks already write and needs no new row field, which is why this is IN rather than a schema decision.

### 17. `260911-0752_*_a-citation-wrapped-across-a-line-break-is-checked-by-neither-class-and-fails-silently.md`
- **Files:** `hooks/lib/__tests__/reference-resolution-lint.test.ts:364-410` (class b), its re-approval log at `:463ff`, and any wrapped citations the widened gate then reports.
- **Acceptance test:** a fixture with a citation split over two adjacent lines is resolved (or reported), the count pin is re-approved with the number of wrapped citations found, and the commit message states that number.
- **Effort:** medium.
- **Growth risk:** yes (test file; the re-approval log line alone adds lines).
- **Options:** two or more serious options (join adjacent lines before matching, or report a `.md\`` line-end followed by a `` `## `` line-start as unreadable); joining is the smaller change to the pin.

### 18. `260908-1324_*_a-work-tree-behind-the-install-hides-skills-the-install-has-and-nothing-warns.md`
- **Files:** `bin/fusion-paths:212`, `:233`; `bin/fusion-rules` (its exit-2 site).
- **Acceptance test:** from this repository, `bin/fusion-paths no-such-name` exits 2 with a message that names the work-tree preference and says `git pull` (not `fusion --update`) is the remedy when the install has the name; from a consuming project the message is unchanged.
- **Effort:** medium (two helpers, one branch each, a test if one pins the message).
- **Growth risk:** no.
- **Options:** two or more serious options (extend the exit-2 message, or warn at SessionStart when the work tree is behind); the message is the smaller and the acceptance admits it.

### 19. `260916-2145_*_a-gates-remediation-text-names-two-commands-that-do-not-exist-and-no-gate-resolves-a-command-token.md`
- **Files:** `hooks/lib/__tests__/domain-cascade.test.ts:519-520` for the text; for the second half a new class in `reference-resolution-lint.test.ts` (or its own lint) with an exemption form for the four historical mentions the record lists.
- **Acceptance test:** the remediation text names only commands under `skills/`; and a `/fusion:<name>` token in shipped text is resolved against `skills/`, red on a live pointer to a deleted skill, green on the four historical mentions.
- **Effort:** large (the text edit is small; the lint is a design change with an exemption grammar to decide).
- **Growth risk:** yes (test files).
- **Options:** two or more serious options (text only, filing the lint as its own record; or both halves). Ranked last because the lint half is the kind of new gate the second opinion is likely to send back.

## Reading notes

Four clusters cross the table. The cut spec's three records (12, 13, 14) and the agentstate record (11) are one story: the sentinel decision `260909-1843_*_which-sentinel-replaces-...md` is `_i_`, the plan is `_c_` and its closing checklist says the three transition on commit; nobody moved the markers, so seven records in this group are bookkeeping rather than defects and belong in the report's "skipped" list with the evidence above. The four size-analysis records (7 to 10) correct one shared analysis and cannot be fixed in the tree. Candidates 9 and 10 edit `hooks/lib/staging-drift.ts` and rebuild `hooks/dist/` once; candidates 12 and 13 edit the same paragraph of `agents/orchestrator.md`; candidates 1, 7 and 8 all add or move bytes on the `skills/` surface, whose margin the records put between 320 and 576 bytes, so the three should be taken together with one funding cut rather than three attempts against the bound. Candidate 15 has two open siblings (`260915-1845_*`, `260915-1844_*`) working the same `before..HEAD` region; whoever takes it should read all three, and it is the one candidate where the record itself asks for a mechanism choice, so the consultant's read carries weight there. The two flaky-suite records (1, 33) and the sibling `260905-2356_*` are one property of the harness and out for the same reason.

## Sources

The 36 records under `fusion-workbench/shared/issues/` named in the table; `hooks/lib/__tests__/rules-emission-golden.test.ts`, `hooks/lib/__tests__/helpers/growth-bound.ts`, `hooks/lib/config.ts`, `skills/help/SKILL.md`, `docs/working-model.md`, `docs/fusion-intro.md`, `bin/fusion-paths`, `hooks/lib/orchestrator-events.ts`, `bin/fusion-commit-lock`, `bin/fusion-review-coverage`, `hooks/vitest.config.mjs`, `hooks/lib/events-query.ts`, `hooks/lib/__tests__/reference-resolution-lint.test.ts`, `rules/user-facing-output.md`, `hooks/lib/staging-drift.ts`, `hooks/staging-drift.ts`, `hooks/lib/review-coverage.ts`, `hooks/lib/__tests__/staging-drift.test.ts`, `hooks/lib/__tests__/commit-message-path.test.ts`, `hooks/tracker.ts`, `agents/orchestrator.md`, `rules/fusion-workbench-conventions.md`, `README-agents.md`, `README-hooks.md`, `skills/migrate/SKILL.md`, `docs/upgrading-to-v11.md`, `skills/archive/SKILL.md`, `skills/memo/SKILL.md`, `bin/fusion-checkout-name`, `hooks/lib/__tests__/domain-cascade.test.ts`, `hooks/lib/__tests__/fusion-commit-lock.test.ts`; the closed plan `260909-1843_*_implementation-cut-fusion-to-a-working-minimum.md` and the spec `260909-1615_*_spec-cut-fusion-to-a-working-minimum.md`; `git log` for `ea17e354` and `332267a5`; `bin/fusion-events presence` run at HEAD.

## Open Questions

- [ ] The seven `RESOLVED-AT-HEAD` records owe a marker move with a `Resolved:` line each; the work item's directive counts that as bookkeeping, not as a fix, and the report should say who moves them.
- [ ] Whether the `skills/` surface still has the margin the records cite is measured by the baseline suite run now in progress, not by this survey.
