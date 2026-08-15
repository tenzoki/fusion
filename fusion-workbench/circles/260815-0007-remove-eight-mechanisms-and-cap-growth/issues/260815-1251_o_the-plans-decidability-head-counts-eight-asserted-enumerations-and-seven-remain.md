# The plan's Decidability head counts eight asserted enumerations and seven remain

---

The plan's `**Decidability:**` line lists the enumerations `derivable-enumerations-lint.test.ts`
re-derives, by name, and the count is eight. Step 6 (`5d29b6d`) deleted one of the eight — the
stash-manifest field count, whose subject left with `rules/workbench-stash-and-lock.md`'s stash
half. Seven remain. The executor named this in its commit message and left it standing, correctly,
as outside its own file list.

---

**Severity:** Low — one word and one clause; nothing depends on the count at run time.
**Domain:** code
**Filed by:** `coderev`, reviewing `7c12d6a..5d29b6d` (`reviews/260815-1251-coderev-turn-2-build-churn-and-stash.md`)
**Owner:** `planner`
**Affects:** `circles/260815-0007-remove-eight-mechanisms-and-cap-growth/planning/260815-0029_o_plan-remove-eight-mechanisms-and-cap-growth.md`, the `**Decidability:**` line
**Cross-references:** `history/260815-1032-coder-stash-pop-removal-and-commit-lock-rehome.md`, which names the staleness and states why the executor left it

**Verified 2026-08-15 at HEAD `5d29b6d`.**

## The claim and the tree

`planning/260815-0029_o_plan-remove-eight-mechanisms-and-cap-growth.md`, `**Decidability:**`:

> `hooks/lib/__tests__/derivable-enumerations-lint.test.ts` re-derives **eight** enumerations (the
> skill roster, the agent-count digits, the always-on rule list, the conditional emission sets, the
> `hooks/lib` table, **the stash-manifest field count**, the `DEFINITION_SITES` echo, and the `bin/`
> helper roster in `CLAUDE.md`'s Layout table)

The file at HEAD:

```
$ grep -n '^// --- ' hooks/lib/__tests__/derivable-enumerations-lint.test.ts
 47:// --- derived ground truth ---
 70:// --- 1. the skill roster ---
142:// --- 2. the agent count ---
176:// --- 3. the always-on rule list ---
214:// --- 4. the conditional emission sets ---
345:// --- 5. the README-hooks lib table ---
360:// --- 6. DEFINITION_SITES echoed in CLAUDE.md ---
387:// --- 7. the bin/ helper roster in CLAUDE.md's Layout table ---
```

`5d29b6d` deleted section 6 (the stash-manifest field count) and renumbered the two below it. The
file's own header comment was corrected in the same commit and reads seven; the plan's head was not.

## Why this is a record and not a note

The `**Decidability:**` head is the plan's honesty statement about what its sweep obligation rests
on, and `rules/critical-stance.md` §4 makes it the line a human reads at the approval gate. Nine
steps and one gate still read this plan. Two of them read this line specifically:

- Step 13 arms a new bound and cites the existing instruments.
- Step 14 and the Closure note describe what the Circle's sweep was decidable over.

A head that over-counts its own instrument by one is small; a head that names a check that no longer
exists invites the next reader to look for it.

## What it would take

Delete `the stash-manifest field count, ` from the parenthetical and change `eight` to `seven`. One
line. The `## Approach` gate-forced list is unaffected — its "Six kinds" never included this check.

Note for whoever does it: **`d1ae1c0`'s own commit message also says "eight enumerations"**, and
that one stays. It is a statement about the tree at 08:47 and it was true then.

## Related

- `planning/260815-0029_o_plan-remove-eight-mechanisms-and-cap-growth.md`, `**Decidability:**`
- `history/260815-1032-coder-stash-pop-removal-and-commit-lock-rehome.md`
- `rules/critical-stance.md` §4 — what the head is for
