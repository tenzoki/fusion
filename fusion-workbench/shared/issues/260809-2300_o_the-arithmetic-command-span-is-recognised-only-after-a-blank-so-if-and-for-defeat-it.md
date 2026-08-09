# The arithmetic-command span is recognised only after a blank, so `if((` and `for((` defeat it and a branch switch is allowed

---

**Severity:** High — a live deny-to-allow on the one guard policy that runs in every repository, including this one
**Domain:** code
**Filed by:** reconciler (reconciliation of `6b94e17..HEAD`, 260809-2252), from a rebuilt differential and end-to-end runs through the shipped hook
**Affects:** `hooks/lib/shell-parse.ts:277` (the `((…))` arm of `scanNonTokenizedSpan`), and through it the git branch policy in `hooks/lib/git-branch-guard.ts`
**Cross-references:**
`shared/issues/260809-2044_c_a-false-heredoc-opener-blanks-real-commands-so-a-branch-switch-in-the-blanked-region-is-allowed.md` — the same defect class, closed by `6fae676`; this is the entry that commit did not cover;
`6fae676` (added the six spans), `69a2d00` (introduced the blanking this exploits);
`rules/git-branch-discipline.md` — its "six spans" paragraph describes the mechanism this record bounds;
`shared/reviews/260809-2050-coderev-guard-and-hooks-turn-6b94e17-to-head.md` — H1, the review finding whose fix this record extends

---

## What is wrong

`6fae676` closed `260809-2044` by teaching the lexer six spans in which bash suspends its
tokenizer, so a `<<` inside them is an operator rather than a heredoc opener. One of the six is
the arithmetic command `((…))`, at `hooks/lib/shell-parse.ts:277`. It is recognised **only at a
word start**. A reserved word with no blank between it and the parenthesis defeats the
recognition:

```
if((1<<2)); then :; fi
git switch main
2
```

Bash suspends its tokenizer here — verified against bash 3.2.57 with the `touch RAN` method: the
marker is created, so the `git switch main` line **executes**. The lexer instead reads `<<2` as a
heredoc opener, blanks from there to the first line equal to `2`, and the branch switch stands
inside the blanked region. The guard **allows**.

Verified end-to-end through the shipped `PreToolUse` hook, run from a scratch project root
outside this repository so the self-detect stand-down could not mask it. All five reserved words
that take an unspaced `((` behave the same way:

| Command shape | bash executes the next line | Guard verdict |
|---|---|---|
| `if ((1<<2)); …` (with blank) | yes | **BLOCK** — correct |
| `if((1<<2)); …` | yes | **allow** |
| `for((i=0;i<n;i++)); …` | yes | **allow** |
| `while((1<<2)); …` | yes | **allow** |
| `until((1<<2)); …` | yes | **allow** |
| `elif((1<<2)); …` | yes | **allow** |

The space is the whole difference.

## Why this is not exotic

`for((i=0;i<n;i++))` without a space is ordinary bash idiom — it is how the C-style for loop is
most often written. Only the `<<` inside it is unusual, and an agent does not have to be
adversarial to produce one; an arithmetic shift in a loop bound is enough. The blast radius is
the git branch policy alone, exactly as for `260809-2044`: the protected paths are measured
rather than read off the command, so nothing on that side moves.

## What is measured and not at issue

- **No verdict moved toward allow when `6fae676` landed.** Rebuilt differential, 47,722
  comparisons over four corpora (HEAD suites plus 87 adversarial cases, a 6,000-case template
  cross-product, 40,000 seeded fuzz cases): 200 verdict moves, all toward deny, zero toward
  allow. This record is not a regression *from* that commit — it is a case it never covered.
- **Two neighbouring shapes are not gaps.** `[[ a << b ]]` and `case x in a<<b)` also blank the
  region, but bash rejects both with a syntax error, so nothing runs and nothing is let through.
  Worth a comment, not a fix.
- **Over-suspension is safe and present.** `echo a[1<<2]=v` really does open a heredoc in bash
  3.2, and the subscript rule suppresses it. That keeps more text as code, so it costs a false
  deny, never an allow.

## Suggested direction

Recognise `((` after a reserved word as well as at a word start. The command-word layer already
knows the reserved-word set (`hooks/lib/command-word.ts` skips `if`, `elif`, `while`, `until`,
`do`, `then`, `else`), so the list exists; what is missing is that `scanNonTokenizedSpan`'s
`((` arm is reached only from a word boundary. Prefer widening the recognition over special-casing
the five words one at a time — bash's own rule is that `((` opens an arithmetic command wherever
a command may begin, and "after a reserved word" is precisely that position.

Check the same question for the other five spans while there: whether each is recognised in
every position bash allows it, not only after a blank.

## Acceptance criteria

- [ ] `if((1<<2))\ngit switch main\n2` denies. The same for `for((`, `while((`, `until((`
      and `elif((`.
- [ ] `if ((1<<2))\ngit switch main\n2` still denies (no regression on the spaced form).
- [ ] `cat <<EOF\ngit switch main\nEOF` still ALLOWS and `cat <<EOF\n$(git switch main)\nEOF`
      still denies — the `260809-1111` and `260809-2044` contracts both survive.
- [ ] The cases sit in `hooks/lib/__tests__/git-branch-guard.test.ts` beside the `260809-2044`
      block, naming this record.
- [ ] A differential over the pre-fix and post-fix classifiers shows no verdict moving toward
      allow. Commit the harness this time, or state in the record why it is not worth keeping —
      the `6fae676` harness was not committed and its headline number could not be reproduced.

---
Blocked, deliberately, on `shared/decisions/260809-2310_o_should-the-branch-policy-fall-the-way-the-write-classifier-fell.md`.

This is the seventh entrance to a question that is not decidable from the input the mechanism
has. Five patches to the same classifier landed in session 260809-1725, each closing a measured
entrance and each revealing the next. Closing this one with a sixth entrance-specific fix would
buy the same thing the previous five bought. The decision asks whether the branch policy should
be measured the way protected paths already are, and this record waits for it.
