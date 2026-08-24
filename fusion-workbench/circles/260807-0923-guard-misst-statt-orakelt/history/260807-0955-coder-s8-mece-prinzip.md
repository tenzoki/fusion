# Coder — S8: das MECE-Prinzip und sein Prüfpunkt

**Status:** Complete
**Datum:** 2026-08-07 09:55
**Plan:** `circles/260807-0923-guard-misst-statt-orakelt/planning/260807-0931_*_plan-guard-misst-statt-orakelt.md`, Schritt 8
**Bindende Entscheidung:** `circles/260804-1205-shell-reachability-model/decisions/260807-0825_*_should-the-guard-predict-shell-writes-or-enforce-them.md`
**Nicht committet** — der Orchestrator committet.

## Was geändert wurde

**`rules/critical-stance.md`** — neuer Abschnitt 4, "A case split is disjoint and
complete, or the question is cut wrong". Drei Sätze in aufsteigender Kostenordnung:
disjunkt und vollständig, sonst Defekt; lässt es sich nicht herstellen, ist der Schnitt
falsch; ist die Frage aus den Eingaben des Mechanismus unentscheidbar, wechselt der
Mechanismus statt der Näherung. Dazu vier gesetzte Teile:

1. **Warum Abschnitt 2 nicht gereicht hat**, ausdrücklich benannt: §2 beschreibt, wie eine
   gute Lösung aussieht, und fragt nicht, ob die gestellte Frage überhaupt eine hat. Ein
   Entwurf kann §2 bestehen — kohärent, einheitlich, nichts angeschraubt — und trotzdem die
   Näherung von etwas Unentscheidbarem sein.
2. **Ein Beleg, nicht drei.** Der Guard-Klassifizierer: 12 923 Zeilen, 21 dokumentierte
   Residuen, 17 Fehlalarme und 0 echte Treffer in vier Tagen, zwei unabhängige
   Entwurfsprüfungen mit je einer Verletzung dieses Abschnitts (überlappende Prädikate an
   einem Verzweigungsknoten; eine Prozedur, die Totalität behauptete).
3. **Der Prüfpunkt** als Codeblock: die Pflichtzeile im Plankopf, mit der Sprachregel
   (`**Entscheidbarkeit:**` in einem `de`-Projekt).
4. **Die Wirkung ehrlich**: die Durchsetzung liegt beim Menschen am Freigabe-Gate, nicht in
   der Prompt-Anweisung; der Prompt-Weg wird als überschreibbar benannt.

Kopf und Schluss der Datei mussten mitziehen: "three norms" → "four norms" in der Einleitung,
und der Schlussabsatz nennt jetzt vier Fehlermodi statt drei. Der `**Provenance:**`-Kopf bleibt
unverändert (Datei nicht neu); die neue Bindung steht als abschnittsbezogene
`Binding decision:`-Zeile am Ende von §4, wie `rules/rule-file-provenance.md` es für
Abschnittsbindungen vorsieht.

**`agents/planner.md`** — `**Decidability:**` als vierte Kopfzeile im Ausgabeformat, direkt
unter `**Spec:**`, plus ein Satz unter der Vorlage, der die Zeile für verpflichtend erklärt,
auf `rules/critical-stance.md` §4 verweist und die deutsche Schreibung nennt.

**`hooks/lib/__tests__/fixtures/rules-emission.golden`** — neu erzeugt.
`critical-stance.md` 5 317 → 9 482 Bytes, alle sechzehn Agentenblöcke plus deren Summen.
32 Zeilen geändert, sonst nichts. `RULE_BASELINE` im Test wurde **nicht** angefasst: der
Testkopf legt fest, dass die Baseline nur nach einer Aufräumaktion neu geschnitten wird,
nicht nach einer Änderung.

## Zwei bewusste Abweichungen vom Auftragstext

**Die Kopfzeile heißt in der Vorlage `**Decidability:**`, nicht `**Entscheidbarkeit:**`.**
Der Auftrag nannte den deutschen Bezeichner. `agents/planner.md` führt seine Vorlage aber
durchgängig englisch (`**Date:**`, `**Status:**`, `**Spec:**`), und die deutschen Pläne dieses
Projekts übersetzen sie beim Schreiben — der vorliegende Plan trägt `**Datum:**`, `**Spec:**`,
`**Entscheidbarkeit:**`. Ein deutscher Bezeichner in einer sonst englischen Vorlage hätte
genau die Halb-und-halb-Datei erzeugt, vor der der Auftrag bei `critical-stance.md` warnt, und
hätte einem englischsprachigen Konsumprojekt ein deutsches Feld gegeben. Der geforderte Token
entsteht in diesem Projekt trotzdem wörtlich, weil die Sprachregel in beiden Dateien steht.

