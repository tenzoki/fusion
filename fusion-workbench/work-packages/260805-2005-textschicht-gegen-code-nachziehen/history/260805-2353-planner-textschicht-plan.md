# Planner session: implementation plan for the text-layer Circle

**Date:** 2026-08-05 23:53
**Agent:** planner
**Status:** Complete

## What was done

Planned the active Circle `260805-2005-textschicht-gegen-code-nachziehen` against its own record as the spec (Directive + full Grounding snapshot; no separate spec file). Read the three source reports in the neighbour Circle `260801-1244-guard-rules-write` (purpose/usage analysis 260805-1830, doc-vs-code audit 260805-1840, full plugin review 260805-1905-coderev-gesamtreview-plugin-v5-9-1.md) and verified the key code locations in the working tree before writing steps: `bin/fusion-rules` (`set -eu` + `emit_if_exists`, always-on block 328–334, awk escapes ~452, `IS_GUARD_INTERNALS_AGENT` 365–367), `skills/archive/SKILL.md:48` (`shared_of`), `skills/setup/SKILL.md:41` (bracket probe), `hooks/lib/self-detect.ts`, `hooks/lib/paths.ts:72`, the four precedent lints and the emission golden's header (regeneration procedure, `RELEASE_CAP = 105 354`).

## Output

`260805-2353_*_plan-textschicht-gegen-code.md` — 17 steps in three tracks:

- Track 2 (steps 1–3): file the three decision records (citation form D1, activation ownership + lock rule D2, self-detect staleness D3) in the Circle's decision store; one user gate answers all three. D1 blocks the reference lint and every citation correction, per the review's ordering argument.
- Track 1 (steps 4–7): the four code fixes, decision-independent, `shared_of` zsh fix first (silent data loss, inherited ungated by cleanup).
- Step 8: `protected-path-internals.md` emission gated on plugin-repo self-detection; deliberate golden regeneration; brings three of four over-cap roles under the release cap.
- Track 3 (steps 9–16): D2 realisation, three correction batches by file group (rules/, CLAUDE.md+READMEs, skills+bin+install+templates with one ontocoder item for the plane template YAML), the two content corrections plus the High finding's text amendment, then reference lint (5th) and derivable-enumerations lint (6th) landing only on a clean tree so the suite stays green, then D3 realisation.
- Step 17: bookkeeping — close resolved findings in place in the neighbour Circle's issue store with Resolved footers citing this Circle's commits; ten records explicitly stay open (out of scope or routed elsewhere).

Executors: coder throughout, ontocoder for one YAML template item. No decision records were filed by this session (planner's resolved key set carries no decision-store write target); the plan makes filing them its first three steps.

## Notes

- Voice profiles loaded: chat-voice-en, default-voice-en (both emitted; language defaults to en).
- Zero open decision records found across `$SCAN_DECISIONS` (Circle store empty; shared store holds only answered/implemented records) — consistent with the playmaker snapshot cited in the Circle record.
- The plan carries a Mermaid dependency DAG; conceptrev pass pending at the plan gate.
