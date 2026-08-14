Turn 5 edited three shipped surfaces including an always-on rule file, and no review pass ever opened them

---
`bin/fusion-review-coverage` reports `uncovered=3` over this session's range: `6d433c2`, `9f4cdac`
and `41c224c`. The first and third carry workbench records only, but `9f4cdac` is Turn 5's work
commit and it edits `README-agents.md`, `agents/orchestrator.md` and
`rules/fusion-workbench-conventions.md` — the last of which is an always-on rule file every agent
loads on every dispatch. The Circle is closing over an unreviewed change to shipped normative text.

---
**Verified, not reported.** `bin/fusion-review-coverage` at HEAD `41c224c`: `commits=25`,
`reviews=5`, `uncovered=3`, `verdict=uncovered`, with the three commits named. The newest review,
`circles/260801-1244-curator/reviews/260814-1850-coderev-curator-turn-4.md`, declares
`**Reviewed-range:** 0301909..d5b71f1`, which stops one commit before `6d433c2`.
`git show --stat 9f4cdac` shows the three shipped files above among its changes.

**How the gap opened.** The events log shows `turn_start` for Turn 5 at 17:00:35 and `task_done`
for T10 at 17:12:43, then no `review_start`. The next event is `session_start` at 18:09:57 whose
own detail line reads "resumed: … re-entering Turn 5 at Phase 3". The resume treated Turn 5 as
finished and re-entered at Phase 3, so the Turn's step 3c incremental review was skipped rather
than deferred. Nothing in the resume path notices that the Turn it re-enters never had its review.

**What is and is not already covered.** The measurement exists and works — that was
`shared/issues/260810-1205_c_seven-of-sixteen-commits-in-the-session-range-never-reached-a-review-pass-and-nothing-measures-the-gap.md`,
closed by building this helper. What is missing is that nothing acts on the measurement at a
boundary where acting is still cheap. `CLAUDE.md` states deliberately that the helper "is **not** a
release gate", and this record does not propose making it one: the narrower gap is that a resume
which re-enters at Phase 3 has no step that asks whether the Turn it is skipping past was reviewed.

**Two candidate fixes, and they are not equivalent.**

1. **Run the review now, before closure.** Dispatch `coderev` over `6d433c2..HEAD` and let the
   Circle close over a covered range. Cheapest, and it is the only one that fixes *this* Circle
   rather than the next one. It may file findings, which is the point.
2. **Give the resume path the check.** `agents/orchestrator.md`'s resume branch reads the coverage
   helper already at Phase 4; reading it at the point where a resumed session decides which Phase to
   re-enter would have caught this while the Turn was still open. That is a prompt change and it
   does not help the current range.

Taking 2 without 1 closes the Circle over unreviewed rule text. Taking 1 without 2 leaves the next
resumed session in the same place.

**Filed by:** reconciler, session `shared/history/260813-2345-orchestrator-session.md`, Circle
`260801-1244-curator`. Filed in the Circle's own store per the Origin Rule: the uncovered commits
are this Circle's own work.

---
**Update, 2026-08-14 20:30 (reconciler). The gap is being closed as this record is written, and the
record stays open until the artifact exists.**

A `coderev` Turn-5 pass over `d5b71f1..41c224c` was running concurrently with this reconciliation.
It has filed two High findings — `shared/issues/260814-2022_o_this-repository-cannot-set-its-own-turn-budget-because-a-test-pins-fusion-guard-json-to-the-template.md`
and `circles/260801-1244-curator/issues/260814-2022_o_ten-citations-that-bf9553f-staled-still-stand-and-six-of-them-are-in-the-table-the-fix-corrected.md`
— both of which cite `circles/260801-1244-curator/reviews/260814-2022-coderev-curator-turn-5.md`
as their review file.

**That file is not on disk yet.** `ls` over the reviews directory returns five files, the newest
being the Turn-4 review, and `bin/fusion-review-coverage` still reports `uncovered=3` with
`reviews=5`. The helper tiles declared `**Reviewed-range:**` fields, so the range is not covered
until the review file exists and declares its range.

**What this changes about the record.** The second candidate fix — giving the resume path the
coverage check — is untouched and still the durable half. The first is in progress. Close this
record when `bin/fusion-review-coverage` reports `uncovered=0` for the range, not when the findings
appear: the findings are evidence a reviewer ran, and the review file is the artifact that makes the
range covered for every later reader.

**One thing the concurrent pass already establishes, and it is worth recording here.** The review
found a real defect in `9f4cdac` itself — ten stale line-number citations into `agents/orchestrator.md`
and `agents/shaper.md` left standing in shipped documentation. This reconciler independently checked
five of them: `README-agents.md:59` cites `agents/orchestrator.md:392`, which is a table separator
row; `:61` cites `:850`, which is a sentence about how the review-coverage range is derived; `:72`
cites `:438`, which is the plan-review human gate. All three are wrong at HEAD. So the gap this
record names was not harmless — the unreviewed commit did carry a defect, and it took a review to
find it.

---
Resolved: the range is covered. `circles/260801-1244-curator/reviews/260814-2022-coderev-curator-turn-5.md`
landed at 20:31 and `bin/fusion-review-coverage` now reports `commits=25`, `reviews=6`,
`uncovered=0`, `verdict=covered` — the closing condition this record set for itself, checked by
running the helper rather than by observing that a reviewer had been active. The one remaining
`unusable=1` is the conceptrev plan evaluation, which carries no `**Reviewed-range:**` and is
tracked separately as `shared/issues/260811-1145_o_*`.

**Closed on the first candidate fix only.** The review was run over the uncovered range and it found
a real defect there — ten stale line-number citations in shipped documentation, filed as
`circles/260801-1244-curator/issues/260814-2022_o_ten-citations-that-bf9553f-staled-still-stand-and-six-of-them-are-in-the-table-the-fix-corrected.md`,
which is open and is now the live half of this. The second candidate fix is **not** done and does not
belong to this record any more: nothing in the resume path asks whether the Turn it re-enters at
Phase 3 was reviewed, so the next resumed session reaches the same state. Refiled as the durable
half rather than kept open here, because this record's subject was one range and that one is now
covered.
