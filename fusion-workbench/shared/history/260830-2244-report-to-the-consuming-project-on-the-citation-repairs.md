# Session: the report to the consuming project

**Date:** 2026-08-30 22:44
**Agent:** analyst
**Status:** Complete
**Filed by:** analyst, Kai Stalmann <ks@qantr.com>
**Domain:** code
**Task:** step 7, the last step, of `260830-1841_*_citation-mechanism-four-defect-repair.md`

## What was done

Wrote one analysis report at
`260830-2241-citation-mechanism-repairs-reported-to-the-consuming-project.md`
in the shared analysis store, in English, for a reader at `unite-co-creator` who has fusion
installed and has never read fusion's workbench. Marked step 7 `[DONE]` in the plan. Nothing
under `hooks/` or `bin/` was opened for writing, and nothing was committed.

The report carries, in this order: a terms paragraph defining workbench, record, stamp, marker,
store, Circle, frozen store, citation and store-prefixed citation before any short form is used;
one Mermaid flowchart placing the three programs and the four defect sites; the four defects, each
with its measurement, the commit that repaired it and what deliberately did not change; the
tripwire and the reason it is one property rather than an enumeration; the two open records; the
consumer's own two moot notes; and the update sequence.

## Three things the report says that the dispatch did not spell out

**The rewriter's `--repair` pass does not undo defect 1's damage.** Its three classes are a
self-naming date field, a chained tail and a doubled marker (`hooks/citation-sweep.ts`,
`## The repair pass`); a spliced path prefix is none of them. So a consuming project whose tree
already carries the 468 corrupted sites has its git history as the recovery path and no fusion
helper. Stated in the report as an inference, marked as one, since it was reasoned from the class
list and not run against that project's tree.

**The verdict-line split is stamped, not carried forward.** The dispatch gave the split as 311
rows; the record that took the measurement gives 312 at `32fe0d49`, and 65 + 191 + 56 + 0 sums to
312. The report uses the record's figure with its commit stamp and says the total moves with every
record filed, which is why today's reading is 311. A cardinality is derived or stamped
(`rules/critical-stance.md` §5).

**The three-alternatives table for defect 4 names what each gave up**, since the dispatch said the
consumer may have expected the commit lock to change and the reason it did not is specific to each
alternative: the measured hash, the append-only log, the single author of a staging list.

## Verification

- `cd hooks && npm test`: exit **0**, 47 test files, **806 of 806** tests passed, 14.89 s.
- `bin/fusion-citation-check`, run from the repository root by absolute path, exit 0. Twice, and
  both readings are given because the corpus grew between them. With the report in the corpus and
  this log not yet written: `files=2348 tokens=22203 judged=17670 resolved=16988 dangling=311
  store-prefixed=0 undecidable=3157 exempt=1747 verdict=violations`. With both in the corpus:
  `files=2349 tokens=22206 judged=17672 resolved=16990 dangling=311 store-prefixed=0
  undecidable=3157 exempt=1748 verdict=violations`. **No row names either file**, checked by
  grepping the row listing for both basenames. `dangling` and `store-prefixed` did not move across
  either step (311 and 0 throughout).
- `bin/fusion-prose-metric` over the report: 0 em-dashes in 3579 prose words, permit 3, `ok`.
- `bin/fusion-citation-sweep --dry-run`:
  `files=0 rewrites=0 residual=2784 record=0 circle-record=0 circle-dir=0 bare-record=0
  stamp-bare=0 mode=dry-run`. The pinned `rewrites=0` holds with the report in the tree.

Every fixture-shaped and probe-shaped path in the report is fenced, per the issue
`260830-2235_*_the-fabricated-name-exemption-keys-on-the-literal-foo-so-every-realistic-probe-fixture-is-read-as-a-real-citation.md`.
Inline backticks are not an exemption in this grammar, so no verbatim form was quoted in one.

## What was not done

No code, no data, no ontology. Nothing under `hooks/` or `bin/`. No issue filed: every actionable
finding of this plan is already a commit, a decision record or an issue. No commit, by instruction.
