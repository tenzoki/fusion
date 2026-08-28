A coder dispatch wrote its history entry to shared/history/ at the project root, not into the workbench
---
The release-bump coder dispatch of session 260828-0846 wrote `shared/history/260828-1039_coder_release-bump-v10-19-1.md` relative to the project root, creating a stray `shared/` directory beside `fusion-workbench/`. `bin/fusion-paths` emits `OUT_HISTORY=shared/history` as a workbench-relative path; the agent joined it to cwd instead of to `WORKBENCH`.
---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>

Evidence: the orchestrator's staging list named the workbench path and `git add` failed with "pathspec did not match", which is how the misplacement surfaced; the tag was briefly placed on the wrong commit as a consequence (deleted and re-tagged on 73aa93f1). The file was moved by hand into `fusion-workbench/shared/history/`.

Acceptance: `rules/agent-setup.md` `## What fusion-paths emits` (or the coder prompt's Setup) states that every `OUT_*`/`SCAN_*` value joins to `$WORKBENCH`, never to cwd; a coder dispatched from the project root writes its history under `fusion-workbench/`. Optionally a test over a scratch root that a `shared/` directory at the root is not created by a dispatch.
