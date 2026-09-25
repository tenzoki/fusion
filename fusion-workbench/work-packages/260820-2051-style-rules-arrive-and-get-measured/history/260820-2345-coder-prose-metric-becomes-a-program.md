# Coder — the counting rule becomes a committed program

**Status:** Complete
**Agent:** coder
**Date:** 2026-08-20
**HEAD at dispatch:** `a5ae642`
**Domain:** code

---

## What was asked

Step 1 of `260820-2324_*_plan-style-rules-arrive-and-get-measured.md`:
write `bin/fusion-prose-metric`, a bash and awk helper that turns the prose em-dash counting rule
from a shell line quoted inside a completed analysis into an executable, and add one `## Layout`
row for it in `CLAUDE.md`. Report and never gate. No new hook test file. No reuse of
`fencedContentLines()`.

## What was built

`bin/fusion-prose-metric <file> [<file> ...]` prints a column header, one row per file and one
total row: prose em-dash count, prose word count, rate per 1000, the number permitted at one per
1000 (`int(words / 1000)`), and a verdict of `ok` or `over`.

Prose excludes four regions, and word counts exclude the same four so a file is never credited with
the words its exhibits are made of:

1. fenced code blocks, ``` or `~~~`, fences included, indented up to 3 spaces, closed by a fence
   of the same character and at least the same length;
2. inline code spans, delimiters included, matched left to right on equal-length backtick runs;
3. block-quote lines, whole line;
4. in a `.yaml` / `.yml` file, the indentation subtree of an `examples:`, `anti_examples:`,
   `anti-examples:`, `example:` or `anti_example:` key.

The header carries the authoritative usage block and exit-code table, in the shape
`bin/fusion-count-sources` and `bin/fusion-turn-budget` use, plus the four decisions the
dispatch required it to state: that it reports and never gates (naming
`bin/fusion-staging-drift` and `bin/fusion-review-coverage` as precedent), that only `—`
U+2014 is counted and never `–` U+2013, why `fencedContentLines()` in
`hooks/lib/__tests__/helpers/citation-scan.ts` is not reused, and the two stated limits (an
indented 4-space code block is not excluded; a code span that opens and closes on different lines
is not matched).

Every `awk` run is `LC_ALL=C`. Under the German locale this session runs in, `printf "%.1f"`
printed the rate column as `29,9`; the counting itself is self-consistent either way.

## The comparison against the hand count

The spec's `## The metric` table was produced by hand and the dispatch asked for every deviation
with its cause. **All six em-dash counts reproduce exactly.** Five of the six word counts reproduce
exactly. One deviates:

| file | spec words | program words |
|---|---|---|
| `rules/agent-setup.md` | 502 | 502 |
| `rules/fusion-workbench-conventions.md` | 7753 | 7753 |
| `rules/decision-record-examples.md` | 341 | 341 |
| `rules/user-facing-output.md` | 2248 | 2248 |
| `rules/critical-stance.md` | 1557 | 1557 |
| `fusion-workbench/stilwerk/chat-voice-de.yaml` | **882** | **617** |

**The program is right and the table is wrong, and the cause is measured rather than argued.** 882
is that file's raw `wc -w`, to the word. The five markdown rows are *not* raw (`agent-setup.md`
is 533 raw against 502, `fusion-workbench-conventions.md` 8679 against 7753), so the hand count
did apply the exclusions to the markdown word counts and did not apply them to the YAML one. It
applied them to that file's em-dash count, which is how 6 raw became 2. The spec's own sentence is
"Word counts exclude the same regions", so the table contradicts the rule stated two lines above it,
in exactly one cell.

The consequences are small and none of them changes a verdict: `chat-voice-de.yaml` moves from 2.3
to 3.2 per 1000, the corpus total from 13 283 to 13 018 prose words and from 12.9 to 13.1 per 1000.
The permitted counts are unchanged, per file and in total (13). The corroborating figures both hold:
raw em-dashes over the six files total 210, and the difference of 39 against the prose 171 is the
exhibits.

From here the program is the authority. The comparison is recorded in the program's own header as
well, so a later reader meets it without needing this log.

## What the gates required beyond the two named files

`npm test` went red twice on work the plan did not anticipate, and both were real:

- **`reference-resolution-lint` found a dangling reference in my own header.** I had wrapped
  `bin/fusion-review-coverage` across a line break as `bin/fusion-review-` + `coverage`, and
  the scanner read `bin/fusion-review` as a path that resolves to nothing. Rewrapped.
- **The same gate's pinned counts moved**, which is by design and whose documented response is
  re-approval. Confirmed the whole movement is mine by removing both changes and re-running: the
  gate is green at HEAD without them. Attributed each half by removing one at a time.
  `paths 1223 -> 1235`, `records 112 -> 113`, anchors unchanged; the helper's header carries 7
  paths, the `CLAUDE.md` row 5 paths and 1 record. Baseline re-approved with the attribution note
  the file's convention requires, and `fixtures/surface-growth.golden` regenerated for the 8 lines
  that note costs.

**The hook-test growth bound: 116 lines of head-room before, 108 after.** The plan's constraint was
that no step adds a hook test *file*, and none was added. The 8 lines are the attribution note on an
existing file, and they are the smallest form that still names both contributions. Flagging the
spend because the plan treats that head-room as scarce.

One more thing the plan did not name and the tree caught: `.gitignore` line 28 is `bin/*`, so a new
helper is invisible to `git` until an `!bin/<name>` exception is added. `git status` did not list
`bin/fusion-prose-metric` at all. The exception is added, and the file is now untracked-and-visible
rather than ignored. Without it the helper would have passed every gate here and shipped in no
release, since `install.sh` reads the tarball of what is committed.

The other three growth bounds are untouched: `bin/` is in none of them and the `CLAUDE.md` row
is in none of them.

## Verification

- `bin/fusion-prose-metric $(bin/fusion-rules coder)` — exit 0, six rows and a total.
- `bin/fusion-prose-metric <file with no em-dash>` — exit 0, a zero row.
- Empty file, path containing a space, unreadable path (exit 2, other files still measured), and no
  argument (exit 1, usage) all checked by hand.
- A purpose-built fixture pair confirmed each of the four exclusions fires and that `–` is not
  counted.
- `cd hooks && npx vitest run lib/__tests__/derivable-enumerations-lint.test.ts` — exit 0.
- `cd hooks && npm test` — exit 0, 716 tests, 40 files.

## Files

- `bin/fusion-prose-metric` (new, +x)
- `.gitignore` — the `!bin/fusion-prose-metric` exception without which the helper is not committable
- `CLAUDE.md` — one `## Layout` row
- `hooks/lib/__tests__/reference-resolution-lint.test.ts` — baseline re-approval and its note
- `hooks/lib/__tests__/fixtures/surface-growth.golden` — regenerated
