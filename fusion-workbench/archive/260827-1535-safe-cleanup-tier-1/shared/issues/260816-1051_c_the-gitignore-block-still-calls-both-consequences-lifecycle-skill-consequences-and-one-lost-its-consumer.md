The .gitignore block still calls both consequences "for the lifecycle skills" and one of them lost its consumer

---

`.gitignore:65-66`:

```
# that ended. The split and its two consequences for the lifecycle skills are stated in
# rules/fusion-workbench-conventions.md, "Which of them a tracked workbench tracks".
```

The rule it points at says otherwise for one of the two. `rules/fusion-workbench-conventions.md:83`:

> Two consequences. **Nothing in the second group survives a fresh clone**, so no skill may promise
> that git holds its bytes — that promise is available only for the first group, and only where the
> project tracks the workbench. And **an ignored path is skipped by `git stash --include-untracked`,
> but not by `git stash --all` or `git clean -xdf`** — ignoring a transient protects it from the first
> and from nothing else. The second consequence **had its consumer in the two stash-and-restore skills
> and lost it when they were removed on 2026-08-15**; it is kept because it governs any command that
> sweeps the tree, **not because a skill reads it today**.

So consequence 1 still binds skills ("no skill may promise that git holds its bytes"). Consequence 2
has had no skill consumer since 2026-08-15 and is kept on entirely different grounds. The `.gitignore`
comment attributes both to the lifecycle skills.

## Why it is filed rather than left

Small, but it sits four lines above the block `b18a8cf` rewrote, and it is the third sentence in that
same comment block to be corrected in three separate commits — each pass fixed one sentence and left
its neighbours. The block is eleven lines long. It is worth one deliberate pass instead of a fourth
single-sentence correction.

## Fix direction

Drop the attribution, or make it accurate. Either:

```
# that ended. The split and its two consequences are stated in
```

or name where the second one now applies ("...its two consequences — one for the lifecycle skills,
one for any command that sweeps the tree — are stated in..."). No ignore pattern changes; comment
text only, so no rule byte moves and no golden regeneration is needed.

Worth taking in one pass with
`shared/issues/260816-1049_o_the-split-calls-portfolio-md-not-machine-refreshed-and-the-playmaker-regenerates-it-in-full.md`,
which is the same block's authoring counterpart in the rule file.

**Found by:** coderev, reviewing `433e206..b18a8cf`
(`shared/reviews/260816-1049-coderev-tracked-workbench-split-and-kept-line.md`, F3).

---
**Reconciliation 260817-1836** (reconciler, domain `code`). Re-verified reproducible at HEAD `2552586`: `.gitignore:65` still calls both consequences lifecycle-skill consequences, while the conventions file states the second lost its consumer when the stash skills were removed on 2026-08-15. Marker stays open. Log: `shared/history/260817-1836-reconciliation.md`.

---
Resolved: `.gitignore:65` now distinguishes the two: one binding the lifecycle skills, one binding any command that sweeps the tree. Taken in the same pass that rewrote line 66 of the same block, rather than as a fourth single-sentence visit to eleven lines.
