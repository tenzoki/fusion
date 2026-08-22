The spec names five Circles and the workbench holds none of them, so C0 reaches its closure with nothing to transition

---

`shared/planning/260822-1136_*_spec-fusion-becomes-a-multi-user-tool.md` partitions the rebuild into
five Circles and argues at length why C0 is one of them rather than a step inside another. C0 was
then specified, planned, executed and measured with no Circle directory and no Circle record
anywhere under `fusion-workbench/circles/`.

---

**What the tree holds.** `circles/` holds fourteen directories, every one of them terminal — eleven
`_c_`, two `_b_`, one `_s_` — and none created in this session. `.active-circle` was absent
throughout (the orchestrator's Setup snapshot records it, and it is absent at HEAD). So every
artifact C0 produced landed in `shared/`, which is what the Origin Rule prescribes when no Circle is
active and is not itself the fault.

**What the spec and the plan say.** The spec's `## The Circle sequence` draws C0 through C4 as five
Circles and its "**Why C0 is its own Circle and is not absorbed**" paragraph makes the separation
load-bearing: "a Circle holding both a reduction and a feature cannot report the trade between them
honestly". The plan carries `## Where this Circle stops` with seven clauses, one of which
(clause 6) requires "the closure note" to state per-surface figures, and
`shared/history/260822-1540-coder-c0-step-9-closure-measurement.md:193-195` answers that clause
"Not yet, and not this step's to satisfy. The note is the orchestrator's at Phase 4."

**Four consequences, each checkable.** There is no `_t_circle.md` for Phase 4 to transition, so the
`_t_` → `_c_`/`_b_` step has no subject and the state vocabulary in `rules/circle-records.md`
records nothing about C0. The closure note clause 6 asks for has no canonical home: a Circle record
is where a closure note lives, and the plan's `## Reconciliation Log` and the step-9 history are
what exist instead. `portfolio.md` — last generated at `655d976`, before this session — carries
"Recommended next: (none). No anticipated Circle exists", and C1 through C4 are named in a spec the
playmaker does not rank, so `/fusion:next` will report an empty portfolio against a spec holding
four unstarted Circles. And C0's records sit in `shared/` beside artifacts of unrelated origin, so
"which records did C0 produce" is answerable only from the step-9 history's hand-written list
(`:226-262`) rather than from a directory.

**Not a claim that C0 should be retro-fitted.** A Circle directory created now would carry a stamp
hours after the work and would move records that other records already cite by their `shared/`
path, which is the citation breakage `shared/decisions/260816-0119_*_can-anything-carry-the-rename-to-citation-obligation-when-a-record-marker-moves.md`
answered by leaving the obligation with the mover. The question the record raises is what happens to
C1 through C4, which have not started.

**Fix direction, and it is a choice rather than a prescription.** Either the spec's five Circles are
filed as `_a_` Circle records so the portfolio can rank them and each closes as a Circle, in which
case C0 is recorded as a closed one after the fact with its records left where they are and cited;
or the spec is amended to say plainly that its five "Circles" are spec sections executed as plans in
`shared/`, and the Circle vocabulary comes out of the spec, the plan's stopping section heading and
the closure language. The first keeps the instrument the spec's own argument depends on. The second
is honest about what happened. Taking neither leaves four more Circles that exist only as prose.

**Affects:** `shared/planning/260822-1136_*_spec-fusion-becomes-a-multi-user-tool.md` `## The Circle
sequence`; `shared/planning/260822-1154_*_plan-c0-cut-only-circle-buys-head-room-on-four-bounded-surfaces.md`
`## Where this Circle stops`; `fusion-workbench/portfolio.md`.

**Severity:** Medium. Nothing is broken and no measurement is wrong. What is missing is the record
the next session's portfolio pass reads, and the closure surface clause 6 names.

**Found by:** reconciler, session-end pass over `370bfc5..9f65463`, HEAD `9f65463`.
