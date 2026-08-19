# Shaper session — four constraints on a deep change

**Date:** 2026-08-19
**Agent:** shaper (anticipated-circle mode, dispatched via `/fusion:direct`)
**Status:** Complete
**HEAD at start:** `b91c01c`
**Result:** `circles/260819-1645-four-constraints-on-deep-change/_a_circle.md`

## The draft

The user's draft named four constraints that make a deep change to fusion unsafe, each already
carrying a record: no assertion that the committed `hooks/dist` is the compilation of the committed
source (decision `shared/decisions/260816-0719_*`, answered option 2, unrealised); two of the four
write tools reaching no integration case (issue
`circles/260816-1741-guard-becomes-observation-only/issues/260816-2320_*`); no prohibition on a
whole-tree git command from a parallel executor (issue `shared/issues/260819-0001_*`); and
workbench-to-workbench citations resolved by nothing (issue `shared/issues/260819-1511_*`). The
draft was raw text, not a backlog entry, so no backlog marker moved and no `Promoted:` line was
written.

## Clarifications

Four questions had been put to the user and were answered in the dispatch. Their answers, and what
each fixed:

1. **Repair scope.** The Circle records, `portfolio.md`, the open decisions and the open issues.
   Session histories and `archive/` stay as they are and their dead citations stay dead, accepted
   explicitly.
2. **What the second caller does on a find.** A blocking test in `npm test`, chosen in the knowledge
   that it is red against today's tree, which is why answer 1 comes first.
3. **When the orchestrator states the prohibition.** At every executor dispatch, not only a parallel
   one, accepting that it also binds a solitary executor.
4. **Whether the deletion obligation comes in.** Yes. Decision
   `circles/260801-1244-guard-rules-write/decisions/260805-1548_*` gets realised, and archiving and
   deletion get the same treatment.

## What shaping measured

All at HEAD `b91c01c`.

- **The repair is 245 items, not 18.** Running `hooks/lib/__tests__/helpers/citation-scan.ts` over
  exactly the surfaces answer 1 names gives 1711 tokens: 747 resolved, 245 dangling, 677
  undecidable, 42 exempt. The draft's eighteen was one earlier hand pass over Circle records only;
  the tool reports 81 dangling in those eleven records alone. The user's own estimate of about 250
  was right and the draft's figure was not.
- **The undecidable class cannot be repaired or gated.** 677 tokens are bare timestamps or ambiguous
  citations. `citation-scan.ts` places a bare stamp in `undecidable` whatever it resolves to, by
  design.
- **The archive filter is narrower than its own defect record says.** `skills/archive/SKILL.md`
  checks `CLAUDE.md` alone. The wider shipped-text filter naming nine roots was a session-local
  widening recorded in `archive/260817-1907-safe-cleanup-scoped/MANIFEST.md` and appears in no
  shipped text.
- **Constraint 3 has a prior instance.** `shared/issues/260810-1820_*` records an executor mutating a
  file two others held in the live tree. The 2026-08-19 case is the second of the class, not the
  first. `agents/orchestrator.md:983` already forbids `git checkout .` and `git reset --hard` for the
  orchestrator's own revert, so there is a sentence to extend rather than a mechanism to invent.
- **One growth budget is nearly spent.** `agents/*.md` has grown 14 691 bytes against 18 000 of
  head-room, leaving roughly 3 300, and constraint 3 writes into `agents/orchestrator.md`.
  `skills/*/SKILL.md` has grown 10 284 against 20 000; the hook test surface roughly 620 lines
  against 2 500.
- **The pinned toolchain constraint 1's answer requires is not obviously present.**
  `hooks/package.json` declares `typescript: ^5.6.0`, a caret range, beside a committed
  `hooks/package-lock.json`.

## Filed

One decision record, filed inside the new Circle:
`circles/260819-1645-four-constraints-on-deep-change/decisions/260819-1645_o_what-defines-the-citation-gates-corpus-and-what-happens-when-a-marker-move-changes-it.md`.
The user's two answers settle what the gate scans and not what it does when an ordinary marker move
changes the corpus under it. The same coupling is a live defect for the existing lint
(`shared/issues/260816-0725_*`), whose pin has been re-approved twice rather than decoupled, so
arming without an answer would reproduce a known failure in a second place. Three options, with a
recommendation.

No defect was filed. Everything shaping found was already recorded, apart from the two corrections
noted above, which are stated in the Circle record's Grounding snapshot rather than as new defects.

## Not done

No spec was written, which is anticipated-circle mode's shape: the Circle record is the artifact.
No Circle was activated, no `.active-circle` was written, and no planner was dispatched. Activation
is the user's separate step.
