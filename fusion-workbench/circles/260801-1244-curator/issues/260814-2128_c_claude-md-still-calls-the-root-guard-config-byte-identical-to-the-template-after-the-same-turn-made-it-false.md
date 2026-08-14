`CLAUDE.md` still calls the root guard config byte-identical to the template, after the same Turn made both halves of that sentence false

---
`CLAUDE.md:30` states that "the root copy here is byte-identical to the template (pinned by `config.test.ts`)". Commit `f0d9d60`, Turn 6 of this Circle, falsified both clauses in one change: the root `fusion-guard.json` now carries `"orchestrator": { "maxTurns": 12 }` that the template does not, and `config.test.ts` no longer pins byte identity — it pins identity outside `PROJECT_SET_KEYS`. The commit repaired the test and the configuration and left the sentence that describes them.

---
**Found by:** coderev, Turn-6 incremental review of `41c224c..d270666`, review file `circles/260801-1244-curator/reviews/260814-2128-coderev-curator-turn-6.md`.
**Owner:** `coder`.
**Severity:** High — a false statement on the one normative surface every session loads, created inside the Circle whose Directive is that those surfaces match the recorded history, and the Circle is closing.
**Affects:** `CLAUDE.md:30` (the `fusion-guard.json` + `templates/fusion-guard.json` layout row).
**Cross-references:** `shared/issues/260814-2022_c_this-repository-cannot-set-its-own-turn-budget-because-a-test-pins-fusion-guard-json-to-the-template.md` (the record `f0d9d60` closes); `circles/260801-1244-curator/history/260814-2115-coder-turn-6-drift-check-admits-the-turn-budget.md`.

**Verified 2026-08-14 at HEAD `d270666`.**

## The three readings, against the tree

| The sentence says | The tree holds |
|---|---|
| the root copy is byte-identical to the template | `git diff --no-index templates/fusion-guard.json fusion-guard.json` is one added line, `"orchestrator": { "maxTurns": 12 },` at `fusion-guard.json:2` |
| that identity is pinned by `config.test.ts` | `hooks/lib/__tests__/config.test.ts:1445` is now titled *"is what this repository's own fusion-guard.json is, apart from the keys this repository sets for itself"* and compares both sides with the `PROJECT_SET_KEYS` entries cut out |
| (unstated, and the part a reader needs) | that this repository sets its own Turn budget, and where the exemption is declared |

`./bin/fusion-turn-budget` prints `max_turns=12`, so the divergence is live and load-bearing, not a stray byte.

## Why this is the same defect one level up

The Turn-5 review's F1 and F3 were both under-reaching repairs: a fix that corrected the instances its own finding named and left the rest of what one commit had broken. Turn 6 was dispatched to close both, and both citation repairs did reach every instance — verified independently in this pass. `f0d9d60` then produced a fresh one of the same shape, on a different axis: it changed a mechanism and did not ask which shipped text describes that mechanism. The commit message states the change precisely, in four paragraphs. `CLAUDE.md` was not opened.

The axis is worth naming because it is not the citation-form axis the last two passes learned to search. Nothing keyed on line numbers or on a topic string would find this: the stale claim shares no token with the change except the filename, and the filename is still correct.

## What the fix is

Rewrite the clause in `CLAUDE.md:30`. It has to carry three facts the current sentence does not:

1. The root copy carries the template plus whatever this repository sets for itself, today `orchestrator.maxTurns`.
2. `config.test.ts` pins the two files identical outside `PROJECT_SET_KEYS`, so every documentation note, its order and the whitespace between them is still held byte for byte.
3. A future project-configurable key is admitted by adding its top-level key to `PROJECT_SET_KEYS` and nowhere else — that constant is the single place the exemption is stated.

`CLAUDE.md` is not an always-on rule file, so this costs nothing against the growth bound and needs no golden regeneration.

---
Resolved: The clause in `CLAUDE.md:30` now reads "the root copy here equals the template outside the top-level keys a project is meant to set for itself, and that is exactly what `config.test.ts` pins: it cuts the keys named in its `PROJECT_SET_KEYS` out of both sides and holds every remaining byte identical. This repository sets one of them, its own Turn budget (`orchestrator.maxTurns`)." The three facts the record asked for are each in it: what the two files share, what the test enforces over that shared part, and that this repository exercises the exemption. The key is named and its value is not, so the sentence does not go stale the next time the budget is retuned, and naming `PROJECT_SET_KEYS` points a reader at the one constant where a future exemption is declared. Nothing else in the row changed; the merge semantics and the retired-key paragraph were already correct. `cd hooks && npm test` exits 0.
