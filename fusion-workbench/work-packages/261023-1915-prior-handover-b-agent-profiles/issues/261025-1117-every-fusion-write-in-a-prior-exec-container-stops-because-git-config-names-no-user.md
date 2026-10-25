Every `fusion-write` in a Prior exec container stops, because no git `user.name` or `user.email` is configured there
---
Every entry profile files its records through `fusion-write`, which runs `fusion-identity` first and sends nothing when that helper exits 1. `fusion-identity` reads the person from `git config user.name` and `user.email`. In Prior's exec container the global git config holds only `safe.directory`, so unless the project's own `.git/config` sets both keys, every record write of every entry run stops. Severity: High. Request 76 must carry this to Prior; fusion's `prior` parts can only name it.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Domain:** code
**Executor:** code-implementer (request 76 text, package F)
**Cross-references:** 261025-1117-reviewer-closing-review-of-prior-handover-b-agent-profiles.md; 261023-1854-plan-prior-full-surface-handover-h1-to-h9.md (step 25)

## Defect

The chain, each link read:

1. `bin/fusion-write` runs `"$here/fusion-identity"`; on its exit 1 it prints "bin/fusion-identity stopped … Nothing sent." and exits 1.
2. `bin/fusion-identity` reads `git config --get user.name` and `git config --get user.email`. Either one unset inside a work tree is exit 1: "The caller halts, reports the reason, files nothing" (its header, exit codes).
3. Prior at the pin `08c57fb`, `internal/supervisor/exec.go`: every contained command runs after `execPrelude`, `printf '[safe]\n\tdirectory = *\n' > "$HOME/.gitconfig"`, with `HOME` fixed to `/tmp` (`execHome`) on a fresh tmpfs. The container's global git config is that file and nothing else. `commandEnvironment` adds no `GIT_CONFIG_*` and no author variable.
4. In Prior's non-test Go sources at HEAD `c5832fd`, `user.name` is set only in the repair pilot's clone (`internal/repair/plan.go`, `"Prior Pilot"`) and in a synthetic test repository (`internal/p09live/slice.go`). No line sets it for an entry workspace or an exec container. `internal/fusionhost/entry_workspace.go` sets `GIT_CONFIG_NOSYSTEM=1` for its own host-side git. If Prior did give entry workspaces the pilot's local identity, records would carry `Prior Pilot` as their person, which is the other wrong answer.
5. In fusion's own repository `git config --local --get user.name` is unset (exit 1). A project that keeps its identity global, which is the common case, has none visible in the container.

So on Prior, `fusion-write create`, `transition`, `claim`, `adopt-plan` and `evidence` all stop. That covers the analyst's report filing, the planner's plan, the reviewer's issues and evidence, the state-auditor's transitions and the orchestrator's whole record loop.

Inference, not run: no Prior entry run was executed for this review. Each link above was read in source.

The checkout half is handled on Prior's side after the pin: `internal/fusionhost/entry_workspace.go` at Prior HEAD carries `fusion-workbench/.checkout-id` into the workspace read-only (`EntryCarriedReadOnly`), so `CHECKOUT=` resolves to the user's checkout. That is not in `08c57fb`.

## Fix direction

Request 76 asks Prior to make the user's git identity resolvable inside the exec container on an entry run, for example by writing `user.name` and `user.email` into the prelude's `$HOME/.gitconfig` beside `safe.directory`, from the identity Prior already holds for its own commits. It also asks Prior to confirm the `.checkout-id` carry at the bundle's pin. Fusion's Setup bindings may add one line: an exit 1 from `fusion-identity` on Prior is a host provisioning gap to report, never something the role repairs.

## Acceptance

- Request 76 carries the identity provisioning question and the `.checkout-id` carry under its own heading.
- If fusion adds the Setup line, `cd catalog && npm test` exits 0 and the Claude render diff is empty.
