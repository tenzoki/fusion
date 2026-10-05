Two roster rows in `README-hooks.md` describe the legacy reader and the second corpus copy that step 8 removed
---
FJ03d step 9 rewrote the checker rows of `README-hooks.md`. Two rows of the `hooks/lib` roster beside them still describe the state before step 8.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Cross-references:** 261004-2212_*_plan-fj03d-rules-prompts-and-live-predicates-switched-with-this-workbench-in-one-window.md

Severity: Low. Scope: `README-hooks.md` on `fj03d` at `cd1b5522`, the table under `## Files`.

**Evidence.**

1. The row `lib/record-index.ts`: "... or `legacy`, for the caller's own legacy reader; or `unknown` with its cause ...", and it ends "`notReadLine` and `bundleMissing` give a checker its stderr line". Since `3a11d9ea` no caller has a legacy reader: the three checkers refuse, and the module exports `legacyLine` for that, which the row does not name. The module's own header was corrected in the same commit ("The explicit checkers refuse it by name with `legacyLine`").
2. The row `lib/plan-size.ts`: "The corpus definition is a deliberate second copy of the one in `lib/__tests__/plan-stopping-section-lint.test.ts`, that one being test-scoped and this one shipping; the header owns the residual". The header no longer does: since `3a11d9ea` it reads "`hooks/lib/__tests__/plan-stopping-section-lint.test.ts` takes its corpus from this function ..., so the lint and the shipped helper read one definition of a live plan", and the lint imports `measurePlanSizes`.

Also seen, older than the range and in the same tables, so one edit can take them: the row `bin/fusion-record` says "`migration` deferred and answered `operation-unknown/not-implemented`" where that script's header says "`migration` answers all five phases"; and the role table of `README-agents.md` still gives "history log" as an output of four agents and has the state-auditor append to "the orchestrator's session-history file", where `rules/fusion-workbench-conventions.md` `## Session history` closes that store to writes.

**Acceptance.** Both rows say what the module does at the head: the first names the refusal and `legacyLine`, the second says the lint reads this module's corpus. The two older statements are corrected or left by an explicit note in the closing line of this record. `reference-resolution-lint` and `derivable-enumerations-lint` are green.

Executor: `code-implementer`.

---
Resolved: fj03d `eb5573fd` — the `lib/record-index.ts` and `lib/plan-size.ts` rows of `README-hooks.md` say what the modules do at the head; the two older stale statements (the `bin/fusion-record` row, the role table of `README-agents.md`) are corrected too. Verified 2026-10-05 by the orchestrator in the fj03d worktree at `85ea803b`: hooks 1 134 of 1 139, the reds being the four legacy own-tree cases and the known monitor case; no file under `codec/` changed, bundle `c76bbce9…`.
