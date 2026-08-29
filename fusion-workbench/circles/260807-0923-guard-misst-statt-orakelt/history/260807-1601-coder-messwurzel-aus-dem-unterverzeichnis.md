# Die Messwurzel aus einem Unterverzeichnis — erst gemessen, dann korrigiert

---
**Agent:** coder
**Status:** Complete
**Circle:** `260807-0923-guard-misst-statt-orakelt`
**Ausgangspunkt:** Directive des Nutzers, ausdrücklich zweistufig: erst messen, dann entscheiden
**HEAD zu Beginn:** `e684eae` (release: v6.0.0)
**Befund:** `circles/260801-1244-guard-rules-write/issues/260804-2100_o_*`
**Reconciliation:** `260807-1526-reconciliation.md` § IV

---

## Teil 1 — die Messung, vor jeder Korrektur

Der zu prüfende Befund war in der Abschluss-Reconciliation ausdrücklich als **abgeleitet und
nicht gemessen** gekennzeichnet: die Schutzmessung wurzelt an `process.cwd()` ohne
Aufwärtssuche, die Konfiguration läuft aufwärts, also fände die Aufzählung aus einem
Unterverzeichnis unter `rules/**` nichts.

Gebaut wurde `hooks/lib/__tests__/protected-snapshot-subdirectory.test.ts` über
`helpers/guard-harness.ts`: echtes Fremdprojekt auf der Platte, beide Hooks als echte
Unterprozesse, cwd auf ein Unterverzeichnis gesetzt, ausgelieferte Schutzliste, echtes
`/bin/sh` als Schreiber.

**Ergebnis: Ausgang 2.** Der Befund trifft zu.

| Aufruf, cwd `<projekt>/sub` | Ergebnis |
|---|---|
| `/bin/sh` überschreibt `<projekt>/rules/x.md` | Datei **bleibt verändert**. Kein Rollback, kein Halt, kein `guard_block`, kein Satz an das Modell. |
| Fingerabdruck, den `guard.ts` geschrieben hat | `cwd: <projekt>/sub`, **kein Eintrag** für `rules/x.md`; `settings.json` und `.claude-plugin/plugin.json` beide `ABSENT`. |
| Wohin der Zustand geschrieben wurde | `<projekt>/fusion-workbench/.guard-state/` — die Konfiguration lief also aufwärts, die Messung nicht. Die Asymmetrie in einem Aufruf sichtbar. |
| `/bin/sh` überschreibt `<projekt>/sub/rules/y.md` | **Zurückgeschrieben und Halt**, obwohl dieser Pfad auf der Schutzliste des Projekts unter keiner Schreibweise steht. |

Die zweite Richtung war die Bedingung dafür, dass die Messung etwas aussagt statt nur etwas zu
vermissen: der Guard schützte ein `rules/`, das es nicht geben muss, und ließ das ungeschützt,
das es gibt.

Die Vorher-Fassung der Testdatei — die, die das defekte Verhalten festhält — liegt als
Beleg im Scratchpad dieser Sitzung (`pre-fix-measurement.test.ts`); die versionierte Datei
trägt seit der Korrektur das richtige Verhalten und im Kopf das gemessene Vorher.

## Teil 2 — die Korrektur

**Die Messwurzel** ist jetzt `measurementRoot()` in `hooks/lib/protected-snapshot.ts`, also
`findWorkbenchRoot()` — dieselbe Wurzel, die die Konfiguration schon benutzt. `guard.ts` und
`tracker.ts` lesen beide von dort statt von `process.cwd()`. Im Tracker steht die
Null-Prüfung **vor** `loadSnapshot()`, damit ein liegengebliebener Fingerabdruck aus einer
früheren Sitzung nicht gegen ein Projekt verglichen wird, das der Hook nicht anfassen darf.

