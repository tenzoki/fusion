# Shaper session — normative-surface consolidation

**Date:** 2026-08-01 11:22
**Agent:** shaper (user-direct mode)
**Output:** `260801-1122_*_spec-normative-consolidation.md`

## Request

Specify a new fusion capability that consolidates the three normative surfaces that drift and bloat as a project runs: decision records, rule files, and `CLAUDE.md`. Two settled decisions were passed in as inputs and not reopened — D1 (a writing consolidation agent, not a report-only detector) and D2 (rule-file writes permitted via `FUSION_ALLOW_RULES_WRITE` plus project-level guard config).

## What was read

- `260801-1020-normative-surface-drift-gap-analysis.md` in full
- `260801-1020_*_where-does-normative-consistency-live.md`, `..._a_may-any-fusion-writer-touch-rules.md`, `..._o_provenance-header-on-rule-files.md`
- `260801-0936-orchestrator-session.md` `## Design decisions (session, 260801)`
- `skills/revise-claude-md/SKILL.md`, `skills/cleanup/SKILL.md` (steps 3-7), `agents/reconciler.md`
- `rules/context-manifest.md`, `rules/context-lean-claude-md.md`, `rules/fusion-workbench-conventions.md:220-399`
- `hooks/guard.ts:60-340`, `hooks/lib/config.ts`, `hooks/config.json`, `bin/fusion-rules:145-305`

## Verifications performed during shaping

- `bin/fusion-rules` `emit_pattern_in_dir` globs `"$dir"/*"$pat"*.md` and never reads content. A filename state marker on a rule file therefore does **not** remove it from the emitted set — `_s_coding-hygiene.md` still matches `*coding*`. This is what forced C4's retirement-by-relocation design rather than a marker vocabulary.
- `git ls-files fusion-workbench/` returns 0. `.gitignore:50` is a commented-out ignore rule. Decision records have no git undo, which forced C6's requirement that the agent record pre-edit content of every modified decision record.
- `rules/` is 107810 bytes across 9 files; `CLAUDE.md` is 28 kB. Both are git-tracked. The user's stated figures check out.
- No override helper named `overridesFromEnv` is exported from any file under `hooks/lib/` reachable by grep; the only references are in `hooks/guard.ts:37,155` and `hooks/lib/__tests__/git-branch-guard.test.ts`. The planner should confirm where it actually lives before extending it.

## Clarification channel

No `AskUserQuestion` tool was available on this run, so the clarification loop could not run interactively. Eight decisions that are genuinely the user's were written into the spec as **proposed defaults, explicitly marked**, and batched into the spec's `## User Decisions Pending` section (D-a through D-h) with 2-4 concrete alternatives each. None was decided silently.

## Capabilities specified

C1 agent remit and boundaries; C2 history-grounded justification (three evidence tiers, seven sources); C3 cross-surface contradiction detection (six pairs, unresolvable conflicts become `_o_` decision records); C4 rule-file lifecycle by relocation; C5 the two guard changes; C6 review gate, revert path, wrong-prune detection; C7 invocation and cadence.

## Nothing filed

No new issues or decision records. The four issues and three decisions the gap analysis filed already cover everything encountered, and all seven were read before shaping to avoid a refile.
