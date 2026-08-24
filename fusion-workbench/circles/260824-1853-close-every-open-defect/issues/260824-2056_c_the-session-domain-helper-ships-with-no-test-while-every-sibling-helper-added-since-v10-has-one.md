The session-domain helper ships with no test, while every sibling helper added since v10 has one
---
`bin/fusion-session-domain` (commit `1ea8fed`, step 7) is verified only by the coder's manual probe recorded in `circles/260824-1853-close-every-open-defect/history/260824-2040-coder-step-7-bin-helpers.md` ("probed: in this repo `domain=code source=agentstate`; no workbench exit 3; missing file, missing key and a bad value each print the default with a stderr reason; usage exit 2"). Nothing under `hooks/lib/__tests__/` runs it: `grep -l fusion-session-domain hooks/lib/__tests__/*.ts` returns only the reference-lint baseline comment. `bin/fusion-identity`, `bin/fusion-paths` and `bin/fusion-prose-metric` each have a test file that drives the script in a fixture project. The helper has four documented exits and a five-way stderr case split, exactly the shape a fixture test pins cheaply, and the two header defects filed beside this record (the `session:`-scope claim and the uncaptured-value message) would both have surfaced under one.
---
**Filed by:** coderev (person half absent: the installed plugin at `$FUSION_PLUGIN_ROOT` carries no `bin/fusion-identity`, so attribution was dropped rather than composed)

Constraint the fix meets: the hook-test line budget stood at 10 lines of head-room after step 7 (`surface-growth-bound.test.ts`), so a new test file costs a cut elsewhere in the same step, per `README-hooks.md` `### Growth bounds on the shipped text`.

Fix direction: one `fusion-session-domain.test.ts` with a fixture workbench: quoted and bare `data`, missing file, missing key, invalid value, `domain:` under a non-session block, no workbench (exit 3, empty stdout), one argument (exit 2).

Severity: Medium.
---
Resolved: fixed — `hooks/lib/__tests__/fusion-session-domain.test.ts` drives the script in a fixture workbench over quoted and bare `data`, the four fallback reasons (missing file, missing key, invalid value, uncapturable value) plus a deeper-nested key, the first-two-space-key bound, exit 3 with empty stdout and exit 2; its 78 lines were paid for by rolling 92 lines of the reference-resolution re-approval log into `shared/analyses/260824-2121-reference-resolution-pin-re-approval-log-entries-26-to-40.md`; `cd hooks && npx vitest run lib/__tests__/fusion-session-domain.test.ts`
