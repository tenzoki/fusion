# Step 4 of the five-severe-guard-defects plan: a before-picture is consumed exactly once

**Date:** 2026-08-09
**Agent:** coder
**Status:** Complete
**Plan:** `shared/planning/260809-1229_o_plan-five-severe-guard-defects.md`, Step 4
**Closes (code half):** `shared/issues/260809-1108_o_a-failed-snapshot-save-leaves-the-previous-one-in-place-so-the-next-call-reverts-to-an-older-state.md` (High)

---

## What was implemented

One invariant: a before-picture is consumed exactly once. Two edits carry it, and
they close the two ways the seam between the hooks handed the same picture to a
measurement it did not belong to.

1. **`saveSnapshot` removes the stale file when its own write fails.** The write
   that can fail is the one to `protected-snapshot.json.tmp`, which leaves the
   previous `protected-snapshot.json` completely untouched. The comment in the
   `catch` claimed "the next comparison has no before-picture and skips"; it had
   one, from an earlier call. `rmSync(path, { force: true })` in the `catch`, in
   its own `try`, makes the sentence true.
2. **`consumeSnapshot()` loads and then unlinks.** `tracker.ts`'s
   `measureProtectedPaths` calls it in place of `loadSnapshot`. The unlink runs
   after the object is in memory, and runs as well when the load returned null,
   so after a measurement there is no picture on disk under any outcome.

**No age bound was added, deliberately.** The filed issue's own suggested
direction proposes rejecting a snapshot older than a small bound. A legitimate
tool-call window has no upper limit — this suite holds one open for about two
minutes and a build holds it longer — so any bound is a silent skip of the
measurement for exactly the long calls that change the most. That would be a
fail-open introduced by the fix, in a plan whose binding constraint is that no
step opens behaviour. The plan rejects it in its Approach; the code and the two
headers now say why in place.

## Documentation that stopped overclaiming

- `ProtectedSnapshot.ts` — the field's own doc named a reader ("for the reader of
  a stale snapshot file") that never existed. It now says the field is written
  and read by no code, and why the obvious reader must not be written.
- `lib/protected-snapshot.ts` header, `## The BEFORE fingerprint is the condition
  of admissibility` — the claim was that the pair makes the measurement
  *attributable*. It does not: it bounds the **interval**, not the author. A
  human editor, a watcher and a second Claude session are indistinguishable from
  the agent here. Now stated, citing `260809-1107`, which Step 5 answers.
- A new header section, `## A before-picture is consumed exactly once`, carries
  the invariant and the rejected age bound.
- `tracker.ts` — the "no before-picture" section now names all four ways there is
  none (including a failed save, the case `260809-1108` measured), and the
  parallel-call residual states exactly what single use narrows: one picture can
  no longer serve two measurements. The remaining exposure is under-reporting,
  which was already its shape.

## The seam Step 5 docks onto

`measureProtectedPaths` now holds the after-snapshot in a named local:

```ts
const after = takeSnapshot(root, config.guard.protectedPaths);
const changes = diffSnapshots(before, after);
```

Step 5 has to write the **observed** bytes of a path into
`.guard-state/reverted/` before reverting it. That value is
`after.paths[change.path]`; reading the file again instead would be a second
answer to one question, which is the mistake `ProtectedChange.before` already
exists to avoid. The persistence half of the function is final, so Step 5 edits
only the attribution half.

## Verification

Everything ran through `lib/__tests__/helpers/guard-harness.ts`, in throwaway
project roots outside this repository. The write guard stands down here by
design, so an assertion written naively in this tree would pass without the
mechanism running.

**Two new cases**, in `protected-snapshot-integration.test.ts`, under
`a before-picture is used by exactly one measurement`. Both drive `runGuard` and
`runTracker` directly rather than `runToolCall`, because both are about an
unpaired half of the seam — an unpaired PreToolUse in the first, an unpaired
PostToolUse in the second — and a paired call cannot express either shape.

**Anti-vacuity, measured rather than assumed.** Run against the unmodified tree
at `9716ee5`, both cases fail at the structural assertion
(`protected-snapshot.json` still on disk). That alone would not show the damage,
so the block was re-run at `9716ee5` with the two structural assertions removed:
both then fail on the bytes of `rules/x.md`, which is the destructive
consequence itself.

- Case 1: expected `# this call's own change`, got `# a rule` — the guard
  reverted to the state from **two calls ago** and destroyed the settled state
  in between. This reproduces the issue's own measurement.
- Case 2: expected `# written after that call ended`, got `# a rule` — a second
  PostToolUse with no PreToolUse reverted a write no picture described.

**Two existing cases had to move their observation point**, and this is reported
rather than quietly fixed, because the plan's testing strategy calls an edited
existing test a stop-and-report condition. `protected-snapshot-subdirectory.test.ts`
read `protected-snapshot.json` off disk **after** a completed tool call, to prove
where the measurement anchored. That file is now gone by the time the call ends.
The asserted property is untouched; only the moment of observation moved, into
the `effect` between the two hooks, where the picture is live. The placement is
also sharper: a null answer during the call means no picture was ever taken,
while a null answer afterwards could equally mean the measurement ran and
cleaned up. The plugin-repo stand-down case was moved for that second reason even
though it was still passing.

**Suite:** `npm test` in `hooks/` — 33 files, 1069 tests, 0 failures, exit code
`0` read out explicitly. Baseline before this step was 33 files and 1067 tests;
the two new cases are the difference, and no test was deleted.

One flake was observed on the way: a single `npm test` run died with a tinypool
`onUnexpectedExit` worker crash (1060 of 1069 reported). Two subsequent full runs
were clean. Not investigated, not attributed to this change, recorded because it
happened.

## Bookkeeping

- Step 4 marked `[DONE]` in the plan.
- Step 1 marked `[DONE]` as well: it landed in `509e4c6` and the marker was
  missed. Verified against the code (`lstat` fingerprint, `LINK_PREFIX`,
  `assertPathResolvesInPlace`) before marking.
- Step 3's corpus sentence in the plan was inverted — it demanded that every
  command allowed at the baseline still be allowed, which contradicts the
  acceptance criteria under it. Corrected to the property that was actually
  implemented and measured: every verdict that denied at the baseline still
  denies. The numbers in the correction were measured against the shipped fixture
  rather than carried over: 108 commands × 8 verdicts, 90 verdicts moved from
  allow to deny across 24 distinct commands, 0 from deny to allow. The acceptance
  criteria were not touched.
- `260809-1108` stays `_o_`. The plan holds all five issues open until Step 6.

## Open

- **Step 0 of the plan is still unsatisfied.** Its acceptance criterion is that
  the installed copy matches the work tree; measured now, `~/.fusion` is at
  `6.0.1` and the work tree at `6.1.0`. It changes nothing about this
  verification, which spawns the work-tree build through `tsx`, and it was not
  run here because updating the installed copy under a live session swaps the
  hooks that session is executing. It stays a precondition for observing guard
  behaviour live.
