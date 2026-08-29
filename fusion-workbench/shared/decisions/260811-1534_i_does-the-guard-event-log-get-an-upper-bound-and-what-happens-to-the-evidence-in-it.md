# Does `.guard-state/events.jsonl` get an upper bound, and what happens to the evidence in it?

---
**Domain:** code
**Status:** open
**Filed by:** coder (closing `260805-1859`, task 21)
**Cross-references:**
`260805-1859_*_das-guard-event-log-waechst-unbegrenzt-und-sein-groesster-schreiber-liefert-null-information.md` (the finding this splits off from — its half (a) landed, this is half (b));
`hooks/lib/events.ts` (`emitEvent`, the only writer);
`bin/monitor` (`_read_warnings`, the only reader, re-parsing the whole file every two seconds);
`skills/archive/SKILL.md` safety filter 1 (the never-touch list that names `.guard-state/`);
`rules/fusion-workbench-conventions.md` `## fusion-workbench Layout` → `### Which of them a tracked workbench tracks` (the records-versus-live-state split this question has to be answered under)

---

## Question

`fusion-workbench/.guard-state/events.jsonl` is append-only with no rotation, trimming or
ceiling, and nothing clears it. Issue `260805-1859` named two independent fixes and only one
of them is an implementation question. The cheap half landed with this task: the contentless
`{"event":"tracker_record","tool":"Bash","detail":"Bash command observed"}` is no longer
written, which removes **4 226 of 17 524 lines, 24 %** of the log at today's measurement.

The other half is a policy question and is filed here rather than guessed at, because every
way of bounding this file **discards something a later reader might need**, and the log is
not obviously disposable. Measured in this repository today:

```
lines=17524  size=8.2M  span=2026-07-06 .. 2026-08-11 (36 days)

6100 tracker_record        (4226 of them the Bash event now removed)
4999 guard_allow
1723 churn_warning
1566 churn_critical
1531 cross_file_critical   } written by a tracker deleted in v6.0.0 —
1506 cross_file_warning    } history, not current traffic
  55 guard_block
  42 guard_halt
   2 halt_cleared
```

The 99 lines at the bottom are the audit trail of the guard actually enforcing something.
They are 0.6 % of the file and they are the part nobody would choose to lose. Any bound
expressed in lines or bytes throws them away first, because they are the oldest.

## What makes this a decision and not a patch

The conventions file splits the workbench's root-anchored surfaces into **records** (a past
version answers something; track them) and **live state** (describes *now*; do not track).
`.guard-state/` sits on the live-state side of that split, and `skills/archive/SKILL.md`
never-touch list follows it there. The finding argues, correctly, that an append-only log is
not a state file and deserves its own case. But writing that case down means deciding what
the log *is*, and the two candidate answers give opposite bounds:

- if it is **evidence** — the record of every time the guard blocked, halted or was
  overridden — then it is archived, never truncated, and the monitor's read cost is fixed on
  the read side;
- if it is **telemetry** — a rolling window feeding a dashboard panel — then a cap in
  `emitEvent` is right and the old lines are simply gone.

The same ambiguity decides the monitor. Reading only the tail is not a free optimisation: the
panel caps each event class separately, so a fixed tail window can contain no `guard_halt`
while the whole file does, and the one event meaning "the guard stopped an agent" would
silently leave the dashboard. That is the same evidence loss arriving through the reader.

## Options

1. **Archive, never truncate.** Give `.guard-state/events.jsonl` its own case in
   `skills/archive/SKILL.md` — the log is rolled into the archive store with a dated name and
   a fresh empty log started, the way `/fusion:archive` already moves terminal records into
   the archive store instead of removing them. `emitEvent` is unchanged.
   - Pros: no evidence is destroyed; the never-touch list keeps meaning what it says for
     actual state files; the read cost falls out for free, because the live log is short
     again after each roll.
   - Cons: needs a human to run the skill, so the file can still reach 8 MB between runs;
     adds a case to a skill whose safety filters are deliberately blunt.
2. **Cap in `emitEvent`, oldest lines dropped.** A size or line ceiling enforced on every
   write.
   - Pros: self-limiting with no human in the loop; smallest change.
   - Cons: destroys the enforcement audit trail first, since it is the oldest; a guard that
     forgets it ever halted is a strange guard.
3. **Cap, but by class.** Keep every `guard_block`, `guard_halt`, `halt_cleared` and
   `guard_advisory`; cap the high-volume advisory classes (`tracker_record`, `guard_allow`,
   `churn_*`) at N lines each.
   - Pros: bounds the file where the volume actually is and keeps the 0.6 % that matters.
   - Cons: `emitEvent` would have to rewrite the file rather than append, which is a new
     failure mode on a hot path — the guard's own logging must not become a thing that can
     corrupt state under concurrency.
4. **Drop `guard_allow` too, and re-ask afterwards.** 4 999 lines, 28 %, saying that an
   allowed call was allowed. Whether anything reads it is the same question the Bash
   `tracker_record` already answered "no" to.
   - Pros: another quarter of the file, with the same reasoning that closed half (a).
   - Cons: does not bound anything; it lowers the slope, and the file still grows without
     end.

The monitor's read path is a follow-on of whichever is chosen, not a separate choice:
option 1 makes tail-reading unnecessary, options 2 and 3 make it safe, and under none of
them may the panel lose a class it currently shows.

## Constraints

- **No option may silently discard a `guard_block`, `guard_halt` or `halt_cleared` event.**
  Those are the record of the guard doing its job, and a user reads them after the fact.
- Whatever is decided about `/fusion:archive` is written as **its own case** for an
  append-only log, not as an exception carved into the state-file rule.
- `emitEvent` runs on every guarded tool call, in both hooks. It fails soft today (a missing
  workbench is a silent no-op) and must not acquire a failure mode that costs the guard's
  reply.
- A consuming project's workbench may be tracked, ignored or neither, so no option may assume
  git holds a copy of what it removes.

## Recommendation

Option 1, with option 4 folded in as a separate, smaller call.

Archiving matches what fusion already does everywhere else it faces this question: the
never-touch list exists to protect *state*, `/fusion:archive` moves records rather than
deleting them, and the conventions file's records-versus-live-state split puts an
append-only, cross-session-readable log on the records side. It is also the only option under which the 99
enforcement lines survive by construction rather than by a filter someone has to maintain.

The residual it accepts is honest and small: between archive runs the file still grows, at
roughly 300 lines a day here, and roughly a quarter less than that now that half (a) has
landed.

---
Answered: user, session 260811-0752-orchestrator-session.md (chat) — **Option 1, archive rather than truncate.**
`.guard-state/events.jsonl` gets its own case in `skills/archive/SKILL.md`: the log is rolled into
the archive store under a dated name and a fresh empty log is started, the way terminal records are
already moved. No line or byte ceiling is added, because every such ceiling discards the 99
block, halt and clear events first, and those are the only lines that record the guard enforcing
anything. The log is therefore classified as **evidence**, not telemetry, which also settles the
conventions file's records-versus-live-state split for it. Option 4, dropping `guard_allow`, was
offered alongside and not taken in this answer; it stays available as a separate, smaller call.

---
Implemented: `skills/archive/SKILL.md` (safety filter 1 narrowed, `### Rolling the guard event
log`, the Tier 1 row, the Step 5 proposal line, the Step 7 roll, the manifest section, the
guardrail), `rules/fusion-workbench-conventions.md` `### Which of them a tracked workbench
tracks` (the log on the records side, `.guard-state/` narrowed on the live-state side, and the
archive roll named as what preserves it), `hooks/lib/events.ts` (a doc comment forbidding a
ceiling — none was added), `.gitignore` (the same note beside its `.guard-state/*` line), and
`hooks/lib/__tests__/monitor-warnings-panel.test.ts` (three cases pinning that the panel reads a
rolled log correctly, including the empty file a roll leaves and the window before it is
re-created). Suite green, 1293 passed. Option 4, dropping `guard_allow`, was not taken here and
is not folded in; issue `260805-1859`'s remaining half stays available as its own smaller call.
