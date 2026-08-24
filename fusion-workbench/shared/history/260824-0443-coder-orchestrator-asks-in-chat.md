# The orchestrator asks in chat, and the dialog is banned outright

**Agent:** coder
**Trigger:** user, direct
**Date:** 2026-08-24 04:43

## What was asked

The user has twice lost a long typed answer to the `AskUserQuestion` dialog and asked for the
orchestrator prompt to be changed so that it never presents one, and asks in the chat instead.

## What changed

`agents/orchestrator.md`, one new section and eight rewritten passages.

**The rule is authored once**, in a new `## How you ask the user anything` placed immediately
before `## Setup`, so a reader meets it before the first step that asks anything. It states the ban
without an exception (no gate, no phase, no one-option confirmation), gives the replacement shape —
question on one line, numbered plain-English options beneath it, answer by number or by words or by
anything else the user wants to type, then stop and wait — and cites the eight-line gate cap in
`rules/user-facing-output.md` `## Length` as unchanged by the surface swap. Its closing sentence
binds every later step: wherever a step says to ask, to offer, to present a choice or to run a gate,
this is the shape it means. That is what keeps the eight rewritten sites from having to each restate
the rule.

**The eight sites.** Setup Step 1's schema-mismatch offer and its interrupted-session question; the
two statements that a dispatched shaper cannot reach the user, reworded from "does not receive
`AskUserQuestion`" to "cannot put a question to the user at all", which is the same fact stated
without naming the surface; the Coherence gate's skip clause and its presentation clause, whose
"users in flow press once" became "answer in one word"; the Unresolved-budget check-in; the Revise
Grounding sub-flow; the gate interaction pattern's option line, which now says the options are put
as a numbered list and points at the new section; and the two `## Output Style` sentences that
enumerated `AskUserQuestion` text among the governed surfaces.

After the edit the token appears twice in the file: in the ban itself, and in the frontmatter
`tools:` allowlist, which was left alone. See **What was not done**.

## What was not done, and why it is the user's call

**The `tools:` grant still lists `AskUserQuestion`.** Removing it would make the ban mechanical
rather than textual. Two things argue against doing it unasked. It is a behaviour change beyond the
prompt the user named; and the orchestrator's allowlist is the one place a tool grant is written for
sub-agents and, on the evidence of `CLAUDE.md`'s troubleshooting row for v3.0.1, possibly not for
skill bodies invoked from the session — that row reports the skill path working while the agent
itself was denied, which is evidence about one direction and not proof about the other. A wrong
guess here breaks `/fusion:setup`'s interrupted-session prompt mid-session.

**The skill bodies still ask with dialogs.** `/fusion:setup`, `/fusion:next`, `/fusion:cleanup`,
`/fusion:direct` and `/fusion:migrate` each carry `AskUserQuestion` in `allowed-tools` and present
dialogs of their own. The user named the orchestrator; the skills are a second shipped surface with
its own growth bound, and sweeping them was not authorised by this request.

Both were put back to the user in chat.

## Verification

`cd hooks && npm test` — exit 0, 724 tests, 41 files.

Two gates moved and both were re-approved rather than widened:

- `reference-resolution-lint.test.ts` `BASELINE` went `paths: 1294 -> 1295`, `anchors: 180 -> 181`.
  That is exactly the one new citation the new section adds, `rules/user-facing-output.md`
  `## Length` — one path, one anchor. `records` did not move; no record citation was added or lost.
- `fixtures/surface-growth.golden` was regenerated with `UPDATE_SURFACE_GOLDEN=1`, per its own
  header. `agents/orchestrator.md` 152 125 -> 153 206 bytes, the surface total 403 056 -> 404 137.
  The growth bound itself never failed: +1 081 bytes sits inside the 18 000 of head-room `agents/`
  gets, so no baseline moved and none was touched.

`bin/fusion-prose-metric agents/orchestrator.md` reads `over`: 293 em-dashes over 21 390 prose words,
13.7 per 1000 against a ceiling of one, which permits 21 in the whole file. That verdict predates
this edit by hundreds of instances and the added text does not change the file's character. The
metric reports and gates nothing, and no exit code carries the verdict.

## Status

Complete.
