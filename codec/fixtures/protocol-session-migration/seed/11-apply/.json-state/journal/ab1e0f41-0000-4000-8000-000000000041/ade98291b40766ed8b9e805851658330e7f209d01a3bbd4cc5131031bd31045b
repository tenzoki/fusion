# Which tokens end a recovery: the statement terminators alone, or every follow-set token?

---
**Domain:** code
**Filed by:** implementation-planner, Fixture Person <fixture@example.invalid>
**Cross-references:** 260902-1000-parser-error-recovery.md, 260902-1030_*_spec-parser-error-recovery.md

---

## Question

Recovery must resume somewhere. Resuming only at statement terminators skips too much inside expressions; resuming at every follow-set token risks phantom errors.

## Options

1. **Statement terminators only** — `;` and `}`.
   - Pros: simple, no phantom errors.
   - Cons: an error early in a long expression hides the rest of the statement.
2. **The generated follow sets** — every token that may follow the failing rule.
   - Pros: resumes as early as the grammar allows.
   - Cons: needs the phantom-error suppression the spec requires anyway.

## Recommendation

Option 2.

---
Answered: 260902-1100_*_plan-parser-error-recovery.md — option 2, the generated follow sets, built as step 1; ruled by user, Fixture Person <fixture@example.invalid>
