The dispatch-path bound's failure message still says no fourth re-baselining event exists, and an assertion pins the sentence
---
**Domain:** code
**Status:** closed
**Severity:** Medium
**Executor:** coder
**Filed by:** reviewer (closing pass `49ab50e4..e41e333f`, checkout `5e8248d7`, Kai Stalmann <ks@qantr.com>)
**Cross-references:** commit `c34c7896` (the re-arming); `260922-0922_*_are-the-dispatch-path-rows-re-armed-at-the-post-cut-totals-and-under-which-event.md` (the ruling, option 1); `260822-1154_*_does-a-cut-only-circle-re-baseline-the-surfaces-it-cuts.md` (the rate-surface refusal, not superseded)

---

## What is wrong

`c34c7896` added a **fourth** re-baselining event, scoped to the dispatch-path bound alone, and re-armed all eleven rows at the measurement. It authored the event in the fixture header (`hooks/lib/__tests__/fixtures/dispatch-path.baseline`, `## The re-arming, 2026-09-22`), logged the rows in `README-hooks.md` `#### The dispatch-path re-arming of 2026-09-22`, and updated the doc comment on `DISPATCH_HEAD_ROOM` (`hooks/lib/__tests__/rules-emission-golden.test.ts:957-965`) to carry the event's one condition.

It did not update the message this bound prints **when it fails**, which is the only one of those surfaces a developer is certain to read. `hooks/lib/__tests__/rules-emission-golden.test.ts:1048-1055`:

```
"The baseline moves only at the three events in helpers/growth-bound.ts " +
  "`## Re-baselining: the three events at which a baseline moves`, and NO " +
  "RE-BASELINING EVENT COVERS A GROWING CLAUDE.md. That rule was written for a " +
  "surface fusion owns; two of this quantity's three components belong to the " +
  "project, and no fourth event was added for them. Inside this repository a " +
  "larger CLAUDE.md is offset against another component of the same paths or it " +
  "is not landed. Editing the fixture to make this assertion pass is none of the " +
  "three events.",
```

Three of its statements are now false of the bound that prints it:

- *"The baseline moves only at the three events in helpers/growth-bound.ts"* — it moved at a fourth, authored elsewhere on purpose.
- *"no fourth event was added for them"* — one was, on 2026-09-22, by user ruling.
- *"Editing the fixture to make this assertion pass is none of the three events"* — `c34c7896` edited exactly this fixture so that exactly this assertion would pass.

And `hooks/lib/__tests__/rules-emission-golden.test.ts:1214` asserts the first of them:

```
expect(msg).toContain("## Re-baselining: the three events at which a baseline moves");
```

so the stale sentence is pinned green and cannot decay noisily.

## Why it matters

This bound governs every future always-on addition in the repository, and its failure message is the whole of the instruction a developer gets at the moment they are blocked. As it stands the message tells them that following the measurement down is never legitimate and that editing the fixture is never legitimate — which would have stopped `c34c7896` if anyone had read it, and will mislead the next reader in the other direction: a genuine shared-component cut will look unfundable because the only surface they are looking at says so.

It is the same class this package's own commit message guarded against elsewhere. `c34c7896` explicitly verified that `hooks/lib/__tests__/helpers/growth-bound.ts` `## Re-baselining: the three events at which a baseline moves` stands unedited and that its two pinning assertions still pass. It did not ask the same question of the message the dispatch-path bound prints about itself.

## What must NOT be changed with it

Three other mentions of the same heading in the same file are about `RULE_BASELINE` and `DRIFT_CEILING`, which are **rate** surfaces the new event explicitly does not reach (`260822-1154_*_does-a-cut-only-circle-re-baseline-the-surfaces-it-cuts.md` still rules them). They are correct as they stand:

- `hooks/lib/__tests__/rules-emission-golden.test.ts:205` (header comment)
- `hooks/lib/__tests__/rules-emission-golden.test.ts:209` (the `RULE_BASELINE` docstring)
- `hooks/lib/__tests__/rules-emission-golden.test.ts:373` and `:576` (the role-floor comment and the golden-regeneration message)

`hooks/lib/__tests__/helpers/growth-bound.ts` stays unedited, heading and body, which is the condition the ruling attached to the event.

## Fix direction

Rewrite `dispatchBoundMessage()`'s last paragraph (`hooks/lib/__tests__/rules-emission-golden.test.ts:1040-1057`) so it states this bound's own rule: three events in `helpers/growth-bound.ts` plus the one condition authored in `fixtures/dispatch-path.baseline` — after a cut of a component shared by every row, a zero-sum bound follows the measurement down — and that editing the fixture outside those four is none of them. Keep the `SHARED COMPONENTS` paragraph, which is unaffected and is what the assertion at `:1211` pins. Then move the assertion at `:1214` onto a string that is true, pointing at the fixture header rather than at the rate-surface heading.

## Acceptance

- `dispatchBoundMessage()` names four admissible events, or names the three and the fixture's condition beside them, and contains no sentence asserting that no fourth event exists or that editing the fixture is never admissible.
- The assertion at `hooks/lib/__tests__/rules-emission-golden.test.ts:1214` pins a string the message actually carries and that is true of this bound.
- `hooks/lib/__tests__/helpers/growth-bound.ts` is byte-identical, and `hooks/lib/__tests__/rules-emission-golden.test.ts:205`, `:209`, `:373`, `:576` are untouched.
- `DISPATCH_HEAD_ROOM` is still `0` and no row in `hooks/lib/__tests__/fixtures/dispatch-path.baseline` moves.
- `cd hooks && npm test` exits 0 with the `dispatch-path byte bound` case green.

---
Resolved: by the commit that carries this line. `dispatchBoundMessage()`'s last paragraph (`hooks/lib/__tests__/rules-emission-golden.test.ts`, the `dispatch-path byte bound` section) now opens on four admissible events — the three in `helpers/growth-bound.ts` `## Re-baselining: the three events at which a baseline moves`, and the fourth this bound alone carries, authored in `fixtures/dispatch-path.baseline` `## The re-arming, 2026-09-22 — every row follows the measurement down` with its one condition quoted in the message: after a cut of a component shared by every row, a zero-sum bound follows the measurement down. The two false sentences are gone: "no fourth event was added for them" and "editing the fixture to make this assertion pass is none of the three events", the second replaced by "editing the fixture outside those four events is none of them", which is what the event admits and what `c34c7896` did. `NO RE-BASELINING EVENT COVERS A GROWING CLAUDE.md` is kept and stays true — it is now qualified "the fourth included", because that event takes a path's total down to a measurement and never up to one — so the assertion pinning it stands. The assertion that pinned the rate-surface heading now pins the fixture's own heading, a string the message carries and that is true of this bound.

`hooks/lib/__tests__/helpers/growth-bound.ts` is byte-identical, `DISPATCH_HEAD_ROOM` is still `0`, no row in `fixtures/dispatch-path.baseline` moved, and the four sibling mentions of the rate-surface heading in the same file are untouched. `hooks/lib/__tests__/fixtures/surface-growth.golden` re-approved at the measurement: `rules-emission-golden.test.ts` 1 216 -> 1 221 lines, 5 of the 20 of head-room.
