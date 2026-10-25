Orchestrator Prior render keeps neutral steps that presume a commit per task
---
The orchestrator's `prior` parts replace the per-task commit with one host integration per run, but five `neutral` spans still act on per-task commits. On Prior they revert earlier tasks' work, skip the closing review, and ask for commit hashes that do not exist. The token-based span map could not see them, because none carries a host token. Severity: High. Request 76 must also carry the question of a per-task integration (see below).
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Domain:** code
**Executor:** code-implementer
**Cross-references:** 261025-1117-reviewer-closing-review-of-prior-handover-b-agent-profiles.md; 261024-2111-agent-span-map-for-entry-profiles.md (`## Open Questions`, third item); 261023-1854-plan-prior-full-surface-handover-h1-to-h9.md

## Defect

`catalog/profiles/orchestrator/parts/37-prior.md` items 3 to 7, `33-prior.md`, `49-prior.md`, `51-prior.md` and `55-prior.md` state that on Prior "one entry run integrates once, at its end, however many tasks it carried", and the orchestrator never commits. The following `neutral` parts, rendered unchanged into the Prior profile, still assume a commit after each task:

1. `36-neutral.md`, Step 4 item 2d: "revert all task changes with `git checkout HEAD -- <files>`". On Prior `HEAD` is the run's base revision, so the revert also discards every earlier task of the same run that touched those files. Same instruction in `54-neutral.md` (error table row and `**Revert strategy:**`), and in the `prior` part `35-prior.md`, which carried the Claude sentence over unchanged.
2. `36-neutral.md`, first bullet: a decision goes `--to implemented --implementation-ref` "once Step 4 has committed". No commit exists inside the run, so no hash can be given.
3. `38-neutral.md`, Step 5: "After each commit … What landed, in one line, with the short hash."
4. `48-neutral.md`, `## Closing a work package` step 2: the closing review is routed by the uncovered commits `fusion-review-coverage` reports since the item was filed. Inside one Prior run the work is uncommitted, so the read reports none and the step says "skip cleanly; the finish then carries no `--evidence`". A package closed in an entry run gets no review.
5. `48-neutral.md`, step 4 and `## Ending the session`: the closure note cites "the session's commit range"; the summary lists "one line per commit" and a review-coverage range `<session-start>..<HEAD>`.

The reviewer an entry run dispatches has the matching gap: `rules/review-contract.md` mandates `**Reviewed-range:**` as two resolved short hashes, and work that is still uncommitted in the workspace has none.

Cause: the span map tags a line `claude` only by a `HOST_TOKENS` hit or a named Claude mechanic (span map `### 1. Tagging rule`). "Commit per task" is carried by plain prose, so these spans stayed `neutral`.

## Fix direction

Two parts, the first fusion's and the second request 76's:

- Re-cut the five spans above as `claude` + `prior` pairs (the Claude bytes do not move). The `prior` replacements must say what Prior can do: revert only files no earlier task of the run changed, and name the others to the user instead of reverting them; report a task without a hash; leave a decision at `answered` until the integration commit exists, and dispatch the closing review over the files the run changed instead of over uncovered commits.
- Request 76 asks Prior whether an entry run may integrate per task (one `host.integrate.v1` per completed task) so that fusion's per-task commit, review range and `--implementation-ref` hold on Prior too. If Prior answers yes, the replacements above shrink to that.

## Acceptance

- No part the Prior render of `catalog/profiles/orchestrator/` carries instructs a revert to `HEAD`, a commit hash, or a commit-range review read that an entry run on Prior cannot satisfy; each such span is a `claude`/`prior` pair with a stated Prior behaviour.
- The span map (or an addendum analysis) lists the re-cut spans.
- `cd catalog && npm test` exits 0; `npm run render -- claude` then `git diff --exit-code agents/` exits 0.
- Request 76 carries the per-task integration question, or the plan records why it does not.
