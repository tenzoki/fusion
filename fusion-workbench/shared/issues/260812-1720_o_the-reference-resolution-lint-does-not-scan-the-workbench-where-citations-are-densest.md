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

- a **stale exact marker** — `shared/planning/260809-1229_o_plan-five-severe-guard-defects.md`
  seven times for a file that has been `_c_` since it completed; `…260812-1232_p_…` seven times;
  `…260807-2024_o_…` five times
- the **wildcard marker** `_*_`, which is the mandated form and resolves correctly
- the **pre-v4 bracket form** `260717-1918[o]`, thirteen occurrences, a marker syntax retired in
  v4
- an **ellipsis truncation** — `shared/planning/260809-1229_c_…:366,412`,
  `shared/planning/260807-2024_o_…`, `shared/planning/260801-1122…:301`
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
