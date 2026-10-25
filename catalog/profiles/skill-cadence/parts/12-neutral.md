- Parse filenames for embedded stamps (e.g. `260408-1523-topic.md` means April 8, 15:23) and read headers for date metadata where they carry it; fall back to mtime when the filename has no stamp. `-newermt` is behaviour-preserving: an older mtime can only feed dates step 2 already closed.
- **Each `record_change` row is one item**, dated by the local date printed before it, never by its UTC `ts` nor the stem's filename stamp, coded by its `path` as a file is, its topic the record and its `change`. A state change is the record's topic, not event-log bookkeeping for step 7. The row, not the control file's mtime, is the source: it carries the moment of the change and travels with a pull, where a pulled control file's mtime is the pull's.

**Scan the tree; do not enumerate the stores.** The record's job is *all* activity, and an enumeration would under-report the day someone adds a store — where a missing source looks exactly like a quiet day. **The four excluded paths are not optional and must not be dropped**; `rules/fusion-workbench-conventions.md` `## fusion-workbench Layout` names this body as one of the two consumers holding them. They carry moved, frozen or configured content rather than activity: archived and stashed files would re-report their original days at their move date, and a v2-migration backup carries copies with the originals' timestamps, so old working days would appear a second time.

### 4. Group by date, and name each day

- Group every item by calendar date and sort within the date by timestamp.
- **Start and end hour:** the earliest and latest timestamps of that date. An end time between 00:00 and 05:00 is an extension of the previous day — add 24, so 11:00 to 02:30 the next morning is `[11-26.5]`.
- **Inactive days:** a date between the earliest logged date and today with **no** activity from any source still gets a header `## YYYY-MM-DD (Day) [—]` and no time table, which is what keeps step 6's per-week aggregation continuous.
- **Name each day with a theme label**, inferred from its substance — commit subjects, file topics, issue and plan titles. The whole digest rests on this labelling, so do it once and properly: **reuse the same label every time the theme recurs**, keep it concrete (name the thing, not a bucket: "activity-log relocation", not "housekeeping"), and understand the day rather than keyword-matching it, so that two days about one thing in different words carry the **same** label. The label becomes the day's arc line in step 5 and the whole of the churn ranking in step 8.

### 5. Write or refresh the activity log

The file is `activity-log-$CO.md` in the project root.

**On create**, the header and these sections in this order:

```markdown
# Activity Log — <$CO_LABEL>

**Project:** <project name from CLAUDE.md, else the directory name>
**Started:** <earliest date found>

## Source Legend

<!-- the step-3 codes, as | Code | Source | rows -->

## High-level arc

<!-- one bullet per logged day, NEWEST FIRST:
     - **MM-DD Day** [start-end] — the step-4 theme label -->

## Active Hours per Week

<!-- step 6, newest week first -->

## Daily Log

<!-- per-day sections, CHRONOLOGICAL: only the arc bullets are newest-first -->

## Total commits

<!-- `git log --since=<earliest-date> --oneline | wc -l`, written as
     `<N> git commits since project start (<earliest date>).` -->
```

**Per-day entry**, plus one arc bullet for the same day:

```markdown
## YYYY-MM-DD (Day) [startHr-endHr]

| Time | Topic | Src |
|------|-------|-----|
| HH:MM | <description> | g |
```

**On refresh:** insert genuinely new days chronologically into `## Daily Log` and prepend each new arc bullet at the top of `## High-level arc`. For `$SINCE` itself, **replace** its daily entry and its arc bullet in place — never a second entry or a second bullet for one date. Update the per-week rows either way, and refresh the end-of-file `## Total commits` section by the command in the create template above.

### 6. The per-week table — mandatory, atomic with each day

For every day added or refreshed, update the row for its ISO week (Mon–Sun) in `## Active Hours per Week`: insert if absent, recompute both columns if present.

```markdown
| Week of (Mon) | Days active | Avg active hours/day |
|---------------|-------------|----------------------|
| YYYY-MM-DD    | N           | H.H                  |
```

