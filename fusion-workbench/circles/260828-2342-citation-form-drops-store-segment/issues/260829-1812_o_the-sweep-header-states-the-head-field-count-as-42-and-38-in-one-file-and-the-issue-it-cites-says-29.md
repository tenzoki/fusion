The sweep header states the head-field count as 42 and as 38 in one file, and the issue it cites says 29
---
`hooks/citation-sweep.ts:35` says fusion's first run "rewrote 42 head fields and left 239 chained tails"; the same header at line 57 says the retired rule produced "38 head fields (`**Date:**`, `**Started:**`, `**Stamp:**`, ...)". The scanner header (`hooks/lib/citation-scan.ts:72`) says 42. The coder's repair log (`260829-1420-coder-turn-2-r1-citation-grammar-and-repair.md:29`) measured `date-field=42 chained-tail=239 doubled=9` over the working tree, and the issue both headers cite by name carries 29 and 181 in its title, the committed-tree subset. Three numbers for one quantity in the shipped text, none stamped with the tree it was taken over, is the case `rules/critical-stance.md` §5 names.
---
**Filed by:** coderev, Kai Stalmann <ks@qantr.com>
**Severity:** Low
**Affects:** `hooks/citation-sweep.ts:35`, `hooks/citation-sweep.ts:57`, `hooks/lib/citation-scan.ts:72`

## Acceptance

- One figure, or each figure stamped with what it counts (committed tree at `e9f2ed0b` versus working tree before `3276b1e1`), in both headers; `bin/fusion-citation-sweep`'s own header carries no number and needs none.
