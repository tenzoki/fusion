# Orchestrator Session — 260805-0638

**Directive:** Ausstieg. Die Kontextsteuer pro Dispatch senken und ausliefern, statt den Shell-Klassifizierer weiter zu härten. Sechs Schritte nach `planning/260804-2356_o_plan-ausstieg-kontextsteuer-und-auslieferung.md`, Erfolgsmaß ist Byte pro Dispatch pro Agent.
**Mode:** plan
**Status:** In progress
**Git HEAD at start:** `49a1c48`

## Warum der Kurs gewechselt wurde

Zwei Tage, 57 Commits, nichts ausgeliefert. Der Guard-Umbau war laut Spec ein Blocker, den man
beiseite räumt, damit ein `curator` Regeldateien schreiben darf. Er hat elf Turns gefressen,
weil aus dem Text eines Shell-Kommandos vorherzusagen, welche Datei es schreibt, im
Allgemeinen nicht entscheidbar ist. Der Nutzer hat den Versuch abgebrochen.

Die Messung, die den Ausschlag gab: **145 144 Byte** werden bei jedem Dispatch jedes Agenten
geladen. `rules/protected-path-discipline.md` war am 2026-08-02 16 100 Byte groß und ist an
HEAD 50 559. Die Arbeit hat also genau die Steuer erhöht, deretwegen das Vorhaben existiert.

## Was der Nutzer entschieden hat

- Der Curator bleibt gewollt, Treiber ist **unite cocreator**, wo die Kontextmenge die
  Verarbeitungsgeschwindigkeit beeinträchtigt.
- Auf die Frage, was drastisch bereinigen heißt: **weniger laden, nichts löschen**. C2, die
  Beweisregel des Curators, bleibt unverändert; die Ersparnis kommt aus dem Zuschnitt.
- `protected-path-discipline.md` kann so nicht bleiben.

## Was an meinen eigenen Behauptungen falsch war

Der Planner hat vier umgeworfen, eine davon trägt: **der Manifest-Mechanismus kann den
Zuschnitt nicht leisten.** Er ist rein additiv, kein Eintrag unterdrückt eine fest verdrahtete
`emit_if_exists`-Zeile, und seine Pfadauflösung erreicht keine Plugin-Datei. Die Spec sagt
das seit dem 1. August, C9 Schritt 4. Hebel ist die `case "$AGENT"`-Mustertabelle.

Zweitens: das Zurückschneiden von `protected-path-discipline.md` ist **kein Gewinn für unite
cocreator**. Die 34 kB Wachstum sind nie ausgeliefert worden. Wir verhindern eine Regression.
Der echte Posten dort bleibt die Konventionsdatei mit 59 303 Byte und braucht C9 Schritt 3.

## Per-Turn Log

(läuft)
