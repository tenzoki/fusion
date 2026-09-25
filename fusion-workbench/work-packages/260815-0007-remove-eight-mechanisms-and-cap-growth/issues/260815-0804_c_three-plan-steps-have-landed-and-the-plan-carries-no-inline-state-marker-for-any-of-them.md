# Three plan steps have landed and the plan carries no inline state marker for any of them

---

`rules/fusion-workbench-conventions.md` `## Inline State Tracking` requires a plan step to be marked
`[IN PROGRESS]` when it starts and `[DONE]` when it finishes, *"After completing each plan step — not
just at session end."* Steps 1, 2 and 3 of this Circle's fifteen-step plan are complete and committed.
The plan contains neither marker, anywhere.

---

**Severity:** Medium — the rule exists so an interruption does not lose state, and this is a
fifteen-step plan on a Turn budget of 12. Reconstructing progress today means reading three history
entries and three commit messages.
**Domain:** code
**Filed by:** `coderev`, reviewing `9a7da8e..7c12d6a` (`260815-0804-coderev-plane-mirror-removal.md`)
**Owner:** `coder`, per step; the obligation is the executing agent's
**Affects:** `260815-0029_*_plan-remove-eight-mechanisms-and-cap-growth.md`

**Verified 2026-08-15 at HEAD `7c12d6a`.**

```
$ grep -n "IN PROGRESS\|\[DONE\]\|^\*\*Status:\*\*" <plan>
4:**Status:** Approved
```

One hit, and it is the header. `git log -- <plan>` returns one commit, `348f6db`, the commit that
created it.

## What the rule asks for

`rules/fusion-workbench-conventions.md` `### Planning files`:

> - When you start a step: mark it `[IN PROGRESS]`: `3. [IN PROGRESS] **Step Title**`
> - When you complete a step: mark it `[DONE]`: `1. [DONE] **Step Title**`
> - When all steps are `[DONE]`: set `**Status:** Complete` in the header and rename the filename
>   marker to `_c_`.

And `### When to update` opens with *"After completing each plan step — not just at session end."*
The plan's own preamble to `## Implementation Steps` restates two per-step obligations (`npm test`
green, a history entry) and does not restate this one, which is the likeliest reason it was missed:
the two that were restated were performed and the one that was not was not.

## Why the history entries do not substitute

Each step wrote a good history entry, and each names its plan step in a header field. But the history
store answers *what happened in this session*; the plan answers *where this plan stands*, and a
resumed session reads the plan first. The distinction is the rule's stated reason — *"Content inside
planning, issue, and decision files must also track progress, so that interruptions don't lose
state."* A reader who opens the plan at HEAD sees fifteen unstarted steps.

## What the fix has to establish

Mark steps 1, 2 and 3 `[DONE]`. Then either restate the obligation in the plan's `## Implementation
Steps` preamble alongside the two that are already there, or accept that the preamble's silence is
what selects which obligations get performed — the second is a finding about how plans are written
and is worth saying out loud rather than fixing by hand each time.

---
Resolved: steps 1, 2 and 3 now carry `[DONE]` in the plan, per `rules/fusion-workbench-conventions.md` `## Inline State Tracking`. The omission was the orchestrator's: Step 3a marks the plan step at task completion and it was skipped three times. Marking is now performed with each step's commit.
