The sweep's residual is grouped by file, and both helpers name a corpus file once

---
**Filed by:** coder, Kai Stalmann <ks@qantr.com>
**Checkout:** 5e8248d7
**Status:** Complete

Two `coderev` defects from review
`260901-0325-coderev-the-citation-mechanism-v10-20-0-to-v10-21-1.md`, both in
`hooks/citation-sweep.ts` and one of them naming `hooks/citation-check.ts` as the other side.

## `260901-0322_*_the-sweeps-residual-list-is-sorted-by-line-number-across-every-file-not-in-file-order.md`

`residual` was one flat `[line, col, row][]` declared above the per-file loop and printed through
`residual.sort((a, b) => a[0] - b[0] || a[1] - b[1])`. No file key, so a 2 914-row list came out
ordered by line number across the whole corpus while the header promised "in file order".

The array now holds rendered rows and the sort moved inside the loop: each file collects its own
`here` list, sorts it by line and column (the walk runs bottom-up so the splices leave earlier
columns valid), and appends it. Corpus order comes from the file loop, which is
`markdownFilesUnder()`'s `rel`-sorted order plus the extras and the declared paths in the order
`main()` builds them — the same order the `<file>  rewrites=<n>` census lines above the residual
already used. The acceptance's first branch, not its second: the header's claim is now true and
stays.

## `260901-0324_*_the-checker-and-the-sweep-key-file-exemptions-on-two-different-spellings-of-the-same-file.md`

`scanCitationTokens()` opens with `rel in RECORD_EXAMPLE_FILES` (and `RETIRED_LAYOUT_FILES`), so
the `rel` a caller passes is the exemption key. `citation-check.ts` builds it project-root-relative
throughout; `citation-sweep.ts` built `relative(cwd, realpathSync(abs))`, which made the sweep's
file-wide exemptions fire only when it was launched from the project root.

The sweep now names every corpus file `relative(projectRoot, abs)` through one local `relOf()`,
used by the sweep pass and the repair pass alike, as scan key and display name both. `projectRoot`
is `dirname(root)` — already computed for `loadConfig()` and `declaredCitationFiles()` — so this is
the anchor the checker's own corpus is built against, not a third normalisation at the call site.
No realpath is taken for the naming, because the checker takes none either and every abs path here
is built lexically from `--root` or from an argument; `real()` still serves guard (a) and the
declared-path deduplication, which compare paths rather than name them.

`citation-check.ts` needed no code change and got none. It gained one header paragraph under
`## Corpus` stating that its spelling *is* the scan key and why the sweep now shares it, so the
next reader of either file finds the coupling stated rather than inferred. Nothing in
`hooks/lib/citation-scan.ts` was touched: three sibling coders held that file and the shared
tables, and the fix did not need to reach them.

## Measured, before and after, on this repository's own workbench

`hooks/dist/` still held the pre-change build, so the two were run side by side (new build in a
private staging directory, never synced into the shared `dist/`).

| | old | new |
|---|---|---|
| summary line | `files=0 rewrites=0 residual=2914 …` | byte-identical |
| residual rows, sorted and diffed | — | identical multiset, reordered only |
| files whose rows sit in non-contiguous blocks | 557 | 0 |
| line inversions within a file | — | 0 |
| first residual row from `hooks/` vs from the root | `../fusion-workbench/…` vs `fusion-workbench/…` | identical |

The release gate's pinned summary line is untouched, which the table's first row is the direct
evidence for.

## Tests

`lib/__tests__/citation-sweep.test.ts`, two cases added and three assertions corrected:

- the residual case writes two records in one directory, the alphabetically first carrying its
  stamp on line 5 and the second on line 1, so a flat line sort inverts them; it asserts the two
  rows in corpus order.
- the exemption case writes `rules/decision-record-examples.md` at the project root, passes it as a
  `<path>` argument and dry-runs from the project root and from the workbench, asserting
  `rewrites=0` from both. Before the fix the second launch reports `rewrites=1`.
- the first case's three row assertions now expect the project-root spelling
  (`fusion-workbench/shared/decisions/…`); it runs with cwd set to the workbench, so it was the one
  place the old cwd anchoring was pinned. The `--write` case at the project root already asserted
  the new spelling and is unchanged.

+36 lines of hook test, against a shared 2 500-line budget three siblings were spending in the same
batch.

## Verification

`node <private-staging-runner> lib/__tests__/citation-sweep.test.ts
lib/__tests__/fusion-citation-check.test.ts` — exit 0, 24 tests, including the release gate
(`--dry-run` over this repository reports `rewrites=0`). The full suite was not run and
`hooks/dist/` was not rebuilt: both are the orchestrator's, once the batch lands.
