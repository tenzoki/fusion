A control file that does not read takes its narrative out of both blocking lints and the citation checker's verdict, with nothing said
---
Since FJ03d step 8 a narrative is live when `index.byNarrative.get(rel)?.live` is true. `hooks/lib/record-index.ts` puts a control file the codec could not read into `index.unreadable` and into no map. Its narrative therefore answers "not live": the citation lint does not judge it, the stopping-section lint does not see the plan, and the checker counts its rows as not edited. None of the three names the file. Before step 8 the marker in the name decided, so a file could not leave the gate this way.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Cross-references:** 261004-2212_*_plan-fj03d-rules-prompts-and-live-predicates-switched-with-this-workbench-in-one-window.md

Severity: Low. Scope: `hooks/lib/citation-corpus.ts` (`isLiveRecord`), `hooks/citation-check.ts`, `hooks/lib/__tests__/workbench-citation-lint.test.ts` (`corpusFiles`), `hooks/lib/__tests__/plan-stopping-section-lint.test.ts` (`livePlans`), on `fj03d` at `cd1b5522`.

**Evidence.**

- `hooks/lib/record-index.ts`, `readRecordIndex`: a row `unreadable(row, found, kinds)` rejects is pushed to `index.unreadable` and the loop continues before any map is set.
- `hooks/lib/citation-corpus.ts`: `return index.byNarrative.get(rel)?.live === true;`.
- `hooks/lib/__tests__/plan-stopping-section-lint.test.ts`, `livePlans`: `const { rows } = measurePlanSizes(...)`; the `unreadable` list the same call returns is dropped.
- `grep -n unreadable hooks/citation-check.ts hooks/lib/__tests__/workbench-citation-lint.test.ts hooks/lib/__tests__/plan-stopping-section-lint.test.ts` names no reader of the list (one fixture line builds an empty one).
- `hooks/lib/plan-size.ts` shows the other treatment in the same range: "A plan control file that did not read is counted and named, never dropped, since whether it is live is exactly what could not be read", printed as `unreadable=`.

inference: such a record is rare and is noticed elsewhere (the codec refuses a write on it, the state-auditor's `reconcile` reports it). The defect is that two gates described as recomputed from the tree with no way around them have one, and that it is silent.

**Acceptance.** On fusion's own tree each of the two lints fails, naming the control files, when `index.unreadable` is not empty; `bin/fusion-citation-check` prints an `unreadable=` count with one row per file, as `bin/fusion-plan-size` does, and its header says whether `verdict=` reads it. A case with one placed record whose control file does not validate pins each, and fails on the code at `cd1b5522`.

Executor: `code-implementer`.

---
Resolved: fj03d `a759bb08` — both blocking lints fail on a non-empty `index.unreadable`, naming each file, and the checker prints `unreadable=<n>` with one row per file; `verdict=` does not read it, as it does not read `uuid-unresolved=`. One placed-record case per reader, each shown red. Not determined: whether a control file under `archive/` can enter that list. Verified 2026-10-05 by the orchestrator in the fj03d worktree at `85ea803b`: hooks 1 134 of 1 139, the reds being the four legacy own-tree cases and the known monitor case; no file under `codec/` changed, bundle `c76bbce9…`.
