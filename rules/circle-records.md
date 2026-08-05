# Circle Records — state markers, transitions, and the record and portfolio templates

**Provenance:** circles/260801-1244-guard-rules-write

**This document is the definition** for the Circle state vocabulary, its transitions, the
Circle record template and the `portfolio.md` template. No agent prompt and no skill body
may carry a competing or supplementary definition of them.

Its audience is bounded by a mechanism rather than by a guess: `bin/fusion-paths` derives
each consumer's key set by reading that consumer's own prompt, and exactly three agents
name a Circle-scoped key — `orchestrator` (`$SCAN_CIRCLES`, `$PORTFOLIO`), `playmaker`
(`$OUT_CIRCLE`, `$SCAN_CIRCLES`, `$PORTFOLIO`) and `shaper` (`$OUT_CIRCLE`,
`$SCAN_CIRCLES`). Those three are who `bin/fusion-rules` emits this file to. The other
thirteen agents work inside a Circle without ever transitioning one, and reach this file
through the pointer in `rules/fusion-workbench-conventions.md`. The skills that transition
Circles — `/fusion:next`, `/fusion:direct`, `/fusion:cleanup`, `/fusion:archive`,
`/fusion:circle-stash`, `/fusion:setup` — cite it directly, as skills always do:
`bin/fusion-rules` serves agents only and exits 2 on any other name.

Two things deliberately stayed behind in the conventions file, because their audience is
every agent rather than these three. The glob forms for reading a marker off a filename
are there under `## Marker globs` — they apply to every marker in every vocabulary, not
just to Circles. And `## fusion-workbench Layout` still defines the Circle *directory*;
what follows is about the record inside it.

## State Markers — circles

**The marker sits on the Circle record, not on the directory.** A Circle is `circles/<YYMMDD-HHMM>-<directive-slug>/`, and the directory name never changes across the Circle's lifecycle. The state lives in the record inside it: `_a_circle.md` → `_t_circle.md` → `_c_circle.md`. A state change is a `mv` of that one file.

Two reasons this is worth the small oddity. First, **path stability**: every reference into a Circle — from a session history, from `portfolio.md`, from another Circle's decision, from a stash manifest — stays valid for the Circle's whole life. Were the marker on the directory, every state change would break every one of them. Second, **an immutable natural key**: the later Plane mirror needs a per-Circle identifier that does not mutate, or the guarantee "transferring twice creates no duplicates" cannot hold.

The price of the marker-on-the-record design is that `ls circles/` no longer shows state at a glance; `portfolio.md` and `/fusion:next` are the built answers for that. The marker convention is not actually broken — the marker still names the state of the *record*, and the record is `circle.md`; the directory merely encloses it and its artifacts.

The vocabulary is parallel to but distinct from issues/planning and decisions. It is unchanged by the container layout.

Binding decision: `decisions/260716-1910_i_circle-marker-am-verzeichnis-oder-an-der-circle-datei.md`.

| Marker | Meaning |
|--------|---------|
| `_a_` | **Anticipated** — provisional Directive, no Grounding yet (foundation V3 §2.1). Initial state on creation. |
| `_t_` | **Active / in-Turn** — Directive refined, Grounding crystallising, orchestrator running it. |
| `_c_` | **Closed-coherent** — three-edge Coherence verdict passed. |
| `_b_` | **Bounded Closure** — Directive judged not reachable; what was learned is the Artifact. |
| `_s_` | **Superseded** — replaced by another Circle (scope split, redirected). |
| `_d_` | **Deferred** — anticipated → indefinitely postponed. |

### Worked transitions

Every transition renames only `<circle-dir>/_S_circle.md`. The directory is never renamed.

- `_a_ → _t_` — playmaker proposes activation; user confirms; orchestrator renames the record and writes `.active-circle` with the directory name.
- `_t_ → _c_` — Coherence verdict `coherent` at Phase 3; orchestrator renames the record at Phase 4 and deletes `.active-circle`.
- `_t_ → _b_` — user chose **Accept Bounded Closure** at the Rebalance gate; orchestrator renames the record at Phase 4 and deletes `.active-circle`.
- `_t_ → _s_` — user supersedes mid-run; orchestrator renames the record and deletes `.active-circle`; a new `_a_` Circle directory is created, citing the superseded one via `## Dependencies`.
- `_a_ → _d_` — user defers an anticipated Circle indefinitely; manual rename of the record. `.active-circle` is not involved — an `_a_` Circle was never active.
- `_a_ → _s_` — rare; the anticipated Circle is replaced before activation by a new Circle that captures the revised intent.

