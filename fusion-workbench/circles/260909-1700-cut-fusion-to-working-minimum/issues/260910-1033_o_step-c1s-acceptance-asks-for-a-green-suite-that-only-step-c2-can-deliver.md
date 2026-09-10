Step C1's acceptance asks for a green suite that only step C2 can deliver
---
C1's verification line is "`npm test` green after `npm run build`". C1's own deletions dangle 24 citations, 11 of them inside `agents/orchestrator.md`, which C1 is forbidden to touch and which step C2 rewrites wholesale. So the criterion cannot be met at C1 by any correct execution of C1.
---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260909-1843_*_implementation-cut-fusion-to-a-working-minimum.md steps C1, C2, C3

**Evidence, measured.** After C1's work landed in the working tree, `cd hooks && npm run build` exits 0 and `npm test` exits 1: 5 failures in 4 files, 928 of 933 tests passing. Three of the five are C1's own consequence and none is repairable inside C1's file list:

- `reference-resolution-lint.test.ts`, two cases. 24 citations of the five deleted paths resolve to nothing: 11 in `agents/orchestrator.md` (C2's file), 2 in `skills/setup/SKILL.md` (C3's), 4 in `CLAUDE.md`, 2 in `README.md`, 1 in `README-agents.md`, 1 in `bin/fusion-identity`, 3 across `docs/upgrading-to-v10-25.md` and `docs/upgrading-to-v10-26.md`. Its `BASELINE` also wants re-approving from `{paths: 1733, anchors: 253}` to `{paths: 1676, anchors: 250}`, which cannot honestly be done while the surface still dangles.
- `derivable-enumerations-lint.test.ts`, one case. `CLAUDE.md`'s Layout table still carries a `bin/fusion-turn-budget` row. No step in the plan owns that row.
- `committed-dist.test.ts`, one case. `git ls-files bin/` still lists the deleted `bin/fusion-turn-budget`, because staging is the orchestrator's act and happens at commit time. This one clears itself the moment the deletion is staged.

The fifth failure, `citation-sweep.test.ts`, is unrelated to C1 and filed separately as `260910-1033_*_the-citation-sweep-gate-is-red-at-head-again-and-the-drift-came-from-this-circles-own-sessions.md`.

**What this is not.** It is not a defect in C1's implementation. Every deletion C1 performed is on the plan's list, and the executor correctly refused to reach into `agents/orchestrator.md`. The defect is in the plan's step boundary: a deletion and the repair of the text that cites it were put in different steps, and the earlier step was given the acceptance criterion that only the later one can satisfy.

**Acceptance.** The plan states, for C1 and for every later step whose deletions dangle text a subsequent step owns, which suite failures are expected at that step and which are not. Either C1's verification line is narrowed to the checks C1 can reach, or the citation repair for the non-`agents/` surfaces is named as C1's work. A reader of the commit range can then tell an expected red from a regression.

---

Reconciliation (260910-2020, reconciler): open, and the acceptance is unmet for the reason it was
filed rather than for its symptom. `cd hooks && npm test` is green at `07961552` — 895 tests in 52
files, re-run in this pass — so every failure this record enumerates has cleared. What it asks for
is not a green suite but that the plan say, per step, which failures are expected; the plan's C1
verification line still reads "`npm test` green after `npm run build`" and no step below it names an
expected red. The same boundary recurred four times after this record was filed: at C2 (6 new
dangling anchors into a prompt C2 may not touch from files it does not own), at C5
(`path-literal-lint`, repairable only in C3's file), at C6 (`committed-dist` against an untracked
helper) and at C9a (5 failures deliberately left to C9b). Each is named in its own commit message,
which is the workaround this record exists to replace.
