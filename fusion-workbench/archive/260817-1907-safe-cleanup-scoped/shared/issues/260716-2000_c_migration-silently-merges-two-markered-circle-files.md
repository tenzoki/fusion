# Migration silently merges two markered Circle files with the same stamp+slug into one directory with two records

**Filed:** 260716-2000_*_migration-silently-merges-two-markered-circle-files.md
**Severity:** Medium
**Domain:** code
**Filed by:** coderev
**Scope:** `skills/setup/SKILL.md` Step 0c

## Problem

Step 0c derives the Circle directory name by stripping the marker:
`dir="$(printf '%s' "$b" | sed -E 's/\[[a-z]\]//')"`. Two Circle files that differ *only*
by marker therefore map to the same directory. The records land side by side, because they
differ in filename (`[a]-circle.md` vs `[t]-circle.md`), so `move_one`'s collision check
never fires. The result is one Circle directory holding two records with two different
states — a shape the conventions do not admit and no consumer handles.

## Evidence

Fixture containing `circles/260101-0903[a]-dup.md` and `circles/260101-0903[t]-dup.md`.
After the Step 0c Execute block:

```
./fusion-workbench/circles/260101-0903-dup
./fusion-workbench/circles/260101-0903-dup/[a]-circle.md
./fusion-workbench/circles/260101-0903-dup/[t]-circle.md
./fusion-workbench/circles/260101-0903-dup/analyses
./fusion-workbench/circles/260101-0903-dup/decisions
./fusion-workbench/circles/260101-0903-dup/history
./fusion-workbench/circles/260101-0903-dup/issues
./fusion-workbench/circles/260101-0903-dup/planning
./fusion-workbench/circles/260101-0903-dup/reviews
```

Exit counters: `verschoben=7 kollisionen=0`. No warning of any kind. The migration reports
success.

## Impact

The precondition is unlikely — it needs two Circle files sharing a `YYMMDD-HHMM` stamp and
a slug, differing only in marker. It arises from a botched marker rename (a `cp` where a
`mv` was meant, a partially-applied `git revert`, a manual edit), not from normal
operation. So: rare.

What raises it above Low is that the outcome is *silent* and *ambiguous*, in the one place
the design cannot tolerate ambiguity. `rules/fusion-workbench-conventions.md` makes the
record the sole carrier of Circle state, and the Circle directory the natural key for the
future Plane mirror ("an immutable natural key... or the guarantee 'transferring twice
creates no duplicates' cannot hold"). A directory with two states has no defined state.
Downstream, `playmaker`'s `POINTER-MISMATCH` / `MULTIPLE-ACTIVE` warnings key off Circle
markers and would now see one Circle that is both `[a]` and `[t]`.

Step 0c is otherwise scrupulous about refusing to guess — it skips un-markered files
loudly and refuses collisions loudly. This is the one path where it guesses, and the guess
is invisible.

## Recommendation

Detect the collapse before moving. Two candidate shapes:

1. **Refuse the pair.** Before the conversion loop, group `circles/*.md` by marker-stripped
   name; any group with more than one member is reported on stderr, counted into
   `kollisionen`, and skipped entirely — both files stay put, the user resolves which one
   is real. Consistent with the step's existing posture, and the detector will re-fire next
   run, which is the correct recovery path.
2. **Detect after the fact.** Let the moves happen, then check each converted directory for
   more than one `*-circle.md` and report. Cheaper to write, but it leaves the workbench in
   the broken state and asks the user to clean up after a migration that claimed success.

Prefer (1). Worth adding to the Survey's output too, so the user sees the conflict before
answering the question rather than in the execution log afterwards.

## Cross-references

- `skills/setup/SKILL.md` Step 0c → "Execute" (the `dir="$(... sed -E 's/\[[a-z]\]//')"` conversion loop)
- `rules/fusion-workbench-conventions.md` `## State Markers — circles` (one record per Circle; the natural-key argument)
- `agents/playmaker.md:81-86` (`STALE-POINTER` / `POINTER-MISMATCH` / `MULTIPLE-ACTIVE` warnings)

---
Resolved: commit 6228391 (task T2-A). Verified by the orchestrator against the running system, not by reading.
