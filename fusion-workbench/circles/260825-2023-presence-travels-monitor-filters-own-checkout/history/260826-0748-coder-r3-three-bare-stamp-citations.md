# R-3 — Three bare-stamp citations become full wildcarded paths

**Status:** Complete
**Agent:** coder
**Filed by:** coder, Kai Stalmann <ks@qantr.com>
**Checkout:** 5e8248d7
**Date:** 2026-08-26 07:48
**Circle:** 260825-2023-presence-travels-monitor-filters-own-checkout
**Closes:** `circles/260825-2023-presence-travels-monitor-filters-own-checkout/issues/260826-0139_*_three-citations-added-in-this-range-name-a-record-by-its-bare-stamp-a-day-after-the-rule-forbade-it.md`

## What changed

Three citations written on 2026-08-25 named a workbench record by its bare timestamp, a day after
`rules/fusion-workbench-conventions.md` `## Filename Patterns` retired that form. Each now carries
the full workbench-relative path with the state marker wildcarded.

| Site | Was | Is |
|---|---|---|
| `CLAUDE.md:43`, the `bin/fusion-events` Layout row | ``(issue `260823-1302`)`` | ``(issue `circles/260823-0023-settle-what-travels-between-checkouts/issues/260823-1302_*_the-monitor-attributes-a-merged-event-log-to-one-session-and-reports-another-checkouts-state.md`)`` |
| `CLAUDE.md:43`, same row | ``per decision `260810-0921` `` | ``per decision `shared/decisions/260810-0921_*_how-should-a-prompt-call-a-bin-helper-that-the-installed-copy-may-not-have.md` `` |
| `README-hooks.md:192`, the `lib/events-query.ts` row | ``(issue `260823-1302`)`` | the same issue path as the first row |

The marker is wildcarded rather than spelled: the issue carries `_c_` today and the decision `_i_`,
and a citation that named either letter would dangle at the next transition.

## Why the first and third needed a reading, not a lookup

`260823-1302` is carried by **three** files in that Circle, and this is the collision the rule was
written against rather than an illustration of it:

- `circles/260823-0023-settle-what-travels-between-checkouts/issues/260823-1302_*_the-monitor-attributes-a-merged-event-log-to-one-session-and-reports-another-checkouts-state.md`
- `circles/260823-0023-settle-what-travels-between-checkouts/analyses/260823-1302-two-checkouts-one-event-log-and-what-the-monitor-makes-of-it.md`
- `circles/260823-0023-settle-what-travels-between-checkouts/history/260823-1302-c2-step-9-two-checkout-transport-verification.md`

The bare stamp identified none of them. What picked the issue was the surrounding prose, which says
the word "issue" — a reading of the sentence, available to a person and to no gate. Both resolutions
were checked against the tree with `find` before either was written, and both target files were
confirmed present after.

## Scope: no sweep

The same two tables carry older bare stamps that predate the rule, `CLAUDE.md:44`'s second
`260810-0921` among them. The record claimed only the three this range added and the task claimed
only those three, so the rest stand untouched; `git diff --stat` is two files, one line each. A
sweep is defensible and is a separate unit of work — it would need its own record, because it
touches rows nobody in this Circle wrote and its cost is a corpus-wide `find` per stamp, not a
lookup.

## Gates

- `cd hooks && npx vitest run lib/__tests__/workbench-citation-lint.test.ts` — **exit 0**. This is
  the gate that judges the change: it recomputes its corpus every run and holds no baseline. Note
  that neither edited file is *in* that corpus — it reads live workbench records — so what it
  actually judged here is the record closure below, whose `Resolved:` note cites both new paths.
- `cd hooks && npx vitest run lib/__tests__/reference-resolution-lint.test.ts` — **exit 0**, run
  before and after the edit. The `BASELINE` pin did not move and was not touched: it counts plugin
  paths and heading anchors, and a workbench record citation registers in neither class.
- `cd hooks && npm test` — exit 1, one failing file, and it is not this task's.
  `surface-growth-bound.test.ts` reports the hook-test line golden at 20375 -> 20112, entirely in
  `guard-bash-integration.test.ts` (393 -> 304) and `guard-project-config-integration.test.ts`
  (423 -> 249), a sibling task's in-flight cut in `hooks/lib/__tests__/`. Nothing this task touched
  is in any of the four growth-bound surfaces. Reported rather than repaired: regenerating that
  golden would take the sibling's uncommitted measurement.

## Record closed

`circles/260825-2023-presence-travels-monitor-filters-own-checkout/issues/260826-0139_*_three-citations-added-in-this-range-name-a-record-by-its-bare-stamp-a-day-after-the-rule-forbade-it.md`
— `Resolved:` note appended, marker `_o_` -> `_c_`.
