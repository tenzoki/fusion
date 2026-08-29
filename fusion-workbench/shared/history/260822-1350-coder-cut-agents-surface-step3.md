# Step 3 of plan C0 — `agents/*.md` gives back 14 963 bytes

**Date:** 2026-08-22
**Agent:** coder
**Status:** Complete
**Source:** `260822-1154_*_plan-c0-cut-only-circle-buys-head-room-on-four-bounded-surfaces.md`, step 3
**Ledger:** `260822-1226-cut-ledger-for-three-bounded-surfaces.md`, its `agents/` section

## What changed

Two sources, and they are different kinds of saving.

**Deletions, 6 069 bytes across all fifteen prompts.** The five restatement rows of the ledger.
Each removed sentence is replaced by a citation of the file that already authors the claim, and
every one of those files is always-on, so the claim reaches the agent either way.

| Row | What left | Where the claim is authored now |
|---|---|---|
| A1 | The chat-profile parenthetical in the voice block, 8 prompts | `rules/user-facing-output.md` `## Style anti-patterns apply to everything` |
| A2 | "It catches the recurring failure…", 7 prompts | `rules/user-facing-output.md` `## Self-review before sending: the readability gate` |
| A3 | The effort-estimate bullet, 8 prompts | `rules/user-facing-output.md` `## Effort estimates` |
| A4 | The clause after the citation in the Output Style opener, 15 prompts | `rules/user-facing-output.md` |
| A5 | "subject to the stylometric profile loaded at Setup", 8 prompts | `rules/agent-setup.md` `## Voice profiles` |

A2 covers seven prompts rather than the ledger's six: `agents/editor.md` carried a shortened variant
of the same sentence, and leaving one copy standing is the failure the row exists to close.

**One relocation, 8 894 bytes out of two prompts.** The reviewer contract — the two mandated header
fields, the worked examples, the `bin/fusion-review-coverage` self-check, the per-topic working
files and the final consolidated review — left `agents/coderev.md` and `agents/ontorev.md` for the
new `rules/review-contract.md`, emitted to those two agents and to nobody else. This is not a
removal. The two reviewers load the same text at Setup, byte for byte; what falls is the measured
surface, not their context. The user accepted it on that statement at Gate A, and the record is
`260822-1330_*_where-does-the-reviewer-contract-live-when-the-agents-surface-has-to-give-back-bytes.md`.

## Measurements

| Surface | Before | After |
|---|---|---|
| `agents/*.md` head-room | 1 638 bytes | 16 601 bytes |
| Always-on rule core head-room | 3 509 bytes | 3 509 bytes |
| Hook test suite head-room | 513 lines | 472 lines |

`AGENT_BASELINE`, `SKILL_BASELINE`, `TEST_LINE_BASELINE` and `RULE_BASELINE` are byte-identical to
HEAD `5afb910`, confirmed by diffing each map against `git show HEAD:<file>`.

## Verification

`cd hooks && npm test` — exit 0, 715 tests in 40 files. `claude plugin validate .` passes with the
one standing CLAUDE.md warning.
