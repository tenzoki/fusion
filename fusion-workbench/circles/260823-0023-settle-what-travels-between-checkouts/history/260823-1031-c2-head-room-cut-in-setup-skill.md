# C2 head-room cut in the Setup skill body

**Status:** Complete
**Agent:** coder
**Task:** Free head-room on the `skills/` growth surface so C2 step 6 has room, by cutting prose from `skills/setup/SKILL.md` that does not tell the executing model what to do.

## Why

Step 5 of the C2 plan left the `skills/` surface with 33 bytes of head-room
(golden total 240 406 against budget 240 439). Step 6 cannot be written in 33
bytes. The user authorised a cut at a gate and declined the re-baseline option,
so no growth-bound baseline moved here; the open decision
`260822-1154_*_does-a-cut-only-circle-re-baseline-the-surfaces-it-cuts.md`
stays open.

## What was cut

Eleven passages in `skills/setup/SKILL.md`, 3 344 bytes in total. Each is
explanation, defect history, measurement provenance, or a restatement of text
whose authoring home the body already cites. No instruction, condition, branch,
bound, literal string, path, or exit-code reading was touched.

| # | Where | Bytes | What went, and why its absence changes nothing |
|---|---|---|---|
| 1 | Pre-v4 layout check, ordering rationale | 520 | The blow-by-blow of defect `260717-0115_*_live-workbench-split-across-two-layouts-during-conversion.md`, compressed to one clause. The order it argues for is stated as an instruction two paragraphs up and enforced by the `OLD=1` branch. |
| 2 | Bracket-marker probe, measurement provenance | 128 | "hit twice, 1146 matches" and where they sat. The cost the conventions file cites this passage for (permanent refusal, migration with nothing to do) is kept verbatim. |
| 3 | Bracket-marker probe, superseded design | 199 | The obituary of the `-not -path` whole-tree walk. The bound that replaced it ("do not widen it") opens the same paragraph. |
| 4 | "All three probes are bounded" walkthrough | 575 | Per-probe accounts of how each achieves its bound, describing the code block directly beneath. The bound and its prohibition on path exceptions are kept. |
| 5 | Source-root header, "four sites" recap | 262 | A count of where the `[ -x ]` guard recurs. Each of those sites carries the guard inline, and the paragraph above already says every shell call re-resolves. |
| 6 | Step 0b, why `monitor` is never offered | 206 | Explains an outcome the Step 0e loop produces by construction: that loop enumerates the four profiles and nothing else. |
| 7 | Step 0d, stamp decidability | 336 | A restatement of `rules/fusion-workbench-conventions.md` `## fusion-workbench Layout`, replaced by a citation of it. The record's shape and the "only what this run copied" rule are kept. |
| 8 | Step 0e, source-root exception | 428 | A restatement of the "One named exception" paragraph at the head of the file, which states the same exception and the same unanswered part (c). |
| 9 | Step 0e, case-overlap justification | 119 | Why precedence matters. The precedence itself is the branch order in the code block above and is stated in the same sentence. |
| 10 | Step 0f, why two commands | 149 | Why a probe precedes the copy. Both commands and both outcomes stay. |
| 11 | Step 0g, permission measurement | 422 | The Claude Code 2.1.226 measurement. Its operative consequence, "Bare tool names only — no scoped path form may be written here under any wording", is kept where the JSON is written. |

Nothing was moved into `rules/workbench-tracking.md`. Ten cuts are spent
history or restatements of a live authoring home; the eleventh (the permission
measurement) is recorded in this repository's `CLAUDE.md` and in decision
`260815-0029_*_what-permission-grant-does-setup-seed-when-unlock-becomes-a-setup-step.md`.
That rule file's own scope is what a tracked workbench tracks, and none of this
belongs under it.

## Gate-forced updates

- `hooks/lib/__tests__/fixtures/surface-growth.golden` regenerated with
  `UPDATE_SURFACE_GOLDEN=1`. `setup/SKILL.md` 50 147 -> 46 803, `skills` total
  240 406 -> 237 062. No baseline moved.
- `hooks/lib/__tests__/reference-resolution-lint.test.ts` `BASELINE` re-approved:
  anchors 178 -> 179, records 118 -> 117, paths unmoved, with the re-approval
  note above the constant in the established form.

## Result

`skills/` head-room 33 -> 3 377 bytes (budget 240 439, total 237 062).
Hook-test head-room 249 lines after the seven-line re-approval note.
`cd hooks && npm test` — exit 0, 724 tests passed.
