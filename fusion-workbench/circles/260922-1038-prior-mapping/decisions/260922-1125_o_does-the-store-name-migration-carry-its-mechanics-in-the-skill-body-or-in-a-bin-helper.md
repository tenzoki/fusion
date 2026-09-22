# Does the store-name migration carry its mechanics in the skill body, or in a `bin/` helper that reads the store names from `bin/fusion-stores`?

---
**Domain:** code
**Filed by:** planner, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260922-1038-prior-mapping.md, 260922-1106_*_spec-prior-nomenclature-consumer-migration.md, 260922-1114_*_plan-prior-nomenclature-plugin-source.md, 260922-1114_*_does-the-transition-windows-legacy-read-live-at-one-site-per-runtime.md, 260910-2145_*_does-the-container-store-keep-the-directory-name-circles.md

---

## Question

Spec (2) `## Open for Planner` leaves open whether a `bin/` helper carries the mechanical part of the store-name pass so that `skills/migrate/SKILL.md` carries only the flow. The question binds more than plan (2): the sequel pass that classifies the Review-class stores (spec C6, a later item) is built on the same mechanism, and the closing release `13.0.0` deletes the legacy store names from `hooks/lib/stores.ts` and from `bin/fusion-stores` (plan (1) step 16), while the migration pass is permanent (spec C8: a consumer that skipped every `12.x` release still needs a way in). Whoever builds either will ask why the pass names both sides of the rename literally instead of reading them from the one definition the rest of the plugin reads.

## Options

1. **Skill body, rename pairs literal.** The survey and apply blocks stay fenced bash inside `skills/migrate/SKILL.md`, and the three pairs (`circles`→`work-packages`, `planning`→`plans`, `consult`→`consultations`) are spelled in the body.
   - Pros: the carve-out already exists for exactly this file (`rules/workbench-path-resolution.md` `### The one consumer that names the layout literally`); the pass survives `13.0.0`, which deletes the legacy entries from every definition site but must not delete the migration; the existing test pattern (`hooks/lib/__tests__/helpers/prompt-blocks.ts` `extractBashBlock`, a throwaway workbench, a real `bash`) tests the shipped blocks as shipped; no new helper joins the roster, so no one-release-behind miss branch and no `[ -x ]` guard; the user's ruling on spec C10 measured the freed bytes as the budget the pass runs on, which presumes the pass is on that surface.
   - Cons: the pairs are a fourth copy of three names for the window's duration, unheld by the equality test that holds the other three; the skill surface pays every byte of the mechanics.
2. **A `bin/fusion-store-migrate` helper with `survey` and `apply` subcommands, reading the pairs from `bin/fusion-stores`.**
   - Pros: the pairs live once; the bytes leave the bounded skill surface; a helper is driven directly by a test the way `bin/fusion-claimed-item` is.
   - Cons: `13.0.0` deletes the `LEGACY_*` lines the helper would read, so the permanent pass breaks at the closing release unless the helper keeps its own copy, which is option 1's copy in a different file; a helper naming `circles/` as a source is a second `bin/` site carrying the legacy store, which plan (1) step 5's acceptance (`grep -rn 'circles' bin/*` returns `bin/fusion-stores` and two comment citations) refuses; the helper is absent from the installed copy until `fusion --update`, which the version guard already refuses, so nothing is gained there; a skill body is a prompt and not a shell library (issue `260816-0133`, cited in `hooks/lib/__tests__/path-literal-lint.test.ts`).
3. **Helper with its own literal pairs, independent of `bin/fusion-stores`.** Survives `13.0.0`, but keeps every con of option 2 except the first and adds a copy nobody holds equal to anything.

## Constraints

- The two-skill exemption in `hooks/lib/__tests__/path-literal-lint.test.ts` stays `setup` and `migrate` (spec C1).
- The pass is permanent and must run at `13.0.0` and after, when no definition site names a legacy store (spec C8, plan (1) step 16).
- The skill surface holds its bound without a floor move or a head-room raise (spec C10; `README-hooks.md` `### Growth bounds on the shipped text`).

## Recommendation

Option 1. The closing release is what decides it: a mechanism that reads the legacy names from the definition sites dies on the day those sites drop them, and the pass is the one consumer that must outlive them. The fourth copy is bounded by that same fact: it is not a copy of the live definition but a statement of the transition, which is what the carve-out licenses. Plan (2) proceeds on this option as its default; a ruling for option 2 or 3 stops plan (2) at its step 4 and re-plans the helper with its header, exit codes and test in the shape `bin/fusion-claimed-item` uses.
