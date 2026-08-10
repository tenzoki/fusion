Moving `git add` inside the lock wrapper changes the directory it runs in, and the prompt does not say so

---

`agents/orchestrator.md:424` now stages and commits through
`fusion-commit-lock with orchestrator -- bash -c 'git add … && git commit -F …'`.
`bin/fusion-commit-lock:319-321` resolves the workbench root and runs `cd "$root"` **before**
executing the command. The four-command form it replaced ran `git add` in the agent's own working
directory.

Step 4 (`:419-421`) tells the orchestrator to write every staging path out in full, and never says
which directory those paths are relative to.

---

**Why the difference can bite.** `rules/fusion-workbench-conventions.md` `## fusion-workbench Layout`
states it explicitly: *"The `fusion-workbench/` is anchored to the directory where setup was run —
the working directory `pwd` reports, not necessarily the git toplevel."* So a project may legitimately
have its workbench root one or more levels below the git toplevel. In that project:

- the orchestrator composes its staging list from tool output — `git diff --name-only`, an executor's
  reported file list — which is relative to the **git toplevel**;
- the wrapper runs `git add` at the **workbench root**;
- `git add` fails with `pathspec … did not match any files`, the `&&` short-circuits, no commit is
  made, and the lock is released cleanly.

The failure is loud rather than silent, which is the good half. The bad half is that it presents as
"the commit step failed" at the end of every task in that project, with nothing in the prompt
pointing at the cause, and the obvious repair an agent reaches for is a directory argument or `-A` —
the exact shape Step 4 just spent a paragraph forbidding.

**Not new, but newly load-bearing.** `skills/commit/SKILL.md:102` and `skills/cleanup/SKILL.md:104`
already run this shape, so they carry the same unstated assumption. Step 3b is the one that runs
after every task in every session.

**Fix direction.** One sentence in Step 4, not a code change: say that the paths are resolved from
the workbench root, because `with` runs its command there, and that a session whose working directory
is not the workbench root must write them accordingly. If that is thought too subtle to leave to
prose, the alternative is `--` a command that `cd`s itself, but that reintroduces a shell string the
step is trying to keep simple.

Worth deciding at the same time whether `fusion-commit-lock with` should `cd` at all, or should run
the command in the caller's directory and let only its own lock bookkeeping be root-anchored. The
current behaviour is undocumented in `rules/workbench-stash-and-lock.md` `## Commit lock` as well.

**Cross-references.** `agents/orchestrator.md:419-431`; `bin/fusion-commit-lock:307-332`;
`rules/workbench-stash-and-lock.md` `## Commit lock`;
`shared/issues/260810-2025_o_the-lock-rules-worked-example-names-a-site-that-no-longer-uses-the-form-it-illustrates.md`.

**Filed by:** coderev, review of session `260810-1646` Turn 2, range `da8c9db..b3cc034`.
