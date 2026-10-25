
Offer "Tracked entries only" only in `git` mode with `UNTRACKED>0`. With `COLLISIONS>0`, put the collision lines above the options and say that those entries stay and the rest moves. For `MODE=plain`, replace the `git mv` sentence with the honest one: *"This workbench is not under version control, so moving uses `mv`. The renames appear in no diff and cannot be taken back with `git revert`."*

Do not migrate without an explicit choice. On "Cancel" stop here: Step 7 needs the new names.

## Step 4 — Apply

Only after the user chose to convert. For "Tracked entries only", set `TRACKED_ONLY=1` at the head of the block.

```bash
set -u; WB=./fusion-workbench; TRACKED_ONLY=0; FALLBACKS=0; COLLISIONS=0; MOVED=0; LEFT=0; if git rev-parse --is-inside-work-tree >/dev/null 2>&1 && [ -n "$(git ls-files "$WB" | head -1)" ]; then MODE=git; else MODE=plain; echo "NOTE: workbench not under version control. Moving with mv; the move is not reviewable as a diff and not undoable with git revert." >&2; fi
move_one() { if [ -e "$2" ]; then echo "COLLISION: $2 already exists. $1 stays where it is." >&2; COLLISIONS=$((COLLISIONS+1)); return 1; fi; if [ "$MODE" = git ] && git mv "$1" "$2" 2>/dev/null; then MOVED=$((MOVED+1)); return 0; fi; if mv "$1" "$2"; then if [ "$MODE" = git ]; then echo "NOTE: $1 is untracked, moved with mv (not in the diff)." >&2; FALLBACKS=$((FALLBACKS+1)); fi; MOVED=$((MOVED+1)); return 0; fi; echo "ERROR: $1 -> $2 failed." >&2; return 1; }
fold_store() { local src="$1" dst="$2" e t; [ -d "$src" ] || return 0; mkdir -p "$dst"; while IFS= read -r e; do if [ "$TRACKED_ONLY" = 1 ] && [ "$MODE" = git ] && [ -z "$(git ls-files -- "$e" | head -1)" ]; then echo "LEFT: $e is untracked and stays." >&2; LEFT=$((LEFT+1)); continue; fi; t="$dst/${e##*/}"; if [ -d "$e" ] && [ ! -L "$e" ] && { [ -d "$t" ] && [ ! -L "$t" ] || { [ "$TRACKED_ONLY$MODE" = 1git ] && [ ! -e "$t" ] && [ ! -L "$t" ]; }; }; then fold_store "$e" "$t"; else move_one "$e" "$t" || true; fi; done < <(find "$src" -mindepth 1 -maxdepth 1 | sort); rmdir "$src" 2>/dev/null || echo "NOTE: $src is not empty and stays." >&2; }
fold_store "$WB/shared/consult" "$WB/shared/consultations"; fold_store "$WB/shared/planning" "$WB/shared/plans"
while IFS= read -r p; do fold_store "$p" "${p%/planning}/plans"; done < <(find "$WB/circles" "$WB/work-packages" -mindepth 2 -maxdepth 2 -type d -name planning 2>/dev/null | sort)
fold_store "$WB/circles" "$WB/work-packages"
echo "---"; echo "moved=$MOVED mv-fallbacks=$FALLBACKS collisions=$COLLISIONS left=$LEFT mode=$MODE"
```

- **Stores move by content, not as a directory.** `git mv circles work-packages` nests the source *inside* an existing destination, and inside the window one usually exists. `fold_store` moves entry by entry, descends into any directory present on both sides (a container, its `plans/`, `issues/` and the rest), and for tracked entries only into every directory, so each file moves by its own `git mv` and an untracked child stays, then `rmdir`s each drained source: the only removal here, and loud on a source a collision kept.
- **The order keeps every intermediate state one the survey recognises**: shared stores, then each container's `planning/`, the container store last. An interrupted run leaves some entries under the destination and the rest under the source, and the next run moves the rest; a move leaves no copy, so nothing collides with itself.

**If a move failed** (an `ERROR` line), stop and report what moved and what did not. Nothing is undone automatically; the next run resumes from the filesystem.

## Step 5 — Report

Report the tail counters (`moved`, `mv-fallbacks`, `collisions`, `left`), then:

- one line per left-by-rule entry with its record, and the frozen and no-record entries one line each;
- every `GITIGNORE` hit, which is the project's own rule to edit;
- every entry moved by `mv` in `git` mode (`git revert` will not restore it), every untracked entry left, and every collision with both paths.

