# Schritt 10 (Vorprüfung im Fremdprojekt) und der Nachzug der kompilierten Waisen

**Agent:** coder
**Datum:** 260807-1220-coder-schritt10-vorpruefung-und-kompilierte-waisen.md
**Status:** Complete
**Circle:** `260807-0923-guard-misst-statt-orakelt`
**Plan:** `260807-0931_*_plan-guard-misst-statt-orakelt.md`, Schritt 10
**Befund:** `260807-1202_*_kompilierte-waisen-des-klassifizierers-stehen-noch-in-hooks-dist.md`
**Commit:** keiner — der Auftrag verbot das Committen ausdrücklich

## Teil 1 — die kompilierten Waisen

Der Befund nannte vier Dateien und die Ursache getrennt, und die Ursache ist das
Eigentliche: `npm run build` war `tsc`, `npm test` war `tsc && vitest run`, und
`tsc` schreibt in sein `outDir`, ohne dort aufzuräumen. Eine gelöschte Quelle
lässt ihr Kompilat stehen, in git verzeichnet und vom Installer nach `~/.fusion`
kopiert. Nur die vier Dateien zu löschen hätte denselben Zustand beim nächsten
gelöschten Modul zurückgebracht.

Geändert ist deshalb `hooks/package.json`:

```
"build": "rm -rf dist && tsc"
"test":  "npm run build && vitest run"
```

Zwei Zeilen, eine Aufräumung, und `test` ruft den Bau statt ihn zu wiederholen —
es gibt jetzt genau eine Stelle, die `hooks/dist/` erzeugt. Der erste Lauf des
neuen Skripts hat die vier Waisen entfernt
(`dist/lib/bash-mutation-guard.{js,d.ts}`, `dist/lib/shell-reach.{js,d.ts}`).
`git status` zeigt danach genau vier Löschungen und keine einzige Änderung an
den übrigen 36 Dateien: das Kompilat war im Übrigen aktuell, wie der Befund
vermutet hatte, und das ist damit gemessen statt angenommen.

Auf weitere Waisen mechanisch geprüft, nicht per Augenschein: die Modulnamen
unter `dist/` gegen die Quellen aus dem `include` der `tsconfig.json` (`*.ts`
plus `lib/**/*.ts` ohne `lib/__tests__`), verglichen mit `comm -13`. Die
Differenz waren genau `lib/bash-mutation-guard` und `lib/shell-reach`, also die
vier bekannten Dateien und sonst nichts.

Zwei Textstellen zogen nach. `README-hooks.md` beschreibt unter "Rebuilding
after TS changes" jetzt, warum der Bau wischt, mit dem eingetretenen Fall als
Beleg. Und der Kopfkommentar von `rules-emission-golden.test.ts` zitierte das
alte Skript wörtlich ("the latter is `tsc && vitest run`") und verwies auf einen
abgeschlossenen Planschritt; beides ist auf den heutigen Stand gezogen. Der
Rat selbst bleibt richtig und wird sogar dringlicher: `npm test` wischt `dist/`
jetzt, diese Suite hat dort nichts zu suchen.

## Teil 2 — die Vorprüfung, vier Läufe

| Lauf | Ergebnis |
|---|---|
| `npm test` | Exit 0, 30 Test-Dateien / 1002 Tests grün |
| `npm run build` | Exit 0, keine Diagnose |
| Sieben Harness-Suiten mit `FUSION_GUARD_ENTRY=dist` | Exit 0, 7 Dateien / 225 Tests grün |
| `claude plugin validate .` | Exit 0, "Validation passed with warnings", eine Warnung |
| `claude --plugin-dir . --agent fusion:orchestrator -p "reply SMOKE-OK"` | Exit 0, Antwort `SMOKE-OK` |

Die Warnung der Manifest-Prüfung betrifft `CLAUDE.md` am Plugin-Wurzelverzeichnis
("not loaded as project context, use a skill instead"). Sie steht seit jeher und
gehört nicht zu diesem Umbau; der Release-Schritt 0 in `CLAUDE.md` lässt
Warnungen ausdrücklich zu.

Die sieben Harness-Suiten sind die, die `helpers/guard-harness.ts` importieren:
`protected-snapshot-integration`, `guard-bash-integration`, `guard-bash-wiring`,
`guard-case-folding`, `guard-escalation-shape`, `guard-halt-event`,
`guard-rules-write-integration`.

## Der ausdrücklich verlangte Fall

Verlangt war: eine per Shell veränderte geschützte Datei wird im echten
Fremdprojekt zurückgeschrieben und der Halt ist gesetzt, gefahren gegen `dist`.

Der vorhandene Fall
(`protected-snapshot-integration.test.ts`, "reverts a protected rule file
written through the shell, and halts") deckt das der Sache nach ab: echtes
Fremdprojekt über `withProject`, Werkzeugname `Bash`, und er prüft alle vier
Zusicherungen — Inhalt zurück auf `# a rule`, `haltActive` wahr, der Text an das
Modell nennt die Datei und "has been restored", und `guard_block` plus
`guard_halt` stehen im Ereignisprotokoll.

Er deckt es aber nicht wörtlich ab: die Bytes ändert `writeFileSync` im
Testprozess, nicht eine Shell. Für die Messung ist das dasselbe Ereignis — sie
vergleicht zwei Fingerabdrücke und erfährt nie, wer sie bewegt hat — aber
"dasselbe Ereignis für den Mechanismus" ist ein Schluss, und dieser Schluss ist
genau die Aussage, auf der die Freigabe ruht. Deshalb ergänzt statt behauptet:

`protected-snapshot-integration.test.ts`, "reverts one an actual shell process
wrote, not only one this test wrote" — dieselben vier Zusicherungen, aber der
Effekt ist ein `execFileSync("/bin/sh", ["-c", "echo … > rules/x.md"])` im
Projektverzeichnis. Einzeln gegen `dist` gefahren und grün.

Dass `FUSION_GUARD_ENTRY=dist` die vitest-Worker überhaupt erreicht, ist mit
einer Gegenprobe belegt: `FUSION_GUARD_ENTRY=nonsense` bricht mit der erwarteten
Meldung `FUSION_GUARD_ENTRY must be "tsx" or "dist"` ab. Ohne diese Probe wäre
ein grüner `dist`-Lauf mit einem stillschweigend gegen die Quelle gefahrenen
Lauf nicht unterscheidbar gewesen.

## Geänderte Dateien

- `hooks/package.json` — Aufräumung vor dem Bau, `test` ruft den Bau
- `hooks/dist/lib/bash-mutation-guard.{js,d.ts}`, `hooks/dist/lib/shell-reach.{js,d.ts}` — gelöscht (nicht gestaged)
- `hooks/lib/__tests__/protected-snapshot-integration.test.ts` — ein Fall ergänzt (21 → 22)
- `hooks/lib/__tests__/rules-emission-golden.test.ts` — Kopfkommentar auf das neue Skript gezogen
- `README-hooks.md` — "Rebuilding after TS changes" beschreibt die Aufräumung
- `fusion-workbench/circles/260807-0923-guard-misst-statt-orakelt/issues/260807-1202_c_kompilierte-waisen-*.md` — `Resolved:` ergänzt, Marker auf geschlossen
- `fusion-workbench/circles/260807-0923-guard-misst-statt-orakelt/planning/260807-0931_o_plan-*.md` — Schritt 10 auf `[DONE]` mit Ergebnisnotiz

## Offen

Schritt 11, die Freigabe, ist ein menschliches Gate und bleibt offen. Nichts ist
committet; die Arbeitskopie trägt alle Änderungen.
