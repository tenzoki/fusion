# Analysis: defect survey, group 2 of 3

**Date:** 2026-09-18 11:12
**Type:** Gap
**Status:** Complete
**Requested by:** orchestrator (work item `260918-1048-defekte-selbstaendig-abarbeiten-mit-zweitmeinung.md`)

## Question

Which of the 37 open defect records in group 2 qualify for an autonomous fix package under the four exclusion rules the dispatch states, and for each qualifying one: which files, what acceptance test, what effort, whether the growth bounds are at risk, and whether one fix option stands or several.

## Scope

The 37 records listed in the dispatcher's `g2.txt`, every one read in full, each checked against the code at HEAD before a verdict.

Git tree: `/Users/k1/Projects/productive/fusion`, HEAD `f14506554f6a7bdbf3f1b1b5500e217b1cd04b90` (2026-09-18 11:03 +0200), branch `main`, one commit ahead of `origin/main`, working tree carrying one modified file (`fusion-workbench/orchestrator-events.jsonl`). Every present-tense claim below is dated by that commit.

Three measurements the verdicts lean on, taken off the tree rather than read out of a record:

| Bounded surface | Measured | Budget (floor + head-room) | Head-room left |
|---|---|---|---|
| hook tests, lines (`hooks/lib/__tests__/**.ts`) | 22 246 | 22 258 (19 228 + 3 030) | **12 lines** |
| `skills/*/SKILL.md`, bytes | 228 026 | 228 028 (188 768 + 39 260) | **2 bytes** |
| `agents/*.md`, bytes | 311 878 | 328 567 (310 567 + 18 000) | 16 689 bytes |

Floors summed from the baseline maps in `hooks/lib/__tests__/surface-growth-bound.test.ts`; sizes taken with `wc`. The per-dispatch-path bound charges `CLAUDE.md` (8 114 bytes today) against rows written at 93 432, so it binds nothing at HEAD; `260917-1115_*_the-claude-md-cut-banked-85-kb-of-slack-into-a-bound-whose-header-says-head-room-is-zero.md` records that.

## Findings

Verdict key: `IN` qualifies; `OUT-1` touches structured data; `OUT-2` needs consent (removal, rebuild, ambiguity, ruling); `OUT-3` not fixable in this repository (workbench record only, or the mechanism is gone); `OUT-4` no acceptance test; `RESOLVED-AT-HEAD` the code already carries it.

