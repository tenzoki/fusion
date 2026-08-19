The Turn-3 bookkeeping says no review ran, in the very commit that landed the review

---
Commit `18173e1` added the Turn-3 review file, six defect records and the Turn-log entry for the
Turn. The same commit wrote, into `shared/history/260813-2345-orchestrator-session.md`, the lines
"Review findings: none yet — the incremental review for this Turn has not run" and "Coherence: not
yet evaluated for this Turn". Both are false at the moment they were committed. Two neighbouring
bookkeeping surfaces are stale in the same direction.

---
**Verified 2026-08-14 at HEAD `18173e1`.**

**1. The session history's `## Turns` section reads `(none yet)` after three Turns.**
`shared/history/260813-2345-orchestrator-session.md:32-34`. Three Turns ran; `## Per-Turn Log`
below it carries all three plus the resumed continuation. The section has never been written to
since Setup.

**2. The Turn-3-continued block contradicts its own commit.**
`shared/history/260813-2345-orchestrator-session.md`, `### Turn 3, continued (after the resume)`,
the bullets "Review findings: none yet — the incremental review for this Turn has not run" and
"Coherence: not yet evaluated for this Turn". `git show 18173e1 --` on that file shows both lines
being *added* by the commit whose own message reads "Six findings, none in behaviour", and whose
diff adds `circles/260801-1244-curator/reviews/260814-1419-coderev-curator-turn-3.md`.

**3. The Circle's Turn-log entry for the same Turn names no review at all.**
`circles/260801-1244-curator/_t_circle.md:107-118`, added by the same commit. Turn 1's and Turn 2's
entries each state what `coderev` filed and what it judged. The Turn-3-continued entry ends at the
run file and says nothing about the six findings or the review's verdict on the Directive.

**4. The Turn-3 entry above it cites a defect record by a stamp that does not exist.**
`_t_circle.md:104` cites `issues/260814-1210_*_the-proof-run-cannot-be-dispatched-from-the-session-that-built-the-agent.md`.
The file is `issues/260814-1200_o_the-proof-run-…`. The wildcard is correct and the stamp is off by
ten minutes, so the citation resolves to nothing under any marker. This one is not a staleness — it
was wrong when written.

**Why this is worth filing rather than fixing in passing.** All four surfaces are the orchestrator's
to write and are outside the reconciler's write set, which is plans, defect records, reviews and its
own history. More to the point, the pattern is the one this session already recorded twice as a
`state_drift` event: the bookkeeping freezes while the work continues and is brought current
afterwards, and the "afterwards" did not arrive for Turn 3's review. `bin/fusion-state-drift` does
not catch any of the four — it compares Turn-log entry *counts* against `turn_start` events, not the
content of an entry, and the entry exists.

**Severity:** Medium. A reader reconstructing this session from its history file concludes that
Turn 3 was never reviewed, when it was reviewed over the whole uncovered range with a zero-uncovered
result and a verdict on the Directive.

**Owner:** `orchestrator` at Phase 4, which already writes the closure note, the Turn log and the
session history and can correct all four in that pass.

**Not to be fixed by widening the drift check.** Making `bin/fusion-state-drift` parse a Turn-log
entry for a review citation would put a prose parser in a measurement whose whole design is that it
compares two records that cannot silently freeze. The gap is that the orchestrator writes the Turn
block before the review and does not return to it; that is a sequencing fix in `agents/orchestrator.md`,
not a measurement fix.

**Filed by:** reconciler, session `shared/history/260813-2345-orchestrator-session.md`, Circle
`260801-1244-curator`. Filed in the Circle's own store per the Origin Rule: the bookkeeping it
describes is this Circle's Turn log and this session's record of running it.


---

**Reconciliation 260819-1453 (reconciler, Domain `code`, Circle-store pass) — STAYS `_o_`. Re-measured at HEAD `e435f03` (v10.3.0). All four sub-claims unchanged.**

`shared/history/260813-2345-orchestrator-session.md:32-34` — `## Turns` still reads `(none yet)`. `:191` still says "Review findings: none yet". `:193` still says "Coherence: not yet evaluated for this Turn". And the citation `issues/260814-1210_*_the-proof-run-cannot-be-dispatched-…` at `_c_circle.md:104` still resolves to nothing under any marker — no file carries the stamp `260814-1210`; the record is at `260814-1200`.

The closure commit `4dcfff6` added the per-Turn sections that closed this record's neighbour (`260814-2017`) and touched none of these four.
