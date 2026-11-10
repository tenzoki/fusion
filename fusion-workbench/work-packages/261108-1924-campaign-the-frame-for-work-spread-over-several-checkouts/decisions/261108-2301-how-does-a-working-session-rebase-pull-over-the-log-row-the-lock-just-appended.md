# How does a working session pull with rebase when the commit lock has just dirtied the event log?

---
**Domain:** code
**Filed by:** implementation-planner, Kai Stalmann <ks@qantr.com>
**Cross-references:** `261108-2135-spec-campaign-the-frame-for-work-spread-over-several-checkouts.md` (`### C3`, the commit cycle), `261108-2212-review-of-the-campaign-spec.md` (finding 1), `260830-1843_*_how-does-the-commit-lock-stop-leaving-the-tree-it-just-committed-dirty.md`, `260912-2041_*_should-the-commit-lock-skip-its-row-when-the-commit-carries-nothing-but-the-log.md`, `261108-2301-plan-campaign-the-frame-for-work-spread-over-several-checkouts.md`

---

## Question

The spec fixes the working session's cycle as commit, then pull with rebase, then read the campaign, then push, and moved the read behind the commit because git refuses a rebase pull on a dirty tree. One fact stands in the way of that order too: `bin/fusion-commit-lock with` appends the `commit` row to the tracked `fusion-workbench/orchestrator-events.jsonl` after the commit lands (`rules/commit-lock.md` `### The lock writes the commit event`), so the tree is dirty by exactly that file at the moment the pull would run, every time, by design. `git pull --rebase` is refused; `--autostash` and `git stash` are whole-tree commands the orchestrator forbids. The read confirmation itself appends a second row. Some mechanism has to make the tree clean enough to rebase without stashing anything, and it has to be the same mechanism in every cycle.

## Options

1. **Settle the log with a log-only commit, then rebase, then push.** The helper fetches, reads the campaign out of the fetched ref (`git show <head>:…`), appends the `campaign_read` row, commits the event log alone under the lock (a held region whose only path is the log emits no row, so the tree settles), then `git rebase <upstream>`, then `git push`. The order is the one `/fusion:cleanup` already runs at a session's end ("Then commit the event log alone"), applied per cycle.
   - Pros: no stash of any kind; the read needs no pull at all, because it reads the fetched ref; the settling commit is the project's existing practice (`chore(events): …` commits) and the lock rule already defines it; the row and the read are in the same commit that travels.
   - Cons: one extra commit per cycle in the history; a tracked path dirty for another reason (a sibling executor's in-flight edit) still blocks the rebase, which the helper then defers and reports rather than stashes.
2. **A path-limited stash of the log** (`git stash push -- <log>`), rebase, pop.
   - Pros: no extra commit.
   - Cons: a stash, which the orchestrator's prohibition names by the command and not by its scope; a pop over a union-merged file after a rebase is a merge whose result nobody has measured; a crash between push and pop loses the rows.
3. **Read the campaign from the fetched ref and push without rebasing**; on a rejected push, stop and report.
   - Pros: the smallest helper.
   - Cons: with four to seven checkouts pushing, a non-fast-forward is the ordinary case and the push would be refused most of the time, leaving every working checkout one commit behind the rule the charter states.

## Constraints

- `agents/orchestrator.md` `### Step 2 — dispatch`: no whole-tree git command, `git stash` named.
- `rules/commit-lock.md`: the row is appended after the commit and a log-only held region emits no row; this is what makes option 1 terminate.
- A rebase that stops on a conflict is aborted by the helper (`git rebase --abort`) and the conflicting paths reported; the user resolves it. Nothing in fusion resolves a conflict for a person.
- The spec's acceptance: one read per commit cycle, the read confirmation appended once, no stash.

## Recommendation

Option 1. The spec's order becomes, in the helper: commit (the orchestrator's Step 4 as it stands), then `fetch`, read at the fetched ref, append the row, settle the log, rebase, push. The read happens once per cycle and reads the state the remote holds, which is the state another checkout can have changed; a tracked path dirty for any other reason defers the rebase and the push is still attempted as a fast-forward.

Answered: `261108-1924-campaign-the-frame-for-work-spread-over-several-checkouts.md` `## Rulings on the planner's decisions` — option 1, as recommended; ruled by user, Kai Stalmann <ks@qantr.com>, 2026-11-09.

Implemented: 77c35be0 (plan step 19, the orchestrator's sub-step 5a) and 7cd51fea (plan step 17, `bin/fusion-campaign sync`: commit, fetch, read at the fetched ref, append the row, settle the log, rebase, push; no stash).
