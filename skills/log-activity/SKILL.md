---
description: Scan project activity and generate/update the activity log
allowed-tools: [Bash, Read, Glob, Grep, Write, Edit]
---

# Log Activity Command

When the user invokes `/log-activity`, scan all project activity sources and create or update the user's activity log file in the project root.

## Process

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

#### Summary table update

After adding daily entries, update the Summary table at the top of the file. Add a row per new day:

```
| YYYY-MM-DD | <hours> | <commit count> | <file count> | <arc summary> |
```

### 6. Write output

- If creating: write the complete file with header + all daily entries
- If appending: insert new daily entries before the end of the `## Daily Log` section, then update the Summary table
- Never duplicate entries for dates that already exist in the file

### 7. Report to user

Tell the user:
- How many new days were logged
- Date range covered
- Path to the activity log file
- Total activity items found

## Notes

- Be thorough: scan ALL source directories, not just the most recent
- Timestamps should be extracted from filenames (YYMMDD-HHMM pattern), git log, and file modification times
- When a day has very few entries, still create the entry — even a single commit is worth logging
- The arc summary should capture the narrative: what was the focus of the day? (e.g., "ontology refactoring", "bug fixes and reviews", "new agent implementation")
- Infer the arc from commit messages, file topics, and issue/plan titles
