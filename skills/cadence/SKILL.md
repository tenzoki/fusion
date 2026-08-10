---
description: Analyse this project's session logs, activity log, and git history to surface the work cadence — three ranked topic lists written to the workbench's shared memo store as cadence-<user>.md. List 1 is the topics touched since yesterday (and on Mondays, Friday+Saturday+Sunday collapsed together) up to now; list 2 is the topics of the last 7 days; list 3 is the recurring themes across the whole project history, ranked by churn (how many distinct sessions each theme keeps reappearing in). Reads the fusion session histories (both the active Circle's and the shared store, via bin/fusion-paths), the shared activity-log-<user>.md (checked in both the project root and the workbench), and git commits. Use when the user asks "what have I been working on", "what did I do yesterday", "what are the recurring themes", "show my cadence", or wants a dated digest of recent and persistent topics.
argument-hint: ""
allowed-tools: [Bash, Read, Glob, Grep, Write]
---

# /fusion:cadence — analyse logs and report the work cadence

When the user invokes `/fusion:cadence`, read the project's log sources, identify the topics worked on, and write a digest with **three ranked lists** to `cadence-$USER.md` in the workbench's memo store:

1. **Topics since yesterday** — what was touched from yesterday up to now. On a Monday, "yesterday" is a Sunday, so this collapses Friday + Saturday + Sunday into one bucket (the weekend's last working stretch).
2. **Topics of the last 7 days** — what the recent work has been about.
3. **Recurring themes by churn** — the themes that keep reappearing across the whole history, ranked by how many distinct sessions they show up in.

This is an **analysis** skill: you read the logs and identify topics by understanding them, not by keyword-matching. A topic is a short, human-readable theme label you assign (for example "Circle container restructure", "Plane bridge seeding", "guard blocker on skills"). Two log entries about the same thing in different words are the **same** topic — collapse them.

## Process

### 0. Resolve the workbench and the stores

Run `"$FUSION_PLUGIN_ROOT/bin/fusion-workbench-root"`. If it exits non-zero, halt and tell the user: *"No fusion workbench found above $(pwd). Run `/fusion:setup` at the project root first."* Otherwise `cd` to the printed path, so every later step anchors at the project root.

Then resolve this skill's stores:

```bash
"$FUSION_PLUGIN_ROOT/bin/fusion-paths" cadence
```

Read `WORKBENCH` (absolute), `OUT_MEMO` (where the report goes) and `SCAN_HISTORY` (where the session histories are read from) out of the output. `fusion-paths` takes the name of the consumer asking, and a skill is its own consumer (`rules/fusion-workbench-conventions.md` `## Path Resolution`); this file's key set is read out of this file, which is why naming `$OUT_MEMO` and `$SCAN_HISTORY` here is what makes the resolver emit them.

On a non-zero exit, read the code — it says whose fault it is (full table in `rules/fusion-workbench-conventions.md` `## Path Resolution` → Exit codes):

- **Exit 1** — no workbench above `pwd`. Tell the user to run `/fusion:setup` at the project root first.
- **Exit 3** — the workbench state is inconsistent: `.active-circle` is orphaned or corrupt. Tell the user to fix or delete the pointer before continuing.
- **Exit 4** — an internal error in `fusion-paths`. The user's workbench is fine; do **not** send them to check `.active-circle`. Report it as a fusion bug.

### 1. Get the date and the user

```bash
echo "$USER"
date +"%Y-%m-%d %H:%M"
```

- `$USER` fixes the output filename `cadence-$USER.md` and the activity-log filename `activity-log-$USER.md`.
- Today's date (from `date`, never from your own sense of "now" — your internal clock runs in UTC and will be off by the local offset) anchors the 7-day window.

### 2. Compute the time windows

Two windows anchor the recent lists. Compute both with `date` — never in your head.

```bash
today=$(date +%Y-%m-%d)                                    # window end (now / "until currently")
dow=$(date +%u)                                            # today's weekday: 1=Mon … 7=Sun

# 7-day window start
week_start=$(date -v-7d +%Y-%m-%d 2>/dev/null || date -d '7 days ago' +%Y-%m-%d)

# "yesterday" window start. Yesterday is a Sunday exactly when today is Monday (dow=1);
# in that one case reach back to Friday so Fri+Sat+Sun collapse into a single bucket.
if [ "$dow" -eq 1 ]; then back=3; else back=1; fi          # Mon → back to Fri, else → yesterday
yday_start=$(date -v-"${back}"d +%Y-%m-%d 2>/dev/null || date -d "${back} days ago" +%Y-%m-%d)

[ "$back" -eq 3 ] && weekend="yes (Fri–Sun)" || weekend="no"
echo "today=$today  week_start=$week_start  yday_start=$yday_start  weekend_collapsed=$weekend"
```

- **Recent (7-day) window:** `[week_start, today]` inclusive.
- **Yesterday window:** `[yday_start, today]` inclusive — "the day before, up to now". When today is Monday, `yday_start` is the preceding **Friday**, so Friday, Saturday and Sunday are reported together. Otherwise `yday_start` is plain yesterday.

Use the printed values literally.

### 3. Gather the log sources

Collect every available source. For each source record, per entry: a **date**, the **text** to read for topics, and a **source code** (legend below).

**Source legend:**

| Code | Source | Where |
|------|--------|-------|
| `h` | fusion session histories | every directory in `$SCAN_HISTORY` (workbench-relative — prefix with `$WORKBENCH`) |
| `a` | shared activity log | `activity-log-$USER.md` — check **both** the project root and `$WORKBENCH` |
| `g` | git commit days | `git log` (only if `.git` is present) — a day's commits form **one** unit, not one each |

**Substitute the resolver values before you run anything below.** `WORKBENCH`, `OUT_MEMO` and
`SCAN_HISTORY` are resolver keys from step 0, not shell variables. Nothing exports them, and the
Bash tool starts a fresh shell for every call, so write their values into every block literally,
the same way step 2 says to use the printed date values.

Run this assertion first, before the gather block. A key you forgot to substitute expands to the
empty string, which is exactly what the assertion is looking for:

```bash
empty=
[ -n "$WORKBENCH" ]    || empty="$empty WORKBENCH"
[ -n "$OUT_MEMO" ]     || empty="$empty OUT_MEMO"
[ -n "$SCAN_HISTORY" ] || empty="$empty SCAN_HISTORY"
[ -z "$empty" ] || { echo "fusion bug: cadence resolver key empty or unset:$empty" >&2; exit 1; }
echo "keys resolved: WORKBENCH=$WORKBENCH  OUT_MEMO=$OUT_MEMO  SCAN_HISTORY=$SCAN_HISTORY"
```

**A non-zero exit here stops the skill.** Report it to the user as a fusion bug, name the key the
message names, and write **no digest at all** — not even an empty one. An empty *directory* is
legitimate: a fresh workbench has no history yet, and that still earns a normal digest saying the
week was quiet. An empty *key* never is. A digest built on an unresolved key asserts a quiet week
that nothing ever checked, and the reader cannot tell the two apart.

```bash
# session histories — $SCAN_HISTORY is SPACE-SEPARATED and may name TWO stores.
# `find` tolerates missing dirs and is glob-safe under zsh (a plain `ls a/*.md b/*.md`
# aborts when one glob misses). Split via command substitution, not a bare
# `for d in $SCAN_HISTORY`: zsh does not word-split an unquoted parameter expansion,
# but both bash and zsh field-split an unquoted command substitution. Store paths
# never contain whitespace, so the split is safe.
for d in $(printf '%s\n' "$SCAN_HISTORY"); do find "$WORKBENCH/$d" -maxdepth 1 -name '*.md' 2>/dev/null; done

# activity log — TWO possible locations (project root, and the workbench)
for f in "activity-log-$USER.md" "$WORKBENCH/activity-log-$USER.md"; do [ -f "$f" ] && echo "$f"; done

# git commits with ISO dates (skip if not a git repo).
# Collect them per commit here; step 4 groups them by date into one unit per day.
git log --date=short --pretty='%ad %h %s' 2>/dev/null
```

**Iterate over every path in `$SCAN_HISTORY`.** It resolves to **two** space-separated directories when a Circle is active — the active Circle's history store and the shared one — and collapses to the shared one alone when no Circle is active (`rules/fusion-workbench-conventions.md` `## Path Resolution` → "Two invariants", invariant 2). Reading only the first path silently under-reports: the whole active Circle's work, or the whole non-Circle work, disappears from all three lists, and the result looks like a quiet week rather than a bug.

`/fusion:log-activity` writes the activity log to the **project root**, so that is the usual location; the workbench copy is the fallback for projects that moved it. Note in the final report which sources were found and which were absent.

### 4. Date each log unit

Each **log unit** is one dated thing: one session-history file, one `## YYYY-MM-DD` day-section in the activity log, or one **git-commit day** (all of that date's commits taken together as a single unit, never one unit per commit).

That keeps the three sources on the same grain: a history file is one session, an activity-log day-section is one day, and a git-commit day is one day. If git counted per commit it would run finer than the other two and silently dominate every ranking below, because it is normally the highest-volume source.

Derive a unit's date in this order:

1. **Filename date token** on session-history files: `260731-2208-orchestrator-session.md` → `2026-07-31`. The leading `YYMMDD` expands to `20YY-MM-DD`; `HHMM` follows it.
2. **`## YYYY-MM-DD` headers** inside the activity log — one unit per day-section.
3. **Commit date** for git units (the `%ad` field above). The date *is* the unit: group every commit sharing a date into one unit and read them together in step 5.
4. **Fallback:** if a file has no parseable date token, read its mtime: `date -r <file> +%Y-%m-%d`. Record every such fallback in the report's Notes section rather than guessing a date.

### 5. Extract topics per log unit

Read each log unit and identify the one or few topics it is about. Assign each a short theme label. Be consistent: reuse the **same** label every time the same theme recurs, so the churn count in step 7 is meaningful. Keep labels concrete — name the thing, not a vague bucket ("activity-log relocation", not "housekeeping").

For large histories, read enough of each file to identify its themes; you do not need every line, but do not judge a file by its title alone.

**Exclude tooling/meta topics — they are not work.** fusion's own internal bookkeeping is not a topic the user works *on*; they work *through* the tool. Drop such topics from **every** list — the yesterday list, the 7-day list, and the churn ranking. Do not let them surface even when they recur often (their churn is high precisely because the tooling runs every session — that is noise, not a theme). Drop, for example:

- session / orchestrator **setup**, "awaiting scope/directive", Phase-0 scaffolding
- **workbench tracking & housekeeping**, history logging, dashboards / live status, event logs
- **reconciliation**, archiving, and the activity-log or cadence runs themselves
- compliance-**guard** toggling, and commit / push / release *mechanics* as such

Keep the **substance** of what was decided, built, analysed, or written — even when the subject is the tooling itself. In a plugin-development repo, "design the conceptrev agent" or "cadence churn metric" are real work topics; "workbench tracking & housekeeping" is not. In an end-user project, the user's own domain work is the signal and all fusion machinery is noise. The test: would the user name this as something they worked on? If not, drop it.

### 6. Build the recent lists — yesterday, then last 7 days

Build two lists the same way, differing only by their window. For each: filter to the log units whose date falls in the window, collect the **distinct** topics, note where each appeared (source codes + dates), and order by how active the topic was (most log units first, counted as step 4 defines a unit, so a day of commits counts once however many commits it holds). State plainly when a window is empty.

- **Yesterday list** — window `[yday_start, today]`. The most recent, finest-grained view: what was touched since yesterday — or, when today is Monday, since Friday — right up to now. A topic worked on today belongs here too.
- **Last-7-days list** — window `[week_start, today]`. The broader recent view.

The yesterday window is a subset of the 7-day window, so topics overlap between the two lists. That is expected and correct: the yesterday list simply zooms in on the latest stretch.

### 7. Build the third list — recurring themes by churn

Across **all** log units (full history, not just the window), count each theme's **churn = the number of distinct sessions it appears in**. A "session" is one **log unit** exactly as step 4 defines it, git included: one session-history file, one activity-log day-section, or one git-commit day. Ten commits in one afternoon are one session, not ten. Step 4 is the only place that unit is defined; count each session once per theme even if the theme is mentioned several times inside it.

- Rank themes by churn, descending.
- Include only themes with churn **≥ 2** (a theme seen in a single session is not recurring — leave those for the recent lists, not here).
- For each theme record its **span**: earliest → latest date it appears. Span separates a long-running thread from a short burst of equal count.

### 8. Write the report

The report goes to `$WORKBENCH/$OUT_MEMO/cadence-$USER.md`.

```bash
[ -n "$WORKBENCH" ] && [ -n "$OUT_MEMO" ] || { echo "fusion bug: WORKBENCH or OUT_MEMO empty — refusing to write the digest" >&2; exit 1; }
mkdir -p "$WORKBENCH/$OUT_MEMO"
```

The check repeats step 3's assertion because it has to: the Bash tool gives every call its own
shell, so nothing step 3 established survives to here. Without it an empty pair makes
`mkdir -p "$WORKBENCH/$OUT_MEMO"` read as `mkdir -p "/"`, which succeeds, and the digest lands at
`/cadence-$USER.md` instead of the memo store. As in step 3, a non-zero exit stops the skill and
is reported as a fusion bug.

**Overwrite the file each run — it is a fresh snapshot, not an append log.** This differs from the other files in that store: `memos-$USER.md` and `tasks-$USER.md` written by `/fusion:memo` *are* append logs, so a reader who assumes the same convention here would be wrong. Cadence keeps no history of its own runs; each run replaces the previous snapshot outright.

Structure:

```markdown
# Cadence — <$USER>

**Generated:** <YYYY-MM-DD HH:MM, from `date`>
**Yesterday window:** <yday_start> → <today><!-- append " (Fri–Sun collapsed)" when today is Monday -->
**Recent window:** <week_start> → <today> (7 days)
**Sources scanned:** <e.g. session histories (14 files across 2 stores), git (37 commits on 12 days = 12 units), activity log: none>

## Topics — yesterday

<!-- window [yday_start, today]. When today is Monday, render the heading as "## Topics — yesterday (Fri–Sun)" -->

- **<topic>** — <where it showed up: source codes + dates, one line>
- **<topic>** — ...

<!-- if the window is empty: -->
_No activity since <yday_start>._

## Topics — last 7 days

- **<topic>** — <where it showed up: source codes + dates, one line>
- **<topic>** — ...

<!-- if the window is empty: -->
_No activity logged in the last 7 days (most recent log unit: <date>)._

## Recurring themes — by churn (distinct sessions)

| Rank | Theme | Sessions | Span (first → last) | Sources |
|------|-------|----------|---------------------|---------|
| 1 | <theme> | <n> | <first> → <last> | <codes> |
| 2 | ... | | | |

<!-- if nothing recurs ≥2: -->
_No theme recurs across two or more sessions yet._

## Notes

- <caveats: which history stores were scanned and whether a Circle was active, undated files fallen back to mtime, where the activity log was found, anything ambiguous>
```

### 9. Report to the user

In chat, give the headline: the top 2–3 recent topics and the top 2–3 recurring themes, plus the path to the written file. Keep it short; the file holds the detail.

Output follows `rules/user-facing-output.md` plus the chat profile for the project's language (`./fusion-workbench/stilwerk/chat-voice-<lang>.yaml`; the language comes from the `**Language:**` line in `CLAUDE.md`). For this skill specifically: lead with the topics, not with what was scanned. The source inventory is a trailing detail.

## Graceful degradation

- **No active Circle** (the common case between Circles): `$SCAN_HISTORY` collapses to the shared store alone. Scan it, note in the report that no Circle was active. Not a warning.
- **No activity log:** note "activity log: none" in the sources line; the session histories and git carry the analysis.
- **Not a git repo:** skip the `g` source silently; note it in the sources line.
- **Nothing datable in the window:** still write the file, with the empty-window note in the affected list.
- **Ambiguous or missing dates:** fall back to mtime (step 4.4) and record the fallback in Notes rather than guessing.

**An empty resolver key is not degradation.** Every case above still writes a digest. `WORKBENCH`,
`OUT_MEMO` or `SCAN_HISTORY` resolving to nothing is a fusion bug instead: the step-3 assertion
stops the skill, names the key, and no digest is written. That is the one condition under which
this skill produces no file.

## What this skill is NOT

- It does not modify the source logs or the activity log — read-only on all inputs, writes only `cadence-$USER.md` in `$OUT_MEMO`.
- It is not `/fusion:log-activity`. That skill maintains the dated raw activity record; cadence is a higher-level digest built on top of it (and on the session histories and git). Run `/fusion:log-activity` first if you want the activity log fresh before a cadence pass.
- It files no issues and no decisions. A cadence run is a read of the past, not a queue of work.
