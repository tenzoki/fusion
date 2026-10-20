The claude-md check never runs when a session starts through the orchestrator
---
Periodic checks become due only in `/fusion:setup` Step 0/1; the orchestrator's inlined Setup (`agents/orchestrator.md` `## Setup`) computes no `checks_due` and reads no `.check-stamps`, so a project whose sessions start via the orchestrator never weighs its CLAUDE.md.
---
**Filed by:** orchestrator (on the user's instruction), Kai Stalmann <ks@qantr.com>

krk has no `fusion-workbench/.check-stamps` although `.fusion-setup` was rewritten on 2026-10-14 (`1fe34c4f`); its event log holds no `claude-md=` line.

Evidence: `261020-0835-why-a-consumers-claude-md-grows-unchecked.md`

**Acceptance:** A session started through the orchestrator without `/fusion:setup` either runs the due checks or surfaces one line naming that they are due, verifiable in a fresh consumer workbench.

---
Resolved: the due computation moved out of setup's inline block into `hooks/lib/checks-due.ts`, with two callers: `bin/fusion-checks-due` (setup Step 0) and `hooks/session-start.ts`, whose one `systemMessage` now carries "fusion: periodic checks due (<selectors>): run /fusion:check" wherever a workbench is found and the list is not empty. A session started through the orchestrator without `/fusion:setup` therefore names its due checks. Probed in a fresh consumer workbench: with `.fusion-setup` and no `.check-stamps` the line names all eleven selectors; with all eleven stamped at the current version it prints nothing. No `hooks.json` edit, no new SessionStart command. On the user's ruling, the step also added the `.gitignore` exception for the helper and retargeted two tests that read the selector list from setup. Plan step 6 of `261020-0927-plan-consumer-claude-md-stays-lean.md`.
