# Upgrading to v10.8 (10.8.0 / 10.8.1)

Nothing in this release can break an existing project, and no file of yours needs editing. What changes is **who writes the mechanical bookkeeping**: three event-row kinds and the session heartbeat move from prompt mandates on the orchestrator to machinery that cannot forget them.

## What is machine-written now

- **`task_start` / `task_done`** — the PreToolUse/PostToolUse hooks write one pair per sub-agent dispatch into `fusion-workbench/orchestrator-events.jsonl`, with a real timestamp, `person`/`checkout`/`session_id` attached, and the tool-use id as `task`. Only while an orchestrator session is in flight (`agentstate.yaml` exists). Since 10.8.1 a **backgrounded** dispatch gets its `task_done` from the new SubagentStop hook at the sub-agent's real completion, paired through a launch-time mapping under `.guard-state/` — 10.8.0 recorded the launch moment there, which the first live session measured as a same-second pair around an 11-minute agent.
- **`commit`** — `bin/fusion-commit-lock with` appends the row after the wrapped command exits 0 and HEAD has actually moved (read from the repository, never inferred from the command's text).
- **The session-marker heartbeat** — the PostToolUse hook refreshes `.session-marker`'s mtime on every tool call, rate-limited to once per 60 s, while both the marker and `agentstate.yaml` exist. The orchestrator no longer runs `fusion-session-mark heartbeat` per Turn.
- **Identity, resolved once** — SessionStart runs `bin/fusion-identity` a single time and exports `FUSION_PERSON` / `FUSION_CHECKOUT`; `session-id.js` additionally exports `FUSION_SESSION_ID`. `bin/fusion-events` reads the pair from the environment and re-runs nothing.

Why: measured on fusion's own log, 87 % of event lines were batch-written after the fact, the identity fields the multi-checkout readers scope on stood on 2.6 % of lines, and `session_id` on none. The mandate was right and the work departed from it; the repair is a writer that cannot forget, not a louder mandate.

## What you should know

- **Update before the next orchestrator session**: `fusion --update` (or the marketplace pull) plus a session restart. The hooks run from the installed copy, pinned per session — an old install keeps the old behaviour, including the prompt-side emissions, so nothing is lost either way; you just don't get the machine rows yet.
- **Old logs stay readable.** Machine rows use the log's existing schema and timestamp convention; pre-existing lines are untouched, and the absent-field degradation rules cover both directions.
- **No duplicates by construction on this version's prompts**: the orchestrator prompt no longer emits `task_start`/`task_done`/`commit`. A *stale installed prompt* driving a *new installed hook set* cannot occur (both ship together).
- **One residual, stated**: a plain (non-orchestrator) Claude session dispatching its own subagents in the same project *while* an orchestrator session is live will land task rows in the log; they carry their own `session_id`, which is how a reader tells them apart.

## Verify after updating

Start a session, dispatch anything, then:

```bash
tail -3 fusion-workbench/orchestrator-events.jsonl
```

The `task_start`/`task_done` rows should carry `person`, `checkout` and `session_id` on every line.
