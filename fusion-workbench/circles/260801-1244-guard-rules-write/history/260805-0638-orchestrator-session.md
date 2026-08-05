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

## Abschluss — Gesamtreview und Kurswechsel

Die Sitzung endet nicht am Ausstiegsplan, sondern an einem Gesamtreview, den der Nutzer nach
dessen Abschluss angeordnet hat. Drei unabhängige Durchgänge, 66 Befunde, alle als
Issue-Records im Circle.

**Ausgeliefert wurde v5.9.0 und v5.9.1**, beide getaggt, der Marketplace-Eintrag von 5.7.0 auf
5.9.1 gezogen. Zum ersten Mal seit vier Tagen ist der Stand benutzbar.

**Der Zuschnitt bringt weniger, als die Rollen-Tabelle suggeriert.** Gewichtet mit dem echten
Dispatch-Mix in krk sind es rund drei Prozent, weil `coder`, `coderev` und `bugfixer` als
einzige die Referenzdatei tragen und dabei um sechs Prozent steigen — und `coder` ist der mit
Abstand meistgenutzte Agent. Der Fix dafür steht im Folge-Circle.

**Der wichtigste Befund war ein Missverständnis, und seine Aufklärung ist der eigentliche
Befund.** `FUSION_PLUGIN_ROOT` zeigte auf `~/.fusion` mit v5.8.0. Kein Plugin-Defekt: die
Variable wird beim Session-Start aus dem installierten Plugin gesetzt, und diese Sitzung lief
vier Tage ohne Neustart. Die Folge bleibt: **vier Tage Selbstprüfung liefen gegen eine
veraltete Kopie.** Die fünf Shards dieses Circles haben keinen Agenten erreicht, auch nicht
der eigens für `coder` geschnittene. Jede Regelkorrektur der letzten Tage ist bei den Agenten,
die sie befolgen sollten, nie angekommen.

**Was der Review entlastet:** der Guard hält. `hooks/dist` ist byte-identisch zu einem frischen
Build, 1551 Tests grün, und 226 von 229 dokumentierten Erlaubt/Verboten-Fällen stimmen exakt,
als echte Subprozesse gefahren statt gelesen. Die Schicht mit den meisten Änderungen ist die
gesündeste.

**Was er belastet:** in krk gab es in vier Tagen 17 Bash-Blockierungen, davon null echte
Treffer. Alle Fail-closed-Fehlalarme, häufigster Fall fusions eigene Marker-Umbenennung in
Schleifenform. Diese Bilanz gehört als Grounding in `circles/260804-1205-shell-reachability-model`,
bevor dort eine Zeile entsteht.

**Nachfolger:** `circles/260805-2005-textschicht-gegen-code-nachziehen`, anticipated, fünf
Gruppen. Der Nutzer setzt nach einem `fusion --update` mit `/fusion:next` dort an.

**Status:** Complete.
