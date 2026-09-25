Always-on-Regeldateien zeigen in Beispielen die abgeschaffte Prä-v4-Wurzelablage (fusion-workbench/decisions/, /history/)
---
Schweregrad: mittel (Beispiele prägen Schreibverhalten; beide Dateien in allen 16 Agenten geladen). rules/decision-record-examples.md:13,74 verorten Records unter fusion-workbench/decisions/...; rules/user-facing-output.md:174 zeigt als Positiv-Beispiel 260511-2129-orchestrator-session.md. Seit v4.0.0 existieren die Wurzel-Typordner nicht mehr (Layout: circles/<dir>/... bzw. shared/...; geprüft: fusion-workbench/decisions/ existiert nicht, shared/decisions/ existiert).
---
Reibt sich zusätzlich an der Store-Literal-Regel (Literale nur in den DEFINITION_SITES). Klasse 5, verifiziert. Analyse: 260805-1840-doku-gesamtpruefung-gegen-code.md
---
Resolved: 2026-08-06 — beide Prä-v4-Beispielpfade auf die shared/-Form umgestellt (`rules/decision-record-examples.md:13`, `rules/user-facing-output.md:174`). Commit fae818b, Circle 260805-2005-textschicht-gegen-code-nachziehen (Plan-Schritt 10, Batch A).
