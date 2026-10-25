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
- **`FOUND=0`**: *"This workbench is already in the v12 format."* Ask nothing about renames and go to Step 6.

## Step 3 — Ask before moving

Say `MODE` out loud: with `git`, moves use `git mv`, the migration is one diff of renames and `git revert` retreats; with `plain` (untracked, gitignored, or no repo), moves use `mv`, appear in no diff and cannot be undone with git.

Ask in plain chat text in the project's language (`rules/fusion-workbench-conventions.md` `## Project language`), following `rules/user-facing-output.md` and the chat profile: the survey output first, so the user sees the entries and counts rather than a summary, then the question in one line, numbered options beneath. The user answers with a number or in their own words; then stop and wait. In English:

> This workbench still uses the v11 store names; rename them as listed above (`circles/` to `work-packages/`, each `planning/` to `plans/`, `shared/consult/` to `shared/consultations/`)? Directories move entry by entry with `git mv`, one reviewable diff of renames; no file's content changes, every filename survives, and `archive/`, the Review-class stores, `stilwerk/` and the root files stay.
>
> 1. Convert (recommended): renames as listed.
> 2. Tracked entries only: renames every entry git tracks, leaves the untracked ones, named in the report.
