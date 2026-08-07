Alle 17 Guard-Blocks im beobachteten Konsumprojekt waren Fail-Closed-Fehlalarme, darunter fusions eigene Marker-Umbenennung

---

krks `.guard-state/events.jsonl` (14 599 Events, 02.–05.08.) hält genau 17 `guard_block` auf der Bash-Fläche. Alle 17 tragen als blockierten Operanden eine Variable, eine Tilde oder einen Glob (`"$f"`, `"$SCRATCH"`, `~/Library/Application\`, `*`); keiner nennt einen tatsächlich geschützten Pfad. Es gab im Beobachtungszeitraum null echte Treffer und siebzehn Fail-Closed-Verweigerungen auf harmlosen Zielen.

---

Der bitterste Fall ist `mv "260803-1536_o_$f.md" "260803-1536_c_$f.md"` (Eskalations-Record 260803-1831): die Marker-Umbenennung, die `rules/fusion-workbench-conventions.md` (`## State Markers`) selbst als den Weg vorschreibt, Issues zu schließen, in ihrer natürlichen Schleifenform über mehrere Dateien. Der Guard verweigert die eigene Konvention des Rahmens, sobald ein Agent sie idiomatisch ausführt. Ein zweiter wiederkehrender Fall sind `~`-Pfade in den Nutzerdaten der gebauten App (`rm -f ~/Library/Application\ Support/KRK/session.toml`).

Einordnung: kein Block führte zu einem Halt, die Deny-Botschaft nennt den Ausweg, und die Agenten erholten sich jeweils. Die Reibung ist begrenzt, aber ihr gemessener Nutzen war null. Der abgespaltene Circle `260804-1205-shell-reachability-model` adressiert nur die Joiner-Fälle; `mv "$f"` bleibt auch unter einem Reachability-Modell unauflösbar.

Vorschlag zur Behandlung: die 17/0-Bilanz als Grounding-Messung in den Reachability-Circle aufnehmen, bevor dort gebaut wird, und für die Marker-Umbenennung entweder einen geprüften Weg schaffen, der ohne wörtliches Ausschreiben jedes Pfads auskommt, oder in den Konventionen eine schleifenfreie Form vorschreiben, die der Guard beweisen kann.

Quelle: Analyse `analyses/260805-1830-zweck-nutzung-und-stand-des-plugins.md`, Befund 3. Rohdaten: `/Users/k1/Projects/productive/krk/fusion-workbench/.guard-state/{events.jsonl,escalation.json}`.

---
Resolved: Der Mechanismus, der die 17 Fehlalarme erzeugt hat, existiert nicht mehr. Die Fail-Closed-Regel war Teil des Erkenners in `hooks/lib/bash-mutation-guard.ts`, gelöscht mit `ba7ccda`; seit v6.0.0 verweigert der Guard auf der Shell vor der Ausführung überhaupt nichts, sodass ein Operand mit Variable, Tilde oder Glob kein Urteil mehr auslöst. Am Baum nachgeprüft in der Reconciliation 260807-1515 gegen HEAD `e684eae`: `guardBashCommand` (`hooks/guard.ts:328-406`) kennt genau zwei Ausgänge, die Branch-Verweigerung und die Override-Notiz, und liest den Befehlstext ausschließlich für `classifyGitCommand`.

Dieser Befund war kein gewöhnlicher Defekt, sondern die Messung, auf der der Mechanismuswechsel ruht. Er ist in `circles/260804-1205-shell-reachability-model/decisions/260807-0825_*_should-the-guard-predict-shell-writes-or-enforce-them.md` unter `## What this session measured`, Punkt 3, zitiert und dort in die Entscheidung eingegangen. Geschlossen, weil sein Gegenstand verschwunden ist — nicht, weil die Zahlen widerlegt wären. Sie stehen in der Entscheidung und im Grounding von `circles/260807-0923-guard-misst-statt-orakelt/_t_circle.md` weiter.
