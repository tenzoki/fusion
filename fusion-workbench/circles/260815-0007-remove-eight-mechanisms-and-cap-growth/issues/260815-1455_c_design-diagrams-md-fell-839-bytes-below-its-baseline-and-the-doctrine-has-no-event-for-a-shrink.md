# `design-diagrams.md` fell 839 bytes below its baseline, and the re-baselining doctrine has no event for a shrink

---
**Severity:** Low — the growth report now carries 839 bytes of unearned head-room on four roles, and the comment written to justify leaving the entry alone answers a different question than the one the shrink raises
**Domain:** code
**Filed by:** ontorev (Turn 3 review, range `5d29b6d..518926d`)
**Affects:** `hooks/lib/__tests__/rules-emission-golden.test.ts` `RULE_BASELINE["design-diagrams.md"]` and the `ROLES` entry for `design-diagrams.md`; `## Re-baselining: the two events at which the baseline moves` in the same file
**Cross-references:** `circles/260801-1244-curator/decisions/260814-0738_i_how-is-the-always-on-growth-bound-armed-when-the-corpus-is-already-over-budget.md` (the arming that set the doctrine)

---

## What is wrong

`a17cc8c` and `7260bbc` cut the `conceptrev` evaluator out of `rules/design-diagrams.md` — the loading sentence, the "you, the `conceptrev` evaluator, and the human" clause, the self-check's "first line of defence" framing, and the whole `## How the evaluation works` section. The file went from **5 673** to **4 834** bytes, a drop of **839**.

`RULE_BASELINE["design-diagrams.md"]` is still **5 673**, carrying its `// 2026-08-05 cut` comment. The baseline was correctly not moved across all seven commits — that half is clean and is verified in the review — but the entry is now **839 bytes above what the file actually weighs**.

`design-diagrams.md` is role-specific, so it feeds the growth **report**, not the hard bound. The report measures a role's extras as emitted minus floor. For the four diagram roles that extras set is this one file, so the report now reads `-839` and will keep reading negative until the file grows 839 bytes just to get back to zero. `GROWTH_BUDGET` is 12 000, so the report on those four roles will not fire until the file reaches 17 673 bytes instead of 16 834.

## The comment addresses a different question

The `ROLES` entry was deliberately edited in `a17cc8c` to explain why it did not move:

> Until 2026-08-15 the role also held the evaluator that judged their output; removing it left the role's file set unchanged, which is why this entry did not move.

That is true and it is not the point. A role's floor moves when its **file set** changes, and the file set did not change — four producers still load one file. What changed is the **size of the file in the set**, which is the other input to the same subtraction, and the comment does not mention it. A reader who meets the entry later reads a justification, checks the thing it names, finds it sound, and never learns that the number beside it is 839 high.

## Why this is filed rather than fixed in place

**It is not obvious that the doctrine permits the correction, and that is the actual finding.** `## Re-baselining` names exactly two events at which the baseline may move:

1. **After a cleanup** — "somebody has done the cut the report asked for". The report had *not* asked for a cut here; `design-diagrams.md` was comfortably inside budget, and the 839 bytes left as a side effect of deleting an agent, not as a response to the measurement.
2. **At an arming** — happened once, on 2026-08-14, for the universal core.

An incidental shrink is neither. So the doctrine's literal reading is that the entry stays where it is, which is what the executor did, and the effect of that reading is a permanent 839-byte discount that nothing records. The doctrine's own stated purpose is to prevent a **silent raise** of head-room; an unrecorded shrink below the baseline is a silent raise of head-room arriving by the other door.

The same question is live for the universal core, in the opposite direction and at a scale that is currently harmless: `agent-setup.md` is 14 below its baseline, `critical-stance.md` 17 below, `user-facing-output.md` 4 above, `fusion-workbench-conventions.md` 409 above. Core emitted 86 955 against a floor of 86 573 — delta +382 against a 12 000 budget, so nothing is at risk. It is the doctrine that has a gap, not this Turn's arithmetic.

## Evidence

- `wc -c rules/design-diagrams.md` → 4 834; at `5d29b6d` → 5 673.
- `RULE_BASELINE["design-diagrams.md"]: 5_673, // 2026-08-05 cut` — byte-identical across all seven commits of the range (block sha `fd3d875dabe8` at every one).
- `git diff 5d29b6d..518926d -- rules/design-diagrams.md` — four hunks, all `conceptrev` removal.
- Golden at HEAD: `analyst`, `planner`, `taskplanner` totals 91 789; `shaper` 103 439 — each consistent with `design-diagrams.md 4834`, independently re-derived by running `bin/fusion-rules` per agent and summing `wc -c`.

## Fix direction

This is a doctrine question before it is an edit, and it should not be settled by whoever next touches the file.

The question: **does an incidental shrink — a file getting smaller because something was deleted, rather than because the report asked for a cut — re-baseline?** Two defensible answers. Re-cut the entry to 4 834 with a comment naming the removal that produced it, which keeps the report honest and costs a line; or leave every entry frozen between the two named events and accept that a baseline drifts above reality after any removal, which keeps the doctrine simple and makes the report progressively less sensitive with every deletion the project makes. This Circle is a removal Circle and has produced at least one instance already, so the second answer has a visible price.

Whichever is chosen, `ROLES`'s `design-diagrams.md` comment should say that the file *shrank* and that the entry was or was not re-cut for it — the file-set argument standing alone reads as a complete justification when it has answered only half the question.


---

**Reconciliation 260819-1453 (reconciler, Domain `code`, Circle-store pass) — STAYS `_o_`. Re-measured at HEAD `e435f03` (v10.3.0). Unchanged in both halves.**

`wc -c rules/design-diagrams.md` → **4 834**. `hooks/lib/__tests__/rules-emission-golden.test.ts:473` still carries `"design-diagrams.md": 5_673, // 2026-08-05 cut`, and `:292` restates the 5 673 in prose. That is 839 bytes of unearned head-room on the four roles that draw the file.

The doctrine question is still unrecorded: `hooks/lib/__tests__/helpers/growth-bound.ts` names exactly two moments at which a baseline moves — after a cleanup, and at a one-time arming — and an *incidental* shrink is neither. No decision record in any store asks whether one should re-baseline. Until it does, a shrink silently buys future growth, which is the one direction the bounds were built to price.

---
Resolved: referred (decision) — whether an incidental shrink re-baselines is the decision's question; shared/decisions/260822-1154_*_does-a-cut-only-circle-re-baseline-the-surfaces-it-cuts.md
