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
`260804-1607_*_guard-error-is-not-rendered-by-the-monitor-so-a-fail-open-guard-is-invisible.md` (ein fail-open Guard war auf dem Dashboard unsichtbar), wie
`260804-1601_*_a-partial-guard-object-silently-removes-every-protected-path.md` (ein Projekt schreibt auf, dass der Guard an ist, und schaltet damit den Schutz
ab) und wie `260802-2334_*_a-shape-valid-escalation-json-makes-the-whole-guard-fail-open-on-both-surfaces.md` (eine formgültige `escalation.json` liess den Guard komplett
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

---
Resolved: Directions 1 and 3, which this record names the honest minimum answer. Direction 2 (an
explicit path argument) was deliberately left alone.

`clear-halt.ts` now calls `findWorkbenchRoot()` before loading any state, using the same locator
`lib/escalation.ts` already resolves through rather than a second one. No workbench above the working
directory now goes to stderr with exit 1 and says what was and was not found, instead of reporting a
clear guard. With a workbench, the path is printed first, so both remaining outcomes are answers about
a named place, and the success wording became "not halted in this project".

The halt message carries the `cd` at every site. `clearHaltCommand()` in `lib/escalation.ts` is the
single author of the sentence, because both raising sites already import that file and two hooks each
building their own copy is two sentences that drift. Fixed at seven locations, found by grepping the
wording rather than trusting the two hooks: `guard.ts`, `tracker.ts`, `clear-halt.ts`, the new
authoring site, `rules/protected-path-discipline.md` (which all 16 agents load), and three places in
`README-hooks.md` plus one in `README.md`.

Reproduced both ways against a scratch project with a seeded halt, never against this repository's own
guard. Before: `Guard is not halted. No action needed.`, exit 0, halt untouched. After: a named
diagnosis, exit 1, halt untouched — and from inside the project, the halt cleared as it always should
have. That rule file grew 358 bytes, so the emission golden was regenerated in the same pass.
