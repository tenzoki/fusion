# fusion-workbench Conventions

**Provenance:** No motivating record recoverable; introduced in `git:b05b423`.

Shared conventions for all agents operating on `fusion-workbench/`, and for the rule files those agents load. This file is auto-loaded by the plugin system into every agent's context. Single source of truth for the workbench layout, the origin rule, path resolution, state markers, issue and decision filing, inline tracking, history logging, timestamps, and provenance headers on rule files.

**This document is the definition.** Layout, origin rule, and path resolution are defined here completely. No agent prompt and no skill body may carry a competing or supplementary definition of where artifacts go — they resolve their paths at run time (see `## Path Resolution (Pfadauflösung)`) and cite this document for the rules. A path literal that names a store directory belongs in exactly two places: this file, and `bin/fusion-paths`.

## fusion-workbench Layout

A **Circle is a directory**, not a file. Everything a unit of work produces lives inside it. Everything with no Circle affiliation lives in `shared/`. Everything the hooks and the dashboard read stays at the workbench root.

```
fusion-workbench/
├── circles/
│   └── 260716-1847-workbench-umbau/   # one directory per unit of work
│       │                              # stable name: <YYMMDD-HHMM>-<directive-slug>, NO marker
│       ├── _t_circle.md              # the Circle record — carries the state marker
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
│   # ── Root-anchored. The hooks, the monitor and the bin/ helpers read these ──
│   # ── HERE, at fixed root-relative paths. Do not move them.               ──
├── agentstate.yaml                     # hooks/tracker.ts:33-36, bin/monitor:72-75
├── orchestrator-live.md                # hooks/tracker.ts:33-36, bin/monitor:72-75
├── orchestrator-events.jsonl           # hooks/tracker.ts:33-36, bin/monitor:72-75
├── .guard-state/                       # hooks/tracker.ts:33-36, bin/monitor:72-75
├── .commit-lock/                       # bin/fusion-commit-lock (created and removed per commit)
└── .session-marker                     # bin/fusion-session-mark
```

**The root-anchored surfaces are not negotiable.** Each is read at a fixed root-relative path by the consumer named beside it in the tree, and none of those consumers has a fallback path — relocating one into a Circle or into `shared/` breaks it silently.

They are root-anchored because none of them belongs to a unit of work. `agentstate.yaml`, `orchestrator-live.md` and `orchestrator-events.jsonl` are session state, and a session may span Circles. `.guard-state/` counters are project-wide. `.commit-lock/` guards the project's git index, which no single Circle owns. `.session-marker` answers "is an orchestrator already running in this project", which is meaningless scoped to a Circle. This placement is what makes the guarantee "hooks behave unchanged across the layout" structural rather than promised.

The list is exhaustive as written, and it is a list rather than a count on purpose: a count goes stale on the next helper that needs project-wide state, and this one already had. When a `bin/` helper or a hook adds a root-anchored surface, it lands in this tree in the same commit — this document is the definition, and an incomplete tree invites exactly the reasoning-by-omission it exists to prevent.

**`shared/` mirrors the Circle's artifact kinds, plus three of its own.** Every kind a Circle can hold has a shared counterpart, because any of them can be produced with no Circle active and must still have a home. `investigations/`, `consult/` and `memos/` exist only in `shared/`: an investigation studies a failure capture, a consultation answers a question, and a memo records a note — none of the three is produced by executing a Directive, so none can originate in a Circle.

**The three review types collapse into one `reviews/`.** codereview, ontoreview and conceptreview differ by sender, not by kind. The sender is in the filename (`YYMMDD-HHMM-<sender>-<topic>.md`) and in the document header. Inside one Circle they do not earn a directory each.

`fusion-workbench/.active-circle` is a one-line pointer file containing the **directory name** of the active Circle (e.g. `260716-1847-workbench-umbau`) — no marker, no `circles/` prefix, no `.md`. It is absent when no Circle is active. Because the directory name is stable across the Circle's whole lifecycle, the pointer no longer has to be re-pointed on every marker change: the orchestrator **writes** it once on `_a_→_t_` activation (after user confirmation of playmaker's proposal) and **deletes** it on `_t_→_c_/_b_/_s_/_d_` closure. Nothing else touches it. The pointer is the single source of truth for "active Circle" — `agentstate.yaml` does NOT duplicate this field.

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