**Zwei Zitate wurden umformuliert, damit sie im Konsumprojekt nicht ins Leere zeigen.** Der
erste Entwurf zitierte `CLAUDE.md` "Problem 11" und die Circle-Verzeichnisse ohne Vorbehalt.
`rules/critical-stance.md` wird in Konsumprojekte ausgeliefert, `fusion-workbench/` aber nie —
das ist derselbe Fehler, den Befund 260805-1145 schon einmal für fünf Sätze aufgeschrieben hat.
Der Beleg nennt jetzt ausdrücklich, dass die Messungen in fusions eigener Workbench liegen; der
Problem-11-Verweis nennt den Fall statt der Datei.

## Prüfung

`npm test` in `hooks/`: **1 667 von 1 677 grün, 10 Fehlschläge — alle zehn älter als dieser
Schritt.** Sie hängen an Plan-Schritt S1, der `fusion-workbench/.guard-state/**` aus
`hooks/config.json` und `hooks/config.example.json` entfernt hat (beide Dateien liegen
uncommittet im Arbeitsbaum); der Testanteil dazu ist Plan-Schritt S5 und noch nicht begonnen.
Betroffen sind `bash-mutation-guard.test.ts`, `config.test.ts` (2), `guard-bash-integration.test.ts` (2),
`guard-case-folding.test.ts` (2), `guard-rules-write-integration.test.ts` (2),
`reachability-corpus.test.ts` — jeder Fehlschlag nennt `.guard-state` im Namen oder im Diff.
Keiner berührt `rules/`, `agents/` oder die Goldfixture.

Die drei Tore, die dieser Schritt hätte reißen können, sind grün:
`rules-emission-golden.test.ts` (9), `provenance-header-lint.test.ts` (27),
`path-literal-lint.test.ts` (19).

## Was der nächste Bearbeiter wissen muss

- **Der Wachstumsbericht ist nicht ausgelöst worden, aber die Luft wird dünner.** Höchstwert
  jetzt `orchestrator` mit 116 798 Bytes (Drift-Decke 145 144, weit weg); dessen Rolle hat
  8 350 von 12 000 Bytes Kopfraum verbraucht. Die Kernrolle steht bei 96 285 gegenüber einem
  `RULE_BASELINE`-Boden von 89 896, also 6 389 verbraucht — gut 4 165 davon aus diesem Schritt,
  der Rest ist Vor-Drift von `fusion-workbench-conventions.md` und `protected-path-discipline.md`.
  Schritt S6 kürzt `protected-path-discipline.md` deutlich; danach ist der Kopfraum wieder da,
  und **das** ist der Moment für den `RULE_BASELINE`-Neuschnitt, nicht jetzt.
- **`fusion-workbench/tasklist.md` ist veraltet.** Sie führt noch den abgelösten Circle
  `260804-1205-shell-reachability-model` und dessen Plan als Quelle; für den aktiven Plan gibt
  es keine Warteschlange. Dieser Schritt konnte daher keinen Eintrag abhaken. Der taskplanner
  muss die Datei neu erzeugen, bevor die Turn-Schleife wieder daraus zieht.
- **`rules/critical-stance.md` ist englisch, die Projektsprache ist `de`.** Der neue Abschnitt
  wurde auftragsgemäß englisch geschrieben, damit die Datei nicht halb und halb wird. Der Bruch
  bleibt bestehen und ist absichtlich nicht behoben — er ist als Beobachtung gemeldet.

---
**Correction appended 260824** (ontocoder, plan step 5 of `circles/260824-1853-close-every-open-defect/planning/260824-1905_*_plan-close-every-open-defect.md`). The citation of `rules/critical-stance.md` section 4 in this file
spelled the heading with the em-dash it carried at `327d0b6`; `b393a45` (260821) repunctuated the
heading to a comma and the citation went dead. It now carries the current spelling. Filed as
`circles/260820-2051-style-rules-arrive-and-get-measured/issues/260821-0258_*_six-headings-were-renamed-in-the-earlier-commit-of-the-same-turn-with-no-census-and-two-citations-are-now-dead.md`.
