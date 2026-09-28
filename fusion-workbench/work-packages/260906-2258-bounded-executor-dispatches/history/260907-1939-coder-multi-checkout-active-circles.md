# coder — two active Circles in two checkouts read as the designed shape

**Status:** Complete
**Started:** 260907-1939
**Filed by:** coder, Kai Stalmann <ks@qantr.com>
**Checkout:** 5e8248d7
**Task:** fix `260907-1700_*_no-agent-is-told-that-two-active-circles-in-two-checkouts-are-the-designed-shape-and-the-one-signal-it-has-says-fault.md`

## What the defect was

The bound on how many Circles may carry `_t_` is defined per checkout — `.active-circle` is class L
and never travels — while every statement an agent receives counted `_t_` records per project. So
the ordinary multi-checkout arrangement reached an orchestrator as a fault. The sentence that
settles it lived in `rules/workbench-tracking.md`, emitted to no agent, and the issue's own analysis
ruled out fixing that by emission: the sentence is a `.gitignore` justification and would be read at
an activation gate.

## What was changed

- `rules/circle-records.md` — new `### How many Circles may be active, and in whose checkout`,
  placed beside `### The claim field` because `**Claim:**` is the only field that attributes a `_t_`
  record to a checkout. States the per-checkout bound, then a per-record attribution into three
  groups (this checkout's, another checkout's, unattributable) carrying `MULTIPLE-ACTIVE`,
  `MULTI-CHECKOUT` and `CLAIM-UNATTRIBUTED`. The portfolio template's `## Active (_t_)` line, which
  said one entry was expected, now takes one entry per record.
- `agents/playmaker.md` — `### Step 1: Inventory` attributes before counting and scopes all four
  pointer conditions to this checkout's records; `## Active (_t_)` renders every `_t_` record with
  its holder; `## Warnings` gains `CLAIM-UNATTRIBUTED`.
- `skills/setup/SKILL.md` — Step 0i's more-than-one-path branch names the outcome rather than
  reporting `MULTIPLE-ACTIVE` flat, and still offers nothing and writes nothing in all three.
- `hooks/lib/__tests__/fixtures/rules-emission.golden`,
  `hooks/lib/__tests__/fixtures/surface-growth.golden` — regenerated with the two `UPDATE_*` flags.
- `hooks/lib/__tests__/reference-resolution-lint.test.ts` — count pin re-approved, paths 1646 → 1651
  and anchors 227 → 231, attributed by single-file revert against the full tree and written into the
  note beside the previous approval.

## Design notes worth keeping

**Per record, not per set.** The first draft was an ordered cascade over the *set* of `_t_` records
("any two claims name the same checkout" / "otherwise every claim resolves"). A three-record
workbench with a same-checkout pair beside an `Unclaimed` record satisfies two of those branches at
once, so the split was not disjoint and the ordering was papering over it. Sorting each record by
its own claim gives a partition that is disjoint and complete by construction, and it subsumes
`MISSING-POINTER` — a `_t_` record another checkout holds with no pointer here had the same defect.

**No emission list changed.** `bin/fusion-rules` already emits `rules/circle-records.md` to
`orchestrator`, `playmaker` and `shaper`, which is exactly the set that transitions or ranks a
Circle and therefore the set that meets this question. Verified by running the helper.

**Budgets.** `rules/circle-records.md` is a conditional emission, so its growth reaches only the
non-blocking role report, not the always-on core bound. `agents/` had 4 618 bytes of head-room at
the start of this task and the playmaker edit spent about a quarter of it; the regenerated
`surface-growth.golden` carries the exact figure.

**Em-dashes.** `bin/fusion-prose-metric` reads all three edited files as over the ceiling, and each
was over before this task. The first draft added twelve; six were rewritten, and the six that stand
are the bullet and numbered-list openings that match every sibling entry in the same list.

## Verification

`cd hooks && npm test` — 910 passed, 1 failed. The one failure is `citation-sweep.test.ts` on a
spelled marker in `260907-0710-planability-of-the-bounded-dispatch-spec.md`, a committed analysis
this task did not touch. Measured as pre-existing rather than assumed: the sweep prints the identical
`files=1 rewrites=2` summary with all of this task's changes stashed. Filed as
`260907-1939_*_the-planability-analysis-spells-a-backlog-entrys-marker-and-the-citation-sweep-gate-is-red-on-it.md`.

`reference-resolution-lint` resolved every reference; only its count pin had moved, which is the
documented re-approval and not a dangling citation.

## Records touched

- Closed `260907-1700_*_no-agent-is-told-that-two-active-circles-in-two-checkouts-are-the-designed-shape-and-the-one-signal-it-has-says-fault.md`
  (`_o_` → `_c_`) with a Resolved note.
- Filed `260907-1939_*_the-planability-analysis-spells-a-backlog-entrys-marker-and-the-citation-sweep-gate-is-red-on-it.md`.
