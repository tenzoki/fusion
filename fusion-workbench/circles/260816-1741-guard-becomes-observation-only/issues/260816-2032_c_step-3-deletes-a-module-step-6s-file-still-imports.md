Step 3 deletes a module step 6's file still imports, so step 3 cannot land before step 6

---

The plan gives step 3 `Dependencies: step 2` and step 6 `Dependencies: steps 1 and 3`. That
order cannot be executed. Step 3 deletes `hooks/lib/escalation.ts`; step 6's file,
`hooks/clear-halt.ts`, imports four values and one type from it at `clear-halt.ts:81-82`, and
`hooks/tsconfig.json` compiles `*.ts` at the hooks root, so that file is in the compile whether
or not anything runs it.

Measured on 2026-08-16 at `2f624ca` by moving `lib/escalation.ts` aside and building:

```
clear-halt.ts(81,8): error TS2307: Cannot find module './lib/escalation.js' or its corresponding type declarations.
clear-halt.ts(82,38): error TS2307: Cannot find module './lib/escalation.js' or its corresponding type declarations.
Error: tsc exited 2
```

Step 3's own verification is `npm run build` exits 0 and the build prunes
`hooks/dist/lib/escalation.js` and its `.d.ts`. Neither half can hold: the compile fails, and
**the prune does not run at all**. `scripts/build.mjs` calls `buildToStaging()` before
`syncIntoDist()`, and the prune lives in the second, so a failing compile throws out of the
first and `dist/` is never touched. Deleting the source alone leaves both compiled outputs in
the shipped tree — precisely the compiled orphan the prune behaviour described in
`README-hooks.md` `### Rebuilding after TS changes` exists to prevent, and it would ship.

The plan's caller analysis is correct and only its step order is not. A repository-wide grep for
`lib/escalation` outside `hooks/dist/` finds exactly the two importers step 3's dispatch named:
`hooks/clear-halt.ts:81-82`, which step 6 deletes, and `hooks/lib/__tests__/escalation.test.ts:14-15`,
which step 9 deletes. There is no third.

**Two orders work, and the choice belongs to whoever sequences the remaining steps.**

1. **Merge steps 3 and 6 into one change.** Both event-type removals and both file deletions
   land together, and the build's prune sees a tree with neither source in it. The sequencing
   constraint the escalation decision record carries in its `## Constraints` is satisfied either
   way: it requires only that step 6 not precede step 1, and step 1 is `[DONE]`.
2. **Swap them: step 6 first, then step 3.** Step 6's stated dependency on step 3 is not a real
   one. `clear-halt.ts` can be deleted while `escalation.ts` is still present, because nothing
   else imports the module, and step 3 then meets its own verification unchanged.

Option 1 is the smaller edit to the plan and produces one commit whose diff is the whole
removal; option 2 keeps the two steps separate and each independently verifiable.

**What landed in the meantime.** The `hooks/lib/events.ts` half of step 3 was executed on its
own and is green: `guard_block` and `guard_halt` are out of the `GuardEventType` union, the
union's comment carries the second instance of its own emitter's-vocabulary argument, and
`npm run build` exits 0. That half depends only on step 2, which removed both emitters, so it is
correct under either order above. `hooks/lib/escalation.ts` is untouched and still in the tree.

---
Resolved: option 1. Steps 3 and 6 were executed as one change — `hooks/clear-halt.ts` and
`hooks/lib/escalation.ts` deleted together, `halt_cleared` removed from `GuardEventType`
alongside `guard_block` and `guard_halt`. `cd hooks && npm run build` exits 0 and the prune
removed all four compiled outputs (`dist/clear-halt.{js,d.ts}`, `dist/lib/escalation.{js,d.ts}`),
so no compiled orphan reaches the shipped tree. Both plan steps are marked `[DONE]` and step 6
carries a line recording the merge and pointing here.
