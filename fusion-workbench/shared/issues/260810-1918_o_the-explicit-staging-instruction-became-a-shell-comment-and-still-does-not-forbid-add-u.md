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

**Filed by:** coderev, review of session `260810-1646` Turn 1, range `5ef92eb..940d522`.
