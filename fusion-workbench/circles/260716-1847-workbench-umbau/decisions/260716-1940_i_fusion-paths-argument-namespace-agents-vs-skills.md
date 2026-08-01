# Nimmt `fusion-paths` nur Agenten-Namen, oder auch Skill-Namen?

---
**Domain:** code
**Status:** implemented
**Filed by:** orchestrator (Befund von `coder` in P-2)
**Cross-references:** `fusion-workbench/planning/260716-1910[p]-plan-workbench-umbau-circle-container.md` (Schritt 7), `rules/fusion-workbench-conventions.md` `## Path Resolution`, `bin/fusion-paths`

---

## Question

`bin/fusion-paths <agent>` nimmt einen Agenten-Namen und gibt dessen Schreib- und Suchziele zurück. Die Signatur folgt `bin/fusion-rules <agent>`, und für die 15 Agenten trägt sie.

Für Skills trägt sie nicht sauber. `OUT_MEMO` ist im Vertrag definiert, aber **kein Agent schreibt Memos** — `/fusion:memo` ist eine Skill. Dasselbe Muster trifft auf weitere Skills zu, die eigene Schreibziele haben.

`coder` hat den Fall in P-2 vorläufig so aufgelöst: Skills laufen innerhalb der Sitzung eines Agenten, also löst `/fusion:memo` (vom Orchestrator angestoßen) über `fusion-paths orchestrator` auf, und der Orchestrator trägt deshalb `OUT_MEMO`. Das ist eine begründete Annahme, keine Festlegung des Vertrags — der Coder hat sie als solche im Skript-Kopf vermerkt und die Entscheidung ausdrücklich offen gelassen.

Die Frage muss vor Schritt 7 (die 6 übrigen Skills) fallen, weil die Skills dort auf die Auflösung umgestellt werden.

## Options

1. **Agent-Namensraum behalten, Skills erben vom aufrufenden Agenten** — der Zustand nach P-2.
   - Pros: Eine Signatur, identisch zu `fusion-rules`. Kein neuer Namensraum. Skills brauchen keine eigene Registrierung.
   - Cons: `OUT_MEMO` hängt am Orchestrator, obwohl der Orchestrator selbst keine Memos schreibt. Ein Leser des Skripts fragt sich, warum. Skills, die ein Nutzer direkt aufruft, ohne dass ein Agent aktiv ist, haben keinen definierten Aufrufer.

2. **Namensraum um Skill-Namen erweitern** — `fusion-paths memo`, `fusion-paths archive`, neben den 15 Agenten.
   - Pros: Jede Skill fragt nach ihren eigenen Zielen. `OUT_MEMO` sitzt dort, wo es hingehört. Klarer zu lesen.
   - Cons: `fusion-rules` und `fusion-paths` haben verschiedene Namensräume, obwohl sie nebeneinander im selben Setup-Schritt stehen. Kollisionsgefahr, falls ein Skill-Name je einem Agenten-Namen gleicht.

3. **Zweites Argument** — `fusion-paths <agent> [skill]`.
   - Pros: Beide Namensräume bleiben getrennt.
   - Cons: Bricht die Ein-Argument-Symmetrie zu `fusion-rules` ohne erkennbaren Gewinn gegenüber Option 2.

## Constraints

- `rules/fusion-workbench-conventions.md` ist die Vertragsstelle; die Antwort gehört dorthin, nicht in ein Prompt.
- Die Symmetrie zu `bin/fusion-rules` war ein tragender Grund für den Entwurf des Resolvers (Wiederverwendung eines bewährten Musters statt Erfindung eines neuen).
- Die Antwort muss vor Schritt 7 des Umbau-Plans stehen.

## Recommendation

**Option 2.** Nach der Evidenz aus Schritt 7 (P-7, 2026-07-17) trägt Option 1 nicht.

## Evidenz aus P-7 — Option 1 bricht

P-7 hat Option 1 gegen die sechs echten Skills getestet, statt sie zu erschließen. Ergebnis:

- **`memo` — trägt, aber nur durch statische Benennung.** `OUT_MEMO` ist unbedingt `shared/memos`, das Argument wählt also nichts aus. Die Begründung aus P-2 ("Skills laufen in der Sitzung eines Agenten") ist dabei gar nicht tragend: `fusion-paths` ist ein Shell-Skript und prüft nie, wer es aufruft. Die Skill nennt schlicht einen Agenten, der den Key zufällig führt.
- **`log-activity` — bricht, und kein Agentenname repariert es.** Die Skill liest Consultations und Investigations. `SCAN_CONSULT` führt **nur** `playmaker`, `SCAN_INVESTIGATIONS` **nur** `conceptrev`. Kein Agent führt beide. Vom Orchestrator unabhängig nachgeprüft: über alle 15 Agenten emittiert keiner beide Keys. Es gibt also kein Argument, das die Leseseite dieser Skill auflöst.
- **`cleanup` — trägt.** `orchestrator` führt alles Nötige.
- **`help`, `unlock`, `revise-claude-md` — nicht betroffen.** Keine Ablagepfade.

