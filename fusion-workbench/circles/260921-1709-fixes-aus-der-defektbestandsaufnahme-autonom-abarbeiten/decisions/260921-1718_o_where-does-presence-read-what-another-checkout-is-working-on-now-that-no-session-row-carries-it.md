# Where does presence read what another checkout is working on, now that no session row carries it?

---
**Domain:** code
**Filed by:** planner, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260910-2144_*_presence-cannot-name-what-another-checkout-is-working-on-because-no-event-row-carries-it-any-more.md (the defect this answers), 260921-1653-open-defect-survey-at-11-9-1.md (row 19), 260918-0804_*_what-stops-two-checkouts-from-working-one-job-when-the-work-hangs-on-no-item.md (the adjacent no-item question, not answered here), 260921-1709-fixes-aus-der-defektbestandsaufnahme-autonom-abarbeiten.md

---

## Question

`bin/fusion-events presence` renders each other party's "on what" through `circleOf(line.history_file)` in `hooks/lib/events-query.ts`, read off that party's most recent `session_start` row. The history store closed at `0ec15cb9`, the orchestrator stopped writing the field, and every row since renders `unknown`. The defect record names the work item as the fact that carries the same thing now and asks whether the session row should carry it. The choice binds the event-log row shape, which every reader of `orchestrator-events.jsonl` depends on, so it is a record and not a plan step.

## Options

1. **Read the `work_item` the log already carries.** `hooks/lib/orchestrator-events.ts` writes `work_item` on every `task_start` row (`## What a task_start row measures`), the basename of the `**Work-item:**` line the orchestrator puts on every dispatch. Presence takes, per party, the latest `task_start` row in the window that carries `work_item`, and falls back to `history_file` for rows older than the cut; a party with neither renders `none on record` rather than `unknown`.
   - Pros: no new write, no row-shape change, no store walk: the fact is machine-written with identity on the row, which is the property the event log was built for. About a dozen lines in one function.
   - Cons: a session that claimed an item and has dispatched nothing yet shows no item; presence is then "on what, as of their last dispatch", which the party line's timestamp already qualifies.
2. **A `work_item` field on the `session_start` row**, written when the orchestrator claims (a `claim` event, or the session row rewritten).
   - Pros: presence reads one row per party as it does today.
   - Cons: the claim happens after SessionStart, so the hook cannot write it and the orchestrator must, which is a prompt mandate of the kind v10.8.0 moved to machinery; a session that claims twice writes two rows and presence has to choose.
3. **Read the claim off the work-item store**: for each foreign checkout hex, the item whose record carries `**Status:** claimed` and a `**Claim:**` naming it, the two greps `bin/fusion-claimed-item` already runs for this checkout.
   - Pros: the claim is the authoritative statement of "who holds what".
   - Cons: presence is a reading of the event log and would gain a second source with a different freshness (a pulled store versus a local log); the helper is written for one checkout and would need a hex argument; a paused or done item shows nothing although the party was on it an hour ago, which is the question presence answers.

## Constraints

- No row shape changes without a note in the module header of `hooks/lib/orchestrator-events.ts` and in `README-hooks.md`, which is why option 1 is preferred over 2 on cost alone.
- `renderParty` stays six fields wide; the fifth field's vocabulary may gain a value but a consumer reading five fields is unaffected.
- The pre-cut log must still answer as it does now.

## Recommendation

Option 1. The fact is already on disk, written by a hook with identity, on every dispatch; reading it costs one pass over the rows presence already parses. The defect's acceptance, "names what another checkout is working on for rows written after the cut, or the helper's own output states that it cannot and why", is met on the first branch for every party that has dispatched, and on the second for one that has not (`none on record` is a statement, `unknown` was not). Option 3 is the right answer to a different question, "who holds what", which `bin/fusion-work-order` and the claim itself already answer.

---
Working answer (plan 260921-1726): option 1 — presence reads the party's latest `task_start` row's `work_item`, falls back to a pre-cut `history_file`, and states `none on record` where neither exists; implemented in the commit that carries this line
