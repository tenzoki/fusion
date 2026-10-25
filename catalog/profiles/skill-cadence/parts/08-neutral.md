date +"%Y-%m-%d %H:%M"
```

- `$CO` is that run's `CHECKOUT=`, never `$USER`; both files are keyed by it.
- **No `CHECKOUT=` line, no write.** Exit 3, exit 5 and the `[ -x ]` miss branch each leave `$CO` empty, and none of them means the workbench is absent. Halt and name which one: an empty key writes `activity-log-.md` and `cadence-.md`, the one pair of names every checkout would share.
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

Collect timestamped items; record a timestamp, a topic, and a **source code** for each. The code names the artefact's *kind*, and the kind is the basename of the directory the file sits in.

**Codes:** `g` git commits · `h` session history · `p` specs and plans · `i` issues · `d` decisions · `s` discussions · `r` reviews · `a` analyses · `n` investigations · `t` consultations · `b` backlog entries · `w` workbench root-level files. `o` (ontology reviews) and `c` (code reviews) are **retired but still readable**, from days logged before v4 when the review kinds had a directory each: leave those rows alone, write `r` for new ones, and when a log's own legend predates v4 add the `r` row while keeping `o` and `c` listed as historic — deleting them strands the rows using them.

**a) Git commits** (`g`): `git log --format="%ai|%s" --since="${SINCE:-30 days ago}"`, parsed for date, time and subject. `$SINCE` bounds the read and covers a log stale for over 30 days, which a fixed window missed.

**b) The workbench tree** (every other code) — one scan, not a walk of an enumerated list of stores:

```bash
empty=
[ -n "$WORKBENCH" ]    || empty="$empty WORKBENCH"
