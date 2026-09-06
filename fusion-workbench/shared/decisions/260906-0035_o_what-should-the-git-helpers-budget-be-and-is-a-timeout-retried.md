# What should the git helper's budget be, and is a timeout retried?

---
**Domain:** code
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Cross-references:** `260906-0035_*_the-git-helper-reports-a-timeout-as-not-a-repository-in-every-consuming-project.md` (the defect this answer realises) · `260905-2356_*_the-hook-suite-is-not-isolated-from-a-second-copy-of-itself-and-fails-at-forty-percent-under-one.md` (the measurement) · `260906-0026-what-shared-state-the-hook-suite-reaches.md` (the diagnosis and the option it rejects)

---

## Question

`hooks/lib/git.ts` runs git under a fixed 5-second budget inside the PostToolUse hook of
every consuming project. Measured latency on a six-commit repository is 23 ms quiet and up to
7 580 ms under load, so the budget is crossed by ordinary contention rather than by a hung
process. Separating a timeout from a not-a-repository answer is the defect record's business
and needs no ruling. What needs one is the number and the policy: how long the hook may wait
before giving up, and whether it gives up on the first timeout.

It must be answered now because the defect cannot be repaired without it, and because the
budget is spent on somebody else's machine — a consuming project's, under whatever load that
machine happens to be carrying — while the number is chosen here.

## Options

1. **Raise the budget and retry a timeout once** — the diagnosis's recommendation. Separate
   the two conditions, and on a timeout run the command a second time before reporting one.
   - Pros: covers the measured tail with margin; a single contention spike costs latency
     rather than a false report; the retry is bounded and cannot loop.
   - Cons: a genuinely hung git is now waited on twice; the hook's worst-case contribution to
     a tool call roughly doubles.
2. **Raise the budget, no retry** — the same separation, one attempt, a longer deadline.
   - Pros: the simplest change that fits the measurement; worst-case latency stays one budget.
   - Cons: a spike above the new budget still produces a timeout report, and the measurement
     gives a tail, not a bound, so some number of false reports remains at any finite budget.
3. **Make the budget configurable** — a `FUSION_GIT_TIMEOUT_MS` or a `fusion.json` leaf.
   - Pros: a project on slow hardware sets its own.
   - Cons: the diagnosis rejects this and the reasoning is worth keeping: the only consumer
     that would set it is the test suite, which would then go green while the production
     budget stayed where it is. That is the defect surviving behind a knob, and this project
     has removed configuration leaves for less.

## Constraints

The hook runs on every guarded tool call, so any budget is paid on the common path where git
answers in tens of milliseconds; the deadline governs the tail only. Whatever is chosen, a
timeout must remain distinguishable from a not-a-repository answer — that part is the defect
record's acceptance and is not up for decision here. And the hook must stay fail-open: no
budget may turn a slow git into a blocked tool call.

## Recommendation

Option 1. The measurement shows contention spikes rather than hangs, and a single retry is
what distinguishes those two without a larger deadline. It should be paired with a number
chosen from the measured tail with margin rather than from habit; 5 000 ms was such a habit
and this is the second time in this project that a round number has been mistaken for a
deadlock guard.

---
**Reconciliation 260906-0335 (reconciler, HEAD `b462d55d`) — marker unchanged at `_o_`, no answer
anywhere, no `Answer located:` line.** First reconciliation of this record; it was filed at
`ea17e354` earlier tonight.

Searched for a ruling in the shared decision store, `shared/analyses/` (including
`260906-0026-what-shared-state-the-hook-suite-reaches.md`, which recommends option 1 but is an
analysis and not a ruling), `shared/planning/`, and the September session histories. Nothing rules on
the number or on the retry. `GIT_TIMEOUT_MS` is still `5_000` at `hooks/lib/git.ts` and no
configuration leaf for it exists, so option 3 has not been taken by accident either.

Two of the three budgets the diagnosis named have moved since this record was filed — vitest's case
default at `ea17e354` and the monitor's port prediction at `d2323105` — and this one is the third and
the only one that ships. So the suite is now quieter about the very fault this decision governs,
which raises rather than lowers the cost of leaving it open: the instrument that reported the
production budget has been partly damped while the budget itself is unchanged.
