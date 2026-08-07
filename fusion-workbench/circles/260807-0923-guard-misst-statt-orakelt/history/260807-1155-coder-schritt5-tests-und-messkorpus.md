# Schritt 5 — Tests und Messkorpus

**Status:** Complete
**Datum:** 2026-08-07 11:55
**Ausführer:** coder
**Plan:** `circles/260807-0923-guard-misst-statt-orakelt/planning/260807-0931_o_plan-guard-misst-statt-orakelt.md`, Schritt 5
**Ausgangslage:** 219 Fehlschläge in 13 Dateien, vier davon luden gar nicht mehr (Commit `ba7ccda`)
**Ergebnis:** 999 grün, 2 rot — beide nachweislich Schritt 6 und 7

## Endstand der Suite

```
Test Files  2 failed | 28 passed (30)
     Tests  2 failed | 999 passed (1001)
```

Die zwei roten gehören nicht zu diesem Schritt:

| Datei | Zusicherung | Eigentümer |
|---|---|---|
| `rules-emission-golden.test.ts` | `matches the checked-in golden, agent by agent` | S7 — die Goldfixture wird dort neu erzeugt (ontocoder) |
| `reference-resolution-lint.test.ts` | `every EXAMPLE_PATHS entry is still referenced somewhere` | S6 — Befund `260807-1133` ist dafür abgelegt |

Zum zweiten gibt es einen Zuständigkeitskonflikt, der offen gemeldet und nicht
eigenmächtig entschieden wurde: der Befund `260807-1133_o_*` weist die
Streichung der vier toten `EXAMPLE_PATHS`-Einträge diesem Schritt zu, der
Auftrag an diesen Schritt verbietet ausdrücklich, `reference-resolution-lint.test.ts`
anzufassen. Die Änderung ist vier Zeilen; wer sie ausführt, entscheidet der Nutzer.

## Gelöscht

| Datei | Warum die Eigenschaft nicht mehr existiert |
|---|---|
| `bash-mutation-guard.test.ts` | Prüfling gelöscht (S4). |
| `shell-reach.test.ts` | Prüfling gelöscht (S4). |
| `reachability-corpus.test.ts` | Misst den Klassifizierer gegen seine eigene Baseline; beide Seiten fort. |
| `helpers/reachability-corpus.ts` | Importiert `classifyBashMutation`. |
| `helpers/shell-witness.ts` | Führt Korpuszeilen aus, die nur der Korpus erzeugt. |
| `fixtures/mutation-verdicts-head.json` | Verdikt-Aufzeichnung eines Klassifizierers, den es nicht mehr gibt. |

`guardStateWritten()` ist aus `helpers/guard-harness.ts` gefallen. Kein
Prüfling-Verlust, sondern ein Prädikat, das seine Frage nicht mehr beantworten
kann — der Grund steht als Kommentar an seiner Stelle.

## Die zehn `guardStateWritten === false` — geschärft, nicht entfernt

Die Eigenschaft (Befunde `260707-0750` und `260707-0751`) besteht fort: ein
harmloser Bash-Aufruf setzt den Eskalationszähler nicht zurück und hängt kein
Ereignis an. Falsch war nur die Formulierung — seit der Umstellung legt der
PreToolUse-Hook bei **jedem** Werkzeugaufruf einen frischen Fingerabdruck unter
`.guard-state/protected-snapshot.json` ab, das Verzeichnis existiert also nach dem
ersten `ls -la`. Die Zusicherung lautet jetzt überall
`readEscalation(root) === null` und `readEvents(root) === []`, also auf den zwei
Dateien, von denen die beiden Befunde tatsächlich handeln.

Betroffene Stellen: `guard-bash-integration.test.ts` (2), `guard-bash-wiring.test.ts` (1),
`guard-rules-write-integration.test.ts` (3), dazu vier in Fällen, deren Träger-Test
mit dem Klassifizierer fiel.

## Die drei Schein-Schutzprüfungen

`keeps every protected pattern when a project is …` (drei Ausprägungen) sicherte
zu, dass `rm -rf fusion-workbench/.guard-state` blockiert. Die Zeile stand an
vierter Stelle, der Halt war dort längst aktiv, und der Block kam vom Halt — am
Baseline-Klassifizierer nachgemessen war der Pfad über den Ancestor-Pass nie
geschützt. Die Zeile ist gestrichen, die Nachbarzeile `rm -rf agents` (ein echter
Ancestor-Deny) ebenfalls, weil sie kein PreToolUse-Verdikt mehr hat. Die
Schutzzusicherung selbst trägt weiter, auf den Schreibwerkzeugen:
`agents/coder.md`, `rules/x.md`, `skills/demo/SKILL.md`, `hooks/config.json`,
`fusion-guard.json`.

## Datei für Datei

