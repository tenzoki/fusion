# coder — provenance prose fixes (Turn 2, task T2-B)

**Status:** Complete
**Circle:** `circles/260801-1244-rule-provenance-header`
**Scope:** prose half of two review findings; the test-file half landed in `cc004fc` (T2-A).

## What I changed

**`rules/fusion-workbench-conventions.md:5`** (issue `260802-1251_p_conventions-lede-scope-...`).
The lede scoped the whole file to agents operating on `fusion-workbench/` and enumerated
eight subjects, neither of which covered `## Provenance headers on rule files` — the one
section that governs files outside the workbench. Extended the scope clause to "and for the
rule files those agents load" (which is exactly the three roots `bin/fusion-rules` reads:
the plugin's `rules/`, a project's `./rules/`, a project's `.claude/rules/`) and added
provenance headers as the ninth enumerated subject. No other claim in the lede touched.

**`CLAUDE.md:30`**, the layout-table row for the same file, carried the same stale
enumeration. Added the provenance-header subject and the parenthetical naming it as the one
subject the file governs outside `fusion-workbench/`, so the row states the exception rather
than leaving a reader to rediscover it.

**`rules/fusion-workbench-conventions.md:572`** (issue `260802-1253_p_the-line-8-blockquote-...`).
The ten-line window's rationale said the longest opening blockquote "runs to line 8 in
`context-manifest.md`, with one line to spare" — false in the commit that wrote it, because
Turn 1's own two-line header insertion pushed that blockquote down. Rewrote it as the past
sizing decision it was, plus the current bound as it actually is: blockquote now at 5-10,
window ends exactly where the corpus's longest lede ends, an after-the-lede header in that
file would land at 12 and no longer fit, margin is zero and costs nothing because every file
puts its header above the lede at line 3. Also removed the now-false sentence claiming the
window is wide enough to carry a header after a blockquote lede — that was the same error in
a different clause, and the issue's residual note flagged it.

Measured, not asserted: `context-manifest.md` 5-10, `context-lean-claude-md.md` 5-9 (the
runner-up), every other rule file has no opening blockquote.

## Consistency

The rationale now lives in two places: this section and the `HEADER_WINDOW` comment at
`hooks/lib/__tests__/provenance-header-lint.test.ts:59-69`. Same numbers, same shape of
argument (past sizing / current bound / why zero margin is fine). I did not touch the test
file — T2-A owns it and it is committed.

## Verification

- `cd hooks && npm test` → 780 passed, 17 files. The provenance gate reads this file, so a
  prose edit could in principle have broken it; it did not.
- `git diff --numstat` → `CLAUDE.md` 1/1, `rules/fusion-workbench-conventions.md` 2/2. All
  four are the three lines I meant plus their replacements.
- `git status --porcelain` outside `fusion-workbench/` → exactly those two paths.

Not committed — orchestrator commits. Issue files left open; orchestrator closes them.
