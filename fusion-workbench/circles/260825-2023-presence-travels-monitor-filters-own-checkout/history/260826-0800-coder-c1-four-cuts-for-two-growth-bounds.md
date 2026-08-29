# C-1 — Four cuts, two growth-bounded surfaces

**Status:** Complete
**Agent:** coder
**Filed by:** coder, Kai Stalmann <ks@qantr.com>
**Checkout:** 5e8248d7
**Date:** 2026-08-26 08:00
**Circle:** 260825-2023-presence-travels-monitor-filters-own-checkout
**Analysis:** `260826-0715-cut-candidates-for-two-growth-bounded-surfaces.md` sections 3, 5 and 6

## What was cut, and what stopped being checked

Four cuts, exactly the subset the user authorised at the gate. Nothing from the report's
reserve list (its hook-test candidates 4 through 8) was taken.

### 1. `hooks/lib/__tests__/guard-bash-integration.test.ts` — the revert-strategy block, 89 lines

The whole `describe("the revert strategy is allowed, and it reverts")`, its banner, the
`initRepo` helper and the `SHELLS`/`REVERT_TARGET` constants, plus the four imports the
block was the only user of (`spawnSync`, `existsSync`, `readFileSync`, `writeFileSync`).

**Stopped being checked:** that `git checkout HEAD -- <path>` really puts a dirtied file
back when run through `/bin/bash` and `/bin/zsh`, and the case at the end of the block that
watched for a revert which "restored" the file by deleting it. The effect half never called
`runBash`, so no fusion code was in its path — it measured git's own semantics — and the two
shells existed only for that half, because the hook receives a JSON payload and never a
shell.

**Still covered:** the verdict, which is the part fusion can break. The innocuous-command
case now carries both spellings — `git checkout HEAD -- notes.txt` was already in the list
and `git checkout HEAD -- .` was added — and asserts that the whole run leaves
`.guard-state/` untouched. The file header records the removal and what went with it.

### 2. `hooks/lib/__tests__/guard-project-config-integration.test.ts` — the retired-FILE block

The whole `describe("a retired FILE is named, with the migration it needs")` and its banner.

**Stopped being checked, in this file:** that the migration advisory names the leftover
file by absolute path, says `is no longer read`, names `orchestrator.maxTurns` and the
destination filename, says `first` and `Then delete this file`, is probed rather than
parsed on invalid JSON, and is ordered ahead of a complaint about the file that is read.

**Still covered:** `config.test.ts` `describe("a retired FILE is named, with the migration
it needs")` holds every one of those phrases, case for case, under the same titles — and one
more this file never had, that the retired file's budget does not reach the effective
config. What this file uniquely proves is the transport claim: a loader diagnostic becomes a
visible `guard_advisory` on a real subprocess. That claim is one assertion and the two
surviving groups here make it twice, for an unparseable file and for a retired key.

### 3. `hooks/lib/__tests__/guard-project-config-integration.test.ts` — the harness-capability block

The whole `describe("harness capabilities the project-configuration cases depend on")`, its
banner, and the now-unused `RETIRED_CONFIG` constant.

**Stopped being checked:** directly, that `withProject`'s `files` option adds a path outside
the seed set, replaces one inside it and leaves the rest of the seed intact; and the explicit
`expect(PROJECT_CONFIG).not.toBe(RETIRED_CONFIG)`.

**Still covered, by consequence rather than by assertion:** a `files` option that dropped the
caller's file would leave every configuration case below with no configuration and an empty
advisory list where each asserts an exact one. A harness that seeded the retired filename
would add one advisory to every project in the suite, which is exactly the regression
`260816-2122_*_step-9s-harness-reduction-deletes-four-fixtures-guard-bash-integration-still-imports.md`
recorded and which `guard-bash-integration.test.ts`'s "records the allow in a
project that HAS a valid configuration file too" asserts against with an exact
single-element event list. That case survives cut 1. This is the weakest of the three cuts
and the report ranked it third for that reason; no coverage of the product is lost.

Cuts 2 and 3 together: 173 lines, net of a 13-line addition to the file header recording what
left and why.

### 4. `agents/orchestrator.md:628` — the absolute-pathspec derivation, 915 bytes

**Stopped being told, in the prompt:** that `fusion-commit-lock with` resolves the workbench
root by walking up from the call site; the three-way distinction between the caller's
directory, the git toplevel and the workbench root; that a toplevel-relative staging list
exits 128 with nothing staged; and the scratch-repository measurement behind that.

**Still says it:** `rules/commit-lock.md` `### Helper`, the paragraph headed **`with`
performs a `cd`**, which `bin/fusion-rules orchestrator` emits on every dispatch. The
operative instruction ("write every path out absolute"), the `bin/fusion-commit-lock`
citation and the "not repaired with a directory argument or `-A`" clause all stand, the last
because it belongs to step 4's own shape rule rather than to the lock.

## Measured deltas

| Surface | Before | After | Delta |
|---|---|---|---|
| hook-test lines | 20 375 | 20 113 | **-262** |
| `agents/` bytes | 417 695 | 416 780 | **-915** |

Per file: `guard-bash-integration.test.ts` 393 → 304, `guard-project-config-integration.test.ts`
423 → 250, `agents/orchestrator.md` 162 877 → 161 962.

## What was not touched

- **No baseline moved.** `TEST_LINE_BASELINE`, `AGENT_BASELINE` and `SKILL_BASELINE` in
  `hooks/lib/__tests__/surface-growth-bound.test.ts` are byte-identical to HEAD
  (`git diff --stat` on that file is empty). Head room here comes from the falling total, per
  `hooks/lib/__tests__/helpers/growth-bound.ts` `## Re-baselining`.
- **`BASELINE` in `reference-resolution-lint.test.ts` was not re-approved** and did not need
  to be: the rewrite of line 628 keeps its one plugin-path token and adds no heading anchor,
  so `paths: 1424, anchors: 196` still resolves. That file is unmodified.
- `hooks/lib/__tests__/fixtures/surface-growth.golden` was regenerated, not hand-edited, and
  its diff is exactly the four numbers above plus the two totals.
- No whole-tree git command was run. Nothing was staged and nothing was committed.

## Verification

`cd hooks && npm test` — exit 0. 43 test files, 749 tests, all passing.
