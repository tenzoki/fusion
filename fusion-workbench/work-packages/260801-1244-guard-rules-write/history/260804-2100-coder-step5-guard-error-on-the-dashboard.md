# Session: Step 5 — `guard_error` reaches the dashboard

**Date:** 2026-08-04
**Agent:** coder
**Status:** Complete
**Circle:** `260801-1244-guard-rules-write`
**Plan:** `260804-1633_*_plan-c5b-remediation-and-ship.md`, Step 5
**Closes:** `260804-1607_*_guard-error-is-not-rendered-by-the-monitor-so-a-fail-open-guard-is-invisible.md`
**Baseline:** `c9bf59e` plus the uncommitted work of Steps 1 to 4. Not committed — the orchestrator commits after validation.

**Voice profiles:** `bin/fusion-rules coder` emitted no `stilwerk/` path in this run, although
`fusion-workbench/stilwerk/` holds all four files and `user-facing-output.md` says the chat
profile is emitted for every agent. Absence noted per `rules/agent-setup.md`; I read
`chat-voice-en.yaml` directly (no `**Language:**` line in `CLAUDE.md`, so `en` by the documented
default) and applied it to the chat report.

---

## The three sentences

A `guard_error` now reaches the dashboard: it is rendered in the warnings panel at the halt
level, labelled "Fail-open", with a red border, a red badge and the red background tint, which
is the loudest treatment the panel has and strictly above the orange of a block. It carries its
own budget rather than the warning budget, because the plan's reason for the warning budget is
true of the fault and false of the event, and charging it to the warning class was measured to
evict every block, halt and critical from the panel. Behaviour with no `guard_error` present is
unchanged, asserted as a whole 38-row sequence for a mixed warning-plus-advisory workload rather
than as counts.

---

## What was changed

`bin/monitor`, four places, and one test file.

**1. `WARNING_EVENT_TYPES` gains `guard_error`,** which is what makes the event reach the panel
at all. The header comment above the set went from describing two kinds of qualifying event to
three, and the third names both emitters (`hooks/guard.ts` and `hooks/tracker.ts`, in their
`main().catch` handlers) and what the row means: the check did not run and the call was allowed
anyway.

**2. A second carve-out, `ERROR_EVENT_TYPES`, with its own cap `MAX_ERRORS_RETURNED = 8`.**
The two carve-outs are now one `SUBSET_BUDGETS` table, so `_read_warnings()` charges a row by
walking the table rather than by an `if` per class, and a fourth class is a table row plus a
constant rather than a fourth branch. `MAX_WARNINGS_RETURNED = 30` and
`MAX_ADVISORIES_RETURNED = 8` are untouched.

**3. `_read_warnings()` generalised over the table.** The structure is the one the advisory
split established and is unchanged in shape: bucket, cap each class independently, merge, sort
on the raw ISO timestamp string. The early return that preserved the pre-split slice exactly
now reads "nothing carved out" rather than "no advisories", so it still fires for the workbench
of a project that has never used an override and has never had a hook throw.

**4. The level mapping and one CSS rule.** `renderWarnings()` gains
`else if (w.event === 'guard_error') { levelClass = 'failopen'; levelLabel = 'Fail-open'; }`,
and `.warning-row.failopen` takes the halt declarations verbatim (red border, red level badge,
`rgba(239,68,68,0.08)` tint).

**Why the label is "Fail-open" and not "Guard error".** The event is emitted by both hooks, and
`hooks/tracker.ts` words its detail "Tracker error (fail-open): …" while `hooks/guard.ts` words
its own "Guard error (fail-open): …". A badge reading "Guard error" would be wrong for half the
rows. "Fail-open" is the half they share, it is the fact that matters (the call was allowed
without being checked), and the detail string sitting beside it in the same row says which hook
and glosses the term in passing.

**Why the halt treatment rather than a colour of its own.** A block is a guard that worked; a
fail-open is a guard that did not run. Below a block is wrong, and a new colour would have to
earn a position in a palette whose existing rungs (amber default, orange block, red critical and
halt, cyan advisory) already say everything the panel needs. Sharing the halt rung and differing
by label keeps the loudness ordering readable without inventing a rung. `260803-1352` — two
advisory details skipping the 200-character clamp — is not made worse by any of this: the
detail cell is `flex: 1; word-break: break-word`, so a long fail-open detail wraps rather than
clipping, and the level badge's `min-width: 70px` is a floor, so the 11-character "FAIL-OPEN"
widens the badge to about the width "Cross-file" already needs.

