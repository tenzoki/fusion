---
description: Bring a fusion workbench to the v12 store names — `circles/` to `work-packages/`, `planning/` to `plans/` in `shared/` and in every container, `shared/consult/` to `shared/consultations/`. Directory renames only; no record is rewritten, nothing in `archive/` or the Review-class stores moves. Surveys first, asks before moving, never overwrites, resumes after an interruption. A pre-v4 workbench is refused and routed to the `v11.11.1` tag. Then, where the installed copy carries `bin/fusion-migrate`, repairs the records one finding at a time and migrates the workbench to JSON control on a yes.
allowed-tools: [Bash, Read]
---

# Migrate a workbench to the current format

This workflow brings a workbench to the **v12 store names** (Steps 1 to 6), then to **JSON control** (Step 7). Three stores were renamed at `12.0.0`:

| From | To |
|---|---|
| `circles/` | `work-packages/` |
| `shared/planning/`, and `planning/` inside every container | `plans/` in the same place |
| `shared/consult/` | `shared/consultations/` |

**Directories move; no file changes.** Every file keeps its basename and its bytes, so every storeless citation resolves after the move exactly as before (`rules/fusion-workbench-conventions.md` `## Filename Patterns`), and the migration commit is renames only. `archive/`, the frozen stores, the Review-class stores, `stilwerk/` and every root file stay where they stand; the survey names each one, with the decision record that holds its question where one does.

Run it once after updating to `12.0.0` or later. It is idempotent and resumable: on a workbench already in the v12 format it finds nothing and stops without asking; after an interruption the next run continues from what the filesystem holds.

**An older workbench is refused, not converted.** The conversions of the pre-v4 type-folder layout, the flat v4-era `circles/<stamp>[t]-<slug>.md` file, the live `_a_`/`_t_` Circle record and the bracket-marked filename (`…[o]-….md`) left this workflow at `12.0.0`. The survey still recognises all four, since refusing loudly is cheaper than renaming a shape it was not written for, and stops with the route: check out the plugin source at the tag `v11.11.1`, load it with `claude --plugin-dir <that checkout>`, run `/fusion:migrate` there, then `fusion --update`, restart, and run `/fusion:migrate` again for the store names.

**Every message this file specifies is written here in English and rendered in the project's chat language** — the `**Language:**` line in `CLAUDE.md`, resolved per `rules/fusion-workbench-conventions.md` `## Project language`, with the chat profile at `./fusion-workbench/stilwerk/chat-voice-<lang>.yaml`. The strings printed *by the shell blocks below* are the exception, and they stay English in every project: they are CLI operator output, which the same rule exempts alongside every other helper and hook string fusion ships.

## Why this skill does not call `bin/fusion-paths`

Every other skill resolves its write targets through `bin/fusion-paths <own-name>`, and a store-directory literal is otherwise forbidden in a skill body; this skill's carve-out is recorded with `/fusion:setup`'s in `rules/fusion-workbench-conventions.md` `## Path Resolution`. It names every layout literally because its subject is the transition between them, which is exactly what the resolver's answers do not describe. All three reasons are authored in `rules/workbench-path-resolution.md` `### The one consumer that names the layout literally`.

The workbench anchor still comes from a helper — `bin/fusion-workbench-root`, the same primitive `fusion-paths` itself delegates to. Only the store paths below are literal.

## Step 1 — Locate the workbench

```bash
ROOT="$("$FUSION_PLUGIN_ROOT/bin/fusion-workbench-root")" || { echo "No fusion workbench above $(pwd). Run /fusion:setup at the project root first." >&2; exit 1; }
```

`cd "$ROOT"` so the relative paths below resolve. On a non-zero exit, halt: there is no workbench to migrate, and the user needs `/fusion:setup` first.

## Step 2 — Guard and survey

**First the version guard.** The pass runs only when the installed plugin, the copy `$FUSION_PLUGIN_ROOT` names and every agent's helpers come from, reads the new names. Below `12.0.0` those helpers resolve only `circles/`, so a migrated workbench would leave every `OUT_*` and `SCAN_*` pointing at a directory that no longer exists. The window opens and closes at a major, so the major alone decides:

