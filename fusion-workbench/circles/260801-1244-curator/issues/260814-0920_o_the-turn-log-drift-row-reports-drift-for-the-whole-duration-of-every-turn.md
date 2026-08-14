The Turn-log drift row reports drift for the whole duration of every Turn

---
`bin/fusion-state-drift` compares the active Circle record's `## Turn log` entry count against the
number of `turn_start` events, and calls it drift when the record carries fewer. A Turn-log entry
records a commit range and a Coherence verdict, and neither exists until the Turn ends. So the row
reads `DRIFT` from the moment a Turn starts until the moment it closes, which is most of a session.

---
**Measured this session.** At Turn 1's `turn_start` on 2026-08-14, one turn started and zero
entries written, `verdict=drift`, and the PostToolUse hook relayed the same line into the tool
result. Nothing was stale: the Turn was four minutes old and had produced no commit to record.

**Why it matters rather than being cosmetic.** The drift check's own design notes name this exact
failure one level up. `bin/fusion-state-drift` was changed so that finding drift is a line on
stdout and never a non-zero exit, on the ground that a check reporting failure on its commonest
path is one its reader learns to ignore (issue `260810-0710`). The Turn-log row reintroduces that
property inside the output: a reader who sees `verdict=drift` on every mid-Turn call stops reading
which row caused it, and the rows that do mean something — a frozen commit counter, a dangling
`history_file` — arrive in the same breath as the one that always fires.

**Not a repair the orchestrator can make.** Writing a provisional entry at `turn_start` would mean
inventing a commit range and a verdict, which is worse than an absent entry. The orchestrator's
correct behaviour is what it did here: emit the `state_drift` event, name the row, and leave the
record alone.

**Candidate resolutions, none chosen here.** Count entries against *completed* Turns rather than
started ones, which is `turn_end` events instead of `turn_start`. Or treat the current Turn's
missing entry as expected and drift only from the second missing one. Or drop the row while a Turn
is open and evaluate it at Turn boundaries only. Which of these is right depends on what the row is
meant to catch, namely a session that stops writing Turn-log entries while it keeps running, and
all three preserve that.

**Filed by:** orchestrator, session `shared/history/260813-2345-orchestrator-session.md`, Circle
`260801-1244-curator`. Filed in the Circle's own store because the observation arose from running
this Circle's first Turn, per the Origin Rule; the defect it describes is in the plugin, not in the
Circle.
