A reviewer entry run over uncommitted files has no `**Reviewed-range:**` to write
---
`81f000c7` routes the orchestrator's closing review on Prior by "the files this run changed", uncommitted on the base revision. The reviewer's `prior` parts still follow `rules/review-contract.md`, which mandates two resolved commit hashes and lists only files left unopened. So the review cannot name the scope it opened, and `bin/fusion-review-coverage` tiles nothing. Package B's review named this gap, and the fix commit left it open. Severity: Medium. Fusion fixes this, unless request 76 allows a commit per task.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Domain:** code
**Executor:** code-implementer
**Cross-references:** 261025-2352-reviewer-closing-review-of-prior-handover-c-skill-profiles.md; 261025-1117-orchestrator-prior-render-keeps-neutral-steps-that-presume-a-commit-per-task.md; 261025-1117-reviewer-closing-review-of-prior-handover-b-agent-profiles.md (Finding 2, "The reviewer's own contract has the same gap")

## Defect

- `catalog/profiles/orchestrator/parts/48a-prior.md`: "route by **the files this run changed** … Say in the dispatch that this run's files are uncommitted in the workspace on the run's base revision, and give that revision's short hash".
- `orchestrator/parts/48e-prior.md`: the summary lists "the files this run changed, each with the review of this run that opened it or `not opened`".
- `rules/review-contract.md` `## The review file's header`: `**Reviewed-range:**` is "two resolved short hashes", and `**Not-opened:**` covers "every file inside the dispatched range".
- `catalog/profiles/reviewer/parts/*-prior.md`: no part says what an entry run over uncommitted files writes in either field (`grep -n 'Reviewed-range\|uncommitted' reviewer/parts/*-prior.md` finds nothing).
- Span map addendum in `261024-2111-agent-span-map-for-entry-profiles.md`: "the `reviewer` row of the routing table … was not re-cut".

## Fix direction

Give the reviewer's entry-run branch one rule for an uncommitted scope, for example `**Reviewed-range:** <base>..<base>` plus a `**Reviewed-files:**` list. Then let `48e-prior.md` read that list. If request 76 allows a commit per task, these parts are re-cut instead.

## Acceptance

- A reviewer entry run dispatched over uncommitted files has a stated header form that names what it opened.
- The orchestrator's `48e-prior.md` coverage line reads that form.
- `cd catalog && npm test` exits 0, and the Claude render diff stays empty.

Also seen: 261105-1042 by data-implementer — triaged in 261105-1023-plan-fusion-13-4-2-corrected-candidate.md, stays open with its direction changed: Prior's answer to request 76 questions 1 and 19 allows a commit per task inside a run, and this issue's fix direction says that re-cuts these parts instead. Choosing that changes the orchestrator's behaviour on Prior and needs its own plan.
