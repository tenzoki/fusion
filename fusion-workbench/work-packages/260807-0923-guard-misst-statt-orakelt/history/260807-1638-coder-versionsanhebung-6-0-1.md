# Versionsanhebung auf 6.0.1 — vier Oberflächen und drei überholte Aussagen

**Agent:** coder
**Circle:** `260807-0923-guard-misst-statt-orakelt`
**Datum:** 2026-08-07 16:38
**Status:** Complete
**Auftrag:** Patch-Release 6.0.1 vorbereiten. Vier Versionsoberflächen anheben, prüfen was
der Sprung sonst falsch macht, `npm test` und `npm run build` melden. Kein Commit, kein Push
— weder hier noch im Marktplatz.

---

## Warum Patch

Zwei Korrekturen nach dem ausgelieferten und getaggten v6.0.0, beide an derselben Sache: die
Messwurzel läuft jetzt aufwärts (`measurementRoot()`), und SessionStart warnt beim Start
unterhalb der Projektwurzel. Keine Schnittstelle bricht, keine neue Verhaltensweise ist zu
lernen. Der Sprung bleibt in der 6.0-Reihe.

## Die vier Oberflächen

| Oberfläche | Vorher | Jetzt |
|---|---|---|
| `.claude-plugin/plugin.json`, `version` | `6.0.0` | `6.0.1` |
| `install.sh`, Kopfkommentar Zeile 27 | `FUSION_REF=tags/v6.0.0` | `FUSION_REF=tags/v6.0.1` |
| `README.md` Zeile 26 | `FUSION_REF=tags/v6.0.0` | `FUSION_REF=tags/v6.0.1` |
| `<marktplatz>/.claude-plugin/marketplace.json`, fusion-Objekt | `6.0.0` | `6.0.1` |

Anders als beim letzten Mal war das README-Beispiel **nicht** gedriftet — es stand auf
derselben Version wie `install.sh`. Der Abschnitt „Release process" hat gewirkt.

Vor der Marktplatz-Änderung lief Schritt 2 der Freigabeprozedur: `git pull --rebase origin
main` im Arbeits-Klon `/Users/k1/Projects/productive/F03-CLAUDE-plugin-marketplace/claude-plugins`,
Ergebnis „Already up to date", HEAD auf `df8c053 fusion 6.0.0`. Die Datei ist nach der
Änderung gültiges JSON (`python3 -m json.tool`, fehlerfrei). Die drei anderen
`version`-Felder der Datei sind unangetastet: `1.0.0` für den Marktplatz selbst, `1.0.0` für
stilwerk, `0.6.0` für flight.

## Was der Sprung sonst falsch macht

### Versionsnennungen: keine

Suche nach `6.0.0` über `*.md`, `*.json`, `*.sh`, `*.ts`, `*.yaml` ohne `node_modules`,
`dist` und Workbench. Nach den vier Anhebungen bleiben genau vier Fundstellen, alle in
`CLAUDE.md`, alle **historisch** und damit weiterhin richtig:

| Zeile | Aussage | Warum sie stehen bleibt |
|---|---|---|
| 5 | „since v6.0.0 the second half is the protected-path measurement" | Datiert den Mechanismuswechsel. Er fand in 6.0.0 statt. |
| 55 | „Since the classifier fell (v6.0.0, Circle …)" | Dasselbe Ereignis, dasselbe Datum. |
| 71 | „At v6.0.0 it did not [exist]" — der Cache-Klon | Datierte Beobachtung. Nachgeprüft, nicht übernommen: `~/.claude/plugins/marketplaces/` enthält weiterhin nur `claude-plugins-official`, kein `tenzoki-plugins`. Als Historie richtig, und der Zustand hält an. |
| 89 | „(it did not at v6.0.0)" | Dieselbe Beobachtung an ihrer zweiten Stelle. |

