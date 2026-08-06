# fusion-workbench Conventions

**Provenance:** No motivating record recoverable; introduced in `git:b05b423`.

Shared conventions for all agents operating on `fusion-workbench/`, and for the rule files those agents load. This file is emitted by `bin/fusion-rules` to every agent at Setup step 2; nothing is auto-loaded. Single source of truth for the workbench layout, the origin rule, the operative half of path resolution, the issue/planning and decision marker vocabularies, marker globs, filename patterns, issue and decision filing, inline tracking, history logging, timestamps, and the project language declaration.

**This document is the definition** of everything it still states in full. Four topics that were once defined here now have their own authoring homes, each cited at the point where it left, and each emitted to the audience that actually applies it rather than to all sixteen agents:

| Topic | Authoring home | Emitted to |
|---|---|---|
| The resolver's name namespace, key table, and key-set derivation | `rules/workbench-path-resolution.md` | no agent — read when authoring a prompt or the resolver |
| Circle state markers, transitions, the record and portfolio templates | `rules/circle-records.md` | `orchestrator`, `playmaker`, `shaper` |
| Provenance headers on rule files | `rules/rule-file-provenance.md` | no agent — read when writing a rule file |
| Stashes and the commit lock | `rules/workbench-stash-and-lock.md` | `orchestrator` |

No agent prompt and no skill body may carry a competing or supplementary definition of where artifacts go — they resolve their paths at run time (see `## Path Resolution (Pfadauflösung)`) and cite whichever of these five files owns the rule.

**Store-directory path literals.** `hooks/lib/__tests__/path-literal-lint.test.ts` forbids one in any `agents/*.md` or `skills/*/SKILL.md` outside `/fusion:setup` and `/fusion:migrate`; every other consumer resolves through `bin/fusion-paths`. The gate reads neither `rules/` nor `bin/`, so the files that *define* the stores are outside its reach rather than exempted by it. They are enumerated there as `DEFINITION_SITES` all the same — an enumeration somebody has to edit is the difference between a fourth definition site being decided and one merely slipping past a gate that never looked.

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

`fusion-workbench/.active-circle` is a one-line pointer file containing the **directory name** of the active Circle (e.g. `260716-1847-workbench-umbau`) — no marker, no `circles/` prefix, no `.md`. It is absent when no Circle is active. Because the directory name is stable across the Circle's whole lifecycle, the pointer no longer has to be re-pointed on every marker change. Its writer set is closed and enumerated here (decision `260806-0015_*_wem-gehoert-die-circle-aktivierung`). On the activation path there are two writers: the orchestrator **writes** it on `_a_→_t_` activation (after user confirmation of playmaker's proposal) and **deletes** it on `_t_→_c_/_b_/_s_/_d_` closure at Phase 4; `/fusion:next` writes it in its user-confirmed interactive-activation branch. Four lifecycle skills touch it outside activation, each in one bounded way: `/fusion:circle-stash` deletes it when freezing the active Circle, `/fusion:circle-pop` restores it from the stash manifest, `/fusion:migrate` re-points it from the pre-v4 filename form to the directory name, and `/fusion:cleanup` clears it only when the active Circle's record already carries a terminal marker. No other party writes it; a new writer adds itself to this enumeration in the same commit. The pointer is the single source of truth for "active Circle" — `agentstate.yaml` does NOT duplicate this field.

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

### The name namespace, the key table, and how a key set is derived

Three questions this section used to answer in full are now authored in
`rules/workbench-path-resolution.md`: which name a consumer passes (`<name>` is an agent OR
a skill, one flat namespace, every consumer asks under its own name), what each emitted key
means, and why the key set is derived from the prompt rather than declared. None of it is
needed to *use* the resolver — an agent's keys are the ones its own prompt already names,
and it reads their values off stdout. Read that file when you write or edit a consumer
prompt, or change `bin/fusion-paths` itself. `bin/fusion-rules` emits it to no agent.

### Where the call belongs

