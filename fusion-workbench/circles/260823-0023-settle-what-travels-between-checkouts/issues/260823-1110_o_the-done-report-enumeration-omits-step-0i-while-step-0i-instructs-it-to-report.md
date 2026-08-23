The Done report enumeration omits Step 0i while Step 0i instructs it to report there

---

**Severity:** Low
**Domain:** code
**Filed by:** coderev, reviewing C2 Turn 1
**Affects:** `skills/setup/SKILL.md:354`, `skills/setup/SKILL.md:470`
**Cross-references:** plan step 5 in `circles/260823-0023-settle-what-travels-between-checkouts/planning/260823-0800_o_c2-what-travels-between-checkouts-is-settled.md`

---

## What is wrong

Step 0i ends with one instruction at `skills/setup/SKILL.md:354`:

> Name the branch that ran in the Done report.

The Done report is an explicit enumeration at `skills/setup/SKILL.md:470`. It lists the workspace path, the history file path, the snapshot counts, the detected domain, whether an interrupted session was resumed, what Step 0e reported, the permission line Step 0g produced, and which of Step 0h's four outcomes occurred. Step 0i is not in it.

Commit `c9eba48` added Step 0h to that list in the same commit that added the step. Commit `25f60eb` added Step 0i and left the list alone.

A skill body is the prompt a model executes, so the two surfaces compete: a closed "report with:" list is a strong instruction, and one line 116 lines earlier is a weak one. This is the case where the strong one is wrong.

## Verified

Read at HEAD `2f1e3a6`. `git show 25f60eb -- skills/setup/SKILL.md` touches only the new Step 0i block; the `## Done` paragraph is untouched by that commit.

## Direction, not a prescription

Add Step 0i's outcome to the Done enumeration, in the shape Step 0h's entry uses: which branch ran, and on the activating branch the Circle directory name written into `.active-circle`.
