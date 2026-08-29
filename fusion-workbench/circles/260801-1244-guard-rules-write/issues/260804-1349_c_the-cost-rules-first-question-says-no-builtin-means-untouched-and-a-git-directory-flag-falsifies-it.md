# The cost rule's question 1 says "no directory builtin means untouched", and a git directory flag falsifies it

---

**Severity:** Medium
**Domain:** code (documentation of a security control)
**Filed by:** coderev, review of `613d6fd` (Job 2 of the same pass reviewed `cc012fc`, which wrote the rule)
**Affects:** `rules/protected-path-discipline.md:216` (the section heading, which promises predictiveness) and `:240-241` (question 1)
**Kind:** Question 1 was TRUE when `cc012fc` wrote it. `613d6fd` added a second source of an unknown working directory that is not a directory builtin, and did not update the procedure.
**Cross-references:**
`260804-1025_*_…` and `260804-1223_*_…` (**the same section, question 3, the "model stays exact" clause — close all three in one edit, they are one paragraph**),
`260804-1220_*_…` (the same section, the stale question count),
`260804-1347_*_…` (the deny reason the reader meets when question 1 misleads them).

---

## What is wrong

`rules/protected-path-discipline.md:216` heads the section **"The rule, so you can predict a
case this file does not list"**, and closes the illustration block with:

> They are **examples of the rule above**, and the set is open — if you can answer the … 
> questions for a command you have not seen here, you have the rule.

That is a promise of predictiveness, and it is the reason the section exists rather than a
table. Question 1 reads:

> 1. **Does it contain a directory builtin at all?** No → this rule cannot touch it, whatever
>    its joiners are. `ls; rm out.js` and `npm test; rm build/out.js` allow, and always did.

Since `613d6fd`, a command with no directory builtin and no joiner at all can be denied by
this rule, with this rule's own reason.

## Measured

Real guard subprocess, one fresh project per case, at `613d6fd`.

```
block   git -C $D rm build/out.js
block   git --work-tree=$W clean -fdx
```

Both carry the working-directory fail-closed reason — the text question 1 promises cannot
apply. Neither contains `cd`, `chdir`, `pushd` or `popd`, and neither contains a joiner.

The controls, so the procedure is not being blamed for something else:

```
ALLOW   ls; rm out.js                    # question 1's own example, still right
ALLOW   npm test; rm build/out.js        # ditto
ALLOW   git -C $D rm /tmp/junk           # absolute operand — nothing to place
```

## Why it is a defect and not a nit

The section is loaded into every agent's context in every consuming project, and it is the
part of the file an agent is told to reason **from** when its command is not in the table. A
false negative in question 1 is the reassuring direction: the reader concludes the rule
cannot touch their command, meets a deny anyway, and — per `260804-1347_*_…` — is then
handed a remedy naming a `cd` their command does not contain. Question 1 and the deny reason
mislead in the same direction, one after the other.

This is the third clause of the same four-question block to be falsified: question 3 by
`260804-1025_*_the-decision-procedure-tells-an-agent-the-model-stays-exact-for-the-two-commands-that-delete-a-rule-file.md` / `260804-1223_*_260804-1025s-reproduction-is-stale-but-its-clause-still-overclaims-here-are-the-commands-that-replace-it.md`, the question count by `260804-1220_*_the-illustration-block-still-points-at-three-questions-in-a-procedure-that-now-has-four.md`, and now question 1. The
pattern is worth naming in the fix: the block is written as if the working directory can only
be lost by a directory builtin, and the module has three other ways to lose it
(a modifier flag, a wrapper hop, an ambient `CDPATH`) plus, now, a fourth (a git directory
flag). Each time one is added, this block silently stops being predictive.

## Recommendation

Fix the block once, at the level that stops it going stale again, rather than adding a fifth
question:

- Restate question 1 over the **effect** instead of over the syntax: *"Does anything in the
  command move, or claim to move, the directory a relative operand hangs off — a directory
  builtin, a `cd` modifier the guard does not model, a wrapper in front of one, an ambient
  `CDPATH`, or a `git -C` / `--work-tree`? No → this rule cannot touch it."* That list is
  still a list, but it is a list of **causes the module enumerates in one place**
  (`Cwd` / `CwdUnknownCause` / `stepDir`), so it can be kept in step by reading four
  declarations rather than by remembering to.
- Add the two rows above to the illustration block as `DENY`, labelled as the non-builtin
  cause.
- Take the `260804-1025_*_the-decision-procedure-tells-an-agent-the-model-stays-exact-for-the-two-commands-that-delete-a-rule-file.md` / `260804-1223_*_260804-1025s-reproduction-is-stale-but-its-clause-still-overclaims-here-are-the-commands-that-replace-it.md` edit in the same pass. All three findings are in one
  paragraph, and three separate edits to one paragraph is how the count in `260804-1220_*_the-illustration-block-still-points-at-three-questions-in-a-procedure-that-now-has-four.md` went
  stale in the first place.

## Test coverage this needs

A documentation rule cannot be pinned by the guard's suite directly. What can be pinned, and
what would have caught this, is the **cause enumeration**: a test that asserts every
constructor of `Cwd`'s `unknown` arm reachable from `classifyBashMutation` has a named cause
and a distinct reason string. That test fails today for the git-directory route
(`260804-1347_*_…`) and would fail again for the next unnamed one.

## Anti-vacuity

Both rows deny at `613d6fd`, so the verdict alone proves nothing. What is being asserted here
is a mismatch between prose and behaviour, and the check is the three control rows: if
`ls; rm out.js` ever denies, the finding is something else entirely.

---

**Step 3 disposition (coder, 2026-08-05) — branch A, text corrected. CLOSING.**

Question 1 is restated over the **effect**, which is what this issue recommended in
preference to a fifth question. It now asks whether anything in the command moves, or claims
to move, the directory a relative operand hangs off, and names the module's causes: a
directory builtin, a `cd` modifier the guard does not model, a wrapper in front of one, an
ambient `CDPATH`, and a `git -C` / `--work-tree`. The paragraph states why the question is
asked over the effect, so the next person to add a cause can see what the wording is
protecting: the earlier version named only the builtin, and a git directory flag falsified
it.

Measured against the TypeScript source built fresh (`hooks/dist` is stale at this commit),
shipped protected list:

```
DENY   git -C $D rm build/out.js
DENY   git --work-tree=$W clean -fdx
allow  ls; rm out.js                     # this question's own control, still right
allow  npm test; rm build/out.js         # ditto
```

**One recommendation is declined, with a reason.** Adding the two DENY rows to the
illustration block would put the correction where the misled reader is not: after step 2's
split that block is the forensics analysis, which no agent loads. The causes are named
inside question 1 instead, in the core file every agent carries.

**Taken in one pass with `260804-1025_*_the-decision-procedure-tells-an-agent-the-model-stays-exact-for-the-two-commands-that-delete-a-rule-file.md`, `260804-1223_*_260804-1025s-reproduction-is-stale-but-its-clause-still-overclaims-here-are-the-commands-that-replace-it.md` and `260804-1220_*_the-illustration-block-still-points-at-three-questions-in-a-procedure-that-now-has-four.md`**, as this issue
asked. All four are one paragraph, and three separate edits to one paragraph is how the
count in `260804-1220_*_the-illustration-block-still-points-at-three-questions-in-a-procedure-that-now-has-four.md` went stale in the first place.
