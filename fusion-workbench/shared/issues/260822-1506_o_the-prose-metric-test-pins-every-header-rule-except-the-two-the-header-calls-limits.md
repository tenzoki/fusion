The prose-metric test pins every header rule except the two the header calls its limits

---

`7c9e3f1` added `hooks/lib/__tests__/fusion-prose-metric.test.ts`, whose own preamble states its
purpose:

> these tests drive the real script and pin what that header states rather than what the awk under it
> does: the em-dash count, the prose word count, the four regions that are not prose, the narrowing to
> U+2014, and the exit-code table.

Every item on that list is pinned, and the numbers reproduce by hand from the header's rules. What is
not pinned is the paragraph the header sets aside under its own heading, two lines below the four
regions.

---

**The two limits.** `bin/fusion-prose-metric:69-73`:

> Two limits, stated rather than discovered. An indented (4-space) code block is NOT excluded — the
> corpus uses fences throughout, and a 4-space rule would swallow the continuation lines of every
> nested list. A code span that opens on one line and closes on another is not matched, because the
> scan is per line; its backticks stay literal and its content counts as prose.

Neither has a test. Both are behavioural statements of the same kind as the four regions, and both are
the kind that changes under a plausible edit: somebody adding indented-block support, or making the
span scan multi-line, would make the header false and the suite would stay green. The header calls them
"stated rather than discovered", which is precisely the claim a test is for — a stated limit that
nothing holds is a limit only until the next edit.

**A third documented surface is unasserted.** The header's usage block shows a `total (N files)` row as
part of the documented stdout shape (`:13`). The test's `run()` helper filters rows by the temp
directory prefix and so drops the header row and the total row together, with a comment saying why. The
total's arithmetic — whether it sums the columns and how its own `permit` and `verdict` are derived
across files — is documented and unpinned.

**What is right, and it is most of the file.** Seven of the eight expected numbers were re-derived here
by hand from the header without reading the awk, and all seven hold: the 3/19/157.9/0/`over` row, the
fence case at 1/6, the span case at 1/8, the block-quote case at 1/3, the YAML subtree at 1/6 with the
same text as Markdown at 3, the seven-versus-one exhibit fixture, and the two exit codes. The test does
what it says for everything it covers.

---

**Found by:** coderev, reviewing `c2ad89c..6781814`, review file
`shared/reviews/260822-1506-coderev-the-guard-rationale-repair-and-the-capped-help-topic.md`.
**Owner:** `coder`.
**Severity:** Low.
**Affects:** `hooks/lib/__tests__/fusion-prose-metric.test.ts`, `bin/fusion-prose-metric:69-73` and `:13`.
**Filed in the shared store:** no Circle is active.
**Cross-references:**
`circles/260820-2051-style-rules-arrive-and-get-measured/issues/260821-0144_*_the-authoritative-prose-metric-has-no-test-and-the-hook-test-surface-has-43-of-2500-lines-left.md`
(the record this test discharges).

**The fix, and its cost, which is the reason this is filed rather than done.** Three assertions of
about four lines each — an indented block whose em-dashes count as prose, a span opening on one line
and closing on the next whose content counts as prose, and one total-row read. Roughly twelve lines on
the hook-test surface, which stands at **302 lines of head-room against a closure clause of 300**. So
this cannot be added without a cut in front of it, and the sequencing should be decided rather than
discovered when `npm test` goes red. Whoever takes it should read
`shared/decisions/260822-1154_o_does-the-hook-test-line-budget-cover-comment-prose.md` first: three of
the twelve lines would be comment, and that record is the open question about what comment costs on
this surface.
