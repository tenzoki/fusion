---
description: Archives completed/aged fusion-workbench artifacts by safety tier (tier-1/tier-2/tier-3) or natural-language description: survey, propose, confirm, then move into the workbench's archive store.
argument-hint: tier-1 | tier-2 | tier-3 | <natural-language description>
allowed-tools: [Bash, Read, Write, Edit, AskUserQuestion]
---

# Archive

The user invoked `/fusion:archive`. Move a curated set of workbench artifacts out of the live workbench and into a timestamped archive subfolder. Archives are local, on-disk snapshots — moved, not copied — so the live workbench stays focused. **That is the whole of it**: this body runs no other pass and triggers none.

**Whether git preserves the bytes is the project's decision, not this skill's.** fusion ships no `.gitignore` rule for the workbench, so a consuming project's workbench may be tracked, ignored, or neither (`rules/workbench-tracking.md`). Only where the project tracks it does a past commit still hold what a move relocated. Where it does not, the archive folder is the **only** copy of every artifact this skill moves: Step 7's collision guard prevents an overwrite, and nothing after that prevents a loss. **This skill reads `rules/workbench-tracking.md` at Step 1** — that file is the authoring home of the record-versus-live-state split, and what it classifies as a record is what this skill must preserve rather than discard when it decides what to archive.

## Where archives go

```
<archive store>/<YYMMDD-HHMM>-<slug>/
```

- `YYMMDD-HHMM` from `date +%y%m%d-%H%M` (never guess).
- `<slug>` is a short kebab-case label (lowercase, alphanumerics + dashes, ≤ 40 chars). For tier mode the slug is `safe-cleanup-tier-<n>`. For natural-language mode it's derived from the description.
- One archive folder per run of this procedure. Never reuse a folder.
- Inside the archive folder, preserve the original path relative to `$WORKBENCH`.

## Step 1 — Resolve paths, read the tracking rule

```bash
"$FUSION_PLUGIN_ROOT/bin/fusion-paths" archive

# The rule this skill is the named consumer of. No emission reaches a skill, so read it here.
if [ -x "${FUSION_PLUGIN_ROOT:-}/bin/fusion-source-root" ]; then
  FUSION_SRC="$("$FUSION_PLUGIN_ROOT/bin/fusion-source-root")"
else
  echo "fusion: no bin/fusion-source-root in the installed plugin at $FUSION_PLUGIN_ROOT — the source root falls back to that install copy" >&2
  FUSION_SRC="$FUSION_PLUGIN_ROOT"
fi
cat "$FUSION_SRC/rules/workbench-tracking.md"
```

**Read that file in full before Step 2**, the way an agent reads every path `fusion-rules` emits: its record-versus-live-state split is what decides which workbench entries this skill must preserve rather than discard. If the resolved root does not hold the file, say so and continue — the tier tables below still apply, but the classification behind them is then unread.

Hold the emitted `KEY=value` values for the rest of the skill. `$WORKBENCH` is absolute; everything else is workbench-relative. On a non-zero exit from `fusion-paths`, read the code — it says whose fault it is (full table in `rules/fusion-workbench-conventions.md` `## Path Resolution` → Exit codes):

- **Exit 1** — no workbench above `pwd`. Halt: there is nothing to archive. Tell the user to run `/fusion:setup` at the project root.
- **Exit 4** — an internal error in `fusion-paths`. The user's workbench is fine; do **not** send them anywhere in it to repair something. Report it as a fusion bug and stop.

**A `SCAN_*` value may name two directories, so run every tier glob once per path in it** — `for p in $SCAN_PLANS; do … "$WORKBENCH/$p" …; done`, never once against the whole value as if it were a directory name. With a work item in scope the resolver emits that item's container store first and the shared store second, space separated, and collapses to the shared one alone when none is (`rules/fusion-workbench-conventions.md` `## Path Resolution` → invariant 2). `$SCAN_FORUM` and `$SCAN_BACKLOG` are the two that are always single, the latter because it names the container store itself, where every item lives whoever holds it.

