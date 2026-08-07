# Der Guard misst, was sich geändert hat, statt vorherzusagen, was sich ändern wird

---
**Domain:** code
**Status:** active
**Filed by:** orchestrator (Directive vom Nutzer im Chat, 260807-0923)
**Active spec/plan:** (noch keiner)
**Active session history:** shared/history/260806-2158-orchestrator-session.md

---

## Directive

Der statische Klassifizierer, der aus dem Text eines Shell-Befehls vorhersagt, welche Dateien er
schreiben wird, verschwindet vollständig. An seine Stelle tritt eine Messung nach der
Ausführung: hat sich eine geschützte Datei verändert, wird sie zurückgerollt und der Guard geht
in den Halt. Die Frage wechselt damit von einer unentscheidbaren ("wird dieser Befehl gleich
schreiben?") zu einer trivial entscheidbaren ("hat er geschrieben?"), und der Schutz wird von
einer 21-Löcher-Näherung zu einer vollständigen Aussage.

**Nicht Bestandteil dieser Directive, ausdrücklich:** eine grobe textuelle Vorwarnung vor der
Ausführung. Sie war als Variante vorgeschlagen und vom Nutzer verworfen, weil sie der Keim wäre,
aus dem der Klassifizierer nachwächst. Wer sie später doch will, braucht dafür eine eigene
Entscheidung, nicht eine Auslegung dieser hier.

Zweiter Bestandteil: das MECE-Prinzip wird als invarianter Abschnitt in
`rules/critical-stance.md` verankert, damit die Fehlerklasse, die den Vorgänger-Circle getragen
hat, künftig vor dem Bauen auffällt statt nach 12.923 Zeilen.

## Grounding snapshot

**Die Zahlen, auf denen die Entscheidung ruht**, alle in der Sitzung 260806-2158 gemessen:

| Größe | Wert |
|---|---|
| Klassifizierer produktiv (`bash-mutation-guard`, `shell-parse`, `shell-reach`, `command-word`, `fs-locator`) | 5.640 Zeilen |
| Tests und Messkorpus dazu | 7.283 Zeilen |
| dokumentierte Residuen (Löcher) | 21 |
| echte Treffer in vier Tagen Praxis | 0 |
| Fehlalarme im selben Zeitraum | 17 |
| geschützte Dateien, die in git liegen | 52 von 52 |
| Laufzeit einer Prüfung über alle geschützten Pfade | 27 ms |

Die letzten beiden Zeilen tragen den Mechanismuswechsel. Weil jede geschützte Datei versioniert
ist, ist ein unerwünschter Schreibvorgang mit `git checkout HEAD --` verlustfrei umkehrbar. Weil
die Prüfung 27 Millisekunden dauert, fällt sie im Betrieb nicht auf.

**Der Preis, offen benannt.** Die Änderung geschieht, bevor sie erkannt wird. Für versionierten
Text ist das folgenlos. Für `fusion-workbench/.guard-state/` gilt es nicht, aber das ist Zustand
und kein Quellcode. Ein Befehl, der die Datei löscht *und* das Repository beschädigt, ist von
dieser Lösung nicht abgedeckt; er war es von der alten auch nicht.

**Wiederverwendung statt neuem Mechanismus.** Es existiert bereits ein PostToolUse-Hook,
`hooks/tracker.ts`, der auf dieselben fünf Werkzeuge matcht (`Write|Edit|MultiEdit|NotebookEdit|Bash`,
siehe `hooks/hooks.json`). Die Messung dockt dort an. Ein zweiter Hook wäre ein zweiter
Lebenszyklus, ein zweiter Konfigurationspfad und eine zweite Stelle, an der jemand einen
Sonderfall unterbringt.

**Was am Klassifizierer hängt und mit abgebaut oder umgehängt werden muss.** Ermittelt per
Import-Graph, nicht geschätzt:

```
guard.ts                  ──> bash-mutation-guard  (die Bash-Policy, entfällt)
rules-write-exemption.ts  ──> bash-mutation-guard  (FUSION_ALLOW_RULES_WRITE, siehe unten)
command-word.ts           ──> shell-parse          (bleibt, git-branch-guard braucht es)
git-branch-guard.ts       ──> shell-parse          (bleibt unangetastet)
shell-reach.ts            ──> shell-parse          (entfällt vollständig)
```

`git-branch-guard.ts` bleibt, wie es ist. Es fragt nach einem endlichen Verb-Vokabular und nicht
nach einem Pfad, ist also entscheidbar und kommt mit dem flachen Segmenter aus. Der Rückbau darf
seine beiden Absicherungen nicht anfassen: die Gold-Fixture mit 98 Befehlen und die
Quelltext-Zusicherung, dass der Mutations-Parser nie in es hineingerät. Letztere wird durch den
Rückbau gegenstandslos, aber gegenstandslos ist nicht dasselbe wie falsch.

**`FUSION_ALLOW_RULES_WRITE` ist eine offene Frage, keine Erledigung.** Die Ausnahme existiert,
weil die Bash-Policy sonst das Schreiben von Regeldateien unmöglich machte. Ohne Vorher-Urteil
gibt es nichts mehr auszunehmen, aber die Nachher-Prüfung würde einen legitimen Regel-Schreibvorgang
zurückrollen. Die Ausnahme muss also auf die neue Seite umziehen, nicht verschwinden. Wer den
Plan schreibt, entscheidet das als benannten Schritt.

**Die Textschicht ist der größere Teil der Arbeit, als es aussieht.**
`rules/protected-path-discipline.md` hat 348 Zeilen und beschreibt fast ausschließlich das
Orakel: die Vier-Fragen-Prozedur, die Joiner-Tabelle, das Fail-Closed-Verhalten bei
unauflösbaren Operanden. Nach dem Rückbau ist davon nichts mehr wahr. Die Datei schrumpft auf
die Größenordnung ihrer Schwester `rules/git-branch-discipline.md` (55 Zeilen). Betroffen sind
außerdem `CLAUDE.md`, `README-hooks.md` und die Symptomtabelle, die drei Guard-Denies erklärt,
die es dann nicht mehr gibt.

**Der Vorgänger-Circle, abgelöst statt abgeschlossen.**
`circles/260804-1205-shell-reachability-model/_s_circle.md`. Seine Closure note führt auf, was
Bestand hat. Zwei Commits von ihm liegen verhaltensneutral auf `main` (`3dc5014` Messinstrument,
`9a24c9b` Erreichbarkeits-Schicht) und werden von diesem Circle mit abgeräumt. Seine beiden
offenen Befunde erlöschen mit dem Code, den sie beschreiben, und werden hier geschlossen statt
separat abgearbeitet.

**Die bindende Entscheidung:**
`circles/260804-1205-shell-reachability-model/decisions/260807-0825_a_should-the-guard-predict-shell-writes-or-enforce-them.md`,
Option 3, erweitert um den vollständigen Rückbau.

**Eine Beobachtung aus der Sitzung selbst, als Beleg für die Dringlichkeit.** Während der
Buchführung zu diesem Circle hat der Guard einen Befehl des Orchestrators blockiert: ein
Heredoc, dessen Zeilenumbrüche als Segmenttrenner gelesen wurden. Fehlalarm Nummer 18, in der
Sitzung, die den Mechanismus abschafft.

**Nachtrag 260807-1601 (coder): die „vollständige Aussage" ist jetzt gemessen, und sie war es
vorher nicht.** Die Directive setzt der 21-Löcher-Näherung eine vollständige Aussage entgegen.
Diese Gegenüberstellung meint die *Route* — welchen Weg eine Schreiboperation zur Datei nimmt —
und für Routen gilt sie. Sie schwieg über eine zweite Achse: das Koordinatensystem, in dem die
Muster überhaupt gelesen werden.

Nachgemessen aus einem Unterverzeichnis, durch die echten Hooks
(`hooks/lib/__tests__/protected-snapshot-subdirectory.test.ts`): die Messung war dort
wirkungslos. Eine Shell hat `rules/x.md` in der Projektwurzel überschrieben, die Datei blieb
überschrieben, kein Rollback, kein Halt, kein Ereignis. Zugleich wurde ein `sub/rules/y.md`
zurückgeschrieben, das auf der Schutzliste des Projekts unter keiner Schreibweise steht. Der
Guard schützte ein Verzeichnis, das es nicht geben muss, und ließ das ungeschützt, das es gibt.

Behoben, indem die Messwurzel auf `findWorkbenchRoot()` gezogen wurde — dieselbe Wurzel, die die
Konfiguration schon benutzte —, und die Stilllegung im eigenen Repo mit ihr, sonst hätte der
Guard die Arbeit eines fusion-Entwicklers aus `fusion-workbench/` heraus zurückgeschrieben. Die
Directive-Aussage bleibt damit stehen; sie ruht jetzt auf einer Messung statt auf einer
Auslassung.

**Ein Rest, gemessen und stehengelassen:** die *Vorab*-Verweigerung der Schreibwerkzeuge löst
ihre Pfade weiterhin gegen cwd auf. Aus einem Unterverzeichnis lässt sie einen `Edit` auf eine
geschützte Datei der Wurzel durch, und erst die Messung fängt ihn ab — Schutz gleich, Warnung
später. Nicht angefasst, weil das eine Verweigerungs-Änderung wäre und die Datei ohnehin gedeckt
ist. Festgehalten in `260804-2100`.

## Dependencies

Keine. Der Circle hängt an nichts Offenem, und nichts Offenes hängt an ihm.

Er löst `260804-1205-shell-reachability-model` ab, dessen Datensatz den Marker `_s_` trägt. Der
andere geplante Circle im Portfolio, `260801-1244-curator`, ist unabhängig und braucht ohnehin
erst eine Neu-Schärfung durch den shaper.

## Turn log

## Closure note
