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
