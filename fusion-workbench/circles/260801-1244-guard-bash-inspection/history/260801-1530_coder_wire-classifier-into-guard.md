# coder — wire the mutation classifier into the guard (plan step 5)

**Date:** 2026-08-01 15:30
**Circle:** `circles/260801-1244-guard-bash-inspection`
**Plan:** `planning/260801-1253_o_plan-guard-bash-inspection.md` — step 5
**Status:** Complete

## What was implemented

`classifyBashMutation` is now called from `guardBashCommand` in `hooks/guard.ts`, after the
git override and deny branches and before the final `allow()`, gated on
`!isFusionPluginCwd()`. A deny follows the existing branch-switch deny's shape exactly:
`loadEscalation` → `recordBlock(…, "protected_path", reason, "Bash", targetPath)` →
`saveEscalation` → `emitEvent(halted ? "guard_halt" : "guard_block", "Bash", targetPath,
"Protected path")` → `block(reason)`. No halt check was added on this path, per step 2's
instruction.

`normalize` is the existing `normalizeToRelative`, the same function the write path applies
before `matchesAny`. The classifier additionally runs `path.normalize()` on the result.

Comments updated: the module docstring (which claimed Bash was intercepted for the branch
policy alone), the `guardBashCommand` docstring, the `isBash` dispatch comment, and the
allow-path comment block — the last extended to record that both checks above it are
deny-only, so its stated zero-side-effect property still describes the code.

## Files

- `hooks/guard.ts` — modified (the only source file touched).
- `hooks/lib/__tests__/guard-bash-wiring.test.ts` — new, 16 cases.

`hooks/lib/shell-parse.ts`, `hooks/lib/__tests__/shell-parse.test.ts` and
`hooks/lib/__tests__/bash-mutation-guard.test.ts` were concurrently modified by another
coder (the backslash-continuation fix) and are NOT part of this step's change.

## Self-detect decision

The mutation check **stands down** in the plugin's own repo — settled by the plan
(step 5, and the `## Approach` flowchart's `HOOK -->|"only when not plugin repo"| MUT`
edge), and step 6's stand-down pair asserts it. It is the right side independently: the
check is a write-guard concern reading the same `protectedPaths` list, and `agents/**`,
`rules/**`, `skills/**` are exactly what a fusion developer's agents move and rewrite here.
Leaving it active while `Write`/`Edit` stand down would allow `Edit rules/x.md` and deny
`mv rules/x.md rules/retired/`, which teaches an agent to route around the guard. The
branch policy's reasoning does not transfer: a human switches branches in their own
terminal, which the hook never sees, so gating the agent there costs the developer nothing.

## Verification

`npm test` 554 passed / 16 files, `npx tsc --noEmit` clean.

Beyond the suite, the hook was run end to end through `tsx` against two throwaway project
roots (no plugin manifest at cwd → guard active; a fake `{"name":"fusion"}` manifest at cwd
→ stand-down), asserting on stdout **and** on `escalation.json` / `events.jsonl`:

- `mv`, `rm -f`, `sed -i`, `tee`, `printf >`, `git mv` against `rules/x.md` each block,
  naming the segment and the path.
- Seven innocuous Bash calls after a block leave `consecutiveBlocks` at 1 and
  `events.jsonl` at one line — the 260707-0750 and 260707-0751 constraints, on the files.
- Three consecutive denies → `consecutiveBlocks: 3`, `haltActive: true`, third event
  `guard_halt`.
- Stand-down pair: `mv rules/x.md /tmp/` allowed while `git switch main` denied.
- Normalization: an absolute operand under the project root blocks as `rules/x.md`; the
  same path under `/tmp` allows; `hooks/../rules/x.md` and `./rules/x.md` block.

## Findings for later steps

1. **Override-path residual (step 6 / a follow-up decision).** A command that trips the git
   override branch returns advisory + allow before the mutation check runs, so with
   `FUSION_ALLOW_BRANCH_SWITCH=1` set in the session env, `git switch main && rm
   rules/x.md` is allowed entirely. This matches the plan's flowchart; closing it means
   running the mutation check for the override-used branch too, which reorders code the
   step was told not to restructure. Narrow — the env var must be set in the Claude Code
   session, not in the command string.
2. **macOS symlink trap for step 6's harness.** `mktemp -d /tmp/…` returns an unresolved
   path while `process.cwd()` reports `/private/tmp/…`. `normalizeToRelative` then fails to
   relativize an absolute `file_path` built from the unresolved path, and a write-tool
   protected-path case silently **allows**. The harness must `pwd -P` / `realpath` its
   temporary root. Bash operands are usually relative, so only the write-tool assertions
   are exposed.
3. `cd fusion-workbench && rm -rf .guard-state` is still allowed end to end — step 4
   (virtual cwd) is not implemented yet, as expected.

Not committed — the orchestrator commits.
