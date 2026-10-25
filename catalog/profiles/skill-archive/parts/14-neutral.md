
## Record states

A record's state is the `status` of its control file, which only the codec writes; a marker left in an old file name encodes none (`rules/fusion-workbench-conventions.md` `## Terminal states are history` lists each kind's terminal set). **Terminal** means a record rather than live work, and only terminal records bulk-archive without per-file review: `done` and `dropped` for a work package, `closed` for an issue or plan, `implemented` and `superseded` for a decision. **Terminal is not archive-class:** `deferred` is terminal and is still excluded from every tier (safety filter 2).

## Safety filters (apply to ALL modes)

These are non-negotiable defaults. The user can override them at the `refine` step in natural-language mode, but the tier modes treat them as hard guardrails.

1. **Reserved — never archive.** The root-anchored surfaces, because their consumers read them at fixed paths and none has a fallback (`rules/fusion-workbench-conventions.md` `## fusion-workbench Layout`):
   - `$WORKBENCH/orchestrator-events.jsonl`
