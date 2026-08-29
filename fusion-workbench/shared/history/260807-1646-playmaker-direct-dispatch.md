# Playmaker — Portfolio-Neuerzeugung nach dem Abschluss von `260807-0923-guard-misst-statt-orakelt`

**Session:** 260807-1646-playmaker-direct-dispatch
**Auslöser:** direct-dispatch (Nutzer, im Chat)
**Domänen-Bias:** `code` (aus der Zeile `**Domain:** code` des Dispatch-Prompts gelesen)
**Status:** Complete
**Portfolio:** `fusion-workbench/portfolio.md` (vollständig neu erzeugt)
**Baum-Stand:** HEAD `a94f142` (v6.0.1)

---

## Inventar

| Marker | Bedeutung | Anzahl | Circles |
|---|---|---|---|
| `_a_` | geplant | 1 | `260801-1244-curator` |
| `_t_` | aktiv | 0 | — |
| `_c_` | kohärent geschlossen | 10 | zuletzt `260807-0923-guard-misst-statt-orakelt` |
| `_b_` | Bounded Closure | 0 | — |
| `_s_` | abgelöst | 1 | `260804-1205-shell-reachability-model` |
| `_d_` | zurückgestellt | 0 | — |

`.active-circle` fehlt auf der Platte, und kein Datensatz trägt `_t_`. Das ist der reguläre
Zustand nach einer Schließung, also keine Zeigerwarnung.

## Rangfolge

Ein einziger geplanter Circle, damit ist die Rangfolge trivial und die Aussagekraft der Heuristik
gering. `260801-1244-curator` zitiert null offene Entscheidungssätze in seiner Grounding (D1 ist
beantwortet, D2 und D3 sind umgesetzt) und besteht die Abhängigkeitsprüfung: alle drei
Abhängigkeiten tragen `_c_`. Nach der Code-Heuristik steht er sauber; aktivierbar ist er nicht.

**Empfehlung:** neu schärfen, nicht aktivieren. Und die Neu-Schärfung erst nach der Antwort auf
`260807-1515_*_wie-weit-reicht-die-projektsprache-in-den-regelkorpus.md`, weil
deren Gegenstand mit dem des Circles zusammenfällt.

## Zyklen und Propagation

- Abhängigkeitsgraph über die nicht-terminalen Circles: ein Knoten ohne ausgehende Kante zu einem
  anderen nicht-terminalen Knoten. Keine Zyklen. Kein `## Dependency warning` angehängt.
- Kein Circle trägt `_b_`, also keine Prüfung auf veraltete Eltern-Grounding, kein
  `parent-grounding-stale`-Ereignis, kein `## Parent grounding stale` angehängt.

## Nachgemessen statt übernommen

Der Dispatch-Prompt nannte drei Lagebestandteile, die zu prüfen waren. Ergebnis:

1. **`GIT_WORK_TREE=` als höchstbewerteter offener Defekt — trifft nicht mehr zu.** Der Befund
   `260804-1332_*_git-work-tree-in-the-environment-relocates-the-write-and-the-classifier-reads-no-variable.md`
   trägt den Marker `_c_`. Die Schließnotiz begründet ihn sachlich und nicht formal: der Erkenner
   ist mit `ba7ccda` gelöscht, und die Messung sieht die veränderte Datei danach, gleich auf
   welchem Weg. Bestätigt in Abschnitt II der Reconciliation
   `260807-1526-reconciliation.md`, Zeile
   zum Befund `260804-1332_*_git-work-tree-in-the-environment-relocates-the-write-and-the-classifier-reads-no-variable.md`. Der Mechanismuswechsel hat ihn also erledigt, nicht nur entschärft.
   Kein eigener Circle nötig.
