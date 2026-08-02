# Portfolio

**Generated:** 260802-1736 (by playmaker session 260802-1736)
**Domain bias:** code

No Circle is active. Two anticipated Circles remain, down from three, because
`260801-1244-rule-provenance-header` closed coherent at commit `060859b`. The recommendation
changes this run: `260801-1244-guard-rules-write`, which the previous three runs ranked second.
The reason is not that the curator got worse but that the last unguarded route into `rules/`
closed, which makes the flag this Circle builds the precondition for a curator that works
anywhere but here. The curator should also be split before it is activated, and the case for
splitting it is stronger than it was, not weaker.

## Active (_t_)

(none) — no Circle record carries the active marker (`_t_`), and `fusion-workbench/.active-circle`
is absent. That pairing is the normal state after a closure, not a fault.

The Circle that occupied the last working session, `260801-1244-rule-provenance-header`, closed
coherent and appears under `## Recently closed` below.

## Anticipated (_a_) — ranked

**Recommended next:** `260801-1244-guard-rules-write` — the guard now blocks every route into a
consuming project's rule files, and this Circle builds the flag that deliberately reopens one, so
a curator shipped before it cannot do its rule-file work outside this repository.

### 1. `260801-1244-guard-rules-write`

*A project can permit rule-file writes deliberately, per session, and never silently.*

**Dependencies:** `260801-1244-guard-bash-inspection`, closed coherent, so the dependency is met.
**Open decisions cited in its Grounding:** none.

Both remaining Circles pass the code-domain criteria without needing an argument, so the ranking
turns on unblock value, and this run it turned over. Each has all its hard dependencies closed,
and neither cites an open decision record. The shared decision store holds no open record at all:
of the three that frame this body of work, two are answered and awaiting realisation
(`shared/decisions/260801-1020_a_where-does-normative-consistency-live.md`,
`shared/decisions/260801-1020_a_may-any-fusion-writer-touch-rules.md`), and the third moved from
answered to implemented at this closure
(`shared/decisions/260801-1020_i_provenance-header-on-rule-files.md`).

What separates them is a consequence of the Circle that closed one before last. Sealing the shell
route into protected paths left no way for a curator to reach a consuming project's rule files at
all. `hooks/config.json` lists `rules/**` under `guard.protectedPaths`, and since
`260801-1244-guard-bash-inspection` closed, the guard checks that list on file-mutating shell
commands as well as on the four write tools, so `mv`, `sed -i` and shell redirection are covered
alongside `Edit`. The flag that is supposed to open a deliberate, per-session, logged exception,
`FUSION_ALLOW_RULES_WRITE`, is what this Circle builds and does not yet exist. The spec's own
reconciler recorded the same state on 260801-2029: the retirement requirement is enforceable in
principle because the shell route is guarded, and unenforced in fact because the flag and the
advisory event do not exist.

The curator record calls its dependency on this Circle soft, and for building and testing the
agent in this repository that label is correct, because the write guard stands down in the
plugin's own tree. It understates the position for the consuming projects the curator exists to
serve, where an agent shipped without the flag would be unable to write or retire a rule file by
any route. Taking this Circle first also means the curator then activates with no unmet dependency
of either kind, which turns the remaining work into a sequence rather than a choice.

**On activation:** budget the consuming-project fixture work as its own plan step. This Circle's
acceptance criteria cannot be verified here (`hooks/lib/self-detect.ts:18-33`), and it touches the
same guard code as the Circle that overran. See `## Sizing note`.

### 2. `260801-1244-curator`

*The curator reconciles the three normative surfaces, and proves it on fusion's own conventions
file.*

**Dependencies:** `260801-1244-rule-provenance-header` (hard) is now closed, so the block that
held this Circle for three runs is gone. `260801-1244-guard-rules-write` (soft) is still
anticipated. **Open decisions cited:** none.

Second, and the recommendation attached to it is to split it before activating rather than to
activate it. It carries the substance of the parent Directive and it is no longer hard-blocked.
Three things argue against taking it whole and next: its remaining dependency is soft only in this
repository, its size has not changed while the evidence about size has, and several measured facts
in its Grounding snapshot have gone stale. All three are treated under `## Sizing note` and
`## Warnings`.

## Recently closed (_c_ / _b_)

Newest first. All seven carry the closed-coherent marker (`_c_`); none reached Bounded Closure.

