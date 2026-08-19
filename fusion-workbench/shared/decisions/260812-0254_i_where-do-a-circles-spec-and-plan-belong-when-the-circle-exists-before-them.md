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

---
Implemented: `3c6ec4e` + `406ec0d` + `0978e9a` — option 1 in both its halves, realised by the plan
`shared/planning/260812-1720_c_circle-first-placement-and-the-backlog-store.md` (`**Status:**
Complete`).

*The mechanism.* `bin/fusion-paths <name> [<circle-dir>]` takes an existing Circle directory as the
**Circle in scope**, replacing the active Circle as the `OUT_*` base without consulting or writing
`.active-circle` (`3c6ec4e`; the contract is at `bin/fusion-paths:4-11`, `:58-65`, `:282-318`, and
`rules/fusion-workbench-conventions.md:132`). The shaper creates the Circle first in
anticipated-circle mode and resolves against the named Circle in portfolio-activation mode
(`406ec0d`; `agents/shaper.md:15`, `:28`). The planner takes `**Circle:** <directory-name>` and
passes it as the resolver's second argument, which is what lets it plan an anticipated Circle
before activation (`agents/planner.md:13`, `:53`). A spec or plan for a Circle therefore has a home
at the moment it is written, which is the whole of the answer's first half.

*The migration half.* The answer required the twelve existing Circles to be migrated with their
citations. That was executed as plan steps 11-13 and it moved nothing, on a measurement and a user
gate rather than by omission. Step 11 built a citation verifier
(`hooks/lib/__tests__/helpers/citation-scan.ts`) and took a baseline over the whole workbench —
1012 files, 8588 tokens, 1454 dangling path-shaped citations. The moving set measured at **one**
file, not fourteen: each spec's sibling session history witnesses where `OUT_*` resolved when it
was written, and six of the seven sat in `shared/history/`. The move question was put to the user
at 260812-2100 and answered **leave it** — the single candidate's promotion out of its Circle was
deliberate and recorded, which the Origin Rule's own promotion clause tolerates
(`shared/decisions/260812-1720_*_does-the-circle-first-migration-reverse-a-recorded-promotion-out-of-a-circle.md`).
Step 12 therefore did not run, and step 13 wrote that reason into the file itself, which is the
migration's whole product under that answer (`0978e9a`; the paragraph is at
`fusion-workbench/archive/260817-1907-safe-cleanup-scoped/shared/planning/260717-1918_c_skill-glob-nomatch-zsh-hardening.md:6-20`,
archived by `e59dea2` after being written).

---
**Reconciliation 260819-1400 (reconciler, domain `code`, HEAD `e435f03` / `v10.3.0`) — `_a_` → `_i_`,
and why the transition is nineteen versions late.**

Plan step 13 instructed its executor to "walk both decision records from `_a_` to `_i_`". The
executor read "both" as the two **gate** records filed under stamp `260812-1720`, and moved those
(`0978e9a`, both now `_i_`). The two **design** records under stamp `260812-0254` — this one and
`260812-0254_i_does-fusion-need-a-backlog-store-and-a-maintainer-that-anticipates-circles.md`, which
the answer itself calls "one design, neither implementable alone" — were not moved by that commit.
The backlog half was picked up separately by a reconciler at 260813-1545, citing `dec40bb`,
`3c6ec4e` and `b995049`. This half was not, and has stood `_a_` since while every clause of its
answer was on disk.

The `**Status:** open` head field is left exactly as it stands. This record is a member of the
population `260818-2212_i_should-the-decision-records-status-field-exist-at-all-...` measured, and
that record's answer is explicit that a record written before the field's removal keeps it, because
hand-correcting one destroys the evidence the removal was decided on.
