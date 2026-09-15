The monitor's commit counter reads low and its own docstring does not say so

---
`bin/monitor` is the only reader of a `commit` row in the tree and it is the consumer the ruling
predicted would inherit an exception. Its counter now under-reports by the number of log-only
commits in the session and neither its docstring nor its rendered label says so.

---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>

**Where.** `bin/monitor:1510` states the computation: "THE COUNTERS are counts over this same
log, scoped to the session identifier: dispatches from paired rows, commits from `commit` rows."
`bin/monitor:1543-1544` performs it and `bin/monitor:1557` renders "**Commits:** %d". The count
is of rows, and since `8d4bbe07` a landed commit whose only path is the event log writes none.

**Why it is worth one line.** The ruling's own Cons entry names this consumer: "a later consumer
that counts commits inherits an exception it must be told about", and the residual was accepted
on the measurement that `bin/monitor:1543` is the only such reader. The acceptance covered the
loss, not the silence. A reader comparing the panel's figure against `git log` finds a gap with
nothing in the panel or its source explaining it.

**Verified.** `commit` appears as an event kind in no other executable: `bin/fusion-events`,
`bin/fusion-review-coverage`, `bin/fusion-cadence-anchor`, `bin/fusion-staging-drift`,
`bin/fusion-session-mark`, `bin/fusion-citation-sweep` and `hooks/lib/events-query.ts` carry no
read of it, and `hooks/lib/staging-drift.ts` decides a moved HEAD from git rather than from the
log. `skills/cadence/SKILL.md` counts git commits directly and never the log.

**Fix.** Extend the docstring sentence at `bin/monitor:1510` to say that a commit carrying only
the event log writes no row, citing `rules/commit-lock.md` `### The lock writes the commit event`.
No computation changes.

**Acceptance test.** None mechanical. The line is present and names the exception.

**Cross-references:** `260912-2041_*_should-the-commit-lock-skip-its-row-when-the-commit-carries-nothing-but-the-log.md`

Resolved: `bin/monitor`'s counter docstring now states the exception. The sentence says the commit
count reads low against `git log` by design, because a commit carrying nothing but the event log
writes no row so that committing it settles the tree, and cites `rules/commit-lock.md`
`### The lock writes the commit event`. No computation changed.
