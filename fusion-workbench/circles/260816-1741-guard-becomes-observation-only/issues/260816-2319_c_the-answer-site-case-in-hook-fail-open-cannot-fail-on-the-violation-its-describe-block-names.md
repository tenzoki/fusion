The `answer`-site case in `hook-fail-open.test.ts` cannot fail on the violation its describe block names

---

`describe("a report that fails decides nothing — the verdict stands either way")` holds two
re-pointed cases. The second one discriminates and its reasoning is sound; the first one cannot
fail on the property the describe names.

**The second case is correct — verified.** `hook-fail-open.test.ts:392-401` asserts exactly two
`[guard] Error:` markers on stderr, and the count is what makes it discriminate. Checked against
`hooks/lib/fail-open.ts`: `failOpen` writes exactly one marker (`:191`) and deliberately swallows
its own `emit` failure without a second one (`:180-188`), while the real path writes one from
`bestEffort` in the diagnostic loop (`:132`, reached from `guard.ts:172-176`) and a second from
`answer`'s guarded report (`:156`, reached from `guard.ts:202-208`). So a guard without the
`bestEffort` wrapper produces `{}`, exit 0 and **one** marker; the real guard produces `{}`, exit 0
and **two**. The executor's stated reasoning holds exactly as written.

**The first case, `hook-fail-open.test.ts:274-289`, does not.** Its full assertion set is:

```ts
expect(run.stderr).toContain("[guard] Error:");
expect(verdictOf(run, "guard")).toEqual({});
expect(run.status).toBe(0);
expect(readEvents(root)).toEqual([]);
```

Run the counterfactual the case exists for — `guard.ts:202` written as `emitEvent(…); allow();`
instead of `answer("guard", allow, () => emitEvent(…))`, with the state directory unwritable:

| | real code | ordering violated |
|---|---|---|
| stdout | `{}` from `allow` | `{}` from `failOpen`'s verdict |
| exit | 0 | 0 (`main().catch` handles it) |
| stderr markers | 1, from `answer` | 1, from `failOpen` |
| `events.jsonl` | absent | absent |

All four assertions pass in both columns. Before this Turn the same case asserted
`decision === "block"` and `reason` containing `[HALTED]`, which the violation would have lost —
it discriminated then. What removed the discrimination is not an oversight in the re-pointing but
the removal itself: when the only verdict the hook can reach is `{}`, "the verdict survived its
own bookkeeping" has no observable difference from "the verdict was reconstructed by the
fail-open tail". The marker trick that saves the second case does not transfer, because this path
has only one report and therefore only one marker in both columns.

`inference:` I could not construct any observable that separates the two columns for this site.
The verdict value, the exit code, the marker count, the stderr text and the event log are
identical, and the hook has no other output surface. So the honest fix is probably not a better
assertion but a comment that says what the case can and cannot still show — the same bound
`legacy-halt-clearing.test.ts:36-43` states about its own skill-text assertions.

**Why it matters.** The case's own comment claims the last assertion is what distinguishes it —
"the row was genuinely LOST. A run where `events.jsonl` landed anyway would satisfy the verdict
assertions while proving nothing" — and that is true of a *different* counterfactual (a guard that
wrote the row) than the one the describe block is about (a guard that wrote the row first). A test
that reads as a guarantee and cannot fail on the guarantee's violation is worse than no test
there, because the next person to reorder `guard.ts:202` will see it green.

**Severity:** Medium. Nothing is broken; a stated invariant is unguarded and reads as guarded.

**Scope:** the plugin's hook test surface.

**Cross-references:**
- `hooks/lib/fail-open.ts:127-135`, `:150-157`, `:171-192`
- `hooks/guard.ts:172-176`, `:202-208`, `:211-223`
- `260816-1915_*_the-compliance-guard-becomes-observation-only.md` step 9, "the integration cases that need a deny are re-pointed onto the surviving `answer` call on the allow path"

