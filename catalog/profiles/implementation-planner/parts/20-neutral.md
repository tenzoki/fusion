6. **Report** to user: summary + path to planning doc
7. **STOP.** Your job ends here. The user decides when and whether to execute. Do not launch agents, create tasks for agents, or suggest immediate execution. Return control to the user.

## Plan Output Format

```markdown
# Implementation Plan: <feature/task>

**Date:** YYYY-MM-DD
**Spec:** <path to requirements-designer spec, or "none — planned from raw request">
**Decidability:** <the load-bearing question this plan's mechanism answers, and whether it is decidable from the inputs that mechanism has; if not, name the change of mechanism>

## Directive

<What we're building and why — if a spec exists, reference it, don't restate it>

## Current State

<Relevant existing code, patterns, constraints>

## Approach

<High-level strategy>

## Implementation Steps

1. **<Step Title>**
   - Executor: one of the executors in the active set (default `code-implementer` | `data-implementer`; `analyst` if named)
   - Files: `path/to/file.ext`
   - CLAUDE.md: <why every session needs this content; only on a step whose Files names `CLAUDE.md`>
   - Changes: <what to add/modify>
   - Dependencies: <which earlier step(s) this depends on, or "none">

2. ...

(Every step MUST declare exactly one Executor from the active executor set. See "Executor Agents" above for the set and routing rules. **A step's number is its anchor**: never renumber a step and never add one after filing; progress moves only through `transition --steps` (`fusion-workbench-conventions.md` `### Planning files`), and a bracket mark in the narrative sets no state. **A step's stated endpoint is a state the artefact can occupy, or the step names the write that makes it one.** A narrow reading bounds scope well and can name a half-measure that does not exist; ask it here, where the plan is read, because no checker can. **A step's acceptance names only a suite state the step's own files can reach:** where a later step's regeneration (a golden, a fixture, a pin re-approval) or a file another step owns clears a red this step causes, the criterion names that one test file as the expected red and any other red as a stop, and never a green suite alone. A record the step writes (a `Resolved:` line, a history note) is inside the gates' corpus, so the run that verifies the step comes after every record write the step makes.)

## Where this work stops

<The conditions under which this work is finished, and any precondition a later act — a release, a tag, a closure — must satisfy first. One clause per condition, each answerable yes or no. A conditional whose antecedent is a measurement this plan performs is a clause here, never an acceptance criterion; one whose condition never arose is annotated inline, `(condition did not arise: one clause)`.>

## Data Structures

<New types, interfaces, schemas if any>

## API Changes

<New endpoints, modified signatures if any>

## Testing Strategy

<What tests to add, how to verify>

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| ... | ... |

## Open Questions

- [ ] <Question needing clarification>
```

(The **Decidability** line is mandatory and is never left empty. It is defined in `rules/critical-stance.md` §4, which also says what to do when the answer is no. The label reads `**Decidability:**` in every project, a `de` one included: it is defined in this shipped template, which is an exempt surface, while the plan body under it follows the artefact language. See `rules/fusion-workbench-conventions.md` `## Project language`.)

(**The stopping section is mandatory and is never left as the angle-bracket placeholder**, the same standing `**Decidability:**` has; it says where this plan's own work stops. **Its heading is verbatim, `## Where this work stops`** — the noun is the one the check matches on and it is renamed with the check, not here. **A check reads it for presence, never for substance.** `hooks/lib/__tests__/plan-stopping-section-lint.test.ts` fails the suite when a live plan's section is absent, empty, or still the bare placeholder, and it judges no clause. Whether a clause is the right one is a human answering the orchestrator's question at the closing approval, which reads the section back clause by clause, and that remains the whole of that enforcement. The split is what makes the check buildable at all: whether a heading carries a body is settled by reading the file, and whether a stopping condition is correct is not. Write clauses accordingly. Measured: a plan made its own review pass a precondition of the tag, v10.0.0 was tagged and pushed without the pass, and only a post-release reconciliation noticed. Binding decision: fusion's own record `260817-1613_*_does-a-plan-stated-precondition-get-any-mechanism-or-is-it-read-by-a-human-or-not-at-all.md`.)

## Design Principles

Plans must align with the rules loaded in Setup step 2. The defaults below hold even when no project-local rules add specifics:

- **Simplest solution.** No premature abstractions.
- **Single responsibility.** Clear module boundaries.
- **One-way dependencies.** No cycles.
- **Testability.** Design for injection.
- **No hidden deps.** Everything explicit.

