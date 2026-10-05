The legacy refusal is spelled in three places, and two of them do not name the migration the upgrade document says they point at
---
FJ03d step 8 gave the three explicit checkers one sentence, `legacyLine` in `hooks/lib/record-index.ts`, which ends "run /fusion:migrate". The scope and order entries keep their own copies of that sentence, which end "migrated to JSON" and name no command. `docs/upgrading-to-v13.md` says `bin/fusion-work-order` points at `/fusion:migrate` like the checkers. It does not.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Cross-references:** 261004-2212_*_plan-fj03d-rules-prompts-and-live-predicates-switched-with-this-workbench-in-one-window.md

Severity: Low. Scope: `hooks/scope.ts`, `hooks/order.ts` (neither changed in the range), `hooks/lib/record-index.ts`, `docs/upgrading-to-v13.md` (`## What a legacy workbench meets`), on `fj03d` at `cd1b5522`.

**Evidence.**

- `hooks/lib/record-index.ts`, `legacyLine`: "... which this version reads only once it has been migrated: run /fusion:migrate."
- `hooks/scope.ts`, the `legacy` case of its stderr line: "... which this version reads only once it has been migrated to JSON, so the item in scope is unknown."
- `hooks/order.ts`, the `legacy` case: "... which this version reads only once it has been migrated to JSON."
- `docs/upgrading-to-v13.md` `## What a legacy workbench meets`: "`/fusion:wp`, `/fusion:discuss` and `/fusion:archive` refuse it by name, and so do `bin/fusion-citation-check`, `bin/fusion-plan-size` and `bin/fusion-work-order`, each pointing at `/fusion:migrate`."
- Run on a scratch workbench built from `git archive cd1b5522`, its manifest removed: `bin/fusion-citation-check` and `bin/fusion-plan-size` exit 4 and end "run /fusion:migrate. Nothing was ..."; `bin/fusion-work-order` exits 4 and ends "migrated to JSON. No order was ..."; `bin/fusion-paths reviewer` exits 3 through `bin/fusion-claimed-package` with the scope sentence. Neither of the last two names the command.

The agent path is covered by rule text (`rules/agent-setup.md` tells the agent to name `/fusion:migrate`). A person who runs `bin/fusion-work-order` or `bin/fusion-paths` by hand reads a refusal with no way out in it.

**Acceptance.** `hooks/scope.ts` and `hooks/order.ts` take the sentence from `legacyLine` (each keeping its own tail), or `docs/upgrading-to-v13.md` stops claiming the pointer for `bin/fusion-work-order`. If the code changes: the legacy cases of the scope and order tests match "run /fusion:migrate", `committed-dist.test.ts` is green, and no byte under `codec/dist/` moves.

Executor: `code-implementer`.

---
Resolved: fj03d `c3ccb43a` — `hooks/scope.ts` and `hooks/order.ts` take `legacyLine` from `hooks/lib/record-index.ts`, so every refusal names /fusion:migrate; three existing cases were red before and are green. Verified 2026-10-05 by the orchestrator in the fj03d worktree at `85ea803b`: hooks 1 134 of 1 139, the reds being the four legacy own-tree cases and the known monitor case; no file under `codec/` changed, bundle `c76bbce9…`.
