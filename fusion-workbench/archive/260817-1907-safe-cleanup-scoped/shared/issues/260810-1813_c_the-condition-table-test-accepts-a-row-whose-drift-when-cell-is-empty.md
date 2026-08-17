The drift check's condition-table test accepts a row whose `Drift when` cell is empty

---

`hooks/lib/__tests__/state-drift-detection-lint.test.ts:302` splits the drift-check section on
`^\| Row \| Drift when \|$` and then asserts over the rows that follow. It checks that each of the
five surfaces has a row. It does not check that the row says anything.

A row of the shape `| progress.commits | |` therefore passes. That is the whole point of the table
gone: the `Drift when` cell is the part that tells a reader *when a difference is a fault*, and
without it every row degenerates into a list of surfaces that were already named three paragraphs
above. The five conditions are not decorative — `progress.commits` tolerates a difference of one for
the commit in flight, the history-Directive row explicitly does **not** count differing wording as
drift, and a reader who loses those two distinctions reports two false faults per check.

---

**Context.** Filed as the named remainder of `260810-0502`, which was closed the same session. That
record carried four claims; three were fixed (the anchors now sit on acts that predate the drift
check, the single phrase-match assertion became three assertions over a bounded window, and the
duplicated negative control was separated). §4's second claim was outside that task's acceptance and
outside the line ranges its executor was given, so it was left standing and named rather than
silently folded in.

**Size.** The executor who found it puts it at a two-line change in the same file — assert the cell
is non-empty, and give the assertion a message naming the row. Treat that as the estimate it is,
not as a measurement.

**Filed by:** orchestrator, session `260810-1646`, on the drift-lint executor's report.

---

**Resolved** — session `260810-1646` Turn 2, `hooks/lib/__tests__/state-drift-detection-lint.test.ts`.
The condition-table check is factored into `assertEveryRowHasACondition()`, which reads the row's
second cell and rejects it when nothing but dashes, an en/em dash or whitespace remains; the failure
message quotes the offending row. Controls: a complete stub table is accepted, and each of the five
rows emptied in turn against each of the three filler shapes (nothing, a space, an em-dash) is
rejected naming its own surface. Falsified end-to-end on a scratch copy of `agents/orchestrator.md`
— blanking the `progress.commits` cell fails the changed test and passes the pre-change one.
`npm test` from `hooks/`: exit 0, 1113 tests. History:
`shared/history/260810-2029-coder-drift-lint-residuals.md`.
