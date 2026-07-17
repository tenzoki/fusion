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
| Portfolio | `$PORTFOLIO` | fixed | — |
| Task queue | `$TASKLIST` | fixed | — |

`<sender>` on a review file is `coderev`, `ontorev`, or `conceptrev`. It is what distinguishes the three review kinds now that they share one `reviews/` directory — it is mandatory, and the document header repeats it.

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

History, review, analysis, investigation, consultation, and memo files do NOT carry state markers.

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
| All records, marker read from the name | `circles/*/*-circle.md`, then `basename` → `sed -nE 's/^_([a-z])_.*/\1/p'` |

The second form is preferred wherever the task is counting or enumerating: it reads the marker as data rather than requiring one glob per state.

`find` needs no special handling: `find circles -name '_t_circle.md'` is correct as written — the underscore is not a metacharacter to `find`'s `-name` matcher any more than it is to the shell.

This applies to every marker in every vocabulary — `_o_`, `_a_`, `_t_`, `_c_`, `_i_`, `_p_`, `_b_`, `_s_`, `_d_` — anywhere a filename carrying one is matched by a glob, in any agent prompt or skill body.

The price of the marker-on-the-record design is that `ls circles/` no longer shows state at a glance; `portfolio.md` and `/fusion:next` are the built answers for that. The marker convention is not actually broken — the marker still names the state of the *record*, and the record is `circle.md`; the directory merely encloses it and its artifacts.

The vocabulary is parallel to but distinct from issues/planning and decisions. It is unchanged by the container layout.

Binding decision: `decisions/260716-1910[a]-circle-marker-am-verzeichnis-oder-an-der-circle-datei.md`.

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
    │   ├── _t_circle.md     #   record with its marker (filename in manifest)
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
original_circle_record: "_t_circle.md"        # the record filename, marker included
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
