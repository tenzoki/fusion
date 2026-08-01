# Branch/worktree guard never fires — PreToolUse matcher omits Bash

---
**Status:** closed
**Filed by:** orchestrator (investigation with analyst-style probe)
---

## Symptom

The git branch/worktree guard does not block anything. Empirical probe in a live session:
`git checkout __fusion_guard_probe_nonexistent_ref__` executed and returned git's own
"pathspec did not match" error (exit 1) instead of being denied by the hook. If the guard
were firing, the Bash call would be blocked before git ran.

## Root cause (verified)

`hooks/hooks.json` `PreToolUse` has a single entry with
`"matcher": "Write|Edit|MultiEdit|NotebookEdit"` — **`Bash` is absent**. So
`node ${CLAUDE_PLUGIN_ROOT}/hooks/dist/guard.js` is never invoked on Bash tool calls, and
the entire git-branch/worktree classifier in `hooks/lib/git-branch-guard.ts` is dead code in
production.

Commit `4950ffa` ("feat(hooks): deterministic git-branch-switch guard") states in its message
"The PreToolUse guard now intercepts Bash calls and DENIES branch/worktree-moving git
operations", but `git show 4950ffa -- hooks/hooks.json` shows no matcher change — the matcher
was never widened to include Bash. The 48 unit tests in
`hooks/lib/__tests__/git-branch-guard.test.ts` exercise the pure classifier directly, so they
pass while the wiring gap goes undetected.

## Impact

- `git checkout <ref>` (branch switch without `--`) is completely unprotected by the hook.
- `git switch` and `git worktree add` are caught ONLY by the `settings.json` deny belt
  (`Bash(git switch:*)`, `Bash(git worktree add:*)`), not by the deterministic hook the rule
  doc (`rules/git-branch-discipline.md`) promises as the enforcement surface.
- The env overrides `FUSION_ALLOW_BRANCH_SWITCH` / `FUSION_ALLOW_WORKTREE` and the
  override-used guard-state notes never trigger, because the guard never runs.
- `rules/git-branch-discipline.md:3` and `agents/orchestrator.md:547` both assert the hook
  enforces this deterministically — currently false.

## Fix

Add `Bash` to the `PreToolUse` matcher for the guard in `hooks/hooks.json`. Either widen the
existing matcher to `Write|Edit|MultiEdit|NotebookEdit|Bash`, or add a second `PreToolUse`
entry with `"matcher": "Bash"` pointing at the same `guard.js`. Verify `guard.ts` correctly
branches on tool name (Bash → git-branch-guard path; Write/Edit → write-guard path) — it
already appears to (guard.ts ~line 98–160 handles the Bash branch).

Add a regression guard: a test (or a `claude plugin validate`-adjacent check) asserting the
guard's PreToolUse matcher includes `Bash`, so the wiring can't silently regress again. The
unit-test-passes-while-unwired failure mode is the core lesson here.

## Verification

After the fix, re-run the probe: `git checkout __probe_nonexistent__` must be DENIED by the
hook (fusion-policy message), not produce git's own pathspec error. `git worktree add ../x y`
must be denied by the hook even if the settings.json belt were removed.

---
Resolved: commit dbf98f6 — guard PreToolUse matcher now includes Bash (guard fires on git ops); launcher exports FUSION_PLUGIN_ROOT; hooks-wiring.test.ts regression added; 91 tests pass
