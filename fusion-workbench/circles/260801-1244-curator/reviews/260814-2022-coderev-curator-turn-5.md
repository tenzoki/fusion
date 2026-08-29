# Code review — Turn 5 of Circle `260801-1244-curator`: four documents corrected, and the searches that stopped at the finding's edge

**Date:** 2026-08-14 20:22
**Sender:** coderev
**Circle:** `260801-1244-curator`
**Reviewed-range:** `d5b71f1..41c224c`
**Not-opened:** none

The three carried not-opened files from the Turn-4 review were opened in this pass and are cleared. `260814-1457-reconciliation.md` was read end to end (196 lines). `260814-1332-curator-run.md` was read end to end for its substance, §1 through §7b (lines 1-748), and its appendix (lines 749-2633, nineteen verbatim pre-edit copies of decision records) was verified for completeness rather than re-read against the records: the appendix carries exactly nineteen `###` path headings, matching the nineteen records §5 says it holds. `fusion-workbench/orchestrator-events.jsonl` was parsed in full — 1 440 lines, 0 malformed, spanning 2026-07-06T16:51:48 to 2026-08-14T18:11:27 — aggregated by event type, and its session slice reconciled against git commit by commit.

---

## Summary

The three corrections `9f4cdac` made are right, and the fourth finding correctly became a measurement and an open decision rather than an edit. What did not hold is the widening: two of the four closures searched on the axis their own finding named and stopped there, and in both cases the same defect was standing one row over. Seven stale citations sit in the very table the commit corrected six others in, wrong by 57 lines rather than by two.

Separately, and outside the range: `npm test` is red at the working tree, because this repository set its own Turn budget and a test forbids this repository from having one.

## Totals

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 2 |
| Medium | 1 |
| Low | 1 |

Three filed under `circles/260801-1244-curator/issues/`, one under `shared/issues/`, all at stamp `260814-2022`. The split is the Origin Rule: the shared one is a pre-existing conflict between a test and a shipped template that this session's own configuration change made visible, and it owes nothing to the curator Directive.

## What was verified, and how

- **The suite. It is red.** `cd hooks && npm test` — 1 failed, 48 passed (49 files); 1 failed, 1 029 passed (1 030 tests). The failure is `lib/__tests__/config.test.ts:1334`, and the whole diff is one line added to the uncommitted working-tree `fusion-guard.json`. This is F2.
- **The always-on growth claim holds, re-derived rather than read.** `RULE_BASELINE` sums to 86 573 over the five core files (`rules-emission-golden.test.ts:475-479`); the golden's core sums to 87 510; `GROWTH_BUDGET` gives a budget of 98 573. Delta 937, head-room 11 063, of which `9f4cdac` spent 415 — exactly what the commit message and the coder's history claim.
- **The golden fixture moved only where it should.** `fusion-workbench-conventions.md` 52 549 → 52 964 in every one of the seventeen role blocks, and no other file's byte figure changed.
- **The six shaper citations `9f4cdac` corrected are correct.** Each read at HEAD: `:57` is the `**Circle file:**` halt, `:59` the anticipated-circle detection contract and the `**Draft:**` bound, `:62` the draft-consumption bullet, `:82` the `**Domain:**` frontmatter fill, `:106` the anticipated-circle halt. Six for six.
- **The layout tree's three new consumer citations are true.** `agentstate.yaml` is read at `state-drift.ts:97` and `review-coverage.ts:125` and named at `churn.ts:125` and `staging-drift.ts:175`; `orchestrator-live.md` at `churn.ts:123` and `staging-drift.ts:176`; `orchestrator-events.jsonl` at `state-drift.ts:98`, `churn.ts:124` and `staging-drift.ts:180`. Nothing claimed is absent. What is absent is the rest of the block — F3.
- **Phase 0b.1 no longer contradicts the contract.** `agents/orchestrator.md:422` states the relay and points at `## Re-sharpening an anticipated Circle (shaper portfolio-activation)` rather than restating its mechanics, and `agents/shaper.md:121` classifies the Phase 0b.1 dispatch as the non-interactive kind, which now agrees. The `/fusion:direct` half was correctly left with `260813-1334_*_`, which is still open at a line this Circle rewrote.
- **The prohibition is gone from every surface that carried it.** `grep -rn "portfolio-activation"` over `agents/`, `rules/`, `skills/`, `docs/`, `README*.md` and `CLAUDE.md` returns `README-agents.md:25` (mode enumeration, claims nothing about dispatchers), `rules/circle-records.md:83`, `skills/next/SKILL.md:250` and the orchestrator's own section. None states who may dispatch. The closure note's claim is true.
- **The two closures and the one non-closure are honestly written.** Each `Resolved:` footer states what was verified rather than what was reported, and the record that could not close says in its own body which direction of its question remains unmeasured instead of reading the measurement as more than it is.
- **The decision record is sound.** `260814-1915_*_should-mode-3-require-the-audit-line-on-every-run-instead-of-testing-whether-it-was-dispatched.md` states the probe results, separates the settled direction from the unsettled one, names the unsettled one as the dangerous one, and recommends the option that does not depend on it. Its recommendation is right for the reason it gives: deleting the test removes the failure in both directions, where repairing it requires first knowing which direction it fails in.
- **The event log is structurally sound and materially incomplete.** 1 440 lines parse, no malformed record. This session's ten tasks all carry a matched `task_start`/`task_done` pair. Seventeen of its twenty-five commits carry no `commit` event — see *On the open records*.

