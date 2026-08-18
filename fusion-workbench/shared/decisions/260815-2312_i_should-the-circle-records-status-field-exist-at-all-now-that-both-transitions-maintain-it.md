# Should the Circle record's `**Status:**` field exist at all, now that both transitions maintain it?

---
**Domain:** code
**Status:** answered
**Filed by:** orchestrator
**Cross-references:** shared/issues/260802-0920_c_next-skill-activates-a-circle-without-updating-its-status-field.md (the defect this question outlived), agents/orchestrator.md `## Circle head fields`, skills/next/SKILL.md Step 6.2, rules/circle-records.md `## Circle record template`

---

## Question

The Circle record carries its state twice: as the marker on its filename (`_t_circle.md`) and as
a `**Status:**` field in its head. `rules/circle-records.md` makes the marker normative and the
field a copy. For four years of this project's short life the copy was maintained by attention
rather than by procedure, and it drifted: four of eleven Circle records disagreed with their own
filename at the last full survey, in both directions.

That defect is now fixed. Commit `282ef42` gave the field an owner at both transitions —
`skills/next/SKILL.md` Step 6.2 sets `active` in the same call as the activation rename, and
`agents/orchestrator.md` `## Circle head fields` carries a table binding every field write to the
act that moves it, closure included. The obligation rides an act instead of standing beside one,
which is this project's own answer to the class of maintenance step that gets skipped.

What that fix did not decide is whether the field should exist. `agents/orchestrator.md:293`
says so explicitly, calling the maintenance "the cheap half of a question the user has not yet
answered", and points at the defect record as the tracker. Closing that record without filing
this decision would drop the question and leave a shipped prompt citing a closed defect for an
open matter. Hence this record.

## Options

1. **Drop the field; the filename marker is the only source.** Removes the duplication rather
   than maintaining it.
   - Pros: one fact, one place. No transition can ever skip an update that does not exist. Matches
     the framework's own move from a declared key set to one derived from the prompt, and matches
     the reasoning that removed seven hand-written counters from `agentstate.yaml` on 2026-08-15.
   - Cons: a record read in isolation no longer states its own state. Requires touching the
     template, both transition sites, the two mechanical readers, and every existing record.
2. **Keep the field and keep maintaining it.** The status quo after `282ef42`.
   - Pros: costs nothing further today; the obligation is already written down and rides an act.
     A record remains self-describing when opened alone.
   - Cons: two copies of one fact, and the copy nobody reads is the one that rots. Every new
     transition point inherits an obligation it can forget, and the drift is silent — nothing
     measures the field against the marker any more, because the drift check that would have was
     removed with the counters.
3. **Keep the field but define it as decorative in the template.** The marker is normative and the
   field is explicitly not to be trusted.
   - Pros: cheapest change, one paragraph.
   - Cons: leaves a field that reads as authoritative and is not, which is the worse failure mode
     of the three — a reader cannot tell a decorative field from a stale one.

## Constraints

- Whatever is chosen must hold at **every** transition, not only activation. The measured history
  shows the closure direction failing as often as the activation direction.
- Two mechanical readers consume the record head: playmaker's `portfolio.md` rendering and the
  orchestrator's resume. Neither may be left reading a field that no longer exists.
- Option 1 is a migration over existing records as well as a text change. This project's own
  convention is that existing artifacts are not rewritten retroactively, so option 1 needs an
  explicit position on what happens to the records already carrying the field.

## Recommendation

Option 1, but not urgently. The evidence assembled in the defect record over four reconciliation
passes argues for it, and this project has twice chosen the same shape: derive rather than declare,
and delete a hand-maintained copy rather than build a check that watches it. The counter-argument
that a record should state its own state is real but weak, because the filename is right there in
any listing that shows the record at all.

Against acting now: `282ef42` has made the status quo genuinely cheap, and the field's drift is no
longer a live wound. This is a good candidate for the next Circle that touches Circle records for
another reason, rather than for a Circle of its own.

---
Answered: shared/history/260816-1500-orchestrator-session.md `## Decisions answered by the user` — option 1: drop the field, filename marker becomes the only source; timed to the next Circle that touches Circle records for another reason. User answered inline 2026-08-16.
Implemented: `shared/planning/260818-1512_*_the-circle-records-directive-becomes-a-pointer-and-gains-a-writer.md` step 6, 2026-08-18 — no commit hash is cited because the executor does not commit; the orchestrator's Phase-2 Step-3b commit for this plan carries the change. The trigger the answer named fired: that plan's steps 1, 2 and 4 touch the record template, the head-fields table and `/fusion:next` Step 6.2, which are the three sites the answer listed. `**Status:**` is gone from the template in `rules/circle-records.md`, from the head-fields table and its maintenance paragraph in `agents/orchestrator.md` (including the Phase-4 closure write), from the `awk` rewrite in `skills/next/SKILL.md` Step 6.2, and from the frontmatter fill in `agents/shaper.md`'s anticipated-circle mode. The filename marker is the only source of a Circle's state. Records written before the removal keep a field nothing writes and nothing reads; every one of the three surfaces now says to leave it alone rather than correct it.
Deferred: <set when status moves to _d_>
Superseded by: <set when status moves to _s_>
Retired: <set when the implementation is removed; the marker stays _i_>

---
**Reconciliation 260817-1836** (reconciler, domain `code`, HEAD `2552586`). Answer recorded, not yet realised — marker stays `_a_`. `rules/circle-records.md:70` still carries the `**Status:**` field in the Circle record template. The answer timed the removal to the next Circle that touches Circle records for another reason, and no such Circle has run since.
