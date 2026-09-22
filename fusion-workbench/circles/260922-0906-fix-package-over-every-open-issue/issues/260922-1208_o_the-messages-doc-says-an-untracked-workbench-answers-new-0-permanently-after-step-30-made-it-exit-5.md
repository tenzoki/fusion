`docs/messages-between-checkouts.md` says an untracked workbench answers `new=0` permanently and is told nothing, after step 30 made `bin/fusion-forum new` exit 5 with `state=workbench-untracked`
---
`docs/messages-between-checkouts.md:68`: "**A project that does not track its workbench in git gets nothing, and is told nothing.** … the answer is `new=0` on a successful exit, permanently. … the untracked configuration is supported and the whole feature is inert and silent inside it. Filed as `260908-0848_*_an-untracked-workbench-answers-new-equals-zero-forever-and-no-state-names-it.md`."

Since `d29c5947` (plan step 30) the helper runs `git ls-tree -d --full-tree "$head_sha" -- "$rel"` and, when it prints nothing, emits `state=workbench-untracked` and exits 5 (`bin/fusion-forum:331-338`; header rows `:100-104` and `:132-138`); `skills/news/SKILL.md:54` names the state to the user. The test "state=workbench-untracked at exit 5 once the workbench is in no tree at the fetched ref, never new=0" pins it. The doc's paragraph describes the behaviour the record it cites was filed against, and that record is closed on the fix.

Acceptance: the paragraph says an untracked workbench is named as `workbench-untracked` at exit 5 and that tracking is the project's decision; `grep -c 'new=0.*permanently' docs/messages-between-checkouts.md` prints `0`; `cd hooks && npm test` exits 0.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
Executor: `coder` (documentation). Found in the closing review `260922-1208-reviewer-closing-pass-over-the-51-issue-package-451bb312-to-bf515cad.md`.
