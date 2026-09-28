# Step 13 — Extend the failing cap to `agents/`, `skills/` and the hook test lines

**Agent:** coder
**Status:** Complete
**Plan:** `260815-0029_*_plan-remove-eight-mechanisms-and-cap-growth.md`, step 13
**Started from:** HEAD `e8052e7`, suite green at 39 files / 739 tests in 59.8 s
**Verification:** `cd hooks && npm test` — exit 0, 40 files / 751 tests in 62.8 s

## What the step did

Three surfaces that nothing bounded now fail the suite when they grow past their own head-room:
`agents/*.md` and `skills/*/SKILL.md` in bytes, the hook test suite in lines. The instrument is the
one armed on 2026-08-14 over the always-on rule corpus, extended rather than reinvented: the
arithmetic moved into a shared helper both test files import, and each surface calls it with its own
baseline map and its own separately derived head-room.

It is the last substantive step by construction. Arming before the removals would have baselined
these surfaces at their pre-removal size and handed the Circle its own savings back as head-room.

## Four independent budgets, not one

The `conceptrev` verdict on the plan's diagram flagged exactly the failure mode this had to avoid: a
shared budget where growth in one surface is paid for by shrinkage in another. `growth()` takes the
baseline map and the head-room as **arguments**, so no surface can see — or spend — another's
numbers, and each surface has its own `it` and its own failure message. The property is asserted
directly (`keeps the budgets independent — one surface's shrink cannot pay for another's growth`):
`agents/` blown past its bound stays blown while every skill body is emptied to zero.

## Where each head-room came from

