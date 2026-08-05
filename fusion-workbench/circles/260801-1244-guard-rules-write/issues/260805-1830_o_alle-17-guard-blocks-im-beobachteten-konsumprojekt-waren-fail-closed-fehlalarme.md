Alle 17 Guard-Blocks im beobachteten Konsumprojekt waren Fail-Closed-Fehlalarme, darunter fusions eigene Marker-Umbenennung

---

krks `.guard-state/events.jsonl` (14 599 Events, 02.–05.08.) hält genau 17 `guard_block` auf der Bash-Fläche. Alle 17 tragen als blockierten Operanden eine Variable, eine Tilde oder einen Glob (`"$f"`, `"$SCRATCH"`, `~/Library/Application\`, `*`); keiner nennt einen tatsächlich geschützten Pfad. Es gab im Beobachtungszeitraum null echte Treffer und siebzehn Fail-Closed-Verweigerungen auf harmlosen Zielen.

---

Der bitterste Fall ist `mv "260803-1536_o_$f.md" "260803-1536_c_$f.md"` (Eskalations-Record 260803-1831): die Marker-Umbenennung, die `rules/fusion-workbench-conventions.md` (`## State Markers`) selbst als den Weg vorschreibt, Issues zu schließen, in ihrer natürlichen Schleifenform über mehrere Dateien. Der Guard verweigert die eigene Konvention des Rahmens, sobald ein Agent sie idiomatisch ausführt. Ein zweiter wiederkehrender Fall sind `~`-Pfade in den Nutzerdaten der gebauten App (`rm -f ~/Library/Application\ Support/KRK/session.toml`).

Einordnung: kein Block führte zu einem Halt, die Deny-Botschaft nennt den Ausweg, und die Agenten erholten sich jeweils. Die Reibung ist begrenzt, aber ihr gemessener Nutzen war null. Der abgespaltene Circle `260804-1205-shell-reachability-model` adressiert nur die Joiner-Fälle; `mv "$f"` bleibt auch unter einem Reachability-Modell unauflösbar.

Vorschlag zur Behandlung: die 17/0-Bilanz als Grounding-Messung in den Reachability-Circle aufnehmen, bevor dort gebaut wird, und für die Marker-Umbenennung entweder einen geprüften Weg schaffen, der ohne wörtliches Ausschreiben jedes Pfads auskommt, oder in den Konventionen eine schleifenfreie Form vorschreiben, die der Guard beweisen kann.

Quelle: Analyse `analyses/260805-1830-zweck-nutzung-und-stand-des-plugins.md`, Befund 3. Rohdaten: `/Users/k1/Projects/productive/krk/fusion-workbench/.guard-state/{events.jsonl,escalation.json}`.
