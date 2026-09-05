# A bracket-marked citation is read whole, and no rewrite may escape the grammar

**Date:** 260830-2206
**Status:** Complete
**Agent:** coder
**Filed by:** coder, Kai Stalmann <ks@qantr.com>
**Plan:** `260830-1841_*_citation-mechanism-four-defect-repair.md`, step 3
**Left open on purpose:** `260830-1842_*_may-the-grammar-resolve-a-bracket-marked-record-that-a-frozen-store-keeps-permanently.md` stays `_o_`

## What changed

`hooks/lib/citation-scan.ts`, `hooks/citation-sweep.ts`, and the regenerated
`hooks/dist/`. No test file was touched: the whole suite passes on the changed
grammar and the changed sweep as they stand, so nothing in it pinned the
behaviour this step deliberately changes. No golden was regenerated, since no
test-file line count moved.

**Half one, the grammar.** `REC_RE`'s tail character class gains `[` and `]`:

    ([0-9]{6}-[0-9]{4})((?:MARKER_SLOT)?[A-Za-z0-9._…*\[\]-]*)

That is the whole of the widening. `BARE_RE`, `STAMP_RE`, `MARKER_SLOT` and
`basenameMatcher` are untouched, so such a token is still never **resolved**,
only reported. The header's not-read-on-purpose paragraph gains a section
saying so: the stance is preserved and sharpened rather than overturned, since
the citation is now reported as one whole token instead of half of one, which
is more pressure to run the migration than less. A second, shorter note sits at
`REC_RE` itself, naming the tail as the one place in the grammar that reads a
bracket marker at all.

**Half two, the sweep.** `rewriteOf()` splits in two. `candidateFor(hit)` is the
old switch, unchanged. `rewriteOf(scanner, hit)` computes the candidate and then
gates it through `readsBackWhole()`, which scans the rewritten string alone on a
line with the run's own scanner and accepts it only when that scan yields
exactly one hit whose token is the whole string, whose kind is in `GATE_KINDS`
and whose status is not `exempt`. Otherwise the token is left exactly as it
stands. The call site passes the scanner `main()` already created.

The file header gains a `## The visibility guard` section carrying the property,
the reason it is asked of the output rather than of the shapes that produce it,
and the cost.

## Why

Before this step, a store-prefixed citation of a pre-v4 bracket-marked record
tokenised as the store segment plus the bare stamp, with the tail invisible:

```
cite shared/issues/260519-0438[o]-loader-check.md now
    record  store-prefixed  token='shared/issues/260519-0438'
cite 260519-0438[o]-loader-check.md now
    (no tokens)
```

The sweep then rewrote what it could see to the bare stamp and left
`[o]-loader-check.md` standing beside it. After that rewrite `STAMP_RE`'s
boundary refuses the result entirely, so the token stopped being reported at the
same moment it stopped resolving: a violation the checker had been naming left
the checker's output because the sweep created a shape the grammar cannot see.
The consuming project that reported this has 21 bracket-named `.md` files in its
`archive/` and 205 in its `.migration-v2-backup/`.

The guard is deliberately not an enumeration of bracket shapes. A rewrite that
the grammar cannot read back is strictly worse than no rewrite, whatever shape
produced it, so the question is asked once of the output and subsumes every
future shape rather than the two known today (`rules/critical-stance.md` §2).
It is plan step 6's property enforced at the one place a rewrite happens.

**Cost.** The guard runs per candidate rewrite, and only after a candidate
exists: a token the rewrite table leaves alone never reaches it. It re-walks
neither index, because it uses the run's one memoised scanner rather than
making a fresh one, so `workbenchIndex()` and `circleDirs()` are already built
when it is called. Measured over this repository's 2326-entry index, 2000 guard
scans cost 96 ms, about 48 µs each. The repository's own dry run is unchanged at
1.17 s wall (1.175 s before, 1.169 s after), which is expected rather than
lucky: it produces no candidate rewrite at all, so the guard never fires. A dry
run over the same index plus a scratch file of 2000 rewritable citations reads
1.29 s, and the difference is the 2000 guard scans plus the scan of the file
itself.

## Verified

All five of step 3's acceptance criteria, each run once at the end against the
final build.

1. `cd hooks && npm test` exits **0**: 805 of 805 cases over 47 files.

2. The probe, both lines, over the new grammar. The bracket citation is one
   token spanning the whole path, status `store-prefixed`:

```
L1 col=5 kind=record status=store-prefixed token='shared/issues/260519-0438[o]-loader-check.md'
L2 col=4 kind=record status=store-prefixed token='shared/issues/260101-1200_o_x.md'
```

3. A scratch git work tree holding the bracket line in its own file: the dry run
   reports **no** rewrite for it, and after `--write --yes` the file is
   byte-identical (md5 `be448d9832a936dba0933f80a473bfac` before and after, and
   `git status --porcelain` names only the other file).

4. The same scratch run over the ordinary line still reports **one** rewrite,
   `files=1 rewrites=1 residual=0 record=1 … mode=write`, and the line reads
   the storeless basename with the marker wildcarded (the fixture's own name,
   quoted in the fenced probe output above and not repeated here as a pointer).
   The guard did not suppress the ordinary case.

5. Over this repository, both helpers run from the repository root with absolute
   paths. The sweep's last line:

```
files=0 rewrites=0 residual=2783 record=0 circle-record=0 circle-dir=0 bare-record=0 stamp-bare=0 mode=dry-run
```

   and every figure the checker prints, beside the reading taken before this
   step over the same tree:

   | key | before | after |
   |---|---|---|
   | `anchor` | `workbench-root` | `workbench-root` |
   | `root` | `.` | `.` |
   | `files` | 1736 | 1736 |
   | `tokens` | 17658 | 17658 |
   | `judged` | 14005 | 14005 |
   | `resolved` | 13477 | 13477 |
   | `dangling` | 246 | **246** |
   | `store-prefixed` | 0 | **0** |
   | `undecidable` | 2430 | 2430 |
   | `exempt` | 1505 | 1505 |
   | `verdict` | `violations` | `violations` |

   Not one figure moved. This repository's workbench carries no bracket-marked
   store-prefixed citation and no rewritable token, so the widening reaches
   nothing here and the guard suppresses nothing here either.

## Owed, and not done here

The dispatch forbade committing, so `hooks/dist/` is regenerated and staged by
nobody; whoever commits this step carries it. The bracket-resolution decision
stays `_o_` by instruction, and the property test that would catch the next
escaping rewrite is plan step 6, whose 120-line budget this step did not spend.
