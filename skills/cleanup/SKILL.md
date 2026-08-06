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

Then resolve where this session writes and searches:

```bash
"$FUSION_PLUGIN_ROOT/bin/fusion-paths" cleanup
```

Hold the `KEY=value` lines for the rest of the run and use them wherever a later step names a `$OUT_*` or `$SCAN_*` value — they are the only correct answer to "where does this go". Never guess a path when the resolver fails; stop and report. `fusion-paths` takes the name of the consumer asking, and this skill is its own consumer — its key set is read from this file (`rules/fusion-workbench-conventions.md` `## Path Resolution`).

On a non-zero exit, read the code — it says whose fault it is (full table in the conventions' `## Path Resolution` → Exit codes):

- **Exit 3** — the workbench state is inconsistent: `.active-circle` is orphaned or corrupt. Stop and tell the user to fix or delete the pointer. Do not commit over an inconsistent workbench.
- **Exit 4** — an internal error in `fusion-paths`. The user's workbench is fine; do **not** send them to check `.active-circle`. Report it as a fusion bug.

Capture the starting state for the final report:

```bash
git rev-parse --abbrev-ref HEAD; git status --short; git log --oneline -1
```

If `--dry-run`, announce it now: every subsequent step reports its intent but performs no write, commit, dispatch, or push.

## Step 1 — Close the session: file issues for open tasks

The goal is that no unfinished work is lost when the session ends.

1. If `fusion-workbench/agentstate.yaml` exists, read it. Its `work_queue` entries with status other than `done`/`skipped`/`deferred` are unfinished. (This file is root-anchored — the hooks read it there. It is not resolved by `fusion-paths`.)
2. Read `$WORKBENCH/$TASKLIST` (if present) for unchecked tasks, and skim every path in `$SCAN_PLANS` for open or in-progress plans with unmarked or `[IN PROGRESS]` steps. `$SCAN_PLANS` may name **two** directories — the active Circle's and the shared one. Skim both, or unfinished work in one of them is silently missed.

   Match the marker (the underscore is inert — no escaping needed):

   ```bash
   # Split via command substitution, not `for d in $SCAN_PLANS`: zsh does not word-split
   # an unquoted parameter expansion, but both bash and zsh field-split an unquoted
   # command substitution. Store paths never contain whitespace, so the split is safe.
   for d in $(printf '%s\n' "$SCAN_PLANS"); do find "$WORKBENCH/$d" -mindepth 1 -maxdepth 1 \( -name '*_o_*.md' -o -name '*_p_*.md' \) 2>/dev/null | sort; done
   ```

   The underscore marker is inert as a glob: `-name '*_o_*.md'` matches the open plans literally and never collides with `_p_`, `_c_` or `_d_` plans, because slugs are hyphen-separated and never contain an underscore. `find` drives the enumeration so a missing or empty plans dir yields no output and never aborts the shell under zsh (an unmatched `ls` glob does). See `rules/fusion-workbench-conventions.md` `## Marker globs`; the convention applies to every marker in every vocabulary.
3. For each genuinely-unfinished task that is **not already tracked by an open issue**, file an issue per the decision/issue conventions in `rules/fusion-workbench-conventions.md`: `$WORKBENCH/$OUT_ISSUE/YYMMDD-HHMM_o_<slug>.md` (timestamp from `date +%y%m%d-%H%M`, never guessed). Each issue records what the task was, its source file, and why it's still open. Check every path in `$SCAN_ISSUES` — both stores — before filing, so an issue that already exists in the shared store is not duplicated into the Circle.

   `$OUT_ISSUE` is the right target for these: an unfinished task from this session arose from the active Directive, which is what the Origin Rule keys on. A defect this session merely *noticed* in unrelated code belongs in the shared store instead — but that is not what this step files.
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
3. For each group: write the commit message to a scratch file first (HEREDOC), then run stage and commit as one pair under the project's commit lock — it serialises access to the shared git index against any parallel session's agents (`rules/workbench-stash-and-lock.md` `## Commit lock`; the `with` form acquires, runs, and releases on any exit):
   ```bash
   "$FUSION_PLUGIN_ROOT/bin/fusion-commit-lock" with cleanup -- bash -c 'git add <path> <path> && git commit -F <msg-file>'
   ```
   Message format (Conventional Commits):
   ```
   <type>(<scope>): <summary>

   <optional body — why, not what>

   Co-Authored-By: Claude <noreply@anthropic.com>
   ```
   `<type>` ∈ `fix|feat|refactor|docs|chore|test`. Never amend; always new commits.
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

Read `$FUSION_PLUGIN_ROOT/skills/archive/SKILL.md` and execute its **tier-1** procedure (the safest tier) autonomously — no confirmation gate, since tier-1 is defined as safe-by-construction. Archive *moves* files; it never deletes. Take the tier definition, the survey and the destination from that skill body rather than assuming them here — it owns them, and restating them here would give the two files two chances to disagree. If tier-1 finds nothing to archive, report "nothing to archive" and continue.

If `--dry-run`, report the tier-1 survey (what would move) without moving anything.

## Step 5 — Revise CLAUDE.md

Read `$FUSION_PLUGIN_ROOT/skills/revise-claude-md/SKILL.md` and execute its full three-pass procedure (add → update → prune) against this session's learnings. Report the diff summary.

If `--dry-run`, run the survey passes but make no edits.

## Step 6 — Log activity

Read `$FUSION_PLUGIN_ROOT/skills/log-activity/SKILL.md` and execute its procedure to regenerate/update the activity log.

If `--dry-run`, report what it would write without writing.

## Step 7 — Commit the housekeeping artifacts, then push

Steps 3–6 produce changes: reconciler's tracking-file updates, the archive moves, the `CLAUDE.md` revision, and the activity log. Commit them now, in meaningful splits, exactly as in Step 2 (explicit staging, Conventional Commits messages, message via scratch file + `-F`, each stage+commit pair under `fusion-commit-lock with cleanup --`, no amend). Typical splits:

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
