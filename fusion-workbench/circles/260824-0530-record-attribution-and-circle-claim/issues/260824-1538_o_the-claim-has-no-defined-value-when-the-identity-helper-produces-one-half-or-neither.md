The claim has no defined value when the identity helper produces one half or neither
---
`rules/circle-records.md:187` fixes the claim's form as `Claimed YYMMDD-HHMM: <person>, checkout <id>.` and `agents/orchestrator.md:286` says both halves come from `bin/fusion-identity`. Three of that helper's six exits print one line or none — 3, 4 and 5 — and exit 4 is a configuration fusion supports on purpose. No shipped text says what the activator writes then, so the case split for the claim is incomplete where the split for `**Filed by:**` is not.
---
**Filed by:** coderev, Kai Stalmann <ks@qantr.com>

Found reviewing `e209011..0f5889e`, the C3 Circle's full range.

`rules/fusion-workbench-conventions.md:496` handles this for the person field and states the two opposite instructions explicitly: exit 1 halts and files nothing, exit 4 files with the person half absent rather than empty. Nothing does the same for the claim.

The three unhandled exits, and what each leaves the activator holding:

- **exit 4**, not a git work tree: `CHECKOUT=` alone. `bin/fusion-identity:53-58` states that fusion supports a non-git project deliberately, in shipped code, and cites the binding record for it. So this is a supported configuration in which an activation must still write something. The form has a slot for a person and there is no person.
- **exit 3**, the checkout identifier unresolved: `PERSON=` alone. `bin/fusion-identity:81-83` names three causes that reach it, one of which is a workbench the mint could not write to.
- **exit 5**, neither. Reachable from a non-git directory whose workbench is unwritable.

Filling the slot with an empty string produces `Claimed 260824-1500: , checkout 3f9a1c07.`, which is the "empty rather than absent" the person rule was written to prevent, and which no reader test in `rules/circle-records.md` `### The claim field` covers. Writing `Unclaimed` instead is silently wrong in the other direction: the Circle *is* held.

The same gap sits on the read side. `skills/next/SKILL.md:207` compares the record's claim against "this checkout's own identity from `bin/fusion-identity`". On exit 3 there is no checkout identifier to compare, and on exit 4 no person; the branch that decides between refusing and reporting a mismatch has no input. The step names the `[ -x ]` guard and stops there.

**Why this is not academic for exit 4.** The whole point of `bin/fusion-identity`'s exit-4 design, and of the decision behind it (`circles/260824-0530-record-attribution-and-circle-claim/decisions/260824-0613_*_does-a-filing-agent-halt-in-a-tree-that-is-not-a-git-work-tree-at-all.md`, option 2), is that a single user in a non-git directory keeps working. That user can activate a Circle. Today the two activation routes have nothing to write in the field.

Fix direction: state the claim's value for a partial identity in `rules/circle-records.md` `### The claim field`, beside the two literal openings, and have `agents/orchestrator.md` `## Circle head fields` and `skills/next/SKILL.md` Step 6.1 read it from there. The cheapest form that keeps the reader test intact is a third opening rather than a mutilated second one, since `rules/critical-stance.md` §4 asks for a split that is disjoint and complete and a form with a hole in it is neither. Whether a non-git project should carry a claim at all is worth deciding first: there is no transport, so there is no collision to detect.
