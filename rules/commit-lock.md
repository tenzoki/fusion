# The Commit Lock

**Provenance:** circles/260801-1244-guard-rules-write; narrowed to the commit lock and renamed in circles/260815-0007-remove-eight-mechanisms-and-cap-growth

One workbench protocol, lifted verbatim out of `rules/fusion-workbench-conventions.md`.
Its audience is bounded by a mechanism rather than by a guess about what an agent might
need: the lock is taken by whoever is about to commit, and among the agents that is the
orchestrator. So this file is emitted to `orchestrator` only. Every other agent reaches it
through the pointer left at `## Commit lock` in the conventions file, the three agents that
may commit directly carry the lock instruction inline in their own prompts, and the two
committing skills (`/fusion:commit`, `/fusion:cleanup`) carry it in their own bodies —
skills reach rule text by direct citation and are never served by `bin/fusion-rules` at
all.

This file carried a second protocol until 2026-08-15. The stash half was the definition
for the two Circle stash-and-restore skills, and it was deleted with them; nothing in the
shipped plugin freezes or restores a Circle any more.

## Commit lock

A POSIX mutex around `git add` + `git commit` operations against the project's working tree. Defends against the cross-agent staging race where parallel agents' commit operations interleave at the git-index level (commit absorption, orphan commits, WT-left-dirty outcomes).

### When it activates

Always, when any party is about to commit. Workbench-anchored — different projects have independent locks; sessions on the same project share one lock.

### Mechanism

Atomic `mkdir fusion-workbench/.commit-lock/` (POSIX guarantees mkdir either creates the directory exclusively or fails). The lock is root-anchored, like the other project-wide state — it guards the project's git index, which no single Circle owns. The holder file `.commit-lock/holder` records three lines: `tag`, `pid`, `acquired_at` (RFC-3339 UTC). The holder write is noclobber (`set -C`): if a holder file already exists at write time, this acquirer was suspended between its `mkdir` and the write, got reaped, and another party took the lock — the write fails and the acquisition counts as lost (the acquirer re-enters the poll loop) instead of overwriting the new holder.

Stale-lock detection at 60 seconds, on two paths. With a holder file: if the recorded PID is no longer running AND the lock is older than the threshold, the next acquirer force-releases it. Without a holder file (the holder died — or is still suspended — between `mkdir` and the holder write, or the directory was created some other way): the directory is aged on its own mtime and force-released past the same threshold — otherwise it would block acquire forever with nothing recorded to go stale.

### Helper

`bin/fusion-commit-lock` with subcommands:

- `acquire <tag>` — block until acquired (200ms poll, exponential backoff to 2s, indefinite wait)
- `release` — release the lock (must hold or recorded PID dead)
- `with <tag> -- <cmd...>` — canonical pattern: acquire, run, release on any exit
- `check` — diagnostic; print lock state, no mutation

The `with` form is canonical; explicit `acquire`/`release` exists for control-flow that has to run inside the held region, and no shipped call site holds the lock that way today.

**`with` performs a `cd`.** It resolves the workbench root (`bin/fusion-workbench-root`, walking up from the caller's working directory) and runs the wrapped command there: not the caller's directory, and not the git toplevel. Every pathspec in the held command is therefore written absolute; a toplevel-relative or caller-relative staging list exits 128 with nothing staged wherever the three directories differ.

### Who acquires

- **Orchestrator** at Phase 2 Step 3b — staging and committing in the held command.
- **Coder / ontocoder / bugfixer** ONLY if they commit directly (rare; default is the orchestrator commits on their behalf).
- **`/fusion:commit` and `/fusion:cleanup`** — the two skills that commit; each wraps every stage+commit pair in `with <skillname> --` (tags `commit`, `cleanup`). Skills are never served by `bin/fusion-rules`; their bodies carry the instruction and cite this section directly.
- **Other agents** — never commit, never need the lock.

### Tag conventions

Mandatory. Used in stale-lock messages. Format: the agent name (`orchestrator`, `coder`, `ontocoder`, `bugfixer`) or the committing skill's name (`commit`, `cleanup`).

### Failure modes

- **Concurrent acquire from a different party** → polled every 200ms with exponential backoff to 2s. One stderr message after the first failed acquire (`waiting for commit lock held by <other-tag>...`; a holder-less directory is named as `held by ?` with the way out); silent thereafter. Blocks indefinitely — no max-wait timeout.
- **Crash mid-commit** → next acquirer's stale-lock detector force-releases after 60 seconds if the recorded PID is dead. Stderr warning announces the force-release.
- **Crash (or long suspension) between `mkdir` and the holder write** → the directory records no PID and no timestamp, so it is aged on its own mtime and force-released after the same 60 seconds. A suspended-not-dead creator that resumes after being reaped loses its acquisition at the noclobber holder write and re-enters the poll loop.
- **Release-not-held** → non-zero exit. Two messages: `not currently held by anyone` when no lock directory exists, and a refusal (`records no holder; refusing to guess`, the message naming the lock directory's path in full) for a holder-less directory — reaping that state is the next acquire's job, or a manual `rmdir` when no commit is running. Caller should log and proceed (defensive — typically indicates a programming error rather than a race).

### Cross-reference

This protocol closed the cross-agent staging-race defect — parallel agents' stage+commit operations interleaving at the git-index level. Its issue record did not survive the workbench reorganisations; the failure modes above carry its substance.
