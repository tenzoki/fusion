Seven open defect records name the deleted Plane mirror, and neither removal step owns a record sweep

---

**Severity:** High
**Domain:** data
**Filed by:** ontorev, review of `9a7da8e..7c12d6a` (structured-data half), review file `260815-0803-ontorev-plane-structured-data-removal.md`
**Owner:** `ontocoder`
**Affects:** the seven records listed below, plus `260815-0029_*_plan-remove-eight-mechanisms-and-cap-growth.md` steps 2 and 3
**Cross-references:** commits `d0ddabb`, `7c12d6a`; `rules/fusion-workbench-conventions.md` `## State Markers — issues and planning`; the Circle record's `## Closure criterion`; the same plan's step 8, which does name the record it retires.

---

`bin/fusion-plane`, `hooks/lib/__tests__/fusion-plane.test.ts` and `docs/plane-setup.md` left the tree in `d0ddabb`. Seven defect records still carry the open marker `_o_` and every one of them names, in its own `**Affects:**` line or its title, a path that no longer exists at HEAD. Neither removal step lists a record to touch, so nothing in the plan would have caught them.

---

**Verified 2026-08-15 at HEAD `7c12d6a`.** Each record, with the path it names and the reason it is now unanswerable:

| Record | Names | Why it is moot |
|---|---|---|
| `260719-2304_*_verify-plane-create-patch-body-against-live-instance.md` | `bin/fusion-plane` create/PATCH body, `doctor` exit codes | the helper is gone; there is nothing to verify against a live instance |
| `260810-0918_*_push-fixture-without-rebuild-map-never-reads-the-fixture-and-says-nothing.md` | `bin/fusion-plane` — `cmd_push` flag handling | the subcommand is gone |
| `260810-1158_*_a-third-derivation-site-reads-the-key-back-out-of-a-plane-issue-body-which-carries-no-format.md` | `bin/fusion-plane` — `JQ_REBUILD_MAP` | its parent `260810-0458_*_…` is already closed; the third derivation site is gone with the file |
| `260813-1051_*_an-unguarded-mktemp-in-plane-curl-degrades-into-a-wrong-answer-because-every-call-site-suspends-set-e.md` | `bin/fusion-plane:360`, `:363`, `:379` | three line citations into a deleted file |
| `260813-1051_*_the-plane-curl-regression-guard-only-fires-on-a-machine-whose-interactive-rc-prints.md` | `hooks/lib/__tests__/fusion-plane.test.ts:1494`, `:1603-1620` | the test file is gone; the guard it asks for cannot be added |
| `260813-1036_*_the-manual-fetch-command-fusion-plane-prints-breaks-the-same-way-plane-curl-just-stopped-breaking.md` | `bin/fusion-plane:2263` (`seed_defer_manual`) | the command that printed the string is gone |
| `260813-2305_*_the-directive-promises-plane-setup-verification-and-step-10-was-deferred-with-no-record.md` | `docs/plane-setup.md`, step 10 of that Circle | this Circle's own record already says step 10 *"is now moot if the Plane mirror goes"* |

One record that looks like it belongs here and does not: `260813-1051_*_lc-all-c-sits-on-the-leaf-git-invocation-not-on-the-test-files-shared-git-helper.md` names `hooks/lib/__tests__/circle-stash-git-exclusion.test.ts`, which step 6 deletes and step 3 did not. Leave it alone until step 6.

**Why the sweep was missed, and why that is the part worth fixing.** The plan's step 2 and step 3 file lists name code, prompts, prose, fixtures and configuration, and no record. Step 8, the investigator fold, does name one: `260812-0254_*_should-the-investigator-get-case-folders-with-a-status-per-case.md`, and the Circle record explains why (*"retired by the investigator fold rather than answered; close it with the fold"*). The obligation exists in the Circle's own reasoning and reached exactly one of the fifteen steps. The executing coder closed two Plane records on its own initiative, `260810-0410` and the layout-tree record, which is evidence that the obligation was understood and not that it was written down.

**Why it costs something.** Three consumers read open-marker counts and all three are due before this Circle closes. The Circle's `## Closure criterion` asks for a before-and-after measurement. `bin/fusion-churn-rank` and the playmaker's portfolio pass rank open work. And the Circle's own Grounding argues from a defect rate of 1.37 records per commit against a 91 percent closure ratio, so seven records that cannot be closed by anyone distort the very figure the removal is being justified by.

**The fix.**

1. Close all seven with the marker rename `_o_` → `_c_`, keeping each body intact and appending one `Resolved:` line naming this Circle's step 2 and the commit that removed the subject. Follow the shape `260810-0410_*_…md` already uses, not the stub shape recorded in the sibling finding `260815-0803_*_the-layout-tree-record-is-live-under-two-names-…`.
2. Add a record-sweep line to the plan's remaining removal steps, in step 8's form: before a step deletes a file, name the open records whose `**Affects:**` cites it. Eleven removals are still ahead, and each will produce its own set.
3. Consider whether the sweep is mechanisable rather than remembered. `hooks/lib/__tests__/reference-resolution-lint.test.ts` already resolves plugin-shaped paths in shipped text against the tree; it does not read `fusion-workbench/`. Whether it should is a decision, not a defect, and is not proposed here.

---

**Reconciliation 260815-1913 (reconciler, HEAD `9306f0a`) — four of the seven are closed, three are
out of reach, and the population the record measured has more than doubled.**

*Discharged.* The four records this record lists that sit in `shared/issues/` were each re-verified
against the tree and closed `_o_` → `_c_` with a `Resolved:` footer naming the deleting commit, in
the shape the record's fix step 1 prescribes: `260810-0918_*_push-fixture-without-rebuild-map-…`,
`260810-1158_*_a-third-derivation-site-…`, `260813-1051_*_an-unguarded-mktemp-in-plane-curl-…` and
`260813-1051_*_the-plane-curl-regression-guard-…`. Each names `d0ddabb`, which deleted
`bin/fusion-plane` and `hooks/lib/__tests__/fusion-plane.test.ts`.

*Out of reach, so this record stays `_o_`.* Three of the seven sit in other Circles —
`260719-2304_*_…`,
`260813-1036_*_…` and
`260813-2305_*_…`. `bin/fusion-paths`
resolves `$SCAN_ISSUES` to the Circle in scope plus `shared/` and to nothing else
(`rules/fusion-workbench-conventions.md` `## Path Resolution` → *Two invariants*), so no pass run
from this Circle reaches them. Each was read and each is moot on the same evidence; closing them
needs a run with that Circle in scope, or a user `mv`.

*The count is no longer seven.* The record was filed at Turn 1, after two of the fifteen steps. Ten
further removals have landed since, and the same class now covers **fifteen** shared records rather
than four. Eleven beyond the Plane four were verified moot and closed by this pass: the churn
stand-down (`260810-1632`, `a69d56e`), the stash-era git helper and the `circle-stash` max-turns
reader (`260813-1051` LC_ALL, `260811-2150_*_circle-stash-does-not-handle-an-absent-max-turns-it-renders-an-empty-right-hand-side-and-the-prompt-says-otherwise.md`, both `5d29b6d`), four state-drift records
(`260811-1614_*_the-drift-checks-turn-row-is-satisfied-by-a-turn-start-alone-so-a-turn-that-emits-nothing-else-reads-clean.md`, `260811-2307` ×2, and the anchor record, all `f45f76a`), and four queue records
(`260810-0510_*_two-of-the-queue-ground-lints-negative-controls-re-implement-the-logic-instead-of-calling-it.md` partially, `260811-1144_*_the-staging-shape-lint-misses-a-directory-argument-that-has-no-trailing-slash.md`, `260811-1915_*_the-queue-ground-check-reads-any-backticked-word-in-the-head-line-as-a-circle-name.md`, `260811-2330`, `260814-2205_*_the-queue-ground-parse-reads-a-backticked-token-out-of-the-prose-that-follows-the-word-none.md`, all `dd312eb`).

*What the record asked for that did not happen.* Fix step 2 — add a record-sweep line to the plan's
remaining removal steps, in step 8's form — was not applied to any of the eleven steps that followed.
The evidence is this count: had it been applied, these fifteen would have been closed by the commits
that removed their subjects rather than by a reconciliation pass three Turns later. Fix step 3, the
question of whether the sweep is mechanisable, remains unfiled as a decision.

---
Resolved: Discharged by closing the three Plane-mirror records above: the 260815-1913 reconciliation closed four of the seven and named these three as the out-of-reach remainder, so the closure list completes here. Fix step 2 is unactionable now that all fifteen plan steps landed and the Circle closed; fix step 3 was explicitly a decision it did not propose.

Closed as part of the Turn-1 housekeeping batch of session 260815-2147-orchestrator-session.md, after a re-verification pass against HEAD confirmed the condition no longer holds.
