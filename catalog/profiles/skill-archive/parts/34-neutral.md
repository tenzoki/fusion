
   - **Archive** — archive exactly this list
   - **Change scope** — drop or add items, change tier, change threshold
   - **Cancel** — abort, change nothing

   Move nothing until the user picks the first.

7. **Archive on confirmation.**
   - `mkdir -p "$WORKBENCH/archive/<YYMMDD-HHMM>-<slug>/"`
   - Record units first, through the Step 7 block of `## On a JSON-controlled workbench`: a work package's container moves whole there. Then, for each file left in `$KEEP`, recreate its parent path under the archive folder and `mv` it.
   - Move only — never copy.
   - **A collision never overwrites.** If a destination exists, leave the source in place, say so on stderr, and count it. Losing an artefact to a silent clobber is the one outcome this workflow must never produce (`HYG-NO-SILENT-FAIL`).
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

     `mv` then truncate, never copy then truncate: the move is what guarantees no line exists in two places. `emitEvent` (`hooks/lib/events.ts`) opens, appends and closes on every call rather than holding the file open, so nothing keeps writing into the moved inode; an event emitted in the microseconds between the two commands lands in the **archived** log, where it is still readable. `: > "$EV"` re-creates the live log at once, and `emitEvent` would re-create it on its next write anyway.

   - Write the manifest (next step).

8. **Write `MANIFEST.md`** at `<archive store>/<YYMMDD-HHMM>-<slug>/MANIFEST.md`:
   ```markdown
   # Archive Manifest

   **Date:** <YYYY-MM-DD HH:MM>
   **Mode:** <tier-N + threshold> | <natural-language description verbatim>
   **Slug:** <slug>
   **Invoked by:** <orchestrator | direct user>

   ## Work packages archived

   <one per line: basename, status, brief one-liner>

   ## Files archived

   <one path per line, original location relative to the workbench root>

   ## Guard event log

   <"rolled: .guard-state/events.jsonl -> .guard-state/events-<stamp>.jsonl, <N> lines, <bytes>" — or "not rolled: live log was empty" — or "not rolled: <collision path> already existed">

   ## Counts

   - <per-bucket counts as in the proposal>
   - **Total:** <N> work packages, <M> other files, <total> bytes

   ## Safety filters applied

   - <list of filters that excluded items, e.g. "3 cited from CLAUDE.md", "5 recent reviews", "1 item a live item depends on">

   ## Collisions

   <any destination that already existed, and therefore was not moved — or "none">
   ```

