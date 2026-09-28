# Analysis: the reading, and the ledger it produces

**Date:** 2026-09-12 21:02
**Type:** Gap
**Status:** Complete
**Requested by:** orchestrator, step S2 of `260912-2045_*_cut-the-hook-test-surface-for-the-work-graph-fixture-test.md`

## The total, before anything else

**The ledger totals 174 lines.** Against the three marks the step names:

| Mark | What it buys | Cleared |
|---|---|---|
| 140 | `work-graph.test.ts` at the small end of the precedent range | yes, by 34 |
| 220 | the upper precedent | no, short by 46 |
| 260 | the upper precedent plus room for the attribution conventions | no, short by 86 |

One qualification belongs in the same breath as the number, because the number does not survive without it. **The ledger is two rows and a remainder.** Row 1 and Row 2 are section-divider comment blocks and carry 144 of the 174 lines between them. Approve both and the cut clears 140. Approve Row 1 alone, which is the better-evidenced of the two, and the total is 110 and the cut falls short. Approve neither and the total is 30. There is no third row of any size: nothing else in this suite is duplicated, superseded or surplus at a scale that matters.

**No whole file enters the ledger.** Every one of the 58 files holds a guarantee nothing else holds. Class A and Class B produce not one `duplicate` and not one `superseded` verdict, and the reasons are per file below rather than per class.

## Question

Which of the hook test suite's 58 files, or which ranges inside them, can be removed without giving up a guarantee the project would miss, and how many lines does that free against the growth bound at zero margin?

## Scope

Read: every `.ts` file under `hooks/lib/__tests__/` (58 files, 21 823 lines), in full for the 8 Class A files and the highest-yield Class B files, at header depth for the remainder; `hooks/lib/__tests__/helpers/growth-bound.ts` `## Re-baselining`; `hooks/lib/__tests__/surface-growth-bound.test.ts` (the baseline map, the head-room constant, the hook-tests file walk); `hooks/lib/work-graph.ts`'s consumer context through the plan; `README-hooks.md` `### Three gates that can fail the suite over text nobody compiled`; the two records the step names.

Git tree: HEAD `341e4c94`, committed 2026-09-12, branch `main`, `## main...origin/main [ahead 23]`, one modified file (`fusion-workbench/orchestrator-events.jsonl`, machine-written). Every present-tense claim below is dated by that commit.

### A correction to the dispatch's premise, reported rather than worked around

The dispatch says the S1 table is in commit `4a55d8c1` and is not mine to retake. Two facts about that:

1. **`4a55d8c1` does not resolve in this tree.** The S1 commit is `341e4c94`.
2. **`341e4c94`'s message does not carry the table.** Its second sentence reads "S1 writes no file. Its product is this table, so the message carries it", and no table follows. The message carries the aggregates (58 files, 21 823 lines, budget 21 823, 22 files at or below zero yield, Class A 8 files and 1 471 lines, Class B 1 414 over 27 positive-yield files, Class C 8 329 non-code lines) and the commit's whole diff is two step markers in the plan. **The per-file table exists nowhere.**

So the yield per file had to be recomputed to do the reading at all. I recomputed it from the tree and from `TEST_LINE_BASELINE`, using the file walk in `surface-growth-bound.test.ts:479-483` and its own `lineCount` (`:281-286`). **Every aggregate S1 reported is reproduced exactly** except one: I count **23** files at yield zero or below, not 22 (two at exactly zero, `fusion-prose-metric.test.ts` and `reference-resolution-lint.test.ts`, and 21 negative). The figure affects no row below. The Class C blank-line count reconciles at 1 912 once the trailing-newline artefact of a line split is removed, which is what S1 reported.

**Recommendation, filed here rather than as an issue because the step writes one report:** S1's product should be committed as a file, not as a commit message that says it carries a table it does not. The next reader of this cut has the same problem I had.

## Findings

### The ledger

Five rows. Each carries the file and range, what it asserts in behaviour terms, whether anything else asserts it, what would reach a release unnoticed if it went, and the measured yield.

---

**Row 1: section-divider blocks that sit directly above a `describe()`. Verdict: `prose`. Yield: 80.**

