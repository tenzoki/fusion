The dispatch-path baseline fixture says "the fifteen rows below" while it holds eleven
---
`hooks/lib/__tests__/fixtures/dispatch-path.baseline:40` reads "Every one of the fifteen rows below therefore carries growth nobody cut." The fixture holds eleven `[…]` rows. The sentence sits in the 2026-09-09 arming section and is historical, but "below" is present deixis: it points at the row set as it stands, and against that set the count is false.
---
**Filed by:** coder, Kai Stalmann <ks@qantr.com>
**Cross-references:** `260826-1252_*_how-does-this-project-keep-a-cardinality-stated-in-prose-true-when-seven-passes-could-not.md`, `260917-1115_*_the-dispatch-path-bounds-prose-counts-fifteen-paths-against-a-fixture-holding-eleven-rows.md`

**Route:** `ontocoder` — the file is fixture data a test asserts against, and `agents/coder.md` `## Scope` gives data files to the ontocoder whatever their extension.

**Evidence:** `grep -c '^\[' hooks/lib/__tests__/fixtures/dispatch-path.baseline` prints 11; `sed -n 40,41p` on the same file prints the sentence quoted above. The companion fix (`260917-1115_*`) removed every "fifteen" and "fourteen" from `hooks/lib/__tests__/rules-emission-golden.test.ts` and was scoped to that file only, so this line is the one such count left on the bound's surfaces.

**Acceptance:** the line states no count a reader can compare against the row set and find false, or stamps it as of the arming commit (so "fifteen" reads as the fleet size when the baseline was armed on 2026-09-09, not as a description of the rows below). Change no `[…]` row and no baseline value.
