# Closure drift repair: three items the reconciliation named

**Status:** Complete
**Agent:** coder
**Circle:** 260908-1410-cut-skills-surface-add-post-body
**Filed by:** coder, Kai Stalmann <ks@qantr.com>

## What was dispatched

A repair pass over the three drift items in `260908-1814-reconciliation.md`, each named with a record. Not a
free hand over the tree: `skills/cleanup/SKILL.md` and `skills/post/SKILL.md` were explicitly out of scope,
the defects inside them staying open for whoever takes them.

## Item 1 — the Layout row's skill split

`CLAUDE.md` `## Layout`, the `skills/<name>/SKILL.md` row, enumerated three administrative bodies, three
pipeline steps and seven situational names: thirteen against fourteen directories, with `post` in neither
group. It was the third statement of that split in one file, and no lint reads it because it names bare skill
names rather than `/fusion:` tokens.

**The row stops enumerating**, which is the second branch of the record's acceptance test and the answer the
`templates/` and `docs/` rows in the same table already took. It points at the skill-bodies bullet under
`## What this is` as the one enumeration, names `ls -1d skills/*/` as the set, and keeps the reason it
drifted so a later reader does not restore an inventory. Making the copy agree would have left three
statements of one split with the lint hole still open on the next change.

Record closed: `260908-1814_*_the-layout-rows-skill-split-still-reads-three-and-three-and-omits-post.md`,
`_o_` → `_c_`.

## Item 2 — two open defects whose citations went stale under them

`260908-0849_*_the-twenty-line-cap-counts-a-draft-that-is-never-the-file-that-gets-written.md` and
`260908-0850_*_two-selector-names-share-one-step-and-the-coupling-runs-in-only-one-direction.md` carried eight
`skills/cleanup/SKILL.md:NNN` citations. Both defects survive verbatim in `skills/post/SKILL.md`, where this
Circle moved the passage; the reconciler annotated that and left the bodies alone.

**Re-pointed by heading anchor, with no line number written back.** `rules/fusion-workbench-conventions.md`
`## Filename Patterns` says living text cites a file by heading anchor and never by line number, because an
edit above the line moves it silently and no gate resolves `path:N`. A defect record open across a refactor is
living text by exactly that test, and these two records are the demonstration: five citations followed the
passage into another file, and `:54-55` stayed in the file it named and still slipped five lines to 49-50
under an edit above it. A re-pointed line number would have been a citation with a known expiry date.

The split runs across two files and the table in the second record says so per row: the selector vocabulary
and the `--skip claude-md` coupling stayed in `skills/cleanup/SKILL.md`, the two invocation shapes are written
in both bodies. Two quoted strings in the first record were refitted to the moved wording, and its framing
sentence about the step carrying no executable block was corrected — the new home does carry one, and what it
lacks is an assignment to `$DRAFT`. **Both markers stay `_o_`.** Every gap, the exact-count-versus-ceiling
question and the two undefined selector combinations are untouched.

## Item 3 — the reader doc's second copy

`docs/messages-between-checkouts.md` restated the twenty-line cap and the entry filename in prose.
**Cut, and the doc cites instead** — the first branch of that record's acceptance test. Three reasons, in
increasing weight, and the full reasoning is in the record's `Resolved:` line rather than here:

1. The doc had already ruled the question for itself two sections below, in
   `## Where the mechanism is written down`, for `bin/fusion-forum`'s header.
2. The copy did not merely risk staleness; it replicated an open defect verbatim. `260908-0849_*_the-twenty-line-cap-counts-a-draft-that-is-never-the-file-that-gets-written.md` holds
   that the cap's arithmetic is stated two ways, exact count and ceiling, and the doc carried the same
   construction — so resolving that defect in the body would have left a second page asserting the retired
   reading. The page exhibited both readings at once: its own worked example is ten lines.
3. This session filed two defects that are exactly the second-statement failure.

The counter-argument — a reader page that gives no number is worse for its reader — is answered rather than
overruled: the page still says a cap exists, still names the three parts in order, and still shows the worked
example. What went is the arithmetic, which only the writing procedure needs. A stale pointer in the same
file went with it, `## Where the mechanism is written down` having named the message half of the cleanup body
where the body is now `skills/post/SKILL.md`.

Record closed: `260908-1814_*_the-reader-doc-restates-the-twenty-line-cap-and-the-filename-shape-outside-the-one-body.md`,
`_o_` → `_c_`.

## Verification

`cd hooks && npm test` — the **full** suite, not a hand-picked set, which is what the closure found no
dispatch in this Circle had run.

First run: 1 failed / 924 passed, `reference-resolution-lint` reporting 1702/243 against a pinned 1700/241.
**Attributed by single-file revert**, not by reading the diff: with `docs/messages-between-checkouts.md`
reverted and every other edit still in place the gate read green, so the whole movement is that one file and
the `CLAUDE.md` row contributed nothing. The doc gained two path-and-anchor pairs by replacing two
restatements with citations; its Layout row gained only a bare-anchor self-reference, a shell glob and a
storeless wildcard record citation, none of which this gate resolves. Baseline re-approved in place at
1702/243, one line rewritten and none added.

**No growth baseline moved and none could:** no bounded surface was edited. `docs/`, `CLAUDE.md` and the
workbench records are outside all four collectors, and the one hook-test edit is a rewrite in place, which is
the unit that bound measures. No golden was rebuilt.

Second run, on the tree as it stands: **53 files, 925 tests, exit 0.**

## Files changed

- `/Users/k1/Projects/productive/fusion-news/CLAUDE.md`
- `/Users/k1/Projects/productive/fusion-news/docs/messages-between-checkouts.md`
- `/Users/k1/Projects/productive/fusion-news/hooks/lib/__tests__/reference-resolution-lint.test.ts`
- the four records named above

Nothing was committed; the orchestrator commits.
