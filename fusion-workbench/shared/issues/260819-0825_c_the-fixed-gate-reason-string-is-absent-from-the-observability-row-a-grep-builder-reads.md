The fixed gate-reason string is absent from the `## Observability` row a grep-builder reads

---

`260819-0040_c_phase-4-step-2b-emits-gate-hit-with-no-fixed-reason-…` fixed two strings so that
`260817-1613`'s reserved measurement becomes a `grep`. One of the two reached the event vocabulary
table; the other did not, and it is the half that identifies the gate.

---

`agents/orchestrator.md:866` (Phase 4 step 2b):

> Emit `gate_hit` once with reason `Circle stop conditions` — that exact string, no other phrasing —
> and one `gate_response` per clause carrying `holds` or `does not hold`

`agents/orchestrator.md:1235-1236` (`## Observability` → **Event types**):

> \| `gate_hit` \| Human gate triggered \| Gate reason \|
> \| `gate_response` \| User responded to gate \| Decision (proceed/skip/defer/modify); the Phase-4
> stop-conditions gate writes `holds`/`does not hold`, one per clause \|

The `gate_response` row was updated. The `gate_hit` row still says "Gate reason" and names no
reserved value, so the table gives a reader half the measurement's key.

**Both halves are needed, and they are needed from different rows.** The measurement
`260817-1613` reserves is a rate: how often the gate fired, over how often a clause came back not
holding. The numerator is `grep '"event":"gate_hit"' … | grep 'Circle stop conditions'` and is
recoverable only from the reason string; the denominator is `grep 'does not hold'` and the table now
carries it. The `Resolved:` note is honest about this — it says "The `gate_response` row of the
Observability table records the second shape" and claims nothing about the first — so this is an
omission rather than an overclaim.

**The failure mode is drift, not absence.** With the string stated in one place, a later reword of
step 2b's reason has no second surface to contradict it, and a session's events silently stop
tiling with the ones already in the append-only log. That is the same shape as
`260811-2306_o_the-check-in-emits-three-gate-response-decisions-outside-the-vocabulary-the-event-table-documents.md`,
which the closure deliberately declined to resolve; this is its `gate_hit` twin.

Verified at HEAD `83488e9` by reading `agents/orchestrator.md:864-870` and `:1230-1240`, and by
`grep -n "Circle stop conditions" agents/orchestrator.md` — one hit.

**Fix direction.** Extend the `gate_hit` Detail cell to "Gate reason; the Phase-4 stop-conditions
gate writes the fixed string `Circle stop conditions`". One cell, no mechanism.

Found in the coderev pass over `5ec26b2..83488e9`, session `260818-2301`, Turn 2. No Circle active,
so it is filed in the shared store under the Origin Rule.

---
Resolved: fixed — the `gate_hit` row names the fixed string `Circle stop conditions`; agents/orchestrator.md:1287
