Ten citations that `bf9553f` staled still stand, and six of them sit in the very table the Turn-5 fix corrected

---
`bf9553f` inserted 2 lines into `agents/shaper.md` and 57 lines into `agents/orchestrator.md`. Commit `9f4cdac` corrected the six `agents/shaper.md` citations inside `README-agents.md` `## Dispatch parameters` and left ten others standing — seven of them in that same table, naming `agents/orchestrator.md`, wrong by 57.

---
**Found by:** coderev, Turn-5 incremental review of `d5b71f1..41c224c`, review file `circles/260801-1244-curator/reviews/260814-2022-coderev-curator-turn-5.md`.
**Owner:** `coder`. One pass repairs all ten.
**Severity:** High for group A, Medium for group B.
**Affects:** `README-agents.md:59`, `:60`, `:61`, `:64`, `:65`, `:72`; `rules/fusion-workbench-conventions.md:217`; `agents/playmaker.md:114`, `:282`.
**Cross-references:** `circles/260801-1244-curator/issues/260814-1850_c_the-dispatch-parameter-roster-still-forbids-the-dispatch-and-has-no-row-for-the-new-parameter.md` (the record whose citation half this completes); `shared/issues/260808-0030_*_line-number-citations-into-rule-files-go-stale-and-no-gate-reads-them.md` (the class record — this is a live instance in shipped text, not the historical corpus it declines to repair); `shared/decisions/260813-0027_*_should-the-orchestrator-be-able-to-dispatch-the-shapers-portfolio-activation-mode.md` (whose realisation `bf9553f` is).

**Verified 2026-08-14 at HEAD `41c224c`.** Every "should be" below was checked by reading the named line at `bf9553f^` and again at HEAD.

## The two insertions

`git diff bf9553f^ bf9553f -- agents/shaper.md` inserts 2 lines at `@@ -52,7 +52,9 @@`, so every line from about `:54` down moved by 2. `git diff bf9553f^ bf9553f -- agents/orchestrator.md` inserts 57 lines at `@@ -307,6 +307,63 @@`, so every line from `:307` down moved by 57. Citations above each insertion point are unaffected and are correct at HEAD — `README-agents.md:71`'s `agents/shaper.md:45` among them.

## Group A — seven citation instances in `README-agents.md` `## Dispatch parameters`, wrong by 57

The table `CLAUDE.md` `## Conventions` calls the roster's single authoring home. Not one of the six distinct line numbers lands on anything related to the row that cites it.

| Row | Cites | What that line holds at HEAD | Should be |
|---|---|---|---|
| `:59` `taskplanner` `**Domain:**` | `agents/orchestrator.md:392` | a markdown table separator, `\|------\|---------\|-------\|` | `:449` |
| `:60` `reconciler` `**Domain:**` | `:649` | a blank line | `:706` |
| `:61` `playmaker` `**Domain:**` | `:850` | a sentence about `bin/fusion-review-coverage` deriving from `**Reviewed-range:**` fields | `:907` |
| `:64` `planner` `**Executors:**` | `:377` | the Plane push at Phase 4 closure | `:434` |
| `:65` `planner` `**Circle:**` | `:377` | the same Plane push | `:434` |
| `:72` `editor` `**Deliverable language:**` | `:438` | the Phase-0b Plan review human gate | `:495` |
| `:72` `editor` `**Deliverable language:**` | `:1397` | `    participant OC as Ontocoder`, a line of the Mermaid session-flow template | `:1454` |

Each was correct at `bf9553f^`: `:377` was the planner dispatch that prefixes `**Executors:**`, `:392` the taskplanner dispatch that passes the domain, `:438` the `**Deliverable language:**` halt paragraph, `:649` the reconciler dispatch, `:850` the playmaker dispatch, `:1397` the `editor` row of the dispatch-routing table. All six carry the same +57.

## Group B — three citation instances into `agents/shaper.md`, wrong by 2

| Citing line | Cites | What that line holds at HEAD | Should be |
|---|---|---|---|
| `rules/fusion-workbench-conventions.md:217` — "its promotion path renames `_o_` or `_p_` and nothing else" | `agents/shaper.md:87` | `**## Closure note**` — section omitted entirely | `:89`, the rename sentence |
| `agents/playmaker.md:114` — "the way the shaper appends `Promoted:` when an entry becomes a Circle" | `agents/shaper.md:88` | the bullet heading the rule, not the `Promoted:` append | `:90` |
| `agents/playmaker.md:282` — "appending `Promoted:`" | `agents/shaper.md:88` | the same bullet | `:90` |

The first is the worst of the three: it lands on a different bullet entirely, and it sits in an always-on rule file, so it is text every agent loads on every dispatch. The two `agents/playmaker.md` citations land on the adjacent line of the same bullet and still resolve for a patient human reader; they are wrong all the same.

## Why this was not caught

The Turn-5 task widened its search, and the widening was on the topic axis. `circles/260801-1244-curator/history/260814-1910-coder-turn-5-four-review-findings.md` records it as `grep -rn "portfolio-activation"` over every `.md`, `.ts` and `.json` outside the workbench. That grep finds a row about the shaper's mode 3. It cannot find a stale `agents/orchestrator.md:392` in a row about `taskplanner`, and it cannot find `agents/shaper.md:87` in a backlog-marker table. The axis that mattered was the citation form, and the trigger for searching it was in the same finding: the record this one completes reported six shaper citations moved by two, and both insertions came from one commit.

`hooks/lib/__tests__/reference-resolution-lint.test.ts` resolves file paths, heading anchors and workbench records and reads no line numbers, so nothing reported any of the ten.

## What the fix is

Repoint all ten to the values in the two tables, in one commit. Group B touches an always-on rule file, so the byte delta is charged against the growth bound and `hooks/lib/__tests__/fixtures/rules-emission.golden` must be regenerated in the same commit — the change is digits only, so the delta is 0 or ±1 byte per citation.

**Do not repair these by deleting the line numbers.** Ledger entries L24 and L26 of `circles/260801-1244-curator/history/260814-1332-curator-run.md` chose "name the consumer, not the line" for citations into *source* files, on the ground that a line number decays. Whether the same choice should be made for `README-agents.md`'s roster is a real question and it is not this record's to answer: that table's `Declared at` column is a line-number column by design, and its preamble states that every cell "was read against" a named line. Emptying it of line numbers changes what the column is. Repair the numbers here; if the form itself should change, that is a decision record.

---
Resolved: All ten citations repointed. Group A — seven instances in `README-agents.md` `## Dispatch parameters` moved +57 into `agents/orchestrator.md` (`:392`→`:449`, `:649`→`:706`, `:850`→`:907`, `:377`→`:434` twice, `:438`→`:495`, `:1397`→`:1454`). Group B — three instances moved +2 into `agents/shaper.md` (`rules/fusion-workbench-conventions.md:217` and `agents/playmaker.md:114`, `:282`, all `:87`/`:88`→`:89`/`:90`). Every corrected value was re-verified by reading the target line at HEAD before writing it, and each matched the value this record predicted. A repo-wide sweep of `agents/shaper.md:` and `agents/orchestrator.md:` citations outside the workbench confirmed these ten were the only stale ones — `agents/orchestrator.md:337-339` sit above the insertion point of the block they cite and resolve correctly. Group B cost 0 bytes against the growth bound (digits only).
