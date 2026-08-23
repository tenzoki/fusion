# Coder session: `/fusion:setup` declares the union merge driver

**Date:** 2026-08-23
**Agent:** coder
**Domain:** code
**Circle:** `circles/260823-0023-settle-what-travels-between-checkouts`
**Plan:** `circles/260823-0023-settle-what-travels-between-checkouts/planning/260823-0800_o_c2-what-travels-between-checkouts-is-settled.md`, step 3
**Status:** Complete

## What was done

`skills/setup/SKILL.md` gained **Step 0h — Declare the union merge driver for the event log**,
placed immediately after Step 0g and following that step's project-root-write convention rather
than inventing a second shape.

The block guards with `git rev-parse --is-inside-work-tree`, asks
`git check-attr merge -- fusion-workbench/orchestrator-events.jsonl`, and branches on git's own
resolved value in the three cases that partition it, plus the not-a-work-tree case:

- `union` writes nothing, because a broader glob the project wrote itself may be what set it;
- `unspecified` ensures a final newline, then appends the comment and
  `fusion-workbench/orchestrator-events.jsonl merge=union`;
- any other value leaves the file alone and names the driver, `unset` (written `-merge`) included;
- outside a work tree there is nothing to ask and nothing to write.

**The prose is two sentences and a pointer.** Why the question is `git check-attr` and never a text
search, and what a union merge costs the reader of the log, stay in
`rules/workbench-tracking.md` `## The event log carries a union merge driver`; the step says so and
restates none of it. That placement is what kept the edit inside the `skills/` budget.

Two properties are stated in the step rather than left to be inferred, both because a later reader
would otherwise have to derive them: the write lands at the project root, in the directory `pwd`
reported in Step 0, outside `fusion-workbench/` and never in a subfolder; and the step asks the user
nothing, which is what keeps Step 0g's sentence about being the only step that asks on a normal run
true.

The `## Done` report gained one clause naming which of the four outcomes occurred, and on the write
branch the `.gitattributes` path.

## Files changed

- `/Users/k1/Projects/productive/fusion/skills/setup/SKILL.md`
- `/Users/k1/Projects/productive/fusion/hooks/lib/__tests__/reference-resolution-lint.test.ts`
- `/Users/k1/Projects/productive/fusion/hooks/lib/__tests__/fixtures/surface-growth.golden`
- `/Users/k1/Projects/productive/fusion/fusion-workbench/circles/260823-0023-settle-what-travels-between-checkouts/planning/260823-0800_o_c2-what-travels-between-checkouts-is-settled.md`
  (step 3 marked `[DONE]`)

## Two gates forced a file outside the step's list, and both are re-approvals

Neither is a baseline moved to clear a bound, and neither absolves anything.

**`reference-resolution-lint.test.ts` `BASELINE`: `{ paths: 1286, anchors: 176 }` → `{ paths: 1287,
anchors: 177 }`.** The gate resolved both new tokens successfully; what failed was the pin on how
many it resolved. The step added exactly one citation, `rules/workbench-tracking.md` with the anchor
`## The event log carries a union merge driver`, which is one path and one anchor. `records` is
unchanged at 118. Re-approving the pin is what the assertion's own message prescribes.

**`fixtures/surface-growth.golden`: two lines.** `setup/SKILL.md 45842 → 48522` and the `[skills
bytes]` block total `236101 → 238781`. Regenerated with
`UPDATE_SURFACE_GOLDEN=1 npx vitest run lib/__tests__/surface-growth-bound.test.ts`, which rewrites
the file and then fails on purpose so the flag cannot be left on. **No baseline map moved**:
`SKILL_BASELINE` and `SKILL_HEAD_ROOM` are untouched, so the bound still measures growth from where
it did before.

## The `skills/` bound after the edit

| Figure | Value |
|---|---|
| Surface total | 238 781 bytes |
| Floor (`SKILL_BASELINE` over the same files) | 220 439 |
| Budget (floor + 20 000 head-room) | 240 439 |
| Growth since the baseline | 18 342 |
| **Head-room left** | **1 658 bytes** |

The step added 2 680 bytes, against the plan's estimate of roughly 2 500 for all three of steps 3, 4
and 5 together. The bound is not tripped, and this step does not move it; steps 4 and 5 now work
against 1 658 rather than the 4 338 the plan's risk table assumed. Step 4 removes `setup_pwd` and
replaces an unconditional write with a conditional one, so its net may be small either way, but the
margin is worth naming here rather than leaving for the step that meets it. A first draft of this
step measured 2 792 bytes and was trimmed by 112 without losing any required content.

## Verification

`npm test` from `hooks/` — **exit 0**, 41 files, 724 tests passing.

Every acceptance criterion was run as a command in a scratch git repository outside this tree, against
the block **extracted from the committed `skills/setup/SKILL.md`** rather than against a draft
(`diff` of the two: identical). 14 checks, 0 failures.

| Case | Check | Result |
|---|---|---|
| Comment + one unrelated rule, three runs | rule line count | 1 |
| | `git check-attr binary -- foo.png` | `binary: set` |
| | md5 after runs 2 and 3 | unchanged from run 1 |
| `.gitattributes` with no final newline | `git check-attr binary -- foo.png` afterwards | `binary: set` |
| | `git check-attr merge --` on the log path | `merge: union` |
| Broader glob `*.jsonl merge=union` | file md5 | unchanged; reported as already applying |
| `merge=ours` on that path | file md5 | unchanged; driver named `ours` |
| `-merge` on that path | file md5 | unchanged; driver named `unset` |
| Outside a git work tree | files created | 0; report names the reason |

Three further behaviours were checked beyond the criteria, because each is a precondition the step
relies on: an absent `.gitattributes` is created correctly, an empty one is appended to without a
leading blank line, and a run from a subdirectory of a git repository writes in that subdirectory
rather than at the git toplevel, which is the same anchor `check-attr` resolves the path against and
the same one the workbench uses.

The scratch tree was removed at the end of the run.

## What this step did not do

No commit. No file outside the four listed above was touched. Nothing in `rules/workbench-tracking.md`
was edited: the reasoning it holds is what this step points at, and a second copy of it in the skill
body is exactly what the plan's byte design rules out.
