# Does a `scope:` key go into the two long-form writing profiles?

---
**Domain:** code
**Filed by:** orchestrator
**Cross-references:** `260820-2249_*_spec-style-rules-arrive-and-get-measured.md`, `260820-2308-assessment-of-the-style-rules-spec.md`

---

## Question

The two chat profiles carry `scope: short-form`. The two writing profiles carry no counterpart, and a
reference elsewhere points at "the long-form writing profile" with nothing in either file answering to
that name. The fix has two items: a text handle inside the profiles, and a `scope: long-form` key.

## Options

1. Both items: the text handle and the `scope:` key.
2. The text handle alone, with the key deferred.

## Answer: option 2, the text handle alone.

Verified during the assessment: `scope:` appears in exactly two files, the two chat profiles, and
nothing reads it. No consumer exists in `agents/`, `rules/`, `hooks/lib/` or `bin/`. Adding a key with
no consumer to a file every consuming project holds is a schema change bought on speculation. The text
handle alone closes the dangling reference, which is the defect actually recorded.

## What this forecloses

Nothing that matters. Capability C1 of the spec is precisely what makes a later schema change cheap to
propagate, so deferring the key costs a second pass later and no rework.

## Who answered this, and under what authority

Answered by the orchestrator during an unattended run, with the user away and no channel to ask them.
This is not the user's answer. The record stays open (`_o_`) so the user meets it as a live question.

---
Deferred: the next style-rules Circle — user 2026-08-29, triage of open decisions left in terminal Circles; no scan reaches this store any more, so the deferral is recorded by hand.