**Die Stilllegung im eigenen Repo musste mitziehen, und das war kein Nebenaspekt.**
`isFusionPluginCwd()` prüft cwd ohne Aufwärtslauf und antwortet aus
`<fusion-repo>/fusion-workbench` mit *nein* — dem Verzeichnis, in dem eine fusion-Sitzung
gewöhnlich startet, und in dem diese Sitzung startete. Nur die Messwurzel aufwärtszuziehen
hätte den Guard ab sofort die `rules/`- und `agents/`-Bearbeitungen eines fusion-Entwicklers
zurückschreiben lassen: ein neuer Defekt im Tausch gegen den geschlossenen.
`isFusionPluginRoot(dir)` ist die parametrisierte, uncachende Form;
`isFusionPluginCwd()` ist sie an cwd, gecacht, und bleibt für Schreibwerkzeug-Sperre und
Churn zuständig. `measurementRoot()` wertet sie an der Messwurzel aus. **Gemessen, nicht
angenommen** — dritter Fall der Testdatei.

**Ein Rest, gemessen und bewusst stehengelassen.** `hooks/lib/project-relative.ts`
(`projectRelative`) löst die Pfade der *Vorab*-Verweigerung der Schreibwerkzeuge weiter gegen
`process.cwd()` auf:

```
Edit <projekt>/rules/x.md aus <projekt>/sub   pre: {}  — erlaubt, die Sperre sieht ihn nicht
                                              danach:   zurückgeschrieben + Halt (die Messung)
```

Schutz gleich, Warnung später. Nicht angefasst, weil das eine Änderung auf der
Verweigerungsseite wäre und die Datei ohnehin gedeckt ist. Als vierter Fall festgehalten,
damit der Satz gemessen ist.

## Textschicht

- `rules/protected-path-discipline.md` — `## The rule` benannte das Koordinatensystem gar
  nicht und trug seine Vollständigkeitsaussage damit auf einer stillschweigenden Annahme. Sie
  bleibt stehen (sie handelt von der *Route*, und für Routen gilt sie) und ist jetzt um den
  Absatz ergänzt, der sagt, dass die Muster gegen die **Projektwurzel** gelesen werden, in
  beide Richtungen, und dass das gemessen ist.
- `260807-0923-guard-misst-statt-orakelt` — Nachtrag im Grounding. Die
  Directive-Prosa selbst ist unangetastet: sie ist das Wort des Nutzers, und ihre Aussage
  stimmt jetzt. Der Nachtrag sagt, worauf sie ruht und was der Rest ist.
- `.../260807-1526-reconciliation.md` § IV — Nachtrag: die Ableitung ist bestätigt und
  behoben, die Divergenz, die zu `review-needed` geführt hat, ist geschlossen.
- `circles/260801-1244-guard-rules-write/issues/260804-2100_o_*` — Messung eingetragen.
  **Bleibt `_o_`.** Beide Klauseln des Titels sind falsch geworden, aber die
  Koordinaten-Asymmetrie in `project-relative.ts` — der Datei, die der Kopf unter
  `**Affects:**` nennt — steht noch.

## Geänderte Dateien

```
hooks/lib/self-detect.ts                                     isFusionPluginRoot(dir) ergänzt
hooks/lib/protected-snapshot.ts                              measurementRoot() ergänzt
hooks/guard.ts                                               Messwurzel + Stilllegung von dort
hooks/tracker.ts                                             Messwurzel, Prüfung vor loadSnapshot
hooks/lib/__tests__/protected-snapshot-subdirectory.test.ts  neu, vier Fälle
rules/protected-path-discipline.md                           Koordinatensystem benannt
fusion-workbench/... (vier Buchführungsdateien, s. o.)
```

`hooks/dist/` ist mitgezogen — `npm test` baut vor dem Lauf.

## Verifikation

`npm test` in `hooks/`: **31 Testdateien, 1006 Tests, alle grün.** Keine Regression; die vier
neuen Fälle sind der ganze Zuwachs gegenüber 1002 vor der Änderung.

Ein Golden war mitzuziehen: `lib/__tests__/fixtures/rules-emission.golden` misst, wie viele
Bytes Regeltext jeder Agent bei jedem Dispatch lädt, und der ergänzte Absatz in
`protected-path-discipline.md` wiegt 664 Bytes. Über den dokumentierten Weg neu erzeugt
(`UPDATE_RULES_GOLDEN=1`, der Lauf scheitert absichtlich und erzwingt einen zweiten ohne
Flag). Der Diff ist genau das: eine Datei +664, dieselbe Zahl auf allen 16 Agenten-Summen,
keine Änderung an Pfadmenge oder Reihenfolge.

Nicht committet, wie beauftragt.
