---
description: Scan project activity and generate/update the activity log
allowed-tools: [Bash, Read, Glob, Grep, Write, Edit]
---

# Log Activity Command

When the user invokes `/fusion:log-activity`, scan all project activity sources and create or update the user's activity log file in the project root.

## Process

### 0. Resolve workbench root

Run `"$FUSION_PLUGIN_ROOT/bin/fusion-workbench-root"`. If non-empty, `cd` to the printed path so all subsequent paths anchor to the project root. If empty, the user is not in a fusion project — proceed using `pwd` and warn the user that the log will land in the current directory.

### 1. Determine the current user

Read the username from the `$USER` environment variable:

```bash
echo "$USER"
```

The activity log file is `activity-log-$USER.md` in the project root. For example, if `$USER` is `kai`, the file is `activity-log-kai.md`.

### 2. Check for existing log file

- If the file exists, read it to determine which dates are already logged
- Extract the list of dates that already have entries (look for `## YYYY-MM-DD` headers)
- Only process dates NOT yet logged
- If the file does not exist, create it from scratch

### 3. Scan all activity sources

Collect timestamped activity from ALL of these sources. For each item, record: timestamp, topic/description, source code.

**Source legend:**

| Code | Source | Path |
|------|--------|------|
| `g` | git commits | `git log` |
| `h` | history files | `fusion-workbench/history/` |
| `p` | planning files | `fusion-workbench/planning/` |
| `i` | issue files | `fusion-workbench/issues/` |
| `o` | ontology reviews | `fusion-workbench/ontoreview/` |
| `c` | code reviews | `fusion-workbench/codereview/` |
| `w` | workshop/workbench misc | `fusion-workbench/` (root-level files) |
| `a` | analyses | `fusion-workbench/analyses/` |
| `n` | investigations | `fusion-workbench/investigations/` |
| `t` | consult | `fusion-workbench/consult/` |
| `d` | decisions | `fusion-workbench/decisions/` |

**Scanning methods:**

a) **Git commits** (`g`):
   ```bash
   git log --format="%ai|%s" --since="30 days ago"
   ```
   Parse each line for date, time, and commit subject.

b) **Workbench files** (`h`, `p`, `i`, `o`, `c`, `a`, `n`, `t`, `d`):
   - Use `ls -la` on each directory to get modification times
   - Parse filenames for embedded timestamps (e.g., `260408-1523-topic.md` means April 8, 15:23)
   - Read file headers for date metadata if available
   - Only scan directories that exist (e.g., `fusion-workbench/decisions/` may be absent on older workbenches)

### 4. Group by date

- Group all collected activities by calendar date
- Sort within each date by timestamp
- For each date, determine:
  - **Start hour:** earliest activity timestamp
  - **End hour:** latest activity timestamp
  - If end time is after midnight (00:00-05:00), treat it as an extension of the previous day: add hours to 24. Example: activity from 11:00 to 02:30 next day becomes `[11-26.5]` or `[11-26]`

### 5. Format output

#### New file header (only when creating new file)

```markdown
# Activity Log — <User Name>

**Project:** <project name from CLAUDE.md or directory name>
**Started:** <earliest date found>

## Source Legend

| Code | Source |
|------|--------|
| g | git commits |
| h | history files |
| p | planning |
| i | issues |
| o | ontology review |
| c | code review |
| w | workbench |
| a | analyses |
| n | investigations |
| t | consult |
| d | decisions |

## High-level arc

<!-- One bullet per logged day, NEWEST FIRST. Bullet format:
     - **MM-DD Day** [start-end] — one-line theme -->

## Active Hours per Week

<!-- Inserted by Step 6. Newest week first; rows oldest-week-removed-last. -->

## Daily Log
```

The end-of-file `## Total commits` section is appended on initial create and refreshed on each run — see Step 7.

#### Per-day entry

For each new day (not already in log):

```markdown
## YYYY-MM-DD (Day) [startHr-endHr]

| Time | Topic | Src |
|------|-------|-----|
| HH:MM | <description> | g |
| HH:MM | <description> | h |
| ... | ... | ... |
```

