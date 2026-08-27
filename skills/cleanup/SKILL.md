---
description: End-of-session cleanup — file issues for open tasks, commit + push the work in meaningful splits, reconcile, archive with safe defaults, reconcile CLAUDE.md at a user gate, log activity, then commit + push the housekeeping artifacts. One-shot wrap-up of a work session, with one stop for your approval.
argument-hint: "[--dry-run] [--no-push] [--only <steps>] [--skip <steps>]"
allowed-tools: [Bash, Read, Write, Edit, Glob, Grep, AskUserQuestion, Agent(fusion:reconciler), Agent(fusion:curator)]
---

# Fusion — cleanup (session wrap-up)

The user invoked `/fusion:cleanup`. This is a one-shot pipeline that closes out a work session: it captures unfinished work as issues, commits and pushes the real changes in meaningful splits, runs reconciliation, archives stale workbench files with safe defaults, reconciles `CLAUDE.md` against the project's history behind a user gate, regenerates the activity log, then commits and pushes the housekeeping artifacts those last steps produced.

**This is fusion's end-of-session command, and it is one of three.** `/fusion:setup` starts a session, `/fusion:cleanup` ends it, `/fusion:cadence` shows what happened. The archive pass, the `CLAUDE.md` pass and the activity-log pass are steps of this pipeline rather than commands of their own; their procedures still live in their own files, and this skill reads and performs them (Steps 4, 5 and 6). `--only` and `--skip` are how you reach one of them alone.

**Skills cannot invoke other slash commands.** Where a step corresponds to another fusion skill, read that skill's body from `$FUSION_SRC/skills/<name>/SKILL.md` and execute its procedure inline. Do not tell the user to type the slash command — perform the work. Two steps dispatch an agent directly rather than reading a body: Step 3 dispatches the `reconciler`, and Step 5 dispatches the `curator` twice, from the procedure `skills/curate/SKILL.md` holds. **That root is not specific to skill bodies: every path into a file the plugin ships carries `$FUSION_SRC`** — an agent prompt at `$FUSION_SRC/agents/<name>.md` exactly as much as a skill body — because nothing the plugin ships exists at a consuming project's root, where a bare `agents/…` or `skills/…` path resolves to nothing. Rule files are the exception in form only: an agent receives them from `"$FUSION_PLUGIN_ROOT/bin/fusion-rules"`, which prints absolute paths, so a `rules/…` name below identifies the file that governs and is not a path to open by hand.

Resolve that root once, before the first step that cites one:

```bash
if [ -x "${FUSION_PLUGIN_ROOT:-}/bin/fusion-source-root" ]; then
  FUSION_SRC="$("$FUSION_PLUGIN_ROOT/bin/fusion-source-root")"
elif [ -n "${FUSION_PLUGIN_ROOT:-}" ]; then
  echo "fusion: no bin/fusion-source-root in the installed plugin at $FUSION_PLUGIN_ROOT — the source root falls back to that install copy" >&2
  FUSION_SRC="$FUSION_PLUGIN_ROOT"
else
  FUSION_SRC=""
fi
echo "source root: ${FUSION_SRC:-UNRESOLVED (FUSION_PLUGIN_ROOT is unset)}"
```

**Why the branch, why it is a call, and why the call is guarded:** `bin/fusion-source-root`'s own header.

**`UNRESOLVED` is not a path, and no step below reads through it.** With `FUSION_PLUGIN_ROOT` unset the variable holds the empty string and every `$FUSION_SRC/…` citation resolves from `/`, finding nothing and saying nothing about why. Three steps here are behaviour rather than reading and would fail silently: Step 3 reads the domain cascade's one authoring home, and Steps 4–6 read three other skill bodies to execute their procedures inline. When it prints `UNRESOLVED`, stop before those steps, name them in the final report, and tell the user to restart the session so the SessionStart hook exports the variable. Do not improvise the content of a procedure you could not open.

**What the root does *not* cover.** A `bin/` helper is always run from `$FUSION_PLUGIN_ROOT` — `fusion-workbench-root`, `fusion-paths`, `fusion-session-mark`, `fusion-commit-lock` below. Whether the work-tree preference reaches helper resolution is part (c) of decision `260810-1544_*_should-prompt-called-bin-helpers-get-one-guarded-call-convention…` and is **unanswered**; do not assume it. The split is by what you do with the path: read shipped text → `$FUSION_SRC`; run an installed executable → `$FUSION_PLUGIN_ROOT`.

## Arguments

