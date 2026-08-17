# A resumed session re-enters an in-flight Turn without a `turn_start`, so the boundary drift check that rides it never fires

---

**Severity:** Medium — the one Turn-boundary obligation deliberately attached to an emission is skipped for the exact Turn a resume re-enters, and the prompt says it fires in every Turn
**Domain:** code
**Filed by:** coderev (Turn 4 review, range `b261d83..951c809`)
**Affects:** `agents/orchestrator.md:95` (Setup step 1, the **Continue** branch), `agents/orchestrator.md:438` (Phase 2 step 2, "This fires in **every** Turn")
**Cross-references:**
`shared/issues/260811-2143_o_the-drift-checks-turn-row-and-commits-row-use-two-different-session-anchors…md` (the same event, seen from the measurement side);
`shared/issues/260801-2038_*_session-bookkeeping-froze-at-turn-1-while-three-turns-ran.md`

---

## What is wrong

`agents/orchestrator.md:438` states an unconditional property of the Turn loop:

> Emitting a `turn_start` event — and, **in the same command**, running the drift check … It rides the emission rather than standing next to it, because a Turn-boundary obligation standing on its own is the one that froze. This fires in **every** Turn, Turn 1 included.

The resume branch does not honour it. `agents/orchestrator.md:95`:

> **Continue** — resume from where the prior session left off. Use the saved work queue, skip already-completed tasks, pick up from the next unfinished task.

It names no `turn_start`. A resume picks up *inside* a Turn — `progress.turn` already holds a number and the Turn was in flight when the session died — so the loop is re-entered at Phase 2 step 3, past step 2, and the emission never happens. The drift check attached to it therefore does not run at that Turn's boundary.

**Measured at HEAD.** `fusion-workbench/orchestrator-events.jsonl:1213` is a resume `session_start` carrying `"turn":4`. Counting events after it:

```
$ L=$(grep -n '"session_start"' fusion-workbench/orchestrator-events.jsonl | tail -1 | cut -d: -f1)
$ tail -n +$L fusion-workbench/orchestrator-events.jsonl | grep -o '"event":"[a-z_]*"' | sort | uniq -c
  10 "event":"task_done"
   8 "event":"commit"
   6 "event":"task_start"
   1 "event":"session_start"
   …
```

Ten task completions and eight commits after the resume, and zero `turn_start`. The Turn ran; the emission it was supposed to ride did not.

## What is and is not lost

The drift check itself still runs — `hooks/tracker.ts` measures it after every guarded tool call, which is the enforcement half that `agents/orchestrator.md:1109` correctly says does not depend on the prompt being read. So this is not the 2026-08-01 freeze returning.

What is lost is the *report at the boundary*: the moment the orchestrator was meant to look at drift and act on it. The tracker's report goes into the model's transcript mid-Turn, where it competes with the task at hand; the step-2 read is the one the prompt designed to be unmissable. On a resumed session that read never happens.

## Fix direction

The resume branch has to say what it does about the Turn it is re-entering. Two shapes, and the first is smaller:

1. **Emit `turn_start` for the resumed Turn, with the same rider.** A resumed Turn is a Turn being started by this session, even if its number was set by another. The emission carries `"turn": <progress.turn>` and the drift check runs with it — which is also the moment a resumed session most needs it, because the state it is reading was written by a session that is gone.
2. Or **state explicitly that a resumed Turn is exempt and why**, and correct "fires in **every** Turn" at `agents/orchestrator.md:438` to match.

Shape 1 also removes half of `260811-2143`'s symptom, but not its cause — that record's anchor mismatch stands independently and should be fixed on its own terms.

## Acceptance criteria

- Setup step 1's **Continue** branch names what happens to the in-flight Turn's `turn_start` and drift check.
- `agents/orchestrator.md:438`'s "every Turn" is either true or corrected.
- A lint over the prompt pins that the two sentences agree, in the shape `turn-budget-lint.test.ts` uses for the unresolved branch.

---
Resolved: shape 2, and it turned out to be the true one rather than the cheaper one. `agents/orchestrator.md` Setup step 1 gains **What a resumed session inherits**, which says that a resumed Turn was started by the session that is gone, keeps the `turn_start` that session emitted, and gets no second one — and names step 3's drift check, taken minutes earlier and shown to the user in the resume summary, as that Turn's boundary read. Phase 2 step 2's "This fires in **every** Turn" now reads "every Turn **this session starts**" and points at that paragraph.

Shape 1 (emit a second `turn_start` for the re-entered Turn) is not merely larger, it is wrong under the count that `260811-2143` installed in the same change: the Turn row counts `turn_start` events from the session's own beginning, so a Turn carrying two of them is counted twice and the row reports a freeze that is not there. The two halves have to agree, and this is the shape in which they do — the prompt says a resumed Turn keeps its one start, and the module counts one per Turn.

What is not claimed: the resumed Turn's boundary read is Setup step 1's, not a second one at Phase 2. That is a stronger read, not a weaker one — it is the only call point whose result the *user* sees, in the Continue/Restart summary — but it happens before the branch is chosen rather than at the re-entry, and this record's "the moment the orchestrator was meant to look at drift and act on it" is satisfied by it only in that sense.

Acceptance criteria: the Continue branch names the re-entered Turn's `turn_start` (and the history file it inherits, which is what the count anchors on); "every Turn" is now true as qualified; the lint is `describe("a resumed session's Turn emission and its Turn count agree")` in `hooks/lib/__tests__/state-drift-detection-lint.test.ts`, four cases, each measured to fail against the four files as `500f51f` left them. `cd hooks && npm test` — 52 files, 1347 tests, exit 0.