---

## What turned out wrong in the plan's Step 5, discovered by building it

Two things, and the first is the substantive one.

### 1. The prescribed change is necessary and not sufficient, and its stated reason does not hold

Step 5 says: *"`guard_error` joins `WARNING_EVENT_TYPES` at `bin/monitor:91-102`, not
`ADVISORY_EVENT_TYPES`. Advisories share a small separate budget because they arrive in bursts
during a curation session; an error is rare and each one is individually worth reading, which is
what the warning budget is for."* The issue record argues it the same way, and the dispatch brief
repeats it: *"a fail-open is rarer than an advisory."*

The **condition** is rare. The **event** is not. Both hooks fail open per invocation, so a fault
that sits on disk — an unparseable configuration, a corrupted escalation counter, a bug — emits
one row per guarded tool call for as long as it sits there. The issue's own Measured section
shows the shape without drawing the conclusion: three guarded calls produced three `guard_error`
lines.

Charged to the warning class, that behaves exactly like the advisory burst the panel's other
carve-out exists to prevent, and it does so in both directions. Measured, by applying the
plan-as-written as a mutation and running the new cases against it:

| Seeded | Charged to the warning class | With its own budget |
|---|---|---|
| 4 rescued events (churn critical, cross-file critical, block, halt), then 40 fail-opens | all four gone: `expected [] to deeply equal [ 'churn_critical', …(3) ]` | all four present, plus 8 fail-opens |
| 1 fail-open, then 50 churn warnings | the fail-open gone | the fail-open present, and the warning class still gets its full 30 |

The second row is the one that decides it. A fail-open evicted by ordinary warnings is the
defect this step exists to close, arriving one layer down: the event reaches the panel and the
panel then drops it. The first row's combination is live rather than hypothetical, because a
`hooks/tracker.ts` exception does not stop `hooks/guard.ts` from blocking — a broken tracker
emits one fail-open per completed tool call while genuine blocks are still being recorded, and
thirty ordinary writes is an unremarkable session.

The fix is the carve-out the panel already uses, not a new mechanism, which is why the two
carve-outs collapsed into one table in the same edit. 8 rather than 1: a repeating fault repeats
one detail string, and `renderWarnings()` collapses rows sharing `(event, file, detail)` to the
most recent one, so what the budget buys is the variety of errors rather than their count. Two
emitters, with room for their exception texts to differ.

### 2. The `Files` line is short by one

Step 5 names `bin/monitor` alone, while its own verification block requires a demonstration
against the real binary with a seeded events file. That demonstration lives in
`hooks/lib/__tests__/monitor-warnings-panel.test.ts`, which the step never names.

### What the step got right

The instruction *"Reading the set membership is not the check"* is the reason the third mutation
below was worth applying, and it caught a real omission: adding the event to the set and stopping
there renders the row at the amber default, labelled "Warning", which is below a block. The step
asked for the level mapping to be confirmed, and the confirmation was not a formality.

---

## Verification

`npx vitest run` (not `npm test` — Step 8 owns the `hooks/dist/` rebuild): **1537 passed, 26
files**, up from 1532 across the same 26 files. Five cases added, all in
`hooks/lib/__tests__/monitor-warnings-panel.test.ts`, extending the harness the advisory-budget
change established rather than replacing it.

Every one of the five drives the real `bin/monitor` binary as a subprocess, seeded with a
throwaway workbench whose `.guard-state/events.jsonl` holds hand-written events, and reads the
answer over HTTP.

| Case | What it asserts |
|---|---|
| a `guard_error` reaches the panel | one fail-open among `guard_allow` and `tracker_record` comes back alone. Before the change this returned `[]` and the panel stayed hidden |
| a fail-open burst cannot evict a block, halt or critical | 4 rescued events survive 40 fail-opens, the fail-opens are capped rather than dropped, and the merged array is chronological |
| a full warning load cannot evict the fail-open row | the oldest event, a lone fail-open, survives 50 churn warnings, and the warning class still returns its full unshared 30 |
| with no `guard_error` the panel is unchanged | a 40-warning plus 12-advisory workload returns the exact 38-row sequence the two-budget scheme returned, asserted as the whole sequence of details rather than as counts |
| the served page renders a fail-open at no less than a block's weight | the level chain and the stylesheet, below |

