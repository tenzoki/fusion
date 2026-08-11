---
description: Run the mandatory orchestrator Setup procedure — workspace, dashboard, interrupted-session check, rules, history, event log
allowed-tools: [Bash, Read, Write, Edit, AskUserQuestion]
---

# Orchestrator Setup

The active agent MUST be `fusion:orchestrator`. This skill inlines the full Setup procedure so it cannot be skipped.

Execute every step below in order. Do not begin the user's task work until Setup is complete and any Step 1 decision has been resolved.

**A path into a file the plugin ships carries the `$FUSION_SRC` root.** Where a step below sends you to an agent prompt or another skill's body, open it at that root — nothing the plugin ships exists at a consuming project's root, so a bare `agents/…` or `skills/…` path resolves to nothing there. Resolve the root once, before the first step that cites one:

```bash
if [ -z "${FUSION_PLUGIN_ROOT:-}" ]; then FUSION_SRC=""; elif "$FUSION_PLUGIN_ROOT/bin/fusion-plugin-cwd" 2>/dev/null; then FUSION_SRC="$PWD"; else FUSION_SRC="$FUSION_PLUGIN_ROOT"; fi
echo "source root: ${FUSION_SRC:-UNRESOLVED (FUSION_PLUGIN_ROOT is unset)}"
```

Hold the printed path and use it wherever a step below writes `$FUSION_SRC/…`. Each shell call gets a fresh shell, so the one executable check in this file re-resolves those same two lines rather than relying on the variable surviving.

**`UNRESOLVED` is not a path, and no step below reads through it.** With `FUSION_PLUGIN_ROOT` unset the variable holds the empty string, every `$FUSION_SRC/…` citation then resolves from `/`, and the two steps that cite one without an inline fallback — the churn ranking and the domain detection in Step 3 — would find nothing and say nothing about why. The check is this print, once, rather than a test at each site. When it prints `UNRESOLVED`, name it in the Setup-complete summary, say that no step citing a plugin file was run and which ones those were, and tell the user to restart the session so the SessionStart hook exports the variable. Do not improvise the content of a section you could not open. That is `rules/fusion-workbench-conventions.md` `## Path Resolution` → *Where the call belongs* applied to a held root: nothing is read through a value that came back empty, and the run names the value instead.

**Why the branch.** `$FUSION_PLUGIN_ROOT` names the installed copy and is pinned for the whole session. Inside the fusion plugin's own source repository that is the wrong copy: `bin/fusion-rules` and `bin/fusion-paths` read the work tree there on purpose, so a citation left on the install would hand you rules and paths from the checkout and a cited prompt section from the install — two versions of one file, differing in silence. `bin/fusion-plugin-cwd` is the criterion those two helpers already use, so this is the same answer and not a second one. It tests the working directory and never walks up: from a subdirectory of that repository it answers no, deliberately, and every branch here then behaves as it does in a consuming project. An install too old to carry the helper also falls to `$FUSION_PLUGIN_ROOT`, which is the behaviour that preceded this rule — an unset `FUSION_PLUGIN_ROOT` does not, because there is nothing to fall to. `$FUSION_SRC/skills/cleanup/SKILL.md:11` takes the plugin-root route for skill bodies and states the reason; it is not repeated at each site here.

## CRITICAL — Setup is the ONLY place a workbench is created

Setup is the single point where a fusion workbench is bootstrapped. The workbench lands at `./fusion-workbench/` relative to the directory `pwd` reports when this skill runs. After setup completes, every subsequent fusion agent and hook locates the workbench by walking *upward* from its working directory until it finds the marker file `fusion-workbench/.fusion-setup` (written in Step 0 below). Without that marker, agents halt and hooks no-op — fusion does NOT bootstrap a workbench in any directory other than the one setup ran in.

This makes setup deliberately strict: run it once, at the project root you want fusion to govern. If you accidentally run setup in a subfolder, the result is two independent fusion projects — one at the subfolder and one at the parent (if it had setup before). Walk up to the intended root before running setup.

**Never** prepend `cd <something>` to the commands below. Run them exactly as written so the workbench lands at `./fusion-workbench/` relative to the directory the user invoked setup from.

