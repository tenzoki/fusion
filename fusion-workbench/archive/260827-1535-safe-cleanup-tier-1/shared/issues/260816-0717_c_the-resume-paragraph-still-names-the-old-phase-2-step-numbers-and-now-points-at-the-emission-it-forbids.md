The resume paragraph still names the old Phase-2 step numbers, and now points at the very emission it forbids
---
`b00a7a4` inserted the Unresolved-budget check-in as Phase 2 **step 1** and renumbered the three steps
below it. One paragraph 350 lines above was not renumbered with them, and under the new numbering it
now instructs the opposite of what it says.
---
**Severity:** High — it tells a resumed session to re-enter at the step that emits `turn_start`, in the
same sentence that says no second `turn_start` may be emitted. `agents/orchestrator.md:467` states the
log is now the Turn number's only record, so a double emission mis-counts every Turn from the resume on.
**Domain:** code
**Filed by:** coderev, session `260816-0713-coderev-turn-5-6-range-3a0408a-f77633f.md`, reviewing range `3a0408a..f77633f`
**Owner:** coder
**Affects:** `agents/orchestrator.md:111`

## Evidence

`agents/orchestrator.md:111`, unchanged by `b00a7a4`:

> You re-enter it mid-flight, **at Phase 2 step 3**, so no second `turn_start` is emitted for it: the
> one that session emitted is that Turn's only start … **Phase 2 step 2** resumes its ordinary rhythm
> at the **next** Turn.

The Phase 2 sequence after `b00a7a4` (`agents/orchestrator.md:465-468`):

| step | before `b00a7a4` | at HEAD |
|---|---|---|
| 1 | record `control.turn_start_head` | **Unresolved-budget check-in** |
| 2 | emit `turn_start` | record `control.turn_start_head` |
| 3 | refresh dashboard | **emit `turn_start`** |
| 4 | — | refresh dashboard |

So "re-enter at step 3" now names the `turn_start` emission, and "step 2 resumes its ordinary rhythm at
the next Turn" now names the anchor write. Both were correct before the renumbering and neither is now.

It also contradicts the new step 3 directly. `:467` closes with "**Step 1** resumes at the next Turn";
`:111` says step 2 does.

## Fix

Renumber `:111` to the post-`b00a7a4` sequence: re-enter mid-flight at **step 4** (dashboard refresh),
and **step 1** resumes at the next Turn. Consider citing the steps by what they do rather than by
number, since this is the second renumbering the paragraph has survived unchanged.

## Related

- `shared/issues/260811-2304_*` — the placement defect `b00a7a4` was fixing

---
**Reconciliation 260817-1836** (reconciler, domain `code`). Re-verified reproducible at HEAD `2552586`: `agents/orchestrator.md:111` still names Phase 2 step 3 and step 2, while at HEAD step 3 is the `turn_start` emission and the loop resumes at step 1. Marker stays open. Log: `260817-1836-reconciliation.md`.

---
Resolved: fixed — the resume paragraph re-enters at the dashboard refresh (step 4) and names the check-in (step 1) as what resumes, each cited by what it does; agents/orchestrator.md:119
