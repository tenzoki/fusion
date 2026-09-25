# Rows 1 through 9 of the cut ledger, taken out of eight shipped skill bodies

**Status:** Complete
**Filed by:** coder, Kai Stalmann <ks@qantr.com>

Plan steps 1 through 6 of `260908-1612_*_cut-the-skills-surface-and-add-the-post-step-body.md`, against the ledger
`260908-1346-the-cut-ledger-for-the-skills-surface-and-what-the-post-body-owes.md`. Row 10 and the new body were
out of scope and were not touched; step 7's measurement against the plan's expected total was left to the dispatcher.

## What changed

Eight skill bodies, and no rule file, no `CLAUDE.md`, no doc and no growth baseline.

| Row | Site | Span before | Span after | File net | Ledger predicted |
|---|---|---|---|---|---|
| 6 | `skills/migrate/SKILL.md` carve-out | 2 226 | 946 | −1 280 | −1 313 |
| 1 | source-root preamble, four bodies | 5 162 | 2 334 | −2 828 | −2 950 |
| 5 | `skills/archive/SKILL.md`, three spans | 2 335 | 1 207 | −1 128 | −1 418 |
| 9 | language preamble, three bodies | 1 553 | 425 | −1 098 | −869 |
| 2 | `skills/setup/SKILL.md` layout bullets | 1 048 | 443 | −553 | −563 |
| 3 | `skills/setup/SKILL.md` Step 0j rationale | 1 010 | 450 | −560 | −516 |
| 4 | `skills/setup/SKILL.md` Step 0k fetch reasons | 554 | 195 | −359 | −380 |
| 7 | `skills/next/SKILL.md` relay provenance | 608 | 379 | −229 | −254 |
| 8 | `skills/cleanup/SKILL.md` exit-code bullets | 353 | 227 | −126 | −181 |
| | **Total** | | | **−8 161** | −8 444 |

Per file: `setup` 52 406 → 50 358, `next` 27 604 → 26 049, `migrate` 26 620 → 25 340, `archive` 26 978 → 25 850,
`cleanup` 25 871 → 25 027, `help` 16 919 → 16 321, `curate` 12 398 → 12 072, `direct` 10 613 → 10 231. The
`skills/*/SKILL.md` total moves 259 495 → 251 334.

Every ledger before-figure reproduced exactly against this tree, except row 3's sub-line span at 1 010 against the
ledger's 1 014 and row 9's `curate` site at 467 against 466.

## Where a row missed its predicted net, and why

- **Row 5, 290 short.** The marker-vocabulary replacement has to carry three heading anchors (about 170 bytes of
  pointer text before a word of prose) and the terminal-state claim that safety filter 2 rests on, so it landed at
  627 against the ledger's drafted 472. The three anchors are spelled with the em-dash the tree uses, not the colon
  the ledger's verification table spells.
- **Row 9, 229 beyond prediction.** The one-line form in `skills/news/SKILL.md` measures 141 bytes, where the
  ledger drafted 217 per site.
- **Rows 1, 8 and 4** each land short by 50 to 120 because the replacement keeps the body's own consequence
  sentence: which steps of the cleanup pipeline break, which fault each resolver exit code names, that fetching
  stays the user's move.

## What was deliberately kept

`skills/migrate/SKILL.md`'s language paragraph, excluded from row 9 by the plan. Step 0k's output branches, Step 0e's
per-block prelude, archive's safety filters and tier tables, next's Step 5b relay mechanics, cleanup's selector table,
and every shell block. Row 6 cites `rules/workbench-path-resolution.md` without a heading anchor and names the
paragraph in prose, because no permitted spelling addresses that carve-out.

## Verified

`cd hooks && npx vitest run lib/__tests__/reference-resolution-lint.test.ts lib/__tests__/path-literal-lint.test.ts
lib/__tests__/derivable-enumerations-lint.test.ts lib/__tests__/workbench-citation-lint.test.ts` — exit 0, 93 tests.

The reference-resolution gate's pinned path count moved 1 713 → 1 692 and was re-approved in place, attributed by
single-file revert one file at a time: `migrate` −3, `setup` −7, `help` −2, `next` −4, `direct` −3, `curate` −3,
`archive` +1, `cleanup` 0. The one increase is archive's marker section now citing `rules/circle-records.md`, which
it never named while it carried its own table. No growth baseline moved and the surface-growth golden was not
regenerated; it is expected to disagree until plan step 16
(`260815-2322_*_can-a-commit-stand-green-on-its-own-when-the-golden-is-a-per-file-inventory-of-a-multi-file-turn.md`).

`bin/fusion-prose-metric` on each of the eight: every one already read `over` at HEAD and still does. The absolute
em-dash count fell in seven and held in one; the rate rose in five, because the prose shrank faster than its dashes.
The one em-dash pair this work introduced, in archive's terminal-state sentence, was rewritten away.