**`bin/fusion-paths <name>` is the single resolution point.** No agent and no skill hard-codes a store path. The prompt says "write your plan to `$OUT_PLAN`"; the resolver says what `$OUT_PLAN` is.

### The name namespace

`<name>` is an **agent** (`agents/<name>.md`) or a **skill** (`skills/<name>/SKILL.md`). The two share one flat namespace, and **every consumer asks under its own name**: `fusion-paths coder`, `fusion-paths memo`, `fusion-paths log-activity`.

A skill is its own consumer, not a guest in an agent's key set. The alternative — a skill resolving under whichever agent hosts its session — does not work, and not marginally: `/fusion:log-activity` reads consultations and investigations, `SCAN_CONSULT` is named by `playmaker` alone and `SCAN_INVESTIGATIONS` by `conceptrev` alone, and no agent names both. There is no argument that resolves that skill's reads. Making one work would mean adding both keys to an agent whose prompt performs neither read, which breaks the rule under *Emission is per-consumer* below and turns a key set into "whatever some skill in this session might want".

A name is a lowercase slug. It resolves to exactly one prompt file; a name that is both an agent and a skill is an authoring error and exits 4, because there is no basis to prefer one prompt's key set over the other's. No collision exists today.

**One exception, and it is not a hedge:** `/fusion:setup` passes `orchestrator`. It is the orchestrator's Setup procedure factored into a skill, and the values it resolves are held by the orchestrator for the whole session — including steps that live in `agents/orchestrator.md`. The consumer there really is the orchestrator.

**One consumer names the layout literally, and only one:** `/fusion:migrate`. Every other consumer names one layout — the container one — and asks the resolver which store a kind maps to. Migrate is the transition *between* two layouts, so it must name both, and the resolver cannot help it with either side. The old side (`planning/`, `codereview/`, `memos/` at the workbench root) has no keys — the resolver knows only the container layout. The new side would resolve, but to the wrong values: a pre-v4 workbench with a Circle active makes `OUT_PLAN` point into the Circle, whereas the migration must send every unattributed pre-v4 artifact to `shared/` (Origin Rule, corollary 1). Worse, the resolver *refuses* migrate's own input: a pre-v4 `.active-circle` holds the old filename-with-marker form, which `bin/fusion-paths` rejects with exit 3 (`bin/fusion-paths:220-225`). So the one skill that exists to serve pre-v4 workbenches is the one the resolver cannot run against. It still gets its workbench anchor from `bin/fusion-workbench-root` — the same primitive the resolver delegates to — but the store paths it names are literal, and that is correct.

### Where the call belongs

In **Setup step 2**, alongside `"$FUSION_PLUGIN_ROOT/bin/fusion-rules" <agent>`. That step is demonstrably executed by every agent on every run — it is the step that loads the rules the agent then obeys. A per-write call would be a new obligation with a new miss rate; a Setup-step call rides an obligation that already holds. Resolve once at Setup, use the values for the rest of the session. A skill resolves at its own first step, for the same reason.

`fusion-rules` still takes an **agent** name only. The two helpers stand side by side in the same step with different namespaces, and that is deliberate: `fusion-rules` maps an agent to rule-file patterns, which is an authored fact about an agent and has no meaning for a skill. Their symmetry is the interface (one argument, `KEY=value` on stdout, the same `0/1/2` exit shape), not the argument domain.

### Contract

Signature `fusion-paths <name>`. Output: one `KEY=value` line per emitted key on stdout. Paths are workbench-relative except `WORKBENCH` itself, which is absolute. Multi-value keys are space-separated.

#### Exit codes

| Code | Meaning | Shared with `bin/fusion-rules`? |
|---|---|---|
| 0 | Success | yes |
| 1 | Usage error, or no workbench found above `pwd` | yes |
| 2 | Unknown name — no such agent and no such skill | yes |
| 3 | `.active-circle` is corrupt or orphaned — a **workbench-state** fault | no |
| 4 | Internal error: a prompt names a key the resolver cannot order or value, or one name is both an agent and a skill — a **fusion bug** | no |

The 0/1/2 shape is `bin/fusion-rules`'; 3 and 4 are this resolver's own, and the divergence is written down here so the "same shape as fusion-rules" claim stays checkable.

**3 and 4 must never be merged.** They address different people. Exit 3 is the user's to fix: their pointer is stale, and the advice "fix `.active-circle` before continuing" is right. Exit 4 is not fixable from the workbench at all, and a caller that keys on the code would hand the user that same advice about a pointer that is perfectly fine. Distinguishing them only in the stderr text is not enough — prompts key on the code.

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
| `SCAN_INVESTIGATIONS` | `shared/investigations` | Read counterpart of `OUT_INVESTIGATION`. Shared-only — see invariant 2. |
| `SCAN_CONSULT` | `shared/consult` | Read counterpart of `OUT_CONSULT`. Shared-only — see invariant 2. |
| `SCAN_CIRCLES` | `circles` | Portfolio-wide scans (playmaker, `/fusion:next`). |
| `PORTFOLIO` | `portfolio.md` | |
| `TASKLIST` | `tasklist.md` | |

### Two invariants

1. **With no active Circle, every `OUT_*` points into `shared/`.** There is no error state and no refusal for "no Circle active" — work happens outside Circles routinely, and it has a defined home. This is the Origin Rule's "unknown origin means `shared/`" expressed executably.
2. **Every `SCAN_*` always carries both stores** — the Circle's and the shared one — even when a Circle is active. An agent searching for open decisions must see the Circle's *and* the project's. With no active Circle, a `SCAN_*` collapses to the shared store alone.

   `SCAN_INVESTIGATIONS` and `SCAN_CONSULT` look like exceptions and are not. Their kinds exist only in `shared/` (an investigation and a consultation cannot originate in a Circle — see `## fusion-workbench Layout`), so "both stores" has nothing to range over and collapses to one. The invariant is not weakened for them; it is satisfied vacuously. The asymmetry is intentional, and it follows from the layout rather than sitting beside it.

   There is deliberately no `SCAN_MEMOS`. `memos/` is shared like the other two, but no agent reads it — a memo is written for the user, not for an agent. A key is emitted when a prompt reads the kind, not because the symmetry of the table would look better with it.

### Emission is per-consumer, and derived from the prompt

The resolver emits only the keys a consumer needs — a coder gets no `OUT_PLAN`, a playmaker gets no `OUT_ISSUE`. This table defines what each key *means*; **the prompt defines which keys a consumer gets.**

**The key set is not declared anywhere. It is read out of the prompt.** `bin/fusion-paths <name>` greps `agents/<name>.md` or `skills/<name>/SKILL.md` for its own `$OUT_*`, `$SCAN_*`, `$PORTFOLIO` and `$TASKLIST` references, and those references *are* the set. `WORKBENCH` is emitted unconditionally; `CIRCLE` whenever a Circle is active; neither belongs to a set. A prompt that names no key gets `WORKBENCH` alone — a true answer, not a failure.

This is what makes the rule below hold **by construction** rather than by audit:

> Every directory a consumer's prompt *reads* has a `SCAN_*` key in its set; every kind it *writes* has an `OUT_*`. `OUT_*` is a write key, `SCAN_*` is a read key.

Under-emission — a prompt naming a key the resolver withholds — is now impossible: the prompt naming it is what creates it. That was the defect that mattered, and it was live. The sets were once declared by hand, built by a deliberate line-by-line audit of all 15 prompts; the audit went 14/15, missing that the reconciler files decision records. `$OUT_DECISION` expanded to the empty string and every record it filed landed at the workbench root — silently, because the write succeeded. A declared set is a second copy of what the prompt already says, and every prompt edit re-rolls the dice on the copy (`HYG-SOT`).

Over-emission — a key emitted that no prompt names — is likewise impossible now, and the signal it used to carry has moved. When a declared set held a key its prompt never used, the finding was usually *"this prompt is missing a step"*, not *"this key is spare"*. That is a prompt-completeness question, found by reading the prompt. It was visible here only by accident, as the diff between a human's belief about a prompt and the prompt's text.

