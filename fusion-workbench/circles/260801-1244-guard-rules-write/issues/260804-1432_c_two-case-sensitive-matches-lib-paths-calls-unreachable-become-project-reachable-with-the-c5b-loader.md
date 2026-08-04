# `lib/paths.ts` says two case-sensitive matches are unreachable "until the per-project loader lands". Step 6 landed it

---

**Severity:** Low
**Domain:** code (security control, documentation of one)
**Filed by:** coder, implementing plan Step 6 (the C5b loader)
**Affects:** `hooks/lib/paths.ts` `matchesAny` docstring (the "unreachable at HEAD" paragraph); `hooks/lib/config.ts` `findRelevantDecisions`; `hooks/tracker.ts` noise filtering
**Kind:** Documentation falsified by this step, plus the decision the docstring itself asked for. Not a regression in behaviour — nothing about `matchesAny` changed.
**Cross-references:**
`circles/260801-1244-guard-rules-write/decisions/260803-1419_i_how-should-the-protected-path-check-treat-the-case-of-a-path.md` (where the protection side's fold was decided, deliberately leaving these two alone),
`hooks/lib/paths.ts` `matchesAnyFolded` (the argument the protection side runs on).

---

## What is wrong

`matchesAny`'s docstring names three callers and answers the case question for one of them. For the other two it says, verbatim:

> Unreachable at HEAD rather than fixed: the shipped `config.json` has `categoryPaths: {}` and **no per-project config loader exists yet**, so no consuming project can populate it. When that loader lands, this is a decision to take rather than a line to copy.

Step 6 is that loader. A consuming project's `fusion-guard.json` can now declare `guard.categoryPaths` and `decisions`, both of which `findRelevantDecisions` matches with the case-**sensitive** `matchesAny`. So the escape the paragraph describes — a differently-cased path slipping past a decision-governed escalation the way it used to slip past protection — is reachable by any project that configures a category, and the sentence stating it is not is now false.

The tracker's noise filter (`TRACKER_NOISE_FILES`) is a hardcoded constant and is untouched by this; it stays exactly as unreachable as it was.

## Why this is small

It is CHECK 3, not CHECK 2. The failure mode is a decision-governed *advisory or escalation* that does not fire, not a protected path that becomes writable — `guard.protectedPaths` is matched by `matchesAnyFolded` and is unaffected. And it needs a project to have populated `categoryPaths` at all, which nothing yet documents how to do.

It is filed because the docstring makes a reachability claim that a reader will trust, and this Circle has now twice shipped a document that contradicts the code beside it.

## Two things owed, and they are separable

1. **The sentence.** Whatever is decided, "no per-project config loader exists yet" has to go. One edit, in `hooks/lib/paths.ts`.
2. **The decision the docstring asked for.** Whether `findRelevantDecisions` should fold case. The docstring already sketches the argument against copying the protection side's answer — "the two sides of a `categoryPaths` match are both authored by the same project, which is not the situation `protectedPaths` is in" — and that argument is still the right starting point. Folding here widens an escalation, not a permission, so the direction is safe; the question is whether it is worth the divergence from what the project literally wrote.

Step 6 deliberately did neither, because `hooks/lib/paths.ts` is outside its scope and because item 2 is a decision rather than a line.
