The workbench citation lint's positive control requires an open issue on disk, so a clean workbench fails it
---
`hooks/lib/__tests__/workbench-citation-lint.test.ts:293` asserts "at least one open issue is selected" by walking the real workbench for an `_o_`/`_p_` issue and putting it to the corpus predicate. The control was meant to prove that `OPEN_ISSUE_RE` admits open issues; what it proves instead is that the repository currently carries one. This Circle's Directive is that it does not, and with the last two closures in the working tree the suite reads 759/760 with that one failure. The test is wrong, not the tree: a positive control belongs to a fixture the test owns, not to the state of the repository it lints.
---
**Filed by:** coder
**Attribution backfilled 260825 (not written by the filing agent):** `coder` filed this record; the person half of `**Filed by:**` is absent because the installed plugin at `$FUSION_PLUGIN_ROOT` carried no `bin/fusion-identity` at that time. See `shared/issues/260825-1329_*_every-session-runs-one-release-behind-on-a-bin-helper-the-same-repository-just-added.md`.
**Severity:** Medium
**Domain:** code
**Affects:** `hooks/lib/__tests__/workbench-citation-lint.test.ts`
**Cross-references:** plan `circles/260824-1853-close-every-open-defect/planning/260824-1905_p_plan-close-every-open-defect.md` (the Directive this control contradicts)

Attribution: the person half of `Filed by:` is absent because the installed plugin copy (`$FUSION_PLUGIN_ROOT/bin/`) does not carry `bin/fusion-identity`; the guard failed with the helper missing, not with exit 4, so an identity was owed and could not be read.

Fix: run the open-issue control against a scratch workbench the test writes (one `_o_` issue under `shared/issues/`), through the same `corpusFiles()` selection the gate uses, so the selector is proven without requiring an open defect on disk. Keep the check a check; never a skip. The hook-test growth bound has 2 lines of head-room, so the change pays for itself by cutting comment prose in the same file.
---
Resolved: fixed — the open-issue control now runs corpusFiles() over a scratch workbench the case writes, holding one _o_ and one _c_ issue, so it proves the selector without an open defect on disk; hooks/lib/__tests__/workbench-citation-lint.test.ts:293
