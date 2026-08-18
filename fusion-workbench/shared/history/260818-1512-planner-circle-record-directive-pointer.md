# Planner — the Circle record's Directive becomes a pointer, and gains a writer

**Date:** 2026-08-18
**Agent:** planner (dispatched, executors `coder, ontocoder, analyst`)
**HEAD at start:** `83d3b04`
**Input:** answered decision `shared/decisions/260818-1504_*_how-does-a-circle-record-carry-its-directive-once-a-spec-exists-and-who-may-correct-it-before-one-does.md` (option 1), defect `shared/issues/260815-0752_*_no-agent-may-revise-an-active-circle-records-directive-so-a-revision-leaves-it-contradicting-the-spec.md`

## What was produced

- Plan: `shared/planning/260818-1512_o_the-circle-records-directive-becomes-a-pointer-and-gains-a-writer.md`, seven steps, all `coder`, one of them optional.
- Decision, open: `shared/decisions/260818-1512_o_does-the-shapers-third-mode-keep-the-name-portfolio-activation-once-it-also-corrects-an-active-circles-directive.md`
- Defect, open: `shared/issues/260818-1512_o_the-next-skills-activation-handoff-tells-the-orchestrator-to-read-the-circle-records-directive-and-no-orchestrator-step-does.md`
- Defect, open: `shared/issues/260818-1512_o_the-dispatch-parameter-tables-prompt-line-citations-are-resolved-by-no-gate-and-two-are-already-ten-lines-off.md`

## What the plan decided

The four questions the decision left open resolve into one invariant: the record's `## Directive`
holds prose if and only if `**Active spec/plan:**` reads the literal `(none yet)`. The pointer cites
the field rather than the path, so nothing in it can go stale. The pointer write rides every write of
that field, which is three acts by two parties, so the orchestrator gains a fourth permitted content
write that substitutes a fixed literal and never authors prose. Existing records are converted on
next touch and no migration exists.

One change of mechanism was needed. Mode 3 always produces a spec today, so under the invariant it
could never write prose and the decision's writer half would be unreachable. Deciding inside the
shaper whether an edit is a correction or a re-shaping is not decidable from what the shaper holds,
and the only material for the guess is the free text of `**Initiated by:**`, which is the shape of
the deleted branch-switch guard. The fork therefore moves onto the dispatch as `**Scope:**
directive-only | spec`.

## Measured rather than assumed

- `rules/circle-records.md` is emitted inside the `IS_CIRCLE_AGENT` conditional at
  `bin/fusion-rules:432`, so it sits in the role-specific extras that
  `hooks/lib/__tests__/rules-emission-golden.test.ts` reports on and never fails. It is not in the
  always-on set. Verified rather than taken from the dispatch.
- Growth head-room at HEAD `83d3b04`: `agents/` 12 255 bytes remaining of 18 000, `skills/` 10 515
  of 20 000, the always-on rule core 4 534 of 12 000.
- `rules/fusion-workbench-conventions.md` needs no change. Its `## Circle records` section points at
  `rules/circle-records.md` and carries no competing template. Checked rather than assumed, which
  matters because that file is inside the one bound with 4 534 bytes left.
- Readers of the record's `## Directive`: the playmaker reads the `# ` title line and not the
  section (`agents/playmaker.md:86`); `/fusion:direct` reads a record its own run just created,
  where no spec can exist; the orchestrator's Coherence gate resolves the Directive from plan, spec
  and history line and never from the record. The blast radius is smaller than the section's
  prominence suggests.
- Eleven Circle records in this workbench, every one terminal. The migration set is empty here and
  is at most one record in any project.
- Answered decision `260815-2312` (drop the `**Status:**` field) timed itself to "the next Circle
  that touches Circle records for another reason". This plan is that Circle, so the realisation is
  offered as an optional step 6 and put to the user at the gate rather than folded in silently.

## Not done

No implementation. The plan stops at the gate; execution is the user's call.
