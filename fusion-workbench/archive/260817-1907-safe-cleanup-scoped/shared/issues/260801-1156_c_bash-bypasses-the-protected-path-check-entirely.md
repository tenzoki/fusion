Bash bypasses the protected-path check entirely, so `protectedPaths` is advisory for any agent that uses a shell

---

In a consuming project, every path in `guard.protectedPaths` is writable through the `Bash` tool. The protected-path check is only reached by `Write`, `Edit`, `MultiEdit` and `NotebookEdit`. A `Bash` call is inspected for git branch and worktree operations and then allowed, without any path check.

Verified control flow in `hooks/guard.ts`:

- `hooks/guard.ts:240-246` — only `Write`, `Edit`, `MultiEdit`, `NotebookEdit` and `Bash` reach the guard at all.
- `hooks/guard.ts:265-268` — `if (isBash) { guardBashCommand(input, config); return; }`. The `return` is unconditional, so a `Bash` call never reaches the protected-path check.
- `hooks/guard.ts:214` — `guardBashCommand` ends in `allow()` for anything that is not a branch or worktree-moving git operation.
- `hooks/guard.ts:309` — the protected-path check, reachable only via the write-tool path below the `Bash` return.

Consequence, in a consuming project where the write guard is active:

```
Edit    rules/coding-hygiene.md          -> BLOCKED (protected path)
Bash    mv rules/coding-hygiene.md /tmp/ -> ALLOWED
Bash    rm rules/coding-hygiene.md       -> ALLOWED
Bash    sed -i '' 's/MUST/may/' rules/coding-hygiene.md -> ALLOWED
Bash    printf '' > rules/coding-hygiene.md -> ALLOWED
```

This applies to every entry in the shipped list at `hooks/config.json:8-18`: `agents/**`, `rules/**`, `hooks/config.json`, `hooks/hooks.json`, `settings.json`, `bin/monitor`, `skills/**`, `.claude-plugin/plugin.json`, and `fusion-workbench/.guard-state/**`. The guard-state entry is the sharpest case: an agent can edit or delete its own escalation counter through a shell, which defeats the halt escalation the counter exists to drive.

---

## Context

Found while specifying the `curator` agent (`shared/planning/260801-1122_o_spec-normative-consolidation.md`). Surfaced by the shaper as a scope question about the curator; it is not curator-specific. The bypass exists today for all sixteen agents.

**It may be deliberate scoping rather than an oversight.** The comment at `hooks/guard.ts:201-213` states plainly that "The Bash path is NOT a write-guard concern", and gives sound reasons for that: an innocuous `Bash` call must not reset the consecutive-block counter (issue 260707-0750) and must not emit a `guard_allow` event (issue 260707-0751). Both of those are about *bookkeeping*, and both are correct. What appears not to have been traced through is that returning early to avoid the bookkeeping also skips the path check.

**It directly undercuts a decision taken today.** `shared/decisions/260801-1020_a_may-any-fusion-writer-touch-rules.md` records the user's choice to gate rule-file writes behind a new `FUSION_ALLOW_RULES_WRITE` environment flag. A flag on the `Edit` path is worth little while `mv` is unguarded: the curator, or any other agent, can retire a rule file with the flag unset. The flag should not be built as specified until this is resolved, or it will provide the appearance of a control rather than a control.

**Two fixes, with different costs.**

1. **Constrain the agent** — permit the curator only guarded tools, no `Bash` file mutation. Cheap, and scoped to one agent. Does nothing about the other fifteen, and relies on prompt compliance rather than enforcement, which is the failure mode `rules/git-branch-discipline.md` was written to avoid.
2. **Widen the guard's `Bash` inspection** — parse `Bash` commands for file-mutating operations against protected paths, the way `classifyGitCommand` already parses for branch operations. Enforcement rather than instruction, and the segmenting and subshell-inspection machinery already exists. Costs false positives on ordinary shell work and needs the same fail-closed care the checkout classifier took.

Note that a full fix is hard in the general case: a shell command can construct a path at runtime. Fail-closed on the constructible cases, as `classifyGitCommand` already does for `git checkout`, is the realistic target rather than completeness.

**Not reproducible in this repo.** The write guard stands down when cwd is the fusion plugin's own source tree (`hooks/lib/self-detect.ts:18-33`), so both the `Edit` block and this bypass are invisible here. Any test must run against a consuming project or a fixture.

---
Resolved: Fixed by Circle `circles/260801-1244-guard-bash-inspection`, option 2 of the two the issue named — widen the guard's Bash inspection rather than constrain one agent. Verified by the reconciler at HEAD `9ab5a2a`, from the code and the suite rather than from the Circle's own reports.

The control flow the issue documented is changed at the point it named: `hooks/guard.ts:249` now runs `classifyBashMutation` (imported at `:59`) inside `guardBashCommand`, gated on `!isFusionPluginCwd()`, above the unconditional `allow()` and below the git verdict. A deny goes through `recordBlock` with trigger `"protected_path"` (`:267`) — the same trigger the write-tool path uses, so the escalation counter, the monitor and the three-block halt treat both paths identically.

Every command in the issue's own reproduction block now blocks in a consuming project, asserted end to end against a spawned `hooks/dist/guard.js` in a tmpdir project root: `mv`, `rm`, `sed -i` and `printf '' >` against `rules/x.md` (`hooks/lib/__tests__/guard-bash-integration.test.ts:77-153`). The sharpest case the issue named, `fusion-workbench/.guard-state/**`, blocks too, including through a `cd` (`cd fusion-workbench && rm -rf .guard-state` denies, commit `59a1cd9`).

The bookkeeping the issue correctly identified as deliberate is preserved and now pinned on the state files, not inferred: nine innocuous Bash calls after a block leave `consecutiveBlocks` at 1 and append no event (`guard-bash-integration.test.ts:301-343`). The stand-down ordering the issue flagged as easy to get backwards is asserted in both directions (`:389-458`).

**The residual is real and is stated in the shipped documentation**, per the issue's own "a full fix is hard in the general case": an unrecognised program that writes a protected path still writes it. `rules/protected-path-discipline.md`, `README-hooks.md` and the module docstrings carry it. C5c raises the cost of the bypass from zero to deliberate; it does not eliminate it, and no claim that `protectedPaths` is enforced should be made without that qualification.

**One consequence the issue drew is NOT yet discharged.** Its paragraph "It directly undercuts a decision taken today" concerns `FUSION_ALLOW_RULES_WRITE`. The flag still does not exist; this Circle shipped only the `exempt` seam it plugs into (`hooks/lib/bash-mutation-guard.ts:168,1243,1252`). The issue's advice that the flag should not be built as specified until the bypass is resolved is now satisfied — the bypass is resolved, so `circles/260801-1244-guard-rules-write` is unblocked.

Evidence: commits `9a35b8e`, `7105f21`, `59a1cd9`, `5b8430c`, `85c043c`, `3806a49`, `e31c0f3`, plus the eight defect-fix commits in the same range. `npm test` in `hooks/`: 753 passed. Closed by reconciler 260801-2029.
