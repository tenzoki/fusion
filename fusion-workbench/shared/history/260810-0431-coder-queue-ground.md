# Coder session — the work queue's ground

**Started:** 260810-0431
**Agent:** coder
**Task:** T7 — Stop the work queue outliving the Circle it was built for
**Source:** `260807-1515_*_die-warteschlange-veraltet-wieder-weil-nur-die-neuerzeugung-gebaut-wurde-nicht-die-vorbeugung.md` in `$SCAN_ISSUES`
**Origin:** no Circle active; shared store
**Status:** Complete

---

## What the record asked for

Prevention, not a third regeneration. Its predecessor was closed by rebuilding
`tasklist.md`, and the file was stale again seven hours later — this time because the active
Circle was **superseded** mid-session rather than closed, which a rule keyed to the closure
markers has no event for. The record's own recommendation is its option 2 in the
`.active-circle` form, "because it hangs on a condition rather than on an event list".

## What landed

One definition, `agents/orchestrator.md` `### The queue's ground` (Phase 4). Both consumer
surfaces cite it rather than restating the branches.

**The retirement (option 2, modified).** It rides `rm -f fusion-workbench/.active-circle` at
Phase 4 step 4 — the one act in that step that cannot be skipped and still leave a closed
Circle. Two deliberate departures from the recommendation, both measured:

- **`mv`, never `rm`.** Since `65f7c3b` a tracked workbench tracks `tasklist.md`, on the
  ground that it is authored text with reasoning and acceptance wording. The entries are
  re-derivable from the records; the prose is not. It moves into the closing Circle's plan
  store, resolved through `$OUT_PLAN`, re-resolved at that point for the same reason step 1
  gives about the pointer.
- **Only when the queue's own head names the closing Circle.** A blanket deletion at the
  Circle boundary would have destroyed the 260810 queue: 34 entries, every source under
  `shared/`, no Circle affiliation, entirely valid. Option 2 applied literally is a data loss
  at exactly that file.

**The read-time verdict (option 3, complete).** A four-row table, one row per combination of
"does the head name a Circle" and "does the pointer hold one", run by `/fusion:setup` Step 3
and `/fusion:next` Step 5 and reported in Setup's completion summary.

**Option 1 not built,** deliberately: binding regeneration is the answer this record
describes as already tried twice.

**`/fusion:next` step 6.3** says the ground moved in the same command as the pointer write,
and explicitly does not retire: the activation gate guarantees no Circle was active a moment
earlier, so any queue present is a shared backlog.

## Verification

Measured, not reasoned about. The check was run against both real queues — the historically
stale one (`ac1399e:fusion-workbench/tasklist.md`, 44 tasks, 260807-0002-conceptrev-plan-shell-reachability-model.md) and the live one
(34 tasks, 260810-0249-tasklist-update.md) — across four pointer states:

| Queue | Pointer | Verdict |
|---|---|---|
| 260807 (head names `260804-1205-shell-reachability-model`) | absent | stale |
| 260807 | that same Circle | current |
| 260807 | the superseding Circle — **the measured defect** | stale |
| 260810 (no head) | absent | unaffiliated backlog |
| 260810 (no head) | a Circle, pointer newer than the file | not scoped |
| 260810 (no head) | a Circle, pointer older than the file | current |

An earlier candidate predicate was discarded on evidence: deriving the ground from the tasks'
`**Source:**` paths. The 260810 queue cites two Circle directories in task detail text while
being built for none, and the 260807 queue drew from five Circles' issue stores while being
built for one. The predicate measures where records live, not what a queue was built for.

`cd hooks && npm test` — 961 of 962 passing. The single failure is `rules-emission-golden`,
whose `fusion-workbench-conventions.md` byte count moved by 2151 in `65f7c3b` and whose
fixture is regenerated deliberately at the end of this session. No rule file was touched
here. `path-literal-lint` failed on the first run against three literals this change
introduced and passes now; all other tests were green before and after.

## Files changed

- `agents/orchestrator.md` — Phase 4 step 4 (retirement rides the pointer clear) and a new
  `### The queue's ground` section between step 7 and `### Cleanup`. Nothing in `### Cleanup`
  or in the Drift check from `9bad4d6` was touched.
- `skills/setup/SKILL.md` — Step 3 runs the check; the Done report carries its verdict.
- `skills/next/SKILL.md` — Step 5 renders the verdict; step 6.3 states the ground change.
- `hooks/lib/__tests__/queue-ground-lint.test.ts` — new, 9 tests including three
  counter-fixtures built from the pre-change text.
- `260810-0431_*_the-work-queue-does-not-record-the-ground-it-was-built-on.md` in
  `$OUT_ISSUE` — the producer-side residual.
- The source record closed `_o_`→`_c_` with a closure note; T7 marked done in `$TASKLIST`.

## Honest label

Convention, not enforcement. Nothing executes the two tables; they are prompt text, and
prompt text loses to task pressure. What is enforced is that the text stays present and
stays attached to the acts that carry it — the lint test does that, and it enforces nothing
about a session. The retirement is prevention in effect, conditional on the step running.

The prevention half is incomplete in the producer, and the section says so in its own body:
`agents/taskplanner.md` mandates no ground field, so the exact rows only reach a queue that
recorded its ground by choice. That is one line in one file outside this task's file list,
filed separately.
