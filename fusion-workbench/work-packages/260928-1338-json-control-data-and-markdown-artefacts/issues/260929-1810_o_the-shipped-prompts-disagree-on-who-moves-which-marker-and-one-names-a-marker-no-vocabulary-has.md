The shipped prompts disagree on who moves which marker, and one names a marker no vocabulary has
---
The passages of the shipped text listed below state the marker grammar differently from the passages beside them. Each is a statement FJ03's text cutover replaces with an operation, so each has to be read as it stands before it is rewritten, or the rewrite carries the contradiction into the operation it names.
---
**Filed by:** implementation-planner, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260929-1810_*_plan-fj03a-the-record-client-the-format-gate-and-scope-and-order-on-json.md, 260929-1810_*_in-which-order-do-the-parts-of-fj03-and-fj04-land-while-fusions-own-workbench-is-still-in-the-v12-form.md

Evidence, read at fusion `b4c8f7ca`:

- `agents/orchestrator.md` `## Scope` permits renames "`_o_` to `_p_`, `_p_` to `_c_`" on issues and plans, while `## Setup` step 5 has the orchestrator move a decision from open to answered, `### Step 1 — read the task` and `## Human approval rules` rename to the deferred marker, and `### Rebalance approval` supersedes an implemented decision.
- `agents/orchestrator.md` `### Rebalance approval` names a marker `_b_` for a bounded closure; neither marker vocabulary in `rules/fusion-workbench-conventions.md` has it.
- `agents/analyst.md` `### 7. Decision Record` item 5 files a decision directly as answered, with a `path:line` citation, while `rules/fusion-workbench-conventions.md` `### Decision files` leaves that transition to the orchestrator relaying the user's ruling and `## Filename Patterns` requires the heading-anchor form.
- `agents/consultant.md` `## Scope` lists decision records among what the consultant writes, and `## Secondary Mode: Written Reports` says "Do not write decision records here."
- `rules/orchestrator-rebalance.md` `### Rebalance approval` sets a session history file's `**Status:**`, while `rules/fusion-workbench-conventions.md` `## Session history` closes that store to writes.

The FJ03a plan changes none of these files. The defect is filed so that the plan of the text part starts from it.

Acceptance: in the text part of FJ03 each passage listed above either names the operation that performs the change and the one party that may send it, or is removed; no prompt and no rule file names a marker outside the two vocabularies; `hooks/lib/__tests__/reference-resolution-lint.test.ts` and the dispatch-path bound are green after the change. Executor: `code-implementer`.

---
Resolved: FJ03d steps 4, 5 and 6 (fj03d `8a6100fc`, `0f57b119`, `693a29bc`, merged as `6f37d798`). `agents/orchestrator.md` `## Scope` now moves every record state with `bin/fusion-write transition` and names the orchestrator as the one sender (issues and plans in the dispatch loop, decisions on the user's ruling or a passing verification); the `_b_` marker is gone from `agents/`, `rules/` and `skills/`, Bounded Closure being `dropped` with outcome class `bounded`; `agents/analyst.md` `### 7. Decision Record` item 5 leaves the record `open`, cites in the anchor form and names `answered` as the orchestrator's transition; `agents/consultant.md` `## Scope` lists no decision record and `## Secondary Mode: Written Reports` says it writes none in either mode; `rules/orchestrator-rebalance.md` `### Rebalance approval` writes no history `**Status:**`. Verified at HEAD `95720e4c`: `grep -rn '_b_' agents rules skills` names nothing; the only marker letters outside the two vocabularies are `_t_` in `rules/user-facing-output.md` (a chat-jargon example, other kind under step 10's ruling (d)) and in `skills/migrate/SKILL.md` (the legacy survey, legacy-only); `reference-resolution-lint.test.ts` 41 of 41 and `rules-emission-golden.test.ts` 22 of 22 with `DISPATCH_HEAD_ROOM` 0, both exit 0.
