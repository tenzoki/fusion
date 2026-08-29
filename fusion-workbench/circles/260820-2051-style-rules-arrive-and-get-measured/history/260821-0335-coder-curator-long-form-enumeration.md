# Coder — the curator prompt enumerates its long-form outputs

**Status:** Complete
**Agent:** coder
**Circle:** `260820-2051-style-rules-arrive-and-get-measured`
**Task:** plan step 17 of `260820-2324_*_plan-style-rules-arrive-and-get-measured.md`
**Working tree at HEAD:** `abdf1ad` (the orchestrator commits)

## What the gap was

`rules/user-facing-output.md` states that each long-form-prose agent's prompt enumerates which of its outputs the writing profile governs. The prose set is the `IS_PROSE_AGENT=1` case at `bin/fusion-rules:194`: `orchestrator consultant shaper planner analyst playmaker editor curator`. Measured before the edit, `grep -c 'Long-form prose vs short-form' agents/<each>.md` returned 1 for the first seven and 0 for `curator`. Seven of eight, which is the premise the plan carries after its own correction from an earlier "eight of nine".

## What was changed

`agents/curator.md` `## Output Style` now opens with a `Long-form prose vs short-form` block, inserted ahead of the existing `Follow rules/user-facing-output.md` paragraph, which is where the seven siblings place theirs.

Long-form, subject to the writing profile: the run file's prose sections and the decision records the curator files. Short-form, subject to the chat profile: the gate prompt, the survey report, the chat summary.

The shape copied is `agents/playmaker.md`'s, the shortest of the seven at 644 bytes. Two departures from a verbatim copy, both narrowing rather than adding. The em-dash the sibling uses to introduce its long-form list is replaced by plain conjunction, because acceptance criterion 3 forbids a prose em-dash in the block. The parenthetical's structured-artifact examples, which read "tables, dashboard lines, commit messages, and monitor strings" in the siblings, are narrowed to "the ledger entries and commit messages", which are the structured artifacts this agent actually writes: it produces no dashboard line and no monitor string, and its ledger is a per-entry field list rather than a table.

`rules/user-facing-output.md` was not touched. Weakening it to say "most" prose agents is the move both the issue and the plan step forbid.

## Measurements

- **Byte cost:** 621 bytes on `agents/`, against 2 259 of head-room. 1 638 remain. The figure is the file delta, not an estimate: `agents/curator.md` went 33 621 to 34 242 and the `agents/` total 415 584 to 416 205, which is what the golden diff shows.
- **Growth bound:** `cd hooks && npx vitest run lib/__tests__/surface-growth-bound.test.ts` green. It failed twice on the checked-in golden and on nothing else, once per bounded surface this task touched, so `hooks/lib/__tests__/fixtures/surface-growth.golden` was regenerated with `UPDATE_SURFACE_GOLDEN=1`, its diff read, and the test re-run without the flag. The final diff carries exactly two changes: `agents/` at `curator.md` 33 621 to 34 242 and its total 415 584 to 416 205, and `hook-tests` at `reference-resolution-lint.test.ts` 1 404 to 1 411 lines and its total 20 336 to 20 343. Regenerating the golden records growth and moves no baseline, so both bounds still apply at their armed numbers.
- **Em-dashes:** `bin/fusion-prose-metric` over the block alone reports 0 em-dashes across 72 prose words, verdict `ok`.
- **The enumeration, after the edit:** 1 for every one of the eight prose agents.

## The marker move, and who cited it

The defect record closed by this step moved `_o_` to `_c_`, so four literal citations of its old name went stale. Two of them sit inside the citation gate's corpus and were rewritten to the `_*_` wildcard form: the Circle's own spec at `260820-2249_*_spec-style-rules-arrive-and-get-measured.md`, and the open issue `260816-1330_*_the-foreclosure-clause-does-not-say-whether-it-costs-a-line-per-option-and-the-cap-two-sections-below-forbids-relaxing.md`, which cites the record as the precedent for declining to weaken a rule.

The other two sit in `260814-1332-curator-run.md` and were left alone. A history file is a record of what was true when it was written, it is outside the gate's corpus, and repairing it would rewrite it. `260820-2324_*_plan-style-rules-arrive-and-get-measured.md` already used the wildcard form and needed nothing.

`cd hooks && npx vitest run lib/__tests__/workbench-citation-lint.test.ts` was run before the rename (green), and again after the rename and the two repairs (green).

## Files changed

- `agents/curator.md`
- `hooks/lib/__tests__/reference-resolution-lint.test.ts` (baseline re-approval plus its note)
- `hooks/lib/__tests__/fixtures/surface-growth.golden`
- `260814-1332_*_the-curator-prompt-is-the-one-prose-agent-that-does-not-enumerate-its-long-form-outputs.md` (resolved note appended, renamed from `_o_`)
- `260820-2324_*_plan-style-rules-arrive-and-get-measured.md` (step 17 marked `[DONE]`)
- `260820-2249_*_spec-style-rules-arrive-and-get-measured.md` (citation repair)
- `260816-1330_*_the-foreclosure-clause-does-not-say-whether-it-costs-a-line-per-option-and-the-cap-two-sections-below-forbids-relaxing.md` (citation repair)

## The reference-resolution pin, re-approved

The first full-suite run went red on `hooks/lib/__tests__/reference-resolution-lint.test.ts` alone, at `paths` 1 254 against a received 1 255. Re-approving that pin is the response the gate's own message names, and the note recording it was added above `BASELINE` in the shape the file's earlier notes carry.

The movement was attributed before it was approved rather than after: the new block was deleted from `agents/curator.md`, the gate re-run and found green at 1 254, and the block restored byte-for-byte from a copy. The one token is `rules/user-facing-output.md`. It is the block's only plugin-tree-shaped candidate, because the second mention of that file spells it bare as `user-facing-output.md` with no directory, and `./fusion-workbench/stilwerk/chat-voice-<lang>.yaml` is skipped as a placeholder on `<lang>` and is not a plugin-tree spelling in any case. `anchors` and `records` did not move. No scanner, exemption or class changed.

That note is seven lines, which is why the hook-tests surface moved and the golden needed a second regeneration.

## Verification

`cd hooks && npm test` exits 0. 40 test files, 718 tests, all passing.
