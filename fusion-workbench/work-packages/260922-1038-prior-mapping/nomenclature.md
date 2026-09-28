# PRIOR/Fusion nomenclature

## Purpose and authority

This document collects the names defined by the current concept and maps legacy Fusion vocabulary and folders to the PRIOR/Fusion vocabulary. It is a naming index, not a third normative specification. [Product](product.md) remains authoritative for product and Fusion terminology, [Architecture](architecture.md) for runtime contracts and states, and [Implementation plan](implementation-plan.md) for the intended source tree.

Use concise British English in prose and clear lower-case English for machine names. Use kebab-case for multi-word identifiers and directories unless an external compatibility surface fixes another spelling. Keep `Prior` as the product name in prose and `prior` in commands, paths, and identifiers. Keep `Fusion` as the module name in prose and `fusion` in paths and namespaces.

## Ownership boundary

| Namespace | Owns | Does not own |
|---|---|---|
| **Prior** | Technical execution: sessions, runs, backends, tools, permissions, isolation, approvals, persistence, recovery, communication, budgets, workspaces, runtime events, and artefacts | Fusion role names, work method, campaign meaning, or work-package state semantics |
| **Fusion** | Work method: campaigns, candidates, work packages and items, briefs, evidence, plans, queues, reviews, realignment, integration rules, audit rules, and workbench records | A second process manager, message bus, permission system, authority store, or runtime database |

Fusion passes versioned, namespaced module references and generic execution constraints to Prior. Prior validates their envelope, ownership, authority, and resource use without interpreting the referenced Fusion state.

## Prior terms

| Canonical term | Machine-name guidance | Meaning |
|---|---|---|
| **Runtime** | `runtime` | The executable Prior core |
| **Session** | `session`, `session_id` | A persistent user interaction and its history |
| **Run** | `run`, `run_id` | One execution of an agent profile |
| **Model turn** | `model-turn` where a stored name is needed | One backend response, including its stream |
| **Checkpoint** | `checkpoint` | A durable run boundary with no active model request or unresolved tool outcome |
| **Agent profile** | `profile`, stable kebab-case profile identifier | Instructions, required capabilities, tools, and delegation rights |
| **Tool** | `tool`, `tool_call`, `tool_result` | A model-callable operation and its canonical protocol records |
| **Workflow** | `workflow` | Reusable instructions with a named entry point |
| **Event handler** | `event-handler` | Code reacting to a typed runtime event |
| **Module** | `module`; `fusion` for the Fusion module | An installable extension such as Fusion |
| **Model backend** | `backend`, `backend_id`, `backend_epoch` | A configured route to model capability |
| **Artefact** | `artefact`, `artefact_ref` | Immutable or version-pinned output referenced by identity |
| **Workspace** | `workspace` | The filesystem view assigned to a run |
| **Integration workspace** | `integration-workspace` | Coordinator-owned workspace where reviewed changes are combined and validated |
| **Intent** | `intent` | Durable record written before a cross-store side effect |
| **Approval** | `approval`, `request_id` | Explicit authority for an action, obtained through the user interaction broker |
| **Lease** | `lease` | Time-bounded ownership of a resource, protected by generation checks |
| **Budget account** | `budget-account` | Persistent resource limit and reservation owner |

Avoid `engine`, `plugin`, `skill`, and `provider` when `runtime`, `module`, `workflow`, `agent profile`, or `model backend` says precisely what is meant. External compatibility surfaces may retain their official terms.

### Backend and execution names

| Dimension | Canonical values |
|---|---|
| Backend category | `model-api`, `managed-agent-client`, `open-weight-inference` |
| Control level | `model-only`, `agent-mediated`, `agent-observed` |
| Execution mode | `mediated-local`, `container-isolated` |
| Tool result | `success`, `error`, `denied`, `cancelled`, `unknown` |
| Canonical content block | `text`, `image`, `tool_call`, `tool_result`, `artefact_ref`, `agent_message`, `context_summary`, `backend_extension` |

`unknown` means that an effect cannot yet be established. It is not another spelling of failure or absence.

## Fusion terms

