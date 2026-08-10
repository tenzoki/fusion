The cascade reach gate is line-scoped, and this repository's own prose is hard-wrapped

---

`findCascadeStatements()` (`hooks/lib/domain-cascade.ts:693-708`) evaluates one line at a time. The
header names the resulting hole as *"a paraphrase spread across the ROWS of a table"*. A paraphrase
spread across two lines of ordinary hard-wrapped prose is the same hole, is not named, and is the
form this project's own authoring style produces by default.

---

**Measured.** The two-line probe

```
Pick `strategic` when open decisions outnumber open issues,
and `code` otherwise (measured on decisions_count and issues_count).
```

**passes**. Joined into one line it fires. The only difference is a newline a wrap would insert.

**Why this is not the table case.** The header's argument for line scope is that paragraph scope
would also catch the per-domain tables in `reconciler`, `taskplanner` and `playmaker` — five false
positives, measured. That argument is about tables. It says nothing about a sentence that a
78-column wrap split in two, and the mitigation for that case (join adjacent non-blank lines before
scanning, or scan a two-line sliding window) does not re-admit the tables, because a table row is
its own line and a two-row window still names no inputs.

**Reach.** `hooks/lib/__tests__/state-drift-detection-lint.test.ts` is hard-wrapped. So are
`hooks/lib/domain-cascade.ts`'s own comments, `rules/*.md`, and the newly added block in
`skills/commit/SKILL.md:84-90`. The skill bodies the gate scans are mostly long-line, but nothing
enforces that, and an author who wraps is not doing anything unusual.

**Fix direction.** Scan a sliding window of two adjacent non-blank, non-table lines in addition to
each single line, and re-run the false-positive measurement over the consumer set. If that re-admits
a legitimate line, say which and keep the single-line cut — but then say in the header that a wrapped
paraphrase is a hole, because at present a reader takes "per line is the cut that separates them" as
covering it.

**Cross-references.** `hooks/lib/domain-cascade.ts:622-645, 693-708`;
`shared/issues/260810-1918_c_the-cleanup-skill-carries-a-second-domain-cascade-in-the-pre-fix-order-and-no-gate-reads-it.md`.

**Filed by:** coderev, review of session `260810-1646` Turn 2, range `da8c9db..b3cc034`.
