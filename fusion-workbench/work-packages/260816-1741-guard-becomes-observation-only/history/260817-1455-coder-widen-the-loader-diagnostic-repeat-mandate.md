# coder — widen the loader-diagnostic repeat mandate

**Status:** Complete
**Date:** 2026-08-17
**Circle:** 260816-1741-guard-becomes-observation-only
**Task:** fix issue `260816-2318_*_the-retired-file-diagnostics-one-chat-visible-channel-is-a-repeat-mandate-scoped-to-dropped-keys.md` against shipped v10.0.0 (goes out as v10.0.1)

## What changed

- `agents/orchestrator.md:132` — the Setup Step 2 Turn-budget paragraph. Its antecedent was
  "anything the configuration loader had to drop", narrowed further by an em-dash clause to a
  bad `maxTurns` value, and closed on that one case. It is now "every diagnostic the
  configuration loader returned", with the mandate to repeat all of them, and it names the four
  diagnostic classes the loader can actually produce. +557 bytes.
- `skills/setup/SKILL.md:292` — the inherited narrowing. Its "Report the value, or the fact that
  it did not resolve and why" enumeration omitted diagnostics that arrive while the budget
  resolves; it now names the stderr lines. +140 bytes.
- `hooks/lib/__tests__/fixtures/surface-growth.golden` — regenerated for the two size changes.
  No baseline moved.

## Why the mechanism, not the record, set the scope

The record proposed widening to "anything on stderr" and naming the retired file. Reading
`hooks/lib/config.ts` gives four producers, not two: `RETIRED_PROJECT_FILES`,
`RETIRED_TOP_LEVEL_KEYS`, the unparseable/non-object file in `readLayer`, and the leaf-rule drop.
A mandate naming only the retired file would have reproduced the original defect one member
later. The new text is written so that the *rule* is the antecedent and the four are examples.

## Still open, deliberately

The record's unrecorded question — "does a project that never runs Setup need to hear this?" —
is unrecorded still. It decides whether `guard_advisory` needs a second consumer beyond the
monitor's warnings panel, which is a mechanism change and out of scope for a patch against
shipped text. This agent holds no `$OUT_DECISION` key and did not file it; recommended to the
orchestrator.

## Verification

`npm test` in `hooks/` — exit 0. 35 files, 653 tests passed.
