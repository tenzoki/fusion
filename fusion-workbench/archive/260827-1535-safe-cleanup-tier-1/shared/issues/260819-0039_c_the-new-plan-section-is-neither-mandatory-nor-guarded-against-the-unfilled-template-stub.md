`## Where this Circle stops` is neither declared mandatory nor guarded against the unfilled stub

---

`b200902` added `## Where this Circle stops` to the plan output format and a Phase-4 step that reads
it back. The section carries none of the two properties its sibling `**Decidability:**` carries, and
the reading step's case split has a hole where the template stub falls.

---

**1. The section is not declared mandatory or non-empty.** `agents/planner.md:157` says of the
neighbouring line:

> (The **Decidability** line is mandatory and is never left empty. …)

`agents/planner.md:160`, the paragraph added for the new section, says what does *not* read it and
how to write clauses, and never says the section must be filled. A planner that leaves the
angle-bracket placeholder at `agents/planner.md:133` in place violates nothing:

> `<The conditions under which this Circle is finished, and any precondition a later act — a release,`
> `a tag, a closure — must satisfy first. One clause per condition, each answerable yes or no.>`

**2. The Phase-4 step has no branch for that case.** `agents/orchestrator.md:865`:

> If no plan is in scope, or the plan carries no such section, do nothing and go to step 3 — no
> question is put to the user. Otherwise read the section's clauses aloud, one at a time, and ask
> whether each holds.

Three cases, and the fourth is unrouted: section present, holding only the unfilled placeholder. It
is not "no such section", so the step falls to *Otherwise* and reads the template's own instruction
text aloud as a clause, asking a user whether an angle-bracket sentence holds. That is a MECE gap in
the sense `rules/critical-stance.md` §4 makes a defect of the same kind as a wrong result — and it
sits in the step whose stated purpose is to put a question where somebody looks.

**3. The failure mode is measured in this project, not hypothetical.** The defect closed in the same
range as this change,
`260811-2146_*_half-the-decision-records-carry-a-status-that-disagrees-with-their-marker-and-twelve-keep-the-unfilled-template-stub.md`,
is titled for exactly it: twelve records kept the unfilled template stub. A template field with no
mandatory clause and no consumer that notices an empty one is the construction that produced those
twelve.

**4. A related scope question the section does not answer.** The heading says "this Circle", and the
plan output format is used for every plan, including plans written with no Circle active into
`shared/planning/`. Neither the section nor the paragraph beside it says what to write there. This is
smaller than the stub hole and can ride the same fix.

Verified at HEAD `b54ace5` by reading `agents/planner.md:97-165` and `agents/orchestrator.md:855-872`
in full.

**Fix direction.** One clause in `agents/planner.md` stating that the section is mandatory and never
left as the placeholder, matching the `**Decidability:**` wording; and one clause in Phase-4 step 2b
folding "carries only the unfilled placeholder" into the existing do-nothing branch, so the three
routed cases become four and tile. Do not build a parser — the decision `260817-1613` forecloses
that, and a placeholder test is a substring check, not an interpretation of the clauses.

Found in the coderev pass over `52b1d95..b54ace5`, session `260818-2301-orchestrator-session.md`. No Circle active, so it is
filed in the shared store under the Origin Rule.

---
Resolved: Both halves, and they are not equal. The fix is in `agents/orchestrator.md`: Phase 4 step 2b's case split now tiles at four, adding "the section is empty or still holds only its angle-bracket placeholder" to the do-nothing branch, so a stub is never read aloud as a clause. Recognising a stub is a look at the text, not a parse. The `agents/planner.md` declaration that the section is mandatory is unenforced normative text and cannot eliminate a stub; it earns its place by keeping the section from being silently optional, which is what it would have been if a stub and an absent section were treated alike. Same enforcement model as `**Decidability:**`: a human, at the one moment it is actionable.
