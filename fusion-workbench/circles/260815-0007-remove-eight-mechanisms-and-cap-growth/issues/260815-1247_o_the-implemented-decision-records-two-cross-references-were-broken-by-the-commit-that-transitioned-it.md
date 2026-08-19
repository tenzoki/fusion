# The implemented decision record's two cross-references were broken by the same commit that transitioned it

---

`shared/decisions/260811-2009_i_…md` cross-references two defect records by their `_o_` name. Commit
`332267a` closed both — renaming them to `_c_` — in the same commit in which it moved this decision from
`_o_` to `_a_`. Both citations now resolve to nothing.

---

**Severity:** Low — two dangling citations in one record; both targets are unambiguous by stem.
**Domain:** data
**Filed by:** `ontorev`, reviewing `7c12d6a..5d29b6d` (`reviews/260815-1247-ontorev-turn-2-structured-data.md`)
**Owner:** `ontocoder`
**Affects:** `fusion-workbench/shared/decisions/260811-2009_i_is-the-hooks-suite-meant-to-be-run-concurrently-with-itself-and-if-not-who-serialises-it.md:7`

**Verified 2026-08-15 at HEAD `5d29b6d`.**

```
$ ls shared/issues | grep -E '260810-1135|260811-1409'
260810-1135_c_a-timing-case-in-fusion-commit-lock-test-fails-under-load-and-passes-in-isolation.md
260811-1409_c_the-browser-launch-case-in-the-monitor-suite-fails-under-parallel-load-and-passes-in-isolation.md
```

The record's line 7 still names both with `_o_`. The third citation on the same line,
`260810-1820_o_an-executor-verified-a-gate-by-mutating-a-file-another-executor-held-in-the-live-tree.md`,
still resolves — that record is genuinely open.

## Why this instance is worth its own record

The two renames and the citation that names them are in **one commit**, `332267a`. Nothing raced and
nothing drifted over time: the executor closed the two issues its change resolved and, in the same
change, left the record that points at them naming the old paths. That makes it cheap to prevent, unlike
the drift case, and it is the second instance of the class this session.

## Not the same as the history entries

`shared/history/260814-2306-orchestrator-session.md` and the Circle's history entries also name records
at the marker they carried when the run happened. Those are historical statements and stay true; a
`**Cross-references:**` line is a live pointer and does not. The distinction is the one
`issues/260815-0804_o_a-decision-records-cross-reference-points-at-an-a-circle-md-that-activation-renamed.md`
already draws for the Circle-record case.

## What the fix has to establish

Re-point the two citations. The durable form is the one this project already uses elsewhere and which no
further transition breaks — the `_*_` stem, as in
`archive/260817-1907-safe-cleanup-scoped/shared/backlog/260814-1733_*_radical-simplification.md`'s *"Split from
`shared/backlog/260811-0826_*_observations.md`"*. Whether that form should be the convention for every
marker-bearing citation is the open question `260815-0804` defers to `rules/circle-records.md`, and this
fix does not settle it.

## Related

- `issues/260815-0804_o_a-decision-records-cross-reference-points-at-an-a-circle-md-that-activation-renamed.md`
  — the same class, on a Circle record.
- `issues/260815-1247_*_a-backlog-entrys-related-line-points-at-a-marker-the-playmaker-has-since-moved.md`
  — the same class, on the backlog store.


---

**Reconciliation 260819-1453 (reconciler, Domain `code`, Circle-store pass) — STAYS `_o_`. Re-measured at HEAD `e435f03` (v10.3.0). Unchanged.**

`shared/decisions/260811-2009_i_…:7` still cites `shared/issues/260810-1135_o_…` and `shared/issues/260811-1409_o_…`. Both targets are `_c_` at HEAD. Two literal markers, two dangling citations, same class as `260815-0804_*_a-decision-records-cross-reference-points-at-an-a-circle-md-that-activation-renamed` in this store.

The citing record is in `shared/decisions/`, outside this Circle-store pass's write scope, so it is annotated here and not corrected. The fix is the wildcard marker position, `_*_`.
