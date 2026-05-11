# fusion-workbench Conventions

Shared conventions for all agents operating on `fusion-workbench/`. This file is auto-loaded by the plugin system into every agent's context. Single source of truth for state markers, issue and decision filing, inline tracking, history logging, and timestamps.

## fusion-workbench Layout

```
fusion-workbench/
├── planning/      # planner output (YYMMDD-HHMM[S]-<topic>.md)
├── issues/        # defects filed by any agent (YYMMDD-HHMM[S]-<topic>.md)
├── decisions/     # tracked open questions / decision records (YYMMDD-HHMM[S]-<topic>.md)
├── history/       # all agents log here (YYMMDD-HHMM-<topic>.md)
├── codereview/    # codereviewer output (YYMMDD-HHMM-<topic>.md)
├── ontoreview/    # ontoreviewer output (YYMMDD-HHMM-<topic>.md)
├── analyses/      # analyst output (YYMMDD-HHMM-<topic>.md)
├── investigations/# investigator output (YYMMDD-HHMM-<topic>.md)
├── consult/       # consultant output (YYMMDD-HHMM-<topic>.md)
├── circles/       # anticipated, active, closed, and bounded Circles (YYMMDD-HHMM[S]-<directive-slug>.md)
└── tasklist.md    # generated work queue (taskplanner only)
```

`fusion-workbench/.active-circle` is a one-line pointer file containing the basename of the currently `[t]`-marked Circle, or is absent when no Circle is active. The orchestrator reads it at session start; playmaker writes it on `[a]→[t]` activation; orchestrator clears it on `[t]→[c]/[b]/[s]/[d]` transitions. The pointer is the single source of truth for "active Circle" — `agentstate.yaml` does NOT duplicate this field.

The `fusion-workbench/` is anchored to the directory where setup was run — the working directory `pwd` reports, not necessarily the git toplevel. A subfolder may legitimately have its own independent workbench, separate from any workbench at a parent level; the plugin's hooks resolve `process.cwd()` directly and follow whichever directory is active.

Within a given working directory there is exactly **one** `fusion-workbench/`. Never create a nested duplicate inside it, and never split history, issues, decisions, planning, or review docs across multiple workbenches in the same tree — they all live in the single workbench at the active `pwd`.

## Issues vs Decisions — when to use which

A **defect** belongs in `issues/`. A **decision** belongs in `decisions/`. The distinction:

| Defect | Decision |
|---|---|
| Something is wrong, broken, missing, or inconsistent. | A choice must be made between two or more options. |
| Resolves to a code/data fix that can be verified by reading a diff. | Resolves to a recorded answer (decision record) and, separately, to implementation that realises the answer. |
| Lifecycle: filed → fixed → closed. The fix and the closure are the same event. | Lifecycle: filed (open question) → answered (with pointer to where) → implemented (when the answer is realised in code/data) → optionally superseded later. The answer event and the implementation event are distinct. |
| Examples: "term mapping is missing for entity X"; "test failure in pkg/foo"; "manifest doesn't validate". | Examples: "which IdP for v1?"; "should we adopt approach X or Y?"; "what is the cut decision for the platform?". |

**Decision rule for borderline items:** if the resolution is "go fix it" → defect; if the resolution is "decide and record" → decision. When in doubt, file as an issue and reclassify in the next reconciliation pass — that round-trip is cheap, the misfile cost is low.

A **Circle** belongs in `circles/`. Distinct from defect (`issues/`) and choice point (`decisions/`): a Circle is a unit of work bounded by a Directive + its Grounding + its Artifact (foundation V3 §2.1). When the resolution is "execute this Directive to closure," it's a Circle; when the resolution is "go fix it," it's an issue; when the resolution is "decide and record," it's a decision.

## Timestamps

Always obtain `YYMMDD-HHMM` from `date +%y%m%d-%H%M`. LLMs have no clock — never guess or estimate the time.

## Filename Patterns

| Directory | Pattern | State marker |
|-----------|---------|--------------|
| `planning/` | `YYMMDD-HHMM[S]-<topic>.md` | yes (issues/planning vocabulary) |
| `issues/` | `YYMMDD-HHMM[S]-<topic>.md` | yes (issues/planning vocabulary) |
| `decisions/` | `YYMMDD-HHMM[S]-<topic>.md` | yes (decisions vocabulary — richer set) |
| `history/` | `YYMMDD-HHMM-<topic>.md` | no |
| `codereview/` | `YYMMDD-HHMM-<topic>.md` | no |
| `ontoreview/` | `YYMMDD-HHMM-<topic>.md` | no |
| `analyses/` | `YYMMDD-HHMM-<topic>.md` | no |
| `investigations/` | `YYMMDD-HHMM-<topic>.md` | no |
| `consult/` | `YYMMDD-HHMM-<topic>.md` | no |
| `circles/` | `YYMMDD-HHMM[S]-<directive-slug>.md` | yes (circles vocabulary) |
| `tasklist.md` | fixed | — |

## State Markers — issues/ and planning/

Files in `issues/` and `planning/` carry a state marker: `YYMMDD-HHMM[S]-<topic>.md`.

| Marker | Meaning |
|--------|---------|
| `[o]` | Open — initial state on creation |
| `[p]` | In progress — agent is actively working on it |
| `[c]` | Closed — resolved, or user decided to close |
| `[d]` | Deferred — user decided, or agent proposed and user confirmed |

**Rules:**
- Every new file starts as `[o]`.
- When an agent begins work: rename `[o]` → `[p]`.
- When work is done: rename `[p]` → `[c]`.
- When the user defers: rename to `[d]`.
- State change = `mv` (rename). Only the marker changes; `YYMMDD-HHMM` and `<topic>` stay the same.

History, codereview, ontoreview, and analyses files do NOT carry state markers.

## State Markers — decisions/

Files in `decisions/` carry a richer state marker that distinguishes "the answer is recorded" from "the answer is realised in code/data".

| Marker | Meaning |
|--------|---------|
| `[o]` | Open — the question has been filed but not yet answered. Initial state on creation. |
| `[a]` | Answered — a recorded answer exists somewhere on disk (typically in `analyses/`, `planning/`, or in the decision record itself). The file body MUST cite the answer's location with `Answered: <path>:<line> — <one-line summary>`. The decision is not yet realised in code or data. |
| `[i]` | Implemented — the answer has been realised: code or data on disk now reflects the decision. The file body MUST cite the implementation with `Implemented: <commit hash> or <path>:<line> — <one-line summary>`. This is the terminal state for decisions whose realisation is verifiable. |
| `[d]` | Deferred — the user explicitly pushed the decision out (to v1.x, to a future workbench, etc.). The file body MUST cite the deferral target. |
| `[s]` | Superseded — a later decision has overridden this one. The file body MUST cite the superseding decision file: `Superseded by: <path> — <reason>`. |

**Worked transitions:**

1. **`[o]` → `[a]`**: Reconciler (or analyst) finds that an open decision has been answered in a deliverable. Append `Answered: analyses/260501-1915-D04-detailed-architecture.md §4.3 — Shape C selected`. Rename `[o]` → `[a]`.
2. **`[a]` → `[i]`**: A coder/ontocoder commit lands that realises the decision. Append `Implemented: a3f7c2e — pkg/transform now uses Shape C dispatch`. Rename `[a]` → `[i]`.
3. **`[o]` → `[d]`**: User says "defer to v1.x". Append `Deferred: v1.x — pending pilot signal`. Rename `[o]` → `[d]`. (Skipping `[a]` is fine when the deferral itself is the answer.)
4. **`[a]` → `[s]`**: A new decision overrides the answered one. Append `Superseded by: decisions/YYMMDD-HHMM[a]-new-decision.md — replaces Shape C with Shape D after Stefan veto`. Rename to `[s]`.
5. **`[o]` → `[s]`** (rare): A new decision overrides an open one before it was even answered. Same procedure as above.

**`[i]` and `[s]` are terminal.** Do not rename them back to `[o]` or `[a]`. If an implemented decision needs revisiting, file a NEW decision (which may then `Supersede` the `[i]` one).

**Grounding-Stand vs Grounding-Historie:**

The marker vocabulary mirrors foundation_V3 §1.2's two-layer Grounding model:

- `[o]` (open) and `[a]` (answered, awaiting realisation) are **Grounding-Stand** — the current best-of-knowledge the project is working with.
- `[i]` (implemented), `[s]` (superseded), and `[d]` (deferred) are **Grounding-Historie** — preserved record of what was decided, including elements that have been replaced or postponed.

