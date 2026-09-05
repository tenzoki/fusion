Agent-setup rule states that every fusion-paths value joins to $WORKBENCH
---
**Filed by:** coder, Kai Stalmann <ks@qantr.com>
**Status:** Complete

Defect closed at its named acceptance site: `260828-1041_*_a-coder-dispatch-wrote-its-history-entry-to-shared-history-at-the-project-root.md`.
The record's acceptance names `rules/agent-setup.md` `## What fusion-paths emits` and asks that
the join be stated where the joining agent reads. Both reconciliation passes recorded on that
record found the file silent on it; `grep -n 'joins\|relative to'` was empty before this change
and now returns line 33. The record itself was not edited; the orchestrator closes it.

## What changed

`rules/agent-setup.md` `## What fusion-paths emits`, one sentence added beside the existing
write-target/read-target statement:

> Every value except `WORKBENCH`, which is absolute, is **relative to `$WORKBENCH`** and is
> joined to it, never to your working directory; a cwd join writes a stray store beside the
> workbench that no staging list names.

The paragraph's remaining lines were re-wrapped, no words changed. Both facts already hold in
`rules/fusion-workbench-conventions.md` `## Path Resolution` -> Contract; nothing there was edited.
The trailing clause carries the observed consequence rather than a second rule: the original
misplacement surfaced as `git add` reporting "pathspec did not match" against a staging list that
named the workbench path.

## Cost

`rules/agent-setup.md` 3 963 -> 4 181 bytes, +218. It is always-on, so that is paid by every
dispatch. The hard-bounded universal core (`agent-setup.md` + `fusion-workbench-conventions.md` +
`critical-stance.md`) baselines at 65 498 bytes and measured 71 948 before the edit, 72 166 after,
against 12 000 of head-room: 5 550 free before, 5 332 after. No baseline number was touched.

`hooks/lib/__tests__/fixtures/rules-emission.golden` was regenerated, which is the documented
consequence of any always-on rule edit (`README-hooks.md` `### Growth bounds on the shipped text`).
Its diff is the `agent-setup.md` line and each agent's total, every one of them +218. This was
outside the dispatch's stated scope and is reported to the orchestrator as such; the fixture is
contended by no sibling (`git status` over `hooks/lib/__tests__/` names four modified test files
and not this one), and leaving it stale would have left `npm test` red on a mismatch nobody else
introduced.

## Verification

`cd hooks && npx vitest run lib/__tests__/rules-emission-golden.test.ts`, exit 0, 12 passed.

The run still prints the pre-existing role-budget report for the playmaker role (43 456 bytes
against a 42 377 budget, carried by `circle-records.md`). It reports and never blocks, it stood
before this change with identical figures, and none of its files is in the always-on core.

Nothing was staged or committed; `hooks/dist/` was not rebuilt.
