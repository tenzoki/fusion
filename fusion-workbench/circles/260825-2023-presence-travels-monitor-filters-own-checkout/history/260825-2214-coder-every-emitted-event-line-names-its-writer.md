# C4 step 3 — every emitted event line names the person and the checkout that wrote it

**Status:** Complete
**Agent:** coder
**Filed by:** coder, Kai Stalmann <ks@qantr.com>
**Checkout:** 5e8248d7
**Plan:** `260825-2140_*_c4-presence-travels-and-the-monitor-reads-its-own-checkout.md`, step 3

## What was implemented

Five edits to `agents/orchestrator.md`, all inside the sections the step named.

1. `### 2. Structured Event Log` — `person` and `checkout` added to the schema example, followed by one paragraph stating that both stand on **every** line rather than only on the session boundaries. The reason is carried in the same paragraph: the union merge driver makes line order unreliable, so a line's session membership cannot be read off its position under a `session_start`, and each line therefore names its own writer. The absence rule is stated **here and once**: a half that did not resolve makes its field absent rather than empty, the rule the record templates already follow, and an absent `checkout` reads as this checkout's own — which is what leaves the pre-existing log readable without rewriting a line of it.
2. Setup step 2 — a new bullet ahead of the Turn budget, resolving the pair from `bin/fusion-identity` behind an `[ -x ]` guard and holding it for the session. It cites `rules/fusion-workbench-conventions.md` `### Who filed it` as governing the call, including the exit that halts.
3. Setup step 8 — the `session_start` echo now carries `person` and `checkout` ahead of `history_file`, and the sentence above it says both come from step 2 as every line does.
4. `Cleanup` — `session_end` carries both.
5. `**Emitting events:**` — the single `echo` example carries both, stated as the pair held from Setup step 2.

## Surface measurement

`agents/orchestrator.md` 160 018 -> 161 430 bytes, **+1 412**, against the step's estimate of +1 100 to +1 400. A first pass came in at +1 551 and was tightened by 139 bytes without dropping a stated obligation; the one cut of substance was the duplicated citation of `### Who filed it` in edit 1, which the call site in edit 2 carries.

`agents/` surface after this step: total 416 248, floor 399 843, delta 14 993 -> 16 405 of the 18 000 head-room. **1 595 bytes remain** for steps 8 and 11, which the plan estimates at +150 and +250; step 5 returns to the same surface.

**No baseline moved.** `AGENT_BASELINE` in `hooks/lib/__tests__/surface-growth-bound.test.ts` is untouched, so the plan's stopping clause 8 holds.

## Two gate re-approvals this edit required

Both are the documented response to a deliberate change, not a way around a gate, and both were mechanical consequences of editing one bounded, cited file.

- `hooks/lib/__tests__/fixtures/surface-growth.golden` regenerated with `UPDATE_SURFACE_GOLDEN=1`. The diff is exactly two lines — `orchestrator.md` and the `agents` total — and nothing else moved.
- `hooks/lib/__tests__/reference-resolution-lint.test.ts` `BASELINE` re-approved, paths 1 376 -> 1 380 and anchors 192 -> 193, with the note prepended on the existing line so the hook-test line count is unchanged (990 before and after; that surface has 0 lines of head-room). Every one of the five is in `agents/orchestrator.md` and every one **resolved** — the gate failed on the pin, never on an unresolved reference. Two of the four paths are the same `$FUSION_PLUGIN_ROOT/bin/fusion-identity` inside Setup step 2's fence: that fence is indented five spaces into a list item, and `helpers/citation-scan.ts` documents its fence tracker as flat, so such a fence never opens and its content is read as prose. The existing Turn-budget block below it is counted the same way.

## Verification

`cd hooks && npm test` — **exit 1**. One failure, and it is not this step's: `derivable-enumerations-lint.test.ts` reports `events-query.ts` missing from the `hooks/lib` table in `README-hooks.md`. That file is the uncommitted work of the concurrent step 2, whose own file list carries the `README-hooks.md` row that closes it.

`cd hooks && npx vitest run --exclude 'lib/__tests__/derivable-enumerations-lint.test.ts' --exclude '**/node_modules/**'` — **exit 0**, 42 files, 740 tests. That is the evidence this step's own edit is green, and it is offered as evidence rather than as the step's verification.

## Not done here, by scope

`skills/setup/SKILL.md` (step 4) and `bin/monitor` (step 7) read this contract and were not touched. The plan step's own instruction is that they cite it and never restate it.
