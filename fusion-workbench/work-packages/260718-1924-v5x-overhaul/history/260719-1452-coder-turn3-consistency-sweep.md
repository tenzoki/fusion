# History: Circle E-rest Turn 3 — consistency sweep

**Agent:** coder
**Status:** Complete

## Part 1 — three filed issues fixed + closed (_o_ → _c_)

1. `260719-1436` — CLAUDE.md:47 "seven prose agents" → "nine". Verified vs `bin/fusion-rules:132` (IS_PROSE_AGENT: orchestrator, consultant, shaper, planner, analyst, investigator, playmaker, conceptrev, editor = nine).
2. `260719-1441…investigator-mislisted` — README-agents.md pattern table: removed `investigator` from the conventions-only row; added `investigator | *investigator* | rules/investigator-capture-layout.md` row. Verified vs `bin/fusion-rules:120` (`PATTERNS="investigator"`).
3. `260719-1441…broken-philosophy-section5-xref` — README-agents.md:86 "docs/philosophy.md §5" → "docs/working-model.md (the gates, Coherence Review, and Rebalance model)". Verified philosophy.md has no numbered sections; working-model.md §3 "The gates" is the current home.

## Part 2 — grep sweep

- Bracket markers: all hits in migrate/setup skills (describe the old form they convert) — legitimate.
- Agent counts: README.md:3 + CLAUDE.md:9 "16 specialized agents" correct; CLAUDE.md:102 "12 agents" is a historical v2.8.1 statement — legitimate.
- Test/rule counts: CLAUDE.md:32 "the three load-bearing ideas" stale — philosophy.md now has five numbered ideas. Fixed on the same line (dropped the stale number; also added `working-model.md` to the docs/ enumeration, which was missing since Turn 1). Align-only.
- Review dirs: README-agents.md:21 "three former review folders" + migrate skill — legitimate historical/merged mentions.
- Bus protocol: CLAUDE.md:56 describes its v3.15.0 removal — legitimate.

## Part 3 — README-hooks.md

Clean, zero edits.

## New defect filed (out of scope — code file)

`260719-1452` — `bin/fusion-rules:129` comment "The eight agents below" but IS_PROSE_AGENT lists nine. Filed for follow-up (coder Turn-3 scope excludes code).

## Verify

- `claude plugin validate .` — passed (only the pre-existing benign CLAUDE.md-at-root warning).
- `npm test` (hooks/) — 261 passed.
