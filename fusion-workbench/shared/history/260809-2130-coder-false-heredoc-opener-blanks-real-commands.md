# coder — the false heredoc opener, answered as a class

**Status:** Complete
**Date:** 2026-08-09
**Source record:** `260809-2044_*_a-false-heredoc-opener-blanks-real-commands-so-a-branch-switch-in-the-blanked-region-is-allowed.md`
**Review that filed it:** `260809-2050-coderev-guard-and-hooks-turn-6b94e17-to-head.md` (H1, release blocker)
**Regression from:** `69a2d00`

---

## The class

The record named two shapes. They are two members of one class, and the class
has six.

`stripData` modelled exactly one axis — quoting — and read every other byte as
code where operator recognition applies. Bash suspends its tokenizer in a whole
family of spans, and in each of them a `<<WORD` is not a redirect. Recognising
one there pushed a pending heredoc, and the blanking then ran from the false
opener to the first line equal to the delimiter, erasing commands the shell
really executes.

Every member confirmed against bash 3.2 by running the shape with `touch RAN`
where the blanked command stood, and checking the marker appeared:

| Span | Shape |
|---|---|
| comment | `# … <<EOF` |
| arithmetic expansion | `$((1<<2))` |
| arithmetic command | `(( 1<<2 ))` |
| deprecated arithmetic | `$[1<<2]` |
| parameter expansion | `${x:-<<EOF}` — carries `${a[i<<1]}` with it |
| array-assignment subscript | `a[1<<2]=v` |

Three near-misses were measured too, and the lexer was already right about all
three: `x=1<<2`, `let x=1<<2` and `echo a[1<<2]` really are heredoc redirects to
bash. That is why the subscript rule requires the trailing `=` — without it the
word is a glob, not a subscript.

## The fix

`hooks/lib/shell-parse.ts`.

- `scanNonTokenizedSpan` recognises the family and `stripData` steps over it.
- Every span is emitted **verbatim**. Nothing new is blanked — a comment is left
  where it stood — so a span boundary guessed wrong can only hand MORE text to
  the classifier, never less. That is the whole fail-closed argument: a mis-parse
  here costs a false deny, never an allow on a line the shell runs.
- `findBalancedClose` is now the module's one bracket scan; `findSubstitutionClose`
  is it with `(`/`)`, so the extent `blankHeredocBody` keeps, the extent
  `extractCommandSegments` lifts and the extent `stripData` steps over are one
  extent by construction. `blankHeredocBody` itself is untouched.

## Verified

- **End to end through the built `PreToolUse` hook**, not by reading: all six
  false openers BLOCK; both `260809-1111_*_a-plain-line-in-an-unquoted-heredoc-body-is-classified-as-a-command.md` cases behave (plain body line allows,
  `$(…)` and backtick in the body deny); both quoted-delimiter cases allow.
- **Differential against the `dist` committed at HEAD**, 690 commands harvested
  from both suites plus a hand-built set aimed at the new spans: exactly 6
  verdicts moved, all `allow → DENY`, all of them the intended shapes. No other
  verdict moved in either direction.
- **`npm test` green — 1143 passed** (1127 at HEAD, 16 added).

## Reported, not fixed

`rules/git-branch-discipline.md:18` and `:20` — see the report to the
orchestrator. Both hold again for every measured shape; neither is warranted as
the universal claim it reads as, and `:18` is now inaccurate in a second,
harmless direction because a comment is something bash does not execute and the
guard deliberately no longer blanks it. A later task in this Turn owns that file.
