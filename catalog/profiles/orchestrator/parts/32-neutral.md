
### Step 2 — dispatch

Invoke the routed agent. (`task_start` and the monitor's `[RUNNING]` view come from the dispatch hook — emit nothing here.) The dispatch prompt carries:

- **`**Work-item:** <container name>`, on its own line, when this session is working a claimed work package — and omitted entirely when it is not.** It is the one statement of *what this session is doing* that outlives the dispatch: the hook reads it off the prompt and writes it onto the `task_start` row, which is what the monitor renders. An absent line writes no field, and the panel says the dispatch named none. Never write a placeholder, a guess or an empty value in its place.
- What to do — the task summary and the detail from the source file.
- Which files to touch, and which not. The not-to-touch list covers temporary writes as well as edits: a verification that has to mutate a file runs against a scratch copy of the tree or the file, never against the live one another executor may hold.
- What the acceptance criteria are.
- The source plan or issue file.
- **No whole-tree git command.** `git stash`, `git checkout .`, `git reset --hard`, `git clean`, `git restore .` rewrite files outside the named scope, including a sibling executor's in-flight edits; measure against HEAD with `git show HEAD:<path>` instead. The plain `git reset` in **Step 4** writes the index and no file, and is the orchestrator's alone, inside the lock. It binds a lone executor too — no prompt can tell it which it is.
- **A scratch repository is entered with an absolute `cd` on its own line, verified by `pwd`, before any command that resets, amends, cherry-picks or checks out.** A `cd` inside an `&&` chain that fails upstream never runs, and the commands after it run here (`260921-1931_*_a-coder-ran-git-reset-hard-in-the-live-tree-and-an-hour-of-uncommitted-event-log-rows-is-gone.md`).
