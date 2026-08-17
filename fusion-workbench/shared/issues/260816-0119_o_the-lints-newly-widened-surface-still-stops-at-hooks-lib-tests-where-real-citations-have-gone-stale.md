The lint's newly widened surface still stops short of `hooks/lib/__tests__/`, where real citations have gone stale
---
Item 3 of session `260816-0119` carried the reference lint's reasoning from `hooks/lib/*.ts` up to
the top-level `hooks/*.ts`. The same reasoning applies one directory *down* — `hooks/lib/__tests__/`
carries record citations in module comments exactly like its two neighbours — and it was not carried
there, deliberately, because that directory is unlike them in one way that has to be settled before
it can be scanned.
---
**Severity:** Low — the citations are in test-file comments, so a stale one misleads a reader rather
than breaking behaviour. It is the same class as `260811-1755`, which is why it is filed rather than
absorbed.
**Domain:** code
**Filed by:** coder, session `260816-0119`, while verifying that the four marker renames of that
session broke no shipped citation
**Owner:** coder
**Affects:** `hooks/lib/__tests__/reference-resolution-lint.test.ts` (its `surface()`), every
`hooks/lib/__tests__/*.ts`

## Measured, not inferred

Eleven files under `hooks/lib/__tests__/` carry at least one literal-marker record citation. Sweeping
all of them for citations whose record exists under no marker at all turned up **six that name real
records that have since moved**, against roughly two dozen that are synthetic fixtures
(`990101-0101_o_never-existed`, `260510-0930_a_token`, `260716-1910_p_plan-foo`, …). Two of the six
are worth naming because they are ordinary rot, not fixtures:

- `hooks/lib/__tests__/surface-growth-bound.test.ts:147` cites
  `circles/260815-0007-remove-eight-mechanisms-and-cap-growth/issues/260815-1251_o_the-after-measurement-command-cannot-see-the-320-lines-the-build-change-added.md`;
  that record is `_c_` and was already `_c_` before this session.
- Citations of `260806-0015_a_zitierform-…` remain, and that record reached `_i_`.

## Why it was not simply included

The directory is dense with **deliberately fabricated** citations, because fabricating one is how a
citation-parsing test states its input. Adding it to `surface()` as-is would fire on every fixture at
once. The existing machinery has two answers and neither is obviously the right one here:
`RECORD_EXAMPLE_FILES` exempts a whole file (correct for `rules/decision-record-examples.md`, far too
blunt for a test file whose comments carry real citations alongside its fixtures), and the pattern
exemptions key on slug shape (`foo`) or line context, which the fixtures do not uniformly satisfy.

So the question this record carries is not "widen it" but **what distinguishes a test's fixture
citation from a test's prose citation**, mechanically. A plausible answer — fixtures live in string
literals, prose lives in comments, and the surface already reads comment lines only — should be
measured before it is relied on: the six real ones above are all in comments, but so are some of the
fabricated ones.

## Related

- `shared/issues/260811-1755_*_stale-marker-citations-recur-and-the-lint-does-not-read-the-hook-entrypoints-where-one-was-hiding.md` — the same gap one directory up, closed in this session
- `shared/issues/260812-1720_*_the-reference-resolution-lint-does-not-scan-the-workbench-where-citations-are-densest.md` — the same gap in the other unscanned corpus
- `shared/decisions/260816-0119_*_can-anything-carry-the-rename-to-citation-obligation-when-a-record-marker-moves.md` — the upstream question about who follows a rename into the citing text

Also seen: 260817-1613 by reconciler — a second live instance in the same file, created by this session's own marker rename: `hooks/lib/__tests__/surface-growth-bound.test.ts:174` cites `circles/260816-1741-guard-becomes-observation-only/issues/260817-1032_o_two-of-the-three-bounded-surfaces-grew-through-this-circle-so-only-the-hook-tests-baseline-moves.md`, and that record moved to `_c_` in `dbbad70`. `npm test` is green (35 files, 653 tests) because `surface()` still stops at `hooks/lib/*.ts`, which is exactly the gap this record measures.

---
**Reconciliation 260817-1836** (reconciler, domain `code`). Re-verified reproducible at HEAD `2552586`: `hooks/lib/__tests__/reference-resolution-lint.test.ts` `surface()` still scans only `hooks/lib/*.ts` and top-level `hooks/*.ts`, and both stale citations the record names are still stale. Marker stays open. Log: `shared/history/260817-1836-reconciliation.md`.
