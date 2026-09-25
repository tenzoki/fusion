# Ontology review — the Plane mirror's structured data leaves the tree

**Sender:** ontorev
**Reviewed-range:** `9a7da8e..7c12d6a`
**Not-opened:** `agents/orchestrator.md`, `bin/fusion-plane`, `docs/plane-setup.md`, `docs/working-model.md`, `README.md`, `README-agents.md`, `skills/cleanup/SKILL.md`, `skills/seed-from-plane/SKILL.md`, `skills/setup/SKILL.md`, `hooks/dist/lib/staging-drift.d.ts`, `hooks/dist/lib/staging-drift.js`, `hooks/lib/__tests__/churn-key-anchor.test.ts`, `hooks/lib/__tests__/churn.test.ts`, `hooks/lib/__tests__/domain-cascade.test.ts`, `hooks/lib/__tests__/fusion-plane.test.ts`, `hooks/lib/__tests__/monitor-warnings-panel.test.ts`, `hooks/lib/__tests__/review-coverage.test.ts`, `260815-0007_*_does-fusion-cleanup-block-at-the-claude-md-gate-or-leave-the-ledger.md`, `260815-0029_*_what-permission-grant-does-setup-seed-when-unlock-becomes-a-setup-step.md`, `260815-0029_*_what-triggers-the-analyst-executor-set-once-strategic-and-knowledge-are-gone.md`, `260815-0007-shaper-remove-eight-mechanisms-and-cap-growth.md`, `260815-0029-planner-remove-eight-mechanisms-and-cap-growth.md`, `260815-0729-coder-before-measurement.md`, `260815-0742-coder-remove-plane-mirror-code-and-prose.md`, `260815-0029_*_the-circle-record-cites-the-investigator-case-folder-record-as-an-issue-and-asks-for-a-transition-that-vocabulary-has-no.md`, `260815-0044-conceptrev-plan-remove-eight-mechanisms-and-cap-growth.md`, `260814-1733_*_radical-simplification.md`, `260814-2312_*_collapse-the-eight-admin-commands-into-three-entry-points.md`, `260814-2306-orchestrator-session.md`

**Date:** 2026-08-15
**Scope:** the structured data of the six-commit range. Prompts, prose and TypeScript were dispatched to `coderev` in parallel and are the reason for most of the not-opened list above.

---

## Summary

The three items the dispatch asked to be checked specifically all hold. The golden fixture moved by exactly the two rule-file deletions and nothing else, `RULE_BASELINE` was not re-cut, the fixture tree held fifteen files rather than the plan's fourteen, and `.claude-plugin/plugin.json` lost only the Plane clause with its version left at 8.2.0. Every deleted file was read, and every byte figure the executing ontocoder recorded was verified exact.

What the pass found instead sits one layer out from the deleted data, in the surfaces that referred to it. Five defects are filed. Two are High and both concern the record store: one defect record is now live under two names in two different Circles with its evidence dropped from the closed copy, and seven open records still name `bin/fusion-plane` or its test file as the thing they are about.

## Totals

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 2 |
| Medium | 2 |
| Low | 1 |

All five are filed in `circles/260815-0007-remove-eight-mechanisms-and-cap-growth/issues/` under the `260815-0803` stamp. The Origin Rule places all five in this Circle: each was caused by this Directive's execution rather than found beside it.

---

## The three specific checks

### 1. The golden fixture, and whether the baseline was re-cut

**Both reports hold, and the second is verifiable in a way worth writing down.**

`hooks/lib/__tests__/rules-emission-golden.test.ts` has a zero-byte diff across the range. `RULE_BASELINE` was therefore not re-cut, and its `fusion-workbench-conventions.md` entry still stands at 52 027 from the 2026-08-14 arming while the file is now 52 756, so the corpus remains 729 bytes above its floor and no growth was absolved.

The fixture's movement is exactly the two deletions and is fully accounted for. `rules/fusion-workbench-conventions.md` 53 124 → 52 756 is −368; `rules/circle-records.md` 11 949 → 11 754 is −195. Each of those two files has exactly **one hunk** in the range diff, so there is no second edit hiding inside either delta: the conventions file lost the three Plane rows from the root-anchored layout tree and turned `├──` into `└──` on the line above, and `circle-records.md` lost the half-sentence about the mirror needing an immutable natural key.

