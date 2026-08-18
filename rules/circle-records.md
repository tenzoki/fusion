# Circle Records — state markers, transitions, and the record and portfolio templates

**Provenance:** circles/260801-1244-guard-rules-write

**This document is the definition** for the Circle state vocabulary, its transitions, the
Circle record template and the `portfolio.md` template. No agent prompt and no skill body
may carry a competing or supplementary definition of them.

`bin/fusion-rules` emits this file to three agents — `orchestrator`, `playmaker` and
`shaper` — the three that transition or rank a Circle. That audience used to be *derived*
rather than authored: the same three were once exactly the agents whose prompts named a
Circle-scoped resolver key, so the emission list restated a property of the prompts.
**The derivation no longer holds.** `curator` names `$SCAN_CIRCLES` as well, to read
Circle records as evidence, and it neither transitions nor ranks a Circle — so naming a
Circle-scoped key stopped picking out the agents that move one. The key-naming set is not
restated here, because it moves with every prompt edit: measure it with a grep for
`$OUT_CIRCLE`, `$SCAN_CIRCLES` and `$PORTFOLIO` over `agents/*.md`. Whether `curator`
should join the emission list is `bin/fusion-rules`'s question and not this file's. The
other agents work inside a Circle without ever transitioning one, and reach this file
through the pointer in `rules/fusion-workbench-conventions.md`. Skills reach rule text by
direct citation, never through `bin/fusion-rules`, which serves agents only and exits 2 on
any other name; the skills that cite this file today are `/fusion:next`, `/fusion:direct`
and `/fusion:migrate`.

Two things deliberately stayed behind in the conventions file, because their audience is
every agent rather than these three. The glob forms for reading a marker off a filename
are there under `## Marker globs` — they apply to every marker in every vocabulary, not
just to Circles. And `## fusion-workbench Layout` still defines the Circle *directory*;
what follows is about the record inside it.

## State Markers — circles

**The marker sits on the Circle record, not on the directory.** A Circle is `circles/<YYMMDD-HHMM>-<directive-slug>/`, and the directory name never changes across the Circle's lifecycle. The state lives in the record inside it: `_a_circle.md` → `_t_circle.md` → `_c_circle.md`. A state change is a `mv` of that one file.

What makes this worth the small oddity is **path stability**: every reference into a Circle — from a session history, from `portfolio.md`, from another Circle's decision — stays valid for the Circle's whole life. Were the marker on the directory, every state change would break every one of them.

The price of the marker-on-the-record design is that `ls circles/` no longer shows state at a glance; `portfolio.md` and `/fusion:next` are the built answers for that. The marker convention is not actually broken — the marker still names the state of the *record*, and the record is `circle.md`; the directory merely encloses it and its artifacts.

The vocabulary is parallel to but distinct from issues/planning and decisions. It is unchanged by the container layout.

Binding decision: `circles/260716-1847-workbench-umbau/decisions/260716-1910_*_circle-marker-am-verzeichnis-oder-an-der-circle-datei.md`.

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
**Domain:** <code|data>
**Filed by:** <agent name or "user">
**Active spec/plan:** <workbench-relative path to the spec or plan, or "(none yet)">
**Active session history:** <workbench-relative path to the session history file, or "(none yet)">

---

## Directive

<While `Active spec/plan:` reads `(none yet)`: what this Circle aims for, the post-completion state of the Artifact, prognosticated. Once that field cites a file, the pointer literal below replaces this prose — see `### The Directive is a pointer once a spec exists`.>

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

- A spec written with **no Circle in scope** lands in `shared/planning/`, and a Circle created later adopts it — one shared spec can serve several Circles at once. (Anticipated-circle mode no longer produces one: it creates the Circle first and writes inside it.)
- A migrated pre-v4 Circle names a plan that the migration moved to `shared/planning/`, correctly: unknown origin means `shared/` (Origin Rule, corollary 1). The file genuinely is not in the Circle, and rewriting the field to claim otherwise would point it at nothing.

A path resolves in both cases; a bare filename resolves only in the first, and fails silently in the second — the consumers (playmaker's `portfolio.md` rendering and the orchestrator's resume) both degrade without announcing it. This does not weaken the container premise: a Circle still *holds* its artifacts, and the Origin Rule still decides which. The field merely reports where the file is rather than assuming it.

### The Directive is a pointer once a spec exists

**A record's `## Directive` holds prose if and only if its `Active spec/plan:` field reads the
literal `(none yet)`.** The two states are mutually exclusive by construction, so the record and the
spec can never come to state two different Directives — not because somebody keeps two copies in
step, which decays, but because the second copy never exists.

Where the field cites a file, the whole body of the section is this one line and nothing else:

```
See `**Active spec/plan:**` above. The cited spec or plan states the Directive in force.
```

