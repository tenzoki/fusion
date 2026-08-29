# Reduce the surface, so a claim cannot go stale in several places at once

---
**Severity:** Medium
**Domain:** code
**Filed by:** orchestrator, session 260811-0752-orchestrator-session.md, realising an answered decision
**Affects:** the shipped text surfaces — `agents/*.md`, `skills/*/SKILL.md`, `rules/*.md`, `README*.md`, `CLAUDE.md`
**Cross-references:** `260810-1635_*_where-does-the-obligation-sit-to-update-the-artefact-that-explains-a-behaviour-when-the-behaviour-changes.md` — the answer this realises; `260811-1522_*_…` (the same rule applied to the hooks README table); `260811-1712_*_max-turns-is-hardcoded-in-eight-places…` (an instance)

---

The answered decision took **none** of its four options. It re-cut the question: the obligation is
placed on no reviewer, executor or gate. The surface is reduced instead, so that a claim stated
once and cited from every other site cannot go stale in several places at once. This answers a
question a mechanism can act on (is this claim stated twice?) in place of one a diff cannot (which
artefact explains this behaviour?). `rules/critical-stance.md` §4 is the governing rule.

**This is the largest of the realisation records and it should not be attempted in one dispatch.**
The work is: identify claims currently stated in more than one shipped surface, pick the authoring
home for each, replace the rest with citations, and let the existing duplication gates carry what
remains. `rules/fusion-workbench-conventions.md` already did this to four of its own topics and is
the worked precedent, including its header table naming where each topic went.

**Known instances to start from**, all measured rather than suspected: the five this session
counted (three in the Turn 2 review, the churn contract left old on a fifth surface, the routing
table); `max_turns` in seven places; the hooks README lib table, which has its own answered
decision and its own record.

**Acceptance is per instance, not for the class.** Do not close this record on a rule being
written down: it closes when the named instances have one authoring home each. Split it into
per-surface records if that reads better in the queue.

**Explicitly not the answer:** an obligation in a reviewer or executor prompt, and a gate that
tries to derive "the artefact explaining this behaviour" from a diff. Both were considered and
rejected in the decision; do not reintroduce either as a supplement without re-opening it.

---
**Reconciliation 260817-1836** (reconciler, domain `code`, HEAD `2552586`; log `260817-1836-reconciliation.md`). Umbrella record, acceptance per instance. Two of its three named instances are settled. The Turn budget no longer lives in seven places: `bin/fusion-turn-budget` resolves it once and `agents/orchestrator.md` carries no number. The churn-contract instance is moot — the heatmap was removed on 2026-08-15 and `grep -rn churn agents/ rules/` is empty. The routing-table instance is open and is tracked by `260811-1301_*_the-orchestrators-routing-table-omits-cargo-toml-from-the-build-manifests.md` and `260811-1613_*_four-prompts-now-defer-to-a-routing-table-that-still-carries-the-gap-260811-1301-names.md`. Marker stays open until that one closes.

---
**Resolved: fixed** (coder, Circle `260824-1853-close-every-open-defect` step 14, HEAD `6b26e2c`, range `571f945..6b26e2c`; log `260824-2150-coder-step-14-closing-measurement.md`). Umbrella record, acceptance per instance, and all three named instances now have one authoring home: the Turn budget in `bin/fusion-turn-budget` (reconciliation 260817-1836), the churn contract moot since the heatmap left on 2026-08-15, and the routing table through `260811-1301_*_the-orchestrators-routing-table-omits-cargo-toml-from-the-build-manifests.md` and `260811-1613_*_four-prompts-now-defer-to-a-routing-table-that-still-carries-the-gap-260811-1301-names.md`, which this Circle closed in steps 11 and 12 (triage rows 21 and 23). Closes on the Circle's closing measurement of the shipped surfaces at `6b26e2c`:

- `cd hooks && npm test`: 43 files, 760 tests, exit 0.
- Head-room per bound, as each test computes it (total / budget / head-room left): `agents/` 414 168 / 417 843 / **3 675 bytes**; `skills/` 238 669 / 240 439 / **1 770 bytes**; hook tests 20 373 / 20 375 / **2 lines**; always-on rules 98 357 / 98 573 / **216 bytes**.
- Role rule-text report (stderr, non-blocking): `playmaker` 24 653 against 21 302 (over by 3 351); `shaper` 29 938 against 26 975 (over by 2 963); `orchestrator` 30 760 against 30 552 (over by 208). All three attribute the growth to `circle-records.md +15 351`.
- `git diff 2cdd372 -- hooks/lib/__tests__/surface-growth-bound.test.ts hooks/lib/__tests__/rules-emission-golden.test.ts | grep -E '^[-+].*BASELINE'` prints nothing: no baseline map moved.
- `bin/fusion-prose-metric` over the five always-on files, all `ok`: `agent-setup.md` 0/488, `fusion-workbench-conventions.md` 6/8 279 (0.7 per 1 000, permit 8), `decision-record-examples.md` 0/332, `user-facing-output.md` 1/2 678 (0.4, permit 2), `critical-stance.md` 0/1 492.
- `find fusion-workbench -path '*/issues/*' -name '*_[op]_*' -not -path '*/archive/*'` prints nothing after this record and `260824-1538` close.

What the figures say about the class this record names: the surface stops growing only by cutting, and three of the four blocking bounds are within one ordinary edit of red (2 lines, 216 bytes, 1 770 bytes). That is the next cleanup's subject, tracked by the open decision `260822-1154_*_does-a-cut-only-circle-re-baseline-the-surfaces-it-cuts.md`, not by this record.

---
Corrected: 260824-2147 (ontocoder, issue `260824-2155_*_the-umbrella-closure-note-names-two-steps-for-two-rows-the-triage-assigns-to-one.md`) — "which this Circle closed in steps 11 and 12 (triage rows 21 and 23)" reads "step 12 (triage rows 21 and 23)": the triage table assigns both rows to S12 (`260824-1905_*_plan-close-every-open-defect.md:274,276`) and both records cite `agents/orchestrator.md` alone. The `Resolved:` note stands as written.
