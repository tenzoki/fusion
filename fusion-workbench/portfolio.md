# Portfolio

**Generated:** 260802-0811 (by playmaker session 260802-0811)
**Domain bias:** code

No Circle is active. Three anticipated Circles are queued, all filed on 2026-08-01 from one spec, and the recommendation is unchanged for the third run running: `260801-1244-rule-provenance-header`. Nothing on disk moved the ranking since the previous run. Two orchestrator sessions ran Setup and stopped without a Directive, one issue was filed, and no commit landed. One new warning is worth reading below: the previous playmaker run cited a history file for itself that it never wrote.

## Active (_t_)

(none) — no Circle record carries the active marker (`_t_`), and `fusion-workbench/.active-circle` is absent. That pairing is the normal state after a closure, not a fault.

The Circle that occupied the last working session, `260801-1244-guard-bash-inspection`, closed coherent and appears under `## Recently closed` below.

## Anticipated (_a_) — ranked

**Recommended next:** `260801-1244-rule-provenance-header` — no dependencies, no open decisions, and it is the only hard blocker of the Circle that carries the substance of the parent Directive.

### 1. `260801-1244-rule-provenance-header`

*Every rule file states which record motivated it, and a test enforces it.*

**Dependencies:** none. **Open decisions cited in its Grounding:** none. The three it cites, `shared/decisions/260801-1020_a_where-does-normative-consistency-live.md`, `shared/decisions/260801-1020_a_may-any-fusion-writer-touch-rules.md`, and `shared/decisions/260801-1020_a_provenance-header-on-rule-files.md`, are all answered and awaiting realisation.

This Circle ranks first on the code-domain criteria without needing a tie-breaker. An empty `## Dependencies` section and zero open decision records in the Grounding snapshot is the profile the code bias ranks highest, and the shared decision store holds no open record at all this run, so no sibling can win that criterion instead. Two further facts confirm the placement rather than compete with it.

The first is unblock value. This is the sole hard prerequisite of `260801-1244-curator`, whose closing step partitions the 54 kB conventions file into shards that the lint gate built here has to check, so the gate must exist before there are shards to check it against. The sibling `260801-1244-guard-rules-write` is equally unblocked and blocks nothing hard, so taking it first would buy no forward motion for the curator.

The second is measured decay, re-taken this run rather than carried over. The plugin's `rules/` directory holds ten files, and exactly one of them carries a provenance line, at `rules/fusion-workbench-conventions.md:326`. The count has not moved since the previous run, because the two sessions in between ran Setup and stopped without starting work. That leaves the decay rate of one unprovenanced file per working session unrefuted rather than confirmed, and it leaves the backfill set at ten against a Directive drafted for nine.

**On activation:** shaper should correct the rule-file count in the Grounding snapshot, which reads nine and is ten. The record's statement that the backfill is editable in this repository still holds, and it extends to shell edits as well, because the closed prerequisite put the same plugin-repo stand-down on the shell path.

### 2. `260801-1244-guard-rules-write`

*A project can permit rule-file writes deliberately, per session, and never silently.*

**Dependencies:** `260801-1244-guard-bash-inspection`, closed coherent, so the dependency is met. **Open decisions cited:** none.

Second because it is unblocked but unblocking. Nothing hard waits on it, and the curator's dependency on it is explicitly soft, needed only so the curator's rule-file writes are exercisable in a consuming project rather than to build or test the agent here.

### 3. `260801-1244-curator`

*The curator reconciles the three normative surfaces, and proves it on fusion's own conventions file.*

**Dependencies:** `260801-1244-rule-provenance-header` (hard, still anticipated) and `260801-1244-guard-rules-write` (soft, still anticipated). **Open decisions cited:** none.

Last because it is genuinely blocked, not because it matters least. It carries the substance of the parent Directive, and its hard dependency has not been built yet. One item in its Grounding snapshot has been stale since 2026-08-01; see `## Warnings`.

## Recently closed (_c_ / _b_)

Newest first. All six carry the closed-coherent marker (`_c_`); none reached Bounded Closure.

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

```
rule-provenance-header ─────────────┐
                                    ├──> curator
guard-bash-inspection (_c_)         │
        └──> guard-rules-write ─────┘
```

No parent-Grounding-stale condition was raised. That check fires only when a child Circle reaches Bounded Closure (`_b_`), and no Circle in this workbench carries that marker.

Six conditions are worth the user's attention, none of them blocking.

