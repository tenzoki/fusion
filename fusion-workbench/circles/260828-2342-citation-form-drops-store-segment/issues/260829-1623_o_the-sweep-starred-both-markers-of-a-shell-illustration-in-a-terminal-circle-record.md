The sweep starred both markers of a shell illustration in a terminal Circle record
---
`260805-2005-textschicht-gegen-code-nachziehen:104` showed a rename as `mv "…_o_$f.md" "…_c_$f.md"`; the committed sweep (f1099c5f) starred both markers to `_*_`, which deletes the example's meaning. The repair pass (Turn 2) did not cover this class: a marker that is the statement, not a pointer (`rules/circle-records.md` `### Citation form in the portfolio`, "leave the letter on a marker that is being named").
---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>

Acceptance: the line reads as it did at `66b486e0`; the sweep's tests carry a fixture where a marker letter inside a fenced shell line is left as written.

Reconciled: 260829-1805, reconciler. Still open at `a60d1fea`: `260805-2005-textschicht-gegen-code-nachziehen:104` still reads `mv "260803-1536_*_$f.md" "260803-1536_*_$f.md"` (both markers starred); `a60d1fea` shipped the sweep without a fenced-shell fixture, and its dry-run reports `rewrites=0` over the damaged line, so no run of the shipped tool repairs it. Needs a hand edit plus the fixture named in the acceptance line.
