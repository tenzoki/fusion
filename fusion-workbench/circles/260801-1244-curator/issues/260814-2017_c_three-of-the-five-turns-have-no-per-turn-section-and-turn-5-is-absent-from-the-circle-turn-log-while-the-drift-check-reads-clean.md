Three of the five Turns have no per-Turn section, and Turn 5 is absent from the Circle Turn log, while the drift check reads clean

---
The session ran five Turns. `260813-2345-orchestrator-session.md` `## Per-Turn Log`
carries three headings — `### Turn 1`, `### Turn 2`, `### Turn 3, continued (after the resume)` —
and no section for the first half of Turn 3, for Turn 4, or for Turn 5. The Circle record's
`## Turn log` carries five bullets but they run Turn 1, Turn 2, Turn 3, Turn 3-continued, Turn 4:
Turn 5 is missing there too. `bin/fusion-state-drift` reports `verdict=clean` on the row that
checks exactly this, because five bullets happen to equal five Turns.

---
**Verified, not reported.** `grep -n '^### \|^## '` over the session history returns the three
headings named above and nothing else under `## Per-Turn Log`. `grep -n 'Turn 5\|Turn 4'` over
`260801-1244-curator` returns one hit, the Turn-4 bullet at line 120.
`git show 41c224c -- .../\_t\_circle.md` shows that commit adding the **Turn 4** bullet, not a Turn-5
one, so the last Turn was never written anywhere. The events log has `turn_start` for Turn 5 at
17:00:35 and `task_done` for T10 at 17:12:43, so the Turn demonstrably ran.

**Why the drift check does not catch it.** `bin/fusion-state-drift` compares "surface=5 entries"
against "record=5 turns run". The surface count is 5 because the `Turn 3, continued` bullet is a
sixth kind of thing being counted as a Turn: four Turns plus one continuation equals the five Turns
that ran, and the row reads clean while one Turn is missing and one is double-counted. This is the
same shape as `260811-1614_*_the-drift-checks-turn-row-is-satisfied-by-a-turn-start-alone-so-a-turn-that-emits-nothing-else-reads-clean.md`,
arriving from the other side: there a Turn that emitted nothing read clean, here a Turn that emitted
nothing is masked by an entry that is not a Turn.

**Why it matters at this moment specifically.** The Circle is closing. The Turn log on the Circle
record is the durable account of what the Circle did, and Turn 5 is the Turn that closed three of
the Turn-4 review's findings and filed the fourth as a decision. A reader of the closed record will
find the Turn-4 review's two High findings stated as open with no successor entry saying what
happened to them.

**The fix, in two parts.**

1. The orchestrator writes the missing sections at Phase 4 before the closure marker moves: the
   Turn-5 bullet on the Circle record, and the Turn 3, Turn 4 and Turn 5 sections in the session
   history. Both surfaces are the orchestrator's; the reconciler may write neither, which is why
   this is a record rather than an edit.
2. The counting rule in `hooks/lib/state-drift.ts` needs to say what a continuation bullet is. Either
   continuations are not counted, in which case the row wants the count of distinct Turn numbers, or
   the Turn log gets a shape the counter can read unambiguously. Do not fix this by forbidding
   continuation entries: the resume they record is real and worth recording.

**Filed by:** reconciler, session `260813-2345-orchestrator-session.md`, Circle
`260801-1244-curator`. Filed in the Circle's own store per the Origin Rule: the bookkeeping it
describes is this Circle's Turn log and this session's record of running it.

---
**Reconciliation, 2026-08-14 21:53, at HEAD `d90b794` — half repaired, and the other half now has
one more instance. Stays open.**

- **Repaired.** `d270666` added the Turn-5 bullet to `260801-1244-curator`
  `## Turn log`. Verified by reading the section: it now carries six bullets, `Turn 1`, `Turn 2`,
  `Turn 3`, `Turn 3, continued`, `Turn 4`, `Turn 5`.
- **Still standing, and unchanged.** `260813-2345-orchestrator-session.md`
  `## Per-Turn Log` carries `### Turn 1`, `### Turn 2` and `### Turn 3, continued (after the
  resume)` and nothing else — checked with `grep -n '^### Turn'`. Turns 3, 4 and 5 have no section
  in this file.
- **New instance.** Turn 6 ran (four commits, `f0d9d60`, `b90ea28`, `d270666`, `d90b794`) and has no
  entry on either surface: no `- Turn 6` bullet on the Circle record, no `### Turn 6` section in the
  session history.
