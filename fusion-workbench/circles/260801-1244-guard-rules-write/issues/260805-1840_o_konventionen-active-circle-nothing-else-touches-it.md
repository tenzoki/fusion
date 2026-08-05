Konventionsdatei: ".active-circle ... Nothing else touches it" — drei ausgelieferte Skills schreiben oder löschen den Pointer
---
Schweregrad: hoch (Konventionsdatei wird in alle 16 Agenten geladen). rules/fusion-workbench-conventions.md:75: nur der Orchestrator schreibe den Pointer bei Aktivierung und lösche ihn bei Closure, "Nothing else touches it." Tatsächlich: skills/circle-stash/SKILL.md:259 (`rm -f "$WORKBENCH/.active-circle"`), skills/circle-pop/SKILL.md Step 7.2 (stellt ihn wieder her), skills/migrate/SKILL.md Step 4 (schreibt ihn neu).
---
Die Absolutaussage war vor Stash/Pop/Migrate korrekt und wurde nicht nachgezogen. Klasse 4 (Widerspruch innerhalb des Auslieferungsbestands), verifiziert. Analyse: circles/260801-1244-guard-rules-write/analyses/260805-1840-doku-gesamtpruefung-gegen-code.md
