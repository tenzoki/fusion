# Wird die workbench nach Circle gruppiert oder bleibt sie nach Artefakt-Typ gegliedert?

---
**Domain:** code
**Status:** implemented
**Filed by:** shaper
**Cross-references:** 260716-1847[o]-spec-plane-integration-und-workbench-struktur.md

---

## Question

Der Nutzer beschreibt das Problem präzise: die Agenten schreiben ihre Ergebnisse in typspezifische Ordner, wodurch semantisch zusammengehörige Dateien über die workbench verteilt liegen. Ein Circle, also eine Arbeitseinheit aus Directive und zugehöriger Grundlage, besteht heute aus einer Datei in `circles/`, während sein Spec in `planning/`, seine Issues in `issues/`, seine Entscheidungen in `decisions/`, sein Sitzungsprotokoll in `history/` und seine Reviews in `codereview/` liegen. Sechs Orte für eine Sache.

fusion kennt mit dem Circle bereits den Begriff, der diese Dateien zusammenbindet. Der Begriff ist bisher nur nicht als Verzeichnis realisiert. Die Frage ist, ob die Struktur diesem vorhandenen Konzept folgt oder ob ein anderer Schnitt gewählt wird.

## Options

1. **Circle als Verzeichnis** — Jeder Circle wird ein Ordner, der alles Zugehörige enthält: Directive, Spec, Plan, Issues, Decisions, History, Reviews.
   - Pros: Nutzt fusions eigenes Konzept, statt ein neues zu erfinden. Ein Circle wird als Ganzes archivierbar, verschiebbar und lesbar. Bildet später ohne Umweg auf ein Plane-Modul ab, mit den enthaltenen Issues als Work Items.
   - Cons: Artefakte ohne Circle-Bezug haben keinen Platz. Ein projektweites Issue, eine freistehende Analyse oder ein Memo entsteht regelmäßig außerhalb jedes Circles.

2. **Circle-Verzeichnis plus gemeinsame Ablage** — Wie Option 1, zusätzlich eine Ablage außerhalb der Circles für alles ohne Circle-Bezug.
   - Pros: Trägt der Beobachtung Rechnung, dass nicht jede Datei zu einem Circle gehört. Die Setup-Skill legt heute `issues/` an, bevor irgendein Circle existiert.
   - Cons: Zwei Orte für denselben Artefakt-Typ. Verlangt eine Regel, wann etwas wohin gehört, und eine Antwort darauf, was passiert, wenn ein freistehendes Issue später einem Circle zufällt.

3. **Typ-Ordner behalten, Index ergänzen** — Die Ordner bleiben; die Circle-Datei erhält einen vollständigen Index aller zugehörigen Dateien.
   - Pros: Kleinster Eingriff. Kein Bruch bestehender Workbenches, kein Migrationspfad nötig.
   - Cons: Löst das vom Nutzer benannte Problem nur auf dem Papier. Die Dateien liegen weiterhin verstreut; der Index muss gepflegt werden und veraltet, sobald ein Agent ihn vergisst.

## Constraints

- Kernfeatures und Hooks bleiben erhalten (Nutzer-Vorgabe, bindend).
- Geprüft: die Hooks und das Dashboard sind von den Typ-Ordnern nicht betroffen. `hooks/config.json:12-22` schützt `agents/**`, `rules/**`, `skills/**`, die Plugin-Konfiguration und `.guard-state/**`. `hooks/tracker.ts:33-36` und `bin/monitor:72-75` lesen ausschließlich `orchestrator-live.md`, `orchestrator-events.jsonl`, `agentstate.yaml` und `.guard-state/events.jsonl`. Die Namen der Typ-Ordner kommen in `hooks/` und `bin/` kein einziges Mal vor.
- Die Marker-Vokabulare (`[o]`, `[a]`, `[t]`, `[c]`, `[p]`, `[i]`, `[b]`, `[s]`, `[d]`) und die Unterscheidung zwischen Defekt, Entscheidung und Circle sind tragende Konzepte und bleiben unabhängig von der Ablage bestehen.
- Bestehende Workbenches in anderen Projekten müssen entweder migriert werden oder weiterlaufen. Die Frage nach der Migration ist Teil der Planung, nicht dieser Entscheidung.

## Recommendation

Wir empfehlen Option 2. Der Circle ist der Begriff, der die verstreuten Dateien inhaltlich bereits zusammenhält, und ihn als Verzeichnis zu realisieren ist die Wiederverwendung einer vorhandenen Abstraktion statt der Erfindung einer neuen. Die gemeinsame Ablage in Option 2 ist kein Kompromiss, sondern trägt einem beobachtbaren Fall Rechnung: die Setup-Skill legt `issues/` an, bevor der erste Circle existiert, und Memos entstehen grundsätzlich ohne Circle-Bezug.

Option 3 empfehlen wir nicht. Ein gepflegter Index gegen verstreute Dateien ist eine zweite Quelle für dieselbe Information und veraltet erfahrungsgemäß in dem Moment, in dem ein Agent ihn nicht mitschreibt.

---
Answered: 260716-1800-orchestrator-session.md — Option 2 (Circle-Verzeichnis plus gemeinsame Ablage). Der Nutzer hat am Spec-Gate 2026-07-16 gewählt: jeder Circle wird ein Verzeichnis mit allem Zugehörigen darin, plus eine Ablage außerhalb der Circles für alles ohne Circle-Bezug (projektweite Issues, Memos, freistehende Analysen). Die konkrete Form der gemeinsamen Ablage und die Regel, wann etwas dorthin gehört, gehören in die Planung. Diese Entscheidung trägt Circle 1 (Umbau) und blockiert ihn nicht länger.
Implemented: 6d4a88d (conventions redefine layout as Circle-container + shared store) + 138cd46 (setup creates the Circle-container layout) — shipped in v4.0.0 (cb5fa80). Verifiziert durch reconciler 260717: der Baum trägt `260716-1847-workbench-umbau` mit `[t]-circle.md` + eigenen Unterordnern, daneben `shared/`.
Deferred:
Superseded by:
