# Step 9 must also document that a hard-linked rule file is not exempt, and why

---

**Severity:** Low
**Domain:** code (documentation of a security control)
**Filed by:** coder, Turn 3 task T3-7, deferring a piece it could not write coherently
**Affects:** `README-hooks.md`, `rules/protected-path-discipline.md`
**Cross-references:**
`issues/260802-2332_c_the-nlink-heuristic-locks-out-legitimately-hard-linked-rule-files-with-no-diagnosable-reason.md`
(direction 3, the deferred piece),
`history/260803-1314-turn3-t3-2-exemption-prose-and-refusal-diagnostics.md`
"Considered and deliberately not done" (where the deferral is recorded),
`issues/260802-2331` "Also missing, and probably Step 9's" (the two sentences Step 9
already names),
`planning/260802-1856_o_plan-guard-rules-write.md` Step 9,
`hooks/lib/rules-write-exemption.ts:146-156` (the reason, in the module docstring),
`hooks/lib/rules-write-exemption.ts:458-462` (`REFUSAL_NOTES["hard-link"]`, the wording
the deny already uses)

---

## What is missing

`FUSION_ALLOW_RULES_WRITE` refuses the grant for an existing regular file that has more
than one name on the filesystem. `realpath` can prove where a symlink goes; it can prove
nothing about a second name pointing at the same inode, so the exemption cannot show that
writing this name writes only a rule file. The asymmetry is defensible and is currently
written down only in a module docstring.

It matters because nobody has to choose that state: `rsync --link-dest`, `cp -al` and
`git clone --local` all produce hard-linked trees. A user who curates rules inside such a
tree meets a deny with the flag set and no shipped document explains it.

`245b8b7` made the refusal *say* so at the point of denial (`REFUSAL_NOTES["hard-link"]`).
T3-2 deferred the document half to T3-7 as direction 3 of `260802-2332`.

## Why T3-7 did not write it

The note cannot be stated without naming `FUSION_ALLOW_RULES_WRITE`, and that flag appears
in no shipped document at HEAD. Worse, both documents currently assert the opposite of its
existence:

- `rules/protected-path-discipline.md`: "**There is no override for a protected-path shell
  write.** That is deliberate."
- `README-hooks.md`: "There is no env override for a protected-path shell write; the
  answer is a human decision."

Adding a hard-link exception to an exemption the same file says does not exist ships a
self-contradiction. Correcting those two sentences and adding the flag's table row is
Step 9's stated scope, so T3-7 left the whole piece rather than writing half of Step 9
under another task's name.

## What Step 9 should add

Three things, together, in one pass:

1. The `FUSION_ALLOW_RULES_WRITE` row in the `README-hooks.md` tuning table, alongside
   `FUSION_ALLOW_BRANCH_SWITCH`.
2. The correction of the two "no override" sentences above — the policy now has exactly
   one override, it covers rule files only, and it lifts neither the halt nor any other
   protected path.
3. **This item:** a hard-linked rule file is not exempt, because the exemption resolves a
   path through the filesystem and a second name to the same inode is invisible to that
   resolution. Rewriting the command does not help; it is a question for the user. Worth
   naming `rsync --link-dest`, `cp -al` and `git clone --local` so a user who did not
   choose the state can recognise it.

## Origin

`circles/260801-1244-guard-rules-write`, Turn 3 task T3-7, while correcting the halt and
residual claims in the same two documents.