| Datei | vorher rot | jetzt | was verändert wurde |
|---|---|---|---|
| `guard-bash-wiring.test.ts` | ja | 26 grün | Klassifizierer-Verdrahtung und Halt-Gate raus; die Branch-Politik-Verdrahtung, die zwei Bash-Invarianten und der ganze Schreibpfad bleiben. Die Zusicherung "die Branch-Politik ist nicht auf die Stilllegung gegattert" ist von einer Reihenfolge- zu einer Abwesenheitsaussage geschärft (`isFusionPluginCwd` kommt in `guardBashCommand` gar nicht mehr vor). |
| `guard-bash-integration.test.ts` | ja | 18 grün | Von 1719 auf 380 Zeilen. Erhalten: Vorbedingungen, Schreibpfad, macOS-realpath-Falle, die zwei Bash-Invarianten, die Eskalation über drei Bash-Denies (jetzt Branch-Denies), die Stilllegung, die Revert-Strategie in beiden Shells. |
| `guard-rules-write-integration.test.ts` | ja | 116 grün | Die Ausnahme auf der Bash-Seite entfällt (sie sitzt jetzt auf der Messseite, `isObservedRulePath`); die Dateisystem-Grenze, die Kollaps-Schreibweisen, der Selbstschutz-Boden, die Projektkonfiguration und die Vorrang-Regel bleiben, auf den Schreibwerkzeugen. |
| `guard-case-folding.test.ts` | ja | 20 grün | Der Bash-Block fällt: die Messung vergleicht Bytes, nicht Schreibweisen, also hat die Fallfaltung dort keinen Gegenstand. Der Schreibwerkzeug-Block und die Grant-Seite bleiben vollständig; `.guard-state` fällt aus der Musterliste (S1). |
| `shell-parse.test.ts` | ja (43) | 40 grün | Capture-Modus, Joiner und Tiefen fort. Der flache Segmenter, der Blank-Modus, `tokenize`, `resolveWord` und der geerntete git-Korpus bleiben. |
| `config.test.ts` | ja | 72 grün | Die drei `.guard-state`-Zusicherungen und der "nine patterns"-Kommentar sind weg. |
| `guard-halt-event.test.ts` | ja (6) | 5 grün | Zwei Halt-Quellen statt drei. Neu formuliert: der Halt erreicht die Shell nicht mehr, und der Branch-Deny meldet unter einem Halt weiter seinen eigenen Grund. |
| `guard-escalation-shape.test.ts` | ja | 18 grün | Die sechs Bash-Zeilen laufen über `git switch main` statt `rm -f agents/coder.md` — sie erreichen dieselbe `loadEscalation`, also trägt die Zusicherung gegen das Fail-Open weiter. |

## Unangetastet und grün

`git-branch-guard.test.ts` (102 grün, Goldfixture über 98 Befehle nicht neu
erzeugt), `fs-locator.test.ts`, `protected-snapshot-integration.test.ts` (21),
`rules-write-exemption.test.ts`.

## Die Messung — Liste geprüft, nichts ergänzt

Die vier vom Plan geforderten Fälle sind in
`protected-snapshot-integration.test.ts` vollständig vorhanden:

| gefordert | vorhanden als |
|---|---|
| geschützte Datei per Shell verändert → zurückgeschrieben, Halt gesetzt | `reverts a protected rule file written through the shell, and halts` |
| vorher schon veränderte Datei → nicht angefasst | `does not touch a protected file the human had already modified` |
| Regelpfad unter gesetztem Flag → bleibt stehen, Notiz | `leaves a rule file alone under the flag, and records why` |
| derselbe Pfad, vom Projekt deklariert → trotz Flag zurückgeschrieben | `reverts a rule path the project declared for itself, flag or no flag` |

Ergänzt wurde nichts. Zwei gestrichene Zusicherungen aus
`guard-rules-write-integration.test.ts` (der Selbstschutz-Boden gegen `rm` und
gegen ein zweites `cp` der Vorlage) sind dort ebenfalls schon gedeckt, durch
`still protects fusion-guard.json itself under a declared empty list` und
`reverts a protected file that was deleted`.

## Nebenbefund

`fusion-guard.json` (Wurzel und `templates/`) behauptet in `_protectsItself`
weiter, das Löschen der Datei sei "denied on the write tools and through the
shell alike". Auf der Shell wird sie jetzt zurückgeschrieben, nicht verweigert.
Die Datei steht in keiner Dateiliste von Schritt 6 und gehört ontocoder. Als
Befund abgelegt.

## Stale Tasklist

`fusion-workbench/tasklist.md` gehört noch dem Vorgänger-Circle
`260804-1205-shell-reachability-model` (Kopf: 2026-08-07 00:02, Source-Plan
`260806-2353_*`). Für diesen Circle gibt es dort keinen Eintrag, also wurde
keiner abgehakt. Das ist ein Fall für den reconciler, nicht für diesen Schritt.
