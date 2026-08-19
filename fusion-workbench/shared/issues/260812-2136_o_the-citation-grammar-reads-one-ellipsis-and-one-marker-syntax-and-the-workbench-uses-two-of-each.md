The citation grammar reads one ellipsis and one marker syntax, and the workbench uses two of each

---
Measured during step 11 of the Circle-first placement plan, 260812, on the first run of the
class-(c) citation parser over `fusion-workbench/**`. Two spellings the corpus uses in quantity
are not in the grammar, and each fails in its own direction: one manufactures dangling citations
that are not dangling, the other hides a retired syntax behind an accidental resolution.

---
**Witness:** the citation baseline, `shared/planning/260812-1720_*_circle-first-placement-and-the-backlog-store.md`
`## Reconciliation Log`
**Severity:** medium — the counts the baseline is stated in are wrong by a measured amount in
both directions, and a standing gate built on this grammar would report the same way
**Affected:** `hooks/lib/__tests__/helpers/citation-scan.ts`, and through it
`hooks/lib/__tests__/reference-resolution-lint.test.ts`

**1. ASCII `...` is not read as a truncation, and `…` is.** The grammar treats `…` as "any
infix", which is how a truncated citation resolves. A citation truncated with three ASCII dots
falls through to a literal match, finds nothing, and is reported dangling. **54 tokens in the
workbench**, every one of them a false positive in the dangling count. Verified on
the citation of `issues/260717-0030_*_…` written with three ASCII dots in place of the
ellipsis, which the parser reports as `dangling` while the record it names is on disk.

**2. The pre-v4 bracket marker `260717-1918[o]` has no case at all.** **171 occurrences** in the
workbench. What happens to them depends on whether a store prefix is in front, and neither
outcome is right:

- with a prefix, `planning/260717-1918[o]_slug.md` tokenises as `planning/260717-1918`, because
  `[` ends the character class. That prefix-matches the real file and is counted **resolved** —
  the marker was never read, so a stale one in this spelling can never be found.
- bare, `260717-1918[o]` tokenises as the stamp alone and lands in the undecidable residual.

The two are one defect and are filed together because the fix is one decision, not two: the
grammar currently enumerates the spellings it accepts and silently reinterprets the rest. That is
the same shape as `shared/issues/260812-1407_*_the-reference-lint-misses-the-lib-spelling-so-three-of-four-citations-into-deleted-modules-stood.md`,
where a path spelling outside the enumeration was skipped rather than reported, and that record's
closing line applies here unchanged: widening the pattern by two cases leaves the third to be
found the same way.

**Cheapest correct fix, and the reason it is not obviously right.** Adding `\.\.\.` beside `…`
and a `\[[a-z*]\]` alternative beside `_[a-z*]_` is a two-line change and would move 54 tokens out
of the dangling count and let the marker be read in 171 more. But the bracket form is *retired
syntax* — teaching the parser to accept it removes the only pressure to rewrite it, and the
migration step that would have rewritten those thirteen occurrences in one file
(`shared/planning/260812-1720_*_circle-first-placement-and-the-backlog-store.md` step 12) does not
run, because the gate before it answered "move nothing". So the choice is between a parser that
reads a retired spelling and a corpus that keeps one, and that is a decision rather than a patch.

**Not to be fixed silently.** Whichever way it goes, the baseline count in the plan's
reconciliation log moves, and the record of the move belongs beside it.

---
**Reconciliation 260817-1836** (reconciler, domain `code`, HEAD `2552586`; log `shared/history/260817-1836-reconciliation.md`). Filed as a defect and reading as a decision. The record itself concludes that the choice is between a parser that reads a retired spelling and a corpus that keeps one, and offers no fix, only the fork. Both facts still hold at HEAD: `hooks/lib/__tests__/helpers/citation-scan.ts:87` and `:93` recognise only the single-character ellipsis and only the underscore marker form. Surfaced in this pass under "Misfiled — should be a decision"; relocating it is the user-s move, not a reconciler-s. Marker stays open in the meantime.
