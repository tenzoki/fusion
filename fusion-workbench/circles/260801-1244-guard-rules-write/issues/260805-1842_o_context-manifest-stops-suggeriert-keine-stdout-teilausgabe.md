context-manifest.md: "stops with a clear error ... does not silently emit a partial set" — bei malformem Manifest steht das Basis-Set bereits auf stdout
---
Schweregrad: niedrig. rules/context-manifest.md:145-147. Ausgeführt: Bei malformem Manifest ist das komplette Always-on-Set bereits emittiert, dann stderr + exit 3. Nicht silent (Kernzusage hält), aber ein Aufrufer, der Exit-Codes ignoriert, erhält ein plausibel aussehendes Teilset — die "half-loaded context"-Lage, vor der der Absatz warnt. Kontrast: bin/fusion-paths puffert seine gesamte Ausgabe vor dem ersten Write (bin/fusion-paths:339-344).
---
Klasse 4, verdächtig (Verhalten verifiziert; ob die Formulierung als falsch gilt, ist Auslegung). Analyse: circles/260801-1244-guard-rules-write/analyses/260805-1840-doku-gesamtpruefung-gegen-code.md
