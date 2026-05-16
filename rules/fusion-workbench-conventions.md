# fusion-workbench Conventions

Shared conventions for all agents operating on `fusion-workbench/`. This file is auto-loaded by the plugin system into every agent's context. Single source of truth for state markers, issue and decision filing, inline tracking, history logging, and timestamps.

## fusion-workbench Layout

```
fusion-workbench/
├── planning/      # planner output (YYMMDD-HHMM[S]-<topic>.md)
├── issues/        # defects filed by any agent (YYMMDD-HHMM[S]-<topic>.md)
├── decisions/     # tracked open questions / decision records (YYMMDD-HHMM[S]-<topic>.md)
├── history/       # all agents log here (YYMMDD-HHMM-<topic>.md)
├── codereview/    # codereviewer output (YYMMDD-HHMM-<topic>.md)
├── ontoreview/    # ontoreviewer output (YYMMDD-HHMM-<topic>.md)
├── analyses/      # analyst output (YYMMDD-HHMM-<topic>.md)
├── investigations/# investigator output (YYMMDD-HHMM-<topic>.md)
├── consult/       # consultant output (YYMMDD-HHMM-<topic>.md)
├── circles/       # Circles in all marker states ([a]/[t]/[c]/[b]/[s]/[d]) (YYMMDD-HHMM[S]-<directive-slug>.md)
└── tasklist.md    # generated work queue (taskplanner only)
```

