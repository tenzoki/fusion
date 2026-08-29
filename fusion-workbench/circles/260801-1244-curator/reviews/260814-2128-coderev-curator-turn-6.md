# Code review — Turn 6 of Circle `260801-1244-curator`: the repair for under-reaching, and the one place it under-reached

**Date:** 2026-08-14 21:28
**Sender:** coderev
**Circle:** `260801-1244-curator`
**Reviewed-range:** `41c224c..d270666`
**Not-opened:** none

Every file the range touches was opened at HEAD, and the two repairs were re-derived rather than read: the ten citations by reading each cited line at HEAD, the nine root-anchored rows by grepping `hooks/*.ts`, `hooks/lib/*.ts` and `bin/*` for every path in the block, and the JSON cut helper by transcribing its four functions into a scratch module and running them against thirteen input shapes.

---

## Summary

Turn 6 was dispatched to repair two under-reaching fixes, and the question this pass was built around is whether the repair itself reached everything. On both of the axes the Turn-5 review named, it did: all ten stale citations are repointed and correct at HEAD, and the layout tree's consumer criterion now reaches all nine root-anchored rows, not the eight the commit message counts. The suite is green over the whole 49 files.

One instance of the same shape is new, on an axis neither earlier pass searched. `f0d9d60` changed how the guard config is pinned and what the repository's copy contains, and `CLAUDE.md:30` still describes the mechanism it replaced — in a Circle whose Directive is that the normative surfaces match the recorded history, closing now.

## Totals

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 1 |
| Medium | 0 |
| Low | 2 |

All three filed under `circles/260801-1244-curator/issues/` at stamp `260814-2128`. All three originate in this Circle's own Turn-6 commits, so the Origin Rule puts none of them in `shared/`.

## What was verified, and how

- **The suite is green, at HEAD, over everything.** `cd hooks && npm test` — 49 files passed, 1 030 tests passed, 70.6 s. The Turn-5 High finding F2 is genuinely closed: `npx vitest run lib/__tests__/config.test.ts` is 68 for 68 with `"maxTurns": 12` committed, and `./bin/fusion-turn-budget` prints `max_turns=12`, so the value the session runs on is the value in the tree. The known non-deterministic full-run failures (`260814-2118_*_…`) did not appear in this run; nothing is claimed from a single green run beyond that it was green.
- **All ten repointed citations were read at HEAD, one by one.** `agents/orchestrator.md` `:434` is the planner dispatch, `:449` the taskplanner dispatch, `:495` the `**Deliverable language:**` halt, `:706` the reconciler dispatch, `:907` the playmaker dispatch, `:1454` the `editor` row of the routing table. `agents/shaper.md:89` is the marker-rename sentence, `:90` the `Promoted:` append. Ten for ten.
- **The sweep the closing footer claims was re-run independently, and it holds.** `grep -rnoE '(agents/)?(orchestrator|shaper)\.md:[0-9]+(-[0-9]+)?'` over `agents/`, `rules/`, `skills/`, `docs/`, `hooks/`, `bin/`, `templates/`, `README*.md` and `CLAUDE.md` returns 19 citation instances. Each was read at HEAD; all 19 resolve. The bare-continuation form the commit message flags as invisible to a form-keyed search (`agents/shaper.md:47`, `:57` and its siblings) was checked by hand: `:57`, `:59`, `:62`, `:82`, `:106` and `agents/orchestrator.md:1454` all land where their cell says. The three at `:337`–`:339` correctly did not move.
- **The layout tree reaches all nine root-anchored rows, one more than the commit counts.** Read against the criterion by grepping every root-anchored path across `hooks/*.ts`, `hooks/lib/*.ts` and `bin/*`, and separating code constants from doc comments: `.guard-state/` is named in `events.ts:18`, `guard-state-file.ts:119`, `churn.ts:126` and `staging-drift.ts:188`, all four now in the column; `.commit-lock/` and `.session-marker` and the two Plane files each add exactly `staging-drift.ts`; `agentstate.yaml`, `orchestrator-live.md` and `orchestrator-events.jsonl` needed nothing further. `plane.config.yaml` — the ninth row, and the one outside the commit's arithmetic of three-plus-five — is correctly left with `bin/fusion-plane` alone: `staging-drift.ts:84` names it in a doc comment as its worked example of the `unclassified` class, which is a class a file falls into by being in no list. Nothing else in `hooks/` names it.
- **The golden regeneration is exact and confined.** `rules/fusion-workbench-conventions.md` moved 52 964 → 53 124, and every one of the 34 changed figures in `hooks/lib/__tests__/fixtures/rules-emission.golden` moved by exactly 160 — the 17 role blocks plus the four derived totals. No other file's byte figure changed. `RULE_BASELINE` 86 573 against a core sum of 87 670 leaves 10 903 of head-room, which is what the commit message claims.
- **The JSON cut is sound, and was tested rather than read.** The four functions were transcribed verbatim and run against thirteen shapes. Correct on: first, middle, last and only entry; a nested `"orchestrator"` one level down (left alone); the key name inside a prose note (`findTopLevelKey` returns -1, which is the false positive that would have eaten the `_turnBudget` note); a multi-line value; CRLF; a space before the colon; tab indentation; a trailing comma. One shape is imperfect — an entry sharing a line with the next loses one space of the following indent — and it fails in the safe direction, red rather than green, on a shape neither file has. The exemption is confined to `PROJECT_SET_KEYS`: `withoutProjectSetKeys` loops over that constant and nothing else, and the anti-vacuity assertion would fail loudly if the template ever declared one of those keys itself.
- **The Turn-5 review's own record is accurate.** Its `**Reviewed-range:** d5b71f1..41c224c` tiles, its `**Not-opened:** none` is what `bin/fusion-review-coverage` reads, and the three files the Turn-4 pass had left unopened are cleared. Coverage of the whole session range is complete up to this range; the three commits reviewed here were the only uncovered ones, and this file closes them.
- **`d270666` carries records only.** No shipped text, no test, no executable. The Turn-5 entry it adds to the Circle's Turn log was checked against git and against the two review files it describes, and its claims hold.

