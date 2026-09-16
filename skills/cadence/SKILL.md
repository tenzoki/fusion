---
description: Write this checkout's activity log from git and the whole workbench tree, then digest it into ranked lists of recent and recurring topics. Use when the user asks "what have I been working on", "what did I do yesterday", "what are the recurring themes", or "show my cadence".
argument-hint: ""
allowed-tools: [Bash, Read, Glob, Grep, Write, Edit]
---

# /fusion:cadence — log the activity, then report the cadence

Two halves in one pass, and the second reads what the first wrote.

**A. The record.** Scan git and the whole workbench tree; create or refresh `activity-log-$CO.md` in the **project root**, where `rules/fusion-workbench-conventions.md` `## Filename Patterns` puts it and where it stays.

**B. The digest.** Read that record back and write `cadence-$CO.md` to `$OUT_MEMO` with **three ranked lists**: topics **since yesterday** (on a Monday "yesterday" is a Sunday, so Fri + Sat + Sun collapse into one bucket), topics of the **last 7 days**, and **recurring themes by churn** over the whole history.

**The churn column counts days, not sessions.** It counted sessions while cadence gathered its own sources; it now ranks over the record's `## High-level arc`, one themed line per day. Write "days" in the column header and say so in `## Notes`, rather than leaving a reader who remembers the old unit to infer the change from a number that moved.

**Scope — a project record and a project digest, saved per checkout.** Both cover every writer's work. The `-$CO` suffix names the checkout that ran the command, not the author of the work inside, so two checkouts of one project produce two files holding the same project; do not filter by author. Step 8b's metrics are the one section that is not project-wide, and the report labels that line.

## Process

### 0. Workbench, stores, keys

Run `"$FUSION_PLUGIN_ROOT/bin/fusion-workbench-root"`. **If it exits non-zero, halt** and tell the user: *"No fusion workbench found above $(pwd). Run `/fusion:setup` at the project root first."* There is no workbench-less mode; a git-only log written into whatever directory the user happened to stand in is what this halt gives up.

Otherwise `cd` to the printed path, so every later step anchors at the project root, and resolve the stores:

```bash
"$FUSION_PLUGIN_ROOT/bin/fusion-paths" cadence
```

Read `WORKBENCH` (absolute), `OUT_MEMO` (where the digest goes) and `SCAN_HISTORY` (which directory holds session histories). `fusion-paths` reads a consumer's key set out of its own prompt and a skill is its own consumer (`rules/fusion-workbench-conventions.md` `## Path Resolution`), so naming the three keys here is what makes the resolver emit them. On a non-zero exit read the code (full table at that heading → Exit codes): **exit 1** — no workbench above `pwd`, halt as above; **exit 4** — a bug in `fusion-paths` rather than in the user's workbench, so report it and send them nowhere in it to repair anything.

### 1. This checkout

```bash
I="$FUSION_PLUGIN_ROOT/bin/fusion-identity"; [ -x "$I" ] && "$I" || true
N="$FUSION_PLUGIN_ROOT/bin/fusion-checkout-name"; [ -x "$N" ] && "$N" resolve "$CO" || true
date +"%Y-%m-%d %H:%M"
```

- `$CO` is that run's `CHECKOUT=`, never `$USER`; both files are keyed by it.
- **Adopt a legacy `-$USER` log.** Rename `activity-log-$USER.md` onto `activity-log-$CO.md` when this checkout's `$USER` is its suffix and nothing stands at the new name, and report the rename; in every other case leave the file and name it in the report. Merge nothing, delete nothing. Those are the conditions `rules/fusion-workbench-conventions.md` `## Filename Patterns` sets for the other personal logs, and cadence writes this log now, so cadence adopts it.
- `$CO_LABEL` is the `alias=` line the second call prints. Exit 3 with nothing on stdout is an unregistered checkout and the ordinary case; a missing helper is the `[ -x ]` branch. On either, `$CO_LABEL` is the hex `$CO` itself. Never substitute a name.
- Today's date comes from `date`, never from your own sense of "now" — your internal clock runs in UTC and will be off by the local offset.