Two consequences for authors:

- **A missing path in a prompt is now a prompt bug, and only a prompt bug.** It cannot be patched by adding a key to the resolver, because the resolver has no key list to add to. Write `$SCAN_ISSUES` where the prompt performs the read.
- **A key mistyped in a prompt stops the run.** `$SCAN_ISUES` is not in the resolver's key table, so it exits 4 naming the prompt and the key, rather than silently expanding to nothing (`HYG-NO-SILENT-FAIL`).

Derivation happens at run time and costs one grep over one file: the set is built for the requested name only. There is no generated table, because a generated table would go stale exactly the way the declared sets did — whenever someone edits a prompt and does not re-run the generator.

`bin/fusion-rules` still hand-maintains its own agent → rule-pattern mapping, and that divergence is deliberate: an agent's prompt does not name the rule files that apply to it, so that mapping is an authored fact with no source to derive from. A key set is not a fact; it is a restatement of the prompt.

### Failure behaviour

A `.active-circle` pointing at a directory that does not exist is an error: message on stderr, exit 3, no silent fall back to `shared/`. A stale pointer means the workbench's state is inconsistent, and quietly writing to the wrong store is worse than stopping (`HYG-NO-SILENT-FAIL`).

A key the resolver cannot value exits 4 rather than emitting `KEY=`. An empty right-hand side would send an agent's writes to the workbench root — the same silent-wrong-place failure, arrived at from the other direction.

Callers must distinguish the two: **exit 3 is the user's to fix, exit 4 is ours.** A prompt that treats any non-zero exit as "your `.active-circle` is broken" is wrong on 4 and sends the user hunting a fault that is not theirs.

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
| Circle record | inside the Circle directory | `_S_circle.md` | yes (circles vocabulary) |
| Spec / plan | `$OUT_PLAN` | `YYMMDD-HHMM_S_<topic>.md` | yes (issues/planning vocabulary) |
| Defect | `$OUT_ISSUE` | `YYMMDD-HHMM_S_<topic>.md` | yes (issues/planning vocabulary) |
| Decision record | `$OUT_DECISION` | `YYMMDD-HHMM_S_<topic>.md` | yes (decisions vocabulary — richer set) |
| Session history | `$OUT_HISTORY` | `YYMMDD-HHMM-<topic>.md` | no |
| Review (code / onto / concept) | `$OUT_REVIEW` | `YYMMDD-HHMM-<sender>-<topic>.md` | no |
| Analysis | `$OUT_ANALYSIS` | `YYMMDD-HHMM-<topic>.md` | no |
| Investigation | `$OUT_INVESTIGATION` | `YYMMDD-HHMM-<topic>.md` | no |
| Consultation | `$OUT_CONSULT` | `YYMMDD-HHMM-<topic>.md` | no |
| Memo | `$OUT_MEMO` | `memos-<username>.md` / `tasks-<username>.md` | no |
| Cadence digest | `$OUT_MEMO` | `cadence-<username>.md` | no |
| Portfolio | `$PORTFOLIO` | fixed | — |
| Task queue | `$TASKLIST` | fixed | — |

`<sender>` on a review file is `coderev`, `ontorev`, or `conceptrev`. It is what distinguishes the three review kinds now that they share one `reviews/` directory — it is mandatory, and the document header repeats it.

The two kinds sharing `$OUT_MEMO` differ in write semantics: the memo and task files are **append** logs (`/fusion:memo` adds to them), while the cadence digest is **overwritten** on each `/fusion:cadence` run — it is a fresh snapshot of the work cadence, not a history of its own runs.

## State Markers — issues and planning

Defect files and spec/plan files carry a state marker: `YYMMDD-HHMM_S_<topic>.md`. This holds in a Circle and in `shared/` alike.

| Marker | Meaning |
|--------|---------|
| `_o_` | Open — initial state on creation |
| `_p_` | In progress — agent is actively working on it |
| `_c_` | Closed — resolved, or user decided to close |
| `_d_` | Deferred — user decided, or agent proposed and user confirmed |

