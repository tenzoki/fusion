# Should `findRelevantDecisions` fold case, now that a project can configure `categoryPaths`?

---
**Domain:** code
**Status:** open
**Filed by:** planner, planning the C5b remediation
**Cross-references:**
`circles/260801-1244-guard-rules-write/issues/260804-1432_o_two-case-sensitive-matches-lib-paths-calls-unreachable-become-project-reachable-with-the-c5b-loader.md` (item 2, the half this record carries so the issue can close on item 1),
`circles/260801-1244-guard-rules-write/decisions/260803-1419_i_how-should-the-protected-path-check-treat-the-case-of-a-path.md` (where the protection side chose unconditional folding, deliberately leaving these two callers alone),
`hooks/lib/paths.ts` `matchesAny` (case-sensitive) and `matchesAnyFolded` (the protection side)

---

## Question

`matchesAny`'s docstring declined to answer the case question for `findRelevantDecisions` on
the grounds that the state was unreachable: `hooks/config.json` ships `categoryPaths: {}` and
no per-project loader existed. Plan Step 6 is that loader. A project's `fusion-guard.json` can
now declare `guard.categoryPaths` and `decisions`, both matched case-sensitively, so a
differently-cased path escapes a decision-governed escalation.

The remediation plan corrects the docstring's reachability sentence, which is a false claim on
disk. It does not answer this, because folding here is a behaviour choice rather than a line.

## Options

1. **Leave `findRelevantDecisions` case-sensitive.** Both sides of a `categoryPaths` match are
   authored by the same project, which is not the situation `protectedPaths` is in, so the
   asymmetry the protection side was fixing does not arise the same way.
   - Pros: the guard does what the project literally wrote. No divergence to explain.
   - Cons: on a case-insensitive filesystem a project's own category silently misses a file it
     was written for, and the miss is invisible.
2. **Fold, matching the protection side.**
   - Pros: one rule for path matching everywhere. Folding widens an escalation rather than a
     permission, so the direction is safe.
   - Cons: a project that deliberately distinguishes two spellings gets both governed by one
     decision, which it did not ask for.

## Constraints

- This is CHECK 3, not CHECK 2. The failure mode is an advisory or escalation that does not
  fire, never a protected path that becomes writable — `guard.protectedPaths` is matched by
  `matchesAnyFolded` and is unaffected either way.
- `TRACKER_NOISE_FILES` is a hardcoded constant and stays as unreachable as it was. It is not
  part of this question.

## Recommendation

Deferred deliberately by the remediation plan: it does not gate the ship, and answering it
inside a Circle already carrying five security-boundary questions would be the fourth thing
competing for the same attention. Whichever way it goes, the docstring's reachability sentence
has to be corrected now, and that is done in the plan's Step 2.

---
Answered:
Implemented:
Deferred:
Superseded by:
