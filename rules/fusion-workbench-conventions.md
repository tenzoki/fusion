# fusion-workbench Conventions

Shared conventions for all agents operating on `fusion-workbench/`. This file is auto-loaded by the plugin system into every agent's context. Single source of truth for the workbench layout, the origin rule, path resolution, state markers, issue and decision filing, inline tracking, history logging, and timestamps.

**This document is the definition.** Layout, origin rule, and path resolution are defined here completely. No agent prompt and no skill body may carry a competing or supplementary definition of where artifacts go — they resolve their paths at run time (see `## Path Resolution (Pfadauflösung)`) and cite this document for the rules. A path literal that names a store directory belongs in exactly two places: this file, and `bin/fusion-paths`.

## fusion-workbench Layout

A **Circle is a directory**, not a file. Everything a unit of work produces lives inside it. Everything with no Circle affiliation lives in `shared/`. Everything the hooks and the dashboard read stays at the workbench root.

```
fusion-workbench/
├── circles/
│   └── 260716-1847-workbench-umbau/   # one directory per unit of work
│       │                              # stable name: <YYMMDD-HHMM>-<directive-slug>, NO marker
│       ├── [t]-circle.md              # the Circle record — carries the state marker
│       ├── planning/                  # spec and plan of THIS unit of work
│       ├── issues/
│       ├── decisions/
│       ├── history/
│       ├── reviews/                   # codereview + ontoreview + conceptreview, merged
│       └── analyses/
├── shared/                            # everything with no Circle affiliation
│   ├── planning/                      # specs and plans written with no Circle active
│   ├── issues/
│   ├── decisions/
│   ├── analyses/
│   ├── reviews/                       # codereview + ontoreview + conceptreview, merged
│   ├── investigations/                # investigations are always shared — see below
│   ├── consult/                       # consultations are always shared — see below
│   ├── history/
│   └── memos/                         # memos are always shared — see below
├── archive/                           # /fusion:archive target
├── stashes/                           # /fusion:circle-stash target (opt-in; created on first stash)
├── stilwerk/                          # stylometric profiles
├── portfolio.md                       # playmaker output
├── tasklist.md                        # generated work queue (taskplanner only)
├── monitor                            # dashboard binary, copied at setup
├── .active-circle                     # pointer to the active Circle directory
├── .fusion-setup                      # setup marker (JSON: timestamp + plugin version)
│
│   # ── Root-anchored. The hooks and the monitor read these HERE. Do not move them. ──
├── agentstate.yaml
├── orchestrator-live.md
├── orchestrator-events.jsonl
└── .guard-state/
```

**The four root-anchored surfaces are not negotiable.** `agentstate.yaml`, `orchestrator-live.md`, `orchestrator-events.jsonl` and `.guard-state/` are read at fixed root-relative paths by `hooks/tracker.ts:33-36` and `bin/monitor:72-75`. They are session state and project state, not Circle artifacts — a session may span Circles, and `.guard-state/` counters are project-wide. Never relocate them into a Circle or into `shared/`; doing so silently breaks the tracker and the dashboard, which have no fallback path. This placement is what makes the guarantee "hooks behave unchanged across the layout" structural rather than promised.

**`shared/` mirrors the Circle's artifact kinds, plus three of its own.** Every kind a Circle can hold has a shared counterpart, because any of them can be produced with no Circle active and must still have a home. `investigations/`, `consult/` and `memos/` exist only in `shared/`: an investigation studies a failure capture, a consultation answers a question, and a memo records a note — none of the three is produced by executing a Directive, so none can originate in a Circle.

**The three review types collapse into one `reviews/`.** codereview, ontoreview and conceptreview differ by sender, not by kind. The sender is in the filename (`YYMMDD-HHMM-<sender>-<topic>.md`) and in the document header. Inside one Circle they do not earn a directory each.

`fusion-workbench/.active-circle` is a one-line pointer file containing the **directory name** of the active Circle (e.g. `260716-1847-workbench-umbau`) — no marker, no `circles/` prefix, no `.md`. It is absent when no Circle is active. Because the directory name is stable across the Circle's whole lifecycle, the pointer no longer has to be re-pointed on every marker change: the orchestrator **writes** it once on `[a]→[t]` activation (after user confirmation of playmaker's proposal) and **deletes** it on `[t]→[c]/[b]/[s]/[d]` closure. Nothing else touches it. The pointer is the single source of truth for "active Circle" — `agentstate.yaml` does NOT duplicate this field.

The `fusion-workbench/` is anchored to the directory where setup was run — the working directory `pwd` reports, not necessarily the git toplevel. A subfolder may legitimately have its own independent workbench, separate from any workbench at a parent level; the plugin's hooks resolve `process.cwd()` directly and follow whichever directory is active.

Within a given working directory there is exactly **one** `fusion-workbench/`. Never create a nested duplicate inside it, and never split a Circle's artifacts across multiple workbenches in the same tree — they all live in the single workbench at the active `pwd`.

## Origin Rule (Herkunftsregel)

**An artifact belongs to the Circle whose Directive caused it to come into existence. With no active Circle, it goes to `shared/`. Cross-cutting relevance is expressed by citation, not by placement.**

The rule is origin, not durability — and that choice is load-bearing. An agent *knows* its own origin: it was dispatched under a Directive, or it was not. It would have to *guess* an artifact's future reach. A rule built on a fact is mechanically applicable by every agent without judgment; a rule built on a prognosis produces a different answer from every agent that applies it, and the placement decision drifts. So: file by where the work came from, and let citation carry the rest.

Worked examples:

- **Defect.** A coder implementing the active Circle's plan finds a broken test in the code this Circle is writing → `<circle>/issues/`. The same coder notices, in passing, an unrelated dangling reference in a module this Circle never touches → `shared/issues/`. The second defect did not arise from the Directive; it was found next to it.
- **Decision.** A shaper refining the active Circle's spec surfaces the choice "one Circle or two?" → `<circle>/decisions/`, because that question exists only because this Directive exists. A decision the user raises between Circles, with no Circle active — "which IdP do we standardise on?" → `shared/decisions/`. Note the consequence, accepted deliberately: a project-wide decision that *arose inside* a Circle stays in that Circle. It is not promoted. Later Circles cite it by path.
- **Analysis.** An analyst dispatched by the orchestrator to inform the active Circle's plan → `<circle>/analyses/`. An analyst the user invokes directly to study an external document, no Circle active → `shared/analyses/`.

Two corollaries follow:

1. **Unknown origin means `shared/`.** When an artifact's Circle affiliation was never recorded and cannot be reconstructed, it is by definition not attributable to a Directive. It belongs in `shared/`. This is what makes migration of a pre-container workbench a mechanical move rather than an act of interpretation.
2. **Reach is cited, never placed.** If a Circle's decision binds a later Circle, the later Circle references it by path in its `## Dependencies` or `**Cross-references:**` header. Do not copy it, do not move it, do not file a duplicate in `shared/`. One record, one location, many citations.

Should the rule prove too tight in practice, the answer is a promotion step — an explicit, recorded move from a Circle to `shared/` — not a second placement rule. Two placement rules is how the definition scatters again.

## Path Resolution (Pfadauflösung)

**`bin/fusion-paths <agent>` is the single resolution point.** No agent and no skill hard-codes a store path. The prompt says "write your plan to `$OUT_PLAN`"; the resolver says what `$OUT_PLAN` is.

### Where the call belongs

In **Setup step 2**, alongside `"$FUSION_PLUGIN_ROOT/bin/fusion-rules" <agent>`. That step is demonstrably executed by every agent on every run — it is the step that loads the rules the agent then obeys. A per-write call would be a new obligation with a new miss rate; a Setup-step call rides an obligation that already holds. Resolve once at Setup, use the values for the rest of the session.

### Contract

Signature `fusion-paths <agent>`. Output: one `KEY=value` line per emitted key on stdout. Paths are workbench-relative except `WORKBENCH` itself, which is absolute. Multi-value keys are space-separated. Exit 2 on unknown agent, exit 1 when no workbench is found — the same shape as `bin/fusion-rules`.

In the Value column, `A → B` means: `A` when a Circle is active, `B` when none is.

| Key | Value | Notes |
|---|---|---|
| `WORKBENCH` | Absolute path to `fusion-workbench/` | Always emitted. Resolved via `bin/fusion-workbench-root`. |
| `CIRCLE` | `circles/<stamp>-<slug>` | The active Circle directory. Absent when no Circle is active. |
| `OUT_PLAN` | `<circle>/planning` → `shared/planning` | Spec and plan writes. |
| `OUT_HISTORY` | `<circle>/history` → `shared/history` | Session history writes. |
| `OUT_ISSUE` | `<circle>/issues` → `shared/issues` | Defect filing. |
| `OUT_DECISION` | `<circle>/decisions` → `shared/decisions` | Decision-record filing. |
| `OUT_REVIEW` | `<circle>/reviews` → `shared/reviews` | codereview / ontoreview / conceptrev writes. |
| `OUT_ANALYSIS` | `<circle>/analyses` → `shared/analyses` | Analysis writes. |
| `OUT_INVESTIGATION` | `shared/investigations` | Always shared — never Circle-bound. |
| `OUT_CONSULT` | `shared/consult` | Always shared — never Circle-bound. |
| `OUT_MEMO` | `shared/memos` | Always shared — never Circle-bound. |
| `OUT_CIRCLE` | `circles` | Where new Circle directories are created (shaper, playmaker). |
| `SCAN_PLANS` | `<circle>/planning shared/planning` | Read/search targets. |
| `SCAN_ISSUES` | `<circle>/issues shared/issues` | |
| `SCAN_DECISIONS` | `<circle>/decisions shared/decisions` | |
| `SCAN_HISTORY` | `<circle>/history shared/history` | |
| `SCAN_REVIEWS` | `<circle>/reviews shared/reviews` | |
| `SCAN_ANALYSES` | `<circle>/analyses shared/analyses` | |
| `SCAN_CIRCLES` | `circles` | Portfolio-wide scans (playmaker, `/fusion:next`). |
| `PORTFOLIO` | `portfolio.md` | |
| `TASKLIST` | `tasklist.md` | |

### Two invariants

1. **With no active Circle, every `OUT_*` points into `shared/`.** There is no error state and no refusal for "no Circle active" — work happens outside Circles routinely, and it has a defined home. This is the Origin Rule's "unknown origin means `shared/`" expressed executably.
2. **Every `SCAN_*` always carries both stores** — the Circle's and the shared one — even when a Circle is active. An agent searching for open decisions must see the Circle's *and* the project's. With no active Circle, a `SCAN_*` collapses to the shared store alone.

### Emission is per-agent

Like `bin/fusion-rules`, the resolver emits only the keys an agent needs — a coder gets no `OUT_PLAN`, a playmaker gets no `OUT_ISSUE`. The per-agent key set is defined by `bin/fusion-paths` itself; this table defines what each key *means*.

### Failure behaviour

A `.active-circle` pointing at a directory that does not exist is an error: message on stderr, non-zero exit, no silent fall back to `shared/`. A stale pointer means the workbench's state is inconsistent, and quietly writing to the wrong store is worse than stopping (`HYG-NO-SILENT-FAIL`).

## Issues vs Decisions — when to use which

A **defect** belongs in `issues/`. A **decision** belongs in `decisions/`. The distinction:

| Defect | Decision |
|---|---|
| Something is wrong, broken, missing, or inconsistent. | A choice must be made between two or more options. |
| Resolves to a code/data fix that can be verified by reading a diff. | Resolves to a recorded answer (decision record) and, separately, to implementation that realises the answer. |
| Lifecycle: filed → fixed → closed. The fix and the closure are the same event. | Lifecycle: filed (open question) → answered (with pointer to where) → implemented (when the answer is realised in code/data) → optionally superseded later. The answer event and the implementation event are distinct. |
| Examples: "term mapping is missing for entity X"; "test failure in pkg/foo"; "manifest doesn't validate". | Examples: "which IdP for v1?"; "should we adopt approach X or Y?"; "what is the cut decision for the platform?". |

**Decision rule for borderline items:** if the resolution is "go fix it" → defect; if the resolution is "decide and record" → decision. When in doubt, file as an issue and reclassify in the next reconciliation pass — that round-trip is cheap, the misfile cost is low.

A **Circle** is a directory under `$OUT_CIRCLE`. Distinct from defect and choice point: a Circle is a unit of work bounded by a Directive + its Grounding + its Artifact (foundation V3 §2.1). When the resolution is "execute this Directive to closure," it's a Circle; when the resolution is "go fix it," it's an issue; when the resolution is "decide and record," it's a decision.

This three-way distinction is about **what kind of thing** an artifact is. It is orthogonal to the Origin Rule, which decides **where** it goes. A defect is an issue whether it lands in `$OUT_ISSUE` or in `shared/issues/`.

## Timestamps

Always obtain `YYMMDD-HHMM` from `date +%y%m%d-%H%M`. LLMs have no clock — never guess or estimate the time.

## Project language

Projects declare the language of their prose output in `CLAUDE.md` via a line of the form `**Language:** <lang>` — for example `**Language:** en` or `**Language:** de`. Valid values initially are `en` and `de`. The declaration governs which stylometric profiles under `./fusion-workbench/stilwerk/` apply. There are two profile families, both resolved from the same `**Language:**` line:

- **`default-voice-<lang>.yaml`** — the long-form writing profile, applied by long-form-prose agents to their narrative outputs (session summary bodies, consultant reports, analysis reports, investigator timelines, playmaker briefings, prose sections of specs and plans).
- **`chat-voice-<lang>.yaml`** — the short-form chat profile, applied by **every** agent to its short-form user-facing output (gate prompts, `AskUserQuestion` text, status reports, chat replies). See `rules/user-facing-output.md` `## Style anti-patterns apply to everything`.

`bin/fusion-rules` emits the chat profile path for every agent and the writing profile path only for long-form-prose agents. Both families share one fallback: when the line is absent, the default is `en` — silently, no chat warning. When the declared language's variant is missing (e.g. `**Language:** de` but the `-de.yaml` variant does not exist), the agent falls back to the `-en.yaml` variant of the same family and records a single line in its session history file noting the fallback. If neither variant of a family exists, the agent emits nothing for that family and follows `rules/user-facing-output.md` alone — that rule always applies, regardless of profile presence.

## Filename Patterns

Patterns attach to the **kind of artifact**, not to a directory. The same kind carries the same name shape whether it lands in a Circle or in `shared/`.

| Artifact kind | Written to | Pattern | State marker |
|---|---|---|---|
| Circle directory | `$OUT_CIRCLE/` | `YYMMDD-HHMM-<directive-slug>/` | no — the directory name is stable |
| Circle record | inside the Circle directory | `[S]-circle.md` | yes (circles vocabulary) |
| Spec / plan | `$OUT_PLAN` | `YYMMDD-HHMM[S]-<topic>.md` | yes (issues/planning vocabulary) |
| Defect | `$OUT_ISSUE` | `YYMMDD-HHMM[S]-<topic>.md` | yes (issues/planning vocabulary) |
| Decision record | `$OUT_DECISION` | `YYMMDD-HHMM[S]-<topic>.md` | yes (decisions vocabulary — richer set) |
| Session history | `$OUT_HISTORY` | `YYMMDD-HHMM-<topic>.md` | no |
| Review (code / onto / concept) | `$OUT_REVIEW` | `YYMMDD-HHMM-<sender>-<topic>.md` | no |
| Analysis | `$OUT_ANALYSIS` | `YYMMDD-HHMM-<topic>.md` | no |
| Investigation | `$OUT_INVESTIGATION` | `YYMMDD-HHMM-<topic>.md` | no |
| Consultation | `$OUT_CONSULT` | `YYMMDD-HHMM-<topic>.md` | no |
| Memo | `$OUT_MEMO` | `memos-<username>.md` / `tasks-<username>.md` | no |
| Portfolio | `$PORTFOLIO` | fixed | — |
| Task queue | `$TASKLIST` | fixed | — |

`<sender>` on a review file is `coderev`, `ontorev`, or `conceptrev`. It is what distinguishes the three review kinds now that they share one `reviews/` directory — it is mandatory, and the document header repeats it.

## State Markers — issues and planning

Defect files and spec/plan files carry a state marker: `YYMMDD-HHMM[S]-<topic>.md`. This holds in a Circle and in `shared/` alike.

| Marker | Meaning |
|--------|---------|
| `[o]` | Open — initial state on creation |
| `[p]` | In progress — agent is actively working on it |
| `[c]` | Closed — resolved, or user decided to close |
| `[d]` | Deferred — user decided, or agent proposed and user confirmed |

**Rules:**
- Every new file starts as `[o]`.
- When an agent begins work: rename `[o]` → `[p]`.
- When work is done: rename `[p]` → `[c]`.
- When the user defers: rename to `[d]`.
- State change = `mv` (rename). Only the marker changes; `YYMMDD-HHMM` and `<topic>` stay the same.

History, review, analysis, investigation, consultation, and memo files do NOT carry state markers.

## State Markers — decisions

Decision records carry a richer state marker that distinguishes "the answer is recorded" from "the answer is realised in code/data".

| Marker | Meaning |
|--------|---------|
| `[o]` | Open — the question has been filed but not yet answered. Initial state on creation. |
| `[a]` | Answered — a recorded answer exists somewhere on disk (typically an analysis, a plan, a session history, or the decision record itself). The file body MUST cite the answer's location with `Answered: <path>:<line> — <one-line summary>`. Cite the path as it stands, whether that is inside a Circle or in `shared/`. The decision is not yet realised in code or data. |
| `[i]` | Implemented — the answer has been realised: code or data on disk now reflects the decision. The file body MUST cite the implementation with `Implemented: <commit hash> or <path>:<line> — <one-line summary>`. This is the terminal state for decisions whose realisation is verifiable. |
| `[d]` | Deferred — the user explicitly pushed the decision out (to v1.x, to a future workbench, etc.). The file body MUST cite the deferral target. |
| `[s]` | Superseded — a later decision has overridden this one. The file body MUST cite the superseding decision file: `Superseded by: <path> — <reason>`. |

**Worked transitions:**

1. **`[o]` → `[a]`**: Reconciler (or analyst) finds that an open decision has been answered in a deliverable. Append `Answered: circles/260501-1900-transform-shape/analyses/260501-1915-D04-detailed-architecture.md §4.3 — Shape C selected`. Rename `[o]` → `[a]`.
2. **`[a]` → `[i]`**: A coder/ontocoder commit lands that realises the decision. Append `Implemented: a3f7c2e — pkg/transform now uses Shape C dispatch`. Rename `[a]` → `[i]`.
3. **`[o]` → `[d]`**: User says "defer to v1.x". Append `Deferred: v1.x — pending pilot signal`. Rename `[o]` → `[d]`. (Skipping `[a]` is fine when the deferral itself is the answer.)
4. **`[a]` → `[s]`**: A new decision overrides the answered one. Append `Superseded by: <path>/YYMMDD-HHMM[a]-new-decision.md — replaces Shape C with Shape D after expert veto`. Rename to `[s]`. The superseding record may live in another Circle or in `shared/` — cite it where it is; never copy it next to the superseded one.
5. **`[o]` → `[s]`** (rare): A new decision overrides an open one before it was even answered. Same procedure as above.

