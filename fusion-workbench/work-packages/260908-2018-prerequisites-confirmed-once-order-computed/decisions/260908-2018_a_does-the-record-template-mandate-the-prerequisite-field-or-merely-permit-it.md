# Does the record template mandate the prerequisite field, or merely permit it?

---
**Domain:** code
**Filed by:** shaper, Kai Stalmann <ks@qantr.com>
**Cross-references:**
`rules/circle-records.md` `## Circle record template` (the surface that would change);
`rules/fusion-workbench-conventions.md` `## Backlog entries` (the second node kind, whose stated
bound is that an entry more expensive to write than a note is an entry nobody writes);
`foreign:unite-co-creator:260907-2358-a-planning-layer-for-fusion-positions-edges-and-computed-order.md`
`### R3 — Where it lives: project-local first, not in the fusion convention`.

---

## Question

The field is built in the plugin, so it reaches every consuming project on the next release whether
or not that project ever writes one. What is open is whether the shipped template *requires* it.

A mandated field is checkable and therefore real: a lint can fail a record that omits it, and the
graph is complete by construction. A permitted field costs a project that ignores it nothing, and
the graph is then partial and silently so. The two produce different products for a project that
adopted fusion for something else entirely, and the consultation that prompted this Circle
recommended against changing a shared convention on the evidence of one workbook. That
recommendation was overridden for the *mechanism*; it was not put to the user for the *template*.

The backlog store carries a stated bound that pulls the same way: an entry more expensive to write
than a note is an entry nobody writes. A mandated prerequisite field on a backlog entry is exactly
that cost.

## Options

1. **Permitted, and absent means no stated prerequisite.** The template gains an optional field. A
   record without it enters the graph as a node with no incoming edge.
   - Pros: no consuming project pays anything; no migration; the two bounds on backlog entries stay
     true. The mechanism degrades to today's behaviour, which is a working state.
   - Cons: an absent field and a genuinely prerequisite-free record are indistinguishable, so the
     readiness figure is optimistic by construction and no reader can tell by how much.
2. **Mandated on Circle records, permitted on backlog entries.** The coarse node kind carries the
   field always; the fine one carries it when somebody wrote one.
   - Pros: the ambiguity of option 1 is removed where the ranking actually reads, and the cheap
     store stays cheap. `(none)` becomes a statement rather than an omission.
   - Cons: two rules for one field, and every new Circle in every project must write a line about a
     mechanism that project may not use.
3. **Mandated on both, with `(none)` as the required empty case.** One rule, checkable by one lint.
   - Pros: the graph is complete wherever fusion runs, and completeness is what makes a transitive
     count trustworthy.
   - Cons: it overrides the backlog store's own stated bound, and it puts a fusion-internal
     obligation on the one artifact kind the user files by hand.

## Constraints

- Whatever is chosen ships to every consuming project; there is no project-local variant of a
  shipped template.
- An empty case that is spelled differently in different places is the defect this Circle was filed
  against. Any answer names one literal and one only.
- A mandate is worth nothing without something that executes it at the moment of the act; the
  backlog entry `260814-1733_*_attach-the-rule-to-the-act.md` states this and is recommended for
  shaping.

## Recommendation

None. The trade is between a figure a reader can trust and a cost paid by projects that get nothing
back, and that is the user's to make. What the shaper can state is that option 1 makes the readiness
figure unfalsifiable, which is the property the whole Circle exists to give it.

---
Answered: 260911-1916-re-grounding-three-open-decisions.md `### F3. The template record` — ratified as it stands, which is that report's option 2a. The field is permitted rather than mandated and is absent when there is nothing to say, never present and empty. This was not a fresh choice: the state landed at `76d833be` on 2026-09-10 with no record behind it, so the act here is a ratification of an implemented state and the gate said so. The record's own options 2 and 3 were unchoosable. Option 2 partitions on two node kinds and one remains; option 3 requires a written `(none)` literal that three shipped surfaces each forbid. The con is accepted with the answer and is not mitigated: an absent field and a genuinely prerequisite-free item are indistinguishable, so the helper's readiness figure is optimistic by construction and no reader can tell by how much. The helper's own output is to say so rather than leave the reader to infer it; ruled by user, Kai Stalmann <ks@qantr.com>.