A flat `decisions/` directory holds both layers; the marker carries the layer information. Reconciliation passes that "list active Grounding" filter on `[o]` + `[a]`; passes that "show project history" include all five.

## State Markers — circles/

Files in `circles/` carry a marker that tracks Circle lifecycle. The vocabulary is parallel to but distinct from issues/planning and decisions/.

| Marker | Meaning |
|--------|---------|
| `[a]` | **Anticipated** — provisional Directive, no Grounding yet (foundation V3 §2.1). |
| `[t]` | **Active / in-Turn** — Directive refined, Grounding crystallising, orchestrator running it. |
| `[c]` | **Closed-coherent** — three-edge Coherence verdict passed. |
| `[b]` | **Bounded Closure** — Directive judged not reachable; what was learned is the Artifact. |
| `[s]` | **Superseded** — replaced by another Circle (scope split, redirected). |
| `[d]` | **Deferred** — anticipated → indefinitely postponed. |

### Worked transitions

- `[a] → [t]` — playmaker proposes activation; user confirms; orchestrator renames and writes `.active-circle`.
- `[t] → [c]` — Coherence verdict `coherent` at Phase 3; orchestrator renames at Phase 4 and clears `.active-circle`.
- `[t] → [b]` — user chose **Accept Bounded Closure** at the Rebalance gate; orchestrator renames at Phase 4 and clears `.active-circle`.
- `[t] → [s]` — user supersedes mid-run; orchestrator renames; a new `[o]` Circle file is created citing the superseded one via `## Dependencies`.
- `[a] → [d]` — user defers an anticipated Circle indefinitely; manual rename.
- `[a] → [s]` — rare; the anticipated Circle is replaced before activation by a new Circle that captures the revised intent.

**Terminal-states statement:** `[c]`, `[b]`, `[s]`, `[d]` are terminal — `mv` back to `[a]` or `[t]` is disallowed. If continuation is needed, create a new Circle that cites the terminal one via its `## Dependencies` section.

**Grounding-Stand vs Grounding-Historie parallel:** as with `decisions/`, the marker carries the layer information. `[a]` and `[t]` are Grounding-Stand (current working state); `[c]`, `[b]`, `[s]`, `[d]` are Grounding-Historie (preserved record).

## Circle file template

Circle files live under `fusion-workbench/circles/`. Template:

```markdown
# <One-line Directive title>

---
**Domain:** <code|data|strategic|knowledge>
**Status:** <anticipated | active | closed | bounded | superseded | deferred>
**Filed by:** <agent name or "user">
**Active spec/plan:** <path to spec, plan, or "(none yet)">
**Active session history:** <path to orchestrator session history file, or "(none yet)">

---

## Directive

<What this Circle aims for. The post-completion state of the Artifact, prognosticated. Revisable via Rebalance.>

## Grounding snapshot

<What we know going in. Filled at `[a] → [t]` activation by shaper portfolio-activation mode. Updates on Rebalance.>

## Dependencies

<List of other Circle filenames this Circle depends on. Playmaker flags cycles here.>

## Turn log

<Append-only list of Turn outcomes for this Circle. Format per bullet:
- Turn N (session YYMMDD-HHMM): commits <hash>..<hash>; Coherence verdict <coherent|review-needed|skipped-...>; session history: <path>>

## Closure note

<Filled when marker becomes [c], [b], [s], or [d]. Cites the orchestrator session history file. For [b], also cites the Bounded-Closure Artifact (what was learned that the Directive could not reach).>
```

The filename pattern is `YYMMDD-HHMM[S]-<directive-slug>.md` per the State Markers section above.

## portfolio.md template

`fusion-workbench/portfolio.md` is regenerated by playmaker on every run. Template:

```markdown
# Portfolio

**Generated:** YYMMDD-HHMM (by playmaker session <id>)
**Domain bias:** <code|data|strategic|knowledge>

## Active ([t])

<One entry expected, or 0. If >1, flag MULTIPLE-ACTIVE warning. Each entry: Circle filename, Directive line, active session history path.>

## Anticipated ([a]) — ranked

<Ordered list by playmaker rank. Top entry includes a one-paragraph rationale for the recommendation. Each entry: Circle filename, Directive line, rank, dependencies summary.>

## Recently closed ([c] / [b])

<Last 5 closed Circles. Each entry: Circle filename, marker, Closure note one-liner.>

## Archived ([s] / [d])

<Superseded and deferred Circles, for reference.>

## Warnings

<Dependency-cycle warnings, parent-grounding-stale notes (cross-references), MULTIPLE-ACTIVE conditions, etc.>
```

