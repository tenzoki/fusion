# Planer-Sitzung: Umsetzungsplan für den Rückbau des Shell-Klassifizierers

**Datum:** 2026-08-07
**Agent:** planner
**Status:** Complete
**Ergebnis:** `circles/260807-0923-guard-misst-statt-orakelt/planning/260807-0931_o_plan-guard-misst-statt-orakelt.md`

## Auftrag

Umsetzungsplan für den aktiven Circle schreiben: der statische Klassifizierer, der
aus dem Befehlstext vorhersagt, welche Dateien ein Shell-Befehl schreibt, verschwindet
vollständig und wird durch eine Messung nach der Ausführung ersetzt. Zweiter Bestandteil:
das MECE-Prinzip als Abschnitt in `rules/critical-stance.md` verankern, mit einem
Prüfpunkt im Arbeitsfluss.

## Was geprüft wurde

Import-Graph über `hooks/` (alle relativen Importe, Rückwärtskanten je Modul),
`guard.ts` Kopfdokumentation und `guardBashCommand`, `tracker.ts` vollständig,
`hooks/hooks.json`, `hooks/config.json`, `fusion-guard.json`, die Exportflächen von
`shell-parse.ts`, `command-word.ts` und `rules-write-exemption.ts`, der Prüf-Harness
`helpers/guard-harness.ts`, die Gold-Fixture-Zusicherungen in `git-branch-guard.test.ts`,
die Zeilenzahlen aller Test- und Fixture-Dateien, sowie `bin/fusion-rules` (Zielgruppen-
Mechanik für `protected-path-internals.md`) und die Textstellen in `README-hooks.md`,
`CLAUDE.md` und `hooks/lib/__tests__/config.test.ts`.

## Zwei Korrekturen am Circle-Datensatz

Der Import-Graph im Grounding-Abschnitt stimmt in zwei Zeilen nicht mit dem Quelltext
überein. Beide sind im Plan unter `## Ausgangslage` festgehalten:

1. `rules-write-exemption.ts` importiert `bash-mutation-guard` **nicht**
   (`rules-write-exemption.ts:260-262` importiert `paths.js`, `git-branch-guard.js`,
   `config.js`). Die Kopplung läuft über zwei Rückrufe, die `guard.ts:433-449` in
   `classifyBashMutation` hineinreicht.
2. `fs-locator.ts` (268 Zeilen) und `command-word.ts` (350) sind in der 5.640-Zeilen-Summe
   "Klassifizierer produktiv" mitgezählt, dienen aber der Schreibwerkzeug-Ausnahme
   beziehungsweise der Branch-Politik und bleiben. Produktiv fallen rund 4.140 Zeilen
   vollständig plus der Grammatik-Anteil von `shell-parse.ts`.

## Vier Entscheidungen, die der Plan trifft

1. `fusion-workbench/.guard-state/**` fällt von der Schutzliste — Selbstbezug: die
   Messung schreibt ihre eigene Buchführung dorthin und meldete sonst jeden Aufruf als
   Verletzung. Die Halt-Integrität wird als eigener Entscheidungssatz abgelegt (S1).
2. `FUSION_ALLOW_RULES_WRITE` bekommt auf der Messseite einen engeren Einstieg mit nur
   Tor 1 und Tor 1b; die übrigen Tore sind auf einem beobachteten Pfad gegenstandslos (S3).
3. Der Bash-Halt entfällt, weil er dieselbe unentscheidbare Frage in klein stellt. Der
   Verlust wird als Entscheidungssatz abgelegt (S2).
4. `rules/protected-path-internals.md` wird gelöscht, nicht gekürzt, samt der
   Zielgruppen-Mechanik in `bin/fusion-rules` (S6).

## Plan

11 Schritte, abhängigkeitsgeordnet, je Schritt genau ein Ausführer aus `{coder, ontocoder}`.
Zwei Mermaid-Diagramme: Modulaufbau nach dem Umbau, Schritt-DAG. Ein menschliches Gate
(S11 Freigabe). 183 Zeilen gegenüber 395 des Vorgängerplans.

## Nicht geplant

Eine grobe textuelle Vorwarnung vor der Ausführung — ausdrücklich aus der Directive
ausgeschlossen. Kein Schritt führt sie ein oder bereitet sie vor.
