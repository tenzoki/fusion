# CLAUDE.md: fusion plugin source

**Language:** de
**Artifact language:** en

This repository is the **source of the fusion Claude Code plugin** (`tenzoki-plugins/fusion`). It is *not* a fusion-consuming project. Why no part of it stands down here any more, the coordinate-space rule the two retired stand-downs left behind, and the git branch-switch policy deleted on 260809: `README-hooks.md` `## Concept`.

## What this is

Plugin published to the `tenzoki-plugins` marketplace (repo: `tenzoki/claude-plugins`). Provides:

- **agents**: the 11 prompts, what each is for, which dispatch parameter each reads, and the five that went at v11. Detail: `README-agents.md` `## The agents`.
- **guard and hooks**, observation-only since 260816: what each hook writes, and the three checks that were removed. Detail: `README-hooks.md` `## Concept`.
- Real-time HTML monitor dashboard (`bin/monitor`)
- Pattern-based rule discovery helper (`bin/fusion-rules`)
- Per-consumer workbench path resolver (`bin/fusion-paths`): the item's container, or `shared/`
- **skills**: one directory per slash command, which three are the ordinary session surface, which four the end-of-session pipeline became, and which directories have left. Detail: `README-agents.md`, the skills section.

## Layout

| Path | Purpose |
|---|---|
| `.claude-plugin/plugin.json` | Manifest. **Bump version on every change.** |
| `agents/*.md` | The 11 agent prompts; none declares a `tools:` line. Detail: `README-agents.md` `## The agents`. |
| `hooks/` | TypeScript source and compiled `dist/`; the hooks and what each writes. Detail: `README-hooks.md` `## Files`. |
| `fusion.json` + `templates/fusion.json` | The per-project configuration, its two-layer merge and its retired keys. Detail: `README-hooks.md`, the per-project configuration section. |
| `bin/` | The module's helper executables, called from every agent's Setup, from skill bodies and from the hook wrappers. **The roster, one row per helper, is `README-hooks.md` `### The bin/ helper roster`**, which sits on no dispatch path; each helper's own header stays its authoritative documentation. |
| `install.sh` | The HTTPS `curl \| bash` installer and the `fusion` launcher it writes. Detail: `README-agents.md` `## Releasing`. |
| `rules/*.md` | The shipped rule corpus: which file authors which topic, and which agents each is emitted to. Detail: `README-agents.md` `## Plugin structure` and `### Adding rules`. |
| `templates/` | Starter files setup seeds into a consuming project. The set is deliberately not written here; run `ls templates/`. Detail: `README-agents.md` `## Plugin structure`. |
| `docs/` | Conceptual docs, including the migration notes. The set is deliberately not written here; run `ls docs/`. Detail: `README-agents.md` `## Plugin structure`. |
| `skills/<name>/SKILL.md` | Skill bodies, one per directory; `ls -1d skills/*/` is the set. Detail: `README-agents.md`, the skills section. |
| `README.md`, `README-agents.md`, `README-hooks.md` | User-facing docs |
| `fusion-workbench/` | Runtime artefact, created by setup, safe to delete; the container-per-work-package layout is defined in `rules/fusion-workbench-conventions.md` `## fusion-workbench Layout`. Detail: `README-agents.md` `## Where the work persists`. |

## Conventions

