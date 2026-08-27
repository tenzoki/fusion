---
description: The activity-log step of /fusion:cleanup (reachable alone as `/fusion:cleanup --only log-activity`), kept as its own body rather than a command. Scans project activity and generates or updates the activity log.
allowed-tools: [Bash, Read, Glob, Grep, Write, Edit]
---

# Log Activity Command

This is the activity-log step of `/fusion:cleanup` (its Step 6), and the procedure below is what that step reads and performs inline. Scan all project activity sources and create or update the user's activity log file in the project root.

## Process

### 0. Resolve workbench root

Run `"$FUSION_PLUGIN_ROOT/bin/fusion-workbench-root"`. If non-empty, `cd` to the printed path so all subsequent paths anchor to the project root. If empty, the user is not in a fusion project — proceed using `pwd`, warn the user that the log will land in the current directory, and scan git alone (there is no workbench to scan).

Then resolve the workbench itself:

```bash
"$FUSION_PLUGIN_ROOT/bin/fusion-paths" log-activity
```

Take `WORKBENCH` (absolute) from the output. It is the only key this skill gets, and that is the whole answer: `fusion-paths` reads a consumer's key set out of its prompt (`rules/fusion-workbench-conventions.md` `## Path Resolution`), this file names no `$OUT_*` or `$SCAN_*`, and `WORKBENCH` is emitted unconditionally. See Step 3 for why it scans the tree rather than an enumeration of stores.

On a non-zero exit, read the code (full table in the conventions' `## Path Resolution` → Exit codes): **exit 1** — no workbench, scan git alone as above; **exit 3** — `.active-circle` is orphaned or corrupt, tell the user to fix or delete the pointer; **exit 4** — a bug in `fusion-paths`, not the user's workbench, report it and do not send them to check their pointer.

### 1. Determine the current user

Read the username from the `$USER` environment variable:

```bash
echo "$USER"
```

The activity log file is `activity-log-$USER.md` in the project root.

### 2. Check for existing log file

- If the file does not exist, create it from scratch — process every date that has activity.
- If the file exists, the newest logged date is the high-water mark, and one grep is the whole read: `SINCE="$(grep -oE '^## [0-9]{4}-[0-9]{2}-[0-9]{2}' "activity-log-$USER.md" | sort | tail -1 | cut -c4-)"`. Only the newest date decides anything below; do not read the file into context.
- Determine the set of dates to process:
  - **Every date AFTER the most recently logged date** that has activity — the genuinely new days; AND
  - **The most recently logged date itself** — re-scan it: a mid-day run may have logged it incomplete, and skipping it on its existing header silently drops the rest of that day's work.
- All logged dates **older** than the most recent one are complete and MUST NOT be re-processed (they cannot gain new activity).
- **Refresh, don't duplicate:** when re-processing the most recently logged date, REPLACE its existing daily entry, its arc bullet, and its per-week row contribution in place — never append a second entry for the same date. See Step 7.

### 3. Scan all activity sources

Collect timestamped activity from git and from the whole workbench tree. For each item, record: timestamp, topic/description, source code.

**Source legend** — the code names the *kind* of artifact, and the kind is the name of the directory the file sits in. The same kind carries the same code whether the file lives inside a Circle or in the shared store:

| Code | Artifact kind |
|------|---------------|
| `g` | git commits |
| `h` | session history |
| `p` | specs and plans |
| `i` | issues |
| `d` | decisions |
| `r` | reviews (code, ontology, concept — one kind since v4; the sender is in the filename) |
| `a` | analyses |
| `n` | investigations |
| `t` | consultations |
| `b` | backlog entries |
| `k` | Circle records |
| `w` | workbench root-level files |

Two codes are **retired but still readable**: `o` (ontology reviews) and `c` (code reviews) appear in days logged before v4, when the three review kinds had a directory each. Leave those historic rows alone. New rows use `r`. When updating an existing log whose legend predates v4, add the `r` row and keep `o` and `c` listed, marked as historic — deleting them would strand the rows that use them.

**Scanning methods:**

a) **Git commits** (`g`):
   ```bash
   git log --format="%ai|%s" --since="${SINCE:-30 days ago}"
   ```
   Parse each line for date, time, and commit subject. `$SINCE` (Step 2) bounds the update read — and covers a log stale for over 30 days, which the fixed window missed.

b) **Workbench files** — one scan of the tree, not a walk of an enumerated list of stores:

   ```bash
   # macOS/BSD find+ls; on GNU coreutils replace `ls -l -T` with `ls -l --full-time`
   # (BSD `-T` prints full timestamps; GNU `-T` expects a tabsize argument and errors)
   find "$WORKBENCH" -type f -name '*.md' -not -path '*/archive/*' -not -path '*/stashes/*' -not -path '*/stilwerk/*' -not -path '*/.migration-v2-backup/*' ${SINCE:+-newermt "$SINCE"} -exec ls -l -T {} +
   ```

   `-newermt` is behaviour-preserving: an older mtime can only feed dates Step 2 already closed.

   - **Derive the code from the containing directory's basename**, per the legend above. A file directly in the workbench root is `w`; a `*_circle.md` inside a Circle directory is `k`.
   - Parse filenames for embedded timestamps (e.g. `260408-1523-topic.md` means April 8, 15:23). Fall back to the modification time when the filename carries no stamp.
   - Read file headers for date metadata if available.

   **Scan the tree; do not enumerate the stores.** This skill's job is *all* activity, and the tree is what "all" means. An enumeration would have to list every store the layout defines and would silently under-report the day someone adds one, or the day a Circle holds a kind the list forgot — and a missing source here looks exactly like a quiet day. `archive/`, `stashes/`, `stilwerk/` and `.migration-v2-backup/` are excluded because they hold moved, frozen, or configured content rather than activity: archived and stashed files would otherwise re-report their original days at their move date, and a v2-migration backup carries copies with the originals' timestamps — old working days would appear in the log a second time.

