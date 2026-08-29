# Analysis: why the consultant's direct chat reads as garbled over-ornate language

**Date:** 2026-07-06 19:02
**Type:** Root-cause analysis
**Status:** Complete
**Requested by:** user (via orchestrating session)

## Verdict

**Confirmed.** The misrouting hypothesis holds, and it is narrower than "the user-facing agents" in general: exactly one agent is affected. The consultant's Output Style classifies its direct-to-user chat replies ("Conversation-mode answers") as long-form prose governed by the long-form writing profile `default-voice-en.yaml`. Because the consultant's *primary* mode is conversation, its main user-facing surface gets the ornate consulting-register profile, and that produces the "verschwurbelten Sprachmüll." Every other user-facing agent classifies its direct chat correctly as short-form.

## Root cause

One line does it. `agents/consultant.md:166`:

> Long-form prose outputs subject to the stylometric profile loaded at Setup: reply files in `consult/` — **both Conversation-mode answers and Written-report sections** (Analysis, Recommendations, Open Questions). Short-form outputs governed by ... : history entries.

"Conversation-mode answers" is defined earlier in the same file, at `agents/consultant.md:71`, as the direct chat reply to the user: "Conversational replies to the user. Short, precise, plain English. Lead with the answer. 1-5 sentences default." The consultant's whole framing is conversation-first (`consultant.md:10`, `consultant.md:53`). So line 166 takes the consultant's primary output — the message the user reads in the chat stream — and routes it through `default-voice-en.yaml`.

That profile is the wrong instrument for a chat reply. Concretely:

- `default-voice-en.yaml:11-16` (U01) sets a sentence-length target of 12-22 words and says "most sentences run 12-22 words." A chat answer that should be 1-5 short sentences gets inflated to long ones.
- `default-voice-en.yaml:18-25` (L06) says "Use contractions sparingly. Default to expanded forms ('do not', 'it is', 'we are')." Stilted register for a quick answer.
- `default-voice-en.yaml:27-35` (U05) mandates first-person-plural consulting voice: "we recommend", "our analysis suggests", "in our work with clients". That is boardroom-report voice, not a direct answer to a question.
- `default-voice-en.yaml:37-63` (A01/A02/V03) layer thesis-first, evidence-pattern, and calibrated-hedge scaffolding ("the evidence suggests", "in most engagements we have seen") on top.

The chat profile is built to be the opposite. `chat-voice-en.yaml:36-42` (C04) states outright: "Do not enforce sentence-length bands; short sentences are normal and welcome in chat." And the governing rule already forbids the misroute: `rules/user-facing-output.md:21` — "Do not apply the long-form writing profile (`default-voice-<lang>.yaml`) to chat. Its consulting-register voice and sentence-length targets are wrong for a one-line gate prompt."

So the consultant's Output Style directly contradicts the rule it claims to follow. The rule is correct; the agent diverges. That divergence is the single integral cause.

## Scope

Every user-facing agent emits both profiles at Setup (`bin/fusion-rules:195` emits chat-voice to all; `bin/fusion-rules:199-201` emits default-voice to the eight prose agents). The routing decision lives in each agent's Output Style section, not in `bin/fusion-rules`. Only the consultant routes chat to long-form.

| Agent | Direct-to-user chat classified as | Verdict |
|---|---|---|
| consultant (`consultant.md:166`) | **long-form** ("Conversation-mode answers" in the long-form bucket) | **Affected — the root cause** |
| analyst (`analyst.md:274`) | short-form ("chat reports"); long-form is report-file prose only | Clean |
| shaper (`shaper.md:218`) | short-form ("AskUserQuestion text, chat reports"); long-form is spec-file prose | Clean |
| investigator (`investigator.md:196`) | short-form ("chat reports"); long-form is investigation-file sections | Clean |
| playmaker (`playmaker.md:180`) | short-form ("chat reports, dashboard updates"); long-form is briefing prose | Clean |
| orchestrator (`orchestrator.md:906`) | short-form ("gate prompts, chat status messages"); long-form is the history session-summary body | Clean |

The pattern is clear: for the other five, the primary deliverable is a *file* (report, spec, investigation, plan, session log) and chat is a brief status or gate, so "long-form = the file, short-form = chat" maps cleanly onto their two surfaces. The consultant is the only agent whose primary surface *is* the chat conversation, and its classification sweeps that surface into long-form.

## What the recent Kauderwelsch fix covered, and what it missed

Two commits from 2026-06-26 targeted the Kauderwelsch complaint:

- `2935d93` — added the readability gate (`## Self-review before sending`) to `rules/user-facing-output.md`, plus a one-line pointer in the seven prose agents. It improved the pre-send checklist that applies to both long-form and chat. It did **not** touch the consultant's classification line. Confirmed by `git show 2935d93 -- agents/consultant.md`: the classification line at 166 appears as unchanged context; only the readability-gate paragraph above it was added.
- `98cb40c` — sharpened `default-voice` (the long-form profile) against compression: added blacklist rule K01 (clause-chains/fragments), extended the em-dash and terminology rules. It made the long-form profile better, but the long-form profile is still the wrong profile for chat. Sharpening it does not stop it from being applied to chat.

Neither commit addressed the routing. The classification at `consultant.md:166` was introduced earlier, in `f19daea` (2026-05-31, "stilwerk profile loading + per-agent applicability"), and has stood unchanged through the entire Kauderwelsch effort. The user's suspicion is correct: the recent effort sharpened and gated the *written* long-form output and left the *direct-chat* classification untouched.

## The two-surfaces distinction, and where the consultant conflates them

Two genuinely different surfaces exist:

```
(a) reply FILE   consult/*.md   durable, read later as reference   → long-form is legitimate
(b) chat STREAM  the message the user reads in scrollback          → must be lean chat-voice
```

For the consultant these are separate: written reports go to `consult/*.md` (`consultant.md:74-76`), conversation answers go to the chat stream (`consultant.md:71`). Conversation answers are **not** files. But `consultant.md:166` labels the long-form bucket "reply files in `consult/`" and then folds "Conversation-mode answers" into it — a category error, because conversation answers are not reply files. The conflation is the mechanism: by naming the bucket after the file surface and then dropping the chat surface inside it, the line applies the file's profile to the chat.

The written-report sections (Analysis, Recommendations, Open Questions in `consult/*.md`) are correctly long-form — a durable signed consulting report earns the consulting register. The defect is only that the chat-stream conversation answers ride along.

## Fix direction (not implemented)

The cleanest single change is a per-agent Output-Style wording change in `agents/consultant.md:166`. Move "Conversation-mode answers" out of the long-form bucket and into the short-form bucket:

- **Long-form (default-voice):** written-report file sections in `consult/*.md` only — Analysis, Recommendations, Open Questions, plus the prose bodies of issue and decision records the consultant authors.
- **Short-form (chat-voice):** Conversation-mode answers (direct chat replies to the user), startup/status lines, and history entries.

No other file needs to change:

- `bin/fusion-rules` already emits both profiles to the consultant. No change.
- `rules/user-facing-output.md` already says chat must not use the long-form profile (`:21`). It is correct as written. No change.
- No other agent's classification needs editing (all five are clean).

This is one integral fix — reclassify one bucket in one agent — not a scattered set. It aligns the consultant's Output Style with (a) its own Primary Mode ("1-5 sentences, lead with the answer", `consultant.md:57`,`:71`), (b) `rules/user-facing-output.md:21`, and (c) the clean classification the other five agents already use.

One boundary the reclassification must settle, filed as a decision (see below): when the user asks the consultant to expand a conversation answer (`consultant.md:57` "expand only on request"), does the longer answer — still delivered in the chat stream — use chat-voice or long-form? The lean answer is that anything in the chat stream stays chat-voice, and long-form is reserved for `consult/*.md` files; but this is the one genuine judgment the wording change depends on.

## Filed artifacts

- Issue: `260706-1902[o]-consultant-chat-misrouted-to-longform-voice.md`
- Decision: `260706-1902[o]-consultant-chat-longform-boundary.md`

## Sources

- `agents/consultant.md:10,53,57,71,74-76,164,166` — consultant modes and the offending classification
- `agents/analyst.md:274`, `agents/shaper.md:218`, `agents/investigator.md:196`, `agents/playmaker.md:180`, `agents/orchestrator.md:906` — clean classifications
- `fusion-workbench/stilwerk/default-voice-en.yaml:11-63` — long-form profile: sentence bands, expanded forms, we-voice, thesis/evidence/hedge scaffolding
- `fusion-workbench/stilwerk/chat-voice-en.yaml:36-42` — chat profile: no sentence-length bands
- `rules/user-facing-output.md:9-21` — the routing rule the consultant contradicts
- `bin/fusion-rules:195,199-201` — both profiles emitted; routing decided in agents, not here
- `git show 98cb40c 2935d93`, `git log -S` on the classification string — the recent fix touched long-form + the gate, not the chat routing; classification introduced in `f19daea`

## Open questions

- [ ] The expanded-conversation-answer boundary (above) — resolved by the filed decision.
