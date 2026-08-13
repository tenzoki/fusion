hooks/staging-drift.ts has no row in README-hooks' Files table, and the enumeration lint covers only the lib/ half

---
`README-hooks.md`'s `## Files` table lists eight of the nine top-level `hooks/*.ts` entry points. `staging-drift.ts` is absent, while its two siblings `state-drift.ts` and `review-coverage.ts` each have a row. Section 5 of `derivable-enumerations-lint.test.ts` checks the `lib/*.ts` rows for exactly this drift and stops there, so nothing catches the top-level half — the same gap for `hooks/` that Turn 1's step 3 has just closed for `bin/`.
---

## Both sides read

**Documentation side**, `README-hooks.md:158-166`. Top-level `.ts` rows, in order: `session-start.ts`, `guard.ts`, `tracker.ts`, `clear-halt.ts`, `churn-rank.ts`, `turn-budget.ts`, `state-drift.ts`, `review-coverage.ts`. Eight.

**Artifact side**, `ls hooks/*.ts`: `churn-rank.ts`, `clear-halt.ts`, `guard.ts`, `review-coverage.ts`, `session-start.ts`, `staging-drift.ts`, `state-drift.ts`, `tracker.ts`, `turn-budget.ts`. Nine.

`hooks/staging-drift.ts` is real and shipped: it compiles to `hooks/dist/staging-drift.js`, which `bin/fusion-staging-drift:69` runs as its entry point.

The measurement module is documented — `README-hooks.md:178` carries a full `lib/staging-drift.ts` row — so this is the CLI entry point alone, and it is the one a reader looking up "what runs when I call `bin/fusion-staging-drift`" reaches first.

**Why nothing caught it**, `hooks/lib/__tests__/derivable-enumerations-lint.test.ts:340-352`:

```ts
const documented = [
  ...read("README-hooks.md").matchAll(/^\| `lib\/([A-Za-z0-9-]+\.ts)` \|/gm),
].map((m) => m[1]);
…
expect([...documented].sort()).toEqual(libFiles());
```

`libFiles()` reads `hooks/lib` only, and the regex requires the `lib/` prefix. Both directions are checked inside `lib/`; neither reaches `hooks/*.ts`.

## Found where

While verifying the authoring home cited by the new `bin/fusion-staging-drift` Layout row (`CLAUDE.md:45`). That citation itself is correct — `hooks/lib/staging-drift.ts` and `README-hooks.md:178` both exist and both describe the measurement.

## Scope

`README-hooks.md` (one missing row) and `hooks/lib/__tests__/derivable-enumerations-lint.test.ts` (an unchecked half). Both shipped.

## Recommended fix direction

Add the `staging-drift.ts` row next to its two siblings, phrased like theirs, then extend section 5 to a second assertion over the top-level entry points: derive `hooks/*.ts` with `readdirSync`, parse rows of the form `` | `<name>.ts` | ``, diff both directions, with the same non-vacuity floor the existing check carries. The `bin/` roster block added in commit `79ec7bb` is the working template.

Filed by: coderev (review of Circle Turn 1, range `6590cd5..79ec7bb`).
