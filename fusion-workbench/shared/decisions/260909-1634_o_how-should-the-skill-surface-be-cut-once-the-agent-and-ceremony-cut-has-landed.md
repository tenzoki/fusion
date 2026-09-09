# How should the skill surface be cut, once the agent and ceremony cut has landed?

---
**Domain:** code
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260909-1615_*_spec-cut-fusion-to-a-working-minimum.md, 260909-1345-verification-of-the-size-versus-bookkeeping-analysis.md, 260909-1047-size-versus-bookkeeping-across-three-projects.md

---

## Question

The user raised this on 2026-09-09, while the cut specification was under review, and asked to be
reminded of it after that work lands: the skill surface wants cutting too, and its shape has not
been discussed.

The spec under review cuts the agent roster from fifteen roles to six and removes the ceremony that
the skill bodies drive. It does not decide what the skill surface becomes. That leaves a gap the
spec's own changes widen rather than close: `/fusion:cleanup` loses its pipeline, `/fusion:setup`
loses eleven of its sixteen steps, `/fusion:next` and `/fusion:direct` lose the portfolio layer they
operate on, and four bodies exist only as steps of a pipeline that is being removed. A skill surface
sized for the machinery being cut will outlive it by default unless somebody decides otherwise.

The question is therefore what the surface should be after the cut, not whether it should shrink.

## Options

1. **Decide the skill surface as a follow-on to the current work** — treat it as the next unit of
   work once the cut has landed and its effects are visible. Pros: the skills' shape depends on what
   the cut actually leaves standing, which is not yet known; deciding after removes guesswork. Cons:
   the surface stays oversized for however long that takes, and a skill body that no longer matches
   the mechanism it drives is a defect for that whole period.
2. **Fold it into the current cut** — extend the spec to cover the skill surface before any of it is
   built. Pros: one coherent change rather than two, and no interval in which the bodies contradict
   the machinery. Cons: the spec is already at nine capabilities and under review; widening it now
   restarts that review and delays everything.
3. **Cut only what the current work strands, decide the rest later** — remove the bodies whose
   mechanism the cut deletes, and defer the question of the surface's overall shape. Pros: no body
   survives that drives nothing. Cons: leaves the surface half-decided, which is the state that
   produced the present question.

## Constraints

- Whatever is decided must not remove the multi-user surfaces, which the user has ruled
  non-negotiable for the current cut and which two skills read.
- Every skill directory under `skills/` is registered as `/fusion:<name>` whether or not the
  documentation presents it as a command, so removing a body from the documentation does not remove
  it from the product.
- A lint asserts a two-way match between the skill listing in `CLAUDE.md` and the directories under
  `skills/`, so any change here changes both.

## Recommendation

None yet. The user asked to be reminded of the question, not to have it answered ahead of the work
it depends on.
