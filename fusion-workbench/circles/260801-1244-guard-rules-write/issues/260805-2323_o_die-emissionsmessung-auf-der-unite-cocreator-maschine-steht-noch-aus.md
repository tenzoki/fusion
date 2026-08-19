Die Emissionsmessung auf der unite-cocreator-Maschine steht noch aus

---

Das zweite Falsifikat von Schritt 6 des Ausstiegsplans
(`planning/260804-2356_*_plan-ausstieg-kontextsteuer-und-auslieferung.md`) verlangt eine
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

---

**Reconciliation 260819-1453 (reconciler, Domain `code`, Circle-store pass) — STAYS `_o_`. The tree cannot decide this one, and the measurement as specified is no longer performable.**

Two separate statements, and only the second is new.

**Undecidable from here, as it was when filed.** Whether `fusion --update` was ever run on the unite-cocreator machine is a fact about a machine this repository cannot reach. Nothing at HEAD reports it, no event log records it, and no amount of reading this tree will settle it. Per the reconciliation rule, the marker stays.

**What has changed is that the comparison it names has expired.** The falsification asked for the byte sums of `bin/fusion-rules <agent>` against `$FUSION_PLUGIN_ROOT` to be checked against `hooks/lib/__tests__/fixtures/rules-emission.golden` for releases v5.9.0–v5.9.2, and named 105 354 bytes as the rule set that would still be active without the update. Neither number is a target any more:

- The golden has been regenerated repeatedly since — most recently in this session's own range — and the always-on set has both grown and shrunk since v5.9.x, notably losing `rules/protected-path-discipline.md` (10 541 bytes) on 2026-08-12.
- The agent roster the golden ranges over is no longer sixteen. `investigator` and `conceptrev` left on 2026-08-15.
- Twelve tagged releases separate v5.9.2 from `v10.3.0` at HEAD.

So a machine still running v5.9.x would not merely be one release behind; it would be missing four mechanism removals, a configuration-file rename (`fusion-guard.json` → `fusion.json`) and the entire v10 guard change. **That makes the underlying question larger rather than smaller, which is the reason to leave this open rather than close it as expired.** The specific byte comparison is dead; the thing it was a proxy for — is the consuming machine running the plugin this repository thinks it is running — is now worth more than it was.

**What would settle it**, and it remains a user action rather than an agent fix: on that machine, run `fusion --update`, then `bin/fusion-turn-budget` and `bin/fusion-rules <agent> | xargs wc -c`, and compare against the golden **at that release**, not against the numbers written in this record.
