# Shaper run: anticipated Circle from the draft "Zitierkonvention ohne Store-Segment"

**Date:** 2026-08-28 23:42
**Mode:** anticipated-circle (dispatched by `/fusion:direct`, second round with answers)
**Filed by:** shaper, Kai Stalmann <ks@qantr.com>

## Draft

Implement the five answered decisions `shared/decisions/260828-0904_*` (storeless citation form, archived-record question moot, uniqueness claim scoped and pinned, shipped citations are provenance, a `bin/fusion-citation-check` helper): rule text, uniqueness test, the `$SCAN_*` prompt lines plus a lint, the archive safety filter, the three gates, the helper, a sweep of the old form. Grounding: the consumer report `shared/issues/260828-0828_*` and the analysis `shared/analyses/260828-0859-*`.

## Clarifications (round 1, answered)

1. Sweep reach: everything including `archive/`.
2. Store-prefixed form after the sweep: a violation; gates and helper report it as an error.
3. Bare stamps in shipped text: rewritten to the full form so the reference-resolution gate judges them.
4. Helper coverage in a consumer: workbench plus `CLAUDE.md`, `rules/`, `.claude/rules/`, `docs/`; `/fusion:cleanup` prints the verdict line.

No decision was deferred; no decision record filed. The draft was not a backlog entry; nothing in `shared/backlog/` was closed.

## Result

Circle `circles/260828-2342-citation-form-drops-store-segment/`, record `_a_circle.md`. The Grounding snapshot carries the corrected count of `$SCAN_*` self-citations (twenty-one at HEAD `7bc0e78e`, after two undercounts) and names the growth bounds and the one-release-behind helper cost as constraints for the planner.
