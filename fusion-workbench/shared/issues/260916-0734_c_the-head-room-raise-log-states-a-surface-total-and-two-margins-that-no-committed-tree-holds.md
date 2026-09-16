The head-room raise log states a surface total and two margins that no committed tree holds

---
`README-hooks.md` is, in its own words, the one place the head-room raises write themselves down, and the 2026-10-10 reduction is read back off its table. The entry for the 2026-09-16 raise was measured mid-landing and never re-read: it states a `skills/` total 293 bytes above what the commit holds, a margin 293 bytes below it, and a restore distance that inherits the same error. The commit message of the same commit carries the correct figure.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260915-2309_*_merge-log-activity-into-cadence.md, 260815-1942_*_nothing-detects-a-raised-growth-baseline-and-the-only-bound-on-one-is-a-comment.md

**Evidence.** Measured at `9d5b1e80`.

- `README-hooks.md:551` — *"The surface stands at 212 890 bytes against a budget of 213 679 (floor 188 768 + 24 911), so 789 bytes of margin."* The budget and the floor are right. The total is not: `cat skills/*/SKILL.md | wc -c` gives **212 597**, and `hooks/lib/__tests__/fixtures/surface-growth.golden` block `[skills bytes]` reads `total 212597`. The margin is **1 082**, not 789.
- `README-hooks.md:529`, the reduction table, `SKILL_HEAD_ROOM` row — *"which is 4 122 below where it now stands."* 212 597 − 208 768 = **3 829**. The 4 122 is exactly 212 890 − 208 768, so it inherits the same total.
- `9d5b1e80`'s own commit message closes: *"Margins after: skills 1 082 B…"* — the correct figure, measured after the whole landing.

The paragraph is self-aware about the sequencing (*"Steps S5 to S7 of that plan are net-negative on `skills/` and will widen it; nothing here counts that in advance"*) but states the pre-S5 number in the present tense, and all of S1 to S7 landed in one commit, so no committed tree ever stood at 212 890.

Why it matters beyond arithmetic: `hooks/lib/__tests__/helpers/growth-bound.ts` `## Re-baselining` makes the written entry the entire detection mechanism for a raise — *"the only thing standing between either and a silent move is that a person reads the diff"* — and `README-hooks.md` dates the reduction to 2026-10-10, when these figures are what gets read back.

**Acceptance.** `README-hooks.md`'s 2026-09-16 raise entry and the reduction table state the surface total, the margin and the restore distance as `hooks/lib/__tests__/fixtures/surface-growth.golden` reads them at the commit that landed the raise: 212 597, 1 082 and 3 829. No head-room constant and no baseline entry move with the correction.

---
Resolved: figures re-measured rather than copied from this record or from the commit message, and both sites corrected. Measured with `cat skills/*/SKILL.md | wc -c` and independently by summing `SKILL_BASELINE` in `hooks/lib/__tests__/surface-growth-bound.test.ts` over the present files; `hooks/lib/__tests__/fixtures/surface-growth.golden` block `[skills bytes]` agrees. At `9d5b1e80`: total 212 597, floor 188 768, budget 213 679, margin **1 082**, and 212 597 − 208 768 = **3 829** to the derived figure. `README-hooks.md`'s "What is left of it" paragraph and the reduction table's `SKILL_HEAD_ROOM` row now carry those three. **The tense was the defect and is fixed with the numbers:** both now name `9d5b1e80` as the commit the figure was taken at, the paragraph states that every step of the plan landed in that one commit (so 212 597 is a committed tree's figure and not a mid-landing one), and it sends a later reader to the golden for what the surface measures today rather than freezing a second present-tense total that this very pass would have made stale again. The forward-looking "Steps S5 to S7 … will widen it" sentence was removed: those steps had already landed. No head-room constant and no baseline entry moved.
