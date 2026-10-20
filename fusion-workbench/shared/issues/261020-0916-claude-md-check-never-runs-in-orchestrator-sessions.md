The claude-md check never runs when a session starts through the orchestrator
---
Periodic checks become due only in `/fusion:setup` Step 0/1; the orchestrator's inlined Setup (`agents/orchestrator.md` `## Setup`) computes no `checks_due` and reads no `.check-stamps`, so a project whose sessions start via the orchestrator never weighs its CLAUDE.md.
---
**Filed by:** orchestrator (on the user's instruction), Kai Stalmann <ks@qantr.com>

krk has no `fusion-workbench/.check-stamps` although `.fusion-setup` was rewritten on 2026-10-14 (`1fe34c4f`); its event log holds no `claude-md=` line.

Evidence: `261020-0835-why-a-consumers-claude-md-grows-unchecked.md`

**Acceptance:** A session started through the orchestrator without `/fusion:setup` either runs the due checks or surfaces one line naming that they are due, verifiable in a fresh consumer workbench.
