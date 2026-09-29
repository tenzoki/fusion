# In which order do the parts of FJ03 and FJ04 land while fusion's own workbench is still in the v12 form?

---
**Domain:** code
**Filed by:** implementation-planner, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260928-1338-json-control-data-and-markdown-artefacts.md, 260929-1810_*_plan-fj03a-the-record-client-the-format-gate-and-scope-and-order-on-json.md, 260929-1417_*_plan-fj02b-plan-progress-and-evidence-creation-through-the-kernel.md, 260929-1810_*_where-do-the-claude-side-consumers-of-the-codec-live-and-how-do-they-reach-it.md

---

## Question

Section 9 of the specification (Prior `e3bc25b`, `concept/fusion-json-workbench-spec.md`) orders FJ03, the cutover of every fusion consumer, before FJ04, the migration, and asks of FJ03 that the old control parsers survive only in import and archive. Section 7 is too large for one plan a reader can approve, so FJ03 is cut into the parts FJ03a to FJ03d (the plan cited above says what each carries). The order of those parts is not free, because this repository is its own first consumer. Measured at fusion `b4c8f7ca`:

- The install at `$FUSION_PLUGIN_ROOT` is 12.0.1 and carries neither `codec/` nor `bin/fusion-record`. Sessions in this repository run the install's agents, skills, hooks and `bin/` helpers, and read `rules/*.md` from the work tree (`bin/fusion-plugin-cwd`, its consumers `bin/fusion-rules`, `bin/fusion-paths`, `bin/fusion-source-root`).
- This repository's workbench has no `workbench.json`; `inspect` answers `state: legacy` for it. `ls fusion-workbench/work-packages | wc -l` gives 46 containers.
- These hook tests read this repository's own workbench as their corpus and decide what is live by the filename marker: `plan-stopping-section-lint.test.ts`, `workbench-citation-lint.test.ts`, `reference-resolution-lint.test.ts` and the own-tree case of `citation-sweep.test.ts`.

So FJ03 divides into work that is inert here until the workbench migrates (code tested on fixtures), and work that takes effect here at its commit: a rewritten `rules/fusion-workbench-conventions.md`, which every session in this repository reads at Setup, and the live-record predicates behind those lints. The order must be ruled before FJ03b is planned; FJ03a is first under every option and does not wait for it.

## Options

1. **The specification's order: all of FJ03, then FJ04.** The rule text and the predicates change while this workbench is legacy.
   - Pros: no change to section 9; FJ03 closes as one package.
   - Cons: from the commit that rewrites the rules until the migration of this workbench, every session here follows rules describing a control layer its workbench does not have, and FJ04 is developed in that state; those lints lose their corpus, so they either go vacuous or keep a marker reader in the live path, which section 9 excludes.
2. **Two phases around the migration.** FJ03a to FJ03c (the record client and resolvers, the observers and checkers, the writers, all proven on fixture workbenches), then FJ04 proven on copies, then FJ03d (rules, prompts, the live-record predicates, the lints, the repository-wide classification) landing in one maintenance window together with the migration of this repository's own workbench and an install built from the branch, then FJ05.
   - Pros: no commit leaves this repository's sessions or its suite between two formats; the old parsers leave the live path in the same window in which the last legacy corpus they read is migrated; FJ04's acceptance reads through helpers that exist after FJ03c.
   - Cons: section 9's table changes (FJ03's evidence is complete only after FJ04), which is Prior's text to change, so it needs a numbered request; FJ03 stays open across FJ04.
3. **Migrate this workbench first, by kernel operations driven by hand.** The manifest and the pairs of the live records are created before any consumer changes.
   - Pros: every later part lands on a JSON-controlled workbench.
   - Cons: it is a migration without survey, frozen plan, backup or receipt, which section 8 forbids; the consumers that would read the result do not exist yet.

## Constraints

- Section 8.1: the migration is one maintenance run with quiescent writers; section 4.1: a workbench without a manifest is legacy, and normal mutation of it is refused.
- The install must stay at a v12 release while this workbench is legacy: a build of the branch installed over it halts every agent of this repository at Setup, because the resolvers then refuse a legacy workbench.
- The dispatch-path bound stands at zero head-room and `rules/fusion-workbench-conventions.md` is charged to all eleven paths, so the rule rewrite is one change, not a series of small ones.
- The specification is Prior's; a change to its package table is requested, never edited from here.

## Recommendation

Option 2. The two surfaces that bind this repository's own sessions and suite to a format are exactly the ones a maintenance window exists for, and moving them with the migration of this workbench removes the interval in which rules and data disagree. Everything else in FJ03 can be written and proven on fixtures first, which is also what FJ04's acceptance needs.
