A failed migrate run on Prior integrates a half-moved workbench and its fence, and no command closes it
---
`31-prior.md` says "Exit 5, 8, 9 or 3: show the reason and stop". On Prior stopping completes the role, the run settles as success, and the host carries the half-done store with its write fence into the user's checkout, where the session that could finish or undo it no longer exists.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Domain:** code
**Binds:** the Prior bundle. Claude Code keeps its session and is not affected.
**Cross-references:** `261106-0830-skill-migrate-on-prior-promises-a-backup-and-a-rollback-that-end-with-the-run.md`, `261016-1436-how-is-a-rollback-fence-ended-that-a-git-reset-left-standing-over-a-legacy-tree.md`, `261010-1045-check-routes-a-migrations-fence-to-the-archive-helper-only.md`

**Defect.** `EntrySettledAnswer.Integrable` (Prior `internal/fusionhost/entry_settle.go`, read at `cb1138b`) is true for a role that completed and for a user who ended the session at a question. Only a host refusal or an unsettled run is discarded. So a model following the text integrates after an exit 8 or 3 past the plan, and a user ending at the *Interrupted* question does the same.

**Evidence, run in the pinned image with a scratch `hooks/dist/migrate.js` patched to refuse after chunk 1 of 2.** After a simulated integration, in a new container: `status` shows `state=legacy`, `fence=<id>`, `run=none`. `run` exit 5, naming `resume` and `rollback`; both exit 5, as do `rollback --end-fence` and `restore-backup --consent`. `git restore` plus `git clean` in the checkout leaves `.json-state/maintenance.json`, because `.json-state/` ignores itself, and `run` still exits 5. Only removing that file by hand let `run` finish (measured). The route block in `23-prior.md` does not read `fence=`, so this state reaches `ROUTE=survey` and the question to migrate first.

**Fix.** Text in `31-prior.md`: after exit 3 or 8 run `status`; with `planned=yes` and `done=false`, the run does not end there. Go to *Interrupted* and finish `resume` or `rollback` to a `result=` line before ending, and say at that question that ending it carries the half-moved workbench into the checkout. Have `25-prior.md` or `23-prior.md` name the state `fence` standing with `run=none` and stop before the question to migrate. What that sentence may tell the user about `.json-state/maintenance.json` is the open point: the helper's header reserves that word for its own message, and ruling `261016-1436` covers only an idle fence of a recorded session. Put it to the user; do not decide it in the text.

**Acceptance.** A test holds that the Prior render's *Run* paragraph no longer lists 3 and 8 among the exits that simply stop, and that it names finishing `resume` or `rollback` before the run ends. A second holds the route's handling of a fence with `run=none`.

---
Resolved: the path is gone: 438df715 marks migrate unsupported on Prior, the adapter refuses it by name and its profile leaves the bundle; a project migrates under Claude Code first (user ruling, this session).
