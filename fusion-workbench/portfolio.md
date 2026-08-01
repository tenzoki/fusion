# Portfolio

**Generated:** 260801-2044 (by playmaker session 260801-2044)
**Domain bias:** code

No Circle is active. Three anticipated Circles are queued, all filed today from one spec, and the prerequisite they were waiting on closed coherent this session. The recommendation is `260801-1244-rule-provenance-header`.

## Active (_t_)

(none) — no Circle record carries the active marker (`_t_`), and `fusion-workbench/.active-circle` is absent. That pairing is the normal state directly after a closure, not a fault.

The Circle that occupied this session, `260801-1244-guard-bash-inspection`, closed coherent and appears under `## Recently closed` below.

## Anticipated (_a_) — ranked

**Recommended next:** `260801-1244-rule-provenance-header` — no dependencies, no open decisions, and it is the only hard blocker of the Circle that carries the substance of the parent Directive.

### 1. `260801-1244-rule-provenance-header`

*Every rule file states which record motivated it, and a test enforces it.*

**Dependencies:** none. **Open decisions cited in its Grounding:** none. D1, D2, and D3 (`shared/decisions/260801-1020_a_*.md`) are all answered and awaiting realisation.

This Circle ranks first on the code-domain criteria without needing a tie-breaker: an empty `## Dependencies` section and zero open decision records in its Grounding snapshot is the profile the code bias ranks highest. Two further facts confirm the placement rather than compete with it. The first is unblock value. This is the sole hard prerequisite of `260801-1244-curator`, whose closing step partitions the 54 kB conventions file into shards that the lint gate built here has to check. The gate must exist before there are shards to check it against. The sibling `260801-1244-guard-rules-write` became activatable at the same moment and blocks nothing hard, so taking it first would buy no forward motion for the curator.

The second fact is measured decay. The plugin's `rules/` directory holds ten files today, of which exactly one carries a provenance line (`rules/fusion-workbench-conventions.md:326`), verified by grep on 2026-08-01. The tenth file, `rules/protected-path-discipline.md`, was written during the prerequisite Circle, hours after the provenance decision was answered, and shipped without a header. This Circle's own Directive was drafted against nine files and the backfill set is already ten. A normative surface that grows an unprovenanced file per session is decaying faster than a deferred Circle can wait, and the evidence for that rate is one session old.

**On activation:** shaper should refresh two facts in the Grounding snapshot before planning. The rule-file count reads nine and is ten. The record's statement that the backfill is editable in this repository still holds, and now extends to shell edits as well, because the just-closed Circle put the same plugin-repo stand-down on the shell path.

### 2. `260801-1244-guard-rules-write`

*A project can permit rule-file writes deliberately, per session, and never silently.*

**Dependencies:** `260801-1244-guard-bash-inspection`, which closed coherent this session, so the dependency is now met. **Open decisions cited:** none.

Second because it is unblocked but unblocking. Nothing hard waits on it, and the curator's dependency on it is explicitly soft, needed only for the curator's rule-file writes to be exercisable in a consuming project rather than to build or test the agent here.

### 3. `260801-1244-curator`

*The curator reconciles the three normative surfaces, and proves it on fusion's own conventions file.*

**Dependencies:** `260801-1244-rule-provenance-header` (hard, still anticipated) and `260801-1244-guard-rules-write` (soft, still anticipated). **Open decisions cited:** none.

Last because it is genuinely blocked, not because it matters least. It carries the substance of the parent Directive, and its hard dependency has not been built yet.

## Recently closed (_c_ / _b_)

Newest first. All five carry the closed-coherent marker (`_c_`); none reached Bounded Closure.

| Circle | Marker | Closure in one line |
|---|---|---|
| `260801-1244-guard-bash-inspection` | `_c_` | The guard now checks file-mutating shell commands against the protected paths for all sixteen agents, and four pre-existing holes in the shipped git branch classifier were closed on the way. Shipped v5.8.0. |
| `260719-1536-plane-mirror-integration` | `_c_` | The Plane bounded bridge is implemented and offline-proven across six commits, with two go-live follow-ups deliberately left open. |
| `260719-1536-brest-unite-co-creator-conversion` | `_c_` | The unite-co-creator context-loading conversion passed 9 of 9 acceptance checks; that project's `CLAUDE.md` shrank by 80 percent. |
| `260718-1924-v5x-overhaul` | `_c_` | The five-package v5.x overhaul completed through v5.4.0: coordination analysis, context mechanism, editor agent, prompt revision, docs. |
| `260717-1638-marker-format-ohne-glob-metazeichen` | `_c_` | State markers moved to the underscore form, removing the glob-metacharacter trap, with a lint guard against relapse. Shipped v5.0.0. |

