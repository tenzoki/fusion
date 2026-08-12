# Who writes the recommended marker on a backlog entry?

---
**Domain:** code
**Status:** open
**Filed by:** orchestrator (surfaced by the executor of plan step 7)
**Cross-references:** `shared/planning/260812-1720_o_circle-first-placement-and-the-backlog-store.md` steps 1, 7 and 8; `shared/decisions/260812-0254_a_does-fusion-need-a-backlog-store-and-a-maintainer-that-anticipates-circles.md`

---

## Question

The backlog store uses the existing issues-and-planning marker vocabulary, and `_p_` is read for
this kind as *"the playmaker has recommended this entry for promotion"*. Nothing writes it.

- Step 7 **forbids** the playmaker to rename anything. That boundary is why the job went to an
  existing agent instead of a seventeenth one, and it is not up for quiet revision.
- Step 8 has the shaper consume `_o_` **or** `_p_` and move it to `_c_`.
- No skill, agent or helper produces `_p_`.

So the marker is readable, consumable, and unwritable except by the user's own hand. That may be
exactly right. It is nowhere stated, which means the next person to notice will read it as an
oversight and give it a writer.

## Options

1. **Say that `_p_` is the user's mark, and only the user's.** The playmaker recommends in
   `portfolio.md`, which it regenerates on every run; the marker is how a human records agreement
   with that recommendation before shaping.
   - Pros: no boundary moves, nothing is built, and it makes the portfolio the transient
     recommendation and the marker the durable one. Matches how `_d_` already works for a decision
     record — the user defers, no agent does.
   - Cons: a state that only a human writes will sometimes not be written, and then the shaper sees
     `_o_` for an entry everyone agreed on. Harmless, but the marker then carries less than it
     promises.
2. **Give the playmaker the rename.** One narrow exception to its no-write boundary, argued the way
   the orchestrator's Circle-record exception was argued.
   - Cons: the boundary is the reason this job did not become an agent of its own. Widening it in
     the first week is how a bound stops being one.
3. **Drop `_p_` from the backlog vocabulary.** Three markers: open, closed, deferred.
   - Pros: nothing unwritable remains, and the vocabulary says only what the mechanism does.
   - Cons: loses the distinction between an idea nobody has weighed and one that has been ranked
     and agreed. That distinction is the playmaker's whole output.
4. **`/fusion:next` writes it** when the user accepts a backlog recommendation, the same way it
   performs Circle activation writes today after user confirmation.
   - Pros: a skill already sits at exactly this moment, with the user present and confirming.
   - Cons: extends a skill that is currently about Circles into a store it does not otherwise know.

## Constraints

- The playmaker's no-write boundary is load-bearing and was the ground for the agent choice. Any
  option that moves it re-opens that decision rather than refining it.
- Whatever is chosen is written into `rules/fusion-workbench-conventions.md` `## Backlog entries`,
  where the four markers are already defined for this kind. A marker whose writer is unstated is
  the defect this record exists to prevent.

## Recommendation

Option 1 or option 4, and the choice between them turns on whether the user wants to mark entries
by hand at all. Option 4 is the better mechanism if he does not, because it puts the write at the
one moment the user is already confirming something. Option 2 should be declined on the ground that
it costs the reason the agent was chosen. No recommendation between 1 and 4 without knowing how the
user expects to work with the store, which is a question a week of using it answers better than an
argument does.