In **Setup step 2**, alongside `"$FUSION_PLUGIN_ROOT/bin/fusion-rules" <agent>`. That step is demonstrably executed by every agent on every run — it is the step that loads the rules the agent then obeys. A per-write call would be a new obligation with a new miss rate; a Setup-step call rides an obligation that already holds. Resolve once at Setup, use the values for the rest of the session. A skill resolves at its own first step, for the same reason.

`fusion-rules` still takes an **agent** name only. The two helpers stand side by side in the same step with different namespaces, and that is deliberate: `fusion-rules` maps an agent to rule-file patterns, which is an authored fact about an agent and has no meaning for a skill. Their symmetry is the interface (one argument, output on stdout, the shared `0/1/2` exit core), not the argument domain.

### Contract

Signature `fusion-paths <name>`. Output: one `KEY=value` line per emitted key on stdout. Paths are workbench-relative except `WORKBENCH` itself, which is absolute. Multi-value keys are space-separated.

#### Exit codes

| Code | Meaning | Shared with `bin/fusion-rules`? |
|---|---|---|
| 0 | Success | yes |
| 1 | Usage error, or no workbench found above `pwd` | yes |
| 2 | Unknown name — no such agent and no such skill | yes |
| 3 | `.active-circle` is corrupt or orphaned — a **workbench-state** fault | code collides — see below |
| 4 | Internal error: a prompt names a key the resolver cannot order or value, or one name is both an agent and a skill — a **fusion bug** | no |

The `0/1/2` core is shared with `bin/fusion-rules`; 3 and 4 are this resolver's own — and 3 **collides**: `fusion-rules` also exits 3, for a malformed `rules/context-manifest.yaml`. Read exit 3 against the helper that returned it; interpreting a `fusion-rules` 3 by this table sends the user to fix an intact `.active-circle`.

**3 and 4 must never be merged.** They address different people. Exit 3 is the user's to fix: their pointer is stale, and the advice "fix `.active-circle` before continuing" is right. Exit 4 is not fixable from the workbench at all, and a caller that keys on the code would hand the user that same advice about a pointer that is perfectly fine. Distinguishing them only in the stderr text is not enough — prompts key on the code.

### Two invariants

1. **With no active Circle, every `OUT_*` points into `shared/`.** There is no error state and no refusal for "no Circle active" — work happens outside Circles routinely, and it has a defined home. This is the Origin Rule's "unknown origin means `shared/`" expressed executably.
2. **Every `SCAN_*` always carries both stores** — the Circle's and the shared one — even when a Circle is active. An agent searching for open decisions must see the Circle's *and* the project's. With no active Circle, a `SCAN_*` collapses to the shared store alone.

   `SCAN_INVESTIGATIONS` and `SCAN_CONSULT` look like exceptions and are not. Their kinds exist only in `shared/` (an investigation and a consultation cannot originate in a Circle — see `## fusion-workbench Layout`), so "both stores" has nothing to range over and collapses to one. The invariant is not weakened for them; it is satisfied vacuously. The asymmetry is intentional, and it follows from the layout rather than sitting beside it.

   There is deliberately no `SCAN_MEMOS`. `memos/` is shared like the other two, but no agent reads it — a memo is written for the user, not for an agent. A key is emitted when a prompt reads the kind, not because the symmetry of the table would look better with it.

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

**`_i_` and `_s_` are terminal.** Do not rename them back to `_o_` or `_a_`. If an implemented decision needs revisiting, file a NEW decision, which may then supersede the `_i_` one: append `Superseded by:` and rename `_i_` → `_s_` — the one allowed terminal-to-terminal transition.

**Grounding-Stand vs Grounding-Historie:**

The marker vocabulary mirrors foundation_V3 §1.2's two-layer Grounding model:

- `_o_` (open) and `_a_` (answered, awaiting realisation) are **Grounding-Stand** — the current best-of-knowledge the project is working with.
- `_i_` (implemented), `_s_` (superseded), and `_d_` (deferred) are **Grounding-Historie** — preserved record of what was decided, including elements that have been replaced or postponed.

