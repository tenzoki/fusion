# Setup Step 5 tolerates an absent `bin/fusion-count-sources`

**Agent:** coder
**Session:** dispatched by orchestrator, session `260810-1402`, Turn 1, task `I:260810-0352-helper-absence` (task 2 in `tasklist.md`)
**Status:** Complete
**HEAD at start:** `430d73a` (dispatch); `e0acdb6` at the time of writing — two other agents committed to this repository during the task, neither in this file set.

---

## What was asked

Realise decision `shared/decisions/260810-0921_a_how-should-a-prompt-call-a-bin-helper-that-the-installed-copy-may-not-have.md`
option **(a1) tolerate and report**, against defect record
`shared/issues/260810-0352_o_setup-step-5-now-calls-a-helper-the-installed-copy-does-not-have.md`.

`agents/orchestrator.md` Setup Step 5 called `"$FUSION_PLUGIN_ROOT/bin/fusion-count-sources"` bare.
`$FUSION_PLUGIN_ROOT` is exported by the SessionStart hook, points at the installed copy of the
plugin and is pinned for the whole session, so a helper that exists only in the work tree between
releases is absent for a session running against an older install. Bare, that is exit 127 at the
orchestrator's own Setup.

## What was changed

One file: `agents/orchestrator.md`, Setup Step 5.

1. **The call site is guarded.** The bare invocation became an `[ -x ]` test with an else branch
   that prints the helper's own absent-count output shape — `code_files=unavailable`,
   `data_files=unavailable`, `counted_by=none` — and one line on stderr naming the reason. The
   guard exits 0, so no shell 127 reaches the user. `-x` rather than `-f` covers a present but
   non-executable file too, which would otherwise be exit 126.

2. **A paragraph explains why the guard is there**, so a later editor does not read it as
   defensive noise and remove it: it is a third route into the absent-count shape the cascade was
   already built for, and it explicitly says **do not add a cascade branch for it** — the reason
   differs between the three routes, and the reason is reported rather than branched on. It cites
   the decision record and notes that parts (b) and (c) stay open there.

3. **The absent-count prose was widened from one reason to three.** It previously said the count
   "could not be taken because the project is not under git", which was already incomplete against
   the helper's own header (exit 2 has two causes) and is now wrong by one more. It now requires
   the orchestrator to name *which* reason applies, and for the absent-helper case to say
   `fusion --update` and restart.

## What was deliberately not changed

- **The cascade.** Not one branch moved. `counted_by == "none"` is still the single first branch
  and still resolves to `code`. Commit `31d8bb3` built that branch for exactly this shape; the
  defect was a call site that never reached it. Verified by re-listing the branches after the edit.
- **`skills/setup/SKILL.md`.** Its Step-5 line (`:227`) delegates the heuristic to
  `agents/orchestrator.md` by citation and carries no helper call of its own, so the guard arrives
  with the block it cites. No matching word was needed and none was added.
- **`CLAUDE.md`.** The line stating that the hooks do not get the work-tree treatment stands
  untouched, per the decision's answer.
- **Parts (b) and (c) of the decision** — a uniform guarded-call convention for prompt-called
  helpers, and extending the work-tree preference to helper resolution — remain open and out of
  scope.

## Verification

| # | Acceptance criterion | How it was checked |
|---|---|---|
| 1 | Setup completes against an install lacking the helper | Ran the guard with `FUSION_PLUGIN_ROOT` pointed at a scratch plugin root with an empty `bin/`. Exit 0. |
| 2 | Reports `counted_by=none` with the reason named | Same run: the three `KEY=value` lines on stdout, the reason line on stderr naming the root. |
| 3 | Resolves the domain to `code` | The `counted_by == "none"` branch is unmoved and unchanged; re-listed the cascade after the edit. |
| 4 | No shell exit 127 reaches the user | The absent run exits 0. A third run against a present-but-mode-644 helper also exits 0, so 126 is covered too. |
| 5 | The existing branch is reused, not duplicated | One `counted_by == "none"` branch in the cascade; the second grep hit is the prose paragraph that pins its position. |
| 6 | `cd hooks && npm test` green | 39 files, 1040 tests, exit 0, 126s. Includes `domain-cascade-order-lint.test.ts`, which reads this exact fenced block. |

**A first full run failed one test** — `fusion-commit-lock.test.ts`, "a creator reaped between mkdir
and its holder write loses the acquisition". It is load-induced flake, not a regression: the test
builds its own project root under `mkdtemp` and never reads the real workbench, it passes alone in
11.6s, and the failing run took 197s against a stated ~90s baseline because two other agents were
working in this repository concurrently. The clean re-run is the one reported above. Worth noting
that the test polls with a wall-clock threshold, so it will keep failing under a loaded machine.

## Files changed

- `/Users/k1/Projects/productive/fusion/agents/orchestrator.md`
- `/Users/k1/Projects/productive/fusion/fusion-workbench/shared/issues/260810-0352_o_setup-step-5-now-calls-a-helper-the-installed-copy-does-not-have.md` (`Resolved:` note appended; marker left `_o_` for the orchestrator to rename after the commit)
