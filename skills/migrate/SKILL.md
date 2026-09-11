---
description: Bring a fusion workbench to the current format — a container per work item, the shared stores beside it, and underscore state markers. Moves pre-v4 root type folders into shared/, merges the three review folders, converts a live Circle record into its own container's item record, and reformats bracket-marked filenames to the underscore form. Moves nothing out of a container and never touches a terminal record. Surveys first, asks before moving, never overwrites.
allowed-tools: [Bash, Read, AskUserQuestion]
---

# Migrate a workbench to the current format

This skill brings a workbench to the **current format**, which has three parts.

First, **one store per artifact kind, in two places**: a work item's own container and `shared/` for everything with no item to belong to (`rules/fusion-workbench-conventions.md` `## fusion-workbench Layout`). A workbench created before v4 keeps its artifacts in type folders at the workbench root (`planning/`, `issues/`, `decisions/`, …); those move into `shared/`, because an artifact whose origin was never recorded is not attributable to any item.

Second, **a work item keeps its container, and only the record inside it changes**. A v4-to-v10 `circles/<dir>/` already holds what the current format wants: one directory per unit of work, with that work's own `planning/`, `issues/`, `decisions/`, `reviews/`, `analyses/` and `history/`. What is out of format is the record — `_t_circle.md`, stating its state in a filename marker. A **live** record (`_a_`, `_t_`) is renamed to its container's own name and re-headed with the item's head fields. A **terminal** record is left exactly as it stands, and no file is moved out of any container.

Third, **underscore state markers**: filenames carry the state marker as `_o_` / `_p_` rather than the older bracket form `[o]` / `[p]`, because `[` and `]` are shell-glob metacharacters and a marker written into a glob is silently a character class.

This skill moves and renames as needed, and it asks first.

Run it once, when `/fusion:setup` tells you to. It is idempotent: on a workbench already in the current format it surveys, finds nothing, and stops without asking anything.

**Every message this file specifies is written here in English and rendered in the project's chat language** — the `**Language:**` line in `CLAUDE.md`, resolved per `rules/fusion-workbench-conventions.md` `## Project language`, with the chat profile at `./fusion-workbench/stilwerk/chat-voice-<lang>.yaml`. A skill body ships to projects of every language, so the literals here are English; what you render is not. The strings printed *by the shell blocks below* are the exception, and they stay English in every project: they are CLI operator output, which the same rule exempts alongside every other helper and hook string fusion ships.

## Why this skill does not call `bin/fusion-paths`

Every other skill resolves its write targets through `bin/fusion-paths <own-name>`, and a store-directory literal is otherwise forbidden in a skill body; this skill's carve-out is recorded with `/fusion:setup`'s in `rules/fusion-workbench-conventions.md` `## Path Resolution`. It is the one consumer that names every layout literally, because its subject matter is the transition between them: a superseded layout has no resolver keys, and this skill is reading files where they used to be in order to move them where they now belong — which is exactly what the resolver's answers do not describe. All three reasons are authored in full in `rules/workbench-path-resolution.md`, in the paragraph that begins "One consumer names the layout literally".

The workbench anchor still comes from a helper — `bin/fusion-workbench-root`, the same primitive `fusion-paths` itself delegates to. Only the store paths below are literal.

## Step 1 — Locate the workbench

```bash
ROOT="$("$FUSION_PLUGIN_ROOT/bin/fusion-workbench-root")" || { echo "No fusion workbench above $(pwd). Run /fusion:setup at the project root first." >&2; exit 1; }
```

`cd "$ROOT"` so the relative paths below resolve. On a non-zero exit, halt: there is no workbench to migrate, and the user needs `/fusion:setup` first.

## Step 2 — Survey what would move

**Detection is by artifact presence, not by version.** A workbench needs migration when at least one out-of-format artifact still exists: a type folder at the workbench root, a `circles/*.md` file (the old marker-in-filename form), a container whose record is a **live** `_a_circle.md` or `_t_circle.md`, or any filename still carrying a bracket-form state marker (`…[o]-….md`) rather than the underscore form. The `plugin_version` in `.fusion-setup` is *not* the detector — it answers the wrong question, because a workbench with no out-of-format artifacts has nothing to migrate regardless of which version created it, and `/fusion:setup` overwrites the field on every run anyway. Report the old version to the user as context if you like; key the decision on the artifacts.

**This is also the idempotency guarantee, and it constrains what the detector may look for.** The detector must only look for things the executor can *remove* — not for things it merely *inspects*. If a move fails, its source stays put, the detector fires again next run, and the user gets another chance; no state flag can drift out of sync with the filesystem, because the filesystem *is* the flag. But that design has no memory of "the user already saw this one", so anything the executor will never remove must never enter the trigger, or the skill asks a question forever that has nothing left to do — and a prompt that fires forever gets clicked through without reading, which is what makes the *next*, real migration question dangerous.

Hence every counter below says for itself whether it triggers the question:

