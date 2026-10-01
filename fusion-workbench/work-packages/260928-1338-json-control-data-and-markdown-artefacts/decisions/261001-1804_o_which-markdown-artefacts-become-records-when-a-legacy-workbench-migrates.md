# Which Markdown artefacts become records when a legacy workbench migrates?

---
**Domain:** code
**Filed by:** implementation-planner, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260928-1338-json-control-data-and-markdown-artefacts.md, 261001-1804_*_plan-fj04-the-migration-of-a-legacy-workbench-proven-on-copies.md, 260929-1810_*_in-which-order-do-the-parts-of-fj03-and-fj04-land-while-fusions-own-workbench-is-still-in-the-v12-form.md

---

## Question

Section 2.1 of the specification (Prior `590465d`) converts every work package in `work-packages/`, terminal ones included, and the issues, plans, discussions and decisions "soweit deren Status, Fortschritt oder Annahme heute Maschinen oder Workflows steuert". It adds: "Ein terminaler Record außerhalb des Archivs erhält höchstens extrahierte Metadaten; sein historischer Text bleibt unverändert." "Höchstens" permits both a control file with `provenance.source: legacy-terminal` and no control file at all. The texts do not choose, and the choice sets the size of every migration and of every later `list` and `reconcile`. FJ04's frozen plan needs the rule before its mapping can be written.

Measured on 2026-10-01 (records with a marker in `issues/`, `plans/` or `planning/`, `decisions/`, `discussions/` outside `archive/` and `history/`; live = `_o_`/`_p_`, and `_a_` on decisions):

| Workbench | Records | Live | Packages |
|---|---|---|---|
| fusion, `15e4d52e` | 1 219 | 104 | 46 containers: 18 item records (4 live), 24 Circle-era `circle.md`, 4 empty trees |
| axibra-1, `e6678b530` | 1 570 | 638 | 110 under `work-packages/`, 2 still under `circles/` |
| krk, `f87d8c6` | 1 153 | 148 | 27 under `circles/` (v11 names) |

Terminal records carry values with no v1 state: 5 plans `_s_` in axibra-1 (no `superseded` exists for plans), and decisions `_d_` (21 here) whose target and ruler §4.3 makes a migration finding when absent.

## Options

1. **Every marked record becomes a pair.** Live records `imported`, terminal ones `legacy-terminal` with byte-identical Markdown.
   - Pros: one lookup path for every record; the monitor and `list` show history.
   - Cons: about 12 times the live count here; every terminal value without a v1 state (plan `_s_`, `_d_` without target or ruler) becomes a finding that blocks activation (§8.2) although nothing reads its state; `reconcile` and `list` grow with history for good.
2. **Live records and every package become records; a terminal record becomes one only when a structural field of a record names it.** Structural means a `record_ref`-only position: `depends_on.target`, `active_documents.ref`, `superseded_by`, a plan's `acceptance.ref`. Every other terminal record stays plain Markdown, citable as a legacy citation, as section 3 keeps "historische, alleinstehende Markdown-Dateien". A terminal package's own document bindings stay verbatim in `provenance.legacy_fields`, so it pulls nothing in.
   - Pros: the set is decided from files alone (marker, store, head fields), as a closure the codec's `plan` phase checks; no terminal value is reinterpreted; matches §2.1's own criterion and the convention that a terminal record is never reconciled in place.
   - Cons: a terminal record has no JSON id, so a later structural reference to it needs it imported first.
3. **Live records only, and live packages only.** Terminal packages stay Markdown.
   - Pros: smallest.
   - Cons: contradicts §2.1's explicit "auch dort liegende abgeschlossene Pakete", and `depends_on` with `condition: terminal` needs the target package as a record.

## Constraints

- §2.1 converts every package; §8.2 lets no unknown state be guessed; §4.3 keeps terminal text byte-identical.
- The rule must be decidable from the files, so that survey, plan and a second run agree.

## Recommendation

Option 2. It is §2.1's criterion made executable: state that steers a workflow today is live state, or state a live structure binds. Under it fusion's workbench migrates 104 records, 42 package heads and the closure (0 at `15e4d52e`: the four live packages bind four live documents), and none of the terminal values without a v1 state is touched. Put to Prior as request 46 of the FJ04 plan.
