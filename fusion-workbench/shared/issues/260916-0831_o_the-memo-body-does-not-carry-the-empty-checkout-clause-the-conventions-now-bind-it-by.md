The memo body does not carry the empty-checkout clause the conventions now bind it by

---
`rules/fusion-workbench-conventions.md` `## Filename Patterns` now states that every one of the four personal logs is keyed or not written. `/fusion:cadence` carries that as an explicit halt in its own step 1. `skills/memo/SKILL.md` writes two of those four files and carries no such clause.

---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>

**Evidence.** The rule was corrected on 260916 when the unsuffixed-log fallback was removed with `/fusion:log-activity`. The correction closed `260916-0732_*_the-empty-checkout-case-lost-its-defined-behaviour-when-the-unsuffixed-log-name-went.md` for cadence, whose step 1 now halts rather than writing `activity-log-.md` or `cadence-.md`. `bin/fusion-identity` exits 3 and 5 without printing a `CHECKOUT=` line, which is the case the clause exists for, and the memo body reaches the same helper.

**What the gap costs.** `memos-.md` or `tasks-.md`, written once and never found again by a run that resolves its own checkout. The rule binds the body; the body does not say so, and a rule nobody restates at the write site is the shape this project has measured being skipped.

**Acceptance test.** `skills/memo/SKILL.md` names the unresolved-checkout case at the point it composes a filename, and its answer is the one the conventions give rather than a second one.
