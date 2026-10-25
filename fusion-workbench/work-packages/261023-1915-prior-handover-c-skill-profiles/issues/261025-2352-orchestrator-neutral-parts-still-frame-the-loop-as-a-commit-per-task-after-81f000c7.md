The orchestrator's neutral parts still frame the loop as a commit per task after `81f000c7`
---
The re-cut fixed every span that acts on a per-task commit. Six neutral sentences still describe the loop that way, and the Prior render carries them beside a Step 4 that commits nothing. Severity: Low. Fusion fixes this.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Domain:** code
**Executor:** code-implementer
**Cross-references:** 261025-2352-reviewer-closing-review-of-prior-handover-c-skill-profiles.md; 261025-1117-orchestrator-prior-render-keeps-neutral-steps-that-presume-a-commit-per-task.md

## Defect

At `ec6c968e`, in `catalog/profiles/orchestrator/parts/`:

- `04-neutral.md` line 4: "read the return, commit, and go round again"; line 6: "sees where things stand after every commit"; line 8: "manage commits".
- `24-neutral.md` line 18: "dispatch it, read what comes back, commit it".
- `36b-neutral.md` line 2: heading `### Step 4 — commit`.
- `62-neutral.md`: "they are yours to commit under **Step 4** like any other executor's".
- `64-neutral.md` line 11: "Report after each commit, not just at the end".

`37-prior.md` says "You do not commit". None of these sentences makes a run act on a missing commit, which is why this is Low.

## Fix direction

Cut the six sentences into `claude` + `prior` pairs, or reword them host-neutral ("after each task") where both hosts can carry the wording. The Claude bytes do not move.

## Acceptance

- The Prior render of `orchestrator` names no per-task commit outside a `claude` part.
- `cd catalog && npm test` exits 0, and the Claude render diff stays empty.