**`[i]` and `[s]` are terminal.** Do not rename them back to `[o]` or `[a]`. If an implemented decision needs revisiting, file a NEW decision (which may then `Supersede` the `[i]` one).

**Grounding-Stand vs Grounding-Historie:**

The marker vocabulary mirrors foundation_V3 §1.2's two-layer Grounding model:

- `[o]` (open) and `[a]` (answered, awaiting realisation) are **Grounding-Stand** — the current best-of-knowledge the project is working with.
- `[i]` (implemented), `[s]` (superseded), and `[d]` (deferred) are **Grounding-Historie** — preserved record of what was decided, including elements that have been replaced or postponed.

Each decision store holds both layers; the marker carries the layer information. Reconciliation passes that "list active Grounding" filter on `[o]` + `[a]`; passes that "show project history" include all five. A scan for active Grounding must cover every path in `$SCAN_DECISIONS`, not just the Circle's.

## State Markers — circles

**The marker sits on the Circle record, not on the directory.** A Circle is `circles/<YYMMDD-HHMM>-<directive-slug>/`, and the directory name never changes across the Circle's lifecycle. The state lives in the record inside it: `[a]-circle.md` → `[t]-circle.md` → `[c]-circle.md`. A state change is a `mv` of that one file.

Two reasons this is worth the small oddity. First, **path stability**: every reference into a Circle — from a session history, from `portfolio.md`, from another Circle's decision, from a stash manifest — stays valid for the Circle's whole life. Were the marker on the directory, every state change would break every one of them. Second, **an immutable natural key**: the later Plane mirror needs a per-Circle identifier that does not mutate, or the guarantee "transferring twice creates no duplicates" cannot hold.

State stays cheap to read as a glob: `circles/*/[t]-circle.md` costs what `circles/*[t]*.md` used to. The price is that `ls circles/` no longer shows state at a glance; `portfolio.md` and `/fusion:next` are the built answers for that. The marker convention is not actually broken — the marker still names the state of the *record*, and the record is `circle.md`; the directory merely encloses it and its artifacts.

The vocabulary is parallel to but distinct from issues/planning and decisions. It is unchanged by the container layout.

Binding decision: `decisions/260716-1910[a]-circle-marker-am-verzeichnis-oder-an-der-circle-datei.md`.

| Marker | Meaning |
|--------|---------|
| `[a]` | **Anticipated** — provisional Directive, no Grounding yet (foundation V3 §2.1). Initial state on creation. |
| `[t]` | **Active / in-Turn** — Directive refined, Grounding crystallising, orchestrator running it. |
| `[c]` | **Closed-coherent** — three-edge Coherence verdict passed. |
| `[b]` | **Bounded Closure** — Directive judged not reachable; what was learned is the Artifact. |
| `[s]` | **Superseded** — replaced by another Circle (scope split, redirected). |
| `[d]` | **Deferred** — anticipated → indefinitely postponed. |

### Worked transitions

Every transition renames only `<circle-dir>/[S]-circle.md`. The directory is never renamed.

- `[a] → [t]` — playmaker proposes activation; user confirms; orchestrator renames the record and writes `.active-circle` with the directory name.
- `[t] → [c]` — Coherence verdict `coherent` at Phase 3; orchestrator renames the record at Phase 4 and deletes `.active-circle`.
- `[t] → [b]` — user chose **Accept Bounded Closure** at the Rebalance gate; orchestrator renames the record at Phase 4 and deletes `.active-circle`.
- `[t] → [s]` — user supersedes mid-run; orchestrator renames the record and deletes `.active-circle`; a new `[a]` Circle directory is created, citing the superseded one via `## Dependencies`.
- `[a] → [d]` — user defers an anticipated Circle indefinitely; manual rename of the record. `.active-circle` is not involved — an `[a]` Circle was never active.
- `[a] → [s]` — rare; the anticipated Circle is replaced before activation by a new Circle that captures the revised intent.

**Terminal-states statement:** `[c]`, `[b]`, `[s]`, `[d]` are terminal — `mv` back to `[a]` or `[t]` is disallowed. If continuation is needed, create a new Circle that cites the terminal one via its `## Dependencies` section. A terminal Circle keeps its directory and all its artifacts in place; closure is not a move.

**Grounding-Stand vs Grounding-Historie parallel:** as with `decisions/`, the marker carries the layer information. `[a]` and `[t]` are Grounding-Stand (current working state); `[c]`, `[b]`, `[s]`, `[d]` are Grounding-Historie (preserved record).

## Circle record template

The Circle record is `<circle-dir>/[S]-circle.md`. Creating a Circle means creating the directory, the record, and the six artifact subdirectories (`planning/`, `issues/`, `decisions/`, `history/`, `reviews/`, `analyses/`) — a Circle without its subdirectories forces the next agent to invent them. Template:

```markdown
# <One-line Directive title>

---
**Domain:** <code|data|strategic|knowledge>
**Status:** <anticipated | active | closed | bounded | superseded | deferred>
**Filed by:** <agent name or "user">
**Active spec/plan:** <filename inside this Circle's planning/, or "(none yet)">
**Active session history:** <filename inside this Circle's history/, or "(none yet)">

---

## Directive

<What this Circle aims for. The post-completion state of the Artifact, prognosticated. Revisable via Rebalance.>

## Grounding snapshot

<What we know going in. Filled at `[a] → [t]` activation by shaper portfolio-activation mode. Updates on Rebalance.>

## Dependencies

<List of other Circle directory names this Circle depends on. Playmaker flags cycles here. Also the place to cite artifacts from other Circles that bind this one — per the Origin Rule, reach is cited, not copied.>

## Turn log

<Append-only list of Turn outcomes for this Circle. Format per bullet:
- Turn N (session YYMMDD-HHMM): commits <hash>..<hash>; Coherence verdict <coherent|review-needed|skipped-...>; session history: <path>>

## Closure note

<Filled when marker becomes [c], [b], [s], or [d]. Cites the orchestrator session history file. For [b], also cites the Bounded-Closure Artifact (what was learned that the Directive could not reach).>
```

The directory is `YYMMDD-HHMM-<directive-slug>/` and the record inside it is `[S]-circle.md`, per the State Markers section above.

## portfolio.md template

`$PORTFOLIO` is regenerated by playmaker on every run. Template:

```markdown
# Portfolio

**Generated:** YYMMDD-HHMM (by playmaker session <id>)
**Domain bias:** <code|data|strategic|knowledge>

## Active ([t])

<One entry expected, or 0. If >1, flag MULTIPLE-ACTIVE warning. Each entry: Circle directory name, Directive line, active session history path.>

## Anticipated ([a]) — ranked

<Ordered list by playmaker rank. Top entry includes a one-paragraph rationale for the recommendation. Each entry: Circle directory name, Directive line, rank, dependencies summary.>

## Recently closed ([c] / [b])

<Last 5 closed Circles. Each entry: Circle directory name, marker, Closure note one-liner.>

## Archived ([s] / [d])

<Superseded and deferred Circles, for reference.>

## Warnings

<Dependency-cycle warnings, parent-grounding-stale notes (cross-references), MULTIPLE-ACTIVE conditions, etc.>
```

## Inline State Tracking

**Filename markers are not enough.** Content inside planning, issue, and decision files must also track progress, so that interruptions don't lose state.

### Planning files

- When you start a step: mark it `[IN PROGRESS]`:
  `3. [IN PROGRESS] **Step Title**`
- When you complete a step: mark it `[DONE]`:
  `1. [DONE] **Step Title**`
- When all steps are `[DONE]`: set `**Status:** Complete` in the header and rename the filename marker to `[c]`.

### Issue files

When an issue is resolved, append below the existing content:
```
---
Resolved: <brief description of what was done>
```
Then rename the filename marker to `[c]`.

### Decision files

