# Planning: cut fusion to a working minimum

**Date:** 2026-09-09
**Agent:** planner
**Status:** Complete
**Filed by:** planner, Kai Stalmann <kai@qantr.com>

## What was done

Wrote the implementation plan for the Circle's spec, `260909-1615_*_spec-cut-fusion-to-a-working-minimum.md`,
covering C1 to C9 in 21 steps across four sessions.

Read first: the spec in full, its three ancestors (the analysis, the verification that governs over
it, the adversarial review that governs over both), the Circle record, and the three decision records
in this Circle's store.

## What the plan decides that the spec left open

Two choices the spec delegated, each filed as its own answered decision record rather than held
inside the plan:

- `260909-1843_*_which-sentinel-replaces-the-state-files-existence-as-the-gate-on-machine-written-rows.md`
  — the session identifier carried on every hook payload, not the session marker. The marker is
  model-created and would carry the measured defect of `260909-1454_*_a-dispatch-outside-a-recorded-session-writes-no-event-row-and-nothing-reports-it.md`
  into the design. Cost stated: the event log becomes project-scoped.
- `260909-1843_*_what-are-the-conditional-rule-emissions-keyed-on-once-they-are-not-keyed-on-the-agent-name.md`
  — an optional `--audience=user` argument to `bin/fusion-rules`, sourced from a dispatch parameter,
  scoped to `user-facing-output.md` alone because that is the file the measurement names.

## The coverage inventory the review left to the plan

SF-19 was derived against the tree rather than hand-written: one `grep -rln` per removed surface
over `bin/ hooks/ agents/ skills/ rules/`, and one over `hooks/lib/__tests__/`. Thirty-two test
files reference at least one removed surface; the plan splits them into three classes by who fixes
them and when. Current byte figures were re-measured at `a1ecf86e` and reproduce the spec's C8
baseline table exactly, so that table is still the arming reference.

## Defect filed

`260909-1852_*_the-order-decisions-answered-line-cites-a-stamp-no-record-carries-and-the-citation-gate-is-red.md`
— the blocking citation gate is red on the order decision's own annotation line. Filed rather than
fixed: in-place correction of an existing record is not the planner's surface.

## Verification performed

`npx vitest run workbench-citation-lint marker-format-lint plan-stopping-section-lint provenance-header-lint`
after each file was written. The plan, both decision records and the issue resolve clean; one
store-prefixed citation in the plan and two address-form tokens in the issue were found by the gate
and corrected. The two failures that remain are pre-existing and both are now filed.
