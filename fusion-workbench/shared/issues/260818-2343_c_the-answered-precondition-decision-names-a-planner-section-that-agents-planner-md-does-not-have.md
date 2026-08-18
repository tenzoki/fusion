The answered precondition decision names a planner section that `agents/planner.md` does not have

---

`shared/decisions/260817-1613_a_does-a-plan-stated-precondition-get-any-mechanism-or-is-it-read-by-a-human-or-not-at-all.md`
was answered on 2026-08-18 with option 2. Two of its three options describe the change surface as an
amendment to an existing section: option 1 says "Amend `agents/planner.md` so `## Where this Circle
stops` says outright that its contents bind nobody mechanically", and option 2's recommendation says
"the planner's own section text says that a human at that gate is the whole of the enforcement".

There is no such section text. `## Where this Circle stops` is absent from `agents/planner.md`
entirely, and so is the word `precondition`: the plan output format at `agents/planner.md:97-146`
runs Directive, Current State, Approach, Implementation Steps, Data Structures, API Changes, Testing
Strategy, Risks & Mitigations, Open Questions, and nothing else.

Verified at HEAD `52b1d95` by `grep -in 'stops\|precondition\|boundary' agents/planner.md`, which
returns nothing, and by reading the template block.

The section exists in exactly one plan, which invented it:
`circles/260816-1741-guard-becomes-observation-only/planning/260816-1915_c_the-compliance-guard-becomes-observation-only.md:346`.
Every other occurrence in the workbench is that plan's own Circle citing it back.

---

The answer stands; its realisation is not the one the record describes, and the difference is a fork
somebody has to choose rather than a wording fix:

1. Add `## Where this Circle stops` to the planner's plan output format, then amend it as the record
   says. Makes every plan carry the section, which is what the record's prose assumes throughout.
   Adds bytes to `agents/`, whose head-room stood at 6 640 of 18 000 when this was filed.
2. Write the orchestrator's Phase 4 step to read the section only when the plan carries one, and say
   in the planner that a plan may add it. Adds nothing to the template and leaves the section
   optional, so a plan that states a precondition without using that exact heading is still unread.

Found while resolving the three open decisions of session `260818-2301`, before any realisation work
was dispatched. It has no Circle affiliation, so it is filed in the shared store under the Origin
Rule.

---
Resolved: fork 1 was chosen by the user and realised in the same session. `## Where this Circle stops`
is now part of the plan output format in `agents/planner.md`, so the section the decision's prose
assumed throughout does exist, and the paragraph beside the `**Decidability:**` one carries the
honesty clause option 1 asked for. `agents/orchestrator.md` `### Phase 4 — Portfolio sync` gained
step 2b, which reads the section aloud before the closure rename. The realisation fork and the
user's choice of it are recorded in the decision record itself.
