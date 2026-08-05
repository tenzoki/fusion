Konventionsdatei nennt sich "auto-loaded by the plugin system" — CLAUDE.md stellt klar: Plugin-Dateien werden NICHT auto-geladen
---
Schweregrad: niedrig. rules/fusion-workbench-conventions.md:5: "This file is auto-loaded by the plugin system into every agent's context." CLAUDE.md (Rules loading): "Plugin files are NOT auto-loaded into agent context; this helper is the only correct discovery path." Der tatsächliche Mechanismus ist Emission durch bin/fusion-rules plus Lese-Pflicht aus agent-setup.md.
---
Die Wirkung (jeder Agent liest die Datei) stimmt, der benannte Mechanismus nicht. Klasse 4, verdächtig/abgeleitet. Reichweite: alle 16 Agenten. Analyse: circles/260801-1244-guard-rules-write/analyses/260805-1840-doku-gesamtpruefung-gegen-code.md
