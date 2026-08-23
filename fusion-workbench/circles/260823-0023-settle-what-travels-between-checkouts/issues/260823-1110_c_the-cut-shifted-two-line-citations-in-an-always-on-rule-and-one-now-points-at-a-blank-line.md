The cut shifted two line citations in an always-on rule, and one now points at a blank line

---

**Severity:** Medium. The rule is emitted to every agent on every dispatch, and a citation that lands on the wrong text is silent by construction.
**Domain:** code
**Filed by:** coderev, reviewing C2 Turn 1
**Affects:** `rules/fusion-workbench-conventions.md:66`
**Cross-references:** `shared/issues/260818-1637_o_no-gate-resolves-a-path-line-citation-and-thirteen-drifted-in-a-single-change.md`, the open design record for the missing gate

---

## What is wrong

`rules/fusion-workbench-conventions.md:66` carries two line citations into the setup skill:

> `/fusion:setup` **stopped needing** its exclusions rather than losing them: it bounds its probe to the two live trees (`skills/setup/SKILL.md:67`), leaving every frozen store outside by construction. Do not drop the three that remain: `skills/setup/SKILL.md:60` records the cost, a Setup that refuses permanently and routes to a migration with nothing to do.

Both were exact at `3ee8eaf`: line 60 was the paragraph beginning "The bracket-marker probe walks the two trees", and line 67 was the `find` block that performs the bound.

Commit `57eaf85` removed two paragraphs above them. At HEAD:

- `skills/setup/SKILL.md:60` is the neighbouring paragraph, "The bracket-marker probe matches the marker shape, not any bracket pair". The intended paragraph is now at `:58`. The citation still reads as supported because that paragraph happens to make a similar statement, which is the failure mode rather than a mitigation.
- `skills/setup/SKILL.md:67` is a **blank line**. The `find` block is now at `:65`.

The same commit also removed the sentence the first half of that conventions clause rests on, "This probe was a whole-tree walk with those three stores named as `-not -path` exceptions until 260816" (cut as passage 3). The claim "stopped needing its exclusions rather than losing them" now has no supporting text at the site it cites.

## Why no gate caught it

`hooks/lib/__tests__/reference-resolution-lint.test.ts` resolves the path and never the `:N` after it: `scanPluginPaths` ends at `existsSync(join(pluginRoot, resolveToken(token)))`. The path exists, so the citation counts as resolved. That design gap is the open record cross-referenced above; this record is the concrete instance to correct.

## A wider instance the same range produced, filed here rather than separately

Commit `1400402` inserted two lines into `skills/next/SKILL.md` at line 122, shifting everything below. Five line citations in `README-agents.md` point past that insertion:

- `README-agents.md:53` cites `skills/next/SKILL.md:170-176`
- `README-agents.md:59` cites `:170`
- `README-agents.md:60` cites `:167-176`
- `README-agents.md:61` cites `:176` and `:179`

All five name the Step 5b playmaker dispatch block. That block ends at `skills/next/SKILL.md:153` at HEAD, and `:176` is now "Two entry paths:" under `## Step 6`. These five were **already wrong at `3ee8eaf`**, by roughly 25 lines; this range moved them two further. They are named here so one correction pass covers both files, not because this Circle introduced them.

## Direction, not a prescription

Correct the two conventions citations to `:58` and `:65`, and decide whether the "stopped needing its exclusions" clause keeps a supporting sentence in the skill or drops the historical half. Correct the five `README-agents.md` citations against the block as it now stands. Whether a gate should resolve `:N` at all stays with `260818-1637`.

---

Resolved: 2026-08-23 by coder. Both halves are corrected.

`rules/fusion-workbench-conventions.md:66` now cites `skills/setup/SKILL.md:65` (the `find` block
that bounds the probe, previously `:67`, a blank line) and `skills/setup/SKILL.md:58` (the paragraph
recording the deadlock cost, previously `:60`, its neighbour). Both were read against HEAD, not
derived from the shift.

**The historical half was dropped rather than restored, and that is a decision.** The clause read
"`/fusion:setup` **stopped needing** its exclusions rather than losing them", which rested on a
sentence `57eaf85` cut from the skill. It now reads "`/fusion:setup` names no exclusion at all",
which is a claim about HEAD that the cited line supports on its own. Restoring the sentence into
`skills/setup/SKILL.md` was the alternative and was rejected on two grounds: it would spend `skills/`
head-room — 1 303 bytes free at the start of this pass — to reinstate text a deliberate cut had just
removed, and it would put spent history back into a body whose whole recent change was taking it out.
The always-on surface gains 33 bytes by the cut.

**The five `README-agents.md` citations were corrected too**, against the Step 5b block as it now
stands: `:53` `skills/next/SKILL.md:170-176` -> `:147-153`; `:59` `:170` -> `:147`; `:60`
`:167-176` -> `:144-153`; `:61` `:176` -> `:153` and `:179` -> `:156`. All five shift by exactly -23,
which is the 25 lines they were already stale by at `3ee8eaf` less the two `1400402` added.

**A sixth, not filed and corrected anyway.** The same `README-agents.md:59` cell cited
`skills/next/SKILL.md:103` for Step 3's `**Domain:**` dispatch; that block is at `:97`. It was on the
line being edited, and leaving a known-wrong citation beside a corrected one would have been worse
than the scope discipline it preserved. It is named here rather than filed.

**Measured.** Always-on core `95 285 -> 95 252` bytes, head-room `3 288 -> 3 321` of 12 000; the
whole -33 is `rules/fusion-workbench-conventions.md`, confirmed by the regenerated
`rules-emission.golden`. `README-agents.md` is on no bounded surface. No baseline moved.

Whether a gate should resolve a `:N` suffix at all stays open at
`shared/issues/260818-1637_*_no-gate-resolves-a-path-line-citation-and-thirteen-drifted-in-a-single-change.md`.
Nothing here closes it, and this pass is fresh evidence for it: eleven line citations were repaired
by hand across two files and the suite was green over every one of them.

**Files:** `rules/fusion-workbench-conventions.md`, `README-agents.md`,
`hooks/lib/__tests__/fixtures/rules-emission.golden`. Uncommitted at the time of writing; the
orchestrator commits.
