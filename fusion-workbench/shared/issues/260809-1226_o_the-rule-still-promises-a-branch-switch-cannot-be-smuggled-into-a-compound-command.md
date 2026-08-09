# The rule still promises a branch switch cannot be smuggled into a compound command

---

**Severity:** Low — a documentation overclaim of the same family as three open classifier defects, in the paragraph a reader trusts first
**Domain:** knowledge (rule text)
**Filed by:** coder, while correcting the two rule statements in `rules/protected-path-discipline.md` and `rules/git-branch-discipline.md`
**Affects:** `rules/git-branch-discipline.md` `## The rule`, the segmentation paragraph
**Cross-references:**
`shared/issues/260809-1105_*_a-trailing-separator-lifts-the-branch-deny-so-git-checkout-b-name-runs.md`,
`shared/issues/260809-1106_*_the-unknown-global-option-fix-was-deleted-with-the-mutation-classifier-and-the-branch-guard-never-had-it.md`,
`shared/issues/260809-1110_*_the-command-word-comparison-is-case-sensitive-while-the-protected-path-match-folds.md`,
`shared/analyses/260809-1103-guard-enforced-policies.md` §Findings 2b

---

## What is wrong

The segmentation paragraph in `## The rule` describes what the guard does — it splits on `;`, `&&`, `||`, `|`, `&` and newlines, splices line continuations, strips subshell parentheses, inspects command substitutions — and then closes with an absolute: **"You cannot smuggle a branch switch inside a compound command."**

The description is accurate. The closing sentence is not. Segmentation finding a segment and the classifier denying that segment are two different steps, and the three defects cited above are all failures of the second step. A deny-case segment that the classifier reads as allow passes whether it stands alone or sits inside a compound command, so the compound command is not the thing that fails to smuggle it.

The `## Why` section already concedes the general point, and now names those three defects explicitly. This sentence sits several screens earlier, in the section a reader treats as the statement of the policy, and it contradicts the concession.

## Why it was not corrected in place

It was found during a task scoped to two named statements, one per file, with an explicit instruction not to correct a third finding unilaterally. The sentence is left standing so the correction is decided rather than absorbed.

## Suggested direction

Not a caveat bolted onto the sentence. The paragraph is describing segmentation, and segmentation genuinely does what the paragraph says; the overclaim comes from the sentence promising something about *classification* that segmentation cannot deliver. The honest close names its own scope, for example that no segment escapes being classified, with the question of whether a classified segment is correctly denied left to `## Why`, which now carries it.

Worth deciding at the same time: whether the same rewrite is owed to the wrapper-resolution paragraph that follows, which enumerates leading assignments, compound-command introducers, wrapper programs, paths, quoting and backslash escapes. Its examples are accurate as given, but `shared/issues/260809-1110_*_...md` measured that a capitalised spelling of the command word resolves to git on a case-insensitive filesystem and is nevertheless allowed, which is exactly the class that paragraph claims to have covered.

## Acceptance criteria

- [ ] `rules/git-branch-discipline.md` `## The rule` makes no claim about a branch switch being unsmuggleable that the open classifier defects falsify.
- [ ] Whatever the section does claim is a property of segmentation alone, with classification correctness left to `## Why`.
- [ ] The wrapper-resolution paragraph is either confirmed accurate or corrected in the same pass, with the case-folding defect taken into account.

---

**Reconciliation 260809-1651 (reconciler, domain `knowledge`) — stays `_o_`. Checked because step 6 of the plan rewrote the file this record names.**
`fb262d8` edited `rules/git-branch-discipline.md` for three other obligations and left the overclaim standing: `## The rule` still closes its segmentation paragraph with "You cannot smuggle a branch switch inside a compound command." Criterion 1 is therefore unmet. Criterion 2 is unmet for the same reason, though `## Why` was strengthened in the direction this record asks for — it now names `260809-1110` as a measured defect inside the classified command form, and records that the trailing-separator and unknown-global-option cases are closed, so the contradiction between the two sections is now sharper rather than softer. Criterion 3, the wrapper-resolution paragraph, is unchanged and still enumerates the coverage the case-folding defect falsifies.
