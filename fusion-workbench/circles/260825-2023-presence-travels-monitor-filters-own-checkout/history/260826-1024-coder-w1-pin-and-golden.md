# W-1 — the wave's two shared measurement artifacts are folded and regenerated

**Status:** Complete
**Agent:** coder
**Circle:** circles/260825-2023-presence-travels-monitor-filters-own-checkout, Turn 3

Three sibling tasks (R-7, R-10, R-12/R-14) landed disjoint edits to `CLAUDE.md`,
`README-hooks.md`, `agents/orchestrator.md`, `agents/reconciler.md`,
`hooks/lib/__tests__/hooks-wiring.test.ts` and `skills/setup/SKILL.md`, and each left the two
shared measurement artifacts alone by brief. This task holds both, and touched nothing any
sibling touched.

## 1. The reference-resolution pin

`hooks/lib/__tests__/reference-resolution-lint.test.ts:479` reads
`{ paths: 1430, anchors: 196 }`, up from `{ paths: 1424, anchors: 196 }`.

**Measured before writing, not after.** The gate was run first and reported 1430 paths and 196
anchors, agreeing with the three measured shares (1 + 3 + 2 = 6) before anything was written. Had
it disagreed, the number was to be reported rather than papered over.

The shares were re-derived here from the diffs rather than taken on trust:

| Task | Share | Token |
|---|---|---|
| R-10, `skills/setup/SKILL.md:352` | +1 path | `agents/orchestrator.md`, unrooted, citing a numbered Setup step and so no anchor |
| R-12, `agents/reconciler.md:21` | +3 paths | `bin/fusion-events` bare in the `turns` call and rooted at `$FUSION_PLUGIN_ROOT` in its `[ -x ]` guard, plus one `agents/orchestrator.md` |
| R-7, `CLAUDE.md` and `README-hooks.md` | +2 paths | `hooks/session-id.ts` in the Layout row, `${CLAUDE_PLUGIN_ROOT}/hooks/dist/session-id.js` in the wiring snippet |

The line the R-12 edit replaced carried `fusion-workbench/orchestrator-events.jsonl`, a workbench
token in no pinned class, which is why a rewritten clause still only counts additions.

Two findings from the wave are carried in the comment, because a later re-approver cannot recover
either from the number. A `$VAR`-rooted plugin path inside a **JSON** code fence contributes:
`scanPluginPaths` has no fence exemption of any kind, which R-7 established against the README
wiring snippet, and it is the same property the entry below reports for a top-level bash fence.
And R-14's edits to `agents/orchestrator.md` contribute 0, so the `agents/` byte surface moved on
this wave for two independent reasons and only one of them reached this gate.

**Re-approval rules applied**, from `BASELINE_MESSAGE` at `:484` and the log convention above the
constant: the received numbers were checked against the edits that produced them, written into
`BASELINE`, and the assertion was left an equality rather than widened into a floor. Every move
stays attributed above the constant, and the new entry sits **on** the `BASELINE` line with the
previous lead demoted to an `Earlier:` clause, which is the form the last entry adopted so the
log costs no line against the hook-test bound. The edit is 1 line changed, 0 added.

## 2. The surface-growth golden

Regenerated with `UPDATE_SURFACE_GOLDEN=1`, the flagged run failing on purpose, then re-run clean.
The diff is exactly the three siblings' files: `orchestrator.md` +95, `reconciler.md` +289,
`setup/SKILL.md` -9. No hook-test file changed line count, `hooks-wiring.test.ts` included.

Measured totals against the bounds, computed from the baseline blocks rather than copied from the
dispatch:

| Surface | Baseline | Bound | Measured | Free |
|---|---|---|---|---|
| `agents/` bytes | 399 843 | 417 843 | 417 796 | 47 |
| `skills/` bytes | 220 439 | 240 439 | 240 423 | 16 |
| hook-test lines | 17 875 | 20 375 | 20 349 | 26 |

No bound is red, so the golden was simply stale and regenerating it was the whole fix.

**No growth baseline moved.** `AGENT_BASELINE`, `SKILL_BASELINE` and `TEST_LINE_BASELINE` were
hashed before the regeneration and again after, identical, and
`hooks/lib/__tests__/surface-growth-bound.test.ts` and
`hooks/lib/__tests__/helpers/growth-bound.ts` are both clean in `git status`. The only sanctioned
way out of a red bound is a cut; the pin in part 1 is a different instrument, an equality pin
whose own convention is re-approval with a stated reason.

## Verification

`cd hooks && npm test` — exit 0, 44 files, 776 tests, all passing.

## Housekeeping

No whole-tree git command was used at any point; comparisons ran through `git diff` and
`git show HEAD:<path>`. Nothing was staged and nothing committed. No defect or open question was
found, so none was filed.
