# The inserted step P-3b is in no plan and in no Turn log, only in the event stream

---

Turn 2 inserted a prerequisite step, `P-3b`, dispatched it to `coder`, and landed it as `332267a` —
the largest single commit of the Turn (a new build script, a new vitest configuration, two rewritten
test files). The plan still lists steps 1 to 15 with no `3b` anywhere in it, and the Circle record's
Turn 2 entry names "steps P-4 to P-6". The only place the step exists is `orchestrator-events.jsonl`.

---

**Severity:** Medium — a resumed session reads the plan first, and the plan at HEAD says the
concurrency work never happened. Steps 11 and 13 both touch the hooks build this step changed.
**Domain:** data
**Filed by:** `ontorev`, reviewing `7c12d6a..5d29b6d` (`reviews/260815-1247-ontorev-turn-2-structured-data.md`)
**Owner:** `ontocoder`
**Affects:**
`circles/260815-0007-remove-eight-mechanisms-and-cap-growth/planning/260815-0029_o_plan-remove-eight-mechanisms-and-cap-growth.md:138-345`;
`circles/260815-0007-remove-eight-mechanisms-and-cap-growth/_t_circle.md:216`

**Verified 2026-08-15 at HEAD `5d29b6d`.**

## The three surfaces, side by side

The event stream has it, twice:

```
{"ts":"2026-08-15T07:10:33","event":"task_start","turn":2,"task":"P-3b","agent":"coder",
 "detail":"inserted prerequisite: concurrency-safe build plus the two wall-clock-bound cases"}
{"ts":"2026-08-15T09:38:41","event":"task_done","turn":2,"task":"P-3b","agent":"coder",
 "detail":"332267a; 6/6 red before, 12/12 green after; 2 issues closed, 1 narrowed; …"}
```

The plan does not:

```
$ grep -nE '^[0-9]+\. ' planning/260815-0029_o_plan-…md
142:1. [DONE] …   168:2. [DONE] …   182:3. [DONE] …   188:4. [DONE] …
205:5. [DONE] …   212:6. [DONE] …   226:7. …   … through 336:15. …
$ grep -n '3b' planning/260815-0029_o_plan-…md
46:  … the orchestrator's Step 3b runs the test suite …      (a different "3b")
418: … Step 3b reverts the whole task …                       (the same one)
```

Neither does the Circle record:

> - Turn 2 (session 260814-2306): in progress, from c4761dc; plan correction of the false lint
>   premise, the legacy-halt-clearing flake, then steps P-4 to P-6 …

Both plan and record were edited inside this range — the plan three times (`d1ae1c0`, `a69d56e`,
`5d29b6d`), the record once (`d1ae1c0`) — so this is not a file nobody touched.

## Why the just-closed sibling did not prevent it

`issues/260815-0804_c_three-plan-steps-have-landed-and-the-plan-carries-no-inline-state-marker-for-any-of-them.md`
closed with *"Marking is now performed with each step's commit."* That repair works on steps the plan
contains: steps 4, 5 and 6 all carry `[DONE]` correctly. It has nothing to act on for a step that was
never written into the plan, so the two defects are adjacent rather than the same one, and closing the
first left the second reachable.

## What the fix has to establish

Insert `P-3b` into `## Implementation Steps` between steps 3 and 4, at the scope it actually had, marked
`[DONE]`, and extend the Circle record's Turn 2 line to name it. The plan's step count and any place
that states it move with the insertion. Whether an inserted step should also be recorded as a *change of
plan* — the plan was approved at a gate and this step was not in what the user approved — is a question
about the plan-gate contract and belongs in a decision record, not in this fix.

## Related

- `issues/260815-0804_c_three-plan-steps-have-landed-and-the-plan-carries-no-inline-state-marker-for-any-of-them.md`
  — the sibling defect, closed this session.
- `shared/decisions/260811-2009_i_is-the-hooks-suite-meant-to-be-run-concurrently-with-itself-and-if-not-who-serialises-it.md`
  — the decision the inserted step implements.
- `history/260815-1133-coder-hooks-suite-concurrency-safety.md` — the run's own record, which exists.

---
Resolved: both surfaces now carry it. The Circle record's Turn 2 entry names the inserted step, its commit `332267a`, the measurement behind it and why the Circle grew by it (orchestrator, before `b093a54`). The plan carries it as step `3b. [DONE]` between 3 and 4, with its binding decision, and steps 11 and 13 each gained a paragraph naming where the changed build reaches them (planner correction pass). The reviewer's point stands as filed: marking cannot reach a step the plan never contained, so this was not the same defect as the missing `[DONE]` markers.
