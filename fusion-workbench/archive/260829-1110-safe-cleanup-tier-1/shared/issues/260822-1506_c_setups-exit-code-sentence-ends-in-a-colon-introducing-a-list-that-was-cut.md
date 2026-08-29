Setup's exit-code sentence ends in a colon introducing a list that was cut out from under it

---

`skills/setup/SKILL.md:362`:

> On a non-zero exit, read the code — it says whose fault it is (full table in
> `rules/fusion-workbench-conventions.md` `## Path Resolution` → Exit codes):

The colon introduces nothing. The next non-blank line is `:364`, an unrelated bold paragraph about the
Turn budget.

---

`c2ad89c` removed the exit-3 and exit-4 bullets from six skill bodies on the ground that *"every one of
those sites already cited the conventions file in the sentence directly above them, so removing the
bullets left the citation that was always there."* That reasoning holds — the citation is right there
in the surviving sentence and resolves. What did not survive is the sentence's grammar: it was written
as a lead-in and is now a lead-in to a bold paragraph on a different subject.

**One site, not six.** `skills/next/SKILL.md:51` carries the same sentence and the same cut, but kept
its **Exit 1** bullet at `:53`, so its colon still introduces a list. Checked: `setup:362` is the only
site where the cut left the colon bare.

**Out of the reviewed range, and named honestly.** The cut is `c2ad89c`, which is the base of the range
`c2ad89c..6781814` and therefore belongs to the previous review's span
(`260822-1421-coderev-c0-cut-only-circle.md`, range `370bfc5..c2ad89c`). That review did
not flag it. It is filed here because it was found here, not because this range introduced it.

**Nothing behaves differently.** A skill body is read, and a reader meeting a dangling colon reads on.
The cost is that a reader who takes the colon at face value looks for a list, does not find one, and
cannot tell whether something is missing from the file or from their copy of it — which on a step whose
subject is *what to do when a resolver fails* is the wrong moment to invite that doubt.

---

**Found by:** coderev, reviewing `c2ad89c..6781814`, review file
`260822-1506-coderev-the-guard-rationale-repair-and-the-capped-help-topic.md`.
**Owner:** `coder`.
**Severity:** Low.
**Affects:** `skills/setup/SKILL.md:362`.
**Filed in the shared store:** no Circle is active.

**The fix.** Change the trailing `:` to a `.`. One byte off a bounded surface, no other edit needed —
the citation the cut relied on stays exactly where it is.

---
Resolved: Verified and fixed. `skills/setup/SKILL.md:362` ended in a colon whose next non-blank
line is the bold Turn-budget paragraph at `:364`; `skills/next/SKILL.md:51` kept its Exit 1
bullet, so it was the only site. The trailing `:` is now a `.`. One byte, no other edit, and the
citation of `rules/fusion-workbench-conventions.md` `## Path Resolution` the cut relied on is
untouched.