## Findings

### The axis nobody searched: what shipped text describes the mechanism you changed

**F1 — High. `CLAUDE.md:30` still calls the root guard config byte-identical to the template, after `f0d9d60` made both clauses false.** The sentence reads *"the root copy here is byte-identical to the template (pinned by `config.test.ts`)"*. The root copy carries `"orchestrator": { "maxTurns": 12 }` at line 2 and the template does not; `config.test.ts:1445` is now titled *"apart from the keys this repository sets for itself"* and compares the two with `PROJECT_SET_KEYS` cut from both sides. The divergence is live — `./bin/fusion-turn-budget` prints `max_turns=12`.

This is the Turn-5 shape on a third axis. Turn 4 searched by topic, Turn 5 searched by topic again, and Turn 6 was told to search by the commit that caused the staleness — which it did, correctly, for citations. None of the three asks *which shipped text describes the mechanism I just changed*, and that question is the only one that finds this: the stale claim shares no token with the change except the filename, and the filename is still right. The commit message states the new behaviour in four precise paragraphs; `CLAUDE.md` was not opened.

It matters more here than the wording suggests, for two reasons that are specific rather than general. `CLAUDE.md` is loaded by every session in this repository, so a false mechanism claim is read constantly. And a developer who believes it will read the committed `fusion-guard.json` diff as an accident and revert the line that the running session's Turn budget comes from.
Filed: `260814-2128_*_claude-md-still-calls-the-root-guard-config-byte-identical-to-the-template-after-the-same-turn-made-it-false.md`.

### A test helper that guards a drift check

**F2 — Low. The cut helper is exercised by one input shape, and its last-entry branch by none.** `f0d9d60` added about 90 lines of scanner to `config.test.ts:1266-1373` and no case that calls them directly. `cutTopLevelEntry` opens with `if (keyStart < 0) return text;`, so the anti-vacuity assertion against the template returns before any cutting code runs — what it proves is that `findTopLevelKey` does not match the two `orchestrator` occurrences inside the `_turnBudget` note, which is real and valuable and is not the same as testing the cut. The cut is covered only transitively, by the one comparison, on the one shape the file has today: first entry, own line, comma terminator. The branch that removes a **last** entry, including its `if (text[start - 1] === ",") start--`, is unreached.

