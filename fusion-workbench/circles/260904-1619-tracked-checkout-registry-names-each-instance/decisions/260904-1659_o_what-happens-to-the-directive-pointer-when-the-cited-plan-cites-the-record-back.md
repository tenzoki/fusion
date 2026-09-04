# What happens to the Directive pointer when the cited plan cites the record back?

---
**Domain:** code
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Cross-references:**
`rules/circle-records.md` `### The Directive is a pointer once a spec exists` (the rule and its invariant);
`agents/orchestrator.md` `## Circle head fields` (the same-command obligation, and Phase 0b step 0b.2 step 3 where it fires);
`260818-1504_*_how-does-a-circle-record-carry-its-directive-once-a-spec-exists-and-who-may-correct-it-before-one-does.md` (the binding decision the rule realises);
`260904-1651_*_the-checkout-registry-names-each-instance-and-joins-one-persons-identities.md` (the plan whose head declines to restate the Directive)

---

## Question

`rules/circle-records.md` requires that a write of `**Active spec/plan:**` off `(none yet)` replaces the record's `## Directive` body with the fixed pointer literal, in the same command. The invariant is that the record and the spec can never state two different Directives, because the second copy never comes into existence.

The rule assumes the cited file **states** the Directive. This Circle's plan does not. Its head reads `**Spec:** none; the Directive is `## Directive` of <the Circle record>, written by the shaper into the record, and it is not restated here`, and its own `## Directive` section opens `See the Circle record's ## Directive.`

Performing the swap as written would leave the record pointing at the plan and the plan pointing back at the record, and the Directive would then be stated nowhere. The orchestrator therefore wrote the field and did **not** perform the swap, and filed this record instead of choosing one of the two mechanisms by itself.

## What was measured

At `260904-1659`, in this checkout: the record's `## Directive` holds the shaper's prose in full, `**Active spec/plan:**` cites the plan, and the plan's own `## Directive` is a back-citation of five words plus a one-sentence précis. Both files are on disk and neither has been rewritten.

## Options

1. **The rule gains a precondition: the swap fires only when the cited file states the Directive.** A plan that back-cites the record leaves the record's prose standing, and the invariant is satisfied because there is still exactly one statement.
   - Pros: no duplication ever exists, which is what the invariant was for; nothing has to change in the planner; a plan is free to cite rather than restate, which is the citation discipline the rest of the project follows.
   - Cons: the swap becomes conditional on reading the cited file, so the writer of the field has to open it. The condition is decidable (the pointer literal and the back-citation both have fixed openings) but it is one more thing the writer must do.
2. **The planner restates the Directive in the plan it writes.** The swap then fires as written and the record becomes a pointer.
   - Pros: the rule stays unconditional; the plan becomes self-contained for a reader who opens it alone.
   - Cons: the Directive then exists twice at the moment the plan is written, which is the state the invariant exists to prevent, and the swap only removes the copy afterwards. A plan that is later superseded takes the sole statement of the Directive out of live text with it.
3. **The record's Directive is replaced by a pointer to whatever the field cites, unconditionally, and the planner is required to restate.** The two halves of option 2 stated as one obligation on two agents.
   - Pros: one rule, no branch.
   - Cons: it is option 2 plus a second failure mode, since a planner that forgets to restate now produces the citation loop rather than a duplicate.

## Constraints

- No option may leave the Directive stated nowhere, which is what the literal reading produced here.
- A terminal record is never edited, so no option applies to a closed Circle.
- Whatever is chosen, one party writes the field and the same command settles the Directive body, per `agents/orchestrator.md` `## Circle head fields`. The obligation riding the act is not reopened.

## Recommendation

Option 1. `inference:` The invariant is about the number of statements, not about which file holds the one that survives, and a back-citation already satisfies it. The rule's text names the condition it needs without stating it as a condition, so the change owed is to that sentence rather than to any agent's behaviour.
