# Schritt 2 — die Messung: Fingerabdruck vorher, Vergleich und Rückrollen nachher

**Datum:** 2026-08-07
**Agent:** coder
**Status:** Complete
**Plan:** `260807-0931_*_plan-guard-misst-statt-orakelt.md`, Schritt 2
**Nicht committet** — der Auftrag schließt das Committen aus.

## Was entstanden ist

| Datei | Art |
|---|---|
| `hooks/lib/protected-snapshot.ts` | neu — Auflösung, Fingerabdruck, Vergleich, Ablage |
| `hooks/guard.ts` | Fingerabdruck vorher; Bash-Halt-Zweig entfernt; Kopf nachgezogen |
| `hooks/tracker.ts` | Vergleich, Rückrollen, Halt, erklärende Meldung; Kopf korrigiert |
| `hooks/lib/escalation.ts` | neu `raiseHalt` — Halt sofort, ohne Schwellenzählung |
| `hooks/lib/__tests__/helpers/guard-harness.ts` | `runTracker`, `runToolCall`, `git`-Option, geteilter Einstieg |
| `hooks/lib/__tests__/protected-snapshot-integration.test.ts` | neu — 14 Fälle |

Dazu ein Entscheidungssatz und ein Befundsatz, beide unten benannt.

## Die vier Prüfpunkte des Auftrags

**1. Kann die PostToolUse-Antwort einen erklärenden Text zurückgeben? Ja.** Der Hook-Vertrag
führt `hookSpecificOutput.additionalContext` und setzt es neben das Werkzeug-Ergebnis,
damit das Gespräch weiterläuft. Nicht bei der Dokumentation belassen, sondern gemessen:
ein eigener Probe-Hook gegen Claude Code 2.1.224 lieferte den Text beim Modell als
System-Reminder `PostToolUse:Bash hook additional context: <text>` ab. Die Randbedingung
der bindenden Entscheidung ist damit **vollständig** erfüllt; der Rückfall auf Halt plus
Ereignis wurde nicht gebraucht. Der Kopf von `tracker.ts` behauptete das Gegenteil und ist
korrigiert — die richtige Unterscheidung lautet: blockieren kann ein PostToolUse-Hook
nicht, erklären schon.

**2. Ein Pfad, den git nicht kennt, wird nicht zurückgerollt.** Umgesetzt ohne zweite
Wahrheitsquelle: es gibt keine getrennte "kennt git diesen Pfad?"-Abfrage, sondern der
Austrittsstatus von `git checkout HEAD -- <pfad>` ist der Zweig. Damit fallen drei Lagen
unter eine Regel — nicht versioniert, in diesem Aufruf neu angelegt (HEAD hat nichts
herzustellen), kein git-Repository. In allen dreien wird gemeldet und gehaltet, mit der
fehlenden Versionierung als benanntem Grund, und der Text sagt ausdrücklich, dass die
Änderung noch auf der Platte liegt. Zwei Testfälle halten es fest.

**3. `hooks/tracker.ts` `TRACKER_NOISE_FILES`.** Bewusst bestätigt, nicht mitgezogen. Der
Eintrag steht mit einer Begründung im Quelltext: in `hooks/config.json` hieß
`fusion-workbench/.guard-state/**` "hier darf ein Agent nicht schreiben" und ist gefallen;
hier heißt derselbe Text "Änderungen hier sind kein Signal über das Schreibverhalten des
Agenten", und das gilt stärker als vorher, weil `guard.ts` jetzt bei jedem Aufruf einen
frischen Fingerabdruck in dieses Verzeichnis schreibt. Ihn zu löschen, weil der andere
gefallen ist, bräche die Churn-Messung aus einem Grund, der mit Churn nichts zu tun hat.

**4. Beide Seiten unter derselben `isFusionPluginCwd()`-Stilllegung.** `guard.ts` schreibt
im eigenen Repository keinen Fingerabdruck, `tracker.ts` misst dort nicht. Ein Testfall
über `withPluginProject` hält es fest.

## Der Bash-Halt ist entfallen

Der `mutation.mutates`-Zweig ist weg, an seiner Stelle steht eine Notiz mit dem Verweis auf
den Entscheidungssatz. Zwei Testfälle halten beide Hälften fest: eine ungeschützte
Shell-Mutation läuft unter Halt durch, ein Schreibwerkzeug bleibt blockiert.

Entscheidungssatz:
`260807-1026_*_verlust-des-bash-halts-auf-der-shell.md`

`bin/fusion-paths coder` gibt kein `OUT_DECISION` aus — der bekannte Resolver-Befund, der
als `.../260807-0952_*_ontocoder-kann-keinen-entscheidungssatz-ablegen.md` schon
offen liegt. Der Ort ist deshalb aus der Circle-Hälfte von `SCAN_DECISIONS` und der
Herkunftsregel abgeleitet: die Frage entstand aus dieser Directive, also gehört sie in
diesen Circle und nicht nach `shared/`.

## Ein Befund, der beim Prüfen des Rückrollens auffiel

`260807-1026_*_rueckrollen-auf-head-kann-menschliche-vorarbeit-verwerfen.md`

Die Messung kennt den Zustand **vor dem Aufruf**, zurückgerollt wird aber auf **HEAD**.
Hatte ein Mensch an derselben geschützten Datei bereits gearbeitet und der Agent
überschreibt sie im selben Aufruf, verwirft `git checkout HEAD --` beide Fassungen. Der
häufigere Fall — vorher veränderte Datei, in diesem Aufruf unangetastet — ist durch den
Vorher-Fingerabdruck bereits abgedeckt und hat einen eigenen Testfall. Der Restfall bleibt,
weil der Plan den Mechanismus auf HEAD festlegt; ihn zu ändern wäre keine Umsetzung von
Schritt 2, sondern eine Änderung an Schritt 2. Trüge der Fingerabdruck den Inhalt statt
nur den Hash, entfiele der Restfall und der ganze Zweig "git kennt diesen Pfad nicht"
gleich mit.

