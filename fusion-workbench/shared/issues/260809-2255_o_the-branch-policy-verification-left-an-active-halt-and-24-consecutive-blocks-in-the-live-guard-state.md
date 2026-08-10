# The branch-policy verification left an active halt and 24 consecutive blocks in the live guard state

---

**Severity:** Medium — the next session in this project starts against a halted guard, and every status surface that was supposed to say so says the opposite
**Domain:** code
**Filed by:** reconciler (reconciliation of `6b94e17..HEAD`, 260809-2252)
**Affects:**
`fusion-workbench/.guard-state/escalation.json` (the state itself);
`fusion-workbench/orchestrator-live.md` (reports `Guard: OK (0 blocks)`);
`fusion-workbench/shared/history/260809-1725-orchestrator-session.md` (Setup snapshot, `Guard | OK (haltActive: false, 0 consecutive blocks)`)
**Cross-references:**
`shared/planning/260809-1229_c_plan-five-severe-guard-defects.md` — "That harness is the sanctioned verification surface for everything in this plan", which is the discipline these probes went around;
`shared/issues/260809-2049_o_clear-halt-discards-a-halt-raised-between-its-load-and-its-save-and-tells-the-human-it-cleared.md` — the clearing path this state will be handed to;
`shared/reviews/260809-2050-coderev-guard-and-hooks-turn-6b94e17-to-head.md` — the review that probed the classifier and reported the probes as measurements

---

## What is wrong

`fusion-workbench/.guard-state/escalation.json` at HEAD reads:

```json
{"haltActive": true, "consecutiveBlocks": 24, "lastBlockTimestamp": "2026-08-09T19:52:50.163Z"}
```

`events.jsonl` carries 22 `guard_halt` rows inside the session window, all of one shape:

```
2026-08-09T19:52:49.413Z  guard_halt  Bash  Halt raised by this block — Git branch-switch denied: git switch main
2026-08-09T19:52:49.914Z  guard_halt  Bash  Halt raised by this block — Git branch-switch denied: git worktree add ../wt x
```

Nine of them land inside 1.3 seconds. That is not an agent trying to switch branches; it is a
verification sweep running the documented deny cases as real `Bash` calls against the **live**
project guard rather than against a harness project. The branch policy is the one half of the
guard that stays active in this repository by design (`hooks/lib/self-detect.ts`), so every
probe was a genuine block, and each one incremented the counter and re-raised the halt.

The write half does stand down here — the last events in the log are `guard_allow … Self-detect:
cwd is fusion plugin repo — write guard standing down` — so the halt is inert for write tools
*in this repository*. It is not inert as state. `/fusion:setup` reads `escalation.json` at Step 0
and reports the halt; the next session in this project opens on it, and clearing it is a Human
Gate action.

Two status surfaces disagree with the file, and both were written before the probes:

- `orchestrator-live.md` still says `Guard: OK (0 blocks)`.
- the session history's Setup snapshot says `haltActive: false, 0 consecutive blocks`.

Neither is wrong about the moment it was written. Nothing updated either afterwards, so the
surfaces a human consults are the ones that will not mention a halt.

## Why it matters beyond the housekeeping

The plan that opened this line of work states its own verification rule: the integration
harness spawns throwaway project roots outside this repository, and "an assertion written here
would pass without the mechanism ever running". That reasoning was about the write half. For
the branch half the inverse holds — it runs here, which is precisely why a probe against the
live guard has a side effect on shipped project state, and why it is the wrong surface to probe
on. The harness has the same classifier and no shared counter.

## Suggested direction

1. Clear the halt through `hooks/clear-halt.ts` (a human action, per the guard's own contract),
   and record it. Note that `260809-2049` is open against exactly this path.
2. Decide whether branch-policy probes belong in the harness. If the answer is yes, say so where
   the plan already says it for the write half, so the next verification pass reads one rule
   rather than inferring the exception.
3. Consider whether an `FUSION_GUARD_PROBE=1`-style read-only classification path is worth having,
   so a reviewer can measure a verdict without moving the escalation counter. This is a design
   question, not a defect — file it as a decision if it is taken up.

## Acceptance criteria

- [ ] `fusion-workbench/.guard-state/escalation.json` reads `haltActive: false` and the clearing
      is recorded in a session history file.
- [ ] The verification-surface rule covers the branch policy explicitly, wherever it is written.

---
Reconciliation 260810-1205 (reconciler, domain `code`) — **first acceptance criterion met, second not. Stays `_o_`.**

Criterion 1 — met. `fusion-workbench/.guard-state/escalation.json` at `ed87d87` reads `"haltActive": false, "consecutiveBlocks": 0`, against the `true / 24` this record quotes. The clearing is recorded in `shared/history/260810-0844-orchestrator-session.md` `### Guard history note`, which names the 2026-08-09 22:14 human intervention and states that the events in `recentEvents` are residue of a policy that no longer exists. The residue itself is correct to leave: `recentEvents` is a log, and the events happened.

Criterion 2 — not met, and not attempted this session. No verification-surface rule names the branch policy, because the policy was deleted (`7598073`) before a rule could be written for it. That leaves the criterion satisfiable only in the general form — *a policy is verified through the sanctioned harness, not through live probes against the running project* — which is the same class question that `shared/decisions/260810-0710_o_should-a-rule-be-allowed-to-land-without-the-check-that-enforces-it.md` carries from the other direction.

Closure candidate for the user: if criterion 2 is judged moot with the policy gone, this record closes on criterion 1 alone. The reconciler does not make that call, because the criterion is written as a rule obligation and not as a state fact.
