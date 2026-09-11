# Is the order helper built now against a one-node, zero-edge store, or deferred until the backlog carries a graph?

---
**Domain:** code
**Filed by:** planner, Kai Stalmann <ks@qantr.com>
**Cross-references:**
`260911-1833_*_implementation-prerequisites-confirmed-once-order-computed.md` (the plan that
surfaced it; gate G3 and phase C);
`260911-1915-candidate-prerequisite-edges.md` (the corpus measurement, and its own recommendation
that the stopping condition be re-read rather than settled forever);
`260908-2018_*_is-a-closed-prerequisite-a-satisfied-edge-or-no-edge-and-what-is-an-archived-one.md`
(the ruling that produced the one-node graph);
`260909-1808_*_the-ground-this-circle-was-measured-on-is-being-cut-away-and-its-design-must-move.md`
(the earlier recommendation that the field is cheap now and everything reading it is not);
`260908-2018-prerequisites-confirmed-once-order-computed.md` (the work item)

---

## Question

The ruling on the dependent side put terminal items outside the node set. Measured at `ae172380`,
`circles/` holds 26 containers, 2 of them work items, one `claimed` and one `done`; the `done` one
carries the store's only `**Depends-on:**` entry and its edges are not read. So the graph the helper
would compute over is **one node and zero edges**, and every figure the helper exists to produce is
determined without computing it: `depth=0`, `blocks=0`, the topological order is a list of one,
`ready=1`, `verdict=acyclic`. No run over this store can distinguish a correct implementation from
several incorrect ones.

It must be settled before step C1 is written, because the cost is not recoverable by deleting the
code afterwards. A `bin/` helper obliges a `CLAUDE.md` Layout row — `derivable-enumerations-lint.test.ts`
section 7 is closed in both directions — and `CLAUDE.md` is a component of all eleven dispatch paths
at **zero** head-room. Measured at `ae172380`: the tightest path, `reviewer`, holds 591 bytes against
its baseline row; the plan's grammar change spends about 360 of them on a minimal draft; the shortest
Layout row in the table is `bin/fusion-claimed-item` at 291 bytes. 360 + 291 = 651 against 591, so
the helper's mandatory row is **over budget by at least 60 bytes today**, before anything is written.
Building it therefore requires a removal from the same path — a cut in `CLAUDE.md` or in an always-on
rule — paid for a report over one node.

## Options

1. **Build it whole now: `hooks/lib/work-graph.ts`, `hooks/order.ts`, `bin/fusion-work-order`, the
   fixture test and the documentation rows.**
   - Pros: the mechanism exists the day the backlog grows, and the fixture test proves it on a
     corpus the store cannot supply, which is what the spec's acceptance test already asks for. The
     design work is done and paid; deferring it means re-reading a spec, a plan and three rulings
     later.
   - Cons: it needs a removal of at least 60 bytes from the `reviewer` dispatch path, found and
     argued now, for a command that prints one row. It also needs the hook-test cut, 139 to 219
     lines somebody else must free, before C3 may land. Both costs are paid against a corpus that
     cannot exercise the thing being bought.
2. **Build the library and its test; ship no command.** `hooks/lib/work-graph.ts` and
   `work-graph.test.ts`, plus the `README-hooks.md` `hooks/lib` row, which is on no dispatch path.
   No entry point, no `bin/` wrapper, no `CLAUDE.md` row.
   - Pros: zero dispatch-path bytes, so the measured deficit disappears. The computation and its
     proof exist and are maintained by the suite; adding the entry point later is small.
   - Cons: a module nothing calls. The precedent this repository holds — `isFusionPluginRoot(dir)`
     kept with no caller — is a survivor of a removal, not a thing built caller-less on purpose. And
     the acceptance test's first part, the store's own graph reported, cannot run at all, so what
     ships is a tested function nobody can invoke.
3. **Stop after the carrier and defer the helper until the backlog carries a stated number of live
   items.** Phase B lands: the grammar, the two skill bodies, the documentation. Nothing computes.
   - Pros: it is what `260909-1808_*_the-ground-this-circle-was-measured-on-is-being-cut-away-and-its-design-must-move.md`
     already recommended — the field is the part that is cheap now and expensive later, and
     everything else reads a store that does not exist yet. No dispatch-path deficit, no hook-test
     cut, and the confirmed-edge grammar starts collecting edges immediately, which is the only way
     the corpus this helper needs ever arrives.
   - Cons: the ordering question returns later at close to full cost, since the spec and the plan
     will both need re-reading. A deferral with no trigger is a silent drop, so the answer has to
     name the trigger and where it is written, or this record is the thing that rots.

## Constraints

- Any answer that builds a `bin/` helper carries the `CLAUDE.md` Layout row; the lint is closed in
  both directions and there is no exemption to ask for.
- Head-room is not raisable here to make room. A dispatch-path addition is offset from the same
  path's total, and the baseline's own text says so; a re-baseline is none of the three events in
  `hooks/lib/__tests__/helpers/growth-bound.ts` `## Re-baselining`.
- A deferral names its trigger and the file that carries it. "When the backlog grows" written only
  in this record is not a trigger, because nothing reads this record on a schedule.
- Whatever is chosen leaves the phase-B grammar landed. It is not conditional on this answer, and
  every option above assumes it.

## Recommendation

Option 3, with the trigger written into the work item rather than into this record. The measurement
is not close: the helper's mandatory row is over the tightest path's budget before a byte of it is
written, its test is blocked on a cut nobody has scheduled, and the store it would read has one node.
Option 1 spends a cut on every agent's context to report a figure a person can read off two files by
eye. Option 2 avoids the byte cost honestly but ships a function with no caller, which is the shape
this project's own hygiene rules treat as a defect rather than a saving.

What makes option 3 safe rather than a quiet drop is the trigger, and it is the part the user has to
rule on with the option: a line in the work item's own record naming the count of live items at which
the question is re-read, so the next person to open the item meets it. The candidate survey already
asked for exactly this and its request is unaddressed at the moment of writing.
