Migrate on Prior exits 3 with no stated cause when the workbench does not fit the 64 MiB tmpfs
---
The backup goes to `/tmp`, a 64 MiB tmpfs on Prior. A larger workbench makes `run` exit 3 with an I/O error and leaves `/tmp` full for the rest of the run. Nothing in the render says so.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Domain:** code
**Binds:** the Prior bundle.
**Cross-references:** `261010-1045-a-migration-backup-that-fails-to-verify-once-blocks-every-later-run-and-no-message-names-the-way-out.md`

**Evidence, run in the pinned image, 70 MiB file added to the fixture.** `run` exit 3: `backing up the workbench failed: EIO, Input/output error ...; nothing was migrated, and /tmp/.fusion-migrate/<hex> may hold a partial copy`. `df` then shows `/tmp` at 100%. A repeated `run` gives the same. Writing `$HOME/.gitconfig` still works on a full tmpfs (measured), so later calls start. For scale, this repository's own workbench is 58M by `du -sh`, 17M of it `archive/`. `repair --apply` takes the same backup (`hooks/lib/legacy-repair.ts` `ensureBackup`, read, not run).

**Fix.** Text in `29-prior.md` and `31-prior.md`: an exit 3 naming the backup means this workbench does not fit this host's temporary space, nothing was migrated, and a retry gives the same; the migration then runs under Claude Code. Better, have the Prior text measure the size against the free space before the question to migrate, with a command on Prior's list. Moving the session into the workspace is not the fix: see `261106-0830-skill-migrate-on-prior-promises-a-backup-and-a-rollback-that-end-with-the-run.md`.

**Acceptance.** A test holds that the Prior render names the size bound and what an exit 3 at the backup means.

---
Resolved: the path is gone: 438df715 marks migrate unsupported on Prior, the adapter refuses it by name and its profile leaves the bundle; a project migrates under Claude Code first (user ruling, this session).
