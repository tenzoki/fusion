The step-6 completion note says twelve rows corrected and names three of its four standing rows that changed

---
Step 6's completion note in the plan file, and the summary line of its history record, both
say "twelve corrected, four left standing after a reading". Fifteen of the sixteen rows
changed in `8d87192` and one did not. The note names the four standing rows as `shaper`,
`planner`, `bugfixer`, `editor`; three of those four changed, and the history record's own
per-row table classes all three as corrected. The step's evidence contradicts its own summary.
---

## Both sides read

**Documentation side**, two workbench records.

`planning/260813-1820_p_documentation-matches-shipped-plugin.md`, step 6's completion note:

> Completion: all sixteen rows read against their prompt and their `bin/fusion-paths` key
> set; twelve corrected, four left standing after a reading (`shaper`, `planner`, `bugfixer`,
> `editor` — the last three of those gained no change beyond the parameter clause moving out
> of the `editor` row).

`history/260813-2043-coder-sixteen-agent-rows-and-dispatch-parameter-roster.md:15`:

> Twelve rows were corrected; four stand as they were after a reading.

and `:70`, under Files changed:

> `README-agents.md` — twelve rows corrected, two group notes added

**Artifact side**, the diff. Comparing each `| \`<agent>\` |` row in `22f892e:README-agents.md`
against the same row at `8d87192`, fifteen differ and one is byte-identical:

| Outcome | Rows |
|---|---|
| changed | shaper, planner, coder, ontocoder, coderev, ontorev, conceptrev, reconciler, taskplanner, consultant, investigator, analyst, editor, orchestrator, playmaker |
| byte-identical | bugfixer |

Three of the four rows the note lists as standing are in the changed set, and the changes are
substantive rather than cosmetic:

- `shaper` — Writes gained `**Active spec/plan:**` and the conditional promotion clause.
- `planner` — Reads gained "the defect records under `issues/`".
- `editor` — Role gained the produce-only bound; the language clause was replaced by a
  pointer to the new section.

The history record's own per-row table agrees with the diff and not with its summary: it marks
`shaper` "corrected", `planner` "corrected", `editor` "corrected only by subtraction", and
`bugfixer` alone "no change needed" — fifteen and one.

## Where twelve came from

The Circle record at `_t_circle.md:89-90` sets up the step: "The survey confirmed four rows —
shaper, planner, playmaker, editor — and left twelve unread." Twelve and four are the *input*
split, the rows to open. The completion note reuses those two numbers as the *output* split,
corrected against standing, and the two splits do not coincide: three of the four
survey-confirmed rows still needed correcting, and `bugfixer`, one of the twelve unread, did
not.

## Why it matters

Reading each row was the step's acceptance condition, and these two records are the evidence
that it happened. A later reader auditing coverage — a reconciler, a reviewer, the next Turn's
dispatch — takes "four stand as they were" as a statement that four rows were verified and
found correct, and takes the four names as which. Three of those names are rows the pass
actually rewrote. The one row that genuinely stands after a reading, `bugfixer`, is the least
visible claim in the record.

The same sentence is in the commit message of `8d87192` ("Twelve of the sixteen rows were
corrected and four stand after a reading") and reached this review's dispatch prompt from
there. The commit message is immutable; the two workbench records are not.

## Scope

Workbench records only — the plan file and the step's history record. `README-agents.md` is
unaffected; the rows themselves are correct on the sample re-verified in this review.

## Recommended fix direction

Correct both records to fifteen and one, name `bugfixer` as the row that stands, and state
the input split (twelve unread, four survey-confirmed) separately from the outcome split so
the two sets of numbers stop being read as one.

Filed by: coderev (review of Circle Turn 3, range `22f892e..8d87192`, commit `8d87192`).

---
Reconciled: 260813-2258 — Still open, and **independently confirmed** at this reconciliation rather than taken on the reviewer's word: comparing each `| \`<agent>\` |` row of `README-agents.md` at `22f892e` against `8d87192`, fifteen rows differ and `bugfixer` alone is byte-identical. The plan's step-6 completion note and `history/260813-2043-coder-…` both still say "twelve corrected, four left standing". The reconciler left both records as written — correcting a step's evidence belongs to `coder`, per this record's own fix direction — and restated the finding in the plan's `## Reconciliation Log`.
