Orchestrator `prior` parts name no `host.dispatch.v1`, so plan step 15 alone cannot pass `checkEntries`
---
The span map gives the orchestrator entry `requires` = `host.exec.v1`, `host.dispatch.v1`. Its `prior` parts spell only `host.exec.v1` and call the dispatch service "the host's agent-dispatch tool". Plan step 15 changes only `catalog/catalog.json`, so after it `checkEntries` compares exec+dispatch against exec and refuses the entry. The hand-off lives only in commit message `98a6c2ed`. Severity: Medium.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Domain:** code
**Executor:** code-implementer
**Cross-references:** 261025-1117-reviewer-closing-review-of-prior-handover-b-agent-profiles.md; 261024-2111-agent-span-map-for-entry-profiles.md (`### 5. The requires set per entry`); 261023-1854-plan-prior-full-surface-handover-h1-to-h9.md (step 15)

## Defect

- `catalog/src/render.ts` `servicesNamed` (`ENTRY_SERVICES.filter((s) => text.includes(s))`) and `checkEntries` require, for an entry `supported` on Prior, that the services its `prior` parts spell equal its `requires`.
- Measured over all `prior` parts of the eleven agent profiles (reviewer's script `rv_services.py`, same substring rule): orchestrator names `host.exec.v1` only. `07-prior.md` says "call the host's agent-dispatch tool"; `17-prior.md` says "Invoke agents through the host's agent-dispatch tool".
- `catalog/catalog.json` orchestrator entry: `requires` = `host.question.v1`, `host.exec.v1` (unchanged in this range). Span map Finding 5: exec + dispatch.
- Plan step 15: Executor data-implementer, Files `catalog/catalog.json` only, Acceptance includes "step 1's invariant that a supported entry's `requires` equals its `prior` parts' service names".

So step 15 as planned leaves the orchestrator entry red. Commit `98a6c2ed` states the gap ("the prior parts name only host.exec.v1 … until step 15 fixes requires"), but no record or package F narrative carries it.

The policy-curator entry is the other known mismatch and needs no part change: its parts name `host.exec.v1`, which is the span map's value, so step 15's `requires` change alone closes it. Every other agent entry already matches (`analyst`, `code-implementer`, `consultant`, `data-implementer`, `document-editor`, `implementation-planner`, `requirements-designer`, `reviewer`, `state-auditor`).

## Fix direction

Spell `host.dispatch.v1` in `orchestrator/parts/07-prior.md` (the binding sentence) and `17-prior.md` now, in package B. `checkEntries` skips the entry while it is `prior: unsupported`, so no test turns red before step 15, and step 15 stays a `catalog.json`-only change.

## Acceptance

- `grep -l 'host.dispatch.v1' catalog/profiles/orchestrator/parts/*-prior.md` names at least `07-prior.md`.
- A scratch copy of `catalog/catalog.json` with the orchestrator entry at `prior: supported` and `requires` `host.exec.v1`, `host.dispatch.v1` passes `checkEntries`.
- `cd catalog && npm test` exits 0; the Claude render diff is empty.
