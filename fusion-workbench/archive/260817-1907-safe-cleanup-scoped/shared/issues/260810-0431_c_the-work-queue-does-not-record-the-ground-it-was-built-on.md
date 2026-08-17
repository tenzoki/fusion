# The work queue does not record the ground it was built on

**Filed:** 260810-0431
**Severity:** Medium
**Domain:** code
**Filed by:** coder, while implementing T7 (`260807-1515_*_die-warteschlange-veraltet-wieder-weil-nur-die-neuerzeugung-gebaut-wurde-nicht-die-vorbeugung.md`)
**Scope:** `agents/taskplanner.md` Step 4 (the tasklist header format)
**Cross-references:**
`shared/issues/260807-1515_*_die-warteschlange-veraltet-wieder-weil-nur-die-neuerzeugung-gebaut-wurde-nicht-die-vorbeugung.md` (the parent finding — this is the half of it that lives in the producer and could not be built from T7's file list),
`agents/orchestrator.md` `### The queue's ground` (the consumer-side half that landed, and which names this gap in its own closing paragraph)

---

## The state

`agents/taskplanner.md` Step 4 mandates the tasklist header, and it is four lines:

```
**Generated:** YYYY-MM-DD HH:MM
**Domain:** code | data | strategic | knowledge
**Open tasks:** <count>
**Blocked:** <count>
```

None of them says which Circle the queue was built for. A taskplanner run that follows the
specification to the letter produces a queue that cannot afterwards be told apart from one
built under different ground.

Two real queues, measured:

| Queue | Header carries `**Active Circle:**` |
|---|---|
| `ac1399e:fusion-workbench/tasklist.md` (260807-0002, 44 tasks) | yes — `` `circles/260804-1205-shell-reachability-model` (`_t_`) `` |
| `8960e1a:fusion-workbench/tasklist.md` (260810-0249, 34 tasks) | no |

Both runs were correct against the prompt. The first added the line on its own initiative,
the second did not, and nothing in Step 4 makes either of them wrong.

## Why this is a defect and not a nicety

The parent finding, `260807-1515`, is about a queue outliving the Circle it was built for.
Its consumer-side half is now in `agents/orchestrator.md` `### The queue's ground`: two
skills read the queue's standing before it is consumed, and the closure boundary retires a
queue whose head names the closing Circle.

That retirement fires only for a queue that names its Circle. For a queue that does not,
the verdict falls back to comparing the file's modification time against
`.active-circle`'s, which a checkout or a copy resets — it fails quiet rather than loud. So
the exact half of the fix covers the queue format one run happened to produce, and the
weak half covers the format the specification actually mandates. That is backwards.

**The question is undecidable without the stamp.** Which Circle a queue was *built for*
cannot be recovered from its text. The task `**Source:**` paths do not answer it: the
260807 queue drew from five different Circles' issue stores while being built for one of
them, because unaffiliated backlog issues live wherever they were filed
(`rules/critical-stance.md` §4 — no re-cutting of the question helps; what changes is the
mechanism, and here the mechanism is one line the producer writes).

## What would resolve it

Make the ground a mandated header field in `agents/taskplanner.md` Step 4, written on
every run, including the run where there is no Circle:

```
**Active Circle:** `circles/<dirname>`   — or, with no Circle active —
**Active Circle:** none
```

An explicit `none` is what makes the absence of a Circle a recorded fact rather than an
omission, and it is what lets the consumer distinguish "this queue is unaffiliated" from
"this queue predates the field". With that line present on every queue, rows 3 and 4 of the
verdict table in `agents/orchestrator.md` `### The queue's ground` collapse into rows 1 and
2, the modification-time comparison is no longer needed, and the retirement at closure
covers every queue rather than the ones that opted in.

Not filed against the orchestrator or the two skills: they already do everything they can
with what the file carries. This is one line in one producer.

## Why in the shared store

No Circle was active when it was found. It was found while implementing T7, whose own
record is in `shared/`, and it is a property of the queue format rather than of that task's
work — Origin Rule.

---
Resolved: `agents/taskplanner.md` Step 4 now mandates the `**Active Circle:**` line on every run —
the field is in the header template, both spellings are shown (backticked `circles/<dirname>`, bare
`none`), the value is named as the `CIRCLE` key `fusion-paths` emits at Setup step 2, and a rebuild
must restamp its own ground rather than carry the previous run's forward. With the ground recorded
on every queue, rows 3 and 4 of the verdict table in `agents/orchestrator.md` `### The queue's
ground` collapsed into rows 1 and 2 and the `find -newer` ordering test is gone: both inputs are now
recorded strings and the table is one equality settled either way, with `none` a recorded ground
like any other. A queue carrying no such line is no longer a row — it is a file written before the
mandate, and the check reports it as `NO GROUND RECORDED` rather than guessing from a modification
time. `/fusion:setup` and `/fusion:next` were updated to name the verdicts that now exist.

The mandate is gated by `hooks/lib/__tests__/queue-ground-producer.test.ts` (12 tests): it fails if
Step 4 drops the field, the `none` spelling, or the obligation wording, and it RUNS the consumer's
extracted bash block against head lines taken out of the producer's own prompt, so a spelling the
producer mandates that the consumer cannot read fails at `npm test`. Its negative controls call the
same helpers with a fixture, and the pre-mandate producer is read out of git at `365b286` rather
than transcribed. `queue-ground-lint.test.ts` was updated to the two-row table and the new verdict
set. Suite green: `cd hooks && npm test` → exit 0, 1178 tests.

What this does not do, stated because the section it edits is about exactly this: nothing here
executes at session time, so the gate proves the specification carries the line and that the two
sides agree on its format — not that a given taskplanner run wrote it. A run that skips it produces
a queue reported as `NO GROUND RECORDED`, which is loud instead of quiet. Queues written before the
mandate keep no ground and cannot have it recovered.
