# Coder — the stale `/fusion:next` symptom and the curate description's missing selector

**Status:** Complete
**Agent:** coder
**Date:** 2026-08-16

## Task

Two text fixes, dispatched together:

1. `CLAUDE.md:129` quoted `/fusion:next` as printing the German literal *"Noch keine Circles
   vorhanden"*. That literal was replaced earlier in the session — `skills/next/SKILL.md`
   now specifies its prompts in English and renders them in the project's chat language —
   so the row quoted a string the code cannot produce and was unmatchable by the reader it
   is written for. Fix one had no record of its own: it was reported as a residual by the
   executor that caused it.
2. `skills/curate/SKILL.md:2` lacked the "(reachable alone as ...)" clause both its sibling
   pipeline-step bodies carry. Source record:
   `circles/260815-0007-remove-eight-mechanisms-and-cap-growth/issues/260815-1633_o_the-claude-md-steps-only-selector-is-claude-md-and-the-documents-that-say-reachable-alone-never-spell-it.md`.

## What I did

**Fix one — `CLAUDE.md:129`.** Read `skills/next/SKILL.md` as it now stands. The
short-circuit is Step 1's tail: the `SCAN_CIRCLES` emptiness check at :67-69, the
print-one-line-and-exit instruction at :71, the specimen line at :73, and the
otherwise-proceed at :75. The specimen is English by the same convention `## Tone` states
for the whole file — the body ships to projects of every language and its rendered lines
take the project's chat language — so there is no fixed literal to quote at all. Rewrote
the symptom to describe the observable behaviour and to say explicitly that the line is not
a fixed string to grep for, which is the property that made the old row fail its reader.
Corrected the citation `skills/next/SKILL.md:64-76` → `:65-75`; the skill's line numbers
moved this session. The explanation half of the row is untouched — it is still correct and
it is the part that earns the row.

**Fix two — `skills/curate/SKILL.md:2`.** Confirmed the accepted selector vocabulary at
`skills/cleanup/SKILL.md` `## Arguments` before writing: the table carries `claude-md` for
Step 5, and the body states that a name the table does not carry is an error. So the
body's own name, `curate`, would have shipped a command the selector rejects. Added
`(reachable alone as `/fusion:cleanup --only claude-md`)`, wording matched to
`skills/archive/SKILL.md:2` and `skills/log-activity/SKILL.md:2`. +54 bytes on the
`skills` surface, inside the expected budget.

## What I deliberately did not touch

- **The issue record stays `_o_`.** The dispatch named two files I may touch and said
  "nothing else". The record's remaining half is now discharged, so it is ready to close —
  the close is the orchestrator's to make, not mine under that constraint.
- **`CLAUDE.md:21` still contains the token `--only curate`.** It is there as a negative:
  "the `CLAUDE.md` step's selector is `claude-md`, and `--only curate` is rejected by the
  selector's error path." That sentence is the other half of the same issue's discharge and
  is the warning a reader needs; deleting the token would delete the warning. Reported to
  the orchestrator rather than removed silently.
- **The golden was not regenerated.** `hooks/lib/__tests__/fixtures/surface-growth.golden`
  is stale on the `agents` surface (`orchestrator.md` 139967 → 140511), which is a
  concurrent task's edit, not mine. The dispatch named this failure as expected.

## Files changed

- `/Users/k1/Projects/productive/fusion/CLAUDE.md`
- `/Users/k1/Projects/productive/fusion/skills/curate/SKILL.md`

## Verification

`cd hooks && npm test` — exit 1. 750 of 751 tests pass; the single failure is
`surface-growth-bound.test.ts > matches the checked-in golden, surface by surface`, and its
whole diff is `agents/orchestrator.md`. The growth-bound headroom assertions all passed.
