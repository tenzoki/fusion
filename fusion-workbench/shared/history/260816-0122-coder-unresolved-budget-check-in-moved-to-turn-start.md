# The Unresolved-budget check-in moved to Turn start, and the bound claims qualified

**Status:** Complete
**Agent:** coder
**Source records:**
- `shared/issues/260811-2304_o_the-revise-artifact-path-exits-a-turn-at-step-3c-bis-so-the-unresolved-budget-check-in-it-is-said-to-meet-never-runs.md`
- `shared/issues/260811-2305_o_the-unresolved-budget-check-in-fires-before-the-convergence-test-so-the-converging-turn-is-asked-a-question-whose-answer-is-discarded.md`
- `shared/issues/260811-2305_o_continue-without-check-ins-falsifies-the-rebalance-sections-two-bounding-claims-and-neither-carries-the-qualification.md`

---

## The choice, and why

Three defects, one design problem: where the Unresolved-budget check-in sits. Record
260811-2304 offered two fix directions and preferred the first. Direction 1 was taken:
the check-in moved from the end of a Turn (under Step 3d, between the circuit-breaker
table and Step 3e) to the **start** of a Turn, as Phase 2 step 1, beside the `turn_start`
emission. The fallback in that record — leave the gate where it is and qualify the two
Rebalance sentences to name the Coherence gate instead — was not taken.

The objection weighed before taking it was the dispatch's own: a Turn-start check-in asks
before the Turn rather than after it, so the user decides with different information.
Measured against the actual step order, the objection inverts. Step 3e refreshes the
queue *after* the old gate fired, so at the end of Turn N the user was asked "run another
Turn?" without being able to see what that Turn would contain. At the start of Turn N+1
the user has everything Turn N produced **and** the refreshed queue the next Turn will
work. Turn start strictly dominates on information.

The property that decided it is that the move needs no carve-out. Every route that
creates a Turn runs the Turn-start sequence (Phase 1, Step 3e's refresh, *Revise Artifact*
at Step 3c-bis, *Revise Artifact* at Phase 3), and a loop that has already exited creates
no Turn. So all four ordering constraints fall out of one placement:

| Situation | Old placement | Turn start |
|---|---|---|
| Circuit breaker trips | exits before the gate (wanted) | loop exits, no Turn starts, no ask |
| Queue converges at Step 3e | asks, then discards the answer | loop exits, no Turn starts, no ask |
| Rebalance, not *Revise Artifact* | exits at 3c-bis, no ask (wanted) | loop exits, no Turn starts, no ask |
| Rebalance, *Revise Artifact* | **never asked** — the defect | new Turn, asked |
| Phase 3 *Revise Artifact* re-entry | asked at the next end-of-Turn | new Turn, asked |

The one real cost, stated rather than described away: after answering the Rebalance gate
with *Revise Artifact*, the user now meets a second question immediately. The two are not
the same question — the first is about direction, the second about whether to spend
another Turn in a session with no count-based exit — but they do arrive back to back.
That is the path the source record says is currently bounded by nothing, so the second
question is the fix rather than noise.

Two smaller decisions inside the move:

- **The check-in gates the `turn_start` emission rather than standing beside it.** This
  file's own principle (Step 3e's staging-check note) is that a Turn-boundary obligation
  standing on its own is the one that goes unrun. Making the emission conditional on the
  check-in ties it to the one thing every Turn does, and it keeps the log honest: a Turn
  the user declines is a Turn no `turn_start` counted.
- **The first question falls at the start of Turn 2, and that is not a special case.** The
  interval is one Turn counted from the loop's start; at Turn 1's start no Turn has
  elapsed. The same rule gives the widened interval its next question N Turns later.
- **A Turn re-entered by a resume runs no check-in**, inheriting the existing rule at
  Phase 2 step 3 that such a Turn emits no `turn_start` — it is not a Turn this session is
  deciding to spend.

## What changed in `agents/orchestrator.md`

