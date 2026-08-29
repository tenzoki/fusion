# Coder — The workbench leaves the git stash (task T5)

**Status:** Complete
**Task:** T5 — stop `/fusion:circle-stash` sweeping away the stash it just wrote
**Source:** `260717-0030_*_git-stash-include-untracked-can-sweep-the-stash-directory.md`
**Origin:** shared store; no Circle active

## What was implemented

The user's decision at the human gate, not a pathspec bolted onto an unanswered question: the
workbench is excluded from the git stash entirely. `/fusion:circle-stash` already holds
everything it needs from the workbench by copy (7.2) and by move (7.4), so the git stash's job
is the user's uncommitted **source** changes. Two captures, two jobs, nothing taken twice.

Step 7.6 of `skills/circle-stash/SKILL.md` now pushes with a pathspec that excludes the
workbench, under a branch:

```bash
if (cd "$PROJECT_ROOT" && git add --dry-run --all -- ':/' ":(exclude)$WB_NAME" >/dev/null 2>&1); then
  cd "$PROJECT_ROOT" && git stash push --include-untracked -m "fusion:circle-stash $STASH_ID" -- ':/' ":(exclude)$WB_NAME" || true
else
  cd "$PROJECT_ROOT" && git stash push --include-untracked -m "fusion:circle-stash $STASH_ID" || true
fi
```

`WB_NAME` is `basename "$WORKBENCH"`, derived in Step 1, so the workbench directory is named
in exactly one place and the pathspec stays correct when the project root sits below the git
toplevel (measured: the exclusion is cwd-relative and every git command in this skill runs at
`$PROJECT_ROOT`).

## Why there is a branch, which was not obvious and was not guessed

`git stash push <pathspec> --include-untracked` runs `git add --all -- <pathspec>` internally
to clear what it saved, and **`git add --all` refuses a pathspec that names an ignored path —
negative pathspecs included** (git 2.49.0, measured; `':/' ':(exclude)wb'`, `':(exclude)wb'`
alone, the `,glob` form and the trailing-slash form all refuse identically). A gitignored
workbench is exactly such a path. So the naive one-line fix breaks precisely the one
configuration that never had the defect, and it breaks it in the worst available way: the
stash entry is created, the working tree is **not** freed, exit is 1, and the existing
`|| true` swallows it, so the skill would have reported a freeze that did not happen.

The branch condition asks git the same question git will ask itself — the same `git add --all`
with the same pathspec, under `--dry-run`. Verified index-neutral. Two cheaper-looking
criteria were measured and rejected:

- `git check-ignore -q fusion-workbench` — **wrong**. It answers "not ignored" for an ignored
  directory that contains a tracked file, and that is a configuration where the pathspec form
  still refuses.
- Reading the ignore rules — same undecidability the guard's Bash classifier died of.

The fallback is safe by the same fact that forces it: it is taken only where git already
excludes the workbench's untracked content from `--include-untracked`, which is exactly what
makes the stash directory unsweepable there.

## The residual, stated rather than left to be found

A workbench directory that is gitignored **and** carries force-added tracked files takes the
fallback, and those files' uncommitted modifications do travel in the git stash (`git stash
apply` puts them back at pop). The stash directory itself survives, because it is untracked
and ignored. It is named in the skill body at Step 7.6. Closing it would need a status parser
in a skill body, and a parsing bug there loses the user's changes — a worse trade than the
exotic configuration it would buy.

## Measured, in throwaway repositories

Six configurations, old command against new, before any text was written:

| Workbench | old command | new command |
|---|---|---|
| untracked, unignored | stash directory **swept** | intact, source captured, tree freed |
| tracked | stash directory **swept** | intact, source captured, tree freed |
| mixed (records tracked, live state ignored — this repository since `65f7c3b`) | stash directory **swept** | intact, source captured, tree freed |
| `fusion-workbench/` ignored | intact | intact (fallback branch) |
| `fusion-workbench/` ignored + force-added tracked file | intact, workbench file reverted | intact, workbench file reverted (the residual) |
| `fusion-workbench/*` ignored | stash directory intact, workbench reverted | intact, workbench kept |

Also measured: the project root below the git toplevel (`app/fusion-workbench`), and the whole
block under `zsh` as well as `bash`, since the skill body is executed by the agent's shell.

## Consequences carried into the user-facing text

- The Step 6 preview counted **every** uncommitted line, including the workbench's. It now
  counts with the workbench excluded — `git status` accepts that pathspec in every
  configuration, ignored included, which is why only the push needs a branch — and the line
  says the workbench does not travel and that uncommitted workbench changes stay put.
- A Boundaries bullet states the division, and the skill header states it before Step 1.
- `rules/workbench-stash-and-lock.md` `## Stashes` gains `### Two captures, two jobs`. It is
  the protocol statement, and it said "and the git working tree" without qualification.

## Test

`hooks/lib/__tests__/circle-stash-git-exclusion.test.ts` — 8 tests. It does not restate the
fix: it **extracts** the Step 7.6 bash block from `skills/circle-stash/SKILL.md` and runs it
against a throwaway repository per configuration, so a regression in the skill's own text
fails the suite. It also drives the defect itself (the old command sweeping the directory in
the tracked configuration, which is the one this repository is in) and the refusal that forces
the branch, so neither can be "simplified" away without a red test.

## Test suite

`cd hooks && npm test`: 952 passed, 1 failed — `rules-emission-golden`, the known failure.
Its diff now has two movements, and only one of them is the known one:

- `fusion-workbench-conventions.md 39529 → 41680` — from `65f7c3b`, not this task, every agent.
- `workbench-stash-and-lock.md 11208 → 12957` — this task, `orchestrator` only (that file is
  emitted to no other agent).

Both belong in the deliberate regeneration at the end of the session.

## Files

- `skills/circle-stash/SKILL.md`
- `rules/workbench-stash-and-lock.md`
- `hooks/lib/__tests__/circle-stash-git-exclusion.test.ts` (new)
- `CLAUDE.md` — one citation, forced by the rename: the layout table cited the record with its
  `_o_` marker, which `reference-resolution-lint` fails once the record closes. Rewritten to
  the `_*_` wildcard form, and the sentence's tense follows the record's state.
- `fusion-workbench/tasklist.md` (task 5 closed)
- `260717-0030_*_git-stash-include-untracked-can-sweep-the-stash-directory.md` (resolved, `_o_` → `_c_`)

Not committed — the orchestrator stages and commits.