### 4. Group by date

- Group all collected activities by calendar date
- Sort within each date by timestamp
- For each date, determine:
  - **Start hour:** earliest activity timestamp
  - **End hour:** latest activity timestamp
  - If end time is after midnight (00:00-05:00), treat it as an extension of the previous day: add hours to 24. Example: 11:00 to 02:30 next day → `[11-26.5]`
- **Inactive days within the project span:** if a date between the earliest logged date and today has **no** activity from any source, still emit a daily header `## YYYY-MM-DD (Day) [—]` with no time table. This preserves continuity for the per-week aggregation in Step 6.

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
| h | session history |
| p | specs and plans |
| i | issues |
| d | decisions |
| r | reviews |
| a | analyses |
| n | investigations |
| t | consultations |
| k | Circle records |
| w | workbench root-level files |

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

For each new day added to the Daily Log, locate the ISO week (Mon–Sun) the day falls into and update the corresponding row in the `## Active Hours per Week` table (insert if absent, recompute both `Days active` and `Avg active hours/day` if present).

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
- **Inactive-day marker spelling:** the inactive marker is the em-dash character U+2014 (`—`). Do not substitute hyphen (`-`), en-dash (`–`), horizontal bar (`―`), or double-hyphen (`--`); these will not be matched as inactive and will skew `Days active`.

**Hour arithmetic:**
- Single range `[A-B]` → hours = (B − A); if B < A (cross-midnight), use (B + 24 − A).
- Degenerate `[H-H]` → 0 hours, but counts as an active day.

**Ordering:** newest week first.

**Placement:** the table lives between the `## High-level arc` section (above) and the `## Daily Log` section (below).

**Atomicity contract:** when you add a daily entry, you MUST update the per-week row in the same write. Either both land or neither lands.

**Verification before declaring this step done:** every distinct ISO week represented by a daily entry has exactly one row in the per-week table. Run each command on a single line (no backslash-newline continuations):

```bash
daily_entries=$(grep -c "^## 2[0-9]\{3\}-" activity-log-$USER.md)
week_rows=$(grep -cE "^\| [0-9]{4}-[0-9]{2}-[0-9]{2} +\|" activity-log-$USER.md)
distinct_iso_weeks=$(grep -oE "^## [0-9]{4}-[0-9]{2}-[0-9]{2}" activity-log-$USER.md | cut -c4- | python3 -c 'import sys,datetime; print(len({datetime.date.fromisoformat(l.strip()).isocalendar()[:2] for l in sys.stdin if l.strip()}))')
echo "$daily_entries daily entries, $week_rows week rows, $distinct_iso_weeks distinct ISO weeks"
[ "$distinct_iso_weeks" = "$week_rows" ] || echo "MISMATCH: $distinct_iso_weeks distinct ISO weeks vs $week_rows week rows"
```

One `python3` process for every header (shell `date` differs between BSD and GNU and used to cost one subprocess per daily entry); the grep already guarantees the date format it feeds in.

If a distinct ISO week is missing from the table — or a table row has no matching daily entry — fix before writing.

### 7. Write output

- On **create:** write header + reversed-order `## High-level arc` (newest day first) + `## Active Hours per Week` table + Daily Log entries (chronological — per-day sections are NOT reversed; only the arc bullets are newest-first) + the end-of-file `## Total commits` section.
- On **append:**
  - For genuinely new days: insert daily entries chronologically into the `## Daily Log` section, and prepend the new arc bullet at the top of `## High-level arc` (newest-first).
  - For the most-recently-logged date being refreshed (Step 2): REPLACE its existing daily entry and its arc bullet in place — do not insert a second entry or a second bullet for that date.
  - In both cases: update or insert per-week rows from Step 6, recomputing both `Days active` and `Avg active hours/day` when an existing row is touched; refresh the `## Total commits` count.
- Never duplicate entries — refreshing the most-recent day replaces, it does not append.

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
- Whether the most-recently-logged prior day was refreshed (re-scanned and replaced), and how many items it gained
- Date range covered
- Number of new per-week rows added (if any) and the three verification numbers from Step 6
- Path to the activity log file
- Total activity items found
- Current total commit count

Report the three Step 6 numeric counts explicitly: `<N> daily entries`, `<W> per-week rows`, `<W'> distinct ISO weeks`. The user should be able to spot-check without re-running greps. Do not collapse to "OK" or "matches"; print the numbers.

## Notes

- Be thorough: every source, the whole tree inside the `$SINCE` bound
- Timestamps should be extracted from filenames (YYMMDD-HHMM pattern), git log, and file modification times
- Even a single-commit day gets its entry
- The arc summary should capture the narrative: what was the focus of the day? (e.g., "ontology refactoring", "bug fixes and reviews", "new agent implementation")
- Infer the arc from commit messages, file topics, and issue/plan titles
- The High-level arc lists newest day first; the Daily Log itself is chronological (oldest → newest).
