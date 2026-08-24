# P-2: thirty defect records closed as moot, unfixable or already fixed; three refused

**Agent:** ontocoder
**Task:** plan step 2 of `circles/260824-1853-close-every-open-defect/planning/260824-1905_*_plan-close-every-open-defect.md` (Triage rows 9, 39, 43, 45, 48, 66, 76, 77, 84, 86, 96, 102, 106, 107, 111, 127, 128, 136, 137, 145, 151, 153, 156, 158, 163, 171, 176, 181, 182, 183, 191, 192, 208)
**Status:** Complete

## What changed

Thirty of the 33 records gained a `---` separator and a `Resolved: <moot | unfixable | fixed> — …` line and were renamed `_o_` to `_c_` with one `mv` each. Every record was read in full before its note was written; every "already true" note quotes the command run at HEAD 260824 and its output.

- moot (21): rows 9, 39, 45, 76, 106, 111, 127, 128, 136, 151, 153, 156, 158, 171, 176, 181, 182, 183, 192, 208.
- unfixable (3): rows 48, 145, 163. The plan's table says `moot` for these; the note uses the ending word the three endings offer for a user action on a host this repository cannot reach, and the reason is the one the table gives.
- fixed (7): rows 43, 77, 84, 86, 96, 137, 191.

## Refused, still `_o_`

- Row 66 (`shared/issues/260816-1330_*_the-repunctuation-replaced-three-em-dashes-with-three-vague-pronoun-openers-the-same-blacklist-bans.md`): assigned `fixed`, and one of the three openers still stands. `grep -n 'Those belong' rules/user-facing-output.md` prints line 19; the other two are gone. The table's verifying grep anchors at line start (`^Those belong`), and the sentence sits mid-line in a bullet, so that command cannot find it.
- Row 102 (`shared/issues/260822-0900_*_the-config-templates-own-worked-example-of-its-only-setting-is-not-valid-json.md`): assigned `fixed`, and the placeholder is gone from both files (`grep -n maxTurns templates/fusion.json fusion.json` shows `12` everywhere). The body's section `## What is not done, and is the reason this record stays open` names a gate that does not exist as its open condition, so the record argues against the ending.
- Row 107 (`shared/issues/260822-1503_*_claude-mds-docs-row-says-fusion-help-points-at-every-upgrade-note-and-the-cap-made-that-false.md`): assigned `fixed`, and `CLAUDE.md:53` still reads "Each is pointed at from `README.md` `## Install` and from `/fusion:help`'s update topic" while `skills/help/SKILL.md:101-107` caps the topic at three releases. Not true at HEAD; it is a `CLAUDE.md` sentence, which is plan step 8's surface.

## Verification

- `cd hooks && npx vitest run lib/__tests__/workbench-citation-lint.test.ts` exit 1 (1 failed, 9 passed). All seven findings are citations in other files that spell the old `_o_` marker of four records this pass renamed (rows 39, 43, 128, 145); the fix line on each is the one-token `_*_` repair. The six files are outside this task's write scope (one is `circles/260801-1244-guard-rules-write/_c_circle.md`, a terminal Circle record), so none was edited. Listed in the report.

## Not done here

- The seven citation repairs above.
- Nothing outside `fusion-workbench/` was touched. `hooks/lib/__tests__/executor-verification-report-lint.test.ts` shows modified in `git status` and is another executor's.
