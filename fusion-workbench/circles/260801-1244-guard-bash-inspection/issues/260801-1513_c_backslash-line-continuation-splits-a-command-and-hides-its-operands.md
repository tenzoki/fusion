A backslash line continuation splits a command in `shell-parse`, hiding its operands from both classifiers

---

`shell-parse.ts` does not honour a `\`-at-end-of-line continuation. `stripData` emits the
backslash-newline escape pair verbatim (`hooks/lib/shell-parse.ts:197-202`), and
`scanSegments` then treats the newline as a command terminator
(`hooks/lib/shell-parse.ts:547-551`). A continued command therefore arrives as two segments,
and everything after the continuation is no longer an operand of the verb on the first line.

Both classifiers lose cases to this:

- **Mutation classifier.** `rm \` + newline + `rules/x.md` is ALLOWED. Segments are
  `["rm \\", "rules/x.md"]`: the first is a bare `rm` with no operands, the second has
  `rules/x.md` in command position, which is not a recognised verb. Same for
  `mv \` + newline + `rules/x.md /tmp/`. Verified by probe, not inferred.
- **Git branch classifier (pre-existing).** `git worktree \` + newline + `add ../wt x` is
  ALLOWED, because the first segment is a bare `git worktree` with no subcommand.
  `git switch` and `git checkout` survive only by accident — the bare verb denies on its own.

---

**Context.**

Found while writing the classifier's unit suite (plan step 3, Circle
`260801-1244-guard-bash-inspection`). Not introduced by this Circle: the defect is in the
shared parser, and its git half predates the extraction in step 1.

**Exposure.** The user's global output convention forbids backslash-newline continuations in
emitted shell commands, so a fusion agent in this project is unlikely to produce one by
habit. That convention is not a guard, does not bind other consuming projects, and does not
bind an agent that is deliberately routing around the check.

**Where the fix belongs.** `shell-parse.ts`, in `stripData`: a `\` immediately followed by a
newline should be consumed (emitting nothing, or a single space) rather than passed through,
so the continuation never reaches the segmenter. That is one branch in the existing
backslash-escape case. It is a behavioural widening of both classifiers' deny surfaces, so it
belongs at a gate rather than in an unreviewed commit — which is why this is an issue and not
a fix. Blank-mode equivalence against the 84-case git suite must be re-checked, since the
change alters blank mode too.

**Pinned in the suite meanwhile.** `hooks/lib/__tests__/bash-mutation-guard.test.ts`, describe
block *"KNOWN GAP — a backslash line continuation hides the operands"*, asserts the current
(allowing) behaviour and cites this file. Fixing the parser makes those cases fail, which is
the intended signal.

---
Resolved: `stripData` (`hooks/lib/shell-parse.ts`) now splices a `\`-at-end-of-line
continuation out of the command before segmentation, the way bash removes it before
tokenization — nothing is emitted in its place, so `rm \`+newline+`x` is `rm x` and
`rm\`+newline+`x` is `rmx`. Spliced in code position and inside double quotes; left
literal inside single quotes (the quotes suppress the escape) and inside a heredoc
body (data, sliced whole, never reinterpreted). `\\` before a newline is still one
escaped backslash followed by a real terminator, not a continuation.

`git worktree \`+newline+`add ../wt x` and `rm \`+newline+`rules/x.md` now DENY.
The 84-case git suite and the blank-mode equivalence assertion are unchanged and
green; a differential run of the old against the new `stripDataRegions` over 38,312
generated quote/escape/heredoc combinations found differences ONLY on inputs
containing a backslash-newline, so the shipped git classifier changed in no other
way. The pinned KNOWN-GAP block in `bash-mutation-guard.test.ts` is flipped to
assert the fixed behaviour, and the quoting / escaped-backslash / heredoc / `$(…)`
boundaries are pinned in `shell-parse.test.ts`.
