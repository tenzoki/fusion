The artifact language is mechanised for the nine prose agents and merely asserted for the other seven, which write most of the persisted artifacts

---

**Severity:** Medium
**Domain:** code
**Filed by:** coderev, review of `b246996..HEAD` (the two-language declaration split)
**Affects:** `bin/fusion-rules:401` and `:409-411` (the two emission call sites), `rules/agent-setup.md:52-56` (`## Voice profiles`), `rules/fusion-workbench-conventions.md:180-181` (the persisted-output clause)
**Cross-references:** `260807-2024_*_two-language-declarations.md`; `260807-1515_*_wie-weit-reicht-die-projektsprache-in-den-regelkorpus.md`

---

## The defect

The new rule assigns a language by surface, and names the persisted surfaces explicitly:

```
rules/fusion-workbench-conventions.md:181
  Output that persists as a file — specs and plans, defect and decision records, session
  histories, reviews, analyses, memos, the portfolio and the task queue — is written in
  the **artifact language**.
```

`bin/fusion-rules` carries `ARTIFACT_LANG` to exactly one place:

```
bin/fusion-rules:401   emit_voice_profile "chat-voice"    "$CHAT_LANG"      # all 16 agents
bin/fusion-rules:409   if [ "$IS_PROSE_AGENT" -eq 1 ]; then
bin/fusion-rules:410     emit_voice_profile "default-voice" "$ARTIFACT_LANG"  # 9 agents
```

`IS_PROSE_AGENT` is the nine at `:196`. The other seven — `coder`, `coderev`, `ontocoder`,
`ontorev`, `bugfixer`, `taskplanner`, `reconciler` — receive exactly one profile path, in
the **chat** language, and no signal at all naming the artifact language.

Those seven are not marginal producers of persisted artifacts. Against the list at
`:181`: `coderev` and `ontorev` write **reviews**, all seven file **defect records**,
`taskplanner` owns the **task queue**, `reconciler` rewrites **status and progress notes**
across plans and issues, and every one of them writes a **session history** entry. In a
project declaring `**Language:** de` + `**Artifact language:** en`, each of those agents is
handed `chat-voice-de.yaml` and nothing else, then asked to produce English files.

## Why the rule text does not close it on its own

Two candidate carriers exist and neither reaches:

- **`rules/fusion-workbench-conventions.md` `## Project language`** is emitted to all
  sixteen and states the boundary. It never instructs an agent to *read* either
  declaration — it describes which surface takes which language, not where to look up what
  that language is.
- **`rules/agent-setup.md:52-56`**, the new paragraph, is written entirely for the
  two-path case:

  > The two paths may name **different languages** — the chat profile resolves from the
  > project's chat language, the writing profile from its artifact language.

  An agent that receives one path reads that paragraph as not applying to it. Nothing tells
  it that its single path names the language of its *chat only*, and that its files take a
  language it must go and find.

The residual mechanism is that every agent's Setup step 3 reads `CLAUDE.md` and might
notice a second line. That is inference from an unrelated step, not a contract. It is also
the exact class of failure `rules/critical-stance.md` warns about: a rule that holds
because a reader happened to connect two documents.

## Observed

This review was dispatched with a hand-written preamble, "**Write your review in
English**", supplied by the user rather than by the mechanism. That is a single data point
and not proof of a systematic failure, but it is what the gap predicts.

## Fix directions

**a. Say it in `agent-setup.md` (cheapest, no code).** Add a sentence to `## Voice
profiles` addressed to the single-path case: your chat profile names the chat language; the
files you write take the artifact language, declared in `CLAUDE.md` as
`**Artifact language:**` and defaulting to the chat language when absent — read it.

**b. Emit the artifact language explicitly.** `bin/fusion-rules` already knows
`ARTIFACT_LANG`. It currently has no way to say a non-path fact, since its whole output
contract is "one file path or `skill:` pointer per line" (`rules/agent-setup.md:14-16`), so
this needs a new line kind and a change to every consumer's reading contract. Larger than
the problem, and it is noted here only so the option is on the record rather than
rediscovered.

**c. Widen `IS_PROSE_AGENT`.** Rejected on inspection: the writing profile carries
sentence-length bands and a consulting register that are wrong for a defect record or a
task queue, which is why `rules/user-facing-output.md:23` forbids applying it outside
long-form prose. Handing `default-voice-*.yaml` to `taskplanner` would fix the language
signal by breaking the style one.

(a) is the recommendation. It costs four lines and puts the instruction on the one document
every agent provably reads before it writes anything.

---
Resolved: Fixed in Turn 2 of session 260807-2020-orchestrator-session.md as a rule-text change, per the recommendation.
`rules/agent-setup.md` `## Voice profiles` now tells an agent holding only the chat path that this
does not exempt it from the artifact language: the files it writes persist, no profile it holds
names their language, and the declarations in `CLAUDE.md` are where it resolves that. The paragraph
points at `rules/fusion-workbench-conventions.md` `## Project language` rather than restating it.
`IS_PROSE_AGENT` was deliberately not widened; the executing coder checked that direction and
confirmed the reasoning in this record, that the long-form profile's sentence-length bands and
consulting register are wrong for a task queue or a defect record.
