# Context manifest — topic-scoped selective loading

> Authored once here, cited from `bin/fusion-rules` and the agent Setup prose.
> This is the convention for the **optional** `./rules/context-manifest.yaml` a
> consuming project may add to load large knowledge bodies per-agent **and**
> per-topic, instead of always-on. When no manifest is present, `bin/fusion-rules`
> behaves exactly as it did before this convention existed — byte-identical
> output (`HYG-NO-REGRESS`). The manifest is purely additive.

---

## Why this exists

`bin/fusion-rules <agent>` answers one question: *which rule files does agent X
read at Setup?* It maps an agent to filename patterns and emits every matching
`*pattern*.md` from three roots. That axis — **agent → rules** — is unchanged.

A consuming project with a large body of knowledge (dev-rule bodies, framework
references, domain guides) does not want all of it loaded into every agent every
session. Most of it is relevant only to a **topic**: ontology rules matter when
the active work is about ontology; an LLM-pipeline doctrine matters when the work
touches the LLM pipeline. The manifest adds that second axis — **topic → units**
— and lets a unit be scoped to *both* an agent set and a topic set.

The heaviest, look-up-style knowledge is not loaded at all: it is packaged as an
on-demand **Skill**, and the manifest emits a pointer to it rather than its body.
The agent invokes the skill only when the topic actually arises.

## Where the manifest lives (locked)

`./rules/context-manifest.yaml` — the **fusion-agent-specific** rules directory
in the consuming project. `bin/fusion-rules` already discovers `./rules/`, so the
manifest sits with the same-root files the helper already reads. It is optional:
its absence is the no-regression default.

The manifest never ships in the plugin. It is authored per consuming project and
carries that project's own topic map. The plugin ships only the mechanism (this
doc + the `bin/fusion-rules` extension).

## Schema

A single top-level `units:` list. Each unit is one loadable thing (a rule file or
a skill) plus the axes that scope it. The schema is deliberately **flat and
greppable** — inline arrays only, no nested YAML lists — so `bin/fusion-rules`
can parse it with `awk` and no YAML runtime dependency.

```yaml
# ./rules/context-manifest.yaml   (in the consuming project, not the plugin)
units:
  - path: .claude/rules/ONTO-ENG-RULES.md   # a rule file  (exactly one of path|skill)
    agents: [ontocoder, ontorev, planner]   # or [*] for every agent
    topics: [ontology]                       # or [always] to load regardless of topic
    note: "UEOF/UIF engineering rules"       # optional, ignored by the helper

  - skill: unite-bok-sc-skill                # a skill name (exactly one of path|skill)
    agents: ["*"]                            # star may be quoted or bare
    topics: [unite-framework]
    note: "on-demand framework body-of-knowledge"

  - path: .claude/rules/CODING-HYGIENE.md
    agents: [coder, coderev, bugfixer, planner]
    topics: [always]                          # loaded for these agents on every topic
```

Per-unit fields:

| Field | Required | Meaning |
|---|---|---|
| `path` | one of `path`/`skill` | a rule file, emitted as its path (an agent reads it, as today) |
| `skill` | one of `path`/`skill` | a skill name, emitted as a `skill:<name>` pointer line (invoked on demand, body not loaded) |
| `agents` | yes | inline array of agent names, or `[*]` / `["*"]` for all agents |
| `topics` | yes | inline array of topic tags, or `[always]` to match regardless of the active topic |
| `note` | no | free text; ignored by the helper |

Exactly one of `path` / `skill` per unit — a unit is either a loaded file or a
referenced skill, never both.

## Emit predicate

For a call `fusion-rules <agent> [<topic>]`, a unit is emitted when **both** hold:

- **agent match** — `agent ∈ unit.agents` OR `unit.agents == [*]`
- **topic match** — `always ∈ unit.topics` OR `(unit.topics ∩ resolvedTopics) ≠ ∅`

`resolvedTopics` is the set of topics in effect for this call (see Topic
resolution). A `path` unit emits its file path; a `skill` unit emits `skill:<name>`.

