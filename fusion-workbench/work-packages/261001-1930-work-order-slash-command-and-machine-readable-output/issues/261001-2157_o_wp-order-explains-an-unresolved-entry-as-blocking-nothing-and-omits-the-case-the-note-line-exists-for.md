/fusion:wp-order explains an unresolved entry as blocking nothing, and omits the case the note line exists for
---
`skills/wp-order/SKILL.md` `## Step 3: render`, item 4, has the agent tell the person that an `unresolved=` entry "blocks nothing here, whether it names a finished item or nothing at all". That split has two cases and the helper has three. The missing case is an entry that names *live* work in a form the grammar does not define (for example a basename without `.md`). It is exactly the case the mandatory `note=` caveat exists for. The rendering reassures the person where the helper warns.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Cross-references:** 261001-1934_*_spec-work-order-slash-command-and-machine-readable-output.md

**Evidence.**
- `hooks/order.ts` header: `unresolved-edges=` makes `ready=` optimistic because "an entry naming live work in a form the grammar does not define blocks nothing here, and only the terminal-target dangle is genuinely no edge".
- `caveat()` in `hooks/order.ts` prints the same point verbatim in the `note=` line.
- The skill's item 4 lists only "a finished item" and "nothing at all". The third case is left out. So the per-row sentence contradicts the `note=` sentence the same skill tells the agent to repeat (`rules/critical-stance.md` §4: a case split must be complete).

**Fix direction.** Reword item 4 so that it doesn't say what the entry names. Say that it resolved to no live item and so blocks nothing *in this computation*. If it names live work in another spelling, it may be a real prerequisite: that is the `note=` caveat. Stay within the skill-body growth bound.

**Acceptance test.** Item 4 of `skills/wp-order/SKILL.md` names no closed list of what an unresolved entry can be, or names all three cases. `npm test` (in `hooks/`) stays green.
