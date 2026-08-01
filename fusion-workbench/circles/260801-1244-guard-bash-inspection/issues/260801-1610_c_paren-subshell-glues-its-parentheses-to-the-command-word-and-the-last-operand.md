A `(…)` subshell glues its parentheses to the command word and the last operand, hiding both from every classifier

---

`shell-parse` models `$(…)` and backtick substitution but not the plain `(…)` subshell. The
parentheses are ordinary characters in the segment text, so `tokenize` leaves them glued to
the words they touch:

```
(rm rules/x.md)   ->  ["(rm", "rules/x.md)"]
```

`(rm` is not a recognised verb (`programName` returns `(rm`), so the segment classifies as an
unrecognised program and **`(rm rules/x.md)` is ALLOWED**. Even when the command word survives,
the last operand carries a trailing `)` — `( rm rules/x.md)` writes `rules/x.md)`, which
matches `rules/**` only by accident (the glob's `.*` swallows the paren) and would miss a
non-glob pattern such as `hooks/config.json` outright:

```
(cd hooks && rm config.json)   ->  ALLOWED   (operand is `config.json)`)
( cd hooks && rm config.json ) ->  denied
```

Verified by probe against the built classifier, not inferred.

The same hole is in the **git branch classifier**, and predates this Circle: `(git switch main)`
tokenizes to `["(git", "switch", "main)"]` and the command word is `(git`.

---

**Context.**

Found while implementing virtual working directory tracking (plan step 4, Circle
`260801-1244-guard-bash-inspection`). Not introduced by step 4 — the mutation classifier has
behaved this way since step 2, and the git half is older still.

Step 4 handles the glued form for ONE word only: `applyDirEffect` strips a leading `(` before
looking for a directory builtin, because the subshell-scoping requirement (`(cd rules && ls)`
must not leak) is unreachable otherwise. That strip is deliberately not extended to
`verbOperands`, because doing so widens the deny surface and belongs at a gate.

**Exposure.** A one-character bypass of the whole verb table, in exactly the shape the guard
exists to stop: `(rm rules/x.md)` runs `rm rules/x.md`. It is at least as reachable as the
`cd` case step 4 was written to close.

**Where the fix belongs.** Two options, in `bash-mutation-guard.ts` alone or in `shell-parse.ts`
for both classifiers:

1. **Local (narrow).** Strip a leading run of `(` from the command word in `verbOperands` the
   way `applyDirEffect` already does, and strip the trailing `)` characters that the paren
   tracker accounted as closes for that segment (so a file genuinely named `x)` outside a
   subshell is untouched). Fixes the mutation classifier only.
2. **Parser (broad).** Teach `scanSegments` that an unquoted `(` opens a subshell and `)`
   closes it, emitting the body at `depth + 1` as `$(…)` already does. Fixes both classifiers
   and would let `bash-mutation-guard` delete its own paren counting — but it changes blank
   mode, so the 84-case git suite and the blank-mode equivalence assertion must be re-checked,
   the same care the backslash-continuation fix needed.

**Pinned in the suite meanwhile.** `hooks/lib/__tests__/bash-mutation-guard.test.ts`, describe
block *"virtual cwd — the residuals, asserted so they stay visible"*, asserts the current
(allowing) behaviour and cites this file. Fixing it makes those cases fail, which is the
intended signal.

---
Resolved: fixed in the PARSER half (option 2's location, option 1's mechanism) —
`shell-parse.ts` `tokenize` now peels a leading run of `(` and a trailing run of `)` off
every word, so both classifiers are fixed by one change. `scanSegments` was NOT taught
the subshell, which is what keeps the blast radius small: segment TEXT is untouched, so
blank mode still reproduces the historical segmentation and the step-4 paren counter in
`bash-mutation-guard.ts` — which reads the text, not the tokens — still sees every
parenthesis it has to balance. The `$(…)` filler is exempt, since its balanced pair is
not shell grammar. The now-redundant `^\(+` strip in `applyDirEffect` was removed.
Verdicts that changed: `(rm rules/x.md)` and `(rm rules/x.md )` allow → DENY (the
one-character bypass of the verb table), `(git switch main)` allow → DENY,
`(cd hooks && rm config.json)` allow → DENY. The 72-command must-never-deny corpus
passes in full, including `(cd hooks && rm -rf dist)`.
The suite's pinning block was replaced by "a (…) subshell no longer hides its command or
its last operand" in `hooks/lib/__tests__/bash-mutation-guard.test.ts`, plus tokenize
cases in `shell-parse.test.ts` and a subshell block in `git-branch-guard.test.ts`.
