# Compliance Guard — Claude Code Hook System

The Compliance Guard is fusion's hook layer around Claude Code's tool calls. **It decides nothing.** It sees every write-tool call, every `Bash` call and every sub-agent dispatch, allows all of them, and exists for three products: a trace of what the write surface did, a diagnostic when a project's configuration file is broken or names something fusion has retired, and — since v10.8.0 — the machine-written rows of the orchestrator's event log (`task_start`/`task_done` per dispatch, the session-marker heartbeat; `bin/fusion-commit-lock with` writes the `commit` row on the same footing). The name is historical and kept, because the event vocabulary, the state directory and the monitor's panel all carry it.

## Concept

When Claude Code executes a Write, Edit, MultiEdit, or NotebookEdit tool call, the hook runs *before* the write happens — and lets it through. Two things come out of that call:

1. **The write trace** — one `guard_allow` row per write-tool call in `fusion-workbench/.guard-state/events.jsonl`, naming the tool and the file. That log is what the monitor's panel renders, and it is the only record of what the write surface did.
2. **The configuration diagnostic** — one `guard_advisory` per problem the configuration loader hands back, on every guarded call, `Bash` included, for as long as the project's file is unreadable or names a retired file or key.

`Bash` calls reach the hook for the diagnostic alone. Nothing about a shell command is inspected, and an innocuous `Bash` call in a correctly configured project writes no guard state at all — no event row, nothing under `.guard-state/`.

A sub-agent dispatch (`Task`/`Agent`) reaches both hooks for one purpose: the machine-written `task_start`/`task_done` pair in `fusion-workbench/orchestrator-events.jsonl`, written only while an orchestrator session is in flight (`agentstate.yaml` exists) and carrying `person`/`checkout`/`session_id` resolved by the hook itself. A dispatch is not a "guarded call": it sees no configuration diagnostic and writes nothing under `.guard-state/`. `hooks/lib/orchestrator-events.ts` carries the schema, the gate and the measured compliance gap that moved these rows off the prompt.

