workbench-path-resolution.md und migrate-Skill beschreiben die Pre-v4-Pointer-Ablehnung mit falschem Mechanismus und falscher Zeilenzitation
---
Schweregrad: mittel. rules/workbench-path-resolution.md:31 (wortgleich skills/migrate/SKILL.md:16): die alte filename-with-marker-Form werde von bin/fusion-paths "with exit 3 (bin/fusion-paths:220-225)" zurückgewiesen. Die Zeilen 220-225 fangen nur Pfadtrenner und Punktsegmente; die Alt-Form (z.B. 260716-1847[t]-umbau.md) enthält keinen Slash, passiert diesen Zweig und wird erst vom Orphan-Check (Zeilen 227-231) abgelehnt. Empirisch: Alt-Pointer → rc=3 mit Orphan-Meldung, nicht mit Format-Meldung.
---
Konsequenz der falschen Mechanik: Existierte zufällig ein Verzeichnis mit dem Alt-Namen, würde der Pointer akzeptiert. Nur der Exit-Code stimmt. Klasse 2 (Zeilenzitation) + 1 (Mechanismus), verifiziert (Ausführung). Analyse: circles/260801-1244-guard-rules-write/analyses/260805-1840-doku-gesamtpruefung-gegen-code.md
