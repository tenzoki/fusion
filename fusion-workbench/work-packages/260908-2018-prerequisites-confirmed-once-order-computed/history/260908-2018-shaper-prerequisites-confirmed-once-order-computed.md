# Shaping a Circle for a computed work order out of confirmed prerequisites

**Status:** Complete
**Filed by:** shaper (anticipated-circle mode), Kai Stalmann <ks@qantr.com>

## What was asked

The user pointed at a consultation held in another project,
`foreign:unite-co-creator:260907-2358-a-planning-layer-for-fusion-positions-edges-and-computed-order.md`,
and at the Excel workbook it studies, and asked for a Circle that brings dependency-ordered planning
into fusion itself. The instruction was to design rather than to transcribe.

## What was done

Two surveys ran in parallel. The first read the workbook and its two build scripts in the consulting
project, recovering the sheet structure, the edge form of `reihenfolge.py` (a dict of child to
`(prerequisite, tier, reason)` triples, 27 keys and 39 edges, tier `Zitat` 14 and `Ableitung` 25),
the capacity constants and the drift between the committed script and the live workbook. The second
verified the consultation's claims about fusion against this work tree at `de94102f` rather than
against the installed copy the consultation had read. Both are cited in the Circle's Grounding
snapshot with the figures they returned.

Four clarification rounds ran, three of which reached the user. The first settled the node kinds
(Circle directories and backlog entries), the progress source (the filename marker, not an
executable probe), the reach toward time (neither effort nor capacity), and how an edge is authored
(a model proposes with tier and reason, the user confirms). The second settled the consumers (the
next-work recommendation and an on-demand command, not the session work list) and the treatment of
an edge that resolves to nothing (report it, keep the node, drop the edge).

The third round's first question was rejected by the user, correctly. All three of its options were
the workbook's edge table transplanted onto a Circle record, which is the projection the user had
already excluded. It was re-asked from fusion's own corpus instead, on the finding that fusion
already holds a dense citation graph with a working resolver in `hooks/lib/citation-scan.ts` and
lacks only a type on the edge. The re-asked round settled that the confirmed edge is written into
the dependent record by the agent, that the acceptance test is retrospective against the 23 existing
records, and that the proposal pass runs when the user invokes it.

## What was verified

Measured directly, not inferred:

- One occurrence of `topolog` across `agents/`, `rules/`, `skills/`, `bin/`, `hooks/` and the three
  READMEs, at `agents/taskplanner.md:116`, and it is prose. Zero occurrences of `transitive`,
  `slack`, `milestone` and `Gantt`.
- All 23 Circle records opened. 23 shapes of `## Dependencies`, at least five spellings of the empty
  case, at least five relation types conflated, three citations of an archived directory that no
  longer resolves.
- The live ordering graph over non-terminal records is one node and no edges: zero `_a_` records,
  one `_t_` record, its section reading `(none)`.
- Head-room at `de94102f` against the baseline maps in `surface-growth-bound.test.ts`:
  `agents/*.md` 698 bytes, `skills/*/SKILL.md` 902 bytes, hook tests 1 695 lines.

One correction to the consultation was found and is recorded in the Grounding snapshot: the session
queue does have a durable copy, in `agentstate.yaml`'s `work_queue`, scoped to its own session.

## What was produced

The Circle `260908-2018-prerequisites-confirmed-once-order-computed`, its record `_a_circle.md`, the
six artifact subdirectories, and four open decision records in its own decision store: what pays for
the change to the ranking prompt at 698 bytes of head-room; whether the template mandates the new
field or merely permits it; whether a closed prerequisite is a satisfied edge, no edge, or a third
state when archived; and whether the field names one verb or several. No spec was written, and no
existing record was modified.