**An empty value is still an error, never an empty result.** The resolver refuses to emit `KEY=` for a key it cannot value, so an empty one in your hands means the substitution went wrong, not that there is nothing to archive. Halt on it (`HYG-NO-SILENT-FAIL`), report the failing key, and do not survey with a whole store silently skipped.

## Argument modes

The skill takes one of:

- `tier-1` / `tier-2` / `tier-3` — mechanical, pre-defined safety tiers (described below). Optionally followed by an age threshold like `tier-3 21d` (default 14d).
- `<natural-language description>` — ad-hoc archive: describe what to move; skill surveys, applies safety filters, proposes, confirms.
- (empty) — ask the user via `AskUserQuestion` whether they want a tier or a natural-language description.

## Marker vocabulary

Authored in `rules/fusion-workbench-conventions.md` `## State Markers — issues and planning` and `## State Markers — decisions`; the markerless kinds are enumerated there too. **Terminal** means a record rather than live work: `_c_` for a defect or spec/plan, `_i_` and `_s_` for a decision, and only terminal artifacts bulk-archive without per-file review. **Terminal is not archive-class:** `_d_` is terminal for a defect or plan and is still excluded from every tier (safety filter 2). A **work item** carries no marker at all — its state is its `**Status:**` head field (`## Backlog entries — work items`), and `done` and `dropped` are its terminal pair.

## Safety filters (apply to ALL modes)

These are non-negotiable defaults. The user can override them at the `refine` step in natural-language mode, but the tier modes treat them as hard guardrails.

1. **Reserved — never archive.** The root-anchored surfaces, because their consumers read them at fixed paths and none has a fallback (`rules/fusion-workbench-conventions.md` `## fusion-workbench Layout`):
   - `$WORKBENCH/orchestrator-events.jsonl`
   - `$WORKBENCH/.guard-state/` **apart from `events.jsonl`** — the throttle stores in there each describe *now* and are rewritten in place. An `escalation.json` may still be sitting there in a project set up under an older fusion; it is inert at this version, nothing rewrites it, and `/fusion:setup` is what offers to delete it — archiving it is not this skill's call either way. The append-only `events.jsonl` beside them is not a state file and has its own case; see *Rolling the guard event log* below.
   - `$WORKBENCH/.commit-lock/`, `$WORKBENCH/.session-marker`, `$WORKBENCH/.fusion-setup`, `$WORKBENCH/.checkout-id`, `$WORKBENCH/.cadence-anchors`, `$WORKBENCH/.asset-provenance`
   - `$WORKBENCH/monitor`, `$WORKBENCH/stilwerk/`, `$WORKBENCH/stashes/`, `$WORKBENCH/.migration-v2-backup/`
   - Anything already under the archive store.

2. **Active markers — never archive in tier modes:**
   - `_o_` (open) and `_p_` (in-progress) defects and plans — live work.
   - `_d_` defects and plans — *deferred ≠ done*; the user may want to revisit. Terminal, but excluded by default.
   - Work items whose `**Status:**` is `open` or `claimed` — live work by the field's own definition, and a `claimed` item is somebody's in-flight job.
   - `_a_` decisions — answer recorded but not yet realised in code/data. Archiving breaks decision↔implementation traceability. Promote to `_i_` when implementation lands; do not bulk-archive `_a_`.
   - A `done` or `dropped` work item that any live record still cites, and any item another live item names in its `**Depends-on:**` field: moving it takes the target of a pointer out of every store its consumers scan. Filter 3 covers the citing corpus; this clause covers the dependency field, which is a citation a grep over prose would miss.

