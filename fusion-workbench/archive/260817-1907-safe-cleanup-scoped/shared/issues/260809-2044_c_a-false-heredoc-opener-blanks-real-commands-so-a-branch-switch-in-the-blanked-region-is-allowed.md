# A false heredoc opener blanks real commands, so a branch switch inside the blanked region is allowed

---

**Severity:** High — a deny became an allow for text bash really executes; regression from `69a2d00`
**Domain:** code
**Filed by:** coderev (incremental review of `6b94e17..HEAD`)
**Affects:** `hooks/lib/shell-parse.ts:376` (`out += hd.strip ? blankData(body) : blankHeredocBody(body)`), reached from `stripDataRegions` → `classifyGitCommand`. The git branch policy only; the protected-path measurement is unaffected because it measures rather than reads the command.
**Cross-references:**
`fusion-workbench/shared/issues/260809-1111_c_a-plain-line-in-an-unquoted-heredoc-body-is-classified-as-a-command.md` (the defect `69a2d00` closed),
`rules/git-branch-discipline.md:18` and `:20` (both claims are falsified by this),
`hooks/lib/__tests__/shell-parse.test.ts`, `hooks/lib/__tests__/git-branch-guard.test.ts` (neither reaches this shape)

---

## What is wrong

`69a2d00` changed an unquoted-delimiter heredoc body from *kept as code* to
*blanked except its `$(…)` / backtick regions*. The change is right about a
**real** heredoc body: bash writes it to the redirect target and executes
nothing there but substitutions.

It is wrong wherever `stripData` decides a `<<WORD` is a heredoc opener and bash
does not. `stripData` has no model of comments and no model of arithmetic, so it
takes `<<` in either context as a redirect, pushes a pending heredoc, and — at
the next newline — blanks everything up to the first line equal to the delimiter
it parsed. Before `69a2d00` that text survived as code and was still classified.
Now it is erased before the segmenter ever sees it.

Two shapes reach it, both with the `<<` in genuine code position:

1. a `#` comment naming a heredoc, in a command that later uses the same
   delimiter;
2. an arithmetic left shift, `$((a<<b))`, where a later line reads exactly `b`.

## Measured

Classifier verdicts, HEAD `dist` vs. the `dist` committed at `69a2d00^`:

```
# write config with <<EOF
git switch main
cat > cfg <<EOF
value=1
EOF
```

    69a2d00^  => DENY
    HEAD      => allow

```
echo $((1<<2))
git switch main
2
```

    69a2d00^  => DENY
    HEAD      => allow

`stripDataRegions` at HEAD for the first case returns
`"# write config with <<\n               \n               \n       \nEOF"` —
the `git switch main` line is spaces.

Both scripts were run with the branch switch replaced by `touch RAN`, under
`bash 3.2` and `zsh 5.9`: the marker file is created in every run. The line the
classifier blanks is a line the shell executes.

## Why the fail-closed argument does not cover it

`blankHeredocBody`'s own fail-closed bias (unbalanced `$(`, unpaired backtick)
protects the *inside* of a body that really is a body. The failure here is one
level up: the region was never a body. `findHeredocTerminator` returning -1 is
the only fail-closed exit `stripData` has for a mis-parsed opener, and it does
not fire when the delimiter text happens to reappear — which is exactly what a
comment mentioning a heredoc arranges.

## Suggested direction

Two candidates, neither obviously dominant; pick with a decision record if the
second is chosen.

- **Skip `#` comments in `stripData`.** A `#` at the start of a word in code
  position runs to end of line. This removes shape 1 and is a small, contained
  addition to a lexer that already tracks quoting. It does nothing for shape 2.
- **Do not treat `<<` inside `$((…))` / `((…))` as a heredoc.** Removes shape 2.
  Requires the lexer to track arithmetic spans, which it does not today.

A cheaper partial mitigation, if neither lands: when a heredoc's body is blanked
under an *unquoted* delimiter, still classify what was blanked and deny on it —
i.e. restrict the `69a2d00` relaxation to bodies whose opener the lexer is
confident about. That reintroduces the false deny `260809-1111` fixed, so it is
listed for completeness rather than recommended.