## Step 0 — Confirm and create workspace

```bash
pwd
```

Note the path. The workbench will be created here.

### Pre-v4 layout check (CRITICAL — refuse, do not migrate)

**This runs before the `mkdir` below, and the order is the whole point.** A workbench created before v4 keeps its artifacts in type folders at the workbench root (`planning/`, `issues/`, `decisions/`, …); the container layout puts them in `shared/`. Setup does **not** migrate — `/fusion:migrate` does. Setup's job here is to notice and stop.

Stopping *before* the `mkdir` is what makes this worth doing. The `mkdir -p` below creates `shared/planning/` and friends; run it against a pre-v4 workbench and the workbench is now split across two layouts — old artifacts at the root, an empty new store beside them — and every agent dispatched afterwards writes into the new one while every old artifact sits unreachable in the old. That is not hypothetical: it is filed as `fusion-workbench/shared/issues/260717-0115_*_live-workbench-split-across-two-layouts-during-conversion.md`. The marker write further down is the second reason: it overwrites `plugin_version`, destroying the only record of which version produced the workbench.

Detection is by artifact presence, not by version — a workbench with no out-of-format artifacts has nothing to migrate regardless of which version created it. It fires on two shapes: a pre-v4 type-folder / flat-Circle layout, **and** a container-layout workbench whose filenames still carry the old bracket-form state marker (`…[o]-….md`) instead of the underscore form. Both route to `/fusion:migrate`, which brings the workbench fully to the current format. Read-only:

**The bracket-marker probe skips the frozen stores, and the exclusions are load-bearing — do not drop them.** `archive/`, `stashes/` and `.migration-v2-backup/` hold content deliberately taken out of circulation: `/fusion:archive` moves it there, `/fusion:circle-stash` freezes it, and the retired `/fusion:migrate-workbench-v2` (fusion v2.3–v2.5) left the backup copy behind as its rollback path. A frozen artifact keeps the filename it carried when it was frozen, so a workbench that ever archived pre-underscore content carries bracket markers forever — and not one of them is live. Unexcluded, the probe reads them as an unconverted workbench and refuses Setup permanently, then routes the user to `/fusion:migrate`, whose own survey is already scoped to `shared/` and `circles/` (`skills/migrate/SKILL.md:52,85`) and therefore reports nothing to do. That is a deadlock rather than a mere false positive, and it was hit twice on one consuming project — 1146 matches, all of them under `archive/` and `.migration-v2-backup/`, none anywhere else. The precedent for the exclusion set is `/fusion:log-activity` Step 3, which drops these same frozen stores on the same grounds (plus `stilwerk/`, which for that skill is configuration rather than activity): moved or frozen content is not live content. The principle underneath: this check exists to catch artifacts that would become *unreachable* when the new store is created beside them, and a frozen artifact already sits outside every agent's search path.

**The bracket-marker probe matches the marker shape, not any bracket pair.** The `find` name test `'*[[]*[]]*.md'` is only the cheap prefilter; the `grep` behind it keeps a file only when its basename carries the actual old marker form `[x]-` with `x` one of `oatcibspd` — exactly the set `/fusion:migrate`'s rename pass converts (`s/\[([oatcibspd])\]-/_\1_/g`, `skills/migrate/SKILL.md` Step 4). The detector must only look for things the executor can remove: a name like `notes [draft].md` carries a bracket pair no migration will ever rename, and flagging it would refuse Setup permanently while `/fusion:migrate` correctly reports nothing to do — the same deadlock the frozen-store exclusions close, arrived at from the shape side.

The other two probes need no exclusion and must not be given one. The type-folder probe tests `$WB/<folder>` directly, so an archived `archive/<batch>/planning/` is not a root type folder and cannot match. The Circle-file probe is `-mindepth 1 -maxdepth 1` under `circles/`, while frozen Circles live at `archive/<batch>/circles/…` or `stashes/<id>/circle/`. Both are bounded by construction; the bracket-marker probe is the only one of the three that walks the whole tree, which is why it is the only one that needed fixing.

