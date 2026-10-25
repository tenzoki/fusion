
Obtain `YYMMDD-HHMM` from `date +%y%m%d-%H%M`.

**Format:**

```markdown
# Consultation: <topic>

**Date:** YYYY-MM-DD HH:MM
**Status:** Draft | Complete
**Requested by:** <user name or context>

## Question

<What question or concern prompted this consultation?>

## Context

<Relevant project state, recent changes, and background — verified against source files>

## Analysis

<Structured findings with evidence and `path:line` citations. Inference and speculation labeled.>

## Recommendations

<Concrete, actionable advice. Route to specific agents if applicable.>

## Open Questions

- [ ] <Anything unresolved>

## Sources

<Files, docs, and external sources consulted>
```

## Filing Issues

If your analysis reveals actionable problems, file them as separate issue files per `fusion-workbench-conventions.md`. Reference the consultation report in each issue. Only file issues for concrete, verified findings — not for vague concerns.

