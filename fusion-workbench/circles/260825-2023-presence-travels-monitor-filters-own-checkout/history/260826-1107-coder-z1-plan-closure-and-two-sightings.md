# Z-1: the plan closes with its own arithmetic corrected, and two shared records take a second sighting

**Date:** 2026-08-26
**Agent:** coder
**Person:** Kai Stalmann <ks@qantr.com>
**Checkout:** 5e8248d7
**Circle:** `circles/260825-2023-presence-travels-monitor-filters-own-checkout`
**Turn:** 3
**Status:** Complete

## What was asked

Close the C4 plan, correct two acceptance criteria whose counts were wrong, and append a
repeat-sighting note to the two shared defect records this session independently witnessed.
Bookkeeping only: no test file, no prompt, no hook source, no golden, no baseline.

## What was done

**The plan is closed.** All eleven implementation steps already read `[DONE]`, so per
`rules/fusion-workbench-conventions.md` `## Inline State Tracking` the header field moved to
`**Status:** Complete` and the filename marker `_o_` to `_c_`. The rename went through `git mv` and
both paths were then unstaged by name, because the orchestrator holds the commit and the index is
shared.

New filename:
`circles/260825-2023-presence-travels-monitor-filters-own-checkout/planning/260825-2140_c_c4-presence-travels-and-the-monitor-reads-its-own-checkout.md`

**Criterion 5, four to five.** The clause required every site that prints or defines the Turn count
to read one implementation and said there were four. The Turn 2 code review found a fifth at
`agents/reconciler.md:21`, filed as
`circles/260825-2023-presence-travels-monitor-filters-own-checkout/issues/260826-0906_*_a-fifth-turn-count-definition-site-still-reads-the-whole-file-and-names-no-implementation.md`
and converted in `6deeb33`. The number moved and the requirement did not; the clause now records that
its own count was wrong and how the fifth was found.

**Criterion 6, three to six.** The clause said three defect records were referred here. The plan
refers six by path, which I enumerated with a grep over the plan rather than trusting either number.
Four are discharged: `260823-1110_*_the-merge-driver-unsorts-...` and
`260823-1302_*_the-monitor-attributes-...` closed in
`circles/260823-0023-settle-what-travels-between-checkouts`, and both `260825-2140_*` records closed
in this Circle. Two are not, and the clause now names them. The miscount is stated in the clause
rather than silently repaired, because a criterion that was wrong about its own scope is worth a
reader knowing about.

**Two shared records took a second sighting each**, in the one-line
`Also seen: YYMMDD-HHMM by <agent>` form plus a paragraph saying what was not discharged and why.
Both keep `_o_`; a note is not a closure.

`shared/issues/260825-1329_*_every-session-runs-one-release-behind-on-a-bin-helper-the-same-repository-just-added.md`
— verified rather than carried over: `bin/fusion-events` entered the work tree at `97407df`, earlier
in this same Circle, and `~/.fusion/bin/fusion-events` does not exist, so the orchestrator's Setup
took the `[ -x ]` miss branch and fell back to a hand-scoped read of the log. The guard behaved as
`shared/decisions/260810-0921_*` intends. What the instance adds is that the lag now reaches the
helper this Circle built.

`shared/issues/260825-1430_*_the-event-log-froze-at-turn-2-while-the-dashboard-stayed-current-inverting-the-diagnostic-six-instances-rest-on.md`
— read off the file: line 2357 of `fusion-workbench/orchestrator-events.jsonl` is `task_start` turn 2
task P-5 at `2026-08-25T23:58:18`, the next line is the resuming session's `session_start` at
`2026-08-26T04:47:27`, and `dad5042` for that task was committed between them at
`2026-08-26T00:11:57Z`. The resuming session derived its own progress from git, and its `task_done`
line says so in its `detail` field.

## One correction I made to my own work

My first append to the 1329 record cited
`shared/decisions/260810-1544_*_wie-weit-reicht-die-work-tree-praeferenz-im-eigenen-repo.md`. That
slug does not exist: I composed it from the surrounding prose instead of reading it. The real record
is
`shared/decisions/260810-1544_*_should-prompt-called-bin-helpers-get-one-guarded-call-convention-and-does-the-work-tree-preference-extend-to-them.md`,
and it was corrected in the same working-tree state, before verification. The citation lint would
have caught it; the point is that it should not have needed to, one day after this Circle closed a
defect about exactly this class of citation error
(`circles/260825-2023-presence-travels-monitor-filters-own-checkout/issues/260826-0139_*_three-citations-added-in-this-range-name-a-record-by-its-bare-stamp-a-day-after-the-rule-forbade-it.md`).

## Files changed

- `fusion-workbench/circles/260825-2023-presence-travels-monitor-filters-own-checkout/planning/260825-2140_c_c4-presence-travels-and-the-monitor-reads-its-own-checkout.md` (renamed from `_o_`, `**Status:**` and criteria 5 and 6 edited)
- `fusion-workbench/shared/issues/260825-1329_o_every-session-runs-one-release-behind-on-a-bin-helper-the-same-repository-just-added.md` (appended)
- `fusion-workbench/shared/issues/260825-1430_o_the-event-log-froze-at-turn-2-while-the-dashboard-stayed-current-inverting-the-diagnostic-six-instances-rest-on.md` (appended)

## Verification

`cd hooks && npm test` — exit 0. 44 test files, 776 tests, all passed. Nothing staged; `git diff
--cached --name-only` is empty.
