README-agents.md "Plugin structure"-Sektion: drei bedingte Rule-Emissionen fehlen; Zeile 234 derselben Datei beschreibt die Partition korrekt
---
Schweregrad: mittel. README-agents.md:156-157 nennt als bedingte Emissionen nur design-diagrams, default-voice und Domain-Patterns. Es fehlen: protected-path-internals.md an coder/coderev/bugfixer (bin/fusion-rules:366), circle-records.md an orchestrator/playmaker/shaper (:384), workbench-stash-and-lock.md an orchestrator (:399). Auch die Tabellenzeile :178 ("workbench conventions only" für orchestrator/shaper u.a.) unterschlägt diese Zusätze. Pikant: Zeile 234 derselben Datei beschreibt die Partition korrekt — nur die frühere Sektion wurde beim v5.x-Umbau nicht nachgezogen.
---
Klasse 3/4, verifiziert. Analyse: 260805-1840-doku-gesamtpruefung-gegen-code.md
---
Resolved: 2026-08-06 — Conditional-Liste um `protected-path-internals.md` (nur im Plugin-Repo), `circle-records.md` und `workbench-stash-and-lock.md` ergänzt (`README-agents.md:156`); der Enumerations-Lint (a1b7872) leitet die Mengen aus den `IS_*`-Case-Armen ab. Commit 9a96466, Circle 260805-2005-textschicht-gegen-code-nachziehen (Plan-Schritt 11, Batch B).
