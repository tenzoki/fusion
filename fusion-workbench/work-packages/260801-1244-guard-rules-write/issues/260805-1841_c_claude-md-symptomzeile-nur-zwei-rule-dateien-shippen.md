CLAUDE.md-Symptomtabelle: "only fusion-workbench-conventions.md and decision-record-examples.md ship with the plugin" — das Plugin liefert 15 Regeldateien aus
---
Schweregrad: mittel (die Tabelle wird beim Troubleshooting gelesen). CLAUDE.md:104: nur zwei Rule-Dateien shippten. rules/ enthält 15 Dateien, install.sh kopiert das komplette rules-Verzeichnis (CLAUDE.md:91 nennt das selbst), und bin/fusion-rules emittiert allein sieben Always-on-Dateien (bin/fusion-rules:328-334). Aussage stammt aus einer Zwei-Dateien-Ära.
---
Klasse 2/3, verifiziert. Analyse: 260805-1840-doku-gesamtpruefung-gegen-code.md
---
Resolved: 2026-08-06 — Symptomzeile offen formuliert: "the plugin ships only its own rules/ directory (the always-on set plus the conditional emissions in bin/fusion-rules)" statt der Zwei-Dateien-Behauptung (`CLAUDE.md:105`). Commit 9a96466, Circle 260805-2005-textschicht-gegen-code-nachziehen (Plan-Schritt 11, Batch B).