```bash
V="$(grep '"version"' "$FUSION_PLUGIN_ROOT/.claude-plugin/plugin.json" 2>/dev/null | head -1 | sed -E 's/.*"version": *"([^"]+)".*/\1/')"; M="${V%%.*}"; if [ -n "$V" ] && [ "$M" -ge 12 ] 2>/dev/null; then echo "INSTALLED=$V"; echo "WINDOW=open"; else echo "INSTALLED=${V:-unreadable}"; echo "WINDOW=closed"; echo "REFUSED: the installed plugin is ${V:-unreadable}; the store-name pass needs 12.0.0 or later. Run fusion --update, restart, and run /fusion:migrate again."; fi
```

**`WINDOW=closed`: stop here**, before surveying, and tell the user the `REFUSED` line.

**Then the survey. Detection is by artefact presence, not by version** (not `.fusion-setup`'s `plugin_version`). The pass is due while a legacy store exists: `circles/`, `shared/planning/`, `shared/consult/`, or a `planning/` directly inside a container under either store, which is where a refused fold leaves one. Each is something the apply removes, so the filesystem is the only state and a refused or interrupted move is found again next run. Nothing the pass merely inspects enters the trigger, or the question would fire forever.

Run this second. It is read-only:

```bash
WB=./fusion-workbench; FOUND=0; LEGACY=0; COLLISIONS=0; UNTRACKED=0; DIRTY=0; UNKNOWN=0; LEFT=0
if git rev-parse --is-inside-work-tree >/dev/null 2>&1 && [ -n "$(git ls-files "$WB" | head -1)" ]; then MODE=git; else MODE=plain; fi
for d in planning issues decisions history analyses investigations consult memos codereview ontoreview conceptreview; do [ -d "$WB/$d" ] && { echo "  LEGACY: $d/ (root type folder)"; LEGACY=1; }; done
F="$(find "$WB/circles" -mindepth 1 -maxdepth 1 -type f -name '*.md' 2>/dev/null | grep -E '/[0-9]{6}-[0-9]{4}\[[a-z]\][^/]*\.md$' | head -1)"; [ -n "$F" ] && { echo "  LEGACY: ${F#"$WB"/} (v4-era work item as a flat file)"; LEGACY=1; }
F="$({ [ -d "$WB/shared" ] && find "$WB/shared" -type f -name '*[[]*[]]*.md' 2>/dev/null; [ -d "$WB/circles" ] && find "$WB/circles" -mindepth 2 -type f -name '*[[]*[]]*.md' 2>/dev/null; } | grep -E '\[[oatcibspd]\]-[^/]*$' | head -1)"; [ -n "$F" ] && { echo "  LEGACY: ${F#"$WB"/} (bracket marker in the name)"; LEGACY=1; }
F="$(find "$WB/circles" -mindepth 2 -maxdepth 2 -type f -name '_[at]_circle.md' 2>/dev/null | head -1)"; [ -n "$F" ] && { echo "  LEGACY: ${F#"$WB"/} (live Circle record)"; LEGACY=1; }
[ "$LEGACY" = 1 ] && echo "REFUSED: this shape converts with the plugin source at tag v11.11.1. Check it out, start claude --plugin-dir <that checkout>, run /fusion:migrate there; then fusion --update, restart, and run /fusion:migrate again."
O='260922-1059_*_which-treatment-do-the-stores-and-root-files-the-nomenclature-table-omits-take.md'
while IFS= read -r e; do r="${e#"$WB"/}"; case "$r" in
  shared|circles|work-packages|shared/planning|shared/plans|shared/consult|shared/consultations) continue ;;
  shared/issues) k='260922-1059_*_is-a-record-in-issues-a-candidate-or-an-admitted-work-item.md' ;;
  shared/memos) k='260922-1059_*_what-becomes-of-memos-which-the-concept-has-no-type-for.md' ;;
  shared/history) k='260922-1059_*_is-the-frozen-history-store-audit-evidence-or-typed-record-history.md' ;;
  shared/checkouts) k='260922-1059_*_is-the-checkout-registry-a-fusion-reference-or-a-prior-authority-source.md' ;;
  stilwerk) k='260922-1059_*_which-english-name-does-stilwerk-take-and-when.md' ;;
  .guard-state) k='260922-1059_*_does-guard-state-become-a-prior-runtime-record-or-go.md' ;;
  shared/forum|shared/discussions|orchestrator-events.jsonl|.commit-lock|.cadence-anchors|.session-marker|.checkout-id|.asset-provenance|monitor) k="$O" ;;
  archive|stashes|.migration-v2-backup|shared/backlog) echo "  FROZEN: $r (never opened)"; LEFT=$((LEFT+1)); continue ;;
  shared/analyses|shared/investigations|shared/decisions|shared/reviews|.fusion-setup) echo "  LEFT: $r"; LEFT=$((LEFT+1)); continue ;;
  agentstate.yaml|orchestrator-live.md|portfolio.md|.active-circle) echo "  LEFT: $r (retired, nothing reads it; deletable by hand)"; LEFT=$((LEFT+1)); continue ;;
  *) if [ -n "$(find "$e" -maxdepth 1 -type d \( -name circles -o -name planning -o -name consult \) 2>/dev/null | head -1)" ]; then echo "  UNKNOWN: $r is or holds a legacy store directory"; UNKNOWN=$((UNKNOWN+1)); else echo "  UNCLASSIFIED: $r (no store directory; left)"; fi; continue ;;
esac; echo "  LEFT: $r (question held by $k)"; LEFT=$((LEFT+1)); done < <(find "$WB" "$WB/shared" -mindepth 1 -maxdepth 1 2>/dev/null | sort)
cv() { local e t; while IFS= read -r e; do t="$2/${e##*/}"; if [ -d "$e" ] && [ ! -L "$e" ] && [ -d "$t" ] && [ ! -L "$t" ]; then cv "$e" "$t"; elif [ -e "$t" ]; then echo "  COLLISION: ${t#"$WB"/} exists; ${e#"$WB"/} stays"; COLLISIONS=$((COLLISIONS+1)); fi; done < <(find "$1" -mindepth 1 -maxdepth 1); }
sv() { [ -d "$1" ] || return 0; FOUND=1; printf '  %s/ -> %s/  %s entries\n' "${1#"$WB"/}" "${2#"$WB"/}" "$(find "$1" -mindepth 1 -maxdepth 1 | wc -l | tr -d ' ')"; cv "$1" "$2"; return 0; }
sv "$WB/shared/consult" "$WB/shared/consultations"; sv "$WB/shared/planning" "$WB/shared/plans"
while IFS= read -r p; do sv "$p" "${p%/planning}/plans"; done < <(find "$WB/circles" "$WB/work-packages" -mindepth 2 -maxdepth 2 -type d -name planning 2>/dev/null | sort)
sv "$WB/circles" "$WB/work-packages"
EMPTY="$(find "$WB/circles" "$WB/shared/planning" "$WB/shared/consult" -type d -empty 2>/dev/null | wc -l | tr -d ' ')"
if [ "$MODE" = git ]; then UNTRACKED="$(git ls-files -o -- "$WB/circles" "$WB/shared/planning" "$WB/shared/consult" | wc -l | tr -d ' ')"
  while IFS= read -r l; do echo "  DIRTY: ${l#???}"; DIRTY=$((DIRTY+1)); done < <(git status --porcelain -- "$WB/circles" "$WB/shared/planning" "$WB/shared/consult" | grep -vE '^(\?\?|R ) '); fi
[ -f .gitignore ] && grep -nE 'fusion-workbench/(circles|shared/planning|shared/consult)' .gitignore | sed 's/^/  GITIGNORE: /'
[ "$FOUND" = 0 ] && echo "  (no legacy store: already in the v12 format)"
echo "MODE=$MODE"; echo "FOUND=$FOUND"; echo "LEGACY=$LEGACY"; echo "COLLISIONS=$COLLISIONS"; echo "EMPTY=$EMPTY"; echo "UNTRACKED=$UNTRACKED"; echo "DIRTY=$DIRTY"; echo "UNKNOWN=$UNKNOWN"; echo "LEFT=$LEFT"
```

| Counter | Meaning | Effect |
|---|---|---|
| `FOUND` | a legacy store exists | triggers the question |
| `COLLISIONS` | a file (or a file facing a directory) at the same path under the old and the new name, at any depth: one basename in a container's `planning/` and `plans/`, or one path inside a container present under both stores | triggers the question; each is refused at apply and named, and the rest proceeds |
| `EMPTY`, `UNTRACKED` | empty directories, and in `git` mode untracked files, under a source; both move by `mv` and appear in no diff | informational |
| `LEFT` | entries left by rule, frozen, or owing no record | informational; nothing here ever moves |
| `LEGACY` | a pre-v4, v4-era or bracket-marked shape | **stops** before the question |
| `DIRTY` | in `git` mode, an uncommitted change under a source; untracked rows and the staged renames of an interrupted run excepted | **stops** before the question |
| `UNKNOWN` | an unclassified entry at the root or under `shared/` that is or directly holds a `circles`, `planning` or `consult` directory | **stops** before the question |

A destination *directory* that already exists is not a collision but the ordinary state after the update, at any depth; the pass folds the legacy entries into it. That includes one container under both stores, which is what a package claimed under `circles/<dir>/` becomes once a 12.0.0 helper files its next record under `work-packages/<dir>/`.

**Every entry at the workbench root and under `shared/` falls in one class of the block's `case`**: renamed or its new name; left by rule, naming the record that holds its question open for a later pass; left with no record owed (the retired root files among them, deletable by hand); frozen, never opened, because a sweep froze its subtrees under the names they had; or unclassified, tested by layout, never by file text, since the pass opens no file. An unclassified store directory is `UNKNOWN`: the user's ruling, never the pass's guess.

Then, in this order:

- **`LEGACY=1`**: stop. Show the `LEGACY` lines and render the `REFUSED` line as one message. Ask nothing.
- **`DIRTY>0`**: stop. Name every `DIRTY` path and ask the user to commit or stash, then run again: a rename over a modified file mixes the migration with work in flight and leaves no clean revert.
- **`UNKNOWN>0`**: stop. Name the entry; the user moves the misplaced store by hand, then runs again.
- **`FOUND=0`**: *"This workbench is already in the v12 format."* Ask nothing and go to Step 7.

## Step 3 — Ask before moving

Say `MODE` out loud: with `git`, moves use `git mv`, the migration is one diff of renames and `git revert` retreats; with `plain` (untracked, gitignored, or no repo), moves use `mv`, appear in no diff and cannot be undone with git.

Ask in plain chat text in the project's language (`rules/fusion-workbench-conventions.md` `## Project language`), following `rules/user-facing-output.md` and the chat profile: the survey output first, so the user sees the entries and counts rather than a summary, then the question in one line, numbered options beneath. The user answers with a number or in their own words; then stop and wait. In English:

> This workbench still uses the v11 store names; rename them as listed above (`circles/` to `work-packages/`, each `planning/` to `plans/`, `shared/consult/` to `shared/consultations/`)? Directories move entry by entry with `git mv`, one reviewable diff of renames; no file's content changes, every filename survives, and `archive/`, the Review-class stores, `stilwerk/` and the root files stay.
>
> 1. Convert (recommended): renames as listed.
> 2. Tracked entries only: renames every entry git tracks, leaves the untracked ones, named in the report.
> 3. Cancel: leaves the workbench as it is. Nothing reads the old names since `13.0.0`, so `/fusion:setup` refuses it until renamed; `/fusion:migrate` can run again any time.

Offer "Tracked entries only" only in `git` mode with `UNTRACKED>0`. With `COLLISIONS>0`, put the collision lines above the options and say that those entries stay and the rest moves. For `MODE=plain`, replace the `git mv` sentence with the honest one: *"This workbench is not under version control, so moving uses `mv`. The renames appear in no diff and cannot be taken back with `git revert`."*

Do not migrate without an explicit choice. On "Cancel" stop here: Step 7 needs the new names.

## Step 4 — Apply

Only after the user chose to convert. For "Tracked entries only", set `TRACKED_ONLY=1` at the head of the block.

```bash
set -u; WB=./fusion-workbench; TRACKED_ONLY=0; FALLBACKS=0; COLLISIONS=0; MOVED=0; LEFT=0; if git rev-parse --is-inside-work-tree >/dev/null 2>&1 && [ -n "$(git ls-files "$WB" | head -1)" ]; then MODE=git; else MODE=plain; echo "NOTE: workbench not under version control. Moving with mv; the move is not reviewable as a diff and not undoable with git revert." >&2; fi
move_one() { if [ -e "$2" ]; then echo "COLLISION: $2 already exists. $1 stays where it is." >&2; COLLISIONS=$((COLLISIONS+1)); return 1; fi; if [ "$MODE" = git ] && git mv "$1" "$2" 2>/dev/null; then MOVED=$((MOVED+1)); return 0; fi; if mv "$1" "$2"; then if [ "$MODE" = git ]; then echo "NOTE: $1 is untracked, moved with mv (not in the diff)." >&2; FALLBACKS=$((FALLBACKS+1)); fi; MOVED=$((MOVED+1)); return 0; fi; echo "ERROR: $1 -> $2 failed." >&2; return 1; }
fold_store() { local src="$1" dst="$2" e t; [ -d "$src" ] || return 0; mkdir -p "$dst"; while IFS= read -r e; do if [ "$TRACKED_ONLY" = 1 ] && [ "$MODE" = git ] && [ -z "$(git ls-files -- "$e" | head -1)" ]; then echo "LEFT: $e is untracked and stays." >&2; LEFT=$((LEFT+1)); continue; fi; t="$dst/${e##*/}"; if [ -d "$e" ] && [ ! -L "$e" ] && [ -d "$t" ] && [ ! -L "$t" ]; then fold_store "$e" "$t"; else move_one "$e" "$t" || true; fi; done < <(find "$src" -mindepth 1 -maxdepth 1 | sort); rmdir "$src" 2>/dev/null || echo "NOTE: $src is not empty and stays." >&2; }
fold_store "$WB/shared/consult" "$WB/shared/consultations"; fold_store "$WB/shared/planning" "$WB/shared/plans"
while IFS= read -r p; do fold_store "$p" "${p%/planning}/plans"; done < <(find "$WB/circles" "$WB/work-packages" -mindepth 2 -maxdepth 2 -type d -name planning 2>/dev/null | sort)
fold_store "$WB/circles" "$WB/work-packages"
echo "---"; echo "moved=$MOVED mv-fallbacks=$FALLBACKS collisions=$COLLISIONS left=$LEFT mode=$MODE"
```

- **Stores move by content, not as a directory.** `git mv circles work-packages` nests the source *inside* an existing destination, and inside the window one usually exists. `fold_store` moves entry by entry, descends into any directory present on both sides (a container, its `plans/`, `issues/` and the rest) so each file moves by its own `git mv`, then `rmdir`s each drained source: the only removal here, and loud on a source a collision kept.
- **The order keeps every intermediate state one the survey recognises**: shared stores, then each container's `planning/`, the container store last. An interrupted run leaves some entries under the destination and the rest under the source, and the next run moves the rest; a move leaves no copy, so nothing collides with itself.

**If a move failed** (an `ERROR` line), stop and report what moved and what did not. Nothing is undone automatically; the next run resumes from the filesystem.

## Step 5 — Report

Report the tail counters (`moved`, `mv-fallbacks`, `collisions`, `left`), then:

- one line per left-by-rule entry with its record, and the frozen and no-record entries one line each;
- every `GITIGNORE` hit, which is the project's own rule to edit;
- every entry moved by `mv` in `git` mode (`git revert` will not restore it), every untracked entry left, and every collision with both paths.

Then what to do next, in this order: commit the migration as one commit of renames and push it; tell the other checkouts to pull rather than migrate again, so the project has one revert point (a checkout holding an untracked container under `circles/` runs `/fusion:migrate` once more after the pull); run `/fusion:setup`. For `MODE=plain`, say that nothing here is in a diff.

## Step 6 — Sweep the citations

The pass moved directories and rewrote no record, so a citation spelling a moved store segment is the other half. Set `SWEEP="$FUSION_PLUGIN_ROOT/bin/fusion-citation-sweep"` and `K=record,package-record,package-dir`. If `[ -x "$SWEEP" ]` is false, say the sweep was skipped because the installed copy carries no `bin/fusion-citation-sweep` yet and `fusion --update` then a restart will get it, and go to Step 7. Otherwise run `"$SWEEP" --dry-run --kinds "$K"`, report its summary and its three `scope=` lines, naming the `archive/` and `extra-paths` (the project's `citations.extraPaths`, code included) shares apart from the workbench's, and ask in Step 3's shape whether to write these store repairs. On a yes run `"$SWEEP" --write --yes --kinds "$K"` and report its summary, and say that it wrote record content, which stays unstaged beside the staged renames and is committed separately, after the migration commit; on a no, say they were left as written.

Then name the marker respelling (`bare-record`) as a separate, later choice and not part of the migration: the user may run `"$SWEEP" --dry-run --kinds bare-record` themselves. Why apart: it is unrelated to v12, and a respelled pre-v4 bracket marker resolves to nothing while `260830-1842_*_may-the-grammar-resolve-a-bracket-marked-record-that-a-frozen-store-keeps-permanently.md` is open. Then go to Step 7.

## Step 7 — Repair, then migrate to JSON control

Run this step only when `[ -x "$FUSION_PLUGIN_ROOT/bin/fusion-migrate" ]` holds; otherwise say the installed copy carries no JSON migration yet and stop. Every question in this step is plain chat text with numbered options, never `AskUserQuestion`: one question per message, and the user answers with a number or in their own words.

**Node first, before any `bin/fusion-migrate` call.** The rename pass above needed no Node and stands as it is; this step does:

```bash
W="$(sed -n 's/.*"node": *">=\([0-9][0-9.]*\)".*/\1/p' "$FUSION_PLUGIN_ROOT/codec/package.json" 2>/dev/null | head -1)"; W="${W:-20.12.0}"; if command -v node >/dev/null 2>&1 && node -e 'const c=s=>s.split(".").map(Number),h=c(process.versions.node),w=c(process.argv[1]);for(let i=0;i<3;i++)if(h[i]!==w[i])process.exit(h[i]>w[i]?0:1)' "$W" 2>/dev/null; then echo "NODE=$(node --version)"; else echo "REFUSED: the JSON migration needs Node $W or later, and node is missing or older. Install it and run /fusion:migrate again."; fi
```

On `REFUSED`, tell the user that line and stop. Set `M="$FUSION_PLUGIN_ROOT/bin/fusion-migrate"`; every call below runs from `$ROOT`. Its lines are `KEY=value` on stdout with tab-separated fields, its reasons on stderr; on any exit other than those named here, show the stderr line and stop.

**Survey.** Run `"$M" status`. With `done=true` and `rolled_back=false` the workbench is already on JSON control: say so and stop. With a recorded run that is not done, go to *Interrupted* below. Otherwise run `"$M" survey` (it writes nothing) and show its `count=` and `findings=` lines as a short table. Then show its `derived=` lines as one short table, field, rule and count: the reported values the Markdown never recorded, derived from git, carried as unknown or defaulted. Say once that each is marked as derived in its record and that nothing was asked for it, and that an owner who wants to correct the text first lists those findings with `"$M" repair --list --optional` and applies one as below.

**Repairs, blocking findings only, one at a time.** Run `"$M" repair --list`. With `blocking=0`, go on. A finding with an `unrepairable=` line is named with its reason: the user fixes it by hand, and this step stops before the question to migrate while any remains. Take the **first** other `finding=` only and put it to the user: its file, what is wrong (`detail`), the proposed edit (`edit=`) and every `listed=` citation it rewrites. Ask each `ask=` question in its own message, skipping one whose condition (the last field) the earlier answers do not meet: a `choice` question numbers its choices; an `actor` question takes an agent name or `user`; a `person` question takes `Name <email>` or an explicit "nobody". **A missing filer is never filled from the session or a neighbouring record**: the person comes only from the git author of the file's first commit, and the actor is carried as unknown. When the edit goes into the control file only, say that the record's text stays unchanged. Then ask:

> 1. Apply this repair.
> 2. Skip it: the migration stays blocked until it is fixed.

Only on 1, run `"$M" repair --apply <finding> --value <key>=<answer> … --consent`, one `--value` per answer. Exit 6 means it was not applied (stderr says why); exit 9 means the backup did not verify and nothing was repaired: report either and stop. After each applied repair run `repair --list` again, because a finding's id binds its file's bytes, and put the next one. On 2, stop.

**The question to migrate.** Once `blocking=0`, say first: *every installation that writes this workbench must be on 13.0.0 or later before it writes again; nothing detects a checkout that does not update.* Then ask once:

> This workbench's records are ready to move to the new JSON format. A full backup outside the workbench, taken before the first repair or now, stands first; the move runs in chunks and can be rolled back.
> 1. Migrate now.
> 2. Not now: nothing changes, and `/fusion:migrate` can run again at any time.

**Run.** Only on 1, run `"$M" run`. Show every `reported=`, `untracked=` and `ignored=` line, then the receipt (`verified=`, `migrated=`). `result=no-op` means it had already run and nothing was sent. Exit 6 means a finding came back: return to the repairs. Exit 5 or 8: show the reason and stop.

**Interrupted.** On exit 7, or a recorded run that is not done, run `"$M" status` and ask: 1. continue (`"$M" resume`), 2. undo (`"$M" rollback`). Never start a second plan: a re-run is `run`, which no-ops once done. A `rollback` refused with exit 8 says on stderr whether its fence stands and, if so, the way out (`rollback` again or `rollback --end-fence`): show it and ask which.

**Report.** Close with the receipt and the commit split, in this order: the repairs, only when one was applied; the originals and the record pairs; the rewritten records; the manifest. Then repeat the sentence: every installation that writes this workbench must be on 13.0.0 or later before it writes again, and nothing detects a checkout that does not update, so other checkouts update their installation first, then pull. `"$M" rollback` undoes the migration and `"$M" status` says where it stands.

## Guardrails

- **Never migrate without an explicit user choice.** The survey is read-only; nothing moves before Step 3's answer, and Step 7 changes nothing before its yes.
- **Never overwrite.** A destination that exists means the source stays and the collision is reported. Move only; never copy, never delete.
- **Never touch the root-anchored surfaces.** `orchestrator-events.jsonl`, `.guard-state/`, `.commit-lock/`, `.session-marker`, `.checkout-id`, `.cadence-anchors`, `.check-stamps`, `.asset-provenance`, `monitor`, `stilwerk/`, `.fusion-setup` stay where they are; their consumers read them at fixed root-relative paths and none has a fallback (`rules/fusion-workbench-conventions.md` `## fusion-workbench Layout`).
- **Never rename inside `archive/`, `stashes/`, `.migration-v2-backup/` or `shared/backlog/`.** Frozen content keeps the names it was frozen with.
- **Never open a record in the rename pass.** It renames directories; no line inside any file is read for its state or rewritten, terminal or live (`rules/fusion-workbench-conventions.md` `## Terminal states are history`). Step 7 edits a record only through a repair the user said yes to.
- **Never touch git beyond `git mv`.** No `git add`, no `git commit`. The user decides when to commit the migration.