- **The previous portfolio cited a history file that was never written.** The 260801-2341 run listed `shared/history/260801-2341-playmaker-user-fusion-next.md` under its own references. That file does not exist, in the Circle stores or the shared one, and the run also appended no activation proposal to the Circle it recommended. Its portfolio content stands, and this run re-derived the ranking from disk rather than trusting it, but the run left no durable record of itself. The history log is the only durable record a session has, so a run that regenerates the portfolio and skips its log leaves the next reader unable to check what it saw. This run wrote both, and the proposal it appended is the second on that record rather than the first.
- **The workbench is now tracked in git, and a Circle record says otherwise.** Commit `e8988d9` (2026-08-01 23:11) committed 237 workbench files, and `git ls-files fusion-workbench/` still returns 237 today. The `260801-1244-curator` record lists as a verified constraint that "the workbench is neither tracked nor gitignored here, so decision-record edits have no git undo", and it draws two design requirements from that: the curator must write every modified record's pre-edit content into its own history file, and the archive store is ruled out as the retirement destination. In this repository the premise no longer holds. The requirements may still be right for consuming projects, where fusion ships no ignore rule and a workbench can land in any of three states, but the record presents a local measurement as the reason and that measurement is false. Shaper should re-ground it at activation. Playmaker does not edit a Grounding snapshot, so this is reported rather than corrected.
- **The same commit partly overtakes an open issue.** `shared/issues/260801-1020_o_workbench-untracked-breaks-archive-durability-premise.md` rests on `git ls-files fusion-workbench/` returning zero files. It now returns 237. The issue's second half is untouched: `CLAUDE.md` still calls the workbench "Runtime artifact, gitignored", and `skills/archive/SKILL.md:9` still states its durability premise unconditionally, which the issue itself flags as unsafe regardless of what this repository chooses. The issue needs re-verifying, not closing.
- **Grounding drift in the recommended Circle.** `260801-1244-rule-provenance-header` states that all nine of the plugin's rule files will carry a header. There are ten. Shaper should correct the count at activation.
- **The task queue is still stale.** `fusion-workbench/tasklist.md` holds the fully closed queue generated on 260716-1920 for the workbench-restructure Circle, and it names a plan path in the pre-v4 bracket-marker format. Filed as `shared/issues/260801-2038_o_tasklist-holds-a-fully-closed-queue-from-a-circle-closed-two-weeks-ago.md`. The queue belongs to taskplanner and the orchestrator; playmaker only reports it. It needs rebuilding at the next activation.
- **Eighteen open issues sit in the shared store,** one more than at the previous run. The new one is `shared/issues/260801-2352_o_plugin-settings-json-has-no-agent-allow-entries.md`: the plugin's `settings.json` grants no `Agent(...)` permission, so every subagent dispatch raises an approval prompt in a project with no allowlist of its own. It carries an unverified question at its centre, namely whether a plugin-level `settings.json` is honoured as a permission source at all under `--plugin-dir`, and the answer decides which of its three candidate fixes is the right one. Four of the eighteen were filed by the gap analysis as constraints on the curator Circle rather than as work inside it. Two further open issues live inside Circles: one in `260719-1536-plane-mirror-integration` (verify the Plane payload against a live instance) and one in `260801-1244-guard-bash-inspection` (four classifier behaviours a green suite would not catch).

## Sizing note

The Circle that closed most recently overran: sixteen commits and three Turns against eight planned steps, with fifteen issues filed inside it and two self-inflicted regressions caught only by review. That has a bearing on how the remaining three should be sized, and they do not share the risk equally. This section is carried forward from the previous run because nothing since has changed the evidence for it.

`260801-1244-guard-rules-write` carries the same risk profile as the Circle that overran. It touches the same guard code, its acceptance criteria cannot be verified in this repository because the write guard stands down here, and its scope includes a configuration loader with merge semantics, a self-protection floor, and a fallback path. The overrun in the prerequisite came from a shell-parsing surface that proved wider than the plan assumed, and a configuration-resolution surface fails the same way. Its plan should budget the fixture work explicitly rather than treating verification as a final step.

`260801-1244-rule-provenance-header` is the opposite case and the smallest of the three: a lint test following an existing test-suite pattern, a backfill of ten files, and one section in the conventions file. It verifies in this repository, where the test suite already runs, and its output is mechanically checkable. That supports taking it first for a reason beyond the ranking. After a session that consumed itself, a bounded Circle that closes cleanly is worth more than another open-ended one.

`260801-1244-curator` will not fit a single Turn loop. It carries seven capabilities and roughly sixty acceptance criteria, and its closing step is a four-part operation on the largest rule file in the plugin. The evidence that eight planned steps became sixteen commits argues for splitting it before activation, at the seam its own record already draws: building the agent (capabilities C1 through C7) is one Circle, and applying it to the conventions file (capability C9) is another. The record states that C9 does not begin until C1 through C8 are complete, which is a Circle boundary described in prose. Making it an actual boundary is the recommendation.

## References

- Spec covering all four Circles: `shared/planning/260801-1122_o_spec-normative-consolidation.md`
- Gap analysis behind the body of work: `shared/analyses/260801-1020-normative-surface-drift-gap-analysis.md`
- Session that closed the prerequisite: `shared/history/260801-0936-orchestrator-session.md`
- Last playmaker run with a history log: `shared/history/260801-2044-playmaker-user-fusion-next.md`
- This playmaker run: `shared/history/260802-0811-playmaker-direct-dispatch.md`