**Rules:**
- Every new file starts as `_o_`.
- When an agent begins work: rename `_o_` → `_p_`.
- When work is done: rename `_p_` → `_c_`.
- When the user defers: rename to `_d_`.
- State change = `mv` (rename). Only the marker changes; `YYMMDD-HHMM` and `<topic>` stay the same.

History, review, analysis, investigation, consultation, memo, and cadence files do NOT carry state markers.

## State Markers — decisions

Decision records carry a richer state marker that distinguishes "the answer is recorded" from "the answer is realised in code/data".

| Marker | Meaning |
|--------|---------|
| `_o_` | Open — the question has been filed but not yet answered. Initial state on creation. |
| `_a_` | Answered — a recorded answer exists somewhere on disk (typically an analysis, a plan, a session history, or the decision record itself). The file body MUST cite the answer's location with `Answered: <path>:<line> — <one-line summary>`. Cite the path as it stands, whether that is inside a Circle or in `shared/`. The decision is not yet realised in code or data. |
| `_i_` | Implemented — the answer has been realised: code or data on disk now reflects the decision. The file body MUST cite the implementation with `Implemented: <commit hash> or <path>:<line> — <one-line summary>`. This is the terminal state for decisions whose realisation is verifiable. |
| `_d_` | Deferred — the user explicitly pushed the decision out (to v1.x, to a future workbench, etc.). The file body MUST cite the deferral target. |
| `_s_` | Superseded — a later decision has overridden this one. The file body MUST cite the superseding decision file: `Superseded by: <path> — <reason>`. |

**Worked transitions:**

1. **`_o_` → `_a_`**: Reconciler (or analyst) finds that an open decision has been answered in a deliverable. Append `Answered: circles/260501-1900-transform-shape/analyses/260501-1915-D04-detailed-architecture.md §4.3 — Shape C selected`. Rename `_o_` → `_a_`.
2. **`_a_` → `_i_`**: A coder/ontocoder commit lands that realises the decision. Append `Implemented: a3f7c2e — pkg/transform now uses Shape C dispatch`. Rename `_a_` → `_i_`.
3. **`_o_` → `_d_`**: User says "defer to v1.x". Append `Deferred: v1.x — pending pilot signal`. Rename `_o_` → `_d_`. (Skipping `_a_` is fine when the deferral itself is the answer.)
4. **`_a_` → `_s_`**: A new decision overrides the answered one. Append `Superseded by: <path>/YYMMDD-HHMM_a_new-decision.md — replaces Shape C with Shape D after expert veto`. Rename to `_s_`. The superseding record may live in another Circle or in `shared/` — cite it where it is; never copy it next to the superseded one.
5. **`_o_` → `_s_`** (rare): A new decision overrides an open one before it was even answered. Same procedure as above.

**`_i_` and `_s_` are terminal.** Do not rename them back to `_o_` or `_a_`. If an implemented decision needs revisiting, file a NEW decision (which may then `Supersede` the `_i_` one).

**Grounding-Stand vs Grounding-Historie:**

The marker vocabulary mirrors foundation_V3 §1.2's two-layer Grounding model:

- `_o_` (open) and `_a_` (answered, awaiting realisation) are **Grounding-Stand** — the current best-of-knowledge the project is working with.
- `_i_` (implemented), `_s_` (superseded), and `_d_` (deferred) are **Grounding-Historie** — preserved record of what was decided, including elements that have been replaced or postponed.

Each decision store holds both layers; the marker carries the layer information. Reconciliation passes that "list active Grounding" filter on `_o_` + `_a_`; passes that "show project history" include all five. A scan for active Grounding must cover every path in `$SCAN_DECISIONS`, not just the Circle's.

## State Markers — circles

**The marker sits on the Circle record, not on the directory.** A Circle is `circles/<YYMMDD-HHMM>-<directive-slug>/`, and the directory name never changes across the Circle's lifecycle. The state lives in the record inside it: `_a_circle.md` → `_t_circle.md` → `_c_circle.md`. A state change is a `mv` of that one file.