The last case needed a decision. `GET /api/dashboard` cannot answer "what weight does it render
at", and the project has no DOM in its devDependencies — adding one to read a five-line `if`
chain is out of proportion, and `hooks/package.json` is not this step's file. A substring search
for the new branch would pass on a branch that is present and unreachable. So the case fetches
`/` from the running binary, extracts the level-mapping chain from the page the binary actually
serves, and **executes** it: the chain reads `w` and nothing else and assigns two locals, so it
runs standalone. The whole chain is pinned, not just the new arm, so a reordering that swallows
one event into another's arm fails here too. The weights are then read off the served
stylesheet: the fail-open rule is asserted byte-equal to the halt rule after whitespace
collapse, the default is `var(--yellow)`, a block is `var(--orange)`, an advisory is
`var(--cyan)`. If `renderWarnings()` is ever restructured past recognition the extraction throws
rather than silently asserting nothing.

**Anti-vacuity.** Three mutations, each applied to `bin/monitor` and reverted, with the file
checksummed before (`f5f2621…`) and `diff`ed against a copy afterwards to prove the revert was
exact:

| Mutation | Broke | Verdict |
|---|---|---|
| `ERROR_EVENT_TYPES` dropped from `SUBSET_BUDGETS` — the plan as written, `guard_error` charged to the warning class | 2, exactly the two eviction cases, nothing else | the plan's prescription is measurably insufficient, and the two new eviction cases are what measures it |
| `guard_error` removed from `WARNING_EVENT_TYPES` | 3 | set membership is load-bearing and the cases reach it |
| the `renderWarnings()` arm deleted | 1, with `expected 'Warning' to be 'Fail-open'` | the weight assertion executes the shipped chain rather than describing it |

The nine cases in the file all pass together, so the four pre-existing advisory-budget cases are
a standing assertion that the carve-out generalisation did not disturb the advisory half.

**What was not verified.** No browser rendered the panel. The level class, the label and the
stylesheet declarations are asserted from the page the binary serves; that the browser paints
`rgba(239,68,68,0.08)` as a red tint is CSS, not this suite's business. I also did not exercise
a real hook throwing a real exception into a real dashboard end to end; the events are
hand-written in the shape both emitters produce, which is what the step's verification block
asks for.

---

## One finding, filed rather than fixed

`260804-2100_*_from-a-subdirectory-cwd-the-protected-list-matches-nothing-while-fail-closed-still-denies.md`.

While backing up `bin/monitor` before the mutation runs, a `cp` into the scratch directory was
denied fail-closed for an unresolvable `$SP` operand. Three follow-up probes, all through the
real hook, showed that from this session's working directory (`<project>/fusion-workbench`, one
level below the project root) a literal `mv` naming the project's real `rules/` is **allowed**,
in both directions, and so is an `Edit` of `bin/monitor`, which is on the protected list
literally. The protected patterns are matched by `projectRelative(filePath, cwd)` against the
session's working directory, so from a subdirectory they name a different directory and match
nothing, while fail-closed still fires because it keys on the shape of an operand rather than on
where it points.

Two reasons this is filed and not fixed here. It is outside this step's scope, which is
`bin/monitor` and its tests. And its first half is already argued and accepted in
`260804-1604_*_the-self-protection-floor-is-matched-cwd-relative-while-the-file-is-read-root-relative.md`, which says in as many words that `rules/**` degrades the same way from a
subdirectory and that this is arguably correct. What that record does not cover is the
asymmetry, and it labels its own reachability *"inference, not measured against a real Claude
Code session"* — this session is that measurement, which is the part worth recording.

---

## Files changed

| File | Change |
|---|---|
| `bin/monitor` | `guard_error` added to `WARNING_EVENT_TYPES`; `ERROR_EVENT_TYPES` and `MAX_ERRORS_RETURNED` added; the carve-outs collapsed into a `SUBSET_BUDGETS` table and `_read_warnings()` generalised over it; `.warning-row.failopen` CSS; the `renderWarnings()` level arm |
| `hooks/lib/__tests__/monitor-warnings-panel.test.ts` | 5 cases in a new `describe`, plus `startMonitor`/`indexPage` split out of `dashboard` so the served page can be fetched from the same running binary |
| `260804-1633_*_plan-c5b-remediation-and-ship.md` | Step 5 marked `[DONE]` with its completion block |
| `260804-1607_*_→_c_…` | `Resolved:` note appended, marker closed |
| `260804-2100_*_…` | new, the finding above |