## Bekannter Zwischenzustand: die Regel-Ausnahme hängt noch nicht

Solange Schritt 3 nicht gelandet ist, rollt die Messung auch einen Schreibvorgang zurück,
den `FUSION_ALLOW_RULES_WRITE` auf der Schreibwerkzeug-Seite erlaubt hat. Das steht als
Kommentar an der Stelle, an der Schritt 3 einhängt, statt entdeckt werden zu müssen.

## Messung der Laufzeit

Zwei Fingerabdruck-Läufe je Werkzeugaufruf, gemessen an einem Projekt mit einem
`node_modules` von 200 Dateien, das der Lauf korrekt nicht betritt:

| Geschützte Dateien | je Aufruf |
|---|---|
| 10 | 1,7 ms |
| 100 | 10,4 ms |
| 500 | 50,7 ms |

Deckt sich mit den 27 ms des Plans. Die Vorfilterung aus der Risikotabelle ist nicht nötig.

## Prüfstand

Getrennt gemessen statt geschätzt. Der Ausgangsstand wurde in einem eigenen Baum
rekonstruiert (`git archive HEAD` plus die noch nicht committeten Schritte 1 und 8), weil
Schritt 1 im Arbeitsbaum liegt und nicht im HEAD.

| | Dateien | Tests |
|---|---|---|
| vor Schritt 2 | 6 rot | 10 rot, 1667 grün |
| nach Schritt 2 | 10 rot | 38 rot, 1653 grün |

Die zehn des Ausgangsstands sind unverändert dieselben. Die 28 neuen zerfallen in genau
drei Ursachen:

- **17 — der entfallene Bash-Halt.** `guard-bash-wiring` (4), `guard-halt-event` (5),
  `guard-escalation-shape` (1), `guard-rules-write-integration` (7). Beabsichtigt.
  **Drei davon sind eine Falle:** die Fälle "keeps every protected pattern when a project
  is …" prüfen unter anderem `rm -rf fusion-workbench/.guard-state` auf `block`. Sie waren
  im Ausgangsstand grün, aber nicht weil `.guard-state/` geschützt gewesen wäre — sie
  laufen nach drei vorangegangenen Blocks in den Halt, und der Bash-Halt blockierte jede
  erkannte Mutation. Nachgeprüft: mit einem Probe-Aufruf im Ausgangsstand erlaubt der
  Klassifizierer denselben Befehl in einem frischen Projekt. Sie gehören damit inhaltlich
  zu den Schritt-1-Nachwehen, nicht zu einer neuen Regression.
- **10 — `.guard-state/` wird jetzt bei jedem Aufruf beschrieben.** Alle prüfen
  `guardStateWritten(root) === false`, also die Zusicherung, dass ein harmloser Bash-Aufruf
  gar nichts in den Guard-Zustand schreibt. Der Vorher-Fingerabdruck muss irgendwo liegen,
  und `.guard-state/` ist der Ort — genau deshalb ist das Verzeichnis in Schritt 1 von der
  Schutzliste gefallen. Die Zusicherung dahinter (Befundsätze `260707-0750_*_bash-allow-resets-block-counter-defeats-halt-escalation.md` / `260707-0751_*_guard-allow-bash-events-flood-events-jsonl.md`)
  ist **nicht** verletzt: der Zähler wird nicht zurückgesetzt und `events.jsonl` wächst
  nicht. Sie ist zu schärfen, nicht aufzugeben — die richtige Formulierung lautet "setzt
  den Zähler nicht zurück und schreibt kein Ereignis", nicht "legt `.guard-state/` nicht
  an". Das gehört in Schritt 5.
- **1 — `derivable-enumerations-lint`.** Die Modultabelle in `README-hooks.md` kennt
  `lib/protected-snapshot.ts` noch nicht. `README-hooks.md` ist Textschicht und damit
  Schritt 6.

**Zwei Anmerkungen zur Dateiliste von Schritt 5:** `guard-halt-event.test.ts` und
`guard-escalation-shape.test.ts` stehen dort nicht, tragen aber zusammen sechs der
Halt-Fehlschläge. Beide sind aufzunehmen.

Zusätzlich grün: `npx tsc --noEmit` läuft durch, und die 14 neuen Fälle bestehen. Die
positiven Fälle prüfen einen beobachtbaren Effekt (die Datei trägt wieder ihren
committeten Inhalt), können also nicht leer bestehen — das ist die Falle, gegen die der
Harness gebaut ist.

**Nicht gelaufen:** `npm run build` und der zweite Durchgang mit `FUSION_GUARD_ENTRY=dist`.
Das ist Schritt 10; ein Bau jetzt würde `dist/` mit Modulen füllen, die Schritt 4 löscht.
Der Typprüflauf deckt die Übersetzbarkeit ab.

## Was ausdrücklich nicht angefasst wurde

`bash-mutation-guard.ts` und `shell-reach.ts` stehen unverändert, der Aufruf des
Klassifizierers in `guard.ts` ebenfalls, abzüglich des Halt-Zweigs (Schritt 4). Die
Regel-Ausnahme ist unberührt (Schritt 3). Die Textschicht ist unberührt (Schritt 6).
