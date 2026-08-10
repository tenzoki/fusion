# coder — the Phase 4 queue retirement stops writing through unchecked resolver values

**Status:** Complete
**Agent:** coder
**Task:** Turn 2, R3
**Source:** `fusion-workbench/shared/issues/260810-0500_o_the-queue-retirement-writes-through-unchecked-resolver-values-and-can-move-the-queue-to-the-workbench-root.md` (review `260810-0512-coderev-turn-1-range-8960e1a-to-head.md`, Theme C, F6)
**Origin:** shared — no Circle active

---

## What was wrong

`agents/orchestrator.md` Phase 4 step 4 resolved `OUT_PLAN` and wrote through it unchecked:

```bash
P=$("$FUSION_PLUGIN_ROOT/bin/fusion-paths" orchestrator | sed -n 's/^OUT_PLAN=//p')
mkdir -p "$WORKBENCH/$P"
mv "$Q" "$WORKBENCH/$P/$(date +%y%m%d-%H%M)_c_retired-tasklist.md"
```

`fusion-paths` exiting 3 or 4 prints nothing, so `$P` is empty, `mkdir -p "$WORKBENCH/"` succeeds,
and the `mv` lands `tasklist.md` at the **workbench root**. An unsubstituted `$WORKBENCH` beside it
aims the same `mv` at `/`. What moves is the one artifact the same section argues is not
re-derivable from the records.

The rule this broke (`rules/fusion-workbench-conventions.md` `## Path Resolution`, added by
`e99f0ef`) was three commits older than the snippet (`ff70d3a`) and is in the file every agent loads
on every dispatch.

## What changed

**1. Phase 4 step 4 — the write site.** The `mkdir`/`mv` pair moved inside
`if [ -n "$WORKBENCH" ] && [ -n "$P" ]`, with an `else` that names both keys on stderr. Same
predicate and same message stem as `skills/cadence/SKILL.md` step 8, so there is one spelling of this
check in the tree.

The assertion sits **inside** the `if`, not in front of the whole command: exiting before
`rm -f fusion-workbench/.active-circle` would leave a renamed `_c_` record beside a live pointer,
which is a closure that did not close. Retiring nothing is the safe outcome — the queue stays at the
root and the next read reports it stale under row 2 of the verdict table. Two paragraphs of prose
record both halves of that reasoning.

**2. Setup Step 5 — the Circle count.** `find "$WORKBENCH/$SCAN_CIRCLES" -mindepth 2 -maxdepth 2`
with an unsubstituted pair reads `find "/"`, returns nothing, and *nothing* is indistinguishable from
a workbench with no Circles — so the portfolio hint is silently withheld from a user who has one. A
one-line assertion in front, in the cadence spelling, reports it as a fusion bug instead of a zero.

**3. Drift check — the Circle Turn log row.** `[ -n "$CIRC" ] && REC=$(find "$WORKBENCH/$SCAN_CIRCLES/$CIRC" …)`
dropped the row silently when either key was empty. It now names the row as unchecked. A drift check
that exists to catch a silent skip must not perform one.

**4. Two prose sites that would otherwise over-promise.** The `#### Where the ground moves` table row
for Phase 4 and the `#### What this is, honestly` sentence about conditional prevention both now say
the retirement is also conditional on the keys resolving.

## The test

`hooks/lib/__tests__/queue-retirement-empty-key.test.ts` — 9 tests. It **extracts** the bash block
from Phase 4 step 4 and **runs** it against throwaway workbenches, with a stub
`$FUSION_PLUGIN_ROOT/bin/fusion-paths` driving the resolver outcome (`healthy` vs. silent exit 3).

- resolver healthy → queue lands in the closing Circle's plan store, pointer cleared
- queue naming another Circle → untouched, pointer still cleared
- resolver silent → nothing written anywhere under the workbench, queue intact, stderr names both
  keys, **pointer still cleared**
- `WORKBENCH` unsubstituted → no `mkdir` and no `mv` attempted at all

The negative control is not a hand-written fixture. It is `git show ff70d3a:agents/orchestrator.md`,
run through the same extractor and the same helpers, and it reproduces the defect: the queue lands at
the workbench root, and with an empty `WORKBENCH` the `mv` is aimed at `/circles/…`. If that commit is
not reachable (installed copy, shallow clone) those three tests skip rather than assert against
invented history.

The two runs that would aim at `/` if the guard regressed execute under `mkdir`/`mv` stand-ins on
PATH that log their arguments and touch nothing. The stand-ins replace the filesystem, never the
logic under test — the block itself is always the real extracted text.

## Verification

`cd hooks && npm test` — exit 1. 977 tests, 975 passed, 2 failed, both in
`lib/__tests__/fusion-plane.test.ts`.

Neither failure is from this change. `bin/fusion-plane` is modified in the shared working tree by a
concurrent task (232 changed lines; its mtime advanced between three of my runs, and the failure count
fell from 48 to 2 as that agent worked). Proof: `git archive HEAD` into a temp directory, with
`hooks/node_modules` symlinked, runs `fusion-plane.test.ts` **69/69 green**.

`rules-emission-golden` failed on my first run (`fusion-workbench-conventions.md` 39529 → 41680) and
passed on the last — the orchestrator regenerated it mid-Turn, as announced. I did not edit any file
under `rules/`.

## Not fixed, reported instead

- `skills/next/SKILL.md` step 6.3 (`260810-0506`) — a skill body, owned by another queued task.
  Recommend keeping it separate: it is a different defect class (`&&` short-circuit exit status plus a
  bypassed `$TASKLIST` key), not an unchecked expansion.
- `agents/orchestrator.md` drift check, last line
  `[ -n "$REC" ] && row "Circle Turn log" …` — when no Circle is active this is the block's last
  command and the whole drift check exits 1. That is the `260810-0506` shape, inside the orchestrator,
  unreported. Not touched: different class, and the drift check landed in `9bad4d6` this Turn.
- Phase 4 step 4 and `#### Reading a queue` both spell `Q=fusion-workbench/tasklist.md` rather than
  `"$WORKBENCH/$TASKLIST"`, which the orchestrator does receive. That is `260810-0511`'s duplication
  finding plus `260810-0506`'s bypassed-key finding meeting in one line; changing it edits the
  canonical section two skills cite, so it belongs to whoever takes those two records.

## On why the rule did not reach the author

Honestly: prompt text does not reach an author who did not re-read the file. `e99f0ef` put the
empty-key rule in a file every agent loads at Setup, and `ff70d3a` was written by an agent that had
loaded it. Loading is not reading, and reading at Setup is not recall at the moment a `mkdir` is being
typed forty minutes later.

The reviewer's own cross-cutting observation is the actionable half, and I agree with it: the rule each
commit wrote should have arrived with the check that enforces it, in the same commit. `6a69717` added
the assertion to `/fusion:cadence` and `e99f0ef` wrote the rule — neither added a gate over the shape.
A lint that finds `mkdir -p "$WORKBENCH/$…"` or `mv … "$WORKBENCH/$…"` in any `agents/*.md` or
`skills/*/SKILL.md` not preceded by a `[ -n "$…" ]` on both names would have caught `ff70d3a` at
`npm test`, four commits before a reviewer had to. That is a small, executable gate over a shape that
is already spelled the same way in two places. I did not build it — it is outside the files this task
opened — but it is the fix for the pattern, and this fix is only the fix for one site.

---

**Files changed**

- `/Users/k1/Projects/productive/fusion/agents/orchestrator.md`
- `/Users/k1/Projects/productive/fusion/hooks/lib/__tests__/queue-retirement-empty-key.test.ts` (new)
