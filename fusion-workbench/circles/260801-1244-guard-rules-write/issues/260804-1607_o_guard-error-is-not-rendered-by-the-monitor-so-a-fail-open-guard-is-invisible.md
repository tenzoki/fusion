# `guard_error` is not rendered by the monitor, so a permanently fail-open guard shows nothing on the dashboard

---

**Severity:** Low
**Domain:** code
**Filed by:** analyst, independent assessment A1 of C5b
**Affects:** `bin/monitor:91-102` (`WARNING_EVENT_TYPES` and `ADVISORY_EVENT_TYPES`); emitters at `hooks/guard.ts:904` and `hooks/tracker.ts:202`
**Cross-references:**
`circles/260801-1244-guard-rules-write/analyses/260804-1600-c5b-independent-assessment.md`,
`circles/260801-1244-guard-rules-write/issues/260804-1603_o_the-project-config-layer-is-not-type-validated-so-a-wrong-type-fails-the-guard-open.md` (which makes this state project-triggerable),
plan `260802-1856_o_plan-guard-rules-write.md` Step 5 (which added `guard_advisory` to the same list)

---

## What is wrong

Both hooks fail open on an unexpected exception and record it:

```
hooks/guard.ts:904     emitEvent("guard_error", …, `Guard error (fail-open): ${err}`)
hooks/tracker.ts:202   emitEvent("guard_error", …, `Tracker error (fail-open): ${err}`)
```

`bin/monitor`'s `WARNING_EVENT_TYPES` is `churn_warning`, `churn_critical`,
`cross_file_warning`, `cross_file_critical`, `guard_block`, `guard_halt`, `guard_advisory`.
`guard_error` is not in it, and `grep -n guard_error bin/monitor` returns nothing. So the one
event meaning "the guard is not running" is the one the dashboard does not show.

This predates C5b. It is filed now because C5b changes who can cause it: before, a fail-open
needed a bug or a corrupted `escalation.json` under a protected directory; now a project-root
JSON file with one wrong-typed value produces a `guard_error` on **every** guarded tool call
(`260804-1603_o_`), and the user watching the dashboard sees an empty warnings panel
throughout.

## Measured

`fusion-guard.json` = `{"guard":{"protectedPaths":123}}` in a throwaway consuming project.
Three guarded tool calls, three `guard_error` lines in `.guard-state/events.jsonl`, three
allows. Reading `bin/monitor`'s set membership: none of the three would reach the warnings
panel. I read the rendering logic rather than running `bin/monitor` against a seeded event
log, so the "would not appear" half is **inference from the set membership**, not a rendered
screenshot.

## Suggested direction

Add `guard_error` to `WARNING_EVENT_TYPES`. Step 5 of this plan is the precedent — one entry
plus a comment — and the same argument applies with more force: an advisory records a
permission that was used, an error records a control that is not running.

It does not belong in `ADVISORY_EVENT_TYPES`. Advisories share a small separate budget
because they arrive in bursts during a curation session; an error is rare and each one is
individually worth reading, which is exactly what the warning budget is for.

Worth confirming the level mapping in `renderWarnings()` gives it at least the weight of a
block.
