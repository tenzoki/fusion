# Coder — the `[ -x ]` guard rationale gets an authoring home

**Status:** Complete
**Agent:** coder
**Task:** close issue `260822-1421` (High), which trips the C0 Circle's stopping clause
**Circle:** none active (shared)
**Verification:** `cd hooks && npm test` — exit 0 (41 files, 724 tests)

## What the review claimed, and what I verified

Verified against the tree and against `c2ad89c`, not against the review's summary. All four
claims hold.

1. `c2ad89c` replaced one paragraph in `skills/setup`, `skills/next`, `skills/cleanup` and
   `skills/help` with the pointer `**Why the branch, and why it is a call:**
   `bin/fusion-source-root`'s own header.` Read the diff for `cleanup` and `help` directly: in
   both, the removed paragraph ended with the sentence *"The `[ -x ]` guard is the one every
   prompt-called `bin/` helper carries: a helper added between releases is absent from an older
   install and a bare call is exit 127."*
2. `setup/SKILL.md:32` and `next/SKILL.md:33` carry a second paragraph the cut did not touch,
   which states the same two facts. `cleanup` and `help` have no second paragraph; after the
   pointer comes the `UNRESOLVED` paragraph.
3. The helper's header did not author the claim. `grep -n -- '-x \|127\|guard'
   bin/fusion-source-root` returned four hits: line 51 (the guard's stand-down, unrelated), lines
   76-77 (the branch-ordering paragraph, which *assumes* the guard), and line 89 (the script's own
   code). No statement that a helper can be absent from an older install, and no mention of 127.
4. The stopping clause is at line 180 of the plan, restated in `## Where this Circle stops`. It
   is exactly this case: a named authoring home that does not hold the claim.

The guard itself is present in both shell blocks (`cleanup/SKILL.md:18`, `help/SKILL.md:20`), so
nothing behavioural was lost.

## The fix

Fix direction 2 from the issue, the one the reviewer preferred.

`bin/fusion-source-root` gains an eleven-line paragraph in its header, placed between the
"Why the branch at all" paragraph and the no-upward-walk one, titled *"Why every documented call
site guards the call with `[ -x ]`"*. It states both facts the removed sentence carried, plus what
the absent branch and the unset-variable branch each do. `bin/` is on none of the four bounded
surfaces, so the paragraph costs no head-room anywhere.

The pointer in `skills/cleanup/SKILL.md:29` and `skills/help/SKILL.md:31` now reads *"Why the
branch, why it is a call, and why the call is guarded"*, so the pointer names all three claims its
target holds instead of two of them. 25 bytes each.

## The second-order cut was not taken, and why

The review suggested `setup` and `next` could then drop their surviving second paragraph as a
restatement. Checked sentence against sentence; it is **not** one.

- `setup:32` opens *"The `[ -x ]` guard is the one Step 3's domain detection carries, for the same
  reason"* and `next:33` *"…the one the orchestrator's Setup carries around every `bin/` helper"*.
  Each names a call site inside its own body. A helper header cannot author a cross-reference to
  another step of the skill that calls it.
- The rest of each paragraph describes that body's own three-branch shell block: the `elif` that
  falls to `$FUSION_PLUGIN_ROOT` with a message on stderr, and the `else` that yields `UNRESOLVED`.
  That is the caller's code, not the helper's, and the helper's header is the wrong home for it.

The new header paragraph deliberately states the same two branch behaviours in the general, so a
reader arriving from `cleanup` or `help` gets them; the two bodies that describe their own block
keep describing it. Taking the cut would have bought about 700 bytes on a surface whose target was
already met with 4 370 to spare, which is the reason the dispatch named for not taking it on byte
grounds alone.

## The pin did not move

Checked before writing and confirmed after: `hooks/lib/__tests__/reference-resolution-lint.test.ts`
is green at `BASELINE = { paths: 1269, anchors: 171, records: 115 }` with no edit. The new header
paragraph names no plugin-tree path and cites no workbench record — `PLUGIN_PATH_RE` needs
`bin/<name>`, and a bare `bin/` in prose does not match — and the two pointer edits changed prose
around an unchanged `bin/fusion-source-root` token. So no re-approval block was needed, and the
hook test surface spent none of its 302 lines.

## Measurements

Each surface summed the way its own bound sums it (`growth()`: head-room = floor + budget − total).

| Surface | Before | After | Moved |
|---|---|---|---|
| `agents/*.md` | 16 601 bytes | 16 601 bytes | untouched |
| `skills/*/SKILL.md` | 4 370 bytes | 4 320 bytes | −50 (two pointers, 25 each) |
| Hook test suite | 302 lines | 302 lines | untouched |
| Always-on rule core | unchanged | unchanged | untouched |

`hooks/lib/__tests__/fixtures/surface-growth.golden` regenerated with
`UPDATE_SURFACE_GOLDEN=1 npx vitest run lib/__tests__/surface-growth-bound.test.ts`; the diff is
exactly three lines — `cleanup/SKILL.md 23544 -> 23569`, `help/SKILL.md 16932 -> 16957`,
`total 236069 -> 236119` — and the run was repeated without the flag.

**The four baseline maps are unchanged.** `git diff` reports no change at all to
`hooks/lib/__tests__/surface-growth-bound.test.ts` (`AGENT_BASELINE`, `SKILL_BASELINE`,
`TEST_LINE_BASELINE`) or to `hooks/lib/__tests__/rules-emission-golden.test.ts` (`RULE_BASELINE`),
so all four are byte-identical to HEAD `370bfc5`.

## Files changed

- `/Users/k1/Projects/productive/fusion/bin/fusion-source-root`
- `/Users/k1/Projects/productive/fusion/skills/cleanup/SKILL.md`
- `/Users/k1/Projects/productive/fusion/skills/help/SKILL.md`
- `/Users/k1/Projects/productive/fusion/hooks/lib/__tests__/fixtures/surface-growth.golden`
- `/Users/k1/Projects/productive/fusion/fusion-workbench/shared/issues/260822-1421_c_two-skill-bodies-lost-the-x-guard-rationale-to-a-header-that-does-not-carry-it.md`
  (renamed from `_o_`, `Resolved:` note appended, status closed)

Not committed. The rename is left unstaged for the orchestrator.
