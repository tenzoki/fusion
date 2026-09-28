# `guard_error` is not rendered by the monitor, so a permanently fail-open guard shows nothing on the dashboard

---

**Severity:** Low
**Domain:** code
**Filed by:** analyst, independent assessment A1 of C5b
**Affects:** `bin/monitor:91-102` (`WARNING_EVENT_TYPES` and `ADVISORY_EVENT_TYPES`); emitters at `hooks/guard.ts:904` and `hooks/tracker.ts:202`
**Cross-references:**
`260804-1600-c5b-independent-assessment.md`,
`260804-1603_*_the-project-config-layer-is-not-type-validated-so-a-wrong-type-fails-the-guard-open.md` (which makes this state project-triggerable),
plan `260802-1856_*_plan-guard-rules-write.md` Step 5 (which added `guard_advisory` to the same list)

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
(`260804-1603_*_the-project-config-layer-is-not-type-validated-so-a-wrong-type-fails-the-guard-open.md`), and the user watching the dashboard sees an empty warnings panel
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

---
Resolved: `guard_error` now reaches the warnings panel and renders at the halt level, labelled
"Fail-open" — red border, red badge, background tint, distinct from the amber default and from
the cyan advisory. Implemented in `bin/monitor` (Step 5 of
`260804-1633_*_plan-c5b-remediation-and-ship.md`), coder session
`260804-2100-coder-step5-guard-error-on-the-dashboard.md`. Five cases added to
`hooks/lib/__tests__/monitor-warnings-panel.test.ts`, every one driving the real binary over
HTTP; `npx vitest run` 1537 passed, 26 files.

**One correction to this record's own suggested direction.** "Add `guard_error` to
`WARNING_EVENT_TYPES`" is necessary and not sufficient, and the reasoning offered for it —
"an error is rare and each one is individually worth reading, which is exactly what the warning
budget is for" — is true of the *fault* and false of the *event*. Both hooks fail open per
invocation, so a fault that sits on disk emits one row per guarded tool call for as long as it
sits there. Charged to the warning class and measured: forty fail-opens evicted every
`guard_block`, `guard_halt`, `churn_critical` and `cross_file_critical` from the panel (the
assertion read `expected [] to deeply equal [ 'churn_critical', …(3) ]`), and one fail-open
followed by fifty churn warnings evicted the fail-open. That is the advisory-burst failure
arriving through a third door, in both directions. `guard_error` therefore carries its own
budget (`MAX_ERRORS_RETURNED = 8`) alongside the advisory one, which is the same carve-out this
panel already uses rather than a new mechanism.
