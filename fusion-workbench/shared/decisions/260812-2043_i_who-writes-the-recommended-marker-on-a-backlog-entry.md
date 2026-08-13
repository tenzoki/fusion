# Who writes the recommended marker on a backlog entry?

---
**Domain:** code
**Status:** answered
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

---
Answered: shared/history/260813-0806-orchestrator-session.md `## Decision answered — the playmaker maintains the backlog` — option 2, widened: the playmaker gets full maintenance of the backlog store (marker renames across `_o_`/`_p_`/`_c_`/`_d_`, splitting multi-idea entries, merging duplicates, closing dead ones), not the single `_p_` rename this record framed. Filing stays outside it and is not answered here. Answered by the user; the record's own recommendation to decline option 2 was overruled, not met.

Implemented: b995049 — the playmaker's prompt names the write, so `bin/fusion-paths playmaker` emits `OUT_BACKLOG=shared/backlog` (run directly by the reconciler at 260813-1545, not inferred from the test); `agents/playmaker.md:60` grants the four confirmed operations and the autonomous `_o_`/`_p_` rename; `rules/fusion-workbench-conventions.md:209-214` gives every marker in the backlog vocabulary exactly one named writer, which is the question this record asked; `hooks/lib/__tests__/playmaker-backlog-mandate-lint.test.ts` (5 cases) fails if either surface stops stating it. Full suite green at 49 files / 1019 tests.

**One qualification, so the citation is not read as more than it is.** What landed is the capability, verified mechanically. It has never been exercised: `shared/backlog/` still holds the single entry `260811-0826_*_observations.md` unchanged, and the end-to-end acceptance run in `circles/260813-0858-playmaker-maintains-backlog-store/planning/260813-1306_*` `## Testing Strategy` was deferred with step 9. `_i_` is still correct — the marker means the answer is realised on disk, not that a run has used it — but the first real maintenance run is the thing that will test whether the boundary this record argued over holds in practice.

**Late addition, 260813-1548 — a sixth surface was found while this reconciliation ran.** A
`coderev` pass over `b995049`, running concurrently with the reconciler, filed
`circles/260813-0858-playmaker-maintains-backlog-store/issues/260813-1545_o_the-next-skills-boundaries-paragraph-still-says-playmaker-writes-only-circle-records-and-the-portfolio.md`:
`skills/next/SKILL.md:291` still enumerates the playmaker's writes as "only Circle records and the
portfolio", in a paragraph the same commit edited. **This does not weaken `_i_`.** The question
this record asked — who writes `_p_` — has exactly one answer on disk, and the mechanism that
enforces it (the prompt token, the resolver key, the conventions table) is intact. What the
survivor shows is that the surface *count* in the Circle's Directive was five and the real count
was at least six, which is that Circle's acceptance problem and not this record's.
