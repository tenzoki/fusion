fusion-rules meldet bei Manifest-Unit ohne agents: wörtlich "is missing zgents:'" — der awk-Hex-Escape frisst das a
---
Schweregrad: mittel. rules/context-manifest.md:145 verspricht "a clear error on stderr"; bin/fusion-rules-Header ebenso ("fails LOUDLY"). Ausgeführt mit einem Wegwerf-Manifest: die Meldung lautet "fusion-rules: malformed context-manifest.yaml: unit 'rules/big-doc.md' is missing zgents:'". Ursache: bin/fusion-rules:452 enthält im awk-String `\x27agents:` — awks Hex-Escape ist gierig, `\x27a` wird als 0x27a gelesen und ergibt `z`.
---
Nur diese eine Meldung ist betroffen (alle anderen `\x27` enden vor einem Hex-Zeichen). Exit 3 selbst stimmt. Konsumenten mit fehlerhaftem Manifest bekommen die verwirrende Diagnose genau im Moment des Fehlers. Klasse 1, verifiziert (Ausführung). Analyse: circles/260801-1244-guard-rules-write/analyses/260805-1840-doku-gesamtpruefung-gegen-code.md
---
Resolved: 2026-08-06 — alle acht `\x27` im eingebetteten awk-Programm durch das begrenzte Oktal `\047` ersetzt; byte-genaue Message-Assertions in `context-manifest.test.ts`. Commit 7ef2715, Circle 260805-2005-textschicht-gegen-code-nachziehen (Plan-Schritt 7).