2. **Der höchstbewertete offene Befund ist stattdessen der Stash-Fehler**,
   `260717-0030_*_git-stash-include-untracked-can-sweep-the-stash-directory.md`,
   und er hat sich verschärft. Er hielt fest, fusions eigene Workbench sei ignoriert und damit in
   der einen sicheren Konfiguration. `git check-ignore` verneint das heute, und `git ls-files`
   zählt 612 versionierte Dateien unter `fusion-workbench/`, seit `e8988d9` (260801). Damit sitzt
   das Quell-Repository in einer der beiden verlierenden Konfigurationen.
3. **Die Neu-Schärfung des Curators gilt weiterhin und ist größer geworden.** Fünf Aussagen
   seiner Grounding sind am Baum widerlegt; die Tabelle steht im angehängten
   `## Activation proposal` des Circle-Datensatzes.

## Angehängt an Circle-Datensätze

- `260801-1244-curator` — `## Activation proposal` angehängt. Inhalt: die
  Reihung als einziger Kandidat, die fünf widerlegten Grounding-Aussagen mit Messwerten, der
  geschlossene Motivations-Defekt, was inhaltlich Bestand hat, und die Reihenfolge
  Sprachentscheidung vor Neu-Schärfung. Kein Marker umbenannt, `.active-circle` nicht angefasst.

## Warnungen im Portfolio

1. Der Curator ist nicht aktivierbar, und die Neu-Schärfung ist mehr als eine Nachbesserung.
2. Der `GIT_WORK_TREE=`-Befund ist geschlossen und kein Kandidat für einen eigenen Circle.
3. Der Stash-Fehler ist der höchstbewertete offene Befund und hat sich durch die Versionierung
   der Workbench verschärft; `CLAUDE.md` nennt sie weiterhin „gitignored".
4. Zwei offene Entscheidungen warten auf den Nutzer: die Integrität des Eskalationsspeichers
   (`circles/260807-0923-guard-misst-statt-orakelt/decisions/260807-0945_o_*`) und die Reichweite
   der Projektsprache im Regelkorpus (`shared/decisions/260807-1515_o_*`).
5. 39 offene Befunde liegen in keinem aktiven Circle: 23 im geteilten Speicher, 16 in
   Issue-Speichern geschlossener Circles.
6. `260801-1020_*_workbench-untracked-breaks-archive-durability-premise.md` ruht auf
   einer Prämisse, die sich geändert hat, und ist ungeprüft.
7. `tasklist.md` existiert nicht mehr; die Vorbeugung gegen erneutes Veralten ist ungebaut,
   festgehalten in `shared/issues/260807-1515_o_*`.
8. `fusion-workbench/.active-circle` ist versioniert und auf der Platte gelöscht.

## Zwei Anmerkungen zur eigenen Ausgabe

**Sprache.** Dieses Portfolio ist auf Deutsch geschrieben, die drei vorherigen waren englisch.
Grund: `CLAUDE.md:3` deklariert `**Language:** de`, und Portfolio-Prosa ist Langform-Ausgabe eines
Agenten, für die nach `rules/user-facing-output.md` das Schreibprofil
`fusion-workbench/stilwerk/default-voice-de.yaml` gilt. Die Abschnittsüberschriften bleiben
englisch, weil sie aus der Vorlage in `rules/circle-records.md` stammen und strukturell gelesen
werden. Der Wechsel ist keine Vorwegnahme der offenen Entscheidung `260807-1515`: die fragt nach
dem Regelkorpus, also nach Eingabe an Agenten, und nicht nach deren Ausgabe.

**Beweisstand.** Alle Zahlen dieses Laufs sind gemessen: Dateigrößen mit `wc -c`, die
Regel-Emission durch `bin/fusion-rules`, der git-Zustand mit `check-ignore` und `ls-files`, die
Marker aus den Dateinamen. Eine Aussage ist ausdrücklich *inference* und im Portfolio als solche
gekennzeichnet: dass ein Reconciler-Lauf über
`circles/260801-1244-guard-rules-write/issues/` einen Teil der elf dortigen offenen Befunde
schließen würde. Sie ruht auf dem Muster der neun bereits geschlossenen, nicht auf einer Prüfung
der elf.
