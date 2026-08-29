# Does the executor report contract get a form for a named pre-existing failure, or a per-change test selection?

---
**Domain:** code
**Filed by:** analyst
**Attribution backfilled 260825 (not written by the filing agent):** `analyst` filed this record; the person half of `**Filed by:**` is absent because the installed plugin at `$FUSION_PLUGIN_ROOT` carried no `bin/fusion-identity` at that time. See `shared/issues/260825-1329_*_every-session-runs-one-release-behind-on-a-bin-helper-the-same-repository-just-added.md`.
**Cross-references:** `shared/issues/260810-0703_*_the-report-contract-derives-blocked-from-a-suite-exit-code-so-a-known-red-baseline-blocks-every-task.md`; `agents/coder.md` and `agents/ontocoder.md` (the `Verification:` forms and the derived `Result`); `rules/critical-stance.md` §2 and §4; plan `circles/260824-1853-close-every-open-defect/planning/260824-1905_*_plan-close-every-open-defect.md` step 1 (D-report-baseline)

---

## Question

Commit `1f2faaf` gave the executor report a `Verification:` field with three forms and derived `Result` from it, so `done` requires exit code 0. The exit code it reads is the whole suite's, so one pre-existing failure in a file the task never touched blocks every executor dispatched until somebody clears it, and the party who can clear it is often not the one blocked. Observed the night the contract landed: 967 of 968 passing, the one failure a fixture drift elsewhere, and the executor correctly reported `blocked`. The contract distinguishes two states where there are three: passed; failed because of this task; failed for a reason that predates the task and is named and tracked elsewhere. The third reads as the second, and the sessions since have worked around it by the dispatcher naming the known failure in prose, which is the convention-by-memory shape the critical-stance rule names.

## Options

1. **Leave it** — a red baseline is a real defect and blocking on it is correct; the alternative is executors deciding which failures are theirs, which is the judgement the derivation removed.
   - Pros: `done` keeps meaning something; no judgement returns to the executor.
   - Cons: one unrelated failure converts into a blocked report from every task in flight, and the fix is somebody else's.
2. **A fourth `Verification:` form** for "failed, and the failure is named and predates this task".
   - Pros: the report carries the fact the body already carries, in the field that decides.
   - Cons: reintroduces a judgement call, and the reviews of that session show how readily an executor's self-assessment overstates.
3. **Narrow the question rather than soften the answer** — the executor runs the tests that touch the changed files, so the exit code read is about this task.
   - Pros: the shape `rules/critical-stance.md` §4 recommends: change the question, not the tolerance; no new judgement.
   - Cons: costs a way to select tests per change, which this repository does not have; a whole-suite regression caused by the task can pass the narrowed run.

## Constraints

- `done` stays derived from `Verification:`, not asserted by the executor (the load-bearing part of `1f2faaf`).
- Any change lands in both `agents/coder.md` and `agents/ontocoder.md`, on the `agents/` surface with 10 745 bytes of head-room measured for this Circle.
- Option 3 needs a selection mechanism before the prompt can name one; the prompt does not promise what no tool provides.

## Recommendation

None. The referring record names the three as "none obviously right" and gives no direction.

---
Answered:
Implemented:
Deferred:
Superseded by:
Retired:

---
Deferred: a later Circle that meets the question again — user 2026-08-29, triage of open decisions left in terminal Circles; no scan reaches this store any more, so the deferral is recorded by hand.