- empty (default) — run the full pipeline, committing and pushing.
- `--dry-run` — survey and report what each step *would* do, make no writes, no commits, no dispatch, with one exception: Step 5 dispatches the curator's survey pass, which writes its run file. Use this to preview.
- `--no-push` — run the full pipeline and commit, but never `git push`. Leave the commits local.
- `--only <steps>` — run only the named steps, in pipeline order. Comma-separated, no spaces.
- `--skip <steps>` — run the full pipeline except the named steps. Same spelling.
- `--full` — Step 5 only: the curator's unbounded evidence pass (dispatched as `**Scope:** full`).

The step names, in pipeline order, are the selector's whole vocabulary:

| Name | Step |
|---|---|
| `issues` | Step 1 — file issues for open tasks, finalise the session surfaces |
| `commit` | Step 2 — commit and push the real work |
| `reconcile` | Step 3 — dispatch the reconciler |
| `archive` | Step 4 — archive with safe defaults (tier-1) |
| `claude-md` | Step 5 — reconcile `CLAUDE.md` at the gate |
| `log-activity` | Step 6 — regenerate the activity log |
| `commit-housekeeping` | Step 7 — commit and push what Steps 3–6 produced |

`--only archive`, `--only claude-md` and `--only log-activity` are the three that replace commands fusion used to expose on their own. Step 8, the report, always runs; it reports the steps that ran and names the ones that did not. `--only` and `--skip` are mutually exclusive — given both, ask which was meant rather than guessing. A name the table does not carry is an error: say which name and list the valid ones. Neither flag relaxes a guardrail, and neither turns the gate in Step 5 off.

## Autonomy and safety

**The pipeline runs unattended through every step except one.** Step 5 reconciles `CLAUDE.md` and it stops there for your approval: the curator surveys, this skill puts the change ledger to you, and nothing reaches `CLAUDE.md` until you answer. That is the only gate, and it is deliberate — no mechanism edits this project's binding instructions without a person seeing what changes. **A run that is typed and walked away from stops at Step 5 and does not finish.** Steps 6, 7 and 8 never happen, so the activity log is not regenerated and the housekeeping commits are not made. Either sit with the run, or reach for `--skip claude-md`, which runs the rest end to end and leaves `CLAUDE.md` for a later pass.

Three hard guardrails hold on every run, gate or no gate:

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

If `--dry-run`, announce it now: every subsequent step reports its intent but performs no write, commit, dispatch, or push — except Step 5's survey dispatch and the run file it writes.

## Step 1 — Close the session: file issues for open tasks

The goal is that no unfinished work is lost when the session ends.

1. If `fusion-workbench/agentstate.yaml` exists, read it. Its `work_queue` entries with status other than `done`/`skipped`/`deferred` are unfinished. (This file is root-anchored — the hooks read it there. It is not resolved by `fusion-paths`.)

   **Capture the session's domain here, before anything deletes the file** — item 4 of this step removes `agentstate.yaml`, and Step 3 (Reconcile) needs the value it holds. The same guarded call `/fusion:next` Step 2 and `/fusion:direct` Step 3 make; `bin/fusion-session-domain`'s header carries the contract:

   ```bash
   if [ -x "$FUSION_PLUGIN_ROOT/bin/fusion-session-domain" ]; then "$FUSION_PLUGIN_ROOT/bin/fusion-session-domain"; else printf 'domain=code\nsource=helper-missing\n'; fi
   ```

   Hold `domain=` as `$DOMAIN` and `source=` as `$DOMAIN_SOURCE` for the rest of the run.
2. Skim every path in `$SCAN_PLANS` for open or in-progress plans with unmarked or `[IN PROGRESS]` steps. `$SCAN_PLANS` may name **two** directories — the active Circle's and the shared one. Skim both, or unfinished work in one of them is silently missed.

   Match the marker (the underscore is inert — no escaping needed):

   ```bash
   # Split via command substitution, not `for d in $SCAN_PLANS`: zsh does not word-split
   # an unquoted parameter expansion, but both bash and zsh field-split an unquoted
   # command substitution. Store paths never contain whitespace, so the split is safe.
   for d in $(printf '%s\n' "$SCAN_PLANS"); do find "$WORKBENCH/$d" -mindepth 1 -maxdepth 1 \( -name '*_o_*.md' -o -name '*_p_*.md' \) 2>/dev/null | sort; done
   ```

   Marker-glob semantics, and why `find` drives the enumeration (zsh aborts on an unmatched `ls` glob): `rules/fusion-workbench-conventions.md` `## Marker globs` — the convention applies to every marker in every vocabulary.
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
3. For each group: write the commit message to a scratch file first — with the `Write` tool, or via a **quoted** heredoc delimiter (`cat > <msg-file> <<'FUSION_MSG_EOF'`), never a bare `<<EOF`, which still expands `$var` and runs backticks in the message body. The message then reaches `git` only as `-F <msg-file>`, never as an argument on a command line, so an apostrophe in it cannot end a quoted string. Then run stage and commit as one pair under the project's commit lock — it serialises access to the shared git index against any parallel session's agents (`rules/commit-lock.md` `## Commit lock`; the `with` form acquires, runs, and releases on any exit):
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

