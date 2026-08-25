# Does Setup repair a `.gitignore` that departs from the four-class partition, or only report it?

---
**Domain:** code
**Filed by:** user, Kai Stalmann <ks@qantr.com>
**Cross-references:** shared/issues/260825-1019_*_nothing-checks-that-a-tracked-workbenchs-gitignore-matches-the-four-class-partition.md; rules/workbench-tracking.md `## The four classes`; shared/planning/260822-1136_*_spec-fusion-becomes-a-multi-user-tool.md

---

## Question

A consuming project was measured ignoring two entries that must travel between checkouts
(`orchestrator-events.jsonl`, class R2; `.fusion-setup`, class R3) and tracking two that
must not (`.active-circle`, `portfolio.md`, both class L). Nothing in fusion noticed, for
the three reasons the cited defect record measures. The partition itself is settled; what
was open is what a mechanism does about a project that departs from it, and where that
mechanism lives.

## Options

1. **Setup reports the mismatch** — name the wrong lines in the Done report and leave the
   file alone.
   - Pros: writes nothing the user did not ask for; keeps Setup's single-question budget.
   - Cons: a report at the start of a session is read once and acted on later or never.
     The failure it warns about is silent and only shows up in another person's clone.
2. **Setup repairs the mismatch** — bring `.gitignore` into line with the partition.
   - Pros: the departure cannot survive a Setup run, and Setup is the step every session
     runs before any work.
   - Cons: Setup writes to a file at the project root that it did not create, and a
     project with a deliberate departure is overruled unless something records the
     departure.
3. **The archive step carries the check** — the rule's other named consumer.
   - Pros: that step already reads `rules/workbench-tracking.md`.
   - Cons: it runs at cleanup, after a whole session has written records that a wrong
     `.gitignore` already kept out of git, and many sessions never reach it.

## Constraints

- The question a mechanism asks is `git check-ignore -q <path>`, never a text search of
  `.gitignore`. This is the same reasoning `rules/workbench-tracking.md` `## The event log
  carries a union merge driver` already states for `git check-attr`, and it transfers
  unchanged: `check-ignore` resolves a broader glob, a nested ignore file and a negation,
  answers for a path that does not exist yet, and resolves relative to the working
  directory.
- Outside a git work tree there is nothing to ask and nothing is written.
- Whatever is written lands at the project root, in the directory Setup ran in, never in a
  subfolder and never inside `fusion-workbench/`.

## Answer

**Option 2: Setup repairs it.** The user's ground is that collaboration otherwise fails,
and that is the transport argument in `rules/workbench-tracking.md` `## Whether to track
the workbench at all` arriving at its consequence. Git is the only transport between two
checkouts. A `.gitignore` that excludes a class R2 or R3 entry does not degrade
collaboration, it removes it for that entry, and it does so silently: the checkout that
wrote the file sees nothing wrong, and the one that pulls sees an absence it cannot
distinguish from work nobody did. A report is the wrong instrument against a failure whose
whole character is that no one notices it.

This also settles where the check lives: **in Setup**, not in the archive step. Every
session runs Setup before it writes anything; the archive step runs after, if it runs at
all.

## What stays open

Whether a project that departs deliberately can say so once and stop being repaired. The
answer above does not decide it, and the two interact: a repair with no opt-out overrules
a project that had a reason. That question needs its own record before the repair is
built, because the shape of the repair depends on it.

---
Answered: this record `## Answer` — Setup repairs the mismatch rather than reporting it, and the check lives in Setup rather than in the archive step. Stated by the user 2026-08-25 in session `shared/history/260825-0858-orchestrator-session.md`.