Older: `260716-1847-workbench-umbau` (`_c_`), the workbench restructure into Circle containers, v4.0.0.

## Archived (_s_ / _d_)

(none) — no Circle has been superseded or deferred.

## Warnings

No dependency cycle was found. The dependency graph over the anticipated Circles is a tree: `260801-1244-curator` points at `260801-1244-rule-provenance-header` and `260801-1244-guard-rules-write`, the latter points at a Circle that is now closed, and `260801-1244-rule-provenance-header` points at nothing.

No parent-Grounding-stale condition was raised. That check fires only when a child Circle reaches Bounded Closure (`_b_`), and no Circle in this workbench carries that marker.

Four conditions are worth the user's attention, none of them blocking:

- **Grounding drift in `260801-1244-rule-provenance-header`.** Its Directive states that all nine of the plugin's rule files will carry a header. There are ten, because `rules/protected-path-discipline.md` was added during the Circle that just closed. Shaper should correct the count at activation. The closed Circle's own closure note records the same fact as evidence of decay.
- **The task queue is stale.** `fusion-workbench/tasklist.md` still holds the fully closed queue generated on 260716-1920 for the workbench-restructure Circle, and it names a plan path in the pre-v4 bracket-marker format. This is filed as `shared/issues/260801-2038_o_tasklist-holds-a-fully-closed-queue-from-a-circle-closed-two-weeks-ago.md`. The queue belongs to taskplanner and the orchestrator; playmaker only reports it. It will need rebuilding at the next activation.
- **Session bookkeeping under-reported the closed Circle.** `shared/issues/260801-2038_o_session-bookkeeping-froze-at-turn-1-while-three-turns-ran.md` records that the dashboard and event log stopped tracking after the first Turn while three ran. Any pace or effort signal drawn from this session's telemetry understates the work.
- **Seventeen open issues sit in the shared store**, four of which the gap analysis filed as constraints on the curator Circle rather than as work inside it. Two more open issues live inside Circles: one in `260719-1536-plane-mirror-integration` (verify the Plane payload against a live instance) and one in `260801-1244-guard-bash-inspection` (four classifier behaviours a green suite would not catch).

## Sizing note

The Circle that just closed overran: sixteen commits and three Turns against eight planned steps, with fifteen issues filed inside it and two self-inflicted regressions caught only by review. That has a bearing on how the remaining three should be sized, and they do not share the risk equally.

`260801-1244-guard-rules-write` carries the same risk profile as the Circle that overran. It touches the same guard code, it has the same problem that its acceptance criteria cannot be verified in this repository because the write guard stands down here, and its scope includes a configuration loader with merge semantics, a self-protection floor, and a fallback path. The overrun in the prerequisite came from a shell-parsing surface that proved wider than the plan assumed. A configuration-resolution surface fails the same way. We recommend that its plan budget the fixture work explicitly rather than treating verification as a final step.

`260801-1244-rule-provenance-header` is the opposite case and the smallest of the three: a lint test following an existing test-suite pattern, a backfill of ten files, and one section in the conventions file. It verifies in this repository, where the test suite already runs, and its output is mechanically checkable. That supports taking it first for a reason beyond the ranking. After a session that consumed itself, a bounded Circle that closes cleanly is worth more than another open-ended one.

`260801-1244-curator` will not fit a single Turn loop. It carries seven capabilities and roughly sixty acceptance criteria, and its closing step is a four-part operation on the largest rule file in the plugin. The evidence that eight planned steps became sixteen commits argues for splitting it before activation, most naturally at the seam its own record already draws: building the agent (capabilities C1 through C7) is one Circle, and applying it to the conventions file (capability C9) is another. The record states that C9 does not begin until C1 through C8 are complete, which is a Circle boundary described in prose. We recommend making it one.

## References

- Spec covering all four Circles: `shared/planning/260801-1122_o_spec-normative-consolidation.md`
- Gap analysis behind the body of work: `shared/analyses/260801-1020-normative-surface-drift-gap-analysis.md`
- Session that closed the prerequisite: `shared/history/260801-0936-orchestrator-session.md`
- This playmaker run: `shared/history/260801-2044-playmaker-user-fusion-next.md`
