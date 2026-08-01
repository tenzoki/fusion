`rules/fusion-workbench-conventions.md` cites three records that do not resolve

---

Three cross-references in the conventions file point at records that are not where the file says they are. Verified 2026-08-01 against this repo and its workbench.

| Cited path | Reality |
|---|---|
| `analyses/260519-0438-circle-stash-pop-concept.md` | Exists nowhere in the workbench or the archive |
| `decisions/260519-1100_a_circle-stash-pop-design.md` | Exists nowhere in the workbench or the archive |
| `decisions/260716-1910_i_circle-marker-am-verzeichnis-oder-an-der-circle-datei.md` | Exists, at `circles/260716-1847-workbench-umbau/decisions/260716-1910_i_circle-marker-am-verzeichnis-oder-an-der-circle-datei.md` |

The archive store is empty in this project, so "not found" for the first two means gone, not archived.

The third is the interesting one. It is a pre-v4 root-relative path that the v4.0.0 Circle-container restructure invalidated, and the citation was never updated. It is the same failure class as the `CLAUDE.md` bus-decision instance in `shared/analyses/260801-1020-normative-surface-drift-gap-analysis.md`: a layout change that the citations did not follow. That it survives in the document defining the v4 layout is what makes it worth filing rather than leaving to a later pass.

## How to reproduce

```
grep -aoE '`[a-z0-9_./-]+\.(md|json|yaml|jsonl|ts|sh)`' rules/fusion-workbench-conventions.md | tr -d '`' | while read f; do case "$f" in */*) [ -e "$f" ] || echo "MISSING: $f";; esac; done
```

Four paths are reported. One, `circles/260716-1847-umbau/planning/260716-1910_p_plan-foo.md`, is an illustrative example in prose and is correct as written. The other three are the entries above.

## Context

Found by the shaper while specifying `shared/planning/260801-1122_o_spec-normative-consolidation.md`. That spec's C9 step 1 covers exactly this class of finding and would fix these as a matter of course — but C9 is the closing work of the last of four Circles, so the fix is far out. This is a three-line correction that does not need the curator to exist.

Filed separately for that reason. If the curator lands first, C9 step 1 closes this and the issue is redundant rather than wrong.

## Fix

Update the third citation to its Circle-relative path. For the first two, either locate the records if they were moved outside the workbench, or replace the citations with a statement that the motivating records are not retained — the honest-absence form the spec's C8 provenance convention accepts. Do not invent a replacement record.
