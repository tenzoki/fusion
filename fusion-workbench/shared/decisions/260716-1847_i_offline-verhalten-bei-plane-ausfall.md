# Was tut fusion, wenn Plane nicht erreichbar ist?

---
**Domain:** code
**Status:** implemented
**Filed by:** shaper
**Cross-references:** decisions/260716-1847[a]-plane-rolle-source-of-truth.md, planning/260716-1847[o]-spec-plane-integration-und-workbench-struktur.md

**Status-Notiz (Orchestrator, 2026-07-16):** Die Rollen-Entscheidung ist inzwischen beantwortet und fiel auf "Spiegel" (Push-only). Damit ist die Bedingung erfüllt, unter der der Shaper Option 2 empfiehlt. Diese Entscheidung bleibt dennoch offen, weil sie dem Nutzer gehört und erst für Circle 2 (Plane-Anbindung) beantwortet werden muss. Circle 1 (Umbau) ist von ihr nicht blockiert.

---

## Question

fusion arbeitet heute ohne jede Netzabhängigkeit. Eine Plane-Anbindung führt drei neue Ausfallarten ein: keine Verbindung, Plane antwortet mit einem Fehler, und das Rate-Limit von 60 Anfragen pro Minute ist erschöpft. Der Turn-Loop kann in jeder dieser Lagen weiterlaufen, ausweichen oder anhalten. Die Antwort entscheidet, ob fusion im Zug und im Flugzeug nutzbar bleibt.

Die Frage hängt an der Rolle, die Plane zugewiesen bekommt, ist aber nicht mit ihr identisch: auch ein reiner Spiegel muss beantworten, was mit den ausstehenden Übertragungen geschieht.

## Options

1. **Weiterarbeiten, Übertragung nachholen** — fusion arbeitet auf den Dateien weiter und trägt die ausstehenden Plane-Änderungen in einer Warteschlange nach, sobald Plane wieder erreichbar ist.
   - Pros: Erhält die Offline-Fähigkeit vollständig. Keine Änderung geht verloren.
   - Cons: Verlangt eine dauerhafte Warteschlange, ihre Fehlerbehandlung und eine Antwort darauf, was bei dauerhaft fehlschlagenden Einträgen geschieht.

2. **Weiterarbeiten, Plane später neu aufbauen** — fusion übergeht Plane bei Ausfall und gleicht beim nächsten erfolgreichen Lauf den Zustand aus den Dateien ab.
   - Pros: Einfachste Variante, keine Warteschlange, keine Zustandsverwaltung. Der Abgleich ist eine reine Funktion des Dateizustands und damit idempotent.
   - Cons: Trägt nur, wenn die Dateien die Wahrheit sind. Bei jedem Neuaufbau können in Plane vorgenommene menschliche Änderungen überschrieben werden.

3. **Warnen und anhalten** — fusion bricht Aktionen ab, die Plane benötigen, und fragt den Nutzer.
   - Pros: Keine stille Divergenz zwischen den beiden Systemen.
   - Cons: Gibt die Offline-Fähigkeit auf. Nur sinnvoll, wenn Plane das führende System ist.

## Constraints

- Kernfeatures und Hooks bleiben erhalten (Nutzer-Vorgabe, bindend). Ob die Offline-Fähigkeit zu den Kernfeatures zählt, ist Teil der Rollen-Entscheidung.
- Plane erzwingt 60 Anfragen pro Minute. Ein Turn, der viele Issues anlegt, kann das Limit im Normalbetrieb erreichen; die Rate-Limit-Antwort ist damit kein Ausnahmefall, sondern ein erwartbarer Zustand.
- Ein Fehlschlag darf niemals still bleiben (`HYG-NO-SILENT-FAIL`, sofern die Coding-Hygiene-Regeln des Zielprojekts gelten).

## Recommendation

Wir empfehlen Option 2, sofern die Rollen-Entscheidung auf "Spiegel" fällt. Ein Abgleich, der sich als reine Funktion des Dateizustands beschreiben lässt, braucht keine Warteschlange und ist gegen Doppelausführung unempfindlich. Option 1 wird erst nötig, wenn Plane menschliche Änderungen aufnehmen soll, weil dann der Dateizustand allein den Plane-Zustand nicht mehr bestimmt.

Option 3 empfehlen wir nur, wenn Plane ausdrücklich das führende System wird, und weisen darauf hin, dass diese Wahl die Offline-Grundhaltung von fusion aufgibt.

---
Answered:
Implemented:
Deferred:
Superseded by:

---
Answered: `circles/260716-1847-workbench-umbau/planning/260716-1847_*_spec-plane-integration-und-workbench-struktur.md` §"Entscheidungen (Kai)" D3 — "Weiterarbeiten, Plane ist sekundäre View" (keep working; Plane is a secondary view; a failure is never silent). Realisation is scoped into the Plane mirror Circle (C4). Bookkeeping caught at Plane-Circle prep, 2026-07-19.
Implemented: `982336f` — C4 is live in `bin/fusion-plane`. Verified 260731-2324 (reconciler): `defer()` (`:629-632`) routes an unreachable-Plane transition to `outbox_append()` (`:561`), which writes a human-readable line to `.plane-outbox.jsonl` (`:88`); the run exits `EXIT_DEFERRED=10` — "work deferred to the outbox — non-error, non-crash" (`:108`) — so the failure is recorded, never silent, and never blocks the file-side work. `outbox_drain_circle()` (`:567-572`, called at `:920-923`) clears a Circle's notes only once its reconcile fully succeeds. Shipped in v5.5.0. Test coverage: "absent key / unreachable Plane defers with the manual-paste fallback (exit 10)" in `hooks/lib/__tests__/fusion-plane.test.ts` (suite green 316/316, run 260731-2324).
