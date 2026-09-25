# Die REPLACE-Marker im Plane-Template behaupten nach dem Ausfuellen das Gegenteil

---

**Severity:** Medium
**Domain:** code
**Filed by:** coder, aus einem Befund eines konsumierenden Projekts (Nachschieben nach v5.9.0)
**Affects:** `templates/plane.config.yaml`, die drei Skalar-Felder `base_url`,
`workspace_slug`, `project_id`
**Herkunft:** Extern gemeldet. Quelldatei ausserhalb dieses Repositories unter
`.../shared/fusion-plugin-findings/260802-2236_o_stale-replace-markers-in-plane-config-caused-a-false-unwired-diagnosis.md`.
Der Befund benennt die Kommentarform des Templates ausdruecklich als fusion-Frage.
**Cross-references:** `bin/fusion-plane:148-153` (`clean_val`), `bin/fusion-plane:202-209`
(`config_valid`), `skills/setup/SKILL.md:144` (die Kopie ins workbench)

---

## Was falsch war

Das Template lieferte an jedem der drei Werte einen Zeilenendkommentar `# ← REPLACE` aus.
Der Marker ist eine **Zustandsbehauptung** ueber den Wert daneben, und er ueberlebt das
Ausfuellen. Ab dem Moment, in dem jemand den Wert setzt, behauptet der Kommentar das
Gegenteil der Wahrheit.

Das hat zweimal zu derselben falschen Diagnose gefuehrt, in zwei verschiedenen Agenten:

- 2026-07-30, Orchestrator-Session zu Circle `260730-1615-phase-header-process-flows`: hielt
  die Konfiguration fuer ein unausgefuelltes Template und bewegte die Plane-Story #90
  daraufhin von Hand durch ihre Zustaende.
- 2026-08-02, Shaper beim Grounding von `260802-2220-throwaway-plane-bridge-smoke-test`:
  derselbe Fehlschluss, in die Circle-Grounding geschrieben, bis der Nutzer korrigierte.

Der Shaper hat den Mechanismus selbst protokolliert: er las die drei Marker und schloss
daraus auf Platzhalter, ohne die Werte zu pruefen, und gab den Schluss als gepruefte
Tatsache aus statt als Inferenz.

Zwei Werte machen den Marker besonders wirksam. `base_url: http://localhost:9999` und
`workspace_slug: fusion-local` sehen wie Platzhalter aus, wenn man nicht weiss, dass eine
lokale Docker-Instanz laeuft. Nur die `project_id` unterscheidet sich sichtbar vom
Template — und ausgerechnet daneben behauptet der Marker das Gegenteil.

## Ob die Marker gelesen werden

Nein, reine Prosa. Gemessen, nicht geschlossen:

- Der Config-Leser `clean_val` (`bin/fusion-plane:148-153`) nimmt bei einem
  quotierten Wert alles bis zum schliessenden Anfuehrungszeichen; der Zeilenendkommentar
  faellt weg. Bei unquotierten Werten schneidet `sub(/[ \t]+#.*$/,"",t)` ihn ab.
- `config_valid` (`:202-209`) prueft nur, ob die drei Skalare nicht leer sind.
- `/fusion:setup` kopiert das Template genau einmal und liest seinen Inhalt nie
  (`skills/setup/SKILL.md:144`).
- Kein Test im Repository behauptet etwas ueber die Platzhalterwerte. Der einzige Test auf
  dem Template (`hooks/lib/__tests__/fusion-plane.test.ts:686,707`) prueft die
  `labels:`-Schluessel und die Abwesenheit eines Credential-Felds.

Die Umformulierung beruehrt also kein Verhalten.

---

Resolved: Die drei Marker sind weg. An ihre Stelle tritt eine Form, die nach dem Ausfuellen
von selbst richtig wird — jeder Kommentarblock nennt jetzt den Wert, mit dem das Template
**ausliefert** (`Ships as …`), statt eine Behauptung ueber den aktuellen Wert aufzustellen.
Eine Aussage ueber die Auslieferung bleibt wahr, egal was im Feld steht; ein unausgefuelltes
Feld erkennt der Leser am Wert selbst, nicht an einem Kommentar.

Dazu ein Kopfblock, der den beobachteten Fehlschluss direkt adressiert: ob die Bruecke
verdrahtet ist, beantwortet `bin/fusion-plane doctor` und nicht das Lesen dieser Datei, und
ein plausibel aussehender Wert (`http://localhost:9999`, ein kurzer Slug) ist auf irgendeiner
Instanz die echte Konfiguration. Das ist der Teil, der auch dann noch traegt, wenn jemand
spaeter wieder einen Marker einfuehrt.

Die Platzhalterwerte selbst bleiben unveraendert.
