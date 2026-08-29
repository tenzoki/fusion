# Tasklist update — the whole-workbench defect triage

**Agent:** taskplanner
**Run:** 2026-08-15 22:48
**Domain:** code
**Scope:** mode `issues` — every open (`_o_`) or in-progress (`_p_`) defect record in the workbench
**Tree read at:** `d33cd22` (working tree clean apart from three in-flight session files)
**Suite at the time of the scan:** green, 40 files / 751 tests, `cd hooks && npm test`

## What was scanned

| Store | Records read |
|---|---|
| `shared/issues/` | 80 |
| `circles/260815-0007-remove-eight-mechanisms-and-cap-growth/issues/` | 48 |
| `circles/260801-1244-curator/issues/` | 20 |
| `circles/260813-0910-documentation-matches-shipped-plugin/issues/` | 10 |
| `circles/260813-0858-playmaker-maintains-backlog-store/issues/` | 7 |
| `circles/260801-1244-guard-rules-write/issues/` | 6 |
| `circles/260807-0923-guard-misst-statt-orakelt/issues/` | 2 |
| `circles/260805-2005-textschicht-gegen-code-nachziehen/issues/` | 1 |
| `circles/260719-1536-plane-mirror-integration/issues/` | 1 |
| **Total** | **175** |

`bin/fusion-paths taskplanner` resolves `SCAN_ISSUES` to `shared/issues` alone, because no
Circle is active. The 95 records in the eight Circle stores were reached by walking
`circles/*/issues/` directly, as the dispatch instructed. Every one of those eight Circles
carries a terminal record marker (`_c_`, `_b_` or `_s_`), so none of the 95 would be reached
by any ordinary agent dispatch.

Also scanned for context, not queued (the dispatch scoped this run to defect records):
2 open plans, 11 open decision records (user-input gates), 13 answered decision records
whose implementation may be queueable.

## Triage outcome

| Class | Count |
|---|---|
| Routable — a real defect, still true at HEAD, with an identifiable fix | 108 |
| Moot — the mechanism it was filed against is gone, or somebody already fixed it | 32 |
| Needs a decision first — a choice the user has not made | 33 |
| Too large for a task — implies a design change | 2 |

The 108 routable records group into **86 tasks**, because several records name the same file
and the same pass. The practical cut for 12 Turns falls at **task 36**.

Each record was re-verified against the tree rather than trusted on its own
`**Verified at HEAD**` stamp. That mattered: a substantial share of the moot class is not the
eight-mechanism removal at all but work already done by the reconciliation and curator passes
of the last two days, which the records did not know about.

## Head-room on the four bounded surfaces, measured at `d33cd22`

| Surface | Baseline | Now | Spent | Head-room | Left |
|---|---:|---:|---:|---:|---:|
| always-on rule set (5 files) | 86 573 B | 88 679 B | 2 106 B | 12 000 B | **9 894 B** |
| `agents/*.md` | 399 843 B | 399 843 B | 0 B | 18 000 B | **18 000 B** |
| `skills/*/SKILL.md` | 220 439 B | 221 336 B | 897 B | 20 000 B | **19 103 B** |
| `hooks/lib/__tests__/**.ts` | 19 453 L | 19 453 L | 0 L | 2 500 L | **2 500 L** |

The whole 2 106 bytes already spent on the always-on set sit in
`rules/fusion-workbench-conventions.md` (52 027 → 54 160). The other four are at or below
their baselines.

**The bounds do not constrain this session.** Summing the estimated byte direction over the
entire routable set: about +930 B on the rules surface, +3 200 B on `agents/`, +1 400 B on
`skills/`, +455 lines on the tests. Every figure is well inside its budget even if all 108
records were fixed. The binding constraint is Turns, not bytes. The one worth watching is the
test surface: eighteen of the routable fixes are "add a lint", and together they would spend
about 18 % of that budget in one session.

## The queue as reported to the dispatcher

Ranked by user-facing capability first (Axis 1, `code` domain), then by severity, blocking
relationships and age (Axis 2), with net-removing and byte-neutral fixes preferred ahead of
net-adding ones where dependencies allow. Tasks 1-36 are above the practical cut for 12
Turns; 37-86 are ranked below it.

The full ordered queue, the dependency graph and the three non-queued classes were returned
in the run's report. This entry records the measurement and the counts; the queue itself is
the caller's to hold and the orchestrator's to persist in `agentstate.yaml`'s `work_queue`.

### Above the cut, by tier

1-6 user-facing capability (monitor unreachable on localhost; Setup replacing a project's
permission mode; the setup marker unclassified so a fresh clone has no fusion; the
marketplace entry advertising five removed mechanisms; `/fusion:direct` promising a dialogue
its sub-agent cannot hold; German literals in skill bodies that ship to every project).

7-10 the instruments this session is bounded by (the hook-test growth bound missing a
directory; the always-on conventions file stating a false exclusion count; the net-negative
circuit breaker comparing incompatible units; the growth-cap header's unreproducible rate
figures, which is net-removing).

11-17 skill-body coherence, mostly one file per pass.

18-30 orchestrator prompt correctness, including the two check-in placement defects and the
resume path that never asks whether the Turn it skips past was reviewed.

31-36 the review-coverage subsystem, the citation and enumeration gates, and the two rule
files that need a new paragraph.

### Blocked

One routable task is blocked on an unanswered decision: the `**Initiated by:**` termination
rule cannot be written until the shaper's audit-line self-test question
(`260814-1915_*_…`) is answered, because option 1 of
that decision rewrites the same row.

## Note for whoever runs the queue

`260814-2118_*_the-hooks-suite-fails-differently-on-repeated-full-runs…` is
routable and unfixed: the suite still loses a whole test file at roughly 1 in 12 concurrent
runs. `agents/coder.md` requires a clean exit from the whole suite before an executor may
report "done", so that flake will produce false "blocked" reports during a long session. It
is ranked as an analyst investigation rather than a fix, because the cause is not established.
