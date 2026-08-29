# Does this Circle take the structural half of the verbosity record?

---
**Domain:** code
**Filed by:** orchestrator
**Cross-references:** `circles/260820-2051-style-rules-arrive-and-get-measured/planning/260820-2249_*_spec-style-rules-arrive-and-get-measured.md`, `circles/260820-2051-style-rules-arrive-and-get-measured/analyses/260820-2308-assessment-of-the-style-rules-spec.md`

---

## Question

`shared/issues/260812-0253_*_agents-answer-a-question-the-user-did-not-ask-and-the-length-caps-do-not-hold.md`
has two halves. The opening-sentence half is served by the capability that gives the fact-first
requirement a test. The structural half is that `rules/user-facing-output.md` prescribes relocating
material to a Details block and states no total budget for a reply, so nothing bounds the whole.

## Options

1. Take it: add a total reply budget.
2. Leave it, and record the reason.

## Answer: option 2, leave it, and correct the coverage claim with it.

A total reply budget changes what every agent's output looks like across the whole fleet. It is not one
of the Directive's four outcomes, and it would land in the same commit window as the measurement's
pre-repair baseline, which is the contamination the protocol exists to avoid.

The spec's coverage table calls this record half-resolved. That is corrected here: the record is
**deferred whole**, stays open, and carries the reason. A record counted as half-closed is a record
nobody comes back to.

## What this forecloses

Nothing. The record stays open with its severity intact.

## Who answered this, and under what authority

Answered by the orchestrator during an unattended run, with the user away and no channel to ask them.
This is not the user's answer. The record stays open (`_o_`) so the user meets it as a live question.

---
Deferred: the next style-rules Circle — user 2026-08-29, triage of open decisions left in terminal Circles; no scan reaches this store any more, so the deferral is recorded by hand.
