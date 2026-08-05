README.md empfiehlt hooks/config.example.json für Projekt-Konfiguration — der aktuelle Mechanismus ist ./fusion-guard.json und fehlt im README ganz
---
Schweregrad: mittel. README.md:100: "Copy hooks/config.example.json for a project-specific starting point". Der heutige projektspezifische Weg ist fusion-guard.json an der Projektwurzel, per Leaf über die Plugin-Konfiguration gemergt (hooks/lib/config.ts; von Setup als Template kopiert, skills/setup/SKILL.md:155/169). README.md erwähnt fusion-guard.json an keiner Stelle.
---
Klasse 2/5, verdächtig-bis-verifiziert (die Auslassung ist belegt; ob config.example.json noch ein gangbarer Zweitweg ist, wäre zu klären). Analyse: circles/260801-1244-guard-rules-write/analyses/260805-1840-doku-gesamtpruefung-gegen-code.md
