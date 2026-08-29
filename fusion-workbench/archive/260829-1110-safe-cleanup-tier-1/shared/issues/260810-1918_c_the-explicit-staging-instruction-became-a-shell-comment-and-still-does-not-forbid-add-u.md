The explicit-staging instruction became a shell comment, and it still does not forbid `git add -u <dir>`

---

Two things happened to the same instruction in one session, and they point opposite ways.

**It lost its standing.** Before `a7d02da`, Step 3b carried a numbered step of its own:

> 4. **Stage files:** Add only task-relevant files + fusion-workbench tracking updates. Never
>    `git add -A`. Be explicit.

After it, the text survives only as two comment lines inside a fenced block
(`agents/orchestrator.md:422-423`):

```bash
git add <file> <file>          # explicit paths only — task-relevant files
                               # + fusion-workbench tracking updates. Never `git add -A`.
```

A numbered step is an act the prompt asks for; a comment beside a placeholder is annotation on an
example. This project has a record of exactly that distinction mattering — the drift-check design
(`agents/orchestrator.md` `### Drift check`, gated by `state-drift-detection-lint.test.ts`) exists
because an obligation standing beside an act gets skipped while one riding the act does not.

**And `f38f37d`, in the same session, asserts the instruction that just lost its standing would have
prevented the error it repairs:**

> The cause is the directory-wide `-u`, which is what `agents/orchestrator.md` Step 3b's "stage only
> task-relevant files, never `git add -A`, be explicit" already forbids in substance.

It does not forbid it, in substance or otherwise. The prohibition names one flag, `-A`. The command
that caused the loss was `git add -u fusion-workbench/shared/issues/`, which is a different flag,
and "be explicit" is advice rather than a rule an executor can check itself against. Three `_o_`
records left HEAD for one commit because the instruction says less than the commit message claims
it says.

---

**Failure scenario.** An executor stages a directory of workbench records with `git add -u <dir>`
after renaming `_o_` → `_p_`. The successors are untracked, so `-u` records three deletions and adds
nothing. HEAD carries the gap until somebody notices; a clone taken in that window has it
permanently. This is not hypothetical — it is `f38f37d`, this session, and the working tree is the
only reason nothing was lost.

**Fix direction.** Restore the staging instruction as a numbered step, and state the rule by shape
rather than by flag: *every path passed to `git add` is written out; no `-A`, no `-u`, no directory
argument, no glob.* That form is checkable by the executor before it runs the command, which
"be explicit" is not.

**Cross-references.** `f38f37d` (the repair), the three restored records
`shared/issues/260810-050{1,2,3}_c_*`.

**Filed by:** coderev, review of session `260810-1646-orchestrator-session.md` Turn 1, range `5ef92eb..940d522`.

---

**Resolved:** as the fix direction asks, on both halves.

*Standing.* The instruction is a numbered step again — `agents/orchestrator.md` step 4, "Assemble
the staging list". It sits before the locked command rather than inside it, because staging must
stay in the same acquisition as the commit (a path staged outside the lock can be absorbed by a
parallel committer). So the step produces the list and step 5 runs it: the obligation rides an act
the prompt asks for, not a comment beside a placeholder.

*Shape rather than flag.* "Never `git add -A`" is replaced by *every path passed to `git add` is one
you wrote out yourself — no `-A`, no `-u`, no directory argument, no glob, no `.`*, which an
executor can check against its own command before running it. A rename is called out as two paths,
since marker renames are the orchestrator's most frequent write. `f38f37d` is cited as the
measurement, with the reading the review corrected: `-A` is one instance of the hazard, the
directory argument is the hazard.

Reproduced in a scratch repository: `git add -u <dir>` after renaming a record inside it stages
`D <old>` and leaves the successor untracked; `git add <old> <new>` stages
`R <old> -> <new>`.

Note for the next author: the commit that caused this could not be quoted verbatim in the prompt.
`path-literal-lint.test.ts` rejects a store-path literal in `agents/*.md`, and it caught the first
draft of that bullet (`agents/orchestrator.md:421`, literal `issues/`). The command is described
rather than shown.