| Circle | Marker | Closure in one line |
|---|---|---|
| `260801-1244-rule-provenance-header` | `_c_` | All ten plugin rule files now name what caused them to exist, and a recursive lint gate in the test suite fails when one does not. Three Turns, eight commits, suite 753 to 780 tests. |
| `260801-1244-guard-bash-inspection` | `_c_` | The guard now checks file-mutating shell commands against the protected paths for all sixteen agents, and four pre-existing holes in the shipped git branch classifier were closed on the way. Shipped v5.8.0. |
| `260719-1536-plane-mirror-integration` | `_c_` | The Plane bounded bridge is implemented and offline-proven across six commits, with two go-live follow-ups deliberately left open. |
| `260719-1536-brest-unite-co-creator-conversion` | `_c_` | The unite-co-creator context-loading conversion passed 9 of 9 acceptance checks; that project's `CLAUDE.md` shrank by 80 percent. |
| `260718-1924-v5x-overhaul` | `_c_` | The five-package v5.x overhaul completed through v5.4.0: coordination analysis, context mechanism, editor agent, prompt revision, docs. |

Older: `260717-1638-marker-format-ohne-glob-metazeichen` (`_c_`), state markers moved to the
underscore form, v5.0.0; and `260716-1847-workbench-umbau` (`_c_`), the workbench restructure into
Circle containers, v4.0.0.

## Archived (_s_ / _d_)

(none) — no Circle has been superseded or deferred.

## Warnings

No dependency cycle was found. With the provenance Circle closed, the graph over the two
anticipated Circles is a single chain.

```
guard-bash-inspection (_c_)
        └──> guard-rules-write (_a_) ┐
                                     ├──> curator (_a_)
rule-provenance-header (_c_) ────────┘
```

No parent-Grounding-stale condition was raised. That check fires only when a child Circle reaches
Bounded Closure (`_b_`), and no Circle in this workbench carries that marker.

Seven conditions are worth your attention. The first three are new this run and all three land on
the curator.

- **All three `Binding decision:` citations in the conventions file are now dead, and the newest
  one was written and broken inside the Circle that just closed.** The section-scoped citation
  form was formalised at `rules/fusion-workbench-conventions.md:588` during that Circle, and its
  own worked instance at line 592 cites
  `shared/decisions/260801-1020_a_provenance-header-on-rule-files.md`. That path stopped resolving
  when the record moved from answered (`_a_`) to implemented (`_i_`) at closure, hours later. The
  other two were already dead and are filed
  (`circles/260801-1244-rule-provenance-header/issues/260802-1252_o_binding-decision-formalised-while-both-existing-instances-are-dead.md`,
  `shared/issues/260801-1215_o_conventions-file-cites-three-records-that-do-not-resolve.md`). What
  is new is the mechanism rather than the count: a citation whose path carries a state marker goes
  dead every time the record's state advances, so this form breaks on ordinary progress and not
  only on neglect. The file-scoped `Provenance:` headers do not have the problem, because all ten
  cite either a Circle directory or a commit, and both are markerless. Two of the three curator
  capabilities that touch the conventions file assume these citations resolve. This is reported,
  not corrected: playmaker does not edit rule files.
- **The curator's measured Grounding facts moved, and the Circle that just closed is what moved
  them.** The record states that every agent receives 87 387 bytes of always-on rules, of which
  the conventions file is 54 401. Measured today, the seven always-on files emitted by
  `bin/fusion-rules` total 110 685 bytes and the conventions file is 59 303, having grown 4 902
  bytes when the closed Circle added its `## Provenance headers on rule files` section. The
  conclusion the record draws from the ratio survives, since the conventions file is still the
  dominant always-on payload at 54 percent, but the numbers supporting it do not. The heading
  count moved with it: the record says 32 second-level headings against 18 document sections, and
  there are now 33. The warning attached to that count still holds, since a partition driven off
  `^## ` would still shred the three embedded templates. Citations into the file also grew, from
  the record's 131 lines across 42 files to 136 lines across 43, measured over `agents/`,
  `skills/`, `bin/`, `hooks/`, `docs/`, `rules/`, `README*.md` and `CLAUDE.md`. Shaper should
  re-take all four at activation rather than inherit them.
- **The lint gate will check the curator's shards, but it checks less than the phrase suggests.**
  The closure note tells the next Circle that the gate recurses, and it does: the traversal reads
  every `*.md` under `rules/` at any depth, and the gate's own source names the curator's shards
  as the reason. The gate is presence-only by deliberate design. It reads no value, resolves no
  cited path, and passes a header naming a record that never existed
  (`hooks/lib/__tests__/provenance-header-lint.test.ts`). Paired with the closure note's second
  point, that the superseded-check payoff is forward-only because none of the ten backfilled files
  cites a decision record, the mechanical support the curator inherits is thinner than it reads:
  the gate proves each shard has a header line and nothing beyond that. Shard provenance needs
  review attention rather than gate reliance, which bears on how the closing work is scoped.
- **The workbench is tracked in git, and the curator record still says otherwise.** This was
  reported at the previous run and is uncorrected. The record lists as a verified constraint that
  "the workbench is neither tracked nor gitignored here, so decision-record edits have no git
  undo", and draws two design requirements from it: that the agent write every modified record's
  pre-edit content into its own history file, and that the archive store is ruled out as the
  retirement destination. `git ls-files fusion-workbench/` returns 273 files today, up from 237 at
  the previous run. The requirements may still be right for consuming projects, where fusion ships
  no ignore rule, but the record presents a local measurement as the reason and that measurement
  is false. Shaper should re-ground it at activation.
