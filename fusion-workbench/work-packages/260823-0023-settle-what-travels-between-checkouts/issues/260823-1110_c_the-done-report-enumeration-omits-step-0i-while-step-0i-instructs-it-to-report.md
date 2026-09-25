The Done report enumeration omits Step 0i while Step 0i instructs it to report there

---

**Severity:** Low
**Domain:** code
**Filed by:** coderev, reviewing C2 Turn 1
**Affects:** `skills/setup/SKILL.md:354`, `skills/setup/SKILL.md:470`
**Cross-references:** plan step 5 in `260823-0800_*_c2-what-travels-between-checkouts-is-settled.md`

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

---

Resolved: 2026-08-23 by coder. The `## Done` enumeration in `skills/setup/SKILL.md` now ends with
Step 0i, in the shape Step 0h's entry uses: which branch ran — nothing to report; one active Circle
with no pointer, named, with whether the user activated it here; or `MULTIPLE-ACTIVE`, every record
named. The two surfaces no longer compete.

Step 0h's own clause was corrected in the same sentence: "another driver left alone, named" became
"another value left alone, named", because two of the three values that reach that branch are not
driver names — see
`260823-1110_*_step-0h-reports-unset-and-set-as-merge-driver-names-and-the-rule-enumerates-neither.md`.

**Measured.** Part of the `skills/` spend accounted in
`260823-1110_*_step-0i-collapses-multiple-active-to-head-1-and-names-one-circle-arbitrarily.md`,
which carries the surface figures for the whole `skills/setup/SKILL.md` pass.

**Files:** `skills/setup/SKILL.md`. Uncommitted at the time of writing; the orchestrator commits.
