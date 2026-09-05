# The three store-prefixed patterns gain a left anchor and a closed rooting enumeration

**Date:** 260830-2153
**Status:** Complete
**Agent:** coder
**Filed by:** coder, Kai Stalmann <ks@qantr.com>
**Plan:** `260830-1841_*_citation-mechanism-four-defect-repair.md`, step 2
**Decision realised:** `260830-1841_*_where-may-a-store-prefixed-citation-begin-and-which-rooting-forms-does-the-grammar-name.md`, option 2

## What changed

`hooks/lib/citation-scan.ts`, plus the regenerated `hooks/dist/`. No test file
was touched: the whole suite passes on the changed grammar as it stands, so
nothing in it pinned the behaviour this step deliberately changed.

Three source fragments are introduced and are the only structural addition:

- `CIRCLE_DIR`, `[0-9]{6}-[0-9]{4}-[a-z0-9-]+`. It was written out twice, once
  inside `SWEEP_DIR_RE` and once inside `REC_RE`, and the two copies were the
  same shape only by inspection. `SWEEP_DIR_RE` is now built from it, which is
  what keeps the rooting enumeration and `circleDirs()`'s archive index reading
  one set.
- `LEFT_ANCHOR`, `(?<![A-Za-z0-9._\/-])`. The same question `BARE_RE` and
  `STAMP_RE` have always asked in front of a stamp, asked in front of the three
  patterns that never asked it. `.` is in the class as well, so the `./` of a
  rooted path is claimed by the rooting and never by a second match starting one
  character in.
- `ROOTING`, `(?:\.{1,2}\/)*(?:fusion-workbench\/)?(?:archive\/<CIRCLE_DIR>\/)?`.
  The closed set of left contexts a store-prefixed citation may carry, read off
  `rules/fusion-workbench-conventions.md` `## fusion-workbench Layout` rather
  than guessed. No capture: the rooting is what the token has to SPAN, not what
  the citation names.

`REC_RE`, `CIRCLE_REC_RE` and `CIRCLE_RE` each open with both fragments.
`CIRCLE_RE` was a regex literal and is now built the same way as its two
siblings, so all three read from one definition.

`REC_RE`'s container group gains a third alternative, the bare Circle directory:
`(?:(circles\/<dir>)\/|(shared)\/|(<dir>)\/)?`. That is what makes
`<dir>/<store>/<record>` one token spanning its own rooting instead of two
overlapping hits, the directory as a `stamp-name` and the record behind it as a
`record`.

At the `REC_RE` call site the destructuring gains that group and the `segment`
string reported by the `store-prefixed` violation names the bare-directory case:

    const [full, circleDir, shared, bareDir, store, stamp, restRaw] = m;
    const container = circleDir ?? shared ?? bareDir ?? "";
    const segment = `${container}${container ? "/" : ""}${store}/`;

The plan named the silent index shift as an explicit risk, since it would have
misreported `segment` in every `store-prefixed` violation.

The file header's grammar section states the boundary rule once, in three
paragraphs: where a store-prefixed citation begins and which rootings it may
carry, what the absence of a left bound cost, and why the bare Circle directory
is in the enumeration.

## Why

The three patterns carried no left boundary at all, so a store name was
recognised wherever it stood: inside a longer word (`myplanning/…`,
`mycircles/…`) and behind a foreign path alike (`pytorch/issues/…`,
`vendor/circles/…`). A rewriter splices at the token's own `col`, so everything
left of the store segment survived glued to the rewritten basename. One
consuming project measured 468 such sites.

With no left bound the question reduces to "is this arbitrary path a workbench
path", which the token text cannot answer, so the mechanism changed rather than
the approximation improving (`rules/critical-stance.md` §4). Asked as a rooted
path drawn from a closed enumeration of literals the layout defines, it is
decidable from the token text alone.

No fix inside `rewriteOf()` could have worked. That function cannot recover a
prefix the token never covered, which is also why the bare Circle directory had
to enter the enumeration rather than being handled downstream.

## Verified

All four of step 2's acceptance criteria, each run once at the end.

1. `cd hooks && npm test` exits **0**: 805 of 805 cases over 47 files,
   `workbench-citation-lint.test.ts` and `reference-resolution-lint.test.ts`
   included. The two pinned baselines in the latter did not move; the `.ts`
   sources under `hooks/lib` are `recordsOnly`, so the header's new record
   citation is checked for resolution and counts in no pinned class.

2. The probe, one line per case. The first five yield no tokens at all; each of
   the last three yields exactly one `record` token spanning the whole citation.

   ```
   pytorch/issues/260101-1200_o_x.md                            (no tokens)
   myplanning/260101-1200_o_x.md                                (no tokens)
   docs/subhistory/260101-1200-note.md                          (no tokens)
   mycircles/260101-1200-widget-bar                             (no tokens)
   vendor/circles/260101-1200-widget-bar/_t_circle.md           (no tokens)
   260801-1244-guard-rules-write/issues/260101-1200_o_x.md
       record  store-prefixed  col=0  len=55/55  whole span
   see fusion-workbench/circles/260801-1244-guard-rules-write/issues/260101-1200_o_x.md
       record  store-prefixed  col=4  len=80/84  whole citation, the `see ` is not part of it
   ./fusion-workbench/shared/issues/260101-1200_o_x.md
       record  store-prefixed  col=0  len=51/51  whole span
   ```

3. `bin/fusion-citation-check` over this repository, every figure it prints, and
   beside it the same corpus read with the HEAD grammar. The baseline was taken
   by running `d2e90ba9`'s compiled `hooks/dist/` from a scratch copy against
   this working tree, so the two readings are the same corpus and differ only in
   the grammar. Nothing in the corpus moved: the checker reads `.md`, and this
   step touched a `.ts` source and its build.

   | key | HEAD | after | delta |
   |---|---|---|---|
   | `anchor` | `workbench-root` | `workbench-root` | — |
   | `root` | `.` | `.` | — |
   | `files` | 1735 | 1735 | 0 |
   | `tokens` | 17705 | 17651 | -54 |
   | `judged` | 14003 | 14002 | -1 |
   | `resolved` | 13475 | 13474 | **-1** |
   | `dangling` | 246 | **246** | 0 |
   | `store-prefixed` | 0 | **0** | 0 |
   | `undecidable` | 2430 | 2430 | 0 |
   | `exempt` | 1554 | 1501 | -53 |
   | `verdict` | `violations` | `violations` | — |

   `dangling=246` and `store-prefixed=0` are unchanged and `resolved` fell by
   exactly 1, which is what the plan predicted: the one bare-Circle-directory
   site in this repository merges two hits into one. The other 53 tokens that
   stopped tokenising were **all** exempt before, which is why no violation
   figure moved.

4. `bin/fusion-citation-sweep --dry-run` last line:
   `files=0 rewrites=0 residual=2783 record=0 circle-record=0 circle-dir=0
   bare-record=0 stamp-bare=0 mode=dry-run`. The gate on this criterion does not
   fire. Stronger than the criterion asks: the whole dry-run output is
   byte-identical to the HEAD grammar's over the same tree, so no token in this
   repository became rewritable and none stopped being reported as residual.

## Owed, and not done here

The decision record
`260830-1841_*_where-may-a-store-prefixed-citation-begin-and-which-rooting-forms-does-the-grammar-name.md`
stands at `_a_` and the plan has it reaching `_i_` in this commit. The dispatch
forbade committing, so the hash the `Implemented:` footer must cite does not
exist yet; the rename and the footer belong to whoever commits this step.
