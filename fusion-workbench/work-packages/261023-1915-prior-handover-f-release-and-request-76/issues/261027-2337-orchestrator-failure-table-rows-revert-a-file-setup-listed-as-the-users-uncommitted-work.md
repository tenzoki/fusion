Orchestrator failure-table rows revert a file Setup listed as the user's uncommitted work
---
`catalog/profiles/orchestrator/parts/54a-prior.md` lines 1 to 3 tell the orchestrator to revert "the out-of-scope files no earlier task of this run changed" (and "the task's files no earlier task of this run changed"). The rows leave out the files Setup's `git status --porcelain` listed. Decision `261027-2224-does-the-orchestrators-revert-rule-change-on-prior-in-13-4-1.md` (option 1) rules that such a file is never reverted, and line 7 of the same part says so. On Prior's step-17 model the revert reaches the user's checkout at integration and discards the user's pre-run change.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Executor:** code-implementer
**Cross-references:** 261027-2337-reviewer-13-4-1-pre-release-steps-2-to-7.md (finding 1), 261027-2145-entry-delivery-model-statement-map.md (rows O19, O20, O21)

Evidence: `54a-prior.md:1-3` against `54a-prior.md:7` and `07-prior.md:35`.

Fix: in each of the three rows, "no earlier task of this run changed" becomes "no earlier task of this run changed and Setup's `git status --porcelain` did not list". Only this `prior` part changes.

Acceptance: `grep -c "no earlier task of this run changed and Setup's `git status --porcelain` did not list" catalog/profiles/orchestrator/parts/54a-prior.md` prints 3. `FUSION-CATALOG` and `CLAUDE-RENDER` exit 0.

---
Resolved: in `catalog/profiles/orchestrator/parts/54a-prior.md`, the three revert rows of the failure table (out of scope, validation fails, edits outside declared scope) now read "no earlier task of this run changed and Setup's `git status --porcelain` did not list", consistent with the part's **Revert strategy** paragraph and `07-prior.md`'s Setup bullet "Note the user's uncommitted files" (decision 261027-2224, option 1). The acceptance grep prints 3.