- **The same commit still partly overtakes an open issue.**
  `shared/issues/260801-1020_o_workbench-untracked-breaks-archive-durability-premise.md` rests on
  `git ls-files fusion-workbench/` returning zero files. The issue's second half is untouched:
  `CLAUDE.md` still calls the workbench a gitignored runtime artifact, and `skills/archive/SKILL.md`
  still states its durability premise unconditionally, which the issue flags as unsafe regardless
  of what this repository chooses. The issue needs re-verifying, not closing.
- **The task queue is still stale.** `fusion-workbench/tasklist.md` holds the fully closed queue
  generated on 260716-1920 for the workbench-restructure Circle, and it names a plan path in the
  pre-v4 bracket-marker format. Filed as
  `shared/issues/260801-2038_o_tasklist-holds-a-fully-closed-queue-from-a-circle-closed-two-weeks-ago.md`.
  The queue belongs to taskplanner and the orchestrator; playmaker only reports it. It needs
  rebuilding at the next activation.
- **Nineteen open issues sit in the shared store, one more than at the previous run, and five more
  are open inside Circles.** The new shared one is
  `shared/issues/260802-0920_o_next-skill-activates-a-circle-without-updating-its-status-field.md`,
  filed during the closed Circle: no prompt or skill step requires a record's header fields to be
  updated when its marker moves, and the reconciler found two of nine Circle records disagreeing
  with their own marker. The closed Circle's own record is a live instance, left that way
  deliberately so the defect is fixable at its source. Three of the five in-Circle issues were
  left open in `260801-1244-rule-provenance-header` by explicit user decision rather than
  oversight; the other two are in `260719-1536-plane-mirror-integration` and
  `260801-1244-guard-bash-inspection`.

## Sizing note

**The recommendation to split `260801-1244-curator` before activation still holds, and this run's
evidence strengthens it rather than repeating it.** The seam is unchanged and the record draws it
itself: building the agent is capabilities C1 through C4, C6 and C7, applying it to the
conventions file is C9, and the record already states that C9 does not begin until C1 through C8
are complete. That is a Circle boundary described in prose. What changed is the base rate against
which the size is judged.

The previous run rested the argument on one overrun. There are now two, and the second is the
more telling. `260801-1244-guard-bash-inspection` ran sixteen commits and three Turns against
eight planned steps. `260801-1244-rule-provenance-header` was forecast in this document as the
opposite case and the smallest of the three: a lint test following an existing pattern, a backfill
of ten files, one section in the conventions file, verifying in this repository against a
mechanical check. It ran three Turns and eight commits against a four-step plan, filed ten review
findings of which three are still open, delivered fourteen non-workbench paths against a plan that
bounded itself to eleven and declared anything else drift, and reached Phase 3 with a verdict of
`review-needed` rather than `coherent`. Boundedness and in-repo verifiability were the two
properties that made it the low-risk case, and it overran anyway. The curator carries seven
capabilities and roughly sixty acceptance criteria against that base rate.

The third argument is specific to the closing work. C9's shards inherit less mechanical support
than the closure note's summary implies, because the gate checks that a header is present and
stops there. Shard citations that name nothing, or that name a record whose marker later moves,
pass. The conventions file demonstrates the failure three times over today, including once in a
line written last session. Reconciling those citations and then producing dozens more that must
stay resolvable is review-heavy work of a different kind from building an agent, and it deserves
its own Circle with its own review budget rather than arriving as the tail of a seven-capability
one.

`260801-1244-guard-rules-write`, this run's recommendation, carries the risk profile of the Circle
that overran first: the same guard code, a configuration loader with merge semantics, a
self-protection floor, a fallback path, and acceptance criteria that cannot be verified in this
repository because the write guard stands down here. The first overrun came from a shell-parsing
surface that proved wider than the plan assumed, and a configuration-resolution surface fails the
same way. Its plan should budget the fixture work explicitly as a step rather than treating
verification as a final sweep.

## References

- Spec covering all four Circles: `shared/planning/260801-1122_o_spec-normative-consolidation.md`
- Closure note behind this run: `circles/260801-1244-rule-provenance-header/_c_circle.md`
- Session that closed it: `circles/260801-1244-rule-provenance-header/history/260802-0848-orchestrator-session.md`
- Gap analysis behind the body of work: `shared/analyses/260801-1020-normative-surface-drift-gap-analysis.md`
- The lint gate, read this run: `hooks/lib/__tests__/provenance-header-lint.test.ts`
- Previous playmaker run: `shared/history/260802-0811-playmaker-direct-dispatch.md`
- This playmaker run: `shared/history/260802-1736-playmaker-direct-dispatch.md`
