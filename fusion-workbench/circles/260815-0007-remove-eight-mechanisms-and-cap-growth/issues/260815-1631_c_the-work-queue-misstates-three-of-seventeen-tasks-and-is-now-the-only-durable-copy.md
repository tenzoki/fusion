`agentstate.yaml`'s `work_queue` misstates three of seventeen tasks, and P-10 made it the only durable copy

---

Two completed steps, P-7 and P-8, are recorded in `fusion-workbench/agentstate.yaml` as
`status: "running"` with no commit hash and with **step 12's summary** instead of their own. A
resumed session would replay both. Since step 10 removed the persisted `tasklist.md`, this field is
the queue's only durable copy, and step 11 removed the measurement that would have caught the
disagreement.

---

## What the file says

`fusion-workbench/agentstate.yaml` (`# Updated: 260815-0110`), `work_queue`:

```
  - {id: "P-7",  summary: "Collapse the administrative surface to three names", agent: "coder", status: "running"}
  - {id: "P-8",  summary: "Collapse the administrative surface to three names", agent: "coder", status: "running"}
  - {id: "P-12", summary: "Collapse the administrative surface to three names", agent: "coder", status: "running"}
```

Three entries carry one summary. P-12's is correct; P-7's and P-8's are not.

## What actually happened

`fusion-workbench/orchestrator-events.jsonl` and git agree, and both disagree with the queue:

| Task | Plan step | Event | Commit | Queue says |
|---|---|---|---|---|
| P-7 | 7, *Remove `conceptrev`* | `task_done` turn 3 | `a17cc8c` | running, no commit, wrong summary |
| P-8 | 8, *Fold `investigator` into `analyst`* | `task_done` turn 3 | `7260bbc` | running, no commit, wrong summary |
| P-12 | 12, *Collapse the administrative surface* | `task_start` turn 4 | `1e29572` landed | running |

Corroborated three further ways: the plan carries `[DONE]` on steps 7 and 8 at
`260815-0029_*_plan-remove-eight-mechanisms-and-cap-growth.md:241` and `:255`; `_t_circle.md:217` records
Turn 3 as "steps P-7 to P-9 (conceptrev removed, investigator folded into analyst, …)"; and
`260814-2306-orchestrator-session.md:239-240` lists the same three commits.

## Why this is not cosmetic

`agents/orchestrator.md:545` states the obligation and the exact failure this is:

> Since the persisted task list was removed, `work_queue` in this file is the queue's **only**
> durable copy, so the entry you do not update is a task no resume can tell has been done.

And `agents/orchestrator.md:1009` repeats it for the schema. The redundancy that used to absorb a
miss is gone as of `dd312eb` (step 10), and the check that used to *notice* one is gone as of
`f45f76a` (step 11) — `bin/fusion-state-drift` compared the persisted rows against git and the
event log, and its removal is stated at `agents/orchestrator.md:1021` as the accepted trade:

> the measurement that used to compare these seven against git and the event log went with them, so
> a frozen Circle Turn log, a dangling `session.history_file` and a history file whose Directive
> disagrees with this one's are no longer noticed by anything.

The corruption predates step 11 (P-7 and P-8 closed in Turn 3) but was invisible from the moment
step 11 landed. This is the traded-away risk materialising inside the Turn that traded it.

## Scope note

The counters in the same file (`tasks_done: 13` against 9 entries marked `done`) are a separate
record — they are the retired `progress:` block, filed as
`260815-1631_*_the-live-agentstate-yaml-still-carries-the-progress-block-the-commit-that-renamed-it-retired.md`.

## Suggested fix

Correct P-7's and P-8's `summary`, `status` and `commit` from the event log, which is the
un-freezable record the derivation table already names. Not a schema change.

---
Resolved: all seventeen entries now carry their true status and, where done, their commit. P-7 and P-8 had stood at `running` with a later step's summary since Turn 3. The finding is exact about why it mattered: `dd312eb` made this field the queue's only durable copy and `f45f76a` deleted the check that compared it against git, so the traded-away risk materialised inside the Turn that traded it, at a gate — which is the one situation this file exists for.
