---
description: Close the session by committing and pushing its work in meaningful splits, under the project's commit lock. Nothing else — reconciling, archiving, the activity log, the CLAUDE.md pass and the message to the next checkout are each their own command.
argument-hint: "[--dry-run] [--no-push]"
allowed-tools: [Bash, Read, Write, Glob, Grep]
---

# Fusion — cleanup (commit and push)

The user invoked `/fusion:cleanup`. **Closing a session is committing and pushing what the session produced, and that is the whole of this body.** No agent is dispatched here. No tracking file is reconciled, no artifact is archived, no activity log is regenerated, no normative surface is touched and no message is left for another checkout.

**Each of those is its own command now, invoked by name when the user wants it** — `/fusion:reconcile`, `/fusion:archive`, `/fusion:log-activity`, `/fusion:curate`, `/fusion:post`. This body runs none of them, reads none of their procedures, and offers none of them at the end. A user who wants one types it.

**Nothing is filed on the user's behalf either.** Work a session left unfinished belongs in the commit message, or in a record the user files by hand. Sweeping the workbench for unfinished tasks and writing issues about them was a step of this body; it was removed rather than moved somewhere else.

## Arguments

- empty (default) — commit every split, then push.
- `--dry-run` — print the splits this run would make and stop. No staging, no commit, no push.
- `--no-push` — commit, and leave the commits local.

Both flags may be given together, in which case `--dry-run` decides: nothing is written. Any other argument is an error — name the argument and list these two.

## Guardrails

Three hard rules, on every run:

- **Never force-push.** Plain `git push`. If it is rejected as non-fast-forward, stop, report the git error verbatim, and leave the commits local for the user to resolve.
- **Never `git add -A` or `git add .`.** Stage explicit paths, one set per split. A blanket stage is what puts an unrelated working-tree change into somebody else's commit.
- **Never discard user work.** No `git reset --hard`, no `git checkout -- <file>`, no deleting untracked files, and never `git commit --amend`.

If `git status` reports a merge or rebase in progress, or the tree carries conflict markers, stop immediately and report. Do not commit over an unresolved state.

## Step 0 — Workbench root, and the state this run starts from

```bash
ROOT="$("$FUSION_PLUGIN_ROOT/bin/fusion-workbench-root")" || { echo "No fusion workbench above $(pwd). Run /fusion:setup first."; exit 1; }
cd "$ROOT"
git rev-parse --abbrev-ref HEAD; git log --oneline -1; git status --short
```

Hold the branch, the starting HEAD and the working-tree listing for the report.

If the directory is not a git repository at all, say so in one line and stop: there is nothing here for this command to do.

**No path resolution runs here.** This body writes no workbench record, so it names no store and calls no resolver.

## Step 1 — Read what is uncommitted

`git status --short` and `git diff --stat`, plus the untracked entries. Read enough of the diff to write an honest sentence about each group — a commit message derived from filenames alone is the message this step exists to avoid.

## Step 2 — Commit in meaningful splits

**Split by concern, not by file count.** Separate application code from structured data, both from documentation, and all three from workbench records. Separate unrelated fixes. The test of a good split is that its message is one honest sentence with no "and also" in it.

For each split, in order:

1. **Write the message to a file first.** Use the `Write` tool, or a **quoted** heredoc delimiter (`cat > "$MSG" <<'FUSION_MSG_EOF'`) — never a bare `<<EOF`, which still expands `$var` and runs backticks inside the message body.

   The file goes at `/tmp/fusion-commit-msg-<session-id>-<n>.txt`, where `<session-id>` is the Claude Code session identifier SessionStart printed in front of you as `fusion: session_id=<id>` and `<n>` numbers the splits of this run. **Never inside `fusion-workbench/`**: that tree is the one `git status` reports on, so a message file left there becomes an untracked artifact the next run has to explain. `/tmp` is swept by the system, and it is machine-global — two projects' sessions collide there whenever the rest of the name agrees, which is why the session identifier is in it. If SessionStart printed no identifier, use the `CHECKOUT=` value from `"$FUSION_PLUGIN_ROOT/bin/fusion-identity"` in its place and say so in the report: two sessions on one checkout still share it.

   Conventional Commits, `<type>` ∈ `fix|feat|refactor|docs|chore|test`:

   ```
   <type>(<scope>): <summary>

   <body — why, not what>
   ```

2. **Stage and commit as one pair, under the project's commit lock.** The lock serialises access to the shared git index against any parallel session's agents; the `with` form acquires it, runs the command, and releases on any exit. The protocol, the two stale-lock paths and the failure modes are `rules/commit-lock.md` `## Commit lock`'s, and this body does not restate them.

   ```bash
   "$FUSION_PLUGIN_ROOT/bin/fusion-commit-lock" with cleanup -- bash -c 'git add <path> <path> && git commit -F <msg-file>'
   ```

   The message reaches `git` as `-F <msg-file>` and never as a command-line argument, so an apostrophe in it cannot end a quoted string.

Under `--dry-run`, print the splits and their draft messages and stop here.

## Step 3 — Push

When the working tree is clean and `--no-push` was not given: plain `git push`. If the branch has no upstream, `git push -u origin <branch>`. If the push is rejected, stop and report the error — do not force, and do not rebase on the user's behalf.

## Step 4 — Report

Action-first, per `rules/user-facing-output.md`:

- Commits created: hash and summary, one line each.
- Push: pushed to `<branch>`, skipped (`--no-push`), or **rejected** with the git error.
- Anything left uncommitted, and why — a file you could not place in a split is named, not swept in.

If a guardrail stopped the run, that is the first line. Otherwise the first line says the session's work is committed.

## Notes for the assistant

- This body commits and pushes. The guardrails above are not optional.
- Do not offer to run a sibling command at the end, and do not run one. The user knows their names.
