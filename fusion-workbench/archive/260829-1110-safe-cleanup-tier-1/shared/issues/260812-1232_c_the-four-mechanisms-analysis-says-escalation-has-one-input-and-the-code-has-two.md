The four-mechanisms analysis says escalation has one input and the code has two

---
`shared/analyses/260812-0251-four-mechanisms-purpose-bindingness-and-cost.md:190` states: "Escalation is
driven only by the protected-path machinery: three consecutive blocks raise a halt
(`hooks/config.json:27`), and only a human clears it."

That is true of what has happened and false of what the code permits. `hooks/guard.ts` has a second
`recordBlock` call site, CHECK 3 at `:604-649`, which blocks on a decision-governed path at `high`
sensitivity and feeds the same counter with the trigger `decision_governed`. A project that declares
`decisions`, `guard.categoryPaths` and `guard.categorySensitivity` in its own `fusion-guard.json`
reaches a halt without a protected path being involved.

---
**Witness:** planner, reading `hooks/guard.ts` while planning the protected-path removal
**Severity:** medium — the claim is load-bearing for a decision now being taken
**Affected:** `shared/analyses/260812-0251-four-mechanisms-purpose-bindingness-and-cost.md:190`
**Cross-references:**
`shared/planning/260812-1232_o_remove-the-protected-path-half-of-the-compliance-guard.md` (its
`**Decidability:**` line and its "Current State" section carry the corrected statement),
`shared/decisions/260812-1232_o_does-the-escalation-counter-survive-a-block-source-that-ships-inert.md`

## Why it matters here rather than as a note

The sentence is the premise of that analysis's "Escalation: keep, unchanged" verdict, and it is now
the premise of a live decision about whether the escalation counter survives the protected-path
removal. Read as written, it says the removal orphans escalation outright. Read against the code, it
says the removal leaves escalation with one input that ships inert in every layer and that no project
has ever configured. Those are different conclusions and they lead to different next steps.

The empirical half of the claim is sound and worth keeping. In `krk`'s 37,186-event log all 50
`guard_block` rows carry the detail `Protected path`, all fall between 2 and 7 August, and there is no
`guard_halt` row at all. No `decision_governed` block has ever been recorded in either project.

## Suggested correction

Replace "driven only by the protected-path machinery" with the two-part statement: escalation has two
code-level inputs, the protected-path deny and the decision-governed deny, and only the first has ever
supplied it, because the second's three configuration keys ship empty in the plugin layer and in
`DEFAULTS` and are declared by no consuming project.

## Scope note

This is a correction to one sentence in an analysis. It does not reopen that analysis's verdicts on
churn, the domain parameter, the self-bookkeeping family, or the shell blocks in the orchestrator
prompt.

---
Resolved: Moot: there is no escalation left for the analysis to have miscounted. The counter, the halt, the consecutive-block counter, `hooks/lib/escalation.ts` and the decision-governed CHECK 3 that fed it were all deleted on 2026-08-16 in `2f624ca` and `9c79202`; `escalation` is now a retired top-level configuration key that fusion reports and never reads (`fusion.json` `_retired`, `hooks/lib/config.ts` `RETIRED_TOP_LEVEL_KEYS`). The analysis it corrects is a historical document and stays as written. Closed by reconciliation pass 260817-1836 at HEAD `2552586`.
