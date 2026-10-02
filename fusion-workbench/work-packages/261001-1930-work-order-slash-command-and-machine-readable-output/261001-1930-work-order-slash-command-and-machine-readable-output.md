# A slash command reports the computed work order, and bin/fusion-work-order emits it machine-readably for consumers

---
**Domain:** code
**Status:** claimed
**Claim:** 5e8248d7 — Kai Stalmann <ks@qantr.com>, 261001-2139
**Active spec/plan:** 261001-1934_*_spec-work-order-slash-command-and-machine-readable-output.md (spec), 261002-0733_*_plan-work-order-markdown-and-json-formats.md (plan)
**Cross-references:** 260917-1338-depends-on-kanten-automatisch-erzeugen.md, 260908-2018-prerequisites-confirmed-once-order-computed.md, 261001-1955_*_plan-work-order-slash-command-and-tsv-output.md
**Filed by:** user, Kai Stalmann <ks@qantr.com>

---

## Directive

The user's words, 261001-1930: "Mach daraus eine Paket, lass es spezifizieren und planen", said of two answers the consultant gave in conversation. Both are quoted below as the user pasted them; they are the brief.

Two parts, one item. **(1)** A wrapper skill (working name `/fusion:work-order`) that locates the workbench, runs `bin/fusion-work-order`, renders its `KEY=value` block and table readably in the chat language and repeats the `note=` line visibly, and nothing more; the mechanics stay in the helper header, as with the other wrapper skills. Invocation by a skill body stays invocation by a person, so decision `260909-1808_*_may-a-helper-compute-an-order-over-work-items-after-the-portfolio-layer-goes.md` (option 3: read and report, never rank) still holds. **(2)** `bin/fusion-work-order` gains a machine-readable output format (for example `--format tsv` or `json`: item, status, depends-on, depth, blocked, order, readiness), so a consumer can project its own artefacts onto fusion's computed order instead of parsing `**Status:**` and `**Depends-on:**` a second time. No new runtime dependency, no convention change, no ruling touched; fusion does not write spreadsheets. The consumer-side switch (axibra-5's `pakete.py` / `reihenfolge.py`) is a separate item in that project and out of scope here.

The item is reached when both ship in a released fusion version with `npm test` green, the README sentence and skills listing name the new caller, and `plugin.json` is bumped.

## The consultant's answers, as pasted by the user

> und wie rufe ich in dem consumer das fusion-eigene Gegenstück, das nur die Ordnung berechnet, auf?

Aus dem Consumer-Projekt heraus, in der Shell: `"$(fusion --where)/bin/fusion-work-order"`

> könnte man das als slash befehl bauen?

Ja, das geht, und es passt heute auch in die Wachstumsgrenze: Die Skill-Oberfläche hat gerade 24 950 Bytes Luft, ein Wrapper-Skill nach dem Muster von /fusion:news oder /fusion:wp braucht etwa 5–8 KB. Der Grund, aus dem das im September verworfen wurde — 174 Bytes Luft damals — gilt seit den Anhebungen vom 16./17.09. nicht mehr.

Was der Skill tun würde: fusion-workbench-root prüfen, bin/fusion-work-order ausführen, den KEY=value-Block und die Tabelle in Chat-Sprache lesbar machen und die note=-Zeile sichtbar wiedergeben. Mehr nicht — die Mechanik bleibt im Helper-Header, wie bei den anderen Wrapper-Skills. Ein Skill-Body ist ein Nutzer-Prompt; damit bleibt der Aufruf "durch eine Person", was die Entscheidung 260909-1808 (Option 3: lesen und berichten, nie ranken) weiterhin erfüllt.

Drei Dinge müsste der Implementierer mit anfassen: den Satz "by a person and by nothing else — … no pipeline step invokes it" in README-hooks.md:229 (ein Skill ist kein Pipeline-Schritt, aber der Satz soll den neuen Aufrufer nennen), die Skills-Liste in README-agents.md, und die Versionsnummer in plugin.json.

Details (consultant): Luft = Baseline 188 768 + Head-room 39 260 − Ist 203 078 = 24 950 Bytes (`hooks/lib/__tests__/surface-growth-bound.test.ts:164-178, :246`); damalige Ablehnung im Dropped-Vermerk von `260917-1338-depends-on-kanten-automatisch-erzeugen` ("174 bytes of head-room at 04a1ed8d"); Muster-Skill `skills/news/SKILL.md:1-40`; Ruling `bin/fusion-work-order:76-84`, Konvention `rules/fusion-workbench-conventions.md:239`; Vergleich `wp/SKILL.md` 4 994 B, `reconcile/SKILL.md` 6 671 B. Nicht geprüft: ob ein Derivable-Enumerations-Lint die Skills-Liste in README-agents.md abgleicht.

> das make timebox existiert ja nun nur im consumer. was braucht es um das nach fusion zu übernehmen so dass es in den consumern genutzt werden kann, statt es in den consumern zu bauen?

Kurz: Das Ganze nach fusion zu übernehmen lohnt nicht, aber ein klar abgegrenzter Teil davon — der Export der berechneten Ordnung — gehört tatsächlich nach fusion. Projektspezifisch bleiben (rund 2 200 von 3 200 Zeilen) `blocks.py` (axibra-5-Literale: Positionen, Aufwand, Go-Live-Blöcke, Raten, Szenarien), EDGES und AKTENINTERNE_ORDNUNG in `reihenfolge.py` und die Fußzeile `Blattpositionen:`. fusion hat dafür kein Feld; Aufwand und Kapazität wurden beim Zuschnitt von 260908-2018 ausdrücklich ausgeschlossen, und das Portfolio-Layer kehrt nicht zurück.

Doppelt und nach fusion gehörend: `pakete.py` ist ein zweiter Parser für `**Status:**` und `**Depends-on:**` neben `hooks/lib/work-graph.ts`, und `reihenfolge.py` rechnet Tiefe und transitives Blockieren noch einmal. Die integrale Lösung: `bin/fusion-work-order` bekommt ein maschinenlesbares Ausgabeformat (etwa `--format tsv` oder `json`: Paket, Status, Depends-on, Tiefe, Blockiert, Reihenfolge, Bereitschaft); der Consumer liest diese Ausgabe und behält seine Zeitbox-Mappe als Projektion darauf. Kein neuer Laufzeitbedarf (die Hooks laufen mit nacktem node ohne node_modules, `README-hooks.md:117`), keine Konventionsänderung, kein Ruling berührt. Nicht empfohlen: fusion ein Excel schreiben lassen.

Inferenz des Consultants, nicht gemessen: dass `reihenfolge.py`s `tiefe()` / `transitiv_blockiert()` dasselbe liefern wie `work-graph.ts`.
