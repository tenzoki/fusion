The live workbench is split across two layouts mid-conversion

---
This project's own `fusion-workbench/` now holds artifacts in **both** layouts at once: the pre-v4 type folders at the root (`issues/`, `decisions/`, `planning/`, `history/`, …) and a new `shared/issues/` containing one file.

**Cause.** The moment commits `1d97c86` (14 agent prompts) and `b9dd6a8` (6 skills) landed, every dispatched agent began resolving its write targets through `bin/fusion-paths`, which returns `shared/…` when no Circle is active. The live workbench, however, is still pre-v4 — its migration is task P-9, which the plan sequences *after* P-8. So there is a window, currently open, in which converted agents write into a store the workbench does not yet have. `mkdir -p` creates it silently.

Observed: `260717-0107[o]-prompt-gaps-surfaced-by-fusion-paths-key-set-derivation.md`, filed by `coder` during task T3-A. The agent behaved correctly; the sequencing is what is wrong.

**Gap in the plan.** The plan's risk table names this drift ("Die 26 Dateien driften während der Umstellung auseinander und schreiben zwischenzeitlich in zwei Layouts") and mitigates it with "the lint gate does not let a half-converted state through `npm test`". That mitigation protects the **code**. It does not protect the **live workbench**, which is a different artifact with a different lifecycle, and which this repo happens to be dogfooding at the same time. The orchestrator did not catch this when sequencing the turns, and dispatched four conversions before the migration.

**Consequence.** Bounded. P-9's migration moves the root type folders into `shared/`, and it already handles the destination-exists case: it moves entry-by-entry and refuses collisions loudly rather than overwriting (that behaviour was built for exactly this shape in commit `138cd46`). So P-9 will merge rather than move cleanly, and any filename collision between `issues/` and `shared/issues/` surfaces to the user rather than silently resolving. No artifact is at risk of loss.

**Not fixed here, deliberately.** Two candidate answers, and choosing between them is a sequencing decision rather than a defect fix:
1. Run P-9 earlier — the moment the conversions land — so the window never opens. Cost: the migration then runs before the lint gate proves the conversions are complete.
2. Accept the window and let P-9 merge. Cost: a merge instead of a clean move, and the plan's step 9 acceptance criterion ("this Circle's files move into the Circle, the rest stays in `shared/`") gets slightly muddier.

Relevant beyond this repo: any project that upgrades fusion mid-session hits the same window. `/fusion:setup`'s migration (step 0c) is what closes it, and setup runs at session start — so for a normal user the window is closed before any agent is dispatched. This repo is unusual in that it converted the prompts *while a session was running against the workbench they describe*.

---
Found by the orchestrator while verifying task T3-A.
Source: 260716-1910[p]-plan-workbench-umbau-circle-container.md (risk table; steps 4-7 vs step 9 ordering)

---
Resolved: no longer reproducible, and the general case is gated. This repository's workbench holds
exactly four top-level directories — `archive/`, `circles/`, `shared/`, `stilwerk/`. Not one pre-v4
type folder remains, so the two-layout window this record describes is closed here.

The lesson the record drew for other projects is implemented: `skills/setup/SKILL.md:41` carries a
`### Pre-v4 layout check (CRITICAL — refuse, do not migrate)` that runs **before** the `mkdir`, and
`:45` cites this very record as the reason the ordering matters. Setup detects and refuses, routing
the user to `/fusion:migrate`; it never creates the second store beside the first.

Verified by reconciler at HEAD `e2a34f0` by listing the workbench and reading the check, not by
carrying the previous verdict. Queue entry `C2` of `fusion-workbench/tasklist.md` reached the same
verdict and left the marker call here.
