# Cut fusion to a working minimum

---
**Domain:** code
**Filed by:** shaper (anticipated-circle mode), Kai Stalmann <ks@qantr.com>
**Claim:** Claimed 260909-1702: Kai Stalmann <ks@qantr.com>, checkout 5e8248d7.
**Active spec/plan:** 260909-1615_*_spec-cut-fusion-to-a-working-minimum.md
**Active session history:** 260909-1331-orchestrator-session.md

---

## Directive

See `**Active spec/plan:**` above. The cited spec or plan states the Directive in force.

## Grounding snapshot

**This Circle is a container for work whose specification already exists.** The spec was written
on 2026-09-09, revised against an adversarial review the same day, and is cited above rather than
summarised here. Its `## Evidence basis` section names what governs, what is established, what is
established in direction only, what was corrected and may not reappear, and what is forbidden as a
justification. None of that is restated in this record; a second copy is what the pointer form of
`## Directive` exists to prevent, and the same argument reaches the evidence.

**The evidence chain, cited where it lies.** The analysis
`260909-1047-size-versus-bookkeeping-across-three-projects.md`, its verification
`260909-1345-verification-of-the-size-versus-bookkeeping-analysis.md`, which governs over it, and
the adversarial review `260909-1628-adversarial-review-of-the-cut-fusion-to-a-working-minimum-spec.md`,
which governs over both wherever it re-measured. All three sit in the shared store, filed before
this Circle existed; by the Origin Rule they stay there and are cited, not moved.

**What the shaping run settled, and what it did not.** Four clarification questions were answered
by the user: the cut runs to the deepest tier and is cumulative across all four, the agent roster
included; no agent writes a session history at all; there is no closing pipeline; and the byte
bound is zero-sum, includes `CLAUDE.md`, and is carried outside this repository by the hook that
already fires on every dispatch. Two decisions were left open and are filed as records in this
Circle's own decision store: whether the live dashboard file survives, and whether the plan-size
ceiling fails hard or only reports. Both are stated at length in the spec's
`## User Decisions Pending` and the records cite it rather than restating the trade-off.

**Three issues the review filed are answered inside the spec and still carry the open marker.**
`260909-1631_*_the-cut-spec-removes-agentstate-yaml-whose-existence-gates-every-machine-written-event-row.md`,
`260909-1632_*_the-cut-specs-analyst-row-forbids-the-project-writes-its-own-claude-md-gate-requires.md`
and `260909-1633_*_the-zero-sum-bounds-baseline-is-armed-at-the-moment-that-absolves-the-cut-it-must-measure.md`.
The spec's answers are in C2, C7 and C8 respectively. Nothing has transitioned them, so a run that
opens the issue store will meet them as outstanding.

**Seven further open issues from the same day belong to the evidence rather than to the work.**
Five are the verification's corrections to the analysis:
`260909-1345_*_the-size-analysis-understates-the-always-on-peak-and-the-august-cut.md`,
`260909-1346_*_the-rule-growth-bound-covers-the-core-while-the-hottest-path-grew-29-percent-back.md`,
`260909-1347_*_the-eightfold-bookkeeping-rise-excludes-337-legacy-stamped-records-from-the-two-anchor-months.md`,
`260909-1348_*_recommendation-7-names-an-archive-confirmation-the-cleanup-pipeline-does-not-put.md`
and `260909-1349_*_finding-17s-setup-pointer-claims-name-the-wrong-agents.md`. Two were filed
against fusion's own event log and citation gate in the same session:
`260909-1454_*_a-dispatch-outside-a-recorded-session-writes-no-event-row-and-nothing-reports-it.md`
and `260909-1455_*_an-analysis-and-its-history-file-share-one-basename-and-the-citation-gate-is-red.md`.
The five corrections are what the spec's `## Evidence basis` forbids reappearing downstream. None of
the seven is this Circle's work item.

**The workbench state this Circle was created into, measured 2026-09-09.** No `.active-circle`
pointer exists and no Circle record carries `_t_`, so this checkout holds nothing active and the
spec resolved into the shared store. Twenty-five Circle directories stand under `circles/`, of
which one other carries `_a_`. The backlog store holds two entries, one `_p_` and one `_c_`; C6
promotes that store to hold every work item, so its present size is the baseline the migration
starts from.

**The one live conflict, and it is with the other anticipated Circle.** See `## Dependencies`.

## Dependencies

`260908-2018-prerequisites-confirmed-once-order-computed`. **Conflicting, and the conflict is
substantive rather than an ordering nicety.** That Circle builds a confirmed prerequisite relation
over units of work, writes each edge into a Circle record's `## Dependencies` section, and feeds
computed depth, topological order and readiness into playmaker's ranking. This Circle's C6 removes
the Circle record, the `## Dependencies` specification, `portfolio.md`, playmaker, `/fusion:next`,
`/fusion:direct` and the Circle branch of `bin/fusion-paths`; C7 removes playmaker as a role; and
C6 makes the order of work the user's and not computed. If this Circle lands first, that Circle's
Directive names surfaces that no longer exist and its own snapshot's measurements are void. If
that Circle lands first, its output is built on a layer this one then removes. The two cannot both
proceed as written, and which one gives way is the user's call at activation, not this record's.

Binding artifacts, cited rather than copied per the Origin Rule:

- `260909-1615_*_spec-cut-fusion-to-a-working-minimum.md` is the Directive, the capabilities, the
  stopping conditions and the constraints. Everything this Circle does is specified there.
- `260822-1102_*_what-happens-when-a-planned-circles-required-work-exceeds-the-remaining-head-room.md`
  was answered option 1, a cut-only Circle runs first when a bounded surface has no room left. This
  Circle is that cut, at the scale of the whole plugin, so the answer binds it as the precedent
  rather than as an obstacle.
- `260909-1634_*_how-should-the-skill-surface-be-cut-once-the-agent-and-ceremony-cut-has-landed.md`
  is downstream of this Circle by its own wording and is not a dependency of it.
- `rules/circle-records.md` and `rules/fusion-workbench-conventions.md` own the vocabularies and
  the layout C6 retires. The terminal-states statement in the first forbids writing into a
  terminal record, which bounds what the C6 migration may touch.

## Turn log
