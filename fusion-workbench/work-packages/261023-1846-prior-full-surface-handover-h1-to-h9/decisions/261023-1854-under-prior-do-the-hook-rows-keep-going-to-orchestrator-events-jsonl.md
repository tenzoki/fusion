# Under Prior, do the hook rows keep going to `orchestrator-events.jsonl`, or does fusion's treatment of the log stand?

---
**Domain:** code
**Filed by:** implementation-planner, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260922-1059_*_which-treatment-do-the-stores-and-root-files-the-nomenclature-table-omits-take.md; 261023-1846-prior-full-surface-handover-h1-to-h9.md; foreign:prior:261021-2349-how-does-prior-reproduce-the-surfaces-fusions-hooks-write.md; 261023-1854-plan-prior-full-surface-handover-h1-to-h9.md

---

## Question

Prior's hand-over (`Prior: docs/design/fusion-full-surface-handover-to-fusion.md` at `7ac0845`, `## A question for fusion's workbench to rule on: B2 and orchestrator-events.jsonl`) asks fusion to rule, and to put its ruling, or the statement that it has not ruled, into the hand-over request. Two positions stand. Fusion's treatment table, adopted by the user verbatim on 260924 in `260922-1059_*_which-treatment-do-the-stores-and-root-files-the-nomenclature-table-omits-take.md` (state `answered`), says of `orchestrator-events.jsonl`: "Retain as historical evidence. New runtime events go to the Prior journal; Fusion may derive views from it. Old events must not re-trigger actions or approvals on import." Prior's ruling B2, taken later by the same user for Prior's work package `261021-2241-full-fusion-surface-on-prior`, runs fusion's compiled hooks unchanged under Prior. Those hooks append `session_start`, `task_start` and `task_done` rows to the log, so under Prior the log keeps receiving them, and Prior's journal records the hook runs besides. The request cannot be written without stating which of the two fusion holds.

## Options

1. **Narrow the treatment row to match B2.** The hook rows keep going to `orchestrator-events.jsonl` when Prior runs fusion's hooks, because the bytes that write them are fusion's own and run unchanged. "New runtime events go to the Prior journal" is read as Prior's own runtime events (its supervisor, tool and hook-run records), which Prior journals as it does today. The retention clause and "Old events must not re-trigger actions or approvals on import" stand unchanged. This record supersedes the `orchestrator-events.jsonl` row of `260922-1059` and no other row.
   - Pros: one writer of the log on both hosts, the compiled hooks; no hook source changes and no Prior-side filter on what a hook may write; Prior's qualification compares the log as B2 requires; the import rule that protects against replayed approvals is untouched.
   - Cons: the log becomes a surface both hosts write, so a Prior run's rows and a Claude Code session's rows interleave in one file of one checkout; a reader that wants to tell them apart needs a field the rows do not carry today.
2. **Keep the treatment as it stands.** Under Prior the hook rows go to Prior's journal only; the log is historical evidence. The request states that fusion did not change its ruling.
   - Pros: no change to an answered record; the log's meaning ("what Claude Code sessions did") stays single-host.
   - Cons: contradicts B2. Either Prior filters or redirects writes made by fusion's own unchanged hook bytes, which is a re-implementation by another name, or the log differs between hosts and becomes an allowed difference, which B2 excludes and only a new ruling of the user could admit.
3. **Do not rule now.** The request states that fusion has not ruled; Prior's step 45 records "no ruling", and the user rules on that row when Prior reads the request.
   - Pros: nothing is decided ahead of evidence from a Prior run.
   - Cons: the hand-over asked fusion to rule; Prior's step 28 may not start while a row is open without a user ruling, so the question comes back at the same user one step later.

## Constraints

- Hook sources do not change for Prior (H9: "with no hook source changed").
- B2 is Prior's ruling and binds Prior's work package; fusion's ruling binds fusion's workbench treatment. The request carries fusion's position, not a ruling on Prior's.
- Whatever is chosen, "Old events must not re-trigger actions or approvals on import" stands.

## Recommendation

Option 1. The log is written by fusion's own hooks; running those bytes unchanged under Prior is the mechanism both rulings rest on, and a treatment that sends their output elsewhere would need code that neither repository has or wants. The row was written before the hook runtime was designed, and the user ruled B2 with that design in hand. Should the interleaving of two hosts' rows matter to a reader, that is a later, separate question about a host field on a log row; it does not need answering for this request.

---
Answered: the user in chat, 2026-10-23, answer "1" to the plan approval (approve the plan and the split, decide all five questions as recommended) — option 1, as recommended; ruled by user, Kai Stalmann <ks@qantr.com>