| Counter | Meaning | Triggers the question? |
|---|---|---|
| `FOUND` | Things the migration will move or rename, plus conflicts it refuses but the user can resolve | **yes** |
| `REFORMAT` | Bracket-marked filenames to rename in place to the underscore form | counted into `FOUND` — the reformat is a removable artifact, so it fits the idempotency model |
| `SKIPPED` | `circles/*.md` with no marker — not part of the migration, never moved | no — reported as a standing note |
| `CONFLICTS` | Two markered Circle files collapsing to one directory name; a container holding two records; a container already holding the item record the rename would write | counted into `FOUND`; the user resolves by deciding which file is real |
| `LIVE` | Containers whose record is **live** (`_a_`, `_t_`) and becomes the item record | counted into `FOUND` — that record is renamed away, so it fits the idempotency model |
| `TERMINAL` | Containers whose record is terminal (`_c_`, `_b_`, `_s_`, `_d_`) | no — nothing will ever convert one, so it is reported as a count and never asked about |
| `NOTES` | A container holding no record at all | no — the migration removes nothing there, and the user may be mid-way through writing one |

`SKIPPED` is out of the trigger because a `circles/README.md` is legitimate and permanent — a directory whose purpose is non-obvious is exactly where someone puts a README, and the migration has no business removing it. `TERMINAL` and `NOTES` are out for the same reason, and theirs is the stronger case: nothing here will ever touch either. `CONFLICTS` stays in the trigger because it *is* resolvable, and re-asking after the user has resolved it is the recovery path.

Run this first. It is read-only:

```bash
WB=./fusion-workbench; FOUND=0; SKIPPED=0; CONFLICTS=0; for d in planning issues decisions history analyses investigations consult memos; do [ -d "$WB/$d" ] || continue; printf '  %-16s -> shared/%-16s %s entry/entries\n' "$d/" "$d/" "$(find "$WB/$d" -mindepth 1 -maxdepth 1 | wc -l | tr -d ' ')"; FOUND=1; done; for pair in codereview:coderev ontoreview:ontorev conceptreview:conceptrev; do d="${pair%%:*}"; [ -d "$WB/$d" ] || continue; printf '  %-16s -> shared/%-16s %s entry/entries\n' "$d/" "reviews/" "$(find "$WB/$d" -mindepth 1 -maxdepth 1 | wc -l | tr -d ' ')"; FOUND=1; done; TMP="$(mktemp)"; while IFS= read -r f; do b="$(basename "$f" .md)"; m="$(printf '%s' "$b" | sed -nE 's/^[0-9]{6}-[0-9]{4}\[([a-z])\].*$/\1/p')"; if [ -z "$m" ]; then printf '  circles/%s — no marker, ignored (not part of the migration)\n' "$(basename "$f")"; SKIPPED=$((SKIPPED+1)); else printf '%s\t%s\t%s\n' "$(printf '%s' "$b" | sed -E 's/\[[a-z]\]//')" "$m" "$(basename "$f")" >> "$TMP"; fi; done < <(find "$WB/circles" -mindepth 1 -maxdepth 1 -name '*.md' 2>/dev/null); for dir in $(cut -f1 "$TMP" 2>/dev/null | sort -u); do n="$(awk -F'\t' -v d="$dir" '$1==d' "$TMP" | wc -l | tr -d ' ')"; if [ "$n" -gt 1 ]; then printf '  CONFLICT: %s files all map to circles/%s/ — none is moved:\n' "$n" "$dir"; awk -F'\t' -v d="$dir" '$1==d {printf "      circles/%s\n", $3}' "$TMP"; CONFLICTS=$((CONFLICTS+1)); else printf '  circles/%s -> circles/%s/_%s_circle.md\n' "$(awk -F'\t' -v d="$dir" '$1==d {print $3}' "$TMP")" "$dir" "$(awk -F'\t' -v d="$dir" '$1==d {print $2}' "$TMP")"; fi; FOUND=1; done; rm -f "$TMP"; [ -f "$WB/.active-circle" ] && { echo "  .active-circle -> deleted (the per-checkout active-Circle pointer; nothing reads it)"; FOUND=1; }; REFORMAT=$({ [ -d "$WB/shared" ] && find "$WB/shared" -type f -name '*[[]*[]]*.md' 2>/dev/null; [ -d "$WB/circles" ] && find "$WB/circles" -mindepth 2 -type f -name '*[[]*[]]*.md' 2>/dev/null; } | grep -E '\[[oatcibspd]\]-[^/]*$' | wc -l | tr -d ' '); [ "$REFORMAT" -gt 0 ] && { printf '  %s file(s) with a bracket marker in the name -> underscore form (renamed in place)\n' "$REFORMAT"; FOUND=1; }; [ "$FOUND" = 0 ] && [ "$SKIPPED" = 0 ] && echo "  (nothing — already in the current format)"; [ "$FOUND" = 0 ] && [ "$SKIPPED" -gt 0 ] && echo "  (nothing to move — the unmarked files named above are not part of the migration)"; if git rev-parse --is-inside-work-tree >/dev/null 2>&1 && [ -n "$(git ls-files "$WB" | head -1)" ]; then echo "MODE=git"; else echo "MODE=plain"; fi; echo "FOUND=$FOUND"; echo "REFORMAT=$REFORMAT"; echo "SKIPPED=$SKIPPED"; echo "CONFLICTS=$CONFLICTS"
```