Every entry in the fixture was re-measured against the tree and all eight match byte for byte:

```
agent-setup.md 3513   fusion-workbench-conventions.md 52756   decision-record-examples.md 4291
user-facing-output.md 16784   critical-stance.md 9958   design-diagrams.md 5673
circle-records.md 11754   workbench-stash-and-lock.md 13030
```

All seventeen agent totals re-add correctly from those figures. `cd hooks && npx vitest run lib/__tests__/rules-emission-golden.test.ts` passes, 15 tests. The fixture still carries `[conceptrev]` and `[investigator]` blocks, which is correct: those agents leave at steps 7 and 8.

### 2. The fixture tree count

**Fifteen, not fourteen. The executing ontocoder is right and the plan is wrong.**

```
$ git diff --diff-filter=D --name-only 9a7da8e..HEAD | grep -c '^hooks/lib/__tests__/fixtures/plane/'
15
```

Six JSON API-response fixtures plus a nine-file workbench tree. The count was already fifteen at `d78dfb7`, before step 2 ran, so nothing in the removal moved it. All fifteen were read; none had a second consumer, none carried a secret, and every one was a deterministic placeholder for `fusion-plane.test.ts`. `hooks/lib/__tests__/fixtures/` now holds `rules-emission.golden` alone.

The plan still says fourteen at line 180, which is filed as the Low finding because step 14 and the Closure note read the plan.

### 3. `.claude-plugin/plugin.json`

**Clean.** The only change is the removal of `and an optional push-only Plane work-queue mirror` from the description. `version` stays `8.2.0`, as step 15 requires. `name`, `author`, `license` and `repository` are untouched, and the file parses. The description's remaining `code/data/strategic/knowledge` and `investigator` clauses are steps 9 and 8 and correctly still stand.

---

## Findings

### High

**H1 — The layout-tree record is live under two names in two Circles, and the closed copy lost its body.**
`260814-1419_*_three-plane-files-…md` (28 lines) and `260814-1419_*_three-plane-files-…md` (3 lines) are the same record. `d0ddabb` wrote the second as a new file rather than renaming the first, put it in a Circle that closed in July, and reduced it to an empty title line, a `---` and a `Resolved:` note. `507dbc6` repaired the identical fault for the sibling record `260810-0410` one commit later and did not reach this pair. Three rules are broken at once: the `mv`-only marker transition, the Origin Rule, and the issue-file format. `260810-0819_*_head-carries-six-records-twice-…` already records the class; this is the seventh instance.
Filed: `260815-0803_*_the-layout-tree-record-is-live-under-two-names-in-two-circles-and-the-closed-copy-lost-its-body.md`

**H2 — Seven open defect records name the deleted Plane mirror, and neither removal step owns a record sweep.**
Every one carries `_o_` and names, in its `**Affects:**` line or its title, a path that is gone: four cite `bin/fusion-plane` (one of them three line numbers into it), one cites `hooks/lib/__tests__/fusion-plane.test.ts:1494`, one cites `docs/plane-setup.md`, and one asks for a live-instance verification of a helper that no longer exists. Steps 2 and 3 name no record in their file lists, while step 8 does name the one the investigator fold retires, so the obligation exists in the Circle's reasoning and reached one of the fifteen steps. Three consumers read open-marker counts before this Circle closes, including the closure measurement and the defect-rate argument in the Circle's own Grounding.
Filed: `260815-0803_*_seven-open-defect-records-name-the-deleted-plane-mirror-and-neither-removal-step-owns-a-record-sweep.md`

### Medium

**M1 — Two CLAUDE.md inventory rows went stale and neither lint gate can see them.**
`CLAUDE.md:51` still lists `plane.config.yaml` among the files `/fusion:setup` seeds from `templates/`, and `:52` still lists `plane-setup.md` under `docs/`. Both rows declare themselves derivable from the tree in their own text. `reference-resolution-lint` cannot see them because both write a bare filename rather than a path, and `derivable-enumerations-lint` has no check for either row although it covers the `bin/` roster in the same table. The plan's `**Decidability:**` line rests the whole sweep on those two gates and its `## Approach` split routes every documentation edit by *"does `npm test` assert it?"*, so an unasserted row that nobody routes by hand falls into neither half. The `docs/` row was routed to gate G1 at plan line 173; the `templates/` row was not, which is why it is still there. The finding is the gate gap, not the two rows.
Filed: `260815-0803_*_two-claude-md-inventory-rows-went-stale-and-neither-lint-gate-can-see-them.md`

