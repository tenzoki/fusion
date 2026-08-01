# Coder — Circle D final turn: planner:55 reword + orchestrator Setup factoring

**Date:** 2026-07-19
**Agent:** coder
**Status:** Complete

## Edit 1 — planner.md:55 residual ask (issue 260718-2353)

Reworded the `_o_` decision-marker instruction in `agents/planner.md` `## Open decisions as planning input` to route the blocking-question path through the `## Tool Discipline` channel (fix direction 1 from the issue). Primary "surface in Open Questions" path unchanged. Closed the issue: appended `Resolved:` note and renamed marker `_o_` → `_c_`.

## Edit 2 — orchestrator.md Setup factoring (Bundle 6)

Collapsed the common step-2 rules-and-paths interpretation prose in `agents/orchestrator.md` to the shared pointer form (matching the other 15 prompts), delegating to `rules/agent-setup.md`. RETAINED inline three orchestrator-specific expansions:
1. "Sub-agents run their own rules check" (orchestrator is the only dispatcher).
2. The exit-4 "file an issue at `$OUT_ISSUE`" action (not in the shared contract).
3. The root-anchored-surfaces note (agentstate.yaml / orchestrator-live.md / orchestrator-events.jsonl / .guard-state / .commit-lock / .session-marker stay at workbench root).

Collapsed generic content: the fusion-rules emits-description, the fusion-paths KEY=value enumeration + workbench-relative/hold-these-values/never-guess prose, voice-profile paragraphs, and generic exit-3/exit-4 interpretation.

**Did NOT touch:** the `tools:` line (line 4, byte-identical), any other frontmatter, or any Phase/gate/routing content.

## Verification (all green)

- `grep '^tools:'` — unchanged, byte-for-byte identical.
- `fusion-paths orchestrator` exit 0, key set identical pre/post (13 keys, none dropped — enumeration parenthetical never contributed to the derived set). `fusion-paths planner` exit 0, unchanged.
- `npm test` (hooks/) — 261 passed, incl. path-literal-lint + context-manifest baseline for all 16 agents.
- `claude plugin validate .` — passed with warnings (pre-existing benign CLAUDE.md warning).
- Smoke test `claude --plugin-dir . --agent fusion:orchestrator -p "reply SMOKE-OK"` → `SMOKE-OK` (orchestrator loads with allowlist intact).
