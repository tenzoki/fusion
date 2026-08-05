# Coder-Session — zwei nachgeschobene Befunde aus einem konsumierenden Projekt

**Datum:** 2026-08-05 14:35–14:45
**Agent:** coder
**Circle:** `260801-1244-guard-rules-write`
**Dispatch:** Orchestrator, Nachschieben nach dem Release v5.9.0
**Status:** Complete

---

## Auftrag

Zwei extern gemeldete Befunde beheben, klein und lesbar, ohne Versionsbump, ohne Commit,
ohne Neubau von `hooks/dist`. Die Quelldateien liegen ausserhalb dieses Repositories in
einem Ablageverzeichnis eines konsumierenden Projekts (`.../shared/fusion-plugin-findings/`),
nur lesend genutzt. Sechs Dateien: zwei Befund-Records, ein als Duplikat geschlossener
Record, drei Session-Protokolle.

## Befund 1 — der Setup-Lockout

`skills/setup/SKILL.md` Schritt 0, dritte Sonde. Die Suche nach Dateinamen im alten
Klammer-Marker-Format lief ohne Ausnahme ueber den ganzen workbench-Baum und traf damit
eingefrorene Stores. Im meldenden Projekt 1146 Treffer, alle unter `archive/` und
`.migration-v2-backup/`, keiner ausserhalb; `/fusion:setup` verweigerte dauerhaft.

Fix: `-not -path '*/archive/*' -not -path '*/stashes/*' -not -path '*/.migration-v2-backup/*'`,
nach dem Vorbild von `/fusion:log-activity` Schritt 3 (`skills/log-activity/SKILL.md:79`).
Dazu zwei Absaetze Begruendung vor dem Block: warum die drei Stores ausgenommen sind, und
warum die anderen beiden Sonden keine Ausnahme bekommen duerfen. Ohne die Begruendung
entfernt sie der naechste Umbau wieder.

Gemessen an einer Wegwerf-workbench, Block verbatim aus dem Skill extrahiert, die
Vorher-Variante daraus durch Entfernen der Ausschluesse abgeleitet (Harness im Scratchpad,
nicht Teil des Repositories). Sieben Faelle, acht Assertions, alle gruen: der gemeldete Fall
kippt von `OLD=1` auf `OLD=0`, Klammer-Marker im lebenden `shared/` und in einem lebenden
Circle liefern weiter `OLD=1`, Sonde 1 und Sonde 2 feuern unveraendert.

Details: `circles/260801-1244-guard-rules-write/issues/260805-1435_c_setup-sperrt-sich-selbst-aus-weil-die-klammer-sonde-eingefrorene-stores-mitliest.md`

## Befund 2 — die REPLACE-Marker im Plane-Template

`templates/plane.config.yaml` lieferte an den drei Skalar-Feldern Zeilenendkommentare
`# ← REPLACE` aus. Ein solcher Marker ist eine Zustandsbehauptung ueber den Wert daneben und
ueberlebt das Ausfuellen. Zwei Agenten haben daraus dieselbe falsche "Bruecke nicht
verdrahtet"-Diagnose gezogen, mit realen Kosten.

Fix: Marker entfernt, ersetzt durch eine Form, die nach dem Ausfuellen von selbst richtig
wird — jeder Kommentarblock nennt den Wert, mit dem das Template ausliefert (`Ships as …`).
Eine Aussage ueber die Auslieferung bleibt wahr, egal was im Feld steht. Dazu ein Kopfblock,
der den beobachteten Fehlschluss direkt adressiert: die Frage beantwortet
`bin/fusion-plane doctor`, nicht das Lesen dieser Datei.

Vorher geprueft, ob die Marker Verhalten beruehren — sie tun es nicht. `clean_val`
(`bin/fusion-plane:148-153`) verwirft den Zeilenendkommentar, `config_valid` (`:202-209`)
prueft nur auf Nicht-Leere, `/fusion:setup` kopiert die Datei einmal und liest sie nie
(`skills/setup/SKILL.md:144`), und kein Test behauptet etwas ueber die Platzhalterwerte.

