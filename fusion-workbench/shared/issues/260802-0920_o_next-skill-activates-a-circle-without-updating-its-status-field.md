`/fusion:next` activates a Circle without updating its `**Status:**` field

---

The activation branch of `skills/next/SKILL.md` (Step 6) renames the Circle record from
`_a_circle.md` to `_t_circle.md` and writes `.active-circle`, but never updates the record's
`**Status:**` header field. The field keeps saying `anticipated` while the filename marker says
active. Every Circle activated through the skill carries the contradiction.

Observed on `circles/260801-1244-rule-provenance-header` immediately after activation on
2026-08-02: filename `_t_circle.md`, field `**Status:** anticipated`. Surfaced by the shaper
while making an unrelated edit to the same record.

---

**Why it matters.** The Circle record template in `rules/fusion-workbench-conventions.md`
(`## Circle record template`) defines both surfaces, so a reader has two sources for one fact and
no rule saying which wins. The marker is the one every agent actually reads, which makes the field
the stale copy. `HYG-SOT`: two copies of one fact, and the copy nobody reads is the one that rots.

**Scope of the defect.** Not limited to activation. The same gap plausibly exists at every
transition the conventions file lists under `### Worked transitions` — closure (`_t_`→`_c_`/`_b_`),
supersession, deferral. Each one renames the record; none of the consuming prompts is known to
update the field. The orchestrator's Phase 4 closure step renames the record and appends a
`## Closure note` and does not mention the field either.

**Candidate fixes, not decided here.**

1. Have each transition point update the field alongside the rename. Correct, and it spreads the
   obligation across `skills/next/SKILL.md`, `agents/orchestrator.md` Phase 4, and anywhere else a
   marker moves. Every new transition point inherits the obligation and can forget it.
2. Drop `**Status:**` from the Circle record template and let the filename marker be the only
   source. Removes the duplication rather than maintaining it, at the cost of a record that no
   longer states its own state when read in isolation.
3. Keep the field but define it as decorative, with the marker normative, stated in the template.
   Cheapest, and it leaves a field that reads as authoritative and is not.

Option 2 matches the framework's own reasoning about derived-versus-declared state
(`rules/fusion-workbench-conventions.md` `### Emission is per-consumer, and derived from the
prompt`, on why a declared key set was replaced by a derived one). It is a decision, not a defect
fix, so it wants a decision record if it is taken.

**Origin.** Found during the activation of `circles/260801-1244-rule-provenance-header`, not caused
by that Circle's Directive. Filed in the shared store per the Origin Rule.

**Cross-references:**

- `skills/next/SKILL.md` Step 6.2 (the rename) and 6.3 (the pointer)
- `agents/orchestrator.md` Phase 4, portfolio-sync step 3
- `rules/fusion-workbench-conventions.md` `## Circle record template`, `## State Markers — circles`

---

**Reconciliation 260802-1413 (reconciler, domain `code`) — stays `_o_`. Confirmed live at the end of the session that filed it. The survey below corrects this issue's scope paragraph in a direction the issue did not anticipate.**

The originating instance is unchanged after three Turns: `circles/260801-1244-rule-provenance-header/_t_circle.md:5` still reads `**Status:** anticipated` while the filename marker says `_t_`. Five and a half hours of work passed over that record (Setup 0848, reconciliation 1413) — the shaper edited its Grounding snapshot, playmaker appended a second activation proposal — and no writer touched the field, which is the point: nobody reads it, so nobody notices it is wrong.

**Measured across the whole workbench, not inferred.** All nine Circle records, marker read from the filename and field read from the body:

| Circle | Marker | `**Status:**` field | Agree? |
|---|---|---|---|
| `260716-1847-workbench-umbau` | `_c_` | `closed (coherent)` | yes |
| `260717-1638-marker-format-ohne-glob-metazeichen` | `_c_` | `closed (coherent)` | yes |
| `260718-1924-v5x-overhaul` | `_c_` | `active` | **no** |
| `260719-1536-brest-unite-co-creator-conversion` | `_c_` | `closed` | yes |
| `260719-1536-plane-mirror-integration` | `_c_` | `closed` | yes |
| `260801-1244-curator` | `_a_` | `anticipated` | yes |
| `260801-1244-guard-bash-inspection` | `_c_` | `closed` | yes |
| `260801-1244-guard-rules-write` | `_a_` | `anticipated` | yes |
| `260801-1244-rule-provenance-header` | `_t_` | `anticipated` | **no** |

Two of nine disagree.

**This corrects the issue's own scope paragraph.** The issue reasons that the gap "plausibly exists at every transition" because no consuming prompt is known to update the field. The data says something more specific and more useful: the field *is* updated at some transitions, just not reliably. Five of the six closed Circles say `closed`, so the closure transition usually does update it. And `260718-1924-v5x-overhaul` reads `active` at a `_c_` marker, meaning its field was updated when it was activated and then missed when it closed — the exact inverse of the failure this issue was filed against.

So the defect is not "the transition points never update the field". It is that no prompt or skill step *requires* the update, so it happens whenever a writer happens to notice and is skipped whenever nobody does. That is a stronger case for option 2 (drop the field, let the marker be the only source) than the issue makes for itself: a field maintained by attention rather than by procedure will keep producing a mixture like this one, and a reader has no way to tell which of the two surfaces is the stale one on any given record.

**The reconciler did not paper over the live instance.** The field on the active Circle was left reading `anticipated` deliberately, so the defect survives to be fixed at its source rather than being hand-corrected out of the one record that demonstrates it. Option 2 is a decision rather than a defect fix, so it wants a decision record if taken.
