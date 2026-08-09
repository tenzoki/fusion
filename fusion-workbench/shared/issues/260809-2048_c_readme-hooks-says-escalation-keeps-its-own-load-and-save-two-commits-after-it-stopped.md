# README-hooks says escalation keeps its own load and save, two commits after it stopped

---

**Severity:** Low — a stale sentence in the file that documents the seam, in the same Turn that changed it
**Domain:** code
**Filed by:** coderev (incremental review of `6b94e17..HEAD`)
**Affects:** `README-hooks.md:176` (the `lib/guard-state-file.ts` row)
**Cross-references:**
`9bf7ca1` (added the row), `5f2cd56` (made it false),
`hooks/lib/guard-state-file.ts:36-46` and `hooks/lib/escalation.ts:29-34`, both of which record the change correctly

---

## What is wrong

The row reads:

> `escalation.ts` and `protected-snapshot.ts` still keep their own; the latter
> deliberately, since its load answers `null` rather than an empty state

That was true when `9bf7ca1` wrote it. `5f2cd56` folded `escalation.ts` into the
seam: `loadEscalation` calls `loadGuardState(ESCALATION_FILE, coerceState)`
(`hooks/lib/escalation.ts:202`) and `saveEscalation` calls both `loadGuardState`
and `saveGuardState` (`:284`, `:296`). Only `protected-snapshot.ts` keeps its
own, and only it is deliberate.

The seam's own header already says this (`guard-state-file.ts:36-46`,
"## What `escalation.ts` adds on top, rather than beside"), so the two documents
disagree about which modules use the seam — and the wrong one is the one a user
reads.

## Suggested direction

Rewrite the clause: `escalation.ts` uses the seam and wraps it with the
concurrent-halt merge; `protected-snapshot.ts` stays outside it deliberately,
for the three reasons the seam's header enumerates.

While there, the same table's `lib/shell-parse.ts` row (`README-hooks.md:180`)
says it "strips data regions (quotes, heredoc bodies)" without the carve-out
`69a2d00` introduced — an unquoted-delimiter body keeps its `$(…)` and backtick
regions. Not false, but incomplete in the direction that matters for a reader
asking what still classifies.

## Acceptance criteria

- [ ] `README-hooks.md:176` names `protected-snapshot.ts` as the only module
      outside the seam.
- [ ] The `lib/shell-parse.ts` row mentions the substitution carve-out.

---
Resolved: `97d5846`, verified at HEAD by the reconciler (260809-2252) — the record was
closed by rename with no resolution note, so this footer is the reconciler's, not the
closing agent's.

Criterion 1 — CONFIRMED. `README-hooks.md:176` now reads "`escalation.ts` and `churn.ts`
both use it; escalation wraps it with the merge its save needs … `protected-snapshot.ts` is
the only module outside the seam, and deliberately", and enumerates the three reasons the
seam's own header gives. The false clause naming `escalation.ts` as outside the seam is gone.

Criterion 2 — CONFIRMED. The `lib/shell-parse.ts` row (`README-hooks.md:180`) now carries the
carve-out: "an unquoted delimiter keeping the `$(…)` and backtick regions bash executes
there". The same row was extended past the criterion with the six suspended spans `6fae676`
added, which is consistent with `rules/git-branch-discipline.md` at HEAD.
