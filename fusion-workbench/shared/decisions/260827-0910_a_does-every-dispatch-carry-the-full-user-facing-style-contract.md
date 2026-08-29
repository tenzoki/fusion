# Does every dispatch carry the full user-facing style contract?

---
**Domain:** code
**Filed by:** claude-code (direct session, conditioning-load work following `refactor/260827-0335-bookkeeping-cost-repair-plan.md`), Kai Stalmann <ks@qantr.com>
**Cross-references:** `rules/user-facing-output.md` (the contract whose audience this decides) · `bin/fusion-rules` (the emission list) · `rules/agent-setup.md` `## Voice profiles` (the replacement the non-audience carries) · `260827-0830_*_do-the-decision-record-worked-examples-stay-on-the-always-on-floor.md` (the same movement, one file earlier)

---

## Question

`rules/user-facing-output.md` (20,354 bytes) was always-on: every agent, every dispatch. Measured on this repository's dispatch history: the executors and analysts that report to the orchestrator rather than to a person — coder, ontocoder, bugfixer, coderev, ontorev, reconciler, taskplanner, analyst, planner — took roughly 95 % of all dispatches (coder alone 268 of ~420 attributable rows), and each of those dispatches carried 20 KB of gate-prompt, `AskUserQuestion` and chat-format doctrine for surfaces those agents never hold. The style floor per executor dispatch stood at ~101.6 KB, of which this file was the second-largest item after the conventions.

## Answer (260827, user — "Beginne mit 1")

The contract goes to the agents whose output the user reads **directly**: orchestrator (gates, status, chat), consultant (replies), playmaker (briefings), shaper (clarification rounds), editor (deliverable chat), curator (the gate ledger). Everyone else keeps two things, stated in `rules/agent-setup.md` `## Voice profiles`: the chat profile's anti-patterns bind every line a human may read, and a report's audience is the dispatcher — outcome first, the mandated `Verification:` line, no decorative structure. Realised as the `IS_USER_FACING_AGENT` flag in `bin/fusion-rules` (block 1b3), with the role map updated for the six. Per-executor dispatch load drops by 20,354 bytes (~5 K tokens), on the path that carries ~95 % of dispatches.
