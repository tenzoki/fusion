A resume that re-enters at Phase 3 never asks whether the Turn it skips past was reviewed

---
When an interrupted session resumes and decides to re-enter at Phase 3, it treats the Turn it left
as finished. Nothing on that path asks whether that Turn's step 3c incremental review ever ran. In
this session it had not, and Turn 5's work commit `9f4cdac` — which edits `README-agents.md`,
`agents/orchestrator.md` and the always-on `rules/fusion-workbench-conventions.md` — went unreviewed
until a review was run by hand at the very end. That review found a real defect in it.

---
**Verified, not reported.** `fusion-workbench/orchestrator-events.jsonl` carries `turn_start` for
Turn 5 at `2026-08-14T17:00:35` and `task_done` for T10 at `17:12:43`, with no `review_start`
between them. The next event is `session_start` at `18:09:57`, whose own detail line reads
"resumed: Circle 260801-1244-curator, mode plan, all 10 tasks done; re-entering Turn 5 at Phase 3",
followed by `scope_resolved` at `18:10:30` reading "no execution work remains". So the resume
concluded the Turn was complete from the task counters alone.

**Why the existing machinery did not catch it.** `bin/fusion-review-coverage` measures exactly this
and measured it correctly — it reported `uncovered=3` throughout. But `agents/orchestrator.md` reads
the helper at Phase 4 (`:836-842`), which is after closure decisions are being made, and at Step 3c,
which is inside the Turn loop the resume had already exited. The resume branch itself reads
`bin/fusion-state-drift`, which does not measure review coverage. So the one moment the check was
cheap — the moment the resume chose which Phase to re-enter — is the one moment nothing asked.

**What this is not.** Not a request to make the coverage helper a release gate. `CLAUDE.md` states
deliberately that it "is **not** a release gate — whether a release may go out over an uncovered
range is an unfiled decision this program does not pre-empt", and that stays true. The narrower
claim here is that a session deciding *which Phase to re-enter* is deciding whether a review will
ever happen, and it should have the number in front of it when it decides.

**The fix.** Add the coverage read to the resume branch of `agents/orchestrator.md`, beside the
existing `bin/fusion-state-drift` call, and have a non-zero `uncovered` count over the current Turn's
commits route the resume back through step 3c rather than forward to Phase 3. The helper already
takes its range start from `session.git_head_at_start` in `agentstate.yaml`, which the resume path
has read by that point.

**How this record came to exist separately.** It is the second of the two candidate fixes in
`circles/260801-1244-curator/issues/260814-2017_c_turn-5-edited-three-shipped-surfaces-including-an-always-on-rule-file-and-no-review-pass-ever-opened-them.md`.
That record's subject was one uncovered range, and the range was covered at 20:31. This is the half
that outlives it.

**Filed by:** reconciler, session `shared/history/260813-2345-orchestrator-session.md`, Circle
`260801-1244-curator`. Filed in the Circle's own store per the Origin Rule: the miss happened while
running this Circle, in this Circle's own last Turn.
