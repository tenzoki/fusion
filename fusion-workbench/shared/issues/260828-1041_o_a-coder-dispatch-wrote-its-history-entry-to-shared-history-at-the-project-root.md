A coder dispatch wrote its history entry to shared/history/ at the project root, not into the workbench
---
The release-bump coder dispatch of session 260828-0846-orchestrator-session.md wrote `260828-1039_coder_release-bump-v10-19-1.md` relative to the project root, creating a stray `shared/` directory beside `fusion-workbench/`. `bin/fusion-paths` emits `OUT_HISTORY=shared/history` as a workbench-relative path; the agent joined it to cwd instead of to `WORKBENCH`.
---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>

Evidence: the orchestrator's staging list named the workbench path and `git add` failed with "pathspec did not match", which is how the misplacement surfaced; the tag was briefly placed on the wrong commit as a consequence (deleted and re-tagged on 73aa93f1). The file was moved by hand into `fusion-workbench/shared/history/`.

Acceptance: `rules/agent-setup.md` `## What fusion-paths emits` (or the coder prompt's Setup) states that every `OUT_*`/`SCAN_*` value joins to `$WORKBENCH`, never to cwd; a coder dispatched from the project root writes its history under `fusion-workbench/`. Optionally a test over a scratch root that a `shared/` directory at the root is not created by a dispatch.

Reconciliation 260829-1109-reconciliation.md (HEAD `7a2361aa`): still open. `rules/agent-setup.md` carries no line joining `OUT_*`/`SCAN_*` to `$WORKBENCH` (`grep -n 'joins\|relative to'` empty), so the acceptance is unmet. The stray root `shared/` is gone (`ls shared` at the root: no such directory), and the second release bump wrote its entry inside the workbench (`260829-0906_coder_release-bump-v10-19-2.md`, commit `7a2361aa`), so the misplacement did not recur; the rule fix is what closes this.

---
Reconciled 260905-2015 (reconciler, HEAD `5b84b13a`): still open, unmoved since the 260829-1109 pass.

`rules/agent-setup.md` `## What fusion-paths emits` still carries no sentence joining an `OUT_*` or
`SCAN_*` value to `$WORKBENCH`; the whole file mentions neither the workbench root nor the working
directory in that paragraph. The acceptance is unmet at the site it names.

The misplacement has not recurred: no `shared/` directory exists at the project root, and every
history entry written since sits under the workbench.
