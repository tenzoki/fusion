# Step 7b — the configuration files are renamed and the retired ones deleted

**Agent:** ontocoder
**Date:** 2026-08-16 22:17
**Circle:** 260816-1741-guard-becomes-observation-only
**Plan:** `260816-1915_*_the-compliance-guard-becomes-observation-only.md`, step 7b
**Status:** Complete

## What changed

| File | Action |
|---|---|
| `templates/fusion.json` | created |
| `templates/fusion-guard.json` | deleted |
| `fusion.json` (repository root) | created, carrying `{"orchestrator": {"maxTurns": 12}}` |
| `fusion-guard.json` (repository root) | deleted |
| `hooks/config.json` | deleted |
| `hooks/config.example.json` | deleted |

Both plugin-layer files went, because the loader question
(`260816-1915_*_how-much-of-the-configuration-loader-survives-when-its-only-leaf-is-the-turn-budget.md`)
was answered as option 1: two merge layers, the project's file and the in-code `DEFAULTS`,
with nothing between them.

## The notes, and what each one became

The old template carried six underscore-prefixed notes. The new one carries five, and the
set is not a copy.

- `_what` — rewritten as a per-project **fusion** configuration rather than a guard
  configuration, and it now says the file configures exactly one thing. The retirement
  paragraph stays and grew a scope: retirement is a whole *file* as well as a key, which is
  what the loader's `RETIRED_PROJECT_FILES` and `RETIRED_TOP_LEVEL_KEYS` tables now
  distinguish (`hooks/lib/config.ts:324`, `:343`). Its pointer moved from `_override` to the
  new `_retired`.
- `_override` — the per-leaf merge account is kept, because it is still true and still the
  thing people get wrong. Every guard example is replaced by one built on
  `orchestrator.maxTurns`, and the note states that there are two layers now, so a key left
  out falls straight to fusion's built-in default rather than to an install-level file.
- `_turnBudget` — largely as written. Its opening clause ("Not everything this file
  configures is the guard") was false the moment the guard settings left, and is replaced.
  Two internal references were repointed: "the same per-leaf rule as everything above"
  became a reference to `_override`, and "not restated in the plugin's hooks/config.json"
  became "not restated in any shipped JSON file", since that file is gone. The
  `DEFAULTS`-is-the-only-definition-site rule and the invalid-value behaviour are unchanged.
- `_guardEnabled` — deleted with the key. The project layer has no forbidden key any more.
- `_gitTracked` — the argument is kept, since it was never about the guard. Its middle
  sentence dropped the two guard clauses and now names the Turn budget alone. The last two
  sentences stay: the guard used to defend this file and no longer does, and the git diff is
  the only bound left.
- `_retired` (new) — names `fusion-guard.json`, says to copy
  `{"orchestrator": {"maxTurns": <n>}}` across **first** and why (a budget left behind is
  not read and the orchestrator drops to the built-in default in silence), then to delete
  the file, then says to copy nothing else and names the three retired top-level keys
  `guard`, `decisions` and `escalation`. A project can complete the migration from this note
  alone, without having seen the loader's advisory.

## Byte identity, satisfied by construction

`hooks/lib/__tests__/config.test.ts:1436` holds the template and the repository-root copy
byte-identical outside `PROJECT_SET_KEYS`, which is `["orchestrator"]`. The root file was
generated from the template by inserting one line,
`  "orchestrator": { "maxTurns": 12 },`, as the file's second line, which is the shape the
old pair had and the shape `cutTopLevelEntry`'s non-last-entry branch removes whole
(`config.test.ts:1340-1349`). Checked with `sed '2d' fusion.json | cmp - templates/fusion.json`:
identical. The template itself declares no top-level `orchestrator`, so the test's
anti-vacuity assertion (the cut is a no-op on the template) holds; the two notes that spell
`"orchestrator"` inside a JSON string are skipped by `findTopLevelKey`'s string handling.

That test is red at HEAD for other reasons and step 9 repairs it, so it was not used as a
gate here.

## Verification

`./bin/fusion-turn-budget` from the repository root: exit 0, stdout `max_turns=12`, stderr
empty (0 bytes). That single command proves the rename, the survival of this repository's
budget of 12, and the retired-file advisory falling silent.

Two supporting checks, both through `hooks/dist/lib/config.js`:

- a throwaway project root seeded with `templates/fusion.json` alone loads with
  `diagnostics: []` and `maxTurns: 5`, so the shipped template declares inheritance and
  declares nothing;
- this repository's root loads with `diagnostics: []` and `maxTurns: 12`.

`git status --porcelain` shows exactly the six files above. The seventh entry,
`fusion-workbench/orchestrator-events.jsonl`, is the orchestrator's own in-flight event
rows and not an edit of this task.

## Side effects, all owned by later steps

Nothing here is a dangling reference this step may fix; each is named in the plan.

- `bin/fusion-turn-budget`'s header still documents `fusion-guard.json` and the three-layer
  merge over `hooks/config.json`. Filed as
  `260816-2124_*_bin-fusion-turn-budgets-header-documents-the-configuration-file-7a-renames-and-no-step-owns-it.md`,
  step 11.
- `skills/setup/SKILL.md` still seeds the old filename — step 8. `skills/help/SKILL.md:111`
  still points a user at `hooks/config.example.json`, which no longer exists — step 11.
- `hooks/lib/__tests__/config.test.ts`, `guard-project-config-integration.test.ts`,
  `hook-fail-open.test.ts`, `helpers/guard-harness.ts`, `turn-budget-lint.test.ts` and
  `guard-escalation-shape.test.ts` all read one of the four deleted files — step 9.
- `CLAUDE.md`, `README.md`, `README-hooks.md`, `README-agents.md`,
  `agents/orchestrator.md` and `docs/upgrading-to-v9.md` describe the old file — steps 11
  and 16.
- `hooks/dist/` still carries the previous build's `.d.ts` comments naming the old file.
  No TypeScript was touched here, so no rebuild was owed by this step.