| Site | Change |
|---|---|
| Setup Step 2, unresolved bullet | Names the gate as defined under Step 3d and run at Turn start (Phase 2 step 1); adds that switching the check-in off switches off the session's last bound |
| Phase 2 head | The gate bounds the loop "at the start of each Turn", not "at each Turn boundary" |
| Phase 2 Turn-start steps | New step 1 (the check-in, gating the step-3 emission); old steps renumbered 2–4; step 3 gains the resume clause |
| Phase 2, after the step list | New paragraph naming the four routes into Phase 2 and why the sequence is where the gate belongs |
| Phase 2, Turn-end anchor note | Adds the exit that happens *before* a Turn starts, and that no anchor exists to clear |
| Step 3c-bis, *On Rebalance* | *Revise Artifact* re-entry runs the Turn-start sequence from step 1, check-in included |
| Step 3d, check-in section | Placement paragraph rewritten (defined here, runs at Turn start); the three answer bullets reworded for a pre-Turn question; new closing paragraph "Why the start of a Turn, and not either neighbour of Step 3e", naming Step 3c-bis, 3d and 3e and what each old position cost |
| Human Gate Rules table | Row condition becomes "A Turn is about to start … (Phase 2 step 1)" |
| Rebalance bounding, opening | Both bound claims qualified on *Continue without check-ins*, in the register the opt-out bullet uses |
| Rebalance bounding, *Revise Artifact* | "every Turn boundary … runs the check-in" becomes "every Turn … begins with the check-in", with the opt-out named |
| Rebalance bounding, Phase 3 re-entry | Same, plus the opt-out clause |

## What changed in `hooks/lib/__tests__/turn-budget-lint.test.ts`

`CLAIM` was one alternative (`loop is bounded`) and is now four, adding the three
phrasings the Rebalance section actually uses: `bounded post-action mechanics`,
`bounds the retries`, `no option is allowed to loop unboundedly`. The gap in the first
shape is what let `500f51f` close one false bound claim while leaving two standing one
paragraph away.

**One rule, not two.** A bound may be stated, and the line stating it must name
`Continue without check-ins` — the answer that removes it — on that same line. Co-location
is the property: the pre-fix text stated the residual plainly in the check-in's own bullet
while the two sentences asserting the opposite, 260 lines away, did not.

A second assertion covers the placement defect (260811-2304), which is a different
proposition and gets its own pattern: `BOUNDARY_CLAIM` fails any line that puts the gate
at "every / each / the next Turn boundary". Its honest bound is documented in the file —
it fires only on a line that also says "check-in", so the prompt's several legitimate
mentions of a Turn boundary (staging check, state-write cadence, dashboard reset) are left
alone, and a sentence that mis-places the gate without naming it is not reached.

Non-vacuity is measured rather than assumed, in the shape the interval case in the same
file already uses: both detectors are exercised on the three sentences as `61bd21f` and
`500f51f` actually shipped them, on the qualified form that must pass, and on four nearby
lines that must be left alone.

## Verification

The widened lint was written and run **before** the prompt was fixed, which is how the
detectors were verified non-vacuous against the live text rather than only against string
literals. It failed on exactly the lines the three records name:

- `states no bound without the answer that removes it` — lines 912, 914
- `does not place the check-in at a Turn boundary` — lines 141, 463, 914

After the prompt fix, `npx vitest run lib/__tests__/turn-budget-lint.test.ts` — exit 0,
15 tests passed.

`cd hooks && npm test` — **exit 1**, 763 of 764 tests passed. The single failure is
`surface-growth-bound.test.ts` › `matches the checked-in golden, surface by surface`.
`fixtures/surface-growth.golden` is a per-file inventory that goes stale on any edit to a
bounded surface, other tasks in this session were editing such files concurrently, and the
dispatch instructed that it not be regenerated here. All four head-room bounds in that
same file pass (11 of its 12 tests), so this change is inside budget.

An earlier full run also showed `lib/review-coverage.ts` failing to compile and
`review-coverage.test.ts` failing. Neither is from this task — `git status` showed
`hooks/lib/review-coverage.ts` modified by a concurrent task, mid-edit — and both were
green on the next run once that task settled.

## Budget

- `agents/orchestrator.md`: 140 511 → 144 820 bytes, **+4 309**. The `agents` surface had
  about 17 300 bytes of head-room, so roughly 13 000 remain for other tasks.
- `hooks/lib/__tests__/turn-budget-lint.test.ts`: 398 → 507 lines, **+109**. The hook-test
  surface had about 2 300 lines of head-room.

## Left open

The three source records were **not** marked closed and their markers were not renamed.
The dispatch restricted the edit surface to the two files above. Each record's acceptance
criteria are met; the marker walk is the orchestrator's to make.

Record 260811-2305 (the opt-out) named an alternative it explicitly called a decision
rather than a defect: narrow the opt-out to "stop asking for the next N Turns" so no state
in which the claim is false is reachable at all. That was not taken. The fix implemented
is the one the record's own fix direction states — qualify both sentences — and the
alternative remains available as a decision record if the residual is judged not worth
carrying.
