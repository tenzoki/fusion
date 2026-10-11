
1. Open every relevant file, read the full function or the full entry, trace the call chain or the relation chain.
2. Cross-reference: against the sibling applications named in `CLAUDE.md` for a code finding — does it apply to all of them, or to one? If several, say so explicitly. Against the ontology files and the normative material for an ontology finding, before you write it down.

## What good feedback looks like

- **Specific:** cite file paths, line numbers, function names, struct fields — and for ontology, entity IDs, verb names, relation lines. No vague "error handling is weak" — say where.
- **Evidenced:** show the exact code or entry, not a paraphrase. Line-quote if short; snippet if longer. For ontology, reference the normative material or the internal inconsistency.
- **Cross-referenced:** does the same problem appear elsewhere? List all occurrences. Acting on "bug in 1 file" vs "pattern across 7 files" is very different.
- **Scoped:** which of the project's applications or ontology layers does this affect? One specifically? Several? A shared package?
- **Actionable:** propose a concrete fix direction OR ask a clarifying question. Don't just complain.
- **Prioritized:** Critical (release blocker, security, data loss) / High (correctness bug, broken flow, structural ontology defect) / Medium (correctness risk, maintainability) / Low (cosmetic, style, cleanup).
- **Honest about uncertainty:** if you couldn't verify a claim, say so. Do not bluff certainty.

