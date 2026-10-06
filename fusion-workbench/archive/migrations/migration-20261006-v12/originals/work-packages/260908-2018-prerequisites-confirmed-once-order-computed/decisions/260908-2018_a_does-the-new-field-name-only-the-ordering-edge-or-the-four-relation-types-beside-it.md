# Does the new field name only the ordering edge, or the four relation types beside it?

---
**Domain:** code
**Filed by:** shaper, Kai Stalmann <ks@qantr.com>
**Cross-references:**
`rules/circle-records.md` `## Circle record template` (the `## Dependencies` specification);
`rules/fusion-workbench-conventions.md` `## Decision Record Template` (`**Cross-references:**`, the
existing home for a relatedness pointer);
`260801-1244-guard-rules-write` and `260801-1244-rule-provenance-header` (the two records carrying a
hand-invented reverse edge);
`260820-2051-style-rules-arrive-and-get-measured` (the record carrying a shared-budget conflict in
the same section, explicitly disclaimed as an ordering edge).

---

## Question

The survey of all 23 Circle records found `## Dependencies` carrying at least five relation types
with nothing to tell them apart: a blocking edge, a reverse edge written as `Depended on by`, a
lineage citation, a binding-artifact citation, and once a conflict over the same byte budget. Only
the first is an ordering edge. The Circle needs the first to be machine-readable. What it does with
the other four is open.

Leaving them in place is not free. A naive reader of the section cannot tell them apart, which is
why three records in this repository open with a sentence saying no Circle blocks them and then list
Circle directory names underneath. A model extracting edges will meet exactly that and has to be
told, somewhere, that those are not edges.

The opposite move is not free either. `260801-1244-curator` invented `hard dependency` and
`soft dependency` for one record, and a vocabulary that grows to cover every relation somebody found
worth writing is how the section reached 23 shapes in the first place.

## Options

1. **One verb only. `requires` is named; everything else stays prose and is not read.** The
   extractor is told to take only what carries the verb.
   - Pros: the smallest closed set is the one least able to rot. The four other relations keep the
     expressive freedom that made them worth writing, and nothing has to be reclassified.
   - Cons: the section still mixes five things for a human reader, and the model still has to be
     told what to ignore, so the ambiguity moves rather than going.
2. **Two verbs. `requires` for the ordering edge, `informs` for everything cited but not blocking.**
   Every citation in the section carries one of the two.
   - Pros: a reader and an extractor both partition the section on one word, and the negation
     pattern that defeats naive parsing becomes unwritable. The reverse edge disappears, since it
     is expressible as the forward edge on the other record.
   - Cons: it obliges a rewrite of every live record's section, and it flattens a distinction two
     records found worth making by hand.
3. **A full vocabulary: `requires`, `informs`, `supersedes`, `derives-from`, `competes-with`.** Each
   relation the corpus actually contains gets its name.
   - Pros: nothing observed in 23 records is left unexpressible, and the shared-budget conflict
     finally has a home instead of squatting in an ordering section.
   - Cons: four of the five names are read by nothing, so they are documentation carrying the cost
     of a convention. `supersedes` and `derives-from` already have homes in the marker vocabulary
     and in `**Cross-references:**`, so two of the five would be a second way to say something
     fusion already says.

## Constraints

- Only `requires` is computed. Any other verb is read by no program in this Circle, and a Circle
  that ships an unread vocabulary has shipped documentation, not a mechanism.
- No answer may duplicate a relation the marker vocabulary already carries. Supersession is a
  marker move with a mandated annotation line, and it is not to be restated as an edge.
- Whatever set is chosen is closed and written in one place, per the single-authoring-home rule the
  conventions file states for every other vocabulary.

## Recommendation

Option 2. It is the smallest set that makes the section machine-partitionable, and partitionability
is what the whole Circle turns on. Option 1 leaves the extractor guessing at precisely the sentences
that were measured to defeat it, and option 3 spends a convention on four names nothing reads. The
cost of option 2 is real and should be priced in the plan: it obliges a pass over the live records,
which is one record today and will be more by the time this runs.

---
Answered: 260911-1916-re-grounding-three-open-decisions.md `### F2. The relation-type record` — option 1b of that report's re-grounded table. An entry in `**Depends-on:**` asserts one relation and one only: the named item must reach a finished state before this item may start, and a rule states that where the field is defined. A non-blocking citation gets a home of its own, `**Cross-references:**` becoming a defined work-item head field, so the distinction the filed record wanted to carry as a verb is carried by which field the basename sits in. This closes the gap filed as 260911-1916_*_the-origin-rule-names-a-work-item-cross-references-header-the-item-template-does-not-define.md as a side effect. The record's own options 2 and 3 were not chosen and could not have been: the verb slot they need no longer exists, the prose section that carried it went with rules/circle-records.md, and the migration's conversion rule drops a hand-written verb. Cost accepted at the gate: a grammar change on three surfaces, the work-item template, the filing act in /fusion:memo, and the conversion rule in /fusion:migrate, which the plan's steps B1 and B3 were not costed for; ruled by user, Kai Stalmann <ks@qantr.com>.
