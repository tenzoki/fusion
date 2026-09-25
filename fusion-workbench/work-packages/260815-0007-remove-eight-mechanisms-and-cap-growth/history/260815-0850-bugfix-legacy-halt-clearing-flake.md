# Bugfix: the legacy-halt-clearing flake is the shared `hooks/dist`, not a timing window

**Date:** 2026-08-15 08:50
**Status:** Failed — diagnosed, not fixed. No honest minimal repair exists inside the file; the cause is under an open decision.
**Trigger:** User report, citing `coderev` finding in `260815-0804-coderev-plane-mirror-removal.md:223-229` and issue `260814-2118_*_the-hooks-suite-fails-differently-on-repeated-full-runs-and-does-so-on-clean-head.md`.

## Error

`hooks/lib/__tests__/legacy-halt-clearing.test.ts` fails 4 of its 6 tests in a full
`cd hooks && npm test` and passes 6 of 6 in isolation. The named assertion is a `clear-halt`
exit of 1 where 0 was expected.

## Root cause

**Shared state between concurrent runs of the suite in one checkout — `hooks/dist/`.** Not
order-dependence, not shared in-run state, not a race in the production code.

`hooks/package.json:10` — `"test": "npm run build && vitest run"`, and `:9` —
`"build": "rm -rf dist && tsc"`. A second `npm test` started in the same checkout deletes
`hooks/dist/` and takes one to two seconds to rebuild it. For that window the directory is
absent.

`lib/__tests__/legacy-halt-clearing.test.ts:90` spawns the live artifact —
`const CLEAR_HALT = resolve(HOOKS_DIR, "dist/clear-halt.js")` — with plain `node`, at four
points spread across the file's whole ~5 s runtime (two per trigger, in the second and third
case of each `describe`). With `dist/` absent the child is `MODULE_NOT_FOUND`, node exits 1,
and `expect(run.status).toBe(0)` at `:209` fails. Measured directly: with `dist` moved aside,
`node hooks/dist/clear-halt.js` exits **1** printing
`Error: Cannot find module '…/hooks/dist/clear-halt.js'`.

The first case of each `describe` never touches `dist` — it goes through `runWrite`, which the
harness spawns as `tsx guard.ts` from source (`helpers/guard-harness.ts:164-200`, default entry
mode `tsx`). That is why the count is **4 of 6** and not 6 of 6, and it is the fingerprint that
identifies this cause rather than a timing one.

Who runs the second `npm test`: `agents/orchestrator.md` Step 3a dispatches executors in
parallel batches whose *file sets* are disjoint, and each executor runs the project's full
verification command (`agents/coder.md:114`). Disjoint sources do not make the runs disjoint,
because `hooks/dist/` is shared build output every run destroys. That is stated, with its own
measurement, in the open decision
`260811-2009_*_is-the-hooks-suite-meant-to-be-run-concurrently-with-itself-and-if-not-who-serialises-it.md`
(case 2 of its Question section). The harness already carries the observation in a comment:
`helpers/guard-harness.ts:127-129`, "a second session running the suite in the same checkout
has been observed wiping it mid-run".

**It is not load.** Twelve full runs at HEAD: eight on an idle machine, all exit 0; four with
32 spin loops saturating all 16 cores, all exit 1 — and in all four the failure was
`fusion-commit-lock.test.ts`, never `legacy-halt-clearing.test.ts`. CPU pressure alone does not
reach this file.

## The reproduction

Deterministic, and it reproduces the record's assertion verbatim:

```
npx vitest run lib/__tests__/legacy-halt-clearing.test.ts &   # the run under test
sleep 0.6 && npm run build                                    # a second run's build step
```

Result: `AssertionError: expected 1 to be +0` at `legacy-halt-clearing.test.ts:209`, the two
`dist`-free cases green. How many of the four fail depends only on how much of the file's
runtime the wipe window covers; at 0.6 s it caught one, `coderev`'s run caught four.

## Fix

**None applied.** Three candidate repairs were considered and each was rejected on the
evidence:

| Candidate | Why not |
|---|---|
| Snapshot `dist/` to a temp dir in `beforeAll`, as `clear-halt-concurrent-halt.test.ts:127` already does | Shrinks this file's exposure from ~5 s to ~20 ms; does not remove it. A wipe landing during the copy turns four red tests into one errored file — the third failure shape the orchestrator already met. It also leaves `reference-resolution-lint.test.ts` (`:323`, `:381` — `existsSync(join(pluginRoot, token))` over citations naming `hooks/dist/…`) and `clear-halt-concurrent-halt.test.ts` exposed, so the suite would look greener without being more trustworthy. That is the damage the decision's Constraints section names. |
| Drop the `rm -rf` from `build`, or build to a per-run output | Touches the committed, shipped `dist/`. It is option 2 of the open decision, explicitly uncosted there, and its Constraints require the shipped output to stay exactly where it is. |
| Serialise `npm test` in the checkout | That is the "who serialises it" half of the open question. It is the user's call, not a repair pass's. |

The instrument cannot be made trustworthy from inside this test file. The decision record is
where the fix is chosen, and it is open.

## Verification

- [x] Original error resolved — **no**. Nothing was changed; the flake stands.
- [x] Full test suite passes — `cd hooks && npm test`, exit 0 on eight consecutive idle runs.
- [x] No regressions introduced — no file under `hooks/` was modified; `git status` clean.

## Unrelated issues found

None filed. Two findings were recorded onto the records that already own them rather than
opened as new ones:

- `260814-2118_*_…` — a measurement section separating the three causes now
  conflated in it. Marker unchanged.
- `260811-2009_*_…` — an evidence section, following the precedent of the
  reconciler's addition of 260811-2330. No option chosen, marker unchanged.

`fusion-commit-lock.test.ts`'s failure is a **different** cause — genuine wall-clock assumptions
in the harness, reproduced here 4 of 4 under CPU saturation. It is already recorded as
`260810-1135_*_a-timing-case-in-fusion-commit-lock-test-fails-under-load-and-passes-in-isolation.md`
and was not touched.
