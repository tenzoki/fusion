# The lean-`CLAUDE.md` convention

**Provenance:** circles/260718-1924-v5x-overhaul

> The companion to [`context-manifest.md`](./context-manifest.md). The manifest
> moves a consuming project's heavy rule bodies behind per-agent + per-topic
> loading; this doc says what the project's own `CLAUDE.md` keeps always-on and
> what it hands to the manifest. Together they take a project from
> "everything-always-loaded" to "a lean index plus on-demand units".

This is the input to the reference conversion (a later Circle-B step) and to the
docs pass (Circle E). It is a convention, not machinery: nothing in the plugin
enforces a line count. The goal is a `CLAUDE.md` a reader can hold in their head.

---

## The problem it solves

A consuming project's `CLAUDE.md` is loaded into **every** agent on **every**
session, in full. When it grows to hold the whole project's dev rules, framework
knowledge, and domain guides — tens of kilobytes — every agent pays that cost
whether or not the work at hand touches those topics. The same content is often
duplicated again in `rules/` and `.claude/rules/`. The result is a large, mostly
irrelevant always-on context that crowds out the task.

The fix has two halves:

1. **The manifest** (`./rules/context-manifest.yaml`) makes heavy knowledge
   **topic-scoped and agent-scoped** — loaded only when the active Circle's topic
   and the running agent match. Documented in `context-manifest.md`.
2. **A lean `CLAUDE.md`** keeps only what genuinely must be present every session,
   and **points at** the rest.

## What stays always-on in `CLAUDE.md`

Keep it to what every agent needs on every session, independent of the topic:

- **Project identity** — what this repo is, in a few sentences.
- **`**Language:** <lang>`** — the line `bin/fusion-rules` reads to resolve the
  stilwerk voice profiles. Load-bearing; must stay.
- **The handful of truly-every-session rules** — conventions that bind every
  edit regardless of topic (e.g. "never commit build artifacts", a release-bump
  discipline, a naming convention). If a rule only matters for one topic, it does
  not belong here — it belongs in a manifest unit tagged with that topic.
- **A pointer table** — a short index that names the topics and says where each
  one's detail lives (a `.claude/rules/*` file, or a Skill). The reader learns
  *that* the knowledge exists and *how it is loaded*, without carrying its body.

## What moves behind the manifest

Everything that is topic-specific:

- **Dev-rule bodies** (architecture rules, coding-hygiene detail, ontology
  engineering rules, LLM-pipeline doctrine) → `path` units in the manifest,
  tagged by the agents and topics they bind. Loaded when that topic is active.
- **Reference / body-of-knowledge material** (framework catalogues, glossaries,
  taxonomies) → `skill` units. Emitted as a `skill:<name>` pointer and invoked
  on demand — never loaded as always-on text. This is the Skill-packaging
  boundary from `context-manifest.md`.

## The canonical-home split (deduplicate while you convert)

A project that carried the same rule file in both `rules/` and `.claude/rules/`
resolves each file to **exactly one** home, because `bin/fusion-rules` reads both
roots and would otherwise emit it twice:

- **`.claude/rules/<file>.md`** — project-wide bindings every Claude session
  should respect (the dev-rule bodies, indices, policies). These are the same
  rules a developer running plain Claude Code in the repo would want.
- **`./rules/<file>.md`** — fusion-agent-specific rules that have no meaning
  outside a fusion-agent context (capture layouts, taskplanner priority
  overrides, and `context-manifest.yaml` itself).

Delete the redundant copy. The manifest then tags whichever home survives.

## Worked example (before → after)

**Before** — one large always-on file:

```md
# CLAUDE.md  (259 lines, ~43 kb, loaded into every agent every session)
## Architecture rules
  …40 lines of H1–H11…
## Ontology engineering rules
  …44 lines…
## LLM-pipeline doctrine
  …30 lines…
## Framework body-of-knowledge
  …60 lines the agents rarely need in full…
## Release process
  …
```

**After** — a lean index plus a manifest:

```md
# CLAUDE.md  (lean index)
This is the <project> repo: <one-paragraph identity>.
**Language:** en

## Always-on rules
- Never commit build artifacts; maintain .gitignore.
- Every release bumps plugin.json + marketplace.json and validates.

## Topic map (loaded on demand via ./rules/context-manifest.yaml)
| Topic | Where the detail lives | Loaded for |
|---|---|---|
| architecture   | .claude/rules/ARCHITECTURE-RULES.md | code agents |
| ontology       | .claude/rules/ONTO-ENG-RULES.md     | ontocoder, ontorev, planner |
| llm-pipeline   | .claude/rules/READER-ABSTRACTION-RULES.md | coder, planner |
| unite-framework| Skill: unite-bok-sc-skill (on demand) | all agents |
```

```yaml
# ./rules/context-manifest.yaml
units:
  - path: .claude/rules/ARCHITECTURE-RULES.md
    agents: [coder, coderev, bugfixer, planner]
    topics: [always]                      # architecture binds every code edit
  - path: .claude/rules/ONTO-ENG-RULES.md
    agents: [ontocoder, ontorev, planner]
    topics: [ontology]
  - path: .claude/rules/READER-ABSTRACTION-RULES.md
    agents: [coder, planner]
    topics: [llm-pipeline]
  - skill: unite-bok-sc-skill
    agents: ["*"]
    topics: [unite-framework]             # reference body — pointer, not body
```

The 60-line framework body is no longer always-on text — it is a `skill:` pointer
an agent follows only when a Circle's topic is `unite-framework`. The ontology and
LLM-pipeline bodies load only for their agents when their topic is active. The
always-on surface is the identity, the language line, two rules, and a table the
reader can scan in seconds.

## How to tell "always-on" from "on-demand"

Ask, of each block currently in `CLAUDE.md`:

- *Does every agent need this on every session, whatever the work?* → always-on.
- *Does it only matter when the work is about topic T?* → a manifest unit tagged
  `[T]`, for the agents that touch T.
- *Is it look-up reference an agent consults occasionally, not a constraint that
  shapes edits?* → a `skill` unit (pointer, not body).

When in doubt, prefer on-demand: a rule that turns out to be needed more widely
is cheap to re-tag `[always]`; an always-on block that is rarely relevant is a
standing tax on every session.
