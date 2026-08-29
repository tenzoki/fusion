# coder — integration harness against a real project directory (plan step 6)

**Date:** 2026-08-01 18:21
**Circle:** `260801-1244-guard-bash-inspection`
**Plan:** `260801-1253_*_plan-guard-bash-inspection.md` — step 6
**Status:** Complete

## What was built

A reusable harness module plus an integration suite that spawns the guard as a real
subprocess against a temporary project root which is **not** a plugin root, so the write
guard does not stand down and every denial assertion can actually fail.

- `hooks/lib/__tests__/helpers/guard-harness.ts` — new. Not a `.test.ts`, so vitest does
  not collect it. Exports `guardEntry`, `makeProject` / `withProject` / `withPluginProject`,
  `runGuard` / `runBash` / `runWrite`, `readEscalation` / `readEvents` /
  `guardStateWritten`, `CASE_TIMEOUT`, `HOOKS_DIR`, `REPO_ROOT`.
- `hooks/lib/__tests__/guard-bash-integration.test.ts` — new, 25 cases, ~8s (27 process
  starts at ~0.22s each).
- `hooks/lib/__tests__/guard-bash-wiring.test.ts` — modified. Its inline end-to-end block
  (the third ad-hoc copy of this machinery in the Circle) now imports the helper. Its
  override-specific cases stay where they are; only the duplicated plumbing was removed.

Consolidation was the point: two prior coders built throwaway-project harnesses ad hoc
(`260801-1530_coder_wire-classifier-into-guard.md`,
`260801-1745_coder_override-waives-only-what-it-names.md`). There is now one shape with two
callers.

## The three properties the harness is built around

**1. A subprocess per case is a requirement, not a style choice.** `isFusionPluginCwd()`
caches its answer in a module-level variable, so one process can answer the plugin-repo
question only once. The stand-down pair needs both answers.

**2. The temporary root must be its own realpath.** `mkdtemp` under `os.tmpdir()` returns
`/var/folders/…` on macOS while the child's `process.cwd()` reports `/private/var/folders/…`.
When they differ, `normalizeToRelative` cannot relativize an absolute `file_path`, the path
matches no relative glob, and a protected-path case **silently allows** — the assertion
passes for the wrong reason. Reported by the step-5 coder; three defences here:

- `makeProject` resolves with `realpathSync` and then asserts `realpathSync(root) === root`,
  throwing if not. A future edit that drops the resolution fails in the helper rather than
  quietly weakening every caller.
- Every project also carries a deliberate symlinked `alias` of its root, and two cases
  (`describe("the macOS realpath trap")`) assert that an absolute path reached through the
  alias **is allowed** — for `Edit` and for `Bash`. That pins the vacuous-pass mechanism as
  a demonstrated fact rather than a warning in a comment.
- The positive halves (same paths through the resolved root) block. So the pair reads as
  one statement: this is what a resolved root buys you, and this is what an unresolved one
  costs.

**3. A crashed guard must not satisfy allow-side assertions.** `guard.ts` fails OPEN: an
unexpected exception prints `[guard] Error:` to stderr and then emits `{}`. `runGuard`
treats that line, a non-zero exit and unparseable stdout as harness failures. Without it, a
guard that threw on startup would make every "…is allowed" case pass.

There is deliberately **no skip condition**. `tsx` and `vitest` come from the same
`node_modules`, so a `skipIf(!existsSync(tsxBin))` could only ever hide a real problem; the
`skipIf` the wiring test carried was removed for the same reason.

## Coverage

- **Eight shell-mutation denials through the full hook**, each asserting the verdict, that
  the reason names both the segment and the path, and that `escalation.json` /
  `events.jsonl` moved exactly once with trigger `protected_path`: `mv`, `rm`, `>`
  redirection, a wrapper form (`sudo rm`), an ancestor directory (`rm -rf rules`), a
  `cd`-relative operand (`cd fusion-workbench && rm -rf .guard-state`), the state directory
  named directly, and `git mv`.
- **Two fail-closed denials**: `mv $A $B`, and `cd $D && rm -rf out` (which must point the
  agent at the `cd`, not at the operand).
- **The residual, made visible**: `curl -o rules/x.md …` is allowed, asserted on purpose so
  the documentation's honesty claim has a test behind it.
- **The `Edit` write path** blocks on an absolute protected path and allows an unprotected
  one — confirming the harness reproduces the *existing* guard behaviour, not only the new
  check. This case depends on the cwd, the realpath and the workbench marker all being
  right, so it is what catches a misbuilt harness.
- **Ordinary work**: a fresh project running `ls -la` never creates `.guard-state` at all,
  and after one block, nine innocuous calls (including `mv`/`rm`/`sed -i` on unprotected
  targets, `cp rules/x.md /tmp/y`, `git checkout HEAD -- rules/x.md` and `echo hi 2>&1`)
  leave `consecutiveBlocks` at 1 and `events.jsonl` at one line. That is issues 260707-0750_*_bash-allow-resets-block-counter-defeats-halt-escalation.md
  and 260707-0751_*_guard-allow-bash-events-flood-events-jsonl.md asserted on the files, which is the only place they are visible.
