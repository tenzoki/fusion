fusion-migrate reads a broken branch ref as a repository with no commit, and derives "untracked" for every file
---
`f8203e70` detects an unborn branch by `git rev-parse --verify -q HEAD` exiting 1. That status also comes from a branch ref git cannot read. Such a repository has a history, yet survey exits 0 and every person is derived as `unknown	untracked`. On `26ada996` the same repository stopped with exit 3. A fault became a wrong answer that `run` writes into the control files.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Review domain:** code
**Severity:** Low
**Cross-references:** `261009-2028-reviewer-repo-top-by-filesystem-f8203e70.md`, `261009-1958-migrate-reads-git-exit-128-as-no-repository-and-stops-on-a-machine-without-git.md`

**Evidence.** `hooks/migrate.ts:179` at `f8203e70`:

```ts
if (git(wb, ["rev-parse", "--verify", "-q", "HEAD"], 1) === null) return () => ({ unknown: "untracked" });
```

Reproduced with git 2.53.0. A committed fixture repository, then `echo garbage > .git/refs/heads/<current branch>`:

- `git rev-parse --verify -q HEAD` exits 1, the same status as after `git init` alone.
- `git log -1` exits 128 ("your current branch appears to be broken").
- `node hooks/dist/migrate.js survey <wb>` on `f8203e70`: exit 0, `derived=/filed_by/person	unknown	untracked	4`.
- The same on a `git archive` extract of `26ada996`: exit 3, `git … log … failed: exit 128`.

The repository holds one commit object with every record in it. This is the class the closed issue was about: a failure read as an answer. A broken ref is rare, so the severity is Low.

**Fix direction (inference, for the implementer to check).** Ask the question the derivation needs: does any commit exist? On exit 1 of the `--verify` call, list the object types (`git cat-file --batch-all-objects --batch-check=%(objecttype)`). With no `commit` among them, no file has a first add and `untracked` is the true answer. With one, HEAD is unreadable over a real history: a fault naming the `--verify` call. Measured on the two scratch repositories above: the broken-ref one lists `1 commit`; the `git init` one lists only blobs, staged files included. An orphan branch in a repository with history then becomes a fault too, which is the safe side.

**Acceptance.** A case in `hooks/lib/__tests__/migrate.test.ts` that writes junk into the current branch's ref of the committed fixture: survey exits 3 and stderr names the git call; no `derived=/filed_by/person	unknown	untracked` line. The existing `git init` case still gives `unknown	untracked	5`. The new case fails on `f8203e70`.
