/fusion:wp-order stops on verdict=empty and drops the unreadable rows the helper printed
---
`skills/wp-order/SKILL.md` `## Step 3: render` says: "**`verdict=empty` is a real answer and never an error.** Say there are no live work packages, and stop." `verdict=empty` means zero nodes. It does not mean zero `unreadable=` rows. A store whose only package has an unreadable `**Status:**` prints `verdict=empty` plus `unreadable=<item>`. The skill tells the agent to answer "no live work packages" and stop, so the one row that contradicts that answer is dropped.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Cross-references:** 261001-1934_*_spec-work-order-slash-command-and-machine-readable-output.md

**Evidence.**
- `hooks/lib/work-graph.ts`, the `computeWorkGraph` doc comment: the unreadable record "is named in `unreadable`, so a reader can tell 'no live items' from 'one live item this module could not read'". `verdict` is `empty` whenever `nodes.length === 0` (the `verdict` assignment near the end of `computeWorkGraph`), whatever `unreadable` holds.
- Reproduced at `df38a5dd`: a scratch workbench with one package `<item>` at `**Status:** bogus`. `bin/fusion-work-order` prints `unreadable-head=1`, `verdict=empty`, `unreadable=<item>`, exit 0.
- Spec C1 says: "Every cycle, unresolved-entry and unreadable-record row the helper printed is named to the person". The `verdict=empty` branch breaks that clause.
- The same wording is in `hooks/order.ts`, the last header paragraph ("there are no live work packages" is an answer about the project). It is true of nodes. The skill copied it as the whole rendering.

**Fix direction.** Under `verdict=empty`, still render step 3 item 5 (each `unreadable=` row) before stopping. Or say "no live work packages that could be read" and name the rows. Stay within the skill-body growth bound.

**Acceptance test.** Run `/fusion:wp-order` on a store whose only package has an unreadable status. The person sees "no live work packages" *and* the unreadable item named with what it means. `npm test` (in `hooks/`) stays green.

## Resolution, 261001

Fixed by `code-implementer` on the user's word after the closing review, in the commit that carries this marker change. `npm test` green (1015 tests); the hook-test surface stayed at 22 281 lines, no head-room or baseline moved; `skills/wp-order/SKILL.md` is 4 425 bytes.