3. **Citation check:** a candidate referenced (by relative path or filename) from the citing corpus is excluded regardless of tier or marker, and the report names the citing file. The corpus is the shipped text (`CLAUDE.md`, `README*.md`, `rules/`, `agents/`, `skills/`, `hooks/lib/`, `hooks/*.ts`, `bin/`, `docs/`) plus the project's own `CLAUDE.md`, `rules/` and `.claude/rules/`: every one of them is loaded into sessions or held by a lint, so its references must stay resolvable. A positive enumeration, each entry skipped when absent, so a consuming project collapses to `CLAUDE.md` and its own rules; an unresolved source root skips the check with a report line; `hooks/lib/__tests__/workbench-citation-lint.test.ts` names this filter as its twin (decision `260827-1756_*_which-citation-corpus-does-the-archive-safety-filter-protect.md`). For a work item the candidate is a whole container, so check the container's basename **and** the basename of every file inside it: the move takes the item's own plans, issues, decisions, reviews and analyses with it, and a check that read only the container's own name would let a cited plan leave the live tree unseen.

4. **Out of tier scope by construction.** The tiers below enumerate what they include; anything they do not name is unreachable from a tier. That covers investigations, consultations, memos and analyses in the shared store — they hold strategic deliverables, briefings and source artefacts, and they are archive-class only with the user's explicit natural-language ask.

   This is deliberately a positive enumeration rather than an exclusion list. An exclusion list has to be kept in step with every directory the layout gains, and goes silently out of date when it isn't. What a tier does not name, a tier cannot touch.

## Tier definitions

Each tier is **additive**: tier-2 includes tier-1, tier-3 includes tier-2. The default age threshold for "aged" buckets is 14 days; override with `tier-N <D>d` (e.g. `tier-3 21d`).

### Tier 1 — Terminal markers and age in the shared store

**Age is a tier-1 basis for one bucket only, the message store.** A forum entry has one audience and one short lifetime by design, so an aged one is as finished as a marked record, and the archive moves it rather than deleting it. The accepted cost, stated once: a checkout dormant longer than the threshold can lose an entry unread, which is what selecting by age buys.

| Target | Selection | Reason |
|---|---|---|
| `$SCAN_ISSUES` | `*_c_*.md` | closed defect, terminal |
| `$SCAN_PLANS` | `*_c_*.md` | closed plan, terminal |
| `$SCAN_DECISIONS` | `*_i_*.md` | implemented decision, terminal |
| `$SCAN_DECISIONS` | `*_s_*.md` | superseded decision, terminal |
| `$SCAN_BACKLOG` | each container whose record reads `**Status:** done` or `dropped` — **the whole container moves, not the record alone** | terminal work item — its body already says what landed, or why the job is no longer live. Selected by the head field, never by a filename, which carries no marker. Moving the record alone would separate a unit of work from the plans, issues, decisions, reviews and analyses in the container with it |
| `$SCAN_FORUM` | `*.md` whose `YYMMDD` filename prefix is older than the threshold | a message is read once and soon and carries no marker, so age is the only signal that can select it |
| `$WORKBENCH/.guard-state/events.jsonl` | the live log, whenever it is non-empty | append-only evidence — **rolled**, not selected. See *Rolling the guard event log* below |

### Rolling the guard event log

`$WORKBENCH/.guard-state/events.jsonl` is the guard's append-only record across every session, classified as evidence rather than telemetry (`rules/workbench-tracking.md`, read in full at Step 1, and fusion's own record `260811-1534_*_does-the-guard-event-log-get-an-upper-bound-and-what-happens-to-the-evidence-in-it.md`). This roll is the only thing that bounds its size; no line or byte ceiling may be added anywhere.

**It is the one target that is rolled rather than selected.** It carries no marker and no age, so no tier survey finds it: it is included whenever the live log is non-empty, skipped silently otherwise, and still waits for confirmation where Step 6 asks. Safety filter 1's `.guard-state/` entry covers the state files beside it, not the log.

The destination keeps the path relative to `$WORKBENCH`; the filename carries the archive folder's stamp:

```
<archive store>/<YYMMDD-HHMM>-<slug>/.guard-state/events-<YYMMDD-HHMM>.jsonl
```

### Tier 2 — Tier 1 + aged shared reviews

Adds `$SCAN_REVIEWS/*.md` whose filename date prefix is older than the threshold. Reviews don't carry markers; aging is the only signal. Every review kind shares this one store and they are distinguished by the sender in the filename.

