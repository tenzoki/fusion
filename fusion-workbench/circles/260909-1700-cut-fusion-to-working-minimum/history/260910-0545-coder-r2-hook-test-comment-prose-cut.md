# R2 — the second room-making pass over the hook test comment prose

**Filed by:** coder, checkout 5e8248d7 (Kai Stalmann <ks@qantr.com>)
**Task:** R2, the second pass of the room-making step whose first pass landed at `9c4dbdbb`
**Status:** Complete

---

## What was asked

Free at least a further 250 lines of hook-test surface, under R1's rule: remove comment
prose that is **duplicated elsewhere**, name the surviving copy for every block removed,
and leave standing anything that is its own only home however verbose. R1 freed 247 of the
500 it was asked for and stopped, leaving 15 lines of head-room against a budget of 23 266.

## What landed

**250 lines freed, exactly.** Hook tests 23 251 → 23 001 lines; budget 23 266
(floor 20 766 + 2 500 head-room, neither moved); **265 lines of head-room remain**, up from
15. 31 files edited, none of them a baseline map: `surface-growth-bound.test.ts` and
`helpers/growth-bound.ts` were not touched at all, per the task's exclusion. The only
non-`.ts` change is `fixtures/surface-growth.golden`, regenerated with
`UPDATE_SURFACE_GOLDEN=1`; that file's own header states that regenerating it moves no
baseline and clears no bound.

Every block removed is cited to the copy that survives it — a rule file, an issue or
decision record, a `bin/` script header, a module doc comment, `CLAUDE.md`, or another
comment in the same file. Nothing was paid out of prose with no second home.

The largest single seam was **prose that a rule file already claims as its single authoring
home**: `rules/commit-lock.md`, `rules/circle-records.md`, `rules/rule-file-provenance.md`,
`rules/context-manifest.md`, `rules/backlog-entries.md` and
`rules/fusion-workbench-conventions.md` each carried, verbatim or near enough, a paragraph
a test header was restating. The second largest was `CLAUDE.md`'s Layout rows for the
`bin/` helpers, which say of several helpers that the script's own header is the
authoritative documentation — and the test files were restating the header rather than
pointing at it.

One block was duplicated **inside its own file**: `fusion-commit-lock.test.ts` carried the
parallel-load timing narrative twice, at the head of the file and again at the noclobber
case, both of them also in issue `260810-1135_*`.

## Verification

`cd hooks && npm run build && npm test` — exit 0, 979 passed, 57 files.

Assertion counts (`it(` plus `expect(` tokens) checked **per file** against HEAD for all 31
edited files: identical in every one. No test behaviour changed.

## What the survey found nothing in

Named so the next decision rests on a survey rather than a guess: `citation-sweep.test.ts`,
`session-start-subdirectory.test.ts`, `citation-grammar-boundaries.test.ts`,
`archive-filter-key.test.ts`, `declared-citation-paths.test.ts`, `session-start-event.test.ts`,
`fusion-session-domain.test.ts`, `identity-mint-notice.test.ts`, `fusion-events.test.ts`,
`config.test.ts`, and the untouched remainder of `helpers/guard-harness.ts`. Each is either
already pointer-shaped or is the only home of what it says.

## The seam is thinner, not exhausted

R1 took 247, R2 took 250, and the second pass had to reach outside the thirteen files the
task nominated to find them. What is left in the surveyed files is measurement written down
where it was taken, case-by-case rationale, and negative-control reasoning — the classes
the rule protects. A third pass at this size would have to pay out of those.
