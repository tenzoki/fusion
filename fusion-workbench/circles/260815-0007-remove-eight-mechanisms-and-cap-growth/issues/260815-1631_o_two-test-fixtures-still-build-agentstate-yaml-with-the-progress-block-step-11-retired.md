Two test fixtures still build `agentstate.yaml` with the `progress:` block step 11 retired

---

`f45f76a` renamed `progress:` to `control:` and dropped seven fields, but left the two synthetic
`agentstate.yaml` builders in the hooks suite writing the old shape. They are now the only
executable models of this file in the tree, and they model a shape no document defines.

---

## Where

- `hooks/lib/__tests__/review-coverage.test.ts:102-116` — `writeState()` emits
  `"progress:", "  turn: 1", "  commits: 0"`.
- `hooks/lib/__tests__/staging-drift.test.ts:82-91` — `WORKBENCH_FILES` emits the same three lines.

Both were in `f45f76a`'s file list (it edited `staging-drift.test.ts` by 52 lines and
`review-coverage.test.ts` by 9), so the fixtures were open and the block was not touched.

## Why it is only Low

Nothing breaks. `hooks/lib/state-file.ts:78-84` `stateField()` is a flat first-match regex over the
whole file and reads only `git_head_at_start` and `history_file`; both fixtures supply those, and
neither `turn` nor `commits` collides with a key any consumer asks for. `npm test` is green on the
fixtures as written.

## Why it is a defect anyway

`hooks/lib/state-file.ts:1` calls itself "`fusion-workbench/agentstate.yaml`, read once and asked
field by field", and its header explains at `:14-19` that the pair is shared precisely so a flat
read cannot start disagreeing with itself about the file. The fixtures are the only place a reader
of that module sees the file's shape, and two of two show a block that was deleted in the same
commit that created the module. The next person needing a state fixture copies one of these.

## Suggested fix

Replace the three lines in each with the block the schema defines
(`agents/orchestrator.md:983-986`), e.g. `control:` / `  turn_start_head: "…"`. A fixture asserting
nothing about the block still costs nothing and stops modelling a retired shape.


---

**Reconciliation 260819-1453 (reconciler, Domain `code`, Circle-store pass) — STAYS `_o_`. Re-measured at HEAD `e435f03` (v10.3.0). Unchanged.**

```
grep -n 'progress:' hooks/lib/__tests__/review-coverage.test.ts hooks/lib/__tests__/staging-drift.test.ts
  review-coverage.test.ts:123:  "progress:",
  staging-drift.test.ts:87:     "progress:",
```

Both synthetic builders still model the `progress:` block step 11 retired. Both files were edited between the closure and HEAD without the fixtures being brought forward. The schema they should mirror is `control:` at `agents/orchestrator.md:1026-1028`.

No test fails as a result — the two consumers read the git anchor, not the block — which is exactly why it survives: a fixture that models a retired shape is only wrong to a reader, until the day someone derives the real schema from it.
