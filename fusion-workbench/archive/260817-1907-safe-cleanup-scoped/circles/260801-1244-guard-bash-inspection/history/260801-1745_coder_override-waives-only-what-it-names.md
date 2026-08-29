# coder — the git override waives only what it names (plan step 6)

**Date:** 2026-08-01 17:45
**Circle:** `260801-1244-guard-bash-inspection`
**Plan:** `260801-1253_*_plan-guard-bash-inspection.md` — step 6
**Status:** Complete

## The hole

`guardBashCommand` handled the git override before the protected-path check and returned
after `allow()`. With `FUSION_ALLOW_BRANCH_SWITCH=1` in the session env,
`git switch main && rm rules/x.md` was allowed in full: an env var authorising a branch
switch also waived the protected-path policy, a permission nobody granted it. Recorded as
finding 1 of the step-5 history log.

## The new order

`guardBashCommand` now sequences three outcomes:

1. **Git deny** — un-overridden branch/worktree op. Blocks and returns.
2. **Mutation deny** — protected-path write, gated on `!isFusionPluginCwd()`. Reached on
   **both** routes out of step 1: git-clean and git-override-allowed.
3. **Override note** — the `guard_advisory` + `recentEvents` record, now emitted after the
   mutation check, falling through to the same trailing `allow()` instead of returning.

Only the override branch moved; both deny blocks are unchanged code.

**Why git stays first.** A command that is both git-denied and mutation-denied reads as one
tool call, and both denies call `recordBlock`, which increments the consecutive-block counter
that drives the three-block halt. Letting both fire would double-count that counter — the
counter would reach halt in two calls instead of three. So the first deny wins and returns:
exactly one block per call. Git is the one that wins because it is the sharper,
better-established policy, which is also the order the function already documented.

**Why the override note moved rather than being duplicated.** Emitting it at step 1 would
write "override allowed this git op" for a call that step 2 then blocked, which is false —
nothing was allowed. Emitting it after both denies keeps the note true by construction.

**What the user reads.** With the override set, the branch switch is authorised, so the deny
that fires is the mutation one and the reason names `rules/x.md`. Without the override, the
branch deny fires first and the reason names the branch policy. Each case reports the
permission the user actually lacks.

## Files

- `hooks/guard.ts` — the reorder plus the comments that describe it (module docstring,
  function docstring, the three step comments, the allow-path block).
- `hooks/lib/__tests__/guard-bash-wiring.test.ts` — 10 cases added, 16 → 26.

Not touched, per the task's constraints: `hooks/lib/shell-parse.ts`,
`hooks/lib/bash-mutation-guard.ts`, `hooks/lib/git-branch-guard.ts`, `hooks/dist/`, the
plugin version, the plan file.

## Lint assertions

**No existing assertion was changed or removed.** All 16 step-5 cases pass against the new
structure: the git classification still runs first, `resetBlockCounter` and `guard_allow`
still appear nowhere on the Bash path, the last statement is still a bare `allow()`, and
`classifyGitCommand` still precedes `classifyBashMutation`. The tripwire fired correctly by
staying silent — the restructure it was written to notice did not disturb the properties it
protects.

Three assertions added to pin the new structure, in a new describe block
*"the git override waives only the git op"*:

- `classifyBashMutation(` precedes the first read of `verdict.overrideUsed`.
- The slice from `verdict.overrideUsed` to the end of the function contains no `return` —
  the exact shape the hole had.
- The git deny sits above the mutation check and contains both `recordBlock(` and `return;`,
  which is what makes one call record one block.

## Verification

`npm test` 613 passed / 15 files (603 → 613), `npx tsc --noEmit` clean.

Seven of the ten new cases are end-to-end: `guard.ts` run as a fresh process under `tsx`,
JSON on stdin, inside a throwaway project root carrying a `fusion-workbench/.fusion-setup`
marker so `escalation.json` and `events.jsonl` are real files the assertions read back. The
harness `realpathSync`es its temp root (step 5's finding 2) and strips
`FUSION_ALLOW_BRANCH_SWITCH` / `FUSION_ALLOW_WORKTREE` from the inherited env so the
no-override cases mean what they say.

| Case | Asserted |
|---|---|
| `FUSION_ALLOW_BRANCH_SWITCH=1`, `git switch main && rm rules/x.md` | blocks; reason names `rules/x.md` and not the branch policy; one block, trigger `protected_path`; one event, `guard_block`; **no** advisory |
| `FUSION_ALLOW_WORKTREE=1`, `git worktree add ../wt f && rm -f agents/coder.md` | blocks on `agents/coder.md`; one block |
| `FUSION_ALLOW_BRANCH_SWITCH=1`, `git switch main` | allows; zero blocks; one `guard_advisory` naming the env var |
| no override, `git switch main` | blocks; one block, trigger `git_branch_switch` |
| no override, `git switch main && rm rules/x.md` | blocks on the branch; **exactly one** block, one event |
| `ls -la` | allows; `escalation.json` and `events.jsonl` do not exist (260707-0750_*_bash-allow-resets-block-counter-defeats-halt-escalation.md/0751 on the files, not the source) |
| block, then `git status`, then re-read state | `consecutiveBlocks` still 1; no event appended by the innocuous call |

The harness overlaps what plan step 6's original brief reserved for an integration harness.
It is scoped to the Bash path's block accounting, which is the fix's own proof — a later
integration step can extend it rather than start over.

## Finding filed

`260801-1745_*_one-git-override-lifts-the-deny-for-the-other-git-class.md` — the same
failure one layer down, inside `classifyGitCommand`. It returns on the first deny-case
segment, so an active override for one class stops the scan and the *other* class goes
unclassified. Verified by probe: `FUSION_ALLOW_WORKTREE=1 git worktree add ../wt f && git
switch main` allows, and the mirror form allows too. The hook cannot see this — the verdict
it receives already says "allowed" — so this step's fix does not cover it. Out of scope
(`git-branch-guard.ts` was ruled out of bounds), filed rather than fixed.

Not committed — the orchestrator commits.