### The containers, and what happens to the record inside each

Run this second, after the block above. It is read-only, and its output goes into the proposal verbatim — the user is deciding a status per live record, not approving a count:

```bash
WB=./fusion-workbench; LIVE=0; TERMINAL=0; DEFERRED=0; NOTES=0; CONFLICTS=0; while IFS= read -r d; do b="$(basename "$d")"; rel="${d#"$WB"/}"; n="$(find "$d" -mindepth 1 -maxdepth 1 -name '_*_circle.md' -type f 2>/dev/null | wc -l | tr -d ' ')"; if [ "$n" -gt 1 ]; then printf '  CONFLICT: %s holds %s records, not one — no defined state, nothing converted\n' "$rel" "$n"; CONFLICTS=$((CONFLICTS+1)); continue; fi; if [ "$n" = 0 ]; then [ -f "$d/$b.md" ] || { printf '  %s holds no record — nothing here is converted, and nothing removes it\n' "$rel"; NOTES=$((NOTES+1)); }; continue; fi; if [ -f "$d/$b.md" ]; then printf '  CONFLICT: %s already holds %s.md beside a marked record — the rename would collide, nothing converted\n' "$rel" "$b"; CONFLICTS=$((CONFLICTS+1)); continue; fi; r="$(find "$d" -mindepth 1 -maxdepth 1 -name '_*_circle.md' -type f)"; m="$(basename "$r" | sed -nE 's/^_([a-z])_circle\.md$/\1/p')"; case "$m" in a) st=open ;; t) cl="$(sed -n 's/^\*\*Claim:\*\*[[:space:]]*//p' "$r" | head -n 1)"; case "$cl" in "Claimed "*) st=claimed ;; *) st=open ;; esac ;; c|b|s) TERMINAL=$((TERMINAL+1)); continue ;; d) printf '  %s — record is terminal (_d_, deferred): left exactly as it is, and no status is written for it\n' "$rel"; TERMINAL=$((TERMINAL+1)); DEFERRED=$((DEFERRED+1)); continue ;; *) printf '  CONFLICT: %s carries marker _%s_, which is not one of a t c b s d\n' "${r#"$WB"/}" "$m"; CONFLICTS=$((CONFLICTS+1)); continue ;; esac; printf '  %s/%s -> %s/%s.md   status %s   (the container and its %s artifact(s) stay where they are)\n' "$rel" "$(basename "$r")" "$rel" "$b" "$st" "$(find "$d" -mindepth 2 -type f 2>/dev/null | wc -l | tr -d ' ')"; LIVE=$((LIVE+1)); done < <(find "$WB/circles" -mindepth 1 -maxdepth 1 -type d 2>/dev/null | sort); [ "$TERMINAL" -gt 0 ] && printf '  %s container(s) hold a terminal record: not renamed, not re-headed, nothing moved out of them\n' "$TERMINAL"; echo "LIVE=$LIVE"; echo "TERMINAL=$TERMINAL"; echo "DEFERRED=$DEFERRED"; echo "NOTES=$NOTES"; echo "CONFLICTS=$CONFLICTS"
```

`CONFLICTS` restarts at zero here: this is a second shell and it inherits nothing. Add it to the count the first block printed, and raise `FOUND` to 1 whenever `LIVE` or this `CONFLICTS` is above zero. **The gate sits below, not between the two blocks**: a live record is found only here, so a count read above this block says `FOUND=0` on a workbench that does have a record to convert, and a stop placed there stops on a partial count.

**If the total is 0: stop here.** The workbench is already in the current format. Do not ask the question — there is nothing the migration would do. Tell the user so in one line, and add the `SKIPPED` note if there is one (below).

- If `SKIPPED=0` too, report *"This workbench is already in the current format. Nothing to do."* and stop.
- If `SKIPPED>0`, add one standing line naming the files and their status, e.g. *"`circles/README.md` carries no marker, and the migration leaves it untouched."* It is a note, not an action item, and it must not become a question: the file is legitimate and nothing will ever move it.

**If either block reported a conflict**, show the conflict lines prominently in the question below. The user has to decide which file is real before those Circles can migrate; the rest of the migration proceeds regardless.

**The status mapping, and the two markers it is defined over.**

| Record marker | Item `**Status:**` | Why |
|---|---|---|
| `_a_` anticipated | `open` | nobody was working on it, which is what `open` says |
| `_t_` active | `claimed` when the record's `**Claim:**` opens `Claimed ` — `open` otherwise | an item is claimed by a **checkout**, and activation's per-checkout half (`.active-circle`) never travelled between checkouts. Where the record names a checkout itself, that is carried; where it says `Unclaimed` or carries no field, no holder exists to name and inventing one would say the work is held by nobody |