Ein Patch-Sprung innerhalb derselben Nebenversion erzeugt die Fehlerklasse des letzten Mals
nicht: dort waren zwei `since v5.x`-Aussagen falsch geworden, weil der Hauptsprung das
datierte Ereignis verschob. Hier verschiebt sich nichts.

Die frischen Absätze zur Messwurzel und zur Startwarnung (`CLAUDE.md` Zeilen 24, 31, 52, 120;
der neue README-hooks-Abschnitt) nennen **keine** Version. Es gibt dort also nichts, was
jetzt nicht mehr stimmt.

### Drei Aussagen über den heutigen Stand: falsch geworden, korrigiert

Nicht durch den Versionssprung, sondern durch die Messwurzel-Korrektur selbst. Sie sind
derselben Gattung wie die zwei Stellen vom letzten Mal und darum hier mitbehandelt.

Der Befund: `measurementRoot()` prüft `isFusionPluginRoot(root)` und **nicht**
`isFusionPluginCwd()`. `isFusionPluginRoot(dir)` ist in dieser Änderung neu
(`git diff hooks/lib/self-detect.ts`, Zeile 56 der Differenz). Die beiden Hälften des
Selbstschutzes fragen seither **zwei verschiedene Verzeichnisse**: die Schreibwerkzeuge cwd,
die Messung die Workbench-Wurzel, zu der sie aufwärts gelaufen ist.

