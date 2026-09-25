# Step 8 — `/fusion:setup` Step 0f seeds `fusion.json`

**Status:** Complete
**Agent:** coder
**Date:** 2026-08-16
**Circle:** 260816-1741-guard-becomes-observation-only
**Plan:** `260816-1915_*_the-compliance-guard-becomes-observation-only.md` step 8
**Gate answer realised:** `260816-1916_*_does-setup-offer-to-move-a-projects-turn-budget-out-of-the-retired-configuration-file.md` option 1

## What changed

One file, one step: `skills/setup/SKILL.md`, Step 0f.

- **Heading.** *Ensure the guard configuration file is present locally* becomes *Ensure the project configuration file is present locally*. Nothing else in the tree cites the heading; `grep` over `agents/`, `skills/`, `hooks/`, `rules/`, `docs/`, `bin/` and the three READMEs found the heading itself as the only occurrence of "Step 0f".
- **Filename.** The probe and the idempotent copy keep their two-command shape and read `./fusion.json`, seeded from `templates/fusion.json`.
- **The guard account is gone.** The opening paragraph now says fusion reads the file and merges it over its own built-in defaults, and that the file is where a project sets how many Turns the orchestrator may run. The plugin's `hooks/config.json` is not named as a merge layer, because it no longer exists (step 7b). The version-control argument survives, restated around what the file still decides.
- **The probe's justification is shortened.** The protected-path history — the guard used to protect this file, so the one-command form was denied on every later Setup run — is cut. What remains is the reason that still holds: reporting `present` beats a silent no-op. The `[ -f ]` guard inside the copy keeps its own sentence.
- **No migration offer, and one paragraph saying so.** The step states that it does nothing about a leftover `fusion-guard.json`, that naming it is the configuration loader's job (file, key, destination, once per guarded call until deleted), and instructs the reader not to read the old file or offer to move anything out of it. The wording says the loader *names* the key rather than reading it out of the file, which is what `hooks/lib/config.ts` `RETIRED_PROJECT_FILES` actually does — the file is probed with `existsSync` and never parsed.
- **The closing cost sentence is corrected.** It claimed an absent file costs the project nothing, because the guard falls back to the plugin's configuration. Both halves were false after step 7b. It now names the single cost: the orchestrator runs on fusion's own Turn budget rather than a number the project chose.
- **The `absent` message** changed from "inherits the plugin's guard defaults until you edit it" to "inherits fusion's own Turn budget until you edit it".

## Verification

`cd hooks && npm test` — exit 1, before and after, and the delta is empty.

| | files | cases |
|---|---|---|
| before | 14 failed / 25 passed | 116 failed / 608 passed |
| after | 14 failed / 25 passed | 116 failed / 608 passed |

The failing file set is byte-identical before and after: `clear-halt-concurrent-halt`, `config`, `derivable-enumerations-lint`, `escalation`, `guard-bash-integration`, `guard-escalation-shape`, `guard-halt-event`, `guard-project-config-integration`, `hook-fail-open`, `legacy-halt-clearing`, `paths`, `reference-resolution-lint`, `surface-growth-bound`, `turn-budget-lint`. No file was added and none dropped.

**Note on the entering red set.** The dispatch named it as 13 files / 117 cases; measured at this working tree before any edit it was **14 files / 116 cases**. The discrepancy predates this change and was not investigated here.

`turn-budget-lint.test.ts` did **not** move: 2 failed / 13 passed both before and after. Both failures are `ENOENT` on files step 7b deleted, `hooks/config.json` and `templates/fusion-guard.json`, in the "default is defined once" group. Every case that reads `skills/setup/SKILL.md` passes — no budget literal entered the prose, the `bin/fusion-turn-budget` mention and the `agents/orchestrator.md` Setup Step 2 citation are in Step 2 and were not touched.

No test asserts a skill body's run-time behaviour, which the plan states plainly; the gate for this step is the delta above and nothing more.

## Not touched

Step 3's legacy-halt offer (step 1, landed `05d848b`), every other step of the skill body, every test file, `bin/fusion-turn-budget` (its header is issue `260816-2124_*_bin-fusion-turn-budgets-header-documents-the-configuration-file-7a-renames-and-no-step-owns-it.md`, step 11), and the gate decision record's marker — step 13 owns the `_a_`→`_i_` transition and it needs a commit hash this task does not produce.

Nothing was committed.
