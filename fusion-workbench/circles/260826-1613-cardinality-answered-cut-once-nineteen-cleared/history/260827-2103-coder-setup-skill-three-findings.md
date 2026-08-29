# Coder — Turn 2, three review findings in skills/setup/SKILL.md

**Status:** Complete
**Filed by:** coder, Kai Stalmann <ks@qantr.com>

## Changed
- `skills/setup/SKILL.md` 46525 -> 46881 bytes (+356; cap +400). Step 0j: dedupe via `grep -qxF`, re-check after append, honest "still excluded by a nested ignore file, <file>:<line>:<pattern>" report. Step 0i: one bullet named by its lead phrase. Step 2: `[ -x ]` guard on `fusion-plugin-cwd`.
- Three records `260827-2042_p_` -> `_c_` with Resolved notes; C4 record `260826-1113_*_the-setup-skill-calls-the-id-fragment-the-pair-in-the-commit-that-removed-that-word-elsewhere.md` +1 dated Revised line.

## Measured
- Scratch repo (nested `fusion-workbench/.gitignore`): two runs, one negation line, both report not repaired. Root-only exclusion: run 1 repairs, run 2 silent.
- Reference gate by single-file revert: +1 path, 0 anchors (tree read 1507 -> 1508 against BASELINE 1506; the pre-existing +1 is not this file's). Goldens and BASELINE untouched.
- `legacy-halt-clearing.test.ts` phrases intact.

## Verification
`cd hooks && npx vitest run lib/__tests__/legacy-halt-clearing.test.ts lib/__tests__/turn-budget-lint.test.ts lib/__tests__/path-literal-lint.test.ts lib/__tests__/workbench-citation-lint.test.ts` — exit 1. The one failure is `path-literal-lint` on `agents/orchestrator.md:885`, an uncommitted edit in the working tree by another task (decision citation written as a `decisions/…` literal); the 53 other tests pass, all three of my files' gates among them.
