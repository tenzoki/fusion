# The guard event log needs its archive case, because it is evidence and not live state

---
**Severity:** Medium
**Domain:** code
**Filed by:** orchestrator, session 260811-0752, realising an answered decision
**Affects:** `skills/archive/SKILL.md` (the never-touch list, which follows `.guard-state/` to the live-state side); `rules/fusion-workbench-conventions.md` `### Which of them a tracked workbench tracks` (the records-versus-live-state split)
**Cross-references:** `shared/decisions/260811-1534_a_does-the-guard-event-log-get-an-upper-bound-and-what-happens-to-the-evidence-in-it.md` — the answer this realises; `shared/issues/260805-1859_c_das-guard-event-log-waechst-unbegrenzt...` (the record whose cheap half already landed)

---

`.guard-state/events.jsonl` is classified as **evidence**, not telemetry. It gets its own case in
`/fusion:archive`: rolled into the archive store under a dated name, a fresh empty log started.
No line or byte ceiling is added anywhere, because every such ceiling discards the oldest lines
first and those are the 99 block, halt and clear events — the only lines recording the guard
enforcing anything.

The conventions file's split puts `.guard-state/` wholesale on the live-state side and the archive
skill's never-touch list follows it there. An append-only log is not a state file; this record is
what gives it its own case in both places.

**Acceptance:** `/fusion:archive` archives the log and starts a fresh one; the conventions file
distinguishes the append-only log from the state files inside `.guard-state/`; no ceiling is added
in `emitEvent`; the monitor still reads a rolled log correctly, including immediately after a roll
when the live file is empty.

**Not in this record:** dropping `guard_allow` (4 999 lines, 28 %) was offered alongside and not
taken. It stays available as a separate, smaller call.
