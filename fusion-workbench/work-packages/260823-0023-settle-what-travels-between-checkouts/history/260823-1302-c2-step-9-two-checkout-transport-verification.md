# Session: C2 step 9, the two-checkout transport verification

**Date:** 2026-08-23 13:02
**Agent:** analyst
**Status:** Complete
**Circle:** `260823-0023-settle-what-travels-between-checkouts`
**Dispatched by:** orchestrator, plan step 9

## What was asked

Run step 9 of `260823-0800_*_c2-what-travels-between-checkouts-is-settled.md`: build a two-checkout harness the way C1 built its own, answer the Circle's last acceptance criterion, answer the specification's open question about `bin/monitor`, and file rather than repair anything found. No source change.

## What was done

Built a scratch project outside the repository with a full workbench under this repository's own `fusion-workbench` `.gitignore` block, a local bare remote and three clones. Ran `/fusion:setup` Step 0h and the Step 0 marker write in the clones, both extracted verbatim from `skills/setup/SKILL.md` by script rather than retyped. Simulated one session per clone as event lines in the emitted schema plus one record under a store, pushed both, and pulled each into the other. Accounted for every line against the input rather than against an output.

For the monitor question, extracted `computeETA` and `parseUTCTs` verbatim from `bin/monitor` and ran them under node against four log states, and ran `bin/monitor` itself as a server against a clone's workbench, reading `mode` and the event window over `/api/dashboard`.

Also measured the two supplementary questions the dispatch named (`.fusion-setup` on a second Setup run, `portfolio.md` in the clones' indexes) and re-ran `npm test` in a fresh clone of this repository to confirm the `e7454e3` blocker stays fixed.

The scratch tree was deleted at the end.

## Result

Both trees hold all 19 lines and the two files are byte-identical. No conflict, no hand editing, both pulls exit 0. The two supplementary measurements hold, and the fresh clone runs 724 tests green.

The `bin/monitor` dependence is real and sharper than the question assumed. A running monitor reported `mode: 'done'` while its own checkout had a task in flight, and the ETA disappeared for as long as the other checkout's `session_end` timestamp stood ahead of local time. Sorting by `ts` does not repair it, because no emitted event line carries a session or checkout identity. Filed as one defect rather than four, and not repaired: plan step 9 excluded the repair by name.

## Artifacts

- Report: `260823-1302-two-checkouts-one-event-log-and-what-the-monitor-makes-of-it.md`
- Defect filed: `260823-1302_*_the-monitor-attributes-a-merged-event-log-to-one-session-and-reports-another-checkouts-state.md`

## Bounds

No orchestrator ran in either clone; the sessions were simulated. Both remotes were local, and the workbench was small. All three bounds are stated in the report's `## Scope` and carried into its `## Open Questions`.
