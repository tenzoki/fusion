# Coder — a backslash line continuation is spliced, closing the operand-hiding bypass

**Date:** 260801-1535
**Agent:** coder
**Circle:** `circles/260801-1244-guard-bash-inspection`
**Issue:** `issues/260801-1513_c_backslash-line-continuation-splits-a-command-and-hides-its-operands.md`
**Status:** Complete

## What was implemented

One change in `hooks/lib/shell-parse.ts`, in `stripData` — the pass that already runs
before segmentation and before tokenization, which is exactly where bash removes a line
continuation. Nothing is emitted in its place, because bash splices with no separator at
all: `rm \`+newline+`x` is `rm x` (the space came from before the backslash) and
`rm\`+newline+`x` is `rmx`.

Two sites, one rule:

- **Code position** — the existing backslash-escape branch gained a leading test for a
  following newline. The pair is consumed and nothing is emitted.
- **Inside double quotes** — the double-quoted span used to be copied out with
  `command.slice(i, j + 1)`. It is now accumulated character by character so the
  continuation can be dropped, since bash removes it inside double quotes too. Every
  other escape pair is copied verbatim, so a span with no continuation is byte-identical
  to what the slice produced.

Nothing else moved. `scanSegments` and `extractCommandSegments` still treat a newline as
a command terminator — correctly, since by the time they see the string there is no
continuation left in it.

## The four boundaries

- **Single quotes suppress the escape**, so a continuation inside them is literal text.
  This falls out of the existing structure rather than needing a branch: a single-quoted
  region is consumed whole by `indexOf("'", …)`, so the character loop never walks its
  body. Capture mode hands the literal back with the pair intact; blank mode blanks it.
- **`\\` before a newline is not a continuation.** The two backslashes are consumed
  together as one escaped backslash, so the newline after them reaches the segmenter as a
  real terminator. `rm \\`+newline+`rules/x.md` stays ALLOW, which is right: bash runs
  `rm \` and then `rules/x.md`, and nothing writes a protected path.
- **A heredoc body is data and is not reinterpreted.** Bodies are sliced whole in the
  pending-heredoc branch, so the splice never touches them — a quoted-delimiter body is
  blanked as before, an unquoted one is retained as code with its continuation intact.
- **Capture mode's `$(…)` filler is unaffected.** `stripData` runs before segmentation, so
  a continuation inside a substitution body is spliced and the filler still lands in the
  outer segment: `rm \`+newline+`$(echo \`+newline+` x)` parses to `rm $(…)` at depth 0
  and `echo  x` at depth 1.

## Verification

- `npm test` in `hooks/`: **553 passed**. The pre-change baseline was 523; the 15th test
  file and 16 of the extra tests are the concurrent `guard.ts` work, 14 are mine.
- `npx tsc --noEmit`: clean.
- The 84 git cases and the blank-mode equivalence assertion are green and their files
  untouched. Equivalence holds by construction — both sides of that assertion run through
  the same `stripData` — and the harvested corpus contains no backslash at all, so no git
  verdict could have moved. Four continuation shapes are now pinned against the legacy
  segmenter directly, since the corpus does not cover them.
- **Differential against the shipped parser.** The old `stripDataRegions` was checked out
  beside the new one and both were run over 38,312 generated commands (3-atom
  combinations of 26 shell atoms, then 4-atom combinations of a 12-atom quote/escape/
  heredoc set). Outputs differed on 6,582 of them and **every** difference was on an input
  containing a literal backslash-newline; zero unexplained. That is the evidence for the
  claim that the double-quote rewrite is byte-neutral and the git classifier changed in no
  way beyond closing this bypass.

## Behaviour changes

| Command | Before | After |
|---|---|---|
| `git worktree \`+nl+`add ../wt x` | ALLOW | **DENY** |
| `rm \`+nl+`rules/x.md` | ALLOW | **DENY** |
| `mv \`+nl+`rules/x.md \`+nl+`/tmp/` | ALLOW | **DENY** |
| `rm "rules/\`+nl+`x.md"` | ALLOW | **DENY** |
| `echo \`+nl+`rm rules/x.md` | DENY | **ALLOW** |
| `git switch \`+nl+`main` | DENY | DENY (was denying on the bare verb) |

The last-but-one row is the only **narrowing**, and it is a correctness fix, not a
regression: in bash the `rm` there is an argument to `echo`, no `rm` runs, and the old
DENY came from the same defect — the second line being read as a command in its own
right. Both classifiers are affected identically.

## Files

- `hooks/lib/shell-parse.ts` — the fix (+36 lines, mostly comment).
- `hooks/lib/__tests__/bash-mutation-guard.test.ts` — the pinned KNOWN-GAP block flipped
  to assert the fixed behaviour, plus three boundary cases (escaped backslash, single
  quotes, double quotes) at the classifier level.
- `hooks/lib/__tests__/shell-parse.test.ts` — a new describe block, 11 cases, pinning the
  splice in both modes, the no-separator rule, the `\\` boundary, a lone trailing
  backslash, both quote kinds, both heredoc kinds, the `$(…)` filler, and the legacy
  equivalence for continued commands.

`hooks/guard.ts` (concurrent edit), `hooks/lib/bash-mutation-guard.ts`, `hooks/dist/` and
the plugin version were not touched.