### 2. The two windows and the high-water mark

Compute all of it with `date` and `grep`, never in your head.

```bash
today=$(date +%Y-%m-%d)
dow=$(date +%u)                                            # 1=Mon … 7=Sun
week_start=$(date -v-7d +%Y-%m-%d 2>/dev/null || date -d '7 days ago' +%Y-%m-%d)
# Yesterday is a Sunday exactly when today is Monday (dow=1); in that one case
# reach back to Friday so Fri+Sat+Sun collapse into a single bucket.
if [ "$dow" -eq 1 ]; then back=3; else back=1; fi
yday_start=$(date -v-"${back}"d +%Y-%m-%d 2>/dev/null || date -d "${back} days ago" +%Y-%m-%d)
[ "$back" -eq 3 ] && weekend="yes (Fri–Sun)" || weekend="no"
# The newest date already logged. Empty when no log exists yet.
SINCE="$(grep -oE '^## [0-9]{4}-[0-9]{2}-[0-9]{2}' "activity-log-$CO.md" 2>/dev/null | sort | tail -1 | cut -c4-)"
echo "today=$today week_start=$week_start yday_start=$yday_start weekend=$weekend since=${SINCE:-none}"
```

Use the printed values literally: **recent window** `[week_start, today]` and **yesterday window** `[yday_start, today]`, both inclusive.

**`$SINCE` bounds the scan, and that grep is the whole read of it** — do not read the log into context to find it. The dates to process are **every date after `$SINCE` with activity, plus `$SINCE` itself**: a mid-day run may have logged that date incomplete, and skipping it on its existing header silently drops the rest of that day's work. Every logged date older than `$SINCE` is complete and MUST NOT be re-processed. An empty `$SINCE` means there is no log yet: build it over every date that has activity.

### 3. Scan git and the workbench tree — once

Collect timestamped items; record a timestamp, a topic, and a **source code** for each. The code names the artifact's *kind*, and the kind is the basename of the directory the file sits in.

**Codes:** `g` git commits · `h` session history · `p` specs and plans · `i` issues · `d` decisions · `r` reviews · `a` analyses · `n` investigations · `t` consultations · `b` backlog entries · `w` workbench root-level files. `o` (ontology reviews) and `c` (code reviews) are **retired but still readable**, from days logged before v4 when the review kinds had a directory each: leave those rows alone, write `r` for new ones, and when a log's own legend predates v4 add the `r` row while keeping `o` and `c` listed as historic — deleting them strands the rows using them.

**a) Git commits** (`g`): `git log --format="%ai|%s" --since="${SINCE:-30 days ago}"`, parsed for date, time and subject. `$SINCE` bounds the read and covers a log stale for over 30 days, which a fixed window missed.

**b) The workbench tree** (every other code) — one scan, not a walk of an enumerated list of stores:

```bash
empty=
[ -n "$WORKBENCH" ]    || empty="$empty WORKBENCH"
[ -n "$OUT_MEMO" ]     || empty="$empty OUT_MEMO"
[ -n "$SCAN_HISTORY" ] || empty="$empty SCAN_HISTORY"
[ -z "$empty" ] || { echo "fusion bug: cadence resolver key empty or unset:$empty" >&2; exit 1; }
# macOS/BSD find+ls; on GNU coreutils replace `ls -l -T` with `ls -l --full-time`
# (BSD `-T` prints full timestamps; GNU `-T` expects a tabsize argument and errors)
find "$WORKBENCH" -type f -name '*.md' -not -path '*/archive/*' -not -path '*/stashes/*' -not -path '*/stilwerk/*' -not -path '*/.migration-v2-backup/*' ${SINCE:+-newermt "$SINCE"} -exec ls -l -T {} +
```

