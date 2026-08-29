# Analyst session: consultant garbled-chat root cause

**Date:** 2026-07-06 19:02
**Agent:** analyst (domain: knowledge)
**Status:** Complete

## Task

Root-cause why fusion's user-facing agents produce convoluted over-ornate language in direct chat. Verify/refute the misrouting hypothesis (chat routed through long-form default-voice) and the recent-fix-missed-chat hypothesis.

## Outcome

Both hypotheses confirmed, narrowed to one agent. The consultant's Output Style (`agents/consultant.md:166`) classifies "Conversation-mode answers" (its direct chat replies) as long-form prose governed by `default-voice-en.yaml`. Because the consultant is conversation-first, its primary user-facing surface gets the consulting-register profile (12-22 word sentence bands, expanded forms, we-voice), producing the Sprachmüll. All other user-facing agents (analyst, shaper, investigator, playmaker, orchestrator) classify direct chat correctly as short-form chat-voice.

The recent Kauderwelsch commits (`2935d93` readability gate, `98cb40c` default-voice sharpening) improved the long-form profile and the pre-send gate but never touched the consultant's chat classification, which has stood since `f19daea` (2026-05-31).

Fix direction: reclassify the consultant's Conversation-mode answers as chat-voice in `consultant.md:166`. Single-agent, single-line change. `bin/fusion-rules` and `rules/user-facing-output.md` are already correct.

## Artifacts

- Report: `260706-1902-user-facing-agents-garbled-language-rootcause.md`
- Issue: `260706-1902[o]-consultant-chat-misrouted-to-longform-voice.md`
- Decision: `260706-1902[o]-consultant-chat-longform-boundary.md`