- **Week label:** the `YYYY-MM-DD` of that week's Monday. **Ordering:** newest first. **Placement:** between `## High-level arc` and `## Daily Log`.
- **Days active:** days with a parseable `[start-end]`, not `[—]`. A degenerate `[H-H]` (e.g. `[22-22]`) DOES count as active though its elapsed hours are 0.
- **Avg active hours/day:** sum of hours ÷ days active, one decimal; `n/a` when days active is 0. **Hours:** `[A-B]` → B − A, or B + 24 − A when B < A (cross-midnight).
- **The inactive marker is the em-dash U+2014, `—`.** Not a hyphen `-`, en-dash `–`, horizontal bar `―` or double hyphen `--`; those are not matched as inactive and skew `Days active`.
- **Atomicity:** the daily entry and its per-week row land in the same write. Either both or neither.

**Verify before the digest** — every distinct ISO week with a daily entry has exactly one row. One line per command, no backslash-newline continuations:

```bash
daily=$(grep -c "^## 2[0-9]\{3\}-" activity-log-$CO.md)
rows=$(grep -cE "^\| [0-9]{4}-[0-9]{2}-[0-9]{2} +\|" activity-log-$CO.md)
weeks=$(grep -oE "^## [0-9]{4}-[0-9]{2}-[0-9]{2}" activity-log-$CO.md | cut -c4- | python3 -c 'import sys,datetime; print(len({datetime.date.fromisoformat(l.strip()).isocalendar()[:2] for l in sys.stdin if l.strip()}))')
echo "$daily daily entries, $rows week rows, $weeks distinct ISO weeks"
[ "$weeks" = "$rows" ] || echo "MISMATCH: $weeks distinct ISO weeks vs $rows week rows"
```

One `python3` process for all the headers, and the grep guarantees the format. A missing week row — or a row with no matching daily entry — is fixed before the digest is written, not reported.

### 7. Drop the tooling topics

The labels are assigned; the digest ranks them. First, **exclude tooling and meta topics — they are not work.** fusion's own bookkeeping is not a topic the user works *on*; they work *through* the tool. Drop such topics from **every** list, the churn ranking included, and do not let them surface because they recur often: their churn is high precisely because the tooling runs every session, which is noise. Drop, for example:

- session or orchestrator **setup**, "awaiting scope/directive", Phase-0 scaffolding
- **workbench tracking and housekeeping**, history logging, dashboards, live status, event logs
- **reconciliation**, archiving, and the activity-log or cadence runs themselves
- compliance-**guard** toggling, and commit / push / release *mechanics* as such

Keep the **substance** of what was decided, built, analysed or written, even when the subject is the tooling itself: in a module-development repo "cadence churn metric" is real work and "workbench tracking and housekeeping" is not, while in an end-user project the domain work is the signal and all fusion machinery is noise. The test: would the user name this as something they worked on? The labels stay in the record; this filter applies to the digest.

### 8. The three lists

Each **day-section** of the log is one unit, and the unit is a day: the record is day-grained, which is why the lists are.

**Yesterday** (`[yday_start, today]`) and **last 7 days** (`[week_start, today]`) are built the same way, differing only by window: take the day-sections inside it, collect the **distinct** labels, read each section's table for the source codes and dates the label showed up under, and order by how many day-sections carry it. The yesterday window is a subset of the 7-day one, so overlap is expected. State plainly when a window is empty.

**Recurring themes by churn** reads `## High-level arc`, not the day-sections: the arc is one labelled line per day across the whole history and small enough to read entire, which is what makes a full-history ranking affordable where re-reading the record is not. Count each theme's **churn = the number of distinct days it appears in**, rank descending, include only churn **≥ 2** (a theme seen on one day is not recurring — leave it to the recent lists), and record each theme's **span**, earliest → latest date, which separates a long thread from a short burst of equal count.

### 8b. Session-flow metrics — how the sessions felt, measured

From this checkout's own event lines (drop rows whose `checkout` differs from `.checkout-id`), over the 7-day window: **approval answers per session** (`gate_response`/`session_start`; the per-Turn reading went with `turn_start`, which nothing emits any more), **time to first dispatch** (`session_start` → first `task_start`, median), **dispatch duration** (`task_start`/`task_done` pairs by `task` id, median and max). An absent input is reported absent, never as 0. This is the one section that is not project-wide (see Scope), so its report line says so rather than leaving the reader to assume one scope for the whole document.

### 9. Write the digest

```bash
