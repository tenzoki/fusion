# Coder — plan step 3: the mutation classifier's unit suite

**Date:** 260801-1513
**Agent:** coder
**Circle:** `260801-1244-guard-bash-inspection`
**Plan:** `260801-1253_*_plan-guard-bash-inspection.md` — step 3 only
**Status:** Complete

## What was implemented

`hooks/lib/__tests__/bash-mutation-guard.test.ts` (new): **177 vitest cases carrying 413
command assertions**, pure, no hook, no filesystem in the hot path. The plan asked for 90 to
120 cases against the git suite's bar of 84; the two prior steps' scratch matrices (93
classification cases, 42 ordinary commands, a 52-command baseline diff, 16 adversarial
wrapper forms) are reconstructed here as committed tests.

No source file was touched. `MUTATION_VERBS`, `MUTATION_GIT_SUBCOMMANDS` and
`WRAPPER_PROGRAMS` were already exported, so the "small non-behavioural export" the step
allowed for was not needed.

| Block | Command assertions |
|---|---|
| Verb table rows (10 verbs + 2 git subcommands, both directions) | 56 |
| `-t` / `--target-directory`, in-place flags, value-taking flags | 48 |
| Wrappers: enumeration, nesting, chaining, own flags | 51 |
| Ancestors (destroy, relocate, write-into, non-matches, root) | 40 |
| Fail-closed and its bound | 26 |
| Inertness (quoted, heredoc) | 19 |
| Redirection (skip forms + writing forms) | 31 |
| Quoting, normalisation, shell grammar, compound/subshell | 43 |
| Verdict shape and deny reasons | 10 |
| `exempt` seam and the empty list | 7 |
| **MUST-NEVER-DENY corpus** | **50** |
| Issue reproduction block | 5 |
| Accepted residuals, known gap, step-4 inversion | 23 |

## Three structural choices worth naming

**The tables assert their own completeness.** `VERB_CASES`, `GIT_VERB_CASES` and
`WRAPPER_INVOCATIONS` are compared as sets against `Object.keys` of the exported tables. A
verb or wrapper added without a test fails the suite rather than shipping unexercised, which
is what makes "exhaustively" a checkable claim rather than a hope. This is the analogue of
the shell-parse suite's harvest-don't-copy discipline.

**The protected-path fixture is pinned against `hooks/config.json`.** One filesystem read,
deliberately: the ancestor cases (`rm -rf hooks` denies, `rm -rf dist` does not) are only
meaningful against the list this project actually ships, and a fixture that drifted from the
config would weaken forty assertions silently.

**The must-never-deny corpus is a labelled regression block, not a list of allows.** Its
docstring says what tripping it means (the change denies ordinary agent work) and what to do
(take it to the user the way the three widenings were taken at the Q3 gate; move the newly
denied command to a labelled case rather than deleting it). It is 50 commands, sampled
against work this repository actually does — build and test, the git read side plus
`git checkout HEAD --`, reads of protected paths, backups, build-output destruction, the
`2>&1` forms, the substitution idioms, the fusion helpers.

## Findings

**One real defect, filed.** `rm \` + newline + `rules/x.md` is **allowed**.
`shell-parse.ts` does not honour a backslash line continuation: `stripData` emits the
escape pair verbatim (`shell-parse.ts:197-202`) and `scanSegments` then treats the newline as
a command terminator (`shell-parse.ts:547-551`), so the command arrives as `["rm \\",
"rules/x.md"]` and the operand is never an operand. **The same hole exists in the shipped git
classifier**: `git worktree \` + newline + `add ../wt x` is allowed. `git switch` and
`git checkout` survive only by accident, because the bare verb denies on its own.

Verified by probe against both classifiers, not inferred. Filed as
`260801-1513_*_backslash-line-continuation-splits-a-command-and-hides-its-operands.md`.
Not fixed here: the fix is one branch in `stripData`, it widens both classifiers' deny
surfaces, and blank-mode equivalence against the 84 git cases has to be re-checked — so it
belongs at a gate, and step 3's remit is the test file.

**One residual the module docstring does not name.** Brace expansion joins glob expansion in
the "matched as literal text" family: `rm -rf {rules,agents}` is allowed for the same reason
`rm -rf *` is. Treating `{` or `*` as unresolved would fail-closed on `rm build/*.js` and
every other ordinary glob, so the current behaviour is right; it is asserted in the residual
block and worth a line in step 7's documentation.

**Nothing else disagreed.** Every other case the two prior history logs claimed, and every
case I added while probing for disagreement, matched the implementation. The settled table
survived contact with an exhaustive suite: no row is over-broad in a way the ordinary-command
corpus can detect, and no row is under-broad in a way the adversarial forms can detect.

**Three known behaviours are asserted at their current value on purpose**, each labelled, so
a later change surfaces rather than hides:

- the two accepted false positives from the Q3 gate (`sed -i "s/$OLD/$NEW/" …`,
  `rm -rf ~/.cache/fusion`, and `echo "x > rules/y.md"`);
- the backslash-continuation gap above, citing the issue;
- step 4's `cd` cases, inverted — `cd fusion-workbench && rm -rf .guard-state` currently
  allows, so step 4's coder gets a failing test naming exactly what to flip.

## Verification

`npm test` in `hooks/`: **523 passed, 14 files** (346 before + 177 new).
`git-branch-guard.test.ts` (84) and `shell-parse.test.ts` (30) are unmodified and green.
`npx tsc --noEmit` clean. `git status --short` shows one untracked file plus the workbench.

## Files

- `hooks/lib/__tests__/bash-mutation-guard.test.ts` — new
- `.../260801-1513_*_backslash-line-continuation-…md` — new
- `.../260801-1253_*_plan-guard-bash-inspection.md` — step 3 marked `[DONE]` with
  the divergences and the finding

`hooks/guard.ts` (step 5), `hooks/dist/` (step 8) and `.claude-plugin/plugin.json` (step 8)
were not touched. Not committed — the orchestrator commits.

## Note for the orchestrator

`fusion-workbench/tasklist.md` is stale: it still holds the v4.0.0 workbench-restructure
queue (P-1 … P-11), not this Circle's steps. Nothing in it was updated, because nothing in it
describes this work. Worth a reconciler pass before the next taskplanner run.
