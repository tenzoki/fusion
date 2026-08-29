The orchestrator's instructions to sub-agents are often wrong

---
Reported by the user on 260812: the orchestrator is too imprecise, and its instructions to other
agents are frequently faulty.

---
**Witness:** the user, directly, across projects
**Severity:** high — a wrong dispatch costs an entire executor run, which is 20 to 90 minutes
**Affected:** `agents/orchestrator.md`

His suspected cause, worth testing rather than adopting: rules are loaded once at Setup, the
sub-agent then works for 30 to 200 minutes, and the rules stop being effective. He suspects the same
decay applies to the project's goals and the Circle's Directive.

Two pieces of corroboration from this repository's own session on 260811, both self-reported by the
orchestrator in its history file:

- It filed a defect record against a queue-ground check by running the version of the snippet in
  its own prompt rather than the one on disk, which had been corrected nine hours earlier. Half the
  record was wrong.
- It built a staging list from an executor's report instead of from `git status`, and committed a
  record's rename without the resolution note the same executor had appended. `git status` said
  `RM`; it read past it.

Both are the same shape: acting on a remembered or reported state instead of the measured one. That
is what "the instructions are often wrong" looks like from the inside, and it is not obviously the
same thing as rule decay — it may be the more ordinary failure of trusting a summary over a source.

---
**Reconciliation 260817-1836** (reconciler, domain `code`). Re-verified reproducible at HEAD `2552586`: The dispatched analysis declined to measure the claim, and no mechanism beyond the narrower git-status-over-report convention at `agents/orchestrator.md:1060` was added. The record is unmeasured rather than unfixed, which is worth naming before it is planned. Marker stays open. Log: `shared/history/260817-1836-reconciliation.md`.

---
Resolved: referred (backlog) — unmeasured, and the git-status-over-report convention in `agents/orchestrator.md` exists; a measurement design that counts wrong dispatch instructions against their executor runs is the idea; backlog entry to be filed by the user
