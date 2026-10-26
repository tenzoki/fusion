# Hook payload fixtures

These are stdin payloads for the commands registered in `hooks/hooks.json`. Each directory is named after one command. Each file in it is one JSON object, which goes to that command on stdin. The hook-layout conformance test (plan `261023-1854-plan-prior-full-surface-handover-h1-to-h9.md`, step 21) runs every command with every payload in its directory twice: once with `CLAUDE_PLUGIN_ROOT` at the unpacked bundle payload and once at the plugin tree. It then compares stdout and every file written.

## Where the fields come from

The field set follows Prior's analysis of fusion's hook surfaces (Prior, 2026-10-22), section `### 1. Per command`, at Prior commit `08c57fb`:
`fusion-workbench/work-packages/261021-2241-full-fusion-surface-on-prior/analyses/261022-0003-fusion-hook-surfaces.md`.
That section names the fields the hooks read: `session_id`, `tool_name`, `tool_input` (`file_path`, `new_string`, `subagent_type`, `description`, `prompt`), `tool_use_id`, `tool_response` (`status`, `agentId`) and `agent_id`. The envelope fields `hook_event_name`, `source` and `agent_type` come from `### 3. Translation table` in the same analysis. No hook reads them, but they let a payload say what it stands for: `source` is what separates a fresh session from a resumed one.

**The payloads are fusion's own.** They were written for this fixture set and checked against the hook sources under `hooks/`. The payloads behind Prior's analysis were never kept: the hand-over states that their run log was session scratch and is in neither repository. So nothing here is a recorded Claude Code payload.

## Conventions

- **One session.** Every payload carries `session_id` `f0510000-0000-4000-8000-000000000001`, except the two whose purpose is to leave it out. It is UUID-shaped, so it passes `session-id.js`'s `[A-Za-z0-9_-]+` gate for the env export.
- **Fixed identifiers.** `tool_use_id` is `toolu_fixture_<nnnn>`, numbered across the PreToolUse/PostToolUse pairs, so that a pair shares one id. Agent ids are `fixture-agent-sync-0001` and `fixture-agent-bg-0001`. Nothing is random and nothing is time-dependent.
- **Paths are relative to the fixture repository root**, which has to be the hooks' working directory. Every hook resolves `file_path` against `process.cwd()` (`resolve(process.cwd(), written)` in `hooks/tracker.ts`), so a relative path reaches the same branches an absolute one does. Claude Code would send absolute paths. These payloads use relative ones so that they hold no path of any machine, and so that `guard_allow`'s verbatim `file` field compares equal between the two runs.
- **`cwd` and `transcript_path` are left out.** No hook reads either one (analysis `### 1`), and Claude Code's values are absolute.
- **Pretty-printed with two spaces**, with a trailing newline. Every hook trims its stdin before it parses.

## What the fixture repository has to provide

A payload alone does not reach every branch. Some branches read the disk or git state too. The fixture repository is `git init` with a fixed `user.name`/`user.email`, an initial commit and `fusion-workbench/.fusion-setup`. `CLAUDE_ENV_FILE` points at a fresh file for each run. Beyond that:

- **PostToolUse write payloads describe a write that has already happened.** The tracker reads the written file back from disk. Before running a `tracker/` payload whose `tool_input` writes a file, write that file with the content the payload implies. For `Write`, that is `tool_input.content`. For `Edit`, it is the file from the preceding `Write` with `old_string` replaced by `new_string`.
- **Review coverage** (`tracker/08-write-review.json`) reports only when the event log holds a `session_start` row with `git_head_at_start`, which `session-start/01-startup.json` writes, and when at least one commit lands after that head. Without the commit, the measurement runs and writes nothing.
- **Staging drift** arms `.guard-state/staging-drift.json` on the first PostToolUse in a git repository. It reports only after HEAD has moved while workbench records are still uncommitted.
- **Identity.** When `FUSION_PERSON` and `FUSION_CHECKOUT` are both set, the dispatch rows and the `session_start` row carry those values. When they are not, `bin/fusion-identity` resolves the values and mints `.checkout-id`. Set the pair, or leave it unset, the same way in both runs.
- **The session-marker heartbeat** touches `.session-marker` only if the file exists.
- **The config diagnostic** (`guard_advisory` from `loadConfig`) fires on the `Write`, `Edit` and `Bash` guard payloads only when the fixture's `fusion.json` is broken or a `fusion-guard.json` exists.

## Order

Some payloads depend on state that an earlier payload writes. Run them in filename order inside each directory. Across directories, follow the order of a session: SessionStart commands, then `guard/` and `tracker/` interleaved as pairs (PreToolUse `nn` before PostToolUse `nn`), then `subagent-stop/`. Exceptions:

- `subagent-stop/01-background-completed.json` needs the entry that `tracker/05-agent-background.json` parks in `.guard-state/dispatch-map.json`.
- `subagent-stop/02-sync-completed.json` finds no entry. That is correct, because a sync dispatch's row belongs to PostToolUse. Under Claude Code it fires before `tracker/04-agent.json`.
- `subagent-stop/03-background-no-session-id.json` also needs a parked entry, so `01` must not have consumed it. Run `tracker/05-agent-background.json` again first, or use a fresh fixture.
- `*/02-resume.json` repeats the startup session id. It has to follow `01-startup.json` in the same fixture for the deduplication to show.

## Command to directory

`hooks.json` registers eight commands. The directory names follow the analysis's command numbering.

