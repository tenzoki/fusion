# Three aspects of the source are neither covered nor named as excluded, and the proposal pass has no agent and no surface

---

The Circle's Directive covers one of the source workbook's eight sheets, plus the one input column
that feeds it. Three further aspects of the source are absent from the Circle without appearing
anywhere as a stated exclusion, so a reader cannot tell a decision from an omission. Separately, the
human half of the confirm loop is settled only in its shape: no agent is charged with proposing an
edge, no surface can carry the invocation, and nothing states what a second run does.

---

**Filed by:** consultant, Kai Stalmann <ks@qantr.com>

**Related:**
`260908-2018-prerequisites-confirmed-once-order-computed` (the Circle this concerns);
`260908-2018-shaper-prerequisites-confirmed-once-order-computed.md` (the shaping run, whose
clarification rounds are the record of what was decided and what was not);
`foreign:unite-co-creator:260907-2358-a-planning-layer-for-fusion-positions-edges-and-computed-order.md`
(the consultation the Circle was shaped from);
`/Users/k1/Projects/productive/unite-co-creator/logbook/260904-MVP-TimeBoxed-Planning/2026-09-04_MVP-TimeBox-Bloecke.xlsx`
and its generator `build/reihenfolge.py` in the same directory.

**Measurement anchor.** Every figure below was taken on 2026-09-09 at commit `b1f410fb`, by opening
the file or parsing the literal named beside it. None is carried over from the Circle's own
`## Grounding snapshot`, whose anchor commit `de94102f` still does not resolve from HEAD
(`git merge-base --is-ancestor` exits non-zero), which is what the 260909-0756 activation proposal
on the record already states. Where a re-measurement confirms the record's figure, it says so;
where it does not, the record's figure is named beside the new one.

## What the Circle covers

Coverage is one sheet and one column of eight sheets:

| Sheet | What it carries | In the Circle |
|---|---|---|
| Reihenfolge | level, transitive blocked count, `Setzt voraus`, `Grundlage der Einordnung`; 56 positions over four levels (30 / 16 / 7 / 3) | fully: the confirmed edge with its tier and reason, plus depth, transitive count, topological order, readiness and cycles |
| Positionen | 69 positions with status, effort, UI share, provenance, scope verdict | the prerequisite column only |
| Zeitbox | measured active days per week times weeks, two tracks, utilisation against a fixed end date | no, excluded by decision |
| Übersicht | demand against capacity, 94 % to 150 % of the box | no, follows from the exclusion above |
| Vorlaufzeiten | five rows, of which three carry zero wait; latest-start date and slack, both derived against the fixed end date | **no, and not named as excluded** |
| Zielbild | five goals with target value and measurement, a tie-break rule (`bei Zielkonflikten gewinnt die niedrigere Nummer`), and four hypotheses each with a falsification threshold | **no, and mentioned nowhere in the Circle** |
| Blöcke | seven go-live conditions, each with a definition of done | partly, and only in form: fusion's plans mandate a stopping section, but `hooks/lib/__tests__/plan-stopping-section-lint.test.ts` judges presence and never substance |
| Quellen & Methode | provenance of each statement | yes, an existing fusion convention |

The two exclusions marked "by decision" are on record: the first clarification round settled "the
reach toward time (neither effort nor capacity)"
(`260908-2018-shaper-prerequisites-confirmed-once-order-computed.md` `## What was done`).

## The three aspects that are absent without being named

**Lead time, and the slack figure over it.** The recorded exclusion reads "neither effort nor
capacity". A wait on a contract is neither. The sheet holds five rows; three carry zero days, and
only two carry a real wait (21 days for the code-signing certificate, 45 for the data-processing
agreement). Its value is not those two numbers but the two figures it derives from them: a latest
start date per row, computed backwards from the fixed end date, and the slack that follows
(`Der Vertrag hat neun Tage Luft, das Zertifikat gut fünf Wochen`). Its own closing line states that
none of the waits breaks the box if started in the first week, so this is not the column that sets
the date today. It is the one place the source computes a derived time figure, which is precisely
the kind of statement this Circle exists to produce, and `slack` is one of the four words the
Circle's own `## Grounding snapshot` measured at zero occurrences across fusion. The gap is visible
inside the Circle's own evidence and is acted on nowhere in it.

**Measured status.** The consultation the Circle was shaped from names "store the probe, not the
verdict" as the single change delivering the user's second wish
(`foreign:unite-co-creator:260907-2358-a-planning-layer-for-fusion-positions-edges-and-computed-order.md`
`### 5. The fix for automatic status: store the probe, not the verdict`). Three treatments of one
question stand side by side, and the Circle picks the coarsest without pricing it. The workbook's
column is unbounded free text: 40 distinct values over 69 positions, most of them written once
(`Naht da, Ende fehlt`, `Mac fertig, Win offen`, `1 Sidecar von 109`). The consultation proposed
replacing it with an executable probe plus an expectation, so that every status is grep-verified by
construction. The Circle replaces it with the filename marker, settled in clarification round 1 as
the progress source, "not an executable probe". The marker carries six values on a Circle record
and four on a backlog entry, and nothing in the Circle reads the code tree, runs a command, or
consults git. That is a defensible choice and it is not recorded as one.