**(a) The file and range.** Twenty three-line comment blocks of the form `/* ---- * / * <label> / * ---- */`, each with a blank line on both sides, in eight files:

| File | Line ranges |
|---|---|
| `citation-form.test.ts` | 74-76, 113-115, 192-194, 279-281 |
| `guard-project-config-integration.test.ts` | 80-82, 151-153 |
| `review-coverage-mandate.test.ts` | 141-143, 212-214, 305-307 |
| `review-coverage.test.ts` | 209-211, 323-325, 459-461, 545-547, 690-692, 782-784 |
| `sentence-identifier-containment.test.ts` | 284-286 |
| `staging-drift.test.ts` | 186-188, 310-312, 497-499, 605-607 |

Each removal takes the three comment lines plus one of the two blank lines that then become adjacent: four lines per block, 80 in total.

**(b) What it asserts.** Nothing. A comment rule carries no assertion and no reasoning. Its whole content is a section label.

**(c) Does anything else assert the same thing.** Yes, and it is the `describe()` string on the next non-blank line in all twenty cases. Worked examples: `review-coverage.test.ts:210` reads `1. The tiling` and `review-coverage.test.ts:213` reads `describe("review coverage: the tiling"`; `staging-drift.test.ts:187` reads `1. The measured defect, reproduced` and `staging-drift.test.ts:190` reads `describe("staging drift: the defect it was built for"`; `citation-form.test.ts:193` reads `3. Which verdict` and `citation-form.test.ts:196` reads `describe("which verdicts reach the writer"`.

**(d) What would reach a release unnoticed.** Nothing. No failure can ship from the absence of a comment rule: no case, no fixture, no assertion and no error message is touched, and a reader scanning for `describe(` finds the same section structure under the same names. The cost is that a reader scrolling a 890-line file loses a visual stop, and in six of the twenty the divider's label is slightly fuller than the `describe` string (`review-coverage.test.ts:324` adds "and refuses out loud" to what `:327` calls "a range it cannot pin"). That is a navigation cost, priced here and not hidden.

**(e) Yield.** 80 lines, 1 for 1, Class C.

---

**Row 2: section-divider blocks that sit above helper, fixture or interface code. Verdict: `prose`. Yield: 64.**

**(a) The file and range.** Sixteen blocks of the same shape, same four lines each:

| File | Line ranges |
|---|---|
| `citation-form.test.ts` | 30-32, 303-305 |
| `guard-state-shape.test.ts` | 98-100, 235-237 |
| `helpers/guard-harness.ts` | 95-97, 216-218, 630-632, 826-828, 914-916, 973-975 |
| `review-coverage-mandate.test.ts` | 86-88 |
| `review-coverage.test.ts` | 68-70 |
| `sentence-identifier-containment.test.ts` | 77-79, 142-144, 325-327 |
| `staging-drift.test.ts` | 66-68 |

**(b) What it asserts.** Nothing, on the same grounds as Row 1.

**(c) Does anything else assert the same thing.** **No.** Unlike Row 1, the label is stated nowhere else: what follows is an `export interface`, a doc comment or a fixture builder, not a `describe()` that restates the heading. This row is a removal of a label, not of a duplicate, and it is a separate row for exactly that reason.

**(d) What would reach a release unnoticed.** Nothing, on the same grounds as Row 1: comment rules are not read by any mechanism and carry no reasoning. The cost is higher than Row 1's, because in `helpers/guard-harness.ts` the six dividers are the only structure a 1 071-line file has above the function level. **This is the weakest row in the ledger and the ledger does not reach 140 without it.** Both facts are stated together so the gate can price them together.

**(e) Yield.** 64 lines, 1 for 1, Class C.

---

**Row 3: the "guard, not a fixer" sentence, six of its seven copies. Verdict: `duplicate`. Yield: 18.**

**(a) The file and range.** The sentence stands, word for word bar its last noun, in seven lint test headers, each preceded by a bare `//` separator line, so each copy is three lines: `derivable-enumerations-lint.test.ts:34-36`, `glob-nomatch-lint.test.ts:23-25`, `marker-format-lint.test.ts:20-22`, `plan-stopping-section-lint.test.ts:42-44`, `provenance-header-lint.test.ts:45-47`, `reference-resolution-lint.test.ts:68-70`, and in a shortened variant `executor-verification-report-lint.test.ts:22-23`. One copy stays; the other six go.

