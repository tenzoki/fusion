The reference-resolution lint does not scan the workbench, where record-to-record citations are densest

---

`hooks/lib/__tests__/reference-resolution-lint.test.ts` resolves workbench-record citations
(its class (c)) and fails on a dangling one. Its scanned surface is `rules/`, `agents/`, `docs/`,
`templates/`, every `skills/*/SKILL.md`, the root `README*.md` and `CLAUDE.md`, shell-script
header comments under `bin/`, `install.sh`, and comment lines in `hooks/lib/*.ts`. It does not
scan `fusion-workbench/`.

That exclusion leaves the largest citation corpus in the project unguarded. The workbench holds
187 session histories, 265 defect records, 39 decision records, 21 reviews, 13 analyses and
twelve Circle records, and those files cite each other constantly — a Circle record's
`## Grounding snapshot` is little else, and every answered decision carries an `Answered:` path.
The shipped-text surface the gate does cover cites a few dozen records; the workbench cites
thousands.

---

**Measured, on the seven files in `shared/planning/`.** 184 references to those seven exist
across the repository. 91 of them (49 per cent) do not contain the referenced file's current
filename. The forms found in the wild:

- a **stale exact marker**, three spellings and nineteen occurrences between them. Transcribed
  below rather than written as live pointers: the spelling is the finding, so a citation
  corrected to the wildcard form would no longer be the thing found.

  ```
  shared/planning/260809-1229_o_plan-five-severe-guard-defects.md   7×   (the file has been _c_ since it completed)
  …260812-1232_p_…                                                 7×
  …260807-2024_o_…                                                 5×
  ```
- the **wildcard marker** `_*_`, which is the mandated form and resolves correctly
- the **pre-v4 bracket form** `260717-1918[o]`, thirteen occurrences, a marker syntax retired in
  v4
- an **ellipsis truncation** — `archive/260817-1907-safe-cleanup-scoped/shared/planning/260809-1229_*_…:366,412`,
  `shared/planning/260807-2024_*_…`, `shared/planning/260801-1122…:301`
- a `fusion-workbench/` **prefix** on an otherwise workbench-relative path
- a Circle-relative `planning/…` prefix
- a **bare timestamp stem** in prose, which is ambiguous: `260812-1232` names one plan, two
  decision records, one defect record and one session history, all written in the same minute

The gate's existing parser already handles the first five of those forms correctly. It is not
missing capability; it is pointed at the wrong corpus.

**Why this was not simply fixed while it was found.** Turning the exclusion off today would fail
the suite on every citation that is *already* dangling in a workbench of that size, and nothing
has counted them. That count is the first piece of work, not the last. The exclusion is also
partly deliberate: the gate's own header records that class (c) resolves against this
repository's workbench and degrades to syntax-only when the workbench is absent, which is the
fresh-clone case.

**Related work.** `shared/planning/260812-1720_*_circle-first-placement-and-the-backlog-store.md`
step 11 extracts the parser so it can be run over an arbitrary corpus and runs it over the
workbench once, as a migration verifier, recording the pre-existing dangling count as a baseline.
Whether it then becomes a standing gate is left open in that plan's `## Open Questions` and is
the question this record exists to keep alive.

---

**Counted, 260812-2136.** The first piece of work this record named — "nothing has counted them"
— is done. The parser was lifted into `hooks/lib/__tests__/helpers/citation-scan.ts` and run over
all 1012 `.md` files in the workbench. Full table in
`shared/planning/260812-1720_*_circle-first-placement-and-the-backlog-store.md`
`## Reconciliation Log`; the two numbers this record was waiting for:

- **4514 path-shaped citations** in the workbench, against a few dozen on the surface the gate
  scans. "The workbench cites thousands" was right.
- **1454 of them are dangling today**, before any move. That is what the suite would fail with if
  the exclusion were turned off unchanged, and it is why turning it off is not a two-line change.

The 1454 are four different problems and the standing-gate question cannot be answered without
separating them: 1104 stale markers on records that exist, 322 citations of nothing, 21 wrong
stores, 7 missing Circle directories.

**And one question this record did not anticipate, which now blocks the standing-gate decision:
517 of the 1104 stale markers are in `history/` files.** A session log that cited a record by
the marker it carried that day was correct when it was written; the marker moved afterwards.
A worked instance stands at `shared/history/260810-0819-reconciliation.md:310`, which lists four
records by the open marker each carried that day and where at least one has since closed. Holding an
append-only record to the wildcard-citation rule would demand rewriting history to keep a gate
green, which is the wrong direction. Either `history/` is out of the standing gate's scope, or
the rule for it is different from the rule for live text. Deciding that moves the number by 47
per cent, so it comes first.

Two grammar gaps found in the same run are filed separately, because they change the count in
both directions:
`shared/issues/260812-2136_*_the-citation-grammar-reads-one-ellipsis-and-one-marker-syntax-and-the-workbench-uses-two-of-each.md`.

---
**Reconciliation 260817-1836** (reconciler, domain `code`). Re-verified reproducible at HEAD `2552586`: `hooks/lib/__tests__/reference-resolution-lint.test.ts` `surface()` still walks the shipped tree only, and the gate-s own header documents the workbench exclusion as deliberate and still standing. Marker stays open. Log: `shared/history/260817-1836-reconciliation.md`.