`git log` was replayed commit by commit over the same window the 12 000-byte rules figure came from,
2026-05-05 (the repository's first commit) to 2026-08-05 — 337 commits — re-measuring each surface at
each one. Each commit's growth was split into growth in files that already existed and files that
arrived, so the "honest single commit" figures describe prose growth rather than a new file landing.

| Surface | Baseline (floor) | Worst measured day | Sustained rate | p90 / p95 commit | Head-room |
|---|---|---|---|---|---|
| `agents/*.md` | 399 843 bytes | +50 725 (2026-05-16) | 851 B/day | +7 216 / +12 082 | **18 000 bytes** |
| `skills/*/SKILL.md` | 220 439 bytes | +38 025 (2026-05-19) | 1 427 B/day | +6 976 / +10 456 | **20 000 bytes** |
| hook test lines | 19 453 lines | +5 247 (2026-08-04) | 129 lines/day | +532 / +793 | **2 500 lines** |

Each figure was picked for the same three properties that produced 12 000 for `rules/`: it sits
inside the surface's worst measured single day, so a run like that day trips on the day it begins; it
is two to three weeks of the surface's own sustained rate (21, 14 and 19 days respectively); and it
stands well above the 95th-percentile honest single-commit addition (1.5x, 1.9x, 3.2x).

The 12 000-byte figure was **not** transplanted. It was measured against `rules/`, whose calm rate is
800 bytes a day; `skills/` runs at nearly twice that and the hook tests are counted in a different
unit entirely.

Two derivation notes worth keeping:

- The hook-test **sustained rate is not a calm-stretch rate.** That surface has no honest calm
  stretch — it was three files until August, and the 2026-06/07 figure of 51 lines a day describes a
  suite that did not exist. The 129 lines a day used is existing-file growth over the whole window.
- Corroboration from **outside** the window, deliberately not used to set the figures: over
  2026-08-05 to 2026-08-15 `agents/` gained 10 989 bytes a day with a peak day of +66 803, `skills/`
  1 029 a day with a peak of +28 367. Every head-room sits well inside those peaks, so none is slack.

## The motivating measurement, re-taken rather than quoted

The Circle record's headline figures (agents +38 %, hook tests +47 %) were taken against a different
anchor, so they were re-measured from `git` at the arming and the file states the re-measured ones.
Over the ten days from 2026-08-05 to the Circle's start (`9a7da8e`):

| Surface | 2026-08-05 | 2026-08-15 (`9a7da8e`) | Change |
|---|---|---|---|
| `agents/*.md` | 289 958 B | 460 292 B | **+59 %** |
| hook test lines | 19 838 | 25 897 | **+31 %** |
| `rules/*.md` | 170 835 B | 154 092 B | **-10 %** |

The one surface the old cap still covered is the one that shrank. That is the finding the step rests
on, and it holds on the re-measured numbers as well as the record's.

## The arming, recorded per the 2026-08-14 precedent

Governing record:
`260814-0738_*_how-is-the-always-on-growth-bound-armed-when-the-corpus-is-already-over-budget.md`
(option 1). The arming log lives in the header of `hooks/lib/__tests__/surface-growth-bound.test.ts`
and states three things the precedent asks for.

**No bytes and no lines were removed by the arming itself.** What the removals did, measured at
`9a7da8e` and at `e8052e7`: `agents/` 460 292 -> 399 843 (-60 449), `skills/` 294 134 -> 220 439
(-73 695), hook tests 25 897 -> 18 799 lines (-7 098).

**What the arming absolves,** written as text so it survives the numbers moving: these surfaces were
never bounded, so the baselines absolve everything they accumulated before today, including growth
this Circle did not remove. Two parts are named — the 356 test lines the inserted step 3b added
(`fusion-commit-lock.test.ts` +236, `monitor-warnings-panel.test.ts` +120) are inside the hook-test
baseline, and `agents/orchestrator.md` stands at 139 859 bytes, 35 % of its whole surface, taken as
it is.

**One surface grew because of the arming**, and the file says so: this step's own 699 lines
(573 of test file plus 123 of helper, less the 45 the shared instrument took out of
`rules-emission-golden.test.ts`) are inside the surface they bound. A bound that exempted its own
instrument would be granting itself the one exemption it exists to refuse.

`RELEASE_CAP` and `DRIFT_CEILING` were not touched, not copied and not imitated. They are historical
facts about what `origin/main` once shipped in rule text and say nothing about prompts or tests.

## What no bound covers, stated rather than left to be found

The hook-test surface counts `.ts` files in the suite directory and its `helpers` directory. The
three `.mjs` files step 3b added — `hooks/scripts/build.mjs` (205 lines),
`hooks/scripts/run-tests.mjs` (48) and `hooks/vitest.config.mjs` (67), 320 lines together — are hook
scripts, not tests, and fall outside every surface. After this step nothing bounds them, and nothing
bounds `hooks/*.ts`, `hooks/lib/*.ts`, `bin/`, `docs/` or the READMEs either. The test file header
and `README-hooks.md` both say so. Extending a surface to reach them is a decision nobody has made;
arming a bound on a corpus nobody measured is the one thing the instrument's own rule forbids.

## The add-back proof

A cap nobody has seen fail is a cap nobody knows works. Four falsifications were run live and
reverted; the working tree was confirmed clean after each.

| # | Add-back | Result |
|---|---|---|
| 1 | one byte appended to `agents/coder.md` | golden red — `The 'agents' surface changed`; the bound stayed green, which is correct at +1 byte |
| 2 | 18 001 bytes appended to `agents/coder.md` | **full suite red**: 1 file failed of 40, 2 tests of 751. `agents/*.md has grown 18 001 bytes past its baseline, which is 1 beyond the 18 000 of head-room` |
| 3 | 20 001 bytes appended to `skills/commit/SKILL.md` | bound red: `20 001 bytes past its baseline … 1 beyond the 20 000 of head-room` |
| 4 | 2 501 lines appended to `hooks/lib/__tests__/paths.test.ts` | bound red: `2 501 lines past its baseline … 1 beyond the 2 500 of head-room` |

Falsification 2 was run against the whole suite deliberately: the claim is that an add-back fails
`npm test`, not that it fails one file. After the reverts, `npm test` is green at 40 files / 751
tests.

The synthetic block at the foot of the test file proves the same behaviours on invented sizes, so no
future run has to bloat a shipped prompt to see a bound fire.

## Where the shared instrument went, and why not into `hooks/lib`

`hooks/lib/__tests__/helpers/growth-bound.ts`. Two reasons, either sufficient:
`derivable-enumerations-lint.test.ts` holds `README-hooks.md`'s `hooks/lib` table in exact set
equality with `hooks/lib/*.ts`, so a module at the top of `lib/` would need a documented row in this
commit — and a test helper does not belong in that table. And `hooks/tsconfig.json` excludes
`lib/__tests__`, so nothing here compiles into `hooks/dist/` and the build's orphan prune never sees
it.

The helper carries the `Sized` and `Growth` shapes, `growth()`, `grownLines()`, `fmt()` and the
**authoring home** of the two-events re-baselining rule. `rules-emission-golden.test.ts` keeps a
pointer to it plus its own cut log; its per-file field was renamed `bytes` -> `size` and the `Growth`
total `bytes` -> `total`, because one of the four surfaces is counted in lines and a unit-specific
field name would have lied about it. The file's behaviour is unchanged and its 15 tests still pass.

## Judgement calls named

- **The window.** The plan directs the replay over the same window the rules figure came from
  (2026-05-04 to 2026-08-05), and that is what set the figures. The post-window rates are far worse
  and are recorded as corroboration only. Deriving from them would have produced tighter bounds than
  the plan asked for.
- **The record's percentages were not restated as measurements.** They did not reproduce against
  `9a7da8e`, so the file carries the re-measured figures and says the record's were taken against a
  different anchor. Per `rules/critical-stance.md` §3, an unverified number is not repeated as a
  verified one.
- **`CLAUDE.md` got a new Conventions bullet, not a Layout row.** Gate G1 has passed, and this step
  adds a mechanism a developer meets as a red suite while editing `agents/` or `skills/`. Nothing in
  `CLAUDE.md` became false; the bullet is an addition, and it points at
  `README-hooks.md` `### Growth bounds on the shipped text` rather than restating the numbers, so
  there is one place for the figures to go stale instead of two.
- **A README phrasing was changed for the lint, not for style.** `reference-resolution-lint` parses
  a path token ending in `__tests__/` as the non-existent `hooks/lib/__tests`, so the sentence names
  the `helpers` directory instead. The lint is right that the token does not resolve; the wording is
  what moved.

## Files written

- `hooks/lib/__tests__/helpers/growth-bound.ts` (new, 123 lines)
- `hooks/lib/__tests__/surface-growth-bound.test.ts` (new, 573 lines)
- `hooks/lib/__tests__/fixtures/surface-growth.golden` (new, generated)
- `hooks/lib/__tests__/rules-emission-golden.test.ts` (refactored onto the shared helper, 1 204 -> 1 159 lines)
- `README-hooks.md` (new `### Growth bounds on the shipped text`)
- `CLAUDE.md` (new Conventions bullet)

No file was deleted or moved, so neither `git rm` nor `git mv` was used. Nothing was committed; the
orchestrator commits.
