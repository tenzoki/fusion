# Prior hand-over package E: bundle payload with the helper runtime and the lifecycle hooks (H8 payload part, H9)

## Directive

Split off package `261023-1846-prior-full-surface-handover-h1-to-h9` on the user's word, 2026-10-23: answer "1" to the plan approval approved the plan and its five-package split (`## Proposed split`).

## What the work is

The bundle payload carries the installed plugin tree (decision D4, option 2) and the lifecycle hooks with the plugin files they read; the hook rows keep going to `orchestrator-events.jsonl` (decision D1, option 1).

The steps are those of `261023-1854-plan-prior-full-surface-handover-h1-to-h9.md`, cited by number and kept as anchors: steps 19, 20 and 21. Their Files, Changes, Acceptance and Verification lines are this package's brief; its own plan carries them by citation.

## Depends on

Step 16 of package A only (the Prior build pin), not the whole package; no package-level edge is set, so the start waits on that step by reading, not by the graph.

## Closure

Closed `done` (outcome `completed`) on 2026-10-26 by the orchestrator, at the user's word, all seven stop conditions confirmed as holding. Commits: `9bb1751e` (step 20, hook payloads), `ec3d9597` (step 19, install tree and lifecycle_hooks), `4e53b552` (step 21, hook-layout conformance), closing review `5bbbe40e` (verdict accept, range `ec6c968e..4e53b552`, which also covers package C's fix `db315ce3`). Coverage gap: none in the range; the review commit itself is workbench-only. Still open, carried into package F: the four payload choices step 19 made beyond the plan, which request 76 must state (medium), and the hook-payload README order (low).
