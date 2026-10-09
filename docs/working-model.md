# Fusion — How the Working Model Operates

This is the *how it works in practice* guide. It walks through the shape of a fusion session — the unit of work, the flow from request to result, the approvals where fusion stops and asks you, and the hook layer that traces every file write.

For *why* fusion is built this way, see [`docs/philosophy.md`](philosophy.md). For install and hands-on usage, see [`README.md`](../README.md). This doc sits between them: it explains the machinery you'll steer.

## 1. The work package — one unit of work

A **work package** is one bounded unit of work: something somebody is going to do, or has decided not to. It is defined by three things: a **brief** (the outcome you're aiming for), its **evidence base** (what you know going in — the assumptions and facts the work builds on), and its **artefact** (what the work produces). When those three hold together, the package is done.

**One directory per package, and no marker on any name.** A package lives at `fusion-workbench/work-packages/<stamp>-<slug>/` and is a pair: its **narrative**, the Markdown file of the directory's own name, `<stamp>-<slug>.md`, and its **control file**, `package.json`, beside it. Everything the package produces lands in the same directory. The narrative holds the brief and nothing that decides state:

```markdown
# split the manifest loader from the validator

## Directive

…
```

The state lives in `package.json`, which only the codec writes, through `bin/fusion-write`, and never a hand. Each field has one subcommand ([`rules/fusion-workbench-conventions.md`](../rules/fusion-workbench-conventions.md) `## Work packages`):

| Field | What it says | Written by |
|---|---|---|
| `status` | one of five values, below | `claim`, `release`, `transition` |
| `claim` | which checkout holds the package: `checkout_id`, the person beside it, the time | `claim`, cleared by `release` and by a pause |
| `mode` | `ordinary`, or `autonomous` with the record holding your words as its source | `set-mode` |
| `depends_on` | the packages that must reach a condition before this one may start | `set-dependencies` |
| `active_documents` | the spec and the plan the work runs on, each bound at the revision accepted | `adopt-plan` |
| `domain`, `filed_by`, `origin` | set once, when the package is filed | `create` |

`status` takes five values and there is no sixth:

- **open** — nobody is working on it.
- **claimed** — a checkout is working on it now, and `claim` names which.
- **paused** — set aside deliberately, not abandoned, expected back. The claim is cleared, and the narrative says what it is waiting for.
- **done** — the work landed. The claim may stay, naming who did it.
- **dropped** — no longer live; the narrative says why, citing the package that replaced it or the reason.

`done` and `dropped` are terminal, and the codec refuses any move out of them. If work needs to continue, you file a new package that cites the old one. `paused` is the one live value a package comes back from, and it comes back by being claimed.

**Two design choices are worth knowing, because everything else follows from them.** One directory per package rather than one list file, so two checkouts adding work at the same time merge with no conflict. And the state in a control file rather than in the filename, so a state change rewrites `package.json` instead of renaming anything, and every citation of a package stays valid for the package's whole life.

**`claimed` names a checkout, and that is what stops two people doing one job.** The value compared is the eight hex characters `bin/fusion-identity` prints for this checkout, never the person beside them — two checkouts of one person carry one git identity, so the person alone cannot answer whose claim this is. `bin/fusion-write` refuses a claim of a held package, and a release or a finish by any checkout but the holder. The one way past a held claim is a takeover, `bin/fusion-write claim --take-over-from <checkout> --source <JSON>`, sent only on the user's explicit word naming the package, its holder and the new one, and recorded in the package's `provenance.claim_transfers` (`rules/fusion-workbench-conventions.md` `## Work packages`, `agents/orchestrator.md`'s **Take over** row). Across checkouts the collision is detected and not prevented: two checkouts that both pull, both see `open` and both claim will conflict on `package.json` at the next merge, and whoever loses the race picks another package.

**`depends_on` carries the edges you ruled on, or that your `autonomous` mode ruled on for you**, each naming another package and a condition, and an entry asserts one relation and no other: the named package must reach that condition before this one may start. `terminal` is met at `done` or `dropped`; `succeeded` asks more, `done` with an accepted evidence record. A `paused` target has reached neither, so the entry stays live and a paused package blocks every package naming it. Every other citation the package carries (a record it rests on, a decision that binds it, work it merely touches) stays in the narrative's prose, which orders nothing. A helper may read the store and *report* an order over the `depends_on` edges; that report is a report, and you override it wherever you want to. The helper is `$FUSION_PLUGIN_ROOT/bin/fusion-work-order`, and everything it prints — which packages are ready, how deep each one sits, what each blocks, the entries that name no package and any cycle — is that report and nothing more. No agent asserts a ranking.

**`active_documents` names what the work runs on** — the spec or plan in force, bound at the exact revision you approved — and it is empty until one exists. Whoever makes a spec or plan the one this package runs on adopts it in the same act, which for the orchestrator is the moment you approve the plan; no pass maintains it afterwards, because a field somebody else is supposed to keep up to date is a field that drifts. It has two readers: you, looking at the package and seeing what it is being built from, and the closure step, which reads that plan's `## Where this work stops` back to you clause by clause when the package finishes.

**`autonomous` mode is your standing answer to the approvals about the solution**, and `ordinary` is the default. It stands on your word and is written only on it, its source citing where your words are: by `/fusion:wp` from your own words, or by the orchestrator in the same turn as a filing or a claim you asked for. It is never inferred from the brief's prose, however plainly that prose says "just do it". Which approvals it answers, and which it never does, is section 3 below; the field on one package never rules on another package's state.

### How a package comes into existence

**You file it, or an agent does within the work you commissioned.** `/fusion:wp <one line>` writes the narrative — a title and one paragraph — and files the pair at `open`, and a title plus one paragraph is the whole minimum ([`skills/wp/SKILL.md`](../skills/wp/SKILL.md)). Telling the orchestrator in chat to file one does the same: it writes the package in that shape, with your words as the brief, and the package is yours. The cheapness is the design: a package that costs more to write than a note is a package nobody writes. An agent may file one too, while decomposing a package it was dispatched for: its `filed_by` names the agent, its `origin` that package, and filing it grants no right to run it. A defect an agent finds is still an issue, and a choice point is still a decision record; neither becomes a work package by being routed through here.

**What the orchestrator may do to the store, it does at your word.** Claiming, releasing, pausing, finishing, dropping, splitting one package into several and merging several into one are operations it performs once you have said so, one confirmation per operation on that package, each through `bin/fusion-write`.

**A request you hand the orchestrator needs no package at all.** Most sessions are one task told to the orchestrator directly; the work-package store is what you reach for when you have several units of future work whose order is not obvious. Where a session *is* working a claimed package, its basename rides every dispatch, which is what lets the monitor say what this session is doing.

**What v11 removed here was the record, not the container.** Until then the unit in that directory was a *Circle*, carrying a six-marker record, ranked by a portfolio agent and activated through a per-checkout pointer file that never travelled between checkouts. The six markers, the ranking and the pointer are gone. The directory and its own copy of every store stand, and the record inside it is the work package's. A workbench that still holds a live Circle record converts at the `v11.11.1` tag; from v12 on, `/fusion:migrate` renames the stores and, since 13.0.0, moves every record's state into its control file.

**The idea-to-work path**, from filing to claiming:

```
/fusion:wp …             you file the package, always at status open
       ↓
you read the store       and pick the package worth doing. Nothing ranks it: the
                         ranking agent and its command both went at v11
       ↓
the orchestrator claims  status open → claimed, claim naming your checkout,
                         on your word
       ↓
requirements-designer    the package's path is a valid request to the
/ implementation-planner requirements-designer, which writes a spec from it
                         and edits no byte of it
```

Section 5 walks that path step by step, beside a code session that never touches it.

## 2. Spec-driven flow

Fusion doesn't execute a vague request directly. It turns the request into a written contract first, then judges the work against that contract. The flow:

```
your request  →  requirements-designer  →  SPEC APPROVAL  →  implementation-planner  →  PLAN APPROVAL  →  execute  →  report
                 (if the request needs sharpening)

a work package's path  →  requirements-designer  →  the same flow, with the package as the request
                       (the package is read, never written)
```

- **requirements-designer** takes an ambiguous or many-sided request and produces a **spec** — a precise statement of what will be built, with the hidden decisions surfaced. If your request is already clear and single-purpose, the requirements-designer is skipped and fusion goes straight to planning.
- The **spec approval** is where you approve (or revise) what will be built, before any planning happens.
- **implementation-planner** turns the approved spec into a **plan** — ordered, dependency-aware steps, each routed to an executor (code-implementer for code, data-implementer for data and ontology).
- The **plan approval** is where you approve *how* it will be built, before any code is written.
- **execute** runs the plan step by step.

**The requirements-designer has two invocation modes and both end in a spec** ([`agents/requirements-designer.md`](../agents/requirements-designer.md) `## Two invocation modes`): your direct request, and a task clarification the orchestrator asks for before a vague task is planned. A **work package is a valid request** — hand the requirements-designer the package's path and it reads the package's brief as your words. It edits no byte of the package: its key set carries the read key and no write key, so a run that tried to file or claim one has no path to write to.

Two further modes stood here until v11 and went with the record they edited: one re-clarified a unit-of-work record's Directive in place, the other created such a record from a draft and was the whole of what the removed `/fusion:memo`-adjacent capture command dispatched. A re-shape is now an ordinary run producing an ordinary spec.

The spec and the plan are the contract. Every later check — "is this work still on track?" — is measured against them, not against a fresh reading of your original sentence.

## 3. The approvals

Fusion stops and hands you the decision at defined points. A work package in `autonomous` mode (section 1) answers the stops that are about the *solution* of that package — the plan review, the package's claim and its finish, and the read of its plan's stop conditions at closure — and one stop that is not: an ordinary `data-implementer` task proceeds under the field, which `57e2b7eb` settled on 2026-09-22. The stops that weigh the project rather than the solution stay yours.

**Approvals — fusion stops and asks before:**

- reviewing a produced **spec** (approve what gets built) — asked as written, field or no field,
- reviewing a produced **plan** (approve how it gets built) — answered `Approve` by the field,
- any **ontology or structured-data change** — an ordinary `data-implementer` task proceeds under the field, while a structural change to entities, relations or schemas still files and skips,
- **destructive operations** — deleting files, removing features, dropping data,
- an **ambiguous task** where scope or acceptance criteria can't be pinned down.

At each approval you get plain choices: proceed, skip for later, defer, or modify the instruction. Under `autonomous` mode three approvals put no question at all — a structural ontology change, a destructive operation, and an ambiguous task instruction: the orchestrator files an open decision carrying the question the approval would have asked, skips the task, and goes on. You answer the decision record afterwards, and the log records that nobody answered it. The same field reaches two stops that are not rows in that list: a policy-curator survey's change ledger is applied whole instead of being put to you entry by entry, and the pause of the package this checkout already holds is confirmed by your instruction to claim another. Which rows the field answers is settled in [`agents/orchestrator.md`](../agents/orchestrator.md) `## Human approval rules`, not here.

**The Coherence check.** Work runs one task at a time; after each one the orchestrator reports and asks what is next. Nothing checks coherence on a schedule any more — the automatic per-batch check went on 2026-09-10 with the Turn loop it rode. What is left is a **reconciliation you ask for**, which reads three questions about what has landed:

1. **Evidence base** — does the work still match the assumptions it was built on?
2. **Brief** — does it move toward the stated goal?
3. **Reachability** — is that goal still reachable, given what we've learned?

If all three hold, the work continues. If something is off, fusion opens the Rebalance approval rather than pushing ahead. That approval has this one trigger and no other: run no reconciliation and it never opens.

**The Rebalance approval.** When coherence breaks, you choose among four moves — in plain terms:

- **Revise the work** — the goal and assumptions are fine; the output isn't there yet. Run another execution pass.
- **Revise the goal** — the destination was wrong. Re-shape the brief.
- **Revise the assumptions** — the basis was wrong. Record a new decision (the evidence base changes).
- **Accept a bounded stop** — the goal isn't reachable as stated; what was learned along the way is the result, and the session ends acknowledging that.

That last option is the point of the whole model: the goal can change mid-work when the world or the facts turn out different, instead of being a fixed target you push against until something breaks.

## 4. The hooks

While the approvals govern *decisions*, a **hook layer** watches *file writes*. It runs on every edit an agent attempts, and it blocks none of them. Two things come out of it:

- **A write trace.** One row per Write, Edit, MultiEdit or NotebookEdit call, naming the tool and the file, appended to `fusion-workbench/.guard-state/events.jsonl`. That log is what the monitor's panel renders live, and it is the only record of what the write surface did.
- **A configuration diagnostic.** When the project's `fusion.json` cannot be read, or its root still carries a file or a key fusion has retired, you are told on every guarded tool call until it is fixed. The repetition is deliberate: a setting that is inert *and* silent leaves you believing it is in force.

**Shell commands are not read at all.** The guard does not try to work out from a command's text what it is about to do. That question is undecidable, and two policies that asked it — one predicting which files a command would write, one predicting whether it would move HEAD — were built and then deleted. `Bash` still reaches the hook, for the diagnostic alone, and an innocuous shell call in a correctly configured project writes no guard state whatsoever.

**Nothing blocks a write, and nothing can.** Four mechanisms once did or once warned, and all four are gone, each on its own measurement: a **protected path** list until 2026-08-12, whose files were put back if they changed by any route; **churn**, a per-file edit count that only ever warned, until 2026-08-15; and on 2026-08-16 the **decision-governed deny** at high sensitivity together with the **halt** it escalated to after three consecutive blocks. A halt flag left in an older project's state file is inert, and `/fusion:setup` offers to delete it. See [`README-hooks.md`](../README-hooks.md) for what each was and the figures that removed it.

The one thing left to configure is not the guard either: `citations.extraPaths`, in your project's `fusion.json`, which names the non-Markdown files fusion's citation helpers should read. See the README's [Configuration](../README.md#configuration).

## 5. Two worked walkthroughs

Two paths reach the same place and cross different machinery. The first is one code session from request to close, with each approval and hook marked. The second is the work-package path — an idea filed today, claimed weeks later — which passes through no approval and no guard at all, because it produces no code.

### 5a. One code session, from request to close

1. You say: *"Add rate-limiting to the API and cover it with tests."*
2. The **orchestrator** resolves the scope: this is code work, one clear outcome.
3. The request is specific enough, so the **requirements-designer** is skipped. The **implementation-planner** produces a plan — a middleware step, a config step, a test step.
4. **PLAN APPROVAL** — you review the three steps and approve.
5. **The first task is dispatched.** The **code-implementer** edits the middleware. Each write passes through the **hook layer**, which allows it and records a row naming the tool and the file, so the monitor shows the edit as it happens. The code-implementer edits it twice more while iterating, and nothing stands in the way.
6. The coverage read notes what a review will eventually tile — the **reviewer** itself runs once per work package, at its close, scoped to every commit no review has covered.
7. The orchestrator **commits** the work (holding the commit lock so parallel agents don't collide on the git index).
8. The orchestrator **reports what landed and asks what is next**. Nothing checks coherence here unless you ask for a reconciliation.
9. You say to go on. The test step is dispatched the same way, and nothing is left in the plan.
10. **Reconciliation, if you ask for it** — the `state-auditor` verifies the tracking files against the actual code and returns its three-edge Coherence audit result. Nothing schedules this; it runs when you say so.
11. A closure note is appended to the package's narrative citing the commit range, the package moves to **done** through `bin/fusion-write transition`, its claim staying to name who did the work, and the orchestrator **reports** what landed.

Had the work been drifting at step 8 — say the code-implementer had started refactoring an unrelated module — a reconciliation asked for there would have flagged it and opened the **Rebalance approval** for you to steer. Nobody is flagged for you: asking is the trigger.

### 5b. From an idea to a claimed work package

The same store, at a slower speed. Nothing here is executed, nothing is committed, and the steps can sit weeks apart.

1. **You file the package.** Mid-session you notice something worth doing later and type `/fusion:wp split the manifest loader from the validator`. A new directory appears at `work-packages/<stamp>-split-manifest-loader-from-validator/`, holding a narrative of the same name — a title and one paragraph — and its `package.json` at `open`, no marker on any of them. That is all that happens: the workflow files packages and never reads the store back, so nothing ranks or reshapes what you just wrote.
2. **Nothing ranks it.** A `playmaker` agent did until v11, and no replacement was built: an order over the store is yours to hold. What a helper may do is *report* an order over the `depends_on` edges as the store carries them, with cycles named — and you override that report wherever you want to.
3. **You read the store.** The packages stand side by side on disk, each status in its `package.json`; `bin/fusion-work-order` lists them with theirs. A package holding several jobs wants **splitting first**, because everything downstream takes a package whole — a spec written from a dozen observations covers one of them and leaves the rest unread. Splitting is one of the orchestrator's operations and needs your word for that package.
4. **You claim it.** The orchestrator runs `bin/fusion-write claim`, which sets `claimed` and names your checkout, on your say-so and in one call. From that moment the session holds the package's basename and puts it on every dispatch, so the monitor can say what this session is doing.
5. **You work it.** Hand the package's path to the requirements-designer and the first walkthrough takes over from there — the package is read as the request, and no byte of it is written by the requirements-designer; only the orchestrator writes its control file, at your word, when it adopts the plan you approve and when it closes the package.

None of steps 1 to 3 writes anything but the work-package store, so they are safe to walk in the middle of a running session. Filing a package disturbs nothing that a dispatch loop is holding.

## 6. Where to go next

- [`docs/philosophy.md`](philosophy.md) — *why* fusion is built this way (the design ideas behind the unit of work, file-based coordination, and observation over enforcement).
- [`README.md`](../README.md) — install, setup, your first session, best practices, configuration.
- [`README-hooks.md`](../README-hooks.md) — the hook layer in full: what it traces, the one project setting, and the account of every check that was removed and the measurement behind it.
- [`rules/fusion-workbench-conventions.md`](../rules/fusion-workbench-conventions.md) — the exact workbench layout, the work-package grammar, and each record kind's states and the operations that move them.
- Run `/fusion:help` inside Claude Code for an interactive explainer.