Whatever lands, `rules/git-branch-discipline.md` needs its two claims narrowed:
line 18 says the guard "blanks what bash does not execute", and line 20 says
"a compound command hides no segment from the classifier". Both are false in the
shapes above.

## Acceptance criteria

- [x] `# … <<EOF\ngit switch main\n… <<EOF\n…\nEOF` denies.
- [x] `echo $((1<<2))\ngit switch main\n2` denies.
- [x] `cat <<EOF\ngit switch main\nEOF` still ALLOWS — the `260809-1111` case
      must not regress.
- [x] `cat <<EOF\n$(git switch main)\nEOF` still denies.
- [x] Both new cases sit in `hooks/lib/__tests__/git-branch-guard.test.ts` next
      to the `260809-1111` case, naming this record.
- [x] `rules/git-branch-discipline.md` states the residual, or the claims are
      narrowed to what the lexer can carry.

---
Resolved: `6fae676` (criteria 1-5) and `97d5846` (criterion 6), verified at HEAD by the
reconciler (260809-2252). The record was closed by rename with no resolution note and with all
six criteria unticked; the ticks above and this footer are the reconciler's. Verification was by
rebuilding the differential the implementing agent never committed, compiling `6fae676^` beside
HEAD and driving both classifiers over one corpus, plus end-to-end runs through the shipped
`PreToolUse` hook from a scratch project root outside this repository (so the self-detect
stand-down did not mask the result).

- Criteria 1 and 2 — CONFIRMED, measured through the real hook: both the comment-borne and the
  arithmetic `<<` shapes BLOCK at HEAD and allowed at `6fae676^`.
- Criteria 3 and 4 — CONFIRMED. The `260809-1111` contract is intact: a plain heredoc body still
  allows, `$(git switch main)` in that body still denies.
- Criterion 5 — CONFIRMED. `hooks/lib/__tests__/git-branch-guard.test.ts:1264` and `:1274`, both
  naming this record, sitting directly under the `260809-1111` block at `:1196`.
- Criterion 6 — CONFIRMED, by `97d5846` rather than by `6fae676`.
  `rules/git-branch-discipline.md` now names the six spans, states that emitting rather than
  removing bounds a wrong guess ("costs a false deny and never an allow"), and cites this
  record as closed.

**The commit's direction claim holds; its count does not, and the count was measuring itself.**
"Exactly six verdicts moved, all toward deny" was re-derived over 47,722 comparisons across four
corpora (HEAD suites plus 87 adversarial cases, a 6,000-case template cross-product, and 40,000
seeded fuzz cases). **Not one verdict moved toward allow anywhere** — the strong half of the
claim survives, and it has a structural reason behind it: a suspended span only makes the
scanner skip bytes, so the new lexer recognises a strict subset of the old lexer's heredoc
openers, which means less blanking and more text classified. The "six", however, is an artifact:
run the same differential against the test suites **as they stood before the commit** and *zero*
verdicts move. The six the original harness counted were the six cases `6fae676` itself added.
The number is not evidence about the fix's reach over pre-existing coverage, and it is not
reproducible — that harness was never committed.

**The six spans are a real count, but of what the commit added, not of the lexer's coverage.**
All six are countable syntactic productions at `hooks/lib/shell-parse.ts:453` (comment) and
`:257`, `:263`, `:268`, `:277`, `:287` (the five arms of `scanNonTokenizedSpan`), and each was
re-confirmed against bash 3.2.57. The number of contexts at HEAD in which a `<<` does not open a
heredoc is **eleven** — those six plus backslash-escape pairs, single quotes, double quotes, the
`<<<` here-string and an already-open heredoc body, all five predating the commit.

**A live gap of this record's own class survives and is filed separately.** `((` is recognised
only at a word start, so `if((1<<2))` with no blank defeats it and the guard allows a
`git switch` on the next line — same shape as this record, different entry.
`shared/issues/260809-2300_o_the-arithmetic-command-span-is-recognised-only-after-a-blank-so-if-and-for-defeat-it.md`.
