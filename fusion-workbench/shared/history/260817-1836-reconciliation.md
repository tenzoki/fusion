# Reconciliation — 260817-1836

**Agent:** reconciler
**Domain:** `code`
**HEAD at pass:** `2552586` (session-start anchor `83a18a5`)
**Active Circle:** none, so every store resolved to `shared/`
**Session being closed:** `shared/history/260817-1821-orchestrator-session.md`, which stated no
Directive and produced one commit carrying only its own setup record.

## What this pass was for

The session under reconciliation did no execution work, so there was no fresh work to verify. What
the pass measured instead is accumulated drift in the shared stores: 93 open defect records, 2 open
decisions, 1 open plan whose own header read `Final`, and 25 active Grounding records. Every verdict
below was taken against the tree, not against a record's own prose or an earlier pass's report.

## Counts

| Store | Reviewed | Changed |
|---|---|---|
| `shared/planning/` | 9 files | 1 (the one open plan, closed) |
| `shared/issues/` | 93 open of 339 | 10 closed, 83 annotated, 1 new record filed |
| `shared/decisions/` | 56 | 1 walked `_a_` → `_i_`, 9 annotated, 2 open annotated |
| `shared/reviews/` | 27 | 4 annotated |
| `circles/` | 16, all terminal | none |

Store state after the pass: 84 open defects (was 93), 255 closed; decisions 2 open, 22 answered,
29 implemented, 2 deferred, 1 superseded; no open plan.

## The plan: closed on an answer that had been sitting unapplied

`shared/planning/260801-1122_*_spec-normative-consolidation.md` moved `_o_` → `_c_` and its
`**Status:**` moved to Complete, with the authoring status text preserved verbatim beside it.

The marker did not move because this pass judged the work done. It moved because the user already
decided it and nobody had carried it out. Decision
`260814-2017_*_does-a-parent-spec-close-when-its-last-circle-does-if-three-of-its-capabilities-were-retired-rather-than-delivered.md`
was answered on 2026-08-16 with option 1, close `_c_` with a mandatory closing note naming the three
retirements, recorded in `shared/history/260816-1500-orchestrator-session.md`. The plan stayed `_o_`
for a further day. Four earlier reconciliation entries on that same file had each re-derived the same
judgement and declined to act on their own authority, which was correct at the time and is what the
decision record was filed to end.

Verified in the tree before moving the marker:

- `agents/curator.md` (33 621 bytes) and `skills/curate/SKILL.md` (12 797 bytes) exist, and
  `bin/fusion-rules:168` and `:179` name `curator` in both emission branches.
- All four Circles the spec spawned carry `_c_` (`circles/260801-1244-{curator,guard-bash-inspection,guard-rules-write,rule-provenance-header}/_c_circle.md`).
- The three retirements still hold. C5c's subject is gone: `hooks/guard.ts` is 223 lines and every
  path allows. C4 and C9 are recorded retirements with no shipped counterpart.

The closing note written into the file also records something the user's answer did not cover,
because it is a fourth case rather than a fourth retirement: C5a and C5b were **delivered and then
removed**. The rules-write exemption and its project-level guard configuration landed in
`circles/260801-1244-guard-rules-write` and were deleted with the protected-path half on 2026-08-12.
`FUSION_ALLOW_RULES_WRITE` survives only in comments recording its retirement and in test fixtures.
Read `Complete` on this file as "nothing further is expected from it", never as "delivered as
specified".

Decision `260814-2017` then walked `_a_` → `_i_` citing the rename, and its `**Status:**` header
moved from `answered` to `implemented` in the same edit.

## Defect records: what the tree said

Ten records closed. Seven were fixed, three are moot because the mechanism they are about was
removed rather than repaired.

**Fixed:**

- `260809-2258` — `README-hooks.md:185` dropped the stale count instead of correcting it, which was
  the record's own second fix direction.
- `260811-2239` — `CLAUDE.md` now carries one Layout row per `bin/` helper, twelve against twelve,
  and the enumeration lint gates it in both directions.
- `260811-2304`, `260811-2305` (two records) — all three are consequences of one change: the Turn
  check-in moved from the end of a Turn to the start of one (`agents/orchestrator.md:470`, `:655`,
  `:915`). The path that exited before the gate now meets it on re-entry, the converging Turn is no
  longer asked a question whose answer is discarded, and the unbounded-loop exception is stated
  rather than described away.
- `260813-0825` — every one of the seven surfaces the record named now carries the v8.1.0 feature,
  and the three stale claims it cited are gone from `README-agents.md` and `CLAUDE.md`.
- `260816-0141` — the plugin manifest's own description was brought up to date in `a7f70b9`.

**Moot:**

- `260812-0758` and `260812-0843` — both are about the guard's configuration surface. There is no
  inherited protected-path list left to go stale, and the second record's stronger branch ("or not
  shipped to consumers at all") is what actually happened.
- `260812-1232` — a correction to a claim about how many inputs the escalation counter has. The
  counter, the halt and CHECK 3 were all deleted on 2026-08-16.

**Twelve records are partly settled** and keep their `_o_` marker with the split recorded on the
record itself: `260801-1410`, `260810-0510`, `260810-0819`, `260810-2025`, `260810-2110`,
`260811-1734`, `260811-2146`, `260812-0253` (two of the five), `260814-1001`, `260814-2118`,
`260816-0740`. The recurring shape is that the mechanism half was removed while the text half was
not, or that one named instance closed while the class stayed open.

**Every remaining open record was re-verified against HEAD and stamped** with the file and line that
still reproduces it. None was closed on an argument; where the defect reproduces, the citation is on
the record.

