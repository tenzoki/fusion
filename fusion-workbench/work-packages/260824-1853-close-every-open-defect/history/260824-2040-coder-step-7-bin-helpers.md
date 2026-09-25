# Step 7: bin/ helpers, the session-domain helper, and the baseline re-approval

**Agent:** coder
**Person:** Kai Stalmann <ks@qantr.com>
**Plan:** 260824-1905_*_plan-close-every-open-defect.md, step 7
**Status:** Complete

## What was done

- `bin/monitor`: `review_coverage` and `staging_drift` join `WARNING_EVENT_TYPES`, each with an 8-row carve-out (`COVERAGE_EVENT_TYPES`, `STAGING_EVENT_TYPES`) and a label (`Review gap`, `Unstaged record`); the `localStorage.getItem` in `renderWarnings()` is guarded; `markPollFailed()` stamps every successful poll and, past three intervals of failure, turns the status bar red and replaces `Updated:` with `Stale: shown as of <time>`; the `_runs_this_script` docstring names `env` as a third residual.
- `bin/fusion-rules`: the voice-profile comment names `rules-voice-profile.test.ts` and its two cases and says why the golden cannot observe the function; "the five producers" and "the other fifteen agents" lose their numerals.
- `bin/fusion-paths`: the empty-pointer stderr shows `<YYMMDD-HHMM>-<slug>` instead of a live Circle name. The record (row 72) stays open for steps 10 and 13.
- `bin/fusion-prose-metric`: the worked exhibit and the hand-count paragraph are stated as of `fac97f4`; the `words` line states the tokeniser.
- `bin/fusion-turn-budget`, `hooks/turn-budget.ts`: every-diagnostic wording, the retired file named as the class that is not a drop; `hooks/dist/` rebuilt.
- `bin/fusion-identity`: the person half splits on `command -v git`; no git on PATH prints its own sentence and exits 1, stated in the header. Probed from inside this work tree with a PATH shim holding no git: exit 1.
- New `bin/fusion-session-domain` (+ `.gitignore` line), probed: in this repo `domain=code source=agentstate`; no workbench exit 3; missing file, missing key and a bad value each print the default with a stderr reason; usage exit 2.
- `hooks/lib/__tests__/reference-resolution-lint.test.ts`: BASELINE re-approved twice, step 8's 1318 -> 1325 and this step's 1325 -> 1336 / anchors 188 -> 190, measured over a tree holding step 11's uncommitted `agents/` edits. Surface golden regenerated; hook-test head-room 12 -> 10 lines.
- Eleven records closed (rows 20, 35, 60, 91, 99, 101, 108, 159, 179, 185, 214). Plan step 7 marked [DONE].

## Verification

`cd hooks && npm test` exit 1: 3 failed files of 42, 746 of 749 tests pass. None of the three is a fault in this step's edits:
1. `committed-dist.test.ts` "git ls-files bin/ equals the directory listing": `bin/fusion-session-domain` is untracked until the orchestrator stages it (this step may not run `git add`). `git check-ignore` confirms the `.gitignore` line admits it.
2. `derivable-enumerations-lint.test.ts`: the new helper has no `CLAUDE.md` Layout row and this step may not edit `CLAUDE.md`. Filed with the row text: `260824-2040_*_the-new-session-domain-helper-has-no-claude-md-layout-row-and-the-enumeration-lint-is-red-until-it-gets-one.md`.
3. `path-literal-lint.test.ts`: two `decisions/…` literals at `agents/orchestrator.md:33`, step 12's file, not touched here.

The workbench citation lint is green.
