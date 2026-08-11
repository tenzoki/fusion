# The three measurement modules hand-roll a `.guard-state/` store that `lib/guard-state-file.ts` already owns, and write it non-atomically

---
**Severity:** Medium
**Domain:** code
**Filed by:** coderev, review of `7785330..cac41ef` (Turn 1)
**Affects:** `hooks/lib/state-drift.ts:512-531`, `hooks/lib/review-coverage.ts:560-579`, `hooks/lib/staging-drift.ts:449-466`
**Cross-references:** `hooks/lib/guard-state-file.ts` (the seam); decision `260811-1146_o_does-the-measurement-family-get-a-shared-chassis-before-the-fourth-module.md`; commits `8a49fd5`, `afd7c2e`, `cac41ef`

---

## The defect

Each of the three new modules persists one throttle record under
`fusion-workbench/.guard-state/<name>.json`, and each implements the same four steps itself:

| Module | Read | Write |
|---|---|---|
| `state-drift.ts` | `lastReported` `:512-520` | `recordReported` `:523-531` |
| `review-coverage.ts` | `lastReportedCoverage` `:560-568` | `recordReportedCoverage` `:571-579` |
| `staging-drift.ts` | `readStagingState` `:449-460` | `writeStagingState` `:463-466` |

All three do: `readFileSync` → `JSON.parse` → coerce a field → `catch` returns the empty state;
then `mkdirSync(recursive)` → `writeFileSync`.

`hooks/lib/guard-state-file.ts` is that function, and its own header names this exact failure:

> Three state modules — `escalation.ts`, `churn.ts` and the since-removed `cross-file.ts` — each
> carried their own copy of the same twelve lines … **Copies drift, and this set drifted in the way
> that matters.**

Two modules use the seam today. Three more were added beside it in one afternoon.

## The concrete cost, not only the duplication

**The writes are not atomic.** `saveGuardState` writes through a `.tmp` and a `rename`
(`guard-state-file.ts:112-…`). The three new writers call `writeFileSync` directly. A torn write
leaves unparseable JSON; the reader's `catch` turns that into `""`, the throttle resets, and the
report the throttle exists to suppress fires again on the next call. That is a small failure, but it
is precisely the failure mode the seam was built to stop being re-derived per module.

## Why the seam was not reachable as written, and what to do about it

`guardStatePath(fileName)` resolves the root itself, via `findWorkbenchRoot()` with no argument. The
three new modules take `root` as a parameter — deliberately, because `tracker.ts` resolves the root
once and passes it, and because their tests spawn against scratch project roots. So the seam does
not fit **as currently signed**.

That is a reason to widen the seam by one optional argument, not to fork it three times:

```ts
export function guardStatePath(fileName: string, root?: string): GuardStatePaths | null
export function loadGuardState<T>(fileName: string, coerce: StateCoercion<T>, root?: string): T
export function saveGuardState(fileName: string, state: unknown, root?: string): void
```

`escalation.ts` and `churn.ts` keep calling it with two arguments and are unaffected. The three
throttles become three coercions and nothing else — the `{ reported: string }` shape is identical in
two of them and a superset in the third.

## Fix direction

1. Add the optional `root` parameter to the three seam functions.
2. Replace the six hand-written functions with `loadGuardState` / `saveGuardState` calls plus a
   coercion each.
3. Keep `staging-drift.ts`'s two-field state (`head` + `reported`) as its own coercion — it is a
   different state, not a different mechanism.

The broader question — whether the family also needs a shared trigger/report chassis — is a decision
and is filed as such; this record is the narrow one: an existing abstraction was not reused.
