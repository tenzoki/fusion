The weight helper's test pins the banner and the exit code, while the measurement goes unasserted

---
`hooks/lib/__tests__/claude-md-weight.test.ts` is the only test that reads
`bin/fusion-claude-md-weight`. Its nine cases assert: the exit status on seven invocations, three
banner regexes, `writes=none` on three shapes, the line count of the two single-line shapes, and the
last two lines of the weighed shape. **No case reads a figure the helper computed.**

The helper's own header states clauses the test does not reach. Each was checked by mutating a copy
of the helper in a scratch directory and reading the nine cases' assertions against its output; all
nine hold for each mutant.

- *"Rows are largest first"* (header, line 32). Changing `sort -k1,1nr -k3` (line 197) to `-k1,1n`
  reverses every report. Nothing asserts an order.
- *"every section is printed — `over` and `under` is how the threshold is marked"* (line 32).
  Printing only the over-threshold rows passes. The one assertion that touches rows is line 129,
  `expect(out.filter((l) => /^ {2}(over|under) /.test(l)).join("\n")).not.toMatch(/topic/i)` — which
  is satisfied by the empty string, so it holds when no row is printed at all.
- *"`heading-level=` is printed for exactly that reason"* (line 86). Deleting `echo
  "heading-level=$level"` (line 216) passes; clause 5 reads `out.slice(-2)` and clause 4 the last
  line, neither of which moves.
- *"The preamble … is a row of its own, so the rows sum to the file"* (lines 32-35). No case checks
  `bytes=`, `lines=`, `headings=`, or that the rows sum to anything.
- The trailing-newline correction (lines 156-159 and 183) is the helper's most delicate arithmetic
  and neither fixture exercises it: `HEAVY` and `CLEAN` both end in `\n`.
- *"Lines inside a ``` fence are not headings"* (line 91). No fixture contains a fence.

One clause is pinned only by an assertion that holds under its own inversion.
`expect(run("--threshold", "not-a-number").status).toBe(0)` (line 81) sits in the exit-code case, and
every path of this helper exits 0, so the assertion is true whether or not the digit check at lines
127-129 exists. Removing that check does not fail the suite and does change the output: `awk -v
t="not-a-number"` compares `$1 > t` as strings, every row loses, and the helper reports
`claude-md=clean … threshold=not-a-number over=0` for a file it never weighed.

The measurement itself is correct at HEAD — a fence, a `#`-only file, a file with no trailing
newline and an empty file were each run against the helper by hand and each answered correctly, and
the byte totals equal `wc -c`. The finding is that nothing holds it there.

**Acceptance test:** a case asserts the row order, a case asserts that a section under the threshold
is printed and marked `under`, and a case asserts a byte figure against a fixture whose expected
division is stated — or a record says which of the header's clauses are deliberately unpinned and
why.

---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
Cross-references: `260827-0410_*_the-machine-written-event-rows-ship-with-wiring-asserts-only-because-the-hook-test-surface-is-full.md` (the same shape, on the same surface, and the surface stands at zero margin again).

---
Resolved: four cases added to `hooks/lib/__tests__/claude-md-weight.test.ts`, +77 lines, funded by a
head-room raise the user ruled on a measured figure. One fixture serves six clauses and is stated as
arithmetic rather than transcribed — a preamble of 11 bytes over 3 lines, a section of 36 over 5
carrying a fenced line that looks like a heading, a section of 48 over 2, totalling 95 over 10 — so
the rows-sum-to-the-file property falls out of two cases instead of needing a third.

Each case is proved by mutation rather than asserted: reversing the row sort, printing only
over-threshold rows, making the second pass fence-blind, cutting at the shallowest level seen at all
rather than twice, deleting the heading-level line, dropping the no-trailing-newline correction, and
dropping the threshold's digit check. All seven failed exactly the case that claims them, and the
helper was restored byte-identical afterwards. The last of the seven is the clause this record showed
was pinned only by an assertion true under its own inversion.

The per-clause fixture shape was measured at roughly 25 lines dearer in duplicated scaffolding and
buys sharper failure messages only. The record's escape hatch — a record naming which clauses stay
unpinned — was not taken, because the user funded the assertions instead.