No live defect: both branches were run during this review and both are correct. The record exists because the exemption list is designed to grow, and the day it does, the code that runs is code the suite has never executed.
Filed: `260814-2128_*_the-drift-checks-cut-helper-is-exercised-by-one-input-shape-and-its-last-entry-branch-by-none.md`.

### A closing footer narrower than its own commit

**F3 — Low. The Turn-budget record's `Resolved:` footer says `fusion-guard.json` was not edited, in the commit that commits it.** `260814-2022_*_…` closes with *"`fusion-guard.json` and `templates/fusion-guard.json` were not edited"*, and `git show f0d9d60 --stat` lists `fusion-guard.json | 1 +`. Both are true of different acts — the task made no edit, and the commit is where the previous evening's working-tree line entered version control — and the commit message says the second one plainly. The footer is the record a future reader opens to learn why this repository's config differs from the template, and as written it reads as though the configuration did not change.
Filed: `circles/260801-1244-curator/issues/260814-2128_o_the-turn-budget-records-closing-footer-says-fusion-guard-json-was-not-edited-in-the-commit-that-commits-it.md`.

## Cross-cutting observations

**The under-reach question was asked of the right things and answered clean, which is the substantive result of this pass.** Both Turn-5 High findings were repaired to their edges. The citation sweep found all 19 instances in shipped text, including the bare-continuation form that the coder itself flagged as invisible to a form-keyed search and then handled by hand. The layout-tree sweep was re-run here from the code rather than from the record, separating code constants from doc-comment mentions, and it produced the same nine-row answer — including the judgement that `plane.config.yaml` needs nothing, which is the row most likely to have been added on a careless reading. Neither repair repeated the defect it was repairing. That is worth stating explicitly, because three consecutive reviews have now opened with a scoping failure and this one does not.

**What the three passes have converged on is a search discipline with one hole left.** Turn 4 searched the topic. Turn 5 searched the topic more widely. Turn 6 searched the *commit* — the right generalisation, and it worked. The hole is that "what did my commit break" is being asked only of line numbers, because line numbers are what broke last time. F1 is the same question asked of prose: a mechanism changed, and the shipped sentences describing that mechanism are as much a dependency of it as a citation is. Nothing keys on that, `hooks/lib/__tests__/reference-resolution-lint.test.ts` least of all — it resolves paths, anchors and workbench records, and reads neither line numbers nor claims. Whether that earns a gate is a design question this review does not answer, and it is now the fourth consecutive review to write that sentence about this file.

**The root-anchored block is complete as a list and incomplete as a fence, and that is outside this range.** Five surfaces sit *above* the `# ── Root-anchored ── #` comment in `rules/fusion-workbench-conventions.md` while satisfying the block's own definition — bound to a fixed root-relative path, no fallback, breaks silently on a move. `staging-drift.ts` holds `.active-circle`, `monitor` and `.fusion-setup` in `LIVE_STATE` and `tasklist.md` and `portfolio.md` in `ROOT_RECORDS`; `state-drift.ts:99` binds `.active-circle` as `POINTER_REL`; `hooks/lib/workbench-root.ts:22` binds `.fusion-setup`. The block's prose says *"The list is exhaustive as written"*. **Not filed:** `260810-0410_*_the-layout-tree-calls-itself-exhaustive-and-omits-the-two-plane-runtime-files.md` already carries exactly this class, is open, and is the record to annotate rather than duplicate. It is named here so the omission is not read as this pass having missed it.

**Two cosmetic inconsistencies in the new records, neither filed, both stated so they are not rediscovered.** First, `260814-2022_*_ten-citations-…-and-six-of-them-are-in-the-table-…` says six in its filename and seven in its own body, both correct against different units — six distinct `README-agents.md` lines, seven citation instances, because `:72` carries two. Renaming the file would break the `Source:` trailer of `b90ea28`, which is a worse trade than the ambiguity. Second, that record's `Resolved:` footer says `agents/orchestrator.md:337-339` "sit above the insertion point of the block they cite"; they sit *inside* the inserted block, which is why they did not move. Right conclusion, wrong reason, and `b90ea28`'s commit message states it correctly.

