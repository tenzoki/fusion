templates/fusion-guard.json beschreibt den Merge als "per top-level key, REPLACES whole, fällt auf built-in default zurück" — der Code merged per Leaf mit Plugin-Zwischenschicht
---
Schweregrad: hoch (das Template wird von /fusion:setup an jede Konsumenten-Projektwurzel kopiert und ist die Anleitung für die Guard-Konfiguration). templates/fusion-guard.json:6 (_override): das geschriebene Objekt ersetze das Plugin-Objekt als Ganzes, ausgelassene Felder fielen auf fusions eingebauten Default zurück. Tatsächlich seit Entscheidung 260804-1630_*_what-does-a-project-guard-object-inherit-for-a-key-it-does-not-supply.md: Merge per Leaf (hooks/lib/config.ts:15-33, pickGuard: project ?? plugin ?? DEFAULTS) — ein ausgelassenes Feld fällt zuerst auf die Plugin-Datei zurück, und Narrowing funktioniert im Leaf-Merge ausdrücklich weiter.
---
Wer der Template-Beschreibung folgt, versteht das Sicherheitsverhalten falsch (praktische Folge mild: Vererbung großzügiger als beschrieben). Klasse 1/5, verifiziert-falsch (Code gelesen; Merge-Verhalten nicht dynamisch ausgeführt). Analyse: 260805-1840-doku-gesamtpruefung-gegen-code.md
---
Resolved: `_override` in `templates/fusion-guard.json` (und der byte-identischen Wurzelkopie
`fusion-guard.json`) komplett um die Leaf-Regel neu geschrieben (ontocoder, Plan-Schritt 6,
2026-08-05): deklarierter Key gilt exakt wie geschrieben, ausgelassener Key erbt zuerst vom
Plugin-`hooks/config.json` und erst danach vom eingebauten Default, deklarierte leere Liste
bleibt leer, und der eingebaute Default der Schutzliste ist ausdrücklich als leere Liste
benannt. Gedeckt durch `hooks/lib/config.ts:628-631` (pickGuard) und die Testfälle in
`config.test.ts` unter "merge — per leaf: project, then plugin, then DEFAULTS". Session:
`260805-2222-ontocoder-step6-guard-template-rewrite.md`.
