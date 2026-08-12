# Analyst session 260812-0303 — the largest consuming project, read for the first time

**Status:** Complete
**Agent:** analyst
**Domain:** code
**Trigger:** orchestrator dispatch, following `shared/analyses/260812-0022-where-the-complexity-comes-from-and-what-would-have-to-go.md`
**Report:** `fusion-workbench/shared/analyses/260812-0303-the-largest-consumer-read-for-the-first-time.md`

## What was asked

Read `unite-co-creator`, fusion's largest consuming project, and answer seven questions: the
domain-versus-tooling ratio of its workbench, where fusion failed the user, how long operations
take, whether rules decay within a session, whether the prior analysis's eight removal candidates
survive contact with a real consumer, how the guard behaves in the field, and what the project
needed that fusion does not offer. Two of the removal candidates, `investigator` and `consultant`,
were contested by the user and had to be tested against his stated belief.

## What was read

`/Users/k1/Projects/productive/unite-co-creator`, strictly read-only. 2,759 commits, 1,689 session
logs, 1,148 issue records, 68 decisions, 133 analyses, 102 reviews, 79 consultations, 4 Circles, a
43 MB archive, plus `CLAUDE.md`, `MARTIN.md`, `fusion-guard.json`, all of `rules/`, `skills/`,
`.claude/`, `tools/plane-push-with-spec` and the Makefile header.

Timing evidence came from `krk` (`orchestrator-events.jsonl` and the 18 MB
`.guard-state/events.jsonl`), because `unite-co-creator`'s runtime state is gitignored and did not
survive the clone.

Four parallel read passes were dispatched over the corpus. Every quote they returned was
re-verified against the source file before use in the report.

## Read-only verification

Nothing was written into the target project. Its working tree was `git status --porcelain` clean at
the end of the read, and no `.guard-state/` directory was created there, because the hooks
correctly no-opped in the absence of a `.fusion-setup` marker.

## Headline findings

1. **The observation channel was never broken; it was never built.** 36 MB of git-tracked records
   sat on this machine unread for four and a half months.
2. **The workbench is comparable in size to the product**, at 445,729 lines of markdown against
   363,873 lines of Go and TypeScript, and 19 percent of all line churn. But 87 percent of it is
   about the product and only about 3 percent is about fusion.
3. **fusion's default protected-path list contains `rules/**`**, which in a consuming project means
   the project's own documentation. 53 records exist because of it. The guard raised zero halts in
   143 days; its threat did all the damage.
4. **Setup takes 3.9 minutes.** The 23-minute median gap between Setup and the first work event is
   what the user is actually feeling.
5. **Rules do not decay within a session.** Compliance improves with elapsed time on the metric
   with usable sample size.

## Contradictions recorded

Against the prior analysis: the Plane mirror, `investigator`, `consultant` and `taskplanner` were
all recorded as unused in two projects and all four were used here. `conceptrev` returned 29 runs
and zero adverse verdicts, which argues against keeping it at a gate.

Against the user: Setup is not slow, the rules do not decay, `investigator` ran four short
single-hypothesis passes rather than large complex hunts, and `consultant` has run four times in 67
days after fifty in May. Worse than he believes: six workbench records were deleted with no archive
destination, and two of them were the bug reports about a fusion defect that then survived them.

## Filed

Nothing. Nine records could have been filed. Six are decisions for the user rather than defects for
an executor, and adding to the backlog is the condition that prompted the question. The report
recommends a Directive instead.

## Written

- `fusion-workbench/shared/analyses/260812-0303-the-largest-consumer-read-for-the-first-time.md`
- this file
