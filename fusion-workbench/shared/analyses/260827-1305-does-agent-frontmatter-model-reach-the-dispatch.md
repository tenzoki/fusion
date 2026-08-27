# Does an agent's `model:` frontmatter reach the dispatch? — measured

---
**Filed by:** claude-code (conditioning-load work, the model-tiering preparation), Kai Stalmann <ks@qantr.com>

---

## Method

A throwaway plugin (`tierprobe`, one agent whose frontmatter declares `model: haiku`), `claude plugin validate` passed, one headless `claude --plugin-dir . -p` run on 2026-08-27 dispatching the agent. The finding is read from the run's transcripts on disk — the same discipline as the session-id and SubagentStop measurements — not from any agent's testimony: a dispatched agent cannot reliably name its own model, and the dispatch result carries no model field (both observed in this run).

## Findings

**(a) The frontmatter is honoured.** The sub-agent's transcript (`subagents/agent-*.jsonl`) carries `"model":"claude-haiku-4-5-20251001"` on its requests while the main session's transcript carries `"model":"claude-fable-5"` — the override reached the dispatch and did not leak into the parent.

**(b) Neither the dispatch result nor the agent knows.** The tool result shows text, agent id and usage only; verification of a tiering change therefore always goes through the transcript, never through asking the agent.

**(c) `claude plugin validate` accepts the field.** Loading was verified end-to-end (the agent resolved and replied), which is the empirical bar CLAUDE.md's frontmatter lesson sets — a field beyond `name`/`description`/`tools` once broke all agent loading (v2.8.1) precisely for lack of this check.

## What this does not establish

Whether a smaller model does any fusion role's work acceptably. That is the open decision `260827-1305` beside this analysis, and it needs live-session evidence, not another probe.