## Inline State Tracking

**Filename markers are not enough.** Content inside planning, issue, and decision files must also track progress, so that interruptions don't lose state.

### Planning files

- When you start a step: mark it `[IN PROGRESS]`:
  `3. [IN PROGRESS] **Step Title**`
- When you complete a step: mark it `[DONE]`:
  `1. [DONE] **Step Title**`
- When all steps are `[DONE]`: set `**Status:** Complete` in the header and rename the filename marker to `[c]`.

### Issue files

When an issue is resolved, append below the existing content:
```
---
Resolved: <brief description of what was done>
```
Then rename the filename marker to `[c]`.

### Decision files

Decision files have their own resolution annotations matching the marker semantics — do NOT use `Resolved:` (that's for defect-issues only). Use one of:

```
---
Answered: <path>:<line> — <one-line summary>
```
(rename `[o]` → `[a]`)

```
---
Implemented: <commit hash> or <path>:<line> — <one-line summary>
```
(rename `[a]` → `[i]`, or `[o]` → `[i]` if the implementation skipped the recorded-answer step)

```
---
Deferred: <target — one-line reason>
```
(rename to `[d]`)

```
---
Superseded by: <path to new decision> — <reason>
```
(rename to `[s]`)

### When to update

- After completing each plan step — not just at session end.
- After resolving an issue — before moving to the next task.
- After answering or implementing a decision — before moving to the next task.
- When a review confirms a plan step, issue, or decision is done — the reviewing agent marks it.
- When the user asks to close, defer, supersede, or reopen anything.

## Issue and Decision Filing — MANDATORY

**Every defect, problem, inconsistency, concern, or TODO discovered during work MUST be written as a separate file in `fusion-workbench/issues/`. Every open question, choice point, or design fork MUST be written as a separate file in `fusion-workbench/decisions/`. No exceptions.**

This applies to:
- Defects found during implementation, analysis, or review → `issues/`
- Inconsistencies in code, data, docs, or existing architecture → `issues/`
- Tech debt, dead code, stale docs, dangling references → `issues/`
- Open questions raised during shaping, planning, or analysis → `decisions/`
- Choices the user has deferred or has not yet made → `decisions/`
- Anything the user asks to track, note, or remember — choose folder per the issues-vs-decisions rule above

**NEVER put issues or decisions inside plan documents, review documents, analyses, code comments, chat output, history logs, or any other location.** Embedded items get lost. Each item is a separate file in the appropriate folder.

**Filename:** `YYMMDD-HHMM[o]-<topic>.md` (always `[o]` on creation, in either folder).

**Issue file format:**
```
<issue title>
---
<short description>
---
<context>
```

**Decision file format** — see the Decision Record Template below.

Brief but precise — enough context to understand the item without the original conversation.

## Decision Record Template

File: `fusion-workbench/decisions/YYMMDD-HHMM[o]-<topic>.md`

Body:

```markdown
# <one-line decision title — phrased as a question or choice point>

---
**Domain:** code | data | strategic | knowledge
**Status:** open | answered | implemented | deferred | superseded
**Filed by:** <agent name or "user">
**Cross-references:** <paths to related issues/, analyses/, planning/, or decisions/ files>

---

## Question

<One paragraph: what is the choice point? Why must it be made now?>

## Options

1. **<Option A>** — <description>
   - Pros: ...
   - Cons: ...
2. **<Option B>** — ...
3. ... (2–4 options typical; more = the question needs decomposing first)

## Constraints

<Hard constraints that any answer must satisfy.>

## Recommendation

<If the filing agent has a recommendation, state it with reasoning. Otherwise omit.>

---
Answered: <set when status moves to [a]>
Implemented: <set when status moves to [i]>
Deferred: <set when status moves to [d]>
Superseded by: <set when status moves to [s]>
```

## History Logging

Every session writes a history entry to `fusion-workbench/history/YYMMDD-HHMM-<topic>.md` describing what was done. Update the entry's status line to `Complete` as the final step of the session — if interrupted before this, completion state is lost.

The history log is the only durable record of a session. The in-memory task list does not persist. Always update history before finishing.

## Security

Never read or display `.secret` files. If secrets are needed, ask the user to provide them via environment variables.