**There is no row for `_c_`, `_b_`, `_s_` or `_d_`, and that absence is the design.** All four are terminal, and a terminal record is evidence of work that ended: `rules/fusion-workbench-conventions.md` `## Terminal states are history` forbids editing one back into a live shape, no consumer reads a terminal container's state, and renaming the file would break every citation that names it in exchange for nothing.

**So the deferred question is no longer forced, and it is not answered here either.** The pass this one replaces converted every Circle, so a `_d_` record had to take one of the four values: it proposed `dropped`, marked it `[was deferred]`, and offered `open` at the confirmation — two values, neither of which meant what `_d_` meant, written in a one-way step. With the conversion narrowed to live records the `_d_` record keeps its marker and its meaning. Whether `**Status:**` should gain a fifth value for "not now" is filed as `260910-2011_*_the-deferred-state-has-no-value-in-the-work-items-status-set.md` and stands open; this skill neither settles it nor pre-empts it. Each `_d_` container is named in the survey and in the report, so the user sees the records the old pass would have rewritten.

## Step 3 — Ask before moving

Note `MODE` — the user must know before deciding whether the move will be reviewable:

- `MODE=git` — the workbench is tracked. Moves use `git mv`, history is preserved, the whole migration lands as one reviewable diff, and a retreat is `git revert`.
- `MODE=plain` — the workbench is untracked or gitignored (fusion's own repo is this case), or the project is not a git repo. `git mv` cannot work here. Moves use plain `mv`. **Say this out loud in the question.** The migration will not appear in any diff and cannot be undone with git.

Use `AskUserQuestion`. Write the prompt in the project's language per the `**Language:**` line in `CLAUDE.md` (see `rules/fusion-workbench-conventions.md` `## Project language`), and follow `rules/user-facing-output.md` plus the chat profile at `./fusion-workbench/stilwerk/chat-voice-<lang>.yaml`. Show the survey output above the question so the user sees the actual file counts, not a summary of them. The prompt, in English:

> **Question:** This workbench is not yet in the current format. I will convert it: the type folders move into `shared/`, the three review folders merge into `shared/reviews/`, each live Circle record becomes the work-item record inside its own container, and filenames carrying a bracket marker (`…[o]-….md`) are renamed to the underscore form (`…_o_….md`). Moving and renaming use `git mv`, so the whole conversion is reviewable as one diff. Nothing is deleted. **No container is emptied and no terminal record is opened** — the lists above name the containers that stay exactly as they are. The lists also show which status each live record would take.
>
> **Option "Convert"** (recommended): Moves and renames as listed, with the statuses proposed above.
> **Option "Change a status"**: Say which record should take a different status before anything moves.
> **Option "Cancel"**: Leaves the workbench exactly as it is. `/fusion:setup` then keeps refusing to start until the workbench is converted. You can call `/fusion:migrate` again at any time.

**When `DEFERRED>0`, say so in the question**, above the options: *"N container(s) hold a record that was deferred rather than finished. They are terminal, so nothing is written for them and the record keeps its marker. Whether a work item should be able to say 'not now' at all is an open question this migration does not answer."* It is a statement, not a choice — there is nothing here for the user to decide, and offering one would settle a filed question at a confirmation prompt.

For `MODE=plain`, replace the `git mv` sentence with the honest one: *"This workbench is not under version control, so moving uses `mv`. The conversion appears in no diff and cannot be taken back with `git revert`."*

**And say the one thing that is not a move.** Every other step of this migration relocates a file; converting a live record additionally **rewrites its head block** where it stands. Say that plainly: the record's own prose — the Directive, the Grounding snapshot, the Dependencies, any Turn log — is carried across verbatim, and what changes is the head, because the item grammar states the state in a field where the Circle stated it in the filename.

Do not migrate without an explicit choice. The user's own `CLAUDE.md` may declare a different language; the two options and their consequences stay the same.

## Step 4 — Execute (only after the user chose to migrate)

The migration creates the destination scaffold itself. It cannot assume `/fusion:setup` ran first: setup refuses to proceed on a pre-v4 workbench (that is what sent the user here), so on the ordinary path nothing has created `shared/` yet. The `mkdir -p` calls below are inside the loops, per destination, and are idempotent either way.

```bash
set -u; WB="./fusion-workbench"; FALLBACKS=0; COLLISIONS=0; MOVED=0; SKIPPED=0; if git rev-parse --is-inside-work-tree >/dev/null 2>&1 && [ -n "$(git ls-files "$WB" | head -1)" ]; then MODE=git; else MODE=plain; echo "NOTE: workbench not under version control. Moving with mv; the move is not reviewable as a diff and not undoable with git revert." >&2; fi; move_one() { if [ -e "$2" ]; then echo "COLLISION: $2 already exists. $1 stays where it is." >&2; COLLISIONS=$((COLLISIONS+1)); return 1; fi; if [ "$MODE" = git ] && git mv "$1" "$2" 2>/dev/null; then MOVED=$((MOVED+1)); return 0; fi; if mv "$1" "$2"; then if [ "$MODE" = git ]; then echo "NOTE: $1 is untracked, moved with mv (not in the diff)." >&2; FALLBACKS=$((FALLBACKS+1)); fi; MOVED=$((MOVED+1)); return 0; fi; echo "ERROR: $1 -> $2 failed." >&2; return 1; }; rewrite_fields() { r="$1"; ch=0; for t in planning issues decisions history analyses investigations consult memos; do if grep -qE "^\*\*Active (spec/plan|session history):\*\* $t/" "$r" 2>/dev/null; then sed -E "s#^(\*\*Active (spec/plan|session history):\*\* )$t/#\1shared/$t/#" "$r" > "$r.tmp" && mv "$r.tmp" "$r"; ch=1; fi; done; if grep -qE '^\*\*Active (spec/plan|session history):\*\*.*\[[oatcibspd]\]-' "$r" 2>/dev/null; then sed -E '/^\*\*Active (spec\/plan|session history):\*\*/ s#\[([oatcibspd])\]-#_\1_#g' "$r" > "$r.tmp" && mv "$r.tmp" "$r"; ch=1; fi; [ "$ch" = 1 ] && echo "  Fields in $(basename "$r") brought to the current format (the paths now name the moved and renamed files)."; return 0; }; for d in planning issues decisions history analyses investigations consult memos; do [ -d "$WB/$d" ] || continue; mkdir -p "$WB/shared/$d"; while IFS= read -r f; do move_one "$f" "$WB/shared/$d/$(basename "$f")" || true; done < <(find "$WB/$d" -mindepth 1 -maxdepth 1); rmdir "$WB/$d" 2>/dev/null || echo "NOTE: $WB/$d is not empty and stays." >&2; done; for pair in codereview:coderev ontoreview:ontorev conceptreview:conceptrev; do src="${pair%%:*}"; sender="${pair##*:}"; [ -d "$WB/$src" ] || continue; mkdir -p "$WB/shared/reviews"; while IFS= read -r f; do b="$(basename "$f")"; case "$b" in *"-$sender-"*) nb="$b" ;; *) nb="$(printf '%s' "$b" | sed -E "s/^([0-9]{6}-[0-9]{4})-/\1-$sender-/")" ;; esac; move_one "$f" "$WB/shared/reviews/$nb" || true; done < <(find "$WB/$src" -mindepth 1 -maxdepth 1); rmdir "$WB/$src" 2>/dev/null || echo "NOTE: $WB/$src is not empty and stays." >&2; done; TMP="$(mktemp)"; while IFS= read -r f; do b="$(basename "$f" .md)"; m="$(printf '%s' "$b" | sed -nE 's/^[0-9]{6}-[0-9]{4}\[([a-z])\].*$/\1/p')"; if [ -z "$m" ]; then echo "IGNORED: $f carries no marker and is not part of the migration. Left untouched." >&2; SKIPPED=$((SKIPPED+1)); continue; fi; printf '%s\t%s\t%s\n' "$(printf '%s' "$b" | sed -E 's/\[[a-z]\]//')" "$m" "$f" >> "$TMP"; done < <(find "$WB/circles" -mindepth 1 -maxdepth 1 -name '*.md' 2>/dev/null); for dir in $(cut -f1 "$TMP" 2>/dev/null | sort -u); do n="$(awk -F'\t' -v d="$dir" '$1==d' "$TMP" | wc -l | tr -d ' ')"; if [ "$n" -gt 1 ]; then echo "CONFLICT: $n Circle files all map to circles/$dir/ and differ only in the marker. A Circle has exactly one state — only a human can decide which file holds. None is moved:" >&2; awk -F'\t' -v d="$dir" '$1==d {print "    " $3}' "$TMP" >&2; COLLISIONS=$((COLLISIONS+1)); continue; fi; m="$(awk -F'\t' -v d="$dir" '$1==d {print $2}' "$TMP")"; f="$(awk -F'\t' -v d="$dir" '$1==d {print $3}' "$TMP")"; mkdir -p "$WB/circles/$dir"; if move_one "$f" "$WB/circles/$dir/_${m}_circle.md"; then mkdir -p "$WB/circles/$dir/planning" "$WB/circles/$dir/issues" "$WB/circles/$dir/decisions" "$WB/circles/$dir/history" "$WB/circles/$dir/reviews" "$WB/circles/$dir/analyses"; rewrite_fields "$WB/circles/$dir/_${m}_circle.md"; else rmdir "$WB/circles/$dir" 2>/dev/null || true; fi; done; rm -f "$TMP"; reformat_one() { s="$1"; dd="$(dirname "$s")"; bb="$(basename "$s")"; nn="$(printf '%s' "$bb" | sed -E 's/\[([oatcibspd])\]-/_\1_/g')"; [ "$nn" = "$bb" ] && return 0; if move_one "$s" "$dd/$nn"; then case "$nn" in _[oatcibspd]_circle.md) rewrite_fields "$dd/$nn" ;; esac; fi; }; RTMP="$(mktemp)"; { [ -d "$WB/shared" ] && find "$WB/shared" -type f -name '*[[]*[]]*.md' 2>/dev/null; [ -d "$WB/circles" ] && find "$WB/circles" -mindepth 2 -type f -name '*[[]*[]]*.md' 2>/dev/null; } | grep -E '\[[oatcibspd]\]-[^/]*$' > "$RTMP"; while IFS= read -r rf; do [ -e "$rf" ] || continue; reformat_one "$rf"; done < "$RTMP"; rm -f "$RTMP"; echo "---"; echo "moved=$MOVED collisions=$COLLISIONS mv-fallbacks=$FALLBACKS ignored=$SKIPPED mode=$MODE"
```

### Step 4b — A live record becomes its container's item record

Run this **after** the block above, so a flat `circles/*.md` has already become a container, and **before** the report. Unlike every other pass in this skill it is not one shell one-liner: it reads a record's sections and re-heads a file, which is not sed work. Take the containers one at a time, in the order the survey listed them, and open only the ones the survey counted into `LIVE`.

**Nothing leaves a container.** The unit of work's `planning/`, `issues/`, `decisions/`, `reviews/`, `analyses/` and `history/` stay where they are with every file in them. The pass this replaces emptied each container into the shared stores and wrote one flat item; it was written when the container was going away, and running it now would take a workbench apart. It is gone, not disabled.

**A terminal record is not opened at all** — no read, no rename, no head block. Count those containers for the report and move on.

**The live record is renamed to its container's own name.** `circles/<dir>/_<m>_circle.md` becomes `circles/<dir>/<dir>.md`: the same name twice, directory and record, with no marker on either (`rules/fusion-workbench-conventions.md` `## Backlog entries — work items`). The directory name is already `YYMMDD-HHMM-<slug>`, which is the record's name exactly, so no name is invented and every citation of the directory still resolves. One rename per container:

```bash
WB=./fusion-workbench; D="<the container, workbench-relative>"; B="$(basename "$D")"; if git rev-parse --is-inside-work-tree >/dev/null 2>&1 && [ -n "$(git ls-files "$WB" | head -1)" ]; then MODE=git; else MODE=plain; fi; R="$(find "$WB/$D" -mindepth 1 -maxdepth 1 -name '_*_circle.md' -type f)"; T="$WB/$D/$B.md"; if [ -e "$T" ]; then echo "COLLISION: $T already exists. $R stays where it is." >&2; elif [ "$MODE" = git ] && git mv "$R" "$T" 2>/dev/null; then echo "renamed (git mv): $D/$(basename "$R") -> $D/$B.md"; elif mv "$R" "$T"; then echo "renamed (mv): $D/$(basename "$R") -> $D/$B.md"; else echo "ERROR: $R -> $T failed." >&2; fi
```

`MODE` is recomputed because this is a fresh shell: a `git mv` silently downgraded to `mv` drops the rename out of the diff the user was promised.

**Then write the head block**, keeping the record's own `# ` title line above it:

```markdown
# <the record's H1, or the Directive's first sentence where it has none>

---
**Domain:** <the record's **Domain:**, or `code` where it carried none>
**Status:** <the status the survey proposed, or the one the user named instead>
**Claim:** <carried from the record's **Claim:** — see below>
**Depends-on:** <one `<dirname>.md` per converted container — see below>
**Filed by:** <the record's **Filed by:**, verbatim>

---
```

Then **the record's own body, verbatim, from `## Directive` down.** Every section it carried stays: the Grounding snapshot, the Dependencies, any Turn log, any closure note. The item grammar's head fields are a floor, not a ceiling, and a closure note is the only surviving statement of how that work ended — dropping it to reach a tidier file would destroy evidence to gain nothing.

Four fields need care:

- **`**Claim:**` is carried only when the record's own claim opens with `Claimed `**, and it is rewritten to the item form: the eight-hex checkout first, then the person, then the stamp (`rules/fusion-workbench-conventions.md` `## Backlog entries — work items`). `Unclaimed`, an absent field, or the partial-identity form (`Claimed …, identity partial: …`) all mean **the field is absent from the item** — a claim that names no checkout keys nothing. Never compose a checkout identifier here, and never substitute this checkout's own: the record is being converted, not claimed.
- **`**Depends-on:**` may name only a record that exists.** The record's `## Dependencies` section held Circle **directory** names, and a converted container's record is `<dirname>.md`. Keep the entries naming a container **this pass also converted**, comma-separated. Drop `(none)`, drop prose, drop any entry naming no such directory, and drop any naming a container whose record stayed terminal — that record is still `_<m>_circle.md`, so an entry pointing at `<dirname>.md` there resolves to nothing, and a citation that resolves to nothing degrades without announcing it (`HYG-NO-SILENT-FAIL`). Say in the report which entries you dropped and why. The field is **absent** when nothing survives — never present and empty.
- **`**Domain:**` and `**Filed by:**` are copied, never derived.** A record carrying no `**Filed by:**` — they predate the field — gets the line the conventions' `### Who filed it` prescribes for an unattributable record rather than a guess.
- **There is no `**Status:**` to copy.** The Circle stated its state in the filename marker, which is why the survey had to propose one; the record's own `**Status:**` head field, where a pre-260815 record still carries one, is **not** read — it is exactly the field that drifted from the marker and was dropped for it. Carry it down into the body untouched with the rest of the prose, and take the status from the marker.

**Finally, once every live record has converted**, remove the dead pointer:

```bash
WB=./fusion-workbench; [ -f "$WB/.active-circle" ] && { rm -f "$WB/.active-circle"; echo "pointer .active-circle removed — nothing reads it"; }; :
```

`.active-circle` is deleted rather than migrated: it named the running Circle for this checkout alone, no consumer reads it, and there is no per-checkout pointer in the current format for it to become. A checkout's claim on an item is the `**Claim:**` field, which travels.

**If any live record cannot convert — a refused container, a collision, a rename that failed — stop and return to the user with what stands**, naming which containers converted and which did not. Each conversion is a rename and a head block in place, so a partial run leaves nothing half-emptied behind; what it leaves is a user expecting item records that are not there.

What the moves do, and why each is what it is:

- **Type folders move by content, not by directory.** `git mv <dir> shared/<dir>` nests the source *inside* the destination (`shared/planning/planning/`) whenever the destination already exists — and it can, either because a prior partial run created it or because a converted agent wrote there before the migration ran. Both `git mv` and `mv` behave this way. Moving entry by entry and then `rmdir`-ing the drained folder is what avoids it.
- **Every type folder goes to `shared/` wholesale.** There are two candidate stores for every kind — a work item's container and `shared/` — and the Origin Rule picks between them by which item's directive caused the artifact (`rules/fusion-workbench-conventions.md` `## Origin Rule (Herkunftsregel)`). A pre-v4 workbench recorded no such affiliation for anything, so by that rule's own first corollary every one of these files goes to `shared/`. No file is inspected and none is placed by guess, which is what makes this a mechanical move instead of an act of interpretation.
- **The three review folders merge, and the sender is inserted into the filename.** `codereview/260519-0438-loader-check.md` becomes `shared/reviews/260519-0438-coderev-loader-check.md`. This is not decoration: the conventions make `<sender>` mandatory on a review filename precisely because the three kinds now share one directory, and inserting it makes same-name collisions across the three sources **impossible by construction** rather than merely unlikely. Files that already carry their sender are left alone; files that do not match the `YYMMDD-HHMM-` stamp shape get no insert and can still collide.
- **A real collision never overwrites.** If the destination exists, the source stays where it is, the script says so on stderr, and the drained folder survives the `rmdir`. The next run detects it again. Losing an artifact to a silent clobber is the one outcome this skill must never produce (`HYG-NO-SILENT-FAIL`); leaving a file behind with a loud message is recoverable, overwriting it is not.
- **A flat Circle file becomes a container.** `circles/260716-1847[t]-umbau.md` becomes `circles/260716-1847-umbau/_t_circle.md` with the six empty subdirectories beside it, and Step 4b then renames that record to `circles/260716-1847-umbau/260716-1847-umbau.md`. The container is the destination, not a waypoint: the directory this pass creates is where the unit of work stays. The two passes are kept apart rather than fused because they answer different questions — one gives a v4-era file the directory it never had, the other converts a v4-era *record* — and a workbench that needs only the second must not be made to pass through the first. A `circles/*.md` file with no parsable marker is ignored loudly and left in place rather than guessed at, and it does not re-trigger the migration question (see the counter table in Step 2).
- **Two Circle files that differ only by marker are refused, not merged.** The directory name is the marker-stripped filename, so `260101-0903[a]-dup.md` and `260101-0903[t]-dup.md` both map to `circles/260101-0903-dup/`. Their records would land side by side — different filenames, so no collision fires — producing one Circle directory holding two records with two different states. The conventions admit no such shape and no consumer handles it: the record is the sole carrier of Circle state, so a directory with two records has no defined state, and playmaker would see one Circle that is both `[a]` and `[t]`. The grouping pass therefore detects the collapse **before** any move, refuses the whole group, counts it into `collisions`, and leaves both files where they are. Which one is real is a question only the user can answer. This is the same posture as everywhere else in this skill: refuse loudly, never guess (`HYG-NO-SILENT-FAIL`).
- **Bracket-marker filenames are renamed to the underscore form.** After the layout moves, a final pass walks `shared/` (any depth) and every Circle's records and subdirectories (`circles/*/` from depth 2 down, so a leftover pre-v4 flat `circles/*.md` is untouched by this pass), and renames any file whose name still carries a bracket-form marker (`…[o]-….md`) to the underscore form (`…_o_….md`) — the marker's trailing hyphen absorbed into the delimiter (`s/\[([oatcibspd])\]-/_\1_/g`). This is what brings a workbench that is *already* in the container layout but still bracket-marked — fusion's own workbench is exactly this case — fully up to the current format, and it also carries the pre-v4 files this migration just moved into `shared/` across to the underscore form. It reuses the same `move_one` machinery, so a name that would collide with an existing underscore file is refused loudly, never overwritten (`HYG-NO-SILENT-FAIL`), and every rename counts into `moved`. The survey's `REFORMAT` count and the pass's candidate list select with the same `\[[oatcibspd]\]-` basename filter the sed converts — a bracket pair that is not a marker (`notes [draft].md`) is neither counted as pending work nor visited, so the proposal never claims a rename the pass would then silently skip. `/fusion:setup`'s bracket probe applies that filter over these same two trees, for the same reason (the detector must only look for things the executor can remove).
- **The record's path fields are reformatted to the underscore form.** A record's `**Active spec/plan:**` and `**Active session history:**` hold the storeless basename (`rules/fusion-workbench-conventions.md` `## Filename Patterns`); a pre-v4 record wrote them as paths under the old layout (`planning/260716-1910[p]-plan-foo.md`). The migration has just moved those targets to `shared/planning/` **and** renamed them to the underscore-marker form, so `rewrite_fields` rewrites the values to the storeless basename with the marker wildcarded (`260716-1910_*_plan-foo.md`), which a workbench-wide lookup resolves wherever the file now sits. This is not a cosmetic fix: a field naming a file that no longer exists degrades without announcing it, which is precisely the failure `HYG-NO-SILENT-FAIL` forbids. The field carries no store, so where the file actually sits is what the lookup finds rather than what the field claims. The store-drop touches only values starting with a known type-folder name or `circles/`; the marker-absorb touches any bracket marker on the two field lines wherever it appears. `(none yet)` and anything with neither shape are left alone.
- **`.active-circle` is not re-pointed.** It used to be rewritten here from the old filename form to the bare directory name, because the pass that then deleted it keyed on that name. Step 4b keys on nothing in it and deletes it outright, so the rewrite would compute a value no reader ever sees.

## Step 5 — Report

Report the tail counters (`moved`, `collisions`, `mv-fallbacks`, `ignored`) and, for Step 4b, one line per record converted: the record's new path, the status written, and any `## Dependencies` entry dropped and why. Then tell the user what to do next:

- **`collisions=0` and every live record converted** — the migration is complete. Tell the user to run `/fusion:setup` now; it will find the current format and proceed normally.
- **`collisions>0`** — some artifacts stayed put. Name them. It means a real name collision, a refused pair of flat Circle files, or a container holding two records, and each needs the user's decision. `/fusion:setup` will still refuse to start until they are resolved and `/fusion:migrate` has been run again.
- **`ignored>0`** — informational. Those files are staying put by design and will never move.
- **`TERMINAL` and `NOTES`** — say the counts in one line each. A terminal record was left exactly as it stands, and a container holding no record was left alone; neither is outstanding work, and neither will be asked about again.
- **Any `_d_` container** — name it, and say that it keeps its marker and takes no status. Whether a work item can say "not now" at all is open (`260910-2011_*_the-deferred-state-has-no-value-in-the-work-items-status-set.md`), and this migration left the question exactly where it found it.

For `MODE=plain`, remind the user that the move is not in any diff, so a `git revert` is not available if they want to retreat.

## Guardrails

- **Never migrate without an explicit user choice.** The survey is read-only; nothing moves before Step 3's answer.
- **Never overwrite.** A destination that exists means the source stays and the collision is reported. Move only; never copy, never delete.
- **Never touch the root-anchored surfaces.** `orchestrator-events.jsonl`, `.guard-state/`, `.commit-lock/`, `.session-marker`, `.checkout-id`, `.cadence-anchors`, `monitor`, `stilwerk/`, `.fusion-setup` stay where they are (`.active-circle` is the one exception, and it is deleted rather than moved — Step 4b says why); their consumers read them at fixed root-relative paths and none has a fallback (`rules/fusion-workbench-conventions.md` `## fusion-workbench Layout`).
- **Never guess a status.** The mapping table in Step 2 is proposed to the user and confirmed before anything moves. Where a marker is not one of the six, the container is refused and named, not assigned a status by inference.
- **Never empty a container, and never open a terminal record.** Every artifact a unit of work produced stays inside that unit's directory, and a record carrying `_c_`, `_b_`, `_s_` or `_d_` is not read, renamed or re-headed by this skill at all.
- **Never claim an item for this checkout.** A `**Claim:**` is carried only where the record itself names a checkout. The migration moves work; it does not take it on.
- **Never reconcile a record it moves.** A terminal issue, decision or plan arrives exactly as it was written (`rules/fusion-workbench-conventions.md` `## Terminal states are history`). The one head block this skill rewrites is a **live** Circle record's, as it becomes an item record, and the body below it is carried verbatim.
- **Never touch git beyond `git mv`.** No `git add`, no `git commit`. The user decides whether to commit the migration.
