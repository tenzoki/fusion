# Fusion — How the Working Model Operates

This is the *how it works in practice* guide. It walks through the shape of a fusion session — the unit of work, the flow from request to result, the gates where fusion stops and asks you, and the hook layer that traces every file write.

For *why* fusion is built this way, see [`docs/philosophy.md`](philosophy.md). For install and hands-on usage, see [`README.md`](../README.md). This doc sits between them: it explains the machinery you'll steer.

## 1. The work item — one unit of work

A **work item** is one bounded unit of work: something somebody is going to do, or has decided not to. It is defined by three things: a **Directive** (the outcome you're aiming for), its **Grounding** (what you know going in — the assumptions and facts the work builds on), and its **Artifact** (what the work produces). When those three hold together, the item is done.

**One directory per item, and no marker on either name.** An item lives at `fusion-workbench/circles/<stamp>-<slug>/`, and its record is the file of the directory's own name inside it, `circles/<stamp>-<slug>/<stamp>-<slug>.md`; everything the item produces lands in the same directory. One record per item rather than one list file, because two checkouts filing work at the same time then merge with no conflict. The item's state is a head field in that record:

```markdown
# split the manifest loader from the validator

---
**Domain:** code
**Status:** claimed
**Claim:** 3f9a1c07 — Ada Lovelace <ada@example.com>, 260910-1145
**Depends-on:** 260901-1030-extract-the-schema-reader.md
**Filed by:** user, Ada Lovelace <ada@example.com>
---

## Directive

…
```

`**Status:**` takes four values and there is no fifth:

- **open** — nobody is working on it.
- **claimed** — a checkout is working on it now, and `**Claim:**` names which.
- **done** — the work landed. The claim stays, naming who did it.
- **dropped** — no longer live; the body says why, citing the item that replaced it or the reason.

`done` and `dropped` are terminal. If work needs to continue, you file a new item that cites the old one.

**Two design choices are worth knowing, because everything else follows from them.** One file per item rather than one list file, so two checkouts adding work at the same time merge with no conflict. And the state in a field rather than in the filename, so a state change edits the file instead of renaming it and every citation of an item stays valid for the item's whole life.

**`claimed` names a checkout, and that is what stops two people doing one job.** The value compared is the eight hex characters `bin/fusion-identity` prints for this checkout, never the person beside them — two checkouts of one person carry one git identity, so the person alone cannot answer whose claim this is. A takeover overwrites the field; who held it before is in the commit that took it. The collision is detected and not prevented: two checkouts that both pull, both see no claim and both claim will conflict on that one line at the next merge, and whoever loses the race picks another item.

**`**Depends-on:**` carries edges you confirmed**, as a comma-separated list of item basenames. A helper may read the store and *report* an order over those edges; that report is a report, and you override it wherever you want to. No agent asserts a ranking.

### How an item comes into existence

**You file it, and no agent ever does.** `/fusion:memo idea: <one line>` writes the item — a title, one paragraph, `**Status:** open` — and a title plus one paragraph is the whole minimum ([`skills/memo/SKILL.md`](../skills/memo/SKILL.md)). The cheapness is the design: an item that costs more to write than a note is an item nobody writes. A defect an agent finds is still an issue, and a choice point is still a decision record; neither becomes a work item by being routed through here.

**What the orchestrator may do to the store, it does at your word.** Claiming, releasing, finishing, dropping, splitting one item into several and merging several into one are edits it performs once you have said so, one confirmation per operation on that item. None of them adds a job to the store, which is what keeps the no-agent-files bound intact across all of them.

**A request you hand the orchestrator needs no item at all.** Most sessions are one task told to the orchestrator directly; the backlog is what you reach for when you have several units of future work whose order is not obvious. Where a session *is* working a claimed item, its basename rides every dispatch, which is what lets the monitor say what this session is doing.

**What v11 removed here was the record, not the container.** Until then the unit in that directory was a *Circle*, carrying a six-marker record, ranked by a portfolio agent and activated through a per-checkout pointer file that never travelled between checkouts. The six markers, the ranking and the pointer are gone. The directory and its own copy of every store stand, and the record inside it is the work item's. `/fusion:migrate` converts a workbench that still holds a live Circle record: the record becomes the item record, in the container it already sits in.

**The idea-to-work path**, from filing to claiming:

```
/fusion:memo idea: …     you file the item, always at Status: open
       ↓
you read the store       and pick the item worth doing. Nothing ranks it: the
                         ranking agent and its command both went at v11
       ↓
the orchestrator claims  Status: open → claimed, Claim: <your checkout>,
                         on your word
       ↓
shaper / planner         the item's path is a valid request to the shaper,
                         which writes a spec from it and edits no byte of it
```

Section 5 walks that path step by step, beside a code session that never touches it.

## 2. Spec-driven flow

Fusion doesn't execute a vague request directly. It turns the request into a written contract first, then judges the work against that contract. The flow:

```
your request  →  shaper  →  SPEC GATE  →  planner  →  PLAN GATE  →  execute  →  report
                 (if the request needs sharpening)

a work item's path  →  shaper  →  the same flow, with the item as the request
                       (the item is read, never written)
```

- **shaper** takes an ambiguous or many-sided request and produces a **spec** — a precise statement of what will be built, with the hidden decisions surfaced. If your request is already clear and single-purpose, the shaper is skipped and fusion goes straight to planning.
- The **spec gate** is where you approve (or revise) what will be built, before any planning happens.
- **planner** turns the approved spec into a **plan** — ordered, dependency-aware steps, each routed to an executor (coder for code, ontocoder for data and ontology).
- The **plan gate** is where you approve *how* it will be built, before any code is written.
- **execute** runs the plan step by step.

**The shaper has two invocation modes and both end in a spec** ([`agents/shaper.md`](../agents/shaper.md) `## Two invocation modes`): your direct request, and a task clarification the orchestrator asks for before a vague task is planned. A **work item is a valid request** — hand the shaper the item's path and it reads the item's Directive as your words. It edits no byte of the item: its key set carries the read key and no write key, so a run that tried to file or claim one has no path to write to.

Two further modes stood here until v11 and went with the record they edited: one re-clarified a unit-of-work record's Directive in place, the other created such a record from a draft and was the whole of what the removed `/fusion:memo`-adjacent capture command dispatched. A re-shape is now an ordinary run producing an ordinary spec.

The spec and the plan are the contract. Every later check — "is this work still on track?" — is measured against them, not against a fresh reading of your original sentence.

## 3. The gates

Fusion is deliberately not autonomous. It stops and hands you the decision at defined points.

**Human gates — fusion stops and asks before:**

- reviewing a produced **spec** (approve what gets built),
- reviewing a produced **plan** (approve how it gets built),
- any **ontology or structured-data change** (every `ontocoder` task, and especially structural changes to entities, relations, or schemas),
- **destructive operations** — deleting files, removing features, dropping data,
- an **ambiguous task** where scope or acceptance criteria can't be pinned down.

At each gate you get plain choices: proceed, skip for later, defer, or modify the instruction.

**The Coherence check.** Work runs one task at a time; after each one the orchestrator reports and asks what is next. Nothing checks coherence on a schedule any more — the automatic per-batch check went on 2026-09-10 with the Turn loop it rode. What is left is a **reconciliation you ask for**, which reads three questions about what has landed:

1. **Grounding** — does the work still match the assumptions it was built on?
2. **Directive** — does it move toward the stated goal?
3. **Reachability** — is that goal still reachable, given what we've learned?

If all three hold, the work continues. If something is off, fusion opens the Rebalance gate rather than pushing ahead. That gate has this one trigger and no other: run no reconciliation and it never opens.

**The Rebalance gate.** When coherence breaks, you choose among four moves — in plain terms:

- **Revise the work** — the goal and assumptions are fine; the output isn't there yet. Run another execution pass.
- **Revise the goal** — the destination was wrong. Re-shape the Directive.
- **Revise the assumptions** — the basis was wrong. Record a new decision (the Grounding changes).
- **Accept a bounded stop** — the goal isn't reachable as stated; what was learned along the way is the result, and the session ends acknowledging that.

That last option is the point of the whole model: the goal can change mid-work when the world or the facts turn out different, instead of being a fixed target you push against until something breaks.

## 4. The hooks

While the gates govern *decisions*, a **hook layer** watches *file writes*. It runs on every edit an agent attempts, and it blocks none of them. Two things come out of it:

- **A write trace.** One row per Write, Edit, MultiEdit or NotebookEdit call, naming the tool and the file, appended to `fusion-workbench/.guard-state/events.jsonl`. That log is what the monitor's panel renders live, and it is the only record of what the write surface did.
- **A configuration diagnostic.** When the project's `fusion.json` cannot be read, or its root still carries a file or a key fusion has retired, you are told on every guarded tool call until it is fixed. The repetition is deliberate: a setting that is inert *and* silent leaves you believing it is in force.

**Shell commands are not read at all.** The guard does not try to work out from a command's text what it is about to do. That question is undecidable, and two policies that asked it — one predicting which files a command would write, one predicting whether it would move HEAD — were built and then deleted. `Bash` still reaches the hook, for the diagnostic alone, and an innocuous shell call in a correctly configured project writes no guard state whatsoever.

**Nothing blocks a write, and nothing can.** Four mechanisms once did or once warned, and all four are gone, each on its own measurement: a **protected path** list until 2026-08-12, whose files were put back if they changed by any route; **churn**, a per-file edit count that only ever warned, until 2026-08-15; and on 2026-08-16 the **decision-governed deny** at high sensitivity together with the **halt** it escalated to after three consecutive blocks. A halt flag left in an older project's state file is inert, and `/fusion:setup` offers to delete it. See [`README-hooks.md`](../README-hooks.md) for what each was and the figures that removed it.

The one thing left to configure is not the guard either: `citations.extraPaths`, in your project's `fusion.json`, which names the non-Markdown files fusion's citation helpers should read. See the README's [Configuration](../README.md#configuration).

## 5. Two worked walkthroughs

Two paths reach the same place and cross different machinery. The first is one code session from request to close, with each gate and hook marked. The second is the backlog path — an idea filed today, claimed weeks later — which passes through no gate and no guard at all, because it produces no code.

### 5a. One code session, from request to close

1. You say: *"Add rate-limiting to the API and cover it with tests."*
2. The **orchestrator** resolves the scope: this is code work, one clear outcome.
3. The request is specific enough, so the **shaper** is skipped. The **planner** produces a plan — a middleware step, a config step, a test step.
4. **PLAN GATE** — you review the three steps and approve.
5. **The first task is dispatched.** The **coder** edits the middleware. Each write passes through the **hook layer**, which allows it and records a row naming the tool and the file, so the monitor shows the edit as it happens. The coder edits it twice more while iterating, and nothing stands in the way.
6. The coverage read notes what a review will eventually tile — the **reviewer** itself runs once per work item, at its close, scoped to every commit no review has covered.
7. The orchestrator **commits** the work (holding the commit lock so parallel agents don't collide on the git index).
8. The orchestrator **reports what landed and asks what is next**. Nothing checks coherence here unless you ask for a reconciliation.
9. You say to go on. The test step is dispatched the same way, and nothing is left in the plan.
10. **Reconciliation, if you ask for it** — the `reconciler` verifies the tracking files against the actual code and returns its three-edge Coherence verdict. Nothing schedules this; it runs when you say so.
11. The item's `**Status:**` moves to **done**, its `**Claim:**` stays naming who did the work, a closure note is appended citing the commit range, and the orchestrator **reports** what landed.

Had the work been drifting at step 8 — say the coder had started refactoring an unrelated module — a reconciliation asked for there would have flagged it and opened the **Rebalance gate** for you to steer. Nobody is flagged for you: asking is the trigger.

### 5b. From an idea to a claimed work item

The same store, at a slower speed. Nothing here is executed, nothing is committed, and the steps can sit weeks apart.

1. **You file the item.** Mid-session you notice something worth doing later and type `/fusion:memo idea: split the manifest loader from the validator`. A new directory appears at `circles/<stamp>-split-manifest-loader-from-validator/`, holding one record of the same name — a title, one paragraph, `**Status:** open`, no marker on either. That is all that happens: the memo skill files items and never reads the store back, so nothing ranks or reshapes what you just wrote.
2. **Nothing ranks it.** A `playmaker` agent did until v11, and no replacement was built: an order over the store is yours to hold. What a helper may do is *report* an order over the `**Depends-on:**` edges you confirmed, with cycles named — and you override that report wherever you want to.
3. **You read the store.** The items stand side by side on disk with their statuses in their heads. An item holding several jobs wants **splitting first**, because everything downstream takes an item whole — a spec written from a dozen observations covers one of them and leaves the rest unread. Splitting is one of the orchestrator's operations and needs your word for that item.
4. **You claim it.** The orchestrator sets `**Status:** claimed` and writes `**Claim:** <your checkout> — <you>, <stamp>`, on your say-so and in one edit. From that moment the session holds the item's basename and puts it on every dispatch, so the monitor can say what this session is doing.
5. **You work it.** Hand the item's path to the shaper and the first walkthrough takes over from there — the item is read as the request, and no byte of it is written by the shaper or by anything else until the orchestrator closes it at your word.

None of steps 1 to 3 writes anything but the backlog store, so they are safe to walk in the middle of a running session. Filing an item disturbs nothing that a dispatch loop is holding.

## 6. Where to go next

- [`docs/philosophy.md`](philosophy.md) — *why* fusion is built this way (the design ideas behind the unit of work, file-based coordination, and observation over enforcement).
- [`README.md`](../README.md) — install, setup, your first session, best practices, configuration.
- [`README-hooks.md`](../README-hooks.md) — the hook layer in full: what it traces, the one project setting, and the account of every check that was removed and the measurement behind it.
- [`rules/fusion-workbench-conventions.md`](../rules/fusion-workbench-conventions.md) — the exact workbench layout, the work-item grammar, and the issue, planning and decision marker vocabularies.
- Run `/fusion:help` inside Claude Code for an interactive explainer.
