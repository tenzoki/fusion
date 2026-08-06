# Workbench Stashes and the Commit Lock

**Provenance:** circles/260801-1244-guard-rules-write

Two workbench protocols, lifted verbatim out of `rules/fusion-workbench-conventions.md`.
Their audience is bounded by a mechanism rather than by a guess about what an agent might
need: the commit lock is taken by the orchestrator, and a stash is created and consumed by
`/fusion:circle-stash` and `/fusion:circle-pop` — skills, which reach rule text by direct
citation and are never served by `bin/fusion-rules` at all. So this file is emitted to
`orchestrator` only. The other fifteen agents reach it through the pointer lines left at
both sites in the conventions file, the three agents that may commit directly carry the
lock instruction inline in their own prompts, and the two committing skills
(`/fusion:commit`, `/fusion:cleanup`) carry it in their own bodies.

## Stashes

A stash is a self-contained, frozen snapshot of an active Circle's complete state — the Circle directory, the `.active-circle` pointer, `agentstate.yaml` (when a session is in flight), the dashboard, the task queue, and the git working tree. Stashes free the workspace for unrelated urgent work without losing the in-flight Circle's context.

The container layout simplifies this: a Circle's spec, plan, issues, decisions and history are all *inside* the Circle directory, so capturing the Circle captures them. There is no separate hunt through type directories for files the Circle happens to reference.

### Opt-in

Stash behaviour activates only when `fusion-workbench/stashes/` exists. The directory is created by `/fusion:circle-stash` on first invocation; it is NOT created by `/fusion:setup`. Workbenches that never stash never grow a `stashes/` directory.

Stashes are created by `/fusion:circle-stash [reason]` and consumed by `/fusion:circle-pop [stash-id]`. Both skills resolve the workbench root via `bin/fusion-workbench-root` and refuse to run outside a fusion-set-up project.

### Filesystem layout

```
fusion-workbench/stashes/
└── <YYMMDD-HHMM>-<directive-slug>/
    ├── manifest.yaml         # ten-field index
    ├── README.md             # human-readable summary + restore command
    ├── circle/               # the whole Circle directory, verbatim
    │   ├── _t_circle.md     #   record with its marker (filename in manifest)
    │   ├── planning/         #   spec and plan travel with the Circle
    │   ├── issues/
    │   ├── decisions/
    │   ├── history/
    │   ├── reviews/
    │   └── analyses/
    ├── agentstate.yaml       # only present when stash captured a running session
    ├── orchestrator-live.md
    ├── tasklist.md           # if present at stash time
    └── git/
        ├── stash-ref         # raw "git stash list" line + (no changes) sentinel
        └── head              # HEAD short-hash at stash time
```

