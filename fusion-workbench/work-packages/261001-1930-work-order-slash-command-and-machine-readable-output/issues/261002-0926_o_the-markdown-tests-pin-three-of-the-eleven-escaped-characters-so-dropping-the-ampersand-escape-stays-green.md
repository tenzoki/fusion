The Markdown tests pin three of the eleven escaped punctuation characters, so dropping the `&` escape stays green
---
`mdEsc` in `hooks/order.ts` escapes `\` `|` `` ` `` `*` `_` `~` `[` `]` `<` `>` `&`, then tab, CR and LF. The rich fixture in `hooks/lib/__tests__/fusion-work-order.test.ts` has one entry carrying special characters, `p|q\`r.md`, plus `x\y.md` and a tab, so only `\`, `|`, the backtick and the tab are asserted. Removing `&`, `*`, `_`, `~`, `[`, `]`, `<` or `>` from the character class leaves the suite green.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>

**Severity:** Low. The `&` escape is load-bearing. `## The Markdown format` says the rule is lossless "and that is why `&` itself is escaped". Without it, a hand-written entry containing the literal text `&#9;` renders the same as an escaped tab.

**Evidence.** The rich case asserts the row of item `-d` and the `**Unresolved**` list literally. Neither contains any of the eight unpinned characters. Running the helper over a scratch store with an entry `a*b_[c]<d>&e~.md` at `d3311e73` rendered `a\*b\_\[c\]\<d\>\&e\~.md`. The code is correct today. The test just would not notice if it stopped being correct. CR and LF cannot reach a value (`headField` splits on LF and trims), so they need no pin.

**Acceptance.** Widen the existing rich-fixture entry instead of adding a case: the hook-test surface is at zero margin, 22 281 of 22 281 lines. For example, change `p|q\`r.md` to an entry that also carries `&`, `*`, `_`, `[`, `]`, `<`, `>` and `~`, and update the TSV, JSON and Markdown literals. Dropping `&` from the `mdEsc` character class must then turn `fusion-work-order.test.ts` red. The line count must not grow.

**Reconciliation 261002-1155 (state-auditor, domain `code`, HEAD `23e97066`) — still open.** `hooks/lib/__tests__/fusion-work-order.test.ts` is unchanged since `d3311e73`; the rich-fixture entry is still `p|q\`r.md`, so none of the eight unpinned characters is asserted. The work package closed `done` at `3210689a` with this record open.