Two reasons this is worth the small oddity. First, **path stability**: every reference into a Circle — from a session history, from `portfolio.md`, from another Circle's decision, from a stash manifest — stays valid for the Circle's whole life. Were the marker on the directory, every state change would break every one of them. Second, **an immutable natural key**: the later Plane mirror needs a per-Circle identifier that does not mutate, or the guarantee "transferring twice creates no duplicates" cannot hold.

The delimiter is an underscore, not brackets, and that choice is what keeps the marker cheap to read as a glob. `[` and `]` are shell-glob metacharacters: a marker written in bracket form inside a glob is silently a *character class* matching the single marker letter, so a glob of the shape `circles/*/…-circle.md` with a bracketed `t` resolves to `circles/*/t-circle.md`, matches the empty set, and under `bash` fails *silently* — the unmatched pattern expands to itself, the customary `[ -e "$f" ] || continue` guard drops it, and the count comes back `0` on a workbench full of Circles (`HYG-NO-SILENT-FAIL`). That trap was hit five times in a single session. The underscore is inert in both glob and regex: `_t_circle.md` matches literally, with no escaping and no character-class surprise.

Two forms are correct. Use them verbatim:

| Purpose | Form |
|---|---|
| Records in one state | `circles/*/_t_circle.md` |
| All records, marker read from the name | `circles/*/*_circle.md`, then `basename` → `sed -nE 's/^_([a-z])_.*/\1/p'` |

The second form is preferred wherever the task is counting or enumerating: it reads the marker as data rather than requiring one glob per state.

`find` needs no special handling: `find circles -name '_t_circle.md'` is correct as written — the underscore is not a metacharacter to `find`'s `-name` matcher any more than it is to the shell.

This applies to every marker in every vocabulary — `_o_`, `_a_`, `_t_`, `_c_`, `_i_`, `_p_`, `_b_`, `_s_`, `_d_` — anywhere a filename carrying one is matched by a glob, in any agent prompt or skill body.

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

## Inline State Tracking

**Filename markers are not enough.** Content inside planning, issue, and decision files must also track progress, so that interruptions don't lose state.

### Planning files

- When you start a step: mark it `[IN PROGRESS]`:
  `3. [IN PROGRESS] **Step Title**`
- When you complete a step: mark it `[DONE]`:
  `1. [DONE] **Step Title**`
- When all steps are `[DONE]`: set `**Status:** Complete` in the header and rename the filename marker to `_c_`.

### Issue files

When an issue is resolved, append below the existing content:
```
---
Resolved: <brief description of what was done>
```
Then rename the filename marker to `_c_`.

### Decision files