| Canonical term | Canonical machine name | Meaning |
|---|---|---|
| **Campaign** | `campaign`, `campaign-state` | A persistent autonomous objective carried out through one or more work packages |
| **Campaign charter** | `campaign-charter` | Objective, authority, selection rules, limits, and completion conditions for a campaign |
| **Candidate** | `candidate` | A discovered defect, feature, or possible item tracked through selection, admission, and disposition |
| **Candidate register** | `candidate-register` | Versioned collection of candidates, evidence, scores, dispositions, and links |
| **Work package** | `work-package`; directory `work-packages/` | A bounded unit of work with a brief and completion state |
| **Work-package record** | `work-package-record`, `work-package-state` | The durable record of a work package |
| **Work item** | `work-item` | One admitted defect, feature, or implementation step in a work package |
| **Brief** | `brief` | What the work package must achieve |
| **Evidence base** | `evidence-base` | Assumptions, decisions, and verified starting facts |
| **Work round** | `work-round` | A batch of execution followed by a coherence check |
| **Work queue** | `work-queue` | Ordered outstanding work |
| **Realignment** | `realignment` | A recorded decision after coherence breaks |
| **Plan** | `plan` | Versioned technical approach; autonomous agreement binds to its exact revision |
| **Review** | `review` | Independent assessment of a plan, change, data set, or result |
| **Agreement** | `agreement` | Explicit acceptance by every required participant of the current plan and input revisions, with no unresolved material objection |
| **Disposition** | `disposition` | Recorded candidate or item outcome such as selection, deferral, rejection, or merge |
| **Workbench** | `fusion-workbench/` | Shared, durable Fusion project records and evidence |
| **Overview** | `overview` | Generated view of active and prospective work |

### Stable Fusion profile identifiers

| Identifier | Responsibility |
|---|---|
| `orchestrator` | Owns work-package execution, delegation, gates, and completion |
| `consultant` | Gives user-invoked strategic advice |
| `explorer` | Answers one bounded repository question with read-only tools |
| `analyst` | Produces evidence-based investigation and option analysis |
| `requirements-designer` | Turns an unclear request into an agreed brief |
| `implementation-planner` | Designs the technical approach |
| `plan-reviewer` | Challenges implementation plans independently and records material objections |
| `work-planner` | Builds a dependency-ordered work queue |
| `code-implementer` | Changes application code and build configuration |
| `data-implementer` | Changes structured data, schemas, and ontologies |
| `defect-fixer` | Diagnoses and repairs one specific defect |
| `code-reviewer` | Reviews code without changing it |
| `data-reviewer` | Reviews structured data and ontologies without changing them |
| `state-auditor` | Audits runtime records, the workbench, and Git without changing them |
| `work-package-manager` | Qualifies candidates, forms work packages, and maintains the campaign overview |
| `document-editor` | Produces polished documents and translations |
| `policy-curator` | Aligns decisions, project rules, and persistent guidance |

## Folder and file names

### Concept and implementation tree

These names are specified by the current concept. Most implementation directories are targets from the implementation plan and need not exist yet.

| Path | Owner | Content |
|---|---|---|
| `concept/` | Project | Product, architecture, integration baseline, delivery plan, and this naming index |
| `.prior/project.yaml` | Prior | Versioned project identity and configuration; no credentials or live state |
| `fusion-workbench/` | Fusion | Durable work records and evidence |
| `cmd/prior/` | Prior | CLI, supervisor entry point, and minimal interactive attachment |
| `internal/core/` | Prior | Vendor-neutral identities, canonical values, errors, transitions, and service contracts |
| `internal/ipc/` | Prior | Local protocol framing and peer/scope checks |
| `internal/supervisor/` | Prior | Request handling, scheduling, and run ownership |
| `internal/store/` | Prior | Migrations, transactional repositories, and outbox |
| `internal/artefact/` | Prior | Immutable byte storage and reference retention |
| `internal/platform/` | Prior | Platform locks, process identity, supervision, filesystem primitives, and containment |
| `internal/policy/` | Prior | Authority and interaction broker |
| `internal/tools/` | Prior | Typed tools |
| `internal/sourcecontrol/` | Prior | Git service and source-control contracts |
| `internal/backend/` | Prior | Common backend adapter contract and individual adapters |
| `internal/module/` | Prior | Module manifest, lifecycle, scoped IPC, and event handlers |
| `modules/fusion/` | Fusion | Fusion schemas, profiles, workflows, record operations, and module executable |
| `schemas/` | Shared contract | Language-neutral protocol and record schemas |
| `tests/` | Project | Fixtures, conformance, integration, and fault-injection tests |
| `docs/decisions/` | Project | Bounded implementation decisions and their rationale |
| `experiments/integrations/` | Project evidence | Executable boundary experiments; not production runtime code |

