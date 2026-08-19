The `## Project language` rule names a record `**Status:**` pairing that no record kind still has

---

`rules/fusion-workbench-conventions.md` `## Project language`, under **Head labels follow the file
that defines them**, gives three examples of a label defined in a shipped template: "the plan head's
`**Decidability:**`, a record's `**Status:**` and `**Domain:**`".

After two removals the middle example names a pairing that no longer exists. The Circle record lost
its `**Status:**` field on 2026-08-18 (`shared/decisions/260815-2312_i_*`, commit `95bebe1`) and the
decision record lost its own the same night (`shared/decisions/260818-2212_*`, this session). No
record kind now carries the field.

---

It is not strictly false, which is why the task that found it left it alone rather than widening a
change surface the answering decision states precisely. `**Status:**` still lives in the plan,
session-history, analysis and consultation templates, and "a record" reads loosely enough to cover a
plan. The example is merely the worst available one now: it pairs a label with the artifact kind that
just stopped having it, in the one paragraph a reader consults to learn which labels are exempt from
the artifact language.

The correction is one clause — name an artifact kind that still carries the field, or drop the
example and keep `**Domain:**`, which every record kind does still have. It is deliberately not made
here: `260818-2212` names its change surface as two rule files and this passage is neither, so
folding it in would have made the realisation wider than the answer.

Found by the executor of task T2 in session `260818-2301` and reported rather than acted on. No Circle
active, so it goes to the shared store under the Origin Rule.

---
Also seen: 260819-0037 by coderev — reached independently in the Turn-1 review of `52b1d95..b54ace5`; the review confirms the finding and adds only that the passage sits in an always-on rule file, so the stale example ships on every dispatch.
