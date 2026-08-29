# Goldfixture nachgezogen, Selbstschutz-Text auf die Messung umgestellt

**Agent:** ontocoder
**Datum:** 260807-1204
**Status:** Complete
**Circle:** `260807-0923-guard-misst-statt-orakelt`
**Plan:** `260807-0931_*_plan-guard-misst-statt-orakelt.md`, Schritt 7
**Befund:** `260807-1155_*_fusion-guard-json-behauptet-weiter-eine-shell-verweigerung.md`

## Teil 1 — die Emissions-Goldfixture

`hooks/lib/__tests__/fixtures/rules-emission.golden` neu erzeugt, nicht von Hand
gerechnet:

```
cd hooks && UPDATE_RULES_GOLDEN=1 npx vitest run lib/__tests__/rules-emission-golden.test.ts
```

Der Lauf schreibt die Fixture und fällt danach absichtlich; der zweite Lauf ohne
Flag ist grün (9 Zusicherungen). Der Diff umfasst 48 geänderte Zeilen, drei je
Agentenblock:

| Zeile | vorher | nachher | Delta |
|---|---:|---:|---:|
| `protected-path-discipline.md` | 21.063 | 5.919 | −15.144 |
| `git-branch-discipline.md` | 6.299 | 6.432 | +133 |
| `total` | je Rolle | je Rolle | −15.011 |

Die Summen der fünf Rollen: 96.285 → 81.274 (nur Kern, 8 Agenten), 101.958 →
86.947 (`design-diagrams.md`, 5), 105.590 → 90.579 (`circle-records.md`, 1),
111.263 → 96.252 (beide, 1), 116.798 → 101.787 (`circle-records.md` +
`workbench-stash-and-lock.md`, Orchestrator). Damit steht erstmals jede Rolle
unter `RELEASE_CAP` (105.354).

**Zwei Erwartungen des Plans trafen nicht zu.** Beide nachgemessen, nicht
angenommen:

1. `protected-path-internals.md` sollte "aus den drei Guard-Blöcken
   verschwinden". Die Datei stand in der Fixture nie: sie misst den
   Konsum-Kontext (leeres Arbeitsverzeichnis, kein Plugin-Manifest), und dort war
   die Emission seit dem 06.08. auf `bin/fusion-plugin-cwd` gegated.
   `grep -c protected-path-internals` auf der alten Fixture ergibt 0.
2. Dafür stand eine Zeile offen, die der Plan nicht nennt:
   `git-branch-discipline.md` ist in Schritt 6 um 133 Byte gewachsen
   (Querverweis auf die Schwesterregel, Commit `436d78c`), die Fixture trug noch
   6.299. Sie ist mit derselben Neuerzeugung mitgezogen.

**`RULE_BASELINE` bleibt unangetastet**, wie beauftragt. Die Zahlen, die für
einen Neuschnitt sprächen, damit die Entscheidung eigenständig getroffen werden
kann:

| Datei | Baseline | heute | Delta |
|---|---:|---:|---:|
| `protected-path-discipline.md` | 19.943 | 5.919 | −14.024 |
| `critical-stance.md` | 5.317 | 9.482 | +4.165 |
| `workbench-stash-and-lock.md` | 9.250 | 11.208 | +1.958 |
| `fusion-workbench-conventions.md` | 34.671 | 35.668 | +997 |
| `git-branch-discipline.md` | 6.299 | 6.432 | +133 |
| `decision-record-examples.md` | 4.191 | 4.291 | +100 |
| `user-facing-output.md` | 16.683 | 16.690 | +7 |
| `circle-records.md` | 9.302 | 9.305 | +3 |
| `agent-setup.md`, `design-diagrams.md` | unverändert | | 0 |

Jede Rolle steht damit unter ihrem eigenen Boden: vier Rollen um 8.622 Byte, die
Orchestrator-Rolle um 6.661. Der Bericht rechnet Wachstum von diesem Boden aus,
also gewährt er derzeit 12.000 + 8.622 = 20.622 Byte stillen Spielraum, bevor er
eine Aufräumaktion anmahnt. Das ist das Argument für den Neuschnitt, und der
Kopf der Testdatei nennt genau diesen Zeitpunkt ("after somebody has done the
cleanup the report asked for").

Ein Gegenargument gehört dazu: ein Neuschnitt senkt den Boden der
Orchestrator-Rolle von 108.448 auf 101.787 und damit unter `RELEASE_CAP`. Die
Pflicht zur Begründung (`overRelease`) greift auf den Boden, nicht auf den
Ist-Wert — sie erlischt damit still, und die einzige Begründung, die die Datei
heute trägt, wird gegenstandslos, ohne dass eine Zusicherung darauf hinweist.
Nicht nebenbei entschieden.

## Teil 2 — der Selbstschutz-Text in `fusion-guard.json`

Der Schlüssel `_protectsItself` behauptete, das Verändern der Datei werde "denied
on the write tools and through the shell alike". Ersetzt durch die Beschreibung
des heutigen Mechanismus: Fingerabdruck vor dem Werkzeugaufruf und noch einmal
danach, bei Abweichung wird der Vorher-Inhalt zurückgeschrieben und gehaltet;
das gilt für Schreibwerkzeuge und Shell gleichermaßen und unabhängig vom Weg zur
Datei. Der zweite Halbsatz (die Schutzliste nennt den Pfad, den der Lader
tatsächlich gelesen hat) bleibt, er stimmt weiter — `lib/config.ts:685-692`
trägt beide Schreibweisen.

Die übrigen Aussagen des Schlüssels sind gegengeprüft und weiter richtig:
`floorApplies` hängt an `existsSync`, also bleibt das Anlegen erlaubt und die von
`_gitTracked` benannte Lücke besteht unverändert; `FUSION_ALLOW_RULES_WRITE`
erreicht die Datei nicht.

Beide Dateien sind byte-identisch gehalten (`cmp` sauber, `fusion-guard.json` per
`cp` in `templates/fusion-guard.json` gespiegelt). `grep` über das ganze
Repository findet keine weitere Kopie des alten Halbsatzes.

Der Befund ist mit `Resolved:` geschlossen und auf `_c_` umbenannt.

## Prüfung

- `npx vitest run lib/__tests__/rules-emission-golden.test.ts` — 9 grün
- `npx vitest run lib/__tests__/config.test.ts` — 72 grün, darunter die
  Byte-Gleichheit von Wurzelkopie und Vorlage
- `npx vitest run` (Gesamtsuite) — **1.001 grün, 0 rot**, 30 Dateien. Die zwei
  roten Zusicherungen aus Schritt 5 sind damit beide weg: die Goldfixture durch
  diese Arbeit, `reference-resolution-lint.test.ts` durch den parallel laufenden
  coder.

## Berührte Dateien

- `hooks/lib/__tests__/fixtures/rules-emission.golden` (neu erzeugt)
- `fusion-guard.json`
- `templates/fusion-guard.json`
- `fusion-workbench/circles/260807-0923-guard-misst-statt-orakelt/issues/260807-1155_c_*.md` (geschlossen)
- `260807-0931_*_plan-guard-misst-statt-orakelt.md` (Schritt 7 auf DONE)

Nicht committet, wie beauftragt.
