The Turn-1 review's totals say ten findings and it filed eleven, and two different findings share one label

---

`fusion-workbench/shared/reviews/260810-1918-coderev-turn-1-range-5ef92eb-940d522.md` carries:

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 2 |
| Medium | 3 |
| Low | 5 |

followed by the sentence "Ten findings, ten records filed under `shared/issues/260810-1918_o_*`."

Eleven records were filed under that stamp, all eleven in `da8c9db`, and all eleven now carry `_c_`.
The review body carries eleven distinct findings and twelve labelled bullets:

- **High** — `H1`, `H2`. Table says 2. Correct.
- **Medium** — `M1`, `M2`, and `M3` used twice: once for `agents/orchestrator.md:429` (marked
  "Folded into H2", so not separately filed) and once for `bin/monitor:1244` `sleep 0.5` (filed).
  Three filed Medium records. Table says 3. Correct, and correct only because the duplicate label
  belongs to a folded item.
- **Low** — `L1`, `L2`, `L3`, `L4`, `L5`, `L6`. Six, each with its own record. **Table says 5.**

So one Low is missing from the table, the prose total inherits the same error, and `M3` names two
different findings.

---

**Why it matters, given every finding did reach a record.** Nothing was lost — the eleven records
exist and closed, which is what `git log --name-status` and the marker inventory both show. What is
wrong is the review's own summary, and a summary is what the next reader trusts instead of counting.
The session history for `260810-1646` says "Review findings: 11 filed by `coderev`", so the history
and the review disagree by one and the history is the one that is right.

**This is a reproduction, not a new class.** Queued task 37 of `fusion-workbench/tasklist.md` is
"Make the Turn 1 review's totals match the findings it carries", filed against the *earlier* review
`260810-1632-coderev-turn-1-range-430d73a-to-head.md`. The same defect recurred in the next review
the same day, which is evidence for the task's premise: a hand-tallied totals table drifts from the
findings under it, and no gate reads either. It is also the same shape as
`260810-2110_c_the-citation-rooting-commit-and-its-own-record-both-say-seven-citations-and-there-are-eight.md`
— a count written beside the thing it counts, by hand.

**Fix direction, not prescribed.** Correcting this one table is a two-character edit and closes
nothing. The task-37 answer — derive the totals from the findings, or assert them against the filed
record count — is what makes the next review's table trustworthy. That the count of filed records is
mechanically obtainable (`ls shared/issues/<stamp>_?_*.md | wc -l`) is the cheap half; the severity
split still comes from the labels, so the labels have to be unique, which the duplicate `M3` shows
they are not guaranteed to be.

**Cross-references.** `fusion-workbench/tasklist.md` task 37;
`shared/issues/260810-1544_o_…` is unrelated;
`shared/issues/260810-2110_c_the-citation-rooting-commit-and-its-own-record-both-say-seven-citations-and-there-are-eight.md`
(same class, different surface); `shared/history/260810-1646-orchestrator-session.md` Turn 1 (says
11, and is right).

**Filed by:** reconciler, final reconciliation of session `260810-1646`, at HEAD `e2a34f0`.
