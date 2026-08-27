A ranking rationale asserts a resolver behaviour that does not exist, and it stands in the active Circle's record

---
The playmaker's activation proposal states that closing a Circle removes its records from every
agent's scan set and that activating another Circle brings them back. Neither is true. The
sentence sits in the record of the currently active Circle, where every dispatched agent reads it.

---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>

**Severity:** Medium as text, high as a reasoning input.

**Cross-references:**
`circles/260826-1613-cardinality-answered-cut-once-nineteen-cleared/_t_circle.md`, the
`## Activation proposal` section;
`rules/workbench-path-resolution.md` `## The key table`;
`rules/fusion-workbench-conventions.md` `## Path Resolution` → *Two invariants*;
`shared/issues/260801-1020_*_scan-keys-never-reach-the-archive-store.md`

## The claim

`_t_circle.md:125-126`, written by the playmaker run of 260826-1705:

> And the Circle's inheritance is currently stranded, in the sense that closing its parent removed
> all nineteen records from every agent's scan set; activation is what brings them back into scope.

Two assertions, both false, and they fail in opposite directions.

## What the resolver actually does

Every `SCAN_*` key resolves to exactly two stores, the Circle in scope and the shared one. The key
table in `rules/workbench-path-resolution.md` gives `<circle>/issues shared/issues` and the same
shape for the other five, and `bin/fusion-paths`'s own header carries it as an invariant: *"Every
SCAN_* carries BOTH stores when a Circle is in scope."* The optional second argument
`fusion-paths <name> [<circle-dir>]` **replaces** the Circle half; it does not add a third store.

Two consequences, measured against this session's own resolver output:

**Closing a Circle removes nothing from any other Circle's scan set**, because another Circle's
store was never in it. C4's records were reachable while C4 was active, to agents dispatched under
C4. To an agent dispatched under any other Circle they were out of scope on the day they were
filed, closed or not.

**Activating this Circle brings nothing back.** `fusion-paths orchestrator`, run at this session's
Setup with this Circle active, emits
`SCAN_ISSUES=circles/260826-1613-cardinality-answered-cut-once-nineteen-cleared/issues shared/issues`.
The fourteen open records in `circles/260825-2023-presence-travels-monitor-filters-own-checkout/issues/`
are in neither. The new Circle's own issue store held nothing at activation.

The same holds for the decision this Circle's first capability is built to answer:
`260826-1252_*` lives in the closed Circle's `decisions/` store and is not in `SCAN_DECISIONS`
either.

## The precedent, which shows this is a property and not a fault

`shared/issues/260801-1020_*_scan-keys-never-reach-the-archive-store.md` records the same shape one
level further out: no `SCAN_*` key resolves into `archive/`, so archived material leaves every
agent's read set permanently. It is closed. The resolver is doing what its contract says in both
cases, and the contract is deliberate.

## Why the sentence is worse than a wrong portfolio line

Three reasons, in ascending order.

It is **in the active Circle's record**, not in `portfolio.md`. The portfolio is class L and
regenerated per run, so a false line in it survives until the next playmaker dispatch. A Circle
record is authored once and read by every agent dispatched under it, for the Circle's whole life.

It is **a reasoning input, not a description.** The sentence appears in a ranking rationale, as part
of the argument for why this Circle should be activated now. A reader who accepts it concludes that
activation solved a reachability problem, and therefore that no citation work is needed. The
opposite is true: because the records are not scannable from here, the plan must carry all nineteen
as cited steps rather than leave a scan to find them.

And it **invents a mechanism rather than misreporting a number.** The nine instances the parent
Circle closed on were counts that went stale. This is a claimed behaviour of `bin/fusion-paths`
that the program does not have and never had, which is the class the orchestrator's own fabricated
line range belongs to and which the four options of `260826-1252_*` do not reach.

## What is not claimed

Not that the records are lost. They are on disk, enumerated by full path in this Circle's record,
and the Origin Rule's own remedy applies: *"One record, one location, many citations."* Reach is
cited, never placed, so moving them into this Circle's store would be the wrong repair.

Not that the ranking is wrong. This Circle is the only anticipated one and the rest of the
rationale holds; the three surface figures in it were independently re-measured and reproduce.
Only this sentence is false.

Not that the playmaker misread the resolver's output. It appears to have reasoned about the
resolver rather than run it. `fusion-paths` was available and would have printed the answer.

## Fix direction

Two parts.

**Correct the sentence in the record.** The record is `_t_` and not terminal, so the
no-editing-a-terminal-record rule does not apply. The correction is not the orchestrator's to make:
`## Activation proposal` is a playmaker-appended section and the orchestrator writes four sections
in a Circle record, none of them this one. A playmaker dispatch or a user edit.

**Review the playmaker prompt.** The user reports a second incorrect playmaker statement from
another client in the same period. Two invented claims from one agent in one day is a prompt
question rather than two record questions, and it is filed separately.

**Scope.** One Circle record. No shipped file, unless the prompt review finds one.
