# Step 5 — the monitor renders advisories

**Status:** Complete
**Agent:** coder
**Circle:** `260801-1244-guard-rules-write`
**Plan:** `260802-1856_*_plan-guard-rules-write.md` §Step 5
**Files changed:** `bin/monitor` (one file, as scoped)

## What changed

Two edits to `bin/monitor`, in the server half and the client half.

**Server (`WARNING_EVENT_TYPES`, around line 80).** `guard_advisory` joins the set, so
`_read_warnings()` no longer drops it. The comment above the set was rewritten to carry
the distinction the plan asked for: warnings and blocks report something the user did not
ask for, an advisory reports something the user did ask for (a write let through because
an override flag was set), and `guard_allow` / `tracker_record` / clears are bookkeeping
nobody asked to be told about.

**Client (level mapping in `renderWarnings()`).** The mapping handled `guard_block` and
`guard_halt` explicitly and let everything else fall through to `levelClass = 'warning'`,
`levelLabel = 'Warning'` — an amber row labelled "Warning". Read against an advisory that
is wrong twice over: the label asserts something went wrong when nothing did, and the
amber sits in the same visual band as churn and cross-file warnings, which are the rows
that mean "look at this, you did not ask for it". So the advisory got its own level:
`levelClass = 'advisory'`, `levelLabel = 'Advisory'`, with two CSS lines giving it the cyan
left border and level colour. Cyan is already the palette's informational tone and is used
nowhere else in the warnings panel, so the row is distinguishable from yellow (warning),
orange (blocked) and red (critical/halt) at a glance.

## The side effect, which is the point rather than a risk

The branch-switch override (`FUSION_ALLOW_BRANCH_SWITCH` / `FUSION_ALLOW_WORKTREE`) has
emitted `guard_advisory` since it shipped, and has therefore been invisible on the
dashboard that whole time. This change surfaces those too. It is a behaviour change
slightly wider than this Circle's own flag and belongs in the commit message.

## Verification

Ran headlessly against a throwaway workbench, never against this project's live
`.guard-state/events.jsonl`.

1. Built `$SCRATCH/wb-step5/fusion-workbench/` with a hand-written three-line
   `.guard-state/events.jsonl`: one `guard_block`, one `guard_allow` (the negative
   control), one `guard_advisory` carrying the real `rulesWriteDetail()` string.
2. `./bin/monitor step5-check 8791 -d <that workbench>`; `/api/dashboard` returned the
   block and the advisory, and dropped the `guard_allow`.
3. Rendered the client half for real rather than reading it: fetched the served page,
   ran its script in a Node `vm` context against a DOM stub, and called `renderWarnings()`
   with the warnings the live API had just returned. Only injection into the page source
   was one line exporting `renderWarnings` out of the IIFE; the render logic ran unmodified.
   Output:

   ```
   <div class="warning-row advisory"><span class="warning-level">Advisory</span>
   <span class="warning-detail">Override FUSION_ALLOW_RULES_WRITE allowed a normally-denied
   write to a protected rule path: rules/x.md</span><span class="warning-ts">2026-08-02 20:02</span>
   <button class="warning-dismiss" …>dismiss</button></div>
   <div class="warning-row block"><span class="warning-level">Blocked</span>…
   ```

4. Removed the advisory line from the events file and re-rendered: only the `Blocked` row
   remained, so the row is driven by the file rather than by anything cached.
5. `cd hooks && npm test` → 871 passed, 19 files. Baseline held.

## One finding for the orchestrator

`npm test` builds before it tests, and the rebuild left `hooks/dist/` dirty:
`guard.js`, `guard.d.ts`, `lib/bash-mutation-guard.{js,d.ts}` modified and
`lib/rules-write-exemption.{js,d.ts}` untracked. That is the compiled output of Steps 1–4,
not of this step — the rebuilt files carry `FUSION_ALLOW_RULES_WRITE` and HEAD's committed
`dist/` does not. Steps 1–4 committed TypeScript source without staging `dist/`
(`git log --name-only 768242c~1..HEAD` matches nothing under `hooks/dist`). Since the
plugin ships from committed `dist/` (CLAUDE.md: "compiled hooks must be committed"), the
checked-in build is currently stale against source. Left in place rather than reverted —
the artifacts are correct output — and flagged for whoever commits.
