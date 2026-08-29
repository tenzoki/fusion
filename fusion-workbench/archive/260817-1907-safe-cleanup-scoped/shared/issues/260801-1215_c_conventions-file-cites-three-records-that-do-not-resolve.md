`rules/fusion-workbench-conventions.md` cites three records that do not resolve

---

Three cross-references in the conventions file point at records that are not where the file says they are. Verified 2026-08-01 against this repo and its workbench.

| Cited path | Reality |
|---|---|
| `260519-0438-circle-stash-pop-concept.md` | Exists nowhere in the workbench or the archive |
| `260519-1100_*_circle-stash-pop-design.md` | Exists nowhere in the workbench or the archive |
| `260716-1910_*_circle-marker-am-verzeichnis-oder-an-der-circle-datei.md` | Exists, at `260716-1910_*_circle-marker-am-verzeichnis-oder-an-der-circle-datei.md` |

The archive store is empty in this project, so "not found" for the first two means gone, not archived.

The third is the interesting one. It is a pre-v4 root-relative path that the v4.0.0 Circle-container restructure invalidated, and the citation was never updated. It is the same failure class as the `CLAUDE.md` bus-decision instance in `260801-1020-normative-surface-drift-gap-analysis.md`: a layout change that the citations did not follow. That it survives in the document defining the v4 layout is what makes it worth filing rather than leaving to a later pass.

## How to reproduce

```
grep -aoE '`[a-z0-9_./-]+\.(md|json|yaml|jsonl|ts|sh)`' rules/fusion-workbench-conventions.md | tr -d '`' | while read f; do case "$f" in */*) [ -e "$f" ] || echo "MISSING: $f";; esac; done
```

Four paths are reported. One, `circles/260716-1847-umbau/planning/260716-1910_p_plan-foo.md`, is an illustrative example in prose and is correct as written. The other three are the entries above.

## Context

Found by the shaper while specifying `260801-1122_*_spec-normative-consolidation.md`. That spec's C9 step 1 covers exactly this class of finding and would fix these as a matter of course — but C9 is the closing work of the last of four Circles, so the fix is far out. This is a three-line correction that does not need the curator to exist.

Filed separately for that reason. If the curator lands first, C9 step 1 closes this and the issue is redundant rather than wrong.

## Fix

Update the third citation to its Circle-relative path. For the first two, either locate the records if they were moved outside the workbench, or replace the citations with a statement that the motivating records are not retained — the honest-absence form the spec's C8 provenance convention accepts. Do not invent a replacement record.

---
Resolved: 2026-08-06 (reconciler, workbench-wide pass) — all three citations are gone from the shipped text. The stash section moved to `rules/workbench-stash-and-lock.md` in the conventions partition (`0fead5e`); there the two nonexistent 260519 records were replaced by substance-in-text per decision `260805-0709_*_wohin-gehoert-die-forensik-aus-protected-path-discipline.md`, and the third citation now resolves in wildcard form at `rules/circle-records.md:36` (`260716-1910_*_circle-marker-am-verzeichnis-oder-an-der-circle-datei.md`). Commit `fae818b`; sibling finding `260805-1841_*_stash-lock-drei-tote-record-zitate.md` closed there. The issue's own repro grep at HEAD `cde5319` reports only illustrative examples and the optional consumer manifest.