**(b) What it asserts.** A scope statement about the file it heads: this gate reads and asserts, it never rewrites the surface it scans.

**(c) Does anything else assert the same thing.** Yes, twice over. The sentence names its own authoring home in its own text, `rules/critical-stance.md` §2, and that rule is loaded by every agent. And the six other copies say it, which is the duplication itself: `derivable-enumerations-lint.test.ts:35` and `reference-resolution-lint.test.ts:69` differ only in the final noun ("a document" against "a text").

**(d) What would reach a release unnoticed.** Nothing. No test fails, no gate weakens, and no gate acquires the power to rewrite by losing a comment that says it does not. The residual loss is that a reader opening one of the six files no longer meets the scope statement in that file's own header, and reaches it through the rule the surviving copy cites.

**(e) Yield.** 18 lines, 1 for 1, Class C.

---

**Row 4: the retelling in `rules-emission-golden.test.ts` that announces itself as one. Verdict: `duplicate`. Yield: 6.**

**(a) The file and range.** `rules-emission-golden.test.ts:93-100`, eight of the ten lines under the heading `WHY THE BUDGET ONLY REPORTS`, leaving `:101-102` and a two-line replacement that keeps the pointer. Ten lines become four.

**(b) What it asserts.** Why the growth budget reports instead of failing: the 2026-08-05 conversion of the ratchet into a report, decision `260805-1559`, and the 2026-08-14 measurement that took half of it back.

**(c) Does anything else assert the same thing.** Yes, and this file says so in its own first clause: "Told once, in `surface-growth-bound.test.ts`'s `WHY THIS FILE EXISTS`". The original is `surface-growth-bound.test.ts:8-30`, carrying the same decision number, the same analysis record `260812-0022-where-the-complexity-comes-from-and-what-would-have-to-go.md`, and the same four-and-a-half-day figure. The retelling follows the disclaimer.

**(d) What would reach a release unnoticed.** Nothing. The two sentences that belong to this file and not to the other, "That half is what the retirement above hands to the per-path bound" and "Role-specific text has only ever reported: it is bought by the agents that need it", are kept, and the pointer to the authoring home is kept.

**(e) Yield.** 6 lines, 1 for 1, Class C.

---

**Row 5: surplus consecutive blank lines. Verdict: `prose`. Yield: 6.**

**(a) The file and range.** The second blank of a two-blank run, one instance in each of six files: `derivable-enumerations-lint.test.ts:39`, `fusion-commit-lock.test.ts:93`, `glob-nomatch-lint.test.ts:28`, `marker-format-lint.test.ts:32`, `path-literal-lint.test.ts:21`, `provenance-header-lint.test.ts:50`.

**(b) What it asserts.** Nothing.

**(c) Does anything else assert the same thing.** Not applicable: a blank line states nothing to duplicate.

**(d) What would reach a release unnoticed.** Nothing.

**(e) Yield.** 6 lines. **The whole blank-line reservoir is six lines**, measured over all 58 files: the surface carries 1 912 blanks and every one of the others is a single separator between logical blocks. This is the sharpest evidence that the previous cut-only plan already harvested what was loose here.

---

### Ledger total and verdict counts

| Verdict | Rows | Lines |
|---|---|---|
| `duplicate` | 2 | 24 |
| `superseded` | 0 | 0 |
| `prose` | 3 | 150 |
| `load-bearing` | the remaining 58 files and every assertion in them | 0 |
| **Ledger total** | **5** | **174** |

### Class A: eight files, none of them a row, and why per file

The presumption is against this class and the reading did not overturn it once. Every one of the eight is the only executable test of its subject, and in each the subject is a helper or a hook path with no second coverage anywhere in the suite. The step forbids a row that says only "it is new and small", and none of these could have offered more than that.

