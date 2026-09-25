Konventionsdatei: "same 0/1/2 exit shape wie fusion-rules" — fusion-rules hat selbst einen Exit 3 mit anderer Bedeutung
---
Schweregrad: hoch. rules/fusion-workbench-conventions.md:118 ("the same 0/1/2 exit shape"), :134 ("The 0/1/2 shape is bin/fusion-rules'"), Exit-Tabelle :131: Code 3 sei mit fusion-rules "not shared". Tatsächlich hat bin/fusion-rules Exit 3 = malformes context-manifest (bin/fusion-rules:116, :537-540; CLAUDE.md:24 dokumentiert es). Beide Helper teilen also den Code 3 mit VERSCHIEDENER Bedeutung.
---
Die Datei verlangt ausdrücklich, dass Prompts auf Exit-Codes keyen (:136) — ein Aufrufer, der fusion-rules-Exit-3 nach dieser Tabelle deutet, schickt den Nutzer zum Reparieren eines intakten .active-circle. Klasse 1/4, abgeleitet-falsch (Code-Lesung beider Helper, Manifest-Exit-3 ausgeführt). Reichweite: alle 16 Agenten, ausgeliefert. Analyse: 260805-1840-doku-gesamtpruefung-gegen-code.md
---
Resolved: 2026-08-06 — die "same 0/1/2 shape"-Behauptung korrigiert: die Exit-Code-Tabelle sagt "code collides" und der Folgetext warnt vor der Fehldeutung eines fusion-rules-Exit-3 als Pointer-Fehler (`rules/fusion-workbench-conventions.md:131-134`). Commit fae818b, Circle 260805-2005-textschicht-gegen-code-nachziehen (Plan-Schritt 10, Batch A).
