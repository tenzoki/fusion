# Welche Rolle spielt Plane gegenüber der workbench: Spiegel, führendes System oder beidseitiger Abgleich?

---
**Domain:** code
**Status:** implemented
**Filed by:** shaper
**Cross-references:** `260716-1847_*_spec-plane-integration-und-workbench-struktur.md`, `260716-1847_*_offline-verhalten-bei-plane-ausfall.md`

---

## Question

fusion behandelt heute die Dateien unter `fusion-workbench/` als alleinige Wahrheit und arbeitet vollständig ohne Netzverbindung. Eine Anbindung an Plane muss diese Grundhaltung entweder erhalten, einschränken oder aufgeben. Die Frage ist vor allen anderen Plane-Fragen zu beantworten, weil sie den Umfang der Arbeit um mehr als eine Größenordnung verschiebt und weil das Offline-Verhalten, die Konfliktbehandlung und die Zuordnung der Artefakt-Typen sämtlich an ihr hängen.

Der Nutzer hat als bindende Randbedingung gesetzt, dass die Kernfeatures und Hooks erhalten bleiben. Ob die Datei-als-Wahrheit-Haltung zu diesen Kernfeatures zählt, ist selbst Teil dieser Entscheidung und sollte ausdrücklich beantwortet werden.

## Options

1. **Spiegel (Push-only)** — Die Dateien bleiben die Wahrheit. fusion überträgt Issues, Decisions und Circles zusätzlich nach Plane. Kein Rücklesen.
   - Pros: Erhält Offline-Fähigkeit und Git-Historie unverändert. Kein Konfliktmodell nötig. Ein Plane-Ausfall bleibt folgenlos, weil die Übertragung jederzeit aus den Dateien neu aufgebaut werden kann. Kleinster Eingriff.
   - Cons: Änderungen, die ein Mensch in Plane vornimmt (Status ziehen, kommentieren, zuweisen), gehen beim nächsten Abgleich verloren. Plane wird zum Leseinstrument, nicht zum Arbeitsinstrument. Deckt sich womöglich nicht mit dem, was der Nutzer unter "perfekt zusammenarbeiten" versteht.

2. **Plane führt, Dateien folgen** — Plane hält Issues, Decisions und Circles; die workbench behält nur Prosa (History, Reviews, Analysen, Specs, Pläne).
   - Pros: Ein einziger Ort für den Arbeitsvorrat, keine Doppelpflege. Menschliche Änderungen in Plane wirken unmittelbar.
   - Cons: fusion ist ohne Netz nicht mehr arbeitsfähig, was die Offline-Grundhaltung bricht. Das Rate-Limit von 60 Anfragen pro Minute wird zur harten Schranke für den Turn-Loop. Der Arbeitsvorrat verlässt die Git-Historie und ist nicht mehr mit dem Commit auditierbar, der ihn verändert hat.

3. **Beidseitiger Abgleich** — Änderungen fließen in beide Richtungen, mit Konflikterkennung.
   - Pros: Kommt dem Wortlaut "perfekt zusammenarbeiten" am nächsten. Mensch und Agent arbeiten am selben Objekt.
   - Cons: Verlangt ein vollständiges Konfliktmodell, eine Zuordnungstabelle zwischen Dateipfaden und Plane-Identifikatoren, Idempotenz gegen die von Plane bekannten Doppel-Webhooks (makeplane/plane#7249) und eine Antwort auf die Frage, wer bei Divergenz gewinnt. Nach unserer Einschätzung um ein Vielfaches aufwendiger als Option 1 und die mit Abstand fehleranfälligste Variante.

4. **Zurückstellen** — Die Ordner-Umstrukturierung wird zuerst umgesetzt, die Plane-Rolle danach entschieden.
   - Pros: Die Umstrukturierung ist nachweislich unabhängig von Plane und liefert für sich genommen Nutzen. Die Plane-Rolle lässt sich auf der neuen Struktur besser beurteilen.
   - Cons: Verzögert das vom Nutzer zuerst genannte Ziel.

## Constraints

- Kernfeatures und Hooks bleiben erhalten (Nutzer-Vorgabe, bindend).
- Plane erzwingt 60 Anfragen pro Minute je Client.
- Die Pages-API ist auf selbst gehosteten Instanzen über die öffentliche REST-Schnittstelle nicht erreichbar (makeplane/plane#8986). Prosa-Dokumente können dort nicht zuverlässig liegen.
- Zugangsdaten dürfen nicht in Dateien liegen, die ein Agent liest. Der API-Key gehört in eine Umgebungsvariable (`rules/fusion-workbench-conventions.md` `## Security`).

## Recommendation

Wir empfehlen Option 1 als ersten Schritt, sofern der Nutzer Plane primär zum Mitlesen und zur Abstimmung mit anderen Menschen nutzen will. Sie erhält die Offline-Fähigkeit, verlangt kein Konfliktmodell und lässt sich später zu Option 3 ausbauen, ohne verworfen zu werden. Option 2 empfehlen wir nicht: sie gibt die Git-Auditierbarkeit des Arbeitsvorrats auf, die zu den tragenden Eigenschaften von fusion gehört.

Die Empfehlung steht unter einem Vorbehalt, den nur der Nutzer auflösen kann: wenn er erwartet, in Plane selbst Status zu ziehen und zu kommentieren und dass fusion das aufnimmt, dann trägt Option 1 nicht, und die Frage lautet Option 3 oder gar nicht.

---
Answered: 260716-1800-orchestrator-session.md — Option 1 (Spiegel, Push-only). Der Nutzer hat am Spec-Gate 2026-07-16 "Nur mitlesen" gewählt: er und andere lesen den Stand in Plane mit, gearbeitet wird weiter in fusion. fusion schreibt nach Plane und liest nie zurück. Damit ist der Vorbehalt der Empfehlung aufgelöst — der Nutzer will Plane nicht als Arbeitsinstrument, sondern zum Mitlesen und Abstimmen. Die Datei-als-Wahrheit-Haltung und die Offline-Fähigkeit zählen folglich zu den geschützten Kernfeatures und bleiben unverändert. Option 3 (beidseitiger Abgleich) bleibt ein möglicher späterer Ausbau, ohne dass Option 1 dafür verworfen werden müsste.
Implemented: `982336f` — `bin/fusion-plane` is the push-only mirror the answer chose. Verified 260731-2324-reconciliation.md (reconciler): the header states "push-only, idempotent mirror of the fusion work queue into a Plane project" (`bin/fusion-plane:2`); the subcommand set is `push / seed / map / states / doctor / plan` (`:1501-1544`) with no continuous read-back path; the map/state writes go one way. The later bounded seeding read (`seed`, `bd62bf1`) refines this decision rather than overturning it — see `260719-2141_*_plane-rolle-push-only-vs-bounded-readback-martin.md`, which says so explicitly. Shipped in v5.5.0.
Deferred:
Superseded by:

---
Retired: `d0ddabb` + `7c12d6a` (Schritte 2 und 3 von 260815-0029_*_plan-remove-eight-mechanisms-and-cap-growth.md) — die Push-only-Rolle war die Rolle des Spiegels, und der Spiegel ist entfernt. Die Antwort bleibt richtig fuer die Zeit, in der sie galt; ein Zielsystem, dem gegenueber die workbench fuehrend waere, gibt es nicht mehr.