**Nothing here blocks a tool call, and nothing can.** Everything that once did is gone, each on its own measurement, and each is written up below rather than deleted, because a reader arriving from an older tree or from an `events.jsonl` full of `guard_block` rows needs somewhere to land: the [protected-path half](#the-protected-path-half-and-why-it-was-removed) (2026-08-12), the [decision-governed deny and the halt](#the-decision-governed-deny-the-escalation-counter-and-the-halt-were-removed-on-2026-08-16) (2026-08-16), and two policies before those that read the *text* of a shell command — one predicting which files it would write, one predicting whether it would move HEAD — gone with the shell lexer they shared.

### The decision-governed deny, the escalation counter and the halt were removed on 2026-08-16

A write into a path matched by `guard.categoryPaths` at `high` sensitivity was denied, and the deny counted toward a threshold (default 3) past which the guard entered **halt mode** and blocked every write until a human ran a clearing script.

Two facts ended it, and they compose. Once the protected-path half went on 2026-08-12, this deny was the only thing left that could raise a halt — and it shipped switched off: fusion's own layer declared `categoryPaths: {}` and `decisions: []`, so a governed path existed only where a project wrote one. Neither reachable consuming project had written one, and all 50 recorded `guard_block` rows in the larger one's 37 186 events read "Protected path". The halt was reachable only through a check nobody had armed.

The whole apparatus went together: the deny, the consecutive-block counter, the halt, `lib/escalation.ts`, the `clear-halt.ts` script that was the only thing that cleared a halt, and the six settings behind them — the four that armed the deny (`guard.categoryPaths`, `guard.categorySensitivity`, `guard.defaultSensitivity` and the `decisions` list) plus `escalation.blocksBeforeHalt` and the `guard.enabled` switch that stood the whole thing down. A halt flag left in a consuming project's `escalation.json` blocks nothing at this version, and there is no script to clear it with — `/fusion:setup` offers to delete the file instead.

### Churn detection was removed on 2026-08-15

A PostToolUse tracker used to record every file mutation in a heatmap under
`.guard-state/churn.json` and emit `churn_warning` / `churn_critical` events at configured
per-session thresholds. It never blocked anything: it was a signal the monitor's warnings
panel rendered and the orchestrator read at Setup through a `bin/` ranking helper. The
whole of it is gone — the module, that helper, the two event types, the two configuration
leaves, and the plugin-repo stand-down that existed only to keep a fusion developer's own
edits out of the count.

The PostToolUse hook is observation-only in full, and measures rather than counts: review
coverage and staging drift, two measurements on narrow triggers. A third, session-state
drift, went on 2026-08-15 with the hand-maintained counters that were its subject. It
carried one thing that was never observation-only — the protected-path measurement, which
put a changed protected path back and raised the halt from a hook that cannot block. That
went on 2026-08-12, and the halt's one remaining source went on 2026-08-16, so no hook
raises anything now.

## Architecture

```
Claude Code
  |
  +-- SessionStart
  |     +-- exports FUSION_PLUGIN_ROOT to $CLAUDE_ENV_FILE
  |     +-- emits the "Fusion loaded" systemMessage banner (static printf)
  |     +-- session-start.ts
  |     |     |   Warns when the workbench root sits ABOVE the working
  |     |     |   directory instead of at it. Silent otherwise.
  |     |     \-- lib/workbench-root.ts   (the same upward walk every hook uses)
  |     +-- session-id.ts
  |     |     Prints "fusion: session_id=<uuid>" on plain stdout, the
  |     |     channel that reaches the model -- where the banner above
  |     |     uses systemMessage, which reaches only the user. Silent
  |     |     when the payload carries no session_id. Also exports
  |     |     FUSION_SESSION_ID to $CLAUDE_ENV_FILE (v10.8.0).
  |     \-- exports FUSION_PERSON / FUSION_CHECKOUT to $CLAUDE_ENV_FILE
  |           |   (one bin/fusion-identity run per session, v10.8.0)
  |           \-- identity-notice.js
  |                 Puts that run's mint announcement in front of the
  |                 user as a systemMessage. Silent unless this run
  |                 minted .checkout-id.
  |
  +-- PreToolUse (Write/Edit/MultiEdit/NotebookEdit/Bash/Task/Agent)
  |     \-- guard.ts
  |           |   Decides NOTHING. Every call is allowed. Bash is
  |           |   inspected for nothing and, in a correctly configured
  |           |   project, writes no guard state at all. A sub-agent
  |           |   dispatch (Task/Agent) writes the machine-written
  |           |   task_start row and nothing else.
  |           +-- <project-root>/fusion.json (the Turn budget; read for
  |           |     the diagnostic, not for a verdict)
  |           +-- fusion-workbench/.guard-state/events.jsonl (the write
  |           |     trace and the configuration advisories)
  |           \-- fusion-workbench/orchestrator-events.jsonl (task_start,
  |                 via lib/orchestrator-events.ts, orchestrator sessions only)
  |
  +-- PostToolUse (Write/Edit/MultiEdit/NotebookEdit/Bash/Task/Agent)
        \-- tracker.ts
              |   Measures. Observation only: it cannot block, and it no
              |   longer raises or counts anything either. A dispatch
              |   additionally writes the task_done row, and every call
              |   refreshes the session-marker heartbeat (rate-limited).
              +-- fusion-workbench/.guard-state/{review-coverage,
              |     staging-drift}.json (one throttle record per measurement)
              +-- fusion-workbench/.guard-state/events.jsonl (audit log)
              \-- fusion-workbench/orchestrator-events.jsonl (task_done;
                    a backgrounded dispatch parks .guard-state/dispatch-map.json
                    instead, resolved at the real stop by:)

  +-- SubagentStop
        \-- subagent-stop.ts
              \-- fusion-workbench/orchestrator-events.jsonl (the backgrounded
                    dispatch's task_done, paired via the parked mapping)
```

## Getting Started

### 1. Verify hooks are wired

The plugin wires hooks automatically via `hooks.json`. The hooks use pre-compiled JavaScript (`hooks/dist/`) invoked with plain `node` — no `npx tsx` needed, no `node_modules` at runtime.

The effective hook configuration:

```json
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          { "type": "command", "command": "[ -n \"${CLAUDE_PLUGIN_ROOT}\" ] && echo \"export FUSION_PLUGIN_ROOT=${CLAUDE_PLUGIN_ROOT}\" >> \"$CLAUDE_ENV_FILE\" || true" },
          { "type": "command", "command": "printf '%s\\n' '{\"hookSpecificOutput\":{\"hookEventName\":\"SessionStart\",\"systemMessage\":\"Fusion loaded. Orchestrator sessions: run /fusion:setup before any other work.\"}}'" },
          { "type": "command", "command": "node ${CLAUDE_PLUGIN_ROOT}/hooks/dist/session-start.js" },
          { "type": "command", "command": "node ${CLAUDE_PLUGIN_ROOT}/hooks/dist/session-id.js" },
          { "type": "command", "command": "<the FUSION_PERSON/FUSION_CHECKOUT export — one bin/fusion-identity run, appended to $CLAUDE_ENV_FILE; hooks.json carries the exact command>" }
        ]
      }
    ],
    "PreToolUse": [
      {
        "matcher": "Write|Edit|MultiEdit|NotebookEdit|Bash|Task|Agent",
        "hooks": [
          { "type": "command", "command": "node ${CLAUDE_PLUGIN_ROOT}/hooks/dist/guard.js" }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write|Edit|MultiEdit|NotebookEdit|Bash|Task|Agent",
        "hooks": [
          { "type": "command", "command": "node ${CLAUDE_PLUGIN_ROOT}/hooks/dist/tracker.js" }
        ]
      }
    ]
  }
}
```

### 2. Review the configuration

The settings are `orchestrator.maxTurns`, the Turn budget of the orchestrator's Phase-2 loop, and `citations.extraPaths`, the non-Markdown paths a project declares as carrying record citations; the guard is neither. A project declares them in `fusion.json` at its own root, which `/fusion:setup` seeds — see [Per-project configuration](#per-project-configuration-fusionjson). The guard has no settings at all, because it decides nothing; the six that configured it went with the checks they tuned, along with the plugin-level configuration file that carried their defaults.

Reviewing the configuration is therefore two questions: how many Turns you want, and whether your project root still carries the retired `fusion-guard.json`. The second answers itself — the guard tells you on every guarded tool call until you delete it.

### 3. Start a Claude Code session

The hooks activate automatically on session start. No manual startup needed.

### Start your session at the project root

Start Claude Code in the directory that holds `fusion-workbench/`. Starting one or more
levels below it leaves fusion working, but not everywhere — and the first screen of the
session now says so:

```
fusion: restart this session at the project root.

  project root:      /home/you/acme
  working directory: /home/you/acme/fusion-workbench

This session started below the project root. Some of fusion's checks
resolve against the working directory instead of the root, so from here
they inspect the wrong directory and let through what they would
otherwise stop. The workbench itself is found by walking up, so your
files and settings are still read from the right place.
```

The split behind it is small: `lib/workbench-root.ts` walks up from the working directory
looking for `fusion-workbench/.fusion-setup`, so the root it finds is either the working
directory itself or an ancestor of it. Found at the working directory, or not found at all
(not a fusion project), the hook stays silent. Found above it, you get the message.

**What the warning does and does not do.** It changes no behaviour and blocks nothing. It
exists because something fusion resolves against the working directory rather than the
project root inspects, from a subdirectory, a directory that is not the project's. **One
such resolution is left**, and it is why the warning still fires: the work-tree preference
of `bin/fusion-rules`, `bin/fusion-paths` and `bin/fusion-source-root`, each of which asks
`bin/fusion-plugin-cwd` whether the working directory is fusion's own source repository,
with no upward walk. Started one directory down inside that repository, all three read the
installed plugin copy instead of the work tree being edited — which is a session spent
reading rules and prompts days stale against the sources in front of you, silently.

Two sharper instances stood here and are gone: the protected-path deny, matched against the
working directory until 2026-08-12, and the pair the guard carried until 2026-08-16 — the
project-relative spelling the decision-governed check matched in, and the stand-down that
asked cwd whether it was fusion's own repository. `hooks/session-start.ts` carries the full
account. Teaching the surviving helpers to walk up separately would be three copies of a
walk with three chances to disagree; one message at the moment the working directory is
still cheap to change makes the assumption they share audible instead.

The tracker's two measurements were never among them: each is anchored at the workbench
root rather than at cwd, so each reports the same thing whatever directory the session
started in. The rule that anchoring follows — evaluate a mechanism where it keys its state
— is stated in `lib/self-detect.ts`. It was established on the protected-path measurement
and carried by the churn heatmap, and it outlived both of them and the stand-down it was
last written for.

## Files

| File | Purpose | Committed? |
|------|---------|------------|
| `session-start.ts` | SessionStart hook — warns when the session started below the project root. See [Start your session at the project root](#start-your-session-at-the-project-root) | Yes |
| `session-id.ts` | SessionStart hook — prints `fusion: session_id=<uuid>` on plain stdout, which is the channel that reaches the model; `systemMessage` reaches the user and never it. Both halves were measured against Claude Code 2.1.245 and read from the transcript rather than from the model's testimony about its own context (`260825-2214-can-a-hook-obtain-the-session-identifier.md`). It is a fourth SessionStart command rather than a line inside `session-start.ts` because one process writes one stdout and the two need opposite channels: an envelope that carries the warning routes it away from the model and leaves the model's copy empty. A payload with no usable identifier produces no output at all — anything written here becomes model context, so absence is silence rather than a line saying there is nothing to say. Since v10.8.0 it also appends `export FUSION_SESSION_ID=<uuid>` to `$CLAUDE_ENV_FILE` (after the stdout line, charset-gated, fail-open), so the model's shell commands can put the identifier on the event rows they still write | Yes |
| `identity-notice.ts` | SessionStart hook — carries `bin/fusion-identity`'s mint announcement to the user. It is not a sixth SessionStart command: the identity-export clause pipes its own captured output here, because the process that mints `.checkout-id` is that clause and no later hook can tell a just-minted identifier from an old one. Silent unless this run minted. Fixes the fault where the announcement existed on a channel nothing reads: measured against Claude Code 2.1.261, a SessionStart command's stderr at exit 0 reaches neither the user nor the model (the transcript keeps it in the `hook_success` attachment, the renderer returns null for that type, and the context mapping takes only a non-empty `content`), while a `systemMessage` becomes a `hook_system_message` attachment the user sees (`260905-0933_*_the-mint-announcement-is-unreachable-on-every-path-that-actually-mints.md`) | Yes |
| `subagent-stop.ts` | SubagentStop hook (v10.8.1) — the backgrounded dispatch's real completion. A backgrounded dispatch returns at launch, so PostToolUse's `task_done` would record "accepted" and not "finished"; this hook resolves the `agentId → tool_use_id` mapping the tracker parked at launch and emits the row when the sub-agent actually stops. Its payload was measured before it was trusted (`260827-0740-subagentstop-payload-measurement.md`): it carries `agent_id` and `session_id` and no tool-use id, and a sync dispatch's SubagentStop fires before any mapping entry exists — the ordering, not a heuristic, prevents duplicate rows | Yes |
| `guard.ts` | PreToolUse hook — allows every call and decides nothing. It writes the `guard_allow` trace row for a write-tool call, the `guard_advisory` rows for whatever the configuration loader could not resolve, and (v10.8.0) the machine-written `task_start` row for a sub-agent dispatch, and that is the whole of it. Its own header carries the account of each check that used to live here and the measurement that removed it | Yes |
| `tracker.ts` | PostToolUse hook — runs the staging and review-coverage measurements and hands the model whatever they have to say. Observation only: a PostToolUse hook cannot block, and since 2026-08-12 it raises nothing either. Both measurements fire on a narrow trigger, so since 2026-08-15 an ordinary write at an unremarkable path reaches no measurement here at all — the session-state drift check that held the every-tool-call slot went with the hand-maintained counters it measured. Since v10.8.0 it also writes the machine-written `task_done` row for a sub-agent dispatch and refreshes the session-marker heartbeat (rate-limited on the marker's own mtime); neither is a measurement — they record and say nothing | Yes |
| `turn-budget.ts` | Prints the orchestrator's Phase-2 Turn budget, merged from the project's `fusion.json` (`{"orchestrator": {"maxTurns": <n>}}`) over the built-in defaults — two layers. It is one of the settings fusion resolves; `citations.extraPaths` is the other. For the orchestrator's Setup, through `bin/fusion-turn-budget`. No hook reads the value — it exists so the budget stops being prose: it was written into `agents/orchestrator.md` in seven places and four spellings, one of which already called it a "default" while nothing could override it (issue `260811-1712_*_max-turns-is-hardcoded-in-eight-places-and-cannot-be-set-per-project.md`). A value that is not a whole number of 1 or more is dropped, named on stderr, and inherits | Yes |
| `review-coverage.ts` | Prints the review-coverage tiling for `agents/orchestrator.md` Step 3c and Phase 4. Run through `bin/fusion-review-coverage`. Finding an uncovered range is `verdict=uncovered` on stdout, never a non-zero exit and never a release gate — whether a release may go out over an unreviewed range is an unfiled decision this program does not pre-empt | Yes |
| `events-query.ts` | Prints the two identity-scoped readings of the orchestrator event log, `presence` and `turns`. Run through `bin/fusion-events`, which hands it the identity; `lib/events-query.ts` is the computation, and this file is what opens the log, reads `session.history_file`, and parses the checkout roster the wrapper hands over in `FUSION_EVENTS_ROSTER` into the two maps presence takes. A figure that could not be taken is absent from stdout, named on stderr and reported by the exit code, never rendered as a zero | Yes |
| `citation-check.ts` | Prints the citation check over a consuming project: every `.md` under the workbench, the frozen stores read exactly like the live tree since `32fe0d49`, plus `CLAUDE.md`, `rules/`, `.claude/rules/` and `docs/`, plus every file the project declared in `citations.extraPaths` — judged by `lib/citation-scan.ts`. Run through `bin/fusion-citation-check`; `/fusion:cleanup` Step 8 prints its `verdict=` line. A violation is a row on stdout, never a non-zero exit, and nothing is rewritten. Since 2026-09-01 only a row in a file somebody still edits moves `verdict=` — `isLiveRecord()` from `lib/citation-corpus.ts` inside the workbench, everything outside it in scope — while every row is still printed and carries an `edited` / `not-edited` column, and `edited-files`, `edited-violations` and `unedited-violations` put the scope in the `KEY=value` block. | Yes |
| `citation-sweep.ts` | Rewrites store-prefixed citations to the storeless form, and `--repair` undoes the bare-stamp expansion an earlier version applied. Run through `bin/fusion-citation-sweep`, by a person and never by a pipeline or skill. Its corpus is the workbench's Markdown plus each `<path>` argument plus the project's declared `citations.extraPaths`. `--dry-run` (the default) prints the census; a writing mode stands behind three guards named in its header: (a) a workbench tracked in a git work tree, no uncommitted change naming a file the run will read — the corpus question rather than a clean tree, since the tracked event log makes a clean tree unreachable inside a session — and every extra `<path>` inside that work tree and tracked by it (exit 4); (b) the census first and `--yes` before any write (exit 5); and (c) no bare-stamp resolution at all. Replaced the `.mjs` script under `hooks/scripts/` on 2026-08-29 so the install tarball runs it without `node_modules`. | Yes |
| `lib/paths.ts` | Case folding for a path comparison — one function, `foldCase`, and one caller, `tracker.ts`, which folds both sides of a containment test so a case-insensitive file system does not decide whether the review-coverage measurement fires. It carried the glob-to-regex compiler and the lexical normalisation under it until 2026-08-16; both existed to answer whether a path falls inside a configured SET of paths, and the guard has no such set left | Yes |
| `lib/config.ts` | JSON config loader. The settings are `orchestrator.maxTurns` and `citations.extraPaths`, two layers (the project's `fusion.json`, then `DEFAULTS`), and a diagnostics list that is now its main product: an unreadable file, a wrongly typed value, a retired file at the project root and a retired top-level key inside the one that is read are each named rather than dropped in silence | Yes |
| `lib/events.ts` | Append-only event logger | Yes |
| `lib/orchestrator-events.ts` | The machine-written rows of `fusion-workbench/orchestrator-events.jsonl` (v10.8.0): `task_start`/`task_done` per sub-agent dispatch and the session-marker heartbeat, written only while an orchestrator session is in flight (`agentstate.yaml` exists). Identity is env-first (`FUSION_PERSON`/`FUSION_CHECKOUT` from the SessionStart export), else one run of `bin/fusion-identity` resolved relative to this file — never a second implementation of the criterion; an unresolved half is an absent key. Timestamps follow the log's standing convention (UTC, second resolution, no `Z`). Its header carries the measured compliance gap that moved these rows off the prompt (87 % batch-written timestamps, identity on 2.6 % of lines) and the stated residual of the `agentstate.yaml` gate | Yes |
| `lib/fail-open.ts` | The ordering rule both hooks run on: the verdict goes to stdout first and unguarded, every record of it after, each in its own `try`, so a failed report cannot withdraw the answer it reports. `failOpen` is the error tail of each entry point; `answer` and `bestEffort` carry the same rule to every site inside `main` where an escalation save, an event append or the churn heatmap once stood ahead of the verdict. The heatmap went on 2026-08-15 and the escalation save on 2026-08-16; the rule is what the surviving sites keep, and it is why a report that throws can no longer cost a hook its stdout. The reports append under `.guard-state/`, the likeliest thing to have failed, which is how reporting first turned a deny into `{}` and swallowed the halt sentence  Also home of `exitZeroOnStdoutEpipe()` (v10.9.0): the four reporting CLIs exit 0 silently when their reader closed stdout first — a reader that stopped listening is not the program's fault, and every other stream error still throws | Yes |
| `lib/guard-state-file.ts` | The read-coerce-write seam under `fusion-workbench/.guard-state/`: resolves one state file, reads it, hands whatever it holds to the caller's coercion, and writes it back atomically. The coercion is a parameter, so absence, unparseable text and a valid JSON value of the wrong shape are one answer and no state module has anywhere to put an `as` cast — the defect that let a `{}` state file throw on the next field access and discard the halt message the same tool call had already produced. The two measurement throttle stores use it and are now the only callers: `protected-snapshot.ts`, the one module that never fitted the seam, went with the protected-path half, `churn.ts` with the heatmap, `state-drift.ts` with the session counters, and `escalation.ts` with the halt on 2026-08-16, taking its own merge with it. Nothing had to come out of this module when any of them went, which is what the seam being a parameter buys | Yes |
| `lib/git.ts` | The one `git` the measurements run: `execFileSync` in a named root, stderr discarded, every failure — not a repository, an unresolvable ref, a non-zero exit, the timeout — collapsed to `null`, because no caller distinguishes them and each turns "git would not say" into a report that claims nothing rather than into a fault. It existed verbatim in `review-coverage.ts` and `staging-drift.ts`, and inline in the removed `state-drift.ts`, until decision `260811-1146_*_does-the-measurement-family-get-a-shared-chassis-before-the-fourth-module.md`. The default timeout is a ref read's; `staging-drift.ts` passes a larger one at its `git status` call, which is the only call in the family that walks a working tree | Yes |
| `lib/state-file.ts` | The flat read of `fusion-workbench/agentstate.yaml`: one file read that distinguishes "no session in progress" from "the state file will not open" and phrases neither, plus a first-match field read that is deliberately not a YAML parse, so the programs and `agents/orchestrator.md`'s documented `sed` one-liner cannot disagree about what a field says. Two callers, `lib/review-coverage.ts` for the session anchor and `lib/staging-drift.ts` for the session's own history file. It lived inside `lib/state-drift.ts` and was extracted here on 2026-08-15 when that measurement was deleted with the hand-maintained counters that were its subject — the pair is a file reader, not a measurement, and neither importer was affected by that removal | Yes |
| `lib/staging-drift.ts` | The staging-drift measurement (issue 260811-0114_*_the-queue-rebuild-and-its-history-file-never-entered-a-commit-and-survive-only-in-the-working-tree.md): reads `git status --porcelain` over the workbench and classifies every entry — `record` (an authored artifact no commit carries), `commit-message` (a commit-message-shaped **name** that no artifact store owns, which is where the improvised `.commit-msg-tmp` lands; the store scoping is what the class is, not a detail of it, because without it the name test also claimed every authored record whose topic slug says "commit message" and the model was told to delete it, issue 260811-1141_*_any-workbench-file-whose-name-contains-commit-message-is-classified-as-a-commit-message-and-the-model-is-told-to-delete-it.md), `in-flight` (live state and the machine-written surfaces, never a fault), `unclassified` (a user's own note, named with the statement that nothing is claimed about it). Two callers: `staging-drift.ts` behind `bin/fusion-staging-drift`, and `tracker.ts` on the one trigger of **HEAD having moved** since the previous tool call — read with `git rev-parse`, never inferred from the command's text. The commit is the first moment an unstaged record is a fault; mid-Turn it is the normal state. It reports and never stages, because a mechanism that staged would be a second author of a staging list whose whole value is that a human wrote every path in it. The name test alone is exported as `hasCommitMessageName`, because a second caller asks a different question of the same string — `commit-message-path.test.ts` asks whether a shipped prompt *prescribes* a message file inside the workbench, and a prescription pointing into a store is exactly what the location scoping forgives (issue 260811-1410_*_the-commit-message-path-gate-narrowed-with-the-classifier-it-reuses-and-no-longer-catches-a-prescription-inside-a-store.md). One pattern, two scopings, neither transcribed | Yes |
| `lib/review-coverage.ts` | The review-coverage measurement (issue 260810-1205_*_seven-of-sixteen-commits-in-the-session-range-never-reached-a-review-pass-and-nothing-measures-the-gap.md): tiles the review files' own mandated `**Reviewed-range:**` fields against `git rev-list <session-start>..HEAD` and names, commit by commit, what no reviewer opened — plus the `**Not-opened:**` list the last pass declared, which is the next dispatch's scope. Two callers: `review-coverage.ts` behind `bin/fusion-review-coverage`, and `tracker.ts` on the one trigger of a review file landing. Deliberately NOT on an every-tool-call path — the slot `lib/state-drift.ts` held until it was removed on 2026-08-15, and which nothing occupies now: an uncovered range mid-Turn is the normal state, and a check that fires on its commonest path is one its reader learns to ignore. It reports and never gates | Yes |
| `lib/events-query.ts` | The two identity-scoped readings of `fusion-workbench/orchestrator-events.jsonl`, behind `bin/fusion-events`: `presence`, who else has written to the log inside a window, and `countTurns`, the session's Turn count. The file carries `merge=union` (class R2 in `rules/workbench-tracking.md`), so after a pull it holds two checkouts' lines with no ordering between the blocks, and sorting it moves a reader from vague to wrong rather than repairing it (issue `260823-1302_*_the-monitor-attributes-a-merged-event-log-to-one-session-and-reports-another-checkouts-state.md`). Membership is therefore read off each line's own `checkout` field, and an **absent** identifier reads as the reading checkout's own — which is what carries the whole pre-C4 log and what makes an unresolved reader behave exactly as it did before. The asymmetry between the two is the design: presence keeps the lines this checkout did not write and drops ours, `countTurns` does the reverse. It opens no file, runs no subprocess and asks nothing about git: the log text, the reading identity, the current time and (since v10.21) the checkout registry's identity map are arguments, so every case in its classification table is a fixture string. That map is what makes two git identities one person has registered count as one person: `measurePresence` classifies on `canon(g) = identityMap[g] ?? g`, and an empty map is the identity function, so a project with no registry runs the same code and gets the figures it got before the registry existed. `parseTs` appends the `Z` designator the emit convention omits, which is the standing trap in `CLAUDE.md`'s symptom table. `turns=0` and `other_people=0` are real figures; a figure that could not be taken is reported through an exit code by the entry point and never as a smaller number | Yes |
| `lib/workbench-root.ts` | Walks up from cwd to find `fusion-workbench/.fusion-setup` (single source of truth for workbench presence in TS) | Yes |
| `lib/self-detect.ts` | Detects the fusion plugin's own repo. **Nothing under `hooks/` calls it**, and that is the decided state: both stand-downs it served are gone — the churn heatmap's on 2026-08-15, the guard's write-tool branch on 2026-08-16 with the verdict it was standing down. The cwd-anchored entry point went with the second; `isFusionPluginRoot(dir)` is kept for the rule the module carries, that a mechanism is stood down in the coordinate space it keys its state by, which is expensive to re-derive and invisible when got wrong. The shell side, `bin/fusion-plugin-cwd`, is a live helper with three consumers and is no longer paired with this file | Yes |
| `lib/domain-cascade.ts` | Parses the domain cascade out of `agents/orchestrator.md` Setup Step 5 and **executes** it. No hook calls it — the gates do, so what they measure is the verdict a real project reaches rather than the layout of the prompt's branch lines. There is deliberately no second copy of the cascade in TypeScript: the interpreter runs the prompt's own block. That keeps *this file* from drifting and nothing else, which is where the claim used to overreach — a second copy shipped in `skills/cleanup/SKILL.md` in the pre-fix order while both gates read the orchestrator prompt alone (issue 260810-1918_*_the-cleanup-skill-carries-a-second-domain-cascade-in-the-pre-fix-order-and-no-gate-reads-it.md). The module now also *finds* a statement of the cascade, fenced or prose, and `domain-cascade.test.ts` runs that over the file set, allowing exactly one. How far that reaches is not described here and not described in the module either — it is the `REACH` object at the foot of the module, and [the section below](#how-far-the-domain-cascade-reach-gate-reaches) is rendered from it | Yes |
| `lib/citation-corpus.ts` | Which workbench records are LIVE — the files somebody still edits. One predicate, `isLiveRecord()`, read by two consumers with different stakes: `lib/__tests__/workbench-citation-lint.test.ts` uses it as its CORPUS, where an admitted file carrying a dangling citation reddens the suite, and `citation-check.ts` uses it as its VERDICT SCOPE, where a row is printed either way and only `verdict=` narrows. It lived inside that test file until 2026-09-01 and moved here whole, with its reasoning, when decision `260830-2225_*_should-an-archived-violation-move-the-checkers-verdict-line.md` scoped the reporter's verdict; nothing about what the gate asserts or reads changed with the move. Its header carries the wide reading of a live decision, the two markers a live plan carries, the frozen stores and their root anchoring, the hole at terminal state, and the one judgement the reporter needed and the gate never did — that the marker-less kinds (history, analyses, reviews, consult, memos, investigations) are not edited, because a history entry records what was true then. No hook calls it | Yes |
| `lib/citation-scan.ts` | The workbench-record citation grammar and its resolver, moved out of the test tree on 2026-08-29 so it compiles into `hooks/dist/` (decision `260828-0904_*_does-fusion-ship-a-citation-checker-to-consuming-projects.md`). `createScanner(workbenchRoot)` binds the grammar to one workbench; the test helper at `hooks/lib/__tests__/helpers/citation-scan.ts` is now a shim that binds fusion's own roots and adds no grammar. No hook calls it — the citation gates do | Yes |
| `package.json` | Dev dependencies (tsx, typescript, vitest) | Yes |

### How far the domain-cascade reach gate reaches

One decision — which domain a workbench is — is stated in one place, `agents/orchestrator.md` Setup Step 5. A gate in `domain-cascade.test.ts` reads the plugin's own prompts, skill bodies and rule files and fails if a second one states it too.

**The paragraph below is generated.** It is rendered from the `REACH` object in `hooks/lib/domain-cascade.ts` by `describeReach()`, and the test suite compares this file against that output byte-for-byte. Editing it by hand fails the suite. That is the point: the claim about this gate has twice been broader than the gate itself — once asserting a second definition was impossible while one was shipping, once naming three holes when there were four — and a sentence generated from the thing that measures cannot say more than the measurement does. Each line below carries probes the suite runs, so a hole that gets closed and a claim that gets stale both turn the suite red.

Regenerate after changing `REACH`:

```bash
cd hooks && npm run build && cd .. \
  && node -e "import('./hooks/dist/lib/domain-cascade.js').then(m => console.log(m.describeReach()))"
```

<!-- BEGIN generated: domain-cascade reach -->

**Scanned:** `agents/*.md`, `skills/*/SKILL.md`, `rules/*.md` — every agent prompt, every skill body, every rule file. Exactly one of them may state the cascade.

**Caught.** Each line is asserted against probes in `domain-cascade.test.ts`:

- A domain name in backticks, double quotes, single quotes or asterisk bold. Four spellings, because nothing in this project requires one of them and `agents/taskplanner.md:128` writes the names bare.
- A paraphrase naming the counts in prose — code files, source files, data files, and the decisions, issues, analyses and commits the retired branches read — rather than by variable name.
- A paraphrase written with the cascade's own variable names.
- A stale copy restating the retired four-outcome cascade. Its two surviving outcomes still fire, and the four counts only the retired branches ever read are still recognised as inputs, so the likeliest second copy from here on is caught rather than walked past.
- A stale copy written only in the two retired outcomes, `strategic` and `knowledge`. The retired names are recognised as domain names for the same reason the retired counts are recognised as inputs: a paragraph written before 2026-08-15 and never re-read is the copy most likely to be met from here on.
- One sentence hard-wrapped across two lines. A line and its continuation are scanned joined, which is the shape this repository's own 78-column prose produces by default.

**Not caught.** Each line is asserted to still be a miss, so closing one of these turns the suite red until this list is corrected:

- A domain name written as a plain word, with no markup around it. This is the plainest second copy anyone would write and it is NOT caught. Matching bare words was measured over the scanned set and rejected on cost, because both surviving domain names are ordinary English words in these files and `code files` is both a domain name and an input phrase. Measured cost of matching bare words, across the scanned set and outside the definition site: 12 lines of honest prose selected on single lines, 12 with the continuation window. The suite re-measures both numbers.
- A paraphrase spread across the rows of a table, or across three or more wrapped lines. A table row and a list item each open a block and are never joined to the line above them, and the window is two lines wide.
- A paraphrase naming no input. It names no evidence, so it restates less than the cascade decides.
- A paraphrase naming its inputs in words the prose list does not carry. The list is a fixed set of spellings, not a synonym set.

**Not scanned**, with what running the gate over it yields today:

- `docs/*.md` — clean. Left out on a measured cost that has since expired. `docs/philosophy.md:19` said what each of four domains PRIORITISED, in a line shape-identical to a paraphrase, and scanning `docs/` meant either that false positive or an exemption list. With two domains the line names no count and the directory now measures clean, so the reason for the exclusion is gone and only the exclusion is left. That is an uncovered directory, not a justified one.
- `CLAUDE.md` — fires. A consumer by the same contract that puts `rules/` in the file set, and it is not scanned. It measured clean until the retired domain names joined the detector on 2026-08-24; its agent-roster line, which names the two retired values beside the two live ones and the words the input list carries, now selects. That is the one measured cost of the widening, and it falls outside the scanned set.
- `README-hooks.md` — clean. Documentation about the gate, including this block. Not scanned, and it would be wrong to scan the file whose job is to quote the claim.

<!-- END generated: domain-cascade reach -->

## Usage

### Tuning the guard: there is nothing left to tune

**Nothing blocks, so nothing has to be turned down.** This section used to be a table of
four rows — off entirely, advisory-only, looser, and how to clear a stuck halt — assembled
from `guard.enabled`, the per-category sensitivities and `escalation.blocksBeforeHalt`. All
six guard settings are gone with the checks they tuned, and a project that still declares
them in a leftover `fusion-guard.json` is declaring into a file fusion does not read.

What the hook still produces, and how to turn it down: nothing turns it down. The write
trace is one `guard_allow` row per write-tool call, and the configuration advisories stop
when the configuration is fixed, which is the whole point of them repeating.

**Why there is no `enabled: false` any more.** The switch existed so a project could stand
down a mechanism that was deciding against it. Nothing decides, so the only thing a switch
could turn off is the event log the monitor renders — and a project that wants that has
`.guard-state/` in its own tree to delete.

**How a path is used.** It is not matched against anything. `extractFilePath` in `guard.ts`
reads `file_path` (or `notebook_path`) out of the tool input, writes it into the trace row
verbatim, and nothing else reads it. An absolute path stays absolute: normalising it to the
working directory served the pattern matching that is gone, and a trace is more useful with
the path the tool was actually handed.

**The matching that used to happen, kept because an open question outlived it.** Paths were
matched on their *text*, no symlink resolved, against the globs in `guard.categoryPaths`, in
the coordinate space of the process's working directory. The match was **case-sensitive**.
The protected list before it folded case unconditionally on every platform, because a glob
compiles to a case-sensitive regex and on a case-insensitive filesystem — APFS in its
default configuration, so every stock macOS install — the whole list was bypassable by
shifting one letter. Whether `findRelevantDecisions` should have folded too was an open
question (`260804-1632_*_should-findrelevantdecisions-fold-case-…`),
and it is moot rather than answered: both sides of it are deleted.

### What a halt was, and what a project still carrying one should do

A halt blocked every `Write`, `Edit`, `MultiEdit` and `NotebookEdit` call until a human ran
a clearing script, and it printed this:

```
[HALTED] All write operations blocked. The guard has been halted after
repeated violations. The halt is recorded per project and the clearing script
finds it by walking up from its working directory, so the `cd` is part of the
command: cd <project-root> && node <plugin-root>/hooks/dist/clear-halt.js
```

**None of that exists at this version.** The halt, the counter that raised it and the script
named in the message were removed on 2026-08-16. A `haltActive: true` left in a project's
`fusion-workbench/.guard-state/escalation.json` is an inert flag that nothing reads: it
blocks nothing, and there is no command to clear it with. `/fusion:setup` notices the file
and offers to delete it, which removes a flag rather than unblocking anything.

It never reached the shell in its last year either. The halt once blocked every `Bash`
command a mutation classifier recognised as a write, which is the undecidable question in
miniature — "does this command write a file at all?" — and it went with the classifier.

In an existing event log the halt rows are distinguishable by their detail: `Halt active —
write tool call blocked`, `Halt raised by this block — <cause>`, `Halt raised by the
protected-path measurement (<n> path(s) changed)` and `Halt active — mutating Bash command
blocked`. **Nothing writes any of them.** The `guard_block`, `guard_halt` and `halt_cleared`
event types left the vocabulary on 2026-08-16 with the mechanisms behind them; `bin/monitor`
still styles the rows, deliberately, because a log written before the removal is still read
after it.

### Per-project configuration: `fusion.json`

A consuming project may ship `fusion.json` at its project root — `/fusion:setup` seeds it from `templates/fusion.json`, declaring nothing but its documentation notes — and the hooks read it on every guarded tool call. **What it configures is `orchestrator.maxTurns` and `citations.extraPaths`:** the Turn budget of the orchestrator's Phase-2 loop, which `bin/fusion-turn-budget` resolves once at Setup, and the project's own list of citation-bearing non-Markdown paths, which the two citation helpers resolve when they are run. No hook reads either. Everything else the file used to carry configured the guard, which decides nothing.

**Two layers, merged per leaf key.** The project's file, then fusion's built-in `DEFAULTS`. There were three until 2026-08-16; the middle one was the plugin's own configuration file, which existed so guard settings had a plugin-level default a project could narrow, and it went with them. A layer carrying nothing is a claim rather than a capability.

A key the project declares is taken exactly as written; a key it omits — even inside an object it did declare — falls straight through to the default. `{"orchestrator":{"maxTurns":12}}` sets the budget and touches nothing else. A value with the wrong type is dropped, named in a `guard_advisory`, and then inherits exactly as an omitted key does; a file that is not valid JSON is dropped and reported the same way, never ignored in silence. A **missing** file is silent, and must be: it is the ordinary state of a project that has configured nothing.

The leaf walk was kept as the shape through the release in which the Turn budget was the only leaf it had to walk, rather than collapsed into a single fallback, so the next setting to land here would inherit the rule instead of re-deriving it. `citations.extraPaths` is that setting, and it did.

#### `citations.extraPaths` — the citation-bearing paths a project declares

`{"citations":{"extraPaths":["src/**/*.go","internal/*.py"]}}` names the **non-Markdown** files that `bin/fusion-citation-check` and `bin/fusion-citation-sweep` read in addition to the Markdown corpus they already read. Each entry is a git pathspec evaluated under `:(glob)` — `*` does not cross a `/`, `**` does — resolved against the files git tracks, so an untracked or ignored file is never named by one. A pattern that is absolute or carries a `..` segment is refused from the string alone, before git is asked; a pattern matching nothing is named as matching nothing. Both go to stderr, and the checker prints `declared-patterns=` and `declared-files=` on stdout, the second reading `unavailable` rather than `0` where git will not answer at all.

It is a **declaration** because the question underneath it cannot be decided from a file's text. Outside Markdown there is no code fence and no block quote, and those two are the whole of fusion's pointer-versus-exhibit distinction: a record name inside a docstring and one inside a comment that points at a real record are the same input to any reader of the bytes. So a project writes down which of its files cite records, and fusion detects nothing. Declare nothing and you get `[]`, which is exactly the corpus the two helpers read before the leaf existed — no extra files, no advisory, no moved figure.

The value must be an array of strings with none of them empty; anything else is dropped **whole**, named in a `guard_advisory`, and inherits as an omission does, so one bad entry never leaves half a declaration in force. The loader answers only "is this the right type"; whether a pattern names any file is answered once, at the resolution site. Both hand-run helpers read the leaf and the blocking gate `hooks/lib/__tests__/workbench-citation-lint.test.ts` deliberately does not — it has no approvable baseline and runs in everyone's `npm test`, so a corpus set by an editable configuration leaf would redden the suite of somebody who edited nothing.

fusion declares `bin/*`, `hooks/*.ts` and `hooks/lib/*.ts` for itself, and deliberately not `hooks/lib/__tests__/*.ts`: those files are fixtures whose record names are exhibits, which is exactly the judgement a declaration exists to record.

The file is **git-tracked on purpose**. It decides how many Turns the orchestrator may run against the project, so every change to it has to appear in a diff and pass the same review as the rest of the project. Until 2026-08-12 the diff was the *second* line of defence: the guard added this file to the protected list as soon as it existed and wrote back any change an agent made to it. That defence went with the protected-path half, so an agent can edit it like any other file and the git history is the only place a change to it shows.

**Retirement is announced, not dropped in silence**, and at two scopes. A setting a project once wrote and can no longer write is neither a validation failure nor an unknown key: it still looks like a setting to whoever wrote it, and going through in the silence every unrecognised key gets is the one thing that must not happen to it. So it is named in a `guard_advisory` on every guarded tool call — Bash included — until it comes out of the project's tree.

- **A retired file.** `fusion-guard.json` at the project root, replaced by `fusion.json` on 2026-08-16. Not one byte of it is read. **Copy your Turn budget across before deleting it**: a budget left behind is not applied and the orchestrator falls back to fusion's own without saying so, which is the one loss of this migration a project would not notice. This diagnostic is the whole of the v10 migration, deliberately: nothing in fusion moves the budget for a project, and this is the channel that does not depend on Setup, because it runs on every guarded call where a Setup step runs once per session and only for a project that runs Setup at all. It is not the only place a session hears it — the orchestrator repeats every diagnostic the loader returns in its Setup-complete summary, at its own Setup Step 2, so a project that does run Setup hears it there as well.
- **A retired top-level key** inside the file that *is* read: `guard`, `decisions` and `escalation`, which is what a project sees if it copies its old file across rather than starting from the template.

The leaf-scoped table that named `guard.protectedPaths` on its own has no members left and is gone: that key now sits inside a retired container, so the container's diagnostic names it. It comes back the day a leaf inside a *live* container is retired.

Two things the validator deliberately does **not** do. It does not reject unknown keys — the seeded template is mostly underscore-prefixed documentation notes, and rejecting them would make the shipped template a broken file. And it does not diagnose `null`, which has always meant "nothing configured" here.

### The protected-path half, and why it was removed

This section described a live mechanism until 2026-08-12. It is kept, shorter, because the mechanism's absence is what a reader of an older tree, an older copy of this file, or an existing `events.jsonl` will come here looking for.

**What it was, in two generations.** Until 2026-08-07 it was a classifier: `lib/bash-mutation-guard.ts` read a shell command's text and decided which files that command was about to write, so a write aimed at `guard.protectedPaths` could be denied before it ran. That question is undecidable — a path can be assembled at run time, arrive on stdin, or pass through `eval`, an alias, a shell function or a variable no classifier sees. 12 923 lines were built against it, carrying 21 documented residuals, and four days in a real consuming project produced 17 blocks and 0 real hits (`260807-0825_*_should-the-guard-predict-shell-writes-or-enforce-them.md`, option 3). What replaced it asked a decidable question instead — *has a protected path changed?* — by fingerprinting every path on the list in `guard.ts` before the tool call, fingerprinting them again in `tracker.ts` after it, writing back whatever moved and raising the halt outright. The route to the file no longer mattered, which is what the prediction had never managed.

**Why the whole half went anyway.** Measuring the result was the right answer to the wrong question. Across roughly 450 records in this project and its largest consumer there was no instance of the failure the protection existed to prevent, and the mechanism stood down in fusion's own tree — the only tree whose patterns name what they say they name — from the first public release. What it did cost was measurable: 53 records in one consuming project that exist only because agents may not write files that project owns, across 143 days, against zero halts. Six modules, a shell reporter, eleven test files and one always-on agent rule went with it.

**What went with it, by name.** Four modules under `hooks/lib` — `lib/protected-snapshot.ts`, `lib/rules-write-exemption.ts`, `lib/fs-locator.ts`, `lib/reverted-copy.ts` — plus the standalone effective-list reporter and its `bin/` wrapper; CHECK 2 in `guard.ts` and job 1 in `tracker.ts`; the `guard.protectedPaths` configuration leaf, the self-protection floor over `fusion-guard.json`, and the `FUSION_ALLOW_RULES_WRITE` session flag that existed only to soften the deny. Nothing replaced any of it: a protected path is not listed, not watched, not restored and not reported, by any hook.

**What survives it.** One thing, and it is not a mechanism. The rule the two stand-downs established — evaluate a stand-down in the coordinate space the mechanism keys its state by — outlived the measurement it was measured on, the churn heatmap that carried it next, and the write-tool stand-down it was last written for. It is kept in `lib/self-detect.ts` against the next mechanism that needs one.

The migration this section used to describe is over. A halt raised by the old mechanism blocked at CHECK 1 and cleared through `clear-halt.js` until 2026-08-16; both are gone, and a leftover flag is now an inert value `/fusion:setup` offers to delete. A project whose root still carries `fusion-guard.json` at all — `guard.protectedPaths` inside it or not — gets the retired-*file* advisory described under [Per-project configuration](#per-project-configuration-fusionjson), which is a louder statement than the retired-key advisory it replaces.

### Viewing the event log

```bash
cat fusion-workbench/.guard-state/events.jsonl | jq .
```

Or tail it in a second terminal during a session:

```bash
tail -f fusion-workbench/.guard-state/events.jsonl | jq .
```

### Running tests

```bash
cd hooks && npm install && npm test
```

`npm test` compiles first and then runs vitest, as it always did. What changed is where the compile goes: into a private staging directory of its own, named to the run in `FUSION_TEST_DIST`, from which the shipped `hooks/dist/` is refreshed file by file. `npx vitest run` on its own still works and skips the compile.

**The suite is safe to run concurrently with itself in one checkout**, which is not a courtesy — the orchestrator dispatches executors in parallel batches and each of them runs this command to decide whether its own change lands. Three things make that true, and each is documented at its own source:

- `hooks/scripts/build.mjs` — the build never deletes `hooks/dist/`. It replaces each file with `rename(2)`, so a path under `dist/` is never momentarily absent and never half-written, and it prunes an output only once its source is gone. It used to be `rm -rf dist && tsc`, which left the whole tree missing for one to two seconds per run and failed three suites in three different shapes.
- `hooks/lib/__tests__/helpers/guard-harness.ts` `TEST_DIST` — the cases that spawn or copy a compiled artifact read the run's private build, not the shared one.
- `hooks/vitest.config.mjs` — one run uses half the machine's cores rather than all of them. Measured: at one worker per core, three concurrent runs failed 5 of 9 times on fork/exec starvation; at half, 9 of 9 were green, and a single run costs nothing measurable.

### Three gates that can fail the suite over text nobody compiled

`npm test` blocks on three cases that are not about the code under them. Each is documented in full at its own source; the table exists so a reader meets them before a red run rather than during one.

| Gate | Goes red when | What the failure names |
|---|---|---|
| `hooks/lib/__tests__/committed-dist.test.ts` | the committed `hooks/dist/` is not the compilation of the committed source, or the installed TypeScript is not the exact version `hooks/package.json` pins | which of the two it is. A wrong compiler is reported as a toolchain mismatch and explicitly not as an artifact defect, so the remedy is the install and not a rebuild; a stale artifact names the differing files and the `npm run build` that repairs them. |
| `hooks/lib/__tests__/workbench-citation-lint.test.ts` | a live workbench record carries a citation that resolves to nothing. The corpus is the Circle records, `portfolio.md`, the open issues, the live decisions and the live plans — a live plan being one carrying `_o_` or `_p_`, the two states in which an executor is dispatched against the document, and `portfolio.md` counting where the checkout has one, being class L of `rules/workbench-tracking.md` and so regenerated per checkout rather than carried by git. | the record, the line, the token, and the two remedies its message carries: correct the path, or restate the token as a statement rather than a pointer. |
| `hooks/lib/__tests__/plan-stopping-section-lint.test.ts` | a live plan carries no `## Where this Circle stops`, an empty one, or nothing but the shipped angle-bracket placeholder | the plan, which of the three failures it is, and what to write in the section. It judges presence only, never whether a stopping condition is the right one. |

**The middle one is the one that surprises**, and the surprise was accepted rather than mitigated. Its corpus is recomputed from the tree on every run and it carries no approvable baseline, so there is nothing an author can edit to make it green except the citation itself. The cost is that an archive sweep, or a newly filed record carrying a bad citation, turns the suite red for somebody who touched no citation and no code. That is the gate working. The governing record is `260819-1645_*_what-defines-the-citation-gates-corpus-and-what-happens-when-a-marker-move-changes-it.md`.

The four growth bounds in the next section are blocking in the same way, and are documented there.

### Growth bounds on the shipped text

Four surfaces of this plugin have a **failing** bound on how much they may grow, and the suite goes red when one of them spends its head-room. This is a bound on the *rate of addition*, not on size: a shrink never trips it, and each surface's head-room was derived from that surface's own replayed `git` history rather than picked.

| Surface | Unit | Head-room | Bounded in |
|---|---|---|---|
| the always-on rule set every agent loads | bytes | 12 000 | `hooks/lib/__tests__/rules-emission-golden.test.ts` |
| `agents/*.md` | bytes | 18 000 | `hooks/lib/__tests__/surface-growth-bound.test.ts` |
| `skills/*/SKILL.md` | bytes | 20 000 | `hooks/lib/__tests__/surface-growth-bound.test.ts` |
| the hook test suite | lines | 2 500 | `hooks/lib/__tests__/surface-growth-bound.test.ts` |

**The four budgets are independent.** One instrument computes all of them — `hooks/lib/__tests__/helpers/growth-bound.ts`, which takes the baseline map and the head-room as arguments so no surface can see another's numbers — but there is no shared pool. Growth in `agents/` cannot be paid for by shrinkage in `skills/`, and a single surface crossing its own bound fails the suite alone. Role-specific rule text is the one thing that still only **reports**: it is bought by the agents that need it, while every byte of the always-on set is charged to every dispatch.

When a bound fires, the failure names the files that grew and by how much. **Cut where the growth is.** Regenerating a golden records the movement and never clears a bound — the golden says what the files measure, the baseline says what they are allowed to measure *from*. A baseline moves at exactly two moments, both of which are written down: after a cleanup, or at a one-time arming. That rule is authored once, in `hooks/lib/__tests__/helpers/growth-bound.ts`.

Each bound keeps a golden fixture so that every movement lands in a diff somebody reads. Regenerating one is deliberate and cannot be left switched on — the run rewrites the fixture and then fails on purpose:

```bash
cd hooks && UPDATE_RULES_GOLDEN=1   npx vitest run lib/__tests__/rules-emission-golden.test.ts
cd hooks && UPDATE_SURFACE_GOLDEN=1 npx vitest run lib/__tests__/surface-growth-bound.test.ts
```

**What no bound covers.** The hook-test surface counts every `.ts` file in the suite's own tree at any depth (`hooks/lib/__tests__/**.ts`) — a recursive walk rather than a list of directories, so a test file in a new subdirectory is measured on the day it arrives; the three `.mjs` files under `hooks/` — the build script, the test runner and the vitest configuration — are hook scripts rather than tests and fall outside every surface. Nothing bounds them, and nothing bounds `hooks/*.ts`, `hooks/lib/*.ts`, `bin/`, `docs/` or the READMEs either. That is a statement of coverage, not a justification: those surfaces were not measured, and arming a bound on a corpus nobody measured is the one thing the instrument's own rule forbids.

### Rebuilding after TS changes

```bash
cd hooks && npm install && npm run build
```

The compiled `hooks/dist/` directory is committed to the repo and ships with the plugin, so it has to match the sources exactly — a deleted source whose compiled output stays behind is tracked in git, copied into `~/.fusion` by the installer, and readable there as a module the plugin no longer has. That happened once already, with the four files of the retired Bash classifier.

**That obligation is now a blocking gate.** `hooks/lib/__tests__/committed-dist.test.ts` extracts the committed source at `HEAD`, compiles it with the pinned compiler, and fails the suite when the result differs from the committed `hooks/dist/` — printing the differing files and the `npm run build` above as the remedy. See the gate table under `### Three gates that can fail the suite over text nobody compiled`.

`build` keeps that promise without deleting anything: it compiles to a staging directory, replaces each changed file in `dist/` atomically, and removes any output whose `.ts` source is no longer in the tree. The result is byte-identical to a wipe-and-rebuild, and `npm run build:clean` is still there (`rm -rf dist && tsc`) for the rare case where you want the wipe itself. `npm test` runs `build`, so a normal test run keeps `hooks/dist/` current exactly as it used to.

One consequence worth knowing before adding a file: nothing under `hooks/` may be a TypeScript source the build deliberately skips. The prune keeps a `dist/` entry whose `.ts` source still exists, and it cannot tell such a file's stale output from a concurrent run's fresh one. That is why the vitest configuration is `vitest.config.mjs`.

## Origin

Ported from Fusion's guard system (`fusion/reactor/pkg/guard/`), and almost nothing of the port is left:
- `decision_guard.go` → `guard.ts` + `lib/config.ts` + `lib/paths.ts`. The verdict went on 2026-08-16, the configuration under it shrank to one non-guard setting, and `lib/paths.ts` kept one case-folding helper out of the glob compiler it ported.
- `escalation.go` → `lib/escalation.ts`, deleted 2026-08-16 with the halt.
- `event_parser.go` → `lib/events.ts`, the one part still doing its original job.

The key difference at the time: Fusion intercepted via the SDK's `canUseTool` callback in a running Go server, the Compliance Guard via Claude Code's native hook system — external scripts invoked per tool call. The difference that matters now is larger. Fusion's guard decided; this one observes.
