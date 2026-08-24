# ontocoder: repair seven dangling citations and close row 102

**Date:** 2026-08-24 20:19
**Circle:** 260824-1853-close-every-open-defect
**Source:** plan 260824-1905 step 2 (follow-up to `260824-2016-ontocoder-close-moot-unfixable-and-fixed-records.md`)
**Status:** Complete

## What changed

Seven citations in six files spelled the `_o_` marker of four records the previous run renamed to `_c_`. Each was rewritten to the `_*_` wildcard form (`rules/fusion-workbench-conventions.md` `## Filename Patterns`), one token per line, nothing else touched:

- `circles/260801-1244-curator/issues/260814-1850_o_the-new-dispatch-contract-is-reachable-from-no-flow-step-and-no-surface-offers-the-choice-it-waits-for.md:48`
- `circles/260801-1244-guard-rules-write/_c_circle.md:131` (terminal Circle record; citation repair authorised by the orchestrator)
- `circles/260815-0007-remove-eight-mechanisms-and-cap-growth/issues/260815-1913_o_closing-the-plan-dangles-thirty-four-workbench-citations-that-spell-its-open-marker.md:8`
- `circles/260820-2051-style-rules-arrive-and-get-measured/planning/260820-2249_o_spec-style-rules-arrive-and-get-measured.md:505`
- `shared/issues/260816-0725_o_the-citation-gates-new-exact-count-pin-is-coupled-to-workbench-contents-so-the-archive-step-can-turn-it-red.md:73`
- `shared/issues/260816-1330_o_the-override-record-names-the-shipped-chat-profiles-cap-and-the-copy-every-agent-loads-says-otherwise.md:6,15`

The lint run before editing named exactly these seven and nothing outside the task's list.

Closed as fixed, with a `Resolved:` line appended and the marker moved `_o_` -> `_c_`:
`shared/issues/260822-0900_*_the-config-templates-own-worked-example-of-its-only-setting-is-not-valid-json.md`

## Verification

`cd hooks && npx vitest run lib/__tests__/workbench-citation-lint.test.ts` — exit 0 (10 passed) after the edits; exit 1 with the seven findings before.

Not committed; no whole-tree git command was run.