Prior also uses a per-user local registry and runtime database plus an artefact store outside the repository. Their physical paths are intentionally not fixed by the concept. Do not invent project-relative folders for them.

### Fusion workbench migration

The current checkout still contains legacy Fusion folders. The target names below apply the concept's canonical vocabulary. `Retain` means that the existing name already fits. `Rename` is a direct vocabulary migration. `Review` means that records must be classified by meaning before moving; the old folder is broader or differently scoped than the new concept.

| Legacy path | Target path or treatment | Action | Reason |
|---|---|---|---|
| `fusion-workbench/circles/` | `fusion-workbench/work-packages/` | Rename | A Circle is now a work package |
| `fusion-workbench/shared/analyses/` | `fusion-workbench/shared/analyses/` | Retain | Evidence-based analyses remain a valid record kind |
| `fusion-workbench/shared/investigations/` | `fusion-workbench/shared/investigations/` | Retain | Bounded investigations remain valid evidence records |
| `fusion-workbench/shared/decisions/` | `fusion-workbench/shared/decisions/` | Retain | Decisions remain durable evidence and policy input |
| `fusion-workbench/shared/planning/` | `fusion-workbench/shared/plans/` | Rename | Records are plans; the noun names the stored objects more precisely |
| `fusion-workbench/shared/reviews/` | `fusion-workbench/shared/reviews/` | Retain | Reviews remain a canonical Fusion record kind |
| `fusion-workbench/shared/issues/` | Candidate register or work-item records | Review | An issue may be an unadmitted candidate or an admitted work item; migration depends on its state |
| `fusion-workbench/shared/consult/` | `fusion-workbench/shared/consultations/` | Rename | Use a record noun rather than a verb or profile shorthand |
| `fusion-workbench/shared/memos/` | Evidence, decision, or handover record by content | Review | `Memo` is not a canonical semantic type in the new concept |
| `fusion-workbench/shared/history/` | Typed record history or audit evidence by content | Review | History is represented by versioned records and events, not one undifferentiated record class |
| `fusion-workbench/shared/checkouts/` | Local checkout registry/reference data | Review | Checkout identity belongs to Prior; retain Fusion files only when they are module references rather than an authority source |
| `fusion-workbench/archive/` | `fusion-workbench/archive/` | Retain | Archival is a lifecycle treatment, not a work type |
| `fusion-workbench/stilwerk/` | A separately named style/voice configuration area | Review | The concept does not define `stilwerk`; choose an English name when this becomes a supported Fusion contract |
| `fusion-workbench/.guard-state/` | Prior runtime records or removal after migration | Review | Permissions, process control, and runtime events belong to Prior, not the Fusion workbench |

This table defines naming direction, not an authorised bulk move. Record schemas, references, history, and compatibility readers must be designed before existing files are migrated.

## Legacy Fusion to PRIOR/Fusion mapping

### Framework terms