Decision files have their own resolution annotations matching the marker semantics — do NOT use `Resolved:` (that's for defect-issues only). Use one of:

```
---
Answered: <path>:<line> — <one-line summary>
```
(rename `_o_` → `_a_`)

```
---
Implemented: <commit hash> or <path>:<line> — <one-line summary>
```
(rename `_a_` → `_i_`, or `_o_` → `_i_` if the implementation skipped the recorded-answer step)

```
---
Deferred: <target — one-line reason>
```
(rename to `_d_`)

```
---
Superseded by: <path to new decision> — <reason>
```
(rename to `_s_`)

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

**Filename:** `YYMMDD-HHMM_o_<topic>.md` (always `_o_` on creation, for either kind).

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

File: `$OUT_DECISION/YYMMDD-HHMM_o_<topic>.md`

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
Answered: <set when status moves to _a_>
Implemented: <set when status moves to _i_>
Deferred: <set when status moves to _d_>
Superseded by: <set when status moves to _s_>
```

## Provenance headers on rule files

Every file in the plugin's `rules/` directory opens with a line naming what caused it to exist. A reader who opens a rule learns, within the first ten lines, which record, Circle, or commit put it there, and therefore has a way to ask whether the reason still holds.

**The header.** One line, anywhere in the first ten lines of the file. The canonical written form is:

```
**Provenance:** <citation>
```

Canonical placement is directly under the file's H1 title, on line 3. The ten-line window is tolerance rather than licence. Ten was sized against the pre-header corpus, where the longest opening blockquote ran to line 8 in `context-manifest.md`, so a header placed after that lede would have landed on line 10 and still counted. Every rule file now carries its header above the lede instead, at line 3, which pushed that same blockquote down to lines 5-10. The current bound is therefore tighter than the one the window was sized for: it ends exactly where the corpus's longest lede ends, and in that file a header below the lede would sit at line 12, outside it. The remaining margin is zero, and it costs nothing, because a header on line 3 needs no margin at all. That is also the answer for a future file whose opening blockquote runs long — move the header above the blockquote, not widen the window.

**Three citation forms.** Which one a file uses is decided by what its history supports, not by the author's preference.

1. **A decision record.** A workbench-relative path to a record under a decisions store, for example `shared/decisions/260801-1020_a_provenance-header-on-rule-files.md`. Prefer this form whenever a record exists. It is the only form that carries the header's real payoff: the record's marker changes to `_s_` when the decision is superseded, so the rule citing it becomes a retirement candidate any reader can spot.
2. **A Circle.** A Circle **directory** name, for example `circles/260718-1924-v5x-overhaul`. The directory name is used rather than the record filename, because the directory is stable across the Circle's whole lifecycle while the record filename carries a marker that changes. A reader follows the citation, reads whichever `*_circle.md` is present, and takes the state from its name.
3. **The admission plus the introducing commit.** For a file with no recoverable motivating record, written exactly like this:

```
**Provenance:** No motivating record recoverable; introduced in `git:<short-hash>`.
```

The commit is admission-scoped and nothing more. Git is not the provenance mechanism; it is what an honest header falls back to when the alternative is a citation the reader cannot follow anywhere. Do not reconstruct a plausible record for a file that has none. An invented rationale is exactly the fiction this header exists to prevent.

**What the gate checks, and what it does not.** `hooks/lib/__tests__/provenance-header-lint.test.ts` fails `npm test` when a file in the plugin's `rules/` directory carries no `Provenance:` line in its first ten lines, and it names the offending file. It reads the plugin's own `rules/` only. A consuming project's `./rules/` and `.claude/rules/` are in no test set fusion controls, so there the header is documented convention backed by the curator's discipline, and a project gains header-based evidence only for rules written or edited after it adopts the convention. The gate checks that a header is present. It does not read the value and it resolves no cited path, so a header citing something useless still passes, and a header citing a record that was later moved or archived also still passes. What stops a hollow header is review, not the gate.

**`Provenance:` is file-scoped; `Binding decision:` is section-scoped.** The two coexist and mean different things. A `Provenance:` line at the top of a file states why the *file* exists. A `Binding decision:` line inside a section states which record binds *that section*. Neither replaces the other, and a section note never satisfies the gate: the gate reads only the first ten lines, and only for `Provenance:`.

**Whoever writes a rule file writes its header.** An agent that creates a rule file gives it a header in the same edit, choosing the form its history supports. An agent that edits an existing rule file preserves the header, and updates it when the edit is substantial enough that a different record has become the file's reason for existing. This obligation falls first on the curator, whose work is writing and consolidating normative text; in the plugin's own repository the lint gate backs it, and everywhere else the discipline stands alone.

Binding decision: `shared/decisions/260801-1020_a_provenance-header-on-rule-files.md`.

## History Logging

Every session writes a history entry to `$OUT_HISTORY/YYMMDD-HHMM-<topic>.md` describing what was done. Update the entry's status line to `Complete` as the final step of the session — if interrupted before this, completion state is lost.

The history log is the only durable record of a session. The in-memory task list does not persist. Always update history before finishing.

## Security

Never read or display `.secret` files. If secrets are needed, ask the user to provide them via environment variables.

## Stashes

The stash protocol — opt-in, snapshot layout, manifest schema, lifecycle, boundary events, what a stash does not touch — moved verbatim to `rules/workbench-stash-and-lock.md`, which `bin/fusion-rules` emits to `orchestrator` only; `/fusion:circle-stash` and `/fusion:circle-pop` cite that file directly.

## Commit lock

The commit-lock protocol — when it activates, mechanism, the `bin/fusion-commit-lock` subcommands, who acquires, tag conventions, failure modes — moved verbatim to `rules/workbench-stash-and-lock.md`, which `bin/fusion-rules` emits to `orchestrator` only.