Das war meine erste Vermutung in die andere Richtung — die Messung laufe aufwärts, der
Selbstschutz bleibe bei cwd, und ein aus `fusion-workbench/` gestarteter Entwickler bekomme
seine Änderungen zurückgerollt. Der Code widerlegt sie: die Verlegung ist im Docstring von
`measurementRoot()` ausdrücklich als Paar begründet („The two roots move together or not at
all"). Geprüft, nicht angenommen.

Damit war aber die **Textschicht** an drei Stellen überholt, weil sie den Selbstschutz noch
einheitlich über cwd erklärt:

| Stelle | Was dort stand | Was jetzt dort steht |
|---|---|---|
| `README-hooks.md:248` „Where it stands down" | „skipped when **cwd** is the fusion plugin's own repository" | Übersprungen, wenn die **Workbench-Wurzel** das Plugin-Repo ist; dazu ein Absatz, der beide Anker benennt und begründet, warum sie zusammen umziehen mussten |
| `README-hooks.md:176` Dateitabelle, `lib/self-detect.ts` | „Detects when cwd is …" — ein Anker für beide Hälften | Zwei Eintrittspunkte benannt: `isFusionPluginCwd()` für die Schreibwerkzeuge, `isFusionPluginRoot(dir)` für die Messung |
| `CLAUDE.md:5` | „`hooks/guard.ts` detects when cwd has `.claude-plugin/plugin.json`" | Erkennungskriterium ohne cwd formuliert, plus ein Satz, der die zwei Anker trennt und die Kopplung ab v6.0.1 datiert |

Die dritte war die riskanteste: `CLAUDE.md:5` ist der Absatz, den ein fusion-Entwickler liest,
bevor er in diesem Repo etwas anfasst, und er ist genau die Stelle, die schon beim letzten
Bump nachgezogen werden musste.

### Geprüft und unverändert gelassen

- `rules/protected-path-discipline.md:15` sagt bereits, dass die Muster gegen die
  Projektwurzel und nicht gegen das Startverzeichnis gelesen werden. Richtig.
- `rules/protected-path-discipline.md:7` und `rules/git-branch-discipline.md:7` sprechen von
  „the plugin's own repository", ohne cwd zu nennen. Von der Verlegung nicht berührt.
- `bin/fusion-plugin-cwd` Zeile 10 nennt sich die Shell-Hälfte von `isFusionPluginCwd()`.
  Weiterhin richtig — es ist die cwd-Hälfte, und seine Aufrufer (`bin/fusion-rules`,
  `bin/fusion-paths`) lösen selbst gegen cwd auf.
- `CLAUDE.md:31` beschreibt `bin/fusion-plugin-cwd` als Hälfte von `isFusionPluginCwd()`.
  Unverändert richtig.
- Kein Dokument nennt eine Testanzahl, also gibt es dort nichts nachzuziehen.

## Prüfung

`npm test` in `hooks/` (das Skript baut vorher): **32 Testdateien, 1014 Tests, alle grün**,
80,7 s. Zweimal gelaufen — einmal vor den Textänderungen, einmal danach, beide Male mit
demselben Ergebnis.

`npm run build` (`rm -rf dist && tsc`): Exit 0, ohne Ausgabe. `hooks/dist/` enthält 19
`.js`-Artefakte, darunter das neue `dist/session-start.js` (6 077 Bytes).

Zwei Auslieferungs-Invarianten für das Neue nachgeprüft statt vorausgesetzt:

- `git check-ignore -v hooks/dist/session-start.js` → Exit 1, die Datei ist **nicht**
  ignoriert und wird mit committet. Ohne das läge der SessionStart-Hook im Tarball nicht bei
  und der dritte Hook-Befehl liefe ins Leere.
- Kein externer Import in `hooks/dist/`: die einzigen `from "…"`-Ziele ausserhalb relativer
  Pfade sind `node:child_process`, `node:fs`, `node:path`, `node:url`. Der Tarball läuft
  ohne `npm` und ohne `node_modules`.

## Geänderte Dateien

| Datei | Änderung |
|---|---|
| `.claude-plugin/plugin.json` | `version` → `6.0.1` |
| `install.sh` | Pin-Beispiel im Kopfkommentar → `tags/v6.0.1` |
| `README.md` | Pin-Beispiel → `tags/v6.0.1` |
| `README-hooks.md` | Standdown-Absatz und Dateitabellenzeile auf die zwei Anker nachgezogen |
| `CLAUDE.md` | Zeile 5: Erkennungskriterium und die zwei Anker getrennt |
| `hooks/dist/**` | Neubau |
| `<marktplatz>/.claude-plugin/marketplace.json` | fusion-`version` → `6.0.1` |

Nicht committet und nicht gepusht, in keinem der beiden Repositories.

## Offen für den Orchestrator

- **Schritt 0 der Freigabeprozedur betrifft dieses Release.** Es fasst die Wache an, also
  verlangt der Abschnitt, vor dem Taggen zu bestätigen, dass ihr Verhalten gegen eine
  Projektwurzel geprüft wurde, die **nicht** dieses Repository ist. Die neuen Testdateien
  `protected-snapshot-subdirectory.test.ts` und `session-start-subdirectory.test.ts` spannen
  über `withProject` genau solche Wurzeln auf; ob das dem Gate genügt, ist eine
  Freigabeentscheidung und nicht meine.
- **Der installierte Stand ist v5.10.0**, nicht 6.0.0 (`/Users/k1/.fusion/.claude-plugin/plugin.json`).
  Die Hooks dieser Sitzung liefen also aus dem alten Klassifizierer-Stand. Für die
  Textarbeit ohne Folgen, aber es ist genau der Rückstand, vor dem der Absatz „And between
  releases … run `fusion --update`" warnt.
- **Diese Sitzung lief aus `fusion-workbench/`**, also unterhalb der Projektwurzel — genau
  der Fall, den die neue SessionStart-Warnung meldet. Die Regeln kamen trotzdem aus dem
  Arbeitsbaum, aber nicht von selbst: das Setup ruft `bin/fusion-rules` mit vorangestelltem
  `cd <projektwurzel>` auf, weil die Bash-Aufrufe dieses Agenten ihr Arbeitsverzeichnis
  ohnehin zurücksetzen. Für die Werkzeuge, die cwd nicht selbst wählen können — die
  Vorab-Sperre der Schreibwerkzeuge — gilt dieser Ausgleich nicht.
