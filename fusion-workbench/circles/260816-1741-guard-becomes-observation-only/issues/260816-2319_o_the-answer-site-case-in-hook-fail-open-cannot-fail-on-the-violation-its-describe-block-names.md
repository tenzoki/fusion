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
- `circles/260816-1741-guard-becomes-observation-only/planning/260816-1915_p_the-compliance-guard-becomes-observation-only.md` step 9, "the integration cases that need a deny are re-pointed onto the surviving `answer` call on the allow path"
