The migrate entry on Prior promises a backup and a rollback that end with the run
---
`catalog/profiles/skill-migrate/parts/30-neutral.md` and `31-prior.md` tell a Prior run's user that the move "can be rolled back" and that `bin/fusion-migrate rollback` "undoes the migration". After the run ends neither holds: every undo command exits 5.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Domain:** code
**Binds:** the Prior bundle. The Claude Code render must stay byte-identical.
**Cross-references:** `261106-0830-a-failed-migrate-run-on-prior-integrates-a-half-moved-workbench-and-its-fence.md`, `261106-0830-reviewer-pre-delivery-pass-over-13-4-4-merge-and-prior-line.md`

**Defect.** `hooks/migrate.ts` `sessionDir` puts backup, repair log and `state.json` under `$HOME/.fusion-migrate/<12 hex of the workbench path>`. On Prior `HOME` is `/tmp`, a tmpfs removed with the run's tool container. The neutral sentence "A full backup outside the workbench ... can be rolled back" and the last sentence of `31-prior.md` are therefore false from the run's end on.

**Evidence, run in the pinned image, `--read-only`, uid 65532, tmpfs `/tmp` 64m, fixture `codec/fixtures/legacy-v12` grown to two chunks.**
- Same container, before the end: `run` exit 0, `rollback` exit 0 with `result=legacy`, git status clean but for the ignored `.json-state/`.
- New container after a simulated integration: `status` exit 0 with `run=none`, `backup=absent`; `rollback`, `resume`, `set-aside --consent`, `rollback --end-fence` and `restore-backup --consent` exit 5.
- Moving the session does not repair this. `--session` under the project root, later run at another path: `rollback` exit 5, `records <old path>, not <new path>`. With `state.json`'s path rewritten by hand: exit 8, `conflict/after-state-changed`, because the codec reconstructs its exempt requests from the workbench's realpath, and that attempt left a fence. Prior's workspace path carries the run id (`cmd/prior/fusion_run.go`, `startFusionRun`, read, not run).

**Fix.** Text only, in the Prior render. Split the two quoted lines out of `30-neutral.md` into a `claude` and a `prior` part, and replace the last sentence of `31-prior.md`. The rendered text must state:
1. Until the run ends the user's checkout is untouched, and `bin/fusion-migrate rollback` undoes the move inside the run.
2. The backup and the record `rollback` reads live in the run's temporary space and end with it. In any later run `rollback`, `resume` and `restore-backup` exit 5.
3. After integration the undo is git in the checkout: uncommitted, `git restore --staged --worktree -- fusion-workbench` and deleting the added paths the integration lists; committed, `git revert`. `.json-state/` stays, is ignored, and does not stop a later migrate.
4. Not `git clean`: it also deletes workbench files that were untracked before the run (measured). Git returns neither those nor edits uncommitted at the start; `archive/migrations/<id>/originals/` holds the prior bytes of converted records only, and git's undo removes it too.
5. So: commit the workbench before answering. A project that does not track its workbench has no undo after the run.
6. A repair reaches the checkout at the run's end whether or not the migration follows (`29-prior.md`).

**Acceptance.** A test in `catalog/src/__tests__/prior-commands.test.ts` holds that the Prior render of `skill-migrate` no longer says the move "can be rolled back" or that `rollback` undoes the migration without naming the run's end, and that it names `git revert` and the exit 5. The Claude render equals the committed `skills/migrate/SKILL.md` byte for byte.

---
Resolved: the path is gone: 438df715 marks migrate unsupported on Prior, the adapter refuses it by name and its profile leaves the bundle; a project migrates under Claude Code first (user ruling, this session).
