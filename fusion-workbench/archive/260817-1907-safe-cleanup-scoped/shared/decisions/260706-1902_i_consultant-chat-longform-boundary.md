# Where is the consultant's long-form / chat-voice boundary for expanded conversation answers?

---
**Domain:** knowledge
**Status:** implemented
**Filed by:** analyst
**Cross-references:** `260706-1902_*_consultant-chat-misrouted-to-longform-voice.md`, `260706-1902-user-facing-agents-garbled-language-rootcause.md`
---

## Question

The fix for the consultant's garbled-chat defect reclassifies "Conversation-mode answers" as short-form chat-voice. One boundary must be settled for the wording to be unambiguous: `consultant.md:57` lets a conversation answer expand "only on request" ("give me a thorough analysis" without a written report). When the user asks the consultant to expand its answer in the chat stream (not as a `consult/*.md` file), which profile governs the longer answer — chat-voice or the long-form writing profile?

## Options

1. **Chat stream is always chat-voice; long-form is reserved for `consult/*.md` files.** — The surface decides the profile, not the length. An expanded chat answer stays chat-voice (just longer, still lean).
   - Pros: one clean rule ("chat = chat-voice, file = long-form"); matches every other agent; no length-based branching to get wrong; directly prevents the reported Sprachmüll.
   - Cons: a genuinely long, structured chat answer loses the consulting cadence the writing profile provides.
2. **Length threshold: short answers chat-voice, expanded answers long-form.** — Below N sentences chat-voice, above it the writing profile, even in chat.
   - Pros: long structured answers keep the consulting register.
   - Cons: reintroduces exactly the misroute this fixes (writing profile in the chat stream); ambiguous threshold; contradicts `rules/user-facing-output.md:21`.
3. **Expanded answers go to a `consult/*.md` file, never a long chat message.** — If an answer warrants long-form, write the report file and give a short chat pointer.
   - Pros: keeps the surface/profile mapping clean; the durable report is a better home for long analysis anyway.
   - Cons: forces a file even when the user wanted the answer inline.

## Constraints

- Must not contradict `rules/user-facing-output.md:21` (long-form profile must not govern chat).
- Must keep the consultant's Primary Mode intact (`consultant.md:57,71`: lead with the answer, 1-5 sentences default).
- Written reports in `consult/*.md` remain long-form regardless of the choice.

## Recommendation

Option 1. It is the single integral rule — the surface (chat stream vs `consult/` file) decides the profile, length does not. It matches the other five agents, removes any length-based branching, and directly resolves the reported defect. Option 3 is a reasonable escalation *within* Option 1 (when an inline answer would be very long, offer to write the report file), not a competing rule.

---
Answered: user chose Option 1 (surface decides the profile, never length) — orchestrator session 260706-1851-orchestrator-session.md
Implemented: agents/consultant.md:166 — chat stream always chat-voice (incl. expanded answers); only consult/*.md is long-form default-voice
Deferred:
Superseded by:
