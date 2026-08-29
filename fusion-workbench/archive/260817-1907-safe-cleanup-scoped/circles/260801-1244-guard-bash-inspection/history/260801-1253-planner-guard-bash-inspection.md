# Planner — guard Bash inspection (C5c)

**Date:** 2026-08-01 12:53
**Circle:** `260801-1244-guard-bash-inspection`
**Agent:** planner (executors: coder, ontocoder)
**Produced:** `260801-1253_*_plan-guard-bash-inspection.md`

---

## What was planned

An eight-step implementation plan for capability C5c: widening the compliance guard's `Bash` inspection so file-mutating shell commands are checked against `guard.protectedPaths`. Scope was C5c alone; C5a and C5b were left to Circle `260801-1244-guard-rules-write`.

## Inputs read

- The Circle record `_t_circle.md`.
- `260801-1156_*_bash-bypasses-the-protected-path-check-entirely.md` — the defect and its verified control flow.
- `260801-1122_*_spec-normative-consolidation.md`, `### C5` and the `*C5c — Bash inspection:*` criteria block, plus the constraint and open-question lines at 608-612 and 651-660.
- `hooks/guard.ts` in full, `hooks/lib/git-branch-guard.ts` in full, and `hooks/lib/self-detect.ts`, `paths.ts`, `workbench-root.ts`, `escalation.ts`, `events.ts`, `config.ts`, `config.json`, `hooks.json`, `package.json`, `tsconfig.json`.
- `rules/git-branch-discipline.md`, `README-hooks.md`, `.gitignore`, `bin/fusion-rules`, and the existing test suite layout.

No open decision records existed in either the Circle's or the shared decision store, so none fed the plan.

## Findings that shaped the design

Two facts were established by running the existing parser rather than reading it, and both changed the plan:

1. `stripDataRegions` blanks single-quoted content, so `mv 'rules/x.md' /tmp/` reaches any classifier as `mv '          ' /tmp/`. Blanking is correct for the git classifier, where a quoted `git switch` is inert prose, and wrong for a mutation classifier, where a quoted operand is an ordinary path. Left alone it is a fail-open hole; combined with the fail-closed rule it would instead deny every ordinary quoted `mv`. This produced step 1, a capture mode on the shared parser.
2. `extractCommandSegments` replaces `&` with a space, so `echo hi 2>&1 >/tmp/log` segments into `["echo hi 2>", "1 >/tmp/log"]`. A redirection scanner treating a trailing operator as an unresolved target would deny `2>&1`, which agents run constantly. This produced an explicit skip rule in step 2.

A third fact made the testing problem tractable: `hooks/lib/self-detect.ts:20` resolves the plugin manifest against `process.cwd()` with no upward walk, so any directory that is not literally a plugin root gets the full write guard, however deep inside this repository it sits. The integration harness uses a `mkdtemp` project root rather than a committed fixture, because the guard writes state into whatever workbench it finds and `fusion-workbench/` is not gitignored here.

## Design decisions taken in the plan

- The shell-parsing primitives move to `hooks/lib/shell-parse.ts`, consumed by both classifiers, with `git-branch-guard.ts` re-exporting them so the 84-case suite is untouched. A module named for git should not own the lexer a non-git consumer depends on. This answers the spec's open question 653.
- Recognition is table-driven: one row per verb naming flags that take a value and which positionals are *written*. Read-only operands are excluded by role, so `cp rules/x.md /tmp/y` stays allowed. This answers the spec's open question 652.
- `sed` and `perl` take all positionals rather than modelling where the script ends, because BSD and GNU disagree on `-i` and a sed script never matches a protected-path glob. No platform branch in the code.
- The mutation check is gated on `isFusionPluginCwd()` from inside `guardBashCommand`, after the git verdict, so the branch policy stays active in this repository and the write-guard concern stands down.
- Denials reuse the `protected_path` trigger and `recordBlock`, so the escalation counter, the three-block halt and the monitor treat the shell path exactly like the write-tool path.
- No halt check is added on the Bash path. Extending halt to Bash would stop a halted agent from running `ls`, which nobody asked for.
- The test script gains a `tsc` prebuild, because production runs the committed `hooks/dist/guard.js` and a suite against the TypeScript source would pass while a stale build shipped the defect.

## Open questions handed to the gate

Four, three of them gates: deferring the `FUSION_ALLOW_RULES_WRITE` criterion to Circle 2 (a seam ships instead), whether the virtual-working-directory step survives a scope cut (recommendation: keep it), and a review of the verb table after the unit suite and before the hook wiring, since that table is where a false positive would come from.

## Status

Plan is Draft, awaiting the user's approval at the plan gate. No code was read for modification and nothing was executed.
