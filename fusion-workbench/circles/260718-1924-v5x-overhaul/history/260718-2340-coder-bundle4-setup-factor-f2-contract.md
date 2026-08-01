# History: Circle D Bundle 4 — Setup factor + F2 dispatched-vs-top-level contract

**Date:** 2026-07-18 23:40
**Agent:** coder
**Status:** Complete
**Circle:** `260718-1924-v5x-overhaul`
**Plan:** `planning/260718-2150_p_plan-circle-d-agent-prompt-revision.md` (Bundle 4)

## What was done

Applied Bundle 4 of the Circle D plan to the four user-asking domain agents:
`agents/shaper.md`, `agents/planner.md`, `agents/analyst.md`, `agents/bugfixer.md`.

**A. Setup factor (R3/F1).** Replaced each prompt's verbose Setup step-2 block with
the validated `rules/agent-setup.md` pointer form (`<self>` = the agent's name). Step-1
locate-workbench kept inline. All agent-specific Setup content preserved (analyst steps
3-6, bugfixer step 3, etc.) — HYG-NO-REGRESS.

**B. F2 dispatched-vs-top-level contract (R4).** Added a `## Tool Discipline` section to
each of the four, modelled on `editor.md`. Contract: top-level → may use `AskUserQuestion`
directly; dispatched as sub-agent → no `AskUserQuestion`, return questions/confirmations to
the orchestrator, which proxies and re-dispatches. Reworded each prompt's existing
unconditional AskUserQuestion / "ask the user" instructions to reference the contract:

- **shaper** — "Involve the User" clarification loop + Decision-Defaults "Reserve AskUserQuestion".
- **planner** — the raw-request "ask the user via AskUserQuestion for technical decisions".
- **analyst** — the two scattered "if unclear, ask" instructions (Analysis Types intro, Clarify scope).
- **bugfixer** — ontology-gate confirm, too-vague-to-investigate clarify, and the orchestrator-gate line.

Domain/executor-parameter model and each agent's decision logic left untouched — only the
channel a question reaches the user by is now conditional.

## Verification

- `bin/fusion-paths {shaper,planner,analyst,bugfixer}` — each exit 0; key sets byte-identical
  to pre-edit capture.
- `npm test` (hooks/) — 261 passed (path-lint + context-manifest baseline green).
- `claude plugin validate .` — passed (only the pre-existing CLAUDE.md-at-root warning).

## Files changed

- `agents/shaper.md`
- `agents/planner.md`
- `agents/analyst.md`
- `agents/bugfixer.md`
