README-agents.md: "The tools: and model: fields are deliberately omitted" für alle Agenten — der Orchestrator deklariert eine tools:-Allowlist
---
Schweregrad: mittel (das ist die Inheritance-Sektion, nach der neue Agenten gebaut werden). README-agents.md:57: jeder Agent deklariere nur name und description. agents/orchestrator.md trägt eine tools:-Allowlist (Agent-Dispatch + Tools); CLAUDE.md:21 und :114 sagen es korrekt ("The orchestrator is the only agent with an explicit tools: line"). Direkter Widerspruch zwischen den beiden Dokumenten.
---
Klasse 2/4, verifiziert (alle 16 Frontmatter geprüft durch Prüf-Analyst). Analyse: 260805-1840-doku-gesamtpruefung-gegen-code.md
---
Resolved: 2026-08-06 — der Vererbungsabschnitt benennt die Ausnahme explizit: der Orchestrator deklariert als einziger eine `tools:`-Allowlist, die übrigen 15 erben (`README-agents.md:57`). Commit 9a96466, Circle 260805-2005-textschicht-gegen-code-nachziehen (Plan-Schritt 11, Batch B).
