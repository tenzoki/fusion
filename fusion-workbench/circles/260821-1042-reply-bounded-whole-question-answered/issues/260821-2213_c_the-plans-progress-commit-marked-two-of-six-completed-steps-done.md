The plan's progress commit marked two of six completed steps `[DONE]`

---

Commit `de0c6f6` is titled "six agent logs, the plan's progress". It added `[DONE]` to plan steps 3 and 5 only. Steps 1, 2, 4 and 6 each have a history log carrying `**Status:** Complete`, and each is unmarked in the plan. The plan header still reads `**Status:** Draft` and the filename still carries `_o_`.

---

**Affects:** `circles/260821-1042-reply-bounded-whole-question-answered/planning/260821-1805_*_plan-reply-bounded-whole-question-answered.md:100,108,127,151` (the four unmarked steps) and `:4` (the status field).

**Severity:** Medium. The plan is the artifact an interrupted session resumes from, and it currently reports four completed steps as not started.

**The rule.** `rules/fusion-workbench-conventions.md` `## Inline State Tracking`:

> **Filename markers are not enough.** Content inside planning, issue, and decision files must also track progress, so that interruptions don't lose state.
>
> - When you complete a step: mark it `[DONE]`
> - When all steps are `[DONE]`: set `**Status:** Complete` in the header and rename the filename marker to `_c_`.

**The evidence, step by step.**

| Step | Executor | History log | `[DONE]` in the plan |
|---|---|---|---|
| 1 freeze the baseline | analyst | `history/260821-2020-analyst-the-reply-length-baseline-is-frozen.md` | no |
| 2 close the three routes | coder | `history/260821-2035-coder-close-the-three-routes-out-of-the-length-cap.md` | no |
| 3 the question clause | coder | `history/260821-2120-coder-the-reply-answers-the-question-that-was-put.md` | yes |
| 4 two register habits | ontocoder | `history/260821-2132-ontocoder-two-register-habits-in-four-profile-files.md` | no |
| 5 the cut | coder | `history/260821-2145-coder-the-cut-that-pays-for-steps-2-and-3.md` | yes |
| 6 measure and record | coder | `history/260821-2147-coder-the-corpus-is-measured.md` | no |

Every one of the six logs carries `**Status:** Complete`.

**Why it is not merely cosmetic here.** All six steps are done, so the plan is owed `**Status:** Complete` and the `_o_` to `_c_` rename as well. A resumed session reading this plan would re-dispatch step 2, which would rewrite `## Length` a second time on top of the rewrite already committed, and step 4, which would re-extend AI04 and C06 in four profile files whose byte budget is already spent. The two marked steps are exactly the two that would be skipped.

**What the fix is not.** Not a rename of the Circle record and not a closure. The Circle is still `_t_` and has open obligations, including `shared/issues/260812-0253_*_agents-answer-a-question-the-user-did-not-ask-and-the-length-caps-do-not-hold.md`, which the plan's `## Where this Circle stops` says steps 2, 3 and 5 close and which still stands at `_o_` with no `Resolved:` note.

**Cross-references:** commit `de0c6f6`; `rules/fusion-workbench-conventions.md` `## Inline State Tracking`; `shared/issues/260819-1511_*_a-session-history-file-is-left-at-status-in-progress-after-its-session-ended.md` (the same class on a different artifact kind).

---
Resolved: The orchestrator marked steps 1, 2, 4 and 6 `[DONE]` in
`circles/260821-1042-reply-bounded-whole-question-answered/planning/260821-1805_*_plan-reply-bounded-whole-question-answered.md`
at the start of Turn 2, so all six now carry the marker and a resumed session no longer re-runs
steps 2 and 4. Inline plan tracking is the orchestrator's own act under
`rules/fusion-workbench-conventions.md` `## Inline State Tracking`, so no executor was dispatched.
