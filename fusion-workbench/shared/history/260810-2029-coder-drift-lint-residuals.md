# coder — drift-lint residuals (empty condition cell, skip-licence coverage)

**Status:** Complete
**Task:** `R:260810-1918-drift-lint-residuals`, Turn 2 of session `260810-1646`
**File owned:** `hooks/lib/__tests__/state-drift-detection-lint.test.ts` (the only file changed)
**Records:** `shared/issues/260810-1813_p_*` (Finding 1), `shared/issues/260810-1918_p_*` (Finding 2)

---

## Finding 1 — the empty `Drift when` cell

The condition-table assertion checked that each of the five surfaces has a row and never that
the row says anything, so `| progress.commits | |` passed. The check is now factored into
`assertEveryRowHasACondition()`, which reads the row's second cell (joining any further cells,
so a condition containing a pipe survives) and rejects it when nothing but dashes, an en/em
dash or whitespace remains. The failure message quotes the offending row verbatim.

Controls added, on a constructed stub table rather than on the real prompt: one that accepts a
complete table, and one that empties each of the five rows in turn against each of the three
filler shapes a placeholder actually takes (nothing, a space, an em-dash) — fifteen rejections,
each asserted to name its own surface.

## Finding 2 — the skip-licence blacklist

**Route taken: 1 (extend the blacklist), knowingly and said so in the header.** The
reformulation that would close the vocabulary class is named in the header and reported to the
orchestrator as a proposal: pin the check-mentioning sentences of each act window,
whitespace-normalised, against a baseline literal held in the test — the same move the write
guard made when it stopped classifying shell commands, turning "does this prose permit
skipping?" (undecidable) into "is this the text a human last approved?" (decided). Not taken in
this commit for a sequencing reason, not a design one: a queued task in this same session
rewrites the drift-check prose in `agents/orchestrator.md`, and a pin landed first hands that
executor a red suite in a file it does not own.

Three changes:

1. **The list carries its own witnesses.** `SKIP_LICENCES` is now `{ re, example }` pairs. A
   control requires each entry to be the *first* in the list that matches its own example, and
   the example to be rejected when spliced into an otherwise bound `session_end` sentence. So a
   pattern cannot be declared without a phrasing that witnesses it, and a subsumed pattern
   fails instead of sitting dead. That gate found two dead entries immediately: `\bdon't\b`
   (covered by the new contraction family) and `\bmay be skipped\b` (covered by `\bskip…\b`).
   Both removed; neither removal narrows what the list rejects.

2. **Eleven patterns added** for the eight forms the review measured: two contraction families
   (`isn't`/`won't`), `not required|needed|necessary|mandatory`, `no longer`, `except
   when|where|if|for`, `provided|providing that`, `as time allows|permits`, `best effort`,
   `where|when|if practical`, `drop(s|ped|ping)`, `sparingly`, `at most`. Three existing
   patterns widened for consistency (`skip`, `defer`, `omit` now take `s`/`ing`).

3. **The scan stays sentence-scoped, and that is now measured.** The issue calls widening it to
   the whole act window the cheaper of the two gaps to close. It is not closeable while the
   vocabulary is a blacklist: the Setup Step 1 window in the real prompt carries "**Skip steps
   2-6**" (`:84`) and "skip already-completed tasks" (`:95`), both legitimate, both matching
   `\bskip…\b`. The narrow scope is what holds the false-positive rate at zero — the two
   approximations prop each other up. Recorded in the header rather than acted on.

## Falsification runs

Built in `scratchpad/driftgate/` — a copy of `agents/orchestrator.md` plus a copy of the test,
laid out so `pluginRoot` resolves into the scratch tree. The real prompt was never mutated
(decision `260810-1820`), which matters here because four executors were writing in this tree
at the time.

- Baseline: the unmutated scratch copy passes, 16 tests.
- Finding 1: blanking the `progress.commits` condition cell in the scratch prompt fails the
  changed test naming `progress.commits vs git`; the **pre-change** test passes it (13 tests) —
  the defect was real and the control is not vacuous.
- Finding 2: eleven phrasings spliced one at a time into the Step 3e sentence of the scratch
  prompt. Every one passes the pre-change lint (13 passed) and fails the changed one
  (1 failed | 15 passed).

**The residual, measured rather than asserted.** The review's structural gap survives: appending
"This is optional for a Turn that produced no commit." as a *following* sentence, which never
names the check, leaves the scratch prompt at 16 passed. The class is not closed and the header
says so.

## Verification

`npm test` from `hooks/` — exit 0, 41 files, 1113 tests. `lib/__tests__` is excluded from
`tsconfig.json`'s build, so no `hooks/dist/` rebuild was needed.

## Not touched

`agents/orchestrator.md` (read only), `bin/monitor`, `skills/*/SKILL.md`, `README-hooks.md`,
`hooks/lib/domain-cascade*`. Nothing staged or committed.
