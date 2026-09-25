Three Plane files entered the layout tree, and neither of the two per-surface arguments below it was extended

---
Ledger entry L23 of the curator run added `plane.config.yaml`, `.plane-map.json` and `.plane-outbox.jsonl` to the root-anchored block of `rules/fusion-workbench-conventions.md` `## fusion-workbench Layout`. That is correct and is what open issue `260810-0410_*_the-layout-tree-calls-itself-exhaustive-and-omits-the-two-plane-runtime-files.md` asked for. Two paragraphs immediately below the tree each range over the root-anchored surfaces and neither was extended, so the file now states two case splits that visibly do not cover three of the entries in its own tree.

---
**Found by:** coderev, Turn-3 incremental review of `5c843e6..0301909`, review file `260814-1419-coderev-curator-turn-3.md`.
**Owner:** `coder` for the two paragraphs; the closure of `260810-0410_*_the-layout-tree-calls-itself-exhaustive-and-omits-the-two-plane-runtime-files.md` is the reconciler's or the user's.
**Severity:** Medium.
**Affects:** `rules/fusion-workbench-conventions.md` `## fusion-workbench Layout` and its `### Which of them a tracked workbench tracks`.
**Cross-references:** `260810-0410_*_the-layout-tree-calls-itself-exhaustive-and-omits-the-two-plane-runtime-files.md` (still open, and its questions 1 and 2 are the two gaps below — do not refile it, this record is the new state); `260810-0504_*_the-tracked-workbench-section-re-enumerates-a-closed-list-and-leaves-one-surface-unclassified.md` (the second enumeration, and the same class for `.fusion-setup`); `260814-1332-curator-run.md` ledger entry L23; commit `1a36fe4`.

**Verified 2026-08-14 at HEAD `0301909`.**

The three files are genuinely root-anchored: `bin/fusion-plane:236-238` resolves each at `$WORKBENCH/<name>`, so the addition to the tree is right.

**Gap 1 — the per-surface justification.** The paragraph beginning *"They are root-anchored because none of them belongs to a unit of work"* argues the case surface by surface for `agentstate.yaml`, `orchestrator-live.md`, `orchestrator-events.jsonl`, `.guard-state/`, `.commit-lock/` and `.session-marker`. It names none of the three new entries, and ends by calling the placement *"structural rather than promised"*. `260810-0410_*_the-layout-tree-calls-itself-exhaustive-and-omits-the-two-plane-runtime-files.md` asked for exactly this ("Both Plane files would need that argument made for them, and it is not obvious in the same way").

**Gap 2 — the tracked/untracked split.** `### Which of them a tracked workbench tracks` opens *"the root-anchored surfaces still split in two"* and then lists both buckets by name. Neither bucket names any of the three. This is `rules/critical-stance.md` §4 as the section's own standard: a case split is disjoint and complete, and a gap is a defect of the same kind as a wrong result.

**Why the state is worse than before the addition, not better.** Until `1a36fe4` the three files were absent from the tree *and* from the split, consistently, and `260810-0410_*_the-layout-tree-calls-itself-exhaustive-and-omits-the-two-plane-runtime-files.md` recorded that. Now they are present in the tree and absent from the split, so a reader who checks the split against the tree finds three unclassified entries rather than a short tree. Half of an open issue's fix landed and the issue did not move.

**Two things the fix should not do.**

- Do not answer gap 2 by copying `hooks/lib/staging-drift.ts:182-183`, which lists `.plane-map.json` and `.plane-outbox.jsonl` under `LIVE_STATE`. That constant answers a different question — *is this file in flight during a session*, for staging-drift classification — not *does a past version answer anything*, which is what the tracking split asks. `260810-0410_*_the-layout-tree-calls-itself-exhaustive-and-omits-the-two-plane-runtime-files.md` question 2 states the real tension: the id map is load-bearing and must stay tracked, while the outbox grows unboundedly.
- Do not add a second enumeration. `260810-0504_*_the-tracked-workbench-section-re-enumerates-a-closed-list-and-leaves-one-surface-unclassified.md` already records that this file enumerates the root-anchored set twice and that a new surface therefore has two landing sites. Any fix here lands in both or the defect recurs.

**Byte cost.** Both paragraphs sit in an always-on file, so any addition is charged against the growth bound armed in T4 and needs the golden regenerated in the same commit.

---
Resolved: moot. The three Plane files left the root-anchored layout tree with the Plane mirror itself (step 2 of Circle `260815-0007-remove-eight-mechanisms-and-cap-growth`, commit `d0ddabb`), so there are no per-surface arguments left to extend. The executing coder confirmed no paragraph beneath the tree ever covered them.
