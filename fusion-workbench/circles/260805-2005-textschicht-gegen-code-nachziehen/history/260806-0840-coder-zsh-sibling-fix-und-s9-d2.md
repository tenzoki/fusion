# Coder — Turn 2: zsh sibling fix + S9 (realise D2)

**Date:** 2026-08-06
**Agent:** coder
**Plan:** 260805-2353_*_plan-textschicht-gegen-code.md (step 9 + review finding 260806-0709_*_unquoted-scan-iteration-in-drei-schwester-skills-zsh.md)
**Status:** Complete

## Task A — unquoted `$SCAN_*` iteration in three sibling skills (zsh)

Applied the archive fix's construct (`for d in $(printf '%s\n' "$SCAN_*")`, with the same explanatory comment) at:

- `skills/cleanup/SKILL.md` Step 1.2 (`$SCAN_PLANS`)
- `skills/cadence/SKILL.md` Step 3 (`$SCAN_HISTORY`)
- `skills/circle-stash/SKILL.md` 7.3 (`$SCAN_HISTORY`)

Verified each snippet standalone under `zsh -c` and `bash -c` with a two-path SCAN value: both stores enumerated in both shells at all three sites. Issue `260806-0709_*_unquoted-scan-iteration-in-drei-schwester-skills-zsh` closed (`_o_`→`_c_`, Resolved footer).

## Task B — S9, realise decision D2 (option b + lock sub-option i)

- `rules/fusion-workbench-conventions.md` — the `.active-circle` sentence now enumerates the closed writer set: orchestrator (activation write, Phase-4 delete), `/fusion:next` (user-confirmed interactive activation), and `circle-stash`/`circle-pop`/`migrate`/`cleanup` as named lifecycle exceptions with one clause each. Writer set verified by grep over the tree; matches one-to-one.
- `agents/shaper.md` — portfolio-activation mode rewritten as directly user-invokable only; the unreachable-dispatcher claim (playmaker / `/fusion:next`) removed. Verified: `skills/next/SKILL.md` performs the rename+pointer write itself and its `allowed-tools` permits only `Agent(fusion:playmaker)`; playmaker never dispatches agents.
- `skills/commit/SKILL.md`, `skills/cleanup/SKILL.md` — stage+commit wrapped in `"$FUSION_PLUGIN_ROOT/bin/fusion-commit-lock" with <skillname> --` (tags `commit`, `cleanup`).
- `rules/workbench-stash-and-lock.md` — the two skills added to `### Who acquires` and the tag conventions; header audience sentence extended. "Always, when any party is about to commit" is now true.
- `skills/next/SKILL.md`, `agents/orchestrator.md` — no change needed; their current state is the (b) target state.

Decision `260806-0015_*_wem-gehoert-die-circle-aktivierung`: Implemented footer appended, `_a_`→`_i_`. Plan step 9 marked [DONE].

## Golden + suite

Emission golden regenerated per the documented procedure. Diff exactly as intended: `fusion-workbench-conventions.md` 34 671→35 364 (+693, all 16), `workbench-stash-and-lock.md` 9 250→9 683 (+433, orchestrator only). Role totals: core-only 91 571; +design-diagrams 97 244; playmaker 100 873; shaper 106 546; orchestrator 110 556. No role's floor crosses RELEASE_CAP (floors are baseline-summed and unchanged; orchestrator's over-cap floor keeps its existing `overRelease` justification). All growth well inside the 12 000-byte budget. Full suite green: 1559 tests, 27 files (baseline 1559).

Not committed — orchestrator commits per Phase 2 Step 3b.
