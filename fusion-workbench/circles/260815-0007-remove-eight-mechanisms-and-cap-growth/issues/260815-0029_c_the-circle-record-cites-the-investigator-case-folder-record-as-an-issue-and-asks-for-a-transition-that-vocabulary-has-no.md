The Circle record cites the investigator case-folder record as an issue and asks for a transition that vocabulary does not have

---

`260815-0007-remove-eight-mechanisms-and-cap-growth` § Dependencies, last
bullet, cites `260812-0254_*_should-the-investigator-get-case-folders-with-a-status-per-case.md`
and instructs: *"retired by the investigator fold rather than answered; close it with the fold."*

Two things are wrong with that bullet, and they compound.

1. **The path is wrong.** No such file exists under `shared/issues/`. The record is
   `260812-0254_*_should-the-investigator-get-case-folders-with-a-status-per-case.md`
   — a decision record, filed by the orchestrator on the user's request, carrying `## Question`,
   `## Options`, `## Constraints` and `## Recommendation`.

2. **"Close it" is not a transition decisions have.** `rules/fusion-workbench-conventions.md`
   `## State Markers — decisions` and `rules/decision-record-examples.md` `## Anti-patterns` both
   state it: decisions never close, they answer, implement, defer, or get superseded, and `_c_` is
   the issue vocabulary. An executor following the bullet literally would rename a decision record
   to `_c_`, producing a marker that no glob in the decision vocabulary matches and that every
   reconciliation pass would read as an issue.

There is a third fact that makes the correct transition non-obvious, and it is the reason this is
filed rather than fixed in passing. The record's own text says *"the removal recommendation for
the investigator is withdrawn"*, on the user's contradiction of the measurement. This Circle's
Directive reinstates the removal, on the field measurement the third analysis supplied. So the
record is not merely retired by a fold — it is **overridden by a later decision the user took at
this Circle's activation gate**, which is the textbook `_o_` → `_s_` case.

## Context

The correct transition, and what the plan's step 8 should perform:

- Append to the body:
  `Superseded by: circles/260815-0007-remove-eight-mechanisms-and-cap-growth/_t_circle.md § Grounding snapshot item 5 — the investigator is folded into the analyst on the field measurement (four dispatches, all on two days, none in the eight weeks since, input surface deleted in July). The case-folder question is retired with its subject.`
- Rename `260812-0254_*_…` to `260812-0254_*_…`.

`_o_` → `_s_` is explicitly permitted: worked transition 5 in
`rules/fusion-workbench-conventions.md` `## State Markers — decisions`, "a new decision overrides
an open one before it was even answered".

Cross-reference: `260815-0029_*_plan-remove-eight-mechanisms-and-cap-growth.md`
step 8, which plans the transition in this form.

Whether the Circle record's Dependencies bullet is itself corrected is a separate question. A
Circle record is a historical statement of what was known at activation, and the plan now carries
the corrected instruction, so leaving the bullet and citing this defect from the Closure note may
be the better answer than editing it.

---
Resolved: Step 8 performed the transition this record prescribed. `260812-0254_*_should-the-investigator-get-case-folders-with-a-status-per-case.md` was renamed to `_s_` with `git mv` and carries a `Superseded by:` footer citing the Circle record's Grounding snapshot item 5. `_c_` was not used and `shared/issues/` was not touched, so neither error the record names was committed.

The footer is longer than the one drafted here, and the addition is the third fact this record identified as the reason to file rather than fix in passing: the superseded record had *withdrawn* the removal on the user's testimony, so the footer states how the disagreement was settled — the measurement was re-taken on the user-initiated population it had previously missed, the runs it counted are real and stopped eight weeks ago, and the work went to the analyst instead. A supersession that only cited the newer record would have left the older one reading as if its evidence had been ignored.

The Circle record's Dependencies bullet was **not** edited, which is the open question this record's last paragraph poses and answers in the same direction: a Circle record states what was known at activation, the plan carries the corrected instruction, and this closed record is the citation for anyone who reads the bullet later.
