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
