# Three aspects of the source are neither covered nor named as excluded, and the proposal pass has no agent and no surface

---

The Circle's Directive covers one of the source workbook's eight sheets, plus the one input column
that feeds it. Three further aspects of the source are absent from the Circle without appearing
anywhere as a stated exclusion, so a reader cannot tell a decision from an omission. Separately, the
human half of the confirm loop is settled only in its shape: no agent is charged with proposing an
edge, no surface carries the invocation, and nothing states what a second run does.

---

**Filed by:** consultant, Kai Stalmann <ks@qantr.com>

**Related:**
`260908-2018-prerequisites-confirmed-once-order-computed` (the Circle this concerns);
`260908-2018-shaper-prerequisites-confirmed-once-order-computed.md` (the shaping run, whose
clarification rounds are the record of what was decided and what was not);
`foreign:unite-co-creator:260907-2358-a-planning-layer-for-fusion-positions-edges-and-computed-order.md`
(the consultation the Circle was shaped from);
`/Users/k1/Projects/productive/unite-co-creator/logbook/260904-MVP-TimeBoxed-Planning/2026-09-04_MVP-TimeBox-Bloecke.xlsx`
(the workbook, read at 2026-09-09 for this issue: eight sheets, `Reihenfolge` 84 rows,
`Positionen` 72, `Vorlaufzeiten` 9).

## What the Circle covers

Measured by opening the workbook and the Circle's record together. Coverage is one sheet and one
column:

| Sheet | What it carries | In the Circle |
|---|---|---|
| Reihenfolge | level, transitive blocked count, `Setzt voraus`, `Grundlage der Einordnung` | fully: the confirmed edge with its tier and reason, plus depth, transitive count, topological order, readiness and cycles |
| Positionen | status, effort, UI share, provenance, scope verdict | the prerequisite column only |
| Zeitbox | measured active days per week times weeks, two tracks, utilisation against a fixed end date | no, excluded by decision |
| Übersicht | demand against capacity, 94 % to 150 % of the box | no, follows from the exclusion above |
| Vorlaufzeiten | 21 and 45 calendar days of external wait, latest start, entering by maximum | **no, and not named as excluded** |
| Zielbild | five goals with target value, measurement and the tie-break rule "lower number wins" | **no, and mentioned nowhere in the Circle** |
| Blöcke | definition of done per block | partly, through the stopping section fusion's plans already mandate |
| Quellen & Methode | provenance of each statement | yes, an existing fusion convention |

The two exclusions marked "by decision" are on record: the first clarification round settled "the
reach toward time (neither effort nor capacity)"
(`260908-2018-shaper-prerequisites-confirmed-once-order-computed.md` `## What was done`).

## The three aspects that are absent without being named

**Lead time.** The recorded exclusion reads "neither effort nor capacity". A 21-day wait on a
certificate is neither. It is an edge onto a calendar rather than onto another unit of work, and in
the workbook it is the column that sets the date: `Vorlaufzeiten` carries a latest-start date per
row and states that such a row enters the deadline by maximum. Nothing in the Circle says whether
that edge kind is in or out, so the plan will meet the question at its own first step.

**Measured status.** The consultation the Circle was shaped from names "store the probe, not the
verdict" as the single change delivering the user's second wish
(`foreign:unite-co-creator:260907-2358-a-planning-layer-for-fusion-positions-edges-and-computed-order.md`
`### 5. The fix for automatic status: store the probe, not the verdict`). The Circle replaces it
with the filename marker, which was settled in clarification round 1 as the progress source. What
was not stated is what that costs: the marker carries four states, the workbook's status column
distinguishes `teilweise gebaut` from `entschieden, unimplementiert`, and no part of the Circle
reads the code tree at all. The substitution is a decision the record makes silently.

**Node granularity.** The workbook orders roughly 69 positions. The Circle orders Circle
directories and backlog entries. The same consultation measured that positions and Circles stand
many-to-many and partial in both directions, and that neither derives from the other (`### 6.
Positions and Circles do not nest`). The Circle therefore computes a different order over a
different node set, not the workbook's order over coarser nodes. The finest fusion node that
carries a dependency field, the plan step at `agents/planner.md:125`, stays outside the graph and
continues to be read by nothing. The Circle's own Grounding snapshot states that field is
unparseable; it does not state that the Circle leaves it that way.

## The interaction is settled in shape and unsettled in mechanism

What is settled, from the Directive and the shaping history: the source read is prose already in the
workbench, resolved through the citation resolver at `hooks/lib/citation-scan.ts`; the model
proposes each edge with a tier and a reason; the user confirms; the agent writes the confirmed edge
into the dependent record; the pass runs when the user invokes it; the consumers are the next-work
recommendation and an on-demand command; an edge resolving to nothing is reported, the node kept,
the edge dropped. Nothing is pulled from the code tree, no command is run, git is not read.

Six things about that loop are unspecified, and none of them is one of the Circle's four open
decision records:

1. **No agent owns the proposal pass.** A grep for agent names across the whole Circle returns
   `playmaker` (as consumer of the figures) and `shaper` (as author of the record). Nobody is
   charged with reading the prose and proposing edges. `reconciler` and `curator` are the
   candidates; `curator` already carries the survey, ledger-at-a-gate, apply shape this pass needs.
2. **No surface carries the invocation.** "The pass runs when the user invokes it" names no skill,
   no dispatch and no helper. If the answer is a new skill body, it lands on a surface with 902
   bytes of head-room, which the Circle measured but never charged this item against.
3. **Gate granularity is unstated.** There are 23 records; the comparable graph in the source
   workbook holds 39 edges over 27 nodes. Confirming edge by edge is 39 prompts, confirming a
   ledger is one. Both are legal today and the record picks neither.
4. **The read corpus is unbounded.** "The prose that already carries it" may mean the
   `## Dependencies` section alone, or that section plus Grounding snapshots, plan heads and the
   `**Cross-references:**` line of decision records. Which it is decides whether the pass is cheap
   enough to re-run.
5. **Re-run semantics are absent.** A confirmed edge is durable, and the Directive states that what
   is asserted persists. Nothing states what the second pass does with an already-confirmed edge,
   nor how a confirmed edge is revised or retracted when the prose beneath it changes.
6. **The new-record path is unassigned.** When the shaper writes a new Circle record, either it
   fills the field at write time or the record waits for the next pass. Under the mandated branch of
   `260908-2018_*_does-the-record-template-mandate-the-prerequisite-field-or-merely-permit-it.md`
   the shaper must fill it immediately, and no decision assigns that.

Point 1 reaches the byte question directly:
`260908-2018_*_what-pays-for-the-playmaker-change-when-the-agent-surface-holds-698-bytes.md` prices
one change to `agents/playmaker.md`. A second agent gaining a proposal step is a second charge
against the same 698 bytes, and that record's three options were weighed without it.

## Why this is one defect and not six decisions

Each of the six may well become its own decision record, and points 1, 3 and 5 probably should. What
is filed here is the prior fact: the Circle reads as fully shaped, carries four open decisions that
look like the whole of what is open, and does not record that the interaction it specifies has no
performer. A reader reaching the plan step would discover that rather than read it.

## What closes this

Either a statement in the Circle record naming the three absent aspects as out of scope with a
reason, plus decision records for at least points 1, 3 and 5 of the interaction, or a re-sharpen
through the shaper's portfolio-activation mode that folds both halves into the Directive before the
Circle is activated. The 260909-0756 activation proposal on the record already recommends a
re-sharpen for an unrelated reason, so the second route costs one run rather than two.
