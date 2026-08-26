# A fifth Turn-count definition site still reads the whole file and names no implementation

---
`dad5042` routed four sites through one implementation and the closed record enumerated four, all of
them in `agents/orchestrator.md` and `skills/setup/SKILL.md`. `agents/reconciler.md:21` is a fifth.
It defines the Turn count as the `turn_start` events in the whole log since this session's
`session_start` — unscoped by checkout, which under `merge=union` is the very count this Circle
exists to abolish — and it names no implementation.
---
**Filed by:** coderev, Kai Stalmann <ks@qantr.com>

**Severity:** Medium. The reconciler reads this to phrase a progress figure rather than to gate
anything, so a wrong number misinforms a report; but it is the same defect the Circle just closed,
one prompt over, and `agents/orchestrator.md:558` now instructs against it in as many words.

**Cross-references:**
`circles/260825-2023-presence-travels-monitor-filters-own-checkout/issues/260825-2140_*_the-turn-count-defect-names-three-sites-and-a-fourth-carries-the-identical-whole-file-count.md`
(the record whose enumeration is short, closed on `dad5042`);
`shared/issues/260822-1136_*_two-definitions-of-the-turn-count-disagree-and-the-resume-snippet-counts-every-session-in-the-log.md`
(the record before it, whose reach was short by one and which was closed `referred (C4)`).

## What is there

`agents/reconciler.md:21`, verbatim, the second sentence of the `control.turn_start_head` bullet:

> There is no Turn NUMBER in this file: the counters were removed on 2026-08-15 and the Turn count is
> the number of `turn_start` events in `fusion-workbench/orchestrator-events.jsonl` since this
> session's `session_start`.

Two things are wrong with it at `72a9561`, and both were repaired everywhere else in the same range.

**It is unscoped by checkout.** `rules/workbench-tracking.md` `## The event log carries a union merge
driver` now states that every reader scopes the log by `checkout` before it sorts, and names three
readers. This sentence describes a fourth reading and applies no scope, so after a pull it counts
another checkout's Turns.

**It names no implementation.** `agents/orchestrator.md:558` states the definition once and then
says: "Read the figure from the helper; do not derive it again anywhere." This sentence is a
derivation, in a prompt `bin/fusion-rules` loads on every reconciler dispatch.

## Why the enumeration kept coming up short

The two closed records each counted the sites they could see from where they were read. The first
named three, all in `agents/orchestrator.md`; the planner found the fourth in `skills/setup/SKILL.md`
and filed the shortfall as its own record; nobody grepped the whole prompt corpus. `grep -rn
turn_start agents/ skills/ rules/` returns the fifth in one command.

## Fix direction

One sentence. Replace the derivation with the pointer the orchestrator prompt already uses: the Turn
count is `bin/fusion-events turns`, whose definition is stated at `agents/orchestrator.md` Phase 2
step 3. The reconciler does not need the derivation at all — it needs to know that the number is not
in `agentstate.yaml` and where it is instead, which is what the first half of the sentence already
says.

---
Resolved: `agents/reconciler.md:21` no longer derives the count. The bullet now takes it from
`bin/fusion-events turns` behind `[ -x "$FUSION_PLUGIN_ROOT/bin/fusion-events" ]`, states that the helper
scopes it to this session and this checkout, cites `agents/orchestrator.md` Phase 2 step 3 as the one
place the definition is stated, and says the figure is `unavailable` when the helper is absent or prints
no `scope=checkout` line, never `0` and never a `scope=all-checkouts` number. The fifth site is now the
fifth call site and no new definition was written. The record's `grep -rn turn_start agents/ skills/
rules/` was re-run over `bin/`, `docs/`, `README-hooks.md`, `CLAUDE.md` and the hook sources as well: no
sixth site derives the count. `agents/orchestrator.md:237` states a property of the count (a resumed
session's two `session_start` lines anchor it at the first) without naming the helper, which is a
description rather than a derivation and was left alone.
