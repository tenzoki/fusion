# Coder — plan step 5: README.md configuration section and tuning table

**Status:** Complete
**Date:** 2026-08-13
**Agent:** coder
**Circle:** circles/260813-0910-documentation-matches-shipped-plugin
**Plan:** `circles/260813-0910-documentation-matches-shipped-plugin/planning/260813-1820_p_documentation-matches-shipped-plugin.md`, step 5
**Files changed:** `README.md` (only)

## What the step asked

Correct the configuration bullet at `README.md:100`, which claimed the plugin's
`hooks/config.json` "defines the defaults: decision-to-path mappings and sensitivity
levels", point the reader at the file a project actually edits, and close two gaps in the
tuning table: `orchestrator.maxTurns` and the retired-key advisory for
`guard.protectedPaths`.

## Both sides, read

The method constraint binds this step: a documentation defect is confirmed by reading the
documentation line and the artifact it describes. Each correction below names both.

**(1) The plugin file defines no mappings and no sensitivities.** Documentation side:
`README.md:100` (before the edit). Artifact side: `hooks/config.json:8` `"categoryPaths": {}`,
`:10` `"categorySensitivity": {}`, `:13` `"decisions": []`. The file ships only
`guard.enabled`, `guard.defaultSensitivity`, `escalation.blocksBeforeHalt` and the two
`churn.*` thresholds as values. The claim was false as written.

**(2) Three layers, not two — confirmed against the loader, not carried forward from the
plan.** The plan states three layers; this step verified it independently.
`hooks/lib/config.ts:4-8` names the order in the module docstring (project
`fusion-guard.json`, plugin `hooks/config.json`, in-code `DEFAULTS`), `:15-20` states the
per-leaf merge rule, `:257` opens the `DEFAULTS` object, and the merge is executed at
`:683` (`project.raw.guard?.[key] ?? plugin.raw.guard?.[key] ?? DEFAULTS.guard[key]`) with
the same shape for `escalation` at `:690`, `churn` at `:695` and `orchestrator` at
`:697-702`. **The loader does not disagree with the plan.** The old bullet described two
layers with the plugin file as the source of defaults; both halves are now corrected.

**(3) `templates/fusion-guard.json` is the file a project edits.** Artifact side:
`templates/fusion-guard.json:2` `_what`, `:4` `_override`, `:6` `_turnBudget`, `:8`
`_guardEnabled`, `:10` `_gitTracked` — the seeded template documents every settable key in
its own notes, including the Turn budget and the retired key.
`hooks/config.example.json` documents neither (read in full: 72 lines, no `orchestrator`
key, no `protectedPaths`), so the bullet now cites it for what it does show — filled-in
`categoryPaths` and `decisions` — and sends the reader to the template for the rest.

**(4) `orchestrator.maxTurns` was absent from `README.md`.** Confirmed by
`grep -n maxTurns README.md` returning nothing before the edit. Artifact side:
`hooks/lib/config.ts:276-277` (`DEFAULTS.orchestrator.maxTurns`), the docstring at `:44-63`
("not a guard setting and no hook reads it", read once per Setup by
`bin/fusion-turn-budget`), and the validator at `hooks/lib/config.ts:490-494`
(`isPositiveInteger`, expected "a whole number of 1 or more"). `grep -n maxTurns
hooks/config.json` returns nothing, which is deliberate per `:58-62` of the docstring.
**The new table row carries no digit.** The default is defined in one place and a copy of
it in `README.md` would decay silently — the same treatment step 4 applied to the pipeline
diagram in `README-agents.md`.

**(5) The retired-key advisory is cited, not restated.** Authoring home:
`README-hooks.md:268`, the paragraph "One key is retired, and saying so is louder than
dropping it". Artifact side: `hooks/lib/config.ts:518-521`, `RETIRED_CONTAINER_LEAVES`
carrying `guard.protectedPaths`. The new row states the user action (delete the line),
what continues while the line is there, and links to `README-hooks.md`'s
per-project-configuration section for the account.

## One correction the step did not ask for, and why it was required

The tuning table's intro at `README.md:104` said the rows are "assembled from the fields
already in `hooks/config.json`". That sentence had to change, because the
`orchestrator.maxTurns` row the step mandates names a key that is deliberately **not** in
that file. The intro now says the rows come from keys the three layers carry and that a
project declares them in its own `fusion-guard.json`.

That rewrite in turn made the "Off entirely" row misleading: it read
`guard.enabled: false` bare, and `guard.enabled` is the one key a project's
`fusion-guard.json` may not set (`hooks/lib/config.ts:707`,
`enabled: plugin.raw.guard?.enabled ?? DEFAULTS.guard.enabled`; docstring `:65-79`;
`README-hooks.md:270`). The row now names the plugin layer and the advisory, matching what
`README-hooks.md:233` already said. Both edits are consequences of the mandated additions,
not scope drift.

## Verification

`cd hooks && npx vitest run` — exit 0. 49 test files, 1022 tests, all passed. The
reference-resolution citation lint in that suite scans `README.md` and resolves the four
plugin-file citations the edits introduce (`templates/fusion-guard.json`,
`hooks/lib/config.ts`, `hooks/config.json`, `README-hooks.md`).

## Not committed

Left uncommitted for the orchestrator, per the plan's commit ownership.
