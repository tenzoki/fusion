# Planner — amendment of the cut plan against the two G1 answers

**Date:** 2026-09-09
**Agent:** planner
**Filed by:** planner, Kai Stalmann <kai@qantr.com>
**Circle:** 260909-1700-cut-fusion-to-working-minimum

## What was asked

Amend `260909-1843_*_implementation-cut-fusion-to-a-working-minimum.md` in place against the two
decisions answered at gate G1, without renumbering steps and without growing the plan beyond what the
change requires.

## What changed

The dashboard answer needed one carrier and one renderer, and both were folded into steps that
already existed rather than added as new ones, so the step count stayed at 21 and the four session
boundaries did not move. B3 gained the `work_item` field; B4 gained `bin/monitor` as its fourth
reader; C0 gained the fifth check; C1's re-sourcing became a removal; C2 gained the one dispatch line
the field reads. The ceiling answer resolved C6's conditional to a stdout verdict, `bin/fusion-plan-size`,
with no test bound.

The substantive question the amendment had to settle was what "pending" means once the Turn loop and
the work queue are gone. The answer written into B3 is that no session-scoped pending set survives:
the running task is already carried by the row today, the claimed work item is the only addition, and
the monitor's Up Next panel renders nothing rather than an empty list. A hook that scans the backlog
store for claimed items was considered and rejected in the plan text, because it returns a set.

## Measurements

- Plan: 41 709 → 49 923 bytes.
- Em-dash rate: 7.1 per 1000 prose words before, 6.8 after (`bin/fusion-prose-metric`). The file was
  already over the ceiling of 5 before the amendment; the rate fell.
- `npx vitest run workbench-citation-lint plan-stopping-section-lint marker-format-lint`: 40 passed,
  1 failed — the pre-existing basename collision filed as
  `260909-1455_*_an-analysis-and-its-history-file-share-one-basename-and-the-citation-gate-is-red.md`,
  which this amendment neither caused nor touches.

## Filed

Nothing. No new defect and no new decision arose; the one defect met was already on file.
