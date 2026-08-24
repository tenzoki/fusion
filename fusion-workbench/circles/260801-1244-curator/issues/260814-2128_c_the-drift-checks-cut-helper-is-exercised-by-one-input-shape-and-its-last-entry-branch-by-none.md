The drift check's cut helper is exercised by one input shape, and its last-entry branch by none

---
`f0d9d60` replaced a byte-identity assertion with a JSON-aware text cut — four new functions, about 90 lines, in `hooks/lib/__tests__/config.test.ts`. Nothing tests them. Their only exercise is the one comparison they serve, against the one file shape that exists today: `orchestrator` as the first entry, alone on its line, terminated by a comma. `cutTopLevelEntry`'s second branch, the one that removes a last entry and the comma before it, is never reached by the suite at all.

---
**Found by:** coderev, Turn-6 incremental review of `41c224c..d270666`, review file `circles/260801-1244-curator/reviews/260814-2128-coderev-curator-turn-6.md`.
**Owner:** `coder`.
**Severity:** Low — no live defect. The helper was transcribed and exercised against thirteen input shapes during this review and answered correctly on every one that can occur. This is about what happens when the file shape changes, not about today.
**Affects:** `hooks/lib/__tests__/config.test.ts:1266-1373` (`PROJECT_SET_KEYS`, `endOfString`, `nextNonSpace`, `findTopLevelKey`, `endOfEntryValue`, `cutTopLevelEntry`, `withoutProjectSetKeys`).

**Verified 2026-08-14 at HEAD `d270666`**, by transcribing the four functions verbatim into a scratch module and running them against thirteen inputs.

## What the anti-vacuity assertion actually covers

```ts
expect(withoutProjectSetKeys(templateText)).toBe(templateText);
```

The comment beside it reads: *"the template declares no setting at all, so the cut must be a no-op on it. A cut that silently ate shared prose would have to eat it here first."*

That is true of one failure mode and only one. `cutTopLevelEntry` opens with `if (keyStart < 0) return text;`, so on the template the assertion returns before any cutting code runs. What it proves is that `findTopLevelKey` does **not** match the two occurrences of `orchestrator` inside the `_turnBudget` note — a real and valuable guard, since a naive `indexOf` would have eaten prose there. What it does not touch is `endOfEntryValue` or either branch of `cutTopLevelEntry`.

Those are covered only transitively, by `expect(stripped).toBe(templateText)` on the repo copy. That is a genuine assertion — a cut that took too much or too little fails it — but it holds for exactly one input shape.

## What was measured, and what it says

| Input shape | Result |
|---|---|
| `orchestrator` first, own line (today's file) | correct |
| middle entry, own line | correct |
| **last entry, own line** | correct — **and unreached by the suite** |
| only entry | correct |
| `"orchestrator"` nested one level down | correctly left alone |
| the key name inside a prose note | correctly not matched (`findTopLevelKey` → -1) |
| multi-line value | correct |
| CRLF line endings | correct |
| whitespace before the colon | correct |
| tab indentation | correct |
| trailing comma after the entry | correct |
| entry sharing a line with the next | loses one space of the next entry's indent |

The last row is the only imperfect one, and it fails **loud**: the cut result no longer equals the template, so the case goes red. An over-strict cut is the safe direction for a drift check, and that shape does not occur in either file.

## Why it is worth a record anyway

The exemption list is designed to grow — its own docstring says a future project-configurable key is admitted by adding one line. The day a second key is added, or the day someone reformats `fusion-guard.json` so the exempted entry lands last, the code that runs is code the suite has never executed. A test helper that guards a drift check is not exempt from the coverage standard the drift check exists to enforce.

## What the fix is

Add a small table-driven case beside the comparison, calling `withoutProjectSetKeys` on synthetic strings rather than on either real file: first, middle, last and only entry, plus a key name occurring inside a string value. Each asserts the exact expected output. Five inputs, one `it`, no new dependency, and both branches of `cutTopLevelEntry` reached.

A second, cheaper point worth deciding at the same time: `PROJECT_SET_KEYS` cuts the whole top-level `orchestrator` object, while what the template documents as project-settable is the leaf `orchestrator.maxTurns`. Today `GuardSettings["orchestrator"]` has exactly one member (`hooks/lib/config.ts:222-224`), so the two are the same set and nothing is lost. If a second `orchestrator` leaf is ever added, a top-level cut exempts it silently. Leaf granularity or a comment naming the assumption — either is fine, and the choice belongs with whoever adds that leaf.


---

**Reconciliation 260819-1453 (reconciler, Domain `code`, Circle-store pass) — STAYS `_o_`. Re-measured at HEAD `e435f03` (v10.3.0). Unchanged. The subject was renamed under it and the coverage did not follow.**

Both call sites of `withoutProjectSetKeys` are still inside the single `it("is what this repository's own fusion.json is…")` in `hooks/lib/__tests__/config.test.ts` — `:750` is the anti-vacuity assertion that returns early, `:752` is the one real input shape. `cutTopLevelEntry`'s last-entry branch at `:675-679` (the `// The last entry` comment) is still reached by no test.

The v10 rename `fusion-guard.json` → `fusion.json` moved this helper's subject and rewrote the file around it without adding a table-driven case, which is the second edit to pass over the gap.

---
Resolved: fixed — one table-driven `describe` in `hooks/lib/__tests__/config.test.ts` calls `withoutProjectSetKeys` on five synthetic inputs (first, middle, last, only, and the key name inside a string value) asserting the exact output, so both branches of `cutTopLevelEntry` run; the last-entry case was shown failing with its comma-removal line deleted; paid by a docstring cut in the same file; `cd hooks && npx vitest run lib/__tests__/config.test.ts`
