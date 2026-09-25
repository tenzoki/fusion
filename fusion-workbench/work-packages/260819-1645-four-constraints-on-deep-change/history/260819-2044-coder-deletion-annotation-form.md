# coder — write down the deletion and archival annotation form (plan step 4)

**Date:** 2026-08-19
**Agent:** coder
**Circle:** 260819-1645-four-constraints-on-deep-change
**Plan:** `260819-2016_*_four-constraints-on-deep-change.md`, step 4
**Source decision:** `260805-1548_*_wie-soll-ein-circle-verschwinden-duerfen-den-jemand-absichtlich-loescht.md`
**Status:** Complete

## What was done

Added one section to `rules/circle-records.md`, `### Deletion is outside the vocabulary, and
the annotation sits on the references` (lines 67–123), realising the operative half of decision
`260805-1548`. It states four things:

1. A deliberately deleted Circle leaves no directory, no record and no marker, and archival is a
   different operation that preserves its target at a new path.
2. The vocabulary deliberately has no marker for the case, because a marker sits on the record and
   the record is deleted with everything else.
3. The obligation sits on the surviving references. An instruction inside the object cannot survive
   the object — the triggering case had exactly that and lost it.
4. The annotation form, as a stated literal that plan step 7 reuses:
   `Deliberately deleted YYMMDD: Circle `<stamp>`, `<directive-slug>`.` It **replaces** the dead
   citation rather than standing beside it, and carries stamp and slug in separate spans so no
   store path survives — a surviving path would dangle for reader and lint alike whatever the
   sentence beside it said. A reader recognises it by the literal opening `Deliberately deleted `.

The section closes with the reachability residual, stated rather than papered over: this file is
emitted to `orchestrator`, `playmaker` and `shaper` only, so a human deleting a Circle by hand
reads none of it, and the `/fusion:circle-delete` the decision's closing paragraph left open stays
open.

## Deviation from the plan, on instruction

Step 4 also calls for an `Implemented:` line on the decision record and an `_a_` → `_i_` rename.
The dispatch reserved both for the orchestrator, which holds the marker transitions this session.
The decision record was read as source and not written.

## Verification

- `cd hooks && npx vitest run lib/__tests__/provenance-header-lint.test.ts` — exit 0.
- `cd hooks && npx vitest run lib/__tests__/provenance-header-lint.test.ts lib/__tests__/reference-resolution-lint.test.ts` — exit 1, one failing assertion and it is the pinned `BASELINE`,
  which the dispatch reserved for a later consolidation pass. The gate's other assertion, that no
  reference in the shipped text dangles, passes: every token the new section adds resolves.

## Measured baseline movement

`BASELINE` in `hooks/lib/__tests__/reference-resolution-lint.test.ts` moves
`paths 1178 -> 1179` and `records 102 -> 104`; `anchors` does not move. Attributed to this file by
reverting it alone and rerunning the gate, which was green at 1178/155/102 both before the edit and
with the edit reverted. Per token:

- paths +1: `bin/fusion-rules`, in the residual paragraph naming the three emitted-to agents.
- records +1: `260819-1400-reconciliation-circles.md`, the measured six broken
  citations from the `260817-1907` archive sweep.
- records +1: the binding-decision citation of `260805-1548` at the section's foot.

Deliberately spelled so that nothing else enters the count. The worked example's stamp
(`260802-2220`) is a bare stamp, which the parser classifies as the residual `stamp-bare` and never
judges or counts; the slug sits in its own span so the pair never forms a `stamp-name` token; and
the form's placeholders (`<stamp>`, `<directive-slug>`) carry the placeholder exemption.

## Budget

None consumed. `rules/` is outside the three bounded growth surfaces and `rules/circle-records.md`
is a conditional emission, not part of the always-on floor.