**The pointer cites the field, never the path the field holds.** A pointer naming the path would be
a second copy of the path — the duplication being removed, arriving one level down — and it would
not survive what the field carries in practice: a field may hold a qualifying sentence beside its
path, or more than one path, and a pointer to the field resolves for a reader in every one of those
cases where a pointer to a single path would not.

**A reader tells pointer from prose by the literal opening** ``See `**Active spec/plan:**` above.``
— the same shape of test the head-field readers already perform against `(none yet)`. The two
sentinels cannot be confused: they sit in different places in the record, share no leading
characters, and the invariant makes them mutually exclusive, since the pointer appears only where
the field is not `(none yet)`.

**Who writes which is not stated here**, because the obligation rides the adjacent act and is
authored where that act is — `agents/orchestrator.md` `## Circle head fields` for the field writes,
`agents/shaper.md` mode 3 for the prose. Two rules bind every writer of either. A writer of prose
reads the field first and **halts** when it names a file, reporting that the cited spec holds the
Directive. A writer of the field replaces the section body with the pointer literal **in the same
command** that moves the field off `(none yet)`.

**Existing records convert on the next sanctioned write, and no migration exists.** A terminal
record is history and is never edited, which removes every closed Circle from any migration set. An
anticipated Circle reads `(none yet)` by construction, so the invariant already holds for it. What
is left is the single active Circle a project may have — and converting that one by hand would
delete the evidence of exactly the contradiction the conversion exists to end.

Binding decision: `shared/decisions/260818-1504_*_how-does-a-circle-record-carry-its-directive-once-a-spec-exists-and-who-may-correct-it-before-one-does.md` (option 1).

`$PORTFOLIO` is regenerated by playmaker on every run. Template:

```markdown
# Portfolio

**Generated:** YYMMDD-HHMM (by playmaker session <id>)
**Domain bias:** <code|data>

## Active (_t_)

<One entry expected, or 0. If >1, flag MULTIPLE-ACTIVE warning. Each entry: Circle directory name, Directive line, active session history path.>

## Anticipated (_a_) — ranked

<Ordered list by playmaker rank. Top entry includes a one-paragraph rationale for the recommendation. Each entry: Circle directory name, Directive line, rank, dependencies summary.>

## Backlog — ranked

<Ranked `_o_`/`_p_` backlog entries. First line: `Recommended to shape: <entry path> — <rationale>` with the `/fusion:direct <entry path>` invocation under it; a multi-idea top entry instead takes `Recommended to split first: <entry path> — <n> ideas, top one is <slug>` and no invocation. Each entry: path, the idea in one line, rank, and indented under it what this run proposed for that entry — a proposed split showing the pieces it would produce.
Then `Performed this run:` and the operations it performed, whose entries have left the ranking. Both use these four forms, one operation to a line, so a person can approve one at a time and `/fusion:next` can relay the line verbatim into a second dispatch:
`split <entry path> into: <slug> — <title>; <slug> — <title>`
`merge <entry path>, <entry path> into: <slug> — <title>`
`close <entry path> — <reason>`
`defer <entry path> until <target>`
A Phase 4 dispatch holds no confirmation: everything is proposed and `Performed this run:` is absent.>

## Recently closed (_c_ / _b_)

<Last 5 closed Circles. Each entry: Circle directory name, marker, Closure note one-liner.>

## Archived (_s_ / _d_)

<Superseded and deferred Circles, for reference.>

## Warnings

<Dependency-cycle warnings, parent-grounding-stale notes (cross-references), MULTIPLE-ACTIVE conditions, etc.>
```

### Citation form in the portfolio

**Every path citation in `$PORTFOLIO` carries `_*_` at the marker position** — write
`YYMMDD-HHMM_*_<slug>.md`, never the letter the target carries today. The reason is the
regeneration: playmaker overwrites the whole file on every run, and between two runs its
targets move on (`_o_ → _p_ → _c_`, `_o_ → _a_ → _i_`), so a spelled-out marker is a pointer
that dies at its target's first transition — and correcting one by hand buys nothing, because
the next run writes the same form back over the correction. The wildcard costs the reader
nothing: they resolve it against the store and read the current marker off the resolved
filename.

**Star a pointer to a file; leave the letter on a marker that is being named.** The two look
alike and mean opposite things. In a Circle's entry the letter is noise that ages. In a
warning whose subject *is* a transition (`_t_circle.md` → `_b_circle.md`), or in the
`## Recently closed (_c_ / _b_)` heading, the letter is the statement, and starring it deletes
the statement. The test is what a star would cost: a pointer loses nothing, a statement loses
its content.

Binding decision: `circles/260805-2005-textschicht-gegen-code-nachziehen/decisions/260806-0015_*_zitierform-fuer-workbench-records.md`.
Measured elsewhere and transferred here as
`shared/issues/260810-1730_*_die-erzeugung-von-portfolio-md-schreibt-den-zustandsmarker-aus-und-macht-jede-handkorrektur-zunichte.md`:
five citations in one generated portfolio, two pointing at nothing on the day of filing and a
third two hours later.