For the commit-message craft and staging discipline, the procedure in `$FUSION_SRC/skills/commit/SKILL.md` is the reference; apply it per split.

Report: the list of commits created (hash + summary) and push result.

## Step 3 — Reconcile

Dispatch the reconciler to bring tracking files in line with ground truth.

- **Skip when nothing moved.** `[ -x "$FUSION_PLUGIN_ROOT/bin/fusion-cadence-anchor" ] && "$FUSION_PLUGIN_ROOT/bin/fusion-cadence-anchor" changed-since last_reconcile_commit` — only `changed=no` skips (the helper's header carries the contract; `unknown` never does): report the skip and continue to Step 4. Otherwise dispatch, and after the reconciler returns, `set last_reconcile_commit "$(git rev-parse HEAD)"` through the same guarded helper.
- Use the `$DOMAIN` captured in Step 1. **This skill obtains the domain; it never decides one.** The decision is made in exactly one place — Setup Step 5 of `$FUSION_SRC/agents/orchestrator.md` — and `agentstate.yaml` carries the verdict that run produced. A second statement of that heuristic anywhere else drifts from the first and the two then disagree inside a single session, which is what the plugin's own `domain-cascade.test.ts` now fails on: it scans the file set `REACH.fileSet` names in `hooks/lib/domain-cascade.ts`, whose reach `describeReach()` renders into `README-hooks.md` and the suite compares byte-for-byte, and only the orchestrator's prompt may state the cascade. Read the reach off that rendered block rather than from a copy here, which is how the claim in this file went one file set short of the gate once already.
- With no `agentstate.yaml` (a cleanup run outside an orchestrator session), `$DOMAIN` is `code` — the same fallback `/fusion:next` and `/fusion:direct` take, and the cascade's own no-evidence exit. Report `$DOMAIN_SOURCE` beside it, never just the value.
- `Agent(fusion:reconciler)` with the dispatch prompt prefixed by `**Domain:** $DOMAIN` on its own line.
- Read the reconciler's returned summary; note any discrepancies it fixed or flagged.

If `--dry-run`, skip the dispatch and report `$DOMAIN` with its `$DOMAIN_SOURCE`.

## Step 4 — Archive with safe defaults

Read `$FUSION_SRC/skills/archive/SKILL.md` and execute its **tier-1** procedure (the safest tier) autonomously — no confirmation gate, since tier-1 is defined as safe-by-construction. Archive *moves* files; it never deletes. Take the tier definition, the survey and the destination from that skill body rather than assuming them here — it owns them, and restating them here would give the two files two chances to disagree. If tier-1 finds nothing to archive, report "nothing to archive" and continue.

If `--dry-run`, report the tier-1 survey (what would move) without moving anything.

## Step 5 — Reconcile CLAUDE.md (the one gate)

Read `$FUSION_SRC/skills/curate/SKILL.md` and execute its procedure inline, end to end: resolve paths with `fusion-paths curate`, dispatch `fusion:curator` with `**Mode:** survey`, read the run file it wrote, run the blast-radius confirmation when that stop fired, **put the gate to the user**, then dispatch the curator a second time with `**Mode:** apply` plus the ledger path and the approved ids. Report as that body's last step says.

That file owns the procedure and this one does not restate it — the dispatch parameters, the two halt conditions on the run file, the gate's option shape and the per-entry id path are all defined there, and a second statement of them here would be a copy that drifts.

Three things are this step's and not that body's:

- **The gate is yours to hold and you do not skip it.** `AskUserQuestion` is in this skill's `allowed-tools` for exactly this. Never approve on the user's behalf, and never send an apply dispatch with an empty approval set — an empty set is a rejection, so you dispatch nothing.
- **A rejection is a complete step**, not a failure. Record it in one line and go on to Step 6.
- **`--dry-run` stops after the survey.** Dispatch the survey pass, report the run file's path and the per-group counts, ask nothing, and dispatch no apply pass. Same shape as every other step under `--dry-run`, save the run file the survey writes: it shows what would change and applies nothing.

This step replaces the autonomous three-pass rewrite of `CLAUDE.md` that cleanup used to run. The pass that reads the whole workbench and the whole git history, cites its evidence per entry, and lands nothing unapproved is the one path to this file now.

## Step 6 — Log activity

Read `$FUSION_SRC/skills/log-activity/SKILL.md` and execute its procedure to regenerate/update the activity log.

If `--dry-run`, report what it would write without writing.

## Step 7 — Commit the housekeeping artifacts, then push

Steps 3–6 produce changes: reconciler's tracking-file updates, the archive moves, whatever the curator applied to `CLAUDE.md` and the other normative surfaces, and the activity log. Commit them now, in meaningful splits, exactly as in Step 2 (explicit staging, Conventional Commits messages, message via scratch file + `-F`, each stage+commit pair under `fusion-commit-lock with cleanup --`, no amend). Typical splits:

- `chore(workbench): reconcile tracking files` — reconciler output
- `chore(workbench): archive stale files (tier-1)` — the archive moves
- `docs: apply the approved normative-surface changes` — the curator's applied edits
- `docs: update activity log` — the activity log

Then **push** (unless `--no-push`), same rules as Step 2.

## Step 8 — Report

A single concise summary, action-first per `rules/user-facing-output.md`:

- Issues filed for open tasks: N (with paths)
- Commits created across both phases: list (hash + summary)
- Push: pushed to `<branch>` / skipped (`--no-push`) / **rejected** (with the git error)
- Reconcile: domain used, and where it came from (`$DOMAIN_SOURCE`); discrepancies fixed/flagged
- Archive: files moved (count) into `<archive folder>` / nothing to archive
- Normative surfaces changed: entries approved and applied, per surface; every entry that came back `stale` or `failed`, by id and reason; or that the ledger was rejected, or that the survey proposed nothing
- Activity log: updated
- Normative surfaces, current state: the date of the last consolidation run, or that none has run, followed by the current size in bytes of the decision records, the project's own rule files, and `CLAUDE.md`

**Where the consolidation line comes from.** It is a read-only measurement. It dispatches nothing, writes nothing, and runs under `--dry-run` exactly as it does on a full run. It reports the state of the surfaces; Step 5 is what changes them, and only through the gate.

`$LAST_RUN` is the run-file path Step 5 held; when Step 5 was skipped, take the newest `*-curator-run.md` across `$SCAN_HISTORY` — newest **by filename** (stamped `YYMMDD-HHMM`), never by whole-path sort, which orders by store directory first.

```bash
# The three surfaces, in bytes. `find -exec cat {} +` runs nothing when nothing
# matches, so an empty or absent store contributes zero instead of hanging.
DECISION_BYTES="$(for d in $(printf '%s\n' "$SCAN_DECISIONS"); do
  find "$WORKBENCH/$d" -mindepth 1 -maxdepth 1 -name '*.md' -exec cat {} + 2>/dev/null
done | wc -c)"
RULE_BYTES="$(for d in ./rules ./.claude/rules; do
  [ -d "$d" ] && find "$d" -maxdepth 1 -name '*.md' -exec cat {} + 2>/dev/null
done | wc -c)"
CLAUDE_MD_BYTES="$( [ -f CLAUDE.md ] && wc -c < CLAUDE.md || echo 0 )"
```

Read the date out of `$LAST_RUN`'s filename — its leading `YYMMDD-HHMM` — and report it with the three totals. The two rule directories are relative to the project root, where Step 0 left you, and both are optional: a project shipping neither reports zero for that surface, which is a measurement rather than a failure. **When `$LAST_RUN` is empty, say that no consolidation has run on this project.** Do not report an absent run as a zero or an old date — a project that has never consolidated and a run that found nothing to change are different facts, and only the first is a reason to run `--only claude-md` later, and only when Step 5 was skipped on this run: after a full run it has already surveyed and gated.

End with anything that needs the user's attention (a rejected push, a flagged reconcile discrepancy, conflicts). If everything succeeded cleanly, the first line is "Session cleaned up — nothing needs your attention."

## Notes for the assistant

- This skill is destructive-adjacent (it commits and pushes). The guardrails in "Autonomy and safety" are not optional.
- The two commit phases are deliberate: Step 2 captures the *work*, Step 7 captures the *housekeeping the work triggered*. Don't collapse them — a clean tree before reconcile makes the reconciler's diff legible.
- If the repo is not a git repository, skip Steps 2 and 7's commit/push and say so; still run reconcile, archive, the `CLAUDE.md` gate, and the activity log.
- One-shot wrap-up: ask at Step 5's gate, report once at the end — not after every step (unless a guardrail trips).
