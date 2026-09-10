Presence cannot name what another checkout is working on, because no event row carries it any more
---
`bin/fusion-events presence` answers "who else has been here, and on what". It reads the "on what" off each session row's `history_file` field. The history store was closed at `0ec15cb9` and the orchestrator stopped emitting that field, so every row written after the cut renders `unknown`. The who survives; the what does not.
---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Cross-references:** 0ec15cb9 (the history store closed); e6a0dc67 (where this was documented rather than repaired); 260910-2133_*_does-a-unit-of-work-keep-its-own-container-for-the-artifacts-it-produces.md

**Evidence, run at `0c793392`.** `bin/fusion-events presence` reports `other_people=0 other_checkouts=1` and one party line naming `1d05b0e4`, alias `russet-marsh`, at `2026-09-07T14:59:56`, with a work name resolved off a row written **before** the cut. `circleOf(undefined)` returns `"unknown"`, so the degradation is honest rather than silent, and the pre-cut log still answers.

**Why it matters more than it looks.** Presence is one of the few places a checkout learns anything about another checkout without pulling and reading records by hand. Reduced to a name and a timestamp it answers "somebody was here" and no longer "somebody is on this". In a multi-user arrangement that is most of its value: the question a second person actually has is whether the thing they are about to start is already being worked.

**What the answer is not.** Re-adding `history_file` is not available: the store is closed and the field would name a file nothing writes. The field that carries the same fact now is the work item — a session's claimed item, which the orchestrator already holds for the whole session and already puts on every dispatch row as `**Work-item:**`. Whether the session row should carry it too is the decision this record asks for rather than assumes.

**Acceptance.** `bin/fusion-events presence` names what another checkout is working on for rows written after the cut, or the helper's own output states that it cannot and why, so a reader is not left reading `unknown` as "idle". If the answer is a new field on the session row, the record naming that decision is cited here.
