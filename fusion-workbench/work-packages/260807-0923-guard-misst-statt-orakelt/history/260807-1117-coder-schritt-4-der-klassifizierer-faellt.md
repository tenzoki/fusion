# Schritt 4 — Der Klassifizierer fällt

**Agent:** coder
**Datum:** 2026-08-07 11:17
**Status:** Complete
**Plan:** `260807-0931_*_plan-guard-misst-statt-orakelt.md`, Schritt 4

## Was gelöscht wurde

| Datei | Zeilen |
|---|---|
| `hooks/lib/bash-mutation-guard.ts` | 3.351 |
| `hooks/lib/shell-reach.ts` | 786 |

Beide über `git rm` entfernt; der Index wurde anschließend mit `git restore --staged`
zurückgesetzt, damit die Löschungen unstaged in der Arbeitskopie stehen und der
Orchestrator die Buchung besitzt.

## Was geändert wurde

| Datei | Art |
|---|---|
| `hooks/guard.ts` | Import `classifyBashMutation` entfernt; der gesamte Schritt-2-Block (Schutzpfad-Verweigerung samt beider Rückrufe `exempt`/`exemptRefusal` und dem Schritt-2b-Ausnahmevermerk) entfernt; Kopfdokumentation, `guardBashCommand`-Docstring und vier weitere Kommentarstellen nachgezogen |
| `hooks/lib/shell-parse.ts` | `parseCommand`, `scanSegments`, `findBalancedParen`, `LocatedSegment`, `capture`, `SUBSTITUTION_FILLER`, `PLACEHOLDER_CHAR`, `QuotedMode`, `ParseOptions`, `SegmentJoiner`, `ParsedSegment`, `ParsedCommand` entfernt; `stripData` auf Blank-Modus reduziert (Parameter `mode`/`literals` weg) |
| `hooks/lib/command-word.ts` | `GRAMMAR_TERMINATORS` entfernt; drei Dokumentationsstellen, die das gelöschte Modul nannten |

**Was in `shell-parse.ts` steht:** `extractCommandSegments`, `stripDataRegions`,
`tokenize`, `resolveWord`, `ResolvedWord`, `PLACEHOLDER_RE` und die privaten Helfer
`blankData`, `findHeredocTerminator`, `stripData`, `stripSubshellParens`.

Zwei Stellen brauchten eine Entscheidung, weil sie nicht ausschließlich am
Klassifizierer hingen:

- **`stripSubshellParens`** hängt an `tokenize` und bleibt, aber seine Ausnahme für
  `SUBSTITUTION_FILLER` fällt mit dem Füller. Wirkungsneutral: den Füller hat nur der
  Capture-Modus erzeugt, und im Blank-Pfad hebt `extractCommandSegments` jedes `$(…)`
  vorher heraus, sodass kein Token mit dieser Form je bis `tokenize` durchkommt.
- **`resolveWord`** behält seine Signatur samt `literals`-Tabelle und `PLACEHOLDER_RE`.
  `git-branch-guard.ts` ruft es mit `NO_LITERALS` auf und darf nicht angefasst werden;
  die Platzhalter-Erkennung ist damit gegenstandslos, aber nicht falsch, und der
  Docstring sagt das jetzt.

## Prüfkriterium, wörtlich

**`npx tsc --noEmit` in `hooks/` läuft durch** — keine Ausgabe, Exit 0. (`tsconfig.json`
schließt `lib/__tests__` aus; das ist der Stand vor diesem Schritt und Absicht.)

**`parseCommand` im Produktivcode:** kein einziger Verweis. Alle 29 verbliebenen
Vorkommen unter `hooks/` außerhalb von `dist/` liegen in `lib/__tests__/`:
`shell-parse.test.ts` (23), `shell-reach.test.ts` (2), `bash-mutation-guard.test.ts` (2)
und die vier Zeilen der Quelltext-Zusicherung in `git-branch-guard.test.ts`, die der
Auftrag ausdrücklich stehen lässt. Die Testdateien sind in diesem Schritt nicht
angefasst worden; Schritt 5 räumt sie ab.

`dist/` wurde **nicht** neu gebaut. Der Baseline-Lauf mit `npm test` (`tsc && vitest run`)
hatte es angefasst; der Stand ist mit `git checkout HEAD -- hooks/dist` wiederhergestellt
und die dabei entstandenen `protected-snapshot.*` entfernt. Die Suite lief danach über
`npx vitest run`, das nicht baut.

## Die Nachbarpolitik ist nicht gestreift

`git-branch-guard.test.ts`: **102 Zusicherungen grün, 0 rot.** Die Gold-Fixture über
98 Befehle (`fixtures/git-verdicts-head.json`) reproduziert byteweise und wurde **nicht**
neu erzeugt — `git diff` auf Fixture und Testdatei ist leer, ebenso auf
`git-branch-guard.ts` und `fs-locator.ts`.

