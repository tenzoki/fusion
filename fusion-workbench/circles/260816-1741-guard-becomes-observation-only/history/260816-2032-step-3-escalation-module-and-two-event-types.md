# Step 3 — the escalation module goes, and two event types with it

**Date:** 2026-08-16
**Agent:** coder
**Status:** Complete — step 3 half-landed and half blocked
**Plan:** `circles/260816-1741-guard-becomes-observation-only/planning/260816-1915_p_the-compliance-guard-becomes-observation-only.md`, step 3
**Predecessor commit:** `2f624ca` (step 2)

## What the step asked for

Delete `hooks/lib/escalation.ts` outright, and remove `guard_block` and `guard_halt`
from the `GuardEventType` union in `hooks/lib/events.ts`, keeping `halt_cleared` until
step 6 removes its last emitter. Verification: `cd hooks && npm run build` exits 0 and
the build prunes `hooks/dist/lib/escalation.js` and `.d.ts`.

## What landed

`hooks/lib/events.ts` only. `guard_block` and `guard_halt` are out of the union; the
union's existing comment, which already carried the emitter's-vocabulary argument for
`state_drift`, was extended with this second instance rather than gaining a parallel
comment beside it. Its opening line moved from "the one removal it has had" to "every
removal it has had", and the `bin/monitor` paragraph now names all three retired values
in one argument instead of one. `bin/monitor` was not touched and still styles both row
types.

## What did not land, and why

**`hooks/lib/escalation.ts` is still in the tree.** Deleting it cannot satisfy the
step's own verification while `hooks/clear-halt.ts` exists, and the plan schedules that
deletion for step 6, behind this one.

Measured rather than inferred. With `lib/escalation.ts` moved aside, `npm run build`
fails:

```
clear-halt.ts(81,8): error TS2307: Cannot find module './lib/escalation.js' or its corresponding type declarations.
clear-halt.ts(82,38): error TS2307: Cannot find module './lib/escalation.js' or its corresponding type declarations.
Error: tsc exited 2
```

`hooks/tsconfig.json` compiles `*.ts` at the hooks root, so `clear-halt.ts` is in the
compile whether or not anything runs it. Its two imports at `clear-halt.ts:81-82` are
value imports of `loadEscalation`, `saveEscalation`, `clearHalt` and `isHalted` plus a
type import of `EscalationEvent`.

**The second consequence is the one that matters more than the exit code.**
`scripts/build.mjs` runs `buildToStaging()` before `syncIntoDist()`, and the prune lives
in the second. A failing compile throws out of the first, so `dist/` is never touched
and `dist/lib/escalation.js` and `dist/lib/escalation.d.ts` survive. Deleting the source
alone therefore produces exactly the compiled orphan that the prune behaviour in
`README-hooks.md` `### Rebuilding after TS changes` exists to prevent, and ships it.

## The ordering defect this exposes

The plan gives step 3 `Dependencies: step 2` and step 6 `Dependencies: steps 1 and 3`.
That order cannot hold: step 3 deletes a module step 6's file still imports. Two orders
work, and the choice is the orchestrator's rather than this agent's.

- Merge steps 3 and 6 into one change. Both event-type removals and both file deletions
  land together. The sequencing constraint the escalation decision record carries is
  satisfied either way, because it only requires step 6 not to precede step 1, and step
  1 is already `[DONE]`.
- Swap them: run step 6 first, then step 3. Step 6's own stated dependency on step 3 is
  not a real one — `clear-halt.ts` can be deleted while `escalation.ts` is still
  present, since nothing else imports the module.

Filed as `260816-2032_o_step-3-deletes-a-module-step-6s-file-still-imports.md` in this
Circle's issue store.

## Verification

| Command | Result |
|---|---|
| `cd hooks && npm run build` | exit 0 |
| `cd hooks && npm test` | 7 files / 31 cases red, unchanged from the pre-change baseline |

The red set before and after this change is the same seven files:
`guard-bash-integration`, `guard-escalation-shape`, `guard-halt-event`,
`guard-project-config-integration`, `hook-fail-open`, `legacy-halt-clearing`,
`surface-growth-bound`. **Delta: none added, none removed.** All seven are step 9's and
step 10's to resolve.

`dist/lib/` is byte-identical in membership before and after, which is the correct
outcome for a change that deleted no source file.

## Importer grep, before and after

`grep -rn "escalation.js\|escalation'" hooks/` — unchanged, because nothing was deleted.
Filtering the comment mentions of `escalation.json` from the result leaves exactly two
importers of the module, both of them the ones the dispatch named:

- `hooks/clear-halt.ts:81-82` — step 6's
- `hooks/lib/__tests__/escalation.test.ts:14-15` — step 9's

A repository-wide grep for `lib/escalation` outside `hooks/dist/` finds no third
importer. The plan's caller analysis is correct; only its step order is not.

## Files changed

- `/Users/k1/Projects/productive/fusion/hooks/lib/events.ts`
- `/Users/k1/Projects/productive/fusion/hooks/dist/lib/events.d.ts` (build output)

`hooks/dist/lib/events.js` is deliberately absent from that list: the change is type-only,
so `tsc` emits the same JavaScript and the build's content comparison skips the file.

Nothing committed; the orchestrator commits.