| File | Yield | What it asserts | Anything else asserting it | What would ship unnoticed |
|---|---|---|---|---|
| `citation-form.test.ts` | 376 | Write-time citation form: which file the trigger takes, which lines a Write, Edit, MultiEdit or `replace_all` owns, and which of four verdicts reaches the writer, plus the throttle signature | Nothing. Its own header states it re-asserts no grammar; the grammar's tests (`citation-grammar-boundaries.test.ts`, `fenced-code-exemption.test.ts`) assert what a token parses to and never which lines a tool call owns | A report firing at another writer's keystroke, or silent on the writer's own, and a repaired-then-reintroduced violation the throttle swallows |
| `dispatch-bytes.test.ts` | 223 | What a `task_start` row measures: the byte counts, the claimed work item read off the prompt, and that the warm path spawns nothing | Nothing. The row's existence is checked nowhere else, and the no-spawn promise is observable only by counting an injected runner's calls | A dispatch measurement that re-spawns its subprocesses on every warm call, and a `task_start` row attributing work to the wrong item |
| `fusion-forum.test.ts` | 220 | `bin/fusion-forum`'s exit table, its `state=` vocabulary and all three `note=` degradations, driven against real scratch repositories with a bare origin | Nothing. No other test drives this script | `/fusion:news` reporting `new=0` as an answer when the fetch, the mark or the identity filter silently failed |
| `fusion-claimed-item.test.ts` | 192 | Every code of the helper's exit table, and above all that two claimed items is refused rather than first-matched | Nothing | Two checkouts resolving one item, and every `OUT_*` in a dispatch landing in the wrong container |
| `plan-size.test.ts` | 163 | That the ceiling reports and never gates: a corpus far over it still exits 0, with the finding in `verdict=` | Nothing | A report turning into a gate and reversing decision `260909-1700_*_does-the-plan-size-ceiling-fail-hard-or-only-report.md` without anyone deciding it |
| `session-start-event.test.ts` | 150 | The hook-written `session_start` row's contract: six fields, once per session, absent rather than empty | Nothing. `fusion-events.test.ts` reads rows and never writes one | A second row per session, a field written empty, and a `git_head_at_start` that `bin/fusion-review-coverage` then cannot anchor on |
| `live-circle-record-detection.test.ts` | 77 | That a container whose record still carries a live marker is a superseded format to Setup and one convertible record to the migration, and that a terminal one is neither | Nothing. It is named in its own commit as the owed regression for `c08230fa` | A workbench mid-work at the v11 upgrade reporting "current" forever, with every item's artifacts unreachable |
| `declared-citation-paths.test.ts` | 70 | That a declared pattern whose index entry has no work-tree file is named, never reported as a count of none | Nothing | `declared-files=0` standing for "the corpus went unread", which is the bare `continue` this file was written against |

**Class A contributes 0 lines to the ledger.** The plan's stopping clause about a path to 140 running through Class A therefore does not fire: no such path was found, so the choice it would have put to the user does not arise.

### The eight intermittently failing files: fix in all eight cases, and no row rests on flakiness

The record is `260908-1719_*_three-harness-spawning-tests-fail-intermittently-so-the-suite-cannot-answer-the-circles-green-clause.md`, whose title names three and whose 260912-1656 note names eight. **For each: fix, not cut.** The reading found no duplicated and no obsolete guarantee in any of the eight, so on the plan's rule none of them can enter the ledger as a deletion at all.

| File | Whole-file yield | Guarantee | Fix or cut |
|---|---|---|---|
| `staging-drift.test.ts` | 1 | The measured defect reproduced, the cry-wolf controls, the HEAD-moving trigger, and where the report anchors | **Fix.** Yield is 1 line; even a cut on duplication grounds would free nothing |
| `fusion-commit-lock.test.ts` | −1 | The mutex's acquire, release and stale-lock paths | **Fix.** Deleting it puts the bound further over |
| `guard-state-shape.test.ts` | 114 | A shape-valid state file of the wrong shape must not swallow the tracker's reply | **Fix.** Nothing else drives the coercion seam; the yield is real and the guarantee is single-sourced |
| `fusion-citation-check.test.ts` | 37 | The checker's corpus includes the frozen stores while its verdict does not, and the exit stays 0 | **Fix.** The corpus split is asserted nowhere else, and `workbench-citation-lint.test.ts` deliberately holds the other corpus |
| `review-coverage.test.ts` | 73 | The tiling, the ranges it refuses out loud, the carried out-of-scope list, and the single trigger | **Fix.** Its Row 1 and Row 2 entries take six section dividers and not one case |
| `citation-sweep.test.ts` | 87 | The rewrite table, the repair pass, the three write guards, and the idempotency that blocks a release | **Fix.** The idempotency assertion is itself a release gate |
| `hook-fail-open.test.ts` | −9 | A hook whose report fails still writes its verdict | **Fix.** Deleting it costs 9 lines |
| `monitor-warnings-panel.test.ts` | 70 | Which guard events reach the panel, at what budget and what weight | **Fix.** The only executable coverage `bin/monitor` has. Its Row 2 entry is zero: no divider of its nine was proposed |