---
Reconciliation 2026-08-17, Phase 3. **Left OPEN. Nothing was changed, not even the comment.**

Read at HEAD: `hooks/lib/__tests__/hook-fail-open.test.ts:300-321` still carries the four
assertions this record enumerated and no others, and its inline comment still claims the last
assertion is what distinguishes the case. The bound this record proposed — a comment saying what
the case can and cannot still show, in the shape `legacy-halt-clearing.test.ts:36-43` uses about
its own text assertions — was not written. The case is green and the suite is green (35 files,
653 tests), which is precisely the condition the record warns about: a test that reads as a
guarantee, cannot fail on the guarantee's violation, and shows green to whoever next reorders
`guard.ts:202`.

The record's second case is untouched and remains sound; nothing here disputes the `bestEffort`
half.

This is the cheapest of the three open code-surface records to close — the honest fix is a
comment, not an assertion — and the record already contains the `inference:`-marked reasoning
that no observable separates the two columns. Whoever picks it up should either write that bound
down or disprove the inference; leaving it green and unannotated is the one outcome the record
argues against.

---
Reconciliation 2026-08-17, second Phase-3 pass. **Left OPEN, re-measured rather than re-asserted,
unchanged since the first pass.** `hooks/lib/__tests__/hook-fail-open.test.ts:300-321` still carries
the four original assertions on the `answer` site and no bound in its comment. The suite is green
whole at HEAD `d0f13fa` (35 files, 653 tests), which is this record's point: green is what it
reports either way. Left open by the same user decision that left `260816-2320_*_the-write-trace-is-now-the-guards-only-product-and-two-of-its-four-tools-reach-no-integration-case.md` open on 2026-08-17.

---

**Reconciliation 260819-1453 (reconciler, Domain `code`, Circle-store pass, third pass) — STAYS `_o_`. Re-measured at HEAD `e435f03` (v10.3.0), two releases past the closure. Unchanged in every particular.**

`hooks/lib/__tests__/hook-fail-open.test.ts:299-321` still carries `describe("a report that fails decides nothing — the verdict stands either way")` with the same four assertions and no others, and the inline comment at `:303-307` still claims the last assertion is what distinguishes the case. `git log --oneline d0f13fa..HEAD -- hooks/lib/__tests__/hook-fail-open.test.ts` is empty: nothing has touched the file since the Circle closed.

**Live obligation, not abandoned.** Two things make that judgement rather than a preference:

1. The remedy the record itself argues for is a **comment**, not an assertion — it costs nothing and spends nothing from the hook-test line budget, which is the one growth surface with fresh head-room (`hooks/lib/__tests__/surface-growth-bound.test.ts`, `TEST_LINE_BASELINE` re-armed this Circle).
2. The failure the record predicts is not a hypothetical about a hypothetical maintainer. It is about `hooks/guard.ts:202`, the single `answer("guard", allow, () => emitEvent(…))` call that is now the whole of the hook's write-path bookkeeping. Anyone making a deep change to the guard will read that line, and this test will show green whether they preserve its ordering or not.

The record's `inference:` — that no observable separates the two columns once `{}` is the only reachable verdict — was re-checked against `hooks/guard.ts` at HEAD and still holds: 223 lines, no `permissionDecision`, no `"deny"`, no `hookSpecificOutput`, `allow()` at `:124`, `:132`, `:145` and `:193`, `{}` on every path. Whoever picks this up should write that bound into the comment or disprove the inference. Green and unannotated remains the one outcome the record argues against.

---
Resolved: fixed — the comment on the `answer`-site case in `hooks/lib/__tests__/hook-fail-open.test.ts` now states the bound the record proves: with `{}` the only reachable verdict no observable separates the real ordering from the violated one, so the case pins the fail-open tail and not the order; no assertion added; `cd hooks && npx vitest run lib/__tests__/hook-fail-open.test.ts`
