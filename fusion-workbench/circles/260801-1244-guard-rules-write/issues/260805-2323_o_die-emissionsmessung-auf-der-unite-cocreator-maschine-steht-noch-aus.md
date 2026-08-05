Die Emissionsmessung auf der unite-cocreator-Maschine steht noch aus

---

Das zweite Falsifikat von Schritt 6 des Ausstiegsplans
(`planning/260804-2356_o_plan-ausstieg-kontextsteuer-und-auslieferung.md`) verlangt eine
Messung von `bin/fusion-rules` gegen `$FUSION_PLUGIN_ROOT` **auf der konsumierenden
Maschine nach `fusion --update`**, verglichen mit den Zahlen des Emissions-Goldens. Die
plugin-seitige Hälfte ist grün (simulierter Installationspfad, alle 16 Agenten exakt auf
den Golden-Zahlen, Beleg `history/260805-1200-coder-step6-release-vorbereitet.md`); die
Maschinen-Hälfte kann von hier aus nicht laufen, weil
`/Users/kai/Dropbox/qboot/projects/F03_digital-leadership/unite-co-creator` von dieser
Maschine nicht erreichbar ist (Plan, Offene Frage 4).

---

Das ist eine Nutzer-Aktion, kein Agent-Fix: auf der unite-cocreator-Maschine
`fusion --update` ausführen, dann die Byte-Summen von `bin/fusion-rules <agent>` gegen
`$FUSION_PLUGIN_ROOT` stichprobenartig mit dem Golden vergleichen
(`hooks/lib/__tests__/fixtures/rules-emission.golden`). Releases v5.9.0–v5.9.2 sind
getaggt und gepusht; ohne das Update dort bleibt der alte Regelsatz (105 354 Byte) aktiv.
Gefiled von der Abschluss-Reconciliation 260805-2323, damit die offene Frage des Plans
beim Schließen nicht verloren geht.
