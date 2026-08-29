# Reference-resolution baseline re-approval — 260825-1701-reference-baseline-reapproval.md

---
**Status:** Complete.
**Date:** 2026-08-25
**HEAD read:** `3d4b1816a2397a4a351ae11a319e0143e6fd078a` (plugin.json 10.7.0), plus the session's uncommitted `CLAUDE.md` and workbench records.
**Dispatched by:** the session orchestrator, as a one-line baseline re-approval.
**Domain:** code
**Filed by:** coder, Kai Stalmann <ks@qantr.com>

**What changed.** One line, one number. `BASELINE` in `hooks/lib/__tests__/reference-resolution-lint.test.ts:479` moved from `paths: 1374` to `paths: 1376`. `anchors: 192` was already correct and was left untouched, as was the assertion, the lint itself and every other file. The trailing comment on that line, which narrates the previous re-approvals, was not extended: the dispatch scoped the edit to the number alone, and the comment sits on the same line as the constant that the gate's own failure message tells a re-approver to write.

**Why the number moved, checked rather than assumed.** The failing assertion reported received `{ paths: 1376, anchors: 192 }` against the pinned `1374`, so the delta is exactly two and it is in the path class alone. The resolution half of the gate stayed green throughout, which means both new references resolve and no reference stopped resolving. The cause is this session's curator pass, `260825-1453-curator-run.md`, whose three approved edits touched `CLAUDE.md` lines 37, 55 and 67. The `git diff` confirms all three: the `bin/fusion-source-root` row traded a fixed list of four skill bodies for the command that enumerates them, gaining `skills/` and `skills/archive/SKILL.md`; the `docs/` row gained a pointer to `skills/help/SKILL.md`'s update topic; the guard-rule bullet changed "those three files" to "those files" and moved no path. The per-line attribution sums to one more than the measured delta, so at least one added spelling was already counted in its file. That residual was not chased: the pin measures the corpus total, the total moved by two, and the resolution half proves nothing left scope silently, which is the failure the pin exists to catch.

**Verification.** `cd hooks && npm test` returned exit 0 with 760 of 760 tests passing across 43 files, which is the count the dispatch predicted. The single failure at the start of the run was this assertion and nothing else; no second edit was needed to reach green, so the diagnosis handed over with the task holds.

**Not committed.** `/fusion:cleanup` commits at its Step 7.
