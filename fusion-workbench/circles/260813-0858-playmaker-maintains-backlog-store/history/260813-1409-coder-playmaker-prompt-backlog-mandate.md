# Coder — step 2: the playmaker gains the backlog write, the mandate and the gate

**Date:** 260813-1409-coder-playmaker-prompt-backlog-mandate.md
**Status:** Complete
**Agent:** coder
**Circle:** 260813-0858-playmaker-maintains-backlog-store
**Plan:** 260813-1306_*_the-playmaker-maintains-the-backlog-store.md, step 2
**Files changed:** agents/playmaker.md (and the plan, step 2 marked `[DONE]`)

## What the step was

One coherent pass over the ten passages in `agents/playmaker.md` that asserted the old
no-write boundary on the backlog store, replacing them with the maintenance mandate, the
confirmation gate, and the `$OUT_BACKLOG` write target whose mere naming is what makes
`bin/fusion-paths` emit the key.

## The ten sites and what each became

1. **Frontmatter description.** "writes only appended … sections … plus a fully regenerated
   portfolio.md briefing and its own history log" became a four-item write list ending in
   "and the shared backlog store, which it maintains". "consolidates the shared backlog
   store" became "ranks the backlog". "Never edits plans, queues, decisions, issues,
   backlog entries, code, or data" lost "backlog entries" and gained "Never originates a
   backlog entry." The two canonical mandate sentences were written here first and are
   reused verbatim in the body. No colon was introduced into the YAML scalar.
2. **The three-things paragraph.** Now four things, the fourth being "a maintained backlog
   store at `$OUT_BACKLOG`".
3. **The write-narrow paragraph.** "advisory and write-narrow" became "advisory about
   Circles and maintaining on the backlog"; the write list gained the store; "never write
   or rename a backlog entry" became "never originate a backlog entry".
4. **The read grant.** Still one directory, not two. It now says to read the `_c_` and
   `_d_` entries as well (a deferred entry can be closed) and points at `$OUT_BACKLOG` as
   the same directory seen as a write target.
5. **The `You MAY write` list.** Gained the `$OUT_BACKLOG` row: the autonomous `_o_ ↔ _p_`
   rename, the four confirmed operations, the exclusion of filing, and a pointer to
   `rules/fusion-workbench-conventions.md` `## Backlog entries` instead of a restatement.
   **This row is the token that gives the agent the key.**
6. **The prohibition.** The blanket "Create, rename or edit a backlog entry" became two
   bullets: originate an entry, and perform one of the four operations without a
   confirmation in hand.
7. **Step 2b.** Retitled "Maintain the backlog". The four numbered activities survive:
   split now *performs* (new entries at `_o_`, original stays with marker `_c_` plus one
   appended line naming what it became, on the shaper's `Promoted:` precedent); "Name
   duplicates" became "Merge duplicates"; the non-idea rule is unchanged; ranking now
   writes itself into the entries as `_o_ ↔ _p_`. Two paragraphs were added, one for
   closing and deferring, one saying why the rename is the single autonomous write. The
   old closing line "Recommending an entry moves nothing" is gone.
8. **New section `## Two mandates, by dispatch path`.** The Phase 4 mandate and the
   interactive mandate in the description's exact words, then the mechanism: the
   confirmation, not the dispatcher, decides; two channels, disjoint; a run holding neither
   performs nothing; no standing grants. Left open at the end for step 4's subsection.
9. **The dispatch-source list.** Three sources, each carrying its mandate. "read-only mode
   is the default" is gone — it was never true of the ranking write and is now false twice
   over.
10. **The history-log field list.** Gained a five-part "every backlog write you performed"
    bullet and a bullet for operations proposed but not performed, plus a line saying git
    is the undo, so the log records what happened and never a before-state.
11. **Boundary notes.** Two added: against `/fusion:memo` (the user's filing surface) and
    against `shaper` (whose close is part of promotion, and whose path does not reach a
    `_d_` entry). The `vs taskplanner` note is untouched, as the step required.

One eleventh passage moved with them, not on the issue's list: the portfolio's
`## Backlog — ranked` description said the indented split shows "what filing the pieces
would produce", which assumes the user files them. It now says what the split would produce
and that the user can confirm it.

## The merge sentence

The step's hardest line is where authorship meets "no agent originates a backlog entry".
What the prompt now says, in Step 2b item 2:

> **What you write when you merge is a consolidation, not an idea.** Every sentence in a
> merged entry traces back to something somebody already filed; the moment you would add a
> thought the store does not hold, you have filed an entry, and filing is not yours.

It states the permission as a property of the *text* rather than as an exception to the
bound, so a reader holding `rules/fusion-workbench-conventions.md` `## Backlog entries`
finds it consistent rather than merely non-contradictory.

## The mechanical result

`bin/fusion-paths playmaker` now emits `OUT_BACKLOG=shared/backlog` alongside
`SCAN_BACKLOG=shared/backlog`. Before the change it emitted only the read key. Nothing in
`bin/fusion-paths` was touched: the key set is derived by one grep over the consumer's own
prompt, and naming `$OUT_BACKLOG` in the write list is the whole of the change.

## One correction during the step

The first draft cited the binding decision by its full Circle-relative path, which names
the `decisions/` type folder and fails `path-literal-lint.test.ts`. Rewritten to the bare
wildcarded record filename plus the Circle directory, which is the form the rest of the
prompt already uses.

## Verification

`cd hooks && npx vitest run` — exit 1. 1012 of 1014 tests pass. The two failures are the
ones the plan predicts and neither is this step's to fix:

- `rules-emission-golden.test.ts` — red since step 1 grew `fusion-workbench-conventions.md`
  from 49 992 to 51 925 bytes. Step 8 regenerates the fixture deliberately.
- `fusion-paths.test.ts` → *gives playmaker the read key and withholds the write key* —
  fails on `expected 'shared/backlog' to be undefined`, which is exactly the assertion this
  step is meant to invalidate. Step 6 inverts it.

The five lint gates the step's own acceptance criterion names are green:
`portfolio-citation-form-lint`, `path-literal-lint`, `marker-format-lint`,
`glob-nomatch-lint`, `reference-resolution-lint`.

Not committed — the user commits at a green checkpoint.
