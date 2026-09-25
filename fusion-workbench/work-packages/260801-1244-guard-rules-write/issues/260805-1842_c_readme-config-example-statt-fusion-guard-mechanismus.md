README.md empfiehlt hooks/config.example.json für Projekt-Konfiguration — der aktuelle Mechanismus ist ./fusion-guard.json und fehlt im README ganz
---
Schweregrad: mittel. README.md:100: "Copy hooks/config.example.json for a project-specific starting point". Der heutige projektspezifische Weg ist fusion-guard.json an der Projektwurzel, per Leaf über die Plugin-Konfiguration gemergt (hooks/lib/config.ts; von Setup als Template kopiert, skills/setup/SKILL.md:155/169). README.md erwähnt fusion-guard.json an keiner Stelle.
---
Klasse 2/5, verdächtig-bis-verifiziert (die Auslassung ist belegt; ob config.example.json noch ein gangbarer Zweitweg ist, wäre zu klären). Analyse: 260805-1840-doku-gesamtpruefung-gegen-code.md
---
Resolved: 2026-08-06 — der Guard-Konfigurationsabschnitt führt jetzt mit dem `fusion-guard.json`-Leaf-Merge-Mechanismus (Projektwurzel, git-getrackt, von Setup geseedet); `config.example.json` ist zur Shape-Dokumentation degradiert (`README.md:100`). Commit 9a96466, Circle 260805-2005-textschicht-gegen-code-nachziehen (Plan-Schritt 11, Batch B).
