In a fresh clone the coverage read takes carried= from a review picked by checkout order, not the newest one
---
`bin/fusion-review-coverage` picks the review that `carried=` comes from by file mtime. A fresh clone gives every file nearly the same mtime, set in checkout order, so in FJ05 step 13 `carried=` named an obligation from a review seven days older than the last review over C. The verdict line is not affected.
---
**Filed by:** analyst, Kai Stalmann <ks@qantr.com>
**Severity:** low. `verdict=` reads `uncovered` only, so step 13's acceptance item holds. The wrong part is the `carried=` scope a reader is told to open next.
**Found by:** analysis `261009-1626-fj05-release-candidate-verification-at-052932e2.md`, log `07-review-coverage.log`

**Evidence.**
- Run in a scratch clone of `47cf5289`: `bin/fusion-review-coverage --since cd1b5522 --head 052932e2` prints `verdict=covered` and `carried=hooks/dist/order.js`, `carried-from=` the review `261002-0926-reviewer-closing-pass-over-the-markdown-and-json-formats.md`, which belongs to another package. The newest review over the range is `261009-1624-reviewer-coverage-pass-over-4e1e1b47-to-052932e2.md` (`not-opened=none`). Taken as the source, it would print no `carried=` line.
- `hooks/lib/review-coverage.ts`, in the function that builds the report: review files are sorted by `b.mtime - a.mtime`, and `carried` is taken from the first usable row ("The obligation, from the newest review that could be used at all").
- `stat` in the clone: the 261002 review's mtime is `1791556016.778`, the 261009-1624 review's is `1791556016.776`. Checkout order wrote the older one 2 ms later.
- The same thing happens in any fresh clone, CI checkout or `git worktree add`, and after any operation that rewrites files in bulk.

**Acceptance.** In a fresh clone of `47cf5289`, `bin/fusion-review-coverage --since cd1b5522 --head 052932e2` prints no `carried=` line, or prints one drawn from `261009-1624-reviewer-coverage-pass-over-4e1e1b47-to-052932e2.md`. A test fixes the order with equal mtimes and two reviews whose basename stamps differ.