### Tier 3 — Tier 2 + aged shared history

Adds `$SCAN_HISTORY/*.md` whose filename date prefix is older than the threshold. Old session logs are archive-class; the orchestrator only reads recent history for context.

## Process

1. **Resolve paths, read the tracking rule.** Step 1 above — both halves. `cd` to the directory holding `$WORKBENCH` so relative paths resolve.

2. **Parse the argument.**
   - Match against `^tier-[123]( +(\d+)d)?$` for tier mode (capture the optional age threshold; default 14).
   - Otherwise treat as a natural-language description.
   - If empty, ask via `AskUserQuestion` whether they want `tier-1` / `tier-2` / `tier-3` / describe.

3. **Build the candidate list.**

   **Work items (all tiers).** An item is a **directory** and its record sits inside it under the directory's own name, so the walk goes two levels down and the candidate it yields is the container. An item's state is a head field, not a filename marker, so the selection reads the record. One pass over the store:

   ```bash
   find "$WORKBENCH/$SCAN_BACKLOG" -mindepth 1 -maxdepth 1 -type d 2>/dev/null | sort | while IFS= read -r d; do b="$(basename "$d")"; f="$d/$b.md"; [ -f "$f" ] || f="$(find "$d" -mindepth 1 -maxdepth 1 -type f -name '_?_circle.md' 2>/dev/null | head -n 1)"; [ -f "$f" ] || continue; st="$(sed -n 's/^\*\*Status:\*\*[[:space:]]*//p' "$f" | head -n 1)"; case "$st" in done|dropped) printf '%s\t%s\n' "$st" "$b" ;; esac; done
   ```

   **The fallback in that loop is the store's two record forms, not a defect.** A migrated workbench keeps its terminal records under their old marked name, because a terminal record is history and is not edited back (`rules/fusion-workbench-conventions.md` `## Terminal states are history`), so the walk reaches every container either way. Such a record's `**Status:**` is absent, or written in the older state vocabulary its marker belongs to (`closed`, `bounded`, `anticipated`, `active`) — never one of the four. It is **not selected**, it is **not a fault**, and legacy containers are reported once as a count rather than one line each. The workbench-state fault is narrower than it reads, and only this form reaches it: a record in the **item** form, `<container>/<container>.md`, whose `**Status:**` is missing or outside the four. Report that one, exclude it, do not guess which state was meant.

   **Then check the dependency field** (filter 2's last clause). An item named in a live item's `**Depends-on:**` is excluded in every tier, listed with the item that names it, and left in place. The same walk, because the bare `"$WORKBENCH/$SCAN_BACKLOG"/*.md` this once used matches nothing now and aborts the command under zsh (Step 1's split rule):

   ```bash
   find "$WORKBENCH/$SCAN_BACKLOG" -mindepth 1 -maxdepth 1 -type d 2>/dev/null | while IFS= read -r d; do f="$d/$(basename "$d").md"; [ -f "$f" ] || continue; st="$(sed -n 's/^\*\*Status:\*\*[[:space:]]*//p' "$f" | head -n 1)"; case "$st" in open|claimed) sed -n 's/^\*\*Depends-on:\*\*[[:space:]]*//p' "$f" | head -n 1 | tr ',' '\n' | sed -E 's/^[[:space:]]+//; s/[[:space:]]+$//' ;; esac; done | sort -u
   ```

   That one needs no marked-record fallback and deliberately carries none: a marked record has no `**Status:**`, so it can never be `open` or `claimed`, and reaching for it would add a read whose every answer is discarded.

   Natural-language mode flags such an item `[ACTIVE]` instead, so the user can override at `refine`.

   **Shared files (per tier).** Mechanically expand the tier's globs against the `$SCAN_*` values derived in Step 1. For aged buckets, parse the `YYMMDD` (or legacy `MMDD`) date prefix and compare to `today - threshold`.

   **Natural-language mode.** Survey what the description suggests; apply safety filters as defaults but flag any active-marker hits with `[ACTIVE]` rather than silently dropping them — the user may want them at `refine`.

4. **Citation check** (filter 3). The corpus is built first, existence-guarded, into the positional parameters; the two globbed kinds come through `find`, so a zsh `nomatch` cannot abort the loop (Step 1's split rule):
   ```bash
   FUSION_SRC="${FUSION_PLUGIN_ROOT:-}"; [ -x "$FUSION_SRC/bin/fusion-source-root" ] && FUSION_SRC="$("$FUSION_SRC/bin/fusion-source-root")"
   [ -n "$FUSION_SRC" ] || echo "  filter 3 skipped: source root unresolved (FUSION_PLUGIN_ROOT unset)"
   set --; for c in CLAUDE.md rules .claude/rules "$FUSION_SRC"/CLAUDE.md "$FUSION_SRC"/rules "$FUSION_SRC"/agents "$FUSION_SRC"/skills "$FUSION_SRC"/hooks/lib "$FUSION_SRC"/bin "$FUSION_SRC"/docs $({ find "$FUSION_SRC" -maxdepth 1 -name 'README*.md'; find "$FUSION_SRC/hooks" -maxdepth 1 -name '*.ts'; } 2>/dev/null); do [ -n "$FUSION_SRC" ] && [ -e "$c" ] && set -- "$@" "$c"; done
   KEEP=""; for f in <candidates>; do rel="${f#"$WORKBENCH"/}"; key="$(basename "$f" | sed -E 's/[][\\.^$*+?(){}|]/\\&/g; s/^([0-9]{6}-[0-9]{4})_[a-z]_/\1_[a-z*]_/')"; hit="$(grep -r -l -E -e "$key" "$@" 2>/dev/null | head -1)"; if [ -n "$hit" ]; then echo "  kept (cited in $hit): $rel"; else KEEP="$KEEP$f
   "; fi; done
   ```
   `$KEEP` is the surviving list; a cited file is reported as kept, naming the citing file, never dropped silently.

5. **Propose.** Print to the user:
   - Mode (tier-N + threshold, or the natural-language description verbatim).
   - Resolved slug + target archive path.
   - Per-bucket counts. Name the work items individually — an item is a whole unit of work and the user should see which ones by basename, with their Directive line, not just a count. Everything else may be counted in bulk.
   - Total file count and total bytes.
   - **The guard event log**, on its own line: whether it will be rolled, and its current line count and size. Say nothing when the live log is absent or empty — a skipped roll is not news.
   - Anything dropped by the safety filters, with a one-line summary; a terminal item excluded because a live item depends on it is named individually, together with the item that names it.
   - In natural-language mode, list `[ACTIVE]`-flagged hits explicitly.

6. **Confirm via `AskUserQuestion`.** The user came here to archive, and this body moves nothing until they say so — every run asks, whatever the mode and whatever the tier. Ask in the project's chat language (`rules/fusion-workbench-conventions.md` `## Project language`), option labels included:

   - **Archive** — archive exactly this list
   - **Change scope** — drop or add items, change tier, change threshold
   - **Cancel** — abort, change nothing

   Move nothing until the user picks the first.

7. **Archive on confirmation.**
   - `mkdir -p "$WORKBENCH/archive/<YYMMDD-HHMM>-<slug>/"`
   - For each candidate: recreate its parent path under the archive folder and `mv` it. A work item's candidate is its **container**, moved whole in one `mv` — never walked and moved file by file, which would leave the emptied directory behind and could half-complete.
   - Move only — never copy.
   - **A collision never overwrites.** If a destination exists, leave the source in place, say so on stderr, and count it. Losing an artifact to a silent clobber is the one outcome this skill must never produce (`HYG-NO-SILENT-FAIL`).
   - **Roll the guard event log** (all tiers, and natural-language mode when the description asks for it), after the moves above. `STAMP` and `SLUG` below are the two values already resolved for this invocation's archive folder name — the `date +%y%m%d-%H%M` reading and the kebab-case label from *Where archives go*. Do **not** take a second `date` reading: the folder and the file inside it would then disagree about when the roll happened.

     ```bash
     ARCHIVE_DIR="$WORKBENCH/archive/$STAMP-$SLUG"
     EV="$WORKBENCH/.guard-state/events.jsonl"
     if [ -s "$EV" ]; then
       mkdir -p "$ARCHIVE_DIR/.guard-state"
       if [ -e "$ARCHIVE_DIR/.guard-state/events-$STAMP.jsonl" ]; then
         echo "collision: $ARCHIVE_DIR/.guard-state/events-$STAMP.jsonl exists — the event log was left in place, not rolled" >&2
       else
         mv "$EV" "$ARCHIVE_DIR/.guard-state/events-$STAMP.jsonl" && : > "$EV"
       fi
     fi
     ```

     `mv` then truncate, never copy then truncate: the move is what guarantees no line exists in two places. `emitEvent` (`hooks/lib/events.ts`) opens, appends and closes on every call rather than holding the file open, so nothing keeps writing into the moved inode; an event emitted in the microseconds between the two commands lands in the **archived** log, where it is still readable. `: > "$EV"` re-creates the live log at once, and `emitEvent` would re-create it on its next write anyway. `bin/monitor`'s warnings panel treats an absent file and an empty one identically — `_read_warnings` returns no rows for either — so no ordering of these two commands can break the dashboard, and the panel simply refills as new events arrive.

   - Write the manifest (next step).

8. **Write `MANIFEST.md`** at `<archive store>/<YYMMDD-HHMM>-<slug>/MANIFEST.md`:
   ```markdown
   # Archive Manifest

   **Date:** <YYYY-MM-DD HH:MM>
   **Mode:** <tier-N + threshold> | <natural-language description verbatim>
   **Slug:** <slug>
   **Invoked by:** <orchestrator | direct user>

   ## Work items archived

   <one per line: basename, status, Directive one-liner>

   ## Files archived

   <one path per line, original location relative to the workbench root>

   ## Guard event log

   <"rolled: .guard-state/events.jsonl -> .guard-state/events-<stamp>.jsonl, <N> lines, <bytes>" — or "not rolled: live log was empty" — or "not rolled: <collision path> already existed">

   ## Counts

   - <per-bucket counts as in the proposal>
   - **Total:** <N> work items, <M> other files, <total> bytes

   ## Safety filters applied

   - <list of filters that excluded items, e.g. "3 cited from CLAUDE.md", "5 recent reviews", "1 item a live item depends on">

   ## Collisions

   <any destination that already existed, and therefore was not moved — or "none">
   ```

9. **Report.** Print archive path, item count, file count, manifest path. Any collision needs the user's attention — it means an artifact stayed put. Remind the user that archives are local and not committed automatically; they can `git add` the archive directory if they want the snapshot in version control.

## Guardrails

- **Move, do not copy.** The point is to shrink the live workbench. If the user wants a copy without removal, ask via `AskUserQuestion` before doing it.
- **Never archive a live work item.** `open` and `claimed` are live by the field's own definition; only `done` and `dropped` are archive-class, and only when nothing live still points at them.
- **Never delete the archive folder.** This skill only creates and adds.
- **Never touch git.** No `git add`, no `git commit`. The user decides whether to commit the archive.
- **Never modify content of what's being archived.** Move only; do not rewrite, reformat, or "tidy".
- **Never truncate the guard event log without archiving it first**, and never add a line or byte ceiling to it — not here, and not in `emitEvent` (`hooks/lib/events.ts`). The roll above is the only sanctioned way the file gets shorter. Any ceiling drops the oldest lines, which are the guard's block, halt and clear events (fusion's own record `260811-1534_*_does-the-guard-event-log-get-an-upper-bound…`).
- **If the survey returns zero matches:** report that and stop. Do not invent candidates. Do not broaden the search without re-asking.
- **The citation check is a hard exclusion** — do not surface cited files even with `[ACTIVE]` flags. To archive something the corpus cites, the user updates the citing file first.
