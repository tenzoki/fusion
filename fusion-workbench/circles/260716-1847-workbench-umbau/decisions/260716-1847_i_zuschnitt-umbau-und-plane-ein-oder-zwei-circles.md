# Werden Ordner-Umbau und Plane-Anbindung als ein Circle oder als zwei umgesetzt?

---
**Domain:** code
**Status:** answered
**Filed by:** shaper
**Cross-references:** 260716-1847[o]-spec-plane-integration-und-workbench-struktur.md, 260716-1847[a]-plane-rolle-source-of-truth.md, 260716-1847[a]-workbench-struktur-circle-container-vs-typ-ordner.md

---

## Question

Die Anfrage enthält zwei Vorhaben, die der Nutzer in einem Atemzug nennt: die Plane-Anbindung und die Umstrukturierung der workbench. Ob sie zusammengehören, ist eine offene Frage mit erheblichen Folgen für Risiko und Prüfbarkeit.

Beide Vorhaben fassen dieselben Dateien an, nämlich die 15 Agenten-Prompts und die 11 Skills. Das spricht für eine gemeinsame Umsetzung. Gegen sie spricht, dass der Umbau für sich genommen Nutzen liefert und nachweislich keine Abhängigkeit zu Plane hat.

## Options

1. **Zwei Circles, Umbau zuerst** — Die Umstrukturierung wird zuerst umgesetzt und abgeschlossen, die Plane-Anbindung danach auf der neuen Struktur.
   - Pros: Jeder Schritt ist einzeln prüfbar. Der Umbau liefert Übersicht, auch wenn Plane nie kommt oder anders ausfällt als gedacht. Die Circle-Struktur ist die natürliche Abbildungsgrundlage für Plane-Module und macht die Anbindung danach kleiner.
   - Cons: Die Agenten-Prompts werden zweimal angefasst.

2. **Ein Circle, gemeinsam** — Beides in einem Zug.
   - Pros: Die Prompts werden einmal überarbeitet.
   - Cons: Ein sehr großer Wurf. Ein Fehlschlag in der Plane-Anbindung gefährdet den Umbau und umgekehrt. Die Plane-Rolle ist noch nicht entschieden, sodass der Umfang des zweiten Teils unbekannt ist.

3. **Nur der Umbau** — Plane wird zurückgestellt.
   - Pros: Kleinster Umfang, sofortiger Nutzen.
   - Cons: Erfüllt das zuerst genannte Ziel des Nutzers nicht.

4. **Nur Plane** — Die Ordner bleiben unverändert.
   - Pros: Trifft das zuerst genannte Ziel unmittelbar.
   - Cons: Lässt das Übersichtsproblem bestehen, das der Nutzer ausdrücklich beschrieben hat. Die Abbildung auf Plane-Objekte bleibt ohne Circle-Verzeichnis unschärfer.

## Constraints

- Kernfeatures und Hooks bleiben erhalten (Nutzer-Vorgabe, bindend).
- Geprüft: die Umstrukturierung berührt 549 Pfadnennungen in 15 Agenten-Prompts, 11 Skills und 3 Regel-Dokumenten. Die Hooks und das Dashboard sind nicht betroffen.
- Die Plane-Rolle (siehe die zugehörige Entscheidung) ist offen. Solange sie offen ist, lässt sich der Umfang des Plane-Teils nicht seriös bemessen.

## Recommendation

Wir empfehlen Option 1. Der Umbau hat keine Abhängigkeit zu Plane, und die Circle-Verzeichnisse sind die Struktur, auf die sich Plane-Module später abbilden lassen. Die Reihenfolge macht den zweiten Schritt kleiner, statt Arbeit zu verdoppeln. Der Einwand, die Prompts würden zweimal angefasst, wiegt nach unserer Einschätzung leicht: die beiden Änderungen betreffen verschiedene Stellen der Prompts, nämlich die Ablagepfade einerseits und die Übertragungsschritte andererseits.

---
Answered: 260716-1800-orchestrator-session.md — Option 1 (Zwei Circles, Umbau zuerst). Der Nutzer hat am Spec-Gate 2026-07-16 gewählt. Circle 1 umfasst C1 und C2 (Umbau, braucht nur D2, ist damit unblockiert und startbereit). Circle 2 umfasst C3 und C4 (Plane-Anbindung als Spiegel, braucht D1 — beantwortet — und D3 — noch offen) und setzt Circle 1 voraus. Der Preis, die Agenten-Prompts zweimal anzufassen, ist bewusst akzeptiert.
Implemented:
Deferred:
Superseded by:

---
Implemented: 260716-1847-workbench-umbau + 260719-1536-plane-mirror-integration — beide Circles der gewählten Option 1 existieren als Verzeichnisse und sind kohärent geschlossen (Umbau als v4.0.0 am 260717, Plane-Bridge am 260720); der akzeptierte Preis (Prompts zweimal anfassen) ist in beiden Plänen belegt. (Reconciler, 260806-1152.)