## Findings by theme

### A widened search reached the topic and not the form

**F1 — High. Ten citations that `bf9553f` staled still stand, and seven of them are in the table `9f4cdac` corrected six others in.** `bf9553f` inserted 2 lines into `agents/shaper.md` and **57** into `agents/orchestrator.md`. `9f4cdac` corrected the six shaper citations in `README-agents.md` `## Dispatch parameters` and left every `agents/orchestrator.md:NN` citation in the same table untouched: `:377` (twice), `:392`, `:438`, `:649`, `:850` and `:1397`, correct at `bf9553f^` and wrong by 57 at HEAD. Not one lands on anything related to its row — `:392` is a markdown table separator, `:649` a blank line, `:1397` the line `    participant OC as Ontocoder` of the Mermaid session-flow template. Three more, wrong by 2, sit outside that table: `rules/fusion-workbench-conventions.md:217`, which is always-on text on every dispatch and lands on a different bullet than the one it describes, and `agents/playmaker.md:114` and `:282`.

The widening the task asked for was performed and recorded — `grep -rn "portfolio-activation"` over every shipped `.md`, `.ts` and `.json` — and it is a topic grep. It cannot find a stale orchestrator citation in a row about `taskplanner`. The axis that mattered was the citation form, and the trigger to search it was inside the same finding: the record being closed reported six citations moved by one insertion, and the commit that made it made a second, twenty-eight times larger.
Filed: `260814-2022_*_ten-citations-that-bf9553f-staled-still-stand-and-six-of-them-are-in-the-table-the-fix-corrected.md`.

**F3 — Medium. Five of the eight root-anchored rows still under-name their consumers, by the criterion the same commit wrote two lines below them.** `9f4cdac`'s prose generalises the column: a module that only *names* a path, in an exclusion or classification list, belongs in it beside one that reads the file. Applied to the whole block that adds `hooks/lib/staging-drift.ts` to `.commit-lock/`, `.session-marker`, `.plane-map.json`, `.plane-outbox.jsonl` and `.guard-state/`, and `hooks/lib/churn.ts` to `.guard-state/`. The `.guard-state/` case is the plainest: `churn.ts:126` holds the literal `"fusion-workbench/.guard-state/**"` two lines below the `orchestrator-events.jsonl` at `:124` that the commit cited as evidence for the row above it. Same constant, four entries, three of which reached the tree.

This is the second consecutive pass to correct this eight-row block one subset at a time. Ledger entry L24 of the curator run widened its search for `.guard-state/` and not for the three rows above it, which is the finding `9f4cdac` closed.
Filed: `260814-2022_*_five-of-the-eight-root-anchored-rows-still-under-name-their-consumers-by-the-criterion-the-same-commit-wrote.md`.

### A test and a shipped template that cannot both be right

**F2 — High. This repository cannot set its own Turn budget, because `config.test.ts:1325` pins `fusion-guard.json` byte-identical to the template — and the suite is red now.** `templates/fusion-guard.json` `_turnBudget` tells every project that `{"orchestrator": {"maxTurns": N}}` in that file "is the only place a project changes it". This repository is a project: it runs its own workbench and its own Turn loop, and `agentstate.yaml` reads `max_turns: 12`. The edit that supplied it is uncommitted, its mtime is 19:35:20 local — after the Turn-5 task reported `npm test exit 0` at 19:12 and before the session resumed at 20:09 — and it is the sole cause of the one failing test.

The test's own comment gives its purpose as catching accidental drift between the two copies. Byte identity cannot decide that question: a deliberate documented configuration and an accidental edit are the same bytes. That is `rules/critical-stance.md` §4 — an undecidable question answered by a proxy. The cheap fixes are to compare the two files with the project-configurable keys stripped, or to pin the template against a fixture and drop the repository copy from the assertion.

The immediate consequence is procedural. `CLAUDE.md` `## Release process` step 0 validates against a working tree, and this Circle is about to write its closure commit over a red one.
Filed: `260814-2022_*_this-repository-cannot-set-its-own-turn-budget-because-a-test-pins-fusion-guard-json-to-the-template.md`.

### A new parameter with no end

**F4 — Low. `**Initiated by:**` carries quoted user dialogue and no surface says where its value ends.** `README-agents.md:55` enumerates the parameters whose values may run past their own line as a closed set of two, and `9f4cdac` added a third parameter to the table below without revisiting it. The new row defines the value as the question, the option and the date, "quoted, not paraphrased", and `agents/orchestrator.md:344` reinforces that with "Quote the user rather than paraphrasing". `rules/user-facing-output.md` allows a gate prompt eight lines. `inference:` a real value may well wrap, and the parameter that halts the run is then the one with no parsing rule. `**Draft:**` shows the shape of the fix: "(may span lines)" in its own cell, and a termination rule in the preamble.
Filed: `260814-2022_*_initiated-by-carries-quoted-user-dialogue-and-no-surface-bounds-it-to-one-line.md`.

## Cross-cutting observations

**One shape produced F1 and F3, and it is the same shape the Turn-4 review named, one iteration on.** Turn 4 wrote that `bf9553f` was "complete inside its two files and incomplete in the corpus". Turn 5 was dispatched to widen, widened correctly on the axis each finding named, and stopped at that axis's edge. A finding says *this claim is wrong here*; the search it licenses is *where else is this claim wrong*, and both passes ran exactly that. What neither ran is *what else did the same event break* — one commit inserted lines into two files, and the citation residue is a property of the commit rather than of the topic. Both remaining findings are the residue of a single event, and both would have been found by one question asked at the commit rather than at the finding.

**The corrections themselves are of high quality, and this is not a review of careless work.** Every closure note states what was verified rather than what was reported. The one finding that could not be fixed was measured, and the measurement was read for exactly what it showed — the coder's history and the decision record both distinguish the settled direction from the unsettled one and refuse to edit two inheritance sentences on evidence that does not reach them. That is the standard `rules/critical-stance.md` §3 asks for, met without prompting. The failures above are scoping failures, not honesty failures.

**The line-number citation form has now produced findings in three consecutive Turns and still has no gate.** Turn 3 met literal state markers in record citations, Turn 4 met six stale `file.md:LINE` citations, Turn 5 meets ten more. `hooks/lib/__tests__/reference-resolution-lint.test.ts` resolves paths, heading anchors and workbench records, and reads no line numbers anywhere. `260808-0030_*_` records the class and declines to repair the historical corpus, correctly; what it does not cover is that the form is now dense in *shipped* text, where a wrong number is read by a user rather than by an archaeologist. Whether that earns a gate is a design question this review does not answer, and it is the third time a reviewer has written that sentence.

**The event log's per-commit half is not honest, and the surface this project treats as the reliable one is the surface failing.** Seventeen of this session's twenty-five commits carry no `commit` event, including all three in this range. The eight that do are all task commits; every bookkeeping commit — the reviews, the record closures, the reconciliation — is absent, while `agents/orchestrator.md:1359` defines the event as firing on a successful git commit without qualification. This is **not filed**: `260811-1614_*_the-drift-checks-turn-row-is-satisfied-by-a-turn-start-alone-so-a-turn-that-emits-nothing-else-reads-clean.md` already carries the class with its own measurement from a different session, and is the record to annotate. It is worth annotating, because this session's shape is sharper than the one it recorded: there the per-task events vanished with the boundary events intact, here the per-task events are complete and the commit events are absent for exactly the class of commit that no task produces. Turn-4's F5, the missing `reconciliation` event, is the same gap seen from a third side.

## On the open records

Sixteen open defect records now stand in the Circle and its shared reach after this pass; four are added here.

**The three closures in `41c224c` are correct and were re-verified rather than accepted.** `260814-1419_c_` (the consumer column), `260814-1850_c_` (the roster) and `260814-1850_*_` (Phase 0b.1) each state a `Resolved:` footer whose claims hold at HEAD. Each is also narrower than the job a reader would infer from its title, which is why F1 and F3 exist rather than reopening any of them: the records named specific rows and specific cells, and those rows and cells are fixed.

**`260814-1850_*_the-halt-that-guards-the-audit-trail-…` correctly stays open**, with a `Half established` annotation that is a model of the form — it names what the probes settled, names what they did not reach, and says why the two inheritance sentences were left alone. Its remedy is the open decision `260814-1915_*_should-mode-3-require-the-audit-line-on-every-run-instead-of-testing-whether-it-was-dispatched.md`, and answering that decision is what closes it.

**One record is worth reading before this Circle closes:** `260813-1334_*_fusion-direct-documents-a-shaper-clarification-flow-that-a-dispatched-sub-agent-cannot-run.md`. `agents/shaper.md:121` has now been edited twice in this Circle — `bf9553f` added portfolio-activation to its dispatcher enumeration and `9f4cdac`'s counterpart edit in `agents/orchestrator.md` made the relay explicit at Phase 0b.1 — and `/fusion:direct` is still absent from that enumeration, which is half of what the record names. The record was correctly left in scope of its own repair both times. It is named here so its status is not read as neglect.

**One judgement carried from Turn 4 and still not filed.** `rules/circle-records.md:83` describes the Grounding snapshot as "Filled at `_a_ → _t_` activation by shaper portfolio-activation mode" while `agents/orchestrator.md:362` states "**Re-sharpening is not activation**". The Turn-4 reviewer judged it reconcilable and not worth opening the file for, and that judgement still holds — but note that `9f4cdac` opened `rules/fusion-workbench-conventions.md` and not this one, so the "if that file is opened for another reason" condition has not arrived.

## Recommended sequencing

**Before the closure commit: F2.** The suite is red, and a Circle that closes over it records a green claim nobody can reproduce. The minimum is to decide between reverting the working-tree `fusion-guard.json` and fixing the assertion; the second is the real answer and the first is what makes the tree green in one command.

**Before the next release, not before closure: F1.** `README-agents.md` is what a caller outside the orchestrator reads before dispatching, and six of its `Declared at` and `Passed by` citations now send that reader to a table separator, a blank line and a Mermaid participant. The repair is mechanical and the correct values are tabulated in the record.

**Cleanup: F3, F4.** Both are one small edit in an always-on file, so both want the golden regenerated in whatever commit carries them, and they should travel together for that reason.

**Not a release blocker in this range.** Nothing in `d5b71f1..41c224c` changes the behaviour of any shipped executable, no test moved, and the always-on corpus grew 415 bytes against 11 063 of head-room. The red suite is a working-tree condition that predates none of these commits and was caused by none of them.

---

## Reconciliation annotation — 2026-08-14 21:53, at HEAD `d90b794`

Added by `reconciler` on the second Phase-3 pass. Findings are not rewritten; each carries the
state of its own record, verified against the tree.

| Finding | Record | State at HEAD | Evidence |
|---|---|---|---|
| F1 High — ten stale citations | `260814-2022_*_ten-citations-that-bf9553f-staled-still-stand-and-six-of-them-are-in-the-table-the-fix-corrected.md` | **resolved** by `b90ea28` | All ten targets read at HEAD by this pass: `agents/orchestrator.md:434` is the planner dispatch, `:449` the taskplanner dispatch, `:495` the `**Deliverable language:**` halt, `:706` the reconciler dispatch, `:907` the playmaker dispatch, `:1454` the `editor` row of the routing table; `agents/shaper.md:89` is the marker-rename sentence and `:90` the `Promoted:` append. A repo-wide sweep for `agents/(orchestrator\|shaper)\.md:[0-9]` outside the workbench returns 16 citing lines and every one resolves. |
| F2 High — `config.test.ts` pins the guard config, suite red | `260814-2022_*_this-repository-cannot-set-its-own-turn-budget-because-a-test-pins-fusion-guard-json-to-the-template.md` | **resolved** by `f0d9d60` (option 1 of the three the record named) | `hooks/lib/__tests__/config.test.ts:1266` declares `PROJECT_SET_KEYS = ["orchestrator"]` and `withoutProjectSetKeys` cuts it from both sides of the comparison. `fusion-guard.json` is committed carrying `"orchestrator": { "maxTurns": 12 }` and `git status --short fusion-guard.json` is empty. `diff fusion-guard.json templates/fusion-guard.json` shows that one line and nothing else. `cd hooks && npm test` run by this pass: **49 files, 1 030 tests, all passed**, 71 s. |
| F3 Medium — five root-anchored rows under-name their consumers | `260814-2022_*_five-of-the-eight-root-anchored-rows-still-under-name-their-consumers-by-the-criterion-the-same-commit-wrote.md` | **resolved** by `b90ea28` | The Turn-6 review re-derived the whole block from `hooks/*.ts`, `hooks/lib/*.ts` and `bin/*` rather than from the record, and reached nine rows against the commit's eight — with `plane.config.yaml` correctly left alone. This pass did not re-run that sweep and does not restate its result as its own. |
| F4 Low — `**Initiated by:**` has no termination rule | `260814-2022_*_initiated-by-carries-quoted-user-dialogue-and-no-surface-bounds-it-to-one-line.md` | **stands open** | `README-agents.md:55` still enumerates the parameters whose values may run past their own line as a closed set of two, `**Draft:**` and `**Confirmed operations:**`. `**Initiated by:**` is not among them and its row at `:68` carries no span note. Unchanged by all four Turn-6 commits. |

**On the review's own sequencing.** It asked for F2 before the closure commit and F1 before the next
release; the Rebalance gate took both in one Turn, so neither is carried forward.

**One cross-cutting observation of this review is now measurable and was left standing on purpose.**
The line-number citation form has produced findings in four consecutive Turns and still has no gate;
`shared/issues/260808-0030_o_*` remains the class record, and this pass added nothing to it, because
the class is unchanged and a fifth annotation would not make it truer.
