# Task 9 — one definition of a churn session in `/fusion:cadence`

**Agent:** coder
**Status:** Complete
**Origin:** Not Circle work. Closes a defect from the shared issue store; no Circle was active.
**Source record:** `260731-2246_*_cadence-churn-session-defined-two-ways-for-git-commits.md`
**Queue entry:** `fusion-workbench/tasklist.md` § 9 (`I:260731-2246-churn-unit`)

## What was wrong

`skills/cadence/SKILL.md` stated its unit of counting twice and the two disagreed for the git
source. Step 4 said a log unit was "one git commit"; step 7, naming step 4 as its authority,
said "one git-commit day". A theme worked in ten commits on one afternoon scored 10 under the
first and 1 under the second, and git is normally the highest-volume of the three sources, so
the disagreement decided the ranking of the churn list the skill exists to produce.

## What changed

Fixed on **per-commit-day**, per the direction settled in the record: churn counts how many
separate times the user came back to a theme, and a run of commits in one sitting is one
return. It also puts git on the same grain as the other two sources (a history file is one
session, an activity-log day-section is one day), so no source counts finer than the rest.

Five sites in `skills/cadence/SKILL.md`, all reading against the same unit now:

1. **Step 4, the log-unit definition.** Now "one **git-commit day** (all of that date's commits
   taken together as a single unit, never one unit per commit)", followed by the dimensional
   reason so a later editor sees why the grain is what it is.
2. **Step 4, date-derivation item 3.** The commit date is the unit: group every commit sharing a
   date and read them together in step 5. This is what makes "a day's commits read together for
   topics" operative rather than implied.
3. **Step 7, the churn metric.** Points at step 4 as the single definition, restates it without
   diverging, and says plainly that ten commits in one afternoon are one session. The sentence
   "Step 4 is the only place that unit is defined" is there to stop the second definition
   growing back — the defect was inherited from `flight`'s original, which carries it still.
4. **Step 6, the ordering rule for the two recent lists.** "Most log units first" now says
   counted as step 4 defines a unit, so a day of commits counts once.
5. **The git-source legend row (step 3)** reads `git commit days`, and the gather block's comment
   says commits are collected per commit there and grouped by date into units in step 4 — the
   `git log` call itself is unchanged, since grouping happens at step 4, not at collection.

One adjacent line moved with them: the report template's `Sources scanned` example, which read
`git (37 commits)`, now reads `git (37 commits on 12 days = 12 units)`. It is an inventory line
rather than a fourth definition, but leaving a bare commit count next to a commit-day unit was
the same ambiguity in miniature.

Nothing else in the file was touched — tasks 10 and 30 edit it later in this session.

## Verification

`cd hooks && npm test` — **31 files, 898 tests, all passing** (86s). That suite carries the
path-literal lint over `agents/*.md` and `skills/*/SKILL.md`, which is the check a skill-body
edit can actually fail. The skill's own behaviour is prose executed by an agent, so there is no
test that exercises the ranking itself; the acceptance criteria were checked by re-reading the
five sites in the diff, not by running the skill.

`grep -in commit skills/cadence/SKILL.md` — the only surviving per-commit wordings are the
collection comment (correct, that is where commits are still read individually), the frontmatter
`description` (task 30's scope), and the "commit / push / release mechanics" exclusion in step 5,
which is about topic filtering and not about units.

## Left for the orchestrator

The dispatch restricted this task to `skills/cadence/SKILL.md`, so two tracking updates were not
made here and are still open:

- `fusion-workbench/tasklist.md` § 9 still reads `**Status:** [ ] open`.
- The issue record is still `260731-2246_*_...`; it needs the `Resolved:` note and the `_o_` →
  `_c_` rename.

## Files changed

- `/Users/k1/Projects/productive/fusion/skills/cadence/SKILL.md`
