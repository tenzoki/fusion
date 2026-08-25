# C4 step 9 — the reader's repair is authored once, in `rules/workbench-tracking.md`

**Status:** Complete
**Agent:** coder
**Filed by:** coder, Kai Stalmann <ks@qantr.com>
**Checkout:** 5e8248d7
**Plan:** `circles/260825-2023-presence-travels-monitor-filters-own-checkout/planning/260825-2140_*_c4-presence-travels-and-the-monitor-reads-its-own-checkout.md`, step 9

## What was changed

One file, `rules/workbench-tracking.md`, and nothing else. The dispatch named it as the whole scope, with three sibling tasks editing `hooks/lib/events-query.ts`, `skills/setup/SKILL.md` and `bin/monitor` concurrently.

`## The event log carries a union merge driver` was extended at the point where its closing paragraph already said that after a union merge the file is not chronological and the repair belongs to the reader rather than to the file. That sentence had been making a promise with no second half; the edit completes the same paragraph and adds two more, rather than opening a new section or a new file.

Five things are stated and nothing beyond them:

1. **What the repair now is**, in two clauses: every emitted line carries the checkout that wrote it, and a reader scopes the log by that field before it sorts by `ts`. The order of the two operations is named as the whole of the repair, because sorting an unscoped log produces a plausible false sequence that is worse than the positional reading it replaces, in that it looks repaired.
2. **The absence rule**: a line carrying no checkout identifier reads as the reading checkout's own.
3. **The cost the user accepted with it**, stated plainly and not softened: another checkout's pre-C4 lines that have already merged in read as this checkout's, and nothing later corrects them. The alternative named beside it is the one that was rejected, treating an absent field as foreign, which would have emptied every surface reading this log until the first session written under the new contract.
4. **The three readers, by path**, with the asymmetry given its own sentence. `bin/fusion-events turns` and `bin/monitor` drop every line another checkout wrote; `bin/fusion-events presence` keeps them, because presence is the one question whose answer lives in the lines this checkout did not write.
5. **Nothing about how the identity is obtained.** That contract is cited to `agents/orchestrator.md` `### 2. Structured Event Log` (commit `8655ec2`) and explicitly not restated.

## Two things checked before editing, both of which came back "leave it alone"

**The provenance header.** `rules/rule-file-provenance.md` requires an editor to preserve the header and to update it only when the edit is substantial enough that a different record has become the file's *reason for existing*. It has not: the file exists to define the four-class partition, and this edit completes a sentence inside one of its sections. The three-part header stands unchanged.

**The em-dash budget.** `bin/fusion-prose-metric` read the file at 2 em-dashes against a permit of 2 before the edit, so there was no head-room at all. The new text carries none, using colons and semicolons where the surrounding prose uses a dash. After the edit the file reads 2 em-dashes over 2528 prose words, permit 2, verdict `ok`. The metric reports and never gates, but a file sitting exactly on its ceiling is not the place to spend a dash.

## Verification

`cd hooks && npm test` — **exit 1**. Two test files failed, and **neither failure is a defect in the change**. One is attributable to this edit and is a baseline this task was forbidden to touch; the other belongs to a sibling task.

**`reference-resolution-lint.test.ts`** — the pinned reference count moved. Committed `BASELINE` is `{ paths: 1404, anchors: 193 }`; the tree reports `{ paths: 1409, anchors: 195 }`. The delta was attributed by measurement rather than by inference: with `rules/workbench-tracking.md` reverted to `HEAD` and everything else in the working tree left as it stood, the gate reported `{ paths: 1405, anchors: 194 }`, so **+1 path and +1 anchor are a sibling's concurrent edit and +4 paths and +1 anchor are this one.** The four paths are `agents/orchestrator.md`, `bin/monitor` and the two `bin/fusion-events` spellings; the anchor is `### 2. Structured Event Log`. All five resolve — the gate is not reporting a dangling reference, only that the count moved off its pin.

Re-approving that baseline means editing `hooks/lib/__tests__/reference-resolution-lint.test.ts`, which the dispatch put out of scope in its first line ("One file only"). It is left for whoever holds the commit, and the number to write is whatever the gate reports once the three sibling edits have landed, not `1409/195` measured mid-flight against a tree three other tasks were still writing to.

**`surface-growth-bound.test.ts`** — the `skills` golden moved, `setup/SKILL.md` from 46301 to 46649 bytes. That is plan step 4's file, being edited concurrently. `rules/` is on no bounded surface, which is the whole reason step 9 puts this paragraph here rather than in an always-on rule, where the core had 14 bytes of head-room.

**The reading being reported** is the full-suite one, `cd hooks && npm test`, exit 1, taken with the sibling edits present in the tree. The reference-resolution file was additionally run alone, twice, to take the attribution measurement above; both readings agree with the full-suite one.

## Files changed

- `/Users/k1/Projects/productive/fusion/rules/workbench-tracking.md`
