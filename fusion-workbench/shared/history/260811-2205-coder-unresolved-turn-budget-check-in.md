# The unresolved Turn budget gets a bound of its own

**Status:** Complete
**Agent:** coder
**Task:** Turn 5, first task
**Closes:** `shared/issues/260811-2142_c_the-unresolved-turn-budget-leaves-the-phase-2-loop-with-no-monotone-bound-while-the-prompt-says-it-is-bounded.md`
**Baseline:** `e3da397`

## What was wrong

`61bd21f` made the Turn budget a configuration leaf and refused, correctly, to substitute a
number when the read fails. Beside that refusal it wrote that the loop is *still* bounded by
the other five circuit-breaker conditions and the Step 3e convergence check.

Read against the table it pointed at, that was false. **Max Turns reached** was the only
monotone row — the only one whose satisfaction follows from Turns passing rather than from
the work taking a particular shape. Net-negative needs `created > resolved`, zero-progress
needs both counts at zero, the cascade needs errors, all-blocked needs a blocking graph, the
guard halt is unrelated, and Step 3e needs an empty queue. A session that resolves one task
and files one issue per Turn meets none of them and never shortens the queue. Removing the
count-based row removed termination, not one exit among six.

The branch is not a corner: the helper-absent route is what every consumer meets until it
next runs `fusion --update`, which is exactly the population that cannot yet have
`bin/fusion-turn-budget`.

## What was built

**One gate, and no number.** `agents/orchestrator.md` Step 3d gained the
**Unresolved-budget check-in**, fired only when the Setup read came back unresolved. At each
Turn boundary — after the circuit-breaker table, before Step 3e — the session emits
`gate_hit`, asks with `AskUserQuestion`, and emits `gate_response`. Three answers:

- **Continue** (default) — another Turn, ask again at the next boundary. If the user's answer
  names a count of further Turns, that count is the interval. It is the user's number, and it
  never reaches `progress.max_turns`, which stays omitted.
- **Stop here** — the exit *Max Turns reached* would have produced, with a `circuit_breaker`
  event naming the condition.
- **Continue without check-ins** — the user accepts a loop with no count-based exit. Recorded
  in the history and repeated in the final summary; the loop is not called bounded afterwards.
  This is the record's own "state it as accepted", available as a choice rather than as a
  default.

The gate reuses `gate_hit` / `gate_response` and adds no event type. It gets a row in the
Human Gate Rules table, placed **above** the three Coherence rows, because the Rebalance Gate
section refers to "the three bottom rows" of that table by position.

**Why the interval is not a configuration leaf.** It would be read the way
`orchestrator.maxTurns` is, through `bin/fusion-turn-budget` — the read whose failure *defines*
this branch. A fallback stored behind the mechanism it is a fallback for is absent in exactly
the case it is needed. So it is one Turn: the only interval statable without inventing a
count, widened or switched off by the user at the first question. That reasoning is written
into the prompt beside the branch, not only here.

**Four prose sites made true.** The Setup Step 2 unresolved bullet (the false claim, replaced
by why the row was the monotone one plus a pointer to the gate), the Phase-2 head, the
Rebalance-bounding paragraph, and its Phase-3 sub-paragraph — the last two previously said the
retries were bounded "only by the user's judgement at the gate" and left the Phase-3 bypass
comparing against a key that is absent.

**Three lint cases, all measured.** `hooks/lib/__tests__/turn-budget-lint.test.ts`:

1. The orchestrator never states the loop is bounded — 2 hits against the pre-fix text (Setup
   bullet and Phase-2 head), 0 after.
2. The gate is defined under Step 3d, reaches the user through `AskUserQuestion`, and is named
   more than once so Setup points at it — anchor absent before, 6 mentions after.
3. `BUDGET_LITERALS` gained a ninth pattern for a check-in interval written as a figure
   ("every 3 Turns", "4 more Turns"). It is the only forward-looking entry — it finds nothing
   in either prompt today — so its detection is measured directly on the sentences it exists to
   catch and on two legitimate Turn counts it must leave alone. A pattern whose only evidence is
   an empty result is indistinguishable from a broken one.

Only `agents/orchestrator.md` is scanned by cases 1 and 2. `skills/setup/SKILL.md` would
produce zero hits before and after — it cites Setup Step 2 rather than restating it, and an
existing case pins that citation. The setup-skill literal case already has that shape and is
filed separately; a second one was not added beside it.

## Not done here

- `260811-2150` (`/fusion:circle-stash` renders an empty right-hand side for an absent
  `max_turns`) is untouched. It is a defect in the stash skill's rendering, not in the
  orchestrator's branch, and nothing here makes it closable.
- `260811-2149` (record-counts halves gated together on a missing `session.started`) shares the
  absent-value *shape* only; different surface, different value.

## Verification

`cd hooks && npm test` — exit 0. 52 files, 1338 tests (baseline 1335 + the three above).
