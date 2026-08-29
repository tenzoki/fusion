The layout tree's consumer column omits the event-log reader this Circle built

---

`rules/fusion-workbench-conventions.md` `## fusion-workbench Layout` names, beside each root-anchored
file, the consumers bound to it at a fixed root-relative path. `bin/fusion-events` binds two of them
that way and is named beside neither. The column is what a reader consults to size the blast radius
of a move, and it is short by one on both rows.

---

**Filed by:** coderev, Kai Stalmann <ks@qantr.com>

**Severity:** Low. Nothing breaks today; the paths are not moving. What is wrong is that the file the
project designates as the definition of the root-anchored set under-reports its own subject, in
exactly the way this Circle spent three passes correcting elsewhere.

**Found outside the reviewed range.** This pass covered `7774d56..e66f7d5`, which did not touch
`rules/fusion-workbench-conventions.md`. The drift dates from `97407df` and `46de871`, where
`bin/fusion-events` and `hooks/events-query.ts` were created.

**Cross-references:**
`260826-1127_*_the-repairs-authoring-home-says-three-readers-scope-by-checkout-and-this-circle-built-a-fourth.md`
— the same shape, one file over: an enumeration about the event log that this Circle grew by one and
did not update.

## What the two rows say

```
├── agentstate.yaml          # bin/monitor, hooks/lib/state-file.ts (for review-coverage and staging-drift)
├── orchestrator-events.jsonl # bin/monitor, hooks/lib/staging-drift.ts
```

## What binds them

`hooks/events-query.ts`, the program behind `bin/fusion-events`, holds both paths as constants and has
no fallback:

- `hooks/events-query.ts:56` — `const LOG_REL = "fusion-workbench/orchestrator-events.jsonl";`,
  resolved against the workbench root at `:192` and read at `:194`/`:200`.
- `hooks/events-query.ts:328-336` — `fusion-workbench/agentstate.yaml`, read through
  `lib/state-file.ts` for `session.history_file`.

The `agentstate.yaml` row does name `hooks/lib/state-file.ts`, so that binding is present; what is
stale there is the parenthetical, which enumerates that module's callers as review-coverage and
staging-drift and now omits events-query. The `orchestrator-events.jsonl` row names no reader of the
event log's contents other than `bin/monitor`: `hooks/lib/staging-drift.ts` classifies the path and
never opens the file.

## Why the paragraph beneath the tree makes this count

> **The root-anchored surfaces are not negotiable.** Each is bound to a fixed root-relative path by
> every consumer named beside it in the tree, and none of those consumers has a fallback path […]
> The column names a consumer that only *names* the path, in an exclusion or classification list,
> next to one that reads the file: what breaks on a move is the same dependency either way.

and, two paragraphs on:

> an incomplete tree invites exactly the reasoning-by-omission it exists to prevent.

The column's stated purpose is what breaks on a move. `bin/fusion-events` breaks on a move of either
path and is not listed, so the tree undercounts the blast radius of both.

## Why the Circle's own sweep did not see it

The sixth pass over this theme (recorded in
`260826-1200-coder-z2-the-three-remaining-counts.md`,
`## The sixth pass`) searched for **count words** within 110 characters of the mechanism's vocabulary.
This column carries no count word — it is an unnumbered enumeration — so it fell outside the declared
boundary. That boundary is stated in the record rather than left implicit, so this is a gap the method
announced rather than one it hid.

**Fix direction.** Add `bin/fusion-events` to the `orchestrator-events.jsonl` row, and extend the
`agentstate.yaml` row's parenthetical to name events-query beside review-coverage and staging-drift.
Check the rest of the column against the same question while there — whether any other row has gained
a consumer since it was written is unmeasured here.

**Scope.** `rules/fusion-workbench-conventions.md` `## fusion-workbench Layout`, two lines. Two
things to measure rather than assume before committing. The file is always-on and bounded by
`rules-emission-golden.test.ts`, so the addition spends head room from that surface's budget. And the
lines sit in a code fence, which buys nothing here: `scanPluginPaths` has no fence exemption of any
kind, so `bin/fusion-events` inside the fence is a class-(a) path token like any other and the
citation pin in `reference-resolution-lint.test.ts` will move and need re-approving.

**Resolved:** 260827-1811-coder-b16-layout-tree-consumer-column.md, coder (Bundle B step 16 of `260827-1756_*_repair-the-twenty-open-defect-records.md`). `rules/fusion-workbench-conventions.md` `## fusion-workbench Layout`: the `orchestrator-events.jsonl` row now names `bin/fusion-events` (`hooks/events-query.ts`), and the `agentstate.yaml` parenthetical names events-query beside review-coverage and staging-drift. The column check the record asked for (`grep -n 'fusion-workbench/' hooks/*.ts hooks/lib/*.ts bin/*`, comment lines set aside) found four more unlisted consumers and they are in the tree now: `hooks/lib/orchestrator-events.ts` (writes the event log, probes `agentstate.yaml`), `bin/fusion-commit-lock` (appends the commit event, probes `agentstate.yaml`), `bin/fusion-session-domain` (reads `agentstate.yaml`), and `bin/fusion-cadence-anchor` on a `.cadence-anchors` row that was missing altogether while `rules/workbench-tracking.md` already classed the file as root-anchored. Cost: +250 bytes always-on (49 851 -> 50 101); golden regenerated; the citation pin re-approved 1477/207 -> 1508/208, of which +7 paths is this step's by single-file revert, the rest pre-existing drift stated on the `BASELINE` line.
