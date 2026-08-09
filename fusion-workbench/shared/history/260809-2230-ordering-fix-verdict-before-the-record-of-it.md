# The verdict now stands ahead of the record of it, at every site in both hooks

**Agent:** coder
**Status:** Complete
**Date:** 2026-08-09
**Scope:** `hooks/lib/fail-open.ts`, `hooks/guard.ts`, `hooks/tracker.ts`, two test files
**Records addressed:** `shared/issues/260809-1825_p_*`, `260809-2045_p_*`, `260809-2046_p_*`
**Record judged separate:** `shared/issues/260809-2049_o_*` (clear-halt)

---

## What was wrong

One sentence, at fourteen call sites across the two hooks: a record about a
decision stood ahead of the decision. `saveEscalation` before `block`,
`emitEvent` before `block`, `trackChurn` before `respond`. Any throw in the
record reached `main().catch`, which supplies the fail-open verdict — an ALLOW
on the guard side, a bare `{}` on the tracker side — so the guard's own
bookkeeping could withdraw a deny it had already reached from the config and the
path.

`db9bbe4` had already fixed exactly this at the TOP LEVEL of each hook and
`lib/fail-open.ts` states the argument in full. Nothing had applied that argument
inside `main`.

## The site list

Fourteen sites. Eleven could discard a verdict or the halt sentence; the three
open records named four of the eleven.

### `hooks/guard.ts`

| # | Site | Failing call | Cost before the fix |
|---|---|---|---|
| 1 | `config.diagnostics` loop | `emitEvent` | ANY verdict → allow. Needs a malformed `fusion-guard.json`. **Named in no record.** |
| 2 | CHECK 1, halt | `emitEvent` | deny → allow. `260809-1825` names this site but names `saveEscalation` as the call; it is `emitEvent`. |
| 3 | CHECK 2, protected path | `saveEscalation`, `emitBlockEvent` | deny → allow. `260809-1825`. |
| 4 | CHECK 2, rules-write advisory | `emitEvent` | The later verdict → allow. Flips only when a path is BOTH exempted and decision-governed at high sensitivity. **Named in no record.** |
| 5 | CHECK 3, decision-governed | `saveEscalation`, `emitBlockEvent` | deny → allow. `260809-1825`. |
| 6 | `guardBashCommand` STEP 1, git deny | `saveEscalation`, `emitBlockEvent` | deny → allow. `260809-2046`. |
| 7 | `guardBashCommand` STEP 3, override note | `saveEscalation`, `emitEvent` | allow → allow. No flip; same class. |
| 8 | Self-detect stand-down | `emitEvent` | allow → allow. No flip; same class. |
| 9 | Final allow path | `saveEscalation`, `emitEvent` | allow → allow. No flip; same class. |

### `hooks/tracker.ts`

| # | Site | Failing call | Cost before the fix |
|---|---|---|---|
| 10 | `measureProtectedPaths`, exempted advisory | `emitEvent` | Skips the RESTORE entirely — the protected path stays rewritten, no halt, nothing said. The worst of the five. **Named in no record.** |
| 11 | Per-outcome `guard_block` rows | `emitEvent` | Sentence lost. **Named in no record.** |
| 12 | Halt record | `saveEscalation` | Sentence lost. Raised as an open question by `260809-2045`, never filed. |
| 13 | `guard_halt` row | `emitEvent` | Sentence lost. **Named in no record.** |
| 14 | `trackChurn` before `respond` | any throw in the heatmap | Sentence lost. `260809-2045`. |

### Checked and deliberately NOT in the class

- **`saveSnapshot(takeSnapshot(...))` in `guard.ts`** runs before every verdict
  and is not a report: it is the input to the NEXT hook's decision and has to
  precede the tool call. It cannot throw — `saveSnapshot` swallows its own I/O
  failure, `takeSnapshot` catches per directory and per path, and the loader
  validates `protectedPaths` as `isStringArray`. Wrapping it would be wrong, not
  merely redundant: `saveSnapshot`'s catch REMOVES the stale snapshot, and
  swallowing one level up would hand `tracker.ts` a picture two calls old
  (`260809-1108`). Documented at the call site.
- **`hooks/session-start.ts`** writes nothing anywhere and already ends in
  `failOpen`. No site.
- **`hooks/clear-halt.ts`** already reports after it acts, and its `emitEvent` is
  already guarded with its own explanation. Its defect is a different one — see
  the fourth record below.

## What was done

`lib/fail-open.ts` becomes the module that owns the ordering rather than only its
error tail. It gains two exports beside `failOpen`, both built on one guarded
step:

- **`answer(tag, verdict, ...reports)`** — writes the verdict unguarded and
  first, then each report in a `try` of its own. Sites 2, 3, 5, 6, 7, 8, 9, 14.
- **`bestEffort(tag, step)`** — the same guarantee for a report that genuinely
  cannot be moved after the verdict, returning the failure as a string for the
  one caller whose wording depends on it. Sites 1, 4, 10, 11, 12, 13.

A guarded step that fails writes the same `[<tag>] Error:` marker a crash would
have written, so nothing is lost in silence.

Two decisions taken while there, both of which `260809-2045` asked to be settled
with `260809-1825` rather than separately:

1. **The tracker's halt record is best effort.** An unwritable state directory
   costs the halt record, not the sentence — the sentence is what stops an agent
   working around a change it cannot explain, which the tracker's own header
   calls a constraint.
2. **The sentence stops claiming a halt it may not have.** When the halt could
   not be recorded, the message says so, names the failure, and drops the
   clear-halt instruction (there is nothing to clear). The agent's required
   action is identical in both branches; only the two clauses that would
   otherwise be false differ.

## Measured, before and after

Scratch consuming projects, real hooks as subprocesses, `tsx` source and the
committed `dist/` both.

| Case | At `HEAD` | After |
|---|---|---|
| `.guard-state/` at `0555`, `Edit rules/x.md` | `{}` (allow) | `{"decision":"block", …"rules/x.md"…}`, exit 0 |
| `.guard-state/` at `0555`, halted project, `Edit notes.txt` | `{}` (allow) | `{"decision":"block","reason":"[HALTED] …"}`, exit 0 |
| `.guard-state/` at `0555`, `Bash git switch main` | `{}` (allow) | `{"decision":"block","reason":"fusion policy: …"}`, exit 0 |
| `churn.json` a non-empty directory, `rules/x.md` changed | `{}`, file reverted, `haltActive: true`, agent told nothing | full `additionalContext` sentence naming the file and `clear-halt.js`; file reverted; `haltActive: true` |
| `escalation.json` a non-empty directory, `rules/x.md` changed | (not previously measured) | file reverted, sentence delivered, halt branch reads "The halt could NOT be recorded (…), so write tools are NOT blocked" |

The `[guard] Error:` / `[tracker] Error:` marker is present in every failing
case, so none of them can pass by the mode bits being ignored.

## Tests

`hooks/lib/__tests__/hook-fail-open.test.ts` gains a second `describe` driving
all five measured cases through the real hook subprocesses, plus unit cases for
`answer` and `bestEffort` (order, independent guarding, the stderr marker, the
returned failure). The case previously named "fails open on a protected path
too" asserted the defect and pointed at `260809-1825` as the record whose landing
should flip it; it now asserts the deny.

Two source-text gates in `guard-bash-wiring.test.ts` moved with the shape they
pin:

- `block(verdict.reason` → the reason is now held in a name, because the deny is
  written before the two state writes that record it and all three need the same
  string. The gate now pins `verdict.reason ??` and `() => block(reason)`.
- "does not return out of the override branch" rested on the reasoning that a
  return there would stop the function ending in a bare `allow()`. That no longer
  follows: the branch writes its own allow first, so it must return, and the
  function still ends in the bare `allow()` its own gate checks. Rewritten to pin
  what was actually being protected — the override branch answers with `allow`
  and never `block`.

`npm test` (build + vitest): **1154 passed, 34 files**. 1143 at `HEAD`; +11 new
cases, none removed.

## The fourth record — left open, deliberately

`shared/issues/260809-2049_o_clear-halt-discards-a-halt-raised-between-its-load-and-its-save-….md`
is a different defect in the same family and does not belong in this change.

- **Ordering is not its problem.** `clear-halt.ts` already acts first
  (`clearHalt` + `saveEscalation`), then reports, and its `emitEvent` is already
  guarded with a comment stating exactly this rule. Nothing in it is inverted.
- **Its defect is the merge.** `escalation.ts:287` adopts a disk halt only when
  it is NEWLY raised, and that test cannot separate the halt the human came to
  clear from an unrelated one raised inside the window. The fix is a read-after-
  write comparison in `clear-halt.ts`, which is a new mechanism, not this one.
- **`fail-open.ts` does not reach it.** `clear-halt` is a manual tool, not a
  hook: it owes Claude Code no verdict, has no fail-open path, and correctly
  exits non-zero with a stack trace when it cannot do its job.
- The review itself files it under "Concurrency" and excludes it from the
  cross-cutting observation, which names four sites across two records and does
  not include this one.

Folding it in would put an unrelated concurrency fix into a commit whose subject
is call ordering — the scope error the review's own cross-cutting finding warns
about, arrived at from the other side.

## Record status

- `260809-1825` — **fully closed** by this change, and its enumeration extended:
  CHECK 1 fails through `emitEvent` rather than `saveEscalation`, and two sites
  it does not name (the diagnostics loop, the rules-write advisory) are fixed
  with it. Its four acceptance criteria are met, the last one included.
- `260809-2045` — **fully closed**, including the question it deferred to
  `260809-1825` about `saveEscalation` inside `measureProtectedPaths`.
- `260809-2046` — **fully closed**. Its second criterion ("`260809-1825` names
  this site, or this record is closed by the commit that closes it") is met by
  the second half.
- `260809-2049` — **left open**, for the reasons above.

## Not done here, on purpose

`rules/protected-path-discipline.md` and `rules/git-branch-discipline.md` say
nothing that this change falsifies — neither describes the internal ordering —
but a documentation pass follows and owns any wording that should now mention it.
No file under `rules/` or `docs/` was touched.
