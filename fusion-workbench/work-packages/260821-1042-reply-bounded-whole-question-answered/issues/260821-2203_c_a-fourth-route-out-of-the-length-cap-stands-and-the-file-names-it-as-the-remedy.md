A fourth route out of the length cap stands, and `## Questions and gates` names it as the remedy

---

`rules/user-facing-output.md:95` tells a writer whose plain-text gate is over the eight-line cap to move it into `AskUserQuestion`, "which is not line-capped this way". Nothing in `## Length` caps an `AskUserQuestion` output as a whole: `:101` caps the question stem and each option label, `:102` caps each option `description`, and no entry sums them. So the material stays on the user's screen and leaves the count, which is the exact shape of the three routes this Circle closed.

---

**Affects:** `rules/user-facing-output.md` `## Questions and gates`, `## Length`. Shipped rule text, loaded by every agent at dispatch.

**Severity:** High. It is the Circle's own premise, not a nearby defect.

**The text, as it stands after the Circle's repair.**

`rules/user-facing-output.md:95`:

> **A plain-text gate carries at most three options.** The worst case the two foreclosure clauses above permit is one line of question stem, three option lines and three foreclosure lines, seven against the cap of eight in `## Length`, so the foreclosure fits inside that cap instead of asking it to move. A gate that needs a fourth option goes through `AskUserQuestion`, **which is not line-capped this way**, or it splits into two gates.

`rules/user-facing-output.md:101-102`:

> - **`AskUserQuestion` text: ≤ 6 lines for the question stem, ≤ 4 lines per option label.**
> - **`AskUserQuestion` option `description`: ≤ 2 lines.**

`rules/user-facing-output.md:108`, the sentence step 2 rewrote:

> Every cap above is the budget for the whole output it names, trailing Details included.

**The arithmetic.** A plain-text gate is permitted eight lines. The same content routed through `AskUserQuestion` with four options is permitted 6 + 4 × (4 + 2) = **30 lines**, and the file states no total against which those 30 are counted. The user reads one output either way. Line 108's claim that every cap is "the budget for the whole output it names" is false for the two `AskUserQuestion` entries: they name parts of an output, not an output.

**Why it survived the Circle.** The plan surveyed for exactly this and stopped one clause short. `260821-1805_*_plan-reply-bounded-whole-question-answered.md:22`:

> I read `## Length`, `## Information architecture`, `## Questions and gates` and `## Sketch structure instead of narrating it` for any further exemption or relocation clause and found none: `## Questions and gates` line 105 already writes its arithmetic as a total.

Line 105 at the anchor is the bullet quoted above. Its arithmetic *is* written as a total, for the three-option plain-text case. The escape clause is the second sentence of the same bullet, and the survey did not reach it.

**It is also the second half of the record the Circle claims to close.** `260821-1805_*_plan-reply-bounded-whole-question-answered.md:185` says `260812-0253_*_agents-answer-a-question-the-user-did-not-ask-and-the-length-caps-do-not-hold.md` "is closed by steps 2, 3 and 5 together, both halves". That record's own reconciliation of 260821-0412 already observed that the `AskUserQuestion` caps are per-field. With this route standing, the second half is not closed and the closure note should not say it is.

**The neighbouring half of the same sentence.** "or it splits into two gates" has the same shape: two gates carry two eight-line budgets for one decision. It is weaker than the `AskUserQuestion` route, because splitting a decision usually does reduce what each gate carries, but the clause as written offers the split as a way to fit a cap rather than as a way to make a decision smaller.

**A fix direction, not a prescription.** The smallest repair consistent with what the Circle already did is one entry in `## Length` giving `AskUserQuestion` a whole-output total the way the session-summary entry now reads ("≤ N lines in total, ≤ M of them ..."), and a rewrite of `:95` so that the fourth option is a reason to make the decision smaller rather than a reason to change the surface. Whether the number is measured or recommended is the same question `260821-1801_*_what-total-caps-a-session-summary-now-that-no-reply-has-an-uncapped-tail.md` answered for the summary, and it is a decision record rather than a coder's judgement.

**Cross-references:** `260812-0253_*_agents-answer-a-question-the-user-did-not-ask-and-the-length-caps-do-not-hold.md`; `260821-1042-reply-bounded-whole-question-answered` `## Directive`; `260821-1801_*_what-total-caps-a-session-summary-now-that-no-reply-has-an-uncapped-tail.md`.

---
Resolved: Turn 2, `rules/user-facing-output.md`. The route is closed at both ends and no new number was invented for it.

- `## Length` now carries **one** gate entry instead of three: "Gate prompts: ≤ 8 lines in total, whatever surface renders them." The question, the option labels and the foreclosures all count against that eight, `AskUserQuestion` included, and its ≤ 6-line stem, ≤ 4-line label and ≤ 2-line `description` are restated as ceilings on one field, with the total binding where a ceiling and the total disagree. The two per-field bullets are gone as bullets, so every entry in the section again names a whole output and line 108's claim holds without an exception clause.
- `## Questions and gates` line 95 now reads "A gate carries at most three options, on whatever surface", and its closing sentence sends a fourth option back to the decision rather than to another surface: "A decision that needs a fourth option is too big for one gate: make it smaller, or split the decision itself in two." That also answers the neighbouring half this record flagged — the split is of the decision, not of the gate.
- **The eight is derived, not chosen.** The bullet's own arithmetic already computes the worst case as 1 stem + 3 option lines + 3 foreclosure lines = 7 against 8, and that arithmetic holds unchanged on `AskUserQuestion` when each `description` is one line. So no decision record was needed for a magnitude: the number is the gate cap the file already carried, applied to the surface it had exempted.
- Cost: the file stands at 20 062 bytes against the anchor `e764637`'s 20 144, 82 under. No further cut was taken and no candidate from step 5's pool was spent.

Not claimed: the plan's closure note for `260812-0253_*_agents-answer-a-question-the-user-did-not-ask-and-the-length-caps-do-not-hold.md` is not rewritten here. This step closed the fourth route; whether that record's length half may now be called closed is the orchestrator's to state.
