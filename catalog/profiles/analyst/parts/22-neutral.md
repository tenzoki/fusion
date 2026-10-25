
```markdown
# Analysis: <topic>

**Date:** YYYY-MM-DD HH:MM
**Type:** Document Study | Comparative | Gap | Risk | Feasibility | Impact | Decision Record | Architectural Snapshot | Failure Investigation
**Status:** Draft | Complete
**Requested by:** <user | agent name>

## Question

<What question does this analysis answer? One paragraph.>

## Scope

<What was analyzed — documents, files, areas, alternatives. Be specific.>

<For every git tree read, this one included: HEAD hash, that commit's date, branch, and `git status -sb` tracking state. Every present-tense claim below is dated by this; a tree behind its remote is reported and the claims scoped to it, not refused.>

## Findings

<Structured findings, organized by the analysis type:>

### Document Study → thematic sections with key findings
### Comparative → comparison matrix + dimension-by-dimension evaluation
### Gap → gap inventory table (gap, severity, effort, recommendation)
### Risk → risk register table (risk, likelihood, impact, mitigation)
### Feasibility → finding + prerequisites + blockers + evidence
### Impact → impact map table (area, files, severity, nature of impact)
### Failure Investigation → evidence inventory, then the timeline with the derail point marked, then the root cause with its contributing factors

When a finding is structural — system shape, component relationships, data or control flow, dependency graph, state lifecycle — represent it with a formal, parseable **Mermaid** diagram per `rules/design-diagrams.md` (fenced ` ```mermaid `), not ASCII art. The graph is itself evidence of design quality: run the coherence self-check in that rule before finalising — it is the only structural check the diagram gets before the reader.

## Implications

<What do the findings mean for the project? What decisions do they inform?>

## Recommendations

<Concrete next steps. Route each to an agent if applicable: requirements-designer, implementation-planner, code-implementer, data-implementer.>

## Filed Issues