- **The masking held exactly as this record predicts, at a new pair of numbers.**
  `./bin/fusion-state-drift` reports `Circle Turn log surface=6 entries record=6 turns run`,
  `drift=0`, `verdict=clean`. Six bullets equal six `turn_start` events by coincidence again: the
  bullets are Turns 1 to 5 plus one continuation, the events are Turns 1 to 6. Part 2 of the fix is
  therefore confirmed necessary by a second, independent occurrence rather than by the first one
  only.

Both surfaces remain the orchestrator's to write. The reconciler may write neither, so this pass
records the state and changes nothing.

---
Also seen: 260816-0713-coderev-turn-5-6-range-3a0408a-f77633f.md by reconciler — session `260815-2147-orchestrator-session.md` ran six Turns and its history file
`260815-2147-orchestrator-session.md` stops at a heading covering Turns 2 and 3.
Turns 4, 5 and 6 have no section, and the file's `**Status:**` still reads `In progress` while 27
commits have landed. `orchestrator-live.md` stands at `Turn: 2/12 | Tasks: 5/37 | Commits: 5`, and
`agentstate.yaml` `current_task.summary` still says "queue built, Turn 1 not yet started" with five
`work_queue` rows marked `queued` whose tasks landed (`T12`, `T13` in `c0e179a`; `T15` in `3a0408a`;
`T16`, `T17` in `8c1bd74`). The event log carries four `turn_start` and three `turn_end` entries
against six Turns run.

**Part 2 of this record's fix is now moot on its own terms and the defect is not.** `bin/fusion-state-drift`
and the counting rule in `hooks/lib/state-drift.ts` were removed on 2026-08-15 with the rest of the
counters, so nothing measures the Turn log against the events any more — the masking this record
describes has been replaced by no measurement at all. Part 1 stands unchanged: both surfaces are the
orchestrator's to write and the reconciler may write neither. No Circle is active this session, so
only the session-history half applies.

---

**Reconciliation 260819-1453 (reconciler, Domain `code`, Circle-store pass) — CLOSED. Part 1 was written; part 2's subject was deleted. One residual is named rather than fixed, because it is outside this pass's scope.**

**Part 1 — the missing per-Turn sections — written.**

```
grep -n '^### Turn' shared/history/260813-2345-orchestrator-session.md
  102: ### Turn 1
  131: ### Turn 2
  186: ### Turn 3, continued (after the resume)
  316: ### Turn 3 (written retroactively at Phase 4)
  328: ### Turn 4 (written retroactively at Phase 4)
  342: ### Turn 5
  358: ### Turn 6
```

Every Turn has a section, and the two written at closure say so in their own headings rather than passing themselves off as contemporaneous. The Circle record's `## Turn log` carries Turn 5 (`_c_circle.md:134`) and Turn 6 (`:155`), so the absence this record measured is gone from both surfaces. Landed in the closure commit `4dcfff6`.

**Part 2 — "while the drift check reads clean" — moot.** The check is gone:

```
ls bin/fusion-state-drift hooks/lib/state-drift.ts
  → No such file or directory   (both removed in f45f76a, 2026-08-15)
```

The record's second half is a complaint that a mechanism reported clean over a gap it could not see. That mechanism was removed with the seven others this Circle's successor deleted, so the false reassurance it gave cannot recur. Nothing replaced it: no check reads a session history's Turn sections against the event log, and none is proposed here.

**One residual, named and not touched.** `260815-2147-orchestrator-session.md:5` still reads `**Status:** In progress` for a session that ended. That is the same class as this record's part 1 — a history file left mid-state — on a different file, and it lives in `shared/history/`, which this Circle-store pass does not write to. Reported in `260819-1400-reconciliation-circles.md` so it is not lost with this closure.

---
Resolved: part 1 was written by the closure commit `4dcfff6` — `260813-2345-orchestrator-session.md` now carries a section for every Turn, the two retroactive ones labelled as such, and the Circle record's `## Turn log` carries Turns 5 and 6. Part 2 is moot: `bin/fusion-state-drift` and `hooks/lib/state-drift.ts`, the check that read clean over the gap, were deleted in `f45f76a` on 2026-08-15 and nothing replaced them. Residual on a different file, `260815-2147-orchestrator-session.md:5` (`**Status:** In progress`), reported to the reconciliation log rather than fixed here.
