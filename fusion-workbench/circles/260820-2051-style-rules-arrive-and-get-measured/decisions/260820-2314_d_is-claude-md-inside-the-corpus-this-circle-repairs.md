# Is `CLAUDE.md` inside the corpus this Circle repairs?

---
**Domain:** code
**Filed by:** orchestrator
**Cross-references:** `circles/260820-2051-style-rules-arrive-and-get-measured/planning/260820-2249_*_spec-style-rules-arrive-and-get-measured.md`, `circles/260820-2051-style-rules-arrive-and-get-measured/analyses/260820-2308-assessment-of-the-style-rules-spec.md`

---

## Question

The spec repairs the six files `bin/fusion-rules` emits and excludes `CLAUDE.md` on the ground that no
helper emits it. `CLAUDE.md` is nonetheless loaded into every agent's context as project instructions,
and it carries 125 em-dashes over 9 155 words, a rate of 13.7 per 1000. Measured independently at HEAD
`a5b73da`. It is about 41 per cent of the always-on prose an agent actually holds, and it is under no
growth bound.

Two things turn on this. The repair's premise is that a model follows the register of its conditioning
text, and the excluded file is nearly half of that text. And a live record,
`shared/issues/260816-1345_*_the-register-defects-corpus-table-is-labelled-always-on-and-is-not-the-always-on-set.md`,
states its fix direction as a derivation that **includes** `CLAUDE.md`.

## Options

1. Repair `CLAUDE.md` in this Circle along with the six emitted files.
2. Exclude it entirely, as the spec does.
3. **Name it as a member of the always-on prose in the corrected set statement, and do not repair its
   prose in this Circle.**

## Answer: option 3.

The two poles each fail on something. Excluding it entirely leaves the corrected set statement
contradicting the record it claims to close, because that record asks for `CLAUDE.md` to be **in the
stated set**. Repairing it here is the largest and riskiest single edit in the Circle, against a file
that governs every session, and the first repunctuation pass in this project is on record for
introducing new defects while repairing old ones.

Reading the record precisely dissolves the conflict: it asks for the **set statement** to include
`CLAUDE.md`, not for `CLAUDE.md` to be repunctuated. Option 3 gives it exactly that.

The strongest argument for repairing it now was the measurement dose. That argument is spent: the
measurement does not run in this Circle at all (see the Bounded Closure record filed alongside this
one), so the dose question belongs to the Circle that actually runs it, where the user can weigh it
with the measurement in front of them.

## What this forecloses

The measurement, whenever it runs, will report against a corpus in which the largest single conditioning
file was never repaired, and the protocol must say so. This record is the place a later Circle picks the
question back up.

## Who answered this, and under what authority

Answered by the orchestrator during an unattended run, with the user away and no channel to ask them.
This is not the user's answer. The record stays open (`_o_`) so the user meets it as a live question.

---
Deferred: the next style-rules Circle — user 2026-08-29, triage of open decisions left in terminal Circles; no scan reaches this store any more, so the deferral is recorded by hand.
