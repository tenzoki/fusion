The upgrade guide's leftover procedure has no branch for a leftover with no copy under the new name
---
`docs/upgrading-to-v13.md` "If an old store name will not empty" assumes every file left under `circles/`, a `planning/` or a `consult/` collided with a copy under the new name. The rename pass also leaves files behind that have no such copy: an untracked entry under "Tracked entries only", a move that failed with an `ERROR` line, and an interrupted pass. For those, `cmp` has nothing to compare against and `mv` over the new copy has no target, which fails when its parent directory is missing. The procedure loses nothing; it stalls at `cmp`, or at `rmdir` on a directory that is not empty.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Review domain:** code
**Severity:** Low
**Cross-references:** `261009-2236-reviewer-leftover-procedure-release-candidate-468d8e87.md`, `261009-2223-the-upgrade-guides-circles-workaround-names-only-a-top-level-ds-store-and-only-circles.md`, `261009-2148-the-rename-pass-cannot-drain-a-circles-store-whose-only-entry-is-a-colliding-ds-store-and-the-json-run-refuses-on-it.md`

**Evidence at `468d8e87`.**

- `docs/upgrading-to-v13.md` `## Migrating your workbench`: "The store rename never overwrites, so a file that already exists under the new name stays under the old one … Compare any other leftover with its copy under the new name … using `cmp`. If they are identical, or the new copy is the one to keep, delete the old one. If the old copy is the one to keep, move it over the new one with `mv`."
- `skills/migrate/SKILL.md` `## Step 4 — Apply`, `fold_store`: with `TRACKED_ONLY=1` in git mode, an untracked entry prints `LEFT: $e is untracked and stays.` and is not moved, so it has no copy under the new name. An untracked package directory `circles/pkgB/` stays whole, and `work-packages/pkgB/` does not exist.
- The same block: a failed `mv` prints `ERROR: $1 -> $2 failed.` and leaves the source. The text under the block says an interrupted run "leaves some entries under the destination and the rest under the source".
- In each case `circles/` (or the `planning/`) stays, and `bin/fusion-migrate run` refuses with exit 5 through `preconditions` and `legacyNames` (`hooks/migrate.ts`), so the user reaches this paragraph.

**Acceptance.** The paragraph says what to do with a leftover that has no copy under the new name: it is not a collision; run `/fusion:migrate` again, answering "Convert" if "Tracked entries only" left it. The `cmp`/`mv` branch applies only when the copy exists. Or the paragraph is removed when the cross-referenced rename-pass defect is fixed. `npm test` in `hooks/` exit 0.
