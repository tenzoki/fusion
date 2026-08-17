# README-hooks says fourteen ordering sites, and the commit that wrote the sentence converted fifteen

---

**Severity:** Low — a wrong count in the shipped document that describes the fail-open ordering rule
**Domain:** code
**Filed by:** reconciler (reconciliation of `6b94e17..HEAD`, 260809-2252)
**Affects:** `README-hooks.md:175` (the `lib/fail-open.ts` row)
**Cross-references:**
`f9c4214` (wrote both the sentence and the fifteenth site);
`shared/history/260809-2230-ordering-fix-verdict-before-the-record-of-it.md` (its attribution table lists fourteen and omits the same site);
`shared/issues/260809-2045_c_…`, `260809-2046_c_…`, `260809-1825_c_…` (the three records the commit closed — all three re-verified CONFIRMED, so this is a counting error and not a coverage gap)

---

## What is wrong

`README-hooks.md:175` reads:

> `answer` and `bestEffort` carry the same rule to the **fourteen sites** inside `main`
> where an escalation save, an event append or the churn heatmap stood ahead of the verdict.

Enumerating that class against `hooks/guard.ts` and `hooks/tracker.ts` at HEAD gives **fifteen**.
The omitted one is `hooks/guard.ts:857-864`, the CHECK 3 low/medium advisory:

```
bestEffort("guard", () => emitEvent("guard_advisory", … `Advisory (${highestSensitivity})…`))
```

`f9c4214` converted it itself — the diff wraps the previously bare `emitEvent` — and it is the
identical shape to the CHECK 2 rules-write advisory at `:803-805`, which the count *does*
include. So this is the commit undercounting its own work, not a site left unfixed.

The error is in the safe direction, and that is the reason to fix rather than absorb it: the
sentence is the shipped description of the security boundary's ordering rule, and a reader
auditing it will find one more converted site than the document admits and have to work out
which of the two is wrong.

## What is not wrong

Checked and correct, recorded so this does not get re-derived:

- **"Eleven verdict-discarding" is exact.** Re-derived against `git show f9c4214^`: eleven of
  the fifteen had a failure path that could discard the verdict; the other four were
  allow-to-allow. Five of the eleven were measured directly, running the parent commit's
  compiled `dist` beside HEAD's.
- All three records the commit closed meet their acceptance criteria at HEAD.
- `hooks/dist/` is byte-identical to a fresh `tsc` of the sources.

A second, smaller inaccuracy in the same commit's narrative — that the three records "between
them named four" sites, where their `Affects` lines name five — sits only in the history
document and in a prose comment (`hooks/lib/fail-open.ts:40-55`, where the four are bullets and
the first bundles two sites). Not filed separately; not worth an edit to a history record.

## Acceptance criteria

- [ ] `README-hooks.md:175` states a count that matches the sites `answer` / `bestEffort` cover
      in `hooks/guard.ts` and `hooks/tracker.ts`, or drops the number for a description that
      does not go stale on the next conversion.

---
Resolved: Fixed by dropping the count rather than correcting it, which is the second of the two fix directions this record offered. `README-hooks.md:185` (the `lib/fail-open.ts` row) now reads "The ordering rule both hooks run on ... every site inside `main`" and carries no numeral; `grep -c "fourteen" README-hooks.md` is 0 at HEAD `2552586`. A description that names the scope cannot go stale on the next conversion, which is what the record asked for. Verified by reconciliation pass 260817-1836 (`shared/history/260817-1836-reconciliation.md`).