Ebenfalls unverändert grün: `fs-locator.test.ts` (25), `rules-write-exemption.test.ts`
(154), `protected-snapshot-integration.test.ts` (21).

## Suite

| | Dateien rot | Fehlschläge | Tests gelaufen |
|---|---|---|---|
| vorher | 10 | 38 | 1707 |
| nachher | 13 | 219 | 1159 |

Die gefallene Gesamtzahl ist der Grund für vier der dreizehn Dateien: sie laden nicht
mehr, also läuft keine ihrer Zusicherungen.

| Datei | vorher | nachher | Ursache |
|---|---|---|---|
| `guard-bash-integration.test.ts` | 10 | 96 | S4 — die Bash-Verweigerung existiert nicht mehr |
| `guard-rules-write-integration.test.ts` | 11 | 49 | S4 — dieselbe, Bash-Hälfte der Suite |
| `shell-parse.test.ts` | 0 | 43 | S4 — `parseCommand` und Capture-Modus |
| `guard-case-folding.test.ts` | 2 | 13 | S4 — Fallfaltung auf der Bash-Seite |
| `guard-escalation-shape.test.ts` | 1 | 7 | S4 |
| `guard-halt-event.test.ts` | 5 | 7 | S4 |
| `config.test.ts` | 2 | 2 | S1 — entfernter Schutzeintrag, unverändert |
| `derivable-enumerations-lint.test.ts` | 1 | 1 | Zahl gleich, **Grund gewechselt**: die Modultabelle in `README-hooks.md` nannte `protected-snapshot.ts` nicht (S2) und nennt jetzt zusätzlich `bash-mutation-guard.ts`, das es nicht mehr gibt (S4) |
| `reference-resolution-lint.test.ts` | 0 | 1 | **neu** — S4: fünf Textstellen nennen `hooks/lib/bash-mutation-guard.ts` |
| `bash-mutation-guard.test.ts` | 1 | Ladefehler | S4 — Modul gelöscht |
| `shell-reach.test.ts` | 0 | Ladefehler | S4 — Modul gelöscht |
| `reachability-corpus.test.ts` | 1 | Ladefehler | S4 — `helpers/reachability-corpus.ts` importiert das gelöschte Modul |
| `guard-bash-wiring.test.ts` | 4 | Ladefehler | S4 — importiert `classifyBashMutation` |

96+49+43+13+7+7+2+1+1 = 219.

**Zuordnung zu den drei bekannten Ursachen.** Sie bestehen alle drei fort und keine ist
gewachsen: *entfernter Schutzeintrag* trägt weiterhin `config.test.ts` (2); *entfallener
Bash-Halt* trägt `guard-halt-event.test.ts`, `guard-escalation-shape.test.ts` und
`guard-bash-wiring.test.ts`; *neue Buchführung* trägt die zehn Zusicherungen der Form
"ein erlaubter Bash-Aufruf schreibt nichts" (acht in `guard-bash-integration`, zwei in
`guard-rules-write-integration`) und `derivable-enumerations-lint`. Alle zehn dieser
Zusicherungen standen wörtlich schon in der Baseline-Liste.

**Der gesamte Zuwachs von 181 gehört zu S4**, und die Fehlermeldungen sagen es einheitlich:
`expected undefined to be 'block'` — der Guard verweigert auf der Shell nicht mehr. Dazu
`TypeError: parseCommand is not a function` in `shell-parse.test.ts` und vier
Ladefehler.

**Es gibt keinen Fehlschlag, den ich keiner Ursache zuordnen kann.** Der einzige neue
Dateiname in der Liste, `reference-resolution-lint.test.ts`, ist eine Textschicht-Meldung:
sie nennt genau die fünf Stellen, die Schritt 6 ohnehin anfasst — `rules/protected-path-discipline.md:7`,
`rules/protected-path-internals.md:8` und `:20`, `CLAUDE.md:122`, `bin/fusion-rules:204`.
Der Guard selbst läuft: 92 bzw. 43 Zusicherungen der beiden großen Harness-Suiten sind
grün, der Prozess startet und antwortet also.

## Zwei Reste, die dieser Schritt bewusst stehen lässt

Zwei Quelltext-Kommentare nennen das gelöschte Modul weiter, beide in Dateien außerhalb
des Auftrags:

- `hooks/lib/rules-write-exemption.ts:367` — "die Konventionen von `isProtected` in
  `bash-mutation-guard.ts`". Datei von S3.
- `hooks/lib/git-branch-guard.ts:60` — "die Asymmetrie mit dem mutation classifier war
  zufällig". Als historische Begründung richtig; die Datei darf nicht angefasst werden.

Der Referenz-Lint schlägt auf keine von beiden an — er prüft die ausgelieferte Textschicht
(`.md`, `bin/`), nicht `.ts`-Kommentare. Wer die beiden aufräumen will, braucht dafür einen
eigenen Anlass.