```bash
WB=./fusion-workbench; OLD=0; if [ -d "$WB" ]; then for d in planning issues decisions history analyses investigations consult memos codereview ontoreview conceptreview; do [ -d "$WB/$d" ] && { echo "  $d/ (Typ-Ordner der Wurzel)"; OLD=1; }; done; while IFS= read -r f; do printf '%s' "$(basename "$f" .md)" | grep -qE '^[0-9]{6}-[0-9]{4}\[[a-z]\]' && { echo "  circles/$(basename "$f") (Circle-Datei im alten Marker-Format)"; OLD=1; }; done < <(find "$WB/circles" -mindepth 1 -maxdepth 1 -name '*.md' 2>/dev/null); BM="$(find "$WB" -type f -name '*[[]*[]]*.md' -not -path '*/archive/*' -not -path '*/stashes/*' -not -path '*/.migration-v2-backup/*' 2>/dev/null | grep -E '\[[oatcibspd]\]-[^/]*$' | head -1)"; [ -n "$BM" ] && { echo "  Dateien mit Klammer-Marker im Namen (Format vor der Umstellung auf Unterstrich), z.B. ${BM#"$WB"/}"; OLD=1; }; fi; echo "OLD=$OLD"
```

- **`OLD=0`** — nothing pre-v4 here. Continue with the `mkdir` below. Say nothing about it.
- **`OLD=1`** — **stop Setup here.** Do not run the `mkdir`. Do not write the marker. Do not proceed to any later step. Tell the user, in the project's language per the `**Language:**` line in `CLAUDE.md` (see `rules/fusion-workbench-conventions.md` `## Project language`), following `rules/user-facing-output.md` and the chat profile at `./fusion-workbench/stilwerk/chat-voice-<lang>.yaml`. Show the detected entries above the message so the user sees what was found. German shape:

  > **Setup abgebrochen.** Diese workbench hat noch das Layout vor v4 — die oben genannten Artefakte liegen in Typ-Ordnern der Wurzel statt in `shared/`. Setup legt die neue Struktur nicht daneben an, weil die workbench damit über zwei Layouts verteilt wäre und die alten Einträge keine Suche mehr fände.
  >
  > **Nächster Schritt:** `/fusion:migrate` ausführen, dann `/fusion:setup` erneut starten. Die Migration zeigt vorher an, was sie verschiebt, und fragt nach.

  This is a refusal, not a question — there is nothing for the user to choose here, and `AskUserQuestion` would imply otherwise. `/fusion:migrate` is where the choice lives.

Only when `OLD=0`:

```bash
mkdir -p ./fusion-workbench/circles ./fusion-workbench/shared/planning ./fusion-workbench/shared/issues ./fusion-workbench/shared/decisions ./fusion-workbench/shared/analyses ./fusion-workbench/shared/reviews ./fusion-workbench/shared/investigations ./fusion-workbench/shared/consult ./fusion-workbench/shared/history ./fusion-workbench/shared/memos ./fusion-workbench/archive ./fusion-workbench/.guard-state
```

This is the Circle-container layout defined in `rules/fusion-workbench-conventions.md` `## fusion-workbench Layout`. Three things about it are worth knowing here:

- **A Circle is a directory, not a file.** `circles/` starts empty; each unit of work later gets `circles/<YYMMDD-HHMM>-<slug>/` with its own `planning/`, `issues/`, `decisions/`, `history/`, `reviews/` and `analyses/`. Setup does not create any Circle.
- **`shared/` is the home for everything with no Circle affiliation** — the Origin Rule's "unknown origin means shared". `investigations/`, `consult/` and `memos/` exist only there, because none of the three is produced by executing a Directive.
- **The root-anchored surfaces stay at the root.** `agentstate.yaml`, `orchestrator-live.md`, `orchestrator-events.jsonl` and `.guard-state/` are read at fixed root-relative paths by `hooks/tracker.ts:33-36` and `bin/monitor:72-75`; `.commit-lock/` by `bin/fusion-commit-lock` and `.session-marker` by `bin/fusion-session-mark`. Never create them anywhere else; none of these consumers has a fallback path. Only `.guard-state/` is pre-created above — the rest appear when their consumer first writes them. The full list is in `rules/fusion-workbench-conventions.md` `## fusion-workbench Layout`.