**Substitute the resolver values before you run anything above.** They are step-0 keys, not shell variables: nothing exports them and the Bash tool starts a fresh shell per call, so write their values into every block literally. The assertion is looking for exactly the key you forgot, which expands to the empty string. **A non-zero exit there stops the skill:** report it as a fusion bug, name the key the message names, and write **neither file**. An empty *directory* is legitimate and still earns a normal run saying the week was quiet; an empty *key* never is, because a run built on one asserts a quiet week that nothing ever checked and the reader cannot tell the two apart.

- **Derive each item's code from its containing directory's basename**, per the legend. A file directly in the workbench root is `w`; a file in the directory `$SCAN_HISTORY` names is `h`.
- Parse filenames for embedded stamps (e.g. `260408-1523-topic.md` means April 8, 15:23) and read headers for date metadata where they carry it; fall back to mtime when the filename has no stamp. `-newermt` is behaviour-preserving: an older mtime can only feed dates step 2 already closed.

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
```

**Per-day entry**, plus one arc bullet for the same day:

```markdown
## YYYY-MM-DD (Day) [startHr-endHr]

| Time | Topic | Src |
|------|-------|-----|
| HH:MM | <description> | g |
```

**On refresh:** insert genuinely new days chronologically into `## Daily Log` and prepend each new arc bullet at the top of `## High-level arc`. For `$SINCE` itself, **replace** its daily entry and its arc bullet in place — never a second entry or a second bullet for one date. Update the per-week rows either way, and refresh the end-of-file `## Total commits` section, whose count is `git log --since=<earliest-date> --oneline | wc -l`, reading `<N> git commits since project start (<earliest date>).`

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

Keep the **substance** of what was decided, built, analysed or written, even when the subject is the tooling itself: in a plugin-development repo "cadence churn metric" is real work and "workbench tracking and housekeeping" is not, while in an end-user project the domain work is the signal and all fusion machinery is noise. The test: would the user name this as something they worked on? The labels stay in the record; this filter applies to the digest.

### 8. The three lists

Each **day-section** of the log is one unit, and the unit is a day: the record is day-grained, which is why the lists are.

**Yesterday** (`[yday_start, today]`) and **last 7 days** (`[week_start, today]`) are built the same way, differing only by window: take the day-sections inside it, collect the **distinct** labels, read each section's table for the source codes and dates the label showed up under, and order by how many day-sections carry it. The yesterday window is a subset of the 7-day one, so overlap is expected. State plainly when a window is empty.

**Recurring themes by churn** reads `## High-level arc`, not the day-sections: the arc is one labelled line per day across the whole history and small enough to read entire, which is what makes a full-history ranking affordable where re-reading the record is not. Count each theme's **churn = the number of distinct days it appears in**, rank descending, include only churn **≥ 2** (a theme seen on one day is not recurring — leave it to the recent lists), and record each theme's **span**, earliest → latest date, which separates a long thread from a short burst of equal count.

### 8b. Session-flow metrics — how the sessions felt, measured

From this checkout's own event lines (drop rows whose `checkout` differs from `.checkout-id`), over the 7-day window: **gate answers per session** (`gate_response`/`session_start`; the per-Turn reading went with `turn_start`, which nothing emits any more), **time to first dispatch** (`session_start` → first `task_start`, median), **dispatch duration** (`task_start`/`task_done` pairs by `task` id, median and max). An absent input is reported absent, never as 0. This is the one section that is not project-wide (see Scope), so its report line says so rather than leaving the reader to assume one scope for the whole document.

### 9. Write the digest

```bash
[ -n "$WORKBENCH" ] && [ -n "$OUT_MEMO" ] || { echo "fusion bug: WORKBENCH or OUT_MEMO empty — refusing to write the digest" >&2; exit 1; }
mkdir -p "$WORKBENCH/$OUT_MEMO"
```

Step 3's assertion repeats because each Bash call is its own shell; without it an empty pair turns the `mkdir` into `mkdir -p "/"` and the digest lands at `/cadence-$CO.md`. A non-zero exit stops the skill, reported as a fusion bug.

