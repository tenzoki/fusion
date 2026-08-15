The after-measurement's rules/ before-row was taken two days after the anchor its two neighbours use
---
The three-row table that carries the Circle's motivating finding presents one measurement at one anchor. Two of its three "before" figures reproduce exactly at 2026-08-05. The third, `rules/` at 170 835 bytes, is the value the tree held on 2026-08-07; at 2026-08-05 the surface measured 165 747. The direction of the finding survives — `rules/` still fell while the other two rose — but the stated -10 % is -7.5 % when the row is taken where the table says it was taken.
---
**Severity:** Medium. The finding is unchanged, so this blocks nothing. It is filed because the table is the Circle's motivating evidence, it is reproduced in an always-loaded test header, and it is exactly the class of defect the Circle's own step 14 was commissioned to catch.

**The claim**, in `hooks/lib/__tests__/surface-growth-bound.test.ts:20-23` and again in the step report's table:

> over the ten days from 2026-08-05 to the start of the Circle that armed this file (`9a7da8e`, 2026-08-15) … `agents/*.md` rose 289 958 -> 460 292 bytes (+59 %) and the hook test suite 19 838 -> 25 897 lines (+31 %), while `rules/` — the ONE surface the old cap still covered — FELL, 170 835 -> 154 092 (-10 %).

**Measured at HEAD.** `66e4a698` is the last commit of 2026-08-05.

```
$ git ls-tree -r -l 66e4a698 rules/ | awk '$5 ~ /\.md$/{s+=$4}END{print s}'
165747
$ git ls-tree -r -l 66e4a698 rules/ | awk '{s+=$4}END{print s}'    # all files, not just .md
166610
$ git ls-tree -r -l 9a7da8e   rules/ | awk '$5 ~ /\.md$/{s+=$4}END{print s}'
154092
```

The "after" figure is exact. The "before" figure is neither the `.md` total nor the all-files total on that day. Scanning every commit in August for the value:

```
$ for h in $(git log --format=%H --since=2026-08-01 --until=2026-08-15); do
    v=$(git ls-tree -r -l $h rules/ | awk '$5 ~ /\.md$/{s+=$4}END{print s+0}')
    [ "$v" = "170835" ] && echo "$h $(git log -1 --format='%ad %s' --date=short $h)"; done | head -1
2d55c668 2026-08-07 fix(hooks): die Schutzliste verliert das Zustandsverzeichnis der Wache
```

170 835 is the 2026-08-07 value. The surface peaked at 175 000 later in the window.

**What changes and what does not.** Taken at the table's own anchor the row reads `165 747 -> 154 092`, a fall of 11 655 bytes or **-7.5 %**, not -9.8 %. The finding the step rests on — "the one surface the old cap still covered is the one that shrank" — holds on either figure. What does not hold is the table's implicit promise that its three rows were measured at one moment.

**Why it is worth correcting rather than tolerating.** These four figures were specifically re-measured because the Circle record's originals "were taken against a different anchor", and the test header says so in the same paragraph. Correcting an anchor drift and then introducing a two-day one in the corrected table is the failure repeating inside its own repair. The fix is a one-line edit in two places (`surface-growth-bound.test.ts:22-23` and the step report's table), plus the percentage.

**Found by:** coderev, review of `1e29572..9306f0a`, commit `0609945`.
