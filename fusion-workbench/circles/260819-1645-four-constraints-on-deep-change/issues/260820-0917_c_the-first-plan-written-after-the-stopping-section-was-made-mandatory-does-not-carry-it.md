The first plan written after the stopping section was made mandatory does not carry it

---

`agents/planner.md:131` has carried `## Where this Circle stops` in the plan output format since
`b200902`, and `:160` has declared it **mandatory** since `06ab15b`: *"is mandatory and is never left
as the angle-bracket placeholder, the same standing `**Decidability:**` has"*.

This Circle's plan was written in `b6869aa`, after both, and has no such section. Its sections run
Directive, Current State, Approach, Implementation Steps, Data Structures, API Changes, Testing
Strategy, Risks & Mitigations, Open Questions, Notes on executor routing, Reconciliation Log.

---

**The consequence arrived immediately and on this Circle.** Phase 4 step 2b — added by this same
range at `ad7ffed`, and the reason the section was made mandatory at all — reads the section back to
the user clause by clause before the Circle closes. On the first Circle to reach that step, and the
one that built it, the step takes its no-such-section branch and asks nothing. The gate is correct;
there is simply nothing to read.

**This is the residual the fixing step named rather than a new discovery.** When it made the section
mandatory it wrote that the declaration is unenforced normative text — nothing parses the section by
design — so it *reduces the incidence* of an unfilled section and cannot eliminate it. That is exactly
what happened, at the first opportunity, in the same range that wrote the sentence.

**Why the case is worth more than its size.** The failure mode of a mandatory-but-unparsed section is
not a wrong section; it is an absent one, and an absent section is invisible at exactly the moment the
plan is approved. A stub would have shown as a stub at the plan gate. Nothing distinguishes "this plan
states no stopping conditions" from "this plan has no stopping conditions to state" except reading the
format and noticing an absence, which is the thing humans are worst at.

**Three fix directions, none chosen here:**

1. **A gate over the plan format** — assert that a plan in a Circle's planning store carries the
   section. Cheap and mechanical, decides a question that *is* decidable from the text, and this
   repository has just built two gates of that shape. It checks presence, not substance: a plan can
   satisfy it with one empty clause.
2. **The orchestrator asks at the plan-approval gate** rather than at Phase 4, since it already puts
   the plan to the user there and an absent section is cheapest to fix before any work starts.
   Consistent with the "put the question where somebody looks" pattern, and it is an obligation on a
   prompt again, which is the class that just failed.
3. **Nothing** — accept that the section is advisory in practice and stop calling it mandatory, so the
   word means what it does. Honest, and it removes the only stated enforcement the answering decision
   `260817-1613` has.

**Not filed as a defect against the planner run.** The planner had the instruction and did not follow
it; whether that is a prompt defect, a dispatch defect (the orchestrator's planner dispatch did not
name the section either) or an unavoidable property of unenforced text is the question the three
directions above split on.

Filed by the orchestrator at this Circle's Phase 4, on meeting the branch. It arose from this Circle's
own Directive, so it stays in its store under the Origin Rule.

---
Resolved: fix direction 1, chosen by the user: `hooks/lib/__tests__/plan-stopping-section-lint.test.ts` asserts that a live plan carries the section, judging presence — absent, empty, placeholder — and never substance. That distinction is written into the test's own header, because it is what separates this gate from the two mechanisms this repository deleted for deciding an undecidable question from text.

**This plan is deliberately not retrofitted.** Writing stopping conditions into a plan after its work is finished is a fiction, and the Circle's Phase-4 step therefore had nothing to read on the very Circle that built it. That is recorded in the closure note rather than papered over. The gate's live corpus is also empty today, so its corpus assertion passes vacuously and the mechanism is pinned over synthetic documents instead — a trap set for the next plan, and it says so in its own header.
