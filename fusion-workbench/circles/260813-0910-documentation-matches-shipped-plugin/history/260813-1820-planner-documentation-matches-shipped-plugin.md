# Planner session — implementation plan for the documentation Circle

**Date:** 2026-08-13 18:20
**Agent:** planner (domain: code, dispatched by the orchestrator)
**Status:** Complete
**Circle:** `circles/260813-0910-documentation-matches-shipped-plugin/`

## What was produced

- `circles/260813-0910-documentation-matches-shipped-plugin/planning/260813-1820_o_documentation-matches-shipped-plugin.md` — ten implementation steps across five Turns, every step routed to `coder`.
- `circles/260813-0910-documentation-matches-shipped-plugin/decisions/260813-1820_o_should-the-planner-accept-a-domain-parameter-that-three-documented-surfaces-already-promise.md`
- `circles/260813-0910-documentation-matches-shipped-plugin/decisions/260813-1820_o_how-fusion-s-own-documentation-treats-a-hand-measured-number-that-decays.md`

No issue was filed. Both defects found while planning are documentation defects inside this Circle's remit and are carried as plan steps; the one design question each of them raises went to a decision record.

## Inputs read

The Circle record, the staleness survey, and the defect record with its withdrawn claim and its two later updates. Then, for sizing and for the reality side of each finding: `README-agents.md`, `CLAUDE.md`, `README.md` `## Configuration`, `docs/working-model.md`, `docs/philosophy.md`, `skills/help/SKILL.md`, `hooks/lib/__tests__/derivable-enumerations-lint.test.ts`, `bin/fusion-plane` (header and dispatch), `templates/plane.config.yaml`, and the parameter-declaring sections of the agent prompts.

## Measured while planning

Four values, each read rather than counted:

- The always-on rule budget at `CLAUDE.md:64` claims 88 023 bytes per dispatch, 80 670 of shipped rule text. `wc -c` over the five files `bin/fusion-rules` emits unindented plus this project's chat profile gives **93 819 total, 86 466 shipped**. This confirms the figure the playmaker's activation proposal carried.
- `agents/planner.md` contains **zero** occurrences of "Domain", in the work tree and in the installed copy, which are byte-identical for that file. Three shipped surfaces and the manifest description state that the planner is domain-parameterised.
- `agents/playmaker.md:36-38` carries a full `Parameter parsing` section for `**Domain:**`, and `agents/orchestrator.md:850` passes it. No documented roster counts the playmaker.
- `CLAUDE.md`'s Layout table carries ten `` `bin/<name>` `` rows against fifteen files under `bin/`, in a shape regular enough for a lint parser. This is what makes the gate extension small.

The first three were not on the survey's list of fifteen findings and are folded into steps 2 and 6 rather than filed separately.

## Decisions taken inside the plan

- **All ten steps route to `coder`.** The scope is markdown documentation of code and agent behaviour, one TypeScript test, and one manifest description. Nothing carries ontology, manifest, schema or fixture data, so no step routes to `ontocoder`.
- **The gate lands in step 3, immediately after the table it parses**, rather than at the end. Every later edit to `README-agents.md` and `CLAUDE.md` then runs against an existing check.
- **The sixteen-row verification and the parameter roster are one step**, not two. Both require opening all sixteen prompts, and splitting them would mean either reading twice or carrying an unverified roster between steps.
- **No workbench file-count check is added to the enumeration lint.** The Directive deletes the claim, so there is nothing to diff against. The plan says so in step 3 because the survey proposed such a check and a later reader would otherwise add it.
- **The user's sequencing was kept.** Reading the material confirmed it: groups A and B fit one Turn with a green first gate run, the reference corrections want a reader, and the sixteen-prompt pass plus the prose rewrites are where the time goes.

## Stated plainly in the plan

Two honest limits, both in the plan's own text rather than only here. The five-Turn budget is completable **only if step 6 fits one Turn**; if it does not, step 10 is the deferral candidate because nothing depends on it, or the budget goes to six through the knob step 5 documents. And step 10 verifies command forms and configuration fields only: the troubleshooting and rationale prose in `docs/plane-setup.md` stays unverified, and the step's completion note must say so rather than let silence read as coverage.

## Diagrams

Two Mermaid diagrams: the step dependency DAG with Turn subgraphs, and the per-claim verification procedure that carries the method constraint. Both were checked by reading; `mmdc` is not installed on this machine, so no by-tool validation was performed. The independent `conceptrev` pass at the plan gate is the real evaluation.

## Not done, and left to the orchestrator

The Circle record's `**Active spec/plan:**` field still reads `(none yet)`. Only the agents that transition a Circle write that record, so the field is the orchestrator's to set to this plan's path.
