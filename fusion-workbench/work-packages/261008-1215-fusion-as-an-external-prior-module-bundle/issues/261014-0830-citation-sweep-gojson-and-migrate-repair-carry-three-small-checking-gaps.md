Citation sweep, gojson and migrate repair carry three small checking gaps
---
Three Low defects, reported by the delegated pass over the carried 13.0.0 files and not re-read by the reviewer.

1. `hooks/citation-sweep.ts:900-906` deduplicates declared paths against the corpus but not explicit `<path>` arguments, so a path inside `fusion-workbench/` is counted twice in `files=` and `rewrites=`.
2. `codec/src/prior/gojson.ts`: the `GO_TIME` regex (`:330`) accepts trailing-zero fractions and any `±HH:MM`, where the doc (`:338-339`) says times Go would not write are refused. `goQuote` (`:316-318`) writes a lone surrogate as `\udxxx`, where Go writes U+FFFD.
3. `hooks/migrate.ts` (around line 597) maps any exception from `applyRepair` to exit 9, "backup does not verify", an ordinary I/O error included.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Cross-references:** `261014-0830-reviewer-closing-pass-over-the-prior-module-bundle-package.md`

Fix direction: deduplicate explicit paths through the same `inCorpus` set; tighten `GO_TIME` to Go's RFC 3339 output and refuse lone surrogates; give exit 9 only to a failed backup verification and another code to other exceptions.

Acceptance: a sweep census with `fusion-workbench/x.md` passed explicitly counts it once; `gojson` tests refuse `…T00:00:00.10Z` and a lone surrogate; a thrown I/O error in `applyRepair` exits with a code other than 9.