Write the setup marker (this is the file every agent and hook looks for to confirm fusion is set up here):

```bash
printf '{"setup_at":"%s","setup_pwd":"%s","plugin_version":"%s"}\n' \
  "$(date +%Y-%m-%dT%H:%M:%S%z)" \
  "$(pwd -P)" \
  "$(grep '"version"' "$FUSION_PLUGIN_ROOT/.claude-plugin/plugin.json" | head -1 | sed -E 's/.*"version": *"([^"]+)".*/\1/')" \
  > ./fusion-workbench/.fusion-setup
```

If `./fusion-workbench/` already existed from a prior fusion version, the `mkdir -p` is harmless and existing content is preserved. Pre-v4 content is caught by the layout check above, which stops Setup before this point and routes the user to `/fusion:migrate` — so a workbench reaching this `mkdir` is already in the container layout.

Obtain current time: `date +%H:%M`.

Overwrite `./fusion-workbench/orchestrator-live.md` with (substitute `<HH:MM>`):

```markdown
# Orchestrator — Live

**Turn:** --/-- | **Tasks:** --/-- | **Commits:** 0 | **Errors:** 0
**Started:** <HH:MM> | **Session:** Initializing | **Guard:** checking...

## Current
  [SETUP] orchestrator -> New session starting...
```

This makes the monitor show the new session immediately, even while the rest of Setup runs.

## Step 0b — Refresh the monitor binary locally

Always re-copy the monitor from the installed plugin so the project's copy matches the current plugin version (a stale local monitor from an earlier install is the most common dashboard bug). Copy to a temp file and atomically `mv` it into place — this overwrites cleanly even when a monitor process is currently running (avoids `Text file busy` / `ETXTBSY`):

```bash
[ -n "$FUSION_PLUGIN_ROOT" ] && [ -f "$FUSION_PLUGIN_ROOT/bin/monitor" ] && { cp "$FUSION_PLUGIN_ROOT/bin/monitor" ./fusion-workbench/monitor.new && chmod +x ./fusion-workbench/monitor.new && mv -f ./fusion-workbench/monitor.new ./fusion-workbench/monitor; }
```

If `$FUSION_PLUGIN_ROOT` is not set or the copy fails, note it in the history file later but do not block Setup.


## Step 0c — Concurrent-session check (advisory)

Fusion has no concurrency lock. Two orchestrators on the same project can corrupt `agentstate.yaml`, double-dispatch tasks, and race on `.guard-state/` counters. Setup checks for an active session marker and warns the user.

```bash
"$FUSION_PLUGIN_ROOT/bin/fusion-session-mark" check
```

The helper prints `running`, `stale`, or `none` on stdout, and (when running/stale) the marker contents on stderr.

- **`none` or `stale`:** no active session detected. Write a fresh marker for this orchestrator session and continue:
  ```bash
  "$FUSION_PLUGIN_ROOT/bin/fusion-session-mark" write fusion:orchestrator
  ```
- **`running`:** another fusion orchestrator session has updated the marker within the last 10 minutes. **Warn the user** with the marker contents (start time, cwd, agent label) and use `AskUserQuestion` to offer:
  - **Proceed anyway** — overwrite the marker for this session. Document the risk: parallel orchestrators may corrupt workbench state. The user takes responsibility for sequencing.
  - **Abort** — stop Setup. Tell the user where the other session appears to be running.

  Do not silently overwrite. The whole point of this step is the warning.

## Step 0d — Ensure stylometric profiles are present locally

Two profile families seed the project's user-facing voice, both at `./fusion-workbench/stilwerk/` so each project can edit them without affecting other projects or the plugin:

- `default-voice-{en,de}.yaml` — the long-form **writing** profile (cadence, vocabulary, structural patterns for narrative outputs: session summaries, consultant reports, analysis reports, spec/plan prose).
- `chat-voice-{en,de}.yaml` — the short-form **chat** profile (anti-pattern blacklist plus a minimal terse-and-direct whitelist for gate prompts, AskUserQuestion text, status reports, chat replies).

