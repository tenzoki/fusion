Kompilierte Waisen des Klassifizierers stehen noch in `hooks/dist/`
---
Vier Dateien mit zusammen 4.088 Zeilen sind weiter in git verzeichnet und werden mit jedem Tarball ausgeliefert, obwohl ihre Quellen gelöscht sind und sie von nichts mehr importiert werden: `hooks/dist/lib/bash-mutation-guard.js` (2.461 Zeilen), `hooks/dist/lib/bash-mutation-guard.d.ts` (665), `hooks/dist/lib/shell-reach.js` (649) und `hooks/dist/lib/shell-reach.d.ts` (313).

Ursache: `npm run build` ist `tsc`, und `tsc` schreibt in `outDir`, ohne dort aufzuräumen. Der Bauschritt in `436d78c` hat deshalb `hooks/dist/guard.js`, `tracker.js`, `command-word.js` und `shell-parse.js` korrekt neu erzeugt und die Ausgaben der in `ba7ccda` gelöschten Quellen einfach stehen lassen.

Zu tun: die vier Dateien löschen. Wenn `hooks/dist/` künftig verlässlich dem Quellstand entsprechen soll, gehört zusätzlich eine Aufräumung vor den Bau (etwa `rm -rf dist` im `build`-Skript) — das ist die eigentliche Ursache und nicht nur dieser eine Rest.
---
Gefunden am 260807-1202 in Schritt 9 des Plans `260807-0931_o_plan-guard-misst-statt-orakelt.md`, bei der Nachprüfung am Baum, ob von den Commits `3dc5014` und `9a24c9b` wirklich nichts mehr steht. Alle sieben Quelldateien dieser beiden Commits sind gelöscht; die kompilierten Ausgaben von `hooks/lib/shell-reach.ts` und `hooks/lib/bash-mutation-guard.ts` sind der einzige Rest.

Gemessen: `git ls-files hooks/dist/lib/` führt alle vier Dateien; `hooks/dist/` enthält keine einzige echte Importkante auf sie (die verbleibenden Treffer auf `bash-mutation-guard` und `shell-reach` in `dist/guard.js`, `dist/lib/protected-snapshot.js` und `dist/lib/rules-write-exemption.js` stehen sämtlich in Kommentarprosa, die den Rückbau beschreibt). `hooks/dist/guard.js` importiert `protected-snapshot.js` und nicht mehr den Klassifizierer, und `hooks/dist/lib/command-word.js` trägt `GRAMMAR_TERMINATORS` nicht mehr — das Kompilat ist also im Übrigen aktuell.

Kein Verhaltensrisiko im Betrieb: geladen wird nichts davon. Das Gewicht ist Auslieferung und Lesbarkeit — der HTTPS-Installer kopiert `hooks/dist/` unverändert nach `~/.fusion`, ein Leser findet dort weiter den Klassifizierer, den die Textschicht seit `436d78c` für abgeschafft erklärt.

Nicht in Schritt 9 behoben, weil der Auftrag an diesen Schritt ausdrücklich Buchführung ist und keine Arbeit am Code. Der Eintrag gehört vor Schritt 10 (Vorprüfung im Fremdprojekt), dessen zweiter Durchlauf mit `FUSION_GUARD_ENTRY=dist` ohnehin gegen das Kompilat fährt, oder spätestens vor Schritt 11 (Freigabe), weil erst der Tarball den Rest sichtbar macht.
