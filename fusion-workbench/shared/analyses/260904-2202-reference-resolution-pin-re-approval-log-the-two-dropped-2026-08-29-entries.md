# The reference-resolution pin's re-approval log, the two dropped 2026-08-29 entries

**Date:** 2026-09-04 22:02
**Type:** Record
**Status:** Complete
**Requested by:** the acceptance clause of `260904-2044_*_two-pin-re-approval-entries-were-dropped-instead-of-rolled-into-the-log-the-header-prescribes.md`
**Filed by:** bugfixer, Kai Stalmann <ks@qantr.com>, checkout 5e8248d7

## What this is

The third roll of the attribution log that `hooks/lib/__tests__/reference-resolution-lint.test.ts`
keeps at `const BASELINE`. The first roll,
`260822-1318-reference-resolution-pin-re-approval-log-entries-1-to-25.md`, states the convention and
the decision that chose it (`260822-1229_*_where-does-the-reference-resolution-pins-re-approval-attribution-log-live.md`,
option 2); the second, `260824-2121-reference-resolution-pin-re-approval-log-entries-26-to-40.md`,
followed it unchanged. Nothing here restates either.

**This one is a repair, not an ordinary roll.** On 2026-09-04 the pin's trailing comment was capped
at three entries and its oldest two were deleted rather than rolled, on an instruction that was
written without reading the header first. The two entries below are those two, put where the header
says older entries go. Nothing in the pin's numbers changed with the drop and nothing changes with
this recovery: they are attribution, and the chain of counts they carry was already continuous
through the entries that stayed.

## Why these two carry no entry numbers

The two existing rolls are named for the ordinal span they hold. This one is not, and the omission
is deliberate. Ordinals here would have to be counted off a chain that is no longer a straight one:
entries below `const BASELINE` are chained inside three long comment lines by two different
connector spellings (`Previous: ` and `Earlier: `), the three lines are not in chronological order
with each other, and the chain of `paths` transitions has at least one gap the file does not
explain (the entry ending at 1336 is followed by one opening at 1517). Deriving a position for these
two would mean auditing that whole chain, and asserting one without the audit is exactly the bare
cardinality `rules/critical-stance.md` forbids. They are named for their date instead, which is
enough for the pin's comment to point at them.

## Reading these entries

Both are reproduced from `hooks/lib/__tests__/reference-resolution-lint.test.ts` at `git:d5a27230`,
the last commit that held them, where each stood as a chained continuation of the single comment
line at `const BASELINE` rather than as a comment line of its own. Two consequences, stated rather
than quietly repaired:

- The ` Previous: ` connector that chained them into that line is not part of either entry and is
  not reproduced. Neither is a `//` prefix, because at `d5a27230` neither entry had one.
- The grammar entry opens `2026-08-29` at `d5a27230`; when it stood as its own comment line, at
  `git:3276b1e1`, it opened `Re-approved 2026-08-29`. The chaining dropped that word. It is
  reproduced below as it stands at `d5a27230`, the commit the defect record names, and the earlier
  spelling is recorded here instead of being folded silently into the text.

Everything else is byte-identical to the commit: the citation-sweep entry matches its own standalone
form at `git:a60d1fea` exactly, checked by diff, and the grammar entry matches its standalone form
at `git:3276b1e1` in every byte after that one opening word.

Chronological order: the grammar entry first, at `paths` 1544, then the citation-sweep entry which
moves `paths` off 1544.

## The entries, verbatim

```
2026-08-29 (Circle 260828-2342 Turn 2 task R1, the grammar's marker slot and stamp boundary): stampBare 12 -> 11, paths and anchors unmoved. Three shares, all in `hooks/lib/citation-scan.ts` comment lines and each measured by running the old and the new grammar over the old and the new text: -1 for the header's `260806-0015_*_<slug>.md`, which the widened `BARE_RE` now reads as one placeholder-exempt `bare-record` where the old grammar stopped at `_*_` and counted the stamp bare; -1 for the pre-v4 example `260717-1918[o]_slug`, no token at all now that `STAMP_RE` refuses a `[` after the stamp; +1 for the `**Date:** 260801-1355` example in the new head-field paragraph, a bare stamp on a comment line (the `head-field` exemption reads a line's own head, and a comment line has none).

Re-approved 2026-08-29 (Circle 260828-2342 Turn 3 task G1, `bin/fusion-citation-sweep` ships): paths 1544 -> 1552, anchors and stampBare unmoved. The +8 is every citation of the new helper: with `bin/fusion-citation-sweep` removed from the tree the count returns to exactly 1544. By single-file revert the shares are `CLAUDE.md` -4 (its new Layout row and the reworded checker row), `README-hooks.md` -2, `docs/upgrading-to-v10-20.md` -2, `bin/fusion-citation-check` -1, `skills/help/SKILL.md` -1, which sum to 10 rather than 8; the two reverted rows reintroduce the retired `hooks/scripts/citation-sweep.mjs` path, dangling, and that is not a resolved path either way, so the over-count is the single-file method and not a citation.
```
