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

---

**Reconciliation 260803-1516 (reconciler, domain `code`) — stays `_o_`. The survey table above has drifted by one row, in the predicted direction.**

`circles/260801-1244-guard-rules-write/_t_circle.md:5` now reads `**Status:** anticipated` at a `_t_` marker. In the 260802-1413 table that Circle was the last row that agreed (`_a_` / `anticipated`); it was activated afterwards, the record was renamed, and the field was not touched. Three of nine disagree now.

This is the third distinct Circle to acquire the contradiction, and it arrived exactly the way the annotation above predicted: not through a transition that never updates the field, but through one where nobody happened to notice. Left uncorrected on purpose, same reasoning as before — hand-fixing the record removes the evidence and leaves the source untouched.

---

**Reconciliation 260806-1152 (reconciler, domain `code`, workbench-wide pass) — stays `_o_`. The defect reproduced three more times, all at closure transitions, and remains unfixed at source.**

Survey at HEAD `cde5319`, 11 Circle records, before this pass's corrections: `260718-1924-v5x-overhaul` read `active` at `_c_` (unchanged since the first survey), `260801-1244-guard-rules-write` read `active` at `_c_` (its `_t_→_c_` closure on 260805-2359 renamed the record and skipped the field), `260805-2005-textschicht-gegen-code-nachziehen` read `active` at `_c_` (the reconciler had corrected the field to `active` while `_t_` on 260806-1057; the closure at 260806-1105 renamed the record and skipped the field again — the defect out-raced its own correction inside eight minutes). Four of eleven disagreed, three in the closure direction the 260802-1413 annotation predicted.

Two changes by this pass: the three closed records above were corrected to `closed (coherent)` as part of closure-record reconciliation (they are terminal; no transition remains to preserve evidence for), and `circles/260801-1244-rule-provenance-header/_c_circle.md` keeps its deliberately preserved `anticipated`/`(none yet)` fields as the sole specimen, per its own closure note. The source is still unfixed: `skills/next/SKILL.md` Step 6 renames the record and writes the pointer without touching `**Status:**`, and the orchestrator's Phase 4 closure step still renames without a field update. Candidate fix 2 (drop the field, marker is the only source) has gained further evidence: every activation-ownership surface was consolidated by D2 `circles/260805-2005-textschicht-gegen-code-nachziehen/decisions/260806-0015_i_wem-gehoert-die-circle-aktivierung.md` (commit `81d4154`) and the field-update obligation still landed nowhere, because no decision assigned it.

---
Resolved: Fixed in 282ef42: skills/next/SKILL.md Step 6.2 sets Status: active in the same call as the rename, and agents/orchestrator.md gained a "Circle head fields" owner section covering closure too.

Closed as part of the Turn-1 housekeeping batch of session 260815-2147, after a re-verification pass against HEAD confirmed the condition no longer holds.

The open question this record carried is **not** closed with it. Candidate fix 2 — drop the field
and let the filename marker be the only source — was always a decision rather than a defect fix,
as this record says of itself, and it is now filed as
`shared/decisions/260815-2312_o_should-the-circle-records-status-field-exist-at-all-now-that-both-transitions-maintain-it.md`
carrying the three candidate fixes and the four reconciliation surveys above as evidence.

`agents/orchestrator.md:293` still cites *this* record as the tracker for that question and should
be repointed at the decision. That repoint is queued as its own task rather than done here, because
an agent prompt is a coder's file and not the orchestrator's.
