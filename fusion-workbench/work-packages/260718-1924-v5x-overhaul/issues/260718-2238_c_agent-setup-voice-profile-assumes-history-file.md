agent-setup.md voice-profile fallback assumes a history file every agent writes, but 3+ agents write none
---
`rules/agent-setup.md` line 48 tells every agent, on a missing voice profile, to "note the absence in your history file and proceed." But agent-setup.md is emitted to all 16 agents, and at least three produce no history file: coderev and ontorev (F5, this same Circle-D turn, now explicitly state "You write no separate session-history entry") and conceptrev (read-only advisory, zero history references). The single-authoring-home unit references an artifact those agents don't have.
---
Location: `rules/agent-setup.md:44-48`, `## Voice profiles`:

> "If a profile you expect is absent, note the absence in your history file and proceed."

Scope: the shared Setup unit, affects coderev, ontorev, conceptrev (and any future produce-only/advisory agent with no history log). Introduced by the Circle-D Bundle-0 factoring (commit 046453e) that established agent-setup.md as the single authoring home for the Setup contract — the same turn that added the F5 "no history entry" sentence to coderev/ontorev, so the unit and the F5 change contradict each other.

Impact: Low. The fallback is an edge case (voice profile absent), and an agent with no history file simply can't act on the instruction, so it degrades to "proceed" harmlessly. But this is the validation checkpoint for a form about to propagate across bundles 2-6, and precision in the newly-canonical unit matters: the instruction names an artifact the reader may not own.

Fix direction (clean, integrated — one edit in the shared unit, not per-prompt patches): make the fallback not presuppose a history file. E.g. "If a profile you expect is absent, note the absence (in your history file if you keep one) and proceed." or simply "note the absence and proceed." This keeps the unit correct for every agent that reads it.

Route: coder (edits the prompt/rule surface in this self-development repo).

---
Resolved: Changed the `## Voice profiles` fallback clause in `rules/agent-setup.md` so it no longer presupposes a history file — now reads "note the absence (in your history file if you keep one) and proceed." One clause changed; correct for every agent including the produce-only/advisory reviewers (coderev, ontorev, conceptrev) that write no history file.