**Node granularity.** The workbook's ordering sheet ranks 56 positions over four levels; its
position sheet holds 69. The Circle orders Circle directories and backlog entries. The same
consultation measured that positions and Circles stand many-to-many and partial in both directions,
and that neither derives from the other (`### 6. Positions and Circles do not nest`). The Circle
therefore computes a different order over a different node set, not the workbook's order over
coarser nodes. The finest fusion node that carries a dependency field, the plan step at
`agents/planner.md:125`, stays outside the graph and continues to be read by nothing. The Circle's
own snapshot states that field is unparseable; it does not state that the Circle leaves it so.

## The interaction is settled in shape and unsettled in mechanism

Settled, from the Directive and the shaping history: the model proposes each edge with a tier and a
reason, read out of prose already in the workbench; the user confirms; the agent writes the
confirmed edge into the dependent record; the pass runs when the user invokes it; the consumers are
the next-work recommendation and an on-demand command; an edge resolving to nothing is reported, the
node kept, the edge dropped. Nothing is read outside the workbench.

Six things about that loop are unspecified, and none of them is one of the Circle's four open
decision records:

1. **No agent owns the proposal pass.** Five agent names appear across the Circle record, its four
   decisions and its history: `playmaker` 25 times, `shaper` 10, `taskplanner` 5, `curator` 2,
   `planner` 1. Every one of them is named as a measurement target or as a consumer of the figures.
   `taskplanner` is the site of the one `topolog` occurrence, `planner` the site of the unparseable
   step field, `curator` an example of a hand-invented edge vocabulary. Nobody is charged with
   reading the prose and proposing edges. `reconciler` and `curator` are the candidates on shape;
   `curator` already runs the survey, ledger-at-a-gate, apply sequence this pass needs.
2. **No surface can carry the invocation as a new skill body.** Re-measured at `b1f410fb`:
   `skills/*/SKILL.md` holds **828 bytes** of head-room, not the 902 the record states, and the
   arithmetic is worse than that figure suggests. There are 14 skill files against 12 baseline
   entries, and a file with no baseline entry costs its whole current size against the head-room
   (`hooks/lib/__tests__/surface-growth-bound.test.ts`, the note at its head). `news/SKILL.md`
   already charges +8 766 that way. A new skill body of any usable length therefore cannot fit, and
   this is not an open trade but an arithmetic result: the invocation attaches to an existing skill
   body, to a direct agent dispatch, or to a `bin/` helper, which no bound measures.
   `agents/*.md` re-measures at **698 bytes**, confirming the record's figure exactly (floor
   399 843, total 417 145, budget 417 843).
3. **Gate granularity is unstated, and the count is larger than the record implies.** There are 25
   Circle records on disk today, not the 23 the snapshot surveyed; 24 carry a terminal marker and
   one is anticipated, so the live graph is still one node and no edges. The comparable graph in the
   source, parsed from `build/reihenfolge.py`'s `EDGES` literal, holds **39 edges over 46 distinct
   nodes**, of which 27 carry at least one prerequisite (tiers: 14 quoted, 25 inferred). That
   re-derivation confirms the shaper's figures exactly. Confirming edge by edge is 39 prompts;
   confirming a ledger is one. The record picks neither.
4. **The read corpus is unbounded.** "The prose that already carries it" may mean the
   `## Dependencies` section alone, or that section plus Grounding snapshots, plan heads and the
   `**Cross-references:**` line of decision records. Which it is decides whether the pass is cheap
   enough to re-run. The snapshot names `hooks/lib/citation-scan.ts` as a reusable half and
   `hooks/lib/citation-corpus.ts` beside it, but as design findings: neither is stated as the
   corpus this pass reads.
5. **Re-run semantics are absent.** A confirmed edge is durable, and the Directive states that what
   is asserted persists. Nothing states what the second pass does with an already-confirmed edge,
   nor how one is revised or retracted when the prose beneath it changes.
6. **The new-record path is unassigned.** When the shaper writes a new Circle record, either it
   fills the field at write time or the record waits for the next pass. Under the mandated branch of
   `260908-2018_*_does-the-record-template-mandate-the-prerequisite-field-or-merely-permit-it.md`
   the shaper must fill it immediately, and no decision assigns that.

Point 1 reaches the byte question directly:
`260908-2018_*_what-pays-for-the-playmaker-change-when-the-agent-surface-holds-698-bytes.md` prices
one change to `agents/playmaker.md`. A second agent gaining a proposal step is a second charge
against the same 698 bytes, and that record's three options were weighed without it.

## Why this is one defect and not six decisions

Each of the six may become its own decision record, and points 1, 3 and 5 probably should. Point 2
has stopped being a decision: the arithmetic answers it, and what remains is to write the answer
down. What is filed here is the prior fact: the Circle reads as fully shaped, carries four open
decisions that look like the whole of what is open, and does not record that the interaction it
specifies has no performer.

## What closes this

Either a statement in the Circle record naming the three absent aspects as out of scope with a
reason, plus decision records for points 1, 3 and 5, or a re-sharpen through the shaper's
portfolio-activation mode that folds both halves into the Directive before the Circle is activated.
The 260909-0756 activation proposal on the record already recommends a re-sharpen for an unrelated
reason, so the second route costs one run rather than two, and it would re-anchor the snapshot to a
commit that resolves at the same time.
