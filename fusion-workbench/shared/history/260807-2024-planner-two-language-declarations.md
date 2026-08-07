# Planner — split the language declaration into chat language and artifact language

**Date:** 260807-2024
**Agent:** planner (dispatched, non-interactive)
**Directive:** user, 260807-2024 — split fusion's single `**Language:**` declaration in two so chat language and persisted-artifact language resolve independently, and make `bin/fusion-rules` honour the split.
**Plan:** `shared/planning/260807-2024_o_two-language-declarations.md`
**Input decision:** `shared/decisions/260807-1515_a_wie-weit-reicht-die-projektsprache-in-den-regelkorpus.md` (answered by the user 260807-1925)

## What was planned

Twelve steps, eleven for `coder` and one for `ontocoder`, ordered by dependency. The
label chosen for the second declaration is `**Artifact language:**`; five alternatives were
considered and the reasons for rejecting each are in the plan's Approach section. The
resolution contract is one rule with no special cases: the chat code defaults to `en`, the
artifact code defaults to the chat code, and a line that is absent, unparseable or carries
an unsupported value collapses into a single "not declared" branch.

`resolve_lang_code()` is parameterised rather than duplicated — the extraction regex is
shared, the two defaults move to the call sites where they sit side by side.
`emit_voice_profile()` takes the resolved code as an argument instead of resolving one
itself.

## What the Directive's scope list did not name, and this plan adds

- **`agents/planner.md:146`** makes the same false head-label claim as
  `rules/critical-stance.md:65` — the file carrying the template and the file defining the
  norm would otherwise disagree after the fix. Step S5 covers both.
- **`rules/agent-setup.md` `## Voice profiles`** tells every agent to read both emitted
  profiles and says nothing about them resolving to different languages. Without a
  sentence there, the first agent to meet `chat-voice-de.yaml` beside
  `default-voice-en.yaml` has no rule saying that is intended. Step S6.
- **Structured-data work exists**, contrary to the Directive's expectation. Six lines
  across `stilwerk/chat-voice-{de,en}.yaml` name their long-form sibling by filename
  (`default-voice-<same-lang>.yaml`), which is wrong for any project whose two declarations
  differ — this repository's own configuration. The workbench copies are byte-identical
  (verified with `diff`) and both sets are read. Step S8, `ontocoder`.
- **`README.md:117` and `rules/context-lean-claude-md.md:39-40`** both describe the single
  line to a user setting up a project. Step S9.
- **The emission golden must be regenerated** — S1, S5 and S6 change four always-on rule
  files' byte sizes, so every agent's total moves. Step S10, with the documented two-run
  procedure and an explicit instruction not to touch `RULE_BASELINE`.

## Measurements taken

- `bin/fusion-rules` is the only reader of the declaration. Verified by grep across
  `rules/`, `agents/`, `skills/`, `hooks/`, `bin/`, `docs/`, `templates/` and the READMEs.
  `bin/fusion-paths` does not read it.
- All nine skill citations of `**Language:**` are chat surface (`AskUserQuestion` prompts,
  confirmations), so they need no change.
- No test covers the language resolution today. `rules-emission-golden.test.ts` runs from
  an empty temp directory with no `CLAUDE.md`, so no profile path is ever emitted; its
  header calls the profiles "deliberately out of scope".
- Label collision checked against a two-line fixture: `^\*\*Language:\*\* *[a-z]{2}`
  matches only the first line, `^\*\*Artifact language:\*\* *[a-z]{2}` only the second.
- `hooks/lib/__tests__/derivable-enumerations-lint.test.ts` parses no language claim, so
  the `CLAUDE.md` bullet edit is free of it.

## Human gate raised

Step S1 is marked as needing a human gate. The answered decision's general clause puts
everything that persists as a file in English, which makes the dashboard
(`orchestrator-live.md`) and the monitor strings English. The precedent is strong — commit
messages are the same class of persisted-but-user-facing surface and the answer names them
explicitly — but a dashboard the user watches live is the one place where "persists as a
file" and "direct user interaction" genuinely overlap. The plan is written to the
persisted-therefore-artifact-language reading; if the user reads it the other way, S1's
exempt-surface point inverts and nothing else moves.

## Not done

No code, rule text or data was changed. The plan is the deliverable; execution waits on the
user.
