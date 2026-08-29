# T3 — realise decision 260817-1613 (`## Where this Circle stops`)

**Date:** 2026-08-18
**Agent:** coder
**Status:** Complete
**Source:** `260817-1613_*_does-a-plan-stated-precondition-get-any-mechanism-or-is-it-read-by-a-human-or-not-at-all.md` (option 2, with option 1's honesty applied); realisation fork answered as "add the section to the plan output format", which closes `260818-2343_*_the-answered-precondition-decision-names-a-planner-section-that-agents-planner-md-does-not-have.md`.

## What changed

`agents/planner.md`
- Added `## Where this Circle stops` to the plan output format, inside the fenced template between `## Implementation Steps` and `## Data Structures` — the position the one plan that invented the section used (`260816-1915_*_the-compliance-guard-becomes-observation-only.md:346`). The placeholder asks for the conditions under which the Circle is finished plus any precondition a later act must satisfy, one clause per condition, each answerable yes or no.
- Added a parenthetical paragraph after the template, beside the existing `**Decidability:**` paragraph, stating that nothing reads the section mechanically: no gate, lint, helper or agent step parses it, and the whole of its enforcement is a human answering the orchestrator's Phase-4 question. It names the measured failure in one clause (a plan made the review pass a precondition of the tag; v10.0.0 was tagged and pushed without the pass; a post-release reconciliation was what noticed).

`agents/orchestrator.md`
- Added step **2b** to `### Phase 4 — Portfolio sync`, between "Determine new marker" and the `_t_`→`_c_`/`_b_` rename. It resolves the plan in scope (the Circle record's `**Active spec/plan:**` field, else the plan the session ran on), and where there is none or it carries no such section, does nothing and moves on with no question put to the user. It reads the clauses aloud and asks whether each holds; it does not parse or judge them. Any clause the user says does not hold is carried into the `## Closure note` at step 3.
- Numbered **2b** rather than renumbering: two live citations name Portfolio-sync steps by number (`Phase 4 step 3` in `## Scope`, `Phase 4 step 5` in the agents table), and the file already uses letter-suffixed steps (`3c-bis`, `0b.1`).
- **No new event type.** The step emits the existing `gate_hit` / `gate_response` pair, so the event-type table in Observability is unchanged. A dedicated type would have been a second row for a human gate the table already covers.
- Added one row to the Human Gate Rules table, since the step is a gate and that table enumerates them.

## What it does not cover, recorded rather than left to be found

A release tagged mid-Circle — the measured case — has already gone out by the time step 2b runs. The step records the gap; it cannot prevent it. This is stated in the step itself, not only here.

## Verification

`cd hooks && npx vitest run` — exit 1, at 2 failed files / 2 failed cases, both outside this task's surface:

- `rules-emission-golden` — `rules/fusion-workbench-conventions.md` shrank 58 104 → 54 688 bytes in the working tree. That file is another task's, and this task edited no file under `rules/` and no line of `bin/fusion-rules`.
- `reference-resolution-lint` — the pinned counts moved `paths` 1142 → 1152 and `records` 97 → 101. Measured A/B: with `agents/planner.md` and `agents/orchestrator.md` restored to HEAD and everything else left as it stands, the gate reports the same 1152 / 101, so none of the drift is this task's.

Green after this task's own fixes: `path-literal-lint` and `surface-growth-bound`, both of which this task turned red first.

- **`path-literal-lint`** went red on the first run: both new paragraphs cited the decision as `shared/decisions/<full-name>.md`, and a type-folder literal in an agent prompt is what that gate exists to stop. Rewritten as `` `260817-1613` under `$SCAN_DECISIONS` ``, which is the file's own citation convention and shorter.
- **`surface-growth-bound`** — the `agents` head-room assertion passed throughout; only the golden fixture needed the deliberate regeneration its header prescribes (`UPDATE_SURFACE_GOLDEN=1`, which rewrites and then fails on purpose, then a clean re-run).

## Byte cost

`agents/` 411 203 → 413 774 bytes, **+2 571**, against 6 640 of head-room at HEAD `52b1d95`. The bound is not approached.

## One entanglement the next reader needs

`hooks/lib/__tests__/fixtures/surface-growth.golden` is a **single fixture covering four surfaces**. At the moment it was regenerated, another task had `skills/archive/SKILL.md` open and 134 bytes larger than HEAD, so that line of the fixture carries their in-flight size, not this task's work. The fixture must be regenerated once more after every concurrent surface edit has landed, or it will read stale.
