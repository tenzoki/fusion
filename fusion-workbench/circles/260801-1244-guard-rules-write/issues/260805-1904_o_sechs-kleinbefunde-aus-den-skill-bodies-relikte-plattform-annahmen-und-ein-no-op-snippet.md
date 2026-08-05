Sechs Kleinbefunde aus den Skill-Bodies: Relikte, Plattform-Annahmen und ein No-op-Snippet
---
Sammel-Issue, alle Low, alle mechanisch:

1. `skills/commit/SKILL.md` Frontmatter (`allowed-tools: [Bash, Read, Glob]`) — der Body fragt zweimal um Bestätigung (Schritt 5, Schritt 6), `AskUserQuestion` fehlt in der Allowlist. Konversationell funktioniert es, aber das ist exakt die Fehlerklasse aus v3.0.1, und es ist die einzige Frontmatter-Auffälligkeit unter allen 16 Skills. Verifiziert.
2. `skills/archive/SKILL.md:150` — das Zitations-Check-Snippet ist ein No-op (`if grep …; then : ; fi`), während der begleitende Text „dropped automatically" verspricht. Das Snippet demonstriert die versprochene Logik nicht. Verifiziert.
3. `skills/next/SKILL.md:147` — „The brackets are safe here" kommentiert einen `mv`-Befehl, der keine Klammern mehr enthält. Relikt der Bracket-Ära; ein Leser sucht nach einer Klammer, die es nicht gibt. Verifiziert.
4. `skills/log-activity/SKILL.md:79` — `-exec ls -l -T {} +` ist BSD-Syntax; unter GNU erwartet `ls -T` ein Tabsize-Argument und der Scan bricht. Derselbe Skill dokumentiert die macOS/GNU-Weiche für `date` (Z.197), hier aber nicht. Abgeleitet (nicht auf GNU gemessen).
5. `skills/circle-pop/SKILL.md:158` — das Legacy-Handrezept nennt das Manifest-Feld `original_circle_filename`; keine ausgelieferte Doku kennt es (`rules/workbench-stash-and-lock.md` führt nur `original_circle_dirname`). Ob Alt-Manifeste es je so nannten, ist heute nicht prüfbar; nachschlagen kann der Nutzer es jedenfalls nirgends. Abgeleitet.
6. `skills/seed-from-plane/SKILL.md:63` — „Any other non-zero exit … is a bad story number" subsumiert fälschlich auch exit 1 (ungültige Config). Da stderr wörtlich weitergereicht wird, bleibt der Schaden klein. Verifiziert, kosmetisch.
---
Schweregrad: Low. Befunde des Skill-Workstreams (Analyst); Punkt 1–3 und 6 dort verifiziert, 4 und 5 als abgeleitet markiert. Zusammengefasst statt einzeln gefiled, weil zwanzig Low-Records mehr Triage kosten als sie wert sind — Punkt 1 ist der einzige mit einem realen Ausfallmodus und darf beim Abarbeiten nicht in der Liste untergehen.
