# The after-measurement command cannot see the 320 lines the build change added

---

Step 14 re-runs step 1's measurement block verbatim and produces the Circle's closure arithmetic
from it. Its hook-source row is `cat hooks/*.ts hooks/lib/*.ts | wc -l`. The inserted step P-3b
(`332267a`) added 320 lines of hook code in files that glob cannot match, all of them `.mjs`. The
closure note will therefore report a hook-source shrink that is 320 lines larger than the one this
Circle produced.

---

**Severity:** Medium — the Circle's own closure criterion is a before-and-after measurement, and this one overstates by 320 lines.
**Domain:** code
**Filed by:** `coderev`, reviewing `7c12d6a..5d29b6d` (`260815-1251-coderev-turn-2-build-churn-and-stash.md`)
**Owner:** `coder` at step 14, or `planner` if the annotation is written into step 14 first
**Affects:** `260815-0029_*_plan-remove-eight-mechanisms-and-cap-growth.md:142-166` (step 1's block), `:330-334` (step 14)
**Cross-references:** `260815-1247_*_the-inserted-step-p-3b-is-in-no-plan-and-in-no-turn-log-only-in-the-event-stream.md` (`ontorev`) — why the plan has no step that added these lines

**Verified 2026-08-15 at HEAD `5d29b6d`.**

## Measured

```
$ wc -l hooks/scripts/*.mjs hooks/vitest.config.mjs
     205 hooks/scripts/build.mjs
      48 hooks/scripts/run-tests.mjs
      67 hooks/vitest.config.mjs
     320 total

$ cat hooks/*.ts hooks/lib/*.ts | wc -l
    6945
```

The step-1 "before" reading was taken at `d78dfb7`, before P-3b existed, at 7 934 lines. The step-14
"after" reading will be 6 945 and the delta will read as −989. The real change to hook code over the
Circle is −669.

## The extension is not an accident and must not be corrected by changing the glob's target

`hooks/scripts/build.mjs`'s header states why `vitest.config.mjs` is `.mjs` rather than `.ts`:
`tsconfig.json` `include` is `["*.ts", "lib/**/*.ts"]`, so a `.ts` config would be compiled into
`hooks/dist/` and shipped, and excluding it there would leave the build's orphan prune unable to
tell a deliberately unbuilt source's stale output from a concurrent run's fresh one. The file
extension is load-bearing. `hooks/scripts/` is outside the `include` for the same reason.

So the two available repairs are both in the measurement, not in the tree:

1. Keep the command verbatim, as step 1 requires, and annotate the delta in the closure note —
   step 14 already asks for exactly this in the other direction (*"Where a figure moved for a reason
   other than this Circle's removals, say so"*). This is the inverse case: a figure that did **not**
   move for a reason.
2. Add a second, separately labelled line for the `.mjs` build scripts and report both.

Option 1 is enough and costs one sentence. What is not acceptable is a table with a −989 delta and
no note, because the closure criterion the Circle record sets is a before-and-after measurement, and
a number nobody can reconcile against the tree is the thing that criterion exists to prevent.

## Two rows that are correct and worth not re-deriving

- **Hook tests are counted correctly.** `332267a` grew `fusion-commit-lock.test.ts` by 236 lines and
  `monitor-warnings-panel.test.ts` by 120, and both are `.ts` under `hooks/lib/__tests__/`, which
  `cat hooks/lib/__tests__/*.ts hooks/lib/__tests__/helpers/*.ts | wc -l` reads. Current: 21 676
  lines across 45 test files.
- **`bin/*` is counted correctly.** `bin/fusion-churn-rank` (66 lines) left the tree and the glob
  sees its absence. Current: 3 467 lines.

## Related

- `260815-0029_*_plan-remove-eight-mechanisms-and-cap-growth.md` step 1 (line 142), step 14
  (line 330)
- `260815-1133-coder-hooks-suite-concurrency-safety.md` — the run that added the three files
- `_t_circle.md` `## Closure criterion` — the before-and-after measurement

---
Resolved: step 14 keeps the command byte-identical, since a reworded command makes before and after incomparable, and carries the obligation in the closure note instead. It names `build.mjs` (205), `run-tests.mjs` (48) and `vitest.config.mjs` (67), 320 lines together, with the arithmetic: apparent -989, real -669.