Also add a one-line bullet to the `## High-level arc` section (newest-first ordering):

```markdown
- **MM-DD Day** [startHr-endHr] — one-line theme
```

### 6. Build the per-week Active Hours table — MANDATORY, atomic with each new day

For each new day added to the Daily Log, locate the ISO week (Mon–Sun) the day falls into and update the corresponding row in the `## Active Hours per Week` table (insert if absent, recompute average if present).

**Format:**

```markdown
## Active Hours per Week

| Week of (Mon) | Days active | Avg active hours/day |
|---------------|-------------|----------------------|
| YYYY-MM-DD    | N           | H.H                  |
```

- **Week label:** `YYYY-MM-DD` of the Monday of the ISO week (Mon–Sun).
- **Days active:** count of days in this week that have a parseable `[start-end]` range (not `[—]`). A degenerate `[H-H]` range (e.g. `[22-22]`) DOES count as an active day even though elapsed hours are 0.
- **Avg active hours/day:** (sum hours) / (days active), rounded to one decimal. Print `n/a` if days_active == 0 (a whole week of `[—]`).

**Hour arithmetic:**
- Single range `[A-B]` → hours = (B − A); if B < A (cross-midnight), use (B + 24 − A).
- Multi-range header `[H-H, H-H]` → sum each sub-range using the same rule.
- Degenerate `[H-H]` → 0 hours, but counts as an active day.

**Ordering:** newest week first.

**Placement:** the table lives between the `## High-level arc` section (above) and the `## Daily Log` section (below).

**Atomicity contract:** when you add a daily entry, you MUST update the per-week row in the same write. Either both land or neither lands.

**Verification before declaring this step done:** every distinct ISO week represented by a daily entry has exactly one row in the per-week table. Run:

```bash
daily_entries=$(grep -c "^## 2[0-9]\{3\}-" activity-log-$USER.md)
week_rows=$(grep -cE "^\| [0-9]{4}-[0-9]{2}-[0-9]{2} +\|" activity-log-$USER.md)
echo "$daily_entries daily entries, $week_rows week rows"
# Then compute distinct ISO weeks across the daily entries and confirm equality with week_rows.
```

If a distinct ISO week is missing from the table — or a table row has no matching daily entry — fix before writing.

### 7. Write output

- On **create:** write header + reversed-order `## High-level arc` (newest day first) + `## Active Hours per Week` table + Daily Log entries (chronological — per-day sections are NOT reversed; only the arc bullets are newest-first) + the end-of-file `## Total commits` section.
- On **append:** insert new daily entries chronologically into the `## Daily Log` section; prepend the new arc bullet at the top of `## High-level arc` (newest-first); update or insert per-week rows from Step 6; refresh the `## Total commits` count.
- Never duplicate entries.

**End-of-file commit-count section** (append on create, refresh on every run):

```markdown
## Total commits

<N> git commits since project start (<earliest date>).
```

`<N>` comes from:

```bash
git log --since=<earliest-date> --oneline | wc -l
```

### 8. Report to user

Tell the user:
- How many new days were logged
- Date range covered
- Number of new per-week rows added (if any) and the verification grep result (distinct ISO weeks in Daily Log == per-week table rows)
- Path to the activity log file
- Total activity items found
- Current total commit count

Print the actual numbers, not just "matches" — the user should be able to spot-check without re-running greps.

## Notes

- Be thorough: scan ALL source directories, not just the most recent
- Timestamps should be extracted from filenames (YYMMDD-HHMM pattern), git log, and file modification times
- When a day has very few entries, still create the entry — even a single commit is worth logging
- The arc summary should capture the narrative: what was the focus of the day? (e.g., "ontology refactoring", "bug fixes and reviews", "new agent implementation")
- Infer the arc from commit messages, file topics, and issue/plan titles
- The High-level arc lists newest day first; the Daily Log itself is chronological (oldest → newest).
