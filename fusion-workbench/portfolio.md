# Portfolio

**Generated:** 260805-2342 (by playmaker session 260805-2342-playmaker-orchestrator-phase4)
**Domain bias:** code

## Active (_t_)

- **260805-2005-textschicht-gegen-code-nachziehen** — "Die Textschicht des Plugins sagt wieder, was der Code tut, und zwei Lints halten sie dort". Activated 260805 after user confirmation at the closure gate; `.active-circle` points at it. No session history yet (first Turn has not run). The work: fix the four code defects and the documentation drift recorded in the 66 findings filed under `circles/260801-1244-guard-rules-write/issues/`, decide the citation form for workbench records, then add the two lint tests that keep the text layer aligned with the code. Note: the record's body status field still reads "anticipated"; see Warnings.

## Anticipated (_a_) — ranked

Recommended next: 260804-1205-shell-reachability-model — its one hard dependency closed today and shipped, so the over-deny it exists to close is now live in consuming projects.

1. **260804-1205-shell-reachability-model** — "The mutation classifier asks whether the shell guarantees a segment, not what one adjacent operator says".

   Both anticipated Circles now pass the dependencies-closed check (every dependency edge points at a closed Circle) and both cite zero open decision records, because the workbench holds none anywhere. The tie breaks in this Circle's favour on three grounds. First, its urgency rose today: the parent Circle `260801-1244-guard-rules-write` closed coherent and its closure note confirms the ship step ran (v5.9.0–v5.9.2, tags pushed), so the flat-joiner over-deny this Circle closes (`circles/260801-1244-guard-rules-write/issues/260804-0839_o_the-flat-joiner-model-ignores-shell-precedence-so-a-pipeline-and-an-if-body-degrade-a-cd-the-shell-guarantees.md`) is now live for consuming projects, where the same class already produced 17 fail-closed false alarms against zero real hits in four days of observed use. Second, it is activation-ready as written: its Grounding is complete, and the sequencing question its record left open (ship before or after this Circle) is answered by the parent's closure. Third, the rival Circle is not activatable without prior re-shaping (next entry). At activation, the shaper should absorb the 17-false-alarm balance from `circles/260801-1244-guard-rules-write/analyses/260805-1830-zweck-nutzung-und-stand-des-plugins.md` §3 into this Circle's Grounding, as its own record already requests. Dependencies: `260801-1244-guard-rules-write` (closed) — clean.

2. **260801-1244-curator** — "The curator reconciles the three normative surfaces, and proves it on fusion's own conventions file". All dependencies closed (`260801-1244-rule-provenance-header` hard, `260801-1244-guard-rules-write` soft), but the Circle needs a shaper re-shape before activation: its closing work C9 was partly done by hand, voiding spec decision D-g and its designated validation case. It also benefits from the active text-layer Circle running first, since those corrections touch files the curator would use as example material.

## Recently closed (_c_ / _b_)

- **260801-1244-guard-rules-write** — closed coherent (`_c_`) 260805: deliberate per-session rule-file writes, all twelve acceptance criteria verified, 1551 tests green, shipped as v5.9.0–v5.9.2 with tags pushed.
- **260801-1244-rule-provenance-header** — closed coherent (`_c_`) 260802: provenance headers plus lint gate, eight commits, all eight acceptance criteria verified against the tree.
- **260801-1244-guard-bash-inspection** — closed coherent (`_c_`) 260801: the protected-path list now binds file-mutating Bash commands, not only the four write tools.
- **260719-1536-plane-mirror-integration** — closed coherent (`_c_`) 260720: `bin/fusion-plane` push-only mirror plus `/fusion:seed-from-plane`, offline-proven; two go-live follow-ups deliberately left open.
- **260719-1536-brest-unite-co-creator-conversion** — closed coherent (`_c_`) 260719: unite-co-creator context-loading conversion, 9 of 9 acceptance checks, CLAUDE.md reduced by 80 percent.

Three older closed Circles fall outside the last-5 cutoff: `260718-1924-v5x-overhaul`, `260717-1638-marker-format-ohne-glob-metazeichen`, `260716-1847-workbench-umbau`.

## Archived (_s_ / _d_)

(none)

## Warnings

- **Status-field lag on the active Circle.** `circles/260805-2005-textschicht-gegen-code-nachziehen/_t_circle.md` carries the active marker (`_t_`) but its body still reads `**Status:** anticipated`. Known defect, filed as `shared/issues/260802-0920_o_next-skill-activates-a-circle-without-updating-its-status-field.md` — the activation skill renames the record without updating the body field. Flagged only; the fix belongs to that issue, not to a portfolio run.
