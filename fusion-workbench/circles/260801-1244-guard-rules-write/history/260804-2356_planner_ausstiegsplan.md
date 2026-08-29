# planner — Ausstiegsplan für den Circle guard-rules-write

**Datum:** 2026-08-04 23:56
**Agent:** planner (dispatch vom Orchestrator)
**Ausgabe:** `260804-2356_*_plan-ausstieg-kontextsteuer-und-auslieferung.md`

## Auftrag

Ausstiegsplan nach Abbruch des bisherigen Kurses. Vier Anforderungen: messbare Ersparnis
zuerst, ausliefern, den Guard abschließen statt fortsetzen, den Curator einordnen.
Verbote: keine Aufwandsschätzungen, keine Fortsetzung des Shell-Klassifizierers, kein
Schritt ohne Falsifikat, und für jeden Schritt die Wirkung im konsumierenden Projekt.

## Was geprüft wurde

- `bin/fusion-rules` vollständig gelesen (446 Zeilen), insbesondere `emit_if_exists`
  (269-275) und den awk-Manifest-Block (313-445).
- Byte-Messung der Always-on-Menge an drei Ständen per `git cat-file -p`.
- Abschnittsvermessung beider großer Regeldateien per awk über `^##+ `.
- `npm test` in `hooks/`: 1 537 Tests, 26 Dateien, grün. Das Skript ist `tsc && vitest run`,
  hat also `hooks/dist` mitgebaut.
- Issue-Zählung und Schwere-Extraktion im Issue-Store des Circles.
- Zitatflächen beider Dateien per grep über `agents/ skills/ bin/ hooks/ docs/ rules/`.
- Spec `260801-1122_*_spec-normative-consolidation.md`, C9 und Constraints.

## Befunde, die den Auftrag korrigieren

1. **Der Manifest-Mechanismus kann den Zuschnitt nicht leisten.** Additiv-only, und seine
   `path:`-Werte werden ohne Variablenauflösung ausgegeben, erreichen also keine
   Plugin-Datei. Die Spec sagt dasselbe seit 2026-08-01 (C9 Schritt 4, Zeilen 509-514).
   Der wirksame Hebel ist die `case "$AGENT"`-Mustertabelle.
2. **18 offene Issues, nicht 19 plus einen.** `260804-2100` ist bereits enthalten.
3. **Zwei echte High, dazu ein geerbtes.** `260804-1025_*_the-decision-procedure-tells-an-agent-the-model-stays-exact-for-the-two-commands-that-delete-a-rule-file.md`, `260804-1332_*_git-work-tree-in-the-environment-relocates-the-write-and-the-classifier-reads-no-variable.md`, `260804-1223_*_260804-1025s-reproduction-is-stale-but-its-clause-still-overclaims-here-are-the-commands-that-replace-it.md`.
   Die Annahme "keines High" trägt nicht.
4. **`hooks/dist` war im Index veraltet**, um 3 874 Einfügungen und 325 Löschungen über
   17 Dateien plus zwei nie kompilierte Module. Der Rebuild ist als Nebenwirkung von
   `npm test` im Arbeitsverzeichnis passiert und ist nicht eingecheckt.
5. **Die 145 144 Byte sind die Repo-Zahl.** Die installierte Kopie unter `~/.fusion`
   meldet dieselbe Version `5.8.0` und trägt 105 354 Byte, also den Stand von
   `origin/main`.
6. **Die Ersparnis für ein konsumierendes Projekt ist einstellig**, nicht 34 Prozent:
   105 354 auf 96 116 sind 8,8 Prozent. Die 33,8 Prozent gelten gegen HEAD, also gegen
   einen Stand, den nie jemand installiert hat.

## Bestätigt

- 145 144 Byte an HEAD, exakt.
- 16 100 Byte für `protected-path-discipline.md` am 2026-08-02 (`929dbf5`), exakt.
- 87 387 Byte Always-on am 2026-07-31 (`8c1c9f8`), die Zahl aus dem Constraints-Block
  der Spec.
- 57 unveröffentlichte Commits, Version auf beiden Seiten `5.8.0`.

## Ergebnis

Sechs Schritte, alle `coder`, weil der Circle ausschließlich Code, Build und
Dokumentation über Code berührt. Erfolgsmaß: Byte pro Dispatch pro Agent, Deckel bei
105 354, Ziel 96 500 für 15 der 16 Agenten, Ausgangswert 145 144.

## Nicht getan

Keine Ausführung, keine Dispatches, kein Code angefasst. Einzige Nebenwirkung am
Arbeitsverzeichnis: der Rebuild von `hooks/dist` durch `npm test`.
