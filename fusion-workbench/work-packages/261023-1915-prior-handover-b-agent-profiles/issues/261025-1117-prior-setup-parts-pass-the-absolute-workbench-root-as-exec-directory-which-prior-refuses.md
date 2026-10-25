Prior Setup parts pass the absolute workbench root as the exec `directory`, which Prior refuses
---
All eleven agent profiles tell an entry run to give the path `fusion-workbench-root` prints as the `directory` of every later `host.exec.v1` call. That path is absolute. Prior's wire accepts only `.` or a clean workspace-relative path, so every entry run's second exec call is refused as written. Severity: High.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Domain:** code
**Executor:** code-implementer
**Cross-references:** 261025-1117-reviewer-closing-review-of-prior-handover-b-agent-profiles.md; 261024-2111-agent-span-map-for-entry-profiles.md

## Defect

Setup item 1 (orchestrator: STEP 0) of every entry-run `prior` part reads: "Run `"$FUSION_PLUGIN_ROOT/bin/fusion-workbench-root"` with the workspace root as `directory`. It prints the project root that holds the workbench; give that path as the `directory` of every later call." The eleven sites (`grep -l 'give that path as the \`directory\`' catalog/profiles/*/parts/*-prior.md`):

- `catalog/profiles/{analyst,code-implementer,consultant,data-implementer,document-editor,implementation-planner,requirements-designer,reviewer,state-auditor}/parts/03-prior.md`
- `catalog/profiles/orchestrator/parts/07-prior.md`
- `catalog/profiles/policy-curator/parts/05-prior.md`

`bin/fusion-workbench-root` prints an absolute path. Prior mounts the workspace at its host path (`internal/supervisor/exec.go` `mounts`: `{Source: s.Workspace, Target: s.Workspace}`), so the printed path is that absolute host path.

Prior refuses it, at the pin `adapters/prior/PRIOR_PIN` names (`08c57fb`), read with `git show`:

- `moduleapi/v1/entry_wire.go` `ExecCall` decode: `if c.Directory != "." && !workspacePath(c.Directory)`
- `workspacePath`: `fs.ValidPath(p) && p != "." && !strings.ContainsAny(p, "\\:\x00")`; Go's `fs.ValidPath` is false for a path with a leading `/`.
- `internal/supervisor/exec.go` repeats the check (`call.Directory != "." && (!fs.ValidPath(call.Directory) ...)`).

No `prior` part says that `directory` is workspace-relative (`grep -n 'workspace-relative' catalog/profiles/*/parts/*-prior.md` is empty). The same gap reaches the file tools: `WORKBENCH` is absolute and the parts say every other key is relative to it, while Prior's file tools take "a relative file path in the granted workspace; no host paths" (`internal/supervisor/general_tools.go` file binding description).

## Fix direction

One sentence in each Setup binding: `directory` is `.` or a path relative to the workspace root, never absolute; the project root `fusion-workbench-root` prints is given as its path relative to the workspace (`.` when the project is the workspace), and a path a helper prints absolute is made workspace-relative before it is used as a `directory` or with a file tool. The Claude render does not move.

## Acceptance

- No `prior` part tells a run to pass an absolute path as `directory`; every Setup binding states the workspace-relative rule.
- `cd catalog && npm test` exits 0; `npm run render -- claude` then `git diff --exit-code agents/` exits 0.
