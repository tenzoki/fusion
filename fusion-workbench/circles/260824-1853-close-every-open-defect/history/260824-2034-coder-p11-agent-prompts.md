# Coder session: P-11, `agents/*.md` except the orchestrator

**Date:** 2026-08-24
**Agent:** coder
**Plan:** `circles/260824-1853-close-every-open-defect/planning/260824-1905_*_plan-close-every-open-defect.md` step 11
**Status:** Complete

## What was done

Fifteen defect records closed by edits to eleven agent prompts, and the plan's step 11 marked done.

- `agents/reconciler.md`: one edit for records 70, 71 and 122. The verdict set is now four values, disjoint and complete: `coherent`, `review-needed`, `directive-partially-met` (new: Directive reachable, a clause unmet, the shortfall filed), `bounded-closure-proposed`. An edge whose input does not exist reads `not evaluable: <reason>` and the verdict is computed over the evaluable edges. The `Artifact↔Grounding` line names the vertex at fault, `(Artifact at fault)` or `(Grounding at fault)`. The recommendation set gains `state Directive` (no Directive stated) and maps: `coherent` → none; Artifact at fault → revise Artifact; Grounding at fault or `Grounding↔Directive` flagged → revise Grounding; `Artifact↔Directive` flagged → revise Directive; `directive-partially-met` or `bounded-closure-proposed` → accept Bounded Closure. The Rebalance-gate trigger sentence now reads "anything but `coherent`".
- `agents/analyst.md`: the analysis report's `## Scope` template carries HEAD, commit date, branch and tracking state per tree read (37); the top-level sentence asks in chat (90).
- `agents/bugfixer.md`, `agents/curator.md`, `agents/planner.md`, `agents/shaper.md`: the top-level sentences stop asserting `AskUserQuestion` (90); the three "interactive `AskUserQuestion` when run top-level" echoes in planner, shaper and bugfixer say "in chat".
- `agents/planner.md`: step-format clause on an occupiable endpoint (88).
- `agents/curator.md`: after-text comparison against the ledger's After block (174); guard clause cut, classification kept (178).
- `agents/playmaker.md`: history log created before the portfolio (89); `###` in the rule citation and a pointer from the activation-proposal branch (117); Dispatch-sources restatement is a pointer (147); relay paragraph says the skill reads the lines from the portfolio and the four forms are a structured artifact (148); "originates" → "files" at `:3` and `:10` (150).
- `agents/coder.md`, `agents/ontocoder.md`: the report-shape sentence names where the contract is authored and what bugfixer's Phase 6 report is (105, option 2); both plus `bugfixer`, `coderev`, `ontorev` name `$OUT_DECISION` (146), and `bin/fusion-paths` emits it for all five.
- `hooks/lib/__tests__/fixtures/surface-growth.golden` regenerated (the golden is a measurement, not a baseline; the baseline map is untouched).

## Growth bound

`agents/` head-room 10 745 bytes before (407 098 measured against 399 843 + 18 000), 7 697 after (410 146). Net +3 048.

## Verification

- `cd hooks && npx vitest run lib/__tests__/playmaker-backlog-mandate-lint.test.ts lib/__tests__/fusion-paths.test.ts lib/__tests__/surface-growth-bound.test.ts` — exit 0 (99 passed).
- `cd hooks && npm test` — exit 1: 748 passed, 1 failed. The one red is `reference-resolution-lint.test.ts`'s pinned BASELINE, `{ paths: 1318, anchors: 188 }` measured now as `{ paths: 1330, anchors: 190 }`, moved by the citations these edits added. The pin lives in `hooks/`, which this dispatch excluded; its own failure text says re-approval is the expected response. Step 12 will move it again, so one re-approval after step 12 covers both.

## Records closed (all `_o_` → `_c_`)

shared/issues: 260812-1152, 260817-1613, 260817-1836, 260819-2227, 260820-1133, 260820-1755, 260822-1226, 260822-2050, 260823-1446. Circles: 260807-0952 (guard-misst-statt-orakelt), 260813-1545 ×2 and 260813-1617 (playmaker-maintains-backlog-store), 260815-1943 (remove-eight-mechanisms), 260817-1505 (guard-becomes-observation-only).