P-7 hat `log-activity` umgangen, statt Option 1 zu erzwingen: die Skill scannt jetzt den Baum, weil ihr Job ohnehin *alle* Aktivität ist, und braucht damit nur `WORKBENCH`. Das ist für diese Skill die bessere Form, aber es ist eine Lösung für ihren Zuschnitt, nicht für die Frage — einer Skill, die echt zwei Lese-Keys braucht, stünde sie nicht offen.

## Der eigentliche Preis von Option 1

Nicht der in den Optionen genannte ("Skills ohne aktiven Aufrufer"), sondern ein Regelbruch. Die Konventionen fordern ausdrücklich: *jedes Verzeichnis, das ein Agenten-Prompt liest, braucht einen `SCAN_*`-Key in dessen Set; jede Art, die er schreibt, einen `OUT_*`.* Der Orchestrator führt bereits `OUT_MEMO`, obwohl sein Prompt keine Memos schreibt — ein Bruch. `log-activity` unter Option 1 lauffähig zu machen hieße, `SCAN_CONSULT` und `SCAN_INVESTIGATIONS` für Lesevorgänge zu ergänzen, die der Orchestrator-Prompt nicht ausführt — zwei weitere Brüche.

Damit hört das Key-Set auf, eine Aussage über einen Prompt zu sein, und wird zur Vereinigungsmenge aus "was irgendeine Skill dieser Sitzung brauchen könnte". Genau diese Drift soll die Audit-Notiz in `bin/fusion-paths` verhindern. Option 2 hält die Regel intakt und legt jeden Key dorthin, wo sein Leser sitzt.

**Gegenargument, das bleibt:** T2-B hat festgestellt, dass die drei Orchestrator-Keys `OUT_MEMO`, `OUT_CIRCLE`, `SCAN_HISTORY` genau von den in seiner Sitzung laufenden Skills gebraucht werden — unter Option 1 sind sie also tragend, nicht überflüssig. Ein Lint-Gate, das die Vereinigung aus Prompt und gehosteten Skills nicht bildet, würde sie fälschlich als überflüssig melden, und jemand würde sie löschen und `/fusion:memo` brechen. Option 2 löst dieses Problem mit auf, weil dann jede Skill ihre eigenen Keys erfragt.

**Kosten von Option 2:** `fusion-paths` und `fusion-rules` hätten verschiedene Namensräume, obwohl sie nebeneinander im selben Setup-Schritt stehen. Das war das Hauptargument für Option 1.

## Nebenbefund aus derselben Quelle

`SCAN_INVESTIGATIONS` existiert nicht, aber `conceptrev` liest Investigations. Weil `OUT_INVESTIGATION` unbedingt auf `shared/investigations` zeigt, dient derselbe Wert dem Lesen, und P-2 emittiert ihn deshalb an `conceptrev`. Ein `OUT_`-Schlüssel als Leseziel ist eine Unschönheit des Vertrags, kein Fehler. Gehört mit dieser Frage zusammen entschieden.

---
Answered: history/260716-1800-orchestrator-session.md — Option 2 (Namensraum um Skill-Namen erweitern). Der Nutzer hat am Gate 2026-07-17 gewählt, gestützt auf die Evidenz aus P-7: kein Agent emittiert SCAN_CONSULT und SCAN_INVESTIGATIONS zugleich, `log-activity` ist unter Option 1 also nicht auflösbar. Damit sitzt jeder Key bei seinem Leser, und die Konventions-Regel (jedes gelesene Verzeichnis braucht einen SCAN_*-Key im Set des Lesenden) bleibt intakt. Der Orchestrator verliert OUT_MEMO, OUT_CIRCLE und SCAN_HISTORY, sobald die Skills ihre eigenen Keys erfragen. Gemeinsam mit der Ableitungs-Entscheidung (260717-0033) umgesetzt: die Namensraum-Erweiterung und die Ableitung greifen ineinander, weil `fusion-paths log-activity` seine Keys dann aus skills/log-activity/SKILL.md ableitet.
Implemented: f261a6a (derive key sets from prompts; skills become first-class names) — shipped in v4.0.0. Verifiziert durch reconciler 260717: `bin/fusion-paths` löst jeden der 14 Skills auf (fusion-paths.test.ts: "resolves every skill too, with no stderr", grün).
Deferred:
Superseded by:
