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

---
Resolved: `.guard-state/events.jsonl` now has its own case in three places, and no ceiling was
added anywhere.

`skills/archive/SKILL.md` — safety filter 1 narrows to "`.guard-state/` **apart from
`events.jsonl`**" and names why (the counters beside it are rewritten in place; the log is
appended to and never rewritten). A new *Rolling the guard event log* subsection states the
classification, the no-ceiling bound and its reason, and that this is the one target **rolled
rather than selected** — it carries no marker and no age, so no tier survey finds it; it is
included whenever the live log is non-empty and skipped silently when it is absent or empty.
Tier 1 gained its row, so all three tiers roll it and `/fusion:cleanup`'s autonomous tier-1 run
does too. Step 5 lists it in the proposal, Step 7 performs the roll, the manifest gained a
`## Guard event log` section, and the guardrails gained an explicit "never truncate without
archiving, and never add a ceiling — not here, not in `emitEvent`".

The roll is `mv` then `: > "$EV"`, never copy-then-truncate, so no line exists in two places.
`emitEvent` opens, appends and closes per call rather than holding a descriptor, so nothing
keeps writing into the moved inode; an event emitted between the two commands lands in the
archived log, where it is still readable. Destination
`<archive>/<stamp>-<slug>/.guard-state/events-<stamp>.jsonl` — original path preserved relative
to `$WORKBENCH`, dated name as the answer asks, stamp taken from the archive folder rather than
a second `date` reading.

`rules/fusion-workbench-conventions.md` `### Which of them a tracked workbench tracks` — the log
moves to the **records** side and `.guard-state/` on the live-state side is narrowed to "apart
from `events.jsonl`". Two paragraphs explain that the directory is the wrong unit to classify
(a past version of `churn.json` answers nothing; a past version of the log answers when the
guard stopped somebody), and that what preserves the record is the archive roll rather than
tracking the live file — the rolled copies land under `archive/`, which this repository already
tracks, so the evidence reaches git without the live log producing a diff on every tool call.
`.gitignore` carries the same note beside its `.guard-state/*` line, so the two do not read as a
contradiction.

`hooks/lib/events.ts` — **no ceiling added.** A doc comment on `emitEvent` now forbids one
outright, names the 0.6 % of lines every ceiling would discard first, points at the archive roll
as what bounds the file instead, and records that a roll moving the file between calls is safe
by construction.

`bin/monitor` needed no change and three new cases in
`hooks/lib/__tests__/monitor-warnings-panel.test.ts` pin why: a byte-empty log (what a roll
leaves), an absent log (the window between the `mv` and the re-create) and a log holding only
post-roll events all render correctly — empty panel, empty panel, and the new events only.

Not folded in, per the answer: dropping `guard_allow`.

Verification: `cd hooks && npm test` — exit 0, 1293 passed.
