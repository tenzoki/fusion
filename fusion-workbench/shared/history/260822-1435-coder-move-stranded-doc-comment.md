# coder — move the stranded doc comment onto `shippedPrompts`

**Status:** Complete
**Dispatched by:** orchestrator
**Circle:** none active (shared)
**Finding:** `260822-1422_*_the-doc-comment-for-shippedprompts-is-stranded-above-agentnames.md` (Low)
**Review:** `260822-1421-coderev-c0-cut-only-circle.md`

## What the finding claimed, and what the file said

The review named `hooks/lib/__tests__/helpers/citation-scan.ts:815-829`: the six-line block
describing `shippedPrompts` standing above `agentNames`, which carries its own one-liner directly
beneath it, leaving `shippedPrompts` with no doc comment.

Verified by reading the region before touching it. The finding named the right pair. At HEAD the
file held, in order: the section banner, blank, the `/** Every agent prompt plus each skill body …
*/` block at 816-821, the `/** Every agent's name … */` one-liner at 822, `agentNames` at 823-828,
blank, `shippedPrompts` at 830 with nothing above it. Nothing about the reported pairing was wrong,
so there was nothing to correct in the report.

## What changed

The six-line block moved down to sit immediately above `export function shippedPrompts`. Nothing
else. `agentNames` keeps its one-liner; the section banner keeps its place.

Line-neutral by construction: 950 lines before, 950 after; the diff is 6 insertions and 6
deletions of the same six lines. No blank line was added or removed — the block took the position
directly under the blank that already separated the two functions.

## What the constraints required, and what they cost

- **One file edited.** `hooks/lib/__tests__/helpers/citation-scan.ts` and nothing else. That
  directory is excluded from `hooks/tsconfig.json`, so `committed-dist.test.ts` is unaffected and
  no rebuild was needed.
- **Head-room.** The hook-test surface measures 20 073 lines against a floor of 17 875 and a budget
  of 20 375: **302 lines of head-room, unchanged**, because the edit moved lines rather than adding
  them. Computed the same way `growth()` computes it in
  `hooks/lib/__tests__/helpers/growth-bound.ts:99-112`.
- **Baseline maps.** `AGENT_BASELINE`, `SKILL_BASELINE` and `TEST_LINE_BASELINE` in
  `surface-growth-bound.test.ts`, and `RULE_BASELINE` in `rules-emission-golden.test.ts`:
  `git diff --quiet HEAD` reports both files unchanged.
- **The surface golden was not regenerated, and did not need to be.** It shows as modified in the
  working tree, but the diff is confined to `[skills bytes]` — `cleanup/SKILL.md` and
  `help/SKILL.md`, the concurrent executor's work on the High finding from the same review. The
  `[hook-tests lines]` section is byte-identical, which is the second, independent confirmation
  that this edit changed no line count.

## Verification

`cd hooks && npm test` — exit 0. 41 test files, 724 tests, all passed, 71s. The suite was expected
to be indifferent to this change and was: a comment move alters no behaviour, and no gate in the
suite reads comment placement.

## Issue closed

`260822-1422_*_the-doc-comment-for-shippedprompts-is-stranded-above-agentnames.md` renamed `_o_` → `_c_` with a `Resolved:` note per
`rules/fusion-workbench-conventions.md` `### Issue files`. Left unstaged for the orchestrator.

## Not committed

Nothing staged, nothing committed. The rename is unstaged. No whole-tree git command was run at
any point.
