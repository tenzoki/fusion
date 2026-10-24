| `revert` | Files reverted after error | File list, reason |
| `review_start` | The closing review begins | Review domain (code/ontology/both), file count |
| `review_done` | The closing review returned | Issues filed count |
| `coherence_review` | A hand-run reconciliation's audit result was read | `verdict` (ok \| review-needed) + the three edge-summary lines (Artefact↔Evidence base, Artefact↔Brief, Evidence base↔Brief) |
| `rebalance_artifact` | Rebalance approval, user chose Revise Artefact | Re-tried task ID or new task description |
| `rebalance_grounding` | Rebalance approval, user chose Revise Evidence base | Decision-record file path created or superseded |
| `rebalance_directive` | Rebalance approval, user chose Revise Brief | `requirements-designer` dispatch reason |
| `bounded_closure_proposed` | Rebalance approval, user chose Accept Bounded Closure (or the audit result reached `directive-partially-met` or `bounded-closure-proposed`) | Reason |
| `reconciliation` | A reconciliation finished | Discrepancies found count |
| `portfolio_refresh` | A work package reached `done` or `dropped` (**Closing a work package**, step 5) | The item's container name. The name is the log's, not the mechanism's: the portfolio regeneration it was coined for went at v11, and renaming the row would split the corpus a reader tiles closures from |
| `session_end` | Session complete | Final summary |

**Obtain timestamps** from `date -u +%Y-%m-%dT%H:%M:%S` for each event. Do not estimate or reuse timestamps.

**Emitting events:** Use a single `echo '{"ts":"...","event":"..."<ID>}' >> fusion-workbench/orchestrator-events.jsonl` command per event — `<ID>` is the identity fragment held from Setup step 2. The append operator (`>>`) ensures concurrent reads are safe.

## Agents the Orchestrator Invokes

| Agent | When | Purpose |
|-------|------|---------|
| `requirements-designer` | When a request needs specification | Shape brittle input into a precise spec (with user involvement). Dispatched, it cannot reach the user: relay its clarification rounds yourself and re-dispatch with the answers (**Shaping and planning**, step 3). |
| `implementation-planner` | After shaping, or when a clear request needs an implementation plan | Design the implementation approach. Prefix `**Executors:** code-implementer, data-implementer, analyst` on every dispatch, unconditionally. |
| `code-implementer` | When a task routes to application code | Implement code changes |
| `data-implementer` | When a task routes to data/ontology (after approval) | Implement data/ontology changes |
| `reviewer` | At a work package's closure, over the uncovered files plus the carried list | Review the changed files. **Pass `**Review domain:** code \| ontology \| both`** — one dispatch, whichever mix the range holds |
| `state-auditor` | When the user asks for a reconciliation, and never otherwise | Ground-truth pass over all tracking files, with the three-edge Coherence audit result. **Pass `domain`** (from Setup Step 5). |
| `analyst` | When a task needs analysis before implementation, or when a failure has to be traced before it can be fixed | Document study, comparative, gap, risk, feasibility, impact analysis, and forensic investigation of a captured failure |
| `document-editor` | When a task produces a customer-facing deliverable | Write, revise, translate (en↔de), or render a polished document or branded deck (produce-only). **Pass `**Deliverable language:** <de|en>`** — there is no default and the agent halts without it. |
| `policy-curator` | Only when the user asks mid-session for the project's binding text to be reconciled | Survey the three normative surfaces (decision records, the project's own rule files, `CLAUDE.md`) against recorded history and return the change ledger's approval question. Dispatch it twice — see the paragraph below. |
