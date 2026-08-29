`fusion-guard.json` behauptet weiter, der Selbstschutz verweigere auf der Shell
---
Der Schlüssel `_protectsItself` in `fusion-guard.json` (Projektwurzel) und in `templates/fusion-guard.json` sagt: "Editing, moving or deleting it is denied on the write tools and through the shell alike." Auf der Shell wird seit dem Umbau nichts mehr verweigert — der Befehl läuft, und die Messung schreibt die Datei danach zurück. Die Eigenschaft (die Datei ist aus einer Agenten-Sitzung heraus nicht dauerhaft veränderbar) besteht fort, der genannte Mechanismus nicht.

Zu tun: den Halbsatz "and through the shell alike" durch eine Formulierung ersetzen, die das Zurückschreiben nennt statt einer Verweigerung. Beide Dateien sind byte-identisch zu halten — `hooks/lib/__tests__/config.test.ts` pinnt das.

Ausführer: ontocoder (`.json`).
---
Gefunden in Schritt 5 des Plans `260807-0931_*_plan-guard-misst-statt-orakelt.md`, beim Durchsehen der Zusicherungen zum Selbstschutz-Boden. Die zwei Zusicherungen in `guard-rules-write-integration.test.ts`, die den Boden gegen `rm fusion-guard.json` und gegen ein zweites `cp` der Vorlage prüften, sind in Schritt 5 gefallen, weil sie ein PreToolUse-Verdikt behaupteten, das es nicht mehr gibt; gedeckt ist der Boden weiter durch `protected-snapshot-integration.test.ts` (`still protects fusion-guard.json itself under a declared empty list`, `reverts a protected file that was deleted`).

Warum nicht in Schritt 5 behoben: `.json` gehört ontocoder, und die Datei steht in keiner Dateiliste von Schritt 6 — sie würde sonst still zwischen zwei Schritten hindurchfallen. `/fusion:setup` sät die Vorlage in jedes Konsumprojekt, der Satz wird dort also gelesen.

---
Resolved: Der Halbsatz "denied on the write tools and through the shell alike" ist in `fusion-guard.json` und `templates/fusion-guard.json` durch die Beschreibung der Messung ersetzt — Fingerabdruck vor und nach dem Aufruf, Rückschreiben des Vorher-Inhalts, Halt, gleichermaßen für Schreibwerkzeuge und Shell und unabhängig vom Weg zur Datei. Beide Dateien sind weiterhin byte-identisch; `hooks/lib/__tests__/config.test.ts` 72 grün.
