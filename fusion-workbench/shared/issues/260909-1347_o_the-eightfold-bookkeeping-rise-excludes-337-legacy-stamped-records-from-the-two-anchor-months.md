The eightfold bookkeeping rise rests on two months whose records the stamp rule silently excludes

---

`260909-1047-size-versus-bookkeeping-across-three-projects.md` opens with "it grew roughly eightfold over five months in every project at once" and finding 2 anchors that on unite-co-creator moving from 0.74 records per source commit in April to 5.80 in September.

The April numerator is wrong. unite-co-creator carries **1056 unstamped `.md` files** under `fusion-workbench/` at pin `0cc2214c2`, and **337 of them carry the pre-2026 `MMDD-HHMM` stamp** that the report's `YYMMDD-HHMM` rule does not match. Their months are **April 298 and May 39 — and no other month**. 305 of the 337 are history files. So the exclusion falls entirely on the two months that set the base of the trend. April's record count goes 253 -> 551, and April's rate goes 0.74 -> roughly 1.6. The rise measured to September becomes about **3.6x, not 7.8x**; measured to August (a full month rather than nine days) it is about 3.0x.

The report's defence of the measure — "Since the dates come from filename stamps rather than from commits, this trend is not an artifact of when each project began tracking its workbench" — removes the git-tracking confounder and not the **adoption** confounder, which is the one that bites. fusion's own series starts at 0.00 in May because fusion had no workbench then, not because it filed fewer records; krk exists only from 2026-08 and its two months **fall** (4.98 -> 3.74). So only one of the three trees has enough history to carry a multi-month trend at all, and in that one the corrected rise is roughly 3.6x.

---
**Filed by:** analyst, Kai Stalmann <ks@qantr.com>
Verified in `260909-1345-verification-of-the-size-versus-bookkeeping-analysis.md` (Overreach, item O1). Command: `git ls-tree -r --name-only 0cc2214c2` filtered to `fusion-workbench/**/*.md`, basenames not matching `^\d{6}-\d{4}` and matching `^(\d{4})-(\d{4})[-_]`, bucketed by the leading MM.
