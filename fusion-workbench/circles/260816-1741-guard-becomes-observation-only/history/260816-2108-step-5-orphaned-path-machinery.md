# Step 5 — the orphaned path machinery goes, in part

**Date:** 2026-08-16
**Agent:** coder
**Status:** Complete — the step is executed in part and the remainder is filed, not left silent
**Plan:** `circles/260816-1741-guard-becomes-observation-only/planning/260816-1915_p_the-compliance-guard-becomes-observation-only.md`, step 5
**Predecessor commits:** `05d848b` (step 1), `2f624ca` (step 2), `9c79202` (steps 3 and 6), `ec3b6ad` (step 4)

## What the step asked for

Delete `hooks/lib/project-relative.ts` and its test file, reduce `hooks/lib/paths.ts` to
`foldCase`, rewrite the `paths.ts` module header, and record why these deletions are taken
although step 4 kept `isFusionPluginRoot` on a comparable argument.

## What landed

`hooks/lib/project-relative.ts` and `hooks/lib/__tests__/project-relative.test.ts` are deleted.
`hooks/lib/paths.ts` is untouched.

## The measurement that decided both halves

The dispatch asked for grep before and after rather than trust in the plan's caller table, and
the two halves came out differently.

### `project-relative.ts` — no surviving importer

Before, over `hooks/**/*.ts` excluding `dist/` and `node_modules/`, four hits. One import
(`lib/__tests__/project-relative.test.ts:2`), one definition (`lib/project-relative.ts:2`), and
two occurrences of the English phrase "project-relative spelling" in prose comments
(`session-start.ts:26`, `lib/config.ts:129`). The last caller in shipped code,
`guard.ts:96`, went with step 2 at `2f624ca`, exactly as the plan said.

After the two deletions, three hits: the two prose occurrences, which name a coordinate space
rather than the module, and `lib/__tests__/surface-growth-bound.test.ts:284`, which is the
deleted test file's entry in the growth baseline map. Step 10 re-arms that map. No importer
survived, so the deletion stands.

### `paths.ts` — three of four functions still have a caller

Per-export grep at `ec3b6ad`:

| Export | Caller | Removed by |
|---|---|---|
| `globToRegex` | `paths.ts:66`, inside `matchesPattern` | — |
| `matchesPattern` | `paths.ts:96`, inside `matchesAny` | — |
| `matchesAny` | `lib/config.ts:155` (import), `:736` (`findRelevantDecisions`) | step 7a |
| `collapseSegments` | none | step 2, landed |
| `foldCase` | `tracker.ts:101`, `:306`, `:307` | — |

Step 5's prose says the four "lose their last caller when CHECK 3 and the path normalisation
go". That holds for `collapseSegments` and for none of the other three. The plan's own
`## Current State` table names the correct site, `config.ts:736`, and `findRelevantDecisions` is
deleted in step 7a — which is not landed and sits behind a user gate on two open questions.

Reducing `paths.ts` now would fail the compile at `lib/config.ts:155`, and by the mechanism
`260816-2032_c_*` already measured on this Circle the build's prune never runs when the compile
throws: `scripts/build.mjs` calls `buildToStaging()` before `syncIntoDist()`. The step's own
verification is that the prune happens, so it would be unreachable.

`collapseSegments` alone is genuinely orphaned. It was still not deleted, for two reasons that
are about the shape of the change rather than about the compile. `lib/__tests__/paths.test.ts`
imports it at `:7` and devotes `:124-131` to it; that file is green today, is named by no step
in the plan, and the dispatch forbade touching any test file but the one whose subject was being
deleted. And the mandated header rewrite could not have told the truth afterwards: the header
explains a trailing-separator asymmetry between `collapseSegments` and the matchers, and with
the matchers still standing that explanation still has a side.

Filed as `circles/260816-1741-guard-becomes-observation-only/issues/260816-2108_o_step-5s-paths-reduction-depends-on-step-7a-not-step-2.md`,
with three workable orders and one further finding: step 9's edit list is missing
`lib/__tests__/paths.test.ts`, whose four matcher groups lose their subject whenever the
reduction does land.

## The asymmetry with `isFusionPluginRoot`

Step 4 kept `isFusionPluginRoot(dir)` with no caller. Step 5 deletes `project-relative.ts`,
which could have been argued for on the same ground — it carries a worked account of the
coordinate space a written path has to be normalised into before a reader matches it, and any
future path-matching mechanism would want that account.

The difference is not the strength of the argument. It is that for `isFusionPluginRoot` someone
made it, in a decision record that names the function and states the reason, so deleting it
would overrule a recorded answer. Nothing comparable exists for `project-relative.ts` or for the
four `paths.ts` functions. A module kept on an argument nobody wrote down is a module nobody can
later decide is finished with, which is the failure mode the rest of this Circle exists to
undo. Recorded in the plan's step 5 entry as well, because the plan is where the next executor
looks.

## Verification

| Command | Exit |
|---|---|
| `cd hooks && npm run build` | 0 |
| `cd hooks && npx vitest run lib/__tests__/staging-drift.test.ts lib/__tests__/review-coverage.test.ts` | 0, 40 passed |
| `cd hooks && npx vitest run` (full suite, before and after) | 1 both times, as expected |

`hooks/dist/lib/` held 26 files before and 24 after. The two that went are
`project-relative.js` and `project-relative.d.ts` — the prune ran, which is the step's stated
verification for the half that landed.

The two pinned suites were asked for because `tracker.ts` is now the last consumer of
`foldCase` and those two files pin the measurements it feeds. Both green, 40 cases.

## Test-surface delta

| | Before | After |
|---|---|---|
| Test files | 40 | 39 |
| Test cases | 752 | 724 |
| Red files | 11 | 11 |
| Red cases | 44 | 45 |

`project-relative.test.ts` was **green** on the way in, not red, so the dispatch's expectation of
"10 red files after" does not follow — the red set is unchanged in membership and the file and
case totals drop by 1 and 28 respectively.

The one new red case is in `surface-growth-bound.test.ts`, already red on the way in and now
red twice: its "carries no baseline entry for a file that is gone" case names
`hook-tests: project-relative.test.ts`, and its golden case reports the `hook-tests` surface
shrinking from 20 046 to 19 894 lines. Both are step 10's subject, and step 10 is the moment the
growth-bound rule permits a baseline to move. No other test file changed state.

## Not done

- `hooks/lib/paths.ts` is unreduced and its header is unrewritten. See the filed issue.
- `README-hooks.md` still carries `lib/project-relative.ts` in its `hooks/lib` table and cites
  it at `:150` and `:246`. Out of scope by the dispatch; step 11 rewrites that table in one
  change, and `derivable-enumerations-lint.test.ts` stays red over it in the meantime, as it
  already was for `lib/escalation.ts`.
- Nothing committed.
