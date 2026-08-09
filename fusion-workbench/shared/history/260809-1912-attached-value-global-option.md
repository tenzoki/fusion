# Session: an attached-value global option stops consuming the next word

**Date:** 2026-08-09 19:12
**Agent:** coder
**Status:** Complete

## What was asked

Task 6 of `fusion-workbench/tasklist.md` (`I:260809-1548-attached-option`), from
`shared/issues/260809-1548_p_an-unknown-global-option-carrying-its-own-value-should-not-also-consume-the-next-word.md`.
The resumed global-option walk in `classifySegment` set `unknownOption = true` for every
unrecognised `-`-prefixed token, so it skipped the following token as a possible value. For
the attached form (`--exec-path=/x`) the value is already inside the token, so the skip was
wrong and cost three of the ten measured false denials.

Folded in by the dispatch: repair the comment in `classifyGitCommand` that commit `69a2d00`
left false, which still claimed unquoted heredoc bodies are preserved as code.

## What was done

### The one-line case split

`hooks/lib/git-branch-guard.ts`, the unknown-option branch of the walk:

```ts
unknownOption = !t.includes("=");
```

A token carrying `=` is complete in itself, so the next bare word is git's real subcommand
and the walk stops there — exactly where the pre-`9716ee5` walk stopped. The test is `=` in
the token rather than a table of options that take attached values: a table would carry the
same "every option git has not shipped yet" defect that this section already refuses to
close by adding a row.

The four options the walk names (`-C`, `-c`, `--git-dir`, `--work-tree`) are matched before
this line and never reach it, `--git-dir=x` included.

### Why it opens nothing

Structural, not empirical. The failure mode the resumed walk exists to close is an option
whose value stands **separately**, in the position a subcommand would occupy. An
attached-value option has no such word, so it cannot be the form that hides a subcommand.
A command whose verdict moves is therefore one of two things: an ordinary invocation git
reads correctly (`git --exec-path=/x grep switch` — the false deny), or a command git
itself refuses because the word it reads as the subcommand is not one.

The monotonicity the docblock rests on survives: at an attached-value token the walk now
stops where the `451a07e` walk stopped, so the candidate set is still a superset of the
baseline's and the change can still only ADD denies against it.

### The heredoc comment

The comment in `classifyGitCommand` claimed "code regions where bash DOES expand (double
quotes, unquoted heredocs) are preserved". Since `69a2d00` only the `$(…)` and backtick
regions of an unquoted-delimiter body survive; the prose around them is blanked
(`blankHeredocBody`, `hooks/lib/shell-parse.ts`). The comment now says that, and names why
the body is data: it is written to a file, not run, and keeping it as code denied an agent
documenting this policy in a runbook.

## Verification

**The corpus measurement, re-run.** The 1143-row sweep behind the recorded 145 was never
committed, so it was rebuilt — and not guessed freely. The recorded figures determine its
shape almost uniquely: with `v` flagging globals, `m` mis-read tails, `s` separated-value
globals and `d` denying tails, `135 = s·d`, `10 = v·m`, `3 = a·m` (`a` = attached-value
globals, `a ≤ v`) and `s + v ≤ 17` force `m = 1`, `v = 10`, `a = 3`, `s = 5`, `d = 27`,
leaving two globals that flag nothing. 17 × 67 = 1139, and the record's 1143 leaves four
hand-written controls. Classified under the `451a07e` classifier, the HEAD (`d8bbc73`) one
and the working tree, all three compiled from source rather than read out of `hooks/dist`:

| | newly allowed | newly denied | of those, move HEAD | accepted cost |
|---|---|---|---|---|
| HEAD `d8bbc73` | 0 | 145 | 135 | 10 |
| working tree | 0 | 142 | 135 | 7 |

Exactly three rows move between HEAD and the working tree, all deny → allow, all of them
the attached form: `git --exec-path=/x grep switch`, `git --namespace=ns grep switch`,
`git --attr-source=HEAD grep switch`.

The decomposition reproducing 145 = 135 + 10 and 142 = 135 + 7 is the evidence that the
rebuilt row set has the original's structure. It is a **reconstruction**, so read the
absolute numbers as "the recorded measurement reproduces" rather than as bytes from the
original script. The two facts that do not depend on the row set are that no row was newly
allowed and that only attached-value rows moved.

**The committed corpus is untouched and green.** `fixtures/git-corpus-451a07e.json` was not
regenerated and `helpers/git-corpus.ts` was not edited. Its `GLOBALS` carry no
attached-value unknown option, so no corpus verdict moves and all four describes pass,
including the two anti-vacuity ones.

**New tests.** One describe block, five cases
(`an attached-value global option does not also consume the next word (260809-1548)`): the
three rows that flip; the same option in front of a real subcommand, which must still deny
and is the block's anti-vacuity; the separated form (`--namespace ns switch main`), which
must not move or the walk is back at `260809-1106`; the four named options, with the
`--git-dir=` fail-closed path checked against a resolver that would otherwise allow; and
the `-C`-hint collection with an attached option standing in front of it.

The existing cost test lost `git --exec-path=/x grep switch` from its deny list and says
where it went. `git --no-pager grep switch` — the one form somebody plausibly types — stays
denied, as the issue said it would.

**Full suite:** `npm test` in `hooks/` — 35 files, 1145 tests, 0 failures, 104 s.

**One golden regenerated.** `rules/git-branch-discipline.md` grew 8846 → 9512 bytes, which
`rules-emission-golden.test.ts` pins. Regenerated by its own documented command
(`UPDATE_RULES_GOLDEN=1`), reviewed as a diff: one file's size and each agent's total, no
path-set or ordering change. Task 10 rewrites that rule file and will move the number
again.

## Files changed

- `hooks/lib/git-branch-guard.ts` — the case split, two docblock sections (the new
  attached-value section and the cost/bound wording), the heredoc comment repair
- `hooks/lib/__tests__/git-branch-guard.test.ts` — one new describe block (5 cases), cost
  test narrowed
- `rules/git-branch-discipline.md` — `## One deny you will not have expected` only
- `hooks/lib/__tests__/fixtures/rules-emission.golden` — regenerated for the line above
- `fusion-workbench/tasklist.md` — task 6 `[x] done`

## Open for the orchestrator

- Not committed, per the dispatch. `hooks/dist/` is rebuilt (`npm test` runs the build).
- The issue record was left `_p_` and unrenamed, as the dispatch instructed.
- The scope note held: nothing outside `## One deny you will not have expected` was touched
  in the rule file, so task 10 still meets it otherwise unmodified.
