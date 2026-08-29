# Step 10 — the persisted work queue leaves, the taskplanner stays

**Status:** Complete
**Agent:** coder
**Circle:** `260815-0007-remove-eight-mechanisms-and-cap-growth`
**Plan:** `260815-0029_*_plan-remove-eight-mechanisms-and-cap-growth.md` step 10
**HEAD at start:** `9955e8f`
**Verification:** `cd hooks && npm test` — exit 0, 41 files, 790 tests (from 45 / 831)

## What this was

A split, not a deletion. The persisted `fusion-workbench/tasklist.md` and every mechanism that
read it are gone; `taskplanner` keeps its scan, its two priority axes, its dependency DAG, its
executor routing and its Step 1.5 routability result.

## What taskplanner's product is now

**The queue itself, returned in its report.** The agent writes one file — its history entry — and
hands the ordered task list with its Mermaid dependency graph back to whoever dispatched it. The
orchestrator persists it in `agentstate.yaml`'s `work_queue`, which already existed, was already
written at exactly this point (Write Points, "Phase 1 complete"), and is already what a resumed
session reads. That is the reuse the split rests on: the queue was persisted twice, and the copy
that went stale is the one that left.

The prompt states the reason rather than assuming it, because an agent that produced one file and
no longer produces it reads as vestigial otherwise. A queue is derived from the records and true
only of the minute it was built; a file made it durable, and the two pulled against each other in
both directions this project measured — a queue that outlived its Circle by seven hours, and a
rebuild that survived eighteen commits in the working tree alone. A queue that lives only inside
the session that asked for it cannot go stale, cannot be read by a session it was not built for,
and cannot be lost by a `git checkout`.

Three things went with the file, as the plan specified: the `**Active Circle:**` head-line mandate
(its only consumer was the ground check), the `**Files written:**` field, and the
`**If $TASKLIST already exists**` update path. A fourth was added in its place: **no run reads a
previous queue.** A re-dispatch mid-session takes its drift context and any task states to preserve
from the dispatch prompt, because there is nothing on disk to read back.

## What the queue-ground reasoning did with itself

`### The queue's ground` carried three things worth keeping, and all three already have homes that
survive this step. Nothing was relocated, and that is a finding rather than an omission:

1. **The closing honesty** — "a convention, not an enforcement; prompt text loses to task
   pressure" — is stated in `rules/critical-stance.md` under *What that checkpoint enforces,
   honestly*, with the same worked case (a "MUST" in the orchestrator prompt skipped under a user's
   urgency), and again as Problem 11 in `CLAUDE.md`. Both are always-on or top-level. Moving a
   fourth copy into a rule loaded by fifteen agents would spend bytes this Circle is reclaiming.
2. **The undecidability lesson** — when the producer did not record the fact, it is not recoverable
   from the text, and the mechanism changes rather than the approximation — is
   `rules/critical-stance.md` §4, which the deleted section cited rather than authored.
   `hooks/lib/review-coverage.ts` leans on it and now cites §4 directly instead of the dead section.
3. **The 260807 worked case** — the superseded Circle, the queue that stayed, eleven pointless
   entries over seven hours — is the issue record
   `260807-1515_*_die-warteschlange-veraltet-wieder-…`, which is where a worked case
   belongs. It is also summarised in `agents/taskplanner.md`'s new *Why a report and not a file*,
   which is the one place a reader now needs it.

## What happened to this project's own queue

**Moved, not deleted, with `git mv`** —
`fusion-workbench/tasklist.md` → `260815-1524_*_retired-tasklist.md`,
with a seven-line HTML comment prepended naming what retired it and stating that the file is
history and not a live queue. 162 038 bytes, 1 041 lines, 79 entries.

`shared/` is right by the Origin Rule: the file's own head reads `**Active Circle:** none`, so it
was built over the shared store with no Circle active. `_c_` and the `retired-tasklist` slug are
the retirement convention the deleted Phase-4 step itself prescribed, and the reason it prescribed
`mv` over `rm` still holds — the entries carry verification notes and acceptance criteria that the
72 defect records they cite do not. Those records stay `_o_` and remain the authority on what is
open; nothing about the queue's retirement closes any of them.

## Judgements made outside the step's file list

Four, each because the change made a standing statement false and no gate could see it.

