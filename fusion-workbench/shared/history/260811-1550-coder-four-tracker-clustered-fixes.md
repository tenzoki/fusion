# Four tracker-clustered fixes — tasks 11, 12, 18, 21

**Agent:** coder
**Status:** Complete
**Started:** 260811-1528
**Finished:** 260811-1553
**Git HEAD at start:** `3b30f5e`
**Verification:** `cd hooks && npm test` — exit 0, 49 files, 1284 tests (1271 at HEAD; 13 added)

---

## What was asked

Four normal-priority defect records, batched because all four touch `hooks/tracker.ts` or
what it feeds. Four independent fixes, four source records, closed in place.

## What landed

### Task 11 — `260809-2252`, the noise-list comment

The `TRACKER_NOISE_FILES` header said the list excludes two metrics and named the ping-back
tracker, which left with decision `260809-2004`. Corrected to one metric, and the word
"ping-back" is gone. The list's membership did not change and the "This list is not a
protection statement" argument below the header is intact.

The constant moved as part of task 12, so the corrected comment travelled with it — which is
what the queue entry asked for by landing 11 first.

### Task 12 — `260810-1632`, the ranking had no noise filter

`rankThrashing` excluded absent files and nothing else, so the key migration that lifted the
workbench dashboard files into the noise-matching spelling left their accumulated score in a
ranking the orchestrator reads at Setup.

- `TRACKER_NOISE_FILES` **moved** from `hooks/tracker.ts` to `hooks/lib/churn.ts` rather than
  being exported: `tracker.ts` runs `main()` at module load, so `churn.ts` could not import
  from it. One definition, pinned by a case.
- `rankThrashing` applies it ahead of the existence check, and reports `noise` as its own
  count. Disjoint by construction: a key that is both counts as noise, because "not evidence"
  holds whether or not the file is on disk.
- The output contract moved with the result shape at all four surfaces that document it:
  `hooks/churn-rank.ts`, `bin/fusion-churn-rank`, `agents/orchestrator.md` Setup Step 5,
  `skills/setup/SKILL.md` Step 3 — plus two `README-hooks.md` rows.

Live map after the change: `entries=451 absent=209 noise=2 ranked=10`, and
`fusion-workbench/orchestrator-live.md` no longer holds a top-ten slot.

### Task 18 — `260803-1352`, the advisory clamp

**The record's coordinates were entirely stale, including its four reconciliations.** At HEAD,
`forEvent` and `EVENT_DETAIL_MAX` do not exist under `hooks/` and both named `guard.ts`
emissions left with the Bash classifier in v6.0.0. The finding outlived them: the third writer
the last reconciliation added, `hooks/tracker.ts:557`, calls `rulesWriteDetail(exempted)` on a
list of arbitrary length.

The bound went into `rulesWriteDetail` (`hooks/lib/rules-write-exemption.ts`), not into a new
`lib/events.ts` clamp as that reconciliation proposed. Both hooks already import that module,
so the "one place both hooks reach" property holds without a fourth module, and it is the only
place that knows the string is a *list* and can drop whole entries with `(+N more)` instead of
cutting mid-path. `DETAIL_MAX = 200`, the retired number. The 30-path case went from 902
characters to 185.

One exception is stated rather than hidden: a single path that alone overruns the budget is
written whole, because a path is bounded by the filesystem and a list is bounded by nothing.

### Task 21 — `260805-1859`, the event log — closed as a split

**Half (a) implemented.** The contentless `{"event":"tracker_record","tool":"Bash","detail":
"Bash command observed"}` is no longer emitted. 4 226 of 17 524 lines, 24 % of this
repository's log. Filling it with content was refused: the only content available is the
command text, and the guard stopped reading command text in v6.0.0 on purpose.

**Half (b) filed, not guessed.** Every bound discards evidence. A line or size cap throws away
the oldest lines first, and those include the 99 `guard_block` / `guard_halt` / `halt_cleared`
events that are the enforcement audit trail — 0.6 % of the file. Tail-reading in `bin/monitor`
loses the same evidence from the reader's side, because the panel caps each class separately
and a fixed window can contain no `guard_halt` while the whole file does. Filed as
`shared/decisions/260811-1534_o_does-the-guard-event-log-get-an-upper-bound-and-what-happens-to-the-evidence-in-it.md`,
four options, recommendation: archive rather than truncate.

