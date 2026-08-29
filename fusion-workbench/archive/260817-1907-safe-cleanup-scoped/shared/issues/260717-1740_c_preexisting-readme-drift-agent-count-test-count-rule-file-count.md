Pre-existing README drift: agent count, test count, rule-file count

---
Three stale statements in the READMEs, none caused by the workbench restructure. Surfaced by `coder` during task P-11 while updating layout docs; left unfixed because they were out of that task's scope.

1. **`README.md` says "14 specialized agents"** (lines 3 and 11) and its agents tree (~lines 12-25) omits `conceptrev`. There are **15**. Drift dates from v3.24.0 when conceptrev was added; the plugin.json and CLAUDE.md were updated then, the README was not.

2. **`README.md` hooks tree** (~line 57) says `lib/__tests__/ # 30 tests`. It is now **173 tests across 8 files**. Most of that gap predates the restructure (the restructure added the path-lint test, one of eight files). A hooks-internal count, not a layout description.

3. **`README-agents.md:150` says "The plugin ships exactly one rule file"** — stale, and self-contradicting: line 171 of the same file names `design-diagrams.md`. The plugin now ships `fusion-workbench-conventions.md`, `decision-record-examples.md`, `user-facing-output.md`, `critical-stance.md`, `design-diagrams.md`, plus the stilwerk voice profiles. Pre-existing.

---
All three are cosmetic doc drift, low priority. Grouped because they are the same class (a count that fell behind reality) and would be fixed in one README-hygiene pass. Found during P-11; the restructure's own doc changes are correct and already committed in `cb5fa80`.
Source: P-11 (260716-1910[p]-plan-workbench-umbau-circle-container.md)

---
Resolved (Circle E-rest reconciliation, 260719): all three items verified fixed on disk.
- Item 1 (agent count): `README.md:3` now reads "16 specialized agents"; the "14" / conceptrev-omitted drift is gone. Fixed in the README.md rewrite (`43ee3b5`) + E-rest alignment.
- Item 2 (test count): the `lib/__tests__/ # 30 tests` annotation no longer exists in `README.md` (grep for `__tests__`/`# … tests` returns no hooks-tree line); removed in the README.md rewrite (`43ee3b5`).
- Item 3 (rule-file count): `grep 'exactly one rule' README*.md` returns nothing — the "exactly one rule file" claim was replaced in `README-agents.md` by the always-on + pattern-matched rule-set description (commit `f5d79aa`, E-rest Turn 2). Item 3 was the live one folded into the E-rest plan's README-agents audit.
Plan `260719-1416_*_plan-circle-e-rest-docs-cleanup-v5-close.md` line 58 flagged this issue as closable once E-rest landed; it has.
