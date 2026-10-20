Reviewer CLAUDE.md drift findings always route to a text fix, never to placement
---
`agents/reviewer.md` looks for out-of-sync documentation; a finding that CLAUDE.md disagrees with the tree is filed for code-implementer and fixed by rewriting the claim more precisely, which lengthens it, instead of being classified as a placement finding when the claim is a function-level tree fact.
---
**Filed by:** orchestrator (on the user's instruction), Kai Stalmann <ks@qantr.com>

krk: 21 review-fix commits added ~37 KB (21 % of growth), e.g. `fd5179ee` 'an vierundzwanzig Stellen gegen den heutigen Baum'.

Evidence: `261020-0835-why-a-consumers-claude-md-grows-unchecked.md`

**Acceptance:** The reviewer prompt distinguishes a CLAUDE.md drift finding on a function-level fact as a placement finding with a route that relocates, and a test or fixture shows the classification.

---
Resolved: `agents/reviewer.md` `## Code review standards` item 9 now classifies a drifted CLAUDE.md fact on one file or function as a placement finding: moved to the destination `rules/fusion-workbench-conventions.md` `## A project's CLAUDE.md` names, one pointer line left, the issue naming the destination (a source header is code-implementer's, else the user's curate run). Departure, accepted by the user at plan approval: the "test or fixture shows the classification" half is declined, because such a test only pins the clause's presence (decision `260810-0710_*_should-a-rule-be-allowed-to-land-without-the-check-that-enforces-it.md`); the behaviour is checked at the next review that meets such a finding. Plan step 3 of `261020-0927-plan-consumer-claude-md-stays-lean.md`.