1. **Three present-tense citations of a mandate that no longer exists.** `agents/coderev.md:81`,
   `agents/ontorev.md:74` and `hooks/lib/review-coverage.ts` all justified the `**Not-opened:**`
   recorded-`none` rule with *"which is why `agents/taskplanner.md` mandates `**Active Circle:**
   none`"*. All three now state the rule from `rules/critical-stance.md` §4 instead. None of the
   three files is in the step's list.
2. **`CLAUDE.md`, two tokens.** The root-anchored file list named `tasklist.md`, and the
   single-orchestrator row warned about two sessions double-dispatching "from the same
   `tasklist.md`". The plan routed both to the curator gate as narrative; they are one-token
   inventory facts this commit falsified, and a curator gate should not have to catch what the
   removing commit created.
3. **`hooks/lib/domain-cascade.ts` `REACH` and its rendered copy in `README-hooks.md`** cite
   `agents/taskplanner.md:125` as the site that writes domain names bare. That line moved to `:128`
   when the queue template lost its `**Active Circle:**` row. Both updated together, since
   `describeReach()` is asserted against the README verbatim.
4. **`bin/monitor:333` was deliberately left alone.** It colours `.event-type.queue_built`, and the
   event type is gone. `orchestrator-events.jsonl` is append-only and read cross-session — this
   repository's own log holds 24 `queue_built` entries — so the rule still styles data that is
   still there, and an unstyled event degrades to the base `.event-type` rule rather than breaking.
   That is unlike the churn removal at step 4, where the monitor read a state file that ceased to
   exist. Step 11 faces the same call for `state_drift`.

## Divergences from the twice-corrected step, and what it missed

- **`queue_built` and `queue_empty` both removed.** The plan removes Phase 1 steps 1–4, which
  carries `queue_empty` away inside step 4, and is silent on `queue_built` in the shared tail. The
  dispatch named both. Both went, and the "no routable tasks" handling survives without an event.
  **The cost, stated so it can be reversed in one line:** `agentstate.yaml` is deleted at Cleanup,
  so after a clean session nothing records what the queue's initial shape was. The event log used
  to.
- **The plan removed the Phase-1 commit obligation entirely, and one file still comes out of that
  dispatch.** Taskplanner's history entry is written outside the Turn loop, which is exactly the
  gap `260811-0114_*_the-queue-rebuild-and-its-history-file-never-entered-a-commit-and-survive-only-in-the-working-tree.md` fell through — its queue half is moot, its history-entry half is not. No fourth
  copy of the Step 3b commit recipe was added. Phase 1 step 2 now names the path and requires it in
  Turn 1's first staging list, with the Cleanup staging check named as the backstop rather than the
  plan.
- **`agents/orchestrator.md` silently lost `OUT_PLAN`.** The Phase-4 queue retirement was the only
  place the prompt named `$OUT_PLAN`, and `bin/fusion-paths` derives a key set by grepping the
  prompt. The orchestrator writes no plans, so this is the contract working as designed
  (`rules/workbench-path-resolution.md`, *Emission is per-consumer*) and needed no edit. Recorded
  because it is invisible in a diff.
- **The step's file list over-named five files and under-named four.** No change was needed in
  `agents/{coderev,ontorev,analyst}.md` for the reason the list gave (they carry no queue
  reference — coderev and ontorev needed one for a different reason, above),
  `rules/context-lean-claude-md.md`, `rules/design-diagrams.md`, `bin/fusion-rules`,
  `hooks/tracker.ts` (its queue mention is past-tense measured history and stays true) or
  `hooks/lib/__tests__/context-manifest.test.ts`. The list also states that
  `hooks/lib/domain-cascade.ts` "names `tasklist` in `REACH`" — it does not; what it names is the
  line citation corrected above.

## Measurements

| | Before | After |
|---|---|---|
| `hooks/lib/__tests__/*.test.ts` | 45 | 41 |
| tests | 831 | 790 |
| `fusion-workbench/tasklist.md` | 162 038 bytes, 1 041 lines, 79 entries | moved to `shared/planning/` |
| `rules/fusion-workbench-conventions.md` | 52 436 | 52 423 |
| always-on rule bytes, `coder` | 86 955 | 86 942 |
| diff | | 47 files, 215 insertions, 2 560 deletions |

`RULE_BASELINE` was not re-cut — a deletion is not a re-baselining event. The
`rules-emission.golden` fixture was regenerated by the documented one-command procedure; its diff
is one size line per role and no change to the emitted path set or order.