Decision files have their own resolution annotations matching the marker semantics — do NOT use `Resolved:` (that's for defect-issues only). Use one of:

```
---
Answered: <path>:<line> — <one-line summary>
```
(rename `[o]` → `[a]`)

```
---
Implemented: <commit hash> or <path>:<line> — <one-line summary>
```
(rename `[a]` → `[i]`, or `[o]` → `[i]` if the implementation skipped the recorded-answer step)

```
---
Deferred: <target — one-line reason>
```
(rename to `[d]`)

```
---
Superseded by: <path to new decision> — <reason>
```
(rename to `[s]`)

### When to update

- After completing each plan step — not just at session end.
- After resolving an issue — before moving to the next task.
- After answering or implementing a decision — before moving to the next task.
- When a review confirms a plan step, issue, or decision is done — the reviewing agent marks it.
- When the user asks to close, defer, supersede, or reopen anything.

## Issue and Decision Filing — MANDATORY

**Every defect, problem, inconsistency, concern, or TODO discovered during work MUST be written as a separate defect file. Every open question, choice point, or design fork MUST be written as a separate decision record. No exceptions.**

This applies to:
- Defects found during implementation, analysis, or review → defect
- Inconsistencies in code, data, docs, or existing architecture → defect
- Tech debt, dead code, stale docs, dangling references → defect
- Open questions raised during shaping, planning, or analysis → decision
- Choices the user has deferred or has not yet made → decision
- Anything the user asks to track, note, or remember — choose kind per the issues-vs-decisions rule above

**Where it goes** is the Origin Rule's answer, resolved for you: defects to `$OUT_ISSUE`, decisions to `$OUT_DECISION`. Both point into the active Circle when there is one and into `shared/` when there is not. The one judgment left to you is the one the Origin Rule names: did this arise from the active Directive, or did you merely find it nearby? If the latter, file it in the shared store even while a Circle is active.

**NEVER put issues or decisions inside plan documents, review documents, analyses, code comments, chat output, history logs, or any other location.** Embedded items get lost. Each item is a separate file in its own store.

**Filename:** `YYMMDD-HHMM[o]-<topic>.md` (always `[o]` on creation, for either kind).

**Issue file format:**
```
<issue title>
---
<short description>
---
<context>
```

**Decision file format** — see the Decision Record Template below.

Brief but precise — enough context to understand the item without the original conversation.

## Decision Record Template

File: `$OUT_DECISION/YYMMDD-HHMM[o]-<topic>.md`

Body:

```markdown
# <one-line decision title — phrased as a question or choice point>

---
**Domain:** code | data | strategic | knowledge
**Status:** open | answered | implemented | deferred | superseded
**Filed by:** <agent name or "user">
**Cross-references:** <paths to related defects, analyses, plans, or decision records — in this Circle, in another Circle, or in shared/. Cite where they are; never copy them here.>

---

## Question

<One paragraph: what is the choice point? Why must it be made now?>

## Options

1. **<Option A>** — <description>
   - Pros: ...
   - Cons: ...
2. **<Option B>** — ...
3. ... (2–4 options typical; more = the question needs decomposing first)

## Constraints

<Hard constraints that any answer must satisfy.>

## Recommendation

<If the filing agent has a recommendation, state it with reasoning. Otherwise omit.>

---
Answered: <set when status moves to [a]>
Implemented: <set when status moves to [i]>
Deferred: <set when status moves to [d]>
Superseded by: <set when status moves to [s]>
```

## History Logging

Every session writes a history entry to `$OUT_HISTORY/YYMMDD-HHMM-<topic>.md` describing what was done. Update the entry's status line to `Complete` as the final step of the session — if interrupted before this, completion state is lost.

The history log is the only durable record of a session. The in-memory task list does not persist. Always update history before finishing.

## Security

Never read or display `.secret` files. If secrets are needed, ask the user to provide them via environment variables.

## Stashes

A stash is a self-contained, frozen snapshot of an active Circle's complete state — the Circle directory, the `.active-circle` pointer, `agentstate.yaml` (when a session is in flight), the dashboard, the task queue, and the git working tree. Stashes free the workspace for unrelated urgent work without losing the in-flight Circle's context.

The container layout simplifies this: a Circle's spec, plan, issues, decisions and history are all *inside* the Circle directory, so capturing the Circle captures them. There is no separate hunt through type directories for files the Circle happens to reference.

### Opt-in

Stash behaviour activates only when `fusion-workbench/stashes/` exists. The directory is created by `/fusion:circle-stash` on first invocation; it is NOT created by `/fusion:setup`. Workbenches that never stash never grow a `stashes/` directory.

Stashes are created by `/fusion:circle-stash [reason]` and consumed by `/fusion:circle-pop [stash-id]`. Both skills resolve the workbench root via `bin/fusion-workbench-root` and refuse to run outside a fusion-set-up project.

### Filesystem layout

```
fusion-workbench/stashes/
└── <YYMMDD-HHMM>-<directive-slug>/
    ├── manifest.yaml         # nine-field index
    ├── README.md             # human-readable summary + restore command
    ├── circle/               # the whole Circle directory, verbatim
    │   ├── [t]-circle.md     #   record with its marker (filename in manifest)
    │   ├── planning/         #   spec and plan travel with the Circle
    │   ├── issues/
    │   ├── decisions/
    │   ├── history/
    │   ├── reviews/
    │   └── analyses/
    ├── agentstate.yaml       # only present when stash captured a running session
    ├── orchestrator-live.md
    ├── tasklist.md           # if present at stash time
    └── git/
        ├── stash-ref         # raw "git stash list" line + (no changes) sentinel
        └── head              # HEAD short-hash at stash time
```

The stash id `<YYMMDD-HHMM>-<directive-slug>` is derived from the current time (not the Circle's birth time) so multiple stashes of the same Circle remain distinguishable.

### Manifest schema

Nine fields, in this order:

```yaml
stash_id: 260519-1200-stash-smoke              # YYMMDD-HHMM-<slug>
timestamp: "2026-05-19T12:00:00Z"              # RFC 3339 UTC
reason: "smoke test"                           # one line
original_circle_dirname: "260519-1200-stash-smoke"   # the Circle directory name (no marker)
original_circle_record: "[t]-circle.md"        # the record filename, marker included
active_circle_content: "260519-1200-stash-smoke"     # verbatim content of .active-circle at stash time
head_short_hash: "0b7344a"
git_stash_ref: "stash@{0}"                     # human-readable positional ref, or "(no changes)"
git_stash_sha: "3f2a7b8c9d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a"  # stable commit SHA from `git rev-parse stash@{0}`; null if (no changes)
has_agentstate: true                           # false when stashed without a running session
```

String values are quoted; `null` is the unquoted YAML literal.

**`has_spec_plan` is gone** — the schema went from ten fields to nine. It used to enumerate which spec and plan files had been copied in from foreign directories; in the container model the Circle *contains* them, so the field had nothing left to enumerate. Existing ten-field stashes stay readable: `/fusion:circle-pop` ignores the field when present.

`git_stash_ref` is human-readable (`stash@{N}`) and recorded for the user. `git_stash_sha` is the stable underlying commit SHA — pop's `git stash apply` uses the SHA so an intervening `git stash push` during the urgent work cannot renumber the positional ref out from under it. The SHA is `null` when the working tree was clean and no stash entry was created.

### Lifecycle

- Created by `/fusion:circle-stash` (one stash directory per invocation).
- Consumed by `/fusion:circle-pop`, which restores state but does NOT auto-delete the stash directory. The user prunes manually: `rm -rf fusion-workbench/stashes/<id>/ && git stash drop <ref>`.
- A `STASH_IN_PROGRESS` lock file at the stash directory root signals an incomplete write. `/fusion:circle-pop` refuses to read stashes carrying this file.
- Multiple stashes can coexist (decision `260519-1100[a]-circle-stash-pop-design.md`). `/fusion:circle-pop` lists them when invoked without an argument and asks the user to pick.

### Boundary events

- `circle_stashed` event in `orchestrator-events.jsonl` marks the stash boundary.
- `circle_popped` event marks the restore boundary.
- The event log is NOT moved into the stash; it stays append-only across all sessions.

### What stash does NOT touch

- `orchestrator-events.jsonl` — root-anchored, append-only across all sessions; the stash/pop boundaries are recorded by appending event lines, never by truncating or relocating the log.
- `.guard-state/*` — root-anchored, project-wide, not Circle-specific.
- The shared store — `shared/` belongs to no Circle and is never captured by a stash.

Session history is the one nuance: it lives *inside* the stashed Circle and therefore travels with it. `/fusion:circle-stash` appends a `## Stashed Circle` section to the active session's history file (best-effort, when the file can be located) before capture, but never rewrites it otherwise.

### Cross-references

- Design spec: `analyses/260519-0438-circle-stash-pop-concept.md` (pre-container; now under `shared/`)
- Binding decision: `decisions/260519-1100[a]-circle-stash-pop-design.md`
- Skill bodies: `skills/circle-stash/SKILL.md`, `skills/circle-pop/SKILL.md`

## Commit lock

A POSIX mutex around `git add` + `git commit` operations against the project's working tree. Defends against the cross-agent staging race where parallel agents' commit operations interleave at the git-index level (commit absorption, orphan commits, WT-left-dirty outcomes).

### When it activates

Always, when any party is about to commit. Workbench-anchored — different projects have independent locks; sessions on the same project share one lock.

### Mechanism

Atomic `mkdir fusion-workbench/.commit-lock/` (POSIX guarantees mkdir either creates the directory exclusively or fails). The lock is root-anchored, like the other project-wide state — it guards the project's git index, which no single Circle owns. The holder file `.commit-lock/holder` records three lines: `tag`, `pid`, `acquired_at` (RFC-3339 UTC). Stale-lock detection at 60 seconds: if the holder PID is no longer running AND the lock is older than the threshold, the next acquirer force-releases it.

### Helper

`bin/fusion-commit-lock` with subcommands:

- `acquire <tag>` — block until acquired (200ms poll, exponential backoff to 2s, indefinite wait)
- `release` — release the lock (must hold or recorded PID dead)
- `with <tag> -- <cmd...>` — canonical pattern: acquire, run, release on any exit
- `check` — diagnostic; print lock state, no mutation

The `with` form is canonical; explicit `acquire`/`release` is for special cases like internal control-flow (retry after bugfixer in orchestrator Phase 2 Step 3b).

### Who acquires

- **Orchestrator** at Phase 2 Step 3b — before staging and committing.
- **Coder / ontocoder / bugfixer** ONLY if they commit directly (rare; default is the orchestrator commits on their behalf).
- **Other agents** — never commit, never need the lock.

### Tag conventions

Mandatory. Used in stale-lock messages. Format: the agent name (`orchestrator`, `coder`, `ontocoder`, `bugfixer`).

### Failure modes

- **Concurrent acquire from a different party** → polled every 200ms with exponential backoff to 2s. One stderr message after the first failed acquire (`waiting for commit lock held by <other-tag>...`); silent thereafter. Blocks indefinitely — no max-wait timeout.
- **Crash mid-commit** → next acquirer's stale-lock detector force-releases after 60 seconds if the recorded PID is dead. Stderr warning announces the force-release.
- **Release-not-held** → non-zero exit with `not currently held by anyone`. Caller should log and proceed (defensive — typically indicates a programming error rather than a race).

### Cross-reference

Issue `260516-0534[c]-cross-agent-staging-race-on-unlocked-working-tree.md` (closed by this protocol; pre-container, now under `shared/issues/`).
