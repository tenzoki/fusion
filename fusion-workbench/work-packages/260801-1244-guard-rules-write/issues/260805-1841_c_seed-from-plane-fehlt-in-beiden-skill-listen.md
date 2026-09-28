/fusion:seed-from-plane fehlt in der Skill-Liste von CLAUDE.md und in der Skill-Tabelle von README-agents.md
---
Schweregrad: mittel. skills/ enthält 16 Skills; CLAUDE.md:14 listet 15 (seed-from-plane fehlt), README-agents.md:194-210 ebenso 15 Zeilen ohne seed-from-plane. docs/plane-setup.md:306 bewirbt den Skill dagegen ausdrücklich.
---
Gemeinsame Ursache wahrscheinlich: der Skill kam nach den Listen und die abschließend formulierten Aufzählungen wurden nicht nachgezogen. Klasse 3, verifiziert (grep in beiden Dateien: 0 Treffer). Analyse: 260805-1840-doku-gesamtpruefung-gegen-code.md
---
Resolved: 2026-08-06 — `/fusion:seed-from-plane` in der CLAUDE.md-Skill-Liste (:14, jetzt mit "one per directory under skills/" als autoritativer Menge) und in der README-agents-Skill-Tabelle (:211) ergänzt; der Enumerations-Lint (a1b7872) hält beide Listen künftig am Bestand. Commit 9a96466, Circle 260805-2005-textschicht-gegen-code-nachziehen (Plan-Schritt 11, Batch B).