Each decision store holds both layers; the marker carries the layer information. Reconciliation passes that "list active Grounding" filter on `_o_` + `_a_`; passes that "show project history" include all five. A scan for active Grounding must cover every path in `$SCAN_DECISIONS`, not just the Circle's.

## Marker globs

The delimiter is an underscore, not brackets, and that choice is what keeps the marker cheap to read as a glob. `[` and `]` are shell-glob metacharacters: a marker written in bracket form inside a glob is silently a *character class* matching the single marker letter, so a glob of the shape `circles/*/…-circle.md` with a bracketed `t` resolves to `circles/*/t-circle.md`, matches the empty set, and under `bash` fails *silently* — the unmatched pattern expands to itself, the customary `[ -e "$f" ] || continue` guard drops it, and the count comes back `0` on a workbench full of Circles (`HYG-NO-SILENT-FAIL`). That trap was hit five times in a single session. The underscore is inert in both glob and regex: `_t_circle.md` matches literally, with no escaping and no character-class surprise.

Two forms are correct. Use them verbatim:

| Purpose | Form |
|---|---|
| Records in one state | `circles/*/_t_circle.md` |
| All records, marker read from the name | `circles/*/*_circle.md`, then `basename` → `sed -nE 's/^_([a-z])_.*/\1/p'` |

The second form is preferred wherever the task is counting or enumerating: it reads the marker as data rather than requiring one glob per state.

`find` needs no special handling: `find circles -name '_t_circle.md'` is correct as written — the underscore is not a metacharacter to `find`'s `-name` matcher any more than it is to the shell.

This applies to every marker in every vocabulary — `_o_`, `_a_`, `_t_`, `_c_`, `_i_`, `_p_`, `_b_`, `_s_`, `_d_` — anywhere a filename carrying one is matched by a glob, in any agent prompt or skill body.

## Circle records

The Circle state vocabulary (`_a_` anticipated, `_t_` active, `_c_` closed-coherent, `_b_`
bounded, `_s_` superseded, `_d_` deferred), its worked transitions, the Circle record
template and the `portfolio.md` template are authored in `rules/circle-records.md`. The
marker sits on the record inside the Circle directory, never on the directory itself, so
every path into a Circle stays valid for its whole life.

`bin/fusion-rules` emits that file to `orchestrator`, `playmaker` and `shaper` — the three
agents whose prompts name a Circle-scoped resolver key, and therefore the three that
transition or rank a Circle. If you are not one of them you work inside a Circle without
ever changing its state, and `## fusion-workbench Layout` above is the part you need.

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

## Rule-file provenance

Every file in a `rules/` directory opens with a `**Provenance:** <citation>` line in its
first ten lines, naming the record, Circle, or commit that caused it to exist. The three
legitimate citation forms, the placement rule, what
`hooks/lib/__tests__/provenance-header-lint.test.ts` checks and what it cannot, and who
carries the obligation are authored in `rules/rule-file-provenance.md`. Read it before you
create or edit any file under `rules/`. `bin/fusion-rules` emits it to no agent, because no
agent's routine work is writing normative rule text.

## History Logging

Every session writes a history entry to `$OUT_HISTORY/YYMMDD-HHMM-<topic>.md` describing what was done. Update the entry's status line to `Complete` as the final step of the session — if interrupted before this, completion state is lost.

The history log is the only durable record of a session. The in-memory task list does not persist. Always update history before finishing.

## Security

Never read or display `.secret` files. If secrets are needed, ask the user to provide them via environment variables.

## Stashes

The stash protocol — opt-in, snapshot layout, manifest schema, lifecycle, boundary events, what a stash does not touch — moved verbatim to `rules/workbench-stash-and-lock.md`, which `bin/fusion-rules` emits to `orchestrator` only; `/fusion:circle-stash` and `/fusion:circle-pop` cite that file directly.

## Commit lock

The commit-lock protocol — when it activates, mechanism, the `bin/fusion-commit-lock` subcommands, who acquires, tag conventions, failure modes — moved verbatim to `rules/workbench-stash-and-lock.md`, which `bin/fusion-rules` emits to `orchestrator` only.
