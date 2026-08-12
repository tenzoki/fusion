# Where do a Circle's spec and plan belong, when the Circle exists before them?

---
**Domain:** code
**Status:** open
**Filed by:** orchestrator (on the user's request)
**Cross-references:** `rules/fusion-workbench-conventions.md` `## Origin Rule` and `## Path Resolution` invariant 1; `rules/circle-records.md`, whose `Active spec/plan:` field documents the present behaviour as routine; `bin/fusion-paths`

---

## Question

The user, verbatim: *"circle ist eine sinnvolle Einheit, aber dass die von Shaper und Planner
vorbereitend angelegten Docs nicht in dem circle Ordner sondern in shared/ bleiben ist absolut
unsinnig."*

He is describing the current behaviour correctly. With no Circle active, every `OUT_*` resolves
into `shared/`, so a spec written before the Circle exists lands in `shared/planning/` and stays
there — `rules/circle-records.md` documents this as one of the two routine cases its
`Active spec/plan:` path field exists to survive. The Circle then holds a pointer to its own
founding document, which lives somewhere else.

**The user's second half changes the shape of the problem**, and is the more important part: he
wants the Circle created **before** the shaper runs. A backlog or ideation store in `shared/`, a
maintainer that consolidates it and anticipates Circles, and then shaper and planner working on the
rough idea *inside* an already existing Circle. If the Circle exists first, the spec has a home when
it is written and nothing needs moving.

He also asks for the semantics to be sharpened: `shared/` should hold what is identified by
timestamp and topic under team work — possibly with a user initial in future — and what arises in a
Circle should be in the Circle.

## Options

1. **Create the Circle first.** A backlog store, a maintainer that turns backlog entries into
   anticipated Circles, and `/fusion:direct` / shaper writing into an existing Circle rather than
   creating one at the end. The `shared/planning/` case disappears for Circle work.
   - Pros: no artifact ever moves; the Origin Rule is untouched, because the origin genuinely is
     the Circle by the time anything is written.
   - Cons: it front-loads a decision the shaper exists to defer — you must know it is a Circle
     before you know what it is. The anticipated (`_a_`) state already covers exactly this and may
     be all that is missing.
2. **Move the artifact when the Circle is created.** Keep today's flow, and have the Circle's
   creation carry its spec and plan in.
   - Pros: no change to how work starts.
   - Cons: this is a promotion step, and `rules/fusion-workbench-conventions.md` explicitly warns
     that the answer to a tight Origin Rule is a promotion step and **not** a second placement rule.
     It would be the first one, and every path citation into the moved file breaks.
3. **Leave placement and fix the perception**, since the `Active spec/plan:` pointer already
   resolves.
   - Cons: the user's complaint is not that the file cannot be found. It is that a Circle that does
     not contain its own founding document is not a container.

## Constraints

- The Origin Rule is load-bearing and mechanically applicable because it rests on a fact an agent
  knows (was I dispatched under a Directive?). Any answer that requires an agent to guess an
  artifact's future affiliation reintroduces the drift the rule was written to stop.
- Twelve Circles exist with artifacts placed under the current rule. Whatever is chosen must say
  what happens to them: nothing, a migration, or a documented split.

## Recommendation

Option 1, because it dissolves the problem rather than patching it, and because the anticipated
Circle state already exists and is under-used. But it is the larger change and it needs the backlog
question below answered first — they are one design, not two.

---

## Answer, 260812-1620, by the user

**Option 1: the Circle comes first.** A Circle exists as anticipated before the shaper runs, and
shaper and planner work inside it. No artifact ever moves at creation time, and the Origin Rule is
untouched, because by the time anything is written the origin genuinely is the Circle.

The cost the option carried is accepted with it: you must know that a thing is a Circle before you
know what it is. The answer to that objection was already in the record — the anticipated state
means precisely "provisional Directive, no Grounding yet", so nothing new is being asked of the
user that the state does not already offer.

**The existing twelve Circles are migrated**, not left. The user chose the fuller option over the
recommendation. That makes path citations the substance of the work rather than a footnote: every
session history, decision record and review that cites a spec or plan in `shared/planning/` has to
move with it, or the migration trades one broken container for a field of dangling references. Ten
of the twelve are closed, which does not make their citations less real.

This decision is answered together with `260812-0254_a_does-fusion-need-a-backlog-store-…`; they are
one design and neither is implementable alone.

---
Answered: this record `## Answer, 260812-1620` — the Circle is created before the shaper, and the
twelve existing Circles are migrated with their citations.
