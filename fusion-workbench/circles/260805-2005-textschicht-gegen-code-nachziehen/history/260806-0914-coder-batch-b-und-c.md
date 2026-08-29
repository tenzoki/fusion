# Coder session — Plan steps 11 + 12 (Batch B: CLAUDE.md + READMEs, Batch C: skills, bin headers, templates)

**Date:** 2026-08-06
**Agent:** coder
**Plan:** `260805-2353_*_plan-textschicht-gegen-code.md`, steps 11 and 12 (both marked [DONE])
**Status:** Complete

## What was done

Text-layer corrections, every claim re-verified against the working tree at edit time. Citations follow D1's answered form (`YYMMDD-HHMM_*_<slug>`); stale closed enumerations moved to open-set phrasing (skill lists, docs/, templates/, always-on rule list).

### Batch B (step 11)

- `CLAUDE.md`: skill list + `seed-from-plane` and open-set pointer; `WRAPPER_PROGRAMS` re-attributed to `lib/command-word.ts` (two spots), `fs-locator.ts` named; session-mark check Step 0d→0c (two spots); Circles line now cites `rules/circle-records.md`; dead bus-decisions path replaced by substance; `docs/` row + `plane-setup.md`; `templates/` row now names all three files with their real destinations; two-rule-files symptom line rewritten open-set; monitor-TZ row rewritten (event-list fix landed via `parseUTCTs`, dead issue citation dropped); version surfaces three→four (README.md pin example included).
- `README.md`: pin example `tags/v5.3.0`→`tags/v5.9.2`; setup copy list + `plane.config.yaml` (workbench) and `fusion-guard.json` (project root, git-tracked); guard-configuration bullet now leads with the `fusion-guard.json` leaf-merge mechanism, `config.example.json` demoted to shape documentation.
- `README-agents.md`: root-location relic ("except this README") fixed; inheritance section now states the orchestrator's `tools:` exception; `-n 25`→`-n 200` (default 100); always-on core + `protected-path-discipline.md` with pointer to the `emit_if_exists` block; conditional list + `protected-path-internals.md` (plugin-repo-only), `circle-records.md`, `workbench-stash-and-lock.md`; pattern-table row reworded; skill table + `seed-from-plane`; "auto-loaded by the plugin system"→discovered via `bin/fusion-rules`.
- `README-hooks.md`: effective-hook-configuration block matches shipped `hooks.json` (guarded export + banner hook); "walking out and back by name" removed from the residual list (the guard denies it — measured); files table + `project-relative.ts`, `rules-write-exemption.ts`, `fs-locator.ts`.
- `agents/orchestrator.md` (self-description spots only): Scope invoke list + `conceptrev`, `editor`; invocation table + `editor` and `playmaker` rows; "Bundle B process step 5"→playmaker's real Step 5 name.

### Batch C (step 12)

- `skills/commit/SKILL.md`: `AskUserQuestion` added to `allowed-tools` (frontmatter only; lock passages untouched).
- `skills/cleanup/SKILL.md`: hardcoded model name in Co-Authored-By → model-neutral `Claude` (lock passages untouched).
- `skills/archive/SKILL.md`: citation-check snippet no longer a no-op — builds `$KEEP`, reports kept files.
- `skills/next/SKILL.md`: bracket-era relic sentence replaced with the underscore-literal fact.
- `skills/log-activity/SKILL.md`: BSD/GNU `ls -T` divergence documented (same pattern as the skill's `date` weiche); `.migration-v2-backup/` excluded from the scan; exclusion prose extended.
- `skills/setup/SKILL.md`: the log-activity precedent sentence now states the real relation (superset, `stilwerk/` noted).
- `skills/circle-pop/SKILL.md`: hand-recovery names the schema field `original_circle_dirname` (legacy-filename fallback described).
- `skills/seed-from-plane/SKILL.md`: exit 1 (config) no longer subsumed under "bad story number".
- `skills/help/SKILL.md`: release-flow pointer → public repo URL; states `$FUSION_PLUGIN_ROOT/CLAUDE.md` is deliberately not shipped.
- `bin/fusion-rules`: header comment bracket markers → underscore form.
- `bin/fusion-paths`: "only two places" → the five `DEFINITION_SITES` (lint-enforced); pre-v4 bracket issue citation → real path in wildcard form; agent/skill counts 15/13 → 16/16 (collision-freedom re-verified 2026-08-06).
- `bin/fusion-commit-lock`: release doc states the live-holder condition (dead-holder release succeeds); deps + `sed`, `awk`; dead 260516-0534 record citation replaced by its substance.
- `bin/monitor`: header names itself `monitor` and lists all four served files.
- `templates/plane.config.yaml` (comment lines only): reader list + `map`; `Cancelled` mapping comment no longer claims an issue `_s_` marker.

## Deliberately not done

- `install.sh` LICENSE entry — user decision, plan step 17 keeps it open.
- `rules/context-manifest.md` "stops" nuance — rules files belong to the parallel Batch A agent this Turn.
- No neighbour-Circle issue closed — step 17 does the bookkeeping.

## Verification

- Four lint suites green: `provenance-header-lint` (27), `path-literal-lint` (19), `marker-format-lint` (17), `glob-nomatch-lint` (6).
- My diff touches no `rules/*.md` and not the emission golden (`git diff --name-only` over my file set confirms; the `rules/` + golden entries in the working tree are the parallel agent's Batch A work).
- No commit made (per dispatch).
