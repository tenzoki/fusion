# Schritt 1: Die Schutzliste verliert das Zustandsverzeichnis

**Datum:** 2026-08-07
**Agent:** ontocoder
**Status:** Complete
**Circle:** `260807-0923-guard-misst-statt-orakelt`
**Plan:** `260807-0931_*_plan-guard-misst-statt-orakelt.md`, Schritt 1 und Entscheidung 1

## Was geändert wurde

`"fusion-workbench/.guard-state/**"` ist aus `guard.protectedPaths` entfernt, in beiden Dateien:

- `hooks/config.json` — die Liste hält noch acht Einträge statt neun
- `hooks/config.example.json` — dieselbe Liste, dieselbe Änderung

Beide Dateien parsen (`json.load`), die Einrückung und die Reihenfolge der übrigen Einträge sind unverändert, das Komma der Vorzeile ist nachgezogen. Der `_comment` in `hooks/config.json` nennt `.guard-state/` weiterhin als Ort des Laufzeitzustands; das bleibt richtig und ist keine Schutzaussage.

Nichts unter `hooks/lib/` angefasst. Nicht committet.

## Der Entscheidungssatz

`260807-0945_*_integritaet-des-eskalationsspeichers.md`

Hält die Halt-Integrität als eigene, offene Frage fest: ein Agent kann `fusion-workbench/.guard-state/escalation.json` löschen und damit seinen eigenen Halt aufheben. Bis heute war das durch die Schutzliste gedeckt, künftig nicht mehr; der Nutzer hat den Verzicht am 260807-0945 in Kenntnis dieser Folge bestätigt. Der Satz nennt vier denkbare Antworten (Zustand außerhalb der Workbench ablegen; Zustand signieren und beim Lesen prüfen; Halt aus dem Ereignisstrom rekonstruieren; den Verzicht als dauerhaft dokumentieren) und gibt keine Empfehlung ab — die Wahl setzt ein Bedrohungsmodell voraus, das dieser Circle nicht geklärt hat.

Zum Ablageort: `bin/fusion-paths ontocoder` gibt **kein** `OUT_DECISION` aus, weil `agents/ontocoder.md` den Schlüssel nirgends nennt und der Resolver die Schlüsselmenge aus dem Prompt ableitet. Der Ort ist stattdessen aus der Circle-Hälfte von `SCAN_DECISIONS` und der Herkunftsregel abgeleitet. Als Defekt abgelegt: `260807-0952_*_ontocoder-kann-keinen-entscheidungssatz-ablegen.md`.

## Weitere Fundstellen, unverändert gelassen

Der Eintrag oder eine Zusicherung darauf steht an neun weiteren Stellen. Keine davon wurde angefasst; die Zuordnung zu den Plan-Schritten steht in Klammern.

| Stelle | Art | Plan |
|---|---|---|
| `hooks/tracker.ts:36` | `TRACKER_NOISE_FILES` — schließt `.guard-state/**` von Churn- und Ping-Back-Messung aus. Eigene Liste, kein Bezug auf `config.json`. | von keinem Schritt genannt |
| `hooks/lib/__tests__/config.test.ts:247` und `:497` | zwei Zusicherungen auf den Eintrag; der Kommentar bei `:491` spricht von "all nine patterns" | S5 (dort ausdrücklich als "die drei `.guard-state`-Zusicherungen" benannt) |
| `hooks/lib/__tests__/reachability-corpus.test.ts:70` und `helpers/reachability-corpus.ts:136` | spiegelt die Liste aus `config.json` und vergleicht sie | S5 (Datei wird gelöscht) |
| `hooks/lib/__tests__/bash-mutation-guard.test.ts:40`, `:3885` | Testliste und eine Zusicherung auf den Ablehnungsgrund | S5 (Datei wird gelöscht) |
| `hooks/lib/__tests__/fixtures/mutation-verdicts-head.json:13` | Gold-Fixture, führt die Liste mit | S5 (Datei wird gelöscht) |
| `hooks/lib/__tests__/paths.test.ts:132` | lokale Beispielliste im Test, liest `config.json` nicht — bleibt grün | von keinem Schritt genannt |
| `rules/protected-path-discipline.md:36` | nennt den Eintrag als Vorgabe des Plugins | S6 |
| `README-hooks.md:184` | nennt den Eintrag im Absatz zur Selbstschutz-Lücke von `fusion-guard.json` | S6 |
| `hooks/dist/**` | Kompilat, wird beim nächsten Bau erzeugt | — |

`hooks/tracker.ts:36` und `hooks/lib/__tests__/paths.test.ts:132` stehen in keinem Schritt des Plans. Der Test bleibt richtig (die Liste dort ist ein Beispiel, keine Spiegelung). `tracker.ts` bleibt nach heutigem Stand ebenfalls richtig, weil die Zeile eine Rausch-Unterdrückung ist und keine Schutzaussage — S2 baut `tracker.ts` allerdings ohnehin um und sollte die Zeile dabei bewusst bestätigen statt sie mitzuziehen.

`fusion-guard.json` und `templates/fusion-guard.json` führen den Eintrag nicht: beide deklarieren nichts und erben alles.

## Prüflauf

`npm test` in `hooks/`, zwei Läufe.

Zweiter Lauf: **10 Fehlschläge in 6 Dateien, 1667 Tests grün.** Alle zehn sichern zu, dass `.guard-state/` geschützt ist, und sind der erwartete Zwischenzustand; S5 räumt sie ab.

| Datei | Fehlschläge |
|---|---|
| `bash-mutation-guard.test.ts` | 1 — "is the list hooks/config.json actually ships" |
| `config.test.ts` | 2 — "still names every path the shipped plugin config protects" (`:249`), "does not empty the protected list on the way past" (`:498`) |
| `guard-bash-integration.test.ts` | 2 — `rm -rf fusion-workbench/.guard-state` direkt und über `cd` |
| `guard-case-folding.test.ts` | 2 — dieselbe Datei in Großschreibung, je einmal Shell und Schreibwerkzeug |
| `guard-rules-write-integration.test.ts` | 2 — "collapsed spelling `./fusion-workbench/.guard-state/…`" (`:1354`), "one write unprotects the guard's own state" (`:2316`) |
| `reachability-corpus.test.ts` | 1 — "mirrors the shipped hooks/config.json" |

Alle sechs Dateien stehen in S5, entweder zum Löschen (`bash-mutation-guard.test.ts`, `reachability-corpus.test.ts`) oder zum Bearbeiten (die übrigen vier).

Der erste Lauf hatte einen elften Fehlschlag in `rules-emission-golden.test.ts` (`critical-stance.md` 5317 → 5366 Byte). Der gehört nicht zu dieser Änderung: `rules/critical-stance.md`, `agents/planner.md` und `hooks/lib/__tests__/fixtures/rules-emission.golden` waren im Arbeitsverzeichnis bereits verändert, das ist Schritt 8. Zwischen den beiden Läufen wurde die Gold-Fixture nachgezogen, und der Test war im zweiten Lauf grün.
