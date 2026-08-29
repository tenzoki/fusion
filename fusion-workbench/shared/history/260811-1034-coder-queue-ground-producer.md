# Coder — the work queue records the ground it was built on

**Agent:** coder
**Started:** 260811-1034-coder-queue-ground-producer.md
**Task:** `I:260810-0431-queue-ground` (task 3 of `fusion-workbench/tasklist.md`)
**Source record:** `260810-0431_*_the-work-queue-does-not-record-the-ground-it-was-built-on.md`
**Active Circle:** none — every store resolved into `shared/`
**Status:** Complete

---

## What was wrong

`agents/taskplanner.md` Step 4 mandated a four-line queue header and none of its lines said which
Circle the queue was built for. Two real runs were both correct against that prompt and only one
wrote the stamp. The consumer half (`agents/orchestrator.md` `### The queue's ground`) settled a
queue exactly when the stamp was there, and settled the headerless case with `find -newer` — an
ordering test a checkout or a copy resets in the direction that reads as *current*. So the exact
half of the mechanism covered the format one run happened to produce, and the weak half covered the
format the specification mandated.

## What I changed

**`agents/taskplanner.md` — the producer.** `**Active Circle:**` is in the Step 4 header template
and mandated in prose: on every run, the run with no Circle included, in exactly two spellings
(backticked `` `circles/<dirname>` ``, bare `none`), first token after the field name, free
commentary allowed after it. The value is named as the `CIRCLE` key `fusion-paths` prints at Setup
step 2 — emitted when a Circle is active, omitted when none is, so its presence is the whole
decision — and Setup's value is specified rather than a fresh pointer read, because that is the
value that decided which stores Step 1 scanned. The update branch now requires the header to be
rewritten from this run's values, so a rebuild cannot inherit ground it was not built on.

**`agents/orchestrator.md` — the consumer.** The reading snippet takes the first token after the
field, strips backticks and the `circles/` prefix, and treats an absent pointer as `none`, so both
inputs are recorded strings and the settlement is one equality. Four rows collapsed to two;
`find -newer` is gone. Added prose: `stale` is a statement about ground and not a verdict on the
entries (a backlog that predates an activation lands in row 2 and is still not deleted, because the
retirement touches only a queue whose head names the closing Circle), and a queue with no field at
all is not a row — it is a pre-mandate file, reported `NO GROUND RECORDED`. The "What this is,
honestly" paragraph was rewritten: it had claimed the prevention half was incomplete in the
producer, which my change makes false, and it now says what the gate does and does not prove.
Phase 4 step 4's retirement block is untouched (its parser duplication is task 15's, filed).

**`skills/setup/SKILL.md`, `skills/next/SKILL.md`.** Both named the dropped `not scoped` verdict and
one claimed a four-row table. Updated to the verdicts that now exist. Neither restates the branches.

**`hooks/lib/__tests__/queue-ground-producer.test.ts` (new, 12 tests).** Asserts the mandate — field
in the template, both spellings, the obligation wording, the named source of the value, the rebuild
restamp — and then RUNS the consumer's extracted bash block against head lines taken out of the
producer's prompt: every mandated spelling must settle, the `circles/` one against a matching and a
mismatched pointer, the `none` one as an unaffiliated backlog and as stale once a Circle exists, and
a headerless queue as `NO GROUND RECORDED`. The ground is read back out of the consumer's own
message rather than re-derived, so the test states no second parser. Negative controls call the same
helpers with fixtures: the pre-mandate producer read out of git at `365b286` (skipped, not faked,
where the commit is unavailable), a mandate with the `none` spelling removed, and a prose spelling —
which fails the mandate assertion and, measured on the consumer, would read the ground as "the".

**`hooks/lib/__tests__/queue-ground-lint.test.ts`.** Updated to the two-row table, the new verdict
set, and the section's new honesty sentence. Its negative control still re-implements the table
split inline — that is task 14's to fix, and I did not widen this task into it.

**`hooks/lib/__tests__/helpers/prompt-blocks.ts` (new).** `extractBashBlock`, shared by the new gate
and `queue-retirement-empty-key.test.ts`, which had the only copy.

## Verification

`cd hooks && npm test` → **exit 0**, 43 files, 1178 tests (1166 at `8a49fd5` plus the 12 added).
Separately, the edited reading snippet run against this repo's real queue reports
`queue: current — unaffiliated backlog, no Circle active and none named`.

## What this is not

The gate reads the specification and binds the two sides' format to each other. Nothing in it runs
at session time, so it cannot make a taskplanner run write the line — a run that skips it produces a
queue the consumer calls `NO GROUND RECORDED`, loud rather than quiet. Queues written before the
mandate cannot have their ground recovered at all.