```bash
mkdir -p ./fusion-workbench/stilwerk
[ -f ./fusion-workbench/stilwerk/default-voice-en.yaml ] || { cp "$FUSION_PLUGIN_ROOT/stilwerk/default-voice-en.yaml" ./fusion-workbench/stilwerk/default-voice-en.yaml && echo "default-voice-en.yaml copied"; }
[ -f ./fusion-workbench/stilwerk/default-voice-de.yaml ] || { cp "$FUSION_PLUGIN_ROOT/stilwerk/default-voice-de.yaml" ./fusion-workbench/stilwerk/default-voice-de.yaml && echo "default-voice-de.yaml copied"; }
[ -f ./fusion-workbench/stilwerk/chat-voice-en.yaml ] || { cp "$FUSION_PLUGIN_ROOT/stilwerk/chat-voice-en.yaml" ./fusion-workbench/stilwerk/chat-voice-en.yaml && echo "chat-voice-en.yaml copied"; }
[ -f ./fusion-workbench/stilwerk/chat-voice-de.yaml ] || { cp "$FUSION_PLUGIN_ROOT/stilwerk/chat-voice-de.yaml" ./fusion-workbench/stilwerk/chat-voice-de.yaml && echo "chat-voice-de.yaml copied"; }
```

Both copies are idempotent — existing files are left untouched, so any project-local edits to the profiles survive subsequent setups.

If `$FUSION_PLUGIN_ROOT` is not set or the copy fails, note it in the history file later but do not block Setup.

## Step 0e — Ensure the Plane config template is present locally

`bin/fusion-plane` (the Plane work-queue mirror) reads `./fusion-workbench/plane.config.yaml` for the instance's `base_url`, `workspace_slug`, `project_id`, and state-name mapping (the API key is never in this file — it lives in `$PLANE_API_KEY`; see `docs/plane-setup.md`). Seed the template so the file exists for the user to fill in. The copy is idempotent — a filled-in config is never overwritten:

```bash
[ -f ./fusion-workbench/plane.config.yaml ] || { cp "$FUSION_PLUGIN_ROOT/templates/plane.config.yaml" ./fusion-workbench/plane.config.yaml && echo "plane.config.yaml template copied — fill it in per docs/plane-setup.md"; }
```

The Plane bridge is optional: an unfilled template simply means no mirror runs (`fusion-plane doctor` reports it plainly). If `$FUSION_PLUGIN_ROOT` is not set or the copy fails, note it in the history file later but do not block Setup.

## Step 0f — Ensure the guard configuration file is present locally

The compliance guard hooks read `./fusion-guard.json` on every guarded tool call and merge it over the plugin's own `hooks/config.json`, so this file is where a project narrows or widens what the guard protects (`hooks/lib/config.ts`; the seeded template declares nothing and therefore inherits everything). It belongs in version control: it decides what the guard protects, so every change to it has to show up in a diff.

It lands at the project root, beside `fusion-workbench/` rather than inside it, in the directory `pwd` reported in Step 0. The "never prepend `cd`" rule at the top of this skill is what keeps it there.

First check whether the project already has one. This is read-only and always allowed:

```bash
[ -f ./fusion-guard.json ] && echo "fusion-guard.json present" || echo "fusion-guard.json absent"
```

- **`present`** — nothing to do; continue to Step 1. Do not run the copy anyway: once the file exists the guard protects it, and a `cp` naming it as a destination is denied on the spot, whatever the shell would have made of it.
- **`absent`** — seed the template. The copy is idempotent and never overwrites:

  ```bash
  [ -f ./fusion-guard.json ] || { cp "$FUSION_PLUGIN_ROOT/templates/fusion-guard.json" ./fusion-guard.json && echo "fusion-guard.json template copied — inherits the plugin's guard defaults until you edit it"; }
  ```

The probe is why this step runs two commands where Steps 0b, 0d and 0e run one. `fusion-guard.json` is the only file Setup seeds that the guard protects once it exists, so the plain one-command form is denied on every later Setup run in a project that already has one. That was measured against the guard, not reasoned about. The `[ -f ]` guard inside the copy stays regardless, so the block is still safe on its own for anyone who runs it without the probe.

