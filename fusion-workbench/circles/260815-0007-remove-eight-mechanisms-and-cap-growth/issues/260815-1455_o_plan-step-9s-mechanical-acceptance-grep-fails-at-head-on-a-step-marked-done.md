# Plan step 9's acceptance criterion calls itself mechanical, and run verbatim it fails at HEAD on a step marked `[DONE]`

---
**Severity:** Medium — the plan's own pass/fail check disagrees with the plan's own state marker, so the next reader either re-opens a correctly finished step or learns to disregard the acceptance lines
**Domain:** code
**Filed by:** ontorev (Turn 3 review, range `5d29b6d..518926d`)
**Affects:** `circles/260815-0007-remove-eight-mechanisms-and-cap-growth/planning/260815-0029_*_plan-remove-eight-mechanisms-and-cap-growth.md` step 9, last Changes bullet
**Cross-references:**
`circles/260815-0007-remove-eight-mechanisms-and-cap-growth/issues/260815-1247_o_the-churn-leaves-were-removed-without-a-retirement-entry-and-the-retirement-table-could-not-have-held-one.md` (same class: a removal that deliberately leaves a named residue, with no place recording that it did);
`circles/260815-0007-remove-eight-mechanisms-and-cap-growth/history/260815-1440-coder-step9-domain-values.md`;
`hooks/lib/domain-cascade.ts:84-123`

---

## What is wrong

Step 9's last Changes bullet states its acceptance and states that it is mechanical:

> Acceptance, and it is mechanical: `grep -rn 'strategic\|knowledge' agents skills rules bin hooks docs README*.md .claude-plugin` returns nothing but ordinary English usage of the words.

Run verbatim at HEAD `518926d`, with `node_modules` and ordinary English usage filtered out, it returns **ten hits across three files** — none of them ordinary English usage, and all of them deliberate:

```
hooks/lib/domain-cascade.ts:88     // `strategic` and `knowledge` were decided from the workbench's own artifact
hooks/lib/domain-cascade.ts:91     // `strategic` was never passed once and `knowledge` was passed twice.
hooks/lib/domain-cascade.ts:110    export const RETIRED_DOMAINS = ["strategic", "knowledge"] as const;
hooks/lib/__tests__/domain-cascade.test.ts:323,324,326,604
hooks/lib/__tests__/domain-cascade-order-lint.test.ts:161,162,164
```

The step is marked `[DONE]` at `:268`.

## Why this is a record and not a nitpick

**The residue is correct and the reasoning for it is good.** `hooks/lib/domain-cascade.ts:94-105` explains it in full: `RETIRED_DOMAINS` makes `parseCascade` refuse a re-added branch with a message saying the value was *retired* rather than the generic "not a domain", so re-adding one fails as a decision rather than as a typo; `RETIRED_COUNT_NAMES` keeps the four dead inputs recognisable to `inputsNamedIn` precisely so that the likeliest second copy anyone meets from here on — a stale restatement of the four-outcome cascade — stays visible to the reach gate. The two test files carry those stale copies as fixtures. Deleting any of it would weaken the removal, not complete it.

So the defect is not the residue. **The defect is that the acceptance line was not amended when the executor decided to keep it.** The plan step now asserts a check that its own implementation deliberately fails, and asserts it in the one register — "and it is mechanical" — that invites a later reader to run it and act on the result.

The two ways this costs something are both live. A resumed session verifying finished work runs the grep, gets ten hits on a `[DONE]` step, and either re-opens it or spends the time proving it should not. And step 10's file list names `hooks/lib/domain-cascade.ts` again (`REACH` adjustment), so the next executor to touch that module meets the same contradiction from the other side.

## Evidence

- Acceptance line: plan `:268`ff, step 9, last Changes bullet.
- Step marker: plan `:268`, `9. [DONE]`.
- Residue and its justification: `hooks/lib/domain-cascade.ts:84-123`, `:321-325`, `:451-455`.
- The step's history entry (`history/260815-1440-coder-step9-domain-values.md`) records the cascade as "rewritten rather than deleted", which is the same decision, but the plan's acceptance line is a separate surface and was not touched.
- Verified: `agents/orchestrator.md` names neither string in the domain sense (only `strategic-deliverable` at `:485`), so the *decision record's* own constraint — "No option may leave `agents/orchestrator.md` naming `strategic` or `knowledge`" — is met. It is only the plan's wider grep that fails.

## Fix direction

Amend step 9's acceptance bullet to state the criterion that was actually applied, rather than relaxing it to nothing. Something with the shape: the grep returns ordinary English usage **plus** the retirement controls in `hooks/lib/domain-cascade.ts` and the stale-cascade fixtures in its two test files, each of which is required by the reach gate and named here so a future hit outside those three files is still a failure. That keeps the check mechanical and keeps it able to fail.

Not for the executor to decide alone: whether the same treatment is owed to the churn removal is the open question in `260815-1247_o_the-churn-leaves-were-removed-without-a-retirement-entry…`. If a retirement table is going to exist, these three files are its second entry and the acceptance line should cite it instead of enumerating.


---

**Reconciliation 260819-1453 (reconciler, Domain `code`, Circle-store pass) — STAYS `_o_`. Re-measured at HEAD `e435f03` (v10.3.0). Unchanged, and the residue is larger than the record measured.**

`grep -rn 'strategic\|knowledge' agents skills rules bin hooks docs README*.md .claude-plugin` (excluding `node_modules` and `dist`) returns **41 lines** at HEAD, including `hooks/lib/domain-cascade.ts`, `domain-cascade.test.ts` and `domain-cascade-order-lint.test.ts`. Step 9 (`planning/260815-0029_c_…:268`) still carries `[DONE]` beside an acceptance bullet that calls itself mechanical and fails when run.

The residue is deliberate — a retired domain value has to stay nameable for the cascade to reject it — so the defect is in the acceptance criterion, not in the code. A criterion that cannot pass on a correctly completed step is worse than none, because the next reader either re-opens a finished step or learns to disregard the criteria.