Three of the eight appear in Rows 1 and 2, and the reason each appears is duplication or absence of content in a comment block, never flakiness. **No case, no fixture, no assertion and no harness call of any flaky file is proposed for removal.** Their line counts move by the dividers alone, and whatever makes them fail under parallel load is untouched by every row above.

### Class B: fifteen eligible files, all `load-bearing`

The eligible roster after the step's exclusions, ordered by yield, with the guarantee each holds alone:

| File | Yield | Why nothing else holds it |
|---|---|---|
| `rules-emission-golden.test.ts` | 181 | The golden pins the emitted path set, the emission order, each file's size and each agent's total, plus role coverage, the justification duty and the drift ceiling. Nothing else measures what an agent loads at Setup |
| `citation-grammar-boundaries.test.ts` | 115 | Where a token starts and stops, which directories a bare name resolves to, the `foo` word test, the foreign qualifier, and both container record forms. Every case is a distinct boundary with its own measured defect; `fenced-code-exemption.test.ts` holds the fence exemption and not these |
| `guard-state-shape.test.ts` | 114 | See the flaky table above |
| `config.test.ts` | 96 | The two-layer leaf merge, the template-equality pin, and the retirement advisories for the retired file, the four top-level keys and the two `orchestrator` leaves. All of it is live behaviour at HEAD |
| `fusion-events.test.ts` | 93 | The log read by the identity on each line: the three-class partition, the merged-log case, and the absent-identifier reading |
| `citation-sweep.test.ts` | 87 | See the flaky table above |
| `review-coverage.test.ts` | 73 | See the flaky table above |
| `commit-message-path.test.ts` | 71 | That the prompts prescribe a `/tmp` path and that the path carries a per-session discriminator. Two defects that already happened, and the run-time half in `staging-drift.test.ts` asks a different question of the same string |
| `monitor-warnings-panel.test.ts` | 70 | See the flaky table above |
| `fusion-session-domain.test.ts` | 61 | Two lines always, the stderr reason on a fallback, exit 3 with empty stdout outside a workbench, and that a leftover state file is inert |
| `sentence-identifier-containment.test.ts` | 48 | The set relation `identifiers(builder(input)) ⊆ identifiers(input)`, which is what stopped fusion's own stamps shipping into a consuming project's session |
| `context-manifest.test.ts` | 47 | `HYG-NO-REGRESS`: the helper's output is byte-identical without a manifest, checked against the helper run in a manifest-free directory |
| `fusion-citation-check.test.ts` | 37 | See the flaky table above |
| `executor-verification-report-lint.test.ts` | 22 | That the `Verification:` contract is present in both executor prompts and has not drifted into two shapes |
| `review-coverage-mandate.test.ts` | 16 | That the mandate is in its one authoring home in the parser's own spellings, that the prompt reaches it, and that `bin/fusion-rules` still emits it |

Eight further baselined files have a yield of exactly 1 (`archive-filter-key`, `helpers/citation-scan`, `helpers/prompt-blocks`, `identity-mint-notice`, `legacy-halt-clearing`, `paths`, `session-start-subdirectory`, `staging-drift`). Deleting all eight frees 8 lines and gives up eight distinct guarantees, among them the pin that a legacy halt blocks nothing at HEAD. No row.

**Twenty-three files have a yield of zero or below and are candidates for nothing:** deleting any of them leaves the bound where it is or puts it further over, so no judgement about their content can change the total. They are named in the recomputed table rather than argued about.

### Why the line-based bound makes Class C thinner than its headline

