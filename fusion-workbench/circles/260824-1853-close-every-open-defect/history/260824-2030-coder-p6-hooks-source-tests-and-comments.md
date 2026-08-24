# P-6: `hooks/` source, tests and their comments

**Status:** Complete
**Date:** 2026-08-24
**Agent:** coder
**Plan:** `circles/260824-1853-close-every-open-defect/planning/260824-1905_*_plan-close-every-open-defect.md` step 6
**Records closed:** 20 (triage rows 10, 18, 27, 28, 40, 42, 49, 50, 62, 109, 123, 124, 142, 154, 162, 167, 168, 175, 209, 212), each `_o_` -> `_c_` with a `Resolved: fixed` note naming the verifying command.

## Budget

Hook-test surface (`hooks/lib/__tests__/**.ts`, helpers included): 20 335 lines before, head-room 40. After: 20 363 lines, head-room 12. No baseline map moved; `surface-growth.golden` regenerated. Additions cost about 120 lines; cuts paid about 100.

Cuts, all comment prose that restated history recoverable from git or from a record:
- `monitor-warnings-panel.test.ts`: the bind pin's 14-line comment, the "no wall-clock budget" comment, the browser-launch header.
- `reference-resolution-lint.test.ts`: the three-class header (the `lib/` spelling story, the parser-move story), the exemption paragraph, the `recordsOnly` doc.
- `committed-dist.test.ts`: the "what it does" / "must not write" / "loud" header.
- `deliverable-language-lint.test.ts`, `fusion-identity.test.ts`, `fusion-prose-metric.test.ts`, `path-literal-lint.test.ts`, `helpers/citation-scan.ts`, `config.test.ts` (`PROJECT_SET_KEYS` doc), `fusion-paths.test.ts`: headers condensed.

## Pins that moved

- `reference-resolution-lint.test.ts` `BASELINE`: `records` left the pin (row 62); `anchors` 185 -> 188 with a re-approval comment (row 123, three `$FUSION_SRC/`-rooted anchors in `skills/next/SKILL.md`). Row 209's missing re-approval comment for `3ba7a46` written after the fact from `git show`.
- `README-hooks.md` reach block regenerated from `describeReach()` (row 162): a fifth `covered` entry; `CLAUDE.md` in `excluded` moves `clean` -> `fires` (its agent-roster line names the retired values).

## Negative controls

Every new case was shown failing on its defect in a scratch worktree of HEAD carrying only this step's edits: rows 18 (stderr echo deleted from `bin/monitor`), 27 (untracked `bin/zz-untracked`), 50 (migrate's reformat probe edited), 109 (indented lines excluded; total row relabelled; the multi-line-span case pinned but not mutated), 123 (root strip reverted), 142 (last-entry comma line deleted), 154 (churn entry removed), 162 (retired names dropped from the detector), 212 (hex guard widened). Rows 28 and 124 measured against `9f84254` and `0db1fbb^` prompt texts.

## Verification

`cd hooks && npm test` exits 1 in the main tree, 747 of 749 passing. Both failures come from other executors' parallel work, not from this step:
- `reference-resolution-lint`: `paths` 1325 against the pin 1318; the +7 are plugin-path citations the uncommitted edits to `CLAUDE.md`, `README-agents.md` and `docs/upgrading-to-v9.md` added (step 8). In a HEAD worktree carrying only this step's edits the pin passes at `{ paths: 1318, anchors: 188 }`.
- `workbench-citation-lint`: stale `_o_` citations in live records pointing at records step 2 closed (`34d682c`). Fails at HEAD with HEAD's own parser, so it predates the `...` change in row 40.

`surface-growth-bound.test.ts` and `committed-dist.test.ts` are green in the main tree.
