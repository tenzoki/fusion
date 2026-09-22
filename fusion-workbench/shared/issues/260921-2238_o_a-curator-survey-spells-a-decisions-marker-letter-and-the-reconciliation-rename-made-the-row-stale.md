A curator survey spells a decision's marker letter, and the reconciliation rename made the row stale
---
`260918-0738-curator-run.md` (container of `260917-2253-depends-on-edges-proposed-and-confirmed`)
carries, at its line 616, a stamp with the marker letter spelled and no slug, fenced here because it is the exhibit:

```
260822-1102_a
```

The reconciliation of 260921-2230 moved that record `_a_` → `_i_` on its `Implemented:` evidence, and
the checker now reports the row `stale-marker` and counts it in `dangling` (301 → 302 over this tree,
`unedited-violations` 705 → 706). The sweep declines it (`rewrites=0`): the token is not a bare-record
form it can rewrite. The gate's verdict stays `clean` because the file was not edited, so nothing
blocks; the row is a dead pointer of the class `260816-0119_*_can-anything-carry-the-rename-to-citation-obligation-when-a-record-marker-moves.md`
describes, created by the rename that record says nothing carries.
---
**Filed by:** reconciler, Kai Stalmann <ks@qantr.com>

**Evidence path.** `node hooks/dist/citation-check.js` at the working tree above `cb8776f3`, the row
naming `260918-0738-curator-run.md` with status `stale-marker` and the remedy text "the record
now exists as … `_i_` …". Diffed against the same checker run in a clean `HEAD` worktree: this row is the
only addition.

**Why the reconciler did not fix it.** The file is an analysis, which the reconciler may not edit
(`agents/reconciler.md` `## Scope`). The line is a statement about the record's state at the time of
the survey rather than a pointer, so the conventions' own remedy applies: either fence the verbatim form
or rewrite the token to the wildcarded basename
`260822-1102_*_what-happens-when-a-planned-circles-required-work-exceeds-the-remaining-head-room.md`
(`rules/fusion-workbench-conventions.md` `## Marker globs`, the paragraph on statements about a citation).

**Acceptance.** `node hooks/dist/citation-check.js` reports no `stale-marker` row for
`260918-0738-curator-run.md`, and `dangling=` reads one lower than it did at this record's filing over
the same tree.
