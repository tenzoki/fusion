The upgrade guide's `circles/` workaround names only a top-level `.DS_Store`, and only `circles/`
---
`docs/upgrading-to-v13.md` "If `circles/` will not empty" (added in `5f7398c9`) tells the user to delete `fusion-workbench/circles/.DS_Store` and remove "the then-empty `circles/`". Finder writes a `.DS_Store` into every folder it opens, and the rename pass descends into a container present under both stores, so the collision can sit at `circles/<container>/.DS_Store`. Then `circles/` is not empty after the named delete. The same non-draining also blocks the run on `planning/` and `consult/`, which the paragraph does not name. The advice is safe: it never deletes record content without the user's check. It is incomplete.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Review domain:** code
**Severity:** Low
**Cross-references:** `261009-2223-reviewer-docs-only-release-candidate-5f7398c9.md`, `261009-2148-the-rename-pass-cannot-drain-a-circles-store-whose-only-entry-is-a-colliding-ds-store-and-the-json-run-refuses-on-it.md`

**Evidence.**

- `skills/migrate/SKILL.md` Step 4, `fold_store` descends into a directory present on both sides and `move_one` never overwrites. Run verbatim in a scratch tree, `circles/pkgA/.DS_Store` beside `work-packages/pkgA/.DS_Store`:
  ```
  COLLISION: ./wb/work-packages/pkgA/.DS_Store already exists. ./wb/circles/pkgA/.DS_Store stays where it is.
  NOTE: ./wb/circles/pkgA is not empty and stays.
  NOTE: ./wb/circles is not empty and stays.
  ```
  No `circles/.DS_Store` exists to delete, and `circles/` holds `pkgA/`.
- `hooks/migrate.ts` `legacyNames` refuses on any of `V11_STORE_NAMES` (`hooks/lib/stores.ts`: `circles`, `planning`, `consult`) at the top, under `shared/`, and inside each `work-packages/<dir>/`. A colliding `.DS_Store` in a container's `planning/` gives the same exit 5, under a heading that names `circles/` only.
- The non-`.DS_Store` branch says to delete the leftover "once you have checked that its copy under `work-packages/` is the one to keep" and gives no route when the `circles/` copy is the one to keep. In `MODE=plain`, or for an untracked file, the delete is not recoverable.

**Acceptance.** The paragraph covers a leftover at any depth under any of the three v11 store names (for example: find the files the collision lines named, delete each `.DS_Store`, then remove the emptied directories), says how to compare a non-`.DS_Store` leftover with its copy (`cmp`), and what to do when the old copy is the one to keep. Or the paragraph is removed when the cross-referenced rename-pass defect is fixed.

---
Resolved: `docs/upgrading-to-v13.md` `## Migrating your workbench`, the paragraph now headed "If an old store name will not empty", covers a leftover at any depth under `circles/`, a `planning/` or a `consult/` (the three `V11_STORE_NAMES` of `hooks/lib/stores.ts`, which `legacyNames` in `hooks/migrate.ts` checks at the top, under `shared/` and in each package). It lists the leftovers with `find ... -type f`, deletes each `.DS_Store`, compares any other leftover with its copy under the new name with `cmp`, deletes the old copy when it is identical or the new one is kept, moves the old copy over the new one with `mv` when the old one is kept, then removes the emptied directories innermost first and runs `/fusion:migrate` again. `npm test` in `hooks/` exit 0.