| # | Event | Command | Directory |
|---|---|---|---|
| 1 | SessionStart | shell: `export FUSION_PLUGIN_ROOT` into `$CLAUDE_ENV_FILE` | `session-start-env-export/` |
| 2 | SessionStart | shell: `printf` of the fixed "Fusion loaded" envelope | `session-start-banner/` |
| 3 | SessionStart | `hooks/dist/session-start.js` | `session-start/` |
| 4 | SessionStart | `hooks/dist/session-id.js` | `session-id/` |
| 5 | SessionStart | shell: `bin/fusion-identity` into `$CLAUDE_ENV_FILE`, piped into `identity-notice.js` | `session-start-identity/` |
| 6 | PreToolUse | `hooks/dist/guard.js` | `guard/` |
| 7 | PostToolUse | `hooks/dist/tracker.js` | `tracker/` |
| 8 | SubagentStop | `hooks/dist/subagent-stop.js` | `subagent-stop/` |

Commands 1, 2 and 5 do not read stdin. They get the same two SessionStart payloads as 3 and 4, so that every command runs once per kind of session.

## What each payload exercises

### SessionStart (`session-start-env-export/`, `session-start-banner/`, `session-start/`, `session-id/`, `session-start-identity/`)

| File | Exercises |
|---|---|
| `01-startup.json` | A fresh session (`source: "startup"`). `session-start.js` writes the `session_start` row with `git_head_at_start` and replies with `{}` or a `systemMessage`. `session-id.js` prints `fusion: session_id=<id>` and appends `export FUSION_SESSION_ID`. Command 1 appends `FUSION_PLUGIN_ROOT`. Command 5 appends `FUSION_PERSON`/`FUSION_CHECKOUT` and may mint `.checkout-id`. |
| `02-resume.json` | A resumed session (`source: "resume"`, same id). `sessionStartAlreadyWritten` suppresses a second `session_start` row. The session-id line, the banner and the env exports are repeated. |

### PreToolUse (`guard/`)

| File | Exercises |
|---|---|
| `01-write.json` | `Write` of `docs/fixture-note.md`: a `guard_allow` row with `file` in `.guard-state/events.jsonl`, reply `{}` |
| `02-edit.json` | `Edit` of the same file: a `guard_allow` row |
| `03-bash.json` | `Bash`: the bare allow, which writes nothing while the config is valid. It reaches the config-diagnostic loop. |
| `04-agent.json` | `Agent`, sync dispatch: a `task_start` row in `orchestrator-events.jsonl` with `task`, `agent` (`state-auditor`), `detail` and `work_item` (from the `**Work-item:**` line in `prompt`) |
| `05-agent-background.json` | `Agent` with `run_in_background`: the same `task_start` row. The background part shows only in the tracker's reply. |
| `06-agent-no-session-id.json` | `Agent` with no `session_id`: no row, and a `guard_advisory` about the absent identifier |

### PostToolUse (`tracker/`)

Every tracker payload also reaches the HEAD comparison (`staging-drift.json`) and the session-marker heartbeat.

| File | Exercises |
|---|---|
| `01-write.json` | `Write` outside the workbench: no measurement fires. On the first call, it arms `staging-drift.json`. |
| `02-edit.json` | `Edit` outside the workbench: the same |
| `03-bash.json` | `Bash`: the HEAD comparison. It reports `staging_drift` when HEAD moved and records under `fusion-workbench/` are uncommitted. |
| `04-agent.json` | `Agent`, `tool_response.status: "completed"`: a `task_done` row |
| `05-agent-background.json` | `Agent`, `tool_response.status: "async_launched"`: no row. It parks `fixture-agent-bg-0001` in `.guard-state/dispatch-map.json`. |
| `06-write-workbench-citation.json` | `Write` of a workbench `.md` with a store-prefixed citation: a `citation_form` row, `citation-form.json`, and `additionalContext` |
| `07-edit-workbench-citation.json` | `Edit` that adds a second store-prefixed citation. `writtenLines` scopes the report to `new_string`. It writes a new signature, a `citation_form` row and `additionalContext`. |
| `08-write-review.json` | `Write` of `shared/reviews/261001-0000-reviewer-fixture-review.md`: `review_coverage` row, `review-coverage.json`, `additionalContext` when a commit is uncovered (see the fixture requirements above) |

### SubagentStop (`subagent-stop/`)

| File | Exercises |
|---|---|
| `01-background-completed.json` | The parked background dispatch ends: a `task_done` row, and the entry is removed from `dispatch-map.json` |
| `02-sync-completed.json` | A sync dispatch ends: no entry, nothing written, empty stdout |
| `03-background-no-session-id.json` | A parked entry but no `session_id`: a `guard_advisory` about the absent identifier. No row is written and the entry stays. |

## Branches no payload reaches

- **`guard_error` / `Tracker error`** (the fail-open handlers). Reaching them takes an exception inside `main`, for example an unwritable `.guard-state/`, which is a fixture condition, not a payload.
- **`MultiEdit` and `NotebookEdit`.** Both are in the matcher. The plan names `Write`, `Edit`, `Bash` and `Agent`, so neither has a payload. `MultiEdit` follows the `Edit` path with one `new_string` per edit. `NotebookEdit` follows the write path through `notebook_path`.
- **`Task`.** It is the older name of the dispatch tool. `isDispatchTool` treats it exactly like `Agent`.
- **The empty and unparseable stdin paths.** Each hook replies its default (`{}` or nothing) and writes nothing, so a payload file would have nothing to show.

## Checking the set

    for f in adapters/prior/testdata/hook-payloads/*/*.json; do jq -e . "$f" >/dev/null || echo "bad $f"; done
