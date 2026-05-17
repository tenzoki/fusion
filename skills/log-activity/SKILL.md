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
- Extract the list of dates that already have entries (look for `### YYYY-MM-DD` or `## YYYY-MM-DD` headers)
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

## Summary

| Date | Hours | Commits | Files | Arc |
|------|-------|---------|-------|-----|

<!-- Per-month Active Hours sections inserted here, newest month first.
     One ## Active Hours per Day — YYYY-MM section per month encountered. -->

## Daily Log
```

#### Per-day entry

For each new day (not already in log):

```markdown
### YYYY-MM-DD (Day) [startHr-endHr]

**Arc:** <one-line summary of the day's main activity theme>

| Time | Topic | Src |
|------|-------|-----|
| HH:MM | <description> | g |
| HH:MM | <description> | h |
| ... | ... | ... |
```

### 6. Update the Summary table — MANDATORY, atomic with each new day

**For every day you add a new entry to the Daily Log, you MUST add a corresponding row to the Summary table.** This is non-negotiable. Do not move on to the next day until the Summary row is added.

The two writes are atomic — either both land or neither lands. Never write a daily entry without its Summary row; never write a Summary row without its daily entry.

For each new day, append a row to the `## Summary` table:

```
| YYYY-MM-DD | <hours> | <commit count> | <file count> | <arc summary> |
```

- `<hours>` — decimal active hours (end hour minus start hour; for cross-midnight days, use the 24+ convention so the value stays positive)
- `<commit count>` — git commits on that day
- `<file count>` — total workbench-file activity items on that day (all source codes except `g`)
- `<arc summary>` — one-line theme; same text as the daily entry's `**Arc:**` line

**Verification before declaring this step done:** the number of rows in the `## Summary` table must equal the number of `### YYYY-MM-DD` headers in the `## Daily Log` section. If they don't match, you skipped a Summary entry — go back and add it. Run this check explicitly:

```bash
grep -c "^### [0-9]" activity-log-$USER.md   # number of daily entries
grep -cE "^\| [0-9]{4}-[0-9]{2}-[0-9]{2}" activity-log-$USER.md  # number of summary rows
```

Both numbers must match. If they don't, the file is in an inconsistent state — fix before writing.

### 7. Update per-month "Active Hours per Day" sections — MANDATORY, atomic with each new day

**For every day you add a new entry to the Daily Log, you MUST add (or update) the row for that day in the month section for that day's calendar month.** This is non-negotiable. Same atomicity contract as Step 6.

The per-month sections give a month-at-a-glance view of effort distribution. Their format:

```markdown
## Active Hours per Day — YYYY-MM

| Day | Active Hours | Time Range |
|-----|--------------|------------|
| 01 (Wed) | 4.5 | [09-13.5] |
| 02 (Thu) | 6.0 | [10-16] |
| ...
```

**Placement:** the month sections live between the `## Summary` section (above) and the `## Daily Log` section (below). Newest month first; within a month, days are listed in ascending order (oldest day first).

**Atomicity contract:**
- When you create the first entry for a day, also add (or create) the month's row for that day.
- When a new month is encountered (first day of that month appears in your scan), create a new `## Active Hours per Day — YYYY-MM` section and add the row.
- When updating an existing month section, insert the new day's row in date order — do not append blindly.

**Verification before declaring this step done:** the total row count across all month sections must equal the number of daily entries in the Daily Log. Run:

```bash
total_month_rows=$(grep -cE "^\| [0-9]{2} \([A-Za-z]{3}\)" activity-log-$USER.md)
daily_entries=$(grep -c "^### [0-9]" activity-log-$USER.md)
[ "$total_month_rows" = "$daily_entries" ] || echo "MISMATCH: $total_month_rows month rows vs $daily_entries daily entries — fix before writing"
```

Numbers must match. If they don't, you skipped or duplicated a month-row — fix.

### 8. Write output

- If creating: write the complete file with header + all daily entries + the new per-month sections (see Step 7).
- If appending: insert new daily entries before the end of the `## Daily Log` section, insert new month sections / update existing ones if needed (see Step 7). The Summary table update was already done in Step 6 — do not re-update here.
- Never duplicate entries for dates that already exist in the file.

### 9. Report to user

Tell the user:
- How many new days were logged
- Date range covered
- Number of new month sections created (if any)
- Confirmation that Summary row count = Daily Log entry count (from Step 6 verification)
- Confirmation that month-section row totals = Daily Log entry count (from Step 7 verification)
- Path to the activity log file
- Total activity items found

## Notes

- Be thorough: scan ALL source directories, not just the most recent
- Timestamps should be extracted from filenames (YYMMDD-HHMM pattern), git log, and file modification times
- When a day has very few entries, still create the entry — even a single commit is worth logging
- The arc summary should capture the narrative: what was the focus of the day? (e.g., "ontology refactoring", "bug fixes and reviews", "new agent implementation")
- Infer the arc from commit messages, file topics, and issue/plan titles