**Terminal-states statement:** `_c_`, `_b_`, `_s_`, `_d_` are terminal — `mv` back to `_a_` or `_t_` is disallowed. If continuation is needed, create a new Circle that cites the terminal one via its `## Dependencies` section. A terminal Circle keeps its directory and all its artifacts in place; closure is not a move.

**Grounding-Stand vs Grounding-Historie parallel:** as with `decisions/`, the marker carries the layer information. `_a_` and `_t_` are Grounding-Stand (current working state); `_c_`, `_b_`, `_s_`, `_d_` are Grounding-Historie (preserved record).
## Circle record template

The Circle record is `<circle-dir>/_S_circle.md`. Creating a Circle means creating the directory, the record, and the six artifact subdirectories (`planning/`, `issues/`, `decisions/`, `history/`, `reviews/`, `analyses/`) — a Circle without its subdirectories forces the next agent to invent them. Template:

```markdown
# <One-line Directive title>

---
**Domain:** <code|data|strategic|knowledge>
**Status:** <anticipated | active | closed | bounded | superseded | deferred>
**Filed by:** <agent name or "user">
**Active spec/plan:** <workbench-relative path to the spec or plan, or "(none yet)">
**Active session history:** <workbench-relative path to the session history file, or "(none yet)">

---

## Directive

<What this Circle aims for. The post-completion state of the Artifact, prognosticated. Revisable via Rebalance.>

## Grounding snapshot

<What we know going in. Filled at `_a_ → _t_` activation by shaper portfolio-activation mode. Updates on Rebalance.>

## Dependencies

<List of other Circle directory names this Circle depends on. Playmaker flags cycles here. Also the place to cite artifacts from other Circles that bind this one — per the Origin Rule, reach is cited, not copied.>

## Turn log

<Append-only list of Turn outcomes for this Circle. Format per bullet:
- Turn N (session YYMMDD-HHMM): commits <hash>..<hash>; Coherence verdict <coherent|review-needed|skipped-...>; session history: <path>>

## Closure note

<Filled when marker becomes _c_, _b_, _s_, or _d_. Cites the orchestrator session history file. For _b_, also cites the Bounded-Closure Artifact (what was learned that the Directive could not reach).>
```

The directory is `YYMMDD-HHMM-<directive-slug>/` and the record inside it is `_S_circle.md`, per the State Markers section above.

**`Active spec/plan:` and `Active session history:` hold workbench-relative paths, not bare filenames.** In the ordinary case the path points inside the Circle (`circles/260716-1847-umbau/planning/260716-1910_p_plan-foo.md`) and looks redundant. It is not, because the cross-store case is real and routine:

- A spec written before the Circle existed lands in `shared/planning/` — every `/fusion:direct` run and every shaper run in anticipated-circle mode produces one, since with no Circle active every `OUT_*` points at `shared/` (invariant 1).
- A migrated pre-v4 Circle names a plan that the migration moved to `shared/planning/`, correctly: unknown origin means `shared/` (Origin Rule, corollary 1). The file genuinely is not in the Circle, and rewriting the field to claim otherwise would point it at nothing.

A path resolves in both cases; a bare filename resolves only in the first, and fails silently in the second — the consumers (`/fusion:circle-stash`'s best-effort lookup, playmaker's `portfolio.md` rendering, the orchestrator's resume) all degrade without announcing it. This does not weaken the container premise: a Circle still *holds* its artifacts, and the Origin Rule still decides which. The field merely reports where the file is rather than assuming it.

`$PORTFOLIO` is regenerated by playmaker on every run. Template:

```markdown
# Portfolio

**Generated:** YYMMDD-HHMM (by playmaker session <id>)
**Domain bias:** <code|data|strategic|knowledge>

## Active (_t_)

<One entry expected, or 0. If >1, flag MULTIPLE-ACTIVE warning. Each entry: Circle directory name, Directive line, active session history path.>

## Anticipated (_a_) — ranked

<Ordered list by playmaker rank. Top entry includes a one-paragraph rationale for the recommendation. Each entry: Circle directory name, Directive line, rank, dependencies summary.>

## Recently closed (_c_ / _b_)

<Last 5 closed Circles. Each entry: Circle directory name, marker, Closure note one-liner.>

## Archived (_s_ / _d_)

<Superseded and deferred Circles, for reference.>

## Warnings

<Dependency-cycle warnings, parent-grounding-stale notes (cross-references), MULTIPLE-ACTIVE conditions, etc.>
```
