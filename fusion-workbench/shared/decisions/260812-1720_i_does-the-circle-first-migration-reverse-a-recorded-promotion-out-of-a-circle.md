# Does the Circle-first migration reverse the one recorded promotion of an artifact out of a Circle?

---
**Domain:** code
**Status:** implemented
**Filed by:** planner
**Cross-references:** `shared/decisions/260812-0254_*_where-do-a-circles-spec-and-plan-belong-when-the-circle-exists-before-them.md` (the answered decision that ordered the migration); `circles/260716-1847-workbench-umbau/_c_circle.md` line 49 (the recorded promotion); `shared/planning/260717-1918_*_skill-glob-nomatch-zsh-hardening.md` (the file); `rules/fusion-workbench-conventions.md` `## Origin Rule (Herkunftsregel)`, final paragraph

---

## Question

The user chose migration over leaving the existing Circles alone. Measurement says the migration
has exactly one candidate, and that candidate was moved out of its Circle **on purpose**, with a
reason recorded at the time.

`shared/planning/260717-1918_*_skill-glob-nomatch-zsh-hardening.md` was written on 2026-07-17
while Circle `260716-1847-workbench-umbau` was active. The evidence is unambiguous and mechanical:
its sibling session-history file, written by the same planner run under the same `fusion-paths`
call, sits at `circles/260716-1847-workbench-umbau/history/260717-1918-planner-session.md`. The
other six files in `shared/planning/` each have their sibling in `shared/history/`, which is what
"no Circle was active" looks like on disk.

At that Circle's closure the plan was lifted to `shared/planning/`, and the record says why
(`_c_circle.md:49`): *"Der zsh-Glob-Fix-Plan `260717-1918[o]` (14 Stellen) wurde beim Abschluss
nach `shared/planning/` gehoben — er deklariert eine eigene Directive und ist eigenständige
Folgearbeit, nicht Teil dieses geschlossenen Circles."*

So the question is not "where does the Origin Rule put this file". The Origin Rule puts it in the
Circle. The question is whether the Circle-first migration overrides a promotion that was
deliberate, reasoned and recorded — and whether the reason still holds.

## Options

1. **Move it back into `circles/260716-1847-workbench-umbau/planning/`.** The Origin Rule is
   origin, not durability; the plan's own later independence does not change where it came from,
   and "reach is cited, never placed" is the rule's own answer to an artifact that binds work
   outside its Circle.
   - Pros: the migration does what it was ordered to do. One rule governs every plan in the
     workbench, with no exception a future reader has to discover. The Circle that caused the
     plan contains it.
   - Cons: it reverses a recorded decision without that decision having been shown wrong. The
     nineteen citations to this file, of which eighteen do not carry its current filename, all
     have to be rewritten — the whole citation cost of the migration is this one file's.
2. **Leave it, and record the promotion as the exception it is.** Append to the migration's
   record that one artifact stays in `shared/` by a promotion the Origin Rule explicitly
   tolerates: *"Should the rule prove too tight in practice, the answer is a promotion step — an
   explicit, recorded move from a Circle to `shared/` — not a second placement rule."*
   - Pros: the promotion clause exists precisely for this, and this is the only instance of it in
     the workbench. Zero citation risk. The recorded reason is a real argument: the plan declares
     its own Directive and outlived the Circle by weeks.
   - Cons: the migration then moves nothing at all, which will read as the declined
     leave-them-alone option arriving by the back door, even though the reasoning is different.
3. **Move it back, and delete the promotion clause from the Origin Rule.** If the Circle-first
   model means an artifact never leaves the Circle it came from, the clause that permits an
   escape is now dead text.
   - Pros: one rule, no escape hatch, nothing for a later agent to reason its way into.
   - Cons: the clause is the Origin Rule's own stated answer to being too tight, and removing a
     pressure valve because it has been used once is how a rule becomes something people route
     around instead of using. This also reaches further than the migration and should not ride
     along with it.

## Constraints

- Whatever is chosen must be recorded on the file or the Circle record, not only here. Six other
  files stay in `shared/` for a measured reason and that reason is being written down; this one
  cannot be the only silent case.
- The citation rewrite, if the file moves, uses the wildcard marker form
  (`260717-1918_*_…`) and converts the thirteen pre-v4 bracket citations in the same pass. It
  must not reproduce the stale-marker defect in the other direction.

## Recommendation

Option 2, with the recording done properly. The Origin Rule tolerates a recorded promotion by its
own text, the promotion here is recorded and reasoned, and the reason is still true — the plan
declares its own Directive and was executed weeks after the Circle closed. Option 1 spends the
entire citation risk of this migration on the one file where the placement was a deliberate
judgement rather than a resolver default.

This recommendation is not the declined option returning. The user declined leaving the
*placement rule* alone; the rule changes, and every Circle created from now on contains its own
founding documents by construction. What is at issue is one historical file whose placement was
argued rather than defaulted.

The user decides. The plan's steps 12 and 13 are written to do nothing if the answer is
"leave it".

---
Answered:
Implemented:
Deferred:
Superseded by:

---

## Answer, 260812-1745, by the user

**Option 2: the file stays in `shared/planning/`, and the promotion is recorded as the exception it
is.** The Origin Rule tolerates a recorded promotion by its own text — *"the answer is a promotion
step, an explicit, recorded move from a Circle to `shared/`, not a second placement rule"* — this
is the only instance of it in the workbench, and the reason given at the time is still true: the
plan declares its own Directive and was executed weeks after its Circle closed.

**This is not the declined leave-them-alone option arriving by the back door, and the difference is
worth stating because a later reader will suspect it.** What was declined was leaving the
*placement rule* alone. The rule changes: every Circle created from now on contains its own
founding documents by construction. What is left standing is one historical file whose placement
was argued rather than defaulted, and reversing a reasoned decision that has not been shown wrong
is not what the migration was ordered to do.

The practical consequence is that the migration moves nothing. Six files stay because measurement
showed the Origin Rule already places them correctly, and the seventh stays because its move out
was deliberate. All seven reasons are written down rather than left as silence.

The nineteen citations to this file are not rewritten, so the migration carries no citation risk at
all. The stale-marker defect in eighteen of them is a separate matter and stays open on its own
record.

---
Answered: this record `## Answer, 260812-1745` — the file stays, the promotion is recorded as the
Origin Rule's own tolerated exception, and the migration moves nothing.
Implemented: `shared/planning/260717-1918_*_skill-glob-nomatch-zsh-hardening.md`, header `**Origin
— why this plan sits in shared/planning/ …**` — the file stays, and the promotion is now recorded
on the artifact a reader opens, not only in this record and the closed Circle's `## Closure note`.
Nothing was moved and no citation was rewritten, so the answer's "the migration moves nothing" is
realised by an addition and no deletion. The six other files in `shared/planning/` carry no note:
their sibling histories in `shared/history/` witness that no Circle was active, which is the
Origin Rule's ordinary case and needs no annotation to be legible.