The manifest units are emitted **after** the existing always-on rules, voice
profiles, diagram doctrine, and pattern matches — so a consumer's output is the
old set followed by the topic-scoped additions.

## Topic resolution (locked)

The topic is **not** a per-invocation user argument in the standard flow. It is
**derived from the active Circle**. Resolution order:

1. **Explicit CLI topic** — if `fusion-rules <agent> <topic>` is called with a
   second argument, `resolvedTopics = {<topic>}` (comma-separated accepted). This
   is the plumbing an agent's Setup may use when it already knows the topic; it
   overrides Circle derivation.
2. **Explicit tag on the Circle record** — otherwise, if the active Circle's
   record (`circles/<dir>/_<marker>_circle.md`) carries a `Topic:` or `Tags:`
   line (bold `**Topic:**` or plain `topic:`, case-insensitive), those become
   `resolvedTopics`. This is the precision override for when the slug alone is
   too coarse.
3. **Circle slug keywords** — otherwise, `resolvedTopics` is the set of keyword
   tokens in the active Circle's slug: the directory name with the `YYMMDD-HHMM-`
   stamp stripped, split on `-`. A Circle `260718-1924-ontology-refactor` yields
   `{ontology, refactor}`, matching any unit tagged `ontology` or `refactor`.
4. **No active Circle** — `resolvedTopics` is empty; only `[always]` units match.

Units tagged `[always]` are emitted regardless of the resolved topics (as long as
the agent matches), so a project's per-agent always-on rules survive every path.

**Who passes the topic.** The mechanism defines the calling convention; wiring
every agent's Setup to pass or derive the topic is a prompt-side concern handled
in the agent-prompt revision pass, not here. `bin/fusion-rules` derives the topic
from the active Circle automatically when no CLI topic is given, so the common
case needs no author action.

## The Skill-packaging boundary

A unit is a `path` (loaded) when it is a **binding constraint** that must shape
every relevant edit — coding-hygiene rules, architecture constraints, ontology
engineering rules. It is a `skill` (referenced, not loaded) when it is **look-up
knowledge** consulted on demand, or when its size makes always-loading wasteful.
The `unite-*-sc-skill` skills already embody this boundary; the manifest
formalises it by letting a unit point at a skill instead of a file. The boundary
is a **documented convention, not a size threshold hard-coded in the helper**.

## Backward compatibility (the load-bearing guarantee)

No manifest present → `bin/fusion-rules <agent>` output is **byte-identical** to
its output before this convention existed, for every agent, with or without a
topic argument. The manifest read and the topic argument are both additive and
both no-op when the manifest is absent. This is `HYG-NO-REGRESS`, and it is
enforced by `hooks/lib/__tests__/context-manifest.test.ts`.

## Fail-closed on a malformed manifest

If the manifest is present but malformed — a unit missing its `agents` or
`topics` array, an array that is not a well-formed `[...]`, or a `- path:` /
`- skill:` with an empty value — `bin/fusion-rules` **stops with a clear error
on stderr and a non-zero exit (3)**. It does not silently emit a partial set
(`HYG-NO-SILENT-FAIL`). A half-loaded context is worse than a stopped Setup: the
agent would run believing it had its rules. An empty manifest (`units: []`, or a
file of only comments) is valid and emits nothing extra.

## The lean-`CLAUDE.md` convention

The manifest is one half of a pair. The other half is a **lean `CLAUDE.md`** in
the consuming project. Together they move a project from "everything always-on"
to "a lean index plus on-demand units". See
[`context-lean-claude-md.md`](./context-lean-claude-md.md) for what stays
always-on versus what moves behind the manifest, with a worked example.

## Exit codes (`bin/fusion-rules`)

| Code | Meaning |
|---|---|
| 0 | success |
| 1 | usage error (no agent name) |
| 2 | unknown agent |
| 3 | manifest present but malformed (fail-closed) |

Codes 0/1/2 are unchanged from before this convention. Code 3 is the manifest
addition.
