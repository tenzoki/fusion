# Does the activity log keep its own command, or become the first half of `/fusion:cadence`?

---
**Domain:** code
**Filed by:** planner, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260909-1634_*_how-should-the-skill-surface-be-cut-once-the-agent-and-ceremony-cut-has-landed.md, 260915-2145_*_the-v11-upgrade-note-is-maintained-as-live-in-one-commit-of-this-range-and-frozen-in-the-other.md, 260915-2309_*_merge-log-activity-into-cadence.md

---

## Question

`/fusion:cadence` reads the activity log as one of three sources and reports `activity log: none`
when it is absent or stale. `/fusion:log-activity` writes that log. Nothing couples them, so a
digest is only as fresh as the last time somebody remembered to type the other command — and
`rules/fusion-workbench-conventions.md` `## Filename Patterns` records the sharper consequence: a
legacy `$USER`-keyed log cannot be adopted by cadence *because* cadence may not write it, so the
digest reports the source absent with the file in front of it.

Measured at HEAD on 2026-09-15: `activity-log-k1.md` carries 70 day-sections, the newest dated
2026-08-29 — seventeen days stale in the repository that ships both commands. That is the evidence
the split fails in practice and not only in principle.

The choice must be made now because the skill surface is being cut (`260909-1634_*_…`) and because
a command nobody types is a body that still costs bytes on a bounded surface.

## Options

1. **Merge: `/fusion:cadence` writes the log, then digests it; `/fusion:log-activity` stops
   existing.** One command, always fresh.
   - Pros: the digest can never be built on a stale log; the adoption of a legacy `$USER`-keyed
     file becomes reachable; one scan serves both outputs instead of two passes over one corpus;
     one fewer body on the `skills/` surface.
   - Cons: a user who wants only yesterday's digest pays the scan; the standalone command stops
     resolving for anyone with it in muscle memory; the merged body must fit a byte budget that
     forces the digest's own inputs to be reshaped (see Constraints).
2. **Keep both, add a refresh switch** (`/fusion:cadence --refresh`).
   - Pros: the cheap read stays cheap; nothing is removed.
   - Cons: two commands and now a flag; the default is still the stale read, so the failure mode
     the merge exists to remove survives as the default.
3. **Keep both, let cadence detect staleness and offer to refresh.**
   - Pros: no flag to remember.
   - Cons: a heuristic decides what the user came for; an offer is a second prompt in a command
     that should answer a question; the staleness threshold is a number nobody can derive.

## Constraints

- The activity log stays in the **project root** as `activity-log-<checkout>.md`
  (`rules/fusion-workbench-conventions.md` `## Filename Patterns`). The merge must not move it.
- `skills/*/SKILL.md` is a bounded surface with 56 bytes of margin at HEAD. Deleting a body does
  not fund the merge: the growth instrument drops a deleted file's floor with it, and
  `skills/log-activity/SKILL.md` sits 356 bytes *below* its baseline, so the deletion costs that
  credit. The merged body must land at **19 427 bytes or less** — smaller than today's cadence body
  alone — or the suite goes red.
- `hooks/lib/__tests__/helpers/growth-bound.ts` `## Re-baselining` refuses the read under which a
  cut re-baselines what it cut. No head-room constant may be edited to make this land.
- `rules/fusion-workbench-conventions.md` and `CLAUDE.md` are charged to all eleven dispatch paths;
  the conventions edits must be net non-positive against the margins those rows hold.

## What the answer gives up, recorded because the merge is the ruling

- **The standalone command.** `/fusion:log-activity` stops resolving. A user with it in muscle
  memory gets an unknown-command error and no pointer.
- **The no-workbench mode.** `/fusion:log-activity` proceeds without a workbench, scanning git
  alone into an unsuffixed `activity-log.md` in the working directory. `/fusion:cadence` halts
  there and keeps halting, so that mode goes and the unsuffixed filename becomes unreachable.
- **The churn list's grain.** The byte budget forces one scan feeding both outputs, so the digest's
  recurring-themes list counts activity-log **day-sections** where it counted **log units** (a
  session-history file, a day-section, or a git-commit day). Two of those three were already
  day-grained and the third is a frozen store, so the loss is bounded — but the column's meaning
  changes from "sessions" to "days" and the report must say so.

## Recommendation

Option 1. The user has ruled for it and the measurement supports the ruling: nobody types the
second command, so the digest's own stated source has been absent or stale for seventeen days in
the project that ships it. Options 2 and 3 both leave the stale read as the default path, which is
the failure the change exists to remove.

---
Answered: `260915-2309_*_merge-log-activity-into-cadence.md` `## Approach` — option 1, merge: `/fusion:cadence` writes the activity log and then digests it, always fresh, and `/fusion:log-activity` stops existing. The user put it as "nobody wants to call two commands for that", and chose it over a refresh switch and over a staleness heuristic on being shown both. Two costs were accepted with it once the byte ceiling forced a redesign rather than a concatenation: the recurring-themes column counts days instead of sessions, and the no-workbench mode goes, the merged command halting where the old one wrote an unsuffixed log; ruled by user, Kai Stalmann <ks@qantr.com>.