**M2 — `.gitignore:30` still carries `!bin/fusion-plane`.**
The exception list differs from `bin/` in exactly that one entry, in one direction. The block's own WARNING at `.gitignore:14-20` states the obligation, the failure mode and that nothing checks it. Inert at runtime, and the list is the only written record of which helpers ship.
Filed: `260815-0803_*_gitignore-still-carries-the-ship-exception-for-the-deleted-bin-fusion-plane.md`

### Low

**L1 — The plan's step 3 says fourteen fixture files; the tree held fifteen.**
Recorded by the executing ontocoder in its history entry, which is the one place `## Issue and Decision Filing — MANDATORY` says a defect may not live. Step 14 and the Closure arithmetic read the plan, which still says fourteen at line 180.
Filed: `260815-0803_*_the-plans-step-3-file-list-says-fourteen-fixture-files-and-the-tree-held-fifteen.md`

---

## Verified clean

Recorded so a later pass does not re-derive them.

- **Every byte figure in the executing ontocoder's history entry is exact.** `templates/plane.config.yaml` 8 922; `fusion-workbench/plane.config.yaml` 6 520; `.plane-map.json` 3 bytes and its content is literally `{}`; `.plane-outbox.jsonl` 22 289 bytes and 50 lines. The outbox parses as 50 valid JSON objects with 46 distinct `natural_key` values across 5 Circles, and its two deferral reasons split 33 for `PLANE_API_KEY absent` and 17 for `Plane unreachable`. Zero pushes ever succeeded, which the empty map and the fully-deferred outbox assert independently.
- **A trap for the next reader of the range diffstat.** It shows `.plane-outbox.jsonl | 48 -`, not 50. The file grew by two entries during the range before being deleted: 48 lines at `9a7da8e`, 50 at `507dbc6`. Both figures are right and the history's 50 is the one that describes what was deleted.
- **The two `plane.config.yaml` files carried no credential.** Neither had an `api_key`, `token` or `secret` field, so the template's own security invariant held at the moment of deletion. The workbench copy pointed at `http://localhost:9999`, which is the Grounding's evidence that the mirror never addressed the real instance.
- **`hooks/config.json`, `fusion-guard.json` and `templates/fusion-guard.json` have a zero-byte diff across the range.** No guard configuration key was orphaned, and no key was left naming a removed consumer.
- **The committed `hooks/dist/` is in sync with its TypeScript source.** `npm test` runs `rm -rf dist && tsc` first, and `git status` after it shows no change under `hooks/dist/`, so the two committed `staging-drift` artefacts match a clean build.
- **`fusion-workbench/orchestrator-events.jsonl` is intact**: 1 498 lines, zero unparseable.
- **`fusion-workbench/.fusion-setup`** changed only its `setup_at` timestamp, from a re-run of `/fusion:setup`. `plugin_version` correctly still reads `8.2.0`.
- **The full hook suite is green**: 48 files, 903 tests, and the same 903 the pre-deletion baseline recorded. A fixture deletion should move neither the file count nor the test count, and it moved neither.
- **`hooks/lib/__tests__/fixtures/plane/` is gone from the working tree**, not merely from the index, and no shipped file outside `fusion-workbench/` names a Plane fixture path.

## Recommended sequencing

1. **H1**, before anything else touches the record store. It is a three-command repair and every marker scan run before it is wrong.
2. **H2**, in the same pass. The seven closures follow the shape `260810-0410_*_…md` already uses, and H1's fix establishes which shape that is.
3. **M2**, one deleted line, no dependency.
4. **L1**, one edited figure in the plan, and it should land before step 14 rather than after it.
5. **M1** last of the five and before step 4. It adds two checks to a test file, and it is the only one of the five that prevents recurrence rather than repairing an instance. The two stale rows it is evidenced by belong to the curator at gate G1 and are not part of this fix.

The record-sweep line H2 asks for in the remaining removal steps is worth adding at the same time as M1, for the same reason: eleven removals are still ahead, and each one produces its own set of both defects.
