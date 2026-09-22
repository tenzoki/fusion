# Does the grammar read a storeless bracket-marked citation, or does the header state the asymmetry as a decision?

---
**Domain:** code
**Filed by:** planner, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260831-0748_*_a-storeless-bracket-marked-citation-is-invisible-while-a-store-prefixed-one-is-reported.md (the defect this answers), 260830-1842_*_may-the-grammar-resolve-a-bracket-marked-record-that-a-frozen-store-keeps-permanently.md (the resolving half, not answered here), 260921-1653-open-defect-survey-at-11-9-1.md (row 4), 260921-1709-fixes-aus-der-defektbestandsaufnahme-autonom-abarbeiten.md

---

## Question

`hooks/lib/citation-scan.ts` reads the pre-v4 bracket marker in one place only, the tail of `REC_RE`, so a store-prefixed bracket citation is one whole token and reported `store-prefixed`, while the same citation without a store segment is no token at all: `BARE_RE` requires `_` after the stamp and `STAMP_RE`'s boundary refuses a `[`. The header's stated reason for the silence (reading the form would remove the pressure to run `/fusion:migrate`) holds for a workbench filename and not for a citation inside a source file, which no migration opens; a consuming project measured four of five regressions of this shape invisible. The defect's acceptance offers two routes and says the choice is not the executor's. It binds the grammar every gate and the sweep share, so it is a record.

## Options

1. **Read the storeless bracket form as a marker spelling, never as a marker.** `BARE_RE` admits `[x]` in the marker position beside `_x_`; the lookup then runs as it does for a spelled underscore marker: the record found under the wildcard form is `stale-marker` with the fix `_*_` (and the sweep rewrites it, since the result re-tokenises whole), nothing found is `dangling`. `MARKER_SLOT` is untouched, so the uniqueness measurement in `workbench-citation-lint.test.ts` and `basenameMatcher` see no new marker syntax, and a bracket-named file in a frozen store still resolves to nothing, which is the question `260830-1842_*` keeps.
   - Pros: the storeless and the store-prefixed spelling are treated alike, which is the defect's first acceptance branch; the migrate pressure is stronger, not weaker, because the token is now reported wherever it stands; the write-time check reports it too, as `stale-marker`; one regex alternative and one branch in the marker match.
   - Cons: reverses the header's stated stance and its paragraph is rewritten; a sweep now rewrites a bracket citation of a migrated record to the wildcard form, which is the correct spelling but is a rewrite the stance forbade.
2. **State the asymmetry as a decision in the header.** No code change; the header says a storeless bracket citation is deliberately invisible and a store-prefixed one deliberately reported, and why.
   - Pros: nothing moves; no test.
   - Cons: the stated reason does not reach the population that carries the form (source files), so the header would defend a silence that buys nothing there; four fifths of the reported regression stays invisible to fusion's own checker.

## Constraints

- The sweep never rewrites a token whose rewritten form the grammar cannot read back (already enforced by `readsBackWhole`).
- `MARKER_SLOT` does not widen: the uniqueness measurement reads it.
- Whether a bracket-named frozen record may be resolved stays with `260830-1842_*`; nothing here resolves one.

## Recommendation

Option 1. The header's reason was written for filenames and the case that bit is citations in code; detecting is not rewriting, and where a rewrite does happen it produces the one form every gate reads. The cost is one paragraph of header saying the stance moved and why.

---
Answered: 260921-2002_*_does-reading-the-bracket-marker-form-sweep-the-frozen-stores-or-does-the-sweep-first-learn-to-skip-them.md — option 1 of this record: `BARE_RE` admits `[x]` in the marker position, `MARKER_SLOT` untouched, and the header paragraph is rewritten to say the stance moved because the reason was written for filenames while the population that bit is citations in source files; ruled by user, Kai Stalmann <ks@qantr.com>, 260922-1420.
