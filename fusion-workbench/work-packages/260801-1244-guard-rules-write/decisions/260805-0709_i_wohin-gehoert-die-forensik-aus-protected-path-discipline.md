# Wohin gehört die Forensik aus `protected-path-discipline.md`?

---
**Domain:** code
**Status:** answered
**Filed by:** orchestrator, am Zuschnitt-Gate des Ausstiegsplans
**Cross-references:** `260804-2356_*_plan-ausstieg-kontextsteuer-und-auslieferung.md` Schritt 2; `260805-0645-coder-step1-emission-golden.md` (die Messung, die den Widerspruch fand); `rules/context-lean-claude-md.md`

---

## Frage

`rules/protected-path-discipline.md` ist in vier Tagen von 11 032 auf 50 559 Byte gewachsen und
wird bei jedem Dispatch jedes Agenten geladen. Der Ausstiegsplan wollte sie in Kern und Referenz
teilen und die Referenz an `coder`, `coderev` und `bugfixer` hängen.

Das Emissions-Golden aus Schritt 1 hat gezeigt, dass der Plan sich dabei widerspricht: er
behauptet, alle sechzehn Agenten laden 40 544 Byte weniger, *und* diese drei behalten
inhaltlich alles. Behalten sie alles, stehen sie bei 136 660 Byte. Umziehen ist kein Zuschnitt.

## Optionen

1. **Forensik raus aus `rules/`.** Die gemessenen Residuen und die Illustrationstabellen wandern
   als Analyse in den Workbench. Nichts gelöscht, alles in git, per Zitat auffindbar, aber kein
   Agent lädt es automatisch.
2. **Referenz vollständig für die drei behalten.** Der Deckel gilt dann für dreizehn Agenten.
3. **Kürzen statt verschieben.** Die Messtabellen werden auf Sätze plus Verweis eingedampft.

## Antwort

**Option 1**, vom Nutzer gewählt am 2026-08-05.

Drei Schichten statt zwei:

| Schicht | Umfang | Wer lädt sie |
|---|---|---|
| Kern: die Regel, die Vorhersageregel, was erlaubt bleibt, was man stattdessen tut, was ein Halt kostet | ~8 900 | alle Agenten |
| Referenz: Verb-Tabellen, `cd`-Verfolgung, Kommandowort-Auflösung, Fail-closed-Grenze | ~15 000 | `coder`, `coderev`, `bugfixer` |
| Forensik: Residuen-Katalog, Illustrationen, Messtabellen | ~26 000 | niemand automatisch |

Die tragende Unterscheidung ist nicht Größe, sondern Adressat. Der Kern sagt einem Agenten, wie
er sich verhalten soll. Die Referenz sagt jemandem, der den Klassifizierer ändert, wie er
funktioniert. Die Forensik belegt, wie er sich in acht gemessenen Fällen verhalten hat — das ist
Beweis für eine Prüfung, nicht Anweisung für ein Verhalten.

Option 3 wurde nicht gewählt und war auch die einzige, die dem früheren „nichts löschen"
widersprochen hätte. Option 1 löscht nichts; sie nimmt nur den automatischen Ladepfad weg.

## Verpflichtungen

- **Die Forensik muss zitierbar bleiben.** Der Kern verweist auf sie mit Pfad, sonst ist sie
  verschwunden statt verschoben.
- **Der Umzug darf keine Messung entwerten.** Die Tabellen belegen geschlossene Issues; wenn ein
  Issue-Record seine Evidenz nur über die Regeldatei hat, muss die Referenz mitwandern.
- **Nicht auf den Deckel hin zuschneiden.** Wenn die drei Coding-Agenten nach dem Schnitt immer
  noch darüber liegen, ist das ein Befund und kein Grund, Inhalt zu opfern. Inhalt an eine Zahl
  anzupassen ist die Fehlerrichtung, die dieser Circle achtmal vorgeführt hat.

---
Answered: dieser Record, `## Antwort` — Nutzerwahl am Zuschnitt-Gate; die Trennlinie ist der Adressat, nicht die Größe.

Implemented: Plan-Schritt 2, `260805-0717-coder-step2-drei-schichten.md` — drei Schichten
geschnitten: Kern 16 346 (alle 16 Agenten), Referenz `rules/protected-path-internals.md` 20 754
(`coder`, `coderev`, `bugfixer`, über ein eigenes Agenten-Flag statt über das `coding`-Muster, das
zusätzlich `planner` erfasst hätte), Forensik
`260805-0717-protected-path-forensics.md` 19 090 (kein Emissionspfad). Kein Byte
gelöscht, auf Wort-Token-Ebene geprüft: 4 von 8 559 Token geändert, alle vier dokumentierte
Querverweis-Umlenkungen. Alle drei Verpflichtungen erfüllt; die dritte als Befund: nach dem
Schnitt liegt **kein** Agent unter dem Release-Deckel von 105 354 (110 931 / 116 604 / 131 685),
und die Plan-Projektion von 104 600 hat die sechs Diagramm-Agenten nie mitgerechnet. Commit durch
den Orchestrator.

---
Retired: `fa2f00b` (260812-1232_*_remove-the-protected-path-half-of-the-compliance-guard.md) — die Dreischichtung ist auf eine Schicht zusammengefallen. Kern und Referenz waren `rules/protected-path-discipline.md`, die als immer-aktive Regel geloescht wurde (10 420 Byte pro Dispatch); damit ist auch die Verpflichtung "die Forensik muss zitierbar bleiben" ohne Traeger, denn der Kern war der Verweis. Erhalten ist allein die Forensik selbst, `260805-0717-protected-path-forensics.md`, jetzt ohne die Datei, aus der sie ausgelagert wurde.
