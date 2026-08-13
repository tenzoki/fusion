# The deferred version bump has no carrier outside the plan that is being closed

---
**Severity:** Medium — nothing is broken today; the release this Circle's work needs simply has nobody holding it
**Domain:** code
**Status:** open
**Filed by:** reconciler (final reconciliation of session `shared/history/260813-0806-orchestrator-session.md`)
**Affects:** `.claude-plugin/plugin.json`, and the four version surfaces `CLAUDE.md` `## Release process` enumerates
**Cross-references:** `circles/260813-0858-playmaker-maintains-backlog-store/planning/260813-1306_*_the-playmaker-maintains-the-backlog-store.md` step 9; `circles/260813-0910-documentation-matches-shipped-plugin/_a_circle.md`; `shared/issues/260813-0825_*_the-v8-1-0-documentation-step-reached-three-files-and-the-feature-reached-seven-surfaces.md`
---

Step 9 of this Circle's plan, the bump from `8.1.0` to `8.2.0`, was deferred by the user at the
Turn-3 release gate so that one release carries this Circle and
`circles/260813-0910-documentation-matches-shipped-plugin/` together. The deferral is right. What
is missing is the party that performs it once that condition is met.

## Where the obligation lives on disk, measured

A grep for `8.2.0` across the whole workbench returns exactly two hits:

1. `circles/260813-0858-playmaker-maintains-backlog-store/planning/260813-1306_*` step 9 — the
   obligation itself, in a plan whose marker moves to `_c_` at this reconciliation because the
   Circle is closing.
2. `shared/issues/260813-0825_*:142` — one sentence of context inside a paragraph about something
   else. That record's `## Acceptance` section does not name the bump, so nothing there fails if
   the bump never happens.

## Why the documentation Circle does not carry it, contrary to the obvious assumption

`circles/260813-0910-documentation-matches-shipped-plugin/_a_circle.md` `## Directive` says, under
*What this Circle is not*: "the four version surfaces all read 8.1.0" is one of three leads the
survey investigated that "came back clean and stay closed", and "no step re-verifies them". Its
title is *fusion's user-facing documentation agrees with the plugin at v8.1.0*.

So the Circle that the bump waits for has the version explicitly **out of scope**, and its own
premise ("the four surfaces read 8.1.0, and that is correct") stops being true the moment the bump
happens. Nothing is contradictory yet; it becomes contradictory at the release.

## Why this is worth a record rather than a note

The shape is the one this project has been paying for all week: an obligation recorded only in the
document that is about to be closed, so that closing it retires the obligation silently. `2a029eb`
was written precisely to prevent that for the documentation passages, and it did — those got a
`## Update` in a live issue record. The bump got a paragraph in a plan.

Concretely, at HEAD the shipped plugin's behaviour is ahead of its own version number: `b995049` is
a behaviour change to a shipped agent (`agents/playmaker.md`) and a shipped skill
(`skills/next/SKILL.md`) while `.claude-plugin/plugin.json:3` still reads `8.1.0`. Anyone running
`fusion --update` between now and the release gets v8.1.0 behaviour and v8.1.0 documentation, which
is coherent; the incoherence starts if the documentation Circle lands and ships without the bump.

## Acceptance

- One live record names the bump as its own acceptance item, and closing this Circle's plan does
  not retire it.
- Whoever performs it re-weighs `8.1.0 → 8.2.0` rather than carrying the number forward, per step
  9's own instruction: the judgement was made for this Circle's change alone, and the documentation
  Circle may move behaviour too.
- The documentation Circle's *What this Circle is not* clause about the four version surfaces is
  corrected or scoped at the same time, since the bump falsifies its premise.

## Not decided here

Which of the two — a step added to the documentation Circle's plan when it is written, or a
standing release record in `shared/` — is the right carrier. Both work; the choice is the user's at
the point the documentation Circle is planned.
