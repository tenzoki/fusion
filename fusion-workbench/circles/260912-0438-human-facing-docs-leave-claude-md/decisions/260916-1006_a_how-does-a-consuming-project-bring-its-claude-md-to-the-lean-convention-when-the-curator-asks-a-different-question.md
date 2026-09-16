# How does a consuming project bring its `CLAUDE.md` to the lean convention, when the curator asks a different question?

---
**Domain:** code
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260912-0438-human-facing-docs-leave-claude-md.md, 260911-2237_*_where-does-the-bin-helper-roster-belong-when-a-third-of-claude-md-is-pointers-charged-eleven-times.md

---

## Question

The work item this record sits in aims to keep documentation written for human readers out of
`CLAUDE.md`, in fusion's own repository **and in the convention it ships to other projects**. The
second half has no mechanism behind it.

At a consuming project the curator is the only thing that edits `CLAUDE.md` at all: the autonomous
session-learnings pass that also wrote the file was removed on 2026-08-15 and nothing replaced it
(`agents/curator.md` `### You are the only path to CLAUDE.md, and that does not widen your remit`).

But the curator asks a different question from this one. It reconciles a surface against the
project's recorded history: *is this statement still true?* The lean convention asks *does this
passage belong in a file every session loads?* That is a question about placement, not about truth,
and the curator's preserve list is built for the truth question. The list forbids proposing removal
of a non-obvious failure mode or a hidden-coupling note, because removing one loses it. **Moving one
behind a pointer does not lose it**, and the list as written does not distinguish the two.

A second asymmetry decides how much machinery is worth building. fusion's own cut is a one-off,
performed by a developer who knows the file. A consuming project's `CLAUDE.md` swells over months
with nobody watching, which is recurring drift and is the shape a mechanism earns its keep against.

## Options

1. **Teach the curator to relocate.** A relocation becomes its own change type beside removal, and
   the preserve list guards an item's content rather than its location. `/fusion:curate` then covers
   a consuming project, with the ledger, the gate and the blast-radius pause it already has.
   - Pros: no second writer of `CLAUDE.md`; reuses the whole approval apparatus.
   - Cons: bytes in `agents/curator.md`, which is on the `agents/` growth bound. The curator's
     evidence tiers are built for history facts, and "this passage is topic-scoped" is not one, so
     the tier question has to be answered too.
2. **A separate command** that measures `CLAUDE.md` against the convention and proposes a topic map.
   - Pros: keeps the curator untouched; can be shaped entirely around this one question.
   - Cons: breaks the curator's sole-path claim, leaving two mechanisms writing one file. That claim
     is the reason the file has a single gate at all.
3. **Measure and report only**, as a `/fusion:check` selector: which sections are topic-scoped and
   what they weigh. The cut stays hand work.
   - Pros: smallest build. Matches what this project already does with review coverage and
     uncommitted records, where the measurement is executed and the act is left to a human.
   - Cons: on its own it hands a consuming project a number and no tool.
4. **Nothing.** The convention stays advice a project follows or does not.
   - Pros: ships nothing, breaks nothing.
   - Cons: the item's second half goes unmet.

## Constraints

- Whatever is built leaves `CLAUDE.md` with one writer, or states explicitly what the second one is
  for.
- `agents/curator.md` is on the `agents/` growth bound; an addition is paid for by a removal on the
  same surface.
- A measurement that fires on its commonest path is one a reader learns to skip
  (`260810-0710_*_the-drift-checks-last-line-makes-the-whole-block-exit-non-zero-when-no-circle-is-active.md`).

## Recommendation

Options 1 and 3 together, and they are not alternatives: 3 is the trigger and 1 is the tool. The
check says a project's file has drifted from the convention; the curator is what the user then runs
to act on it.

---
Answered: this record `## Recommendation` — options 1 and 3 together: the curator gains relocation as its own change type with the preserve list guarding content rather than location, and a reporting check names a project's drift from the lean convention without acting on it. The check is the trigger, the curator the tool; ruled by user, Kai Stalmann <ks@qantr.com>.
