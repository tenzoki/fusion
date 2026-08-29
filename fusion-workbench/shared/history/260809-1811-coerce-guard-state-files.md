# Coerce the churn and cross-file state files instead of casting them

**Date:** 2026-08-09 18:11
**Agent:** coder
**Status:** Complete
**Task:** `I:260809-1101-coerce` — task 1 of `fusion-workbench/tasklist.md`
**Source record:** `260809-1101_*_churn-and-cross-file-state-are-cast-not-coerced-so-a-shape-valid-file-swallows-the-halt-message.md`
**Tree state at start:** HEAD `6b94e17`

## What was wrong

`loadChurn` and the cross-file loader both parsed their state file and cast the
result with `as`, inside a `try/catch` that answers a missing file and
unparseable text and nothing else. A file that parses to a valid JSON value of
the wrong shape — `{}` was the measured case — passed that catch and threw on the
next field access. The throw reached `hooks/tracker.ts`'s top-level handler,
which calls `respond()` with no argument, so the protected-path halt sentence the
same tool call had already built went out empty. The revert and the halt still
landed; the only message telling the agent which file changed and how a human
clears the halt did not. Nothing repaired the state file either, because the save
sits after the throw.

`hooks/lib/escalation.ts` already carried the fix for this exact defect
(`260802-2334_*_a-shape-valid-escalation-json-makes-the-whole-guard-fail-open-on-both-surfaces.md`), applied to one of the three state modules.

## What was done

The shared route recommended as target C2 in
`260809-1101-guard-support-layer.md`, rather than two more
private copies of the escalation coercion.

**New — `hooks/lib/guard-state-file.ts`.** The resolve-read-coerce-write seam for
one `.guard-state/` JSON file: `guardStatePath`, `loadGuardState(fileName,
coerce)`, `saveGuardState(fileName, state)`, plus three coercion primitives
(`isStateObject`, `nonNegativeCount`, `optionalTimestamp`). Two properties carry
the design:

- The coercion is a **parameter of the load**, so a state module has nowhere left
  to put an `as` cast. That is what stops the third copy of the defect, as
  opposed to fixing the second one.
- Absence, an unreadable file, unparseable text and a wrong-shaped value are
  **one branch**: the coercion is called with `undefined` for the first three.
  All four mean the file tells the guard nothing, and the empty state is the
  honest reading of nothing. The old `catch` had two of those four cases and
  discovered the other two in production.

The coercion runs outside the `try`, so a defect in a coercion cannot be
mistaken for a malformed file.

**`hooks/lib/churn.ts`.** Added `coerceChurnState`; `loadChurn` and `saveChurn`
are now two lines each over the helper. `sessionStart` must be a string `Date`
can read, because `recordChange` derives a session age from it and `NaN` compares
false against every threshold — an unreadable value would have retired the
two-hour session reset silently rather than failing. A `files` entry whose value
is not an object is dropped rather than zero-filled: a zero-filled entry claims
the guard observed a file it knows nothing about, and the next real change
re-creates it correctly.

**`hooks/lib/cross-file.ts`.** Added `coerceCrossFileState`, same shape.
`lastEditFile` is the field where the coercion is load-bearing beyond not
throwing: `recordEdit` compares it against the file being edited to decide
whether an edit is a return visit, so a non-string has to become `null`. The dead
`EMPTY_STATE` constant (a shared mutable object with no reader) went in favour of
an `emptyState()` function, which `resetCrossFile` now uses.

**`README-hooks.md`.** One row for the new module.
`derivable-enumerations-lint.test.ts` requires every `hooks/lib/*.ts` to appear
in that table, which is how the omission surfaced.

## What was deliberately not done

- **`hooks/lib/escalation.ts` was not migrated onto the helper.** Out of the
  task's scope, and a behaviour-preserving refactor of a module whose behaviour
  other queued tasks depend on belongs in its own commit.
- **`hooks/lib/protected-snapshot.ts` was not migrated either, and this one is a
  finding rather than a scope line.** C2 counts it as the fourth call site of the
  same twelve-line pattern. It is not: its load answers `null` rather than an
  empty state (no before-picture must never read as an empty one), its save
  removes the stale file when its own write fails (`260809-1108_*_a-failed-snapshot-save-leaves-the-previous-one-in-place-so-the-next-call-reverts-to-an-older-state.md`), and its read
  unlinks the file as it goes so one picture cannot serve two measurements. Three
  deliberate differences, each with a measured issue behind it. Folding it into
  this seam would either flatten them or grow the seam options until it is a
  pattern again. C2 is therefore two thirds achievable, not four quarters; the
  reasoning is recorded in the helper's own header where the next reader of C2
  will meet it.
- **The monotonic-latch defect in the same two modules.** Queued as task 9,
  blocked on a human decision. Untouched.

## Verification

- `hooks/lib/__tests__/guard-state-shape.test.ts` (new, 16 cases) drives both
  hooks through the integration harness against a throwaway project seeded with a
  malformed state file. Each case edits an unprotected path while a protected one
  changes inside the same window — a user saving a rule file in their editor —
  so the PreToolUse guard allows the call and the measurement still has something
  to report. Every case asserts the halt sentence itself: the phrase, the changed
  path, `HALTED`, and the clearing command.
- **Every case uses a write tool, and that is not incidental.** The churn half of
  the tracker returns immediately for `Bash`, so a malformed state file is never
  read on that surface and the message was never at risk there. The write tools
  are the whole exposure.
- **The test bites.** Run against the pre-fix sources restored from `HEAD`, 8 of
  its 16 cases fail with `tracker failed open: [tracker] Error: TypeError: Cannot
  read properties of undefined (reading 'notes.txt')`. The 8 that pass there are
  the rows the old `catch` genuinely handled (truncated JSON, an empty file) and
  the well-formed anti-vacuity rows.
- Unit coercion cases added to `churn.test.ts` and `cross-file.test.ts`,
  including a round-trip case in each: a coercion that emptied everything would
  satisfy every malformed row while silently resetting a project's accumulated
  counters on load.
- `npm test` in `hooks/`: **1113 passed, 34 files, 0 failed.**
- The new file also passes with `FUSION_GUARD_ENTRY=dist`, against the compiled
  `dist/tracker.js` the hooks actually run.

## Files changed

| File | Change |
|---|---|
| `hooks/lib/guard-state-file.ts` | new — the shared state-file seam |
| `hooks/lib/churn.ts` | `coerceChurnState`; load/save over the helper |
| `hooks/lib/cross-file.ts` | `coerceCrossFileState`; load/save over the helper; dead `EMPTY_STATE` removed |
| `hooks/lib/__tests__/guard-state-shape.test.ts` | new — the end-to-end halt-message cases |
| `hooks/lib/__tests__/churn.test.ts` | coercion cases |
| `hooks/lib/__tests__/cross-file.test.ts` | coercion cases |
| `README-hooks.md` | one row in the files table |
| `hooks/dist/**` | rebuilt (committed build artifact) |
| `fusion-workbench/tasklist.md` | task 1 marked done |
| `260809-1101_*_…` | `Resolved:` note appended; marker left at `_p_` as instructed |

Not committed — the orchestrator commits under the commit lock.
