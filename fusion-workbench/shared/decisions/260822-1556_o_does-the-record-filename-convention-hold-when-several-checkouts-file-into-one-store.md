# Does the record-filename convention hold when several checkouts file into one store?

---
**Domain:** code
**Filed by:** reconciler, session-end pass over `370bfc5..9f65463`
**Cross-references:** `shared/decisions/260807-0158_*_how-is-a-unique-record-filename-obtained.md` (the settled answer this record asks about); `shared/planning/260822-1136_*_spec-fusion-becomes-a-multi-user-tool.md` (the arrangement that narrows its evidence base); `shared/issues/260819-1511_*_a-bare-stamp-citation-is-ambiguous-when-two-records-share-it-and-one-turn-log-resolves-to-the-wrong-record.md` (the failure mode, already observed once under one writer)

---

## Question

`260807-0158` settled that no filename-minting helper is authorised and that
`YYMMDD-HHMM_S_<topic>.md` stands. It settled it on a measurement — the premise that the stamp
collides "was measured false" — and that measurement was taken over a corpus one person wrote from
one checkout. The spec approved on 2026-08-22 puts several people on several checkouts filing into
one record store and merging through git, which is precisely the input the measurement did not
cover. Two records minted in the same minute in two checkouts do not collide as *files* until the
merge, and then they collide as *citation targets*: the corpus already carries 84 stamps held by two
or more files under one writer, and `260819-1511` records one turn log that resolved to the wrong
record because of it.

It must be asked before C3 rather than after, because C3 changes every record template and is the
last cheap moment to change what a record is named. `260807-0158` is `_a_` and is active Grounding,
so the question is whether its answer survives the Directive or is narrowed by it.

## Options

1. **The answer stands; nothing changes.** The stamp plus the topic slug plus the wildcarded marker
   is already the citation form, and two records sharing a stamp are distinguished by their slug.
   - Pros: no mechanism, no corpus-wide rename, and the citation form that resolves the ambiguity is
     already ratified and already enforced by the workbench citation gate.
   - Cons: the ratified form is followed in practice and, as `260807-0158`'s own reconciliation note
     says, "written down nowhere it can be read as normative"; a convention that survives on habit is
     the one that breaks first when the number of authors goes from one to several.
2. **Write the citation form down as normative, and leave the filename alone.** Put the
   stamp-plus-slug-plus-wildcard rule into `rules/fusion-workbench-conventions.md` as a rule rather
   than as practice, and say explicitly that a bare stamp is not a citation.
   - Pros: closes the failure `260819-1511` measured without touching a single filename or minting
     anything; costs bytes on a rule surface that has 3 509 of head-room.
   - Cons: the always-on rule core is charged to every dispatch of every agent, and the room there
     was deliberately not spent by C0.
3. **Give the filename a per-author component.** The person field C3 introduces also enters the
   filename, so two checkouts cannot mint the same name.
   - Pros: collisions become impossible by construction rather than by care.
   - Cons: the user foreclosed it at the round-3 gate — the identifier goes in the record body and
     never in a filename, because a dead filename component is a reference that designates nothing.
     Taking this option reverses a stated user condition and would rename nothing while splitting the
     corpus into two naming eras.

## Constraints

- Whatever is chosen must not put an identifier in a filename: the user's round-3 condition is
  explicit and covers every option here.
- It must not require a corpus-wide rename. Roughly a thousand records carry the current pattern and
  every citation of each is a resolvable target the workbench citation gate checks on every run.
- It must be answerable without knowing how many people will actually use the arrangement, since
  that number is not known and the answer binds before it is.

## Recommendation

`inference:` Option 2, and the reasoning is that the failure this record is about has already
happened once under the easiest possible conditions. The measurement in `260807-0158` is not wrong
and its answer is not overturned by anything here; what the Directive changes is the rate, and the
cheapest response to a higher rate of a known failure is to make the mitigation normative rather
than habitual. Option 1 is defensible and is what the project is doing today. Option 3 is foreclosed
and is listed to record that it was considered and why it cannot be taken.

This is the user's call and belongs at C3's planning gate, beside the two decisions the spec already
lists as pending there.

---
Answered:
Implemented:
Deferred:
Superseded by:
Retired:
