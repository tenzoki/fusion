Seven open defect records name the deleted Plane mirror, and neither removal step owns a record sweep

---

**Severity:** High
**Domain:** data
**Filed by:** ontorev, review of `9a7da8e..7c12d6a` (structured-data half), review file `circles/260815-0007-remove-eight-mechanisms-and-cap-growth/reviews/260815-0803-ontorev-plane-structured-data-removal.md`
**Owner:** `ontocoder`
**Affects:** the seven records listed below, plus `circles/260815-0007-remove-eight-mechanisms-and-cap-growth/planning/260815-0029_o_plan-remove-eight-mechanisms-and-cap-growth.md` steps 2 and 3
**Cross-references:** commits `d0ddabb`, `7c12d6a`; `rules/fusion-workbench-conventions.md` `## State Markers — issues and planning`; the Circle record's `## Closure criterion`; the same plan's step 8, which does name the record it retires.

---

`bin/fusion-plane`, `hooks/lib/__tests__/fusion-plane.test.ts` and `docs/plane-setup.md` left the tree in `d0ddabb`. Seven defect records still carry the open marker `_o_` and every one of them names, in its own `**Affects:**` line or its title, a path that no longer exists at HEAD. Neither removal step lists a record to touch, so nothing in the plan would have caught them.

---

**Verified 2026-08-15 at HEAD `7c12d6a`.** Each record, with the path it names and the reason it is now unanswerable:

| Record | Names | Why it is moot |
|---|---|---|
| `circles/260719-1536-plane-mirror-integration/issues/260719-2304_o_verify-plane-create-patch-body-against-live-instance.md` | `bin/fusion-plane` create/PATCH body, `doctor` exit codes | the helper is gone; there is nothing to verify against a live instance |
| `shared/issues/260810-0918_o_push-fixture-without-rebuild-map-never-reads-the-fixture-and-says-nothing.md` | `bin/fusion-plane` — `cmd_push` flag handling | the subcommand is gone |
| `shared/issues/260810-1158_o_a-third-derivation-site-reads-the-key-back-out-of-a-plane-issue-body-which-carries-no-format.md` | `bin/fusion-plane` — `JQ_REBUILD_MAP` | its parent `shared/issues/260810-0458_c_…` is already closed; the third derivation site is gone with the file |
| `shared/issues/260813-1051_o_an-unguarded-mktemp-in-plane-curl-degrades-into-a-wrong-answer-because-every-call-site-suspends-set-e.md` | `bin/fusion-plane:360`, `:363`, `:379` | three line citations into a deleted file |
| `shared/issues/260813-1051_o_the-plane-curl-regression-guard-only-fires-on-a-machine-whose-interactive-rc-prints.md` | `hooks/lib/__tests__/fusion-plane.test.ts:1494`, `:1603-1620` | the test file is gone; the guard it asks for cannot be added |
| `circles/260813-0858-playmaker-maintains-backlog-store/issues/260813-1036_o_the-manual-fetch-command-fusion-plane-prints-breaks-the-same-way-plane-curl-just-stopped-breaking.md` | `bin/fusion-plane:2263` (`seed_defer_manual`) | the command that printed the string is gone |
| `circles/260813-0910-documentation-matches-shipped-plugin/issues/260813-2305_o_the-directive-promises-plane-setup-verification-and-step-10-was-deferred-with-no-record.md` | `docs/plane-setup.md`, step 10 of that Circle | this Circle's own record already says step 10 *"is now moot if the Plane mirror goes"* |

One record that looks like it belongs here and does not: `shared/issues/260813-1051_o_lc-all-c-sits-on-the-leaf-git-invocation-not-on-the-test-files-shared-git-helper.md` names `hooks/lib/__tests__/circle-stash-git-exclusion.test.ts`, which step 6 deletes and step 3 did not. Leave it alone until step 6.

**Why the sweep was missed, and why that is the part worth fixing.** The plan's step 2 and step 3 file lists name code, prompts, prose, fixtures and configuration, and no record. Step 8, the investigator fold, does name one: `shared/decisions/260812-0254_o_should-the-investigator-get-case-folders-with-a-status-per-case.md`, and the Circle record explains why (*"retired by the investigator fold rather than answered; close it with the fold"*). The obligation exists in the Circle's own reasoning and reached exactly one of the fifteen steps. The executing coder closed two Plane records on its own initiative, `shared/issues/260810-0410` and the layout-tree record, which is evidence that the obligation was understood and not that it was written down.

