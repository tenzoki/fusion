# Regenerate the rules-emission golden after the curator's one-byte citation fix

**Status:** Complete
**Agent:** coder
**Date:** 2026-08-18
**Store:** shared (no active Circle)

---

## Task

`/fusion:cleanup --only claude-md` applied one approved ledger entry: in
`rules/fusion-workbench-conventions.md` line 214, the citation of the shaper's
backlog-promotion rename moved from `agents/shaper.md:89` to `:100`, the line having been
displaced eleven lines by `95bebe1`. That file is always-on, so its byte count is pinned in
`hooks/lib/__tests__/fixtures/rules-emission.golden` and the suite went red on one byte.

## What was done

Regenerated the fixture by the command documented in the header of
`hooks/lib/__tests__/rules-emission-golden.test.ts` `## Updating the golden`:

    cd hooks && UPDATE_RULES_GOLDEN=1 npx vitest run lib/__tests__/rules-emission-golden.test.ts

That run rewrites the fixture and then fails on purpose, which is the design — it forces the
second, flagless run. Nothing else was touched.

## The diff, which is the check rather than a formality

30 insertions, 30 deletions — two lines per agent, fifteen agents. Every one of them is
`fusion-workbench-conventions.md 58103 -> 58104` and that agent's `total` up by the same one.

- No path entered or left any agent's set.
- No emission order changed.
- The fixture header above line 15 is untouched.

Which is exactly what a one-byte edit to one always-on file should produce, and it corroborates
the apply pass's claim rather than merely trusting it.

## Growth bound

Green, and not by having been moved. `RULE_BASELINE` and `GROWTH_BUDGET` were not edited;
`git diff` over the test file and `helpers/growth-bound.ts` is empty. Regenerating a
measurement fixture records what the files weigh and never moves what they are allowed to
weigh from.

Always-on core, measured at HEAD:

| | bytes |
|---|---|
| floor (`RULE_BASELINE` summed over the five core files, 2026-08-14 arming) | 86 573 |
| head-room (`GROWTH_BUDGET`) | 12 000 |
| budget | 98 573 |
| emitted today | 94 040 |
| spent | 7 467 |
| **head-room left** | **4 533** |

## Verification

`npm test` in `hooks/` — exit 0. 36 files, 672 tests, all passing.

## Not done, deliberately

- **No commit.** The cleanup run selected only the `CLAUDE.md` step, so the housekeeping-commit
  step never ran and the user has not been asked. The golden, the curator's rule edit and the
  curator's own history file are all left in the working tree.
- **No other citation in `rules/fusion-workbench-conventions.md` was corrected.** Five further
  candidates were held back at the gate; acting on one here would take a decision the user was
  never asked.

## Files changed

- `/Users/k1/Projects/productive/fusion/hooks/lib/__tests__/fixtures/rules-emission.golden`

## Noticed, not mine

`fusion-workbench/shared/issues/260818-2104_o_the-cleanup-skills-consolidation-measurement-carries-a-flag-name-where-a-shell-variable-belongs.md`
appeared in the working tree during this run, filed by the orchestrator against
`skills/cleanup/SKILL.md`. Untouched here; recorded so the extra untracked file in the next
`git status` is not mistaken for a stray write of this task.
