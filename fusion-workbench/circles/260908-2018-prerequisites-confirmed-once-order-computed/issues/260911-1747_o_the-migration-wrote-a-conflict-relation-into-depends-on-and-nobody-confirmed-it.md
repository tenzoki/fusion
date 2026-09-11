# The migration wrote a conflict relation into `**Depends-on:**` on resolvability alone, and nobody confirmed it

---

The store's only live dependency edge asserts a relation the field's own rule says it does not
carry. `/fusion:migrate` selected the entry by whether the name resolved, never by what the prose
asserted, and the source prose calls the relation a substantive conflict and explicitly not an
ordering relation. The rate is one in one: every value the field holds today is wrong in this way.

---

**Filed by:** shaper, Kai Stalmann <ks@qantr.com>

**Related:**
`260908-2018-prerequisites-confirmed-once-order-computed.md` (the item specifying the mechanism that reads this field);
`260909-1700-cut-fusion-to-working-minimum.md` (the item carrying the value);
`260911-1747_*_may-a-done-work-items-head-field-be-edited-at-all-and-under-what-bound.md` (whether the value may be corrected in place, filed with this record);
`260908-2018_*_does-the-new-field-name-only-the-ordering-edge-or-the-four-relation-types-beside-it.md` (what the field asserts)

**Measurement anchor.** Every figure and line number below was read in this work tree at commit
`1208ceb6` on 2026-09-11.

## The defect

`rules/fusion-workbench-conventions.md` `## Backlog entries — work items` states that
`**Depends-on:**` "carries only edges the user has confirmed". `260909-1700-cut-fusion-to-working-minimum.md`
carries `**Depends-on:** 260908-2018-prerequisites-confirmed-once-order-computed.md`, and that entry
satisfies neither half of the sentence. It is not an ordering edge, and no user confirmed it.

Read as an ordering edge it says that finished work waited on work that has not started, since the
carrying item's status is `done` and the named item's is `claimed`.

Two items are in the store. One carries the field. So the field's error rate over its live values is
one in one, and a helper computing over the store today would report a violated prerequisite as its
first and only finding.

## Evidence path

- `260909-1700-cut-fusion-to-working-minimum.md` holds the field, at head-field line 7 of the record
  inside its own container.
- The same file's `## Dependencies` section, at line 84, states the relation: "Conflicting, and the
  conflict is substantive rather than an ordering nicety." The section goes on to refuse a ranking,
  in the words "which one gives way is the user's call at activation, not this record's".
- `skills/migrate/SKILL.md:157` is the conversion rule that wrote the entry. It keeps an entry whose
  target the same pass converted, and drops prose, `(none)`, and any name that resolves to nothing.
  Relation type is not among its criteria, so a conflict stated in prose and a prerequisite stated in
  prose convert identically.
- `260908-2018-prerequisites-confirmed-once-order-computed.md` carries no `**Depends-on:**` field, so
  the edge is asserted from one side only.

## Acceptance test

1. Every entry in every work item's `**Depends-on:**` field is one a user confirmed, checkable by
   reading the two items in the store and the record of the confirmation.
2. The entry on `260909-1700-cut-fusion-to-working-minimum.md` is either confirmed as an ordering
   prerequisite or gone, with the reason recorded. Which of those two is permitted for a terminal
   record is the decision filed beside this issue.
3. `skills/migrate/SKILL.md` either filters a converted entry by relation type as well as by
   resolvability, or states in its own text that it converts an unconfirmed relation and names who
   confirms it afterwards.
