
**Make each operation's call in the turn of the act that moves it**, never as a step of its own. A maintenance step beside an action is what this project measured being skipped, six times in six sessions (issue `260801-2038_*_session-bookkeeping-froze-at-turn-1-while-three-turns-ran.md`).

## Closing a work package

Run this when the item this session claimed is being finished in this session. With no claimed item, or when the user's Rebalance answer continues the work, skip it cleanly. The user says when an item is done; you do not decide it from an empty record store.

1. **Detect the transition.** The item is the container name you have held since Setup step 5. `show` its `package.json`: a `status` already `done` or `dropped` is terminal and this section does nothing. **Revise Brief**, **Revise Evidence base** and **Revise Artefact** at the Rebalance approval all continue the work: touch no field and skip the rest of this section.

   The closing value is `done`, or `dropped` when the user chose **Accept Bounded Closure** at the Rebalance approval or Bounded Closure was forced by **Rebalance bounding** — in that case the body says what was learned and why the job is no longer live. Under `mode` `autonomous` you may hold the closure only when the work is visibly not done on disk (a test the plan's acceptance names fails, a file it says exists is missing): emit `gate_hit` naming what; the item stays `claimed`. Otherwise the closure runs as written.