## Files changed

| File | What |
|---|---|
| `hooks/lib/churn.ts` | `TRACKER_NOISE_FILES` moved here with the corrected header; `ChurnRanking.noise`; the filter in `rankThrashing` |
| `hooks/tracker.ts` | local list removed, imported instead; contentless Bash `tracker_record` removed |
| `hooks/churn-rank.ts` | `noise=` output line + contract docblock |
| `hooks/lib/rules-write-exemption.ts` | `DETAIL_MAX`, `boundedList`, bounded `rulesWriteDetail` |
| `hooks/guard.ts` | one stale present-tense comment about the deleted git overrides |
| `bin/fusion-churn-rank` | output contract |
| `agents/orchestrator.md` | Setup Step 5 churn paragraph |
| `skills/setup/SKILL.md` | Step 3 churn line |
| `README-hooks.md` | `lib/churn.ts` and `churn-rank.ts` rows |
| `hooks/lib/__tests__/churn.test.ts` | 5 cases |
| `hooks/lib/__tests__/churn-key-anchor.test.ts` | 3 cases |
| `hooks/lib/__tests__/rules-write-exemption.test.ts` | 4 cases |
| `hooks/lib/__tests__/guard-rules-write-integration.test.ts` | 1 case |
| `hooks/lib/__tests__/monitor-warnings-panel.test.ts` | fixture updated off the removed event shape |
| `hooks/dist/**` | rebuilt with `npm run build` |

## Verification against a scratch project root

The guard stands down in this repository, so the four behavioural changes were exercised
through the suite's spawn harness against throwaway project roots, the same mechanism the
integration tests already use:

- `churn-key-anchor.test.ts` — "writes nothing to the event log for a Bash call"; "still
  records the write-tool events, which carry a file"; "keeps a migrated dashboard key out of
  the ranking, and counts it apart" (through the same program `bin/fusion-churn-rank` runs).
- `guard-rules-write-integration.test.ts` — "bounds the advisory detail when one command
  exempts thirty rule files", driven through PreToolUse → a real 30-file write → PostToolUse,
  which is the window the measurement measures.

Plus one read-only run of the real wrapper against this repository's live map, which is what
the `noise=2` number above comes from.

## Filed while working

- `shared/decisions/260811-1534_o_…guard-event-log…` — task 21's half (b).
- `shared/issues/260811-1547_o_the-orchestrator-prompt-cites-a-fusion-monitor-reset-skill-that-does-not-exist.md`
  — `agents/orchestrator.md:192` justifies its append-only instruction with a skill that does
  not exist. Found by trying to cite the same claim in the decision record above, which is
  also how it propagates. The reference lint resolves path-shaped citations only, so the
  `/fusion:<name>` form has no gate.

## Sibling sweep

Every claim corrected here was grepped across `agents/`, `skills/`, `rules/`, `hooks/`,
`bin/`, `docs/` and `README*.md`:

- "ping-back" — three remaining mentions, all past-tense and all naming decision `260809-2004`.
  Correct as they stand.
- the churn-rank output keys — one other surface (`agents/orchestrator.md:126`), updated; the
  `skills/setup/SKILL.md` pointer and two `README-hooks.md` rows updated with it.
- `forEvent` / `EVENT_DETAIL_MAX` — no live references outside the new past-tense ones.
- `tracker_record` — `bin/monitor`'s two mentions stay true; the write-tool records survive.
- one stale sibling fixed in passing: `hooks/guard.ts:516` said the two git overrides grant a
  permission "the way [they] do", present tense, for a policy deleted on 260809.

## Bookkeeping

Four `Resolved:` notes appended, four `_o_` → `_c_` renames in place (two in `shared/issues/`,
two inside the closed Circle `260801-1244-guard-rules-write`, left where the Origin Rule puts
them), four ticks in `fusion-workbench/tasklist.md`. Task 18's note states plainly that the
record's coordinates were stale and where the defect actually lived; task 21's states that the
acceptance clause is met in part only.
