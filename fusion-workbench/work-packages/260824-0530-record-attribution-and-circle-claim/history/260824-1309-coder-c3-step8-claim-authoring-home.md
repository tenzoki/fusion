# C3 step 8 — the claim's authoring home in `agents/orchestrator.md`, and shaper's two fields at creation

**Status:** Blocked
**Agent:** coder
**Date:** 2026-08-24
**Plan:** `260824-0613_*_c3-attribution-on-records-and-a-claim-on-the-circle.md`, step 8

## What was written

`agents/orchestrator.md`

- `## Circle head fields` opens on three fields rather than two, and points at
  `rules/circle-records.md` `### The claim field` for the claim's two literal openings.
- The table gains two rows: the `_a_`→`_t_` activation writes the `Claimed ` form with its person
  and checkout from `bin/fusion-identity` (`PERSON=`, `CHECKOUT=`); the `_t_`→terminal transition
  writes `Unclaimed`, in the same command that clears `.active-circle` (Phase 4 step 4).
- One paragraph under the table states why the claim's rows carry no condition where the
  neighbouring `**Active spec/plan:**` row does, cites the route-dependence defect in its narrowed
  260823 form (open, both routes agreeing on both Circles measured, divergence with no measured
  instance), and declares the two rows plus the paragraph the **authoring home for both
  performers**, which is what step 10 cites from `skills/next/SKILL.md` instead of restating.
- The Boundaries bullet enumerating writable record content now names three head fields, so the
  claim write is inside the permission rather than outside it.
- Phase 4 step 3's "No head field is written at closure" was false once the claim exists; it now
  says the one field a closure moves and points at step 4. Step 4 carries the write.

`agents/shaper.md`

- The anticipated-circle frontmatter fill writes `**Filed by:** shaper (anticipated-circle mode),
  <person>` from `bin/fusion-identity` `PERSON=` under `rules/fusion-workbench-conventions.md`
  `### Who filed it` (which owns the exit-code obligations; not restated here), and
  `**Claim:** Unclaimed`, the value an `_a_` Circle carries.

The route-dependence defect is **not** closed: its subject is `**Active spec/plan:**`.

## Measurements

- `agents/*.md`: 404 137 -> 407 098 bytes (+2 961, cap +3 000; acceptance ceiling 407 137).
- hook-test surface: 20 375 -> 20 376 lines, budget 20 375. **Over by one.**

## Why this is blocked

The two new citations move the reference-resolution lint's pinned counts (paths 1305 -> 1310,
anchors 181 -> 183, records 119 -> 120), which forces a baseline re-approval. The re-approval's
accounting note is one line, as required — but the hook-test surface stood at exactly its budget
before this step, so one line is one line too many. The dispatch's premise ("its accounting note
must be one line") was off by one: at 20 375 of 20 375 there is room for no line at all.

Not done, deliberately: no growth baseline was moved, no note was folded onto an existing line to
dodge the line count, and no comment elsewhere in the file was re-wrapped to reclaim a line. The
plan's own risk row for this case says the executor stops and reports and that the way out is a cut
in a commit that names it. That cut is not in this step's file scope.

`npm test` from `hooks/` — exit 1, one failing test, the hook-test growth bound at 20 376 of 20 375.
Everything else in the suite is green, including the path-literal lint, the workbench citation gate
and the `agents/` byte bound.