The digest goes to `$WORKBENCH/$OUT_MEMO/cadence-$CO.md` and is **overwritten each run** — a fresh snapshot, not an append log (unlike `/fusion:memo`'s files in the same store). Cadence keeps no history of its own runs; the activity log is that history.

```markdown
# Cadence — project digest

**Generated:** <YYYY-MM-DD HH:MM, from `date`>
**Digested by:** <$CO_LABEL> — the checkout that ran this, not the author of the work below
**Yesterday window:** <yday_start> → <today><!-- append " (Fri–Sun collapsed)" on a Monday -->
**Recent window:** <week_start> → <today> (7 days)
**Activity log:** <path> — <n new days logged, m refreshed / "already current">
**Sources scanned:** <e.g. git (37 commits on 12 days); workbench tree (84 files, codes h p i d r); session histories: frozen corpus, nothing after 2026-09-10>
**Session flow (7d, this checkout only):** <e.g. 1.1 gate answers/session · first dispatch median 6 min · dispatches median 4 min, max 14 — or "no event data">

## Topics — yesterday

<!-- on a Monday, render the heading as "## Topics — yesterday (Fri–Sun)" -->

- **<topic>** — <source codes + dates, one line>

<!-- empty window: --> _No activity since <yday_start>._

## Topics — last 7 days

- **<topic>** — <source codes + dates, one line>

<!-- empty window: --> _No activity logged in the last 7 days (most recent day-section: <date>)._

## Recurring themes — by churn (distinct days)

| Rank | Theme | Days | Span (first → last) | Sources |
|------|-------|------|---------------------|---------|
| 1 | <theme> | <n> | <first> → <last> | <codes> |

<!-- nothing recurs on two days: --> _No theme recurs across two or more days yet._

## Notes

- **Always:** the churn column counts **days**, one per `## High-level arc` line, not sessions.
- **Always:** name the session-history cut date and state that no session log covers anything after it.
- <caveats: undated files fallen back to mtime, a legacy log adopted, anything ambiguous>
```

### 10. Report to the user

Lead with the digest — the top 2–3 recent topics and the top 2–3 recurring themes — then the two paths written. The record half is a trailing detail and owes numbers rather than an "OK": new days logged, whether `$SINCE` was re-scanned and what it gained, the date range covered, total items found, the current commit total, any legacy-name rename, and step 6's three counts as `<N> daily entries`, `<W> per-week rows`, `<W'> distinct ISO weeks`. Do not collapse those three to "matches" — the user should be able to spot-check without re-running the greps.

Output follows `rules/user-facing-output.md` plus the chat profile for the project's language (`./fusion-workbench/stilwerk/chat-voice-<lang>.yaml`; the language comes from the `**Language:**` line in `CLAUDE.md`).

## Graceful degradation

- **Not a git repo:** skip the `g` source silently and note it in the sources line.
- **A closed or empty store:** carry on. The session-history store has been closed to writes since v11 (`rules/fusion-workbench-conventions.md` `## Session history`), so an old corpus and no corpus are both ordinary — say which in `**Sources scanned:**`, naming the cut date, so a window with no `h` item reads as a closed store rather than a quiet week. Git and the rest of the tree still cover every window in full.
- **Nothing datable in a window:** still write both files, with the empty-window note in the affected list.
- **Ambiguous or missing dates:** fall back to mtime (step 3) and record it in `## Notes` rather than guessing a date.

**Neither halt is degradation.** No workbench stops the command at step 0 and an empty resolver key stops it at step 3; those two are the only conditions under which this command writes nothing at all, and every case above still writes both files.

## What this skill is NOT

- It is **not** read-only. It writes `activity-log-$CO.md` in the project root and `cadence-$CO.md` in `$OUT_MEMO`, and it adopts a legacy `-$USER` activity log onto the checkout name. It modifies no other source.
- It commits nothing — both files are left in the working tree.
- It files no issues and no decisions. A cadence run is a read of the past, not a queue of work.
- It is **not** a personal digest and does not group or rank by author. The three lists are the project's; the only identity in the document is step 8b's own-checkout metrics.