The reservoir reads as 8 329 non-code lines, 38 per cent of the surface, and the cut available inside it is 174. The reason is visible in one file. `reference-resolution-lint.test.ts` holds 1 003 lines and a yield of zero, and its re-approval log, the largest single body of prose in the suite, occupies **twenty-one lines**: entries of 860, 1 786, 4 831, 7 030, 12 086, 28 670 and 34 131 characters, each written as one line. The surface counts newlines. Prose packed onto one line is nearly free under this instrument, and the project has demonstrably packed it.

Two consequences worth carrying forward. The narrative prose the Class C rule protects is largely invisible to the bound anyway, so protecting it costs little. And the lines the bound can actually see are structural, which is why the whole ledger is dividers, a repeated sentence and six blank lines. That is not a failure of the reading; it is what a line-counted surface leaves after one cut has already run over it.

### The exclusions, restated

- **The three gates in `README-hooks.md` `### Three gates that can fail the suite over text nobody compiled`** (`committed-dist.test.ts`, `workbench-citation-lint.test.ts`, `plan-stopping-section-lint.test.ts`) are excluded by construction. No row touches any of the three, in any class. Their whole-file yields are −3, 28 and −4, so the exclusion costs the cut at most 28 lines.
- **`surface-growth-bound.test.ts` and `helpers/growth-bound.ts` are excluded from Class C trims.** Their prose is the instrument: the arming logs, the `## Re-baselining` rule and its absolution text. No row touches them. Their four divider blocks and 479 comment lines are outside the reading by name.
- **`helpers/guard-harness.ts` is excluded as a whole-file deletion**, three suites importing it. Row 2 trims six dividers inside it and deletes nothing else; the file survives.
- **No baseline and no head-room constant moves.** None of the three re-baselining events applies, and a head-room raise is a user decision and a different record.

### The lint check the step requires, and its result

Before proposing any removal I checked `reference-resolution-lint.test.ts` and `derivable-enumerations-lint.test.ts` for a reference resolving into a file or a line a row touches.

**Neither lint can see the hook test directory, and the reason is structural rather than incidental.** `reference-resolution-lint.test.ts:96-122` builds its corpus from `rules/`, `agents/`, `docs/`, `templates/`, every `skills/*/SKILL.md`, the root READMEs and `CLAUDE.md`, the shell scripts under `bin/`, `install.sh`, and then `hooks/lib/*.ts` and `hooks/*.ts` under `statSync(abs).isFile()` guards (`:127-141`). `__tests__` is a directory, so it is skipped, and the file's own 2026-09-09 log entry states the same thing in the other direction: files under this directory "sit under a directory `surface()` never descends into". `derivable-enumerations-lint.test.ts` derives seven enumerations, none of which reads the test tree.

**No row reddens either lint, and no accompanying edit is owed.** One further check: nothing in the suite reads another test file's text. The only reader of this tree is `surface-growth-bound.test.ts`'s own file walk, which counts lines, so `fixtures/surface-growth.golden` is the one artefact a row moves and S3 already regenerates it.

### A defect found during the reading, and it is not a cut

`review-coverage-mandate.test.ts` carries stale prose from the v11 reviewer merge, in four places. `:59` reads "The two prompts that write review files" over a constant holding one (`REVIEWER_PROMPTS = ["reviewer.md"]`, `:60`). `:74-79` says the contract is emitted "to those two agents". `:17-22` says `bin/fusion-rules` "still emits it to exactly those two agents". `:142` heads a section "1. The mandate is in both reviewer prompts". The file's own `:62-71` documents the merge correctly, so the file contradicts itself.

**The verdict is `load-bearing` with a correction owed, not a row.** The fix is to correct four clauses, which changes the line count by roughly nothing, and a cut that deleted them would remove the statements a reader needs rather than the wrong ones. It is recorded here so it is not lost.

## Implications

**The cut is available and it is small.** 174 lines against a bound at zero margin lets `work-graph.test.ts` land at 140 to 174 lines. The six most recent helper tests in this repository run 150 to 223, so a test at 174 is inside the precedent range but at its lower half, and `work-graph.test.ts` builds a fixture store on disk and exercises seven behaviours, which puts it in the upper half by construction. **The gap between what the cut frees and what the test plausibly needs is real and the gate should see it as the main risk**, not as arithmetic slack.