### Misfiled — should be a decision

Two records are defects by filing and decisions by content. Both say so in their own text, and both
need a user choice rather than a fix, so neither can be closed by an executor:

- `shared/issues/260812-2136_o_the-citation-grammar-reads-one-ellipsis-and-one-marker-syntax-and-the-workbench-uses-two-of-each.md`
  — its conclusion is that the choice is between a parser that reads a retired spelling and a corpus
  that keeps one.
- `shared/issues/260816-0025_o_the-archive-skills-never-archive-list-omits-the-migration-backup-store-while-naming-its-twin.md`
  — "fixing it changes shipped behaviour, so it is a decision to take on its own merits".

To relocate either, move the file from `shared/issues/` to `shared/decisions/` by hand and translate
its marker into the decisions vocabulary. A reconciliation pass does not move records between
stores.

### One record is a candidate for closing that only the user can close

`260814-2258_o_a-tracked-install-sh-vanished-from-the-working-tree-mid-task-with-no-cause-established.md`
states its own closing condition: a second occurrence, or an explicit close as not reproducible.
`install.sh` is intact at HEAD and no second instance appears anywhere in the workbench. The
condition for closing it is met; the act is the user's.

## The finding that matters most: answers recorded, nothing built

Nine decision records carry an answer the user gave and an implementation that does not exist. Each
was checked against the tree in this pass and each is annotated on its own record:

| Record | What was answered | What is missing at HEAD |
|---|---|---|
| `260811-1522` | generate the `hooks/lib` table from the modules | no module exports a description; only a row-set lint exists |
| `260812-0254` (plugin defects) | a `plugin-issues/` store plus a skill | neither exists anywhere in the tree |
| `260812-0254` (cited paths) | render absolute paths in chat | no such rule in `rules/user-facing-output.md` |
| `260815-2109` | filter the uncovered set to commits touching shipped files | `hooks/lib/review-coverage.ts` has no shipped-file predicate |
| `260815-2312` | drop the Circle record's `Status` field | `rules/circle-records.md:70` still carries it |
| `260815-2322` | the golden's failure text carries the green-unit sentence | the sentence is in neither the golden nor its helper |
| `260816-0711` (tracked split) | move the subsection to `rules/workbench-tracking.md` | the file does not exist |
| `260816-0719` | a test comparing committed `dist` with committed source | no such test among 37 test files |
| `260816-1707` | `heads/main` is the standard, tags an opt-in pin | the policy is still only a default, which is what the record said is not the same thing |

Eight of the nine were answered in one sitting on 2026-08-16. That is not a criticism of the sitting;
it is the shape of the risk. An answer that lives only in a decision record and a history file is
indistinguishable, six weeks later, from a mechanism that exists, and the marker `_a_` is the only
thing carrying the difference.

Two of them are a **blocking pair** and should be read together: `260816-0711` cannot be realised
until the open record `260816-1707_o_to-whom-is-the-new-workbench-tracking-rule-emitted...` is
answered, and that record says so in its own constraints.

## Decision-record hygiene, measured rather than asserted

Over the 56 records in `shared/decisions/`, **18 carry a `**Status:**` header that disagrees with
their filename marker** and 5 still carry an unfilled template stub. Counting every decision store
including the Circles, the figure is 37 of 106. Two open records track this
(`260811-2146`, `260812-1232`) and both were re-measured rather than re-asserted. No lint reads the
workbench: `hooks/lib/__tests__/marker-format-lint.test.ts` scopes to `agents/*.md` and
`skills/*/SKILL.md` only. This pass corrected exactly one instance, as a side effect of the
`260814-2017` marker walk.

## Reviews

Four review files were annotated, none rewritten. `260716-1853`, `260722-1947`, `260722-2026` and
`260813-1051` all review the Plane bridge, which was removed on 2026-08-15: `bin/fusion-plane` is
gone, `templates/` holds one file, and the only surviving mention of the bridge in shipped text is
`docs/upgrading-to-v9.md`. Their findings are preserved and are no longer actionable, and each file
now says so.

## New record filed by this pass

`shared/issues/260817-1836_o_the-three-edge-verdict-has-no-case-for-a-session-that-stated-no-directive-and-two-of-its-three-edges-are-then-unevaluable.md`

The session under reconciliation stated no Directive. Two of the three Coherence edges ask about
"the stated Directive" and are unevaluable in that state, while the three aggregate verdict values
each assert something about a Directive. `agents/reconciler.md:26` already rules that improvising a
Directive is wrong, and says nothing about the case where the read succeeds and returns its absence.
This pass wrote both edges as `not evaluable` with the reason named, which keeps the history file
honest and leaves the shipped vocabulary unchanged. The record is adjacent to, and a different cause
from, `260817-1613` about a Directive that is reachable and deliberately not reached.

## Uncommitted state left behind

Nothing in this pass was committed. Two marker renames appear in `git status` as a deletion plus an
untracked file rather than as renames, which is the failure mode open record `260810-0819` describes
and which no convention prevents:

- `shared/planning/260801-1122_o_…` → `…_c_spec-normative-consolidation.md`
- `shared/decisions/260814-2017_a_…` → `…_i_does-a-parent-spec-close…`

plus eight further issue renames from `_o_` to `_c_`, the new defect record, and appended
annotations across 83 open defects, 12 decisions and 4 reviews. Stage both halves of every rename.

## Verdict

Written to `shared/history/260817-1821-orchestrator-session.md` `## Coherence`. Aggregate:
`review-needed`, driven by the one edge that was measurable.