- **Agent dispatch**, always namespaced: `Agent(fusion:code-implementer)`, `Agent(fusion:data-implementer)`, etc. Bare names don't resolve. Any agent with a `tools: Agent(...)` allowlist must list sub-agents in `<plugin>:<name>` form.
- **Dispatch parameters**: which agents read a `**<Keyword>:**` line off the dispatch prompt, and what each line does. Detail: `README-agents.md` `## Dispatch parameters`, which is that roster's single authoring home.
- **Rules loading**: how `bin/fusion-rules` discovers rules, the three roots it searches, and why this repository's helpers prefer the work tree. Detail: `README-agents.md` `### Adding rules`.
- **User-facing output style**: which agents receive the full style contract and what it mandates. Detail: `README-agents.md` `## Plugin structure`.
- **Critical stance**: the five reasoning norms every agent loads. Detail: `README-agents.md` `## Plugin structure`.
- **No guard rule is emitted any more**, and how to measure the always-on floor rather than read a number out of this file. Detail: `README-hooks.md` `## Concept`.
- **Growth bounds**: editing `agents/*.md`, `skills/*/SKILL.md`, a rule file or the hook tests can turn `npm test` red for how much the text grew, and this file is charged to all eleven dispatch paths at zero head-room. The way out of a red bound is a cut, never an edit to a baseline. Detail: `README-hooks.md` `### Growth bounds on the shipped text`.
- **Voice profiles**: the two stylometric families under `fusion-workbench/stilwerk/`, and which declaration resolves each. Detail: `README-agents.md` `## Plugin structure`.
- **Critical procedures**: model as user-invocable skills (e.g. `/fusion:setup`), never as "MUST" directives in agent prompts. A skill body becomes the user prompt; that's the only reliable enforcement.
- **Workbench writes**: agents' records go only to `fusion-workbench/`. Sub-agents share no memory; everything persists through workbench files.
- **Workbench bootstrap is exclusive to `/fusion:setup`**: since v2.5.0, **only** the setup workflow creates a workbench. Setup writes `fusion-workbench/.fusion-setup` (a JSON marker with timestamp + plugin version). Every agent and hook locates the workbench by walking up from `pwd` looking for that marker (`bin/fusion-workbench-root` for agents, `hooks/lib/workbench-root.ts` for hooks). If no marker is found: agents halt with "run /fusion:setup", hooks no-op silently. This prevents stray workbench creation when a Claude session's cwd happens to be in any non-fusion directory. Since v4.0.0, setup also **detects a pre-v4 (type-folder) workbench and refuses**, pointing the user at `/fusion:migrate`. The migration workflow brings a workbench of either superseded shape to the current one, and it is the only consumer allowed to name a superseded layout literally, because it is the transition between them. `/fusion:setup` names one too, in the probe that recognises what it must refuse; the two are enumerated together as `EXEMPT_SKILLS` in `hooks/lib/__tests__/path-literal-lint.test.ts`.
- **One orchestrator per project**: advisory; setup warns when another session's marker is live. Detail: `README-agents.md` `## Invariants`.
- **Issues vs decisions**: which store each goes to and which marker vocabulary each carries. Detail: `rules/fusion-workbench-conventions.md` `## Issues vs Decisions — when to use which`, which every agent already loads.
- **SessionStart output**: `systemMessage` JSON reaches the user, plain stdout reaches the model. Detail: `README-hooks.md` `## Files`.
- **`.gitignore`**: for shipped binaries inside excluded dirs use `dir/*` (file pattern) so `!path` exceptions work for new files. `dir/` (trailing slash) blocks all re-inclusion of files added later.
- **The work package is the unit of work**: one directory per item, its state a head field, its holder a checkout. Detail: `rules/fusion-workbench-conventions.md` `## Work packages`, which every agent already loads.
- **The bus protocol is gone** (v3.15.0): concurrent sessions exchange work through the user. Detail: `README-agents.md` `## Migration note`.

## Release process

The two repositories, the seven numbered steps, the tag, the marketplace cache clone, the HTTPS installer's invariants and the five surfaces a release keeps coherent are in `README-agents.md` `## Releasing`, beside `## Adding a new agent`.

## Testing during development

Use `claude --plugin-dir /path/to/this/repo` to load directly from disk: no install, no cache, no version bumping required. Reserve the marketplace flow for releases.

## Where to look when something breaks

The symptom rows (what each failure looks like and what causes it) are in `README-hooks.md` `## Where to look when something breaks`.