| # | Record | Verdict | Why |
|---|---|---|---|
| 1 | `260913-0820_*_the-order-entry-point-ships-with-no-test-so-both-of-its-rulings-are-unpinned.md` | OUT-2 | The acceptance is a new test file of roughly a hundred lines in the shape of `plan-size.test.ts`, against 12 lines of hook-test head-room at HEAD, so it cannot land without a head-room raise or a cut of unrelated tests, and both are the user's to grant. |
| 2 | `260913-0821_*_an-item-record-whose-head-the-parser-cannot-read-vanishes-from-the-order-with-no-report.md` | IN | Still open: `hooks/lib/work-graph.ts:287` takes one `continue` for terminal, out-of-vocabulary and unreadable heads, and no fixture exercises the heading bound at `:184`; the report shape is the implementer's and the test is statable, but its two cases compete for the same 12 lines as its siblings. |
| 3 | `260913-0822_*_the-migrations-new-drop-rule-justifies-itself-with-a-claim-that-is-false-on-a-re-run.md` | IN | `skills/migrate/SKILL.md:162` still gives the reason that is false for a container an earlier run converted; restating the reason as what the rule does (a conversion writes only what this pass verified) corrects the stated defect without changing what is written, at or under the current byte count because `skills/` has 2 bytes left. |
| 4 | `260913-0823_*_the-fixture-test-carries-one-tautological-assertion-and-leaves-three-branches-unexercised.md` | IN | The tautology stands at `hooks/lib/__tests__/work-graph.test.ts:113` and no fixture item names itself, repeats a prerequisite or leaves the store empty; test-only and decidable, but the record itself says the cases are paid for by a cut inside that file, and 12 lines is what the surface has. |
| 5 | `260909-2215_*_step-a1s-denominator-names-a-field-eleven-rows-carry-and-the-plans-own-figure-uses-ninety-four.md` | OUT-3 | The defect is a sentence in `260909-1843_*_implementation-cut-fusion-to-a-working-minimum.md`, a plan closed inside a work item at `done`; a terminal record is evidence and is never reconciled in place. |
| 6 | `260909-2215_*_the-plans-current-state-says-every-removed-gate-has-its-own-row-kind-and-three-of-six-have-none.md` | OUT-3 | Same closed plan, and the three gates the sentence misdescribes are gone from the tree, so nothing is left to measure. |
| 7 | `260910-0020_*_session-2s-own-additions-do-not-fit-the-hook-test-growth-bound-and-the-plan-does-not-say-so.md` | OUT-3 | The suite half is met (green at `07961552` per the record's own reconciliation); the open half asks a closed plan to name the route session 2 took. |
| 8 | `260910-0445_*_deleting-a-test-file-at-its-baseline-frees-no-head-room-so-the-turn-budget-cut-cannot-pay-the-bound.md` | OUT-2 | Part 1 edits a workbench issue; part 2 is a ruling on whether `growth()` refunds a deleted baselined file, an accounting change the record says "depends on a ruling", and `hooks/lib/__tests__/helpers/growth-bound.ts` still says nothing about deletion (grep for `delet`, `absent`, `gone` finds one unrelated comment at `:134`). |
| 9 | `260910-1033_*_step-c1s-acceptance-asks-for-a-green-suite-that-only-step-c2-can-deliver.md` | OUT-3 | The suite is green and what remains is that the closed plan name expected reds per step. |
| 10 | `260910-2020_*_the-two-existing-backlog-entries-keep-the-retired-marker-form-that-d1-migrates-into.md` | OUT-2 | The two entries still sit in the retired backlog store under `shared/` at HEAD; converting them needs a status for a `_p_`-recommended entry that no vocabulary supplies, the alternative is a conventions sentence, and the record leaves the choice open. |
| 11 | `260910-2020_*_the-user-facing-fallback-list-is-five-where-the-answered-decision-says-three.md` | OUT-3 | The code half landed (the comment above the `case` at `bin/fusion-rules:301-317` names five and why); what remains is the `Implemented:` line of an implemented, terminal decision record. |
| 12 | `260911-0638_*_migrates-record-field-repair-writes-a-store-prefixed-citation-into-fields-the-format-no-longer-defines.md` | IN | At HEAD `**Active spec/plan:**` is defined by the item grammar (`rules/fusion-workbench-conventions.md` `## Backlog entries — work items`) and `skills/migrate/SKILL.md:146-155` carries it into the new head, so the deletion branch is gone and one remains: make `rewrite_fields` (`:118`) write the storeless wildcarded basename the bullet at `:185` promises, and write the terminal-record reading down. |
| 13 | `260916-2204_*_claude-mds-pointer-asserts-nineteen-symptom-rows-and-the-table-it-points-at-has-seventeen.md` | IN | `CLAUDE.md:66` still says nineteen and the table has 17 data rows (re-derived at HEAD with the record's `awk`); dropping the count satisfies `rules/critical-stance.md` §5 and shrinks a file every dispatch path loads. |
| 14 | `260916-2205_*_the-relocated-growth-bounds-bullet-says-the-zero-head-room-bound-reaches-this-file-and-at-its-new-home-that-is-false.md` | IN | `README-hooks.md:517` still says the zero-head-room bound "reaches this file" and "into this file" two lines after `:515` says nothing bounds the READMEs; naming `CLAUDE.md` explicitly is one edit on an unbounded file. |
| 15 | `260916-2206_*_the-relocated-dispatch-parameters-bullet-names-its-own-section-as-the-roster-it-must-not-restate.md` | IN | `README-agents.md:80` still sends the reader of `## Dispatch parameters` to `README-agents.md` `## Dispatch parameters` and says "do not restate it here"; stating the two facts without the argument is one bullet edit. |
| 16 | `260916-2207_*_the-relocated-skills-row-points-at-a-what-this-is-section-that-its-new-file-does-not-have.md` | IN | `README-agents.md:200` still names `## What this is`, which the file lacks, while the enumeration sits under `README-agents.md:241` `### skills/ — one file per slash command`; retargeting the anchor is one edit and `reference-resolution-lint` verifies it. |
| 17 | `260916-2208_*_step-3-mandates-one-collected-pointer-table-and-the-criterions-first-application-leaves-eighteen-scattered.md` | OUT-2 | The record assigns the fork to the user: collect 27 pointer lines into one table, reshaping four sections of `CLAUDE.md`, or soften Step 3 of a shipped rule. |
| 18 | `260916-2209_*_the-division-rule-says-what-applies-it-restates-none-of-it-and-the-curator-restates-three-of-its-clauses.md` | IN | `agents/curator.md:418` still restates three clauses of Step 1 while `rules/context-lean-claude-md.md:181` says nothing restates it; cutting the clauses from the prompt follows the direction `260916-1316_*_three-surfaces-state-the-heading-division-rule-and-two-of-them-answer-differently-on-fusions-own-claude-md.md` already took and shrinks a bounded surface. |
| 19 | `260916-2210_*_step-1s-two-branches-leave-a-file-with-no-headings-undivided-while-the-helper-answers-heading-level-0.md` | IN | `rules/context-lean-claude-md.md:151-158` still has two branches and no heading-less case while `bin/fusion-claude-md-weight` prints `heading-level=0` and one `(preamble)` row; one sentence naming that case closes the split, on a rule file emitted to no agent. |
| 20 | `260916-2211_*_the-agent-prompts-digit-now-stands-in-two-files-and-the-claims-parser-gates-one-of-them.md` | IN | `hooks/lib/__tests__/derivable-enumerations-lint.test.ts:166` still gates the phrase in `CLAUDE.md` only while `README-agents.md:49` carries a second live occurrence; one array entry, one line, inside the 12 left. |
| 21 | `260917-1115_*_the-claude-md-cut-banked-85-kb-of-slack-into-a-bound-whose-header-says-head-room-is-zero.md` | OUT-2 | Re-arming the eleven rows of `dispatch-path.baseline` is a baseline move under none of the three named events, and the record itself routes the question to a decision record. |
| 22 | `260917-1115_*_the-dispatch-path-bounds-prose-counts-fifteen-paths-against-a-fixture-holding-eleven-rows.md` | IN | Four `fifteen` and the present-tense "measures the UNIVERSAL CORE" survive in `hooks/lib/__tests__/rules-emission-golden.test.ts` (`:1033`, `:1044`, `:1075`, `:1156`, `:1273`) against eleven fixture rows; word replacement inside existing lines and `agentNames().length` in the failure string is line-neutral. |
| 23 | `260917-1252_*_four-steps-of-commit-a-carry-a-green-suite-acceptance-criterion-that-only-step-a7-can-satisfy.md` | OUT-3 | The defect is per-step wording in `260917-1124_*_implementation-fusion-discuss-a-two-agent-discussion-loop.md`, the plan of a work item at `done`, and the commit it worried about landed. |
| 24 | `260917-1308_*_the-staging-classifiers-store-list-omits-forum-and-its-comment-states-a-relation-that-is-false-by-that-element.md` | IN | `STORES` at `hooks/lib/staging-drift.ts:237` and the alternation at `hooks/lib/citation-scan.ts:257` still omit `forum` while `TYPE_FOLDERS` carries it; the ruled criterion in `260917-1124_*_does-a-machine-rewritten-record-kind-enter-the-citation-corpus.md` (a kind a person writes and stops enters the corpus) reaches a forum entry, so adding the token to both lists is decidable (inference: the ruling names the criterion, not forum). |
| 25 | `260918-0824_*_the-container-hop-voided-the-only-stated-mitigation-for-flooding-the-gate.md` | OUT-2 | Two of three acceptance clauses landed on 2026-09-18; what remains is whether the citation-edge yield needs a mechanism rather than a gate, a design question the record assigns to the user. |
| 26 | `260827-0410_*_the-machine-written-event-rows-ship-with-wiring-asserts-only-because-the-hook-test-surface-is-full.md` | OUT-2 | The seven deferred dispatch cases measured 285 lines against 12 lines of head-room at HEAD, and the record's own condition is "inside the growth bound after a cut", a cut nobody has ruled. |
| 27 | `260828-0044_*_thirty-four-of-sixty-two-records-filed-on-260827-carry-no-person-half-after-the-reach-was-settled.md` | OUT-3 | The remaining misses were session-history entries and the history store has since closed to writes (`rules/fusion-workbench-conventions.md` `## Session history`); the other kinds measured compliant, and closing the multi-user spec on the criterion is the user's. |
| 28 | `260830-2235_*_the-fabricated-name-exemption-keys-on-the-literal-foo-so-every-realistic-probe-fixture-is-read-as-a-real-citation.md` | OUT-2 | No decidable keying property for a fixture-shaped token has been proposed anywhere, and the record and `rules/critical-stance.md` §4 both refuse an approximation, so there is nothing to construct. |
| 29 | `260831-0748_*_a-storeless-bracket-marked-citation-is-invisible-while-a-store-prefixed-one-is-reported.md` | OUT-2 | `BARE_RE` at `hooks/lib/citation-scan.ts:442` still refuses `[` while `REC_RE`'s tail admits it; widening the bare pattern makes the gate report a new class in every consuming project, and the header's alternative is a stated decision tied to `260830-1842_*_may-the-grammar-resolve-a-bracket-marked-record-that-a-frozen-store-keeps-permanently.md`, still open. |
| 30 | `260831-2121_*_the-head-field-exemption-reads-only-a-bare-stamp-so-a-name-shaped-identifier-in-a-head-field-is-judged.md` | OUT-2 | Blocked on `260831-2142_*_which-property-separates-a-head-field-identifier-from-a-head-field-citation.md`, still open with no recommendation; the exemption is still keyed on `stamp-bare`. |
| 31 | `260905-2134_*_review-coverage-test-fails-in-a-full-suite-run-and-passes-in-isolation.md` | OUT-2 | Subsumed by `260905-2356_*_the-hook-suite-is-not-isolated-from-a-second-copy-of-itself-and-fails-at-forty-percent-under-one.md`, whose acceptance forbids a per-case repair; its own acceptance begins with a rate measured over full-suite runs, which this survey may not run. |
| 32 | `260905-2356_*_the-hook-suite-is-not-isolated-from-a-second-copy-of-itself-and-fails-at-forty-percent-under-one.md` | OUT-2 | The choice between making each test reach only private state and declaring the suite single-instance "is a decision this record does not make", and the git-timeout half is blocked on `260906-0035_*_what-should-the-git-helpers-budget-be-and-is-a-timeout-retried.md`. |
| 33 | `260906-0035_*_the-git-helper-reports-a-timeout-as-not-a-repository-in-every-consuming-project.md` | OUT-2 | Blocked, by its own text, on that same open decision, which chooses the budget and whether a timeout is retried; `GIT_TIMEOUT_MS = 5_000` and the four-way collapse stand at HEAD. |
| 34 | `260906-0335_*_nine-of-twelve-line-number-citations-in-shipped-text-name-the-wrong-line-and-no-gate-resolves-one.md` | OUT-2 | The route (a line-number resolver in the lint, or rewriting every `path:N` as an anchor) is one the record withholds as a possible decision; 15 such tokens stand at HEAD, thirteen of them the per-row citation scheme of the dispatch-parameter table at `README-agents.md:53-70`. |
| 35 | `260906-0416_*_a-project-may-widen-the-citation-corpus-and-never-narrow-it-so-an-exhibit-has-no-declarable-form.md` | OUT-2 | Blocked on `260906-0416_*_should-a-project-be-able-to-declare-a-record-an-exhibit-and-what-does-that-declaration-cover.md`, still open; a declarable exhibit form is a new configuration leaf. |
| 36 | `260907-2332_*_two-descriptions-of-the-cleanup-run-order-reverse-the-last-two-steps.md` | RESOLVED-AT-HEAD | Both sentences now describe a cleanup that commits and pushes and nothing else (`skills/cleanup/SKILL.md:2`, `README-agents.md:256`); the pipeline whose order they reversed was removed on 260910 (`README-agents.md:264`), so no order is left to describe. |
| 37 | `260908-0027_*_the-write-time-citation-check-is-silent-on-the-class-that-produced-every-violation-of-this-session.md` | IN | `REPORTED_STATUSES` at `hooks/lib/citation-form.ts:168` is still two statuses and the scanner still returns `resolved` for a spelled current marker (`hooks/lib/citation-scan.ts:30`); the sweep already computes that rewrite, so a reportable verdict for the class is decidable, though the fix adds a status to the union and a test. |

Counts: IN 14, OUT-2 15, OUT-3 7, RESOLVED-AT-HEAD 1, OUT-1 0, OUT-4 0.

## Candidates

Ranked by confidence that an autonomous fix lands green, highest first. "Growth risk" follows the dispatch's definition (text added to `agents/*.md`, `skills/*/SKILL.md`, `rules/*.md` or the hook tests); where a bound is at zero the note says what that costs.

### 1. `260916-2205_*_the-relocated-growth-bounds-bullet-says-the-zero-head-room-bound-reaches-this-file-and-at-its-new-home-that-is-false.md`

- **Files:** `README-hooks.md` (the bullet at `:517`).
- **Acceptance test:** `awk '/^### Growth bounds on the shipped text/,/^### [^G]/' README-hooks.md | grep -c 'this file'` returns 0, and the dispatch-path sentence names `CLAUDE.md`; `cd hooks && npm test` stays green (`reference-resolution-lint` resolves the unchanged path tokens).
- **Effort:** small.
- **Growth risk:** no.
- **Options:** one clear option.

### 2. `260916-2206_*_the-relocated-dispatch-parameters-bullet-names-its-own-section-as-the-roster-it-must-not-restate.md`

- **Files:** `README-agents.md` (the bullet at `:80`).
- **Acceptance test:** `sed -n '51,81p' README-agents.md | grep -cE 'README-agents.md. .## Dispatch parameters|restate it here|belong in this file'` returns 0; the two facts (the `**Domain:**` reach and the `**Deliverable language:**` halt) still appear in the section; suite green.
- **Effort:** small.
- **Growth risk:** no.
- **Options:** one clear option.

### 3. `260916-2207_*_the-relocated-skills-row-points-at-a-what-this-is-section-that-its-new-file-does-not-have.md`

- **Files:** `README-agents.md` (the row at `:200`).
- **Acceptance test:** the row cites `README-agents.md` `### skills/ — one file per slash command`, the heading `grep -n '^### .skills/' README-agents.md` returns (`:241`), and `npx vitest run reference-resolution-lint` from `hooks/` is green on the new anchor.
- **Effort:** small.
- **Growth risk:** no.
- **Options:** one clear option.

### 4. `260916-2204_*_claude-mds-pointer-asserts-nineteen-symptom-rows-and-the-table-it-points-at-has-seventeen.md`

- **Files:** `CLAUDE.md` (`:66`).
- **Acceptance test:** `grep -c nineteen CLAUDE.md` returns 0 and the sentence states no count, or its digit equals the record's `awk … | wc -l` over `README-hooks.md` (17 at HEAD); `wc -c CLAUDE.md` does not rise; suite green (`derivable-enumerations-lint`, `dispatch-bytes`).
- **Effort:** small.
- **Growth risk:** no (the fix shrinks `CLAUDE.md`; the zero-head-room dispatch-path bound has 78 022 bytes of slack at HEAD anyway).
- **Options:** one clear option (drop the count; §5 forbids re-asserting one).

### 5. `260917-1115_*_the-dispatch-path-bounds-prose-counts-fifteen-paths-against-a-fixture-holding-eleven-rows.md`

- **Files:** `hooks/lib/__tests__/rules-emission-golden.test.ts` (`:1033`, `:1044`, `:1075`, `:1156`, `:1273`).
- **Acceptance test:** `grep -c fifteen hooks/lib/__tests__/rules-emission-golden.test.ts` returns 0, the failure string derives its count from `agentNames().length`, the "measures the UNIVERSAL CORE" sentence is past tense or names the retirement, and `wc -l` on the file is unchanged; suite green.
- **Effort:** small.
- **Growth risk:** no (line-neutral by construction; the bound counts lines, and the record's own cost note says so).
- **Options:** one clear option.

### 6. `260916-2211_*_the-agent-prompts-digit-now-stands-in-two-files-and-the-claims-parser-gates-one-of-them.md`

- **Files:** `hooks/lib/__tests__/derivable-enumerations-lint.test.ts` (the `CLAIMS` array at `:166`).
- **Acceptance test:** with one `agents/*.md` temporarily moved aside, `npx vitest run derivable-enumerations-lint` fails on `README-agents.md`'s agent-prompts claim as well as its inheriting-agents claim; restored, the suite is green and the hook-test surface is at most 1 line above today's 22 246.
- **Effort:** small.
- **Growth risk:** yes (one line on a surface with 12 left; it fits).
- **Options:** one clear option.

### 7. `260916-2209_*_the-division-rule-says-what-applies-it-restates-none-of-it-and-the-curator-restates-three-of-its-clauses.md`

- **Files:** `agents/curator.md` (`:418`).
- **Acceptance test:** `grep -c 'picked once for the whole file' agents/curator.md` returns 0 and the line names Step 1 of `rules/context-lean-claude-md.md` instead; `rules/context-lean-claude-md.md:181` is unchanged and true; suite green (`surface-growth-bound` sees a shrink).
- **Effort:** small.
- **Growth risk:** no (a cut on `agents/`, which has 16 689 bytes anyway).
- **Options:** one clear option. The record offers a second (reword the rule to say what a restatement owes), but that reverses the repair `260916-1316_*_three-surfaces-state-the-heading-division-rule-and-two-of-them-answer-differently-on-fusions-own-claude-md.md` made, so it is not serious at HEAD.

### 8. `260916-2210_*_step-1s-two-branches-leave-a-file-with-no-headings-undivided-while-the-helper-answers-heading-level-0.md`

- **Files:** `rules/context-lean-claude-md.md` (`### Step 1`, `:151-158`).
- **Acceptance test:** Step 1 names the no-heading case and its division (one passage, the preamble, `heading-level=0`); `bin/fusion-claude-md-weight` run against a scratch root whose `CLAUDE.md` has no heading prints `headings=0 heading-level=0` and one `(preamble)` row, matching the rule's sentence; `provenance-header-lint` and the suite green.
- **Effort:** small.
- **Growth risk:** yes by the dispatch's definition (text added to a rule file); no failing bound reaches it, since `bin/fusion-rules` emits this file to no agent (`agents/curator.md:456`) and the always-on rule bound was retired 2026-09-11.
- **Options:** one clear option (the helper's answer is the one the record calls sensible; the rule adopts it).

### 9. `260913-0822_*_the-migrations-new-drop-rule-justifies-itself-with-a-claim-that-is-false-on-a-re-run.md`

- **Files:** `skills/migrate/SKILL.md` (`:162`).
- **Acceptance test:** the sentence's reason no longer asserts that every dropped entry "names no such record"; it says a conversion writes only what this pass verified and drops the rest, reported; `**Depends-on:**` stays unwritten; `wc -c skills/migrate/SKILL.md` is at or below today's figure; `npx vitest run surface-growth-bound path-literal-lint` green.
- **Effort:** small.
- **Growth risk:** yes, and binding: `skills/` has 2 bytes of head-room, so the restatement must be byte-neutral or a cut.
- **Options:** one clear option. Widening the keep set to already-converted containers is the other branch the record allows, but that changes what a conversion writes, which is the mechanism rather than the stated defect.

### 10. `260917-1308_*_the-staging-classifiers-store-list-omits-forum-and-its-comment-states-a-relation-that-is-false-by-that-element.md`

- **Files:** `hooks/lib/staging-drift.ts` (`STORES`, `:237`, and the comment at `:233`), `hooks/lib/citation-scan.ts` (`STORES`, `:257`), and one assertion each in `hooks/lib/__tests__/staging-drift.test.ts` and `hooks/lib/__tests__/citation-form.test.ts` or `citation-sweep.test.ts`; `npm run build` for `hooks/dist`.
- **Acceptance test:** an uncommitted file under `shared/forum/` in a scratch workbench classifies as `record` in the staging report; `bin/fusion-citation-check` reports a citation carrying the forum store segment as `store-prefixed`; `rules-emission.golden` unaffected; suite green with the hook-test surface inside its 12 lines.
- **Effort:** medium.
- **Growth risk:** yes (test lines; two one-line assertions fit, a new `describe` does not).
- **Options:** one clear option under the ruled criterion (inference: `260917-1124_*_does-a-machine-rewritten-record-kind-enter-the-citation-corpus.md` binds "every future record kind" to person-written-and-stops, which a forum entry is). The comment-only branch is the fallback if the executor reads the ruling narrower.

### 11. `260911-0638_*_migrates-record-field-repair-writes-a-store-prefixed-citation-into-fields-the-format-no-longer-defines.md`

- **Files:** `skills/migrate/SKILL.md` (`rewrite_fields` inside the Step 4 block at `:118`; the Step 4b sentence at `:155`, which says the copied value keeps an exact `_m_` marker where the bullet at `:185` and the conventions say wildcarded; the bullet at `:185`).
- **Acceptance test:** a scratch pre-v4 workbench run through the shipped Step 4 block leaves `**Active spec/plan:**` holding a storeless basename with `_*_` at the marker slot; `bin/fusion-citation-check` over the scratch root reports the field neither store-prefixed nor stale-marker; the terminal-record reading is stated in the skill next to the guardrail it rests on; `wc -c` on the body at or below today's; `path-literal-lint` (which exempts this skill) and `surface-growth-bound` green.
- **Effort:** medium.
- **Growth risk:** yes, binding: 2 bytes on `skills/`. Writing the terminal-record reading down adds text, so a cut of equal size inside the same body is part of the fix.
- **Options:** one clear option at HEAD. The record's two branches were "fix the sed" or "delete `rewrite_fields`"; the second closed when the item grammar defined the field and Step 4b started carrying it.

### 12. `260913-0823_*_the-fixture-test-carries-one-tautological-assertion-and-leaves-three-branches-unexercised.md`

- **Files:** `hooks/lib/__tests__/work-graph.test.ts` only.
- **Acceptance test:** the assertion at `:113` is gone or asserts against `report.rows.length`; with `seenEdge` removed from `hooks/lib/work-graph.ts:316-332` the suite goes red, with the `selfEdge` term at `:418` removed it goes red, and a root with no `circles/` yields `verdict: "empty"`; then the code is restored and `npm test` is green with the surface inside 22 258 lines.
- **Effort:** medium.
- **Growth risk:** yes, binding: three cases and two fixture items cost more than 12 lines, so the record's own condition applies (paid for by a cut inside this file; its 20 comment lines and the `EXPECTED` table are where to look).
- **Options:** one clear option.

### 13. `260908-0027_*_the-write-time-citation-check-is-silent-on-the-class-that-produced-every-violation-of-this-session.md`

- **Files:** `hooks/lib/citation-scan.ts` (a verdict for "resolved, marker spelled exactly", beside `stale-marker` in `CitationStatus` at `:855`), `hooks/lib/citation-form.ts` (`REPORTED_STATUSES` at `:168` and the header section at `:52-80`), one case in `hooks/lib/__tests__/citation-form.test.ts`, and every consumer that switches on `CitationStatus` (`bin/fusion-citation-check`, `bin/fusion-citation-sweep` via `hooks/citation-*.ts`); `npm run build`.
- **Acceptance test:** a record written in a scratch workbench citing an existing record with its current marker spelled produces a `citation_form` row at the write, with a fix line spelling the wildcard form; the sweep's existing behaviour on the same token is unchanged; suite green inside the bound.
- **Effort:** medium to large (a new verdict in a union several consumers read).
- **Growth risk:** yes (test lines; competes with 10, 12 and 14 for the same 12).
- **Options:** one clear option. The record's fallback (state the class as excluded in the header and on a closed issue's `Revised by:` line) is the branch to take only if the executor finds a consumer that cannot carry a new status.

### 14. `260913-0821_*_an-item-record-whose-head-the-parser-cannot-read-vanishes-from-the-order-with-no-report.md`

- **Files:** `hooks/lib/work-graph.ts` (`:250` header, `:278-287`), `hooks/order.ts` and `bin/fusion-work-order` (documenting the new figure), `hooks/lib/__tests__/work-graph.test.ts` (an unreadable-head fixture and a no-closing-`---` fixture); `npm run build`.
- **Acceptance test:** a fixture store with an item-form record whose head has no readable `**Status:**` yields a count and a named record in the report while a terminal item and a terminal Circle container stay silent; with the `/^#{2,6}\s/` line deleted from `headBlock` the suite goes red; restored, green inside the bound.
- **Effort:** medium.
- **Growth risk:** yes, binding: the same 12 lines, after 12 has spent them.
- **Options:** one clear option (the record lets the implementer choose the report shape; `no-depends-on-field=` is the precedent).

## Implications

Fourteen records qualify, and the constraint on landing them is not the code but the two bounded surfaces at zero: 12 hook-test lines and 2 skill bytes. Nine of the fourteen touch neither (1 to 5, 7, 8, and the doc halves of the rest), and those are the package's safe core. Five compete for the hook-test lines (6, 10, 12, 13, 14) and two for the skill bytes (9, 11), so their order inside the package decides which of them land: the one-line fix (6) first, then whichever cut inside its own file the executor can defend.

Fifteen records are OUT-2, and eleven of those fifteen are blocked on a named open decision or on a fork the record itself hands to the user. Filing nothing new for them is correct; each already carries its question.

## Recommendations

- Package the first nine candidates in the ranked order; each is one file, one commit, and its acceptance is a grep or a lint the suite already runs.
- Take 6 before 10, 12, 13 and 14, and take 9 and 11 in one sitting on `skills/migrate/SKILL.md`, since both need a cut in that body and one search for dead text serves both.
- Route no OUT-2 record to an executor; the six decision records they name (`260831-2142_*`, `260830-1842_*`, `260906-0035_*`, `260906-0416_*`, plus the two forks in `260916-2208_*` and `260910-0445_*`) are what the user rules on when the package returns.
- Close `260907-2332_*_two-descriptions-of-the-cleanup-run-order-reverse-the-last-two-steps.md` with a `Resolved:` line citing `README-agents.md:256` and `skills/cleanup/SKILL.md:2`; that is a marker move, not a fix.

## Filed Issues

None. Every actionable finding here is already carried by one of the 37 records; a second file per finding would be the duplication `rules/fusion-workbench-conventions.md` `## Record filing` refuses.

## Sources

The 37 records named in the table, read in full. Code read at HEAD: `hooks/lib/work-graph.ts`, `hooks/order.ts`, `hooks/lib/__tests__/work-graph.test.ts`, `hooks/lib/__tests__/surface-growth-bound.test.ts` (baseline maps and head-room constants), `hooks/lib/__tests__/helpers/growth-bound.ts`, `hooks/lib/__tests__/fixtures/dispatch-path.baseline`, `hooks/lib/__tests__/rules-emission-golden.test.ts`, `hooks/lib/__tests__/derivable-enumerations-lint.test.ts`, `hooks/lib/__tests__/claude-md-weight.test.ts`, `hooks/lib/__tests__/path-literal-lint.test.ts` (`TYPE_FOLDERS`), `hooks/lib/staging-drift.ts`, `hooks/lib/citation-scan.ts`, `hooks/lib/citation-form.ts`, `bin/fusion-rules`, `bin/fusion-claude-md-weight`, `skills/migrate/SKILL.md`, `skills/cleanup/SKILL.md`, `agents/curator.md`, `rules/context-lean-claude-md.md`, `rules/fusion-workbench-conventions.md`, `CLAUDE.md`, `README-agents.md`, `README-hooks.md`. Decision records checked for their marker: `260909-1843_*_what-are-the-conditional-rule-emissions-keyed-on-once-they-are-not-keyed-on-the-agent-name.md`, `260917-1124_*_does-a-machine-rewritten-record-kind-enter-the-citation-corpus.md`, `260906-0035_*_what-should-the-git-helpers-budget-be-and-is-a-timeout-retried.md`, `260831-2142_*_which-property-separates-a-head-field-identifier-from-a-head-field-citation.md`, `260906-0416_*_should-a-project-be-able-to-declare-a-record-an-exhibit-and-what-does-that-declaration-cover.md`. Sibling analysis present in this container and not overlapped: `260918-1109-defect-survey-group-3.md`.

## Reading notes

Three cross-cutting facts shape the package more than any single verdict. First, the hook-test surface is at 12 lines and `skills/` at 2 bytes, and seven of the fourteen candidates need one of the two, so the package's real budget is the executor's willingness to cut inside the file it is fixing; the records for 0823 and 0822 say so themselves, and 0820 and 0410 are OUT-2 for exactly the same reason at a size no in-file cut reaches. Second, several records are one mechanism seen from different sides and should be read together even where their verdicts differ: 2205, 2206 and 2207 are the same relocation defect (a passage moved with its deixis) from one curator run; 2134, 2356 and 0035 are one git-timeout fault whose repair waits on one decision; 2121, 2235, 0748 and 0416 are four faces of the citation grammar's exemption question, each blocked on its own ruling; 0822 and 0638 both edit the same Step 4 of `/fusion:migrate` and both need bytes that body does not have. Third, one record depends on a sibling's landing order: 0821 and 0823 both extend `work-graph.test.ts`, and 0823's own condition (its cases paid for by a cut in that file) is what leaves any lines for 0821, so 0823 goes first or 0821 does not fit.

## Open Questions

- [ ] Whether the executor may cut comment prose inside a test file to pay for new cases (0823, 0821, 0027, 1308): the records for 0823 and 0820 assume yes, and `README-hooks.md` `### Growth bounds on the shipped text` names the cut as the way out, but no ruling says whose prose may go.
- [ ] Whether the ruled corpus criterion in `260917-1124_*_does-a-machine-rewritten-record-kind-enter-the-citation-corpus.md` reaches `forum` without a second look; the candidate at rank 10 rests on that inference.
