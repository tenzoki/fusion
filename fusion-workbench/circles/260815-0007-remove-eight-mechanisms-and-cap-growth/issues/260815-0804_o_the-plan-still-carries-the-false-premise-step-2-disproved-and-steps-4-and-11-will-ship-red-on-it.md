# The plan still carries the false premise step 2 disproved, and steps 4 and 11 will ship red on it

---

Step 2 discovered that `derivable-enumerations-lint.test.ts` **does** re-derive the `bin/` helper
roster from `CLAUDE.md`'s Layout table, contradicting what the plan states at step 4. The executing
coder recorded the correction in its history entry and acted on it. The plan itself was never
edited, so step 4 still instructs its executor to leave a deleted helper's Layout row in place, and
step 11 inherits the same trap by omission.

---

**Severity:** Medium — an executor following the plan as written lands a red commit, and the
orchestrator's Step 3b reverts the whole task on a red suite, so the cost is a discarded step rather
than a bad merge.
**Domain:** code
**Filed by:** `coderev`, reviewing `9a7da8e..7c12d6a` (`reviews/260815-0804-coderev-plane-mirror-removal.md`)
**Owner:** `coder`, or `planner` on a re-dispatch
**Affects:** `circles/260815-0007-remove-eight-mechanisms-and-cap-growth/planning/260815-0029_o_plan-remove-eight-mechanisms-and-cap-growth.md:195` (step 4) and `:277` (step 11's file list)
**Cross-references:** `circles/260815-0007-remove-eight-mechanisms-and-cap-growth/history/260815-0742-coder-remove-plane-mirror-code-and-prose.md` `## What the plan did not predict` item 1, which states the correction and explicitly says *"Step 4 inherits the correction"*

**Verified 2026-08-15 at HEAD `7c12d6a`.** `git log -- <plan path>` returns one commit, `348f6db`.
The plan has not been touched since it was written.

## The sentence, verbatim

`planning/260815-0029_o_plan-remove-eight-mechanisms-and-cap-growth.md:195`:

> `CLAUDE.md`, enumeration half only: the `bin/fusion-churn-rank` row leaves the Layout table because
> `derivable-enumerations-lint` does not read that table — but `README-hooks.md`'s `hooks/lib` file
> table **is** derived and asserted, so `lib/churn.ts` must leave it in this commit. **The
> `CLAUDE.md` Layout row waits for gate G1.**

## The gate that says otherwise

`hooks/lib/__tests__/derivable-enumerations-lint.test.ts:423-495`, section 8, headed *"the `bin/`
helper roster in `CLAUDE.md`'s Layout table"*. It is a closed enumeration in both directions:

```
problems.push(`bin/${f} exists but CLAUDE.md's Layout table has no row for it`);
…
problems.push(`CLAUDE.md's Layout table has a row for bin/${r} but that file does not exist`);
```

The second branch is the one step 4 walks into. Section 8 predates this Circle; it is not something
step 2 added.

## The roster is correct today, and that is the reason to fix the plan now

Counted at HEAD: `bin/` holds 14 regular files, and `CLAUDE.md`'s Layout table holds 14
`| \`bin/…\` |` rows, the same 14 names. Step 2 removed the `bin/fusion-plane` row in the removing
commit and the gate is satisfied. The defect is not in the tree — it is in the instruction the next
two steps will read.

## The two steps

**Step 4** deletes `bin/fusion-churn-rank` and is told in so many words to leave its Layout row for
G1. That is the second branch above, and the commit is red.

**Step 11** deletes `bin/fusion-state-drift`. Its file list at `:277` ends `…; \`README-hooks.md\`;
\`CLAUDE.md\` (enumeration half only)` but none of its Changes bullets mentions the Layout row, so
the omission produces the same red commit without the executor having been told anything false.
Worth naming separately: one step is misinformed and one is uninformed, and only the first is fixed
by correcting a sentence.

## What the fix has to establish

Correct `:195` to say that the `bin/fusion-churn-rank` Layout row is gate-forced and lands in step 4's
own commit, and add the matching bullet to step 11 for `bin/fusion-state-drift`. Check step 8 in the
same pass: it deletes `templates/investigator-capture-layout.md`, which the `templates/` Layout row
names — that row is **not** asserted by section 8, which reads `bin/` rows only, so it is genuinely
narrative and genuinely G1's. Saying which of the three is which is the whole content of the fix.