## Recommended sequencing

**Before closure: F1.** It is one clause in `CLAUDE.md:30`, it costs nothing against the growth bound, and it is a false claim about a mechanism this Circle's own Turn changed. Closing a normative-reconciliation Circle over a fresh normative-surface falsehood is the one outcome worth spending a commit to avoid.

**After closure, whenever `config.test.ts` is next opened: F2, F3.** Neither blocks anything. F3 is one sentence in a closed record and the reconciler can carry it.

**No release blocker in this range.** No shipped executable changed behaviour. The three prompt and rule edits are line-number digits and consumer-column names; the one test change is a test; the always-on corpus grew 160 bytes against 10 903 of head-room; and the full suite is green over 1 030 tests.

---

## Reconciliation annotation — 2026-08-14 21:53, at HEAD `d90b794`

Added by `reconciler` on the second Phase-3 pass. Findings are not rewritten; each carries the
state of its own record, verified against the tree.

| Finding | Record | State at HEAD | Evidence |
|---|---|---|---|
| F1 High — `CLAUDE.md:30` still calls the root guard config byte-identical to the template | `260814-2128_*_claude-md-still-calls-the-root-guard-config-byte-identical-to-the-template-after-the-same-turn-made-it-false.md` | **resolved** by `d90b794` | The row now reads "the root copy here equals the template outside the top-level keys a project is meant to set for itself, and that is exactly what `config.test.ts` pins: it cuts the keys named in its `PROJECT_SET_KEYS` out of both sides and holds every remaining byte identical. This repository sets one of them, its own Turn budget (`orchestrator.maxTurns`)." Read at HEAD and checked against the two things it claims: `hooks/lib/__tests__/config.test.ts:1266` declares that constant with exactly `["orchestrator"]`, and `diff fusion-guard.json templates/fusion-guard.json` differs on that one line and nothing else. The review's own recommendation was "before closure"; it landed before closure. |
| F2 Low — the cut helper is exercised by one input shape | `260814-2128_*_the-drift-checks-cut-helper-is-exercised-by-one-input-shape-and-its-last-entry-branch-by-none.md` | **stands open** | `config.test.ts:1266-1373` still carries the four scanner functions with no case that calls them directly; the coverage is still transitive, through the one comparison, on the one shape the file has. This is a coverage gap in a test helper and not a live defect — the review ran both branches by transcription and found both correct — so it is carried forward rather than treated as a closure blocker. |
| F3 Low — the Turn-budget record's closing footer | `circles/260801-1244-curator/issues/260814-2128_c_the-turn-budget-records-closing-footer-says-fusion-guard-json-was-not-edited-in-the-commit-that-commits-it.md` | **resolved** by `d90b794` | The `Resolved:` footer of `shared/issues/260814-2022_c_*` now separates the two acts: the task edited neither JSON file, and `f0d9d60` nonetheless commits `fusion-guard.json`, where the working-tree line entered version control. `git show f0d9d60 --stat` lists `fusion-guard.json | 1 +` and no template, which is what the corrected sentence says. |

**The review's "recommended sequencing" was followed exactly.** F1 landed before closure; F2 is
carried as an open record for the next time `config.test.ts` is opened; F3 was taken in the same
commit as F1 rather than carried, which is cheaper than carrying it and changes nothing the review
asked for.

**One thing this review's range could not see, added here rather than as a finding against it.**
`d90b794`, the commit that closes F1, landed after this review's declared
`**Reviewed-range:** 41c224c..d270666`, so `bin/fusion-review-coverage` reports `uncovered=1` at
HEAD. That is the cadence rather than an omission by this pass, and it is filed as
`260814-2153_*_the-commit-that-closes-the-last-reviews-own-high-finding-is-the-one-commit-no-review-opens.md`.
This pass read `d90b794` in full and verified its one substantive clause against the tree, which is
not the same as a reviewer having opened it.
