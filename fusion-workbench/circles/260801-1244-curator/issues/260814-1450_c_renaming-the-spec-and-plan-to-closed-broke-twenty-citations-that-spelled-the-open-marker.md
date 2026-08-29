Renaming the spec and plan to closed broke twenty citations that spelled the open marker

---
The reconciliation pass of 2026-08-14 renamed this Circle's two planning files to their true state:
`260814-0738_*_spec-curator.md` became `_c_` and `260814-0845_*_plan-curator.md` became `_c_`. Both
renames were required by `rules/fusion-workbench-conventions.md` `## Inline State Tracking` — every
implementation step was `[DONE]` and the header said Draft. Twenty citations elsewhere in the
workbench spelled the old open markers literally and now point at files that do not exist.

---
**Measured 2026-08-14 immediately after the rename,** by
`grep -rn '260814-0738_*_spec-curator\|260814-0845_*_plan-curator' fusion-workbench/ --include='*.md' --include='*.yaml'`:

| File | Dead citations | Who may repair it |
|---|---|---|
| `agentstate.yaml` (`plan_context.plan_file`, `current_task.source_file`) | 2 | **orchestrator** — live session state |
| `260801-1244-curator` (`**Active spec/plan:**`) | 1 | **orchestrator** — a Circle record head field |
| `260814-0738_*_…` and `…/260814-0845_i_…` (`**Cross-references:**`) | 2 | reconciler or coder |
| `260814-0813_*_…`, `…/260814-0828_o_…` | 2 | reconciler or coder |
| `260814-1023_*_…` (two closed records) | 3 | leave — closed records of a past state |
| `circles/260801-1244-curator/history/` (three files) | 4 | **leave** — a history file records a moment |
| `circles/260801-1244-curator/reviews/` (three files) | 4 | **leave** — a review records a moment |
| `260813-2345-orchestrator-session.md` | 2 | **leave** — same reason |

**The three in the first two rows are the ones that matter today,** because they are live state a
running session reads. The orchestrator's Phase 4 already writes both surfaces — the Circle record's
closure note and Turn log, and `agentstate.yaml` — so repointing them costs nothing extra there.

**Ten of the twenty should stay exactly as they are,** and saying so is half the point of this
record. A history file and a review file are records of what was true when they were written. The
spec really was open when the Turn-1 review cited it. Rewriting those citations would make the
record agree with today at the cost of making it disagree with the moment it documents, which is a
worse trade than a pointer that needs one glob to follow.

**This is the same class as the Turn-3 review's finding 5,** filed as
`260814-1419_*_nine-open-marker-citations-were-left-literal-on-lines-where-their-siblings-were-starred.md`,
and it is the standing residual named in
`260802-1740_*_a-citation-path-carrying-a-state-marker-dies-on-ordinary-progress.md`
(closed) and scoped out of `260806-0015_*_zitierform-fuer-workbench-records.md`,
whose answer covers shipped texts and deliberately not the workbench. Nothing enforces the wildcard
form inside a workbench record: `hooks/lib/__tests__/reference-resolution-lint.test.ts` scans
shipped surfaces and `portfolio-citation-form-lint.test.ts` scans `portfolio.md`. So this is not a
rule violation by anyone; it is the cost the unenforced surface was always going to charge, arriving
on the first ordinary progress the two files made.

**The fix.** Repoint the five live citations to the `_*_` wildcard form. Leave the ten historical
ones. Whether the four in closed issue records are worth touching is a judgement, not a rule; this
record recommends leaving them, on the same ground as the history files.

**What must not be done instead.** Do not rename the two planning files back. Their marker is now
correct and a citation is cheaper to repair than a state that lies.

**Filed by:** reconciler, session `260813-2345-orchestrator-session.md`, Circle
`260801-1244-curator`. Filed in the Circle's own store per the Origin Rule: it arose from
reconciling this Circle's own planning files.

---
Resolved: all five live citations are repaired at HEAD `d5b71f1`. Four were repaired by `e02f268`
itself — the reconciler's own pass renamed the two files and carried their citations with it — and
the fifth, `agentstate.yaml`, was repointed by the orchestrator in the same sitting, both the
`plan_context.plan_file` and the `current_task.source_file` field. Verified rather than taken from
the Turn-4 review that reported it: `grep -rn '260814-0738_*_spec-curator\|260814-0845_*_plan-curator'`
over the workbench now returns hits only inside closed issue records and inside this record's own
evidence block, which is exactly the set this record said should deliberately stay as it is. A
citation inside a closed record is a statement about what was true when it was written, not a
pointer that has to resolve.
