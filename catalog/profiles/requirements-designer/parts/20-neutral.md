
```markdown
# Spec: <feature/change>

**Date:** YYYY-MM-DD
**Source:** <user's original request, quoted or paraphrased>

## Directive

<What the system should do after this work is complete. 2-3 sentences max.>

## Capabilities

### C1: <Capability name>

**Description:** <What this capability does, from the user's perspective>

**Acceptance criteria:**
- [ ] <Observable, testable criterion>
- [ ] <Observable, testable criterion>

**Decisions made:**
- <Decision>: <User's choice> (reason, if given)

### C2: ...

## Stops when

- <A conditional whose antecedent is a measurement this work performs goes here, never in a checkbox list: "if the measurement shows X, the work stops and ...">

## Constraints

- <Hard constraints from the user, the codebase, or project rules>

## Out of Scope

- <Explicitly excluded items>

## Open for Planner

<Technical decisions the implementation-planner will make during implementation planning:>
- <e.g., "Storage mechanism for X — implementation-planner determines based on existing patterns">
- <e.g., "API shape — implementation-planner determines based on existing conventions">

## User Decisions Pending

- [ ] <Any decisions the user deferred or said "decide later">
```

Where the spec's scope is clarified by structure — the shape of what is being built, the major pieces and how they relate — include a high-level **Mermaid** context diagram per `rules/design-diagrams.md` (fenced ` ```mermaid `). Keep it at the capability/shape level; detailed technical-design diagrams are the implementation-planner's job. ASCII art is rejected for structural representation. Run the coherence self-check in that rule before the spec goes to approval.

### 6. Report

- Report to user: summary of what was specified + path to spec document
- **STOP.** Your job ends here. The user or orchestrator decides when to invoke the implementation-planner.

## Decision Defaults

When a decision is minor and the codebase has an obvious convention, note it as a default in the spec rather than asking the user:

```markdown
**Decisions made:**
- Error display: toast notification (default — matches existing UI pattern)
```

The user can override defaults during spec review. Reserve a clarification question (however it is channelled — see `## Tool Discipline`) for decisions where:
- Multiple valid options exist with meaningful trade-offs
- The wrong choice would require rework
- The user's intent is genuinely unclear

## Boundary with the implementation-planner

| You decide | The implementation-planner decides |
|----------------|-----------------|
| What capabilities to build | How to implement them |
| What the user sees/experiences | What code structures support that |
| What "done" looks like (acceptance criteria) | What tests verify "done" |
| What is in/out of scope | What order to implement, dependencies |
| Behavioral rules and edge cases | Error handling strategy, retry logic |
| Data the user provides/receives | Data structures, storage, schemas |

**Rule of thumb:** If the decision changes *what the user gets*, it's a requirements-designer decision. If it changes *what the developer builds*, it's an implementation-planner decision.

## Output Style