If `$FUSION_PLUGIN_ROOT` is not set or the copy fails, note it in the history file later but do not block Setup. An absent `fusion-guard.json` costs the project nothing: the guard falls back to the plugin's configuration, which is exactly what the template inherits.

## Step 1 — Interrupted-session check (CRITICAL — do not skip)

Read `./fusion-workbench/agentstate.yaml`.

- **If it does not exist:** fresh session — continue to Step 2.
- **If it exists:** a prior session was interrupted. You MUST do ALL of:
  0a. **Schema check (v2.9.0).** If the saved `agentstate.yaml` contains the legacy fields `cycle:` or `goal:` (instead of the current `turn:` / `directive:`), it is a pre-v2.9.0 snapshot that cannot be replayed against v2.9.0 fields. The schema rename is a hard break — there is no soft alias. Tell the user "schema mismatch — please restart", offer **Restart only** (delete `agentstate.yaml` and proceed with fresh setup), and do not attempt to resume. Skip the remaining sub-steps once Restart is chosen.
  1. Read the file completely.
  2. **Run the drift check before you summarise, not after.** The saved state is what you are about to replay, and a frozen one describes a session that got much further than it says it did — measured six times, with `agentstate.yaml` saying `commits: 0` while git counted 6, 7, 8 and 12 (issue `260801-2038`). A divergence of that size changes the answer to "Continue or Restart?", and the user cannot weigh it if you present the file's own numbers as fact.

     ```bash
     if [ -x "$FUSION_PLUGIN_ROOT/bin/fusion-state-drift" ]; then
       "$FUSION_PLUGIN_ROOT/bin/fusion-state-drift"
     else
       echo "fusion: no bin/fusion-state-drift in the installed plugin at $FUSION_PLUGIN_ROOT — no drift check taken" >&2
     fi
     ```

     It prints `anchor=`, `state=`, `rows=`, `drift=` and `verdict=`, then one line per surface: what the surface says, what the record that can contradict it says, and `DRIFT` or `UNCHECKED (<reason>)` where either applies. `verdict=drift` is **a line of output, not an exit code** — exit 0 means the check ran, exit 2 means no workbench, exit 3 means the installed plugin carries no compiled hooks. The `[ -x ]` guard is the one Step 3's churn ranking carries, for the same reason: `$FUSION_PLUGIN_ROOT` is the installed copy, pinned for the whole session, so a helper added between releases is absent there and a bare call is exit 127. Do not re-implement the comparison by hand; the same computation runs in `hooks/tracker.ts` after every tool call, and two spellings of it would be free to disagree.
  3. Present a summary to the user:
     - Session Directive and mode
     - Progress (Turn number, tasks completed vs total)
     - The task that was active when the session stopped
     - Remaining tasks (with their status)
     - Plan file and user directive, if any
     - **Every diverging row from step 2**, each naming the surface, what it says, and the record that contradicts it. If nothing diverged, say that too — the user is deciding whether to trust the file.
  4. Use `AskUserQuestion` to offer:
     - **Continue** — resume from the saved queue, skipping completed tasks
     - **Restart** — discard state, delete `agentstate.yaml`, fresh setup
     - **Modify** — user provides updated instructions before resuming
  5. **STOP. Do not proceed until the user has chosen.** Even if the user's original prompt implied resuming a specific task, the choice must be explicit.

## Step 2 — Rules check

```bash
"$FUSION_PLUGIN_ROOT/bin/fusion-rules" orchestrator
"$FUSION_PLUGIN_ROOT/bin/fusion-paths" orchestrator
```

Read every path `fusion-rules` emits. The helper emits `fusion-workbench-conventions.md` (always) plus any project-local rules from `./rules/`.

`fusion-paths` resolves where this session writes and searches, and prints `KEY=value` lines (`OUT_HISTORY`, `OUT_ISSUE`, `SCAN_ISSUES`, …).

