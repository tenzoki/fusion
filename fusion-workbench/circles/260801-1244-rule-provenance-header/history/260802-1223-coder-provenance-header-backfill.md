# Coder session — Step 1, provenance-header backfill

**Date:** 2026-08-02 12:23
**Agent:** coder
**Status:** Complete
**Circle:** `260801-1244-rule-provenance-header`
**Plan:** `260802-1131_*_plan-rule-provenance-header.md` — Step 1, now `[DONE]`
**HEAD at start:** `e8988d9`

## What was implemented

Step 1 of the plan only: a `**Provenance:**` line inserted at line 3 of each of the ten
files in the plugin's `rules/` directory, directly under the H1 with a blank line either
side. The ten citation strings were taken verbatim from the plan's backfill table and were
not re-derived. Steps 2 to 4 (the conventions section, the lint gate, the acceptance sweep)
were not touched.

Method was ten separate `Edit` calls, each anchored on its file's first three lines, as the
plan requires. No script, no `sed` loop.

## Files changed

| File | Citation inserted at line 3 |
|---|---|
| `rules/agent-setup.md` | `260718-1924-v5x-overhaul` |
| `rules/context-lean-claude-md.md` | `260718-1924-v5x-overhaul` |
| `rules/context-manifest.md` | `260718-1924-v5x-overhaul` |
| `rules/protected-path-discipline.md` | `260801-1244-guard-bash-inspection` |
| `rules/critical-stance.md` | admission, `git:dac82b8` |
| `rules/decision-record-examples.md` | admission, `git:b05b423` |
| `rules/design-diagrams.md` | admission, `git:bd5f6e6` |
| `rules/fusion-workbench-conventions.md` | admission, `git:b05b423` |
| `rules/git-branch-discipline.md` | admission, `git:4950ffa` |
| `rules/user-facing-output.md` | admission, `git:c18a946` |

The two files whose lede is a blockquote (`context-manifest.md`, `context-lean-claude-md.md`)
took the header *above* the blockquote, per the plan's uniform line-3 placement.

## Verification

1. **Baseline captured before editing.** `FUSION_PLUGIN_ROOT=$PWD bin/fusion-rules planner`
   and `... coder` written to `/tmp/fr-planner-before.txt` (md5 `7fadc020…`) and
   `/tmp/fr-coder-before.txt` (md5 `ca06ec55…`). The override matters: the SessionStart hook
   exports `FUSION_PLUGIN_ROOT=/Users/k1/.fusion`, the installed copy.
2. **Header present at line 3 in all ten files, no `MISSING`.** The plan's `head -10 | grep -nE`
   loop reported `3:` for every file. A second check compared each line 3 against the expected
   string byte for byte, asserted lines 2 and 4 are blank, and ran the spec's gate regex
   `/^ {0,3}(?:> ?)?(?:\*\*)?Provenance:(?:\*\*)?(?=\s|$)/` over it: all ten exact.
3. **Pure insertions.** `git diff --numstat rules/` shows ten rows, each `2  0`.
4. **`bin/fusion-rules` emission byte-identical.** Both `diff -u` runs produced no output;
   `git status --porcelain bin/fusion-rules` is empty. Acceptance criterion 7 checked
   empirically, not argued.
5. **`cd hooks && npm test` green:** 16 test files, 753 tests passed, 20.2s. `tsc` ran first
   and left `hooks/dist/` byte-identical (`git status --porcelain hooks/` is empty).

The two section-scoped `Binding decision:` lines in `rules/fusion-workbench-conventions.md`
were not touched and now sit at `:328` and `:656`, exactly as the plan predicted.

Working tree outside `fusion-workbench/`: exactly the ten modified rule files, nothing else.

## One environment note

`hooks/node_modules` was absent at session start, so the first `npm test` failed with
`sh: tsc: command not found`. This predates the change and is unrelated to it. `npm install`
in `hooks/` fixed it; both `node_modules/` and `package-lock.json` are gitignored
(`.gitignore:5-7`), so no tracked file was affected and the scope stayed at ten paths.

## Not done

No commit. The orchestrator commits after verifying the work.
