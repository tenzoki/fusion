# coder — growth-bound header figures and the walk comment

**When:** 2026-08-16 00:34
**Status:** Complete
**File:** `hooks/lib/__tests__/surface-growth-bound.test.ts` (the only file touched)
**Sources:**
- `260815-1939_*_the-caps-rate-and-percentile-inputs-do-not-reproduce-from-git-while-every-point-figure-does.md`
- `260815-1941_*_the-after-measurements-rules-before-row-was-taken-two-days-after-the-anchor-its-two-neighbours-use.md`
- `260815-2329_*_the-growth-bound-walks-comment-misstates-what-vitest-runs-and-the-fixtures-question-was-left-to-the-filter.md`

## What changed

**1. The head-room derivation now rests on the one property that reproduces.**
`## Where each head-room comes from` previously justified each figure by three
properties: worst measured day, "two to three weeks of the surface's sustained
rate", and "above the p95 honest single-commit addition", with a per-day
corroboration rate for 2026-08-05..08-15 underneath. Only the first reproduces.
The section now states the worst-day property alone, names the replay method
that produces it, and carries a paragraph saying which claims were dropped and
why, so nobody restores them from an older commit. **No baseline constant and no
head-room value moved** — 18 000 / 20 000 / 2 500 are unchanged.

**2. The `rules/` before-figure was taken at the wrong anchor.** The paragraph
claims all four figures were measured over 2026-08-05 to `9a7da8e`. Three were;
the `rules/` before-value 170 835 is the 2026-08-07 tree. Corrected to 166 610
(-7.5 %), and both anchor commits are now named in the sentence.

**3. The walk comment stated a false criterion.** It said vitest's include runs
"a `.ts` file at ANY depth under `__tests__/`". It does not: `vitest.config.mjs`
declares no `include`, so the default `**/*.{test,spec}.?(c|m)[jt]s?(x)` applies
and a plain `.ts` is collected by nothing. The comment now states what vitest
actually collects, names the criterion the walk uses instead (what the suite's
tree costs to maintain and to run), and answers the `fixtures/` question left
open by the original record: `fixtures/` is inside the walk, and its goldens fall
out for not being TypeScript anybody maintains, so a hand-written `.ts` fixture
would count.

## Measurements taken for this change

All from `git` in this checkout, day-end snapshot replay over the linear history
(`git log --merges` is empty in the window, so consecutive diffing is valid):

| Figure | Result |
|---|---|
| `rules/` at `66e4a698` (last commit of 2026-08-05) | 166 610 bytes, all `.md` |
| `rules/` at `9a7da8e` | 154 092 → -12 518, **-7.5 %** |
| `agents/` 289 958 → 460 292 across the same pair | exact, +59 % |
| hook test lines 19 838 → 25 897 | exact, +31 % |
| `agents/` worst day | +50 725 (2026-05-16) exact |
| `skills/` worst day | +38 025 (2026-05-19) exact |
| hook-test worst day | +5 247 (2026-08-04) exact; +4 026 on 2026-08-01 exact |
| August peak days | `agents/` +66 803 (08-11), `skills/` +28 367 (08-10) exact |
| window shape | `b05b423` (2026-05-04) .. `66e4a698`: 340 commits, 40 commit-days, 0 merges |
| unreproducible rates | `agents/` 17 033 B/day vs stated 10 989; `skills/` 8 398 vs 1 029 |
| `agents/playmaker.md` at arrival | 18 170 bytes exact |

`npx vitest list` was verified against a scratch root holding a copy of
`hooks/vitest.config.mjs` and four probe files. `lib/__tests__/top.test.ts` and
`lib/__tests__/unit/probe.test.ts` were collected; `unit/probe.ts` and
`helpers/aid.ts` were not. The probe root was outside the repository so no
concurrent run in this checkout could see it.

## Line delta

576 → 574 lines, **-2**. The hook-test surface measures 19 451 against the
golden's 19 453. The golden was deliberately NOT regenerated — the orchestrator
does that once at Turn end, and other tasks are editing bounded surfaces
concurrently.

## Verification

- `cd hooks && npm test` — exit 1. One failing test, 750 passing: `surface
  growth bounds > matches the checked-in golden, surface by surface`. Its printed
  diff is the `skills` block (223 802 → 225 526, six skill bodies edited by
  concurrent tasks), which is not this change; the assertion loops surface by
  surface and stops at `skills` before reaching `hook-tests`. The bound
  assertions themselves all pass.
- `npx vitest list --root <scratch>` — exit 0, output as above.
