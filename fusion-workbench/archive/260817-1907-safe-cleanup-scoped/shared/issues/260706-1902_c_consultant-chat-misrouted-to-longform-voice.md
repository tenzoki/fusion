# Consultant routes its direct chat replies through the long-form writing profile

---
**Status:** closed
**Filed by:** analyst
**Cross-references:** 260706-1902-user-facing-agents-garbled-language-rootcause.md, 260706-1902[o]-consultant-chat-longform-boundary.md
---

## Symptom

The consultant's direct chat replies to the user read as over-ornate, convoluted language ("verschwurbelter Sprachmüll") instead of the short, plain answers its Primary Mode calls for.

## Defect

`agents/consultant.md:166` classifies "Conversation-mode answers" as long-form prose governed by `default-voice-en.yaml`:

> Long-form prose outputs subject to the stylometric profile loaded at Setup: reply files in `consult/` — both Conversation-mode answers and Written-report sections ...

"Conversation-mode answers" are the direct chat replies to the user, defined at `consultant.md:71` as "Short, precise, plain English ... 1-5 sentences default." They are chat-stream messages, not files. Routing them through the long-form profile applies:

- 12-22 word sentence-length bands (`default-voice-en.yaml:11-16`)
- expanded no-contraction forms (`default-voice-en.yaml:18-25`)
- first-person-plural consulting voice, "we recommend / our analysis" (`default-voice-en.yaml:27-35`)
- thesis/evidence/hedge scaffolding (`default-voice-en.yaml:37-63`)

This contradicts `rules/user-facing-output.md:21` ("Do not apply the long-form writing profile to chat") and the chat profile's own C04 ("Do not enforce sentence-length bands", `chat-voice-en.yaml:36-42`). The consultant is the only user-facing agent with this misclassification; analyst, shaper, investigator, playmaker, and orchestrator all classify their direct chat as short-form.

## Fix

Edit `agents/consultant.md:166`: move "Conversation-mode answers" from the long-form bucket to the short-form (chat-voice) bucket. Long-form (default-voice) should cover only the written-report file sections in `consult/*.md` (Analysis, Recommendations, Open Questions) and the prose bodies of issue/decision records the consultant authors. Short-form (chat-voice) should cover Conversation-mode answers, startup/status lines, and history entries.

No change needed to `bin/fusion-rules` (already emits both profiles to the consultant) or to `rules/user-facing-output.md` (already correct). Single-agent, single-line fix.

Depends on the boundary decision in `260706-1902[o]-consultant-chat-longform-boundary.md` (expanded-on-request chat answers: chat-voice or long-form).

## Verification

After the edit, a consultant conversation reply should read as 1-5 short sentences with contractions and direct address, not as we-voice consulting prose. The written report in `consult/*.md` should keep its consulting register.

---
Resolved: agents/consultant.md:166 reworded — "Conversation-mode answers" moved from the long-form default-voice bucket to short-form chat-voice; the surface-decides rule ("chat stream is always chat-voice, incl. expanded answers; only consult/*.md is long-form") encoded explicitly. plugin.json bumped 3.24.0 → 3.24.1. Boundary decision 260706-1902 settled as Option 1 and marked implemented.
