# coder — session-state drift: the enforcement half

**Date:** 260811-1010
**Agent:** coder
**Task:** `I:260801-2038-frozen-state` (task 2 of `fusion-workbench/tasklist.md`)
**Source record:** `260801-2038_*_session-bookkeeping-froze-at-turn-1-while-three-turns-ran.md`
**Status:** Complete
**HEAD at start:** `d8e38d5`

---

## What the task asked

Close the prevention half of a defect measured six times: three of the four session-state surfaces
stop being written after Turn 1 while the session runs on. Detection had landed as prose in
`agents/orchestrator.md`; the record's own reconciliation `260810-0819` then measured that prose
failing on its own session, and diagnosed why — **an agent prompt is loaded at session start, so a
fix written into a prompt cannot reach the session that writes it.** The acceptance clause therefore
demanded a mechanism that runs unasked: *whatever is built, the session that installs it is not the
session expected to run it.*

## Hook or helper — the choice, and the evidence for it

The record offered two shapes. Neither carries the whole half alone, and the reason is not a tie:

- **A `bin/` helper alone cannot.** A helper runs when something calls it, and inside a running
  orchestrator session every caller is a prompt instruction — the exact class the record proves
  cannot reach the installing session. Two of its three consumers (`/fusion:setup`, the reconciler)
  are also prompt-driven.
- **A hook alone cannot either**, but for a different reason: it can report and must not write. The
  session-state surfaces have exactly one writer, and a second one is candidate 3 of the record,
  rejected there.

So the choice was not between them. It was to put the **computation** in one module and give it
three callers, of which the hook is the one that needs no cooperation:

```
hooks/lib/state-drift.ts          the measurement — read-only except its own throttle record
  ├── hooks/tracker.ts            PostToolUse, every guarded tool call, invoked by Claude Code
  ├── hooks/state-drift.ts        the CLI, behind bin/fusion-state-drift
  └── bin/monitor                 surfaces the emitted state_drift events; does NOT recompute
```

**Why the hook is candidate 1 rather than a second candidate 2.** A commit is what moves
`git rev-list --count` past what `agentstate.yaml` claims; a commit is a `Bash` tool call; the
tracker fires on that very call. The demand for the bookkeeping write arrives attached to the act
that made it necessary. That is "the Turn-boundary write rides an obligation the session already
holds", mechanised instead of prescribed.

## Files changed

| File | Change |
|---|---|
| `hooks/lib/state-drift.ts` | **new** — the five-row measurement, the throttle, the model-facing sentence |
| `hooks/state-drift.ts` | **new** — the CLI (`anchor=`/`state=`/`rows=`/`drift=`/`verdict=`) |
| `bin/fusion-state-drift` | **new** — thin wrapper, resolved relative to itself like `bin/fusion-churn-rank` |
| `hooks/tracker.ts` | runs the measurement **ahead of** the plugin-repo stand-down, anchored at the workbench root; joins its sentence with the protected-path one |
| `hooks/lib/events.ts` | `state_drift` added to `GuardEventType`, with a note on the two logs that carry the name |
| `bin/monitor` | `state_drift` in `WARNING_EVENT_TYPES`, its own 8-row budget, a **Stale state** label |
| `agents/orchestrator.md` | Drift check calls the helper instead of inlining shell; Step 3b gains step 7; the honesty paragraph splits the enforced half from the unenforced one |
| `skills/setup/SKILL.md` | Step 1 computes the divergence before summarising, and the summary carries the diverging rows |
| `hooks/lib/__tests__/state-drift.test.ts` | **new** — 22 subprocess cases |
| `hooks/lib/__tests__/state-drift-detection-lint.test.ts` | record-reading assertions repointed from the prose to the module; new "is run by something that is not the session that installed it" case; the admission it pins updated with the mechanism |
| `hooks/lib/__tests__/helpers/guard-harness.ts` | `stateDriftEntry()` |
| `README-hooks.md`, `.gitignore` | the enumeration lint's table, and the `bin/*` exception without which the helper would never ship |

## Three decisions worth recording

**1. The drift check does not stand down in fusion's own repository.** The other two halves of the
tracker do, and the CLAUDE.md warning about them asking different questions of different directories
is exactly why this one had to be placed before the `isFusionPluginCwd()` early return and anchored
at `findWorkbenchRoot()`. Churn stands down because plugin-development edits are not signal; the
protected-path measurement stands down because a fusion developer edits protected paths. Neither
applies to session bookkeeping — this repository is a fusion consumer with a live workbench, and all
six measured instances happened in it. A case asserts it rather than a comment claiming it.

**2. Finding drift is `verdict=drift` on stdout, never a non-zero exit.** Issue `260810-0710` records
the predecessor's last line handing the whole block's status to a guard that was false on the
ordinary no-Circle session. A check that reports failure where nothing is wrong teaches its reader
to ignore its status, which is this record's own failure one level up.

**3. The throttle compares the drift *signature*, not a timestamp.** A divergence that persists is
reported once; one that grows is reported again; one that is repaired clears the record so the next
freeze speaks afresh. All three directions have a case.

## Verification

`cd hooks && npm test` — **42 files, 1166 tests, exit 0**. Baseline at `d8e38d5` was 1142; the 24
new cases are the 22 in `state-drift.test.ts` and 2 in the existing lint.

## What is left open

- **The repair write is still the orchestrator's, and still prompt text.** By design. Stated in the
  prompt, in the module header, in the closing note on the record, and asserted by a case that the
  hook leaves `agentstate.yaml` byte-identical.
- **The monitor surfaces rather than computes.** Its shipped copy at `fusion-workbench/monitor` has
  no path back to `hooks/dist/`, and a second implementation would be free to disagree with the
  first.
- **`additionalContext` reaching the model rests on a prior measurement** (`hooks/tracker.ts`'s
  header, Claude Code 2.1.224), not on one taken today. This task asserts the hook's envelope.
- **Decision `260810-2032_*_should-the-drift-checks-four-sentences-be-pinned…` is now unblocked.**
  It sequenced its own implementation explicitly after this task, and this task left the four
  call-point sentences untouched. Not implemented here — it sat outside the acceptance clause.
- **`.claude-plugin/plugin.json` was not bumped** and `CLAUDE.md`'s `bin/` table does not yet list
  `bin/fusion-state-drift`. Both are release/orchestrator business and outside this task's file
  scope.