Details: `circles/260801-1244-guard-rules-write/issues/260805-1436_c_die-replace-marker-im-plane-template-behaupten-nach-dem-ausfuellen-das-gegenteil.md`

## Geaendert

| Datei | Aenderung |
|---|---|
| `skills/setup/SKILL.md` | drei Ausschluesse in der Klammer-Sonde, zwei Absaetze Begruendung |
| `templates/plane.config.yaml` | drei `← REPLACE` entfernt, `Ships as`-Zeilen und Kopfblock ergaenzt |

Nicht angefasst: Version, `hooks/dist`, `bin/fusion-plane`, `skills/migrate/SKILL.md`, die
eigene `fusion-workbench/plane.config.yaml` dieses Repositories. Kein Commit, kein Push.

## Pruefung

`npx vitest run`: 1547 Tests in 27 Dateien, gruen. Der Pfad-Lint bleibt still — `archive/`,
`stashes/` und `.migration-v2-backup/` gehoeren nicht zu `TYPE_FOLDERS`, und `setup` steht
ohnehin in `EXEMPT_SKILLS`.

## Beobachtungen aus den Protokollen, ohne eigenen Record

Vier Punkte, die in den mitgelieferten Session-Protokollen stehen und die niemand als
Befund gemeldet hat. Sie sind hier festgehalten, nicht gefixt.

1. **Ein selbstloeschender Circle nimmt seine Anweisung mit ins Grab.** Der Shaper legte
   `260802-2220-throwaway-plane-bridge-smoke-test` mit Selbstloeschung als vorgesehenem
   Endzustand an und schrieb in den Record, ein spaeterer Reconciler solle sein Fehlen nicht
   als Orphan lesen. Diese Anweisung lebt in der Datei, die geloescht wird. Zwischen den
   beiden Playmaker-Laeufen vom 03.08. (14:12 und 18:40) verschwand der Circle: einmal
   `_a_`-Zahl 1, dann 0, ohne terminalen Marker dazwischen. Das Marker-Vokabular hat keinen
   Zustand fuer "absichtlich verschwunden", also kann kein Agent Loeschung von Verlust
   unterscheiden.
2. **Archiv-Inhalt sickert in Playmakers Bestandsaufnahme.** Beide Protokolle listen zwoelf
   archivierte Circles unter `archive/260730-1400-safe-cleanup-tier-1/circles/` — dieselbe
   Wurzel wie Befund 1, andere Stelle: hier nicht als Fehlalarm, sondern als Inhalt der
   Bestandsaufnahme. Der zweite Lauf begruendet die Nennung mit "zur Referenz". Ob
   eingefrorene Circles ins Portfolio gehoeren, ist nirgends entschieden.
3. **Derselbe Defekt wurde 21 Stunden auseinander zweimal gefiled.** Beim Filen eines Issues
   prueft niemand, ob der Store denselben Defekt schon traegt; die Zusammenlegung machte
   spaeter der Reconciler von Hand. Bei 64 offenen Issues im meldenden Store ist das keine
   Ausnahmesituation.
4. **Der Shaper lief ohne `AskUserQuestion`** und reichte seine vier Rueckfragen ueber den
   Koordinator durch. Der Umweg hat funktioniert, ist aber nicht der dokumentierte Weg;
   `AskUserQuestion` steht nur in der `tools:`-Allowlist des Orchestrators, und ein
   Sub-Agent erbt sie nur ueber den Dispatch.

Zwei kleinere Punkte aus der Arbeit selbst, ebenfalls nur notiert: Der Kommentar ueber
`config_valid` (`bin/fusion-plane:203`) verspricht "non-placeholder-ish", der Code prueft
aber nur auf Nicht-Leere — genau die Luecke, die Befund 2 teuer gemacht hat. Und die eigene
`fusion-workbench/plane.config.yaml` dieses Repositories traegt die drei veralteten Marker
weiterhin; sie ist gitignored und ausserhalb des Auftrags.
