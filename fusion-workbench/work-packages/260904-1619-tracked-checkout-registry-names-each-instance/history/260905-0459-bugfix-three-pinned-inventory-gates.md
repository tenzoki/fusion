# Bugfix: three pinned-inventory gates left stale by steps 10 and 11

**Date:** 2026-09-05 04:59
**Status:** Complete
**Trigger:** Orchestrator dispatch (validation failure after Circle 260904-1619 steps 10 and 11)
**Filed by:** bugfixer, Kai Stalmann <ks@qantr.com>, checkout 5e8248d7

## Error

Three gates in `hooks/lib/__tests__/` were red against a tree whose source edits are correct:

1. `reference-resolution-lint.test.ts`, `const BASELINE` expected `paths: 1571`, received `1572`;
   `anchors` 218 and `stampBare` 13 unmoved.
2. `rules-emission-golden.test.ts`, the golden held `fusion-workbench-conventions.md 51897` against a
   live 52 629, and every agent block's total with it.
3. `surface-growth-bound.test.ts`, the golden held `hook-tests` `fusion-identity.test.ts 200` and
   `total 20162` against a live 220 and 20 182.

## Root cause

None of the three is a defect in the code or the text. Each is a pinned inventory whose own header
names re-approval or regeneration as the response to a legitimate edit, and steps 10 and 11 made
legitimate edits without performing that step.

- Gate 1: `rules/fusion-workbench-conventions.md:452`, step 11's replaced `**One precondition:**`
  paragraph in `### Who filed it`, which cites `bin/fusion-events presence`. That is one new class-(a)
  plugin-path token where the paragraph it replaced carried none.
- Gate 2: the same file's size, 51 897 -> 52 629 bytes across steps 3 to 11. The file is in the
  always-on emission set, so it appears in all fifteen agent blocks of the golden.
- Gate 3: `hooks/lib/__tests__/fusion-identity.test.ts`, step 10's added cases, 200 -> 220 lines
  (`git diff --numstat`: 20 insertions, 0 deletions; the dispatch's "44 added lines" does not match
  what the tree holds and the golden moved by 20).

## Fix

| File | Change |
|------|--------|
| `hooks/lib/__tests__/reference-resolution-lint.test.ts:483` | `BASELINE.paths` 1571 -> 1572, and a new dated re-approval entry prepended to the trailing comment with ` Previous: ` ahead of the entry that stood first. One line rewritten in place, no line added, nothing dropped. |
| `hooks/lib/__tests__/fixtures/rules-emission.golden` | Regenerated through `UPDATE_RULES_GOLDEN=1`. |
| `hooks/lib/__tests__/fixtures/surface-growth.golden` | Regenerated through `UPDATE_SURFACE_GOLDEN=1`. |

### The shares behind gate 1, measured

`paths` 1571 -> 1572, `anchors` and `stampBare` unmoved. Each figure below is a gate run, not a read
of the diff.

- `bin/fusion-identity` alone reverted to HEAD: 1572/218/13. Contributes 0.
- `rules/fusion-workbench-conventions.md` alone reverted to HEAD: 1571/218/13. Owns the whole +1.
- A single-file revert cannot separate two steps' edits to one file, so the split within it was
  measured on a constructed intermediate: step 11's paragraph alone put back to its HEAD wording,
  everything else of both steps left standing, reads 1571/218/13. Step 10 contributes 0 to this gate
  and step 11 the whole +1, which confirms the implementing agent's note that the gate was green
  after step 10.
- `hooks/lib/__tests__/fusion-identity.test.ts` cannot reach this gate at all: `surface()` in that
  test walks `hooks/lib/*.ts` as files and never descends into `__tests__/`.

The three source files were restored byte-for-byte after each measurement, verified by SHA-256
against copies taken before the first revert.

### Rolling the re-approval chain, and why nothing was rolled

The header prescribes rolling older entries into a `shared/analyses/` log "when these grow long", and
names three such logs. Nothing was rolled and nothing was dropped. The cost that rolling relieves is
LINES, because the growth bound measures this file by the line and that is why the entries were
chained onto one physical line in the first place: the first roll moved 418 lines and the second 92.
The chain today costs three physical lines (483 to 485), and the new entry was chained onto an
existing one, so it costs none. By the measure the mechanism exists for, the chain is not long. Its
entry count is another matter and is stated here rather than acted on: 27 entries across those three
lines before this one, plus eleven older standalone entries at lines 462 to 482. If the entry count
is to be the trigger, that is a decision for the user, not a judgement to make inside a repair.

## Verification

- [x] Original errors resolved: `reference-resolution-lint.test.ts` 38/38,
      `rules-emission-golden.test.ts` 12/12, `surface-growth-bound.test.ts` 12/12.
- [x] Full suite: `cd hooks && npm test` exits 1 with `Test Files 1 failed | 47 passed (48)`,
      `Tests 1 failed | 824 passed (825)`. The single failure is `citation-sweep.test.ts`, red before
      this repair and filed; `monitor-warnings-panel.test.ts` passed on this run.
- [x] No regressions: the four files this repair touched are the two goldens, the pin line, and
      nothing else. `git diff --stat hooks/` shows exactly those, plus step 10's own
      `fusion-identity.test.ts` which was not modified here.

### No baseline moved, and none had to

Confirmed from each golden's own header rather than by inspection of the constants.
`fixtures/surface-growth.golden` header: "Regenerating this file does not move any baseline and
therefore never clears a bound." `rules-emission-golden.test.ts:184`: "Regenerating the golden does
not move `RULE_BASELINE` and therefore never clears the bound." Both regeneration runs also print the
same statement in their deliberate failure message. `git diff` over
`lib/__tests__/rules-emission-golden.test.ts`, `lib/__tests__/surface-growth-bound.test.ts` and
`lib/__tests__/helpers/growth-bound.ts` is empty: no constant in any of the three was touched.

The head-room figures were derived, not carried over from the dispatch. The universal core is the set
`bin/fusion-rules` emits to an agent drawing no conditional rule (`agent-setup.md` 3 963 +
`fusion-workbench-conventions.md` 52 629 + `critical-stance.md` 10 374 = 66 966), and its floor is
`RULE_BASELINE` summed over the same three (3 513 + 52 027 + 9 958 = 65 498). Against a
`GROWTH_BUDGET` of 12 000 that leaves 10 532 free. `hook-tests` reads 20 182 against a
`TEST_LINE_BASELINE` of 17 875 over 39 entries plus a `TEST_LINE_HEAD_ROOM` of 2 500, leaving 193
lines. Both bounds passed on their own assertions in the runs above.

## Unrelated issues found

None filed. Two conditions were met and are the dispatcher's already: `citation-sweep.test.ts` is red
and filed, and its dry-run list has grown to eight files as this Circle wrote records; the dispatch's
"44 added lines" for `fusion-identity.test.ts` does not match the 20 the tree and the golden both
carry, which changed no decision here because the golden was regenerated from live measurement.
