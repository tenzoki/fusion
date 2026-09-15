# Reference-resolution pin re-approval log — the two 2026-09-09 entries

**Date:** 2026-09-15 20:06
**Type:** Rolled log
**Rolled by:** coder, Kai Stalmann <ks@qantr.com>

Rolled verbatim out of `hooks/lib/__tests__/reference-resolution-lint.test.ts`, per the roll mechanism its own
header prescribes: the entries accumulate in a file whose growth bound measures **by the line**, so older ones
move here rather than being dropped (`260822-1229`, option 2; the never-drop rule and what enforced it are in
`260904-2044_*_two-pin-re-approval-entries-were-dropped-instead-of-rolled-into-the-log-the-header-prescribes.md`).
These two paid for the entry recording the re-approval at which `**Active spec/plan:**` entered the work-item
grammar, on a surface standing at zero margin.

## The entries, verbatim

Re-approved 2026-09-09 (the v10.26.0 release, not a step of any plan): paths 1721 -> 1728, anchors and stampBare unmoved. Seven tokens, each measured per file with the gate's own PLUGIN_PATH_RE rather than by subtraction, because an existence check makes the files interact. Four are in the new `docs/upgrading-to-v10-26.md`: `bin/fusion-turn-budget` and `rules/bounded-dispatch.md` once each, `bin/fusion-events` twice (the section heading and the prose beside the invocation block). Two are the new `**Upgrading from v10.25?**` block in `README.md`: `bin/fusion-events` and `docs/upgrading-to-v10-26.md`. One is `bin/fusion-events` in the new release paragraph of `skills/help/SKILL.md`'s update topic; that topic's two `$FUSION_SRC/`-rooted doc citations cancel, the v10.26 note arriving as the v10.23 note leaves with the oldest of the three paragraphs.

Re-approved 2026-09-09 (Circle 260909-1700 step B2, the dispatch gate widens from orchestrator-scoped to project-scoped): paths 1728 -> 1729, anchors and stampBare unmoved. The one new token is `hooks/lib/orchestrator-events.ts`, cited on a comment line of `bin/fusion-commit-lock` where the rewritten `emit_commit_event` header names the module whose `eventRowsAdmitted` the script's own two-armed condition now mirrors. Single-file revert against HEAD is the whole measurement and leaves no residue: with `bin/fusion-commit-lock` alone reverted the gate resolves 1728/253/14 and every case passes, so no share is owed to any other file this step touched. The step's four other changed files cannot reach this pin by construction rather than by arithmetic, which is worth writing down once so the next re-approver does not re-measure them: `hooks/guard.ts`, `hooks/tracker.ts` and `hooks/lib/orchestrator-events.ts` are scanned `recordsOnly`, so the plugin paths their rewritten comments carry are not class (a) at all; `hooks/lib/__tests__/guard-state-shape.test.ts`, `helpers/guard-harness.ts` and `fusion-commit-lock.test.ts` sit under a directory `surface()` never descends into. No anchor moves with the token: a backtick closes it and no heading follows. One growth golden moved and no baseline did: `fixtures/surface-growth.golden` was regenerated in the same edit (hook tests 22 992 -> 23 257 lines, through `guard-state-shape.test.ts` 215 -> 351, `helpers/guard-harness.ts` 970 -> 1070, `fusion-commit-lock.test.ts` 424 -> 452 and this entry's own single line in this file, 1006 -> 1007), which is inside that surface's own 2 500 of head-room; `fixtures/rules-emission.golden` is untouched, no always-on rule file, `agents/` file or skill body being in scope for this step.
