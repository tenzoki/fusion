# Skill shell scripts assume bash glob semantics — abort under zsh on no-match globs

---
**Status:** open
**Filed by:** orchestrator (observed during live /fusion:migrate + /fusion:setup run, 260717)
---

## Symptom

The inline shell blocks in `/fusion:migrate` (and the same pattern in `/fusion:setup`)
abort partway through when the user's tool shell is **zsh**. Two concrete aborts observed
in one session:

1. **`/fusion:migrate` Step 4 (execute):** aborted at the first type folder with
   `(eval):2: no matches found: ./fusion-workbench/planning/.[!.]*`. The migration had
   moved nothing from the type folders yet; only the `mkdir -p shared/planning` had run,
   leaving a half-state (empty `shared/planning/` beside a full root `planning/`).
2. **`/fusion:setup` Step 0 (pre-v4 check):** aborted with
   `(eval):2: no matches found: ./fusion-workbench/circles/*.md` when `circles/` had no
   `.md` directly in it (Circles are directories now, records live one level down).

## Root cause

The scripts are written for **bash** glob semantics but run in whatever shell the Bash
tool invokes — which on this machine (and any macOS default) is **zsh**.

- **bash:** an unmatched glob expands to the *literal pattern string*; the guard
  `[ -e "$f" ] || continue` then skips it. This is exactly what the loops rely on:
  `for f in "$dir"/* "$dir"/.[!.]*; do [ -e "$f" ] || continue; …`.
- **zsh:** an unmatched glob is a *fatal error* (`nomatch` option, on by default) — zsh
  prints "no matches found" and aborts the whole `eval` before the loop body runs even
  once. The `[ -e "$f" ]` guard never gets a chance to fire.

The dotglob pattern `.[!.]*` is the most frequent trigger because most directories have
no dotfiles, so it matches nothing on almost every iteration.

## Impact

- **Migration is the dangerous case.** An abort mid-migration leaves the workbench split
  across two layouts — precisely the failure `260717-0115[o]` documents and the whole
  refuse-then-migrate design exists to prevent. Here the collision-safe / idempotent design
  saved it (re-running under bash completed cleanly, 0 losses), but only because a human
  noticed the abort and re-ran correctly. An unattended orchestrator following the skill
  verbatim would have stopped with a half-migrated tree.
- **Setup's pre-v4 check gives a false negative.** The abort happens *after* the type-folder
  loop set `OLD=1`… except in the observed case the check ran from the wrong cwd and returned
  a clean `OLD=0` for a different reason. The general risk stands: any no-match glob in the
  detection block can abort it, and an aborted detection is not the same as "OLD=0".

## Fix options (pick one; not yet decided)

1. **Wrap every skill shell block in `bash -c '…'`** (or `bash <<'EOF'`). Explicit, portable,
   makes the bash dependency visible. Cost: touches every glob-bearing block in
   `skills/*/SKILL.md`, and the quoting inside `bash -c '…'` needs care.
2. **Guard globs against no-match in a zsh-safe way** — e.g. `setopt NULL_GLOB` won't help
   because we don't control the invoking shell's options portably; a POSIX-safe idiom is to
   avoid the dotglob loop and use `find "$dir" -mindepth 1 -maxdepth 1` instead of
   `"$dir"/* "$dir"/.[!.]*`. This removes the failure class at the source and is shell-agnostic.
3. **Document a hard requirement** that the skills run under bash and have the harness invoke
   bash. Weakest option — relies on environment we don't control.

Recommendation leans to **option 2** (replace `for f in dir/* dir/.[!.]*` with a `find`-driven
loop) because it is shell-agnostic and removes the class rather than shell-switching around it,
consistent with `HYG-FIX-DESIGN` (fix the design, not the symptom). Option 1 is the smaller diff
if a quick fix is wanted first.

## Affected files

- `skills/migrate/SKILL.md` — Step 2 survey, Step 4 execute (multiple `dir/* dir/.[!.]*` loops,
  `circles/*.md` loops)
- `skills/setup/SKILL.md` — Step 0 pre-v4 check (`circles/*.md`), Step 3 Circle-count snapshot
- Likely other skills with the same `for f in …/*` idiom — grep `\.\[!\.\]\*` and bare `*/` globs
  across `skills/*/SKILL.md` and `agents/*.md`.

## Acceptance

- The migrate and setup shell blocks run to completion under zsh with no-match globs present
  (empty type folders, `circles/` with no direct `.md`), producing identical results to bash.
- A note or test guards against re-introducing a raw `dir/.[!.]*` no-match-fatal glob in skill
  bodies.

---
## Resolution (2026-07-17)

Fixed in commit `4d0d32b` (fix(skills,agents): harden shell globs against zsh no-match abort).
All 14 vulnerable sites converted to `find`-driven `while read` loops; counter-mutating loops
use process substitution `< <(find …)`; a new `glob-nomatch-lint.test.ts` gate guards against
reintroducing raw `.[!.]*`. Verified under zsh 5.9; 196 hooks tests green; plugin validate
passed. Planned in `260717-1918_c_...` (now closed). Site 12 (cleanup) was simplified by the
v5.0.0 marker change — the escaped-bracket case-filter became a plain underscore `find`.
