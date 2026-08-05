`clear-halt.js` meldet "not halted" statt "keine workbench gefunden", wenn es am falschen Ort läuft

---

**Severity:** Medium
**Domain:** code
**Filed by:** orchestrator, nachdem der Nutzer genau darauf hereingefallen ist
**Affects:** `hooks/clear-halt.ts` und die Halt-Meldung, die jeder Agent und jeder Nutzer zu sehen bekommt

---

## Was passiert ist

Der Guard hatte sich nach drei Fail-closed-Denials gesperrt. Die Halt-Meldung nennt das
Kommando so, wie es in der Dokumentation steht:

```
Run: node <plugin-root>/hooks/dist/clear-halt.js to reset.
```

Der Nutzer hat es aus seinem Home-Verzeichnis ausgeführt und bekam:

```
Guard is not halted. No action needed.
```

Der Halt war zu diesem Zeitpunkt aktiv. Nachgeprüft: `haltActive: true`, `consecutiveBlocks: 3`
in `fusion-workbench/.guard-state/escalation.json` des Projekts, unverändert nach dem Lauf.

## Warum

`clear-halt.js` ruft `loadEscalation()` ohne Argument. Das löst den State-Pfad über die
workbench auf, die aufwärts vom Arbeitsverzeichnis gesucht wird. Aus `~` gibt es keine, also
lädt es den leeren Zustand, und der leere Zustand ist nicht gehaltet. Das Skript kann nicht
unterscheiden zwischen "es gibt keinen Halt" und "ich habe nichts gefunden, wo einer stehen
könnte".

Der Halt ist projektbezogen, das Kommando ist plugin-bezogen formuliert, und nichts in der
Meldung sagt, dass das Arbeitsverzeichnis zählt. Genau die Kombination führt dazu, dass ein
Nutzer den richtigen Befehl am falschen Ort ausführt und eine Erfolgsmeldung bekommt.

## Warum das die Klasse ist, die dieser Circle die Woche über geschlossen hat

Ein Werkzeug meldet normalen Betrieb, während es nichts getan hat. Dieselbe Form wie
`260804-1607` (ein fail-open Guard war auf dem Dashboard unsichtbar), wie
`260804-1601` (ein Projekt schreibt auf, dass der Guard an ist, und schaltet damit den Schutz
ab) und wie `260802-2334` (eine formgültige `escalation.json` liess den Guard komplett
fail-open laufen). In allen vier Fällen ist die Ausgabe nicht falsch, sondern beantwortet eine
andere Frage als die gestellte.

## Richtungen, nicht entschieden

1. **Unterscheiden und sagen.** Findet `clear-halt` keine workbench, ist das kein "not halted",
   sondern "keine workbench oberhalb von `<cwd>` gefunden — führe das Kommando im Projekt aus".
   Billigste Variante und schliesst den gemessenen Fall.
2. **Den Pfad annehmen.** `clear-halt [projektpfad]`, damit der Ort explizit statt implizit ist.
3. **Die Halt-Meldung ergänzen**, sodass sie den `cd` mitliefert. Nötig unabhängig von 1 und 2,
   denn die Meldung ist das, was ein Nutzer tatsächlich liest.

Richtung 1 und 3 zusammen wären die ehrliche Minimalantwort.

## Reproduktion

Guard in einem Projekt halten lassen, dann `node ~/.fusion/hooks/dist/clear-halt.js` aus einem
Verzeichnis ohne workbench darüber ausführen. Ausgabe ist `Guard is not halted.`, der Halt
steht weiter.
