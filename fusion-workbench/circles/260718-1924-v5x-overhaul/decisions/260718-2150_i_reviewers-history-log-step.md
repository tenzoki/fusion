# Decision: should the three reviewers carry a session-history-log step?

**Status:** _i_ (implemented — reviewer edits realising the ruling landed in Circle D, session 260718-2110-orchestrator-session.md)
**Date:** 2026-07-18 21:50
**Circle:** `260718-1924-v5x-overhaul`
**Raised by:** planner (Circle D per-Circle planning pass)
**Rubric dimension:** R5 (Output-Style correctness) — the history-log step must resolve to a *decided* state, not stay ambiguous.
**Corresponds to:** Finding F5 in `260718-1929-agent-coordination-analysis.md`.

## The question

Twelve of the fifteen agents name `$OUT_HISTORY` as a Process step and write a
session-history entry. Three do not: **coderev, ontorev, conceptrev** — the
reviewers. Circle D must not leave this undecided (R5). Two options:

- **Unify** — add a history-log step to the three reviewers so all agents log.
- **Document the exception** — state explicitly in each reviewer prompt that it
  writes *no* separate history entry because its review/verdict file already is
  its durable session record.

## Recommendation (planner): document the exception

Reasoning:

1. **The reviewers already own a durable per-session artifact.** coderev/ontorev
   write a consolidated review to `$OUT_REVIEW`; conceptrev writes a verdict file
   to `$OUT_REVIEW`. Those files *are* the record of what the session did. The
   other twelve agents have no such standing artifact, so their history entry is
   their only durable trace — the asymmetry is principled, not accidental.
2. **Adding a history step would create two records of one session** for the
   reviewers (a review file plus a near-duplicate history line). That is the
   duplication smell `critical-stance.md` §2 warns against — a point-patch for
   uniformity's sake that adds a second source of truth.
3. **Lower churn.** Documenting the exception is one sentence per prompt inside
   the existing Process/Review-Process section; unifying adds a new numbered step
   plus its wiring to each of three prompts.

The counter-argument (uniformity aids the resume/reconcile flow, which reads
history entries) is real but weak here: a reviewer's output is topic-scoped and
already discoverable under `$SCAN_REVIEWS`, which reconciler and resume-logic
already skim.

## What each outcome means for Circle D's edits

- **Document the exception (recommended):** coderev, ontorev, conceptrev each get
  a one-line sentence in their Process/Review-Process section — e.g. *"You write
  no separate session-history entry; your review file under `$OUT_REVIEW` is your
  durable session record."* R5 then passes for all three.
- **Unify:** coderev, ontorev, conceptrev each get a new `$OUT_HISTORY` Process
  step mirroring the twelve. Larger edit; two records per reviewer session.

This decision gates the R5 cells for coderev, ontorev, and conceptrev in the
Circle-D plan. If it is still open when those bundles execute, those specific R5
edits defer (`defer-with-reason`) until the user rules.

---
Answered: user ruling at the Circle D plan gate (session 260718-2110-orchestrator-session.md), option "document the exception". Each reviewer prompt (coderev, ontorev, conceptrev) gets a one-line sentence stating it writes no separate session-history entry because its `$OUT_REVIEW` file is its durable record. Realises in Circle D Bundles 1 and 2 (R5 cells). See plan `260718-2150_*_plan-circle-d-agent-prompt-revision.md` §"The F5 decision".

---
Implemented: 2026-07-19 (reconciliation, session 260718-2110-orchestrator-session.md). The "document the exception" sentence landed on disk in all three reviewers:
- `agents/coderev.md:69` and `agents/ontorev.md:62` — commit `ee65560` (Circle D Bundle 1).
- `agents/conceptrev.md:32` — commit `f55eb7a` (Circle D Bundle 2).
Each reads "You write no separate session-history entry … a history log would only duplicate it." Marker transitioned `_a_`→`_i_`. Verified against the live tree, not the plan header.
