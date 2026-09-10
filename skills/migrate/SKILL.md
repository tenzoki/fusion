---
description: Bring a fusion workbench to the current format — one store per artifact kind under shared/, and underscore state markers. Moves pre-v4 root type folders into shared/, merges the three review folders, turns each Circle directory into one work item and empties its stores into the shared ones, and reformats bracket-marked filenames to the underscore form. Surveys first, asks before moving, never overwrites.
allowed-tools: [Bash, Read, AskUserQuestion]
---

# Migrate a workbench to the current format

This skill brings a workbench to the **current format**, which has three parts.

First, **one store per artifact kind, all of them under `shared/`** (`rules/fusion-workbench-conventions.md` `## fusion-workbench Layout`). A workbench created before v4 keeps its artifacts in type folders at the workbench root (`planning/`, `issues/`, `decisions/`, …). A v4-to-v10 workbench keeps a copy of every store inside each `circles/<dir>/`. Both are converted to the one set under `shared/`.

Second, **the work item replaces the Circle**. Each Circle directory becomes one file in `shared/backlog/`, carrying that Circle's Directive and a `**Status:**` head field in place of the marker its record's filename carried (`rules/fusion-workbench-conventions.md` `## Backlog entries — work items`).

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

**Detection is by artifact presence, not by version.** A workbench needs migration when at least one out-of-format artifact still exists: a type folder at the workbench root, a `circles/*.md` file (the old marker-in-filename form), or any filename still carrying a bracket-form state marker (`…[o]-….md`) rather than the underscore form. The `plugin_version` in `.fusion-setup` is *not* the detector — it answers the wrong question, because a workbench with no out-of-format artifacts has nothing to migrate regardless of which version created it, and `/fusion:setup` overwrites the field on every run anyway. Report the old version to the user as context if you like; key the decision on the artifacts.

**This is also the idempotency guarantee, and it constrains what the detector may look for.** The detector must only look for things the executor can *remove* — not for things it merely *inspects*. If a move fails, its source stays put, the detector fires again next run, and the user gets another chance; no state flag can drift out of sync with the filesystem, because the filesystem *is* the flag. But that design has no memory of "the user already saw this one", so anything the executor will never remove must never enter the trigger, or the skill asks a question forever that has nothing left to do — and a prompt that fires forever gets clicked through without reading, which is what makes the *next*, real migration question dangerous.

Hence the counters below are split three ways:

| Counter | Meaning | Triggers the question? |
|---|---|---|
| `FOUND` | Things the migration will move, plus conflicts it refuses but the user can resolve | **yes** |
| `REFORMAT` | Bracket-marked filenames to rename in place to the underscore form | counted into `FOUND` — the reformat is a removable artifact, so it fits the idempotency model |
| `SKIPPED` | `circles/*.md` with no marker — not part of the migration, never moved | no — reported as a standing note |
| `CONFLICTS` | Two markered Circle files collapsing to one directory name | counted into `FOUND`; the user resolves by deciding which file is real |
| `CIRCLEDIRS` | Circle **directories** to convert into work items | counted into `FOUND` — the directory is removed by the conversion, so it fits the idempotency model |

`SKIPPED` is out of the trigger because a `circles/README.md` is legitimate and permanent — a directory whose purpose is non-obvious is exactly where someone puts a README, and the migration has no business removing it. `CONFLICTS` stays in the trigger because it *is* resolvable, and re-asking after the user has resolved it is the recovery path.

Run this first. It is read-only:

```bash
WB=./fusion-workbench; FOUND=0; SKIPPED=0; CONFLICTS=0; for d in planning issues decisions history analyses investigations consult memos; do [ -d "$WB/$d" ] || continue; printf '  %-16s -> shared/%-16s %s entry/entries\n' "$d/" "$d/" "$(find "$WB/$d" -mindepth 1 -maxdepth 1 | wc -l | tr -d ' ')"; FOUND=1; done; for pair in codereview:coderev ontoreview:ontorev conceptreview:conceptrev; do d="${pair%%:*}"; [ -d "$WB/$d" ] || continue; printf '  %-16s -> shared/%-16s %s entry/entries\n' "$d/" "reviews/" "$(find "$WB/$d" -mindepth 1 -maxdepth 1 | wc -l | tr -d ' ')"; FOUND=1; done; TMP="$(mktemp)"; while IFS= read -r f; do b="$(basename "$f" .md)"; m="$(printf '%s' "$b" | sed -nE 's/^[0-9]{6}-[0-9]{4}\[([a-z])\].*$/\1/p')"; if [ -z "$m" ]; then printf '  circles/%s — no marker, ignored (not part of the migration)\n' "$(basename "$f")"; SKIPPED=$((SKIPPED+1)); else printf '%s\t%s\t%s\n' "$(printf '%s' "$b" | sed -E 's/\[[a-z]\]//')" "$m" "$(basename "$f")" >> "$TMP"; fi; done < <(find "$WB/circles" -mindepth 1 -maxdepth 1 -name '*.md' 2>/dev/null); for dir in $(cut -f1 "$TMP" 2>/dev/null | sort -u); do n="$(awk -F'\t' -v d="$dir" '$1==d' "$TMP" | wc -l | tr -d ' ')"; if [ "$n" -gt 1 ]; then printf '  CONFLICT: %s files all map to circles/%s/ — none is moved:\n' "$n" "$dir"; awk -F'\t' -v d="$dir" '$1==d {printf "      circles/%s\n", $3}' "$TMP"; CONFLICTS=$((CONFLICTS+1)); else printf '  circles/%s -> circles/%s/_%s_circle.md\n' "$(awk -F'\t' -v d="$dir" '$1==d {print $3}' "$TMP")" "$dir" "$(awk -F'\t' -v d="$dir" '$1==d {print $2}' "$TMP")"; fi; FOUND=1; done; rm -f "$TMP"; if [ -f "$WB/.active-circle" ]; then cur="$(head -n1 "$WB/.active-circle" | tr -d '\r' | sed -E 's/^[[:space:]]+//; s/[[:space:]]+$//')"; case "$cur" in *.md) printf '  .active-circle  %s -> %s\n' "$cur" "$(printf '%s' "$cur" | sed -E 's/\.md$//; s/\[[a-z]\]//')"; FOUND=1 ;; esac; fi; REFORMAT=$({ [ -d "$WB/shared" ] && find "$WB/shared" -type f -name '*[[]*[]]*.md' 2>/dev/null; [ -d "$WB/circles" ] && find "$WB/circles" -mindepth 2 -type f -name '*[[]*[]]*.md' 2>/dev/null; } | grep -E '\[[oatcibspd]\]-[^/]*$' | wc -l | tr -d ' '); [ "$REFORMAT" -gt 0 ] && { printf '  %s file(s) with a bracket marker in the name -> underscore form (renamed in place)\n' "$REFORMAT"; FOUND=1; }; [ "$FOUND" = 0 ] && [ "$SKIPPED" = 0 ] && echo "  (nothing — already in the current format)"; [ "$FOUND" = 0 ] && [ "$SKIPPED" -gt 0 ] && echo "  (nothing to move — the unmarked files named above are not part of the migration)"; if git rev-parse --is-inside-work-tree >/dev/null 2>&1 && [ -n "$(git ls-files "$WB" | head -1)" ]; then echo "MODE=git"; else echo "MODE=plain"; fi; echo "FOUND=$FOUND"; echo "REFORMAT=$REFORMAT"; echo "SKIPPED=$SKIPPED"; echo "CONFLICTS=$CONFLICTS"
```

**If `FOUND=0`: stop here.** The workbench is already in the current format. Do not ask the question — there is nothing the migration would do. Tell the user so in one line, and add the `SKIPPED` note if there is one (below).

- If `SKIPPED=0` too, report *"This workbench is already in the current format. Nothing to do."* and stop.
- If `SKIPPED>0`, add one standing line naming the files and their status, e.g. *"`circles/README.md` carries no marker, and the migration leaves it untouched."* It is a note, not an action item, and it must not become a question: the file is legitimate and nothing will ever move it.

**If `CONFLICTS>0`**, show the conflict lines prominently in the question below. The user has to decide which file is real before those Circles can migrate; the rest of the migration proceeds regardless.

### The Circle directories, and the status each one is proposed to take

Run this second, after the block above. It is read-only, and its output goes into the proposal verbatim — the user is deciding a status per Circle, not approving a count:

```bash
WB=./fusion-workbench; CIRCLEDIRS=0; DEFERRED=0; while IFS= read -r d; do n="$(find "$d" -mindepth 1 -maxdepth 1 -name '_*_circle.md' -type f 2>/dev/null | wc -l | tr -d ' ')"; if [ "$n" -ne 1 ]; then printf '  REFUSED: %s holds %s record(s), not one — no defined state, nothing moved\n' "${d#"$WB"/}" "$n"; CONFLICTS=$((CONFLICTS+1)); continue; fi; r="$(find "$d" -mindepth 1 -maxdepth 1 -name '_*_circle.md' -type f)"; m="$(basename "$r" | sed -nE 's/^_([a-z])_circle\.md$/\1/p')"; cl="$(sed -n 's/^\*\*Claim:\*\*[[:space:]]*//p' "$r" | head -n 1)"; case "$m" in a) st=open ;; t) case "$cl" in "Claimed "*) st=claimed ;; *) st=open ;; esac ;; c|b) st=done ;; s) st=dropped ;; d) st=dropped; DEFERRED=$((DEFERRED+1)) ;; *) printf '  REFUSED: %s carries marker _%s_, which is not one of a t c b s d\n' "${r#"$WB"/}" "$m"; CONFLICTS=$((CONFLICTS+1)); continue ;; esac; printf '  %s -> shared/backlog/%s.md   status %s%s   (%s artifact(s) to the shared stores)\n' "${d#"$WB"/}" "$(basename "$d")" "$st" "$([ "$m" = d ] && printf ' [was deferred]')" "$(find "$d" -mindepth 2 -type f 2>/dev/null | wc -l | tr -d ' ')"; CIRCLEDIRS=$((CIRCLEDIRS+1)); FOUND=1; done < <(find "$WB/circles" -mindepth 1 -maxdepth 1 -type d 2>/dev/null | sort); echo "CIRCLEDIRS=$CIRCLEDIRS"; echo "DEFERRED=$DEFERRED"; echo "CONFLICTS=$CONFLICTS"
```

**The status mapping, and the one place it loses information.**

| Record marker | Item `**Status:**` | Why |
|---|---|---|
| `_a_` anticipated | `open` | nobody was working on it, which is what `open` says |
| `_t_` active | `claimed` when the record's `**Claim:**` opens `Claimed ` — `open` otherwise | an item is claimed by a **checkout**, and activation's per-checkout half (`.active-circle`) never travelled between checkouts. Where the record names a checkout itself, that is carried; where it says `Unclaimed` or carries no field, no holder exists to name and inventing one would say the work is held by nobody |
| `_c_` closed | `done` | the work landed |
| `_b_` bounded closure | `done` | the work landed in bounded form, and the closure note in the body says what was bounded. `dropped` would say the job is no longer live, which a bounded closure never claimed |
| `_s_` superseded | `dropped` | another unit of work replaced it, and the body cites which |
| `_d_` deferred | `dropped` | **this is the lossy one** — see below |

**`deferred` has no status of its own, and the proposal says so per Circle.** The four values are `open`, `claimed`, `done` and `dropped`; a Circle pushed out to a named later moment maps to `dropped` with its body still saying it was deferred. That is a real narrowing: `dropped` is terminal, and reopening a terminal item is filing a new one. So every `_d_` Circle is listed in the proposal with `[was deferred]` beside it, and the question below says the user may name `open` for any of them instead. **Do not decide this per Circle yourself.**

## Step 3 — Ask before moving

Note `MODE` — the user must know before deciding whether the move will be reviewable:

- `MODE=git` — the workbench is tracked. Moves use `git mv`, history is preserved, the whole migration lands as one reviewable diff, and a retreat is `git revert`.
- `MODE=plain` — the workbench is untracked or gitignored (fusion's own repo is this case), or the project is not a git repo. `git mv` cannot work here. Moves use plain `mv`. **Say this out loud in the question.** The migration will not appear in any diff and cannot be undone with git.

Use `AskUserQuestion`. Write the prompt in the project's language per the `**Language:**` line in `CLAUDE.md` (see `rules/fusion-workbench-conventions.md` `## Project language`), and follow `rules/user-facing-output.md` plus the chat profile at `./fusion-workbench/stilwerk/chat-voice-<lang>.yaml`. Show the survey output above the question so the user sees the actual file counts, not a summary of them. The prompt, in English:

> **Question:** This workbench is not yet in the current format. I will convert it: the type folders move into `shared/`, the three review folders merge into `shared/reviews/`, each Circle becomes one work item in `shared/backlog/` with its own artifacts moved into the shared stores, and filenames carrying a bracket marker (`…[o]-….md`) are renamed to the underscore form (`…_o_….md`). Moving and renaming use `git mv`, so the whole conversion is reviewable as one diff. Nothing is deleted. The lists above show what moves and which status each Circle would take.
>
> **Option "Convert"** (recommended): Moves the artifacts as listed, with the statuses proposed above.
> **Option "Change a status"**: Say which Circle should take a different status before anything moves.
> **Option "Cancel"**: Leaves the workbench exactly as it is. `/fusion:setup` then keeps refusing to start until the workbench is converted. You can call `/fusion:migrate` again at any time.

**When `DEFERRED>0`, say so in the question**, above the options: *"N of these Circles were deferred rather than finished. There is no deferred status; they are proposed as `dropped`, which is terminal. Say `open` for any you still intend to come back to."* Carry the user's answer into the pass below; where they named none, the proposal stands.

For `MODE=plain`, replace the `git mv` sentence with the honest one: *"This workbench is not under version control, so moving uses `mv`. The conversion appears in no diff and cannot be taken back with `git revert`."*

**And say the one thing that is not a move.** Every step of this migration relocates a file; the Circle-to-item conversion additionally **rewrites the head block** of each Circle record as it becomes an item. Say that plainly: the record's own prose — the Directive, the Grounding snapshot, the Dependencies, any Turn log, any Closure note — is carried across verbatim, and what changes is the head, because the item grammar states the state in a field where the Circle stated it in the filename.

Do not migrate without an explicit choice. The user's own `CLAUDE.md` may declare a different language; the two options and their consequences stay the same.

## Step 4 — Execute (only after the user chose to migrate)

The migration creates the destination scaffold itself. It cannot assume `/fusion:setup` ran first: setup refuses to proceed on a pre-v4 workbench (that is what sent the user here), so on the ordinary path nothing has created `shared/` yet. The `mkdir -p` calls below are inside the loops, per destination, and are idempotent either way.

```bash
set -u; WB="./fusion-workbench"; FALLBACKS=0; COLLISIONS=0; MOVED=0; SKIPPED=0; if git rev-parse --is-inside-work-tree >/dev/null 2>&1 && [ -n "$(git ls-files "$WB" | head -1)" ]; then MODE=git; else MODE=plain; echo "NOTE: workbench not under version control. Moving with mv; the move is not reviewable as a diff and not undoable with git revert." >&2; fi; move_one() { if [ -e "$2" ]; then echo "COLLISION: $2 already exists. $1 stays where it is." >&2; COLLISIONS=$((COLLISIONS+1)); return 1; fi; if [ "$MODE" = git ] && git mv "$1" "$2" 2>/dev/null; then MOVED=$((MOVED+1)); return 0; fi; if mv "$1" "$2"; then if [ "$MODE" = git ]; then echo "NOTE: $1 is untracked, moved with mv (not in the diff)." >&2; FALLBACKS=$((FALLBACKS+1)); fi; MOVED=$((MOVED+1)); return 0; fi; echo "ERROR: $1 -> $2 failed." >&2; return 1; }; rewrite_fields() { r="$1"; ch=0; for t in planning issues decisions history analyses investigations consult memos; do if grep -qE "^\*\*Active (spec/plan|session history):\*\* $t/" "$r" 2>/dev/null; then sed -E "s#^(\*\*Active (spec/plan|session history):\*\* )$t/#\1shared/$t/#" "$r" > "$r.tmp" && mv "$r.tmp" "$r"; ch=1; fi; done; if grep -qE '^\*\*Active (spec/plan|session history):\*\*.*\[[oatcibspd]\]-' "$r" 2>/dev/null; then sed -E '/^\*\*Active (spec\/plan|session history):\*\*/ s#\[([oatcibspd])\]-#_\1_#g' "$r" > "$r.tmp" && mv "$r.tmp" "$r"; ch=1; fi; [ "$ch" = 1 ] && echo "  Fields in $(basename "$r") brought to the current format (the paths now name the moved and renamed files)."; return 0; }; for d in planning issues decisions history analyses investigations consult memos; do [ -d "$WB/$d" ] || continue; mkdir -p "$WB/shared/$d"; while IFS= read -r f; do move_one "$f" "$WB/shared/$d/$(basename "$f")" || true; done < <(find "$WB/$d" -mindepth 1 -maxdepth 1); rmdir "$WB/$d" 2>/dev/null || echo "NOTE: $WB/$d is not empty and stays." >&2; done; for pair in codereview:coderev ontoreview:ontorev conceptreview:conceptrev; do src="${pair%%:*}"; sender="${pair##*:}"; [ -d "$WB/$src" ] || continue; mkdir -p "$WB/shared/reviews"; while IFS= read -r f; do b="$(basename "$f")"; case "$b" in *"-$sender-"*) nb="$b" ;; *) nb="$(printf '%s' "$b" | sed -E "s/^([0-9]{6}-[0-9]{4})-/\1-$sender-/")" ;; esac; move_one "$f" "$WB/shared/reviews/$nb" || true; done < <(find "$WB/$src" -mindepth 1 -maxdepth 1); rmdir "$WB/$src" 2>/dev/null || echo "NOTE: $WB/$src is not empty and stays." >&2; done; TMP="$(mktemp)"; while IFS= read -r f; do b="$(basename "$f" .md)"; m="$(printf '%s' "$b" | sed -nE 's/^[0-9]{6}-[0-9]{4}\[([a-z])\].*$/\1/p')"; if [ -z "$m" ]; then echo "IGNORED: $f carries no marker and is not part of the migration. Left untouched." >&2; SKIPPED=$((SKIPPED+1)); continue; fi; printf '%s\t%s\t%s\n' "$(printf '%s' "$b" | sed -E 's/\[[a-z]\]//')" "$m" "$f" >> "$TMP"; done < <(find "$WB/circles" -mindepth 1 -maxdepth 1 -name '*.md' 2>/dev/null); for dir in $(cut -f1 "$TMP" 2>/dev/null | sort -u); do n="$(awk -F'\t' -v d="$dir" '$1==d' "$TMP" | wc -l | tr -d ' ')"; if [ "$n" -gt 1 ]; then echo "CONFLICT: $n Circle files all map to circles/$dir/ and differ only in the marker. A Circle has exactly one state — only a human can decide which file holds. None is moved:" >&2; awk -F'\t' -v d="$dir" '$1==d {print "    " $3}' "$TMP" >&2; COLLISIONS=$((COLLISIONS+1)); continue; fi; m="$(awk -F'\t' -v d="$dir" '$1==d {print $2}' "$TMP")"; f="$(awk -F'\t' -v d="$dir" '$1==d {print $3}' "$TMP")"; mkdir -p "$WB/circles/$dir"; if move_one "$f" "$WB/circles/$dir/_${m}_circle.md"; then mkdir -p "$WB/circles/$dir/planning" "$WB/circles/$dir/issues" "$WB/circles/$dir/decisions" "$WB/circles/$dir/history" "$WB/circles/$dir/reviews" "$WB/circles/$dir/analyses"; rewrite_fields "$WB/circles/$dir/_${m}_circle.md"; else rmdir "$WB/circles/$dir" 2>/dev/null || true; fi; done; rm -f "$TMP"; reformat_one() { s="$1"; dd="$(dirname "$s")"; bb="$(basename "$s")"; nn="$(printf '%s' "$bb" | sed -E 's/\[([oatcibspd])\]-/_\1_/g')"; [ "$nn" = "$bb" ] && return 0; if move_one "$s" "$dd/$nn"; then case "$nn" in _[oatcibspd]_circle.md) rewrite_fields "$dd/$nn" ;; esac; fi; }; RTMP="$(mktemp)"; { [ -d "$WB/shared" ] && find "$WB/shared" -type f -name '*[[]*[]]*.md' 2>/dev/null; [ -d "$WB/circles" ] && find "$WB/circles" -mindepth 2 -type f -name '*[[]*[]]*.md' 2>/dev/null; } | grep -E '\[[oatcibspd]\]-[^/]*$' > "$RTMP"; while IFS= read -r rf; do [ -e "$rf" ] || continue; reformat_one "$rf"; done < "$RTMP"; rm -f "$RTMP"; if [ -f "$WB/.active-circle" ]; then cur="$(head -n1 "$WB/.active-circle" | tr -d '\r' | sed -E 's/^[[:space:]]+//; s/[[:space:]]+$//')"; case "$cur" in *.md) new="$(printf '%s' "$cur" | sed -E 's/\.md$//; s/\[[a-z]\]//')"; if [ -d "$WB/circles/$new" ]; then printf '%s\n' "$new" > "$WB/.active-circle"; echo "pointer .active-circle: $cur -> $new"; else echo "WARNING: .active-circle names $cur, but circles/$new is missing. Pointer unchanged; check it by hand." >&2; fi ;; esac; fi; echo "---"; echo "moved=$MOVED collisions=$COLLISIONS mv-fallbacks=$FALLBACKS ignored=$SKIPPED mode=$MODE"
```

### Step 4b — Each Circle directory becomes one work item

Run this **after** the block above, so a flat `circles/*.md` has already become a directory, and **before** the report. Unlike every other pass in this skill it is not one shell one-liner: it reads a record's sections and re-heads a file, which is not sed work. Take the Circle directories one at a time, in the order the survey listed them.

**First, empty the Circle's stores into the shared ones.** One `mv` per file, collision-safe, exactly as the type-folder pass moves:

```bash
WB=./fusion-workbench; D="<the Circle directory, workbench-relative>"; for k in planning issues decisions history analyses reviews; do [ -d "$WB/$D/$k" ] || continue; mkdir -p "$WB/shared/$k"; while IFS= read -r f; do t="$WB/shared/$k/$(basename "$f")"; if [ -e "$t" ]; then echo "COLLISION: $t already exists. $f stays where it is." >&2; else if [ "$MODE" = git ] && git mv "$f" "$t" 2>/dev/null; then :; else mv "$f" "$t"; fi; fi; done < <(find "$WB/$D/$k" -mindepth 1 -maxdepth 1); rmdir "$WB/$D/$k" 2>/dev/null || echo "NOTE: $WB/$D/$k is not empty and stays." >&2; done
```

**No file moved here is opened, re-marked or reconciled.** A closed issue arrives closed, an implemented decision arrives implemented, an unticked box in a terminal plan stays unticked. That is `## Terminal states are history` in the conventions: a terminal record is evidence, and a migration that tidied one would be destroying the thing it was meant to preserve.

**Then build the item.** The record is `<D>/_<m>_circle.md` and the item is `shared/backlog/<basename of D>.md` — the directory name is already `YYMMDD-HHMM-<slug>`, which is the item filename form exactly, so no name is invented and every citation of the directory name still resolves. Move the record to that path, then write its head block:

```markdown
# <the record's H1, or the Directive's first sentence where it has none>

---
**Domain:** <the record's **Domain:**, or `code` where it carried none>
**Status:** <the status the survey proposed, or the one the user named instead>
**Claim:** <carried from the record's **Claim:** — see below>
**Depends-on:** <one `<dirname>.md` per entry of the record's `## Dependencies` — see below>
**Filed by:** <the record's **Filed by:**, verbatim>
---
```

Then **the record's own body, verbatim, from `## Directive` down.** Every section it carried stays: the Grounding snapshot, the Dependencies, any Turn log, any Closure note. The item grammar's head fields are a floor, not a ceiling, and a Closure note is the only surviving statement of how that work ended — dropping it to reach a tidier file would destroy evidence to gain nothing.

Four fields need care:

- **`**Claim:**` is carried only when the record's own claim opens with `Claimed `**, and it is rewritten to the item form: the eight-hex checkout first, then the person, then the stamp (`rules/fusion-workbench-conventions.md` `## Backlog entries — work items`). `Unclaimed`, an absent field, or the partial-identity form (`Claimed …, identity partial: …`) all mean **the field is absent from the item** — a claim that names no checkout keys nothing. Never compose a checkout identifier here, and never substitute this checkout's own: the record is being moved, not claimed.
- **`**Depends-on:**` is the one field this migration can genuinely fill.** The record's `## Dependencies` section held Circle **directory** names, and each of those becomes an item basename by appending `.md`. Write one comma-separated list of the entries that name a directory the survey also listed; drop `(none)`, prose, and any entry naming no such directory, and say in the report which entries you dropped and why. The field is **absent** when nothing survives — never present and empty.
- **`**Domain:**` and `**Filed by:**` are copied, never derived.** A record carrying no `**Filed by:**` — they predate the field — gets the line the conventions' `### Who filed it` prescribes for an unattributable record rather than a guess.
- **There is no `**Status:**` to copy.** The Circle stated its state in the filename marker, which is why the survey had to propose one; the record's own `**Status:**` head field, where a pre-260815 record still carries one, is **not** read — it is exactly the field that drifted from the marker and was dropped for it. Carry it down into the body untouched with the rest of the prose, and take the status from the marker.

**Then remove the emptied directory.** `rmdir "$WB/<D>"` — and if it refuses, say so and leave everything: a directory that will not empty holds something no pass here recognised, and that is a finding for the user rather than a thing to force.

**Finally, once every Circle has converted**, remove the container and the dead pointer:

```bash
WB=./fusion-workbench; rmdir "$WB/circles" 2>/dev/null && echo "circles/ removed (empty)" || echo "NOTE: circles/ is not empty and stays — report what is in it." >&2; [ -f "$WB/.active-circle" ] && { rm -f "$WB/.active-circle"; echo "pointer .active-circle removed — nothing reads it"; }
```

`.active-circle` is deleted rather than migrated: it named the running Circle for this checkout alone, no consumer reads it, and there is no per-checkout pointer in the current format for it to become. A checkout's claim on an item is the `**Claim:**` field, which travels.

**If any Circle cannot convert — a refused directory, a collision, a `rmdir` that failed — stop and return to the user with what stands.** Do not convert some Circles and leave others half-emptied without saying so: this is the one irreversible pass in the migration, and a partial run the user does not know about is worse than a refusal they do.

What the moves do, and why each is what it is:

- **Type folders move by content, not by directory.** `git mv <dir> shared/<dir>` nests the source *inside* the destination (`shared/planning/planning/`) whenever the destination already exists — and it can, either because a prior partial run created it or because a converted agent wrote there before the migration ran. Both `git mv` and `mv` behave this way. Moving entry by entry and then `rmdir`-ing the drained folder is what avoids it.
- **Every type folder goes to `shared/` wholesale.** No file is inspected and no affiliation is guessed, because there is nothing left for an affiliation to select: one kind has one store. That is what makes this a mechanical move instead of an act of interpretation.
- **The three review folders merge, and the sender is inserted into the filename.** `codereview/260519-0438-loader-check.md` becomes `shared/reviews/260519-0438-coderev-loader-check.md`. This is not decoration: the conventions make `<sender>` mandatory on a review filename precisely because the three kinds now share one directory, and inserting it makes same-name collisions across the three sources **impossible by construction** rather than merely unlikely. Files that already carry their sender are left alone; files that do not match the `YYMMDD-HHMM-` stamp shape get no insert and can still collide.
- **A real collision never overwrites.** If the destination exists, the source stays where it is, the script says so on stderr, and the drained folder survives the `rmdir`. The next run detects it again. Losing an artifact to a silent clobber is the one outcome this skill must never produce (`HYG-NO-SILENT-FAIL`); leaving a file behind with a loud message is recoverable, overwriting it is not.
- **Circle files become Circle directories, as an intermediate step only.** `circles/260716-1847[t]-umbau.md` becomes `circles/260716-1847-umbau/_t_circle.md`, and Step 4b then converts that directory into `shared/backlog/260716-1847-umbau.md`. The two passes are kept apart rather than fused because they answer different questions — one normalises a v4-era name, the other converts a v4-era *shape* — and a workbench that needs only the second must not be made to pass through the first. A `circles/*.md` file with no parsable marker is ignored loudly and left in place rather than guessed at, and it does not re-trigger the migration question (see the counter table in Step 2).
- **Two Circle files that differ only by marker are refused, not merged.** The directory name is the marker-stripped filename, so `260101-0903[a]-dup.md` and `260101-0903[t]-dup.md` both map to `circles/260101-0903-dup/`. Their records would land side by side — different filenames, so no collision fires — producing one Circle directory holding two records with two different states. The conventions admit no such shape and no consumer handles it: the record is the sole carrier of Circle state, so a directory with two records has no defined state, and playmaker would see one Circle that is both `[a]` and `[t]`. The grouping pass therefore detects the collapse **before** any move, refuses the whole group, counts it into `collisions`, and leaves both files where they are. Which one is real is a question only the user can answer. This is the same posture as everywhere else in this skill: refuse loudly, never guess (`HYG-NO-SILENT-FAIL`).
- **Bracket-marker filenames are renamed to the underscore form.** After the layout moves, a final pass walks `shared/` (any depth) and every Circle's records and subdirectories (`circles/*/` from depth 2 down, so a leftover pre-v4 flat `circles/*.md` is untouched by this pass), and renames any file whose name still carries a bracket-form marker (`…[o]-….md`) to the underscore form (`…_o_….md`) — the marker's trailing hyphen absorbed into the delimiter (`s/\[([oatcibspd])\]-/_\1_/g`). This is what brings a workbench that is *already* in the container layout but still bracket-marked — fusion's own workbench is exactly this case — fully up to the current format, and it also carries the pre-v4 files this migration just moved into `shared/` across to the underscore form. It reuses the same `move_one` machinery, so a name that would collide with an existing underscore file is refused loudly, never overwritten (`HYG-NO-SILENT-FAIL`), and every rename counts into `moved`. The survey's `REFORMAT` count and the pass's candidate list select with the same `\[[oatcibspd]\]-` basename filter the sed converts — a bracket pair that is not a marker (`notes [draft].md`) is neither counted as pending work nor visited, so the proposal never claims a rename the pass would then silently skip. `/fusion:setup`'s bracket probe applies that filter over these same two trees, for the same reason (the detector must only look for things the executor can remove).
- **The record's path fields are reformatted to the underscore form.** A record's `**Active spec/plan:**` and `**Active session history:**` hold the storeless basename (`rules/fusion-workbench-conventions.md` `## Filename Patterns`); a pre-v4 record wrote them as paths under the old layout (`planning/260716-1910[p]-plan-foo.md`). The migration has just moved those targets to `shared/planning/` **and** renamed them to the underscore-marker form, so `rewrite_fields` rewrites the values to the storeless basename with the marker wildcarded (`260716-1910_*_plan-foo.md`), which a workbench-wide lookup resolves wherever the file now sits. This is not a cosmetic fix: a field naming a file that no longer exists degrades without announcing it, which is precisely the failure `HYG-NO-SILENT-FAIL` forbids. The field carries no store, so where the file actually sits is what the lookup finds rather than what the field claims. The store-drop touches only values starting with a known type-folder name or `circles/`; the marker-absorb touches any bracket marker on the two field lines wherever it appears. `(none yet)` and anything with neither shape are left alone.
- **`.active-circle` is re-pointed** from the old filename form to the bare directory name, and then deleted by Step 4b once the Circles have converted. The intermediate rewrite is not wasted work: the flat-file pass and Step 4b both key on the directory name, and a pointer left in the filename form would be reported as an orphan by the very pass that is about to remove it.

## Step 5 — Report

Report the tail counters (`moved`, `collisions`, `mv-fallbacks`, `ignored`) and, for Step 4b, one line per Circle converted: the item path, the status written, and any `## Dependencies` entry dropped for naming no Circle. Then tell the user what to do next:

- **`collisions=0` and every Circle converted** — the migration is complete. Tell the user to run `/fusion:setup` now; it will find the current format and proceed normally.
- **`collisions>0`** — some artifacts stayed put. Name them. It means a real name collision, a refused Circle pair, or a Circle directory holding no single record, and each needs the user's decision. `/fusion:setup` will still refuse to start until they are resolved and `/fusion:migrate` has been run again.
- **`ignored>0`** — informational. Those files are staying put by design and will never move.
- **Any `_d_` Circle** — name it and the status it took, so a Circle that was deferred and is now terminal is a thing the user was told rather than a thing they find.

For `MODE=plain`, remind the user that the move is not in any diff, so a `git revert` is not available if they want to retreat.

## Guardrails

- **Never migrate without an explicit user choice.** The survey is read-only; nothing moves before Step 3's answer.
- **Never overwrite.** A destination that exists means the source stays and the collision is reported. Move only; never copy, never delete.
- **Never touch the root-anchored surfaces.** `orchestrator-events.jsonl`, `.guard-state/`, `.commit-lock/`, `.session-marker`, `.checkout-id`, `.cadence-anchors`, `monitor`, `stilwerk/`, `.fusion-setup` stay where they are (`.active-circle` is the one exception, and it is deleted rather than moved — Step 4b says why); their consumers read them at fixed root-relative paths and none has a fallback (`rules/fusion-workbench-conventions.md` `## fusion-workbench Layout`).
- **Never guess a status.** The mapping table in Step 2 is proposed to the user and confirmed before anything moves. Where a marker is not one of the six, the Circle is refused and named, not assigned a status by inference.
- **Never claim an item for this checkout.** A `**Claim:**` is carried only where the record itself names a checkout. The migration moves work; it does not take it on.
- **Never reconcile a record it moves.** A terminal issue, decision or plan arrives exactly as it was written (`rules/fusion-workbench-conventions.md` `## Terminal states are history`). The one head block this skill rewrites is the Circle record's, as it becomes an item, and the body below it is carried verbatim.
- **Never touch git beyond `git mv`.** No `git add`, no `git commit`. The user decides whether to commit the migration.
