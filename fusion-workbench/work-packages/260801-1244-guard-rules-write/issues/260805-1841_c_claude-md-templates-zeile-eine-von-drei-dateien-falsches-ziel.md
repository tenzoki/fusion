CLAUDE.md templates/-Zeile: nennt eine von drei Dateien und ein Kopierziel, das nur für diese eine stimmt
---
Schweregrad: mittel. CLAUDE.md:35: "Starter files for consuming projects to copy into their own ./rules/. Currently: investigator-capture-layout.md". templates/ enthält drei Dateien (investigator-capture-layout.md, fusion-guard.json, plane.config.yaml). Das Ziel ./rules/ stimmt nur für die erste: fusion-guard.json kopiert Setup an die Projektwurzel (skills/setup/SKILL.md:169), plane.config.yaml in den Workbench (skills/setup/SKILL.md:148). Widerspricht CLAUDE.md:29 ("Config template ships in templates/") im selben Dokument.
---
Klasse 2/3, verifiziert. Analyse: 260805-1840-doku-gesamtpruefung-gegen-code.md
---
Resolved: 2026-08-06 — die templates/-Zeile nennt alle drei Dateien mit ihren realen Zielen (investigator-capture-layout.md → ./rules/, fusion-guard.json → Projektwurzel, plane.config.yaml → Workbench) und verweist auf `ls templates/` als offene Menge (`CLAUDE.md:36`). Commit 9a96466, Circle 260805-2005-textschicht-gegen-code-nachziehen (Plan-Schritt 11, Batch B).
