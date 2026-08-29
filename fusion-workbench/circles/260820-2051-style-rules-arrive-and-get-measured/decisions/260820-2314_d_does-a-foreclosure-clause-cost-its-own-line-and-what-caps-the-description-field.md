# Does a foreclosure clause cost its own line, and what caps the `description` field?

---
**Domain:** code
**Filed by:** orchestrator
**Cross-references:** `circles/260820-2051-style-rules-arrive-and-get-measured/planning/260820-2249_*_spec-style-rules-arrive-and-get-measured.md`, `circles/260820-2051-style-rules-arrive-and-get-measured/analyses/260820-2308-assessment-of-the-style-rules-spec.md`

---

## Question

`rules/user-facing-output.md` requires every gate option to state what choosing it forecloses, and
two sections later caps a gate prompt at 8 lines and forbids relaxing the cap. Whether the two
conflict depends on what a foreclosure costs, which no surface says.

## Options

1. **(a)** The foreclosure appends to the option's own line, so it costs nothing and the 8-line cap
   stands unchanged. The shaper's recommendation.
2. **(b)** It takes its own line, so a four-option plain-text gate needs 9 lines and something must
   give.
3. **(c)** Plain-text gates carry at most three options.

## Answer: (b) together with (c), plus a 2-line cap on the `AskUserQuestion` `description` field.

The deciding evidence is what the user was shown when they approved the clause. The curator run file
`shared/history/260816-1251-curator-run.md` records the cost presented as "roughly one line per
option", which is reading (b). The shaper acknowledged this and recommended (a) anyway. An orchestrator
answering in the user's absence may not reverse the basis on which the user's own approval was given.

With (c), the arithmetic closes without relaxing anything: one line of question stem, three option
lines, three foreclosure lines, seven against a cap of eight. Option (a) satisfies a line cap by making
lines longer, which defeats what the cap is for.

## What this forecloses

Four-option plain-text gates. Such a gate goes through `AskUserQuestion`, which is not line-capped the
same way, or it is split into two gates. The 2-line `description` cap is a free choice with no evidence
either way and is the piece of this record most safely overruled.

## Who answered this, and under what authority

The user asked for an unattended run and left for two to three hours. A dispatched shaper holds no
`AskUserQuestion`, so its questions came back to the orchestrator instead of to the user. The
orchestrator answered. This is not the user's answer and must not be read as one. The record is filed
open (`_o_`) rather than answered so that the user meets it as a live question and can overrule it
without unpicking the work that assumed it.

---
Deferred: the next style-rules Circle — user 2026-08-29, triage of open decisions left in terminal Circles; no scan reaches this store any more, so the deferral is recorded by hand.
