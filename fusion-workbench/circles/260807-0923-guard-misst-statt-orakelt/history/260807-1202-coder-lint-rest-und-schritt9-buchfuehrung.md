# Der Lint-Rest ist gestrichen, und die Buchführung des Rückbaus steht

**Datum:** 2026-08-07 12:02
**Agent:** coder
**Circle:** `circles/260807-0923-guard-misst-statt-orakelt`
**Plan:** `planning/260807-0931_o_plan-guard-misst-statt-orakelt.md`, Nachzug zu Schritt 5 und Schritt 9
**Status:** Complete

## Was der Auftrag war

Zwei Teile. Der erste war ein Rest, den der Zuschnitt zweier Vorgängeraufträge hatte fallen lassen: vier tote Einträge in `EXAMPLE_PATHS` des Referenz-Lints, die keiner der beiden Vorgänger anfassen durfte, obwohl einer von beiden sie brauchte. Der zweite war Schritt 9, die Buchführung — drei Befunde schließen, deren beschriebener Code nicht mehr existiert, und den Entscheidungssatz auf implementiert ziehen. Für den zweiten Teil galt die ausdrückliche Auflage, jeden beschriebenen Zustand am Baum nachzuprüfen statt ihn anzunehmen.

## Teil 1 — die vier toten Ausnahmen

`hooks/lib/__tests__/reference-resolution-lint.test.ts` führte in `EXAMPLE_PATHS` zehn Pfade, die als erfundene Befehlsoperanden der Guard-Dokumentation vom Referenz-Lint ausgenommen sind. Vier davon nannte seit der Textschicht keine ausgelieferte Textstelle mehr: `rules/a.md` und `rules/b.md` standen in der Klassifizierer-Prosa von `rules/protected-path-discipline.md` und `README-hooks.md`, `rules/gen.pl` ausschließlich in `rules/protected-path-internals.md`, `rules/junk.txt` im `git clean`-Absatz von `README-hooks.md`.

Vor der Streichung gegengeprüft, statt dem Befund zu glauben: die vier Pfade kommen auf der Fläche, die der Lint scannt, nirgends mehr vor. Die verbliebenen Treffer im Repository liegen sämtlich unter `hooks/lib/__tests__/` — in `shell-parse.test.ts`, `guard-bash-integration.test.ts` und `monitor-warnings-panel.test.ts` — und dieses Verzeichnis ist nicht Teil der Fläche: `surface()` liest `rules/`, `agents/`, `docs/`, `templates/`, `skills/`, die READMEs, `CLAUDE.md`, die Shell-Skripte unter `bin/`, `install.sh` und die `.ts`-Dateien direkt in `hooks/lib/`, ohne Rekursion in Unterverzeichnisse.

Die vier Zeilen sind gestrichen, die sechs übrigen Einträge stehen unverändert. Vorher 22 grün und 1 rot, nachher 23 grün und 0 rot. Der Befund `260807-1133` trägt seine `Resolved:`-Zeile und steht auf `_c_`.

## Teil 2 — Schritt 9, und was die Nachprüfung zutage förderte

Drei Befunde geschlossen, jeder mit einer eigenen Nachprüfung am Baum:

- `260807-0251` (der Korpus kann die Operandenform nicht erzeugen): die vier Korpus-Dateien sind mit `436d78c` gelöscht, `TARGETS` und `reachability-corpus` kommen in `hooks/` nicht mehr vor.
- `260807-0252` (`JoinerFacts` behauptet eine Pessimismus-Quelle, die die Zeile nicht trägt): `JoinerFacts`, `joinerFacts` und `movesCallingShell` existieren im ganzen Repository nicht mehr; sie standen in `hooks/lib/bash-mutation-guard.ts`, gelöscht mit `ba7ccda`.
- `260807-0930` (zwei Fehlalarme des Klassifizierers): `classifyBashMutation` ist aus `hooks/guard.ts` fort, `parseCommand` aus `shell-parse.ts` und `command-word.ts`, und `hooks/dist/guard.js` importiert den Klassifizierer nicht mehr. Es gibt kein Vorher-Urteil mehr, das fehlalarmieren könnte.

Der Entscheidungssatz `260807-0825` trägt jetzt `Implemented:` mit den fünf Commits `2d55c66`, `327d0b6`, `309ee28`, `ba7ccda` und `436d78c`, dazu einen Satz darüber, worin die Verwirklichung besteht, und die Feststellung, dass beide Randbedingungen der Antwort eingehalten sind. Marker auf `_i_`, Kopf-Status auf `implemented`.

### Die zwei Commits sind vorwärts abgeräumt — bis auf einen Rest

`3dc5014` und `9a24c9b` sind nicht per `git revert` zurückgenommen worden, und das ist am Baum überprüft statt behauptet. Alle sieben Quelldateien, die beide Commits anlegten, sind gelöscht. `GRAMMAR_TERMINATORS`, das `9a24c9b` in `hooks/lib/command-word.ts` einfügte und das der Plan als eigene Position führte, ist mit `ba7ccda` wieder entfallen. Die Modultabellenzeile, die `9a24c9b` in `README-hooks.md` einfügte, ist mit `436d78c` entfallen.

