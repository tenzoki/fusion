# Coder — staging drift names `.asset-provenance` as live state

**Status:** Complete
**Agent:** coder
**Filed by:** coder, Kai Stalmann <kai@qantr.com>
**Issue:** `260830-1845_*_staging-drift-does-not-name-asset-provenance-as-live-state-while-its-sibling-marker-is.md`

## What was wrong

`LIVE_STATE` in `hooks/lib/staging-drift.ts` named `.fusion-setup` and not
`.asset-provenance`. `rules/workbench-tracking.md` `## The four classes` places both
in class R3 with one reason covering the pair — tracked, written by `/fusion:setup`
in each checkout — so the classifier disagreed with the partition it is derived from.
`.asset-provenance` fell through to `unclassified`, which is never a fault, so nothing
false was reported; what was lost is that a complete reading of a workbench printed a
machine-written setup artifact under the heading that claims nothing about it.

## What changed

`hooks/lib/staging-drift.ts`

- One entry added to `LIVE_STATE`: `.asset-provenance`, reason
  `the asset provenance record — written by /fusion:setup`, beside its sibling.
- The list's doc comment no longer counts its members ("the first six", "the last
  two") but names the classes it holds: class L in full, then class R2 and class R3
  in full. The counts were about to go stale the moment an entry was added, which is
  what makes this an agreement with the partition rather than a second special case —
  the property to check when the layout gains a root-anchored entry is now stated.
- The header's `in-flight` bullet said "the two tracked-but-machine-written ones";
  it now names classes R2 and R3, for the same reason.

`hooks/lib/__tests__/staging-drift.test.ts`

- The existing in-flight case gains one write of `fusion-workbench/.asset-provenance`,
  one path in its assertion loop, and one assertion that the printed reason names
  `/fusion:setup`. Four added lines rather than a new case, because the hook-test line
  budget is shared and three sibling tasks were spending it in the same batch.

No other file was touched. The classifier's ordering, the `record`/`commit-message`
classes, the trigger and the throttle are unchanged.

## Verification

`npx vitest run lib/__tests__/staging-drift.test.ts` from `hooks/` — exit 0, 18 tests
passed. The harness spawns the TypeScript source through `stagingDriftEntry()`, so the
pin is on the source and independent of the build.

**One half of the record's acceptance is not verified here and that is deliberate.**
It asks additionally that `bin/fusion-staging-drift` print the row over a workbench
where the file is modified. That wrapper execs `hooks/dist/staging-drift.js`, and this
task ran under an explicit constraint not to run `npm run build` — `hooks/dist/` is
shared build output and three sibling coders were editing hook sources concurrently.
The CLI half follows from the source change once the orchestrator builds after the
batch; it was not observed.

## Not done, by scope

The defect record itself was not edited — the orchestrator closes it. Nothing was
staged and nothing was committed.
