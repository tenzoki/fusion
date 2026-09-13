# May a `done` work item's head field be edited at all, and under what bound?

---
**Domain:** code
**Filed by:** shaper, Kai Stalmann <ks@qantr.com>
**Cross-references:**
`260908-2018-prerequisites-confirmed-once-order-computed.md` (the item this question blocks);
`260909-1700-cut-fusion-to-working-minimum.md` (the terminal item whose field carries the value in question);
`260908-2018_*_is-a-closed-prerequisite-a-satisfied-edge-or-no-edge-and-what-is-an-archived-one.md` (whether a `done` item's edges are read at all, which bounds how much this question matters);
`260908-2018_*_does-the-new-field-name-only-the-ordering-edge-or-the-four-relation-types-beside-it.md` (what the field asserts, the other half of the same repair);
`260824-2013_*_do-archive-and-terminal-circles-stores-enter-any-scan-set-or-is-the-exclusion-written-down.md` (the ruling `## Terminal states are history` cites);
`260909-1808_*_may-a-helper-compute-an-order-over-work-items-after-the-portfolio-layer-goes.md` (the helper's authority to report an order over these edges)

---

## Question

`rules/fusion-workbench-conventions.md` `## Terminal states are history` states that a terminal
record is read as evidence and never reconciled in place, and that no header change is written into
it after the transition. The work-item format puts machine-readable data in the header: `**Status:**`,
`**Claim:**` and `**Depends-on:**`. One terminal item now carries a `**Depends-on:**` value that its
own body contradicts, and the ordering mechanism being specified in this item reads that field as its
only input.

The value is on `260909-1700-cut-fusion-to-working-minimum.md`, status `done`, whose field names
`260908-2018-prerequisites-confirmed-once-order-computed.md`. Its `## Dependencies` prose calls the
relation "Conflicting, and the conflict is substantive rather than an ordering nicety" and refuses to
rank the two items. `/fusion:migrate` lifted the name into the field on resolvability alone
(`skills/migrate/SKILL.md:157`), never on relation type, and no user confirmed it. The field's own
rule says it carries only edges the user has confirmed.

The choice point must be settled before any figure is computed, because the two readings of the
terminal rule give opposite instructions about the one value the graph holds today. Under the strict
reading the field stays as written and the mechanism computes over a relation nobody asserted. Under
the data reading a two-character edit makes the graph exact. Neither reading is written down.

## Options

1. **A terminal item's head fields are never touched, and a correction lives in the surviving live
   item.** The terminal rule binds the whole file, header included; nothing is rewritten, and where
   the relation matters the live item says so in its own body or in a new item that cites the
   terminal one.
   - Pros: one rule, no exception to police. The evidentiary value of a terminal record stays
     absolute: what it says today is what it said at the transition. It needs no new text anywhere.
   - Cons: the store's only live edge stays a value its own field rule excludes, and every future
     reader has to re-derive that from the body. The helper reports a prerequisite that nobody
     asserted, and the finding is an artifact of the carrier rather than a fact about the work, for
     as long as the item stays in the store.
2. **A machine-readable head field is data, not narrative, and a factually wrong one may be
   corrected in place.** The terminal rule protects the body and the state fields; a field that a
   program parses is exempt because its wrongness is a defect rather than a historical position.
   - Pros: the graph becomes exact at the cost of one line, and it stays exact as later migrations or
     tools write into the field. It separates the two things the header carries, which the format
     already treats differently: `**Status:**` is the record's own claim about itself, `**Depends-on:**`
     is a claim about another record.
   - Cons: it opens a class rather than a case, and the class includes `**Claim:**`, which names who
     did the work. Nothing in the rule text distinguishes a correction from a revision, so the
     exemption's bound would have to be written and enforced by prose alone. A record whose header a
     later pass may edit is weaker evidence than one whose header may not.
3. **The migration's output is corrected once as migration repair, and the rule binds thereafter.**
   The edit is scoped to values `/fusion:migrate` wrote, is performed once with the reason recorded,
   and creates no standing permission.
   - Pros: it fixes exactly what a mechanical conversion got wrong, with a bound anybody can check:
     the value was not written by a person and was never confirmed. It leaves the terminal rule
     intact for every other case.
   - Cons: "migration output" has to be identifiable after the fact, and in this store it is
     identifiable only by reading the body that contradicts it. A later migration would reopen the
     permission, so the bound is a date and a tool name rather than a property of the record.
4. **The field stays and the item gains an annotation saying the edge is not an ordering edge.**
   Nothing machine-readable changes; the body carries one added line in the shape
   `## Inline State Tracking` already uses for a closed record whose reasoning moved.
   - Pros: it stays inside an existing convention for annotating terminal records, and it loses no
     history.
   - Cons: it does not make the graph exact, because no program reads the annotation. The helper
     still reports the edge, so the defect this question exists to settle survives the answer.

## Constraints

- `## Terminal states are history` binds until it is changed here. Any answer that edits a terminal
  record is a change to that rule's reach and says so in the rule's own text.
- The field carries only edges the user has confirmed
  (`rules/fusion-workbench-conventions.md` `## Backlog entries — work items`). An answer that leaves
  an unconfirmed value in place leaves that sentence false.
- No agent originates or reopens a work item. The orchestrator maintains the store at the user's
  word, one confirmation per operation, and `done` is terminal for reopening whatever this question
  settles about a single field.
- Whether the value matters to the computed graph depends on
  `260908-2018_*_is-a-closed-prerequisite-a-satisfied-edge-or-no-edge-and-what-is-an-archived-one.md`.
  If a `done` item's edges are outside the node set, options 1 and 4 cost nothing; if they are inside
  it, both leave the mechanism computing over an unasserted relation.

## Recommendation

None beyond one observation the evidence supports: this question and the closed-prerequisite question
above are coupled, and answering them in the wrong order produces an answer that reads as settled and
is not. If a `done` item's edges are read, options 1 and 4 leave the store's only edge unasserted; if
they are not read, the case is documentary and options 2 and 3 buy nothing worth a change to the
terminal rule. One record on disk is affected today, which is small enough that the cost of the
answer is almost entirely the precedent rather than the edit.

---
Answered: 260913-0824-reviewer-prerequisites-confirmed-once-order-computed.md `## Findings` — a machine-readable head field is data rather than narrative, so a terminal item's `**Depends-on:**` and `**Cross-references:**` may be corrected where the value is factually wrong. `## Terminal states are history` continues to govern everything else in such a record: the body, the status, the claim and every prose statement stay exactly as they are, because those record what was thought at the time and a correction there would erase rather than repair. The distinction the ruling turns on is that a field a program parses has a truth value independent of when it was written, while a sentence does not. Immediate consequence, not carried out here: the entry the migration wrote onto `260909-1700-cut-fusion-to-working-minimum.md` is such a value and may now be struck; ruled by user, Kai Stalmann <ks@qantr.com>.
