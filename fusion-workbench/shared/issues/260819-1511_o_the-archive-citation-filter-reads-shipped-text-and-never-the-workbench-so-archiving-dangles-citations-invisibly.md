The archive step's citation filter reads shipped text and never the workbench, so archiving dangles workbench-to-workbench citations invisibly

---

The archive step keeps a record out of the sweep when its stamp appears in the **shipped** text. It
never reads the workbench's own records, so a record cited only by another record — a Circle record's
`## Turn log`, a decision's `**Cross-references:**`, a closure note — is archived while every citation
of it stays behind, pointing at nothing.

---

**Measured.** Six of the eighteen dangling citations across the eleven Circle records were produced by
the archive run of 2026-08-17. Two of them sit in the bounded Circle
`260816-1741-guard-becomes-observation-only`: one of the three decisions its Directive executes,
`shared/decisions/260809-1224_*`, was archived on the day of that Circle's closure, and its activation
proposal claims "Each was resolved to an existing directory" about three Circles of which one no
longer resolves.

**Why no gate sees it.** `hooks/lib/__tests__/reference-resolution-lint.test.ts` scans the shipped text
and resolves *its* citations against the workbench. The reverse direction — workbench records citing
workbench records — is scanned by nothing. The lint's own header names the gap and states that
`scanRecordCitations` was extracted for a second caller; `grep -rn scanRecordCitations` returns the
lint alone. The second caller does not exist.

The filter itself is documented in `archive/260817-1907-safe-cleanup-scoped/MANIFEST.md`
`## The filter, and the two passes it took to get right`, which records that it took two attempts —
both of them about shipped text.

**Severity:** Medium. Archiving is a routine step of `/fusion:cleanup`, so the damage accumulates on a
schedule, and it is silent in both directions: the archived record does not know it was cited, and the
citing record does not know its target moved.

**Scope:** `skills/archive/SKILL.md` (the filter), `hooks/lib/__tests__/helpers/citation-scan.ts` (the
extracted scanner that has no second caller).

Found by the Circle-store reconciliation of session `260818-2301`, which could not file it at the time:
its write scope was `circles/*/` and a sibling reconciler held `shared/issues/`. Stated in filable form
in `shared/history/260819-1400-reconciliation-circles.md` and filed here afterwards.
