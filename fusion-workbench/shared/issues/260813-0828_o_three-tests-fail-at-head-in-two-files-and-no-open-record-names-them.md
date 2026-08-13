# Three tests fail at HEAD in two files, and no open record names them

---

**Severity:** Medium — the suite is the cheapest gate this project has, and a red baseline makes every "green" claim in a session report unreadable
**Domain:** code
**Filed by:** analyst, during the documentation-staleness survey (`shared/analyses/260813-0828-documentation-staleness-survey.md`)
**Affects:** `hooks/lib/__tests__/circle-stash-git-exclusion.test.ts`, `hooks/lib/__tests__/fusion-plane.test.ts`
**Cross-references:** `shared/issues/260810-0918_*_the-suite-total-moves-between-runs-and-the-variance-is-entirely-in-one-file.md` (a different defect in the same file); `shared/issues/260810-1032_*_push-rebuild-map-swallows-a-failed-rebuild-and-reconciles-against-the-stale-map.md` and `shared/issues/260810-0747_*_push-plan-rebuild-map-without-a-fixture-drops-the-flag-silently.md` (both closed; the two failing plane cases are the ones those closures installed)

---

## What was measured

`cd hooks && npx vitest run` at HEAD (`1c2d555`) reports **46 of 48 files green, 1007 of 1010
tests green**. The three failures reproduce on a second run against the same tree, so they are
not the collection-count flakiness that `260810-0918` records.

The failing cases:

1. `circle-stash-git-exclusion.test.ts` — *"the unbranched pathspec form is what makes the branch
   necessary (ignored workbench)"*.
2. `fusion-plane.test.ts` — *"the live rebuild, against a reachable Plane > the positive control:
   a rebuild that reaches Plane lands, and the push then reconciles"*.
3. `fusion-plane.test.ts` — *"the live rebuild, against a reachable Plane > a failed rebuild
   cancels the reconcile: nothing reaches the board, and it does not report ok"*.

For case 3 the assertion expects stderr to contain `the issues response was empty` and receives
instead:

```
fusion-plane: rebuilding .plane-map.json from Plane (embedded fusion-key)…
fusion-plane: rebuild-map: could not parse issues — map not changed
fusion-plane: push: the rebuild did not replace the map, so the reconcile did NOT run — nothing was pushed.
```

The tool's refusal is intact and correctly ordered. What differs is the wording of one diagnostic
line, so the likely cause is a message the code changed and the assertion did not follow — but
that is **inference**, not verified: I did not read `bin/fusion-plane` to find where either
string is produced.

## Why it is filed rather than fixed

I am the analyst and read-only on code. It is also out of scope for the documentation Circle this
survey grounds: nothing here is a documentation defect.

## What is not established

- Whether any of the three is environment-dependent. Both plane cases sit in a describe block
  named *"against a reachable Plane"*, and neither the mock's contract nor whether it requires
  anything from the local shell was examined.
- Which commit made them red. No bisect was run.
- Whether the circle-stash case and the two plane cases share a cause. They almost certainly do
  not, but that is an assumption and nothing was done to test it.

## Suggested route

`bugfixer`, or `coder` with a bisect first. The two plane cases should be diagnosed together and
the circle-stash case separately.
