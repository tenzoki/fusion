# Should the shaper's mode 3 require the audit line on every run, instead of testing whether it was dispatched?

---
**Domain:** code
**Status:** open
**Filed by:** orchestrator
**Cross-references:** `260813-0027_*_should-the-orchestrator-be-able-to-dispatch-the-shapers-portfolio-activation-mode.md` (the decision this discriminator was built to serve); `260814-1850_*_the-halt-that-guards-the-audit-trail-rests-on-a-self-test-the-inheritance-model-denies.md` (the defect record, with the reviewer's evidence); `260814-1910-coder-turn-5-four-review-findings.md` (the two probes)

---

## Question

`agents/shaper.md:55` makes the `**Initiated by:**` audit line required on a dispatched run and
optional on a top-level one, and tells the two apart with a self-test: *if you hold
`AskUserQuestion` you are top-level; if you do not, you were dispatched.* That line is the only
evidence inside a mode-3 run that a user chose it rather than an agent deciding to, and a missing
line halts the run.

**The self-test is unsound, and this is measured rather than argued.** Two headless probes on Claude
Code 2.1.232 returned `PARENT_HAS_ASKUSERQUESTION=no`, `CHILD_HAS_ASKUSERQUESTION=no` and
`TOPLEVEL_SHAPER_HAS_ASKUSERQUESTION=no`. A top-level `--agent fusion:shaper` run holds no
`AskUserQuestion` either, so the second half of the test — "if you do not hold it you were
dispatched" — is false on a case that occurs. The test conflates *can I reach the user* with *did a
user start this run*, and those are different questions.

**One direction is settled and the other is not, and the unsettled one is the dangerous one.** Both
probes ran headless, where the top level holds no `AskUserQuestion` at all, so the child's `no` is
fully explained by the parent's `no` and says nothing about inheritance from an *interactive*
parent. `README-agents.md:97` and `CLAUDE.md:28` both state that a sub-agent gets the parent's tool
set, and the orchestrator's allowlist holds `AskUserQuestion`. If that statement is right in the
interactive case, a dispatched shaper concludes "top-level", waives the line, and edits a Circle
record with no audit trail — silently, in exactly the case the line exists for.

What is exposed today is the safe failure: a top-level headless run misreads itself as dispatched
and halts noisily. The silent direction remains unmeasured.

## Options

1. **Require `**Initiated by:**` on every mode-3 run and delete the self-test.**
   - Pros: no discriminator to be wrong. `agents/shaper.md:47` already has the top-level user
     invoking mode 3 "with the mode contract", so that user is already typing `**Mode:**` and
     `**Circle file:**`; this is one more line. The audit trail then exists on every run rather than
     on the runs a test believed were dispatched. It removes a dependency on undocumented harness
     behaviour, which is the class of thing this project has been burned by before.
   - Cons: a contract change. Every top-level caller has to be told, and a user who invokes mode 3
     from memory now halts until they add the line. The line's content is also stranger for a
     top-level run — the user quoting themselves.

2. **Keep the two-case rule and find a discriminator that rests on something observable.**
   - Pros: keeps the top-level invocation as cheap as it is now.
   - Cons: nobody has named such an input. The candidates are all the same shape as the one being
     replaced — an inference from the harness's behaviour rather than a fact the run holds — and
     each would need the interactive-parent measurement that this record could not obtain.

3. **Settle the inheritance question first, then decide.**
   - Pros: the choice between 1 and 2 partly turns on whether the silent direction is real. A
     controlled interactive dispatch would answer it.
   - Cons: it is a measurement no session has yet been able to make from inside itself, and the
     defect stands meanwhile. It also may not change the answer: option 1 is sound whichever way
     the inheritance question falls, because it removes the test rather than fixing it.

## Constraints

- Whatever is chosen must keep the audit line's purpose intact: a mode-3 run that edits a Circle
  record's `## Directive` or `## Grounding snapshot` leaves evidence of who initiated it. Decision
  `260813-0027_*_should-the-orchestrator-be-able-to-dispatch-the-shapers-portfolio-activation-mode.md` rests the orchestrator's whole permission on that evidence.
- A change to the contract touches `agents/shaper.md` and the roster in `README-agents.md` together.
  The Turn-5 finding that produced this record was exactly a roster left behind by a prompt change.
- Do not resolve this by weakening the halt. A halt that warns instead of stopping restores the
  silent failure this record is about.

## Recommendation

Option 1. It is the only one that does not depend on an unmeasured fact: deleting the test removes
the failure mode in both directions at once, where fixing the test requires first knowing which
direction it fails in. The cost is one line on an invocation that already carries two, and the
`agents/coder.md` run that measured the unsoundness reached the same conclusion independently. The
reason it is filed here rather than done is that it changes a contract, and contracts are the user's
to change.

---

**Reconciliation 260819-1453 (reconciler, Domain `code`, Circle-store pass) — STAYS `_o_`. Searched for an answer and found none; the question's subject is byte-unchanged.**

**Searched, in this order, and named so the next pass need not repeat it:** every `*.md` under `$SCAN_DECISIONS` (this Circle's store and `shared/`), `$SCAN_PLANS`, `$SCAN_ANALYSES`, and the session histories of the four sessions since this record was filed. No recorded answer, no deferral, no superseding record.

**The subject stands.** `agents/shaper.md:66` still carries the self-test verbatim — *"if you hold `AskUserQuestion` you are running top-level … if you do not hold it you were dispatched"* — and both statements it contradicts still stand, `README-agents.md:97` and `CLAUDE.md:28`. Nothing has measured the interactive-parent direction, which is the one the record calls dangerous, and no session can measure it from inside itself.

**Two things have changed around it, and both strengthen option 1 rather than weakening it.**

1. The record's recommendation rests on removing a dependency on undocumented harness behaviour. Since it was filed, this project has removed eight mechanisms for the related reason that they rested on inferences rather than facts — the write-path classifier, the git branch policy, the protected-path measurement. The self-test is the same shape at prompt level.
2. Mode 3's contract has since gained a fourth parameter line (`**Scope:** directive-only | spec`, `agents/shaper.md:51`) whose own text says the run *cannot* decide it from what it holds and the dispatcher must state it. That is option 1's argument, already applied once to this same prompt, one parameter over.

**What this record blocks.** Three open defects in this Circle name it as their closing condition or their carrier: `260814-1850_*_the-halt-that-guards-the-audit-trail-rests-on-a-self-test-the-inheritance-model-denies` (explicitly — "answering that decision is what closes this"), `260814-2022_*_initiated-by-carries-quoted-user-dialogue-and-no-surface-bounds-it-to-one-line`, and `260814-2017_*_the-newest-decision-record-carries-no-answered-implemented-footer-block…`, whose subject is this file. It is the highest-leverage unanswered question in this Circle's store.

---
Answered: option 1 — `**Initiated by:**` is required on every mode-3 run and the self-test is deleted. Answered by the user 2026-08-20.

The self-test's second half is measured false: two headless probes on Claude Code 2.1.232 showed a top-level `--agent fusion:shaper` run holds no `AskUserQuestion` either, so "if you do not hold it you were dispatched" does not distinguish the two cases. A rule that halts a run on a missing line cannot rest on a test that cannot tell which case it is in.

Requiring the line unconditionally costs one sentence in a prompt and removes the discrimination entirely. What it does not do is make the line trustworthy — an audit line is written by the party being audited, and that residual belongs in the prompt beside the requirement rather than in this record alone.

---
Implemented: 30d6f0a — `agents/shaper.md` requires `**Initiated by:**` on every mode-3 run and the self-test is deleted. The residual is carried into the prompt beside the requirement rather than left in this record alone: requiring the line removes the false discrimination but does not make the line trustworthy, because an audit line is written by the party being audited.

Two other surfaces believed the two-case rule and were repaired: `agents/orchestrator.md`, which said a dispatched shaper halts without the line, and the `README-agents.md` dispatch row, which carried the rule and named the self-test. +469 bytes on `agents/`, the tightest surface, leaving 2 259.

Five prompts still tell a top-level run it holds `AskUserQuestion`, which the same probes measured false for a headless run. They are **not** repaired here and are filed as `shared/issues/260820-1755_*_five-agent-prompts-tell-a-top-level-run-it-holds-askuserquestion-*`: that sentence is about the clarification channel rather than the audit line, and correcting it needs the interactive-parent measurement this record's option 3 names and nobody has taken.

Deferred:
Superseded by:
Retired:
