README.md nennt FUSION_REF=tags/v5.3.0 als Pin-Beispiel — der Tag existiert nicht, die Installation schlägt fehl
---
Schweregrad: hoch (einziger Befund, der eine Nutzer-Anleitung direkt bricht). README.md:26: "FUSION_REF (git ref, e.g. FUSION_REF=tags/v5.3.0 to pin a release)". Tags beginnen bei v5.5.0 (CLAUDE.md:74: "Tagging started at v5.5.0"; git tag -l bestätigt). Wer das Beispiel kopiert, lädt .../refs/tags/v5.3.0.tar.gz und bekommt 404.
---
install.sh:27 hat das korrekte Beispiel (tags/v5.9.1). CLAUDE.md:93 verlangt selbst, das Beispiel pro Release aufzufrischen — README.md wurde dabei übersehen. Klasse 1 (via Klasse 2: Verweis löst nicht auf), verifiziert. Reichweite: jeder Endnutzer, der ein Release pinnen will. Analyse: circles/260801-1244-guard-rules-write/analyses/260805-1840-doku-gesamtpruefung-gegen-code.md