Ein Rest steht, und er ist der Grund, warum diese Nachprüfung mehr wert war als eine Annahme: `hooks/dist/lib/bash-mutation-guard.{js,d.ts}` und `hooks/dist/lib/shell-reach.{js,d.ts}`, zusammen 4.088 Zeilen, sind weiter in git verzeichnet. `npm run build` ist `tsc`, und `tsc` räumt sein `outDir` nicht auf, also hat der Bauschritt in `436d78c` die aktuellen Module korrekt neu erzeugt und die Ausgaben der gelöschten Quellen stehen lassen. Es gibt keine einzige Importkante mehr darauf — die verbliebenen Namensnennungen in `dist/guard.js`, `dist/lib/protected-snapshot.js` und `dist/lib/rules-write-exemption.js` stehen in Kommentarprosa, die den Rückbau beschreibt. Im Betrieb wird nichts davon geladen. Ausgeliefert wird es trotzdem: der HTTPS-Installer kopiert `hooks/dist/` unverändert nach `~/.fusion`, ein Leser findet dort weiter den Klassifizierer, den die Textschicht für abgeschafft erklärt.

Abgelegt als Befund `260807-1202_o_kompilierte-waisen-des-klassifizierers-stehen-noch-in-hooks-dist.md`, fällig vor Schritt 10, dessen zweiter Durchlauf mit `FUSION_GUARD_ENTRY=dist` ohnehin gegen das Kompilat fährt. Nicht selbst behoben, weil dieser Auftrag ausdrücklich Buchführung ist und keine Arbeit am Code, und weil die eigentliche Ursache eine Aufräumung vor dem Bau ist und nicht das Löschen dieser vier Dateien.

### Der `fusion-guard.json`-Befund war schon erledigt

`260807-1155` sollte ich nur nachprüfen und das Ergebnis vermerken, weil die JSON-Dateien ontocoder gehören. Beim Nachsehen war er bereits behoben und geschlossen, sechs Sekunden bevor ich hinsah: der Halbsatz "denied on the write tools and through the shell alike" ist in beiden Dateien durch die Beschreibung der Messung ersetzt, beide sind byte-identisch, `config.test.ts` steht bei 72 grün. Nichts mehr zu vermerken; ich habe die Datei nicht angefasst.

## Prüflauf

`npm test` in `hooks/`: **30 Dateien, 1001 Zusicherungen, alle grün, keine rot.**

Erwartet war genau ein roter Rest, `rules-emission-golden.test.ts`. Er ist nicht aufgetreten, und der Grund ist nicht meine Arbeit: ontocoder hat die Goldfixture um 12:01 neu erzeugt und damit Schritt 7 parallel abgeschlossen. Der Plan führt Schritt 7 seit 12:04 als `[DONE]`. Mehr rote Zusicherungen als die eine erwartete gab es nicht, weniger schon.

## Nebenbefund, nicht abgelegt

`fusion-workbench/tasklist.md` nennt im Kopf noch `circles/260804-1205-shell-reachability-model` als aktiven Circle und den Plan des abgelösten Circles als Quelle. Der Zeiger `.active-circle` steht korrekt auf dem Nachfolger. Die Queue ist seit der Ablösung mit `bf48802` nicht neu gebaut worden. Kein eigener Befund, weil taskplanner die Datei bei seinem nächsten Lauf ohnehin vollständig neu erzeugt; hier vermerkt, damit niemand sie in der Zwischenzeit als Wahrheit liest.

## Geänderte Dateien

- `hooks/lib/__tests__/reference-resolution-lint.test.ts` — vier `EXAMPLE_PATHS`-Zeilen gestrichen
- `circles/260807-0923-guard-misst-statt-orakelt/issues/260807-1133_*` — `Resolved:`, `_o_` → `_c_`
- `circles/260807-0923-guard-misst-statt-orakelt/issues/260807-0930_*` — `Resolved:`, `_o_` → `_c_`
- `circles/260804-1205-shell-reachability-model/issues/260807-0251_*` — `Resolved:`, `_o_` → `_c_`
- `circles/260804-1205-shell-reachability-model/issues/260807-0252_*` — `Resolved:`, `_o_` → `_c_`
- `circles/260804-1205-shell-reachability-model/decisions/260807-0825_*` — `Implemented:`, Kopf-Status, `_a_` → `_i_`
- `circles/260807-0923-guard-misst-statt-orakelt/issues/260807-1202_o_kompilierte-waisen-des-klassifizierers-stehen-noch-in-hooks-dist.md` — neu
- `circles/260807-0923-guard-misst-statt-orakelt/planning/260807-0931_o_*` — Schritt 9 auf `[DONE]` mit Ergebnisnotiz, die strittige Notiz an Schritt 5 aufgelöst

Die beiden Befunde des abgelösten Circles bleiben, wo sie liegen. Die Herkunftsregel sagt, dass Reichweite zitiert und nicht verschoben wird; der Entscheidungssatz dieses Circles zitiert sie und liegt selbst ebenfalls dort.

Nicht committet, wie beauftragt.
