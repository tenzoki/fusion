A citation path carrying a state marker dies on ordinary progress

---

**Domain:** code
**Filed by:** orchestrator, from a playmaker finding at portfolio refresh
**Cross-references:** `shared/issues/260801-1215_o_conventions-file-cites-three-records-that-do-not-resolve.md`,
`circles/260801-1244-rule-provenance-header/issues/260802-1252_o_binding-decision-formalised-while-both-existing-instances-are-dead.md`,
`rules/fusion-workbench-conventions.md` `## State Markers — decisions`

---

## What happened

The `Binding decision:` line at `rules/fusion-workbench-conventions.md:592` was written during
`circles/260801-1244-rule-provenance-header` (commit `c2c2a04`) and cites
`shared/decisions/260801-1020_a_provenance-header-on-rule-files.md`.

That path stopped resolving the same day. At Phase 3 of the same session the reconciler correctly
transitioned the record from answered to implemented, renaming it to
`260801-1020_i_provenance-header-on-rule-files.md`. The citation now points at nothing.

Nobody made a mistake. The citation was correct when written, and the rename was correct when
performed. The two are incompatible by construction.

## The general shape

A decision record's filename encodes its state (`_o_`, `_a_`, `_i_`, `_d_`, `_s_`), and its state
changes as the project makes progress. Any citation that names the record by full filename
therefore has a lifetime bounded by the record's next transition. The healthier the project, the
faster its citations rot.

This is not limited to `Binding decision:` lines. It applies to every cross-reference of a decision
record anywhere: in another decision's `Cross-references:` header, in a Circle record's
`## Dependencies`, in a spec, in a plan, in a closure note, in `CLAUDE.md`.

Three of the three `Binding decision:` citations in the conventions file are currently dead. Two
were already filed; this one broke during the session that formalised the citation form.

The ten `Provenance:` headers added by the same Circle are immune, and the reason is instructive:
four cite a Circle **directory**, whose name is deliberately stable across its whole lifecycle,
and six cite a **commit**, which never moves. Neither carries a marker. The framework already
solved this problem once, for Circles, and wrote down why: see `rules/fusion-workbench-conventions.md`
`## State Markers — circles`, on why the marker sits on the record rather than on the directory.

## Candidate directions, not decided here

1. **Cite decisions by a stable identifier** — the `YYMMDD-HHMM` stamp plus the topic slug, without
   the marker, resolved by glob at read time. Mirrors the Circle-directory solution exactly.
2. **Move the decision marker off the filename**, the way the Circle marker moved off the directory.
   Largest change; touches every prompt that globs `*_o_*.md`.
3. **Accept the rot and add a link checker** to the test suite. Cheapest, and it detects rather than
   prevents. Note this is the same shape as the presence-only limitation already accepted for the
   provenance gate, which resolves no cited path.

Direction 1 or 2 is a decision rather than a defect fix and wants a decision record if taken.

## Why this is filed in the shared store

It arose inside `circles/260801-1244-rule-provenance-header`, but it is not that Circle's defect:
the citation form predates it, the sibling issue for the two older dead links is already in the
shared store, and the problem reaches every artifact kind that cites a decision. Filing it beside
its sibling is what makes both findable together.
