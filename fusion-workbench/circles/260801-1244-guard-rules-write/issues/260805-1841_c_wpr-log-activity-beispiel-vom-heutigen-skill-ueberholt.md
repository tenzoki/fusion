workbench-path-resolution.md trägt sein Kern-Beispiel (log-activity liest SCAN_CONSULT/SCAN_INVESTIGATIONS) — der heutige Skill fragt keine Keys mehr ab
---
Schweregrad: niedrig-mittel. rules/workbench-path-resolution.md:25 begründet den flachen Namensraum damit, dass /fusion:log-activity Konsultationen und Investigationen liest und kein Agenten-Name beide Keys auflöst. skills/log-activity/SKILL.md:22 sagt heute explizit, WORKBENCH sei "the only key this skill gets"; Ausführung bestätigt: bin/fusion-paths log-activity emittiert nur WORKBENCH und CIRCLE. Die Teilaussagen (SCAN_CONSULT nur playmaker, SCAN_INVESTIGATIONS nur conceptrev) stimmen weiterhin.
---
Das tragende Beispiel löst unter dem heutigen Prompt nichts mehr auf; das Argument braucht ein neues Beispiel oder eine historische Markierung. Klasse 5, verifiziert. Analyse: 260805-1840-doku-gesamtpruefung-gegen-code.md
---
Resolved: 2026-08-06 — das tote log-activity-Beispiel durch ein lebendes ersetzt: `/fusion:cadence` schreibt `$OUT_MEMO`, das kein Agenten-Prompt nennt (`rules/workbench-path-resolution.md:26`, per grep über agents/ verifiziert). Commit fae818b, Circle 260805-2005-textschicht-gegen-code-nachziehen (Plan-Schritt 10, Batch A).