| Legacy Fusion name | Canonical PRIOR/Fusion name | Mapping rule |
|---|---|---|
| **Circle** | **Work package** | Direct replacement for the bounded unit of coordinated work |
| **Circle record** | **Work-package record** | Direct replacement for its durable record |
| `circles/` | `work-packages/` | Direct folder rename |
| **Directive** | **Brief** | Use for the statement of what a work package must achieve |
| **Grounding** | **Evidence base** | Use for assumptions, decisions, and verified starting facts |
| **Turn** | **Work round** | Use for a batch of work followed by a coherence check; reserve **model turn** for one backend response |
| **Queue** | **Work queue** | Use the qualified name for ordered outstanding work |
| **Reorientation** or informal course correction | **Realignment** | Use for the recorded decision after coherence breaks |
| **Artifact** | **Artefact** | British spelling for Prior's immutable or version-pinned output; use a more specific Fusion record name when the object is a plan, review, evidence item, or workbench record |
| **Gate** | **Approval**, **agreement**, **validation check**, **checkpoint**, or **completion condition** | Select by function; the legacy umbrella term does not have one safe replacement |
| **Verdict** | **Review result**, **disposition**, **decision**, or **audit result** | Select by the record's subject and authority; a verdict must not imply user approval or unanimous agreement |
| **Agent** as a durable configuration | **Agent profile** | A run executes a profile; use **run** for the execution itself |
| **Provider** | **Model backend** | Use for the configured route to model capability; retain vendor `provider` fields only at compatibility boundaries |
| **Plugin** | **Module** | Fusion is a Prior module |
| **Skill** | **Workflow** or **agent profile** | Choose workflow for reusable instructions and agent profile for a role with tools and capabilities |
| **Engine** | **Runtime** | Use for the executable Prior core |
| **Task/subagent execution** | **Run/child run** | Use run identity and delegation relationships for execution |
| **Team** | **Agent group** | Use for bounded parallel collaboration; authority remains in the delegation tree |
| **Session task** | **Run within a session** | Keep user interaction history and agent execution as separate identities |

### How to resolve the ambiguous legacy terms

| If the old record means ... | Use ... |
|---|---|
| The user authorises an action | **Approval** |
| Every required reviewer accepts the current plan revision | **Agreement** |
| Tests or policy decide whether a transition may proceed | **Validation check** or a named **completion condition** |
| The runtime reaches a durable safe boundary | **Checkpoint** |
| A reviewer assesses a plan or change | **Review result** |
| A candidate is selected, admitted, merged, deferred, rejected, or excluded | **Disposition** |
| A responsible actor records a binding project choice | **Decision** |
| An auditor confirms or rejects completion evidence | **Audit result** |

Do not preserve `Gate` or `Verdict` as generic machine types. Their old breadth hides who has authority, which revision was checked, and what transition the result permits.

## State-name boundaries

The same word can occur in different state machines without making those states interchangeable.

| State family | Canonical examples | Owner |
|---|---|---|
| Run lifecycle | `queued`, `starting`, `running`, `waiting_tool`, `waiting_message`, `waiting_user`, `stopping`, `recovery_required`, `completed`, `bounded`, `failed`, `cancelled` | Prior |
| Campaign lifecycle | `draft`, `authorised`, `running`, `paused`, `completed`, `bounded`, `failed`, `cancelled`, `discarded`, `archived` | Fusion |
| Candidate disposition | `pending`, `selected`, `admitted`, `merged`, `deferred`, `rejected`, `out_of_scope` | Fusion |
| Work-item lifecycle | `admitted`, `qualifying`, `planned`, `challenging`, `ready`, `implementing`, `verifying`, `reviewing`, `integrating`, `auditing`, `completed`, `deferred`, `rejected`, `blocked`, `cancelled` | Fusion |

A completed run only means that an agent execution produced a result and settled its owned work. A completed work item, work package, or campaign additionally requires the applicable Fusion acceptance and audit evidence.

## Naming rules for new work

1. Name the domain object, not the implementation mechanism: `work-package`, not `circle`; `model-backend`, not `provider`.
2. Qualify overloaded words: `model turn` and `work round`; `run state`, `campaign state`, and `work-item state`.
3. Encode authority in the record type: approval, agreement, review result, decision, and audit result are distinct.
4. Use namespaced Fusion references across the module boundary; do not add Fusion states or profile names to Prior's core schema.
5. Use `artefact` and `artefact_ref` in canonical PRIOR contracts. Translate external `artifact` spellings only in adapters.
6. Use stable kebab-case for profile identifiers, directories, and new multi-word machine values. Preserve snake_case where the canonical protocol already defines a field such as `tool_call_id`.
7. Name stored collections for their records: `work-packages/`, `plans/`, `reviews/`, and `decisions/`.
8. Do not use an old umbrella name when the new model requires a semantic choice. Classify legacy gates, verdicts, issues, memos, and history records before migration.
