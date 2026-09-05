# The sweep's residual list is sorted by line number across every file, not in file order

---
`hooks/citation-sweep.ts` promises the residual "in file order" and sorts one flat array by line
then column, so rows from unrelated files interleave by line number. Predates the reviewed range.
---
**Filed by:** coderev, Kai Stalmann <ks@qantr.com>

## The defect

`hooks/citation-sweep.ts:582` declares `residual` once, outside the per-file loop, and
`hooks/citation-sweep.ts:610` prints it as
`residual.sort((a, b) => a[0] - b[0] || a[1] - b[1])`. The sort keys are line and column with no
file key, so a 2 800-row residual is ordered by line number across the whole corpus. The header's
output section says "then the residual (every bare stamp the scanner judged, **in file order**)".

## Evidence, at `dcdca34c`

`node hooks/dist/citation-sweep.js --dry-run` from the repository root, three consecutive rows:

```
…/260801-1122_c_spec-normative-consolidation.md:852  '260817-1836'  ambiguous
hooks/lib/citation-scan.ts:860  '260805-0709'  resolved
…/260815-1524_c_retired-tasklist.md:873  '260806-1152'  ambiguous
```

Three files in three rows, ordered 852, 860, 873. The list is unreadable as a per-file residual,
which is what a reader is being handed it for.

Introduced at `a60d1fea`, so it ships in v10.20.0 and is older than the range this review covers.
It is filed here because that is the pass that opened the file.

## The acceptance test

The residual rows are grouped by file, in the corpus order the census lines above them use, and
ordered by line within a file. Or the header stops saying "in file order".

---
Reconciled 260905-2015 (reconciler, HEAD `5b84b13a`): still open, unmoved.

`hooks/citation-sweep.ts:593` still declares `residual` once, above the `for (const abs of files)` loop
at `:594`, as `[number, number, string][]` — line, column, rendered row, and no file key. `:621` still
prints it as `residual.sort((a, b) => a[0] - b[0] || a[1] - b[1])`. The header at `:196` still promises
"in file order".

Reproduced: `node hooks/dist/citation-sweep.js --dry-run` over this repository reports `residual=2870`
and the rows interleave across unrelated files by line number — three consecutive rows from this run
name a shared history file, a shared decision and a Circle issue.

Neither branch of the acceptance is taken: the rows are not grouped by file and the header still makes
the claim.

---
Resolved: 12dee877 — residual now holds rendered rows and the sort moved inside the per-file loop, so corpus order comes from the file loop, the same order the census lines above it already use. Measured old build against new over this workbench: identical row multiset, reordered only; 557 files had their rows in non-contiguous blocks before and none has now; zero line inversions within a file. The release gate summary line is byte-identical.
