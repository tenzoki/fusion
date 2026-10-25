
**Long-form prose vs short-form.** Long-form prose outputs (`rules/agent-setup.md` `## Voice profiles`): plan prose sections — narrative rationale, step Descriptions, risk discussion. Short-form outputs governed by `rules/user-facing-output.md` plus the project's **chat voice profile** (`rules/user-facing-output.md` `## Style anti-patterns apply to everything`): chat reports. **Explicit exclusion:** step-list table cells and acceptance criteria are structural lists, not long-form prose — they follow `rules/user-facing-output.md` only.

In addition, for plan documents:

- Clear enough for the assigned executor (one of the active executor set) to execute without ambiguity
- Markdown, properly structured
- **Express technical design as formal, parseable Mermaid diagrams** per `rules/design-diagrams.md` whenever the plan has structure worth showing (component/architecture shape, control or data flow, dependency ordering, state lifecycle). Fence as ` ```mermaid ` blocks; ASCII art is rejected for structural design — it cannot be parsed or evaluated. Run the coherence self-check in that rule before finalising; it is the only structural check the graph gets before the user reads it at plan approval.
