Two skill texts still say no command converts a legacy workbench, and that a package is edited by hand
---
On `fj03d` at `5bffedff`, two sentences in shipped skill bodies contradict the JSON control rules that steps 3 to 7 put in place. Found while writing step 9's upgrade document; skills are step 7's files, so step 9 did not edit them.
---
**Filed by:** code-implementer, Kai Stalmann <ks@qantr.com>
**Cross-references:** 261004-2212_*_plan-fj03d-rules-prompts-and-live-predicates-switched-with-this-workbench-in-one-window.md

Evidence:

- `skills/setup/SKILL.md`, the `result=legacy` bullet after the `initialize` block: "Its control data stays Markdown, which no command converts yet." `/fusion:migrate` Step 7 converts it (`skills/migrate/SKILL.md` `## Step 7 — Repair, then migrate to JSON control`), and every agent stops at Setup until it has.
- `skills/wp/SKILL.md` `## Guardrails` (line 78): "the user can edit one by hand". `rules/fusion-workbench-conventions.md` `## Work packages` says `package.json` "is written by `bin/fusion-write` alone, never by hand".

Acceptance: the setup bullet names `/fusion:migrate` as the conversion; the wp guardrail names no hand edit of a package's state. `reference-resolution-lint` and the `skills/` growth bound green. Executor: `code-implementer`.

---
Resolved: fj03d `29dac3c5` — `skills/setup/SKILL.md` names /fusion:migrate as the conversion of Markdown control data, and the `skills/wp/SKILL.md` guardrail says a status moves only through `bin/fusion-write`. Verified 2026-10-05 by the orchestrator in the fj03d worktree with the suites as stated on 261005-0741.
