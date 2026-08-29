# T10b — the empty-key guarantee stated once, in the conventions

**Agent:** coder
**Date:** 2026-08-10 03:40
**Status:** Complete
**Task:** T10b (second half of queue entry 10, `I:260731-2246-empty-key`)
**Source record:** `260731-2246_*_cadence-empty-key-expansion-writes-a-silently-empty-digest.md`
**Predecessor:** `6a69717` (first half — the assertion inside `skills/cadence/SKILL.md`), logged in `260810-0330-coder-cadence-empty-key.md`

## What changed

One paragraph added to `rules/fusion-workbench-conventions.md` `## Path Resolution
(Pfadauflösung)` → *Where the call belongs*, immediately after the paragraph it completes.
It states that a consumer receiving an empty or unset resolver key stops and names that key:
the value is never a default, never a fallback, never an empty result; nothing is scanned or
written through it; the run halts naming the key.

Nothing else in the section moved.

## Why there and not somewhere else

*Where the call belongs* already argues where the resolver is called and why — Setup step 2,
because that step is demonstrably executed on every run, and the values are then held for the
session. The paragraph was silent on the case where a held value turns out to be unusable, so
the addition finishes an argument the reader is already inside rather than opening a new one.

The line is written as the **consumer-side end of the exit-4 rule**, not as a second rule.
*Failure behaviour* already says the resolver exits 4 instead of emitting `KEY=`, because an
empty right-hand side sends writes to the workbench root. The same reason holds one step
later, where a held value is interpolated into a shell block, a glob or a path join and can go
missing long after the resolver exited 0 — the Bash tool starts a fresh shell per call, so a
value that was correct at Setup is simply absent at use. The text says this explicitly ("not a
second rule beside it") so a reader meets one rule with two ends.

*Contract* is not restated: no output shape, no key semantics, no exit table.

## What this buys, and what it does not

The seven sibling skills the issue names (`archive`, `circle-pop`, `circle-stash`, `direct`,
`next`, `seed-from-plane`, plus `agents/playmaker.md`) interpolate resolver keys the same way.
They inherit the rule by reading the conventions file, which every agent loads at Setup and
every skill cites — nothing was patched per-site, which was the point of the queue entry's
acceptance line. It does **not** add an executable check to those consumers; only cadence
carries one, because cadence is the one place where an empty expansion is silent and
self-consistent. The rest fail visibly today.

## Size

The addition costs 670 bytes on the emitted rule set, paid by every agent on every dispatch
(`hooks/lib/__tests__/rules-emission-golden.test.ts` measures exactly this). A first draft cost
896; it was trimmed before verification. The conventions file goes 39 529 → 40 199 bytes.

## Verification

`cd hooks && npm test` — 905 passed, 2 failed (31 files, 29 passed).

- `reference-resolution-lint` — **pre-existing, not mine.** One dangling citation at
  `bin/fusion-plane:567` (`260719-1600_*_open-issue.md`). Another task is mid-edit on that
  file; `git diff --stat` shows `bin/fusion-plane` with 126 changed lines that are not mine.
- `rules-emission-golden` — **moved, and moved because of this change.** It pins the byte size
  of every emitted rule file per agent, so any deliberate edit to a rule file fails it until
  the fixture is regenerated. The only delta is
  `fusion-workbench-conventions.md 39529 → 40199` and each agent's total by the same 670.
  It was re-run alone after the trim to confirm nothing else in the emission moved.

  **Not regenerated here, deliberately.** Regeneration is
  `cd hooks && UPDATE_RULES_GOLDEN=1 npx vitest run lib/__tests__/rules-emission-golden.test.ts`
  (it rewrites the fixture and then fails on purpose, forcing a second clean run). Two later
  tasks in this session also edit `rules/fusion-workbench-conventions.md`; regenerating now
  would produce a fixture that is stale again within the hour and three diffs where one
  suffices. The fixture is also outside the single file this task was scoped to touch.
  **Whoever lands the last conventions edit in this session owns the regeneration.**

No other test moved.

## Files changed

- `rules/fusion-workbench-conventions.md` (+1 paragraph)

## Not touched, and why

- `fusion-workbench/tasklist.md` — entry 10 still reads `[ ] open`. The predecessor commit
  `6a69717` did not touch the queue either; the orchestrator is maintaining it this session.
  Both halves of the acceptance criteria now exist.
- The source issue record still carries `_o_`. Closing it wants the commit hash this change
  lands in, and the orchestrator holds the commit.
- `hooks/lib/__tests__/fixtures/rules-emission.golden` — see Verification.
