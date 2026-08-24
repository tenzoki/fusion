Two definitions of the Turn count disagree, and the resume snippet counts every session in the log

---

**Severity:** Medium at HEAD, and it grows with the age of a project's event log. The figure is shown to the user at the interrupted-session prompt, which is the moment they decide whether to resume.
**Domain:** code
**Filed by:** shaper, while shaping the multi-user rebuild
**Affects:** `agents/orchestrator.md:91`, `agents/orchestrator.md:496`, `agents/orchestrator.md:1060`
**Cross-references:** `shared/planning/260822-1136_*_spec-fusion-becomes-a-multi-user-tool.md` capability C4, which fixes it

---

## What is wrong

The orchestrator prompt defines the Turn count twice, and the two definitions do not agree.

At `:496` and again at `:1060` the count is the `turn_start` events in `fusion-workbench/orchestrator-events.jsonl` **since this session's `session_start`**. The `:496` line states it as the meaning of "which Turn is this", here and everywhere below.

At `:91`, in the interrupted-session step, the snippet that produces the figure the user is shown is:

```bash
T=$(grep -c '"event":"turn_start"' fusion-workbench/orchestrator-events.jsonl 2>/dev/null)
```

That counts every `turn_start` in the whole file. The log is append-only across all sessions and is never truncated in place, so on any project past its first session the reported figure is the project's lifetime Turn count and not the interrupted session's.

## Why it matters now

The count is reported to the user as "how far the session got", beside a commit count that **is** session-scoped, because it is derived from the `git_head_at_start` anchor two lines above. So the two numbers presented side by side are measured over different windows, and only one of them is labelled.

This repository's own log makes the size of the gap concrete rather than hypothetical: the file holds many sessions, so the two definitions differ by roughly the whole history.

## Why it is filed now rather than earlier

The multi-user rebuild makes the gap wider and harder to see. Under several checkouts pushing into one tracked log, the file holds Turns run by other people on other machines, and a whole-file count then reports strangers' work as this session's progress.

## Direction, not a prescription

Both call sites should read the same window, and the window that is documented twice is the session-scoped one. Deriving it means finding the last `session_start` line and counting `turn_start` after it, which is one `awk` or one `sed` range and no new mechanism.

---
Resolved: referred (C4) — C4's acceptance criteria name the session-scoped Turn count, and per 260823-1110 the derivation sorts by `ts` rather than reading the file positionally; shared/planning/260822-1136_*_spec-fusion-becomes-a-multi-user-tool.md `### C4`