**The 260 mark is unreachable from this suite.** Nothing was withheld to keep the number honest: the whole positive-yield Class B roster after exclusions is 1 131 lines, every line of it a guarantee held nowhere else, and Class A is 1 471 lines of guarantees younger than a week. To reach 260 the cut would have to take a guarantee, and no candidate offers one to take.

**The instrument and the surface disagree about what prose costs.** Narrative prose can be, and has been, written one paragraph per line, which the bound barely charges; structural whitespace and dividers are charged in full. A surface bounded by lines therefore selects against readable formatting and for packed paragraphs. That is a finding about the instrument rather than about this cut, and the open question `260822-1154_*_does-the-hook-test-line-budget-cover-comment-prose.md` is where it belongs.

## Recommendations

1. **Put the ledger to the user at G1 in yield order, with Row 2's weakness stated on its own line.** The total clears 140 only if Rows 1 and 2 are both approved. Rows 1, 3, 4 and 5 together are 110 and do not clear it.
2. **If the gate approves Rows 1, 3, 4 and 5 and refuses Row 2, S4 fires**, not S3: 110 is under 140, and the plan's honest-no branch is the correct outcome rather than a smaller cut plus a smaller test.
3. **If all five rows are approved, S3 applies exactly them.** Every range is given above by file and line. Regenerate `fixtures/surface-growth.golden`, move no baseline and no head-room constant, and report the margin against 140, 220 and 260.
4. **Whoever writes `work-graph.test.ts` should know before writing that the room is at most 174 lines**, and that the precedent range's upper half is not reachable. Routed to whoever executes C3 of `260911-1833_*_implementation-prerequisites-confirmed-once-order-computed.md`.
5. **Commit S1's table as a file.** Routed to `coder`. The step's product does not exist, and the next reader pays the same cost I paid.
6. **Correct the four stale clauses in `review-coverage-mandate.test.ts`.** Routed to `coder`, outside this cut, since it frees no lines and the file contradicts itself today.

## Filed Issues

None. The step's Files clause admits one analysis report and no issue file. Two findings above would otherwise be issues, and both are routed under Recommendations: the missing S1 table, and the stale v11 prose in `review-coverage-mandate.test.ts`.

## Sources

- `hooks/lib/__tests__/surface-growth-bound.test.ts:281-286` (`lineCount`), `:374-427` (`TEST_LINE_BASELINE`), `:432` (`TEST_LINE_HEAD_ROOM = 2_595`), `:463-484` (the hook-tests surface and its file walk)
- `hooks/lib/__tests__/helpers/growth-bound.ts:18-85` (`## Re-baselining`, the three events and the head-room raise), `:130-147` (`growth()`)
- `hooks/lib/__tests__/reference-resolution-lint.test.ts:96-142` (`surface()`), `:452-489` (the re-approval log and its roll convention)
- `hooks/lib/__tests__/derivable-enumerations-lint.test.ts:42-386` (the seven enumerations and their ground truth)
- All 58 files under `hooks/lib/__tests__/**/*.ts`; full reads of the eight Class A files and of `citation-grammar-boundaries.test.ts`; header reads of the Class B roster
- `README-hooks.md` `### Three gates that can fail the suite over text nobody compiled`
- `260908-1719_*_three-harness-spawning-tests-fail-intermittently-so-the-suite-cannot-answer-the-circles-green-clause.md`, including the 260912-1656 note naming the wider set of eight
- `260912-2045_*_cut-the-hook-test-surface-for-the-work-graph-fixture-test.md`
- `git show 341e4c94` (the S1 commit, message and diff)

## Open Questions

- [ ] Is Row 2 approved? The ledger clears 140 only with it, and it is the one row whose removed text is not duplicated elsewhere.
- [ ] `work-graph.test.ts` at 174 lines or fewer: is that acceptable to whoever writes it, or does the shortfall against 220 send this to the head-room record at S4 even with every row approved?
- [ ] `260822-1154_*_does-the-hook-test-line-budget-cover-comment-prose.md` remains open, and this reading adds evidence to it: a line-counted surface charges formatting and barely charges packed paragraphs. The question is not this work's to answer.
