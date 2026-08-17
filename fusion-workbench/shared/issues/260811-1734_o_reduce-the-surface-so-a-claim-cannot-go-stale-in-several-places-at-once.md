# Reduce the surface, so a claim cannot go stale in several places at once

---
**Severity:** Medium
**Domain:** code
**Filed by:** orchestrator, session 260811-0752, realising an answered decision
**Affects:** the shipped text surfaces — `agents/*.md`, `skills/*/SKILL.md`, `rules/*.md`, `README*.md`, `CLAUDE.md`
**Cross-references:** `shared/decisions/260810-1635_a_where-does-the-obligation-sit-to-update-the-artefact-that-explains-a-behaviour-when-the-behaviour-changes.md` — the answer this realises; `shared/decisions/260811-1522_a_...` (the same rule applied to the hooks README table); `shared/issues/260811-1712_o_max-turns-is-hardcoded-in-eight-places...` (an instance)

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
**Reconciliation 260817-1836** (reconciler, domain `code`, HEAD `2552586`; log `shared/history/260817-1836-reconciliation.md`). Umbrella record, acceptance per instance. Two of its three named instances are settled. The Turn budget no longer lives in seven places: `bin/fusion-turn-budget` resolves it once and `agents/orchestrator.md` carries no number. The churn-contract instance is moot — the heatmap was removed on 2026-08-15 and `grep -rn churn agents/ rules/` is empty. The routing-table instance is open and is tracked by `260811-1301` and `260811-1613`. Marker stays open until that one closes.
