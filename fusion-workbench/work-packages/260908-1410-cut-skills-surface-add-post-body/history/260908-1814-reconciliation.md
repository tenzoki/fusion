# Reconciliation — 260908-1814

**Status:** Complete
**Domain:** `code`
**HEAD:** `ee99a578`
**Circle:** `260908-1410-cut-skills-surface-add-post-body`
**Filed by:** reconciler, Kai Stalmann <ks@qantr.com>

## Counts

| Store | Reviewed | Updated |
|---|---|---|
| Plans | 1 in the Circle, 4 shared | 1 (`Status` to Complete, marker `_o_` → `_c_`, reconciliation log) |
| Issues | 3 in the Circle, 8 in the prior Circle's store, 19 shared live | 3 annotated, 2 filed new |
| Decisions | 1 in the Circle, 3 live in the prior Circle's store, 31 shared live | 1 annotated |
| Reviews | 0 in the Circle | — |

**The inventory bound is stated rather than assumed.** `bin/fusion-cadence-anchor changed-files
last_reconcile_commit` exits 4, so no proven delta narrowed the pass. Records were opened by live marker
across every path in `SCAN_PLANS`, `SCAN_ISSUES`, `SCAN_DECISIONS` and `SCAN_REVIEWS`, plus this Circle's
history in full. The shared store's ninety-odd terminal records were not re-opened; the prior pass
(260908-0027, HEAD `9d99b19d`) covered them and nothing in this Circle touched their subjects.

## Verification: every step verified against the tree, not against its mark

All seventeen `[DONE]` marks in `260908-1612_*_cut-the-skills-surface-and-add-the-post-step-body.md` are
correct. Four things the plan's own acceptance tests do not reach are recorded below.

**The claim the Circle rests on holds.** The message composition contract exists once in the executable
text. The twenty-line cap, the 1/blank/≤8/blank/≤9 split with its chat and artifact halves, the
`wc -l`-before-the-put rule and the `<stamp>-<checkout>-<slug>` filename are each in
`skills/post/SKILL.md` and in no other skill body; `skills/cleanup/SKILL.md` `### The message half` reads
and performs that body and keeps only four facts that are cleanup's own. Grepped over `skills/`, `docs/`,
`README*.md` and `CLAUDE.md` rather than read off the two files.

**The arithmetic reconciles independently.** `wc -c skills/*/SKILL.md` = **256 658**. The five step figures
sum from 259 495 with no residual: −8 161 −1 050 +6 137 +221 +16 = −2 837. Every intermediate lands where a
step reported it (251 334 → 257 471 → 256 421 → 256 658). Free is 3 956 of the 260 614 budget. The golden's
`[skills bytes]` block equals the disk figures line for line, and `git diff 94a262b0` over the two files
holding the four baseline maps is empty. `npm test` run alone exits 0; run concurrently with a second copy
of itself it reproduces the two load-sensitive cases already filed as
`260908-0032_*_two-hook-tests-are-load-sensitive-and-fail-only-in-the-parallel-full-run.md`.

**The three named prose statements and the executor's fourth are corrected**, each read on disk:
`CLAUDE.md` `## What this is` at "Four further bodies" and "Two of those four selectors";
`README-agents.md` at "Four more bodies in the table" and the single `/fusion:post` row; and release step 0
now scoping its universal to "The checks above it", with "four version surfaces" and "A fifth thing" both
still true.

**The ruling was not quietly reversed.** `post` is absent from `CLAUDE.md`'s situational list and from
`docs/fusion-intro.md`'s command table; `docs/fusion-intro.md` gained `--only forum` in the step list and
kept its eight-step count.

## Key findings

1. **A fifth prose statement went false and nobody named it.** `CLAUDE.md`'s
   `skills/<name>/SKILL.md` row in `## Layout` still splits the roster three / three / seven and omits
   `post` from both groups — thirteen names against fourteen directories, in the same file that was
   corrected twice. No lint reads it, because it names bare skill names rather than `/fusion:` tokens.
   Filed as `260908-1814_*_the-layout-rows-skill-split-still-reads-three-and-three-and-omits-post.md`.
2. **The relocation carried two open reviewer defects out from under their own citations.**
   `260908-0849_*_the-twenty-line-cap-counts-a-draft-that-is-never-the-file-that-gets-written.md` and
   `260908-0850_*_two-selector-names-share-one-step-and-the-coupling-runs-in-only-one-direction.md` cite
   `skills/cleanup/SKILL.md` at eight line numbers between them that now name other text. Both defects
   survive verbatim in `skills/post/SKILL.md`. Annotated in place with the new home; markers stay `_o_`.
   The plan owed nobody this re-pointing, which is the general shape worth noticing: a passage moved
   "without change of substance" moves every open record about it.
3. **The contract exists once in the skill bodies and twice in the tree.**
   `docs/messages-between-checkouts.md` restates the cap and the filename in prose. It predates the Circle
   and writes nothing, so it cannot make two entry points disagree — only make the doc stale. Filed as
   `260908-1814_*_the-reader-doc-restates-the-twenty-line-cap-and-the-filename-shape-outside-the-one-body.md`.
4. **The masked-gate record's evidence is sound and its mechanism is one link longer than it states.**
   `git show b0705cc4` carries the five literal-marker citations, so the citation-sweep gate was red from
   the commit that filed the plan through `22d6f839` and `02533218`. But no intermediate dispatch ran the
   full suite at all — each of the four coder logs reports a hand-picked `vitest` subset, and
   `citation-sweep.test.ts` is in none of them. The deferred golden did not make a second red unremarkable;
   it made a full-suite run pointless, so no run existed in which the second red could appear. The record's
   own acceptance test already covers that, since naming the one expected failure only means anything
   against a full run.
5. **The pointer-swap decision's second instance is accurately described**, verified against the Circle
   record and the plan on disk, with one wording correction: the two plans refuse in the same substance and
   two independent wordings, not "in the same words". The correction strengthens the observation.
6. **The orchestrator's session history file is unfinished.** `**Status:**` reads In progress and
   `## Per-Turn Log` reads "(none yet)" after a Circle that ran to its last step. `bin/fusion-events turns`
   exits 4 for this history file, so the Turn count is `unavailable` rather than zero — the session may
   have emitted no `session_start` naming it. Not the reconciler's to write; reported for the orchestrator.

## Tracking files updated

- `.../planning/260908-1612_c_cut-the-skills-surface-and-add-the-post-step-body.md` — Status Draft →
  Complete, marker `_o_` → `_c_`, `## Reconciliation Log` appended
- `.../issues/260908-1800_o_three-commits-shipped-a-red-citation-sweep-gate-because-an-expected-red-golden-masked-it.md`
  — verification note, marker stays
- `circles/260907-0829-.../issues/260908-0849_o_...` and `.../260908-0850_o_...` — relocation notes,
  markers stay
- `circles/260907-0829-.../decisions/260907-2003_o_...` — reconciliation note, marker stays `_o_`
- `.../history/260908-1530-orchestrator-session.md` — `## Coherence` appended

## Filed

- `260908-1814_*_the-layout-rows-skill-split-still-reads-three-and-three-and-omits-post.md`
- `260908-1814_*_the-reader-doc-restates-the-twenty-line-cap-and-the-filename-shape-outside-the-one-body.md`

## Not found

No plan step was marked done that was not done, and no work landed that no mark records. No misfiled
record: every item opened is a defect or a question in the store its vocabulary belongs to.
