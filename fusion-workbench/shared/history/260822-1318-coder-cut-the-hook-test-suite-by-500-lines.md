# Cut the hook test suite by 500 lines

**Agent:** coder
**Task source:** `260822-1154_*_plan-c0-cut-only-circle-buys-head-room-on-four-bounded-surfaces.md`, step 2
**Status:** Complete
**HEAD at start:** `aa44a8b`

---

## What the step asked for

Cut at least 500 lines from the hook test surface, applying the rows of
`260822-1226-cut-ledger-for-three-bounded-surfaces.md` and the user's Gate A answer
(option 2 of
`260822-1229_*_where-does-the-reference-resolution-pins-re-approval-attribution-log-live.md`).
No baseline map may move. This step runs first in the Circle because cutting `agents/` or `skills/`
later moves the `BASELINE` pin, and re-approving that pin costs lines on this surface.

## Measurement

Measured the way `hooks/lib/__tests__/surface-growth-bound.test.ts` measures it: newline count over
a recursive walk of `hooks/lib/__tests__/**/*.ts`, floor = `TEST_LINE_BASELINE` summed over the
files present, budget = floor + 2 500.

| | Total | Floor | Budget | Head-room |
|---|---|---|---|---|
| Before (HEAD `aa44a8b`) | 20 363 | 17 875 | 20 375 | **12** |
| After | 19 862 | 17 875 | 20 375 | **513** |

**501 lines removed.** The floor is unchanged because no baseline entry moved and no file entered or
left the walk.

## What was cut, by ledger row

**H6, 417 lines — `reference-resolution-lint.test.ts`.** The chronological log of 26 approvals and
re-approvals of the `BASELINE` count pin stood at lines 493-913. Entries 1 to 25 (418 lines) were
moved verbatim into
`260822-1318-reference-resolution-pin-re-approval-log-entries-1-to-25.md`; the pin's
rationale and the newest re-approval stay in the file, and a six-line block at line 488 names the
record, says the convention is unchanged, and instructs the next roll. The file went 1431 -> 1014
lines. This is option 2 of the answered decision and nothing else; options 3 and 4 were not taken.

**H1, H2, H3 — 20 lines in `surface-growth-bound.test.ts`.** Three header paragraphs restating text
`README-hooks.md` `### Growth bounds on the shipped text` already authors: the four-independent-
budgets rule, the "what no bound covers" list, and the golden-regeneration procedure. Each is now a
citation of its authoring home. The `RELEASE_CAP`/`DRIFT_CEILING` paragraph the ledger folded into
row H2 was **kept**: `README-hooks.md` does not carry it, and both constants are live in
`rules-emission-golden.test.ts`.

**H4, 3 lines — `helpers/guard-harness.ts`.** The paragraph on the write guard's fusion-repository
stand-down, whose subject was removed on 2026-08-16, compressed to a sentence citing `CLAUDE.md`'s
opening section, which authors both the removal and the rule it established.

**H5, 61 lines net — the duplicated walks.** `helpers/citation-scan.ts` gained `shippedPrompts()`
and `agentNames()` (+29 lines including their doc comments), and the private copies went:

- `gatedFiles()` / `promptFiles()` in `marker-format-lint`, `path-literal-lint`, `glob-nomatch-lint`
  and `commit-message-path` — four implementations of "every agent prompt plus each non-exempt skill
  body".
- `agentNames()` in `derivable-enumerations-lint` and `rules-emission-golden`, and the inline copy in
  `context-manifest`.
- `mdFilesUnder()` in `reference-resolution-lint`, now three lines over the exported
  `markdownFilesUnder()` with `rel` re-anchored on the plugin root.
- Fifteen private copies of `const pluginRoot = resolve(dirname(fileURLToPath(import.meta.url)),
  "../../..")`, replaced by the `pluginRoot` that helper has always exported.

## Constraints held

- **No assertion was removed.** Every cut is comment prose or a duplicated file-walk; the four
  refactored gates assert over the same file sets and were run individually to confirm it.
- **No baseline map moved.** `TEST_LINE_BASELINE`, `AGENT_BASELINE`, `SKILL_BASELINE` and
  `RULE_BASELINE` are byte-identical to `HEAD`, verified by extracting each literal from
  `git show HEAD:<path>` and comparing.
- **The arming and absolution text stayed.** `surface-growth-bound.test.ts:63-192` and
  `rules-emission-golden.test.ts`'s `RULE_BASELINE` movement log are untouched. That instrument's
  convention is a different one from the pin log, as the answered decision states.
- **Nothing under `hooks/lib/` outside `__tests__/` was edited**, so no compilation was needed and
  `committed-dist.test.ts` is unaffected.
- The golden was regenerated with `UPDATE_SURFACE_GOLDEN=1`, the diff read (the `agents` and
  `skills` blocks are unchanged; only the `hook-tests` block and its total moved), and the suite
  re-run without the flag.

## Verification

`cd hooks && npm test` — exit 0, 40 files, 718 tests.

## Residual

The relocation moves bytes rather than removing them, and the attribution no longer stands in front
of the person editing `BASELINE`. Both costs were stated at Gate A and accepted; they are recorded
in the answered decision's footer and in the new record's own opening.
