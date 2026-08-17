A sub-agent left renames staged and the orchestrator's next commit absorbed them

---
**Domain:** code
**Filed by:** orchestrator
**Severity:** Medium. Nothing is lost and nothing wrong reached the repository; what breaks is the
correspondence between a commit's message and its contents, which is the only record of why a
change was made.
**Cross-references:** `agents/orchestrator.md` Step 3b step 4 (the staging shape) and step 5 (the
held command); issue `260811-0114` (the staging-drift check, which measures the opposite failure)

---

## What happened

At Turn 4 of Circle `260816-1741-guard-becomes-observation-only` the orchestrator committed the
shaper's correction to `_t_circle.md` plus two issue renames, naming five paths explicitly and
absolutely, exactly as Step 3b step 4 requires. The resulting commit `dbbad70` carries **seven**
files. Four were never named: the renames of `260816-2123`, `260816-2317`, `260817-1032` and the
plan `260816-1915`.

All four had been renamed earlier in the session by the `reconciler`, which staged them and then
continued to append content to them. So at the moment the orchestrator ran `git add <five paths>
&& git commit`, the index already held four rename pairs from another agent. `git commit` writes
the whole index.

The signature is visible in the result: the four extra entries show as pure renames with `0`
changed lines, while their content edits remain unstaged in the working tree afterwards.

## Why the existing rule does not cover it

Step 3b step 4 makes over-staging impossible **by the caller**: every path passed to `git add` is
one the caller wrote out. Step 3b step 5 closes the race where a path staged outside the lock is
absorbed by a parallel committer. Neither addresses a **dirty index inherited from a sub-agent
dispatched earlier in the same session**. The orchestrator's own command was correct and the
outcome was still wrong, which means the defect is in the protocol, not in the execution.

The staging-drift check (`bin/fusion-staging-drift`, issue `260811-0114`) measures records that
reach **no** commit. This is the mirror case: records that reach a commit that was not about them.
Nothing measures it.

## What should happen

Undecided, and deliberately left open rather than proposed as a fix — the options differ in cost
and one of them changes what sub-agents are allowed to do.

- Have the orchestrator assert a clean index before staging (`git diff --cached --quiet`), and stop
  and report when it is not. Cheap, and it makes the inherited state visible at the one moment it
  matters.
- Have the orchestrator commit the inherited staged work first, under its own message, then stage
  its own. Preserves attribution without forbidding anything.
- Forbid sub-agents from staging at all, leaving `git add` to the orchestrator alone. Cleanest in
  principle, but several agents stage as part of their normal work and this would have to be
  stated in each of their prompts.

## Evidence

- `git show --stat dbbad70` — seven files, four of them renames at 100% similarity.
- `git status` immediately after — the same four files listed as ` M` at their new names.

---
Reconciliation 2026-08-17, second Phase-3 pass. **Left OPEN. The account is confirmed and the
count is corrected upward; the remedy is still undecided, which is what keeps it open.**

**Measured at HEAD, not taken from the report above.**

`git show --name-status --find-renames dbbad70` returns **seven paths and six renames**, not two
plus four:

| Path | Status | Named by the message? |
|---|---|---|
| `_t_circle.md` | `M` | yes |
| `260816-1917_c_…test-list…` | `R065` | yes ("Closes both `260816-1917_*` records") |
| `260816-1917_c_…text-surface-list…` | `R052` | yes |
| `260816-2123_c_…dangling-citations…` | `R100` | **no** |
| `260816-2317_c_…citation-set-grew…` | `R100` | **no** |
| `260817-1032_c_…bounded-surfaces…` | `R100` | **no** |
| `260816-1915_c_…observation-only.md` (plan) | `R100` | **no** |

So the four unnamed renames are exactly as this record says. What it does not say is that the two
*named* renames carry a second author's content: the `R065`/`R052` similarity indices are below 100
because each of those two files also absorbed the reconciler's unstaged
`Reconciliation 2026-08-17, Phase 3` annotation block, picked up by the orchestrator's `git add` of
the path. That is a wider absorption than a staged rename — an unstaged **content** edit from
another agent, landing under a message that describes only the shaper's half.

**Nothing was lost, and nothing wrong was committed.** Verified three ways:

1. The four `R100` renames carried no content, and their content edits reached the very next
   commit: `bee46e7` shows `M` on all four at their new names. Both halves of every one of the four
   changes are in the repository.
2. Every one of the seven paths is a tracking file of this Circle. No code, no data, no file
   outside `fusion-workbench/` rode along.
3. All four renames are **correct changes**, re-verified against the tree rather than against the
   first pass's claims: `260816-2123` (`reference-resolution-lint` green inside a whole-suite pass,
   35 files / 653 tests, no dangling path in `CLAUDE.md`), `260816-2317` (`CLAUDE.md:30` rewritten,
   heading now `` `fusion.json` + `templates/fusion.json` ``), `260817-1032`
   (`hooks/lib/__tests__/surface-growth-bound.test.ts:163-181` carries the argument and moves
   `TEST_LINE_BASELINE` alone), and the plan (all 16 implementation steps plus the amendment's step
   16 carry `[DONE]`; header reads `**Status:** Complete`).

**The working tree and the index are consistent now.** `git diff --cached --quiet` and `git diff
--quiet` both exit 0, `git status --porcelain --untracked-files=all` is empty, and
`git rev-list --left-right --count origin/main...HEAD` is `0 0`.

**This is a re-filing.** `shared/issues/260816-0105_*_a-sub-agents-staged-rename-is-absorbed-by-the-orchestrators-next-commit-and-the-staging-list-cannot-prevent-it.md`
filed the same defect on 2026-08-16 from session 260815-2147, commit `a19c867`, with the same
mechanism, the same reading of why Step 3b steps 4 and 5 do not reach it, and the same citation of
`260811-0114`. It was not found before this record was written. Both are now cross-annotated; they
are one defect and want merging, with this record's three-option remedy kept.