The stash id `<YYMMDD-HHMM>-<directive-slug>` is derived from the current time (not the Circle's birth time) so multiple stashes of the same Circle remain distinguishable.

### Manifest schema

Ten fields, in this order:

```yaml
stash_id: 260519-1200-stash-smoke              # YYMMDD-HHMM-<slug>
timestamp: "2026-05-19T12:00:00Z"              # RFC 3339 UTC
reason: "smoke test"                           # one line
original_circle_dirname: "260519-1200-stash-smoke"   # the Circle directory name (no marker)
original_circle_record: "_t_circle.md"        # the record filename, marker included
active_circle_content: "260519-1200-stash-smoke"     # verbatim content of .active-circle at stash time
head_short_hash: "0b7344a"
git_stash_ref: "stash@{0}"                     # human-readable positional ref, or "(no changes)"
git_stash_sha: "3f2a7b8c9d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a"  # stable commit SHA from `git rev-parse stash@{0}`; null if (no changes)
has_agentstate: true                           # false when stashed without a running session
```

String values are quoted; `null` is the unquoted YAML literal.

**`has_spec_plan` is gone** — its removal took the schema from ten fields to nine, and `git_stash_sha`'s later addition brought it back to ten. `has_spec_plan` used to enumerate which spec and plan files had been copied in from foreign directories; in the container model the Circle *contains* them, so the field had nothing left to enumerate. Old stashes that still carry it stay readable: `/fusion:circle-pop` ignores the field when present.

`git_stash_ref` is human-readable (`stash@{N}`) and recorded for the user. `git_stash_sha` is the stable underlying commit SHA — pop's `git stash apply` uses the SHA so an intervening `git stash push` during the urgent work cannot renumber the positional ref out from under it. The SHA is `null` when the working tree was clean and no stash entry was created.

### Lifecycle

- Created by `/fusion:circle-stash` (one stash directory per invocation).
- Consumed by `/fusion:circle-pop`, which restores state but does NOT auto-delete the stash directory. The user prunes manually: `rm -rf fusion-workbench/stashes/<id>/ && git stash drop <ref>`.
- A `STASH_IN_PROGRESS` lock file at the stash directory root signals an incomplete write. `/fusion:circle-pop` refuses to read stashes carrying this file.
- Multiple stashes can coexist by design. `/fusion:circle-pop` lists them when invoked without an argument and asks the user to pick.

### Boundary events

- `circle_stashed` event in `orchestrator-events.jsonl` marks the stash boundary.
- `circle_popped` event marks the restore boundary.
- The event log is NOT moved into the stash; it stays append-only across all sessions.

### What stash does NOT touch

- `orchestrator-events.jsonl` — root-anchored, append-only across all sessions; the stash/pop boundaries are recorded by appending event lines, never by truncating or relocating the log.
- `.guard-state/*` — root-anchored, project-wide, not Circle-specific.
- The shared store — `shared/` belongs to no Circle and is never captured by a stash.

Session history is the one nuance: it lives *inside* the stashed Circle and therefore travels with it. `/fusion:circle-stash` appends a `## Stashed Circle` section to the active session's history file (best-effort, when the file can be located) before capture, but never rewrites it otherwise.

### Cross-references

- Skill bodies: `skills/circle-stash/SKILL.md`, `skills/circle-pop/SKILL.md`
- The pre-container design spec and binding decision behind this protocol did not survive the workbench reorganisations; this document carries their surviving substance and is the definition.

## Commit lock

A POSIX mutex around `git add` + `git commit` operations against the project's working tree. Defends against the cross-agent staging race where parallel agents' commit operations interleave at the git-index level (commit absorption, orphan commits, WT-left-dirty outcomes).

### When it activates

Always, when any party is about to commit. Workbench-anchored — different projects have independent locks; sessions on the same project share one lock.

### Mechanism

Atomic `mkdir fusion-workbench/.commit-lock/` (POSIX guarantees mkdir either creates the directory exclusively or fails). The lock is root-anchored, like the other project-wide state — it guards the project's git index, which no single Circle owns. The holder file `.commit-lock/holder` records three lines: `tag`, `pid`, `acquired_at` (RFC-3339 UTC). Stale-lock detection at 60 seconds: if the holder PID is no longer running AND the lock is older than the threshold, the next acquirer force-releases it.

### Helper

`bin/fusion-commit-lock` with subcommands:

- `acquire <tag>` — block until acquired (200ms poll, exponential backoff to 2s, indefinite wait)
- `release` — release the lock (must hold or recorded PID dead)
- `with <tag> -- <cmd...>` — canonical pattern: acquire, run, release on any exit
- `check` — diagnostic; print lock state, no mutation

The `with` form is canonical; explicit `acquire`/`release` is for special cases like internal control-flow (retry after bugfixer in orchestrator Phase 2 Step 3b).

### Who acquires

- **Orchestrator** at Phase 2 Step 3b — before staging and committing.
- **Coder / ontocoder / bugfixer** ONLY if they commit directly (rare; default is the orchestrator commits on their behalf).
- **`/fusion:commit` and `/fusion:cleanup`** — the two skills that commit; each wraps every stage+commit pair in `with <skillname> --` (tags `commit`, `cleanup`). Skills are never served by `bin/fusion-rules`; their bodies carry the instruction and cite this section directly.
- **Other agents** — never commit, never need the lock.

### Tag conventions

Mandatory. Used in stale-lock messages. Format: the agent name (`orchestrator`, `coder`, `ontocoder`, `bugfixer`) or the committing skill's name (`commit`, `cleanup`).

### Failure modes

- **Concurrent acquire from a different party** → polled every 200ms with exponential backoff to 2s. One stderr message after the first failed acquire (`waiting for commit lock held by <other-tag>...`); silent thereafter. Blocks indefinitely — no max-wait timeout.
- **Crash mid-commit** → next acquirer's stale-lock detector force-releases after 60 seconds if the recorded PID is dead. Stderr warning announces the force-release.
- **Release-not-held** → non-zero exit with `not currently held by anyone`. Caller should log and proceed (defensive — typically indicates a programming error rather than a race).

### Cross-reference

This protocol closed the cross-agent staging-race defect — parallel agents' stage+commit operations interleaving at the git-index level. Its issue record did not survive the workbench reorganisations; the failure modes above carry its substance.
