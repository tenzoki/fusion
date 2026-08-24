The golden-regeneration history states eighteen agent blocks and five rule files; the artefact it describes has seventeen and three

---
`circles/260801-1244-curator/history/260814-1352-coder-golden-regeneration.md` records task T8. Two counts in it are falsified by the file it regenerated and by the run it followed: it says the size changes moved "across all eighteen agent blocks" (there are seventeen) and that the curator "edited five project rule files" of which "three of them are emitted by `bin/fusion-rules`" (three files, of which two are emitted). The task's substance is right and was independently verified; only the counts are wrong.

---
**Found by:** coderev, Turn-3 incremental review of `5c843e6..0301909`, review file `circles/260801-1244-curator/reviews/260814-1419-coderev-curator-turn-3.md`.
**Owner:** `coder`.
**Severity:** Low.
**Cross-references:** `circles/260801-1244-curator/decisions/260814-0845_*_are-the-sixteen-agent-claims-corrected-or-derived-away.md` (the standing question about written-down agent counts — this is a fresh instance of it, filed one Turn after it); `circles/260801-1244-curator/reviews/260814-1128-coderev-curator-turn-2.md` `## Cross-cutting observation` ("a claim about a number or a rule, written in prose, checked by nothing"); commit `0301909`.

**Verified 2026-08-14 at HEAD `0301909`:**

```
$ grep -c '^\[' hooks/lib/__tests__/fixtures/rules-emission.golden
17
$ ls agents/*.md | wc -l
17
```

The fixture holds one block per agent — `analyst, bugfixer, coder, coderev, conceptrev, consultant, curator, editor, investigator, ontocoder, ontorev, orchestrator, planner, playmaker, reconciler, shaper, taskplanner` — and there are seventeen of each.

On the rule files, the run's own outcome table (`circles/260801-1244-curator/history/260814-1332-curator-run.md` §9) lists five *entries* across three *files*: `rules/fusion-workbench-conventions.md` three times, `rules/workbench-path-resolution.md` once, `rules/workbench-stash-and-lock.md` once. Of those three files `bin/fusion-rules` emits two; the history says three. Its own next paragraph then states the correct fact — "`rules/workbench-path-resolution.md` was also edited by the curator and correctly does not appear in the diff: `bin/fusion-rules` emits it to no agent" — so the file contradicts itself two paragraphs apart.

**Why file it rather than let it stand.** This is a history file, and a history file is the durable record of a session (`rules/fusion-workbench-conventions.md` `## History Logging`). Both counts will be read later as measurements. "Eighteen agents" in particular is the exact staleness class the Circle filed a decision about one Turn earlier, appearing in a record written *after* the seventeenth agent landed and *by* the task whose whole subject is the seventeen-block fixture.

**The fix.** Correct both counts, or restate the two sentences without a count — the second is what decision `260814-0845` and the T6 repair in `2a8a2f7` both chose for the same class. "Across every agent block" and "the rule files the curator edited, of which `bin/fusion-rules` emits some" carry the same information and cannot go stale.


---

**Reconciliation 260819-1453 (reconciler, Domain `code`, Circle-store pass) — STAYS `_o_`. Re-measured at HEAD `e435f03` (v10.3.0). The error grew from one to three.**

`history/260814-1352-coder-golden-regeneration.md:23` still says "across all eighteen agent blocks". Measured: `grep -c '^\[' hooks/lib/__tests__/fixtures/rules-emission.golden` → **15**, and `ls agents/*.md | wc -l` → **15**. It was off by one when filed; `investigator` and `conceptrev` were retired on 2026-08-15 and neither count was touched, so it is off by three now. The "five project rule files" claim at `:11` is unchanged.

---
Resolved: fixed — both counts are restated without a number in an appended note; circles/260801-1244-curator/history/260814-1352-coder-golden-regeneration.md:77
