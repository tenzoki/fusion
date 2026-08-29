# Werden die Key-Sets in `bin/fusion-paths` weiter von Hand gepflegt oder aus den Prompts abgeleitet?

---
**Domain:** code
**Status:** implemented
**Filed by:** orchestrator (Befund von `coder` in T2-B)
**Cross-references:** `260717-0031[o]-p8-lint-gate-scope-open-questions-from-conversions.md`, `260716-1940[o]-fusion-paths-argument-namespace-agents-vs-skills.md`, `bin/fusion-paths`, `260716-1910[p]-plan-workbench-umbau-circle-container.md` (Schritt 8)

---

## Question

`bin/fusion-paths` führt die Key-Sets je Agent als handgepflegte `case`-Zweige. Die Frage ist, ob das so bleibt oder ob die Sets aus den Prompts abgeleitet werden.

Der Anlass ist ein belegter Fehlschlag der Handpflege. Die Sets entstanden in T2-A durch einen ausdrücklichen zeilenweisen Audit über alle 15 Prompts — und der Audit ging 14 von 15. Der fehlende Fall (`reconciler` schreibt Entscheidungsdatensätze, bekam aber kein `OUT_DECISION`) war kein kosmetischer: die Variable expandierte leer, und die Schreibvorgänge landeten in der workbench-Wurzel. Gefunden erst, als P-6 den Prompt umstellte; behoben in `45d8a71`.

Der Punkt ist nicht, dass jemand geschludert hat. Der Audit war sorgfältig und traf trotzdem daneben, und jede künftige Prompt-Änderung würfelt neu.

**Was sich seit T2-A geändert hat:** T2-A hielt eine mechanische Ableitung für unmöglich, und das stimmte damals — vor der Umstellung nannte die Prosa ein Verzeichnis, und kein Grep trennte "liest" von "schreibt" ohne Urteil. Die Umstellung in P-4 bis P-7 hat genau dieses Signal **erzeugt**: `$OUT_FOO` gegen `$SCAN_FOO` im Prompt-Text ist jetzt die maschinenlesbare Lese/Schreib-Markierung. Die Voraussetzung, an der die Ableitung scheiterte, existiert nicht mehr.

## Options

1. **Handpflege behalten, Lint-Gate in P-8 prüft die Übereinstimmung** — der geplante Zustand.
   - Pros: Kein Eingriff in den Resolver. P-8 ist ohnehin vorgesehen. Der Fehler wird laut, statt still zu sein.
   - Cons: Die Sets bleiben eine zweite Quelle für dieselbe Information. Das Gate meldet die Abweichung, beseitigt aber nicht ihre Ursache; jede Prompt-Änderung erzeugt weiter Arbeit an zwei Orten. Ein Gate, das ständig anschlägt, wird umgangen.
2. **Sets aus den Prompts ableiten** — `KEYS` je Agent ist `grep -oE '\$(OUT|SCAN)_[A-Z_]+'` über den Prompt (plus die in seiner Sitzung laufenden Skills, solange die Namensraum-Frage auf Option 1 steht). Der `case`-Block wird generiert.
   - Pros: Beide Abweichungsrichtungen werden strukturell unmöglich statt bloß getestet. Die Handpflege endet. `HYG-SOT`: eine Quelle.
   - Cons: Größer als P-8 zuschneidet. Erzeugt eine Generierungsstufe, die selbst gepflegt und verteilt werden muss. Die Ableitung zur Laufzeit zu machen kostet bei jedem Aufruf einen Grep über 26 Dateien.
3. **Beides** — ableiten und das Gate als Netz behalten.
   - Pros: Gürtel und Hosenträger.
   - Cons: Wenn die Ableitung stimmt, prüft das Gate eine Tautologie.

## Constraints

- `bin/fusion-paths` spiegelt bewusst `bin/fusion-rules` (Wiederverwendung eines bewährten Musters). `fusion-rules` pflegt seine Zuordnung ebenfalls von Hand — eine Ableitung hier würde die beiden Skripte auseinanderlaufen lassen.
- Die Namensraum-Frage (`260716-1940[o]`) hängt daran: unter deren Option 2 fragt jede Skill ihre eigenen Keys ab, und die "Prompt vereinigt mit gehosteten Skills"-Komplikation entfällt.
- Die zwei Abweichungsrichtungen sind nicht symmetrisch (siehe `260717-0031[o]`): Unter-Emission ist ein eindeutiger Fehler, Über-Emission ist mehrdeutig und oft eine Prompt-Lücke, kein überflüssiger Key. Eine Ableitung würde Über-Emission per Konstruktion beseitigen — und damit die Frage "fehlt hier ein Schritt im Prompt?" unsichtbar machen, die die elf Über-Emissionen gerade aufwerfen.

## Recommendation

Keine. Der `coder` in T2-B empfiehlt Option 2 mit dem Argument, Handpflege sei hier der additive Workaround im Sinne von `rules/critical-stance.md` §2. Das Gegenargument unter Constraints (Über-Emission trägt Information über Prompt-Lücken) ist nicht durchgearbeitet und könnte für Option 3 sprechen. Die Frage sollte vor Schritt 8 fallen, weil sie dessen Zuschnitt bestimmt.

---
Answered: 260716-1800-orchestrator-session.md — Option 2 (Sets aus den Prompts ableiten). Der Nutzer hat am Gate 2026-07-17 gewählt. Begründung des Coders aus T2-B trägt: der handgepflegte Audit war ausdrücklich und zeilenweise und ging trotzdem 14/15, wobei der fehlende Fall in die workbench-Wurzel schrieb; jede künftige Prompt-Änderung würfelt neu. Die Voraussetzung, an der T2-A scheiterte, existiert seit P-4..P-7: die Prompts tragen $OUT_*/$SCAN_* als maschinenlesbare Lese/Schreib-Markierung. Gemeinsam mit der Namensraum-Entscheidung (260716-1940) umzusetzen. Offen und bei der Umsetzung zu beantworten: die Über-Emission verschwindet durch die Ableitung, und mit ihr das Signal 'diesem Prompt fehlt ein Schritt' (elf Fälle, siehe 260717-0031). Falls dieses Signal erhalten bleiben soll, braucht es einen eigenen Ort.
Implemented: f261a6a (derive key sets from prompts instead of declaring them) — shipped in v4.0.0. Verifiziert: fusion-paths.test.ts "every emitted key set is complete and self-consistent for all 15 agents" + der exit-4-Vertrag (Prompt nennt einen Key, den der Resolver nicht kennt) grün. Das offene Folge-Signal (elf Prompt-Lücken, `260717-0031[o]` + `260717-0107_*_prompt-gaps-surfaced-by-fusion-paths-key-set-derivation.md`) bleibt als eigenes Issue bestehen.
Deferred:
Superseded by:
