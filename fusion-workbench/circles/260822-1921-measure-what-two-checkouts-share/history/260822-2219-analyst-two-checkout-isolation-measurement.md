# Session: measure what two checkouts of one project share

**Date:** 2026-08-22 22:19
**Agent:** analyst
**Status:** Complete
**Circle:** `circles/260822-1921-measure-what-two-checkouts-share/_t_circle.md`
**Dispatched by:** orchestrator, as the Circle's single measuring task
**Git HEAD at start:** `f90de0c`

## What was asked

Capability C1 of `shared/planning/260822-1136_*_spec-fusion-becomes-a-multi-user-tool.md`: establish from measurement, not from reasoning, whether two checkouts of one project produce two isolated workbench states. Two arrangements, every entry of the spec's four-class state partition, plus four named questions about a fresh clone, an agent before Setup, the nested case, and two trees holding one Circle active.

## What was done

Built two scratch projects under `/tmp/fusion-c1-measure/`, each with a git repository and a fully populated fusion workbench: one tracking its workbench under this repository's split, one ignoring it entirely. Gave each a bare remote. From those, built a sibling clone, a sibling worktree, two further clones for the push measurements, and four nested placements.

Measured, in this order: per-entry identity by device and inode across the three trees, plus a write-independence test; git plumbing of a worktree versus a clone; `bin/fusion-workbench-root` in nine trees; `bin/fusion-paths analyst` in five; `bin/fusion-session-mark` and `bin/fusion-commit-lock` across sibling and nested pairs; two pushes of one Circle record, same region and different region; the event log with and without a `merge=union` driver; and the Setup marker write reproduced verbatim inside a clone.

Read `bin/fusion-workbench-root`, `hooks/lib/workbench-root.ts`, `hooks/lib/events.ts`, `hooks/lib/guard-state-file.ts`, `bin/fusion-commit-lock`, `skills/setup/SKILL.md` Step 0, `rules/workbench-tracking.md`, `rules/fusion-workbench-conventions.md` `## fusion-workbench Layout`, and the four decision records and one spec the Circle's Grounding names.

The scratch tree was deleted at the end. Nothing was created inside the repository outside this Circle's own stores.

## Outcome

The premise holds for both intended arrangements. The three-way question resolved into two answers only: a tracked entry arrives as an independent file, an ignored entry does not arrive. No second tree ever received the first tree's copy. The one failure is the nested placement, and only where the second tree carries no `.fusion-setup` of its own, in which case it resolves to the parent's workbench entirely, including the active Circle, the guard state and the commit lock. Per the Circle's Grounding that case is documented and is not a blocker.

Two normative statements were measured false. `.fusion-setup` is not written once and carries the checkout's absolute path; `.asset-provenance`, its sibling in the same partition class, does behave as claimed.

## Artifacts

- Report: `circles/260822-1921-measure-what-two-checkouts-share/analyses/260822-2219-what-two-checkouts-of-one-project-actually-share.md`
- Defect: `circles/260822-1921-measure-what-two-checkouts-share/issues/260822-2219_o_the-tracked-setup-marker-is-rewritten-by-every-setup-and-carries-the-checkouts-absolute-path.md`
- Open decision: `circles/260822-1921-measure-what-two-checkouts-share/decisions/260822-2219_o_what-does-a-second-checkout-do-with-a-circle-record-marked-active-that-it-never-activated.md`

## What is left

The addendum to `shared/decisions/260822-1610_*_how-does-fusion-support-several-people-working-one-project-at-once.md` is the orchestrator's next task and was deliberately not written here.