`fusion-workbench/.active-circle` is a one-line pointer file containing the basename of the currently `[t]`-marked Circle, or is absent when no Circle is active. The orchestrator reads it at session start; the orchestrator writes it on `[a]→[t]` activation (after user confirmation of playmaker's proposal); orchestrator clears it on `[t]→[c]/[b]/[s]/[d]` transitions. The pointer is the single source of truth for "active Circle" — `agentstate.yaml` does NOT duplicate this field.

The `fusion-workbench/` is anchored to the directory where setup was run — the working directory `pwd` reports, not necessarily the git toplevel. A subfolder may legitimately have its own independent workbench, separate from any workbench at a parent level; the plugin's hooks resolve `process.cwd()` directly and follow whichever directory is active.

Within a given working directory there is exactly **one** `fusion-workbench/`. Never create a nested duplicate inside it, and never split history, issues, decisions, planning, or review docs across multiple workbenches in the same tree — they all live in the single workbench at the active `pwd`.

## Issues vs Decisions — when to use which

A **defect** belongs in `issues/`. A **decision** belongs in `decisions/`. The distinction:

| Defect | Decision |
|---|---|
| Something is wrong, broken, missing, or inconsistent. | A choice must be made between two or more options. |
| Resolves to a code/data fix that can be verified by reading a diff. | Resolves to a recorded answer (decision record) and, separately, to implementation that realises the answer. |
| Lifecycle: filed → fixed → closed. The fix and the closure are the same event. | Lifecycle: filed (open question) → answered (with pointer to where) → implemented (when the answer is realised in code/data) → optionally superseded later. The answer event and the implementation event are distinct. |
| Examples: "term mapping is missing for entity X"; "test failure in pkg/foo"; "manifest doesn't validate". | Examples: "which IdP for v1?"; "should we adopt approach X or Y?"; "what is the cut decision for the platform?". |

**Decision rule for borderline items:** if the resolution is "go fix it" → defect; if the resolution is "decide and record" → decision. When in doubt, file as an issue and reclassify in the next reconciliation pass — that round-trip is cheap, the misfile cost is low.

A **Circle** belongs in `circles/`. Distinct from defect (`issues/`) and choice point (`decisions/`): a Circle is a unit of work bounded by a Directive + its Grounding + its Artifact (foundation V3 §2.1). When the resolution is "execute this Directive to closure," it's a Circle; when the resolution is "go fix it," it's an issue; when the resolution is "decide and record," it's a decision.

## Timestamps

Always obtain `YYMMDD-HHMM` from `date +%y%m%d-%H%M`. LLMs have no clock — never guess or estimate the time.

## Filename Patterns

| Directory | Pattern | State marker |
|-----------|---------|--------------|
| `planning/` | `YYMMDD-HHMM[S]-<topic>.md` | yes (issues/planning vocabulary) |
| `issues/` | `YYMMDD-HHMM[S]-<topic>.md` | yes (issues/planning vocabulary) |
| `decisions/` | `YYMMDD-HHMM[S]-<topic>.md` | yes (decisions vocabulary — richer set) |
| `history/` | `YYMMDD-HHMM-<topic>.md` | no |
| `codereview/` | `YYMMDD-HHMM-<topic>.md` | no |
| `ontoreview/` | `YYMMDD-HHMM-<topic>.md` | no |
| `analyses/` | `YYMMDD-HHMM-<topic>.md` | no |
| `investigations/` | `YYMMDD-HHMM-<topic>.md` | no |
| `consult/` | `YYMMDD-HHMM-<topic>.md` | no |
| `circles/` | `YYMMDD-HHMM[S]-<directive-slug>.md` | yes (circles vocabulary) |
| `tasklist.md` | fixed | — |

## State Markers — issues/ and planning/

Files in `issues/` and `planning/` carry a state marker: `YYMMDD-HHMM[S]-<topic>.md`.

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

History, codereview, ontoreview, and analyses files do NOT carry state markers.

## State Markers — decisions/

Files in `decisions/` carry a richer state marker that distinguishes "the answer is recorded" from "the answer is realised in code/data".

| Marker | Meaning |
|--------|---------|
| `[o]` | Open — the question has been filed but not yet answered. Initial state on creation. |
| `[a]` | Answered — a recorded answer exists somewhere on disk (typically in `analyses/`, `planning/`, or in the decision record itself). The file body MUST cite the answer's location with `Answered: <path>:<line> — <one-line summary>`. The decision is not yet realised in code or data. |
| `[i]` | Implemented — the answer has been realised: code or data on disk now reflects the decision. The file body MUST cite the implementation with `Implemented: <commit hash> or <path>:<line> — <one-line summary>`. This is the terminal state for decisions whose realisation is verifiable. |
| `[d]` | Deferred — the user explicitly pushed the decision out (to v1.x, to a future workbench, etc.). The file body MUST cite the deferral target. |
| `[s]` | Superseded — a later decision has overridden this one. The file body MUST cite the superseding decision file: `Superseded by: <path> — <reason>`. |

**Worked transitions:**

1. **`[o]` → `[a]`**: Reconciler (or analyst) finds that an open decision has been answered in a deliverable. Append `Answered: analyses/260501-1915-D04-detailed-architecture.md §4.3 — Shape C selected`. Rename `[o]` → `[a]`.
2. **`[a]` → `[i]`**: A coder/ontocoder commit lands that realises the decision. Append `Implemented: a3f7c2e — pkg/transform now uses Shape C dispatch`. Rename `[a]` → `[i]`.
3. **`[o]` → `[d]`**: User says "defer to v1.x". Append `Deferred: v1.x — pending pilot signal`. Rename `[o]` → `[d]`. (Skipping `[a]` is fine when the deferral itself is the answer.)
4. **`[a]` → `[s]`**: A new decision overrides the answered one. Append `Superseded by: decisions/YYMMDD-HHMM[a]-new-decision.md — replaces Shape C with Shape D after Stefan veto`. Rename to `[s]`.
5. **`[o]` → `[s]`** (rare): A new decision overrides an open one before it was even answered. Same procedure as above.

**`[i]` and `[s]` are terminal.** Do not rename them back to `[o]` or `[a]`. If an implemented decision needs revisiting, file a NEW decision (which may then `Supersede` the `[i]` one).

**Grounding-Stand vs Grounding-Historie:**

The marker vocabulary mirrors foundation_V3 §1.2's two-layer Grounding model:

- `[o]` (open) and `[a]` (answered, awaiting realisation) are **Grounding-Stand** — the current best-of-knowledge the project is working with.
- `[i]` (implemented), `[s]` (superseded), and `[d]` (deferred) are **Grounding-Historie** — preserved record of what was decided, including elements that have been replaced or postponed.

A flat `decisions/` directory holds both layers; the marker carries the layer information. Reconciliation passes that "list active Grounding" filter on `[o]` + `[a]`; passes that "show project history" include all five.

## State Markers — circles/

Files in `circles/` carry a marker that tracks Circle lifecycle. The vocabulary is parallel to but distinct from issues/planning and decisions/.

| Marker | Meaning |
|--------|---------|
| `[a]` | **Anticipated** — provisional Directive, no Grounding yet (foundation V3 §2.1). Initial state on creation. |
| `[t]` | **Active / in-Turn** — Directive refined, Grounding crystallising, orchestrator running it. |
| `[c]` | **Closed-coherent** — three-edge Coherence verdict passed. |
| `[b]` | **Bounded Closure** — Directive judged not reachable; what was learned is the Artifact. |
| `[s]` | **Superseded** — replaced by another Circle (scope split, redirected). |
| `[d]` | **Deferred** — anticipated → indefinitely postponed. |

### Worked transitions

- `[a] → [t]` — playmaker proposes activation; user confirms; orchestrator renames and writes `.active-circle`.
- `[t] → [c]` — Coherence verdict `coherent` at Phase 3; orchestrator renames at Phase 4 and clears `.active-circle`.
- `[t] → [b]` — user chose **Accept Bounded Closure** at the Rebalance gate; orchestrator renames at Phase 4 and clears `.active-circle`.
- `[t] → [s]` — user supersedes mid-run; orchestrator renames; a new `[a]` Circle file is created citing the superseded one via `## Dependencies`.
- `[a] → [d]` — user defers an anticipated Circle indefinitely; manual rename.
- `[a] → [s]` — rare; the anticipated Circle is replaced before activation by a new Circle that captures the revised intent.

**Terminal-states statement:** `[c]`, `[b]`, `[s]`, `[d]` are terminal — `mv` back to `[a]` or `[t]` is disallowed. If continuation is needed, create a new Circle that cites the terminal one via its `## Dependencies` section.

**Grounding-Stand vs Grounding-Historie parallel:** as with `decisions/`, the marker carries the layer information. `[a]` and `[t]` are Grounding-Stand (current working state); `[c]`, `[b]`, `[s]`, `[d]` are Grounding-Historie (preserved record).

## Circle file template

Circle files live under `fusion-workbench/circles/`. Template:

```markdown
# <One-line Directive title>

---
**Domain:** <code|data|strategic|knowledge>
**Status:** <anticipated | active | closed | bounded | superseded | deferred>
**Filed by:** <agent name or "user">
**Active spec/plan:** <path to spec, plan, or "(none yet)">
**Active session history:** <path to orchestrator session history file, or "(none yet)">

---

## Directive

<What this Circle aims for. The post-completion state of the Artifact, prognosticated. Revisable via Rebalance.>

## Grounding snapshot

<What we know going in. Filled at `[a] → [t]` activation by shaper portfolio-activation mode. Updates on Rebalance.>

## Dependencies

<List of other Circle filenames this Circle depends on. Playmaker flags cycles here.>

## Turn log

<Append-only list of Turn outcomes for this Circle. Format per bullet:
- Turn N (session YYMMDD-HHMM): commits <hash>..<hash>; Coherence verdict <coherent|review-needed|skipped-...>; session history: <path>>

## Closure note

<Filled when marker becomes [c], [b], [s], or [d]. Cites the orchestrator session history file. For [b], also cites the Bounded-Closure Artifact (what was learned that the Directive could not reach).>
```

The filename pattern is `YYMMDD-HHMM[S]-<directive-slug>.md` per the State Markers section above.

## portfolio.md template

`fusion-workbench/portfolio.md` is regenerated by playmaker on every run. Template:

```markdown
# Portfolio

**Generated:** YYMMDD-HHMM (by playmaker session <id>)
**Domain bias:** <code|data|strategic|knowledge>

## Active ([t])

<One entry expected, or 0. If >1, flag MULTIPLE-ACTIVE warning. Each entry: Circle filename, Directive line, active session history path.>

## Anticipated ([a]) — ranked

<Ordered list by playmaker rank. Top entry includes a one-paragraph rationale for the recommendation. Each entry: Circle filename, Directive line, rank, dependencies summary.>

## Recently closed ([c] / [b])

<Last 5 closed Circles. Each entry: Circle filename, marker, Closure note one-liner.>

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

**Every defect, problem, inconsistency, concern, or TODO discovered during work MUST be written as a separate file in `fusion-workbench/issues/`. Every open question, choice point, or design fork MUST be written as a separate file in `fusion-workbench/decisions/`. No exceptions.**

This applies to:
- Defects found during implementation, analysis, or review → `issues/`
- Inconsistencies in code, data, docs, or existing architecture → `issues/`
- Tech debt, dead code, stale docs, dangling references → `issues/`
- Open questions raised during shaping, planning, or analysis → `decisions/`
- Choices the user has deferred or has not yet made → `decisions/`
- Anything the user asks to track, note, or remember — choose folder per the issues-vs-decisions rule above

**NEVER put issues or decisions inside plan documents, review documents, analyses, code comments, chat output, history logs, or any other location.** Embedded items get lost. Each item is a separate file in the appropriate folder.

**Filename:** `YYMMDD-HHMM[o]-<topic>.md` (always `[o]` on creation, in either folder).

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

File: `fusion-workbench/decisions/YYMMDD-HHMM[o]-<topic>.md`

Body:

```markdown
# <one-line decision title — phrased as a question or choice point>

---
**Domain:** code | data | strategic | knowledge
**Status:** open | answered | implemented | deferred | superseded
**Filed by:** <agent name or "user">
**Cross-references:** <paths to related issues/, analyses/, planning/, or decisions/ files>

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

Every session writes a history entry to `fusion-workbench/history/YYMMDD-HHMM-<topic>.md` describing what was done. Update the entry's status line to `Complete` as the final step of the session — if interrupted before this, completion state is lost.

The history log is the only durable record of a session. The in-memory task list does not persist. Always update history before finishing.

## Security

Never read or display `.secret` files. If secrets are needed, ask the user to provide them via environment variables.

## Bus protocol (workbench-mediated A2A messaging)

Concurrent fusion agent sessions exchange durable messages through `fusion-workbench/bus/<agent>/inbox/`. The user remains the trigger — fusion has no daemon and does not auto-route. Path D's daemon will read this layout unchanged; no field is reserved for D that B does not also populate.

### Opt-in

Bus behaviour activates only when `fusion-workbench/bus/` exists. Agents probe-and-degrade silently otherwise. `/fusion:setup` creates the tree; pre-bus workbenches stay quiet until setup is rerun.

### Filesystem layout

```
fusion-workbench/bus/
├── .sessions/                      # session-registry YAML files
├── orchestrator/inbox/.processed/  # processed/ pre-created so mv target always exists
├── consultant/inbox/.processed/
├── coderev/inbox/.processed/
└── ontorev/inbox/.processed/
```

The protocol recognises four agents initially: `orchestrator`, `consultant`, `coderev`, `ontorev`. Additional agents are added by creating their `<agent>/inbox/.processed/` subtree and listing them here.

### Message-file naming

- Request: `YYMMDD-HHMM-from-<source-agent>-<topic>.md`
- Reply: `YYMMDD-HHMM-from-<source-agent>-<originating-message-stem>.reply.md`

The reply filename embeds the originating message's basename minus the `.md` so the pairing is grep-able from a shell.

### Required frontmatter

Every message (request or reply) carries four fields:

- `From:` — source agent name
- `To:` — target agent name
- `Re:` — short subject string; byte-identical between a request and its reply
- `Filed:` — timestamp from `date +%y%m%d-%H%M`

The body MUST include a `## Reply convention` section naming the exact target path for the reply.

### Reply pairing keys — both

Replies are paired with their request by **two** redundant keys:

- The `Re:` frontmatter field is byte-identical between request and reply — used by orchestrator-resume to match a returned reply to a previously filed request.
- The reply filename embeds the originating message's stem — used by `bin/fusion-bus` substring matching.

This redundancy is intentional. `Re:` is human-readable and resume-safe; the filename embed is grep-friendly from any shell.

### Example request

```markdown
---
From: orchestrator
To: consultant
Re: rebalance-gate-circle-A04-shape-choice
Filed: 260516-1430
---

# Consultation request — Rebalance gate

<Directive, three-edge summary, the four standard options, and the specific question.>

## Reply convention

Write the reply to `fusion-workbench/bus/orchestrator/inbox/` as
`YYMMDD-HHMM-from-consultant-260516-1430-from-orchestrator-rebalance-gate-circle-A04-shape-choice.reply.md`.
```

### Example reply

```markdown
---
From: consultant
To: orchestrator
Re: rebalance-gate-circle-A04-shape-choice
Filed: 260516-1452
---

# Consultant reply

<Synthesised input. References to spec/plan/issue files as needed.>
```

### Session registry

Each bus-participating agent registers itself at Setup via `bin/fusion-bus-session register <agent>`. The helper writes `bus/.sessions/<session-id>.yaml`:

```yaml
session_id: 260516-1430-orchestrator-a7f3
agent: orchestrator
project: /Users/kai/Dropbox/qboot/projects/F04-FUSION/codebase/fusion
tmux_pane: "%5"          # string when $TMUX_PANE is set, else null
registered_at: 2026-05-16T14:30:00Z
last_heartbeat: 2026-05-16T14:37:00Z
```

**Staleness threshold:** 600 seconds (10 minutes) is the canonical value, matching `bin/fusion-session-mark`. Path B does not enforce it (no consumer). Path D's daemon will read `last_heartbeat` and apply this threshold when routing.

**Heartbeat cadence:** only the orchestrator refreshes `last_heartbeat` mid-session (at Turn-end, alongside the `fusion-session-mark heartbeat` call). Other bus-aware agents (consultant, coderev, ontorev) are register-only; their `last_heartbeat` reflects session start time. Decision: `fusion-workbench/decisions/260516-1058[a]-bus-session-heartbeat-cadence.md` (Option β). Known limitation: a long consultant session can look stale to a future Path D routing daemon; this will be revisited when Path D is designed.

### Read-on-Setup discipline

Every bus-participating agent, at the end of its Setup (after the rules check, before the first action), lists unread items in its own `bus/<agent>/inbox/` (excluding `.processed/`). For each item: filename, `From:`, `Re:`, mtime. If at least one item is unread, the agent presents the list to the user and asks whether to process the inbox first or continue with the original task.

### Write-then-tell-the-user discipline at gates

Every bus-write at a gate is paired with an explicit user-trigger instruction in the gate prompt: the exact `./.fusion/fu <agent>` command, the assurance that the target's Setup will surface the item, and no implication that fusion auto-routes. The action-first ordering of `rules/user-facing-output.md` applies.

### Mark-read protocol — dual-write, race-safe

A message is considered processed when it is moved from `bus/<agent>/inbox/<file>` to `bus/<agent>/inbox/.processed/<file>`. Both the agent and the user (via `./.fusion/fusion-bus mark-read`) may perform this move; both ownership models are first-class.

1. The move is `mv` (POSIX atomic rename). One operation either fully succeeds or fails; there is no half-renamed state.
2. Both parties tolerate "file already in `.processed/`" — silent success, not an error. If the agent finds the source missing because the user already ran `mark-read`, it treats the message as already-marked and continues.
3. If both parties hit the same file in the same window, one `mv` wins the rename and the other detects the missing source (per rule 2). No file locking is required because POSIX rename is atomic.

This dual-write contract is the reason no locking is needed: atomic rename + tolerant lookup = no corruption regardless of which party moves the file first.

### Path D — daemon and control IPC

An opt-in Python daemon (`bin/fusion-bus-daemon`) automates the *transport* of bus messages between concurrent sessions while preserving human-in-the-loop confirmation. The daemon is layered on top of Path B's data layer: it reads what Path B writes, and adds its own IPC surface under `bus/` for control. Path B's `bus/<agent>/inbox/`, message format, frontmatter, reply pairing, and session registry are unchanged. The daemon is opt-in — when it is not running, the bus behaves exactly as documented above.

#### Filesystem layout (daemon-owned files under `bus/`)

```
fusion-workbench/bus/
├── .daemon-state.json        # daemon writes; monitor + CLI read
├── .daemon-cmd.json          # monitor + CLI write; daemon reads + acts + deletes
├── .daemon.pid               # daemon writes PID on start; clears on clean exit
├── .daemon.log               # daemon append-only event log (no rotation in v1)
├── .pending/<msg-id>.json    # one file per pending injection (strict mode)
├── .approved/<msg-id>.json   # daemon moves here on approve, then injects
│   └── .processed/           # post-injection audit trail
└── .denied/<msg-id>.json     # daemon moves here on deny; carries denial reason
```

`msg-id` is the basename of the originating message minus `.md`. The four directories (`.pending/`, `.approved/`, `.approved/.processed/`, `.denied/`) are pre-created by `/fusion:setup` so the daemon's `mv` targets always exist.

#### `.daemon-state.json` schema (daemon-owned write; all other parties read-only)

```json
{
  "mode": "strict",
  "running": true,
  "started_at": "2026-05-16T14:30:00Z",
  "pid": 12345,
  "pending_count": 2,
  "last_route_at": "2026-05-16T14:37:12Z",
  "recent_routes": [
    {"msg_id": "260516-1430-from-orchestrator-rebalance-gate", "target_agent": "consultant", "action": "approved", "at": "2026-05-16T14:37:12Z"}
  ]
}
```

`recent_routes` is capped at 20 entries (FIFO) for observe-mode notification surfacing. Updates are atomic via temp-write-and-rename.

#### `.daemon-cmd.json` schema (monitor + CLI write; daemon reads, acts, then deletes)

```json
{
  "cmd": "approve",
  "arg": "260516-1430-from-orchestrator-rebalance-gate",
  "reason": null,
  "filed_by": "kai",
  "filed_at": "2026-05-16T14:36:55Z"
}
```

`cmd` is drawn from the closed set `pause | resume | set-mode | approve | deny`. Single-command-at-a-time queue: the daemon processes the file then deletes it. When multiple commands arrive in the same tick window, callers serialise via filename-suffix retry: `.daemon-cmd.json` → `.daemon-cmd.1.json` → `.daemon-cmd.2.json` (caller increments until a free name is found). The daemon globs `.daemon-cmd*.json` oldest-first by mtime each tick, so both commands eventually execute in the order their files were written.

#### `.pending/<msg-id>.json` schema (daemon-owned)

```json
{
  "msg_id": "260516-1430-from-orchestrator-rebalance-gate",
  "msg_path": "fusion-workbench/bus/consultant/inbox/260516-1430-from-orchestrator-rebalance-gate.md",
  "target_agent": "consultant",
  "target_pane": "%5",
  "queued_at": "2026-05-16T14:30:01Z",
  "from": "orchestrator",
  "re": "rebalance-gate at Turn 3"
}
```

`from` and `re` are cached from the originating message frontmatter at enqueue time so the daemon does not reparse on each tick.

#### `.approved/<msg-id>.json` schema

Same shape as `.pending/<msg-id>.json`, plus two added fields:

```json
{
  "msg_id": "260516-1430-from-orchestrator-rebalance-gate",
  "msg_path": "fusion-workbench/bus/consultant/inbox/260516-1430-from-orchestrator-rebalance-gate.md",
  "target_agent": "consultant",
  "target_pane": "%5",
  "queued_at": "2026-05-16T14:30:01Z",
  "from": "orchestrator",
  "re": "rebalance-gate at Turn 3",
  "approved_at": "2026-05-16T14:37:08Z",
  "approved_by": "kai"
}
```

On approve, the daemon moves the file from `.pending/` to `.approved/`, injects via `tmux send-keys`, then moves the file from `.approved/` to `.approved/.processed/` (preserving the audit trail in the same pattern as inbox `.processed/`).

#### `.denied/<msg-id>.json` schema

Same shape as `.pending/`, plus three added fields:

```json
{
  "msg_id": "260516-1430-from-orchestrator-rebalance-gate",
  "msg_path": "fusion-workbench/bus/consultant/inbox/260516-1430-from-orchestrator-rebalance-gate.md",
  "target_agent": "consultant",
  "target_pane": "%5",
  "queued_at": "2026-05-16T14:30:01Z",
  "from": "orchestrator",
  "re": "rebalance-gate at Turn 3",
  "denied_at": "2026-05-16T14:37:15Z",
  "denied_by": "kai",
  "denial_reason": "out of scope for this Turn"
}
```

On deny the daemon also appends a line `Denied: <reason> by <user> at <ts>` to the *originating message body* in `bus/<target-agent>/inbox/<file>.md`, then moves the originating message to `bus/<target-agent>/inbox/.processed/` (dual-write-tolerant per the Mark-read protocol above). This keeps the denial visible in the Path B message stream; `.denied/<msg-id>.json` stays in place as the daemon-side audit record.

#### Mode semantics

| Mode | Behaviour |
|---|---|
| **`strict` (DEFAULT)** | Every routed message lands in `.pending/`. The daemon does NOT inject until the file is moved to `.approved/` by an approve command. Strict is the initial value `/fusion:setup` and the daemon-on-first-start write to `.daemon-state.json`. |
| `observe` | Daemon injects immediately and appends an entry to `recent_routes` with `action: "auto-injected"`. No `.pending/` entry created. The dashboard and CLI's `pending` surface show recent auto-injects as a side-channel notification. |
| `silent` | Daemon injects immediately and does NOT touch `recent_routes`. Fire-and-forget. Intended for trusted batch flows. |

#### Control flow — strict mode walk-through

1. Orchestrator (Path B unchanged) writes `bus/consultant/inbox/<file>.md`.
2. Daemon polls (1s interval), sees the new file, parses frontmatter, looks up the `consultant` session in `bus/.sessions/`, reads `tmux_pane`. Mode is `strict`, so the daemon writes `bus/.pending/<msg-id>.json`; does NOT inject yet. Updates `.daemon-state.json` `pending_count`.
3. User opens the dashboard (or runs `fusion-bus pending`), sees the message, clicks **Approve** (or runs `fusion-bus approve <msg-id>`). The frontend writes `bus/.daemon-cmd.json` with `cmd: "approve"`, `arg: "<msg-id>"`, `filed_by: $USER`.
4. Daemon polls (1s interval), reads `.daemon-cmd.json`, validates `msg-id` is in `.pending/`, moves `.pending/<msg-id>.json` to `.approved/<msg-id>.json` (with `approved_at` and `approved_by` appended), deletes `.daemon-cmd.json`. The approve handler then immediately runs `tmux send-keys -t <pane> "You have a new bus message at <msg_path> — please read it and respond per its 'Reply convention' section." Enter`.
5. After successful injection, the daemon moves `.approved/<msg-id>.json` to `.approved/.processed/<msg-id>.json` (audit trail). Updates `.daemon-state.json` `last_route_at` and `recent_routes`; decrements `pending_count`.
6. The injected sentence appears in the consultant's tmux pane. The consultant's Claude session processes the injection as a user prompt and reads the cited inbox file (Path B Setup procedure unchanged).

#### Path B compatibility

Path D is purely additive. `bus/<agent>/inbox/`, `bus/.sessions/`, message frontmatter (`From`/`To`/`Re`/`Filed`), reply pairing keys (the `Re:` field and the filename-stem embed), and the dual-write-tolerant mark-read protocol are unchanged. The daemon only reads inbox messages and session-registry files; bus-aware agents only write inbox messages and register their own session. **Path B's writers do not know the daemon exists.** When the daemon is not running, every party falls back to Path B's manual user-trigger flow with no code path or wording change.

#### Trust model

Localhost only. The daemon binds nothing to the network. The dashboard (`bin/monitor`) binds `127.0.0.1` as it already does for the existing panels. `$USER` from the environment is the trust boundary — recorded in `filed_by`, `approved_by`, `denied_by` for audit. No authentication mechanism is specified; any local process under the user's account that can write to `bus/` can issue daemon commands. This matches the fusion-wide assumption that local processes under the user's account are trusted; cross-account isolation is the operating system's responsibility, not fusion's.

### Orchestrator-fileable gates

The orchestrator may file bus messages at exactly four gates. This is the canonical inventory; per-gate prompt-side details land in `agents/orchestrator.md`.

1. **Rebalance gate** (mid-Turn or post-reconciler) — file a consultation before the user picks among the four standard Rebalance options.
2. **Pre-shaping ambiguity gate** — when the orchestrator considers invoking shaper because the user's request is ambiguous, it may first file a consultation request.
3. **Post-reconciler `review-needed` verdict** — file a consultation on the aggregate Coherence verdict before opening the Rebalance gate.
4. **Pre-planning sanity check** — when shaper has produced a spec and planner is about to be invoked, the orchestrator may file a consultation on the spec first.

In every case the orchestrator does NOT dispatch the target agent. The consultant remains user-initiated-only; coderev/ontorev are dispatched by the orchestrator only via the standard review flow, never as a bus delivery mechanism.

## Commit lock

A POSIX mutex around `git add` + `git commit` operations against the project's working tree. Defends against the cross-agent staging race where parallel agents' commit operations interleave at the git-index level (commit absorption, orphan commits, WT-left-dirty outcomes).

### When it activates

Always, when any party is about to commit. Workbench-anchored — different projects have independent locks; sessions on the same project share one lock.

### Mechanism

Atomic `mkdir fusion-workbench/.commit-lock/` (POSIX guarantees mkdir either creates the directory exclusively or fails). The holder file `.commit-lock/holder` records three lines: `tag`, `pid`, `acquired_at` (RFC-3339 UTC). Stale-lock detection at 60 seconds: if the holder PID is no longer running AND the lock is older than the threshold, the next acquirer force-releases it.

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

Issue `fusion-workbench/issues/260516-0534[c]-cross-agent-staging-race-on-unlocked-working-tree.md` (closed by this protocol).
