# Write the clause that makes the reply answer the question that was put

**Date:** 2026-08-21
**Agent:** coder
**Status:** Complete
**Circle:** `260821-1042-reply-bounded-whole-question-answered`
**Plan step:** 3 of `260821-1805_*_plan-reply-bounded-whole-question-answered.md`
**Base commit:** `58aae9b`, plus step 2's uncommitted working tree

## What changed

`rules/user-facing-output.md` `## Information architecture (in this order)` gains one paragraph
between the heading and the numbered list, so the section says what the reply is about before it
says what order its parts come in:

> The reply answers the question that was asked. What you noticed on the way is filed per
> `rules/fusion-workbench-conventions.md` `## Issue and Decision Filing`, which already forbids
> carrying it in chat, and gets one line of the reply naming the record. Asked where the acceptance
> criteria are: the path and the section names, plus one line for each of the two defects you filed.

Three things about that text are deliberate.

1. **It points rather than restates.** The destination already exists: the cited section already
   requires the record for every defect and every open question found during work, and already
   forbids putting one in chat output. The new sentence adds the half that was missing, that the
   reply names the record instead of carrying it.
2. **The citation is the shorter heading.** The section's full heading is
   `## Issue and Decision Filing — MANDATORY`; the gate resolves an anchor by prefix, so the shorter
   spelling resolves and is the one `agents/planner.md:65` already uses. It also keeps an em-dash
   out of the file.
3. **The worked contrast is the record's own.** It comes from
   `260812-0253_*_agents-answer-a-question-the-user-did-not-ask-and-the-length-caps-do-not-hold.md`,
   where the question was where the acceptance criteria are, the answer the user wanted was a path
   and four section names, and the two defects found in passing were carried in the reply instead of
   being filed and named.

Two wordings were measured against each other before one was written. The first stated the rule and
the contrast in 412 bytes and said "found on the way" twice, which is the restated-claim habit this
Circle is naming elsewhere; the second says it once, in 378. The second is what landed.

No heading was renamed, added or removed. No test was added and no gate was built, per
`260816-0740_*_does-the-prose-register-get-a-measurable-gate-and-which-surface-does-it-measure.md`.
The clause lands unenforced, by decision.

## The byte delta, which step 5 must cover

```
wc -c rules/user-facing-output.md
```

| Point | Bytes |
|---|---|
| HEAD `e764637` | 20 144 |
| after step 2 | 20 787 |
| after step 3 | 21 167 |

**Step 3's own delta is +380 bytes** (the 378-byte paragraph plus its blank line). Steps 2 and 3
together have spent **+1 023 bytes**, and that is the size of the cut step 5 has to take to bring
the file back to 20 144.

The always-on set moves with the file. The five emitted rule files total **96 089** bytes against
the 98 573 budget, so **2 484 bytes of head-room** remain. Read it from the `[coder]` block of
`hooks/lib/__tests__/fixtures/rules-emission.golden`, or with `bin/fusion-rules coder | xargs wc -c`
minus this project's 7 480-byte chat voice profile, which the helper also emits and the budget
does not count.

## Gates that moved, and how each was attributed

**`hooks/lib/__tests__/reference-resolution-lint.test.ts`** — `BASELINE` re-approved from
`{ paths: 1257, anchors: 162 }` to `{ paths: 1258, anchors: 163 }`, records unchanged at 116. Both
new tokens are the single adjacent citation the new sentence carries: the path is class (a), the
heading is class (b).

Attributed by measuring, not by reading. `rules/user-facing-output.md` was copied aside, the new
paragraph alone was removed from it, and the gate was re-run on the resulting tree, which is step 2's
state: green at 1257/162/116. The file was then restored. No scanner, exemption or class changed.

**`hooks/lib/__tests__/fixtures/rules-emission.golden`** — regenerated with
`cd hooks && UPDATE_RULES_GOLDEN=1 npx vitest run lib/__tests__/rules-emission-golden.test.ts`,
then re-run without the flag. The diff is 30 pairs of lines and nothing else: `user-facing-output.md`
and `total` for each of the 15 agents. `RULE_BASELINE` was not touched, which is correct — a
regeneration records growth and never absolves it.

**`hooks/lib/__tests__/fixtures/surface-growth.golden`** — regenerated the same way with
`UPDATE_SURFACE_GOLDEN=1`. The hook-test surface moved because the attribution comment above
`BASELINE` is itself four lines of a bounded surface: `reference-resolution-lint.test.ts` 1 428 ->
1 432, total 20 360 -> 20 364.

**That surface is the tight one, and the next two steps should know it.** Its cap is
`TEST_LINE_BASELINE` summed (17 875) plus 2 500 of head-room, so 20 375. At 20 364 there are
**11 lines left**. The attribution comment was written at seven lines first and cut to four for
exactly this reason; steps 5 and 6 will each want a few of the remaining eleven if they move a
pinned number.

## Verification

```
cd hooks && npm test        # exit 0, 40 files, 718 tests
./bin/fusion-prose-metric rules/user-facing-output.md
```

The prose metric reads 1 em-dash over 2 730 prose words, 0.4 per 1000 against a permit of 2: `ok`.
The one em-dash is not in the new sentence, which carries none.