**Pass `orchestrator`, not `setup`.** Every other skill passes its own name, because `fusion-paths` reads a consumer's key set out of its prompt and each skill is its own consumer (`rules/fusion-workbench-conventions.md` `## Path Resolution`). This skill is the exception: it *is* the orchestrator's Setup, and the values resolved here are held by the **orchestrator** for the whole session — including steps that live in `$FUSION_SRC/agents/orchestrator.md` and not in this file. Passing `setup` would yield only the keys this file happens to name, and the orchestrator would be short the rest.

Hold these values for the rest of the session and use them wherever a later step names a `$OUT_*` or `$SCAN_*` value — they are the only correct answer to "where does this go". Never guess a path when the resolver fails; stop and report.

On a non-zero exit, read the code — it says whose fault it is (full table in `rules/fusion-workbench-conventions.md` `## Path Resolution` → Exit codes):

- **Exit 3** — the workbench state is inconsistent: `.active-circle` is orphaned or corrupt. Tell the user to fix or delete the pointer before continuing.
- **Exit 4** — an internal error in `fusion-paths`. The user's workbench is fine; do **not** send them to check `.active-circle`. Report it as a fusion bug and file an issue.

## Step 3 — Context

- Read `CLAUDE.md` for project context, folder structure, architecture.
- `git log --oneline -20` for recent change context (skip if not a git repo).
- Snapshot open state, using the values `fusion-paths` gave you in Step 2. Every `SCAN_*` may name **two** directories (the active Circle's and the shared one) — count both, or the snapshot silently under-reports:
  - Open issues: for each path in `$SCAN_ISSUES`, count `*_o_*` and `*_p_*` files.
  - Open plan steps: for each path in `$SCAN_PLANS`, skim `*_o_*.md` and `*_p_*.md`.
  - Current git HEAD (if git repo)
- Guard check: read `./fusion-workbench/.guard-state/escalation.json` (if present). If `haltActive: true`, warn the user immediately — all write operations are blocked. Offer to clear or proceed with the halt active.
- High-thrash files: run the `bin/fusion-churn-rank` block from `$FUSION_SRC/agents/orchestrator.md` Setup Step 5 — the `[ -x ]` guard is part of it — and note what it names. Not a direct read of `./fusion-workbench/.guard-state/churn.json`: the map keeps every file it has ever seen, deleted ones and the continuously-rewritten dashboard files included, and the helper is what leaves both out of the ranking.
- Workbench-domain detection: run the heuristic in `$FUSION_SRC/agents/orchestrator.md` Setup Step 5 (the `decisions_count`/`analyses_count`/`code_files`/`data_files` block). Report the detected domain in the Setup-complete summary. The orchestrator passes this domain as the default `domain` parameter to `taskplanner` and `reconciler` dispatches; the user may override at any individual dispatch.
- **Circle-count snapshot and hint:** count Circles under `$SCAN_CIRCLES` by the marker on their record, not on the directory. Enumerate the records and read the marker from the name — one pass, no bracket expression, no glob per state:

  ```bash
  find ./fusion-workbench/circles -mindepth 2 -maxdepth 2 -name '*_circle.md' 2>/dev/null | while IFS= read -r f; do basename "$f" | sed -nE 's/^_([a-z])_.*/\1/p'; done | sort | uniq -c
  ```

  Output is one `<count> <marker>` line per state (`2 a`, `1 t`); no Circles prints nothing. `find` drives the loop so a missing or empty `circles/` yields no input and the count is zero — no unmatched glob to abort under zsh, no unexpanded pattern to miscount.

  **The underscore marker is inert as a glob.** `_a_circle.md` matches literally — no character-class surprise, no escaping — so the enumeration above (and any per-state glob such as `circles/*/_a_circle.md`) resolves correctly, and `find -name '_a_circle.md'` needs no special handling. The enumeration form is still preferred: it reads the marker as data in one pass. See `rules/fusion-workbench-conventions.md` `## Marker globs`.

  If any Circles exist, print a one-line advisory pointing to `/fusion:next` for portfolio review. If none exist, no hint is printed — opt-in behaviour preserved. The orchestrator's Setup Step 5 contains the canonical implementation.

- **The work queue's ground.** `./fusion-workbench/tasklist.md` is built once against the workbench as it stood that minute, and it outlives the Circle it was built for — measured on 260807, where the active Circle was superseded mid-session and eleven entries of the queue went on describing work a commit had already made pointless. Setup is the last step before the orchestrator reads that file as its work queue in Phase 1, so the queue's standing is settled here, in front of the consumer, not only at the boundary where it went stale.

  Run the check from `$FUSION_SRC/agents/orchestrator.md` `### The queue's ground` → `#### Reading a queue`. That section is the canonical implementation and carries the four-row verdict table; do not restate the branches here.

  Confirm the section is there before you run it. This is the one citation in this file with no inline fallback, so a source root whose copy predates the section resolves the path to a file that carries no such heading and the step is skipped in silence — the file is found, the branches are not:

  ```bash
  if [ -z "${FUSION_PLUGIN_ROOT:-}" ]; then FUSION_SRC=""; elif "$FUSION_PLUGIN_ROOT/bin/fusion-plugin-cwd" 2>/dev/null; then FUSION_SRC="$PWD"; else FUSION_SRC="$FUSION_PLUGIN_ROOT"; fi
  SEC="$FUSION_SRC/agents/orchestrator.md"
  grep -q '^#### Reading a queue' "$SEC" 2>/dev/null && echo "queue-check: canonical section found in $SEC" || echo "queue-check: UNAVAILABLE — $SEC carries no '#### Reading a queue' section. The path names the copy actually in use: an install that predates the section (run 'fusion --update' and restart the session), a work tree that does not carry it, or nothing at all when FUSION_PLUGIN_ROOT is unset."
  ```

  Report the verdict in the Setup-complete summary, in one line, and say what it means for the session:

  - **current** or **unaffiliated backlog** — nothing to say beyond the line itself.
  - **stale** — name the Circle the queue was built for and the one that is active (or that none is). Tell the user plainly that Phase 1 should rebuild the queue before it is worked, and that the file's entries were chosen for ground that has moved.
  - **no ground recorded** — the queue carries no `**Active Circle:**` line at all, so it was written before the producer mandated one and which Circle it was built for is not recoverable. Say that plainly and say that Phase 1 should rebuild it; do not infer its ground from its contents.
  - **`queue-check: UNAVAILABLE`** — say that in the summary in place of a verdict, and say plainly that the queue's standing was not established and why. Do not improvise the branches: the verdict table is exactly what is missing, and a guessed verdict is worse than a stated gap.

## Step 4 — History file

Timestamp: `date +%y%m%d-%H%M`.

Create `$OUT_HISTORY/YYMMDD-HHMM-orchestrator-session.md` (the value `fusion-paths` gave you in Step 2 — the active Circle's `history/` when one is active, `shared/history/` when none is) and write the initial entry: session Directive and snapshot counts from Step 3.

## Step 5 — Event log and live dashboard

- **Create if missing, never overwrite.** `./fusion-workbench/orchestrator-events.jsonl` is append-only across all sessions. Use a touch-or-append pattern, never a truncating `>` redirect:
  ```bash
  [ -f ./fusion-workbench/orchestrator-events.jsonl ] || touch ./fusion-workbench/orchestrator-events.jsonl
  ```
- Append a `session_start` event (one line, appended — never overwrite the file):
  ```bash
  TS="$(date -u +%Y-%m-%dT%H:%M:%S)"
  echo "{\"ts\":\"${TS}\",\"event\":\"session_start\"}" >> ./fusion-workbench/orchestrator-events.jsonl
  ```
- Overwrite `./fusion-workbench/orchestrator-live.md` with the real session Directive and snapshot counts (replace the placeholder `Initializing` line). The dashboard is now live for the monitor.

## Done

Only after every step above completes may you begin the user's actual task. Report Setup complete with: workspace path, history file path, snapshot counts, **detected workbench domain**, **the work queue's verdict from Step 3** (one line — a stale queue is the one thing in this summary the user has to act on before Phase 1 runs), and whether an interrupted session was resumed. (Setup no longer migrates — a pre-v4 workbench is caught by the layout check in Step 0, which refuses and routes the user to `/fusion:migrate` before any of this runs.)
