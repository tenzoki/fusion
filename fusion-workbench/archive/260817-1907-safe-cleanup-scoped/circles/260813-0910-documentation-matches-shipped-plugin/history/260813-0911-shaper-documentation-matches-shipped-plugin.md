# Shaper session: the documentation Circle for v8.1.0

**Date:** 2026-08-13 09:11
**Agent:** shaper (anticipated-circle mode)
**Status:** Complete
**Produced:** `circles/260813-0910-documentation-matches-shipped-plugin/_a_circle.md`

## The draft

The user dispatched a draft Directive: bring fusion's own user-facing documentation back
into agreement with the plugin at v8.1.0, over the bounded set of defects the survey
established, explicitly framed as a correction against a known list rather than a
documentation rewrite. Domain `code`. The draft was raw text, not a backlog entry, so no
backlog entry was promoted or closed by this run.

## What was read

- `shared/analyses/260813-0828-documentation-staleness-survey.md` — fifteen findings, four
  work groups, three clean leads, and the survey's own `## What I did not check` list.
- `shared/issues/260813-0825_*_the-v8-1-0-documentation-step-reached-three-files-and-the-feature-reached-seven-surfaces.md`
  — acceptance conditions and the `## Withdrawn claim` section.
- `shared/analyses/260813-0831-the-seam-between-a-measured-answer-and-a-cited-one.md`
  (verdict and question sections).
- `circles/260813-0858-playmaker-maintains-backlog-store/_a_circle.md` — the dependency
  Circle, including its own `## Dependencies` note asking for this Circle's directory name.
- `shared/decisions/260813-0826_*_should-fusion-help-become-a-self-knowledge-skill-that-answers-from-the-live-installation.md`
  (head and options 1).

Measured directly in this session, for the Directive's deferred-passage list and the
dispatch-parameter paragraph: `grep -n` for `playmaker` and `backlog` across
`README-agents.md`, `CLAUDE.md`, `docs/working-model.md`, `docs/philosophy.md` and
`skills/help/SKILL.md`; the section line ranges of `docs/working-model.md`; the parameter
declarations in `agents/*.md`; and the `describe` blocks of
`hooks/lib/__tests__/derivable-enumerations-lint.test.ts`.

## Clarifications resolved

Round 1 was answered by the user before this dispatch. Four decisions, all folded into the
Directive or the Grounding snapshot:

1. **Open all twelve unverified `README-agents.md` rows** against their agent prompts,
   rather than fixing only the five known defects. The evidence for the expensive option is
   that the one row checked incidentally, `coderev`, was already wrong.
2. **The `bin/` roster goes into `derivable-enumerations-lint.test.ts`; the tracked-file
   count at `CLAUDE.md:51` is deleted outright** rather than corrected or gated. The record
   states that deleting a claim is a legitimate fix, so the next reader does not restore it
   with a fresh number.
3. **Interleave with the playmaker Circle** rather than queueing behind it. The Directive
   names the four deferred passages by file, section and line, and states the uniform test
   that separates them: a sentence saying the store exists proceeds, a sentence saying what
   the playmaker does to an entry waits.
4. **Bounded check of `docs/plane-setup.md`** — command forms and configuration fields
   verified against `bin/fusion-plane`, troubleshooting prose left unverified and said to be
   left unverified in the record.

Two further items were folded in without a second round, per the dispatch:

- **The dispatch-parameter table.** Judged part of the `README-agents.md` work rather than a
  separate record, since the Circle opens all sixteen prompts anyway and the roster falls
  out of that pass. The Grounding records both the survey's count and this session's grep,
  and instructs that neither be carried forward as fact.
- **The method constraint from the withdrawn claim.** A documentation defect is confirmed by
  reading both sides, never by a match count. Recorded in the Grounding as a working rule
  for the whole Circle, with the withdrawn claim as the worked case.

No decision was deferred, so no decision record was filed by this run.

## Dependencies recorded

Two, as instructed. The playmaker Circle as an interleaved ordering relationship, and the
`/fusion:help` self-knowledge decision as a cited relationship that is not waited on.

## Not done

The planner was not dispatched. No spec was written: in anticipated-circle mode the Circle
record is the artifact. Activation is the user's separate step via `/fusion:next`.
