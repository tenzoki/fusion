---
description: Autonomous end-of-session cleanup — file issues for open tasks, commit + push the work in meaningful splits, reconcile, archive with safe defaults, revise CLAUDE.md, log activity, then commit + push the housekeeping artifacts. One-shot wrap-up of a work session.
argument-hint: "[--dry-run] [--no-push]"
allowed-tools: [Bash, Read, Write, Edit, Glob, Grep, AskUserQuestion, Agent(fusion:reconciler)]
---

# Fusion — cleanup (autonomous session wrap-up)

The user invoked `/fusion:cleanup`. This is a one-shot, mostly-autonomous pipeline that closes out a work session: it captures unfinished work as issues, commits and pushes the real changes in meaningful splits, runs reconciliation, archives stale workbench files with safe defaults, revises `CLAUDE.md`, regenerates the activity log, then commits and pushes the housekeeping artifacts those last steps produced.

**Skills cannot invoke other slash commands.** Where a step corresponds to another fusion skill, read that skill's body from `$FUSION_PLUGIN_ROOT/skills/<name>/SKILL.md` and execute its procedure inline. Do not tell the user to type the slash command — perform the work. The reconcile step dispatches the `reconciler` agent directly.

## Arguments

- empty (default) — run the full pipeline, committing and pushing.
- `--dry-run` — survey and report what each step *would* do, make no writes, no commits, no dispatch. Use this to preview.
- `--no-push` — run the full pipeline and commit, but never `git push`. Leave the commits local.

## Autonomy and safety

"Autonomous" means: no per-step confirmation gates. Run the whole sequence and report at the end. Three hard guardrails override autonomy:

- **Never force-push.** Plain `git push` only. If it's rejected (non-fast-forward), stop, report, and leave the commits local for the user to resolve.
- **Never `git add -A` / `git add .`.** Stage explicit paths per commit split (Step 2).
- **Never discard user work.** No `git reset --hard`, no `git checkout -- <file>` on dirty files, no deleting untracked files. Archive *moves* files (tracked by git); it does not delete.

If `git status` shows a merge/rebase in progress, or the working tree has conflict markers, stop immediately and report — do not commit over an unresolved state.

## Step 0 — Resolve workbench root and pre-flight

```bash
ROOT="$("$FUSION_PLUGIN_ROOT/bin/fusion-workbench-root")" || { echo "No fusion workbench above $(pwd). Run /fusion:setup first."; exit 1; }
cd "$ROOT"
```

Capture the starting state for the final report:

```bash
git rev-parse --abbrev-ref HEAD; git status --short; git log --oneline -1
```

If `--dry-run`, announce it now: every subsequent step reports its intent but performs no write, commit, dispatch, or push.

## Step 1 — Close the session: file issues for open tasks

The goal is that no unfinished work is lost when the session ends.

1. If `fusion-workbench/agentstate.yaml` exists, read it. Its `work_queue` entries with status other than `done`/`skipped`/`deferred` are unfinished.
2. Read `fusion-workbench/tasklist.md` (if present) for unchecked tasks, and skim `fusion-workbench/planning/*[o]*.md` / `*[p]*.md` for unmarked or `[IN PROGRESS]` steps.
3. For each genuinely-unfinished task that is **not already tracked by an open issue**, file an issue per the decision/issue conventions in `rules/fusion-workbench-conventions.md`: `fusion-workbench/issues/YYMMDD-HHMM[o]-<slug>.md` (timestamp from `date +%y%m%d-%H%M`, never guessed). Each issue records what the task was, its source file, and why it's still open. Do not duplicate issues that already exist.
4. Finalise the session surfaces:
   - Overwrite `fusion-workbench/orchestrator-live.md` so its header reads `**Session:** Complete` (preserve the dashboard shape from `rules/fusion-workbench-conventions.md` / the orchestrator's live-dashboard format).
   - Delete `fusion-workbench/agentstate.yaml` if it exists (a clean wrap-up means nothing to resume).
   - Clear the active-session marker: `"$FUSION_PLUGIN_ROOT/bin/fusion-session-mark" clear`.
   - Clear `fusion-workbench/.active-circle` only if the active Circle has actually reached a terminal marker; otherwise leave it (cleanup is not a Circle-closure event).

Report: N issues filed, session surfaces finalised.

## Step 2 — Commit the real work in meaningful splits, then push

This commits the user's actual changes (code, data, docs) **plus** the issues filed in Step 1.

1. `git status --short` and `git diff --stat` to see everything unstaged/untracked.
2. **Group changes into logical commits.** Split by concern, not by file count. Heuristics: separate code (`coder` domain) from data/ontology (`ontocoder` domain) from docs from workbench-tracking. Separate unrelated features/fixes. A good split lets each commit's message be a single honest sentence.
3. For each group: stage explicit paths (`git add <path> <path>`), then commit with a Conventional Commits message:
   ```
   <type>(<scope>): <summary>

   <optional body — why, not what>

   Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
   ```
   Use a HEREDOC for the message. `<type>` ∈ `fix|feat|refactor|docs|chore|test`. Never amend; always new commits.
4. When the working tree is clean, **push** (unless `--no-push`): plain `git push`. If the branch has no upstream, set it (`git push -u origin <branch>`). If push is rejected, stop and report — do not force.

For the commit-message craft and staging discipline, the procedure in `$FUSION_PLUGIN_ROOT/skills/commit/SKILL.md` is the reference; apply it per split.

Report: the list of commits created (hash + summary) and push result.

## Step 3 — Reconcile

Dispatch the reconciler to bring tracking files in line with ground truth.

- Detect the workbench domain the same way the orchestrator does (Setup Step 5 in `agents/orchestrator.md`): `strategic` if decisions dominate, `knowledge` if analyses with no code, `data` if data files dominate, else `code`. When unsure, default `code`.
- `Agent(fusion:reconciler)` with the dispatch prompt prefixed by `**Domain:** <detected-domain>` on its own line.
- Read the reconciler's returned summary; note any discrepancies it fixed or flagged.

If `--dry-run`, skip the dispatch and just report the detected domain.

## Step 4 — Archive with safe defaults

Read `$FUSION_PLUGIN_ROOT/skills/archive/SKILL.md` and execute its **tier-1** procedure (the safest tier) autonomously — no confirmation gate, since tier-1 is defined as safe-by-construction. Archive *moves* files into `fusion-workbench/archive/<YYMMDD-HHMM>-safe-cleanup-tier-1/`, preserving structure. If tier-1 finds nothing to archive, report "nothing to archive" and continue.

If `--dry-run`, report the tier-1 survey (what would move) without moving anything.

## Step 5 — Revise CLAUDE.md

Read `$FUSION_PLUGIN_ROOT/skills/revise-claude-md/SKILL.md` and execute its full three-pass procedure (add → update → prune) against this session's learnings. Report the diff summary.

If `--dry-run`, run the survey passes but make no edits.

## Step 6 — Log activity

Read `$FUSION_PLUGIN_ROOT/skills/log-activity/SKILL.md` and execute its procedure to regenerate/update the activity log.

If `--dry-run`, report what it would write without writing.

## Step 7 — Commit the housekeeping artifacts, then push

Steps 3–6 produce changes: reconciler's tracking-file updates, the archive moves, the `CLAUDE.md` revision, and the activity log. Commit them now, in meaningful splits, exactly as in Step 2 (explicit staging, Conventional Commits messages, HEREDOC, no amend). Typical splits:

- `chore(workbench): reconcile tracking files` — reconciler output
- `chore(workbench): archive stale files (tier-1)` — the archive moves
- `docs: revise CLAUDE.md with session learnings` — CLAUDE.md
- `docs: update activity log` — the activity log

Then **push** (unless `--no-push`), same rules as Step 2.

## Step 8 — Report

A single concise summary, action-first per `rules/user-facing-output.md`:

- Issues filed for open tasks: N (with paths)
- Commits created across both phases: list (hash + summary)
- Push: pushed to `<branch>` / skipped (`--no-push`) / **rejected** (with the git error)
- Reconcile: discrepancies fixed/flagged
- Archive: files moved (count) into `<archive folder>` / nothing to archive
- CLAUDE.md: lines added / updated / pruned
- Activity log: updated

End with anything that needs the user's attention (a rejected push, a flagged reconcile discrepancy, conflicts). If everything succeeded cleanly, the first line is "Session cleaned up — nothing needs your attention."

## Notes for the assistant

- This skill is destructive-adjacent (it commits and pushes). The guardrails in "Autonomy and safety" are not optional.
- The two commit phases are deliberate: Step 2 captures the *work*, Step 7 captures the *housekeeping the work triggered*. Don't collapse them — a clean tree before reconcile makes the reconciler's diff legible.
- If the repo is not a git repository, skip Steps 2 and 7's commit/push and say so; still run reconcile, archive, revise, and log.
- Match the user's energy: they asked for a one-shot wrap-up. Run it end to end; report once at the end, not after every step (unless a guardrail trips).
