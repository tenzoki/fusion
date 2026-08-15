`queue_empty` left the event vocabulary in P-10 and only `queue_built` was restored

---

Step P-10 deleted both the `queue_built` and the `queue_empty` rows from the orchestrator's event
table, and deleted the `queue_empty` emission from Phase 1's "no routable tasks" branch. Step P-11
restored `queue_built`, calling its removal "the orchestrator's error". `queue_empty` was not
restored and exists nowhere at HEAD.

---

## Context

What P-10 (`dd312eb`) removed from `agents/orchestrator.md`:

```
-| `queue_built` | Phase 1 done | Task count, blocked count |
-| `queue_empty` | Phase 1 — taskplanner returned "no routable tasks" (Step 1.5) | Open work item count |
```

and, from the no-routable-tasks branch, the words `emit a queue_empty event, `.

What P-11 (`f45f76a`) restored, per its own commit message:

> The queue_built event is restored, table row and emission together. Removing it in step 10 was the
> orchestrator's error, and it is worth more after this commit than before: the event log is now the
> sole durable record of a session's shape.

At HEAD, `grep -rn queue_empty agents/ skills/ bin/ hooks/lib/*.ts hooks/*.ts README*.md rules/
docs/` returns nothing. `queue_built` survives at `agents/orchestrator.md:437` and `:1180`, and
`bin/monitor:348` colours it.

**The restoration argument covers `queue_empty` exactly.** Neither event was about the deleted file;
both are about the *session's shape*. `queue_empty` records the one shape in which Phase 2 never
runs at all — Phase 1 completed, found nothing routable, and went straight to Phase 4. With the
event gone, that session's log holds a `session_start`, no `queue_built`, no `turn_start` and a
`session_end`, which is indistinguishable from a session that died in Phase 1. P-11 made the event
log the sole durable record of a session's shape; this is the one shape it can no longer record.

**The plan did not ask for either removal.** Neither event appears in step 10's Files or Changes
lists (`planning/260815-0029_o_…` lines 284-298). Both went out with the queue-ground apparatus that
sat near them.

## Suggested direction

Restore the row and the emission the way `queue_built` was restored, at
`agents/orchestrator.md` Phase 1 step 2 (the no-routable-tasks paragraph) and in the event table at
`:1180`. If `queue_empty` is instead judged genuinely dead, that is a decision and needs saying —
but it cannot rest on the file's removal, since `queue_built` was kept on the opposite reasoning in
the very next commit.
