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

---

Resolved — Step 3b names the directory and requires absolute paths. Measured first, then written.

**What the directory is.** `bin/fusion-commit-lock`, the `with` branch, calls `resolve_root` and
`cd "$root"` before running the command after `--`. `resolve_root` runs `bin/fusion-workbench-root`,
which walks up from the *caller's* working directory to the nearest ancestor holding
`fusion-workbench/.fusion-setup` and prints it. So the command runs at the **workbench root** — the
directory that contains `fusion-workbench/`, not the workbench directory itself and not the git
toplevel — and which directory that is depends on where the call was made, though the answer is
deterministic once it is.

**Measured on a scratch copy, never in this tree.** A throwaway repository was built with the git
toplevel at `repo/`, the workbench root at `repo/sub/`, and the caller at `repo/sub/deeper/`. Results:

| Staging list written as | Result |
|---|---|
| `pwd` of the wrapped command | `repo/sub` — the workbench root, as read from the source |
| toplevel-relative (`sub/a.txt`) | exit 128, `pathspec … did not match any files`, nothing staged |
| caller-relative (`../a.txt`) | exit 128 — it resolves against `repo/sub`, not against `repo/sub/deeper` |
| workbench-root-relative (`a.txt`) | exit 0, stages `sub/a.txt` |
| **absolute** | exit 0, stages a file under the workbench root *and* one above it (`top.txt`) |
| `:/`-prefixed magic pathspec | exit 0, same result |
| marker rename as two **absolute** paths | exit 0, recorded `R100` — old deleted, new added, as one rename |
| the same rename as toplevel-relative paths | exit 128, nothing staged |

A full `git add … && git commit -F …` through the wrapper with absolute paths landed the commit with
both files.

**Why absolute and not workbench-root-relative.** Both work, and only one of them survives the
question "relative to what?" being asked later. An absolute path means the same thing whichever
directory the wrapper landed in, it reaches a file above the workbench root as easily as one below
it, and it costs the orchestrator nothing: the executor report shape already requires absolute paths
for changed files, and `$WORKBENCH` from Setup step 2 is absolute for the tracking updates. The `:/`
magic pathspec is equally correct and was rejected as obscure — it would need its own explanation at
every site that used it. Root-relative paths were rejected because they read exactly like the
toplevel-relative ones that fail, which is the confusion the finding is about.

**Where it is stated.** `agents/orchestrator.md` Step 3b item 4 gained one bullet: the directory,
why it is that directory, the failure it produces in a project whose workbench root sits below the
git toplevel, the measurement above, and the instruction not to repair a pathspec failure with a
directory argument or `-A`. Step 3b step 5's command now spells its placeholders `<absolute-path>`,
so the shape is visible in the command itself. `skills/commit/SKILL.md` step 6 gained two sentences
of the same instruction without the argument, since a user reading that skill needs the fact rather
than the reasoning.

**Not done, and proposed rather than taken.** Two things:

- `skills/cleanup/SKILL.md` runs the same shape and carries the same unstated assumption. It was
  edited this Turn for a different finding, but adding a third copy of one sentence is the very
  pattern the review's own cross-cutting observation names, so it was left.
- `rules/workbench-stash-and-lock.md` `## Commit lock` is the authoring home for this behaviour and
  still does not document it. That file was outside this Turn's ownership. **The proposal is to state
  the `cd` there once and let the call sites cite it**, which would also settle the record's second
  question — whether `with` should `cd` at all. *Recommendation, not a measurement:* it should keep
  the `cd`, because the lock directory is resolved workbench-relative (`LOCK_DIR` is a relative path)
  and running the payload in the caller's directory while the bookkeeping runs elsewhere would give
  one command two working directories. Making the *payload* directory explicit in the rule file is
  cheaper than splitting them, and no behaviour changes.

**Resolved by:** coder, session `260810-1646`, Turn 3.
