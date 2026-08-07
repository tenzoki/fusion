# S10 — regenerate the emission golden and run the full suite

**Status:** Complete
**Agent:** coder
**Plan:** `shared/planning/260807-2024_o_two-language-declarations.md`, step S10
**Date:** 2026-08-07

## What was done

Regenerated `hooks/lib/__tests__/fixtures/rules-emission.golden` by the documented
two-run procedure, reviewed the diff against the commits that caused it, edited the
stylometric-profile bullet in `CLAUDE.md` to cite its authoring home instead of
restating it, and ran the full hooks suite.

### 1. Regeneration

Run one, with the flag, rewrote the fixture and failed on purpose as designed
(1 failed, 8 passed — the failure being `was not run with the update flag left
switched on`). Run two, without the flag, was green at 9/9. The fixture was never
hand-edited.

### 2. The diff, tied to its causes

Four files moved, and only those four. Every agent's path set, emission order and
file count are unchanged; the only edits are byte sizes and totals.

| Rule file | Was | Is | Delta | Commit that caused it |
|---|---|---|---|---|
| `fusion-workbench-conventions.md` | 35 668 | 39 507 | +3 839 | `def9d13` (S1) |
| `agent-setup.md` | 2 792 | 3 162 | +370 | `c3b74b9` (S6) |
| `critical-stance.md` | 9 482 | 9 837 | +355 | `c3b74b9` (S5) |
| `user-facing-output.md` | 16 690 | 16 784 | +94 | `c3b74b9` (S6) |

All four are always-on, so every one of the sixteen agents moves by the same
+4 658 bytes. Verified by reading each file's byte size at `a94f142` (the commit
that last wrote the golden), at `def9d13` and at `c3b74b9`: the conventions delta
lands entirely in `def9d13`, the other three entirely in `c3b74b9`. Nothing is
unexplained.

`76eddbb` (S9) also touched `rules/`, but only `context-lean-claude-md.md`, which
`bin/fusion-rules` emits to no agent. It correctly moves no number in the golden.

### 3. Neither gate tripped

`RULE_BASELINE` was not touched. It did not need to be: the budget report measures
growth from the post-cut 2026-08-05 figures, and `protected-path-discipline.md` has
since gone 19 943 -> 6 583 with no re-baseline, so every role still sits *below* its
own floor. The core-only role stands at 86 596 against a floor of 89 896; the
orchestrator, the fleet's high-water mark, stands at 107 109 against a floor of
108 448 and a drift ceiling of 145 144. No budget report was printed and the drift
gate passed.

### 4. The `CLAUDE.md` edit

The "Two stylometric profile families" bullet restated the fallback chain that
`rules/fusion-workbench-conventions.md` `## Project language` owns. Replaced the
restatement with one clause citing that home. Removed: the parenthetical "or from
`**Language:**` when that second line is absent", and the sentence "Both families
share one en-fallback" — which had additionally drifted, since the rule states the
missing-variant fallback is per family and explicitly not shared. Kept: what each
family is for, which line each resolves from, the lean-blacklist description, the
`user-facing-output.md` cross-reference, and the setup-copies-four-files sentence.
The bullet did not grow. `CLAUDE.md` is not an emitted rule file, so this moved no
golden number; the edit was made after the regeneration to keep the two separate.

## Verification

`cd hooks && npm test`: 33 test files, 1 026 tests, all passing — once after the
regeneration and again after the `CLAUDE.md` edit. Specifically green:
`reference-resolution-lint` (23), `derivable-enumerations-lint` (18),
`path-literal-lint` (19), `provenance-header-lint` (27), `rules-voice-profile` (12,
the suite S4 added) and `rules-emission-golden` (9).

## Finding, not fixed here

The plan's step S8 is still marked `[IN PROGRESS]` although its commit (`b6bca62`,
the chat profiles naming their sibling by role) landed. S10's constraints scope this
task to the golden and `CLAUDE.md`, so the marker was left for whoever reconciles
the plan.

## Files changed

- `hooks/lib/__tests__/fixtures/rules-emission.golden` (regenerated)
- `CLAUDE.md` (the stylometric-profile bullet)
- this plan's S10 marked `[DONE]`