**Why it costs something.** Three consumers read open-marker counts and all three are due before this Circle closes. The Circle's `## Closure criterion` asks for a before-and-after measurement. `bin/fusion-churn-rank` and the playmaker's portfolio pass rank open work. And the Circle's own Grounding argues from a defect rate of 1.37 records per commit against a 91 percent closure ratio, so seven records that cannot be closed by anyone distort the very figure the removal is being justified by.

**The fix.**

1. Close all seven with the marker rename `_o_` → `_c_`, keeping each body intact and appending one `Resolved:` line naming this Circle's step 2 and the commit that removed the subject. Follow the shape `shared/issues/260810-0410_c_…md` already uses, not the stub shape recorded in the sibling finding `260815-0803_o_the-layout-tree-record-is-live-under-two-names-…`.
2. Add a record-sweep line to the plan's remaining removal steps, in step 8's form: before a step deletes a file, name the open records whose `**Affects:**` cites it. Eleven removals are still ahead, and each will produce its own set.
3. Consider whether the sweep is mechanisable rather than remembered. `hooks/lib/__tests__/reference-resolution-lint.test.ts` already resolves plugin-shaped paths in shipped text against the tree; it does not read `fusion-workbench/`. Whether it should is a decision, not a defect, and is not proposed here.

---

**Reconciliation 260815-1913 (reconciler, HEAD `9306f0a`) — four of the seven are closed, three are
out of reach, and the population the record measured has more than doubled.**

*Discharged.* The four records this record lists that sit in `shared/issues/` were each re-verified
against the tree and closed `_o_` → `_c_` with a `Resolved:` footer naming the deleting commit, in
the shape the record's fix step 1 prescribes: `260810-0918_c_push-fixture-without-rebuild-map-…`,
`260810-1158_c_a-third-derivation-site-…`, `260813-1051_c_an-unguarded-mktemp-in-plane-curl-…` and
`260813-1051_c_the-plane-curl-regression-guard-…`. Each names `d0ddabb`, which deleted
`bin/fusion-plane` and `hooks/lib/__tests__/fusion-plane.test.ts`.

*Out of reach, so this record stays `_o_`.* Three of the seven sit in other Circles —
`circles/260719-1536-plane-mirror-integration/issues/260719-2304_o_…`,
`circles/260813-0858-playmaker-maintains-backlog-store/issues/260813-1036_o_…` and
`circles/260813-0910-documentation-matches-shipped-plugin/issues/260813-2305_o_…`. `bin/fusion-paths`
resolves `$SCAN_ISSUES` to the Circle in scope plus `shared/` and to nothing else
(`rules/fusion-workbench-conventions.md` `## Path Resolution` → *Two invariants*), so no pass run
from this Circle reaches them. Each was read and each is moot on the same evidence; closing them
needs a run with that Circle in scope, or a user `mv`.

*The count is no longer seven.* The record was filed at Turn 1, after two of the fifteen steps. Ten
further removals have landed since, and the same class now covers **fifteen** shared records rather
than four. Eleven beyond the Plane four were verified moot and closed by this pass: the churn
stand-down (`260810-1632`, `a69d56e`), the stash-era git helper and the `circle-stash` max-turns
reader (`260813-1051` LC_ALL, `260811-2150`, both `5d29b6d`), four state-drift records
(`260811-1614`, `260811-2307` ×2, and the anchor record, all `f45f76a`), and four queue records
(`260810-0510` partially, `260811-1144`, `260811-1915`, `260811-2330`, `260814-2205`, all `dd312eb`).

*What the record asked for that did not happen.* Fix step 2 — add a record-sweep line to the plan's
remaining removal steps, in step 8's form — was not applied to any of the eleven steps that followed.
The evidence is this count: had it been applied, these fifteen would have been closed by the commits
that removed their subjects rather than by a reconciliation pass three Turns later. Fix step 3, the
question of whether the sweep is mechanisable, remains unfiled as a decision.

---
Resolved: Discharged by closing the three Plane-mirror records above: the 260815-1913 reconciliation closed four of the seven and named these three as the out-of-reach remainder, so the closure list completes here. Fix step 2 is unactionable now that all fifteen plan steps landed and the Circle closed; fix step 3 was explicitly a decision it did not propose.

Closed as part of the Turn-1 housekeeping batch of session 260815-2147, after a re-verification pass against HEAD confirmed the condition no longer holds.