- **Halt escalation**: three consecutive Bash denials → `consecutiveBlocks: 3`,
  `haltActive: true`, events `guard_block, guard_block, guard_halt`, and `recentEvents`
  ending in `consecutive_blocks`.
- **The stand-down pair**, four cases: from a fake plugin root, `mv rules/x.md /tmp/` is
  allowed (and writes no guard state at all) while `git switch main` on the same root is
  denied with `git_branch_switch`; `Edit` on a protected path is allowed there too, so the
  two write surfaces stay coherent; and the identical `mv` denies as soon as the manifest
  is absent, which is the whole of the condition since `isFusionPluginCwd()` does no
  upward walk.

A **fake** plugin root (a tmpdir carrying `.claude-plugin/plugin.json` naming fusion) is
used rather than the real repository, because `git switch main` there would write into the
project's own `.guard-state` counters and could push the real halt escalation.

## The disable-the-check experiment

Required by the acceptance, and run rather than claimed.

`hooks/guard.ts` line 255 was temporarily changed from `if (mutation.deny) {` to
`if (mutation.deny && false) {` — chosen over disabling the `isFusionPluginCwd()` gate
because it leaves the source text the wiring test asserts on intact, so only *behavioural*
assertions move and the result is legible.

Result: **18 failed / 33 passed** across the two files (25 + 26 cases).

The 18 are exactly the assertions that depend on the mutation check: the precondition case,
all eight denials, both fail-closed cases, the `Bash` half of the realpath trap, the
ordinary-work case (which opens with a block), the halt case, the stand-down boundary case,
and the wiring file's three (both override-vs-mutation cases and the counter case).

Everything that does not depend on it stayed green — the git-branch denials, the `Edit`
write path, the `curl` residual, the alias-allows cases, and the three stand-down *allow*
cases. That is the stronger statement: the suite does not merely go red, it goes red in
precisely the right places.

The line was restored (`git diff hooks/guard.ts` empty) and the full suite re-run.

## Verification

- `npm test` in `hooks/`: **656 passed / 16 files**. (631 before this step — 613 at
  dispatch plus 18 the concurrent git-classifier work added — and 25 new.)
- `npx tsc --noEmit`: clean. The three files were additionally type-checked directly, since
  `tsconfig.json` excludes `lib/__tests__` from the project build.
- `hooks/dist/` untouched; `.claude-plugin/plugin.json` untouched.
- `hooks/lib/git-branch-guard.ts` and its test were not touched (concurrent edit). The one
  assertion of mine in that territory — `git checkout HEAD -- rules/x.md` must stay allowed
  — is inside the ordinary-work loop and fails with the offending command in the message.

Not committed — the orchestrator commits.

## Deviations from the step as written

**`hooks/package.json` was not changed.** The step named it, asking for the test script to
become `tsc && vitest run` so a stale `dist` cannot pass. The dispatch constraints forbade
touching `hooks/dist/`, and `tsc` writes twenty files there — while a second coder was
concurrently editing `hooks/lib/git-branch-guard.ts`, so a rebuild would have swept their
in-progress work into the next commit.

Instead the harness reads `FUSION_GUARD_ENTRY`: unset or `tsx` runs `hooks/guard.ts`
through `tsx` (the default; the 25 green cases use it), `dist` runs `hooks/dist/guard.js`.
The dispatch explicitly permitted either entry point. Flipping the suite to the shipped
artifact is an env var, not a test edit.

Filed as `260801-1821_*_npm-test-does-not-build-so-the-committed-dist-can-ship-stale.md`
so step 8 picks it up.

## What the harness revealed that the unit tests could not

1. **The committed `dist` is stale and the suite can now prove it.**
   `FUSION_GUARD_ENTRY=dist npx vitest run lib/__tests__/guard-bash-integration.test.ts`
   returns **15 failed / 10 passed** — the same mutation-dependent set the disable
   experiment produced, because `dist/guard.js` was last built 2026-07-19 and contains none
   of this Circle's work. The plan's risk table predicted exactly this failure mode; it is
   now a one-command check instead of an argument.

2. **The realpath trap is real for `Bash` operands too, not only `Edit`.** The step-5 coder
   scoped it to the write tools, reasoning that Bash operands are usually relative. They
   usually are — but an absolute operand behaves identically: `rm -f <alias>/rules/x.md`
   allows while `rm -f <root>/rules/x.md` blocks. Both halves are now asserted.

3. **Ancestor denial and the guard's own state directory reach the hook intact.**
   `rm -rf rules` and `rm -rf fusion-workbench/.guard-state` block end to end, so the
   ancestor pass survives `normalizeToRelative` and the real shipped `protectedPaths` — a
   composition the unit suite mocks and therefore cannot check.

4. **The three-block halt fires from Bash alone.** The unit suite has no escalation state.
   The counter, the `haltActive` flip, the `consecutive_blocks` record and the `guard_halt`
   event line all behave as they do for the write tools, which is what "the same trigger,
   so the monitor treats both alike" was supposed to mean.

5. **A guard that fails open would have passed the allow side silently.** Nothing in the
   suite noticed a fail-open until `runGuard` was taught to read stderr. Worth carrying into
   any future harness that asserts on a fail-open component.
