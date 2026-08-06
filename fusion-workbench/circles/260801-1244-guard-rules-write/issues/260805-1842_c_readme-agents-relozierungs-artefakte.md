README-agents.md: zwei Sätze aus früheren Ären ("except this README" im agents/-Ordner; "-n 25 for more event lines" bei Default 100)
---
Schweregrad: niedrig (kosmetisch). (1) README-agents.md:3/5: "Each *.md file (except this README) ... This README file is ignored by the scanner" — die Datei liegt an der Repo-Wurzel, agents/ enthält kein README. (2) README-agents.md:142: "-n 25 for more event lines" — der Monitor-Default ist 100 (bin/monitor:15), 25 wäre weniger.
---
Klasse 5, verifiziert. Analyse: circles/260801-1244-guard-rules-write/analyses/260805-1840-doku-gesamtpruefung-gegen-code.md
---
Resolved: 2026-08-06 — beide Relikte korrigiert: der Einleitungssatz stellt klar, dass dieses README an der Repo-Wurzel liegt (kein "except this README" mehr, `README-agents.md:3`); `-n 25` → `-n 200` mit Default 100 benannt (:142). Commit 9a96466, Circle 260805-2005-textschicht-gegen-code-nachziehen (Plan-Schritt 11, Batch B).
