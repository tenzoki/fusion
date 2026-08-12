# Planner session — Circle-first placement and the backlog store

**Date:** 2026-08-12
**Agent:** planner (run top-level, dispatched by the user)
**Status:** Complete
**Directive:** Plan the change to fusion's working model that the two decision records answered
at 260812-1620 describe. They are one design and neither is implementable alone.

## Inputs read

- `shared/decisions/260812-0254_*_where-do-a-circles-spec-and-plan-belong-when-the-circle-exists-before-them.md`
  — answered: option 1, the Circle comes first; the twelve existing Circles are migrated.
- `shared/decisions/260812-0254_*_does-fusion-need-a-backlog-store-and-a-maintainer-that-anticipates-circles.md`
  — answered: option 2, `shared/backlog/` as a store with the playmaker consolidating; no
  seventeenth agent; option 4 (retiring `taskplanner` into it) explicitly left undecided.
- Rules: `agent-setup.md`, `fusion-workbench-conventions.md`, `decision-record-examples.md`,
  `user-facing-output.md`, `critical-stance.md`, `design-diagrams.md`, plus
  `circle-records.md` and `workbench-path-resolution.md` read for the mechanisms they own.
- Prompts and sources: `agents/playmaker.md`, `agents/shaper.md`, `agents/planner.md`, the
  relevant sections of `agents/orchestrator.md`, `skills/direct/SKILL.md`,
  `skills/next/SKILL.md`, `skills/setup/SKILL.md`, `bin/fusion-paths`,
  `hooks/lib/staging-drift.ts`, `hooks/lib/__tests__/reference-resolution-lint.test.ts`,
  `hooks/lib/__tests__/path-literal-lint.test.ts`.
- Voice profiles: `stilwerk/chat-voice-de.yaml`, `stilwerk/default-voice-en.yaml`.

## Output

`shared/planning/260812-1720_o_circle-first-placement-and-the-backlog-store.md` — 14 steps,
three Mermaid diagrams (the promotion lifecycle and its writers, the backlog entry's state
machine, the migration's decision procedure), one human gate at step 11.

## What the research found, and how it changed the plan

**The migration is one file, not fourteen.** Each spec and plan has a sibling session-history
file written by the same agent run under the same `bin/fusion-paths` call. Where that history
sits records where `OUT_*` resolved, and therefore whether a Circle was active. Checked for all
seven files in `shared/planning/`, one witness each: six in `shared/history/` (no Circle active,
so the Origin Rule already places them correctly), one in
`circles/260716-1847-workbench-umbau/history/`. Ten of the twelve Circles already hold their
planning documents inside themselves. The one file with a Circle origin was promoted out
deliberately at closure with a recorded reason, so moving it back is a decision rather than a
mechanical step, and it is filed as one.

**The citation problem is real and is the plan's decidability line.** 184 references to those
seven files exist; 91 of them do not carry the file's current filename. They use stale exact
markers, the wildcard form, the retired pre-v4 bracket syntax, ellipsis truncations, a
`fusion-workbench/` prefix, a Circle-relative prefix, or a bare timestamp. Exact-filename
matching under-reports by half; stem matching over-reports, because a stem is not unique across
kinds — `260812-1232` names one plan, two decisions, one defect and one history file. The
mechanism changes rather than the pattern: the existing reference-resolution lint already parses
this grammar and resolves against the tree, and it simply does not scan the workbench.

**Two mechanisms already existed and were reused rather than rebuilt.** The citation parser
above, and the whole promotion path — a backlog entry becomes an anticipated Circle through
`/fusion:direct` → shaper, which touches no pointer. That is what keeps this change from adding
a writer to the closed `.active-circle` enumeration: an anticipated Circle is not active.

**`shared/backlogs/` already exists**, holding one hand-written 12 KB text file the user created
on 260811. It is not a declared store — no resolver key, no `mkdir` in setup, classified
`unclassified` by the staging-drift check. That file is the evidence for the entry design: when
the cheapest structured surface was a decision record, the user wrote a text file instead. The
plan moves it into the declared store whole and leaves splitting it to the playmaker, whose new
job that is.

**The one mechanism the design genuinely needed** is an optional second argument on
`bin/fusion-paths`, naming a target Circle. Without it, "the Circle comes first" is not
implementable: the resolver keys `OUT_*` off `.active-circle`, and an anticipated Circle is not
active. The rejected alternative — writing `.active-circle` at anticipation — would collapse the
anticipated and active states and add a writer to the closed enumeration.

## Bounding the surface

Asked for explicitly and answered in the plan's own `## What this removes, and what it does not`:
this change removes nothing structural. It removes three explanatory passages that stop being
true, converges the shaper's two placement rules into one, and draws one bound on purpose — no
agent gains an obligation to file backlog entries. Everything else is addition.

## Filed alongside

- Decision `260812-1720_o_when-exactly-does-the-anticipated-circle-come-into-existence.md` —
  before the shaper's first question, or before its first write. The plan implements the second
  reading and step 8 depends on the answer.
- Decision `260812-1720_o_does-the-circle-first-migration-reverse-a-recorded-promotion-out-of-a-circle.md`
  — the migration's only real question. Steps 12 and 13 do nothing if the answer is "leave it".
- Defect `260812-1720_o_the-migration-premise-in-the-circle-placement-decision-does-not-match-the-workbench.md`
- Defect `260812-1720_o_the-reference-resolution-lint-does-not-scan-the-workbench-where-citations-are-densest.md`

## Not done

Nothing was implemented. No executor was dispatched. The plan awaits the user's review and the
two decisions above.
