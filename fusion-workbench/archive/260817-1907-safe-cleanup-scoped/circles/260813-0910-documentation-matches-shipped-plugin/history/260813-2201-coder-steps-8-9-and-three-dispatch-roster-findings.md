# coder — plan steps 8 and 9, and the three Turn 3 findings against the dispatch-parameter roster

**Date:** 2026-08-13 22:01
**Status:** Complete
**Circle:** `260813-0910-documentation-matches-shipped-plugin`
**Plan:** `260813-1820_*_documentation-matches-shipped-plugin.md`, steps 8 and 9
**Issues closed:** three, all stamped `260813-2052`

## What was done

Four files edited, no prompt and no helper changed. Each correction was confirmed by reading the
documentation line and the artifact line it describes; the readings are named below rather than
summarised, because the plan's method constraint makes the reading the evidence.

### The three findings — one pass over the skill bodies

The review established that all three lie in what an agent prompt alone cannot answer, so the pass
that closes them is a read of `skills/*/SKILL.md`. All sixteen were read.

**Two rows added for the playmaker relay** (`README-agents.md` `## Dispatch parameters`).
`**Confirmed operations:**` and `**Proposal source:**` were read at `agents/playmaker.md:207`
(the prose), `:209-215` (the block form, four operation lines), `:216` (the source line) and `:219`
(the stamp comparison and the refusal). The passer is `skills/next/SKILL.md:167-176`, with the
caller-side statement of the same contract at `:179`. The section preamble gained one clause: a
value may run past its own line, ending at the next `**<Keyword>:**` line. That is what lets a
block-valued parameter sit in a table whose form definition read "one per line"; `**Draft:**`
already had the shape (`agents/shaper.md:57`). A note under the table states what the relay is and
what the stamp check refuses, so the operations with the most consequence are documented where the
rows point. The roster's agent count of six is unchanged — both lines belong to `playmaker`.

**The `Passed by` column re-read against the skills.** Four cells named fewer passers than ship.
The reconciler's `**Domain:**` gained `/fusion:cleanup` Step 3 (`skills/cleanup/SKILL.md:147`,
whose `:146` also states that the skill obtains the domain and never decides one). The shaper's
`**Mode:**`, `**Draft:**` and `**Domain:**` each gained `/fusion:seed-from-plane`
(`skills/seed-from-plane/SKILL.md:92`, `:93`, `:94`, and `:97` for how the Draft value is built).
Every remaining cell now cites the line it was read against as well: `agents/orchestrator.md:377`,
`:392`, `:438`, `:649`, `:850`, `:1397`; `skills/next/SKILL.md:103`; `skills/direct/SKILL.md:70-72`;
`agents/shaper.md:45`, `:47`. The preamble now states the column's own ground truth, so the next
pass has one instead of inheriting the agent prompts by default.

**The planner's `**Circle:**` passer corrected.** `grep -rn '\*\*Circle:\*\*' agents/*.md
skills/*/SKILL.md` returns `agents/planner.md:13`, `:53`, `:55` and, as a report field rather than
a dispatch, `skills/circle-stash/SKILL.md:170` and `:446`. `agents/orchestrator.md` does not contain
the string, and its only planner dispatch (`:377`) passes `**Executors:**` alone. The cell now reads
"the user, on a direct planner dispatch" and says so explicitly. Nothing was added to the
orchestrator prompt, per the issue's own fix direction. The row's other half was left standing after
the reading: value form, absent behaviour and the exit-1 halt are `agents/planner.md:53-55` verbatim.

**One residual, found in the same reading and not resolved.** The `shaper` / `**Parent task:**`
cell names the orchestrator, and `agents/orchestrator.md` contains no such line. It is not the same
defect as the `**Circle:**` one: the attribution has an artifact-side source, because the declaring
prompt itself (`agents/shaper.md:45`) says the orchestrator dispatches with it optionally. The cell
now cites that source and states that the orchestrator's own prompt names no such line, so a reader
can see which side the claim rests on. Whether the orchestrator should carry the line is a prompt
question and no issue was filed for it here.

### Step 8 — `docs/philosophy.md` §3

The one-sentence surface list became four sentences. `/fusion:memo` now carries all three of its
captures (`skills/memo/SKILL.md:11-13`), including an idea filed as its own new entry rather than an
append (`:37`), and the claim that it is the one surface a user files such an entry from is the last
guardrail at `:153`. `/fusion:cadence` was added with what it reads and writes: three ranked lists
(`:9-13`) over session histories, the activity log and git commits (the source legend at `:76-82`).
`/fusion:log-activity`'s clause is unchanged. §5 at `:19` belongs to step 6 and was not touched.

### Step 9 — `skills/help/SKILL.md`

Item 2's ten routes became twelve. `/fusion:direct` sits beside the shaper route it shares an agent
with, read against `skills/direct/SKILL.md:9`, `:65-72` and `:77`. `/fusion:memo` sits immediately
before the `/fusion:next` route it feeds. Item 3 gained backlog entries as a fourth artifact kind
and `portfolio.md` as the root file it is, the latter marked as not an artifact kind because the
playmaker regenerates it whole.

**The file's discipline held, and the gate is what proved it.** The first draft of item 3 named the
backlog store as a path literal; `path-literal-lint.test.ts` failed on `skills/help/SKILL.md:69`.
The sentence now says "the shared backlog store" and cites
`rules/fusion-workbench-conventions.md` for the definition rather than reciting the path.

## Verification

- `cd hooks && npx vitest run lib/__tests__/derivable-enumerations-lint.test.ts` — exit 0, 21 tests,
  run after the `README-agents.md` edits.
- `cd hooks && npx vitest run` — first run exit 1 on the path-literal lint (the `backlog/` literal
  above); after the fix, exit 0, 49 files, 1022 tests. Baseline unchanged from step 7.

## Files changed

- `README-agents.md` — the `## Dispatch parameters` preamble, table (two rows added, seven cells
  corrected or cited) and one new note.
- `docs/philosophy.md` — §3.
- `skills/help/SKILL.md` — topic 2, items 2 and 3.
- The plan file — steps 8 and 9 marked `[DONE]` with completion notes.
- Three issue files appended and renamed `_o_` → `_c_`.
